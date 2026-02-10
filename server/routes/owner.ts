import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Middleware: verificar se é dono
async function requireOwner(req: any, res: any, next: any) {
  const adminId = req.headers['x-admin-id'];
  const sessionToken = req.headers['x-session-token'];
  
  if (!adminId || !sessionToken) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const admins = await query<any[]>(
    'SELECT `rank` FROM admins WHERE id = ? AND session_token = ?',
    [adminId, sessionToken]
  );

  if (admins.length === 0 || admins[0].rank !== 'dono') {
    return res.status(403).json({ error: 'Apenas donos podem acessar' });
  }

  next();
}

router.use(requireOwner);

// GET /owner/overview - Visão geral completa do sistema
router.get('/overview', async (_req, res) => {
  try {
    // Contadores
    const [masters] = await query<any[]>('SELECT COUNT(*) as count FROM admins WHERE `rank` = ?', ['master']);
    const [resellers] = await query<any[]>('SELECT COUNT(*) as count FROM admins WHERE `rank` = ?', ['revendedor']);
    const [totalCredits] = await query<any[]>('SELECT SUM(creditos) as total FROM admins');
    
    // Contadores de documentos
    const [cnhCount] = await query<any[]>('SELECT COUNT(*) as count FROM usuarios');
    const [rgCount] = await query<any[]>('SELECT COUNT(*) as count FROM rgs');
    const [carteiraCount] = await query<any[]>('SELECT COUNT(*) as count FROM carteira_estudante');
    const [crlvCount] = await query<any[]>('SELECT COUNT(*) as count FROM usuarios_crlv');
    const [chaCount] = await query<any[]>('SELECT COUNT(*) as count FROM chas');
    
    // Total de transações
    const [txCount] = await query<any[]>('SELECT COUNT(*) as count FROM credit_transactions');
    
    // Total faturamento (pix payments PAID)
    const [revenue] = await query<any[]>('SELECT COALESCE(SUM(amount), 0) as total FROM pix_payments WHERE status = ?', ['PAID']);

    res.json({
      totalMasters: masters?.count || 0,
      totalResellers: resellers?.count || 0,
      totalCredits: totalCredits?.total || 0,
      totalTransactions: txCount?.count || 0,
      totalRevenue: revenue?.total || 0,
      documents: {
        cnh: cnhCount?.count || 0,
        rg: rgCount?.count || 0,
        carteira: carteiraCount?.count || 0,
        crlv: crlvCount?.count || 0,
        cha: chaCount?.count || 0,
        total: (cnhCount?.count || 0) + (rgCount?.count || 0) + (carteiraCount?.count || 0) + (crlvCount?.count || 0) + (chaCount?.count || 0),
      }
    });
  } catch (error) {
    console.error('Erro no overview:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /owner/all-admins - Listar todos os admins do sistema
router.get('/all-admins', async (_req, res) => {
  try {
    const admins = await query<any[]>(
      `SELECT a.id, a.nome, a.email, a.creditos, a.rank, a.profile_photo, a.created_at, a.last_active, a.criado_por,
              c.nome as criado_por_nome
       FROM admins a
       LEFT JOIN admins c ON a.criado_por = c.id
       ORDER BY a.rank ASC, a.nome ASC`
    );
    res.json(admins);
  } catch (error) {
    console.error('Erro ao listar admins:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /owner/audit-log - Histórico de atividades do sistema
router.get('/audit-log', async (req, res) => {
  try {
    const adminId = req.query.adminId ? parseInt(req.query.adminId as string) : null;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);

    // Buscar serviços criados (com saldo do admin na época)
    // Vamos montar um log consolidado de todas as atividades
    const activities: any[] = [];

    // 1. Documentos CNH criados
    const cnhFilter = adminId ? 'WHERE u.admin_id = ?' : '';
    const cnhParams = adminId ? [adminId] : [];
    const cnhs = await query<any[]>(
      `SELECT u.id, u.cpf, u.nome, u.created_at, u.admin_id, a.nome as admin_nome, a.creditos as admin_saldo_atual
       FROM usuarios u
       JOIN admins a ON u.admin_id = a.id
       ${cnhFilter}
       ORDER BY u.created_at DESC LIMIT ?`,
      [...cnhParams, limit]
    );
    cnhs.forEach(c => activities.push({
      type: 'service',
      service: 'CNH',
      cpf: c.cpf,
      nome_documento: c.nome,
      admin_id: c.admin_id,
      admin_nome: c.admin_nome,
      admin_saldo_atual: c.admin_saldo_atual,
      created_at: c.created_at
    }));

    // 2. RGs
    const rgFilter = adminId ? 'WHERE r.admin_id = ?' : '';
    const rgParams = adminId ? [adminId] : [];
    const rgs = await query<any[]>(
      `SELECT r.id, r.cpf, r.nome_completo as nome, r.created_at, r.admin_id, a.nome as admin_nome, a.creditos as admin_saldo_atual
       FROM rgs r
       JOIN admins a ON r.admin_id = a.id
       ${rgFilter}
       ORDER BY r.created_at DESC LIMIT ?`,
      [...rgParams, limit]
    );
    rgs.forEach(r => activities.push({
      type: 'service',
      service: 'RG',
      cpf: r.cpf,
      nome_documento: r.nome,
      admin_id: r.admin_id,
      admin_nome: r.admin_nome,
      admin_saldo_atual: r.admin_saldo_atual,
      created_at: r.created_at
    }));

    // 3. Carteiras
    const cartFilter = adminId ? 'WHERE ce.admin_id = ?' : '';
    const cartParams = adminId ? [adminId] : [];
    const carteiras = await query<any[]>(
      `SELECT ce.id, ce.cpf, ce.nome, ce.created_at, ce.admin_id, a.nome as admin_nome, a.creditos as admin_saldo_atual
       FROM carteira_estudante ce
       JOIN admins a ON ce.admin_id = a.id
       ${cartFilter}
       ORDER BY ce.created_at DESC LIMIT ?`,
      [...cartParams, limit]
    );
    carteiras.forEach(c => activities.push({
      type: 'service',
      service: 'Carteira',
      cpf: c.cpf,
      nome_documento: c.nome,
      admin_id: c.admin_id,
      admin_nome: c.admin_nome,
      admin_saldo_atual: c.admin_saldo_atual,
      created_at: c.created_at
    }));

    // 4. CRLVs
    const crlvFilter = adminId ? 'WHERE uc.admin_id = ?' : '';
    const crlvParams = adminId ? [adminId] : [];
    const crlvs = await query<any[]>(
      `SELECT uc.id, uc.cpf_cnpj as cpf, uc.nome_proprietario as nome, uc.created_at, uc.admin_id, a.nome as admin_nome, a.creditos as admin_saldo_atual
       FROM usuarios_crlv uc
       JOIN admins a ON uc.admin_id = a.id
       ${crlvFilter}
       ORDER BY uc.created_at DESC LIMIT ?`,
      [...crlvParams, limit]
    );
    crlvs.forEach(c => activities.push({
      type: 'service',
      service: 'CRLV',
      cpf: c.cpf,
      nome_documento: c.nome,
      admin_id: c.admin_id,
      admin_nome: c.admin_nome,
      admin_saldo_atual: c.admin_saldo_atual,
      created_at: c.created_at
    }));

    // 5. CHAs
    const chaFilter = adminId ? 'WHERE ch.admin_id = ?' : '';
    const chaParams = adminId ? [adminId] : [];
    const chas = await query<any[]>(
      `SELECT ch.id, ch.cpf, ch.nome, ch.created_at, ch.admin_id, a.nome as admin_nome, a.creditos as admin_saldo_atual
       FROM chas ch
       JOIN admins a ON ch.admin_id = a.id
       ${chaFilter}
       ORDER BY ch.created_at DESC LIMIT ?`,
      [...chaParams, limit]
    );
    chas.forEach(c => activities.push({
      type: 'service',
      service: 'Náutica',
      cpf: c.cpf,
      nome_documento: c.nome,
      admin_id: c.admin_id,
      admin_nome: c.admin_nome,
      admin_saldo_atual: c.admin_saldo_atual,
      created_at: c.created_at
    }));

    // 6. Transferências de crédito
    const txFilter = adminId ? 'WHERE ct.from_admin_id = ? OR ct.to_admin_id = ?' : '';
    const txParams = adminId ? [adminId, adminId] : [];
    const transfers = await query<any[]>(
      `SELECT ct.id, ct.amount, ct.transaction_type, ct.total_price, ct.created_at,
              ct.from_admin_id, ct.to_admin_id,
              fa.nome as from_nome, fa.creditos as from_saldo_atual,
              ta.nome as to_nome, ta.creditos as to_saldo_atual
       FROM credit_transactions ct
       LEFT JOIN admins fa ON ct.from_admin_id = fa.id
       LEFT JOIN admins ta ON ct.to_admin_id = ta.id
       ${txFilter}
       ORDER BY ct.created_at DESC LIMIT ?`,
      [...txParams, limit]
    );
    transfers.forEach(t => activities.push({
      type: t.transaction_type === 'recharge' ? 'recharge' : 'transfer',
      amount: t.amount,
      total_price: t.total_price,
      from_admin_id: t.from_admin_id,
      from_nome: t.from_nome,
      from_saldo_atual: t.from_saldo_atual,
      to_admin_id: t.to_admin_id,
      to_nome: t.to_nome,
      to_saldo_atual: t.to_saldo_atual,
      created_at: t.created_at
    }));

    // Ordenar por data (mais recentes primeiro)
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(activities.slice(0, limit));
  } catch (error) {
    console.error('Erro no audit log:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /owner/change-password/:adminId - Alterar senha de um admin
router.put('/change-password/:adminId', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const targetId = parseInt(req.params.adminId);

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 4 caracteres' });
    }

    await query('UPDATE admins SET `key` = ? WHERE id = ?', [newPassword, targetId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /owner/transfer-credits - Dono transfere créditos para qualquer admin
router.post('/transfer-credits', async (req, res) => {
  try {
    const { toAdminId, amount } = req.body;
    const fromAdminId = parseInt(req.headers['x-admin-id'] as string);

    if (!toAdminId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Verificar saldo do dono
    const [owner] = await query<any[]>('SELECT creditos FROM admins WHERE id = ?', [fromAdminId]);
    if (!owner || owner.creditos < amount) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Debitar do dono
    await query('UPDATE admins SET creditos = creditos - ? WHERE id = ?', [amount, fromAdminId]);
    // Creditar ao destinatário
    await query('UPDATE admins SET creditos = creditos + ? WHERE id = ?', [amount, toAdminId]);
    // Registrar transação
    await query(
      'INSERT INTO credit_transactions (from_admin_id, to_admin_id, amount, transaction_type) VALUES (?, ?, ?, ?)',
      [fromAdminId, toAdminId, amount, 'transfer']
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao transferir créditos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /owner/top-resellers - Top revendedores por acessos (last_active count)
router.get('/top-resellers', async (_req, res) => {
  try {
    // Top por quantidade de documentos criados (proxy de atividade/acessos)
    const resellers = await query<any[]>(
      `SELECT a.id, a.nome, a.email, a.creditos, a.last_active,
        (SELECT COUNT(*) FROM usuarios WHERE admin_id = a.id) +
        (SELECT COUNT(*) FROM rgs WHERE admin_id = a.id) +
        (SELECT COUNT(*) FROM carteira_estudante WHERE admin_id = a.id) +
        (SELECT COUNT(*) FROM usuarios_crlv WHERE admin_id = a.id) +
        (SELECT COUNT(*) FROM chas WHERE admin_id = a.id) as total_services
       FROM admins a
       WHERE a.rank = 'revendedor'
       ORDER BY total_services DESC
       LIMIT 10`
    );
    res.json(resellers);
  } catch (error) {
    console.error('Erro ao buscar top revendedores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
