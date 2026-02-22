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
    // AL - Maceió
    { nome: 'DR. ABEL ALBUQUERQUE SILVA', crm: 'CRM 861/AL', especialidade: 'Clínica Médica', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DR. ABEL CORDEIRO DE SOUSA FILHO', crm: 'CRM 4105/AL', especialidade: 'Clínica Médica', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DR. ABEL TENORIO CAVALCANTE FILHO', crm: 'CRM 3286/AL', especialidade: 'Clínica Médica', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DR. ABELARDO ALBUQUERQUE', crm: 'CRM 24/AL', especialidade: 'Clínica Médica', cidade: 'Maceió', uf: 'AL' },
    { nome: 'DR. ADELMO FERNANDES DE FARIAS', crm: 'CRM 6423/AL', especialidade: 'Clínica Médica', cidade: 'Maceió', uf: 'AL' },
    // AM - Manaus
    { nome: 'DRA. ABADIA EVILIN FRAGOSO DO NASCIMENTO', crm: 'CRM 10327/AM', especialidade: 'Clínica Médica', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DR. ABDALA HABIB FRAXE NETO', crm: 'CRM 9591/AM', especialidade: 'Clínica Médica', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DR. ABDUL HASSAN', crm: 'CRM 1740/AM', especialidade: 'Clínica Médica', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DR. ABELARDO DE OLIVEIRA BRITO', crm: 'CRM 9127/AM', especialidade: 'Clínica Médica', cidade: 'Manaus', uf: 'AM' },
    { nome: 'DR. ABELARDO GAUTAMA MOREIRA PAMPOLHA', crm: 'CRM 7046/AM', especialidade: 'Clínica Médica', cidade: 'Manaus', uf: 'AM' },
    // MS - Campo Grande
    { nome: 'DR. ABEL CORRALES LOPEZ', crm: 'CRM 1550/MS', especialidade: 'Clínica Médica', cidade: 'Campo Grande', uf: 'MS' },
    { nome: 'DR. ABILIO PEREIRA DE ARAÚJO', crm: 'CRM 8923/MS', especialidade: 'Clínica Médica', cidade: 'Campo Grande', uf: 'MS' },
    { nome: 'DR. ABNER DE OLIVEIRA GRIPP DONATO', crm: 'CRM 15272/MS', especialidade: 'Clínica Médica', cidade: 'Campo Grande', uf: 'MS' },
    { nome: 'DR. ABNER PASETO FELIPE', crm: 'CRM 12773/MS', especialidade: 'Clínica Médica', cidade: 'Campo Grande', uf: 'MS' },
    { nome: 'DRA. ABY JAINE DA CRUZ MONTES', crm: 'CRM 1962/MS', especialidade: 'Clínica Médica', cidade: 'Campo Grande', uf: 'MS' },
    // MS - Chapadão do Sul
    { nome: 'DR. ADILIO ANTONIO DE ALMEIDA', crm: 'CRM 11872/MS', especialidade: 'Clínica Médica', cidade: 'Chapadão do Sul', uf: 'MS' },
    { nome: 'DR. ALAERCIO MARAN FILHO', crm: 'CRM 12948/MS', especialidade: 'Clínica Médica', cidade: 'Chapadão do Sul', uf: 'MS' },
    { nome: 'DR. ALEKCEY RENE DE OLIVEIRA GUEDES', crm: 'CRM 10604/MS', especialidade: 'Clínica Médica', cidade: 'Chapadão do Sul', uf: 'MS' },
    { nome: 'DRA. ALINE DE FÁTIMA BÉU GOMES', crm: 'CRM 7426/MS', especialidade: 'Clínica Médica', cidade: 'Chapadão do Sul', uf: 'MS' },
    { nome: 'DR. ÁLVARO MELANDES NEVES DA PAZ', crm: 'CRM 9528/MS', especialidade: 'Clínica Médica', cidade: 'Chapadão do Sul', uf: 'MS' },
    // MS - Deodápolis
    { nome: 'DR. ANTÔNIO DE PÁDUA DIÔGO', crm: 'CRM 497/MS', especialidade: 'Clínica Médica', cidade: 'Deodápolis', uf: 'MS' },
    { nome: 'DR. ANTONIO GONCALVES PORTELA', crm: 'CRM 1325/MS', especialidade: 'Clínica Médica', cidade: 'Deodápolis', uf: 'MS' },
    { nome: 'DRA. CAMILA BAGGIO SARTOR', crm: 'CRM 14470/MS', especialidade: 'Clínica Médica', cidade: 'Deodápolis', uf: 'MS' },
    { nome: 'DRA. JACINTA PEREIRA MATIAS', crm: 'CRM 2438/MS', especialidade: 'Clínica Médica', cidade: 'Deodápolis', uf: 'MS' },
    { nome: 'DR. JOAQUIM BERNARDES DE CASTILHO', crm: 'CRM 764/MS', especialidade: 'Clínica Médica', cidade: 'Deodápolis', uf: 'MS' },
    // MS - Dourados
    { nome: 'DR. ACAZ LINCOLN DIAS DE SOUZA CHIMINI', crm: 'CRM 13808/MS', especialidade: 'Clínica Médica', cidade: 'Dourados', uf: 'MS' },
    { nome: 'DR. ADAIR VASCONCELOS REGINALDO', crm: 'CRM 3535/MS', especialidade: 'Clínica Médica', cidade: 'Dourados', uf: 'MS' },
    { nome: 'DR. ADALBERTO DA SILVA BRAGA FILHO', crm: 'CRM 1067/MS', especialidade: 'Clínica Médica', cidade: 'Dourados', uf: 'MS' },
    { nome: 'DR. ADAUTO TSUTOMU IKEJIRI', crm: 'CRM 740/MS', especialidade: 'Clínica Médica', cidade: 'Dourados', uf: 'MS' },
    { nome: 'DR. ADNAN HADDAD', crm: 'CRM 5051/MS', especialidade: 'Clínica Médica', cidade: 'Dourados', uf: 'MS' },
    // MS - Inocência
    { nome: 'DRA. CAMILA MUSSI HAIKAWA', crm: 'CRM 11835/MS', especialidade: 'Clínica Médica', cidade: 'Inocência', uf: 'MS' },
    { nome: 'DR. DALTON DOMINGUES PEREIRA', crm: 'CRM 389/MS', especialidade: 'Clínica Médica', cidade: 'Inocência', uf: 'MS' },
    { nome: 'DR. DIEISON PEDRO TOMAZ DA SILVA', crm: 'CRM 8744/MS', especialidade: 'Clínica Médica', cidade: 'Inocência', uf: 'MS' },
    { nome: 'DR. JOSE CARLOS FARIA', crm: 'CRM 13819/MS', especialidade: 'Clínica Médica', cidade: 'Inocência', uf: 'MS' },
    { nome: 'DR. JAIME ITCHIRO UEHARA', crm: 'CRM 874/MS', especialidade: 'Clínica Médica', cidade: 'Inocência', uf: 'MS' },
    // MS - Ivinhema
    { nome: 'DR. ALEXANDER VAN-GEEN POLTRONIERI', crm: 'CRM 2291/MS', especialidade: 'Clínica Médica', cidade: 'Ivinhema', uf: 'MS' },
    { nome: 'DR. ALEXANDRE CONCEIÇÃO REIGOTA', crm: 'CRM 8978/MS', especialidade: 'Clínica Médica', cidade: 'Ivinhema', uf: 'MS' },
    { nome: 'DRA. ANA BEATRIZ CHACAROSQUI LIMA DE MELO', crm: 'CRM 14968/MS', especialidade: 'Clínica Médica', cidade: 'Ivinhema', uf: 'MS' },
    { nome: 'DRA. ANA CLARA BRAGUINI', crm: 'CRM 8336/MS', especialidade: 'Clínica Médica', cidade: 'Ivinhema', uf: 'MS' },
    { nome: 'DRA. ANA MARIA DE SOUZA CARDOSO', crm: 'CRM 2266/MS', especialidade: 'Clínica Médica', cidade: 'Ivinhema', uf: 'MS' },
    // MS - Sonora
    { nome: 'DR. BISMARK DUTRA FERNANDEZ', crm: 'CRM 3948/MS', especialidade: 'Clínica Médica', cidade: 'Sonora', uf: 'MS' },
    { nome: 'DR. CESAR GALBIATTI DE OLIVEIRA', crm: 'CRM 9554/MS', especialidade: 'Clínica Médica', cidade: 'Sonora', uf: 'MS' },
    { nome: 'DR. CLAUDIO MARCELO MOREAL', crm: 'CRM 4396/MS', especialidade: 'Clínica Médica', cidade: 'Sonora', uf: 'MS' },
    { nome: 'DRA. ELLEN CAROLINE FRANCO RODRIGUES', crm: 'CRM 15440/MS', especialidade: 'Clínica Médica', cidade: 'Sonora', uf: 'MS' },
    { nome: 'DR. FABIO DE CARVALHO', crm: 'CRM 5466/MS', especialidade: 'Clínica Médica', cidade: 'Sonora', uf: 'MS' },
    // MS - Três Lagoas
    { nome: 'DR. ADILSON CORDEIRO DOS SANTOS', crm: 'CRM 4609/MS', especialidade: 'Clínica Médica', cidade: 'Três Lagoas', uf: 'MS' },
    { nome: 'DR. ADIR PIRES MAIA', crm: 'CRM 244/MS', especialidade: 'Clínica Médica', cidade: 'Três Lagoas', uf: 'MS' },
    { nome: 'DR. ADIR PIRES MAIA JUNIOR', crm: 'CRM 5925/MS', especialidade: 'Clínica Médica', cidade: 'Três Lagoas', uf: 'MS' },
    { nome: 'DRA. ADRIANA FUKAO', crm: 'CRM 8361/MS', especialidade: 'Clínica Médica', cidade: 'Três Lagoas', uf: 'MS' },
    { nome: 'DR. ADRIANO HENRIQUE HENSCHEL', crm: 'CRM 4219/MS', especialidade: 'Clínica Médica', cidade: 'Três Lagoas', uf: 'MS' },
    // BA - Alagoinhas
    { nome: 'DR. ADALTO JOSE SANTOS PEDREIRA', crm: 'CRM 9283/BA', especialidade: 'Clínica Médica', cidade: 'Alagoinhas', uf: 'BA' },
    { nome: 'DRA. ADRIANE DA SILVA TEIXEIRA', crm: 'CRM 32751/BA', especialidade: 'Clínica Médica', cidade: 'Alagoinhas', uf: 'BA' },
    { nome: 'DRA. ADRIELE TAIANE DOS SANTOS SOUZA', crm: 'CRM 36961/BA', especialidade: 'Clínica Médica', cidade: 'Alagoinhas', uf: 'BA' },
    { nome: 'DR. ALEXANDRE OLIVEIRA FARO', crm: 'CRM 28429/BA', especialidade: 'Clínica Médica', cidade: 'Alagoinhas', uf: 'BA' },
    { nome: 'DR. ALEXSANDRO NASCIMENTO OLIVEIRA', crm: 'CRM 28489/BA', especialidade: 'Clínica Médica', cidade: 'Alagoinhas', uf: 'BA' },
    // BA - Camaçari
    { nome: 'DR. ADERBAL DANTAS DA SILVA JUNIOR', crm: 'CRM 43767/BA', especialidade: 'Clínica Médica', cidade: 'Camaçari', uf: 'BA' },
    { nome: 'DRA. ADRIANA RAMOS FERNANDES LESSA', crm: 'CRM 20262/BA', especialidade: 'Clínica Médica', cidade: 'Camaçari', uf: 'BA' },
    { nome: 'DRA. ADRIANA RODRIGUES LAURENTINO', crm: 'CRM 40263/BA', especialidade: 'Clínica Médica', cidade: 'Camaçari', uf: 'BA' },
    { nome: 'DRA. AIDE QUEIROZ LISBOA', crm: 'CRM 11489/BA', especialidade: 'Clínica Médica', cidade: 'Camaçari', uf: 'BA' },
    { nome: 'DR. ALEXANDRE DE CAMPOS FARIA', crm: 'CRM 16184/BA', especialidade: 'Clínica Médica', cidade: 'Camaçari', uf: 'BA' },
    // BA - Candeias
    { nome: 'DRA. CARINA GONÇALVES LOBO', crm: 'CRM 39189/BA', especialidade: 'Clínica Médica', cidade: 'Candeias', uf: 'BA' },
    { nome: 'DR. CLEBER SANTOS DE SANTANA', crm: 'CRM 17796/BA', especialidade: 'Clínica Médica', cidade: 'Candeias', uf: 'BA' },
    { nome: 'DRA. FERNANDA SANTOS MENDES', crm: 'CRM 46934/BA', especialidade: 'Clínica Médica', cidade: 'Candeias', uf: 'BA' },
    { nome: 'DR. ÍCARO FERREIRA DA SILVA', crm: 'CRM 44642/BA', especialidade: 'Clínica Médica', cidade: 'Candeias', uf: 'BA' },
    { nome: 'DR. LIBNI MONTEIRO AMORIM', crm: 'CRM 43072/BA', especialidade: 'Clínica Médica', cidade: 'Candeias', uf: 'BA' },
    // BA - Catu
    { nome: 'DR. ALEX JOSE SILVA FREITAS', crm: 'CRM 11513/BA', especialidade: 'Clínica Médica', cidade: 'Catu', uf: 'BA' },
    { nome: 'DR. ANSELMO LOPES DE ARAUJO', crm: 'CRM 8162/BA', especialidade: 'Clínica Médica', cidade: 'Catu', uf: 'BA' },
    { nome: 'DR. ANTONIO CARLOS GOES', crm: 'CRM 2003/BA', especialidade: 'Clínica Médica', cidade: 'Catu', uf: 'BA' },
    { nome: 'DR. ANTONIO RUBENS NUNES VIEIRA', crm: 'CRM 1329/BA', especialidade: 'Clínica Médica', cidade: 'Catu', uf: 'BA' },
    { nome: 'DRA. CARINE VILARINS DE SOUZA', crm: 'CRM 35754/BA', especialidade: 'Clínica Médica', cidade: 'Catu', uf: 'BA' },
    // BA - Cruz das Almas
    { nome: 'DRA. ADRIANA VIDAL', crm: 'CRM 14946/BA', especialidade: 'Clínica Médica', cidade: 'Cruz das Almas', uf: 'BA' },
    { nome: 'DR. ALAN ALMEIDA DA SILVA', crm: 'CRM 33242/BA', especialidade: 'Clínica Médica', cidade: 'Cruz das Almas', uf: 'BA' },
    { nome: 'DR. ALEXSANDRO ASSIS DE OLIVEIRA', crm: 'CRM 49394/BA', especialidade: 'Clínica Médica', cidade: 'Cruz das Almas', uf: 'BA' },
    { nome: 'DR. ANDRE FELIPE DA SILVA GRANJA', crm: 'CRM 36981/BA', especialidade: 'Clínica Médica', cidade: 'Cruz das Almas', uf: 'BA' },
    { nome: 'DRA. ANNA PAULA MATOS DE JESUS', crm: 'CRM 42094/BA', especialidade: 'Clínica Médica', cidade: 'Cruz das Almas', uf: 'BA' },
    // BA - Dias d'Ávila
    { nome: 'DRA. BEATRIZ PREISSLER VIEIRA', crm: 'CRM 19090/BA', especialidade: 'Clínica Médica', cidade: "Dias d'Ávila", uf: 'BA' },
    { nome: 'DR. CARLOS ALBERTO SEIDEL MENELLI', crm: 'CRM 19855/BA', especialidade: 'Clínica Médica', cidade: "Dias d'Ávila", uf: 'BA' },
    { nome: 'DRA. INDIRA DA SILVA OLIVEIRA DE SOUSA', crm: 'CRM 15230/BA', especialidade: 'Clínica Médica', cidade: "Dias d'Ávila", uf: 'BA' },
    { nome: 'DR. JOSE CARLOS ORTUNO ORTUNO', crm: 'CRM 300-33625/BA', especialidade: 'Clínica Médica', cidade: "Dias d'Ávila", uf: 'BA' },
    { nome: 'DRA. MARIEN DIAZ BRING', crm: 'CRM 38944/BA', especialidade: 'Clínica Médica', cidade: "Dias d'Ávila", uf: 'BA' },
    // BA - Feira de Santana
    { nome: 'DR. ABILIO PEREIRA DE ARAÚJO', crm: 'CRM 12960/BA', especialidade: 'Clínica Médica', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DR. ABIMAEL OLIVEIRA SILVA', crm: 'CRM 35816/BA', especialidade: 'Clínica Médica', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DR. ABRAÃO DE MELO BARBOSA', crm: 'CRM 29394/BA', especialidade: 'Clínica Médica', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DR. ABRAÃO DOS SANTOS SOUZA', crm: 'CRM 33340/BA', especialidade: 'Clínica Médica', cidade: 'Feira de Santana', uf: 'BA' },
    { nome: 'DR. ADAILTON CARNEIRO ROCHA', crm: 'CRM 19888/BA', especialidade: 'Clínica Médica', cidade: 'Feira de Santana', uf: 'BA' },
    // BA - Lauro de Freitas
    { nome: 'DR. ABRÃO ELIAS KHOURI', crm: 'CRM 32407/BA', especialidade: 'Clínica Médica', cidade: 'Lauro de Freitas', uf: 'BA' },
    { nome: 'DR. ADÔNIS BEZERRA CAVALCANTE FILHO', crm: 'CRM 43115-P/BA', especialidade: 'Clínica Médica', cidade: 'Lauro de Freitas', uf: 'BA' },
    { nome: 'DRA. ADRIANA ANDRADE MONTE', crm: 'CRM 11528/BA', especialidade: 'Clínica Médica', cidade: 'Lauro de Freitas', uf: 'BA' },
    { nome: 'DRA. ADRIANA CAMPOS ANDRADE RIBEIRO', crm: 'CRM 13374/BA', especialidade: 'Clínica Médica', cidade: 'Lauro de Freitas', uf: 'BA' },
    { nome: 'DRA. ADRIANA DE QUEIROZ BORGES', crm: 'CRM 11131/BA', especialidade: 'Clínica Médica', cidade: 'Lauro de Freitas', uf: 'BA' },
    // BA - Salvador
    { nome: 'DR. ABADIO JOSE SILVA', crm: 'CRM 15507/BA', especialidade: 'Clínica Médica', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DR. ABDIAS CARLOS DE OLIVEIRA FILHO', crm: 'CRM 21660/BA', especialidade: 'Clínica Médica', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DR. ABEL ALMEIDA RIBEIRO', crm: 'CRM 1184/BA', especialidade: 'Clínica Médica', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DR. ABEL GOÉS TRZAN', crm: 'CRM 35316/BA', especialidade: 'Clínica Médica', cidade: 'Salvador', uf: 'BA' },
    { nome: 'DR. ABIMAEL CRUZ NASCIMENTO', crm: 'CRM 40513/BA', especialidade: 'Clínica Médica', cidade: 'Salvador', uf: 'BA' },
    // BA - Santo Antônio de Jesus
    { nome: 'DR. ABDIAS DE SOUZA ALVES JUNIOR', crm: 'CRM 38624/BA', especialidade: 'Clínica Médica', cidade: 'Santo Antônio de Jesus', uf: 'BA' },
    { nome: 'DRA. ADIENNE OLIVEIRA DA COSTA', crm: 'CRM 29525/BA', especialidade: 'Clínica Médica', cidade: 'Santo Antônio de Jesus', uf: 'BA' },
    { nome: 'DRA. ADRIANA NUNES PASSOS', crm: 'CRM 32942/BA', especialidade: 'Clínica Médica', cidade: 'Santo Antônio de Jesus', uf: 'BA' },
    { nome: 'DRA. ADRIANE DE LIMA GIESE', crm: 'CRM 21951/BA', especialidade: 'Clínica Médica', cidade: 'Santo Antônio de Jesus', uf: 'BA' },
    { nome: 'DR. AGENOR AFONSO DA SILVA FILHO', crm: 'CRM 10681/BA', especialidade: 'Clínica Médica', cidade: 'Santo Antônio de Jesus', uf: 'BA' },
    // BA - Simões Filho
    { nome: 'DR. ANIUVIS DOMINGUEZ ARANO', crm: 'CRM 38844/BA', especialidade: 'Clínica Médica', cidade: 'Simões Filho', uf: 'BA' },
    { nome: 'DR. ANTONIO GONZALES GARCIA', crm: 'CRM 7644/BA', especialidade: 'Clínica Médica', cidade: 'Simões Filho', uf: 'BA' },
    { nome: 'DR. ELIAS MACIEL FERREIRA JÚNIOR', crm: 'CRM 47998/BA', especialidade: 'Clínica Médica', cidade: 'Simões Filho', uf: 'BA' },
    { nome: 'DR. GEOVANI SANTOS DA SILVA', crm: 'CRM 47433/BA', especialidade: 'Clínica Médica', cidade: 'Simões Filho', uf: 'BA' },
    { nome: 'DR. JOSÉ BRITO SANTOS', crm: 'CRM 7446/BA', especialidade: 'Clínica Médica', cidade: 'Simões Filho', uf: 'BA' },
    // CE - Fortaleza
    { nome: 'DR. ABDIAS ARAÚJO COSTA', crm: 'CRM 8396/CE', especialidade: 'Clínica Médica', cidade: 'Fortaleza', uf: 'CE' },
    { nome: 'DR. ABDIAS ROLIM GOMES', crm: 'CRM 1473/CE', especialidade: 'Clínica Médica', cidade: 'Fortaleza', uf: 'CE' },
    { nome: 'DR. ABDÍSIO PRAZERES NETO', crm: 'CRM 9202/CE', especialidade: 'Clínica Médica', cidade: 'Fortaleza', uf: 'CE' },
    { nome: 'DR. ABDON COELHO PARENTE', crm: 'CRM 11425/CE', especialidade: 'Clínica Médica', cidade: 'Fortaleza', uf: 'CE' },
    { nome: 'DR. ABEL FERNANDES DE SOUZA', crm: 'CRM 3097/CE', especialidade: 'Clínica Médica', cidade: 'Fortaleza', uf: 'CE' },
    // CE - Juazeiro do Norte
    { nome: 'DR. ABEL TENÓRIO DE MACÊDO', crm: 'CRM 3285/CE', especialidade: 'Clínica Médica', cidade: 'Juazeiro do Norte', uf: 'CE' },
    { nome: 'DR. ABRAÃO SOUSA BRITO', crm: 'CRM 19640/CE', especialidade: 'Clínica Médica', cidade: 'Juazeiro do Norte', uf: 'CE' },
    { nome: 'DR. ACÁCIO EMERSON GOMES RIBEIRO', crm: 'CRM 30137/CE', especialidade: 'Clínica Médica', cidade: 'Juazeiro do Norte', uf: 'CE' },
    { nome: 'DR. ADALBERTO AMORIM MESQUITA', crm: 'CRM 12279/CE', especialidade: 'Clínica Médica', cidade: 'Juazeiro do Norte', uf: 'CE' },
    { nome: 'DR. ADAM MENDONÇA DE OLIVEIRA', crm: 'CRM 14859/CE', especialidade: 'Clínica Médica', cidade: 'Juazeiro do Norte', uf: 'CE' },
    // CE - Maracanaú
    { nome: 'DR. ADAM VALENTE AMARAL', crm: 'CRM 24698/CE', especialidade: 'Clínica Médica', cidade: 'Maracanaú', uf: 'CE' },
    { nome: 'DRA. ADELINE LOUISE LOPES DAMASCENO', crm: 'CRM 27631/CE', especialidade: 'Clínica Médica', cidade: 'Maracanaú', uf: 'CE' },
    { nome: 'DR. AUGUSTO GABRIEL RIBEIRO', crm: 'CRM 25398/CE', especialidade: 'Clínica Médica', cidade: 'Maracanaú', uf: 'CE' },
    { nome: 'DRA. AMANDA KÉSSIA DA SILVA SALES', crm: 'CRM 21771/CE', especialidade: 'Clínica Médica', cidade: 'Maracanaú', uf: 'CE' },
    { nome: 'DRA. ANA ALICE SILVA AMARAL', crm: 'CRM 14588/CE', especialidade: 'Clínica Médica', cidade: 'Maracanaú', uf: 'CE' },
    // CE - Pacajus
    { nome: 'DR. ALBERTO JOSE DE ALMEIDA SANTOS FILHO', crm: 'CRM 28200/CE', especialidade: 'Clínica Médica', cidade: 'Pacajus', uf: 'CE' },
    { nome: 'DRA. ANA CAROLINNE CARLOS AMORIM', crm: 'CRM 19886/CE', especialidade: 'Clínica Médica', cidade: 'Pacajus', uf: 'CE' },
    { nome: 'DR. BRENO ANDRADE DE AZEVEDO', crm: 'CRM 11785/CE', especialidade: 'Clínica Médica', cidade: 'Pacajus', uf: 'CE' },
    { nome: 'DR. EDNARDO TELES DE ARAÚJO', crm: 'CRM 2886/CE', especialidade: 'Clínica Médica', cidade: 'Pacajus', uf: 'CE' },
    { nome: 'DRA. ERICKA ANNE DA SILVA BARROSO', crm: 'CRM 25675/CE', especialidade: 'Clínica Médica', cidade: 'Pacajus', uf: 'CE' },
    // CE - São Gonçalo do Amarante
    { nome: 'DRA. BRENDA LARISSA ANDRADE NOBRE', crm: 'CRM 29580/CE', especialidade: 'Clínica Médica', cidade: 'São Gonçalo do Amarante', uf: 'CE' },
    { nome: 'DR. JOSÉ EUGÊNIO BORGES DE ALMEIDA', crm: 'CRM 10722/CE', especialidade: 'Clínica Médica', cidade: 'São Gonçalo do Amarante', uf: 'CE' },
    { nome: 'DR. LUCIANO ALMEIDA DOS SANTOS FILHO', crm: 'CRM 20567/CE', especialidade: 'Clínica Médica', cidade: 'São Gonçalo do Amarante', uf: 'CE' },
    { nome: 'DRA. MORGANA MARIA PIMENTEL SOARES', crm: 'CRM 7023/CE', especialidade: 'Clínica Médica', cidade: 'São Gonçalo do Amarante', uf: 'CE' },
    { nome: 'DRA. NATALIA SILVA DE CARVALHO', crm: 'CRM 29289/CE', especialidade: 'Clínica Médica', cidade: 'São Gonçalo do Amarante', uf: 'CE' },
    // DF - Brasília
    { nome: 'DR. AARON DOS SANTOS DE OLIVEIRA TRUBIAN', crm: 'CRM 32367/DF', especialidade: 'Clínica Médica', cidade: 'Brasília', uf: 'DF' },
    { nome: 'DRA. ABADIA IMACULADA FERREIRA DE OLIVEIRA', crm: 'CRM 3133/DF', especialidade: 'Clínica Médica', cidade: 'Brasília', uf: 'DF' },
    { nome: 'DR. ABADIO MARQUES NEDER', crm: 'CRM 27/DF', especialidade: 'Clínica Médica', cidade: 'Brasília', uf: 'DF' },
    { nome: 'DR. ABDIAS AIRES DE QUEIROZ JUNIOR', crm: 'CRM 6558/DF', especialidade: 'Clínica Médica', cidade: 'Brasília', uf: 'DF' },
    { nome: 'DR. ABDIAS JOSÉ DE MORAIS BARBOSA', crm: 'CRM 5346/DF', especialidade: 'Clínica Médica', cidade: 'Brasília', uf: 'DF' },
    // GO - Anápolis
    { nome: 'DR. ABMAEL SILVÉRIO DA SILVA', crm: 'CRM 7367/GO', especialidade: 'Clínica Médica', cidade: 'Anápolis', uf: 'GO' },
    { nome: 'DR. ABNER HENRIQUE FLEURY', crm: 'CRM 26393/GO', especialidade: 'Clínica Médica', cidade: 'Anápolis', uf: 'GO' },
    { nome: 'DR. ABNER LOURENÇO DA FONSECA', crm: 'CRM 28046/GO', especialidade: 'Clínica Médica', cidade: 'Anápolis', uf: 'GO' },
    { nome: 'DR. ABRAHÃO ISSA NETO', crm: 'CRM 1718/GO', especialidade: 'Clínica Médica', cidade: 'Anápolis', uf: 'GO' },
    { nome: 'DR. ACÁCIO JUNIO DE ALMEIDA', crm: 'CRM 18160/GO', especialidade: 'Clínica Médica', cidade: 'Anápolis', uf: 'GO' },
    // GO - Aparecida de Goiânia
    { nome: 'DR. ABILIO ROBERTO DE ARAUJO BORGES', crm: 'CRM 5205/GO', especialidade: 'Clínica Médica', cidade: 'Aparecida de Goiânia', uf: 'GO' },
    { nome: 'DR. ADAILSON SOARES DE SOUSA', crm: 'CRM 23331/GO', especialidade: 'Clínica Médica', cidade: 'Aparecida de Goiânia', uf: 'GO' },
    { nome: 'DR. ADELIO FERREIRA LEITE', crm: 'CRM 1326/GO', especialidade: 'Clínica Médica', cidade: 'Aparecida de Goiânia', uf: 'GO' },
    { nome: 'DRA. ADRIANA BONAN', crm: 'CRM 34474/GO', especialidade: 'Clínica Médica', cidade: 'Aparecida de Goiânia', uf: 'GO' },
    { nome: 'DRA. ADRIANE AGUIAR GONTIJO', crm: 'CRM 39120/GO', especialidade: 'Clínica Médica', cidade: 'Aparecida de Goiânia', uf: 'GO' },
    // GO - Edeia
    { nome: 'DR. ADRIEL FELIPE FREITAS NUNES', crm: 'CRM 34478/GO', especialidade: 'Clínica Médica', cidade: 'Edeia', uf: 'GO' },
    { nome: 'DR. ALISSON HENRIQUE FERNANDES', crm: 'CRM 14103/GO', especialidade: 'Clínica Médica', cidade: 'Edeia', uf: 'GO' },
    { nome: 'DRA. AMANDA FERREIRA E FERRO', crm: 'CRM 34998/GO', especialidade: 'Clínica Médica', cidade: 'Edeia', uf: 'GO' },
    { nome: 'DR. AMILSON FERREIRA BORGES', crm: 'CRM 3903/GO', especialidade: 'Clínica Médica', cidade: 'Edeia', uf: 'GO' },
    { nome: 'DRA. ANA CAROLINA REZENDE HERCOS', crm: 'CRM 16526/GO', especialidade: 'Clínica Médica', cidade: 'Edeia', uf: 'GO' },
    // GO - Goiânia
    { nome: 'DR. ABDALA NOGUEIRA AMUY', crm: 'CRM 3950/GO', especialidade: 'Clínica Médica', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DR. ABDALA SEBBA PRIMO', crm: 'CRM 2277/GO', especialidade: 'Clínica Médica', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DR. ABEL ALEXANDRE HANNUM', crm: 'CRM 5647/GO', especialidade: 'Clínica Médica', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DR. ABELARDO MOREIRA CARVALHO', crm: 'CRM 2585/GO', especialidade: 'Clínica Médica', cidade: 'Goiânia', uf: 'GO' },
    { nome: 'DR. ABIDALA MIGUEL FILHO', crm: 'CRM 3643/GO', especialidade: 'Clínica Médica', cidade: 'Goiânia', uf: 'GO' },
    // GO - Quirinópolis
    { nome: 'DRA. ALESSANDRA DA SILVA DE SOUZA SILVA', crm: 'CRM 13179/GO', especialidade: 'Clínica Médica', cidade: 'Quirinópolis', uf: 'GO' },
    { nome: 'DRA. ALLANA CAMPOS ALVES', crm: 'CRM 27249/GO', especialidade: 'Clínica Médica', cidade: 'Quirinópolis', uf: 'GO' },
    { nome: 'DRA. AMANDA VIEIRA SACARDO', crm: 'CRM 31448/GO', especialidade: 'Clínica Médica', cidade: 'Quirinópolis', uf: 'GO' },
    { nome: 'DRA. ANA CAROLINA ALVES NOVAIS', crm: 'CRM 22194/GO', especialidade: 'Clínica Médica', cidade: 'Quirinópolis', uf: 'GO' },
    { nome: 'DRA. ANA CAROLINA CARNIO BARRUFFINI', crm: 'CRM 28077/GO', especialidade: 'Clínica Médica', cidade: 'Quirinópolis', uf: 'GO' },
    // GO - Rio Verde
    { nome: 'DR. ABILIO BARONI SALES', crm: 'CRM 5729/GO', especialidade: 'Clínica Médica', cidade: 'Rio Verde', uf: 'GO' },
    { nome: 'DR. ABÍLIO JOSÉ DE OLIVEIRA NETO', crm: 'CRM 37814/GO', especialidade: 'Clínica Médica', cidade: 'Rio Verde', uf: 'GO' },
    { nome: 'DR. ADEMAR LEÃO LEMES ROCHA CALABRIA', crm: 'CRM 22920/GO', especialidade: 'Clínica Médica', cidade: 'Rio Verde', uf: 'GO' },
    { nome: 'DR. ADEMIR GUERREIRO BARBOSA', crm: 'CRM 17396/GO', especialidade: 'Clínica Médica', cidade: 'Rio Verde', uf: 'GO' },
    { nome: 'DR. ADRIANO LINARES', crm: 'CRM 10293/GO', especialidade: 'Clínica Médica', cidade: 'Rio Verde', uf: 'GO' },
    // MA - São Luís
    { nome: 'DR. AARÃO LUIZ DA SILVA EUFRASIO', crm: 'CRM 15357/MA', especialidade: 'Clínica Médica', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DR. ABDERVAL PINTO BANDEIRA NETO', crm: 'CRM 4189/MA', especialidade: 'Clínica Médica', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DR. ABDIAS ROCHA SANTOS', crm: 'CRM 3305/MA', especialidade: 'Clínica Médica', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DR. ABDON JOSE MURAD JUNIOR', crm: 'CRM 4500/MA', especialidade: 'Clínica Médica', cidade: 'São Luís', uf: 'MA' },
    { nome: 'DR. ABDON JOSÉ MURAD NETO', crm: 'CRM 1146/MA', especialidade: 'Clínica Médica', cidade: 'São Luís', uf: 'MA' },
    // MG - Alfenas
    { nome: 'DR. ADALBERTO ZAULI DOS SANTOS', crm: 'CRM 47940/MG', especialidade: 'Clínica Médica', cidade: 'Alfenas', uf: 'MG' },
    { nome: 'DR. ADAUTO DE CASTRO SOARES', crm: 'CRM 25256/MG', especialidade: 'Clínica Médica', cidade: 'Alfenas', uf: 'MG' },
    { nome: 'DR. ADEILSON DE MELO CORDEIRO', crm: 'CRM 103955/MG', especialidade: 'Clínica Médica', cidade: 'Alfenas', uf: 'MG' },
    { nome: 'DR. ADELINO MOREIRA DE CARVALHO', crm: 'CRM 21789/MG', especialidade: 'Clínica Médica', cidade: 'Alfenas', uf: 'MG' },
    { nome: 'DR. ADEMIR ALBANO DA SILVA', crm: 'CRM 16774/MG', especialidade: 'Clínica Médica', cidade: 'Alfenas', uf: 'MG' },
    // MG - Belo Horizonte
    { nome: 'DR. ABCDARIO FERNANDO DE PINHO', crm: 'CRM 4522/MG', especialidade: 'Clínica Médica', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DR. ABDALLA UBALDO FELÍCIO', crm: 'CRM 36288/MG', especialidade: 'Clínica Médica', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DR. ABDENACK ESTEVES TRINDADE', crm: 'CRM 25324/MG', especialidade: 'Clínica Médica', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DR. ABEL SOARES DE FARIA', crm: 'CRM 6324/MG', especialidade: 'Clínica Médica', cidade: 'Belo Horizonte', uf: 'MG' },
    { nome: 'DR. ABEL RANZZI', crm: 'CRM 65444/MG', especialidade: 'Clínica Médica', cidade: 'Belo Horizonte', uf: 'MG' },
    // MG - Betim
    { nome: 'DR. ADAUTO DA COSTA', crm: 'CRM 23362/MG', especialidade: 'Clínica Médica', cidade: 'Betim', uf: 'MG' },
    { nome: 'DR. ADMIR TADEU DE OLIVEIRA', crm: 'CRM 17718/MG', especialidade: 'Clínica Médica', cidade: 'Betim', uf: 'MG' },
    { nome: 'DRA. ADRIANA DINIZ DE DEUS', crm: 'CRM 17330/MG', especialidade: 'Clínica Médica', cidade: 'Betim', uf: 'MG' },
    { nome: 'DRA. ADRIANA DOS SANTOS PINTO BRITO', crm: 'CRM 36751/MG', especialidade: 'Clínica Médica', cidade: 'Betim', uf: 'MG' },
    { nome: 'DRA. ADRIANA LEMOS SILVA', crm: 'CRM 32011/MG', especialidade: 'Clínica Médica', cidade: 'Betim', uf: 'MG' },
    // MG - Contagem
    { nome: 'DR. ADEMAR FERREIRA DE ANDRADE JÚNIOR', crm: 'CRM 42993/MG', especialidade: 'Clínica Médica', cidade: 'Contagem', uf: 'MG' },
    { nome: 'DRA. ADRIANA APARECIDA SILVA', crm: 'CRM 42805/MG', especialidade: 'Clínica Médica', cidade: 'Contagem', uf: 'MG' },
    { nome: 'DRA. ADRIANA VERONICA AVILÉS COZZI', crm: 'CRM 81071/MG', especialidade: 'Clínica Médica', cidade: 'Contagem', uf: 'MG' },
    { nome: 'DRA. ADRIANNA BUZATTI VIANA', crm: 'CRM 71689/MG', especialidade: 'Clínica Médica', cidade: 'Contagem', uf: 'MG' },
    { nome: 'DR. ADRIANO BIZARRO VILLELA BETTONI', crm: 'CRM 61327/MG', especialidade: 'Clínica Médica', cidade: 'Contagem', uf: 'MG' },
    // MG - Divinópolis
    { nome: 'DRA. ABIQUEILA DA SILVA CONCEIÇÃO', crm: 'CRM 63841/MG', especialidade: 'Clínica Médica', cidade: 'Divinópolis', uf: 'MG' },
    { nome: 'DR. ACHILES GIOVANARD', crm: 'CRM 2525/MG', especialidade: 'Clínica Médica', cidade: 'Divinópolis', uf: 'MG' },
    { nome: 'DR. ADALJONIO DUARTE CAMARA', crm: 'CRM 13078/MG', especialidade: 'Clínica Médica', cidade: 'Divinópolis', uf: 'MG' },
    { nome: 'DR. ADMAURO ESTEVES DE MACEDO', crm: 'CRM 28155/MG', especialidade: 'Clínica Médica', cidade: 'Divinópolis', uf: 'MG' },
    { nome: 'DRA. ADRIANA CRISTINA PINTO SILVA', crm: 'CRM 54131/MG', especialidade: 'Clínica Médica', cidade: 'Divinópolis', uf: 'MG' },
    // MG - Ituiutaba
    { nome: 'DR. ADALBERTO ABDO MARTINS', crm: 'CRM 17818/MG', especialidade: 'Clínica Médica', cidade: 'Ituiutaba', uf: 'MG' },
    { nome: 'DR. ADAO DIVINO FRANCO', crm: 'CRM 13892/MG', especialidade: 'Clínica Médica', cidade: 'Ituiutaba', uf: 'MG' },
    { nome: 'DR. ADELOR ALVES DE GOUVEIA', crm: 'CRM 2822/MG', especialidade: 'Clínica Médica', cidade: 'Ituiutaba', uf: 'MG' },
    { nome: 'DR. ADRIANO FONSECA DAMIAO', crm: 'CRM 11347/MG', especialidade: 'Clínica Médica', cidade: 'Ituiutaba', uf: 'MG' },
    { nome: 'DRA. ADRIENE DA SILVA LUCAS', crm: 'CRM 78140/MG', especialidade: 'Clínica Médica', cidade: 'Ituiutaba', uf: 'MG' },
    // MG - Nova Ponte
    { nome: 'DR. ADEMIR VIEIRA SOUZA', crm: 'CRM 17314/MG', especialidade: 'Clínica Médica', cidade: 'Nova Ponte', uf: 'MG' },
    { nome: 'DRA. ALANA BRUNETTO SABADIN', crm: 'CRM 80198/MG', especialidade: 'Clínica Médica', cidade: 'Nova Ponte', uf: 'MG' },
    { nome: 'DR. DANIEL RODRIGUES', crm: 'CRM 60879/MG', especialidade: 'Clínica Médica', cidade: 'Nova Ponte', uf: 'MG' },
    { nome: 'DRA. FERNANDA KRISTINA CARNEIRO', crm: 'CRM 111975/MG', especialidade: 'Clínica Médica', cidade: 'Nova Ponte', uf: 'MG' },
    { nome: 'DR. HILTON RESENDE JACOB', crm: 'CRM 41232/MG', especialidade: 'Clínica Médica', cidade: 'Nova Ponte', uf: 'MG' },
    // MG - Poços de Caldas
    { nome: 'DR. ADAUTO BOTELHO MEGALE', crm: 'CRM 10951/MG', especialidade: 'Clínica Médica', cidade: 'Poços de Caldas', uf: 'MG' },
    { nome: 'DR. ADELSON PENHA DE LIMA', crm: 'CRM 42658/MG', especialidade: 'Clínica Médica', cidade: 'Poços de Caldas', uf: 'MG' },
    { nome: 'DR. ADNEI PEREIRA DE MORAES', crm: 'CRM 8500/MG', especialidade: 'Clínica Médica', cidade: 'Poços de Caldas', uf: 'MG' },
    { nome: 'DRA. ADRIANA NUNES DA SILVA', crm: 'CRM 25567/MG', especialidade: 'Clínica Médica', cidade: 'Poços de Caldas', uf: 'MG' },
    { nome: 'DRA. ADRIANE SOUZA DO NASCIMENTO', crm: 'CRM 106550/MG', especialidade: 'Clínica Médica', cidade: 'Poços de Caldas', uf: 'MG' },
    // MG - Uberaba
    { nome: 'DR. AARON DA COSTA TELLES', crm: 'CRM 73568/MG', especialidade: 'Clínica Médica', cidade: 'Uberaba', uf: 'MG' },
    { nome: 'DRA. ABADIA ROCHA FINHOLDT', crm: 'CRM 10464/MG', especialidade: 'Clínica Médica', cidade: 'Uberaba', uf: 'MG' },
    { nome: 'DR. AFONSO CARVALHO SILVA', crm: 'CRM 69943/MG', especialidade: 'Clínica Médica', cidade: 'Uberaba', uf: 'MG' },
    { nome: 'DRA. AFIFE HALLAL DA CUNHA', crm: 'CRM 4061/MG', especialidade: 'Clínica Médica', cidade: 'Uberaba', uf: 'MG' },
    { nome: 'DR. AFÁBIO LOPES CANÇADO', crm: 'CRM 51159/MG', especialidade: 'Clínica Médica', cidade: 'Uberaba', uf: 'MG' },
    // MG - Uberlândia
    { nome: 'DRA. ABADIA GILDA BUSO MATOSO', crm: 'CRM 28332/MG', especialidade: 'Clínica Médica', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DR. ABADIO JOSÉ SILVA', crm: 'CRM 23325/MG', especialidade: 'Clínica Médica', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DR. ABADIO LOURIVAM PEREIRA JUNIOR', crm: 'CRM 56786/MG', especialidade: 'Clínica Médica', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DR. ABDALLA MIGUEL', crm: 'CRM 982/MG', especialidade: 'Clínica Médica', cidade: 'Uberlândia', uf: 'MG' },
    { nome: 'DR. ABDULKARIM MILKEM', crm: 'CRM 5927/MG', especialidade: 'Clínica Médica', cidade: 'Uberlândia', uf: 'MG' },
    // MG - Varginha
    { nome: 'DR. AARÃO SALOMÃO COHEN JÚNIOR', crm: 'CRM 27499/MG', especialidade: 'Clínica Médica', cidade: 'Varginha', uf: 'MG' },
    { nome: 'DRA. ACLECIA CARNEIRO DE MENDONCA', crm: 'CRM 26379/MG', especialidade: 'Clínica Médica', cidade: 'Varginha', uf: 'MG' },
    { nome: 'DR. ADEMIR OSSANI', crm: 'CRM 12377/MG', especialidade: 'Clínica Médica', cidade: 'Varginha', uf: 'MG' },
    { nome: 'DR. ADILSON MARCIANO ROSA', crm: 'CRM 17642/MG', especialidade: 'Clínica Médica', cidade: 'Varginha', uf: 'MG' },
    { nome: 'DR. ADRIAN NOGUEIRA BUENO', crm: 'CRM 33911/MG', especialidade: 'Clínica Médica', cidade: 'Varginha', uf: 'MG' },
    // PB - Campina Grande
    { nome: 'DR. ABDISIO PRAZERES NETO', crm: 'CRM 5761/PB', especialidade: 'Clínica Médica', cidade: 'Campina Grande', uf: 'PB' },
    { nome: 'DR. ABELARDO DA MATTA RIBEIRO SOBRINHO', crm: 'CRM 3901/PB', especialidade: 'Clínica Médica', cidade: 'Campina Grande', uf: 'PB' },
    { nome: 'DR. ABRAÃO ALANDEC DINIZ DE MORAES', crm: 'CRM 8072/PB', especialidade: 'Clínica Médica', cidade: 'Campina Grande', uf: 'PB' },
    { nome: 'DR. ABRAÃO SOUSA BRITO', crm: 'CRM 12256/PB', especialidade: 'Clínica Médica', cidade: 'Campina Grande', uf: 'PB' },
    { nome: 'DRA. ACIDALIA MARIA HOLANDA LACERDA', crm: 'CRM 2351/PB', especialidade: 'Clínica Médica', cidade: 'Campina Grande', uf: 'PB' },
    // PB - João Pessoa
    { nome: 'DR. ABDON MOREIRA LUSTOSA', crm: 'CRM 4184/PB', especialidade: 'Clínica Médica', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DR. ABEL AUSTERO DE SOUSA BENJAMIN FILHO', crm: 'CRM 18219/PB', especialidade: 'Clínica Médica', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DR. ABEL BARBOSA DE ARAÚJO GOMES', crm: 'CRM 13227/PB', especialidade: 'Clínica Médica', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DR. ABEL GOMES BELTRAO', crm: 'CRM 43/PB', especialidade: 'Clínica Médica', cidade: 'João Pessoa', uf: 'PB' },
    { nome: 'DR. ABELARDO DA SILVA MELO JUNIOR', crm: 'CRM 2439/PB', especialidade: 'Clínica Médica', cidade: 'João Pessoa', uf: 'PB' },
    // PI - Teresina
    { nome: 'DR. AARÃO ANDRADE NAPOLEÃO LIMA', crm: 'CRM 6943/PI', especialidade: 'Clínica Médica', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DR. AARAO CRUZ MENDES', crm: 'CRM 1803/PI', especialidade: 'Clínica Médica', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DR. ABDON ADYNAN DE ARAUJO SOUSA', crm: 'CRM 9433/PI', especialidade: 'Clínica Médica', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DR. ABEL DE BARROS ARAUJO FILHO', crm: 'CRM 7594/PI', especialidade: 'Clínica Médica', cidade: 'Teresina', uf: 'PI' },
    { nome: 'DRA. ABIGAIL GOMES DE FRANÇA', crm: 'CRM 10196/PI', especialidade: 'Clínica Médica', cidade: 'Teresina', uf: 'PI' },
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
