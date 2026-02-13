import { Router } from 'express';
import { query } from '../db';
import logger from '../utils/logger.ts';

const router = Router();

async function validateSession(adminId: number, sessionToken: string): Promise<boolean> {
  const result = await query<any[]>(
    'SELECT 1 FROM admins WHERE id = ? AND session_token = ?',
    [adminId, sessionToken]
  );
  return result.length > 0;
}

function getUploadsBaseUrl(req: any): string {
  const envUrl = process.env.VITE_API_URL || process.env.API_URL;
  if (envUrl) return envUrl.replace(/\/api\/?$/, '');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:4000';
  return `${protocol}://${host}`;
}

// ========== LIST GALLERY (photos + signatures from all modules) ==========
router.post('/list', async (req, res) => {
  try {
    const { admin_id, session_token } = req.body;

    if (!await validateSession(admin_id, session_token)) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const baseUrl = getUploadsBaseUrl(req);
    const photos: any[] = [];
    const signatures: any[] = [];

    // 1. CNH - usuarios table (foto_url)
    try {
      const cnhRows = await query<any[]>(
        'SELECT nome, cpf, foto_url, created_at FROM usuarios WHERE admin_id = ? AND foto_url IS NOT NULL ORDER BY created_at DESC LIMIT 100',
        [admin_id]
      );
      for (const row of cnhRows) {
        if (row.foto_url) {
          const url = row.foto_url.startsWith('http') ? row.foto_url : `${baseUrl}${row.foto_url}`;
          photos.push({ url, nome: row.nome, cpf: row.cpf, modulo: 'CNH', created_at: row.created_at });
        }
      }
    } catch (e) { /* table may not exist */ }

    // 2. RG - rgs table (foto_url, assinatura_url)
    try {
      const rgRows = await query<any[]>(
        'SELECT nome, cpf, foto_url, assinatura_url, created_at FROM rgs WHERE admin_id = ? AND (foto_url IS NOT NULL OR assinatura_url IS NOT NULL) ORDER BY created_at DESC LIMIT 100',
        [admin_id]
      );
      for (const row of rgRows) {
        if (row.foto_url) {
          const url = row.foto_url.startsWith('http') ? row.foto_url : `${baseUrl}${row.foto_url}`;
          photos.push({ url, nome: row.nome, cpf: row.cpf, modulo: 'RG', created_at: row.created_at });
        }
        if (row.assinatura_url) {
          const url = row.assinatura_url.startsWith('http') ? row.assinatura_url : `${baseUrl}${row.assinatura_url}`;
          signatures.push({ url, nome: row.nome, cpf: row.cpf, modulo: 'RG', created_at: row.created_at });
        }
      }
    } catch (e) { /* table may not exist */ }

    // 3. CHA - chas table (foto)
    try {
      const chaRows = await query<any[]>(
        'SELECT nome, cpf, foto, created_at FROM chas WHERE admin_id = ? AND foto IS NOT NULL ORDER BY created_at DESC LIMIT 100',
        [admin_id]
      );
      for (const row of chaRows) {
        if (row.foto) {
          const url = row.foto.startsWith('http') ? row.foto : `${baseUrl}${row.foto}`;
          photos.push({ url, nome: row.nome, cpf: row.cpf, modulo: 'CHA', created_at: row.created_at });
        }
      }
    } catch (e) { /* table may not exist */ }

    // 4. Carteira Estudante - carteira_estudante table (perfil_imagem)
    try {
      const estRows = await query<any[]>(
        'SELECT nome, cpf, perfil_imagem, created_at FROM carteira_estudante WHERE admin_id = ? AND perfil_imagem IS NOT NULL ORDER BY created_at DESC LIMIT 100',
        [admin_id]
      );
      for (const row of estRows) {
        if (row.perfil_imagem) {
          const url = row.perfil_imagem.startsWith('http') ? row.perfil_imagem : `${baseUrl}${row.perfil_imagem}`;
          photos.push({ url, nome: row.nome, cpf: row.cpf, modulo: 'Estudante', created_at: row.created_at });
        }
      }
    } catch (e) { /* table may not exist */ }

    // Deduplicate by URL
    const uniquePhotos = [...new Map(photos.map(p => [p.url, p])).values()];
    const uniqueSignatures = [...new Map(signatures.map(s => [s.url, s])).values()];

    res.json({ photos: uniquePhotos, signatures: uniqueSignatures });
  } catch (error: any) {
    logger.error('Gallery list error:', error);
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});

export default router;
