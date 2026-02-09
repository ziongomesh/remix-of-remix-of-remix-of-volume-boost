import { Router } from 'express';
import { query } from '../db';
import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import logger from '../utils/logger.ts';

const router = Router();

function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function textoEstado(uf: string): string {
  const estados: Record<string, string> = {
    AC: 'Estado do Acre', AL: 'Estado de Alagoas', AP: 'Estado do Amapá',
    AM: 'Estado do Amazonas', BA: 'Estado da Bahia', CE: 'Estado do Ceará',
    DF: 'Distrito Federal', ES: 'Estado do Espírito Santo', GO: 'Estado de Goiás',
    MA: 'Estado do Maranhão', MT: 'Estado do Mato Grosso', MS: 'Estado do Mato Grosso do Sul',
    MG: 'Estado de Minas Gerais', PA: 'Estado do Pará', PB: 'Estado da Paraíba',
    PR: 'Estado do Paraná', PE: 'Estado de Pernambuco', PI: 'Estado do Piauí',
    RJ: 'Estado do Rio de Janeiro', RN: 'Estado do Rio Grande do Norte',
    RS: 'Estado do Rio Grande do Sul', RO: 'Estado de Rondônia', RR: 'Estado de Roraima',
    SC: 'Estado de Santa Catarina', SP: 'Estado de São Paulo', SE: 'Estado de Sergipe',
    TO: 'Estado do Tocantins',
  };
  return estados[uf?.toUpperCase()] || `Estado de ${uf?.toUpperCase()}`;
}

