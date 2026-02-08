// Serviço RG Digital - abstrai Supabase Edge Functions
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

export const rgService = {
  save: async (data: RgSaveData): Promise<RgSaveResult> => {
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
    const { data, error } = await supabase.functions.invoke('list-cnh', {
      body: { admin_id, session_token, tipo: 'rg' },
    });
    if (error) throw error;
    return { registros: data?.registros || [] };
  },
};

export default rgService;
