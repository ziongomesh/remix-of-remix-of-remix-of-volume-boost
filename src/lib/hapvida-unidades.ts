export interface HapvidaUnidade {
  nome: string;
  endereco: string;
  cidade: string;
  uf: string;
  telefone?: string;
  tipo: 'Hospital' | 'Clínica' | 'Diagnóstico' | 'Outro';
}

export const HAPVIDA_UNIDADES: HapvidaUnidade[] = [
  // ─── CEARÁ (CE) ─────────────────────────────────────────────────────────────
  { nome: 'Clínica Aldeota', endereco: 'Av. Senador Virgílio Távora, 1815 - Aldeota', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Antônio Sales', endereco: 'Av. Antônio Sales, 2238 - Dionísio Torres', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Barão de Studart', endereco: 'Av. Barão de Studart, 2260 - Dionísio Torres', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Conjunto Ceará', endereco: 'Av. Ministro Albuquerque Lima, 1421 - Conjunto Ceará 3ª etapa', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Dom Manuel', endereco: 'Avenida Dom Manuel, 1395 - Centro', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Francisco Sá', endereco: 'Av. Francisco Sá, 5271 - Álvaro Weyne', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Heráclito Graça', endereco: 'Av. Heráclito Graça, 500b - Centro', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Isaac Newton', endereco: 'Rua Visconde de Mauá, 1593 - Meireles', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Joaquim Távora', endereco: 'Avenida Antônio Sales, 60 - Joaquim Távora', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica José Walter', endereco: 'Avenida João Araújo de Lima, 591 - José Walter', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Lobo Filho', endereco: 'Rua João Lobo Filho, 72 - Fátima', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Messejana', endereco: 'Rua Tenente Jurandi Alencar, 234 - Messejana', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Monte Castelo', endereco: 'R. Ribeiro da Silva, 761 - São Gerardo', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Montese', endereco: 'Av. Gomes de Matos, 1737 - Montese', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Pereira Filgueiras', endereco: 'Rua Pereira Filgueiras, 825 - Centro', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Rodrigues Júnior', endereco: 'Rua Pereira Filgueiras, 825 - Centro', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica Santos Dumont', endereco: 'Av. Santos Dumont, 1058 - Aldeota', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Clínica São Gerardo', endereco: 'Av. Bezerra de Menezes, 981 - São Gerardo', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Centro Fortaleza', endereco: 'Avenida Heráclito Graça, 500 - Centro', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Centro Fortaleza II', endereco: 'Avenida Heráclito Graça, 100 - Centro', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Conjunto Ceará', endereco: 'Av. Ministro Albuquerque Lima, 228 - Conjunto Ceará', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Joaquim Távora', endereco: 'Av. Antônio Sales, 60 - Joaquim Távora', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Mário Barreto', endereco: 'Rua São Raimundo, 1781 - Cambeba', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Parangaba', endereco: 'Av. Dr. Silas Munguba, 136 - Parangaba', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnósticos Aldeota', endereco: 'Rua Padre Valdevino, 2640 - Aldeota', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnósticos Heráclito Graça', endereco: 'Avenida Heráclito Graça, 1357 - Centro', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Diagnóstico' },
  { nome: 'Hospital Aldeota', endereco: 'Av. Padre Antônio Tomás, 2056 - Aldeota', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Hospital' },
  { nome: 'Hospital Antônio Prudente', endereco: 'Avenida Aguanambi, 1827 - Bairro de Fátima', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Eugênia Pinheiro', endereco: 'Av. Heráclito Graça, 500 - Centro', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Hospital' },
  { nome: 'Hospital Luís França', endereco: 'Avenida Heráclito Graça, 100 - Centro', cidade: 'Fortaleza - CE', uf: 'CE', tipo: 'Hospital' },
];

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