function formatarNomeMRZ(nome: string): string {
  const nomeLimpo = nome.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, '')
    .trim()
    .replace(/\s+/g, '<');
  return `D<${nomeLimpo}<<<<<`.slice(0, 44);
}

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

    const fotoUrl = saveFile(fotoBase64, `${cleanCpf}_foto`);
    const assinaturaUrl = saveFile(assinaturaBase64, `${cleanCpf}_assinatura`);
    saveFile(rgFrenteBase64, `${cleanCpf}matriz`);
    saveFile(rgVersoBase64, `${cleanCpf}matriz2`);

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
        qrcodeUrl = saveBuffer(Buffer.from(qrPngBytes), `${cleanCpf}qrcode`);
      }
    } catch (e) {
      logger.error('RG QR code generation error:', e);
    }

    // Gerar PDF (igual rgDigitalUtils.ts - fundo matrizpdf.png + textos diretos)
    let pdfUrl: string | null = null;
    try {
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Fontes
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const courier = await pdfDoc.embedFont(StandardFonts.Courier);
      const fontSize = 7;
      const fillColor = rgb(0, 0, 0);
      const grayColor = rgb(0.224, 0.216, 0.22); // #393738

      // Helper: pdfkit Y (top-left) → pdf-lib Y (bottom-left)
      const ty = (pdfkitY: number, h: number = 0) => pageHeight - pdfkitY - h;

      // Fundo matrizpdf.png
      const bgPath = path.resolve(process.cwd(), '..', 'public', 'templates', 'matrizpdf.png');
      const bgFallback = path.resolve(process.cwd(), '..', 'public', 'images', 'rg-pdf-bg.png');
      const bgFile = fs.existsSync(bgPath) ? bgPath : (fs.existsSync(bgFallback) ? bgFallback : null);
      if (bgFile) {
        const bgBytes = fs.readFileSync(bgFile);
        const bgImg = await pdfDoc.embedPng(bgBytes);
        page.drawImage(bgImg, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }

      // Helper para embed base64
      const embedBase64 = async (b64: string) => {
        const clean = b64.replace(/^data:image\/\w+;base64,/, '');
        return await pdfDoc.embedPng(Buffer.from(clean, 'base64'));
      };

      // QR Code em duas posições
      if (qrPngBytes) {
        const qrImg = await pdfDoc.embedPng(qrPngBytes);
        // QR primário (grande)
        const qrX = 462 * 0.85;
        const qrY_pk = 90 * 0.85;
        const qrSz = 180 * 0.85;
        page.drawImage(qrImg, { x: qrX, y: ty(qrY_pk, qrSz), width: qrSz, height: qrSz });
        // QR secundário (pequeno, dentro do verso)
        page.drawImage(qrImg, { x: 39, y: ty(314, 57), width: 57, height: 57 });
      }

      // Foto do perfil em duas posições
      if (fotoBase64) {
        try {
          const fotoImg = await embedBase64(fotoBase64);
          // Foto principal
          page.drawImage(fotoImg, { x: 35, y: ty(137.5, 86), width: 69, height: 86 });
          // Foto menor (segunda posição)
          page.drawImage(fotoImg, { x: 297, y: ty(302.5, 32), width: 28, height: 32 });
        } catch (e) { logger.error('Erro ao embutir foto no PDF:', e); }
      }

      // Formatar datas
      const fmtDate = (d: string) => {
        if (!d) return '';
        if (d.includes('/')) return d;
        const p = d.split('-');
        return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
      };

      const dataAtual = new Date().toLocaleDateString('pt-BR');

      // ---- TEXTOS FOLHA 1 (frente) ----
      const drawText = (text: string, x: number, pdfkitY: number, opts?: { font?: any; size?: number; color?: any }) => {
        page.drawText(text || '', {
          x,
          y: ty(pdfkitY, opts?.size || fontSize),
          size: opts?.size || fontSize,
          font: opts?.font || helvetica,
          color: opts?.color || fillColor,
        });
      };

      drawText(nomeCompleto, 112, 146);
      drawText(nomeSocial || '', 112, 172);
      drawText(formatCPF(cleanCpf), 112, 192);
      drawText(fmtDate(dataNascimento), 112, 212);
      drawText(naturalidade, 112, 231);
      drawText(genero, 231, 186);
      drawText(nacionalidade || 'BRA', 231, 206);
      drawText(fmtDate(validade), 231, 225);

      // ---- TEXTOS FOLHA 2 (verso) ----
      drawText(pai || '', 112, 308);
      drawText(mae || '', 112, 325);
      drawText(orgaoExpedidor || '', 112, 348);
      drawText(local || '', 112, 367);
      drawText(fmtDate(dataEmissao), 228, 367);

      // Data atual
      drawText(dataAtual, 217, 26.5, { size: 9 });

      // Estado
      const nomeEstado = textoEstado(uf).toUpperCase();
      drawText(nomeEstado, 120, 101, { size: 8, color: grayColor });

      // Secretaria
      drawText('SECRETARIA DE SEGURANÇA DA UNIDADE DA FEDERAÇÃO', 82, 111, { size: 8, color: grayColor });

      // ---- MRZ ----
      const linha1 = 'IDBRA5398762281453987622814<<0';
      const linha2 = '051120M340302BRA<<<<<<<<<<<<<2';
      const linha3 = formatarNomeMRZ(nomeCompleto);
      drawText(linha1, 65, 423, { font: courier, size: 12, color: grayColor });
      drawText(linha2, 65, 435, { font: courier, size: 12, color: grayColor });
      drawText(linha3, 62, 447, { font: courier, size: 12, color: grayColor });

      // Assinatura em duas posições
      if (assinaturaBase64) {
        try {
          const assImg = await embedBase64(assinaturaBase64);
          page.drawImage(assImg, { x: 130, y: ty(240, 15), width: 110, height: 15 }); // superior
          page.drawImage(assImg, { x: 20, y: ty(583, 15), width: 110, height: 15 }); // inferior
        } catch (e) { logger.error('Erro ao embutir assinatura no PDF:', e); }
      }

      // Flatten: converter página em XObject para impedir seleção de texto
      const tempPdfBytes = await pdfDoc.save();
      const tempDoc = await PDFDocument.load(tempPdfBytes);
      const flatDoc = await PDFDocument.create();
      const [embeddedPage] = await flatDoc.embedPages(tempDoc.getPages());
      const flatPage = flatDoc.addPage([pageWidth, pageHeight]);
      flatPage.drawPage(embeddedPage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      const pdfBytes = await flatDoc.save();
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
      images: { frente: `/uploads/${cleanCpf}matriz.png`, verso: `/uploads/${cleanCpf}matriz2.png` },
    });
  } catch (error: any) {
    logger.error('RG save error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== LIST RG ==========
router.post('/list', async (req, res) => {
  try {
    const { admin_id, session_token } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const adminResult = await query<any[]>('SELECT `rank` FROM admins WHERE id = ?', [admin_id]);
    const rank = adminResult[0]?.rank;

    const selectFields = `id, admin_id, cpf, nome_completo, nome_completo AS nome, nome_social, 
      data_nascimento, naturalidade, genero, nacionalidade, validade, uf, 
      data_emissao, \`local\` AS local_emissao, orgao_expedidor, pai, mae, senha,
      foto AS foto_url, assinatura AS assinatura_url, qrcode AS qrcode_url,
      created_at, updated_at, expires_at AS data_expiracao`;

    let registros: any[];
    if (rank === 'dono') {
      registros = await query<any[]>(`SELECT ${selectFields} FROM rgs ORDER BY created_at DESC LIMIT 200`);
    } else {
      registros = await query<any[]>(`SELECT ${selectFields} FROM rgs WHERE admin_id = ? ORDER BY created_at DESC LIMIT 200`, [admin_id]);
    }

    // Construct matrix URLs from CPF
    registros = registros.map(r => {
      const cpf = r.cpf?.replace(/\D/g, '') || '';
      return {
        ...r,
        rg_frente_url: r.rg_frente_url || `/uploads/${cpf}matriz.png`,
        rg_verso_url: r.rg_verso_url || `/uploads/${cpf}matriz2.png`,
        pdf_url: r.pdf_url || `/uploads/RG_DIGITAL_${cpf}.pdf`,
      };
    });

    res.json({ registros });
  } catch (error: any) {
    logger.error('RG list error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== UPDATE RG ==========
router.post('/update', async (req, res) => {
  try {
    const {
      admin_id, session_token, rg_id,
      nomeCompleto, nomeSocial, dataNascimento, naturalidade, genero,
      nacionalidade, validade, uf, dataEmissao, local, orgaoExpedidor,
      pai, mae, changedMatrices,
      rgFrenteBase64, rgVersoBase64, fotoBase64, assinaturaBase64,
    } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const existing = await query<any[]>('SELECT * FROM rgs WHERE id = ?', [rg_id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    const rg = existing[0];
    const cleanCpf = rg.cpf;
    const changed: string[] = changedMatrices || [];

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

    // Upload changed matrices
    if (changed.includes('frente') && rgFrenteBase64) {
      saveFile(rgFrenteBase64, `${cleanCpf}matriz`);
    }
    if (changed.includes('verso') && rgVersoBase64) {
      saveFile(rgVersoBase64, `${cleanCpf}matriz2`);
    }
    if (fotoBase64) {
      saveFile(fotoBase64, `${cleanCpf}_foto`);
    }
    if (assinaturaBase64) {
      saveFile(assinaturaBase64, `${cleanCpf}_assinatura`);
    }

    // Update DB fields
    await query(
      `UPDATE rgs SET
        nome_completo = ?, nome_social = ?, data_nascimento = ?, naturalidade = ?,
        genero = ?, nacionalidade = ?, validade = ?, uf = ?,
        data_emissao = ?, \`local\` = ?, orgao_expedidor = ?,
        pai = ?, mae = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        nomeCompleto, nomeSocial || null,
        toMySQLDate(dataNascimento), naturalidade, genero,
        nacionalidade || 'BRA', toMySQLDate(validade), uf,
        toMySQLDate(dataEmissao), local, orgaoExpedidor,
        pai || null, mae || null, rg_id,
      ]
    );

    // Regenerate QR + PDF
    const senha = cleanCpf.slice(-6);
    let qrcodeUrl: string | null = null;
    let qrPngBytes: Uint8Array | null = null;
    try {
      const qrLink = `https://govbr.consulta-rgdigital-vio.info/qr/index.php?cpf=${cleanCpf}`;
      const qrPayload = JSON.stringify({
        url: qrLink, doc: "RG_DIGITAL", ver: "2.0",
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
        qrcodeUrl = saveBuffer(Buffer.from(qrPngBytes), `${cleanCpf}qrcode`);
      }
    } catch (e) {
      logger.error('RG QR update error:', e);
    }

    // Regenerate PDF
    let pdfUrl: string | null = null;
    try {
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const courier = await pdfDoc.embedFont(StandardFonts.Courier);
      const fontSize = 7;
      const fillColor = rgb(0, 0, 0);
      const grayColor = rgb(0.224, 0.216, 0.22);
      const ty = (pdfkitY: number, h: number = 0) => pageHeight - pdfkitY - h;

      // Background
      const bgPath2 = path.resolve(process.cwd(), '..', 'public', 'templates', 'matrizpdf.png');
      const bgFallback2 = path.resolve(process.cwd(), '..', 'public', 'images', 'rg-pdf-bg.png');
      const bgFile2 = fs.existsSync(bgPath2) ? bgPath2 : (fs.existsSync(bgFallback2) ? bgFallback2 : null);
      if (bgFile2) {
        const bgBytes = fs.readFileSync(bgFile2);
        const bgImg = await pdfDoc.embedPng(bgBytes);
        page.drawImage(bgImg, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }

      const embedBase64Pdf = async (b64: string) => {
        const clean = b64.replace(/^data:image\/\w+;base64,/, '');
        return await pdfDoc.embedPng(Buffer.from(clean, 'base64'));
      };

      // QR
      if (qrPngBytes) {
        const qrImg = await pdfDoc.embedPng(qrPngBytes);
        const qrX = 462 * 0.85;
        const qrY_pk = 90 * 0.85;
        const qrSz = 180 * 0.85;
        page.drawImage(qrImg, { x: qrX, y: ty(qrY_pk, qrSz), width: qrSz, height: qrSz });
        page.drawImage(qrImg, { x: 39, y: ty(314, 57), width: 57, height: 57 });
      }

      // Photo - use new or read existing
      const fotoToEmbed = fotoBase64 || (() => {
        const fotoPath = path.resolve(process.cwd(), '..', 'public', 'uploads', `${cleanCpf}_foto.png`);
        if (fs.existsSync(fotoPath)) return `data:image/png;base64,${fs.readFileSync(fotoPath).toString('base64')}`;
        return null;
      })();
      if (fotoToEmbed) {
        try {
          const fotoImg = await embedBase64Pdf(fotoToEmbed);
          page.drawImage(fotoImg, { x: 35, y: ty(137.5, 86), width: 69, height: 86 });
          page.drawImage(fotoImg, { x: 297, y: ty(302.5, 32), width: 28, height: 32 });
        } catch (e) { logger.error('PDF foto error:', e); }
      }

      const fmtDate = (d: string) => {
        if (!d) return '';
        if (d.includes('/')) return d;
        const p = d.split('-');
        return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
      };

      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const drawText = (text: string, x: number, pdfkitY: number, opts?: { font?: any; size?: number; color?: any }) => {
        page.drawText(text || '', {
          x, y: ty(pdfkitY, opts?.size || fontSize),
          size: opts?.size || fontSize,
          font: opts?.font || helvetica,
          color: opts?.color || fillColor,
        });
      };

      drawText(nomeCompleto, 112, 146);
      drawText(nomeSocial || '', 112, 172);
      drawText(formatCPF(cleanCpf), 112, 192);
      drawText(fmtDate(dataNascimento), 112, 212);
      drawText(naturalidade, 112, 231);
      drawText(genero, 231, 186);
      drawText(nacionalidade || 'BRA', 231, 206);
      drawText(fmtDate(validade), 231, 225);
      drawText(pai || '', 112, 308);
      drawText(mae || '', 112, 325);
      drawText(orgaoExpedidor || '', 112, 348);
      drawText(local || '', 112, 367);
      drawText(fmtDate(dataEmissao), 228, 367);
      drawText(dataAtual, 217, 26.5, { size: 9 });
      const nomeEstado = textoEstado(uf).toUpperCase();
      drawText(nomeEstado, 120, 101, { size: 8, color: grayColor });
      drawText('SECRETARIA DE SEGURANÇA DA UNIDADE DA FEDERAÇÃO', 82, 111, { size: 8, color: grayColor });
      const linha1 = 'IDBRA5398762281453987622814<<0';
      const linha2 = '051120M340302BRA<<<<<<<<<<<<<2';
      const linha3 = formatarNomeMRZ(nomeCompleto);
      drawText(linha1, 65, 423, { font: courier, size: 12, color: grayColor });
      drawText(linha2, 65, 435, { font: courier, size: 12, color: grayColor });
      drawText(linha3, 62, 447, { font: courier, size: 12, color: grayColor });

      // Signature
      const assToEmbed = assinaturaBase64 || (() => {
        const assPath = path.resolve(process.cwd(), '..', 'public', 'uploads', `${cleanCpf}_assinatura.png`);
        if (fs.existsSync(assPath)) return `data:image/png;base64,${fs.readFileSync(assPath).toString('base64')}`;
        return null;
      })();
      if (assToEmbed) {
        try {
          const assImg = await embedBase64Pdf(assToEmbed);
          page.drawImage(assImg, { x: 130, y: ty(240, 15), width: 110, height: 15 });
          page.drawImage(assImg, { x: 20, y: ty(583, 15), width: 110, height: 15 });
        } catch (e) { logger.error('PDF ass error:', e); }
      }

      // Flatten
      const tempPdfBytes = await pdfDoc.save();
      const tempDoc = await PDFDocument.load(tempPdfBytes);
      const flatDoc = await PDFDocument.create();
      const [embeddedPage] = await flatDoc.embedPages(tempDoc.getPages());
      const flatPage = flatDoc.addPage([pageWidth, pageHeight]);
      flatPage.drawPage(embeddedPage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      const pdfBytes = await flatDoc.save();
      pdfUrl = saveBuffer(Buffer.from(pdfBytes), `RG_DIGITAL_${cleanCpf}`, 'pdf');
    } catch (e) {
      logger.error('RG PDF update error:', e);
    }

    // Update QR + PDF URLs
    await query('UPDATE rgs SET qrcode = ?, pdf_url = ? WHERE id = ?', [qrcodeUrl, pdfUrl, rg_id]);

    res.json({
      success: true,
      pdf: pdfUrl,
      changedMatrices: changed,
      images: { frente: `/uploads/${cleanCpf}matriz.png`, verso: `/uploads/${cleanCpf}matriz2.png` },
    });
  } catch (error: any) {
    logger.error('RG update error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== DELETE RG ==========
router.post('/delete', async (req, res) => {
  try {
    const { admin_id, session_token, rg_id } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const existing = await query<any[]>('SELECT id, cpf, admin_id FROM rgs WHERE id = ?', [rg_id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    const adminResult = await query<any[]>('SELECT `rank` FROM admins WHERE id = ?', [admin_id]);
    if (adminResult[0]?.rank !== 'dono' && existing[0].admin_id !== admin_id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const cpf = existing[0].cpf;
    const uploadsDir = path.resolve(process.cwd(), '..', 'public', 'uploads');
    const filesToDelete = [
      `${cpf}matriz.png`, `${cpf}matriz2.png`, `${cpf}_foto.png`,
      `${cpf}_assinatura.png`, `${cpf}qrcode.png`, `RG_DIGITAL_${cpf}.pdf`,
    ];
    for (const file of filesToDelete) {
      const filepath = path.join(uploadsDir, file);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    await query('DELETE FROM rgs WHERE id = ?', [rg_id]);
    logger.action('RG EXCLUÍDO', `rg_id=${rg_id}, cpf=${cpf}, por admin_id=${admin_id}`);

    res.json({ success: true });
  } catch (error: any) {
    logger.error('RG delete error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

export default router;
