import { Router } from 'express';
import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Buscar admin por ID
router.get('/:id', async (req, res) => {
  try {
    const admins = await query<any[]>(
      'SELECT id, nome, email, creditos, `rank`, profile_photo, created_at FROM admins WHERE id = ?',
      [req.params.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin não encontrado' });
    }

    res.json(admins[0]);
  } catch (error) {
    console.error('Erro ao buscar admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar revendedores de um master
router.get('/resellers/:masterId', async (req, res) => {
  try {
    const resellers = await query<any[]>(
      'SELECT id, nome, email, creditos, `rank`, profile_photo, created_at FROM admins WHERE criado_por = ?',
      [req.params.masterId]
    );

    res.json(resellers);
  } catch (error) {
    console.error('Erro ao buscar revendedores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get all masters
router.get('/masters', async (_req, res) => {
  try {
    const masters = await query<any[]>(
      'SELECT id, nome, email, creditos, created_at FROM admins WHERE `rank` = ?',
      ['master']
    );
    res.json(masters);
  } catch (error) {
    console.error('Erro ao buscar masters:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Pesquisar admins
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = `%${req.params.query}%`;
    const admins = await query<any[]>(
      'SELECT id, nome, email, creditos, `rank`, created_at FROM admins WHERE nome LIKE ? OR email LIKE ? LIMIT 20',
      [searchQuery, searchQuery]
    );

    res.json(admins);
  } catch (error) {
    console.error('Erro ao pesquisar admins:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar master
router.post('/master', async (req, res) => {
  try {
    const { nome, email, key, criadoPor } = req.body;

    // Verificar se quem está criando é dono
    const creator = await query<any[]>(
      'SELECT `rank` FROM admins WHERE id = ?',
      [criadoPor]
    );

    if (creator.length === 0 || creator[0].rank !== 'dono') {
      return res.status(403).json({ error: 'Apenas donos podem criar masters' });
    }

    const existing = await query<any[]>(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const result = await query<any>(
      'INSERT INTO admins (nome, email, `key`, `rank`, criado_por, creditos) VALUES (?, ?, ?, ?, ?, 0)',
      [nome, email, key, 'master', criadoPor]
    );

    res.json({ id: result.insertId, nome, email, rank: 'master' });
  } catch (error) {
    console.error('Erro ao criar master:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar revendedor (via pagamento PIX - endpoint legado mantido para compatibilidade)
router.post('/reseller', async (req, res) => {
  try {
    const { nome, email, key, criadoPor } = req.body;

    // Verificar se quem está criando é master
    const creator = await query<any[]>(
      'SELECT `rank` FROM admins WHERE id = ?',
      [criadoPor]
    );

    if (creator.length === 0 || creator[0].rank !== 'master') {
      return res.status(403).json({ error: 'Apenas masters podem criar revendedores' });
    }

    const existing = await query<any[]>(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criar revendedor (usado pelo webhook após pagamento PIX)
    const result = await query<any>(
      'INSERT INTO admins (nome, email, `key`, `rank`, criado_por, creditos) VALUES (?, ?, ?, ?, ?, 5)',
      [nome, email, key, 'revendedor', criadoPor]
    );

    res.json({ id: result.insertId, nome, email, rank: 'revendedor', creditos: 5 });
  } catch (error) {
    console.error('Erro ao criar revendedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar admin
router.put('/:id', async (req, res) => {
  try {
    const { nome, email, key } = req.body;
    const updates: string[] = [];
    const values: any[] = [];

    if (nome) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (key) {
      updates.push('`key` = ?');
      values.push(key);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(req.params.id);
    await query(`UPDATE admins SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar admin
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM admins WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Dashboard stats
router.get('/stats/dashboard', async (_req, res) => {
  try {
    const [masters] = await query<any[]>('SELECT COUNT(*) as count FROM admins WHERE `rank` = ?', ['master']);
    const [resellers] = await query<any[]>('SELECT COUNT(*) as count FROM admins WHERE `rank` = ?', ['revendedor']);
    const [totalCredits] = await query<any[]>('SELECT SUM(creditos) as total FROM admins');

    res.json({
      totalMasters: masters?.count || 0,
      totalResellers: resellers?.count || 0,
      totalCredits: totalCredits?.total || 0
    });
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de documentos criados pelos revendedores de um master
router.get('/stats/documents/:masterId', async (req, res) => {
  try {
    const masterId = parseInt(req.params.masterId);
    
    // Buscar IDs dos revendedores deste master
    const resellers = await query<any[]>(
      'SELECT id, nome FROM admins WHERE criado_por = ?',
      [masterId]
    );
    
    if (resellers.length === 0) {
      return res.json({
        totalDocuments: 0,
        totalCnh: 0,
        totalRg: 0,
        totalCarteira: 0,
        byReseller: []
      });
    }
    
    const resellerIds = resellers.map(r => r.id);
    const placeholders = resellerIds.map(() => '?').join(',');
    
    // Contar CNHs (tabela usuarios)
    const cnhCounts = await query<any[]>(
      `SELECT admin_id, COUNT(*) as count FROM usuarios WHERE admin_id IN (${placeholders}) GROUP BY admin_id`,
      resellerIds
    );
    
    // Contar RGs
    const rgCounts = await query<any[]>(
      `SELECT admin_id, COUNT(*) as count FROM rgs WHERE admin_id IN (${placeholders}) GROUP BY admin_id`,
      resellerIds
    );
    
    // Contar Carteiras Estudante
    const carteiraCounts = await query<any[]>(
      `SELECT admin_id, COUNT(*) as count FROM carteira_estudante WHERE admin_id IN (${placeholders}) GROUP BY admin_id`,
      resellerIds
    );
    
    // Mapear contagens por revendedor
    const cnhMap = new Map(cnhCounts.map(c => [c.admin_id, c.count]));
    const rgMap = new Map(rgCounts.map(c => [c.admin_id, c.count]));
    const carteiraMap = new Map(carteiraCounts.map(c => [c.admin_id, c.count]));
    
    let totalCnh = 0;
    let totalRg = 0;
    let totalCarteira = 0;
    
    const byReseller = resellers.map(reseller => {
      const cnh = cnhMap.get(reseller.id) || 0;
      const rg = rgMap.get(reseller.id) || 0;
      const carteira = carteiraMap.get(reseller.id) || 0;
      
      totalCnh += cnh;
      totalRg += rg;
      totalCarteira += carteira;
      
      return {
        id: reseller.id,
        nome: reseller.nome,
        cnh,
        rg,
        carteira,
        total: cnh + rg + carteira
      };
    }).filter(r => r.total > 0)
      .sort((a, b) => b.total - a.total);
    
    res.json({
      totalDocuments: totalCnh + totalRg + totalCarteira,
      totalCnh,
      totalRg,
      totalCarteira,
      byReseller
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de documentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Detalhes completos de um revendedor específico
router.get('/reseller-details/:resellerId', async (req, res) => {
  try {
    const resellerId = parseInt(req.params.resellerId);
    
    // Buscar dados básicos do revendedor
    const [reseller] = await query<any[]>(
      'SELECT id, nome, email, creditos, `rank`, profile_photo, created_at, criado_por FROM admins WHERE id = ?',
      [resellerId]
    );
    
    if (!reseller) {
      return res.status(404).json({ error: 'Revendedor não encontrado' });
    }
    
    // Buscar CNHs criadas (últimas 50)
    const cnhs = await query<any[]>(
      `SELECT id, cpf, nome, senha, data_validade as validade, created_at 
       FROM usuarios 
       WHERE admin_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [resellerId]
    );
    
    // Buscar RGs criados (últimos 50)
    const rgs = await query<any[]>(
      `SELECT id, cpf, nome_completo as nome, senha, validade, created_at 
       FROM rgs 
       WHERE admin_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [resellerId]
    );
    
    // Buscar Carteiras Estudante criadas (últimas 50)
    const carteiras = await query<any[]>(
      `SELECT id, cpf, nome, senha, created_at 
       FROM carteira_estudante 
       WHERE admin_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [resellerId]
    );

    // Buscar CRLVs criados (últimos 50)
    const crlvs = await query<any[]>(
      `SELECT id, cpf_cnpj as cpf, nome_proprietario as nome, senha, data_expiracao as validade, placa, created_at 
       FROM usuarios_crlv 
       WHERE admin_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [resellerId]
    );

    // Buscar CHAs Náuticas criadas (últimas 50)
    const chas = await query<any[]>(
      `SELECT id, cpf, nome, senha, validade, created_at 
       FROM chas 
       WHERE admin_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [resellerId]
    );
    
    // Buscar transações de crédito recebidas
    const creditsReceived = await query<any[]>(
      `SELECT SUM(amount) as total FROM credit_transactions 
       WHERE to_admin_id = ? AND transaction_type = 'transfer'`,
      [resellerId]
    );
    
    // Calcular créditos usados (total recebido - saldo atual)
    const totalReceived = creditsReceived[0]?.total || 0;
    const creditsUsed = Math.max(0, totalReceived - reseller.creditos);
    
    // Encontrar último serviço criado
    const allServices = [
      ...cnhs.map(c => ({ ...c, type: 'CNH', created_at: c.created_at })),
      ...rgs.map(r => ({ ...r, type: 'RG', created_at: r.created_at })),
      ...carteiras.map(c => ({ ...c, type: 'Carteira Estudante', created_at: c.created_at })),
      ...crlvs.map(c => ({ ...c, type: 'CRLV', created_at: c.created_at })),
      ...chas.map(c => ({ ...c, type: 'CHA Náutica', created_at: c.created_at }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const lastService = allServices[0] || null;
    
    // Buscar contagem total real (pode ter mais de 50)
    const [cnhCount] = await query<any[]>('SELECT COUNT(*) as count FROM usuarios WHERE admin_id = ?', [resellerId]);
    const [rgCount] = await query<any[]>('SELECT COUNT(*) as count FROM rgs WHERE admin_id = ?', [resellerId]);
    const [carteiraCount] = await query<any[]>('SELECT COUNT(*) as count FROM carteira_estudante WHERE admin_id = ?', [resellerId]);
    const [crlvCount] = await query<any[]>('SELECT COUNT(*) as count FROM usuarios_crlv WHERE admin_id = ?', [resellerId]);
    const [chaCount] = await query<any[]>('SELECT COUNT(*) as count FROM chas WHERE admin_id = ?', [resellerId]);
    
    res.json({
      reseller: {
        id: reseller.id,
        nome: reseller.nome,
        email: reseller.email,
        creditos: reseller.creditos,
        rank: reseller.rank,
        profile_photo: reseller.profile_photo,
        created_at: reseller.created_at
      },
      stats: {
        totalCreditsReceived: totalReceived,
        creditsUsed,
        currentBalance: reseller.creditos,
        totalDocuments: (cnhCount?.count || 0) + (rgCount?.count || 0) + (carteiraCount?.count || 0) + (crlvCount?.count || 0) + (chaCount?.count || 0),
        totalCnh: cnhCount?.count || 0,
        totalRg: rgCount?.count || 0,
        totalCarteira: carteiraCount?.count || 0,
        totalCrlv: crlvCount?.count || 0,
        totalCha: chaCount?.count || 0
      },
      lastService: lastService ? {
        type: lastService.type,
        cpf: lastService.cpf,
        nome: lastService.nome,
        senha: lastService.senha,
        validade: lastService.validade,
        created_at: lastService.created_at
      } : null,
      documents: {
        cnhs: cnhs.map(c => ({
          id: c.id,
          cpf: c.cpf,
          nome: c.nome,
          senha: c.senha,
          validade: c.validade,
          created_at: c.created_at
        })),
        rgs: rgs.map(r => ({
          id: r.id,
          cpf: r.cpf,
          nome: r.nome,
          senha: r.senha,
          validade: r.validade,
          created_at: r.created_at
        })),
        carteiras: carteiras.map(c => ({
          id: c.id,
          cpf: c.cpf,
          nome: c.nome,
          senha: c.senha,
          created_at: c.created_at
        })),
        crlvs: crlvs.map(c => ({
          id: c.id,
          cpf: c.cpf,
          nome: c.nome,
          senha: c.senha,
          validade: c.validade,
          placa: c.placa,
          created_at: c.created_at
        })),
        chas: chas.map(c => ({
          id: c.id,
          cpf: c.cpf,
          nome: c.nome,
          senha: c.senha,
          validade: c.validade,
          created_at: c.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do revendedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /admins/creator/:adminId - Buscar nome do master que criou o acesso
router.get('/creator/:adminId', async (req, res) => {
  try {
    const adminId = parseInt(req.params.adminId);
    const rows = await query<any[]>(
      `SELECT a2.id as creator_id, a2.nome as creator_name, a2.telefone as creator_telefone
       FROM admins a1
       JOIN admins a2 ON a1.criado_por = a2.id
       WHERE a1.id = ?`,
      [adminId]
    );

    if (rows.length === 0) {
      return res.json({ creator_id: null, creator_name: null, creator_telefone: null });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar criador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /admins/stats/my-documents/:adminId - Contar documentos por período (dia/semana/mês) para o próprio admin
router.get('/stats/my-documents/:adminId', async (req, res) => {
  try {
    const adminId = parseInt(req.params.adminId);
    
    // Today
    const [cnhToday] = await query<any[]>(
      'SELECT COUNT(*) as count FROM usuarios WHERE admin_id = ? AND DATE(created_at) = CURDATE()', [adminId]
    );
    const [rgToday] = await query<any[]>(
      'SELECT COUNT(*) as count FROM rgs WHERE admin_id = ? AND DATE(created_at) = CURDATE()', [adminId]
    );
    const [carteiraToday] = await query<any[]>(
      'SELECT COUNT(*) as count FROM carteira_estudante WHERE admin_id = ? AND DATE(created_at) = CURDATE()', [adminId]
    );
    const [crlvToday] = await query<any[]>(
      'SELECT COUNT(*) as count FROM usuarios_crlv WHERE admin_id = ? AND DATE(created_at) = CURDATE()', [adminId]
    );
    const [chaToday] = await query<any[]>(
      'SELECT COUNT(*) as count FROM chas WHERE admin_id = ? AND DATE(created_at) = CURDATE()', [adminId]
    );
    
    const today = (cnhToday?.count || 0) + (rgToday?.count || 0) + (carteiraToday?.count || 0) + (crlvToday?.count || 0) + (chaToday?.count || 0);
    
    // This week
    const [cnhWeek] = await query<any[]>(
      'SELECT COUNT(*) as count FROM usuarios WHERE admin_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)', [adminId]
    );
    const [rgWeek] = await query<any[]>(
      'SELECT COUNT(*) as count FROM rgs WHERE admin_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)', [adminId]
    );
    const [carteiraWeek] = await query<any[]>(
      'SELECT COUNT(*) as count FROM carteira_estudante WHERE admin_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)', [adminId]
    );
    const [crlvWeek] = await query<any[]>(
      'SELECT COUNT(*) as count FROM usuarios_crlv WHERE admin_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)', [adminId]
    );
    const [chaWeek] = await query<any[]>(
      'SELECT COUNT(*) as count FROM chas WHERE admin_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)', [adminId]
    );
    
    const week = (cnhWeek?.count || 0) + (rgWeek?.count || 0) + (carteiraWeek?.count || 0) + (crlvWeek?.count || 0) + (chaWeek?.count || 0);
    
    // This month
    const [cnhMonth] = await query<any[]>(
      'SELECT COUNT(*) as count FROM usuarios WHERE admin_id = ? AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())', [adminId]
    );
    const [rgMonth] = await query<any[]>(
      'SELECT COUNT(*) as count FROM rgs WHERE admin_id = ? AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())', [adminId]
    );
    const [carteiraMonth] = await query<any[]>(
      'SELECT COUNT(*) as count FROM carteira_estudante WHERE admin_id = ? AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())', [adminId]
    );
    const [crlvMonth] = await query<any[]>(
      'SELECT COUNT(*) as count FROM usuarios_crlv WHERE admin_id = ? AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())', [adminId]
    );
    const [chaMonth] = await query<any[]>(
      'SELECT COUNT(*) as count FROM chas WHERE admin_id = ? AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())', [adminId]
    );
    
    const month = (cnhMonth?.count || 0) + (rgMonth?.count || 0) + (carteiraMonth?.count || 0) + (crlvMonth?.count || 0) + (chaMonth?.count || 0);
    
    res.json({ today, week, month });
  } catch (error) {
    console.error('Erro ao buscar stats de documentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /admins/:id/telefone - Atualizar telefone do admin
router.put('/:id/telefone', async (req, res) => {
  try {
    const adminId = parseInt(req.params.id);
    const { telefone, session_token } = req.body;

    // Validar sessão
    const admins = await query<any[]>(
      'SELECT id FROM admins WHERE id = ? AND session_token = ?',
      [adminId, session_token]
    );
    if (admins.length === 0) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    await query('UPDATE admins SET telefone = ? WHERE id = ?', [telefone || null, adminId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar telefone:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /admins/master/daily-history/:masterId - Histórico diário dos revendedores do master
router.get('/master/daily-history/:masterId', async (req, res) => {
  try {
    const masterId = parseInt(req.params.masterId);
    const filterAdminId = req.query.adminId ? parseInt(req.query.adminId as string) : null;
    const filterModule = req.query.module as string | null;
    const filterDate = req.query.date as string | null;
    const limit = Math.min(parseInt(req.query.limit as string) || 200, 500);

    // Buscar IDs dos revendedores deste master + o próprio master
    const resellers = await query<any[]>(
      'SELECT id FROM admins WHERE criado_por = ?',
      [masterId]
    );
    const resellerIds = resellers.map((r: any) => r.id);
    const allIds = [masterId, ...resellerIds];

    // Se filtro por admin específico, verificar se é do grupo
    if (filterAdminId && !allIds.includes(filterAdminId)) {
      return res.json({ grouped: {}, total: 0 });
    }

    const targetIds = filterAdminId ? [filterAdminId] : allIds;
    const placeholders = targetIds.map(() => '?').join(',');

    const services: any[] = [];

    const buildWhere = (adminCol: string, dateCol: string) => {
      const conditions: string[] = [`${adminCol} IN (${placeholders})`];
      const params: any[] = [...targetIds];
      if (filterDate) { conditions.push(`DATE(${dateCol}) = ?`); params.push(filterDate); }
      return { where: 'WHERE ' + conditions.join(' AND '), params };
    };

    if (!filterModule || filterModule === 'CNH') {
      const { where, params } = buildWhere('u.admin_id', 'u.created_at');
      const cnhs = await query<any[]>(
        `SELECT u.id, u.cpf, u.nome, u.created_at, u.admin_id, a.nome as admin_nome, a.\`rank\` as admin_rank
         FROM usuarios u JOIN admins a ON u.admin_id = a.id ${where}
         ORDER BY u.created_at DESC LIMIT ?`,
        [...params, limit]
      );
      cnhs.forEach((c: any) => services.push({ ...c, modulo: 'CNH' }));
    }

    if (!filterModule || filterModule === 'RG') {
      const { where, params } = buildWhere('r.admin_id', 'r.created_at');
      const rgs = await query<any[]>(
        `SELECT r.id, r.cpf, r.nome_completo as nome, r.created_at, r.admin_id, a.nome as admin_nome, a.\`rank\` as admin_rank
         FROM rgs r JOIN admins a ON r.admin_id = a.id ${where}
         ORDER BY r.created_at DESC LIMIT ?`,
        [...params, limit]
      );
      rgs.forEach((r: any) => services.push({ ...r, modulo: 'RG' }));
    }

    if (!filterModule || filterModule === 'Carteira') {
      const { where, params } = buildWhere('ce.admin_id', 'ce.created_at');
      const carteiras = await query<any[]>(
        `SELECT ce.id, ce.cpf, ce.nome, ce.created_at, ce.admin_id, a.nome as admin_nome, a.\`rank\` as admin_rank
         FROM carteira_estudante ce JOIN admins a ON ce.admin_id = a.id ${where}
         ORDER BY ce.created_at DESC LIMIT ?`,
        [...params, limit]
      );
      carteiras.forEach((c: any) => services.push({ ...c, modulo: 'Carteira' }));
    }

    if (!filterModule || filterModule === 'CRLV') {
      const { where, params } = buildWhere('uc.admin_id', 'uc.created_at');
      const crlvs = await query<any[]>(
        `SELECT uc.id, uc.cpf_cnpj as cpf, uc.nome_proprietario as nome, uc.created_at, uc.admin_id, a.nome as admin_nome, a.\`rank\` as admin_rank
         FROM usuarios_crlv uc JOIN admins a ON uc.admin_id = a.id ${where}
         ORDER BY uc.created_at DESC LIMIT ?`,
        [...params, limit]
      );
      crlvs.forEach((c: any) => services.push({ ...c, modulo: 'CRLV' }));
    }

    if (!filterModule || filterModule === 'Nautica') {
      const { where, params } = buildWhere('ch.admin_id', 'ch.created_at');
      const chas = await query<any[]>(
        `SELECT ch.id, ch.cpf, ch.nome, ch.created_at, ch.admin_id, a.nome as admin_nome, a.\`rank\` as admin_rank
         FROM chas ch JOIN admins a ON ch.admin_id = a.id ${where}
         ORDER BY ch.created_at DESC LIMIT ?`,
        [...params, limit]
      );
      chas.forEach((c: any) => services.push({ ...c, modulo: 'Náutica' }));
    }

    services.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const grouped: Record<string, any[]> = {};
    for (const svc of services) {
      const day = new Date(svc.created_at).toISOString().slice(0, 10);
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(svc);
    }

    for (const day of Object.values(grouped)) {
      for (const svc of day) {
        svc.is_mine = svc.admin_id === masterId;
      }
    }

    // Lista de admins para filtro
    const adminList = await query<any[]>(
      `SELECT id, nome, \`rank\` FROM admins WHERE id IN (${allIds.map(() => '?').join(',')})`,
      allIds
    );

    res.json({ grouped, total: services.length, admins: adminList });
  } catch (error) {
    console.error('Erro no master daily-history:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
