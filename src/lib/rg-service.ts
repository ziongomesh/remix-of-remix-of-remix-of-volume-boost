// Serviço RG Digital - abstrai Supabase Edge Functions e Node.js MySQL
import { isUsingMySQL } from './db-config';
import { supabase } from '@/integrations/supabase/client';

export interface RgSaveData {
  admin_id: number;
  session_token: string;
  cpf: string;
  nomeCompleto: string;
  nomeSocial?: string;
  dataNascimento: string;
  naturalidade: string;
  genero: string;
  nacionalidade: string;
  validade: string;
  uf: string;
  dataEmissao: string;
  local: string;
  orgaoExpedidor: string;
  pai?: string;
  mae?: string;
  rgFrenteBase64: string;
  rgVersoBase64: string;
  fotoBase64: string;
  assinaturaBase64?: string;
}

export interface RgSaveResult {
  success: boolean;
  id: number;
  senha: string;
  pdf: string | null;
  dataExpiracao: string | null;
  images: { frente: string | null; verso: string | null };
  error?: string;
  details?: any;
}

// Helper para obter a URL da API Node.js
function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) {
    const base = envUrl.replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:4000/api';
}

async function fetchNodeAPI(endpoint: string, body: any) {
  const API_URL = getApiUrl();
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw { status: response.status, ...data };
  }
  return data;
}

export const rgService = {
  save: async (data: RgSaveData): Promise<RgSaveResult> => {
    if (isUsingMySQL()) {
      console.log('📦 Salvando RG via Node.js API...');
      return fetchNodeAPI('/rg/save', data);
    }

    console.log('📦 Salvando RG via Edge Function...');
    const { data: result, error } = await supabase.functions.invoke('save-rg', {
      body: data,
    });

    if (error) throw new Error(error.message || 'Erro ao salvar RG');
    if (result?.error) {
      const err: any = new Error(result.error);
      err.status = result.error === 'CPF já cadastrado' ? 409 : 500;
      err.details = result.details;
      throw err;
    }

    return result;
  },

  list: async (admin_id: number, session_token: string) => {
    if (isUsingMySQL()) {
      console.log('📦 Listando RG via Node.js API...');
      return fetchNodeAPI('/rg/list', { admin_id, session_token });
    }

    const { data, error } = await supabase.functions.invoke('list-cnh', {
      body: { admin_id, session_token, tipo: 'rg' },
    });
    if (error) throw error;
    return { registros: data?.registros || [] };
  },
};

export default rgService;
