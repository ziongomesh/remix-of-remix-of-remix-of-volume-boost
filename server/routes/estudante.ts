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

// ========== SAVE CARTEIRA ESTUDANTE ==========
router.post('/save', async (req, res) => {
  try {
    const {
      admin_id, session_token,
      nome, cpf, rg, data_nascimento, faculdade, graduacao,
      fotoBase64,
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
    const existing = await query<any[]>('SELECT id, nome, admin_id FROM carteira_estudante WHERE cpf = ?', [cleanCpf]);
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

    // Save photo as {cpf}img6.png
    const perfilUrl = saveFile(fotoBase64, `${cleanCpf}img6`);

    // Generate QR code
    const qrBaseUrl = process.env.ABAFE_QR_URL || process.env.VITE_ABAFE_QR_URL || 'https://abafe-certificado.info/qrcode.php?cpf=';
    const qrLink = `${qrBaseUrl}${cleanCpf}`;
    const qrPayload = JSON.stringify({
      url: qrLink,
      doc: "CARTEIRA_ESTUDANTE", ver: "1.0",
      cpf: cleanCpf, nome, rg,
      dn: data_nascimento, fac: faculdade, grad: graduacao,
      sn: senha, ts: Date.now(),
    });
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrPayload)}&format=png&ecc=M`;

    let qrcodeUrl: string | null = null;
    try {
      const qrResp = await fetch(qrApiUrl);
      if (qrResp.ok) {
        const qrPngBytes = new Uint8Array(await qrResp.arrayBuffer());
        qrcodeUrl = saveBuffer(Buffer.from(qrPngBytes), `${cleanCpf}qrimg6`);
      }
    } catch (e) {
      logger.error('Estudante QR code error:', e);
    }

    // Convert date format dd/mm/yyyy -> yyyy-mm-dd
    let mysqlDate = data_nascimento;
    if (data_nascimento && data_nascimento.includes('/')) {
      const parts = data_nascimento.split('/');
      if (parts.length === 3) mysqlDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const result = await query<any>(
      `INSERT INTO carteira_estudante (nome, cpf, senha, rg, data_nascimento, faculdade, graduacao, perfil_imagem, admin_id, qrcode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, cleanCpf, senha, rg, mysqlDate, faculdade, graduacao, perfilUrl, admin_id, qrcodeUrl]
    );

    // Debit 1 credit
    await query('UPDATE admins SET creditos = creditos - 1 WHERE id = ?', [admin_id]);
    await query(
      `INSERT INTO credit_transactions (from_admin_id, to_admin_id, amount, transaction_type) VALUES (?, ?, 1, 'estudante_creation')`,
      [admin_id, admin_id]
    );

    res.json({
      success: true,
      id: result.insertId,
      senha,
      qrcode: qrcodeUrl,
      perfil_imagem: perfilUrl,
    });
  } catch (error: any) {
    logger.error('Estudante save error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== LIST CARTEIRA ESTUDANTE ==========
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
      registros = await query<any[]>('SELECT * FROM carteira_estudante ORDER BY created_at DESC LIMIT 200');
    } else {
      registros = await query<any[]>('SELECT * FROM carteira_estudante WHERE admin_id = ? ORDER BY created_at DESC LIMIT 200', [admin_id]);
    }

    res.json({ registros });
  } catch (error: any) {
    logger.error('Estudante list error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== DELETE CARTEIRA ESTUDANTE ==========
router.post('/delete', async (req, res) => {
  try {
    const { admin_id, session_token, estudante_id } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const existing = await query<any[]>('SELECT * FROM carteira_estudante WHERE id = ?', [estudante_id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    const record = existing[0];
    const adminResult = await query<any[]>('SELECT `rank` FROM admins WHERE id = ?', [admin_id]);
    const rank = adminResult[0]?.rank;

    if (rank !== 'dono' && record.admin_id !== admin_id) {
      return res.status(403).json({ error: 'Sem permissão para excluir este registro' });
    }

    await query('DELETE FROM carteira_estudante WHERE id = ?', [estudante_id]);

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Estudante delete error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

export default router;
