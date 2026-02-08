import { Router } from 'express';
import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

const router = Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, key } = req.body;
    const clientIp = req.headers['x-forwarded-for'] as string || req.ip || 'unknown';

    if (!email || !key) {
      logger.loginFailed(email || '(vazio)', clientIp, 'Email ou chave não fornecidos');
      return res.status(400).json({ error: 'Email e chave são obrigatórios' });
    }

    const admins = await query<any[]>(
      'SELECT id, nome, email, creditos, `rank`, profile_photo, pin, criado_por, `key` as stored_key, session_token, ip_address FROM admins WHERE email = ? LIMIT 1',
      [email]
    );

    if (admins.length === 0) {
      logger.loginFailed(email, clientIp, 'Email não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const admin = admins[0];

    const providedKey = String(key).trim();
    const storedKeyRaw = String((admin as any).stored_key ?? '').trim();
    const match = providedKey === storedKeyRaw;

    if (!match) {
      logger.loginFailed(email, clientIp, 'Chave incorreta');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Sessão única: se já tem sessão ativa de outro IP, notificar kick
    const oldSessionToken = admin.session_token;
    const oldIp = admin.ip_address;
    if (oldSessionToken && oldIp && oldIp !== clientIp) {
      logger.sessionKicked({ id: admin.id, nome: admin.nome }, oldIp, clientIp);
    }

    // Gerar novo token de sessão (invalida qualquer sessão anterior)
    const sessionToken = uuidv4();

    await query(
      'UPDATE admins SET session_token = ?, last_active = NOW(), ip_address = ? WHERE id = ?',
      [sessionToken, clientIp, admin.id]
    );

    logger.login(
      { id: admin.id, nome: admin.nome, email: admin.email, rank: admin.rank },
      clientIp
    );

    delete (admin as any).stored_key;
    delete (admin as any).ip_address;

    res.json({
      admin: {
        ...admin,
        session_token: sessionToken,
        has_pin: admin.pin ? true : false,
      },
    });
  } catch (error) {
    logger.error('Login', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Validar PIN
router.post('/validate-pin', async (req, res) => {
  try {
    const { adminId, pin } = req.body;

    const result = await query<any[]>(
      'SELECT pin FROM admins WHERE id = ? LIMIT 1',
      [adminId]
    );

    if (result.length === 0) {
      logger.pinValidated(adminId, false);
      return res.json({ valid: false });
    }

    const storedPin = result[0].pin;
    const providedPin = String(pin ?? '').trim();
    const storedPinRaw = String(storedPin ?? '').trim();
    const valid = storedPinRaw === providedPin;

    logger.pinValidated(adminId, valid);

    res.json({ valid });
  } catch (error) {
    logger.error('Validar PIN', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Definir PIN
router.post('/set-pin', async (req, res) => {
  try {
    const { adminId, pin } = req.body;

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN deve ter 4 dígitos numéricos' });
    }

    await query('UPDATE admins SET pin = ? WHERE id = ?', [pin, adminId]);

    logger.action('PIN', `Admin ${adminId} definiu novo PIN`);

    res.json({ success: true });
  } catch (error) {
    logger.error('Definir PIN', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Validar sessão (com verificação de IP)
router.post('/validate-session', async (req, res) => {
  try {
    const { adminId, sessionToken } = req.body;
    const clientIp = req.headers['x-forwarded-for'] as string || req.ip || 'unknown';

    const result = await query<any[]>(
      'SELECT session_token, ip_address FROM admins WHERE id = ? AND session_token = ?',
      [adminId, sessionToken]
    );

    if (result.length === 0) {
      logger.sessionInvalid(adminId, clientIp);
      return res.json({ valid: false });
    }

    // Atualizar last_active
    await query('UPDATE admins SET last_active = NOW() WHERE id = ?', [adminId]);

    res.json({ valid: true });
  } catch (error) {
    logger.error('Validar sessão', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { adminId } = req.body;

    // Buscar nome para log
    const admins = await query<any[]>('SELECT nome FROM admins WHERE id = ?', [adminId]);
    const nome = admins[0]?.nome || 'Desconhecido';

    await query('UPDATE admins SET session_token = NULL WHERE id = ?', [adminId]);

    logger.logout(adminId, nome);

    res.json({ success: true });
  } catch (error) {
    logger.error('Logout', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
