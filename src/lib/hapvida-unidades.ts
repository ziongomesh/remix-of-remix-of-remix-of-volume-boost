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
  { nome: 'Clínica Fernandes Lima', endereco: 'Av. Fernandes Lima, 139 - Farol', cidade: 'Maceió - AL, CEP 57055-000', uf: 'AL', telefone: '(82) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Oldemburgo Paranhos', endereco: 'R. Oldemburgo da Silva Paranhos, 55 - Farol', cidade: 'Maceió - AL', uf: 'AL', telefone: '(82) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Maceió', endereco: 'Av. Presidente Getúlio Vargas, 300 - Serraria', cidade: 'Maceió - AL', uf: 'AL', telefone: '(82) 4002-3633', tipo: 'Hospital' },

  // ─── AMAZONAS (AM) ──────────────────────────────────────────────────────────
  { nome: 'Clínica Duque de Caxias', endereco: 'R. Duque de Caxias, 1905 - Praça 14 de Janeiro', cidade: 'Manaus - AM', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Flores', endereco: 'Av. Torquato Tapajós, 5320 - Flores', cidade: 'Manaus - AM', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Parque Dez', endereco: 'Av. Tancredo Neves, 1324 - Parque 10 de Novembro', cidade: 'Manaus - AM', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Silves', endereco: 'Av. Silves, 1658 - Crespo', cidade: 'Manaus - AM', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Vieiralves', endereco: 'Av. João Valério, 123 - São Geraldo', cidade: 'Manaus - AM', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Zona Leste', endereco: 'R. Autaz Mirim, 7602 - Tancredo Neves', cidade: 'Manaus - AM', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital Rio Negro', endereco: 'R. TAPAJOS, 561 - CENTRO', cidade: 'MANAUUS- AM, CEP 69010-150 telefone (92) 4002-3633', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Francisca Mendes', endereco: 'R. Codajás, 23 - Cachoeirinha', cidade: 'Manaus - AM', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade São Camilo', endereco: 'Av. Rodrigo Otávio, 3240 - Coroado', cidade: 'Manaus - AM', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital Samel', endereco: 'Av. Mário Ypiranga Monteiro, 1595 - Parque 10 de Novembro', cidade: 'Manaus - AM', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Hospital' },
  { nome: 'UPA Hapvida Norte', endereco: 'Av. Torquato Tapajós, 5320 - Flores', cidade: 'Manaus - AM', uf: 'AM', telefone: '(92) 4002-3633', tipo: 'Outro' },

  // ─── BAHIA (BA) ─────────────────────────────────────────────────────────────
  { nome: 'Clínica Camaçari', endereco: 'Av. Dr. Euvaldo Luz, 200 - Vila Madre Deus', cidade: 'Camaçari - BA', uf: 'BA', telefone: '(71) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Dias d\'Ávila', endereco: 'Av. Gal. Milton Tavares de Souza, 700 - Centro', cidade: 'Dias d\'Ávila - BA', uf: 'BA', telefone: '(71) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Feira de Santana', endereco: 'R. Álvaro Augusto de Almeida, 20 - Brasília', cidade: 'Feira de Santana - BA', uf: 'BA', telefone: '(75) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Itabuna', endereco: 'Av. Aziz Maron, 200 - Urbis 1', cidade: 'Itabuna - BA', uf: 'BA', telefone: '(73) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Salvador', endereco: 'Av. Dom João VI, 350 - Brotas', cidade: 'Salvador - BA', uf: 'BA', telefone: '(71) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Lauro de Freitas', endereco: 'R. Presidente Kenedy, 665 - Centro', cidade: 'Lauro de Freitas - BA', uf: 'BA', telefone: '(71) 4002-3633', tipo: 'Hospital' },

  // ─── CEARÁ (CE) ─────────────────────────────────────────────────────────────
  { nome: 'Clínica Aldeota', endereco: 'Av. Santos Dumont, 2300 - Aldeota', cidade: 'Fortaleza - CE', uf: 'CE', telefone: '(85) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Antonio Bezerra', endereco: 'R. Coronel Otávio, 1200 - Antonio Bezerra', cidade: 'Fortaleza - CE', uf: 'CE', telefone: '(85) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Caucaia', endereco: 'R. Gonçalo Xavier, 270 - Centro', cidade: 'Caucaia - CE', uf: 'CE', telefone: '(85) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Crato', endereco: 'R. Padre Mororó, 820 - Centro', cidade: 'Crato - CE', uf: 'CE', telefone: '(88) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Iguatu', endereco: 'R. José Freitas, 1050 - Centro', cidade: 'Iguatu - CE', uf: 'CE', telefone: '(88) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Juazeiro do Norte', endereco: 'Av. Leão Sampaio, 1250 - Lagoa Seca', cidade: 'Juazeiro do Norte - CE', uf: 'CE', telefone: '(88) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Maracanaú', endereco: 'Av. Osires Pontes, 990 - Centro', cidade: 'Maracanaú - CE', uf: 'CE', telefone: '(85) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Messejana', endereco: 'Av. Frei Cirilo, 3000 - Messejana', cidade: 'Fortaleza - CE', uf: 'CE', telefone: '(85) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Montese', endereco: 'Av. João Pessoa, 4300 - Montese', cidade: 'Fortaleza - CE', uf: 'CE', telefone: '(85) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Parangaba', endereco: 'Av. Bezerra de Menezes, 1400 - Parangaba', cidade: 'Fortaleza - CE', uf: 'CE', telefone: '(85) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Sobral', endereco: 'Av. Dr. Guarany, 550 - Derby', cidade: 'Sobral - CE', uf: 'CE', telefone: '(88) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital Antônio Prudente', endereco: 'Av. Dom Luís, 300 - Aldeota', cidade: 'Fortaleza - CE', uf: 'CE', telefone: '(85) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Fortaleza', endereco: 'Rua Ávila Goulart, 900 - Papicu', cidade: 'Fortaleza - CE', uf: 'CE', telefone: '(85) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Crato', endereco: 'R. Tristão Gonçalves, 1200 - São Miguel', cidade: 'Crato - CE', uf: 'CE', telefone: '(88) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Juazeiro do Norte', endereco: 'R. São Francisco, 1900 - Centro', cidade: 'Juazeiro do Norte - CE', uf: 'CE', telefone: '(88) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Sobral', endereco: 'Av. John Sanford, 2700 - Sumaré', cidade: 'Sobral - CE', uf: 'CE', telefone: '(88) 4002-3633', tipo: 'Hospital' },

  // ─── GOIÁS (GO) ─────────────────────────────────────────────────────────────
  { nome: 'Clínica Anápolis', endereco: 'Av. Brasil Norte, 1600 - Jundiaí', cidade: 'Anápolis - GO', uf: 'GO', telefone: '(62) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Aparecida de Goiânia', endereco: 'Av. Dom Emanuel, 3300 - Jardim dos Ipês', cidade: 'Aparecida de Goiânia - GO', uf: 'GO', telefone: '(62) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Campinas', endereco: 'Av. Anhanguera, 5720 - Setor Campinas', cidade: 'Goiânia - GO', uf: 'GO', telefone: '(62) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Itatiaia', endereco: 'Av. T-2, 1117 - Setor Bueno', cidade: 'Goiânia - GO', uf: 'GO', telefone: '(62) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Negrão de Lima', endereco: 'Rua 1025, 200 - Setor Pedro Ludovico', cidade: 'Goiânia - GO', uf: 'GO', telefone: '(62) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Goiânia', endereco: 'Av. Goiás, 2175 - Centro', cidade: 'Goiânia - GO', uf: 'GO', telefone: '(62) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Anápolis', endereco: 'R. Minas Gerais, 900 - Jundiaí', cidade: 'Anápolis - GO', uf: 'GO', telefone: '(62) 4002-3633', tipo: 'Hospital' },

  // ─── MARANHÃO (MA) ──────────────────────────────────────────────────────────
  { nome: 'Clínica Centro São Luís', endereco: 'R. do Giz, 234 - Centro', cidade: 'São Luís - MA', uf: 'MA', telefone: '(98) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Cohab São Luís', endereco: 'Av. Guajajaras, 2200 - Cohab Anil III', cidade: 'São Luís - MA', uf: 'MA', telefone: '(98) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Imperatriz', endereco: 'Av. Getúlio Vargas, 200 - Centro', cidade: 'Imperatriz - MA', uf: 'MA', telefone: '(99) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade São Luís', endereco: 'Av. Jerônimo de Albuquerque, 100 - Calhau', cidade: 'São Luís - MA', uf: 'MA', telefone: '(98) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Imperatriz', endereco: 'Av. Prudente de Morais, 1900 - Centro', cidade: 'Imperatriz - MA', uf: 'MA', telefone: '(99) 4002-3633', tipo: 'Hospital' },

  // ─── MATO GROSSO (MT) ───────────────────────────────────────────────────────
  { nome: 'Clínica Cuiabá', endereco: 'Av. Isaac Póvoas, 1200 - Goiabeiras', cidade: 'Cuiabá - MT', uf: 'MT', telefone: '(65) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Cuiabá', endereco: 'R. Antônio de Albuquerque, 500 - Dom Aquino', cidade: 'Cuiabá - MT', uf: 'MT', telefone: '(65) 4002-3633', tipo: 'Hospital' },

  // ─── PARÁ (PA) ──────────────────────────────────────────────────────────────
  { nome: 'Clínica Belém', endereco: 'Av. Almirante Barroso, 3775 - Marco', cidade: 'Belém - PA', uf: 'PA', telefone: '(91) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Belém', endereco: 'Tv. Dom Romualdo de Seixas, 858 - Umarizal', cidade: 'Belém - PA', uf: 'PA', telefone: '(91) 4002-3633', tipo: 'Hospital' },

  // ─── PARAÍBA (PB) ───────────────────────────────────────────────────────────
  { nome: 'Clínica Manaíra', endereco: 'Av. Epitácio Pessoa, 4546 - Manaíra', cidade: 'João Pessoa - PB', uf: 'PB', telefone: '(83) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Mangabeira', endereco: 'R. Monsenhor Odilon Coutinho, 50 - Mangabeira', cidade: 'João Pessoa - PB', uf: 'PB', telefone: '(83) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Campina Grande', endereco: 'Av. Floriano Peixoto, 500 - Centro', cidade: 'Campina Grande - PB', uf: 'PB', telefone: '(83) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade João Pessoa', endereco: 'Av. Senador Rui Carneiro, 500 - Miramar', cidade: 'João Pessoa - PB', uf: 'PB', telefone: '(83) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Campina Grande', endereco: 'R. Irineu Joffily, 400 - José Pinheiro', cidade: 'Campina Grande - PB', uf: 'PB', telefone: '(83) 4002-3633', tipo: 'Hospital' },

  // ─── PERNAMBUCO (PE) ────────────────────────────────────────────────────────
  { nome: 'Clínica Aflitos', endereco: 'Av. Norte Miguel Arraes de Alencar, 4000 - Aflitos', cidade: 'Recife - PE', uf: 'PE', telefone: '(81) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Caruaru', endereco: 'Av. Agamenon Magalhães, 1600 - Centro', cidade: 'Caruaru - PE', uf: 'PE', telefone: '(81) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Olinda', endereco: 'Av. Presidente Kennedy, 2200 - Jardim Brasil', cidade: 'Olinda - PE', uf: 'PE', telefone: '(81) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Petrolina', endereco: 'R. Avenida 10, 500 - Vila Eduardo', cidade: 'Petrolina - PE', uf: 'PE', telefone: '(87) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Taquaritinga do Norte', endereco: 'Av. Presidente Dutra, 200 - Centro', cidade: 'Taquaritinga do Norte - PE', uf: 'PE', telefone: '(81) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Recife', endereco: 'R. José de Alencar, 165 - Boa Viagem', cidade: 'Recife - PE', uf: 'PE', telefone: '(81) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Caruaru', endereco: 'Av. Santos Dumont, 750 - Centro', cidade: 'Caruaru - PE', uf: 'PE', telefone: '(81) 4002-3633', tipo: 'Hospital' },

  // ─── PIAUÍ (PI) ─────────────────────────────────────────────────────────────
  { nome: 'Clínica Centro Teresina', endereco: 'Av. Frei Serafim, 1986 - Centro', cidade: 'Teresina - PI', uf: 'PI', telefone: '(86) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Leste Teresina', endereco: 'Rua Desembargador Freitas, 1200 - Leste', cidade: 'Teresina - PI', uf: 'PI', telefone: '(86) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Parnaíba', endereco: 'Av. Gov. Chagas Rodrigues, 970 - Fátima', cidade: 'Parnaíba - PI', uf: 'PI', telefone: '(86) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Teresina', endereco: 'Av. Senador Helvídio Nunes, 1800 - Jóquei', cidade: 'Teresina - PI', uf: 'PI', telefone: '(86) 4002-3633', tipo: 'Hospital' },

  // ─── RIO GRANDE DO NORTE (RN) ───────────────────────────────────────────────
  { nome: 'Clínica Alecrim', endereco: 'Av. Rio Branco, 1200 - Alecrim', cidade: 'Natal - RN', uf: 'RN', telefone: '(84) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Candelária', endereco: 'Av. Salgado Filho, 3000 - Candelária', cidade: 'Natal - RN', uf: 'RN', telefone: '(84) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Mossoró', endereco: 'Av. Jerônimo Rosado, 1600 - Centro', cidade: 'Mossoró - RN', uf: 'RN', telefone: '(84) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Natal', endereco: 'Av. Deodoro da Fonseca, 700 - Petrópolis', cidade: 'Natal - RN', uf: 'RN', telefone: '(84) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Mossoró', endereco: 'R. Coronel Gurgel, 130 - Centro', cidade: 'Mossoró - RN', uf: 'RN', telefone: '(84) 4002-3633', tipo: 'Hospital' },

  // ─── SERGIPE (SE) ───────────────────────────────────────────────────────────
  { nome: 'Clínica Aracaju', endereco: 'Av. Ivo do Prado, 290 - Centro', cidade: 'Aracaju - SE', uf: 'SE', telefone: '(79) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Aracaju', endereco: 'Av. Desembargador Maynard, 640 - Cirurgia', cidade: 'Aracaju - SE', uf: 'SE', telefone: '(79) 4002-3633', tipo: 'Hospital' },

  // ─── TOCANTINS (TO) ─────────────────────────────────────────────────────────
  { nome: 'Clínica Palmas', endereco: 'Av. Teotônio Segurado, 203 Sul, Conjunto 01 - Plano Diretor Sul', cidade: 'Palmas - TO', uf: 'TO', telefone: '(63) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Palmas', endereco: 'ACSU-SO 70, Conjunto 01 - Plano Diretor Sul', cidade: 'Palmas - TO', uf: 'TO', telefone: '(63) 4002-3633', tipo: 'Hospital' },

  // ─── SÃO PAULO (SP) ─────────────────────────────────────────────────────────
  { nome: 'Hospital e Maternidade Araraquara', endereco: 'Av. José Bonifácio, 569 - Centro', cidade: 'Araraquara - SP', uf: 'SP', telefone: '(16) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Bauru', endereco: 'Rua Gustavo Maciel, 15 - Centro', cidade: 'Bauru - SP', uf: 'SP', telefone: '(14) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Renascença de Campinas', endereco: 'Avenida Barão de Itapura, 1444 - Vila Itapura', cidade: 'Campinas - SP', uf: 'SP', telefone: '(19) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade de Franca', endereco: 'Rua Dr. Fernando Falleiros de Lima, 2333 - Centro', cidade: 'Franca - SP', uf: 'SP', telefone: '(16) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Guarulhos', endereco: 'Avenida Tiradentes, 1015 - Jardim Santa Edwirges', cidade: 'Guarulhos - SP', uf: 'SP', telefone: '(11) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Paulo Sacramento', endereco: 'Rua Quinze de Novembro, 865 - Centro', cidade: 'Jundiaí - SP', uf: 'SP', telefone: '(11) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Medical', endereco: 'Av. Ana Carolina de Barros Levy, 124 - Vila Paraíso', cidade: 'Limeira - SP', uf: 'SP', telefone: '(19) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Lins', endereco: 'Av. Nicolau Zarvos, 1650 - Jardim Leoni', cidade: 'Lins - SP', uf: 'SP', telefone: '(14) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Cruzeiro do Sul', endereco: 'Avenida Autonomistas, 2502 - Vila Yara', cidade: 'Osasco - SP', uf: 'SP', telefone: '(11) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital São Francisco', endereco: 'Rua Bernardino de Campos, 912 - Centro', cidade: 'Ribeirão Preto - SP', uf: 'SP', telefone: '(16) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Santo André', endereco: 'Rua Coronel Fernando Prestes, 253 - Centro', cidade: 'Santo André - SP', uf: 'SP', telefone: '(11) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade São Bernardo', endereco: 'Av. Kennedy, 1595 - Jardim do Mar', cidade: 'São Bernardo do Campo - SP', uf: 'SP', telefone: '(11) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade São José dos Campos', endereco: 'Rua Cândido Xavier de Almeida e Souza, 220 - Centro', cidade: 'São José dos Campos - SP', uf: 'SP', telefone: '(12) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Sorocaba', endereco: 'Rua Afonso Pena, 60 - Mangal', cidade: 'Sorocaba - SP', uf: 'SP', telefone: '(15) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Taubaté', endereco: 'Rua Quatro de Março, 360 - Centro', cidade: 'Taubaté - SP', uf: 'SP', telefone: '(12) 4002-3633', tipo: 'Hospital' },

  // ─── PARANÁ (PR) ────────────────────────────────────────────────────────────
  { nome: 'Clínica Batel', endereco: 'Av. do Batel, 1230 - Batel', cidade: 'Curitiba - PR', uf: 'PR', telefone: '(41) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Cabral', endereco: 'R. Mateus Leme, 800 - Cabral', cidade: 'Curitiba - PR', uf: 'PR', telefone: '(41) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Fazendinha', endereco: 'Av. Winston Churchill, 2300 - Fazendinha', cidade: 'Curitiba - PR', uf: 'PR', telefone: '(41) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Londrina', endereco: 'Av. Saul Elkind, 1200 - Jardim Leonor', cidade: 'Londrina - PR', uf: 'PR', telefone: '(43) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Maringá', endereco: 'Av. Colombo, 2800 - Zona 07', cidade: 'Maringá - PR', uf: 'PR', telefone: '(44) 4002-3633', tipo: 'Clínica' },
  { nome: 'Clínica Cascavel', endereco: 'R. Pernambuco, 1500 - Centro', cidade: 'Cascavel - PR', uf: 'PR', telefone: '(45) 4002-3633', tipo: 'Clínica' },
  { nome: 'Hospital e Maternidade Curitiba', endereco: 'Av. Iguaçu, 1285 - Rebouças', cidade: 'Curitiba - PR, CEP 80230-020', uf: 'PR', telefone: '(41) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Londrina', endereco: 'R. Robert Koch, 60 - Espírito Santo', cidade: 'Londrina - PR', uf: 'PR', telefone: '(43) 4002-3633', tipo: 'Hospital' },
  { nome: 'Hospital e Maternidade Maringá', endereco: 'Av. Mandacaru, 1300 - Mandacaru', cidade: 'Maringá - PR', uf: 'PR', telefone: '(44) 4002-3633', tipo: 'Hospital' },
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
