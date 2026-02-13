import { Router } from 'express';
import { query, getConnection } from '../db';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import logger from '../utils/logger.ts';

const router = Router();

// Converte data BR (DD/MM/YYYY) para MySQL (YYYY-MM-DD)
function toMySQLDate(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;
  // Se já está no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Formato DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

// Separa "DD/MM/YYYY, CIDADE, UF" em { date, local }
function parseDataNascimento(raw: string | undefined | null): { date: string | null; local: string | null } {
  if (!raw) return { date: null, local: null };
  const parts = raw.split(',').map(p => p.trim());
  const datePart = parts[0] || null;
  const localPart = parts.length > 1 ? parts.slice(1).join(', ').trim() : null;
  return { date: toMySQLDate(datePart), local: localPart };
}

// Middleware para validar sessão
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

// ========== SAVE CNH ==========
router.post('/save', async (req, res) => {
  try {
    const {
      admin_id, session_token,
      cpf, nome, dataNascimento, sexo, nacionalidade, docIdentidade,
      categoria, numeroRegistro, dataEmissao, dataValidade, hab,
      pai, mae, uf, localEmissao, estadoExtenso,
      espelho, codigo_seguranca, renach, obs, matrizFinal, cnhDefinitiva,
      cnhFrenteBase64, cnhMeioBase64, cnhVersoBase64, fotoBase64, assinaturaBase64,
      qrcodeBase64, pdfBase64,
    } = req.body;

    // Validar sessão
    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    // Verificar créditos
    const admins = await query<any[]>('SELECT creditos, nome as admin_nome FROM admins WHERE id = ?', [admin_id]);
    if (!admins.length || admins[0].creditos <= 0) {
      return res.status(400).json({ error: 'Créditos insuficientes' });
    }
    const adminNome = admins[0].admin_nome;

    // Verificar CPF duplicado
    const cleanCpf = cpf.replace(/\D/g, '');
    const existing = await query<any[]>('SELECT id, nome, admin_id FROM usuarios WHERE cpf = ?', [cleanCpf]);
    if (existing.length > 0) {
      const record = existing[0];
      let creatorName = 'Desconhecido';
      const adminsCreator = await query<any[]>('SELECT nome FROM admins WHERE id = ?', [record.admin_id]);
      if (adminsCreator.length > 0) creatorName = adminsCreator[0].nome;
      return res.status(409).json({
        error: 'CPF já cadastrado',
        details: {
          existingCnh: record,
          creator_admin_id: record.admin_id,
          creator_name: creatorName,
          is_own: record.admin_id === admin_id,
        },
      });
    }

    // Gerar senha
    const senha = cleanCpf.slice(-6);

    // Helper para salvar qualquer base64 (imagem ou pdf) em public/uploads
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

    const frenteUrl = saveFile(cnhFrenteBase64, `${cleanCpf}img1`);
    const meioUrl = saveFile(cnhMeioBase64, `${cleanCpf}img2`);
    const versoUrl = saveFile(cnhVersoBase64, `${cleanCpf}img3`);
    const fotoUrl = saveFile(fotoBase64, `${cleanCpf}foto`);
    // Salvar assinatura separadamente para reutilização na edição
    saveFile(assinaturaBase64, `${cleanCpf}assinatura`);

    // Separar data de nascimento e local
    const nascParsed = parseDataNascimento(dataNascimento);

    // Inserir no banco PRIMEIRO para obter o ID
    const result = await query<any>(
      `INSERT INTO usuarios (
        admin_id, cpf, nome, senha, data_nascimento, local_nascimento, sexo, nacionalidade,
        doc_identidade, categoria, numero_registro, data_emissao, data_validade,
        hab, pai, mae, uf, local_emissao, estado_extenso,
        espelho, codigo_seguranca, renach, obs, matriz_final, cnh_definitiva,
        cnh_frente_url, cnh_meio_url, cnh_verso_url, foto_url,
        data_expiracao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 45 DAY))`,
      [
        admin_id, cleanCpf, nome, senha, nascParsed.date, nascParsed.local, sexo, nacionalidade,
        docIdentidade, categoria, numeroRegistro, toMySQLDate(dataEmissao), toMySQLDate(dataValidade),
        toMySQLDate(hab) || null, pai, mae, uf, localEmissao, estadoExtenso,
        espelho, codigo_seguranca, renach, obs, matrizFinal, cnhDefinitiva || 'sim',
        frenteUrl, meioUrl, versoUrl, fotoUrl,
      ]
    );

    const usuarioId = result.insertId;

    // Gerar QR Code denso com ID do usuário
    let qrcodeUrl: string | null = null;
    let qrPngBytes: Uint8Array | null = null;
    try {
      const qrLink = `https://qrcode-certificadodigital-vio.info//conta.gov/app/informacoes_usuario.php?id=${usuarioId}`;
      const qrPayload = JSON.stringify({
        url: qrLink,
        doc: "CNH_DIGITAL", ver: "3.1.0",
        cpf: cleanCpf, nome, dn: dataNascimento || "", sx: sexo || "",
        nac: nacionalidade || "", di: docIdentidade || "",
        cat: categoria || "", nr: numeroRegistro || "",
        de: dataEmissao || "", dv: dataValidade || "",
        hab: hab || "", pai: pai || "", mae: mae || "",
        uf: uf || "", le: localEmissao || "", ee: estadoExtenso || "",
        esp: espelho || "", cs: codigo_seguranca || "",
        ren: renach || "", mf: matrizFinal || "",
        def: cnhDefinitiva || "sim", obs: obs || "",
        org: "DETRAN", pais: "BRASIL",
        tp: "CARTEIRA_NACIONAL_HABILITACAO",
        cert: "AC_SERPRO_RFB_SSL_v2", chain: "ICP-Brasil_v5",
        alg: "RSA-SHA256", ks: "2048",
        sn: `${Date.now().toString(16).toUpperCase()}${cleanCpf.slice(0, 6)}`,
        ts: Date.now(),
      });
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrPayload)}&format=png&ecc=M`;
      const qrResp = await fetch(qrApiUrl);
      if (qrResp.ok) {
        qrPngBytes = new Uint8Array(await qrResp.arrayBuffer());
        qrcodeUrl = saveBuffer(Buffer.from(qrPngBytes), `${cleanCpf}qrimg5`);
      }
    } catch (e) {
      console.error('QR code generation error:', e);
    }

    // Gerar PDF com base.png + matrizes + QR code
    let pdfUrl: string | null = null;
    try {
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const basePath = path.resolve(process.cwd(), '..', 'public', 'images', 'base.png');
      if (fs.existsSync(basePath)) {
        const baseBytes = fs.readFileSync(basePath);
        const baseImg = await pdfDoc.embedPng(baseBytes);
        page.drawImage(baseImg, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }

      const mmToPt = (mm: number) => mm * 2.834645669;
      const matrizW = mmToPt(85.000);
      const matrizH = mmToPt(55.000);
      const qrSize = mmToPt(63.788);

      const embedBase64Png = async (b64: string) => {
        const clean = b64.replace(/^data:image\/\w+;base64,/, '');
        return await pdfDoc.embedPng(Buffer.from(clean, 'base64'));
      };

      // Matriz 1 (Frente)
      if (cnhFrenteBase64) {
        const img = await embedBase64Png(cnhFrenteBase64);
        page.drawImage(img, { x: mmToPt(9.9), y: pageHeight - mmToPt(21.6) - matrizH, width: matrizW, height: matrizH });
      }
      // Matriz 2 (Meio)
      if (cnhMeioBase64) {
        const img = await embedBase64Png(cnhMeioBase64);
        page.drawImage(img, { x: mmToPt(8.9), y: pageHeight - mmToPt(77.3) - matrizH, width: matrizW, height: matrizH });
      }
      // Matriz 3 (Verso)
      if (cnhVersoBase64) {
        const img = await embedBase64Png(cnhVersoBase64);
        page.drawImage(img, { x: mmToPt(9.9), y: pageHeight - mmToPt(132.5) - matrizH, width: matrizW, height: matrizH });
      }
      // QR Code
      if (qrPngBytes) {
        const qrImg = await pdfDoc.embedPng(qrPngBytes);
        page.drawImage(qrImg, { x: mmToPt(119.7), y: pageHeight - mmToPt(35.3) - qrSize, width: qrSize, height: qrSize });
      }

      const pdfBytes = await pdfDoc.save();
      pdfUrl = saveBuffer(Buffer.from(pdfBytes), `CNH-e_${cleanCpf}`, 'pdf');
    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr);
    }

    // Atualizar registro com QR code e PDF
    await query('UPDATE usuarios SET qrcode_url = ?, pdf_url = ? WHERE id = ?', [qrcodeUrl, pdfUrl, usuarioId]);

    // Descontar 1 crédito
    await query('UPDATE admins SET creditos = creditos - 1 WHERE id = ?', [admin_id]);

    // Registrar transação
    await query(
      'INSERT INTO credit_transactions (from_admin_id, to_admin_id, amount, transaction_type) VALUES (?, ?, 1, ?)',
      [admin_id, admin_id, 'cnh_creation']
    );

    logger.cnhCreated({ id: admin_id, nome: adminNome }, cleanCpf, nome);

    // Buscar data_expiracao inserida
    const inserted = await query<any[]>('SELECT id, data_expiracao FROM usuarios WHERE id = ?', [usuarioId]);

    res.json({
      success: true,
      id: usuarioId,
      senha,
      pdf: pdfUrl,
      qrcode: qrcodeUrl,
      dataExpiracao: inserted[0]?.data_expiracao || null,
      images: { frente: frenteUrl, meio: meioUrl, verso: versoUrl },
    });
  } catch (error: any) {
    console.error('Erro ao salvar CNH:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// ========== UPDATE CNH ==========
router.post('/update', async (req, res) => {
  try {
    const {
      admin_id, session_token, usuario_id,
      cpf, nome, dataNascimento, sexo, nacionalidade, docIdentidade,
      categoria, numeroRegistro, dataEmissao, dataValidade, hab,
      pai, mae, uf, localEmissao, estadoExtenso,
      espelho, codigo_seguranca, renach, obs, matrizFinal, cnhDefinitiva,
      changedMatrices,
      cnhFrenteBase64, cnhMeioBase64, cnhVersoBase64, fotoBase64, assinaturaBase64,
      qrcodeBase64, pdfBase64,
    } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const existing = await query<any[]>('SELECT * FROM usuarios WHERE id = ?', [usuario_id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    const adminRow = await query<any[]>('SELECT nome FROM admins WHERE id = ?', [admin_id]);
    const adminNome = adminRow.length ? adminRow[0].nome : `ID ${admin_id}`;

    const cleanCpf = cpf.replace(/\D/g, '');
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

    let frenteUrl = existing[0].cnh_frente_url;
    let meioUrl = existing[0].cnh_meio_url;
    let versoUrl = existing[0].cnh_verso_url;
    let fotoUrl = existing[0].foto_url;
    let qrcodeUrl = existing[0].qrcode_url;
    let pdfUrl = existing[0].pdf_url;

    if (changed.includes('frente') && cnhFrenteBase64) {
      frenteUrl = saveFile(cnhFrenteBase64, `${cleanCpf}img1`);
    }
    if (changed.includes('meio') && cnhMeioBase64) {
      meioUrl = saveFile(cnhMeioBase64, `${cleanCpf}img2`);
    }
    if (changed.includes('verso') && cnhVersoBase64) {
      versoUrl = saveFile(cnhVersoBase64, `${cleanCpf}img3`);
    }
    if (fotoBase64) {
      fotoUrl = saveFile(fotoBase64, `${cleanCpf}foto`);
    }
    if (assinaturaBase64) {
      saveFile(assinaturaBase64, `${cleanCpf}assinatura`);
    }

    // Sempre regenerar PDF com todas as matrizes
    {
      try {
        // QR Code denso estilo JSON (mesmo padrão do RG)
        const qrLink = `https://qrcode-certificadodigital-vio.info//conta.gov/app/informacoes_usuario.php?id=${usuario_id}`;
        const qrPayload = JSON.stringify({
          url: qrLink,
          doc: "CNH_DIGITAL", ver: "3.1.0",
          cpf: cleanCpf, nome, dn: dataNascimento || "", sx: sexo || "",
          nac: nacionalidade || "", di: docIdentidade || "",
          cat: categoria || "", nr: numeroRegistro || "",
          de: dataEmissao || "", dv: dataValidade || "",
          hab: hab || "", pai: pai || "", mae: mae || "",
          uf: uf || "", le: localEmissao || "", ee: estadoExtenso || "",
          esp: espelho || "", cs: codigo_seguranca || "",
          ren: renach || "", mf: matrizFinal || "",
          def: cnhDefinitiva || "sim", obs: obs || "",
          org: "DETRAN", pais: "BRASIL",
          tp: "CARTEIRA_NACIONAL_HABILITACAO",
          cert: "AC_SERPRO_RFB_SSL_v2", chain: "ICP-Brasil_v5",
          alg: "RSA-SHA256", ks: "2048",
          sn: `${Date.now().toString(16).toUpperCase()}${cleanCpf.slice(0, 6)}`,
          ts: Date.now(),
        });
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrPayload)}&format=png&ecc=M`;
        const qrResp = await fetch(qrApiUrl);
        let qrPngBytes: Uint8Array | null = null;
        if (qrResp.ok) {
          qrPngBytes = new Uint8Array(await qrResp.arrayBuffer());
          qrcodeUrl = saveBuffer(Buffer.from(qrPngBytes), `${cleanCpf}qrimg5`);
        }

        // PDF
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        const basePath = path.resolve(process.cwd(), '..', 'public', 'images', 'base.png');
        if (fs.existsSync(basePath)) {
          const baseBytes = fs.readFileSync(basePath);
          const baseImg = await pdfDoc.embedPng(baseBytes);
          page.drawImage(baseImg, { x: 0, y: 0, width: pageWidth, height: pageHeight });
        }

        const mmToPt = (mm: number) => mm * 2.834645669;
        const matrizW = mmToPt(85.000);
        const matrizH = mmToPt(55.000);
        const qrSize = mmToPt(63.788);

        const embedFromSource = async (b64: string | null, url: string | null, label: string) => {
          if (b64) {
            console.log(`  📷 ${label}: usando base64 (novo)`);
            const clean = b64.replace(/^data:image\/\w+;base64,/, '');
            return await pdfDoc.embedPng(Buffer.from(clean, 'base64'));
          }
          if (url) {
            // Strip leading slash so path.resolve doesn't treat it as absolute
            const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
            const filePath = path.resolve(process.cwd(), '..', 'public', cleanUrl);
            console.log(`  📷 ${label}: tentando carregar de ${filePath} (existe: ${fs.existsSync(filePath)})`);
            if (fs.existsSync(filePath)) {
              return await pdfDoc.embedPng(fs.readFileSync(filePath));
            }
          }
          console.log(`  ⚠️ ${label}: SEM IMAGEM (b64=${!!b64}, url=${url})`);
          return null;
        };

        // Matriz 1 (Frente) - sempre incluir
        const fImg = await embedFromSource(changed.includes('frente') ? cnhFrenteBase64 : null, frenteUrl, 'Frente');
        if (fImg) page.drawImage(fImg, { x: mmToPt(9.9), y: pageHeight - mmToPt(21.6) - matrizH, width: matrizW, height: matrizH });

        // Matriz 2 (Meio) - sempre incluir
        const mImg = await embedFromSource(changed.includes('meio') ? cnhMeioBase64 : null, meioUrl, 'Meio');
        if (mImg) page.drawImage(mImg, { x: mmToPt(8.9), y: pageHeight - mmToPt(77.3) - matrizH, width: matrizW, height: matrizH });

        // Matriz 3 (Verso) - sempre incluir
        const vImg = await embedFromSource(changed.includes('verso') ? cnhVersoBase64 : null, versoUrl, 'Verso');
        if (vImg) page.drawImage(vImg, { x: mmToPt(9.9), y: pageHeight - mmToPt(132.5) - matrizH, width: matrizW, height: matrizH });

        // QR Code
        if (qrPngBytes) {
          const qrImg = await pdfDoc.embedPng(qrPngBytes);
          page.drawImage(qrImg, { x: mmToPt(119.7), y: pageHeight - mmToPt(35.3) - qrSize, width: qrSize, height: qrSize });
        }

        const pdfBytes = await pdfDoc.save();
        pdfUrl = saveBuffer(Buffer.from(pdfBytes), `CNH-e_${cleanCpf}`, 'pdf');
      } catch (e) {
        console.error('PDF/QR regen error:', e);
      }
    }

    // Separar data de nascimento e local
    const nascParsed = parseDataNascimento(dataNascimento);

    await query(
      `UPDATE usuarios SET
        nome = ?, data_nascimento = ?, local_nascimento = ?, sexo = ?, nacionalidade = ?,
        doc_identidade = ?, categoria = ?, numero_registro = ?,
        data_emissao = ?, data_validade = ?, hab = ?, pai = ?, mae = ?,
        uf = ?, local_emissao = ?, estado_extenso = ?,
        espelho = ?, codigo_seguranca = ?, renach = ?, obs = ?,
        matriz_final = ?, cnh_definitiva = ?,
        cnh_frente_url = ?, cnh_meio_url = ?, cnh_verso_url = ?, foto_url = ?,
        qrcode_url = ?, pdf_url = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        nome, nascParsed.date, nascParsed.local, sexo, nacionalidade,
        docIdentidade, categoria, numeroRegistro,
        toMySQLDate(dataEmissao), toMySQLDate(dataValidade), toMySQLDate(hab) || null, pai, mae,
        uf, localEmissao, estadoExtenso,
        espelho, codigo_seguranca, renach, obs,
        matrizFinal, cnhDefinitiva || 'sim',
        frenteUrl, meioUrl, versoUrl, fotoUrl,
        qrcodeUrl, pdfUrl,
        usuario_id,
      ]
    );

    logger.cnhUpdated(admin_id, usuario_id, nome, changed, adminNome);

    res.json({
      success: true,
      pdf: pdfUrl,
      qrcode: qrcodeUrl,
      changedMatrices: changed,
      images: { frente: frenteUrl, meio: meioUrl, verso: versoUrl },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar CNH:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// ========== LIST CNH ==========
router.post('/list', async (req, res) => {
  try {
    const { admin_id, session_token } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    // Verificar rank
    const adminResult = await query<any[]>('SELECT `rank` FROM admins WHERE id = ?', [admin_id]);
    const rank = adminResult[0]?.rank;

    let usuarios: any[];
    if (rank === 'dono') {
      usuarios = await query<any[]>(
        'SELECT * FROM usuarios ORDER BY created_at DESC LIMIT 200'
      );
    } else {
      usuarios = await query<any[]>(
        'SELECT * FROM usuarios WHERE admin_id = ? ORDER BY created_at DESC LIMIT 200',
        [admin_id]
      );
    }

    logger.cnhListed(admin_id, usuarios.length);

    res.json({ usuarios });
  } catch (error: any) {
    console.error('Erro ao listar CNH:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// ========== DELETE CNH ==========
router.post('/delete', async (req, res) => {
  try {
    const { admin_id, session_token, usuario_id } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    // Buscar registro
    const existing = await query<any[]>('SELECT id, cpf, admin_id FROM usuarios WHERE id = ?', [usuario_id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    // Verificar permissão (dono ou criador)
    const adminResult = await query<any[]>('SELECT `rank` FROM admins WHERE id = ?', [admin_id]);
    if (adminResult[0]?.rank !== 'dono' && existing[0].admin_id !== admin_id) {
      return res.status(403).json({ error: 'Sem permissão para excluir este registro' });
    }

    const cpf = existing[0].cpf;

    // Apagar arquivos do storage
    const uploadsDir = path.resolve(process.cwd(), '..', 'public', 'uploads');
    const filesToDelete = [
      `${cpf}img1.png`,
      `${cpf}img2.png`,
      `${cpf}img3.png`,
      `${cpf}foto.png`,
      `${cpf}qrimg5.png`,
      `CNH-e_${cpf}.pdf`,
    ];

    for (const file of filesToDelete) {
      const filepath = path.join(uploadsDir, file);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Apagar registro do banco
    await query('DELETE FROM usuarios WHERE id = ?', [usuario_id]);

    logger.action('CNH EXCLUÍDA', `usuario_id=${usuario_id}, cpf=${cpf}, por admin_id=${admin_id}`);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir CNH:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// POST /cnh/renew - Renovar CNH (+45 dias)
router.post('/renew', async (req, res) => {
  try {
    const { admin_id, session_token, record_id } = req.body;

    if (!admin_id || !session_token || !record_id) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios faltando' });
    }

    // Validar sessão
    const admins = await query<any[]>('SELECT id, creditos, session_token FROM admins WHERE id = ? AND session_token = ?', [admin_id, session_token]);
    if (!admins || admins.length === 0) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const admin = admins[0];
    if (admin.creditos < 1) {
      return res.status(400).json({ error: 'Créditos insuficientes' });
    }

    // Buscar registro
    const records = await query<any[]>('SELECT id, admin_id, data_expiracao FROM usuarios WHERE id = ? AND admin_id = ?', [record_id, admin_id]);
    if (!records || records.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    const record = records[0];
    const currentExp = record.data_expiracao ? new Date(record.data_expiracao) : new Date();
    const base = currentExp > new Date() ? currentExp : new Date();
    const newExpiration = new Date(base.getTime() + 45 * 24 * 60 * 60 * 1000);

    // Atualizar expiração
    await query('UPDATE usuarios SET data_expiracao = ? WHERE id = ?', [newExpiration, record_id]);

    // Deduzir crédito
    await query('UPDATE admins SET creditos = creditos - 1 WHERE id = ?', [admin_id]);

    logger.action('CNH RENOVADA', `record_id=${record_id}, nova_expiracao=${newExpiration.toISOString()}, admin_id=${admin_id}`);

    res.json({
      success: true,
      newExpiration: newExpiration.toISOString(),
      creditsRemaining: admin.creditos - 1,
    });
  } catch (error: any) {
    console.error('Erro ao renovar CNH:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

export default router;
