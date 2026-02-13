import { Router } from 'express';
import { query } from '../db';
import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import logger from '../utils/logger.ts';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// POST /api/crlv/save
router.post('/save', async (req, res) => {
  try {
    const {
      admin_id, session_token,
      renavam, placa, exercicio, numero_crv, seguranca_crv, cod_seg_cla,
      marca_modelo, ano_fab, ano_mod, cor, combustivel, especie_tipo,
      categoria, cat_obs, carroceria,
      chassi, placa_ant, potencia_cil, capacidade, lotacao, peso_bruto,
      motor, cmt, eixos,
      nome_proprietario, cpf_cnpj, local: localEmissao, data: dataEmissao,
      observacoes, uf,
      qrcode_base64,
    } = req.body;

    // Validate session
    const sessions = await query<any[]>(
      'SELECT id, creditos FROM admins WHERE id = ? AND session_token = ?',
      [admin_id, session_token]
    );
    if (!sessions || sessions.length === 0) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }
    const admin = sessions[0];

    if (admin.creditos <= 0) {
      return res.status(400).json({ error: 'Créditos insuficientes' });
    }

    const cleanCpf = (cpf_cnpj || '').replace(/\D/g, '');
    const senha = cleanCpf.slice(-6) || '000000';

    // Load PDF template
    const templatePath = path.resolve(process.cwd(), '..', 'public', 'templates', 'crlv-template.pdf');
    if (!fs.existsSync(templatePath)) {
      logger.error('[CRLV] Template não encontrado:', templatePath);
      return res.status(500).json({ error: 'Template CRLV não encontrado' });
    }

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { height: pageHeight } = page.getSize();

    // Embed fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const courier = await pdfDoc.embedFont(StandardFonts.Courier);

    const drawText = (text: string, x: number, y: number, size = 9, font = courier) => {
      page.drawText(text || '', { x, y: pageHeight - y, size, font, color: rgb(0, 0, 0) });
    };

    const whiteOut = (x: number, y: number, w: number, h: number) => {
      page.drawRectangle({ x, y: pageHeight - y - h, width: w, height: h, color: rgb(1, 1, 1) });
    };

    // ========== LEFT COLUMN ==========
    whiteOut(18, 100, 200, 20);
    drawText(renavam, 18, 115, 12, helveticaBold);

    whiteOut(18, 132, 100, 18);
    drawText(placa, 18, 146, 12, helveticaBold);

    whiteOut(130, 132, 90, 18);
    drawText(exercicio, 130, 146, 12, helveticaBold);

    whiteOut(18, 162, 100, 18);
    drawText(ano_fab, 18, 176, 12, helveticaBold);

    whiteOut(130, 162, 90, 18);
    drawText(ano_mod, 130, 176, 12, helveticaBold);

    whiteOut(18, 192, 200, 20);
    drawText(numero_crv, 18, 208, 11, helveticaBold);

    whiteOut(18, 312, 165, 20);
    drawText(cod_seg_cla, 18, 328, 11, helveticaBold);

    whiteOut(195, 312, 50, 20);
    drawText(cat_obs || '***', 200, 328, 11, helveticaBold);

    whiteOut(18, 347, 230, 22);
    drawText(marca_modelo, 18, 363, 11, helveticaBold);

    whiteOut(18, 382, 230, 22);
    drawText(especie_tipo, 18, 400, 11, helveticaBold);

    whiteOut(18, 418, 110, 18);
    drawText(placa_ant || '*******/**', 18, 433, 11, helveticaBold);

    whiteOut(135, 418, 120, 18);
    drawText(chassi, 135, 433, 10, helveticaBold);

    whiteOut(18, 450, 110, 18);
    drawText(cor, 18, 465, 11, helveticaBold);

    whiteOut(135, 450, 120, 18);
    drawText(combustivel, 135, 465, 10, helveticaBold);

    // ========== RIGHT COLUMN ==========
    whiteOut(310, 87, 190, 22);
    drawText(categoria, 310, 105, 12, helveticaBold);

    whiteOut(500, 87, 80, 22);
    drawText(capacidade || '*.*', 510, 105, 12, helveticaBold);

    whiteOut(310, 122, 190, 22);
    drawText(potencia_cil, 310, 140, 12, helveticaBold);

    whiteOut(500, 122, 80, 22);
    drawText(peso_bruto, 510, 140, 10, helveticaBold);

    whiteOut(310, 156, 165, 20);
    drawText(motor, 310, 172, 10, helveticaBold);

    whiteOut(476, 156, 40, 20);
    drawText(cmt, 476, 172, 10, helveticaBold);

    whiteOut(518, 156, 25, 20);
    drawText(eixos, 520, 172, 10, helveticaBold);

    whiteOut(545, 156, 40, 20);
    drawText(lotacao, 548, 172, 10, helveticaBold);

    whiteOut(310, 190, 280, 22);
    drawText(carroceria, 310, 208, 11, helveticaBold);

    whiteOut(310, 224, 280, 22);
    drawText(nome_proprietario, 310, 242, 11, helveticaBold);

    whiteOut(420, 258, 170, 22);
    drawText(cpf_cnpj, 420, 276, 11, helveticaBold);

    whiteOut(310, 292, 190, 22);
    drawText(localEmissao, 310, 310, 11, helveticaBold);

    whiteOut(520, 292, 70, 22);
    drawText(dataEmissao, 520, 310, 10, helveticaBold);

    // ========== QR CODE ==========
    whiteOut(240, 100, 175, 195);

    let qrcodePath: string | null = null;
    try {
      let qrBytes: Buffer;

      if (qrcode_base64 && qrcode_base64.length > 100) {
        // User provided custom QR
        const clean = qrcode_base64.replace(/^data:image\/\w+;base64,/, '');
        qrBytes = Buffer.from(clean, 'base64');
      } else {
        // Generate QR with simple vehicle identifier URL
        const qrData = `https://qrcode-certificadodigital-vio.info/crlv?ren=${renavam}&pl=${placa}`;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrData)}&format=png&ecc=M`;
        const qrResponse = await fetch(qrApiUrl);
        if (!qrResponse.ok) throw new Error('QR generation failed');
        qrBytes = Buffer.from(await qrResponse.arrayBuffer());
      }

      const qrImg = await pdfDoc.embedPng(qrBytes);
      page.drawImage(qrImg, { x: 255, y: pageHeight - 280, width: 145, height: 145 });

      // Save QR locally
      const qrFilename = `crlv_${cleanCpf}_qr.png`;
      const qrFullPath = path.join(uploadsDir, qrFilename);
      fs.writeFileSync(qrFullPath, qrBytes);
      qrcodePath = `/uploads/${qrFilename}`;
    } catch (qrErr) {
      logger.error('[CRLV] QR code error:', qrErr);
    }

    // ========== DETRAN-UF (Open Sans style, positioned below QR area) ==========
    whiteOut(310, 340, 280, 22);
    const detranText = uf ? `DETRAN-   ${uf}` : 'DETRAN-   SP';
    drawText(detranText, 310, 355, 12, helveticaBold);

    // ========== "Documento emitido por CDT..." ==========
    whiteOut(18, 480, 560, 20);
    const cpfHash = cleanCpf.slice(0, 9) || '000000000';
    const hashCode = `${cpfHash.slice(0,3)}${cpfHash.slice(3,5)}f${cpfHash.slice(5,8)}`;
    const docEmitidoText = `Documento emitido por CDT (${hashCode}) em ${dataEmissao || new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}.`;
    drawText(docEmitidoText, 80, 495, 8, courier);

    // ========== OBSERVAÇÕES ==========
    whiteOut(18, 505, 270, 245);
    const obsText = observacoes || '*.*';
    const lines = (obsText as string).split('\n');
    lines.forEach((line: string, i: number) => {
      drawText(line, 25, 530 + i * 16, 11, helveticaBold);
    });

    // Save PDF locally
    const pdfBytes = await pdfDoc.save();
    const pdfFilename = `CRLV_DIGITAL_${cleanCpf}.pdf`;
    const pdfFullPath = path.join(uploadsDir, pdfFilename);
    fs.writeFileSync(pdfFullPath, Buffer.from(pdfBytes));
    const pdfUrl = `/uploads/${pdfFilename}`;

    // No expiration for CRLV

    // Insert record in MySQL
    const insertResult = await query<any>(
      `INSERT INTO usuarios_crlv (
        admin_id, renavam, placa, exercicio, numero_crv, seguranca_crv, cod_seg_cla,
        marca_modelo, ano_fab, ano_mod, cor, combustivel, especie_tipo,
        categoria, cat_obs, carroceria,
        chassi, placa_ant, potencia_cil, capacidade, lotacao, peso_bruto,
        motor, cmt, eixos,
        nome_proprietario, cpf_cnpj, local_emissao, data_emissao,
        observacoes, qrcode_url, pdf_url, senha, data_expiracao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admin_id, renavam, placa, exercicio, numero_crv, seguranca_crv, cod_seg_cla,
        marca_modelo, ano_fab, ano_mod, cor, combustivel, especie_tipo,
        categoria, cat_obs || '', carroceria,
        chassi, placa_ant || '', potencia_cil, capacidade, lotacao, peso_bruto,
        motor, cmt, eixos,
        nome_proprietario, cpf_cnpj, localEmissao, dataEmissao,
        observacoes || '', qrcodePath, pdfUrl, senha, null,
      ]
    );

    const insertedId = insertResult.insertId;

    // Deduct credit
    await query('UPDATE admins SET creditos = creditos - 1 WHERE id = ?', [admin_id]);

    // Record transaction
    await query(
      'INSERT INTO credit_transactions (from_admin_id, to_admin_id, amount, transaction_type) VALUES (?, ?, 1, ?)',
      [admin_id, admin_id, 'crlv_creation']
    );

    logger.action('CRLV', `Gerado com sucesso para CPF/CNPJ ${cleanCpf} por admin ${admin_id}`);

    res.json({
      success: true,
      id: insertedId,
      senha,
      pdf: pdfUrl,
      dataExpiracao: null,
    });
  } catch (error: any) {
    logger.error('[CRLV] Erro ao salvar:', error);
    res.status(500).json({ error: 'Erro interno ao gerar CRLV' });
  }
});

