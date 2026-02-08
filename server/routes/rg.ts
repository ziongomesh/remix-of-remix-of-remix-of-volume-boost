import { Router } from 'express';
import { query } from '../db';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import logger from '../utils/logger.ts';

const router = Router();

function toMySQLDate(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
}

async function validateSession(adminId: number, sessionToken: string): Promise<boolean> {
  const result = await query<any[]>(
    'SELECT 1 FROM admins WHERE id = ? AND session_token = ?',
    [adminId, sessionToken]
  );
  if (result.length > 0) {
    await query('UPDATE admins SET last_active = NOW() WHERE id = ?', [adminId]);
  }
  return result.length > 0;
}

// ========== SAVE RG ==========
router.post('/save', async (req, res) => {
  try {
    const {
      admin_id, session_token,
      cpf, nomeCompleto, nomeSocial,
      dataNascimento, naturalidade, genero, nacionalidade, validade,
      uf, dataEmissao, local, orgaoExpedidor, pai, mae,
      rgFrenteBase64, rgVersoBase64, fotoBase64, assinaturaBase64,
    } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const admins = await query<any[]>('SELECT creditos FROM admins WHERE id = ?', [admin_id]);
    if (!admins.length || admins[0].creditos <= 0) {
      return res.status(400).json({ error: 'Créditos insuficientes' });
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    const existing = await query<any[]>('SELECT id, nome_completo FROM rgs WHERE cpf = ?', [cleanCpf]);
    if (existing.length > 0) {
      return res.status(409).json({
        error: 'CPF já cadastrado',
        details: { existingRg: existing[0] },
      });
    }

    const senha = cleanCpf.slice(-6);

    const saveFile = (base64: string | undefined, name: string, ext: string = 'png'): string | null => {
      if (!base64) return null;
      const uploadsDir = path.resolve(process.cwd(), '..', 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `${name}.${ext}`;
      const filepath = path.join(uploadsDir, filename);
      const clean = base64.replace(/^data:[^;]+;base64,/, '');
      fs.writeFileSync(filepath, Buffer.from(clean, 'base64'));
      return `/uploads/${filename}`;
    };

    const saveBuffer = (buffer: Buffer | Uint8Array, name: string, ext: string = 'png'): string => {
      const uploadsDir = path.resolve(process.cwd(), '..', 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `${name}.${ext}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);
      return `/uploads/${filename}`;
    };

    const fotoUrl = saveFile(fotoBase64, `rg_${cleanCpf}_foto`);
    const assinaturaUrl = saveFile(assinaturaBase64, `rg_${cleanCpf}_assinatura`);
    saveFile(rgFrenteBase64, `rg_${cleanCpf}_frente`);
    saveFile(rgVersoBase64, `rg_${cleanCpf}_verso`);

    // Inserir na tabela rgs
    const result = await query<any>(
      `INSERT INTO rgs (
        admin_id, cpf, nome_completo, nome_social, senha,
        data_nascimento, naturalidade, genero, nacionalidade, validade,
        uf, data_emissao, \`local\`, orgao_expedidor, pai, mae,
        foto, assinatura, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 45 DAY))`,
      [
        admin_id, cleanCpf, nomeCompleto, nomeSocial || null, senha,
        toMySQLDate(dataNascimento), naturalidade, genero, nacionalidade || 'BRA', toMySQLDate(validade),
        uf, toMySQLDate(dataEmissao), local, orgaoExpedidor, pai || null, mae || null,
        fotoUrl, assinaturaUrl,
      ]
    );

    const rgId = result.insertId;

    // QR Code - link direto por CPF
    let qrcodeUrl: string | null = null;
    let qrPngBytes: Uint8Array | null = null;
    try {
      const qrLink = `https://govbr.consulta-rgdigital-vio.info/qr/index.php?cpf=${cleanCpf}`;
      const qrPayload = JSON.stringify({
        url: qrLink,
        doc: "RG_DIGITAL", ver: "2.0",
        cpf: cleanCpf, nome: nomeCompleto, ns: nomeSocial || "",
        dn: dataNascimento, sx: genero, nac: nacionalidade || "BRA",
        nat: naturalidade, uf, de: dataEmissao, dv: validade,
        le: local, oe: orgaoExpedidor, pai: pai || "", mae: mae || "",
        tp: "CARTEIRA_IDENTIDADE_NACIONAL", org: "SSP/" + uf,
        sn: senha, ts: Date.now(),
      });
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrPayload)}&format=png&ecc=M`;
      const qrResp = await fetch(qrApiUrl);
      if (qrResp.ok) {
        qrPngBytes = new Uint8Array(await qrResp.arrayBuffer());
        qrcodeUrl = saveBuffer(Buffer.from(qrPngBytes), `rg_${cleanCpf}_qrcode`);
      }
    } catch (e) {
      logger.error('RG QR code generation error:', e);
    }

    // Gerar PDF
    let pdfUrl: string | null = null;
    try {
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const mmToPt = (mm: number) => mm * 2.834645669;
      const matrizW = mmToPt(85);
      const matrizH = mmToPt(55);
      const qrSize = mmToPt(63.788);
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const bgPath = path.resolve(process.cwd(), '..', 'public', 'images', 'rg-pdf-bg.png');
      if (fs.existsSync(bgPath)) {
        const bgBytes = fs.readFileSync(bgPath);
        const bgImg = await pdfDoc.embedPng(bgBytes);
        page.drawImage(bgImg, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }

      const embedBase64Png = async (b64: string) => {
        const clean = b64.replace(/^data:image\/\w+;base64,/, '');
        return await pdfDoc.embedPng(Buffer.from(clean, 'base64'));
      };

      if (rgFrenteBase64) {
        const img = await embedBase64Png(rgFrenteBase64);
        page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(21.595) - matrizH, width: matrizW, height: matrizH });
      }

      // Verso: primeiro desenha a matriz, depois o QR code por cima
      if (rgVersoBase64) {
        const img = await embedBase64Png(rgVersoBase64);
        page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(84.691) - matrizH, width: matrizW, height: matrizH });

        // QR code DENTRO da matriz verso (posição calibrada: 5.36%, 17.03%, size 22.88%)
        if (qrPngBytes) {
          const qrImg = await pdfDoc.embedPng(qrPngBytes);
          const versoX = mmToPt(13.406);
          const versoY = pageHeight - mmToPt(84.691) - matrizH;
          const qrInVersoSize = matrizW * 0.2288;
          const qrInVersoX = versoX + matrizW * 0.0536;
          const qrInVersoY = versoY + matrizH * (1 - 0.1703 - 0.2288); // flip Y for PDF
          page.drawImage(qrImg, { x: qrInVersoX, y: qrInVersoY, width: qrInVersoSize, height: qrInVersoSize });
        }
      }

      // QR code grande no layout A4 (ao lado das matrizes)
      if (qrPngBytes) {
        const qrImg = await pdfDoc.embedPng(qrPngBytes);
        page.drawImage(qrImg, { x: mmToPt(118.276), y: pageHeight - mmToPt(35.975) - qrSize, width: qrSize, height: qrSize });
      }

      const pdfBytes = await pdfDoc.save();
      pdfUrl = saveBuffer(Buffer.from(pdfBytes), `RG_DIGITAL_${cleanCpf}`, 'pdf');
    } catch (e) {
      logger.error('RG PDF generation error:', e);
    }

    // Update QR + PDF
    await query('UPDATE rgs SET qrcode = ? WHERE id = ?', [qrcodeUrl, rgId]);

    // Debitar 1 crédito
    await query('UPDATE admins SET creditos = creditos - 1 WHERE id = ?', [admin_id]);

    // Log transação
    await query(
      `INSERT INTO credit_transactions (from_admin_id, to_admin_id, amount, transaction_type) VALUES (?, ?, 1, 'rg_creation')`,
      [admin_id, admin_id]
    );

    const rgData = await query<any[]>('SELECT expires_at FROM rgs WHERE id = ?', [rgId]);

    res.json({
      success: true,
      id: rgId,
      senha,
      pdf: pdfUrl,
      dataExpiracao: rgData[0]?.expires_at || null,
      images: { frente: `/uploads/rg_${cleanCpf}_frente.png`, verso: `/uploads/rg_${cleanCpf}_verso.png` },
    });
  } catch (error: any) {
    logger.error('RG save error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

export default router;
