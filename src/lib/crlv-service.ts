// Serviço CRLV - abstração para Supabase e MySQL

import { isUsingMySQL } from './db-config';
import api from './api';

export interface CrlvRecord {
  id: number;
  admin_id: number;
  // Identificação
  renavam: string;
  placa: string;
  exercicio: string;
  numero_crv: string;
  seguranca_crv: string;
  cod_seg_cla: string;
  // Características
  marca_modelo: string;
  ano_fab: string;
  ano_mod: string;
  cor: string;
  combustivel: string;
  especie_tipo: string;
  categoria: string;
  cat_obs: string;
  carroceria: string;
  // Especificações técnicas
  chassi: string;
  placa_ant: string;
  potencia_cil: string;
  capacidade: string;
  lotacao: string;
  peso_bruto: string;
  motor: string;
  cmt: string;
  eixos: string;
  // Proprietário
  nome_proprietario: string;
  cpf_cnpj: string;
  local: string;
  data: string;
  // Observações
  observacoes: string;
  // URLs
  pdf_url: string | null;
  // Datas
  created_at: string;
  expires_at: string | null;
}

export interface CrlvSaveResult {
  success: boolean;
  id: number;
  senha: string;
  pdf: string | null;
  dataExpiracao: string | null;
}

export const crlvService = {
  save: async (data: {
    admin_id: number;
    session_token: string;
    // All fields
    renavam: string;
    placa: string;
    exercicio: string;
    numero_crv: string;
    seguranca_crv: string;
    cod_seg_cla: string;
    marca_modelo: string;
    ano_fab: string;
    ano_mod: string;
    cor: string;
    combustivel: string;
    especie_tipo: string;
    categoria: string;
    cat_obs: string;
    carroceria: string;
    chassi: string;
    placa_ant: string;
    potencia_cil: string;
    capacidade: string;
    lotacao: string;
    peso_bruto: string;
    motor: string;
    cmt: string;
    eixos: string;
    nome_proprietario: string;
    cpf_cnpj: string;
    local: string;
    data: string;
    observacoes: string;
  }): Promise<CrlvSaveResult> => {
    if (isUsingMySQL()) {
      const envUrl = import.meta.env.VITE_API_URL as string | undefined;
      const baseUrl = envUrl || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? `${window.location.origin}/api`
        : 'http://localhost:4000/api');
      const res = await fetch(`${baseUrl}/crlv/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro ao salvar' }));
        throw new Error(err.error || 'Erro ao salvar CRLV');
      }
      return res.json();
    } else {
      // Supabase edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/save-crlv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro ao salvar' }));
        throw new Error(err.error || 'Erro ao salvar CRLV');
      }
      return res.json();
    }
  },

  list: async (adminId: number, sessionToken: string): Promise<CrlvRecord[]> => {
    if (isUsingMySQL()) {
      const envUrl = import.meta.env.VITE_API_URL as string | undefined;
      const baseUrl = envUrl || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? `${window.location.origin}/api`
        : 'http://localhost:4000/api');
      const res = await fetch(`${baseUrl}/crlv/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId, session_token: sessionToken }),
      });
      if (!res.ok) return [];
      return res.json();
    } else {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/list-crlv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ admin_id: adminId, session_token: sessionToken }),
      });
      if (!res.ok) return [];
      return res.json();
    }
  },

  delete: async (adminId: number, sessionToken: string, crlvId: number): Promise<boolean> => {
    if (isUsingMySQL()) {
      const envUrl = import.meta.env.VITE_API_URL as string | undefined;
      const baseUrl = envUrl || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? `${window.location.origin}/api`
        : 'http://localhost:4000/api');
      const res = await fetch(`${baseUrl}/crlv/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId, session_token: sessionToken, crlv_id: crlvId }),
      });
      return res.ok;
    } else {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-crlv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ admin_id: adminId, session_token: sessionToken, crlv_id: crlvId }),
      });
      return res.ok;
    }
  },
};