// POST /api/crlv/list
router.post('/list', async (req, res) => {
  try {
    const { admin_id, session_token } = req.body;

    const sessions = await query<any[]>(
      'SELECT id FROM admins WHERE id = ? AND session_token = ?',
      [admin_id, session_token]
    );
    if (!sessions || sessions.length === 0) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const records = await query<any[]>(
      'SELECT * FROM usuarios_crlv WHERE admin_id = ? ORDER BY created_at DESC',
      [admin_id]
    );

    res.json(records || []);
  } catch (error: any) {
    logger.error('[CRLV] Erro ao listar:', error);
    res.status(500).json({ error: 'Erro ao listar CRLVs' });
  }
});

// POST /api/crlv/delete
router.post('/delete', async (req, res) => {
  try {
    const { admin_id, session_token, crlv_id } = req.body;

    const sessions = await query<any[]>(
      'SELECT id FROM admins WHERE id = ? AND session_token = ?',
      [admin_id, session_token]
    );
    if (!sessions || sessions.length === 0) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    // Get record to delete associated files
    const records = await query<any[]>(
      'SELECT pdf_url, qrcode_url FROM usuarios_crlv WHERE id = ? AND admin_id = ?',
      [crlv_id, admin_id]
    );

    if (records && records.length > 0) {
      const record = records[0];
      // Delete local files
      for (const urlField of [record.pdf_url, record.qrcode_url]) {
        if (urlField) {
          const filePath = path.resolve(process.cwd(), '..', 'public', urlField.replace(/^\//, ''));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }

    await query('DELETE FROM usuarios_crlv WHERE id = ? AND admin_id = ?', [crlv_id, admin_id]);

    res.json({ success: true });
  } catch (error: any) {
    logger.error('[CRLV] Erro ao deletar:', error);
    res.status(500).json({ error: 'Erro ao deletar CRLV' });
  }
});

export default router;
