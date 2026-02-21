export interface HapvidaUnidade {
  nome: string;
  endereco: string;
  cidade: string;
  uf: string;
  telefone?: string;
  tipo: 'Hospital' | 'Clínica' | 'Diagnóstico' | 'Outro';
}

export const HAPVIDA_UNIDADES: HapvidaUnidade[] = [];

// Agrupa por estado
export const UF_LABELS: Record<string, string> = {
  AL: 'Alagoas', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará',
  GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', PA: 'Pará',
  PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná',
  RN: 'Rio Grande do Norte', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
};

export function getUnidadesPorUF(uf: string): HapvidaUnidade[] {
  return HAPVIDA_UNIDADES.filter(u => u.uf === uf);
}

export const UFS_DISPONIVEIS = [...new Set(HAPVIDA_UNIDADES.map(u => u.uf))].sort();
