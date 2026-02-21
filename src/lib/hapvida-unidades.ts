export interface HapvidaUnidade {
  nome: string;
  endereco: string;
  cidade: string;
  uf: string;
  telefone?: string;
  tipo: 'Hospital' | 'Clínica' | 'Diagnóstico' | 'Outro';
}

export const HAPVIDA_UNIDADES: HapvidaUnidade[] = [
  // ─── ALAGOAS (AL) ───────────────────────────────────────────────────────────
  { nome: 'Clínica Fernandes Lima', endereco: 'Avenida Fernandes Lima, 139 - Farol', cidade: 'Maceió - AL', uf: 'AL', tipo: 'Clínica' },
  { nome: 'Clínica Oldemburgo Paranhos', endereco: 'Rua Oldemburgo da Silva Paranhos, 55 - Farol', cidade: 'Maceió - AL', uf: 'AL', tipo: 'Clínica' },
  { nome: 'Diagnóstico Hospital Maceió', endereco: 'Avenida Presidente Getúlio Vargas, 300 - Serraria', cidade: 'Maceió - AL', uf: 'AL', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Maceió', endereco: 'Rua Oldemburgo da Silva Paranhos, 55 - Farol', cidade: 'Maceió - AL', uf: 'AL', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Maceió', endereco: 'Avenida Presidente Getúlio Vargas, 300 - Serraria', cidade: 'Maceió - AL', uf: 'AL', tipo: 'Hospital' },
  { nome: 'Unidade de Autorização, Cadastro e Biometria Maceió', endereco: 'R. Comendador Palmeira, 623 - Farol', cidade: 'Maceió - AL', uf: 'AL', tipo: 'Outro' },

  // ─── AMAZONAS (AM) ──────────────────────────────────────────────────────────
  { nome: 'Clínica Duque de Caxias', endereco: 'Rua Duque de Caxias, 1905 - Praça 14 de Janeiro', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Clínica' },
  { nome: 'Clínica Flores', endereco: 'Avenida Torquato Tapajós, 5320 - Flores', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Clínica' },
  { nome: 'Clínica Parque Dez', endereco: 'Avenida Tancredo Neves, 1324 - Parque 10 de Novembro', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Clínica' },
  { nome: 'Clínica Silves', endereco: 'Avenida Silves, 1658 - Crespo', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Clínica' },
  { nome: 'Clínica Vieiralves', endereco: 'Av. João Valério, 123 - São Geraldo', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Clínica' },
  { nome: 'Clínica Zona Leste', endereco: 'Rua Autaz Mirim, 7602 - Tancredo Neves', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Adrianópolis', endereco: 'Rua Teresina, 296 - Adrianópolis', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Aparecida', endereco: 'Rua Alexandre Amorin, 470 - Aparecida', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Centro', endereco: 'Rua dos Tapajós, 561 - Centro', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnósticos Rio Negro', endereco: 'Rua dos Tapajós, 561 - Centro', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnósticos Zona Leste', endereco: 'Avenida Altaz Mirim, 7602 - Tancredo Neves', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Rio Amazonas', endereco: 'Rua Belém, 801 - São Francisco', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Hospital' },
  { nome: 'Hospital Nilton Lins', endereco: 'Av. Prof. Nilton Lins, 3259 - Flores', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Hospital' },
  { nome: 'Hospital Pediátrico Rio Solimões', endereco: 'Av. Álvaro Maia, 1131 - Presidente Vargas', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Hospital' },
  { nome: 'Hospital Rio Negro', endereco: 'Rua dos Tapajós, 561 - Centro', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Hospital' },
  { nome: 'Hospital São Lucas', endereco: 'Rua Alexandre Amorim, 470 - Aparecida', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Hospital' },
  { nome: 'Pronto Atendimento Cidade Nova', endereco: 'Av. Camapuã, 695 - Cidade Nova', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Outro' },
  { nome: 'Pronto Atendimento Distrito', endereco: 'Avenida Buriti, 3727 - Distrito Industrial I', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Outro' },
  { nome: 'Qualivida Cachoeirinha', endereco: 'Avenida Tefé, 625 - Cachoeirinha', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Outro' },
  { nome: 'Qualivida Manaus', endereco: 'Av. João Valério, 123 - São Geraldo', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Outro' },
  { nome: 'Unidade de Autorização Manaus', endereco: 'Rua João Valério, 85 - São Geraldo', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Outro' },
  { nome: 'Unidade de Autorização, Cadastro e Biometria Manaus', endereco: 'Av. João Valério, 606 - São Geraldo', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Outro' },
  { nome: 'Unidade de Biometria e Autorização', endereco: 'Avenida Duque de Caxias, 1905 - Praça 14 de Janeiro', cidade: 'Manaus - AM', uf: 'AM', tipo: 'Outro' },

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
