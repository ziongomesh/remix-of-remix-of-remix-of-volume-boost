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

  // ─── BAHIA (BA) ─────────────────────────────────────────────────────────────
  { nome: 'Clínica Alagoinhas', endereco: 'Travessa Dr. Dantas Bião, 254-284 - Jardim Petrolar', cidade: 'Alagoinhas - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Diagnóstico Alagoinhas', endereco: 'Tv. Dr. Dantas Bião, 254-284 - Alagoinhas Velha', cidade: 'Alagoinhas - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Cetro', endereco: 'Rua Elvira Dórea, 1 - Centro', cidade: 'Alagoinhas - BA', uf: 'BA', tipo: 'Hospital' },
  { nome: 'Unidade de Autorização Alagoinhas', endereco: 'Travessa Dantas Bião, 254 - Alagoinhas Velha', cidade: 'Alagoinhas - BA', uf: 'BA', tipo: 'Outro' },
  { nome: 'Clínica Camaçari', endereco: 'Av. Dr. Manoel Mercês, S/n - Mangueiral', cidade: 'Camaçari - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Diagnóstico Dois de Maio', endereco: 'Rua Dois de Maio, 7 - Centro', cidade: 'Camaçari - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Hospital Semed', endereco: 'Rua Francisco Drumond, 238 - Centro', cidade: 'Camaçari - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hospital Semed', endereco: 'Rua Francisco Drumond, 238 - Centro', cidade: 'Camaçari - BA', uf: 'BA', tipo: 'Hospital' },
  { nome: 'Unidade de Biometria Camaçari', endereco: 'Av. Dr. Manoel Mercês, S/n - Mangueiral', cidade: 'Camaçari - BA', uf: 'BA', tipo: 'Outro' },
  { nome: 'Clínica Cidade de Candeias', endereco: 'BA 523, 588 - Urbis I', cidade: 'Candeias - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnósticos Centro de Santana', endereco: 'Rua Agripo Ramos, 86 - Centro', cidade: 'Catu - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Centro Cruz das Almas', endereco: 'Avenida Mata Pereira - Térreo, 413 - Centro', cidade: 'Cruz das Almas - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Dias D\'Ávila', endereco: 'Rua da Mangueira, 64 - Centro', cidade: 'Dias D\'Ávila - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Clínica Feira de Santana', endereco: 'Rua Visconde do Rio Branco, 555 - Centro', cidade: 'Feira de Santana - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Hospital Francisca de Sande', endereco: 'Rua Professora Edelvira de Oliveira, 140 - Centro', cidade: 'Feira de Santana - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hospital Francisca de Sande', endereco: 'Rua Professora Edelvira de Oliveira, 140 - Centro', cidade: 'Feira de Santana - BA', uf: 'BA', tipo: 'Hospital' },
  { nome: 'Unidade de Cadastro e Biometria Feira de Santana', endereco: 'Rua Visconde do Rio Branco, 555 - Centro', cidade: 'Feira de Santana - BA', uf: 'BA', tipo: 'Outro' },
  { nome: 'Clínica Lauro de Freitas II', endereco: 'BA 099, 2077 - Centro', cidade: 'Lauro de Freitas - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Hospital Lauro de Freitas', endereco: 'BA 099, 2077 - Centro', cidade: 'Lauro de Freitas - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hospital Lauro de Freitas', endereco: 'BA 099, N 2077 - Centro', cidade: 'Lauro de Freitas - BA', uf: 'BA', tipo: 'Hospital' },
  { nome: 'Unidade de Autorização Lauro de Freitas', endereco: 'Avenida Santos Dumont, 1529 - Centro', cidade: 'Lauro de Freitas - BA', uf: 'BA', tipo: 'Outro' },
  { nome: 'Clínica Amaralina', endereco: 'Rua Fernando de Noronha, 98 - Amaralina', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Clínica Cajazeiras', endereco: 'Shopping Cajazeiras, Piso G2, Entrada Coqueiro Grande, 1361 - Cajazeiras', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Clínica Costa Azul', endereco: 'Rua Adelaide Fernandes da Costa, 903 OT - Costa Azul', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Clínica Dique', endereco: 'Av. Vasco da Gama, 206 - Federação', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Clínica Garibaldi', endereco: 'Avenida Anita Garibaldi, 391 - Ondina', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Clínica Parque Bela Vista', endereco: 'Avenida Santiago de Compostela, 222 - Parque Bela Vista', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Clínica Pituba', endereco: 'Rua Rio de Janeiro, 253 - Pituba', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Clínica Pituba II', endereco: 'Rua Pará, 301 - Pituba', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Clínica Uruguai', endereco: 'Rua do Uruguay, 852 - Uruguai', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Clínica Vasco da Gama', endereco: 'Avenida Vasco da Gama, 309 - Federação', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Cajazeiras', endereco: 'Rua da Paz do Coqueiro Grande, 2023 - Cajazeiras', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Hospital Teresa de Lisieux', endereco: 'Avenida Antônio Carlos Magalhães, 2408 - Itaigara', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Lucaia', endereco: 'Avenida Juracy Magalhães, 1122 - Rio Vermelho', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Uruguai', endereco: 'Rua do Uruguay, 852 - Uruguai', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Vasco da Gama', endereco: 'Av. Vasco da Gama, 309 - Vasco da Gama', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Teresa de Lisieux', endereco: 'Avenida Antônio Carlos Magalhães, 2408 - Itaigara', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Hospital' },
  { nome: 'Laboratório Dique do Tororó', endereco: 'Av. Vasco da Gama, 206 - Federação', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Pronto Atendimento Cajazeiras', endereco: 'Rua da Paz do Coqueiro Grande, 2023 - Cajazeiras', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Outro' },
  { nome: 'Pronto Atendimento Uruguai', endereco: 'Rua do Uruguay, 852 - Uruguai', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Outro' },
  { nome: 'Unidade de Autorização, Cadastro e Biometria Salvador', endereco: 'Rua Frederico Simões, 98 - Caminho das Árvores', cidade: 'Salvador - BA', uf: 'BA', tipo: 'Outro' },
  { nome: 'Diagnóstico Quinta do Inglês', endereco: 'Rua A-2, Ed. Master Térreo - Lot. Quinta do Inglês', cidade: 'Santo Antônio de Jesus - BA', uf: 'BA', tipo: 'Diagnóstico' },
  { nome: 'Clínica e Diagnóstico Simões Filho', endereco: 'Av. Luiz Eduardo Magalhães, 187 - Centro', cidade: 'Simões Filho - BA', uf: 'BA', tipo: 'Clínica' },

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
  { nome: 'Clínica Padre Cícero', endereco: 'Rua Padre Cícero, 3996 - São José', cidade: 'Juazeiro do Norte - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Hospital Geral e Maternidade Padre Cícero', endereco: 'Avenida Padre Cícero, 2481 - Triângulo', cidade: 'Juazeiro do Norte - CE', uf: 'CE', tipo: 'Hospital' },
  { nome: 'Unidade de Autorização e Cadastro Juazeiro', endereco: 'Rua Padre Cícero, 3996 - Centro', cidade: 'Juazeiro do Norte - CE', uf: 'CE', tipo: 'Outro' },
  { nome: 'Unidade de Biometria Juazeiro', endereco: 'Rua Padre Cícero, 529 - Centro', cidade: 'Juazeiro do Norte - CE', uf: 'CE', tipo: 'Outro' },
  { nome: 'Unidade de Biometria Juazeiro II', endereco: 'Rua São José, 836 - Centro', cidade: 'Juazeiro do Norte - CE', uf: 'CE', tipo: 'Outro' },
  { nome: 'Clínica Maracanaú', endereco: 'Avenida Parque Comercial, S/N - Distrito Industrial', cidade: 'Maracanaú - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Ana Lima', endereco: 'Avenida Parque Comercial, S/N - Pajuçara', cidade: 'Maracanaú - CE', uf: 'CE', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Ana Lima', endereco: 'Avenida Parque Comercial, S/N - Pajuçara', cidade: 'Maracanaú - CE', uf: 'CE', tipo: 'Hospital' },
  { nome: 'Unidade de Autorização Maracanaú', endereco: 'Avenida Parque Comercial S/N - Distrito Industrial', cidade: 'Maracanaú - CE', uf: 'CE', tipo: 'Outro' },
  { nome: 'Pronto Atendimento Pacajus', endereco: 'Rua Naide Costa Menezes, 525 - Centro', cidade: 'Pacajus - CE', uf: 'CE', tipo: 'Outro' },
  { nome: 'Clínica Hapvida Pecém', endereco: 'Av. Antônio Brasileiro, 131 - Pecém', cidade: 'São Gonçalo do Amarante - CE', uf: 'CE', tipo: 'Clínica' },
  { nome: 'Pronto Atendimento Pecém', endereco: 'Av. Antônio Brasileiro, 131 - Pecém', cidade: 'São Gonçalo do Amarante - CE', uf: 'CE', tipo: 'Outro' },

  // ─── DISTRITO FEDERAL (DF) ─────────────────────────────────────────────────
  { nome: 'Clínica Asa Sul', endereco: 'ST SHCS CR QD 515 - Bloco B, 14 - Asa Sul', cidade: 'Brasília - DF', uf: 'DF', tipo: 'Clínica' },
  { nome: 'Clínica Gama', endereco: 'Quadra EQ 47-49 Projeção 4, Setor Central - Gama', cidade: 'Brasília - DF', uf: 'DF', tipo: 'Clínica' },
  { nome: 'Clínica Taguatinga Norte', endereco: 'SHN Área Especial 4 – Loja 12 - Taguatinga Norte', cidade: 'Brasília - DF', uf: 'DF', tipo: 'Clínica' },
  { nome: 'Clínica Taguatinga Sul', endereco: 'Quadra 05, Rua 312, Lotes 10 e 12, S/N - Areal (Águas Claras)', cidade: 'Brasília - DF', uf: 'DF', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Gama', endereco: 'Quadra EQ 47-49 Projeção 4, Setor Central - Gama', cidade: 'Brasília - DF', uf: 'DF', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Hospital Brasiliense', endereco: 'SEPS Q 713/913 - Asa Sul', cidade: 'Brasília - DF', uf: 'DF', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Taguatinga Norte', endereco: 'SHN Área Especial 4 – Loja 12 - Taguatinga Norte', cidade: 'Brasília - DF', uf: 'DF', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Brasiliense', endereco: 'SEPS Q 713/913 - Asa Sul', cidade: 'Brasília - DF', uf: 'DF', tipo: 'Hospital' },
  { nome: 'Unidade de Autorização, Biometria e Negociação Taguatinga', endereco: 'Quadra S5, Rua 312 - Taguatinga Sul', cidade: 'Brasília - DF', uf: 'DF', tipo: 'Outro' },
  { nome: 'Unidade de Autorização, Biometria e Negociação Asa Sul', endereco: 'SEPS Q 713/913 - Asa Sul', cidade: 'Brasília - DF', uf: 'DF', tipo: 'Outro' },

  // ─── GOIÁS (GO) ── ANÁPOLIS ────────────────────────────────────────────────
  { nome: 'Clínica Rio João Leite', endereco: 'Avenida Senador José Lourenço Dias, 594 - Centro', cidade: 'Anápolis - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Clínica Setor Central Anápolis', endereco: 'Rua Coronel Batista, 83 - Setor Central', cidade: 'Anápolis - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Anápolis', endereco: 'Rua Coronel Batista, 83B - Setor Central', cidade: 'Anápolis - GO', uf: 'GO', tipo: 'Diagnóstico' },
  { nome: 'Pronto Atendimento Anápolis', endereco: 'Rua Coronel Batista, 29 - Setor Central', cidade: 'Anápolis - GO', uf: 'GO', tipo: 'Outro' },
  { nome: 'Unidade de Autorização Anápolis', endereco: 'Av. Senador Lourenço Dias, 631 - Centro', cidade: 'Anápolis - GO', uf: 'GO', tipo: 'Outro' },

  // ─── GOIÁS (GO) ── APARECIDA DE GOIÂNIA ───────────────────────────────────
  { nome: 'Clínica Mineira de Aparecida', endereco: 'Avenida Mineira, Qd. 07, Lt. 13 - Jardim Nova Era', cidade: 'Aparecida de Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Diagnóstico Vila Aparecida', endereco: 'Avenida Jaguarão, R. L-11, Qd. 23, S/N - Vila Brasília', cidade: 'Aparecida de Goiânia - GO', uf: 'GO', tipo: 'Diagnóstico' },

  // ─── GOIÁS (GO) ── EDEIA ──────────────────────────────────────────────────
  { nome: 'Pronto Atendimento Edeia', endereco: 'Av. Presidente Kennedy, 276, Qd. 06, Lt. 02 - Setor Alegrete', cidade: 'Edeia - GO', uf: 'GO', tipo: 'Outro' },

  // ─── GOIÁS (GO) ── GOIÂNIA ────────────────────────────────────────────────
  { nome: 'Hospital América', endereco: 'Alameda Coronel Joaquim Bastos, 120, Qd. 216, Lt. 6-E - Setor Marista', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Hospital' },
  { nome: 'Hospital Jardim América', endereco: 'Avenida T-63 - Jardim América', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Hospital' },
  { nome: 'Hospital Promed', endereco: 'Rua C-184, 401, Qd. 453, Lt. 01-05 - Jardim América', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Hospital' },
  { nome: 'Clínica Setor dos Funcionários', endereco: 'Rua P-16, 690 - Setor dos Funcionários', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Clínica Areião', endereco: 'Rua 1.138, 312, Qd. 253, Lt. 03 - Setor Marista', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Clínica de Cardiologia Jardim América', endereco: 'Rua C-139, Qd. 321, Lt. 14, Casa 01 - Jardim América', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Clínica Rio Araguaia', endereco: 'Avenida T-1, Qd. 74, Lt. 08 - Setor Bueno', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Clínica Setor Bueno', endereco: 'Avenida T-2, 2787, Qd. 98, Lt. 4 - Setor Bueno', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Clínica Setor Sul', endereco: 'Rua 96, 27, Qd. F-13, Lt. 01 - Setor Sul', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Clínica C-147', endereco: 'Rua C-139, 874, Qd. 321, Lt. 12 - Jardim América', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Clínica Nova Suíça', endereco: 'Rua C-267, S/N, Qd. 603, Lt. 13 - Nova Suíça', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Clínica Avenida 85', endereco: 'Avenida 85, Qd. G-21, 2138 - Setor Marista', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Clínica C-139', endereco: 'C-139, Qd. 322, Lt. 13/15, 820 - Jardim América', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Goiânia', endereco: 'Rua C-149, 1400 - Jardim América', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Diagnóstico' },
  { nome: 'Laboratório Jardim América', endereco: 'Rua C-148, 1289 - Jardim América', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Diagnóstico' },
  { nome: 'Centro de Imagem Jardim América', endereco: 'Rua C-148, esq. T-63, 1280 - Jardim América', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Diagnóstico' },
  { nome: 'Pronto Atendimento Cora Coralina', endereco: 'Avenida Anhanguera, 11231 - Esplanada dos Anicuns', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Outro' },
  { nome: 'Unidade de Autorização Goiânia', endereco: 'Av. T-9, 1910 - Jardim América', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Outro' },
  { nome: 'Unidade de Cadastro Goiânia', endereco: 'Avenida T-63, Qd. 589, Lt. 2, S/N - Nova Suíça', cidade: 'Goiânia - GO', uf: 'GO', tipo: 'Outro' },

  // ─── GOIÁS (GO) ── QUIRINÓPOLIS ───────────────────────────────────────────
  { nome: 'Hospital Quirinópolis', endereco: 'Av. Lázaro Xavier, 21 - Centro', cidade: 'Quirinópolis - GO', uf: 'GO', tipo: 'Hospital' },

  // ─── GOIÁS (GO) ── RIO VERDE ──────────────────────────────────────────────
  { nome: 'Clínica Rio Verde', endereco: 'Rua Rosulino Ferreira Guimarães, 1082, Qd. 0006, Lt. 22 - Centro', cidade: 'Rio Verde - GO', uf: 'GO', tipo: 'Clínica' },
  { nome: 'Pronto Atendimento Rio Verde', endereco: 'Avenida Eurico Veloso do Carmo, 1800 - Setor Central', cidade: 'Rio Verde - GO', uf: 'GO', tipo: 'Outro' },

  // ─── MARANHÃO (MA) ── SÃO LUÍS ───────────────────────────────────────────
  { nome: 'Clínica Holandeses', endereco: 'Avenida dos Holandeses, 6940 - Calhau', cidade: 'São Luís - MA', uf: 'MA', tipo: 'Clínica' },
  { nome: 'Clínica Lia Varella', endereco: 'Av. Senador Vitorino, 1956 - Areinha', cidade: 'São Luís - MA', uf: 'MA', tipo: 'Clínica' },
  { nome: 'Clínica São Luís Centro', endereco: 'Av. Guaxenduba, 260 - Centro', cidade: 'São Luís - MA', uf: 'MA', tipo: 'Clínica' },
  { nome: 'Clínica São Luís Fátima', endereco: 'Rua Armando Vieira da Silva, S/N - Bairro de Fátima', cidade: 'São Luís - MA', uf: 'MA', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Guarás', endereco: 'Rua Armando Vieira da Silva, S/N - Bairro de Fátima', cidade: 'São Luís - MA', uf: 'MA', tipo: 'Hospital' },
  { nome: 'Laboratório Cohab', endereco: 'Avenida Jerônimo Albuquerque, 619 - Cohab', cidade: 'São Luís - MA', uf: 'MA', tipo: 'Diagnóstico' },
  { nome: 'Laboratório Lia Varella', endereco: 'Av. Senador Vitorino, 1956 - Areinha', cidade: 'São Luís - MA', uf: 'MA', tipo: 'Diagnóstico' },
  { nome: 'Unidade de Autorização Cohab', endereco: 'Avenida Jerônimo de Albuquerque, 619 - Cohab', cidade: 'São Luís - MA', uf: 'MA', tipo: 'Outro' },
  { nome: 'Unidade de Autorização e Biometria São Luís', endereco: 'Avenida Kennedy, 1620 - Fátima', cidade: 'São Luís - MA', uf: 'MA', tipo: 'Outro' },
  { nome: 'Unidade de Cadastro São Luís', endereco: 'Av. Guaxenduba, 260 - Centro', cidade: 'São Luís - MA', uf: 'MA', tipo: 'Outro' },

  // ─── MINAS GERAIS (MG) ── ALFENAS ─────────────────────────────────────────
  { nome: 'Diagnóstico Hospital Imesa', endereco: 'Rua Adolfo Engel, 19 - Jardim Tropical', cidade: 'Alfenas - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Imesa', endereco: 'Rua Adolfo Engel, 19 - Jardim Tropical', cidade: 'Alfenas - MG', uf: 'MG', tipo: 'Hospital' },

  // ─── MINAS GERAIS (MG) ── BELO HORIZONTE ──────────────────────────────────
  { nome: 'Ambulatório do Hospital Octaviano Neves', endereco: 'Rua Domingos Vieira, 561 - Santa Efigênia', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Clínica' },
  { nome: 'Clínica e Diagnóstico Barreiro', endereco: 'Av. Sinfrônio Brochado, 587 - Barreiro', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Clínica' },
  { nome: 'Clínica e Diagnóstico Minerva', endereco: 'Rua dos Aimorés, 3000 - Barro Preto', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Clínica' },
  { nome: 'Clínica Mais Saúde Santa Efigênia', endereco: 'Avenida do Contorno, 2001 - Santa Efigênia', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Clínica' },
  { nome: 'Venda Nova', endereco: 'Rua Dr. Álvaro Camargos, 2002 - São João Batista', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Clínica' },
  { nome: 'Diagnóstico Barreiro', endereco: 'Av. Sinfrônio Brochado, 587 - Barreiro', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Diagnóstico Hospital Octaviano Neves', endereco: 'Rua Ceará, 186 - Santa Efigênia', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Diagnóstico Hospital Vera Cruz', endereco: 'Rua Paracatu, 724 - Santo Agostinho', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Diagnóstico Minerva', endereco: 'Rua dos Aimorés, 3000 - Barro Preto', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Diagnóstico Pronto Atendimento Contorno', endereco: 'Avenida do Contorno, 2001', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Diagnóstico Raja Gabaglia', endereco: 'Avenida Raja Gabaglia, 4091 - Santa Lúcia', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Diagnóstico Timbiras', endereco: 'Rua dos Timbiras, 3210 - Barro Preto', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Diagnóstico Venda Nova', endereco: 'Rua Dr. Álvaro Camargos, 2002 - São João Batista', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Octaviano Neves', endereco: 'Rua Ceará, 186 - Santa Efigênia', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Hospital' },
  { nome: 'Hospital Lifecenter BH', endereco: 'Av. do Contorno, 4747 - Funcionários', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Hospital' },
  { nome: 'Hospital Vera Cruz', endereco: 'Av. Barbacena, 653 - Barro Preto', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Hospital' },
  { nome: 'Pronto Atendimento Hospital Vera Cruz', endereco: 'Rua Paracatu, 724 - Santo Agostinho', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Outro' },
  { nome: 'Pronto Atendimento Santa Efigênia', endereco: 'Avenida do Contorno, 2001 - Santa Efigênia', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Outro' },
  { nome: 'Unidade de Autorização e Biometria BH', endereco: 'Rua Timbiras, 3156, Térreo - Barro Preto', cidade: 'Belo Horizonte - MG', uf: 'MG', tipo: 'Outro' },

  // ─── MINAS GERAIS (MG) ── BETIM ───────────────────────────────────────────
  { nome: 'Unidade Avançada Betim', endereco: 'Av. Edméia Matos Lazzarotti, 2192 - Jardim da Cidade', cidade: 'Betim - MG', uf: 'MG', tipo: 'Clínica' },
  { nome: 'Unidade de Autorização e Biometria Betim', endereco: 'Avenida Edméia Matos Lazzarotti, 2192 - Jardim da Cidade', cidade: 'Betim - MG', uf: 'MG', tipo: 'Outro' },

  // ─── MINAS GERAIS (MG) ── CONTAGEM ────────────────────────────────────────
  { nome: 'Centro Médico Proclin Eldorado', endereco: 'Av. João Cesar de Oliveira, 1009 - Eldorado', cidade: 'Contagem - MG', uf: 'MG', tipo: 'Clínica' },
  { nome: 'Diagnóstico Lifecenter Contagem', endereco: 'Rua das Mangueiras, 99 - Eldorado', cidade: 'Contagem - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Hospital Lifecenter Contagem', endereco: 'Rua das Mangueiras, 99 - Eldorado', cidade: 'Contagem - MG', uf: 'MG', tipo: 'Hospital' },

  // ─── MINAS GERAIS (MG) ── DIVINÓPOLIS ─────────────────────────────────────
  { nome: 'Hospital e Maternidade Santa Mônica', endereco: 'Rua Pedro Ferreira do Amaral, 33 - Padre Libério', cidade: 'Divinópolis - MG', uf: 'MG', tipo: 'Hospital' },
  { nome: 'Bioimagem Hospital Santa Mônica', endereco: 'Rua Pedro F. Amaral, 33 - Padre Libério', cidade: 'Divinópolis - MG', uf: 'MG', tipo: 'Diagnóstico' },

  // ─── MINAS GERAIS (MG) ── ITUIUTABA ───────────────────────────────────────
  { nome: 'Clínica Ituiutaba', endereco: 'Rua Vinte e Seis, 1547 - Centro', cidade: 'Ituiutaba - MG', uf: 'MG', tipo: 'Clínica' },

  // ─── MINAS GERAIS (MG) ── NOVA PONTE ──────────────────────────────────────
  { nome: 'Clínica Nova Ponte', endereco: 'Rua Olindino Soares, 913 - Centro', cidade: 'Nova Ponte - MG', uf: 'MG', tipo: 'Clínica' },

  // ─── MINAS GERAIS (MG) ── POÇOS DE CALDAS ────────────────────────────────
  { nome: 'Diagnóstico Hospital Poços de Caldas', endereco: 'Rua Frei Cristóvão Figueiredo, 125 - Jardim Esmeralda', cidade: 'Poços de Caldas - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Poços de Caldas', endereco: 'Rua Frei Cristóvão Figueiredo, 125 - Jardim Esmeralda', cidade: 'Poços de Caldas - MG', uf: 'MG', tipo: 'Hospital' },
  { nome: 'Unidade de Atendimento Poços de Caldas', endereco: 'Rua Frei Cristóvão Figueiredo, 125, 2° andar - Jardim Esmeralda', cidade: 'Poços de Caldas - MG', uf: 'MG', tipo: 'Outro' },

  // ─── MINAS GERAIS (MG) ── UBERABA ─────────────────────────────────────────
  { nome: 'Clínica Uberaba', endereco: 'Avenida Santa Beatriz da Silva, 1880 - Santa Maria', cidade: 'Uberaba - MG', uf: 'MG', tipo: 'Clínica' },
  { nome: 'Coleta Uberaba', endereco: 'Rua Ituiutaba, 577 - São Benedito', cidade: 'Uberaba - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Diagnóstico Santa Maria', endereco: 'Avenida Santos Dumont, 2140 - Santa Maria', cidade: 'Uberaba - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Diagnóstico Uberaba', endereco: 'Avenida Santa Beatriz da Silva, 1861 - São Benedito', cidade: 'Uberaba - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Pronto Atendimento Santa Maria', endereco: 'Avenida Santos Dumont, 2140 - Santa Maria', cidade: 'Uberaba - MG', uf: 'MG', tipo: 'Outro' },
  { nome: 'Unidade de Autorização e Biometria Uberaba', endereco: 'Avenida Santa Beatriz, 1910 - Santa Maria', cidade: 'Uberaba - MG', uf: 'MG', tipo: 'Outro' },

  // ─── MINAS GERAIS (MG) ── UBERLÂNDIA ──────────────────────────────────────
  { nome: 'Clínica Marechal Deodoro', endereco: 'Rua Marechal Deodoro, 11 - General Osório', cidade: 'Uberlândia - MG', uf: 'MG', tipo: 'Clínica' },
  { nome: 'Clínica Uberlândia', endereco: 'Rua Virgílio Melo Franco, 465 - Maracanã', cidade: 'Uberlândia - MG', uf: 'MG', tipo: 'Clínica' },
  { nome: 'Coleta Uberlândia', endereco: 'Rua Virgílio Melo Franco, 465 - Maracanã', cidade: 'Uberlândia - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Diagnóstico Hospital Madrecor', endereco: 'Avenida Francisco Ribeiro, 1111 - Santa Mônica', cidade: 'Uberlândia - MG', uf: 'MG', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Madrecor', endereco: 'Avenida Francisco Ribeiro, 1111 - Santa Mônica', cidade: 'Uberlândia - MG', uf: 'MG', tipo: 'Hospital' },
  { nome: 'Unidade de Autorização e Biometria Uberlândia', endereco: 'Rua Marechal Deodoro, 11 - Centro', cidade: 'Uberlândia - MG', uf: 'MG', tipo: 'Outro' },

  // ─── MINAS GERAIS (MG) ── VARGINHA ────────────────────────────────────────
  { nome: 'Hospital e Maternidade Varginha', endereco: 'Av. Antonieta Ésper Kalas - Parque Mariela', cidade: 'Varginha - MG', uf: 'MG', tipo: 'Hospital' },

  // ─── MATO GROSSO DO SUL (MS) ── CAMPO GRANDE ─────────────────────────────
  { nome: 'Clínica Jardim dos Estados', endereco: 'Rua Antônio Maria Coelho, 2926 - Jardim dos Estados', cidade: 'Campo Grande - MS', uf: 'MS', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Carandá Bosque', endereco: 'Av. Mato Grosso, 5151, 1º andar - Carandá Bosque', cidade: 'Campo Grande - MS', uf: 'MS', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Dom Aquino', endereco: 'Rua Dom Aquino, 1682 - Amambai', cidade: 'Campo Grande - MS', uf: 'MS', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Campo Grande', endereco: 'Rua Dom Aquino, 2274 - Centro', cidade: 'Campo Grande - MS', uf: 'MS', tipo: 'Diagnóstico' },
  { nome: 'Unidade de Biometria Jardim dos Estados', endereco: 'Rua Antônio Maria Coelho, 2926 - Jardim dos Estados', cidade: 'Campo Grande - MS', uf: 'MS', tipo: 'Outro' },

  // ─── MATO GROSSO DO SUL (MS) ── CHAPADÃO DO SUL ──────────────────────────
  { nome: 'Unidade de Autorização Chapadão do Sul', endereco: 'Av. 4, 541, Sala 04 - Centro', cidade: 'Chapadão do Sul - MS', uf: 'MS', tipo: 'Outro' },

  // ─── MATO GROSSO DO SUL (MS) ── DEODÁPOLIS ───────────────────────────────
  { nome: 'Unidade de Autorização Deodápolis', endereco: 'Av. Francisco Alves da Silva, 611 - Centro', cidade: 'Deodápolis - MS', uf: 'MS', tipo: 'Outro' },

  // ─── MATO GROSSO DO SUL (MS) ── DOURADOS ─────────────────────────────────
  { nome: 'Pronto Atendimento Dourados', endereco: 'Rua Ciro Melo, 1470 - Jardim Central', cidade: 'Dourados - MS', uf: 'MS', tipo: 'Outro' },
  { nome: 'Pronto Atendimento Dourados II', endereco: 'Avenida Presidente Vargas, 2145 - Cohafaba III Plano', cidade: 'Dourados - MS', uf: 'MS', tipo: 'Outro' },
  { nome: 'Unidade de Biometria Dourados', endereco: 'Rua Ciro Mello, 1470 - Jardim Central', cidade: 'Dourados - MS', uf: 'MS', tipo: 'Outro' },

  // ─── MATO GROSSO DO SUL (MS) ── INOCÊNCIA ────────────────────────────────
  { nome: 'Unidade de Biometria Inocência', endereco: 'Rua João Batista Parreira, 539 - Centro', cidade: 'Inocência - MS', uf: 'MS', tipo: 'Outro' },

  // ─── MATO GROSSO DO SUL (MS) ── IVINHEMA ─────────────────────────────────
  { nome: 'Pronto Atendimento Ivinhema', endereco: 'Av. Brasil, 647 - Centro', cidade: 'Ivinhema - MS', uf: 'MS', tipo: 'Outro' },
  { nome: 'Unidade de Biometria Ivinhema', endereco: 'Av. Brasil, 647 - Centro', cidade: 'Ivinhema - MS', uf: 'MS', tipo: 'Outro' },

  // ─── MATO GROSSO DO SUL (MS) ── SONORA ───────────────────────────────────
  { nome: 'Unidade de Biometria Sonora', endereco: 'Rua da Justiça, 103 - Centro', cidade: 'Sonora - MS', uf: 'MS', tipo: 'Outro' },

  // ─── MATO GROSSO DO SUL (MS) ── TRÊS LAGOAS ──────────────────────────────
  { nome: 'Clínica Guarani', endereco: 'Av. Cap. Olinto Mancini, 2560 - Centro', cidade: 'Três Lagoas - MS', uf: 'MS', tipo: 'Clínica' },
  { nome: 'Unidade de Autorização e Biometria Três Lagoas', endereco: 'Av. Capitão Olinto Mancini, 2560 - Centro', cidade: 'Três Lagoas - MS', uf: 'MS', tipo: 'Outro' },

  // ─── MATO GROSSO (MT) ── CUIABÁ ──────────────────────────────────────────
  { nome: 'Unidade de Autorização Bosque da Saúde', endereco: 'Av. Historiador Rubens de Mendonça, 1856 - Bosque da Saúde', cidade: 'Cuiabá - MT', uf: 'MT', tipo: 'Outro' },

  // ─── MATO GROSSO (MT) ── RONDONÓPOLIS ─────────────────────────────────────
  { nome: 'Diagnóstico Jardim Guanabara', endereco: 'Rua Fernando Corrêa da Costa, 2256 - Jardim Guanabara', cidade: 'Rondonópolis - MT', uf: 'MT', tipo: 'Diagnóstico' },
  { nome: 'Pronto Atendimento Rondonópolis', endereco: 'Rua Agostinho de Figueiredo, 60 - Jardim Guanabara', cidade: 'Rondonópolis - MT', uf: 'MT', tipo: 'Outro' },
  { nome: 'Unidade de Autorização e Biometria Vila Marinópolis', endereco: 'Rua Fernando Correa da Costa, 1538 - Vila Marinópolis', cidade: 'Rondonópolis - MT', uf: 'MT', tipo: 'Outro' },

  // ─── PARÁ (PA) ── BELÉM ───────────────────────────────────────────────────
  { nome: 'Central de Atendimento Belém', endereco: 'Tv. Mauriti, 2736 - Marco', cidade: 'Belém - PA', uf: 'PA', tipo: 'Outro' },
  { nome: 'Clínica Augusto Montenegro', endereco: 'Rodovia Augusto Montenegro Km5, 55 - Parque Verde', cidade: 'Belém - PA', uf: 'PA', tipo: 'Clínica' },
  { nome: 'Clínica Batista Campos', endereco: 'Travessa Padre Eutíquio, 1983', cidade: 'Belém - PA', uf: 'PA', tipo: 'Clínica' },
  { nome: 'Clínica Conselheiro', endereco: 'Avenida Conselheiro Furtado, 1885 - Cremação', cidade: 'Belém - PA', uf: 'PA', tipo: 'Clínica' },
  { nome: 'Clínica Lomas Valentinas', endereco: 'Travessa Lomás Valentina, 1140', cidade: 'Belém - PA', uf: 'PA', tipo: 'Clínica' },
  { nome: 'Clínica Marco', endereco: 'Avenida Rômulo Maiorana, 1662 - Marco', cidade: 'Belém - PA', uf: 'PA', tipo: 'Clínica' },
  { nome: 'Clínica Mundurucus', endereco: 'Rua dos Mundurucus, 2313 - Batista Campos', cidade: 'Belém - PA', uf: 'PA', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Hospital RioMar', endereco: 'Travessa Antônio Baena, 527 - Marco', cidade: 'Belém - PA', uf: 'PA', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Lomas', endereco: 'Tv. Lomas Valentina, 1186', cidade: 'Belém - PA', uf: 'PA', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnóstico Nazaré', endereco: 'Av. Alcindo Cacela, 1581 - Nazaré', cidade: 'Belém - PA', uf: 'PA', tipo: 'Diagnóstico' },
  { nome: 'Hospital e Maternidade Rio Mar', endereco: 'Travessa Antônio Baena, 527 - Marco', cidade: 'Belém - PA', uf: 'PA', tipo: 'Hospital' },
  { nome: 'Hospital Layr Maia', endereco: 'Av. Alcindo Cacela, 1581 - Nazaré', cidade: 'Belém - PA', uf: 'PA', tipo: 'Hospital' },
  { nome: 'Laboratório Batista Campos', endereco: 'Tv. Padre Eutíquio, 1983', cidade: 'Belém - PA', uf: 'PA', tipo: 'Diagnóstico' },
  { nome: 'Pronto Atendimento Ananindeua', endereco: 'BR 316 - Km 2, 90 - Guanabara', cidade: 'Belém - PA', uf: 'PA', tipo: 'Outro' },
  { nome: 'Unidade de Autorização e Cadastro Pedreira', endereco: 'Travessa Lomas Valentina, 1176 - Pedreira', cidade: 'Belém - PA', uf: 'PA', tipo: 'Outro' },
  { nome: 'Unidade de Biometria Pedreira', endereco: 'Travessa Lomas Valentina, 1140 - Pedreira', cidade: 'Belém - PA', uf: 'PA', tipo: 'Outro' },

  // ─── PARÁ (PA) ── PARAUAPEBAS ─────────────────────────────────────────────
  { nome: 'Clínica Rio Azul', endereco: 'Rua H, 248 - União', cidade: 'Parauapebas - PA', uf: 'PA', tipo: 'Clínica' },
  { nome: 'Hospital das Clínicas e Maternidade de Parauapebas', endereco: 'Rua H, 248 - União', cidade: 'Parauapebas - PA', uf: 'PA', tipo: 'Hospital' },

  // ─── PARAÍBA (PB) ── CAMPINA GRANDE ───────────────────────────────────────
  { nome: 'Clínica Campinense', endereco: 'Rua Doutor Severino Ribeiro Cruz, 277 - Centro', cidade: 'Campina Grande - PB', uf: 'PB', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnósticos Centro', endereco: 'Rua Doutor Severino Ribeiro Cruz, 277 - Centro', cidade: 'Campina Grande - PB', uf: 'PB', tipo: 'Diagnóstico' },
  { nome: 'Pronto Atendimento Campinense', endereco: 'Rua Severino Ribeiro Cruz, 265 - Centro', cidade: 'Campina Grande - PB', uf: 'PB', tipo: 'Outro' },
  { nome: 'Pronto Atendimento Centro Campina Grande', endereco: 'Rua Doutor Severino Ribeiro Cruz, 277 - Centro', cidade: 'Campina Grande - PB', uf: 'PB', tipo: 'Outro' },
  { nome: 'Unidade de Biometria e Autorização Campina Grande', endereco: 'Rua Severino Cruz, 277 - Centro', cidade: 'Campina Grande - PB', uf: 'PB', tipo: 'Outro' },
  { nome: 'Unidade de Cadastro Campina Grande', endereco: 'Rua Doutor Severino Cruz, 265 - Centro', cidade: 'Campina Grande - PB', uf: 'PB', tipo: 'Outro' },

  // ─── PARAÍBA (PB) ── JOÃO PESSOA ──────────────────────────────────────────
  { nome: 'Centro Diagnóstico por Imagem João Pessoa', endereco: 'Av. Júlia Freire, 1058 - Expedicionários', cidade: 'João Pessoa - PB', uf: 'PB', tipo: 'Diagnóstico' },
  { nome: 'Clínica Ariano Suassuna', endereco: 'Av. Presidente Epitácio Pessoa, 3160 - Tambauzinho', cidade: 'João Pessoa - PB', uf: 'PB', tipo: 'Clínica' },
  { nome: 'Clínica João Pessoa', endereco: 'Rua Treze de Maio, 73 - Centro', cidade: 'João Pessoa - PB', uf: 'PB', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade da Paraíba', endereco: 'Av. Júlia Freire, 1058 - Expedicionários', cidade: 'João Pessoa - PB', uf: 'PB', tipo: 'Hospital' },
  { nome: 'Laboratório Expedicionários', endereco: 'Avenida Júlia Freire, 1058 - Expedicionários', cidade: 'João Pessoa - PB', uf: 'PB', tipo: 'Diagnóstico' },
  { nome: 'Unidade de Autorização, Cadastro e Biometria Expedicionários', endereco: 'Avenida Júlia Freire, 1058 - Expedicionários', cidade: 'João Pessoa - PB', uf: 'PB', tipo: 'Outro' },

  // ─── PERNAMBUCO (PE) ── CABO DE SANTO AGOSTINHO ───────────────────────────
  { nome: 'Clínica Cabo', endereco: 'Av. Pres. Vargas, 428 - Centro', cidade: 'Cabo de Santo Agostinho - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Hapvida Diagnóstico Centro Cabo', endereco: 'Av. Presidente Vargas, 428 - Centro', cidade: 'Cabo de Santo Agostinho - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Hospital do Cabo', endereco: 'Av. Pres. Vargas, 428 - Centro', cidade: 'Cabo de Santo Agostinho - PE', uf: 'PE', tipo: 'Hospital' },
  { nome: 'Laboratório Centro Cabo', endereco: 'Av. Presidente Vargas, 428 - Centro', cidade: 'Cabo de Santo Agostinho - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Pronto Atendimento Cabo', endereco: 'Av. Pres. Vargas, 428 - Centro', cidade: 'Cabo de Santo Agostinho - PE', uf: 'PE', tipo: 'Outro' },
  { nome: 'Unidade de Biometria Cabo', endereco: 'Avenida Presidente Vargas, 428', cidade: 'Cabo de Santo Agostinho - PE', uf: 'PE', tipo: 'Outro' },

  // ─── PERNAMBUCO (PE) ── GOIANA ────────────────────────────────────────────
  { nome: 'Pronto Atendimento Goiana', endereco: 'Av. Marechal Deodoro da Fonseca, 234 - Centro', cidade: 'Goiana - PE', uf: 'PE', tipo: 'Outro' },

  // ─── PERNAMBUCO (PE) ── JABOATÃO DOS GUARARAPES ───────────────────────────
  { nome: 'Clínica Piedade', endereco: 'Av. Bernardo Vieira de Melo, 788 - Piedade', cidade: 'Jaboatão dos Guararapes - PE', uf: 'PE', tipo: 'Clínica' },

  // ─── PERNAMBUCO (PE) ── OLINDA ────────────────────────────────────────────
  { nome: 'Clínica Duarte Coelho', endereco: 'Av. Pres. Getúlio Vargas, 1351 - Bairro Novo', cidade: 'Olinda - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Olinda', endereco: 'Av. Getúlio Vargas, 514 - Bairro Novo', cidade: 'Olinda - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Unidade de Fisioterapia Olinda', endereco: 'Av. Getúlio Vargas, 481 - Bairro Novo', cidade: 'Olinda - PE', uf: 'PE', tipo: 'Outro' },

  // ─── PERNAMBUCO (PE) ── PAULISTA ──────────────────────────────────────────
  { nome: 'Hapvida Diagnóstico Paulista', endereco: 'Rua Epitácio Pessoa, 231 - Centro', cidade: 'Paulista - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Pronto Atendimento Paulista', endereco: 'Rua Milton de Souza Lopes, 84 - Centro', cidade: 'Paulista - PE', uf: 'PE', tipo: 'Outro' },

  // ─── PERNAMBUCO (PE) ── RECIFE ────────────────────────────────────────────
  { nome: 'Clínica Barão de Itamaracá', endereco: 'Rua Barão de Itamaracá, 142 - Espinheiro', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Centro de Diagnóstico por Imagem Boa Vista', endereco: 'Rua Edson Álvares, 370 - Casa Forte', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Clínica Boa Viagem', endereco: 'Rua Dálhia, 95 - Setúbal', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Boa Vista', endereco: 'Avenida Manoel Borba, 737 - Boa Vista', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Casa Forte', endereco: 'Rua Edson Álvares, 370 - Casa Forte', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Conselheiro Aguiar', endereco: 'Av. Conselheiro Aguiar, 3763 - Boa Viagem', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Epaminondas', endereco: 'Rua Epaminondas de Melo, 177 - Derby', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Espinheiro', endereco: 'R. Dr. José Luiz da Silveira Barros, 122 - Espinheiro', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Graças', endereco: 'Rua da Hora, 543 - Espinheiro', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Mário Domingues', endereco: 'R. Mário Domingues, 152 - Boa Vista', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Pedro da Hora', endereco: 'Rua da Hora, 366 - Espinheiro', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Recife', endereco: 'Rua do Espinheiro, 119 - Espinheiro', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Clínica Zona Sul', endereco: 'Rua João Cardoso Aires, 647 - Setúbal', cidade: 'Recife - PE', uf: 'PE', tipo: 'Clínica' },
  { nome: 'Fisioterapia Parque Amorim', endereco: 'Rua Fernandes Vieira, 675 - Boa Vista', cidade: 'Recife - PE', uf: 'PE', tipo: 'Outro' },
  { nome: 'Hapvida Diagnóstico Zona Sul', endereco: 'Rua João Cardoso Aires, 647 - Setúbal', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnósticos Casa Forte', endereco: 'Rua Edson Álvares, 370 - Casa Forte', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Hapvida Diagnósticos Iputinga', endereco: 'Av. Prof. Moraes Rego, 314 - Iputinga', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Hospital Ariano Suassuna', endereco: 'Av. Gov. Agamenon Magalhães, 4623 - Ilha do Leite', cidade: 'Recife - PE', uf: 'PE', tipo: 'Hospital' },
  { nome: 'Hospital Capibaribe', endereco: 'Rua Paissandu, 767 - Boa Vista', cidade: 'Recife - PE', uf: 'PE', tipo: 'Hospital' },
  { nome: 'Hospital Casa Forte', endereco: 'Rua Edson Álvares, 370 - Casa Forte', cidade: 'Recife - PE', uf: 'PE', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Vasco Lucena', endereco: 'Rua do Progresso, 47 - Boa Vista', cidade: 'Recife - PE', uf: 'PE', tipo: 'Hospital' },
  { nome: 'Hospital Ilha do Leite', endereco: 'Rua Dr. João Asfora, 35 - Ilha do Leite', cidade: 'Recife - PE', uf: 'PE', tipo: 'Hospital' },
  { nome: 'Hospital Mandacaru', endereco: 'Avenida Gov. Agamenon Magalhães, 3621 - Torreão', cidade: 'Recife - PE', uf: 'PE', tipo: 'Hospital' },
  { nome: 'Laboratório Agamenon Magalhães', endereco: 'Av. Agamenon Magalhães, 107 - Boa Vista', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Laboratório Boa Vista', endereco: 'Rua Paissandu, 767 - Boa Vista', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Laboratório Caxangá', endereco: 'Av. Prof. Moraes Rego, 314 - Iputinga', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Laboratório Centro Recife', endereco: 'Rua Milton de Souza Lopes, 84 - Centro', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Laboratório Ilha do Leite', endereco: 'Rua Dr. João Asfora, 65 - Ilha do Leite', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Laboratório Paissandú', endereco: 'Rua do Paissandú, 738 - Boa Vista', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Laboratório Parque Amorim', endereco: 'Rua Fernandes Vieira, 699 - Boa Vista', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
  { nome: 'Laboratório Zona Sul', endereco: 'Rua João Cardoso Aires, 647 - Boa Viagem', cidade: 'Recife - PE', uf: 'PE', tipo: 'Diagnóstico' },
];

// Agrupa por estado
export const UF_LABELS: Record<string, string> = {
  AL: 'Alagoas', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
  GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul', MT: 'Mato Grosso', PA: 'Pará',
  PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná',
  RN: 'Rio Grande do Norte', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
};

export function getUnidadesPorUF(uf: string): HapvidaUnidade[] {
  return HAPVIDA_UNIDADES.filter(u => u.uf === uf);
}

export const UFS_DISPONIVEIS = [...new Set(HAPVIDA_UNIDADES.map(u => u.uf))].sort();
