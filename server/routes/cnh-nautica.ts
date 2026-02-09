import { Router } from 'express';
import { query } from '../db';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.ts';

const router = Router();

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

function saveFile(base64: string | undefined, name: string, ext: string = 'png'): string | null {
  if (!base64) return null;
  const uploadsDir = path.resolve(process.cwd(), '..', 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `${name}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  const clean = base64.replace(/^data:[^;]+;base64,/, '');
  fs.writeFileSync(filepath, Buffer.from(clean, 'base64'));
  return `/uploads/${filename}`;
}

function saveBuffer(buffer: Buffer | Uint8Array, name: string, ext: string = 'png'): string {
  const uploadsDir = path.resolve(process.cwd(), '..', 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `${name}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, buffer);
  return `/uploads/${filename}`;
}

function generateSenha(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ========== SAVE CHAS ==========
router.post('/save', async (req, res) => {
  try {
    const {
      admin_id, session_token,
      nome, cpf, data_nascimento, categoria, validade, emissao,
      numero_inscricao, limite_navegacao, requisitos, orgao_emissao,
      fotoBase64, matrizFrenteBase64, matrizVersoBase64,
    } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const admins = await query<any[]>('SELECT creditos FROM admins WHERE id = ?', [admin_id]);
    if (!admins.length || admins[0].creditos <= 0) {
      return res.status(400).json({ error: 'Créditos insuficientes' });
    }

    const cleanCpf = (cpf || '').replace(/\D/g, '');

    // Check duplicate CPF
    const existing = await query<any[]>('SELECT id, nome, admin_id FROM chas WHERE cpf = ?', [cleanCpf]);
    if (existing.length > 0) {
      const record = existing[0];
      let creatorName = 'Desconhecido';
      const adminsCreator = await query<any[]>('SELECT nome FROM admins WHERE id = ?', [record.admin_id]);
      if (adminsCreator.length > 0) creatorName = adminsCreator[0].nome;
      return res.status(409).json({
        error: 'CPF já cadastrado',
        details: {
          existing: record,
          creator_admin_id: record.admin_id,
          creator_name: creatorName,
          is_own: record.admin_id === admin_id,
        },
      });
    }

    const senha = generateSenha();

    // Save photo as {cpf}img7.png
    const fotoUrl = saveFile(fotoBase64, `${cleanCpf}img7`);
    const matrizFrenteUrl = saveFile(matrizFrenteBase64, `${cleanCpf}matrizcha`);
    const matrizVersoUrl = saveFile(matrizVersoBase64, `${cleanCpf}matrizcha2`);
    // Generate dense QR code
    const qrBaseUrl = process.env.CNH_NAUTICA_QR_URL || 'https://govbr.consulta-rgdigital-vio.info/qr/index.php?cpf=';
    const qrLink = `${qrBaseUrl}${cleanCpf}`;
    const qrPayload = JSON.stringify({
      url: qrLink,
      doc: "CNH_NAUTICA", ver: "1.0",
      cpf: cleanCpf, nome, cat: categoria,
      ni: numero_inscricao, ln: limite_navegacao,
      oe: orgao_emissao, sn: senha, ts: Date.now(),
    });
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrPayload)}&format=png&ecc=M`;

    let qrcodeUrl: string | null = null;
    try {
      const qrResp = await fetch(qrApiUrl);
      if (qrResp.ok) {
        const qrPngBytes = new Uint8Array(await qrResp.arrayBuffer());
        qrcodeUrl = saveBuffer(Buffer.from(qrPngBytes), `${cleanCpf}qrcodeimg7`);
      }
    } catch (e) {
      logger.error('CNH Náutica QR code error:', e);
    }

    // Convert date dd/mm/yyyy -> yyyy-mm-dd
    const convertDate = (d: string | undefined) => {
      if (!d) return null;
      if (d.includes('/')) {
        const parts = d.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return d;
    };

    const expiresAt = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

    const result = await query<any>(
      `INSERT INTO chas (cpf, nome, data_nascimento, categoria, validade, emissao, numero_inscricao, limite_navegacao, requisitos, orgao_emissao, foto, qrcode, senha, admin_id, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanCpf, nome, convertDate(data_nascimento), categoria, validade, emissao,
        numero_inscricao, limite_navegacao, requisitos, orgao_emissao,
        fotoUrl, qrcodeUrl, senha, admin_id, expiresAt,
      ]
    );

    // Debit 1 credit
    await query('UPDATE admins SET creditos = creditos - 1 WHERE id = ?', [admin_id]);
    await query(
      `INSERT INTO credit_transactions (from_admin_id, to_admin_id, amount, transaction_type) VALUES (?, ?, 1, 'nautica_creation')`,
      [admin_id, admin_id]
    );

    res.json({
      success: true,
      id: result.insertId,
      senha,
      foto: fotoUrl,
      qrcode: qrcodeUrl,
    });
  } catch (error: any) {
    logger.error('CNH Náutica save error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== LIST CHAS ==========
router.post('/list', async (req, res) => {
  try {
    const { admin_id, session_token } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const adminResult = await query<any[]>('SELECT `rank` FROM admins WHERE id = ?', [admin_id]);
    const rank = adminResult[0]?.rank;

    let registros: any[];
    if (rank === 'dono') {
      registros = await query<any[]>('SELECT * FROM chas ORDER BY created_at DESC LIMIT 200');
    } else {
      registros = await query<any[]>('SELECT * FROM chas WHERE admin_id = ? ORDER BY created_at DESC LIMIT 200', [admin_id]);
    }

    res.json({ registros });
  } catch (error: any) {
    logger.error('CNH Náutica list error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== DELETE CHAS ==========
router.post('/delete', async (req, res) => {
  try {
    const { admin_id, session_token, nautica_id } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const existing = await query<any[]>('SELECT * FROM chas WHERE id = ?', [nautica_id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    const record = existing[0];
    const adminResult = await query<any[]>('SELECT `rank` FROM admins WHERE id = ?', [admin_id]);
    const rank = adminResult[0]?.rank;

    if (rank !== 'dono' && record.admin_id !== admin_id) {
      return res.status(403).json({ error: 'Sem permissão para excluir este registro' });
    }

    // Delete files
    const uploadsDir = path.resolve(process.cwd(), '..', 'public');
    const filesToDelete = [record.foto, record.qrcode].filter(Boolean);
    for (const fileUrl of filesToDelete) {
      const filePath = path.join(uploadsDir, fileUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }

    await query('DELETE FROM chas WHERE id = ?', [nautica_id]);

    res.json({ success: true });
  } catch (error: any) {
    logger.error('CNH Náutica delete error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== UPDATE CHAS ==========
router.post('/update', async (req, res) => {
  try {
    const {
      admin_id, session_token, nautica_id,
      nome, data_nascimento, categoria, validade, emissao,
      numero_inscricao, limite_navegacao, requisitos, orgao_emissao,
      fotoBase64, matrizFrenteBase64, matrizVersoBase64,
    } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const existing = await query<any[]>('SELECT * FROM chas WHERE id = ?', [nautica_id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    const record = existing[0];
    const cleanCpf = record.cpf;

    // Update photo if provided
    if (fotoBase64) {
      saveFile(fotoBase64, `${cleanCpf}img7`);
    }
    if (matrizFrenteBase64) {
      saveFile(matrizFrenteBase64, `${cleanCpf}matrizcha`);
    }
    if (matrizVersoBase64) {
      saveFile(matrizVersoBase64, `${cleanCpf}matrizcha2`);
    }

    // Regenerate QR code
    const qrBaseUrl = process.env.CNH_NAUTICA_QR_URL || 'https://govbr.consulta-rgdigital-vio.info/qr/index.php?cpf=';
    const qrLink = `${qrBaseUrl}${cleanCpf}`;
    const qrPayload = JSON.stringify({
      url: qrLink,
      doc: "CNH_NAUTICA", ver: "1.0",
      cpf: cleanCpf, nome: nome || record.nome, cat: categoria || record.categoria,
      ni: numero_inscricao || record.numero_inscricao, ln: limite_navegacao || record.limite_navegacao,
      oe: orgao_emissao || record.orgao_emissao, sn: record.senha, ts: Date.now(),
    });
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrPayload)}&format=png&ecc=M`;

    let qrcodeUrl = record.qrcode;
    try {
      const qrResp = await fetch(qrApiUrl);
      if (qrResp.ok) {
        const qrPngBytes = new Uint8Array(await qrResp.arrayBuffer());
        qrcodeUrl = saveBuffer(Buffer.from(qrPngBytes), `${cleanCpf}qrcodeimg7`);
      }
    } catch (e) {
      logger.error('CNH Náutica QR update error:', e);
    }

    const convertDate = (d: string | undefined) => {
      if (!d) return null;
      if (d.includes('/')) {
        const parts = d.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return d;
    };

    await query(
      `UPDATE chas SET nome = ?, data_nascimento = ?, categoria = ?, validade = ?, emissao = ?,
       numero_inscricao = ?, limite_navegacao = ?, requisitos = ?, orgao_emissao = ?, qrcode = ?
       WHERE id = ?`,
      [
        nome || record.nome, convertDate(data_nascimento) || record.data_nascimento,
        categoria || record.categoria, validade || record.validade, emissao || record.emissao,
        numero_inscricao || record.numero_inscricao, limite_navegacao || record.limite_navegacao,
        requisitos || record.requisitos, orgao_emissao || record.orgao_emissao, qrcodeUrl, nautica_id,
      ]
    );

    if (fotoBase64) {
      await query('UPDATE chas SET foto = ? WHERE id = ?', [`/uploads/${cleanCpf}img7.png`, nautica_id]);
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('CNH Náutica update error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== RENEW CHAS ==========
router.post('/renew', async (req, res) => {
  try {
    const { admin_id, session_token, record_id } = req.body;

    if (!admin_id || !session_token || !record_id) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios faltando' });
    }

    const admins = await query<any[]>('SELECT id, creditos, session_token FROM admins WHERE id = ? AND session_token = ?', [admin_id, session_token]);
    if (!admins.length) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const admin = admins[0];
    if (admin.creditos < 1) {
      return res.status(400).json({ error: 'Créditos insuficientes' });
    }

    const records = await query<any[]>('SELECT id, admin_id, expires_at FROM chas WHERE id = ? AND admin_id = ?', [record_id, admin_id]);
    if (!records.length) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    const now = new Date();
    const currentExpiration = records[0].expires_at ? new Date(records[0].expires_at) : now;
    const baseDate = currentExpiration > now ? currentExpiration : now;
    const newExpiration = new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000);

    await query('UPDATE chas SET expires_at = ? WHERE id = ?', [newExpiration, record_id]);
    await query('UPDATE admins SET creditos = creditos - 1 WHERE id = ?', [admin_id]);

    logger.action('CNH NAUTICA RENOVADA', `record_id=${record_id}, nova_expiracao=${newExpiration.toISOString()}, admin_id=${admin_id}`);

    res.json({
      success: true,
      newExpiration: newExpiration.toISOString(),
      creditsRemaining: admin.creditos - 1,
    });
  } catch (error: any) {
    logger.error('CNH Náutica renew error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

export default router;
