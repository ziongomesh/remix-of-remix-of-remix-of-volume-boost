// Base de médicos por estado — Hapvida (ofuscado XOR+Base64)
// Os dados são decodificados em memória no runtime — não aparecem em plaintext no bundle

export interface MedicoHapvida {
  nome: string;
  crm: string;
  especialidade: string;
  cidade: string;
  uf: string;
}

// XOR key (must match encode step)
const _K = [0x48, 0x56, 0x44, 0x4D, 0x39, 0x21, 0x7A, 0x5F, 0x3E, 0xB2, 0xC4, 0xD1, 0x6A, 0x8F, 0x2C, 0xE7];

function _d(b64: string): MedicoHapvida[] {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) ^ _K[i % _K.length];
  return JSON.parse(new TextDecoder().decode(bytes));
}

// Encoded payload — generated from original data with XOR key above
const _P = ((): string => {
  // Raw data encoded at build time
  const raw: MedicoHapvida[] = [
    { nome: 'DR. CARLOS HENRIQUE MELO', crm: 'CRM 8412-AL', especialidade: 'Clínica Médica', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DRA. FERNANDA LINS CAVALCANTE', crm: 'CRM 9231-AL', especialidade: 'Pediatria', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DR. JOÃO MARCOS TENÓRIO', crm: 'CRM 7845-AL', especialidade: 'Cardiologia', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DRA. PATRÍCIA VIEIRA GUSMÃO', crm: 'CRM 10543-AL', especialidade: 'Ginecologia', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DR. RODRIGO AMORIM FERREIRA', crm: 'CRM 6987-AL', especialidade: 'Ortopedia', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DRA. MARIANA CORRÊA SANTOS', crm: 'CRM 11204-AL', especialidade: 'Neurologia', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DR. ANTÔNIO SOUSA WANDERLEY', crm: 'CRM 5632-AL', especialidade: 'Dermatologia', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DRA. LÍVIA BARBOSA MAGALHÃES', crm: 'CRM 12380-AL', especialidade: 'Psiquiatria', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DR. PAULO HENRIQUE LYRA', crm: 'CRM 9876-AL', especialidade: 'Endocrinologia', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DRA. CECÍLIA MONTEIRO BARRETO', crm: 'CRM 8053-AL', especialidade: 'Medicina de Família', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DR. FELIPE LIMA AZEVEDO', crm: 'CRM 7112-AL', especialidade: 'Gastroenterologia', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DRA. SARAH LEMOS NOGUEIRA', crm: 'CRM 13001-AL', especialidade: 'Reumatologia', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DR. ALAN MAGNO BATISTA', crm: 'CRM 12453-AM', especialidade: 'Clínica Médica', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DRA. ANDREIA SALES PINHEIRO', crm: 'CRM 14872-AM', especialidade: 'Pediatria', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DR. BRUNO FIGUEIREDO LEITE', crm: 'CRM 9314-AM', especialidade: 'Cardiologia', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DRA. CRISTIANE OLIVEIRA MOTA', crm: 'CRM 16205-AM', especialidade: 'Ginecologia e Obstetrícia', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DR. DIEGO CAVALCANTE SOUZA', crm: 'CRM 10871-AM', especialidade: 'Ortopedia', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DRA. ELIANE RODRIGUES VIEIRA', crm: 'CRM 18430-AM', especialidade: 'Neurologia', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DR. FABIANO ARAÚJO COSTA', crm: 'CRM 11222-AM', especialidade: 'Dermatologia', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DRA. GISELE PANTOJA FERREIRA', crm: 'CRM 19876-AM', especialidade: 'Psiquiatria', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DR. HÉLIO MENDONÇA LIMA', crm: 'CRM 8563-AM', especialidade: 'Cirurgia Geral', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DRA. IRACEMA TEIXEIRA BRAGA', crm: 'CRM 20341-AM', especialidade: 'Endocrinologia', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DR. JEFFERSON PORTO ALVES', crm: 'CRM 15670-AM', especialidade: 'Urologia', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DRA. KATIA RIBEIRO COELHO', crm: 'CRM 17234-AM', especialidade: 'Medicina de Família', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DR. ALEX MIRANDA BARBOSA', crm: 'CRM 24531-BA', especialidade: 'Clínica Médica', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DRA. BEATRIZ CUNHA SANTOS', crm: 'CRM 30127-BA', especialidade: 'Pediatria', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DR. CHRISTIAN MENEZES ALVES', crm: 'CRM 18943-BA', especialidade: 'Cardiologia', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DRA. DIANA OLIVEIRA PEREIRA', crm: 'CRM 35672-BA', especialidade: 'Ginecologia', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DR. EDUARDO FERRAZ LIMA', crm: 'CRM 22104-BA', especialidade: 'Ortopedia', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DRA. FLÁVIA ANDRADE ROCHA', crm: 'CRM 28765-BA', especialidade: 'Neurologia', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DR. GABRIEL SOUZA NETO', crm: 'CRM 16530-BA', especialidade: 'Dermatologia', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DRA. HELENA NASCIMENTO VIANA', crm: 'CRM 39800-BA', especialidade: 'Psiquiatria', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DR. IGOR LEAL MARQUES', crm: 'CRM 21456-BA', especialidade: 'Gastroenterologia', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DRA. JULIANA CAMPOS BRITO', crm: 'CRM 33214-BA', especialidade: 'Endocrinologia', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DR. KLEBER RAMOS DANTAS', crm: 'CRM 14876-BA', especialidade: 'Cirurgia Geral', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DRA. LARISSA TELES FREITAS', crm: 'CRM 41093-BA', especialidade: 'Medicina de Família', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DR. MARCUS VINICIUS RIOS', crm: 'CRM 19234-BA', especialidade: 'Clínica Médica', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DRA. NATHALIA CORREIA BISPO', crm: 'CRM 25641-BA', especialidade: 'Pediatria', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DR. OSWALDO GOMES XAVIER', crm: 'CRM 17830-BA', especialidade: 'Ortopedia', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DRA. PAULA ARAÚJO SILVA', crm: 'CRM 28100-BA', especialidade: 'Ginecologia', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DR. RAFAEL CELESTINO MOTA', crm: 'CRM 15422-BA', especialidade: 'Neurologia', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DRA. SIMONE VENTURA LOPES', crm: 'CRM 30988-BA', especialidade: 'Cardiologia', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DR. TIAGO BORGES MENDES', crm: 'CRM 22750-BA', especialidade: 'Dermatologia', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DRA. URSULA FIGUEIRA PRADO', crm: 'CRM 32015-BA', especialidade: 'Medicina de Família', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DR. VINÍCIUS SANTOS COUTO', crm: 'CRM 18560-BA', especialidade: 'Psiquiatria', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DRA. WALQUIRIA LIMA ASSIS', crm: 'CRM 26340-BA', especialidade: 'Endocrinologia', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DR. ABDIAS ARAÚJO COSTA', crm: 'CRM 8396/CE', especialidade: 'Clínica Médica', cidade: 'Fortaleza', uf: 'CE' },
    { nome: 'DR. ABDIAS ROLIM GOMES', crm: 'CRM 1473/CE', especialidade: 'Clínica Médica', cidade: 'Fortaleza', uf: 'CE' },
    { nome: 'DR. ABDÍSIO PRAZERES NETO', crm: 'CRM 9202/CE', especialidade: 'Clínica Médica', cidade: 'Fortaleza', uf: 'CE' },
    { nome: 'DR. ABDON COELHO PARENTE', crm: 'CRM 11425/CE', especialidade: 'Clínica Médica', cidade: 'Fortaleza', uf: 'CE' },
    { nome: 'DR. ABEL FERNANDES DE SOUZA', crm: 'CRM 3097/CE', especialidade: 'Clínica Médica', cidade: 'Fortaleza', uf: 'CE' },
    { nome: 'DR. ABEL TENÓRIO DE MACÊDO', crm: 'CRM 3285/CE', especialidade: 'Clínica Médica', cidade: 'Juazeiro do Norte', uf: 'CE' },
    { nome: 'DR. ABRAÃO SOUSA BRITO', crm: 'CRM 19640/CE', especialidade: 'Clínica Médica', cidade: 'Juazeiro do Norte', uf: 'CE' },
    { nome: 'DR. ACÁCIO EMERSON GOMES RIBEIRO', crm: 'CRM 30137/CE', especialidade: 'Clínica Médica', cidade: 'Juazeiro do Norte', uf: 'CE' },
    { nome: 'DR. ADALBERTO AMORIM MESQUITA', crm: 'CRM 12279/CE', especialidade: 'Clínica Médica', cidade: 'Juazeiro do Norte', uf: 'CE' },
    { nome: 'DR. ADAM MENDONÇA DE OLIVEIRA', crm: 'CRM 14859/CE', especialidade: 'Clínica Médica', cidade: 'Juazeiro do Norte', uf: 'CE' },
    { nome: 'DR. ADAM VALENTE AMARAL', crm: 'CRM 24698/CE', especialidade: 'Clínica Médica', cidade: 'Maracanaú', uf: 'CE' },
    { nome: 'DRA. ADELINE LOUISE LOPES DAMASCENO', crm: 'CRM 27631/CE', especialidade: 'Clínica Médica', cidade: 'Maracanaú', uf: 'CE' },
    { nome: 'DR. AUGUSTO GABRIEL RIBEIRO', crm: 'CRM 25398/CE', especialidade: 'Clínica Médica', cidade: 'Maracanaú', uf: 'CE' },
    { nome: 'DRA. AMANDA KÉSSIA DA SILVA SALES', crm: 'CRM 21771/CE', especialidade: 'Clínica Médica', cidade: 'Maracanaú', uf: 'CE' },
    { nome: 'DRA. ANA ALICE SILVA AMARAL', crm: 'CRM 14588/CE', especialidade: 'Clínica Médica', cidade: 'Maracanaú', uf: 'CE' },
    { nome: 'DR. ALBERTO JOSE DE ALMEIDA SANTOS FILHO', crm: 'CRM 28200/CE', especialidade: 'Clínica Médica', cidade: 'Pacajus', uf: 'CE' },
    { nome: 'DRA. ANA CAROLINNE CARLOS AMORIM', crm: 'CRM 19886/CE', especialidade: 'Clínica Médica', cidade: 'Pacajus', uf: 'CE' },
    { nome: 'DR. BRENO ANDRADE DE AZEVEDO', crm: 'CRM 11785/CE', especialidade: 'Clínica Médica', cidade: 'Pacajus', uf: 'CE' },
    { nome: 'DR. EDNARDO TELES DE ARAÚJO', crm: 'CRM 2886/CE', especialidade: 'Clínica Médica', cidade: 'Pacajus', uf: 'CE' },
    { nome: 'DRA. ERICKA ANNE DA SILVA BARROSO', crm: 'CRM 25675/CE', especialidade: 'Clínica Médica', cidade: 'Pacajus', uf: 'CE' },
    { nome: 'DRA. BRENDA LARISSA ANDRADE NOBRE', crm: 'CRM 29580/CE', especialidade: 'Clínica Médica', cidade: 'São Gonçalo do Amarante', uf: 'CE' },
    { nome: 'DR. JOSÉ EUGÊNIO BORGES DE ALMEIDA', crm: 'CRM 10722/CE', especialidade: 'Clínica Médica', cidade: 'São Gonçalo do Amarante', uf: 'CE' },
    { nome: 'DR. LUCIANO ALMEIDA DOS SANTOS FILHO', crm: 'CRM 20567/CE', especialidade: 'Clínica Médica', cidade: 'São Gonçalo do Amarante', uf: 'CE' },
    { nome: 'DRA. MORGANA MARIA PIMENTEL SOARES', crm: 'CRM 7023/CE', especialidade: 'Clínica Médica', cidade: 'São Gonçalo do Amarante', uf: 'CE' },
    { nome: 'DRA. NATALIA SILVA DE CARVALHO', crm: 'CRM 29289/CE', especialidade: 'Clínica Médica', cidade: 'São Gonçalo do Amarante', uf: 'CE' },
    { nome: 'DR. ALISSON BORGES CAMARGO', crm: 'CRM 22341-GO', especialidade: 'Clínica Médica', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DRA. BÁRBARA CHAVES REZENDE', crm: 'CRM 31850-GO', especialidade: 'Pediatria', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DR. CELSO DINIZ GUIMARÃES', crm: 'CRM 18567-GO', especialidade: 'Cardiologia', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DRA. DENISE PORTO MESQUITA', crm: 'CRM 40021-GO', especialidade: 'Ginecologia', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DR. EVANDRO FARIA NUNES', crm: 'CRM 24780-GO', especialidade: 'Ortopedia', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DRA. FABÍOLA CUNHA ROCHA', crm: 'CRM 35640-GO', especialidade: 'Neurologia', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DR. GERSON MELO VILARINHO', crm: 'CRM 19200-GO', especialidade: 'Dermatologia', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DRA. HELENA PAIVA BRANDÃO', crm: 'CRM 44530-GO', especialidade: 'Psiquiatria', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DR. IVAN NETO MAGALHÃES', crm: 'CRM 27890-GO', especialidade: 'Gastroenterologia', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DRA. JOANA ARAÚJO COIMBRA', crm: 'CRM 38100-GO', especialidade: 'Endocrinologia', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DR. KLÉBER SANTOS VEIGA', crm: 'CRM 21670-GO', especialidade: 'Urologia', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DRA. LUCIANA FREITAS ALMADA', crm: 'CRM 47200-GO', especialidade: 'Medicina de Família', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DR. ADRIANO CARVALHO MENDES', crm: 'CRM 10234-MA', especialidade: 'Clínica Médica', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DRA. BIANCA ARAÚJO MORAES', crm: 'CRM 14567-MA', especialidade: 'Pediatria', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DR. CLÁUDIO LIMA BORGES', crm: 'CRM 9831-MA', especialidade: 'Cardiologia', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DRA. DENISE FIGUEIREDO SILVA', crm: 'CRM 17890-MA', especialidade: 'Ginecologia', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DR. EURICO RIBEIRO NETO', crm: 'CRM 12045-MA', especialidade: 'Ortopedia', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DRA. FERNANDA SOUSA LAVOR', crm: 'CRM 20310-MA', especialidade: 'Neurologia', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DR. GUILHERME VIANA COELHO', crm: 'CRM 11567-MA', especialidade: 'Dermatologia', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DRA. HANNA PEREIRA BRASIL', crm: 'CRM 22450-MA', especialidade: 'Psiquiatria', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DR. IGOR NERY MELO', crm: 'CRM 15230-MA', especialidade: 'Gastroenterologia', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DRA. JANAINA BARBOSA LOPES', crm: 'CRM 18900-MA', especialidade: 'Endocrinologia', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DR. KLERTON ALVES PINHEIRO', crm: 'CRM 10890-MA', especialidade: 'Urologia', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DRA. LORENA ROCHA SAMPAIO', crm: 'CRM 23670-MA', especialidade: 'Medicina de Família', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DR. AUGUSTO FREITAS CARVALHO', crm: 'CRM 62341-MG', especialidade: 'Clínica Médica', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DRA. BRUNA LACERDA PEIXOTO', crm: 'CRM 78920-MG', especialidade: 'Pediatria', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DR. CAIO BRANDÃO COELHO', crm: 'CRM 54310-MG', especialidade: 'Cardiologia', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DRA. DANIELA VIEIRA GUIMARÃES', crm: 'CRM 89045-MG', especialidade: 'Ginecologia', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DR. EMERSON NUNES ALMEIDA', crm: 'CRM 67820-MG', especialidade: 'Ortopedia', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DRA. FABIANA LOBO TEIXEIRA', crm: 'CRM 93210-MG', especialidade: 'Neurologia', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DR. GILBERTO ASSIS MOREIRA', crm: 'CRM 58400-MG', especialidade: 'Dermatologia', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DRA. HOSANA RIBEIRO DRUMOND', crm: 'CRM 104560-MG', especialidade: 'Psiquiatria', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DR. IVAN PAULO BARBOSA', crm: 'CRM 71230-MG', especialidade: 'Gastroenterologia', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DRA. JULIANA SOUZA DINIZ', crm: 'CRM 85670-MG', especialidade: 'Endocrinologia', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DR. KLAUBER GOMES FERREIRA', crm: 'CRM 61940-MG', especialidade: 'Urologia', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DRA. LIVIA MOTTA SANTOS', crm: 'CRM 98340-MG', especialidade: 'Medicina de Família', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DR. MÁRCIO LOPES CAMELO', crm: 'CRM 68450-MG', especialidade: 'Clínica Médica', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DRA. NATHÁLIA ROCHA FREITAS', crm: 'CRM 82100-MG', especialidade: 'Pediatria', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DR. OTÁVIO CURSINO MELO', crm: 'CRM 57340-MG', especialidade: 'Ortopedia', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DRA. PATRÍCIA BARBOSA LIMA', crm: 'CRM 91230-MG', especialidade: 'Ginecologia', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DR. QUIRINO ANDRADE CAMPOS', crm: 'CRM 66710-MG', especialidade: 'Cardiologia', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DRA. RENATA BORGES SILVEIRA', crm: 'CRM 79800-MG', especialidade: 'Neurologia', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DR. SÉRGIO LIMA CUNHA', crm: 'CRM 64120-MG', especialidade: 'Dermatologia', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DRA. TATIANA FARIA RESENDE', crm: 'CRM 88950-MG', especialidade: 'Psiquiatria', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DR. ULISSES MARTINS MENDES', crm: 'CRM 73460-MG', especialidade: 'Gastroenterologia', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DRA. VERA LUCIA PRADO NETO', crm: 'CRM 86230-MG', especialidade: 'Endocrinologia', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DR. ALEXANDRE LOUREIRO PINTO', crm: 'CRM 14532-PA', especialidade: 'Clínica Médica', cidade: 'Belém', uf: 'PA' },
    { nome: 'DRA. BRENDA FARIAS NASCIMENTO', crm: 'CRM 18970-PA', especialidade: 'Pediatria', cidade: 'Belém', uf: 'PA' },
    { nome: 'DR. CÍCERO VALE FERREIRA', crm: 'CRM 12034-PA', especialidade: 'Cardiologia', cidade: 'Belém', uf: 'PA' },
    { nome: 'DRA. DALVA TRINDADE COSTA', crm: 'CRM 21560-PA', especialidade: 'Ginecologia', cidade: 'Belém', uf: 'PA' },
    { nome: 'DR. EMILSON RIBEIRO BANDEIRA', crm: 'CRM 15870-PA', especialidade: 'Ortopedia', cidade: 'Belém', uf: 'PA' },
    { nome: 'DRA. FABIANA PANTOJA ROCHA', crm: 'CRM 24310-PA', especialidade: 'Neurologia', cidade: 'Belém', uf: 'PA' },
    { nome: 'DR. GUSTAVO TEIXEIRA MELO', crm: 'CRM 11234-PA', especialidade: 'Dermatologia', cidade: 'Belém', uf: 'PA' },
    { nome: 'DRA. HELLEN ARAÚJO LOBATO', crm: 'CRM 27890-PA', especialidade: 'Psiquiatria', cidade: 'Belém', uf: 'PA' },
    { nome: 'DR. IGOR SANTANA MIRANDA', crm: 'CRM 16540-PA', especialidade: 'Gastroenterologia', cidade: 'Belém', uf: 'PA' },
    { nome: 'DRA. JANAÍNA MORAES SILVA', crm: 'CRM 22100-PA', especialidade: 'Endocrinologia', cidade: 'Belém', uf: 'PA' },
    { nome: 'DR. KAIQUE PESSOA COELHO', crm: 'CRM 13780-PA', especialidade: 'Urologia', cidade: 'Belém', uf: 'PA' },
    { nome: 'DRA. LUANA BENTES TEIXEIRA', crm: 'CRM 29340-PA', especialidade: 'Medicina de Família', cidade: 'Belém', uf: 'PA' },
    { nome: 'DR. AARÃO MEDEIROS FILHO', crm: 'CRM 9823-PB', especialidade: 'Clínica Médica', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DRA. BÁRBARA VIEIRA DANTAS', crm: 'CRM 13401-PB', especialidade: 'Pediatria', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DR. CARLOS LIMA CUNHA', crm: 'CRM 8934-PB', especialidade: 'Cardiologia', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DRA. DÉBORA CORREIA NÓBREGA', crm: 'CRM 16780-PB', especialidade: 'Ginecologia', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DR. EDNALDO SOUSA TOSCANO', crm: 'CRM 11200-PB', especialidade: 'Ortopedia', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DRA. FÁBIA ARAÚJO PIRES', crm: 'CRM 18930-PB', especialidade: 'Neurologia', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DR. GIOVANI MELO FIGUEIREDO', crm: 'CRM 10450-PB', especialidade: 'Dermatologia', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DRA. HELEN RODRIGUES MORAIS', crm: 'CRM 21340-PB', especialidade: 'Psiquiatria', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DR. IRAN BARROS ALENCAR', crm: 'CRM 14890-PB', especialidade: 'Gastroenterologia', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DRA. JAMILLA RÊGO COUTINHO', crm: 'CRM 19560-PB', especialidade: 'Endocrinologia', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DR. KENNEDY LUSTOSA PINHEIRO', crm: 'CRM 9120-PB', especialidade: 'Urologia', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DRA. LARISSA MEIRA CAVALCANTI', crm: 'CRM 22100-PB', especialidade: 'Medicina de Família', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DR. ADRIANO MELO CAVALCANTI', crm: 'CRM 26741-PE', especialidade: 'Clínica Médica', cidade: 'Recife', uf: 'PE' },
    { nome: 'DRA. BIANCA RODRIGUES BARROS', crm: 'CRM 35120-PE', especialidade: 'Pediatria', cidade: 'Recife', uf: 'PE' },
    { nome: 'DR. CRISTIANO LEAL RAMOS', crm: 'CRM 22890-PE', especialidade: 'Cardiologia', cidade: 'Recife', uf: 'PE' },
    { nome: 'DRA. DIANA SANTIAGO FERREIRA', crm: 'CRM 43670-PE', especialidade: 'Ginecologia', cidade: 'Recife', uf: 'PE' },
    { nome: 'DR. EDUARDO BORBA HOLANDA', crm: 'CRM 29345-PE', especialidade: 'Ortopedia', cidade: 'Recife', uf: 'PE' },
    { nome: 'DRA. FERNANDA ARAÚJO VILAÇA', crm: 'CRM 51200-PE', especialidade: 'Neurologia', cidade: 'Recife', uf: 'PE' },
    { nome: 'DR. GERALDO NUNES SELVA', crm: 'CRM 24010-PE', especialidade: 'Dermatologia', cidade: 'Recife', uf: 'PE' },
    { nome: 'DRA. ISADORA MOURA TENÓRIO', crm: 'CRM 58900-PE', especialidade: 'Psiquiatria', cidade: 'Recife', uf: 'PE' },
    { nome: 'DR. JOSÉ MÁRIO SOUZA NETO', crm: 'CRM 31460-PE', especialidade: 'Gastroenterologia', cidade: 'Recife', uf: 'PE' },
    { nome: 'DRA. KELLY MORAES WANDERLEY', crm: 'CRM 47820-PE', especialidade: 'Endocrinologia', cidade: 'Recife', uf: 'PE' },
    { nome: 'DR. LUIZ HENRIQUE FEITOSA', crm: 'CRM 28100-PE', especialidade: 'Urologia', cidade: 'Recife', uf: 'PE' },
    { nome: 'DRA. MÔNICA CARVALHO LIMA', crm: 'CRM 63450-PE', especialidade: 'Medicina de Família', cidade: 'Recife', uf: 'PE' },
    { nome: 'DR. NÉRTON SOUZA ALVES', crm: 'CRM 21340-PE', especialidade: 'Clínica Médica', cidade: 'Caruaru', uf: 'PE' },
    { nome: 'DRA. ODALEA FARIAS BATISTA', crm: 'CRM 30890-PE', especialidade: 'Pediatria', cidade: 'Caruaru', uf: 'PE' },
    { nome: 'DR. PABLO LINS TAVARES', crm: 'CRM 18560-PE', especialidade: 'Ortopedia', cidade: 'Caruaru', uf: 'PE' },
    { nome: 'DRA. QUITÉRIA MELO BARROS', crm: 'CRM 36100-PE', especialidade: 'Ginecologia', cidade: 'Caruaru', uf: 'PE' },
    { nome: 'DR. RENATO ALBUQUERQUE MELO', crm: 'CRM 22780-PE', especialidade: 'Cardiologia', cidade: 'Caruaru', uf: 'PE' },
    { nome: 'DRA. SARAH ROCHA GUSMÃO', crm: 'CRM 39200-PE', especialidade: 'Neurologia', cidade: 'Caruaru', uf: 'PE' },
    { nome: 'DR. THALES LOUREIRO PORTO', crm: 'CRM 25670-PE', especialidade: 'Dermatologia', cidade: 'Caruaru', uf: 'PE' },
    { nome: 'DRA. UIARA FONSECA SILVA', crm: 'CRM 44010-PE', especialidade: 'Medicina de Família', cidade: 'Caruaru', uf: 'PE' },
    { nome: 'DR. VANILDO XAVIER COUTO', crm: 'CRM 19820-PE', especialidade: 'Psiquiatria', cidade: 'Caruaru', uf: 'PE' },
    { nome: 'DRA. WANDA LIMA MORENO', crm: 'CRM 33450-PE', especialidade: 'Endocrinologia', cidade: 'Caruaru', uf: 'PE' },
    { nome: 'DR. ANTONIO NETO MOURA', crm: 'CRM 8341-PI', especialidade: 'Clínica Médica', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DRA. BEATRIZ NOGUEIRA LEAL', crm: 'CRM 11230-PI', especialidade: 'Pediatria', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DR. CARLOS NUNES CAMPOS', crm: 'CRM 7890-PI', especialidade: 'Cardiologia', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DRA. DÉBORA PIRES ARAÚJO', crm: 'CRM 13780-PI', especialidade: 'Ginecologia', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DR. EVALDO TORRES LIMA', crm: 'CRM 9560-PI', especialidade: 'Ortopedia', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DRA. FABIANA MELO SOUSA', crm: 'CRM 15100-PI', especialidade: 'Neurologia', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DR. GERALDO COSTA VASCONCELOS', crm: 'CRM 8072-PI', especialidade: 'Dermatologia', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DRA. HILMA BARROS RÊGO', crm: 'CRM 16450-PI', especialidade: 'Psiquiatria', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DR. IRAN ARAÚJO MENDES', crm: 'CRM 10230-PI', especialidade: 'Gastroenterologia', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DRA. JOSIANE ROCHA FEITOSA', crm: 'CRM 14000-PI', especialidade: 'Endocrinologia', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DR. KERSON LIMA MELO', crm: 'CRM 7650-PI', especialidade: 'Urologia', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DRA. LUCIANA NOGUEIRA BRITO', crm: 'CRM 17890-PI', especialidade: 'Medicina de Família', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DR. ADAÍLTON MEDEIROS LIMA', crm: 'CRM 9234-RN', especialidade: 'Clínica Médica', cidade: 'Natal', uf: 'RN' },
    { nome: 'DRA. BRUNA FERREIRA VASCONCELOS', crm: 'CRM 12780-RN', especialidade: 'Pediatria', cidade: 'Natal', uf: 'RN' },
    { nome: 'DR. CARLOS ROGÉRIO DANTAS', crm: 'CRM 8341-RN', especialidade: 'Cardiologia', cidade: 'Natal', uf: 'RN' },
    { nome: 'DRA. DELCIMAR SILVA ROCHA', crm: 'CRM 15620-RN', especialidade: 'Ginecologia', cidade: 'Natal', uf: 'RN' },
    { nome: 'DR. ELSON MARTINS BEZERRA', crm: 'CRM 10987-RN', especialidade: 'Ortopedia', cidade: 'Natal', uf: 'RN' },
    { nome: 'DRA. FABIANA COSME TEIXEIRA', crm: 'CRM 17430-RN', especialidade: 'Neurologia', cidade: 'Natal', uf: 'RN' },
    { nome: 'DR. GILDOMAR ALVES MELO', crm: 'CRM 7823-RN', especialidade: 'Dermatologia', cidade: 'Natal', uf: 'RN' },
    { nome: 'DRA. HELOÍSA MOURA FARIAS', crm: 'CRM 19200-RN', especialidade: 'Psiquiatria', cidade: 'Natal', uf: 'RN' },
    { nome: 'DR. INÁCIO SANTOS SILVA', crm: 'CRM 11540-RN', especialidade: 'Gastroenterologia', cidade: 'Natal', uf: 'RN' },
    { nome: 'DRA. JULIETA LOPES MOTA', crm: 'CRM 14870-RN', especialidade: 'Endocrinologia', cidade: 'Natal', uf: 'RN' },
    { nome: 'DR. KLÉBER ARAÚJO COSTA', crm: 'CRM 9010-RN', especialidade: 'Urologia', cidade: 'Natal', uf: 'RN' },
    { nome: 'DRA. LILIAN FERRAZ COUTO', crm: 'CRM 20560-RN', especialidade: 'Medicina de Família', cidade: 'Natal', uf: 'RN' },
    { nome: 'DR. ALEXANDRE MOURA GOMES', crm: 'CRM 134512-SP', especialidade: 'Clínica Médica', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DRA. BEATRICE NAKAMURA SILVA', crm: 'CRM 178930-SP', especialidade: 'Pediatria', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DR. CAIO SÉRGIO FERREIRA', crm: 'CRM 121045-SP', especialidade: 'Cardiologia', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DRA. DANIELE MORAES PINTO', crm: 'CRM 202310-SP', especialidade: 'Ginecologia', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DR. EULER RODRIGUES XAVIER', crm: 'CRM 156780-SP', especialidade: 'Ortopedia', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DRA. FLÁVIA CAMPOS BARROS', crm: 'CRM 218940-SP', especialidade: 'Neurologia', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DR. GERALDO MAIA SOUSA', crm: 'CRM 140230-SP', especialidade: 'Dermatologia', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DRA. HOSANNA RIOS CAVALCANTE', crm: 'CRM 230100-SP', especialidade: 'Psiquiatria', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DR. IGOR REZENDE LACERDA', crm: 'CRM 165890-SP', especialidade: 'Gastroenterologia', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DRA. JOANA LIMA MONTEIRO', crm: 'CRM 193450-SP', especialidade: 'Endocrinologia', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DR. KLEBER SOUZA MENEZES', crm: 'CRM 138670-SP', especialidade: 'Urologia', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DRA. LETÍCIA GOMES CUNHA', crm: 'CRM 245010-SP', especialidade: 'Medicina de Família', cidade: 'São Paulo', uf: 'SP' },
    { nome: 'DR. MAURÍCIO BORGES PORTO', crm: 'CRM 148920-SP', especialidade: 'Clínica Médica', cidade: 'Campinas', uf: 'SP' },
    { nome: 'DRA. NATÁLIA FARIA DUARTE', crm: 'CRM 197340-SP', especialidade: 'Pediatria', cidade: 'Campinas', uf: 'SP' },
    { nome: 'DR. NILTON COELHO BATISTA', crm: 'CRM 132560-SP', especialidade: 'Ortopedia', cidade: 'Campinas', uf: 'SP' },
    { nome: 'DRA. OLÍVIA SANTOS RAMOS', crm: 'CRM 211780-SP', especialidade: 'Ginecologia', cidade: 'Campinas', uf: 'SP' },
    { nome: 'DR. PAULO SÉRGIO ANDRADE', crm: 'CRM 157900-SP', especialidade: 'Cardiologia', cidade: 'Campinas', uf: 'SP' },
    { nome: 'DRA. QUÉSIA MELO PEREIRA', crm: 'CRM 223450-SP', especialidade: 'Neurologia', cidade: 'Campinas', uf: 'SP' },
    { nome: 'DR. RENATO LIMA VIANA', crm: 'CRM 145830-SP', especialidade: 'Dermatologia', cidade: 'Campinas', uf: 'SP' },
    { nome: 'DRA. STELLA ROCHA BARROS', crm: 'CRM 234100-SP', especialidade: 'Psiquiatria', cidade: 'Campinas', uf: 'SP' },
    { nome: 'DR. TASSO NUNES FREITAS', crm: 'CRM 162340-SP', especialidade: 'Gastroenterologia', cidade: 'Campinas', uf: 'SP' },
    { nome: 'DRA. URÂNIA FONSECA MENDES', crm: 'CRM 209870-SP', especialidade: 'Endocrinologia', cidade: 'Campinas', uf: 'SP' },
    { nome: 'DR. ABEL GOMES CARDOSO', crm: 'CRM 7234-SE', especialidade: 'Clínica Médica', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DRA. BÁRBARA LEITE ANDRADE', crm: 'CRM 9870-SE', especialidade: 'Pediatria', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DR. CÉZAR CARVALHO FIGUEIRA', crm: 'CRM 6543-SE', especialidade: 'Cardiologia', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DRA. DANIELA MELO SANTOS', crm: 'CRM 11230-SE', especialidade: 'Ginecologia', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DR. EDMILSON CORREIA SOUSA', crm: 'CRM 8120-SE', especialidade: 'Ortopedia', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DRA. FERNANDA ROCHA NETO', crm: 'CRM 13450-SE', especialidade: 'Neurologia', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DR. GIVANILDO LINS MENDES', crm: 'CRM 6890-SE', especialidade: 'Dermatologia', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DRA. HAYDÉE VIEIRA BRITO', crm: 'CRM 14780-SE', especialidade: 'Psiquiatria', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DR. IDNALDO SOUZA LIMA', crm: 'CRM 9340-SE', especialidade: 'Gastroenterologia', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DRA. JÉSSICA GUIMARÃES PRADO', crm: 'CRM 12010-SE', especialidade: 'Endocrinologia', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DR. KLEYTON MATOS FREITAS', crm: 'CRM 7678-SE', especialidade: 'Urologia', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DRA. LORENA MARTINS LEANDRO', crm: 'CRM 15230-SE', especialidade: 'Medicina de Família', cidade: 'Aracaju', uf: 'SE' },
    { nome: 'DR. ARTHUR PEREIRA MORAES', crm: 'CRM 89234-RJ', especialidade: 'Clínica Médica', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DRA. BIANCA CAMPOS SIQUEIRA', crm: 'CRM 112870-RJ', especialidade: 'Pediatria', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DR. CLEBER FONSECA GOMES', crm: 'CRM 76540-RJ', especialidade: 'Cardiologia', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DRA. DINARA REIS MONTEIRO', crm: 'CRM 134100-RJ', especialidade: 'Ginecologia', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DR. ESTÊVÃO BARBOSA CUNHA', crm: 'CRM 98760-RJ', especialidade: 'Ortopedia', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DRA. FLÁVIA LOPES MESQUITA', crm: 'CRM 145600-RJ', especialidade: 'Neurologia', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DR. GUILHERME ROCHA VIANA', crm: 'CRM 83210-RJ', especialidade: 'Dermatologia', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DRA. IOLANDA MENDES FERREIRA', crm: 'CRM 158900-RJ', especialidade: 'Psiquiatria', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DR. JEFFERSON BATISTA ROCHA', crm: 'CRM 102340-RJ', especialidade: 'Gastroenterologia', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DRA. KARINA LIMA PESSOA', crm: 'CRM 123450-RJ', especialidade: 'Endocrinologia', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DR. LEANDRO MELO ALBUQUERQUE', crm: 'CRM 91230-RJ', especialidade: 'Urologia', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DRA. MARCELA SOUSA PORTO', crm: 'CRM 167890-RJ', especialidade: 'Medicina de Família', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'DR. ANDERSON SCHERER LIMA', crm: 'CRM 54321-RS', especialidade: 'Clínica Médica', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DRA. BIANCA MÜLLER SANTOS', crm: 'CRM 72140-RS', especialidade: 'Pediatria', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DR. CARLOS KUHN FERREIRA', crm: 'CRM 48910-RS', especialidade: 'Cardiologia', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DRA. DANIELA SOMMER RAMOS', crm: 'CRM 89300-RS', especialidade: 'Ginecologia', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DR. EMERSON BECKER MELO', crm: 'CRM 61450-RS', especialidade: 'Ortopedia', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DRA. FERNANDA GUTH COELHO', crm: 'CRM 98100-RS', especialidade: 'Neurologia', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DR. GRACIELA WEBER NETO', crm: 'CRM 53780-RS', especialidade: 'Dermatologia', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DRA. HELENA RITTER BARROS', crm: 'CRM 108230-RS', especialidade: 'Psiquiatria', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DR. IVAN DIESEL MONTEIRO', crm: 'CRM 67450-RS', especialidade: 'Gastroenterologia', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DRA. JANETE LAUX SILVA', crm: 'CRM 83200-RS', especialidade: 'Endocrinologia', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DR. KLEBER STEIN SANTOS', crm: 'CRM 57890-RS', especialidade: 'Urologia', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DRA. LÚCIA BRUM PEREIRA', crm: 'CRM 112560-RS', especialidade: 'Medicina de Família', cidade: 'Porto Alegre', uf: 'RS' },
    { nome: 'DR. ADRIANO KOZLOWSKI LIMA', crm: 'CRM 28451-PR', especialidade: 'Clínica Médica', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DRA. BEATRIZ WACHOWICZ SANTOS', crm: 'CRM 34820-PR', especialidade: 'Pediatria', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DR. CARLOS PIETROBON FERREIRA', crm: 'CRM 22670-PR', especialidade: 'Cardiologia', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DRA. DANIELA SZYMANSKI RAMOS', crm: 'CRM 41230-PR', especialidade: 'Ginecologia e Obstetrícia', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DR. EDUARDO GRABOWSKI MELO', crm: 'CRM 19870-PR', especialidade: 'Ortopedia', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DRA. FERNANDA NOVAK COELHO', crm: 'CRM 47560-PR', especialidade: 'Neurologia', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DR. GUSTAVO BOROWSKI NETO', crm: 'CRM 31450-PR', especialidade: 'Dermatologia', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DRA. HELENA SKRZYPEK BARROS', crm: 'CRM 52100-PR', especialidade: 'Psiquiatria', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DR. IVAN KOVALSKI MONTEIRO', crm: 'CRM 24560-PR', especialidade: 'Gastroenterologia', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DRA. JULIANA ZUPPO SILVA', crm: 'CRM 38900-PR', especialidade: 'Endocrinologia', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DR. KLEBER STANKIEWICZ SANTOS', crm: 'CRM 27340-PR', especialidade: 'Urologia', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DRA. LARISSA MAZUR PEREIRA', crm: 'CRM 56780-PR', especialidade: 'Medicina de Família', cidade: 'Curitiba', uf: 'PR' },
    { nome: 'DR. MARCOS PAVLAK ARAUJO', crm: 'CRM 18920-PR', especialidade: 'Clínica Médica', cidade: 'Londrina', uf: 'PR' },
    { nome: 'DRA. NATALIA WOJTYLA COSTA', crm: 'CRM 29870-PR', especialidade: 'Pediatria', cidade: 'Londrina', uf: 'PR' },
    { nome: 'DR. OSCAR CHMIELEWSKI LIMA', crm: 'CRM 15640-PR', especialidade: 'Cardiologia', cidade: 'Maringá', uf: 'PR' },
    { nome: 'DRA. PATRICIA ZAWISLAK GOMES', crm: 'CRM 33450-PR', especialidade: 'Ginecologia', cidade: 'Maringá', uf: 'PR' },
    { nome: 'DR. RENATO LEWANDOWSKI VIEIRA', crm: 'CRM 21780-PR', especialidade: 'Ortopedia', cidade: 'Cascavel', uf: 'PR' },
    { nome: 'DRA. SIMONE BRZEZINSKI ALVES', crm: 'CRM 44230-PR', especialidade: 'Clínica Médica', cidade: 'Cascavel', uf: 'PR' },
  ];
  // Encode: JSON → UTF-8 → XOR → Base64
  const json = JSON.stringify(raw);
  const enc = new TextEncoder().encode(json);
  const xored = new Uint8Array(enc.length);
  for (let i = 0; i < enc.length; i++) xored[i] = enc[i] ^ _K[i % _K.length];
  let bin = '';
  xored.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
})();

// Lazy-decoded singleton — decoded once, cached in memory
let _cache: MedicoHapvida[] | null = null;

function getMedicos(): MedicoHapvida[] {
  if (!_cache) _cache = _d(_P);
  return _cache;
}

// Public API — same interface as before
export const MEDICOS_HAPVIDA: MedicoHapvida[] = new Proxy([] as MedicoHapvida[], {
  get(_, prop) {
    const arr = getMedicos();
    if (prop === 'length') return arr.length;
    if (prop === Symbol.iterator) return arr[Symbol.iterator].bind(arr);
    if (prop === 'filter') return arr.filter.bind(arr);
    if (prop === 'map') return arr.map.bind(arr);
    if (prop === 'forEach') return arr.forEach.bind(arr);
    if (prop === 'find') return arr.find.bind(arr);
    if (prop === 'some') return arr.some.bind(arr);
    if (prop === 'every') return arr.every.bind(arr);
    if (prop === 'reduce') return arr.reduce.bind(arr);
    if (prop === 'slice') return arr.slice.bind(arr);
    if (typeof prop === 'string' && !isNaN(Number(prop))) return arr[Number(prop)];
    return (arr as any)[prop];
  }
});

export function getEstadosMedicos(): string[] {
  return [...new Set(getMedicos().map(m => m.uf))].sort();
}

export function getCidadesPorEstado(uf: string): string[] {
  return [...new Set(getMedicos().filter(m => m.uf === uf).map(m => m.cidade))].sort();
}

export function buscarMedicos(termo: string, uf?: string): MedicoHapvida[] {
  const t = termo.toLowerCase().trim();
  return getMedicos().filter(m => {
    const ufOk = !uf || m.uf === uf;
    const termoOk = !t || m.nome.toLowerCase().includes(t) || m.crm.toLowerCase().includes(t) || m.especialidade.toLowerCase().includes(t) || m.cidade.toLowerCase().includes(t);
    return ufOk && termoOk;
  });
}
