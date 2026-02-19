import { Router } from 'express';
import { query } from '../db';
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

// ========== SALVAR ATESTADO ==========
router.post('/save', async (req, res) => {
  try {
    const {
      admin_id, session_token,
      nome_paciente, cpf_paciente, dias_afastamento, data_apartir, horario_atendimento,
      codigo_doenca, descricao_doenca,
      nome_hospital, endereco_hospital, cidade_hospital,
      nome_medico, crm,
      codigo_autenticacao, data_hora, ip,
      link_validacao,
    } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    // Verifica créditos
    const admins = await query<any[]>('SELECT creditos FROM admins WHERE id = ?', [admin_id]);
    if (!admins.length || admins[0].creditos <= 0) {
      return res.status(400).json({ error: 'Créditos insuficientes' });
    }

    const result = await query<any>(
      `INSERT INTO hapvida_atestados (
        admin_id, nome_paciente, cpf_paciente, dias_afastamento, data_apartir, horario_atendimento,
        codigo_doenca, descricao_doenca,
        nome_hospital, endereco_hospital, cidade_hospital,
        nome_medico, crm,
        codigo_autenticacao, data_hora, ip, link_validacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admin_id, nome_paciente, cpf_paciente?.replace(/\D/g, ''), dias_afastamento,
        data_apartir, horario_atendimento,
        codigo_doenca, descricao_doenca || null,
        nome_hospital, endereco_hospital || null, cidade_hospital || null,
        nome_medico, crm || null,
        codigo_autenticacao || null, data_hora || null, ip || null, link_validacao || null,
      ]
    );

    // Debitar 1 crédito
    await query('UPDATE admins SET creditos = creditos - 1 WHERE id = ?', [admin_id]);

    // Log transação
    await query(
      `INSERT INTO credit_transactions (from_admin_id, to_admin_id, amount, transaction_type) VALUES (?, ?, 1, 'hapvida')`,
      [admin_id, admin_id]
    );

    logger.action('HAPVIDA_ATESTADO', `admin_id=${admin_id} paciente=${nome_paciente}`);

    res.json({ success: true, id: result.insertId });
  } catch (error: any) {
    logger.error('Hapvida save error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== LISTAR ATESTADOS ==========
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
      registros = await query<any[]>(
        `SELECT h.*, a.nome AS admin_nome FROM hapvida_atestados h
         LEFT JOIN admins a ON a.id = h.admin_id
         ORDER BY h.created_at DESC LIMIT 200`
      );
    } else {
      registros = await query<any[]>(
        `SELECT h.*, a.nome AS admin_nome FROM hapvida_atestados h
         LEFT JOIN admins a ON a.id = h.admin_id
         WHERE h.admin_id = ?
         ORDER BY h.created_at DESC LIMIT 200`,
        [admin_id]
      );
    }

    res.json({ registros });
  } catch (error: any) {
    logger.error('Hapvida list error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

// ========== DELETAR ATESTADO ==========
router.post('/delete', async (req, res) => {
  try {
    const { admin_id, session_token, atestado_id } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const adminResult = await query<any[]>('SELECT `rank` FROM admins WHERE id = ?', [admin_id]);
    const rank = adminResult[0]?.rank;

    if (rank === 'dono') {
      await query('DELETE FROM hapvida_atestados WHERE id = ?', [atestado_id]);
    } else {
      await query('DELETE FROM hapvida_atestados WHERE id = ? AND admin_id = ?', [atestado_id, admin_id]);
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Hapvida delete error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

export default router;
