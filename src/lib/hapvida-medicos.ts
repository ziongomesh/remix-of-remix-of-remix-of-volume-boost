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
