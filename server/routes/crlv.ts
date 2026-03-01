import { Router } from 'express';
import { query } from '../db';
import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
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
      preview_image_base64,
      // Insurance/DPVAT fields
      data_quitacao, cat_tarif, repasse_fns, repasse_denatran,
      custo_bilhete, custo_efetivo, valor_iof, valor_total,
    } = req.body;

    // Validate session
    const sessions = await query<any[]>(
      'SELECT id, creditos, rank FROM admins WHERE id = ? AND session_token = ?',
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

    // Load PNG template and create PDF from it
    const templatePath = path.resolve(process.cwd(), '..', 'public', 'templates', 'crlv-template-base.png');
    if (!fs.existsSync(templatePath)) {
      logger.error('[CRLV] Template PNG não encontrado:', templatePath);
      return res.status(500).json({ error: 'Template CRLV não encontrado' });
    }

    const templatePngBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const bgImage = await pdfDoc.embedPng(templatePngBytes);

    // A4 page size in points
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Draw PNG as full-page background
    page.drawImage(bgImage, { x: 0, y: 0, width: pageWidth, height: pageHeight });

    // Embed fonts - use FreeMonoBold (same as preview) for data fields
    const freeMonoPath = path.resolve(process.cwd(), '..', 'src', 'assets', 'FreeMonoBold.otf');
    const openSansPath = path.resolve(process.cwd(), '..', 'src', 'assets', 'OpenSans-VariableFont_wdth_wght.ttf');
    
    let dataFont: any;
    let labelFont: any;
    
    if (fs.existsSync(freeMonoPath)) {
      const freeMonoBytes = fs.readFileSync(freeMonoPath);
      dataFont = await pdfDoc.embedFont(freeMonoBytes);
    } else {
      logger.warn('[CRLV] FreeMonoBold.otf not found, falling back to CourierBold');
      dataFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
    }
    
    if (fs.existsSync(openSansPath)) {
      const openSansBytes = fs.readFileSync(openSansPath);
      labelFont = await pdfDoc.embedFont(openSansBytes);
    } else {
      labelFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
    
    const courierBold = dataFont;
    const helvetica = labelFont;

    // Helper: draw text using coordinates matching the preview canvas (PDF points, top-left origin)
    // ty = distance from top of page to the text BASELINE (alphabetic)
    // pdf-lib uses bottom-left origin, so: pdfY = pageHeight - ty
    const drawField = (text: string, tx: number, ty: number, size = 10, font = courierBold) => {
      if (!text || !text.trim()) return;
      const val = text.toUpperCase();
      page.drawText(val, {
        x: tx,
        y: pageHeight - ty,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // ========== ALL FIELDS — coordinates match CrlvPositionTool FIELDS exactly ==========

    // UF (small font, like OpenSans in preview)
    if (uf) {
      drawField(`DETRAN-   ${uf}`, 31.20, 54.22, 4.42, helvetica);
    }

    // Left column
    drawField(renavam, 31.20, 102.21, 10, courierBold);
    drawField(placa, 30.95, 128.58, 10, courierBold);
    drawField(exercicio, 102.93, 128.58, 10, courierBold);
    drawField(ano_fab, 31.20, 154.75, 10, courierBold);
    drawField(ano_mod, 102.93, 154.75, 10, courierBold);
    drawField(numero_crv, 31.20, 181.14, 10, courierBold);
    drawField(cod_seg_cla, 31.67, 258.97, 10, courierBold);
    drawField(cat_obs || '***', 162.67, 259.21, 10, courierBold);
    drawField(marca_modelo, 30.95, 293.43, 10, courierBold);
    drawField(especie_tipo, 30.47, 329.66, 10, courierBold);
    drawField(placa_ant || '*******/**', 31.20, 364.00, 10, courierBold);
    drawField(chassi, 131.01, 364.46, 10, courierBold);
    drawField(cor, 30.47, 400.19, 10, courierBold);
    drawField(combustivel, 101.97, 399.47, 10, courierBold);

    // Right column
    drawField(categoria, 315.76, 73.67, 10, courierBold);
    drawField(capacidade || '*.*', 510.08, 88.78, 10, courierBold);
    drawField(potencia_cil, 316.01, 114.22, 10, courierBold);
    drawField(peso_bruto, 510.08, 114.70, 10, courierBold);
    drawField(motor, 317.00, 140.86, 10, courierBold);
    drawField(cmt, 453.79, 140.62, 10, courierBold);
    drawField(eixos, 504.80, 140.62, 10, courierBold);
    drawField(lotacao, 538.63, 140.86, 10, courierBold);
    drawField(carroceria, 316.01, 166.27, 10, courierBold);
    drawField(nome_proprietario, 314.82, 192.18, 10, courierBold);
    drawField(cpf_cnpj, 463.39, 223.38, 10, courierBold);
    drawField(localEmissao, 316.49, 259.40, 10, courierBold);
    drawField(dataEmissao, 510.08, 258.20, 10, courierBold);

    // Insurance / DPVAT fields
    drawField(data_quitacao || '*', 389.63, 323.51, 10, courierBold);
    drawField(cat_tarif || '*', 316.73, 323.51, 10, courierBold);
    drawField(repasse_fns || '*', 316.73, 360.46, 10, courierBold);
    drawField(custo_bilhete || '*', 424.18, 360.46, 10, courierBold);
    drawField(custo_efetivo || '*', 494.72, 360.46, 10, courierBold);
    drawField(repasse_denatran || '*', 316.73, 401.25, 10, courierBold);
    drawField(valor_iof || '*', 424.18, 401.25, 10, courierBold);
    drawField(valor_total || '*', 494.72, 401.25, 10, courierBold);

    // ========== "Documento emitido por DETRAN..." ==========
    const cpfHash = cleanCpf.slice(0, 9) || '000000000';
    const hashCode = `${cpfHash.slice(0,3)}${cpfHash.slice(3,5)}f${cpfHash.slice(5,8)}`;
    const docEmitidoText = `Documento emitido por DETRAN ${uf || 'SP'} (${hashCode}) em ${dataEmissao || new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}.`;
    drawField(docEmitidoText, 31.43, 413.00, 4.42, helvetica);

    // ========== OBSERVAÇÕES ==========
    if (observacoes) {
      drawField(observacoes, 26.87, 442.18, 10, courierBold);
    }

    // ========== QR CODE ==========
    let qrcodePath: string | null = null;
    try {
      let qrBytes: Buffer;

      if (qrcode_base64 && qrcode_base64.length > 100) {
        const clean = qrcode_base64.replace(/^data:image\/\w+;base64,/, '');
        qrBytes = Buffer.from(clean, 'base64');
      } else {
        const densePad = '#REPUBLICA.FEDERATIVA.DO.BRASIL//CERTIFICADO.DE.REGISTRO.E.LICENCIAMENTO.DE.VEICULO//DETRAN//DENATRAN//CONTRAN//v1=SERPRO//v2=RENAVAM//v3=REGISTRO.NACIONAL//v4=CERTIFICADO.DIGITAL//v5=ICP-BRASIL//v6=LICENCIAMENTO.ANUAL//v7=SEGURO.DPVAT//v8=IPVA//v9=VISTORIA//v10=CRV';
        const qrData = `https://qrcode-certificadodigital-vio.info/crlv?ren=${renavam}&pl=${placa}${densePad}`;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrData)}&format=png&ecc=M`;
        const qrResponse = await fetch(qrApiUrl);
        if (!qrResponse.ok) throw new Error('QR generation failed');
        qrBytes = Buffer.from(await qrResponse.arrayBuffer());
      }

      const qrImg = await pdfDoc.embedPng(qrBytes);
      // QR position matching preview: tx=167.23, ty=92.85, size=97.4
      page.drawImage(qrImg, {
        x: 167.23,
        y: pageHeight - 92.85 - 97.4,
        width: 97.4,
        height: 97.4,
      });

      // Save QR locally
      const qrFilename = `crlv_${cleanCpf}_qr.png`;
      const qrFullPath = path.join(uploadsDir, qrFilename);
      fs.writeFileSync(qrFullPath, qrBytes);
      qrcodePath = `/uploads/${qrFilename}`;
    } catch (qrErr) {
      logger.error('[CRLV] QR code error:', qrErr);
    }

    if (preview_image_base64 && /^data:image\/(png|jpeg|jpg);base64,/.test(preview_image_base64)) {
      try {
        const cleanPreview = preview_image_base64.replace(/^data:image\/\w+;base64,/, '');
        const previewBytes = Buffer.from(cleanPreview, 'base64');
        const previewImg = await pdfDoc.embedPng(previewBytes);
        page.drawImage(previewImg, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      } catch (previewErr) {
        logger.error('[CRLV] Preview image overlay error:', previewErr);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const cleanPlaca = (placa || '').replace(/[^A-Za-z0-9]/g, '');
    const pdfFilename = `CRLV_${cleanPlaca}.pdf`;
    const pdfFullPath = path.join(uploadsDir, pdfFilename);
    fs.writeFileSync(pdfFullPath, Buffer.from(pdfBytes));
    const pdfUrl = `/uploads/${pdfFilename}`;

    // CRLV expires in 45 days
    const expiresAt = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

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
        observacoes || '', qrcodePath, pdfUrl, senha, expiresAt,
      ]
    );

    const insertedId = insertResult.insertId;

    // Deduct credit (dono/sub have unlimited)
    const adminRank = admin.rank || '';
    const shouldDeductCredit = !(adminRank === 'dono' || adminRank === 'sub');
    if (shouldDeductCredit) {
      await query('UPDATE admins SET creditos = creditos - 1 WHERE id = ?', [admin_id]);
    }

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
      dataExpiracao: expiresAt,
      createdAt: new Date().toISOString(),
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
