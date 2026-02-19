import { useEffect, useRef, useState, useCallback } from 'react';
import { getUnidadesPorUF, UF_LABELS, UFS_DISPONIVEIS } from '@/lib/hapvida-unidades';
import logoHapvida from '@/assets/logo-hapvida.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Lista CID-10 completa (mais usados na prática clínica)
const CID_LIST: { codigo: string; descricao: string }[] = [
  // ── INFECCIOSAS ──────────────────────────────────────────────────────────
  { codigo: 'A00.0', descricao: 'Cólera pelo Vibrio cholerae O:1, biotipo clássico' },
  { codigo: 'A09', descricao: 'Diarreia e gastroenterite de origem infecciosa presumível' },
  { codigo: 'A15.0', descricao: 'Tuberculose do pulmão confirmada por baciloscopia' },
  { codigo: 'A37.9', descricao: 'Coqueluche não especificada' },
  { codigo: 'A90', descricao: 'Dengue (dengue clássica)' },
  { codigo: 'A91', descricao: 'Febre hemorrágica pelo vírus do dengue' },
  { codigo: 'B00.9', descricao: 'Infecção pelo vírus herpes simples não especificada' },
  { codigo: 'B01.9', descricao: 'Varicela sem complicações (catapora)' },
  { codigo: 'B02.9', descricao: 'Herpes zoster sem complicações (cobreiro)' },
  { codigo: 'B19.9', descricao: 'Hepatite viral não especificada' },
  { codigo: 'B34.9', descricao: 'Infecção viral não especificada' },
  { codigo: 'B99', descricao: 'Doenças infecciosas não especificadas' },
  { codigo: 'B01.9', descricao: 'Varicela sem complicações' },
  { codigo: 'B34.9', descricao: 'Infecção viral não especificada' },
  { codigo: 'B99', descricao: 'Doenças infecciosas não especificadas' },
  { codigo: 'C34.9', descricao: 'Neoplasia maligna do brônquio ou pulmão não especificado' },
  { codigo: 'C50.9', descricao: 'Neoplasia maligna da mama não especificada' },
  { codigo: 'D50.9', descricao: 'Anemia por deficiência de ferro não especificada' },
  { codigo: 'E03.9', descricao: 'Hipotireoidismo não especificado' },
  { codigo: 'E05.9', descricao: 'Hipertireoidismo não especificado' },
  { codigo: 'E10.9', descricao: 'Diabetes mellitus tipo 1 sem complicações' },
  { codigo: 'E11.9', descricao: 'Diabetes mellitus tipo 2 sem complicações' },
  { codigo: 'E14.9', descricao: 'Diabetes mellitus não especificado sem complicações' },
  { codigo: 'E66.9', descricao: 'Obesidade não especificada' },
  { codigo: 'E78.0', descricao: 'Hipercolesterolemia pura (colesterol alto)' },
  { codigo: 'E78.5', descricao: 'Hiperlipidemia não especificada' },
  { codigo: 'F32.0', descricao: 'Episódio depressivo leve' },
  { codigo: 'F32.1', descricao: 'Episódio depressivo moderado' },
  { codigo: 'F32.9', descricao: 'Episódio depressivo não especificado' },
  { codigo: 'F41.1', descricao: 'Transtorno de ansiedade generalizada' },
  { codigo: 'F41.9', descricao: 'Transtorno de ansiedade não especificado' },
  { codigo: 'G43.0', descricao: 'Enxaqueca sem aura (dor de cabeça enxaqueca)' },
  { codigo: 'G43.1', descricao: 'Enxaqueca com aura (dor de cabeça com aura)' },
  { codigo: 'G43.9', descricao: 'Enxaqueca não especificada (dor de cabeça enxaqueca)' },
  { codigo: 'G44.0', descricao: 'Síndrome de cefaleia em salvas (dor de cabeça em salvas)' },
  { codigo: 'G44.2', descricao: 'Cefaleia tensional (dor de cabeça tensional)' },
  { codigo: 'G44.9', descricao: 'Cefaleia não especificada (dor de cabeça)' },
  { codigo: 'G54.2', descricao: 'Transtornos da raiz lombar não classificados em outro local' },
  { codigo: 'H10.9', descricao: 'Conjuntivite não especificada' },
  { codigo: 'H26.9', descricao: 'Catarata não especificada' },
  { codigo: 'H40.9', descricao: 'Glaucoma não especificado' },
  { codigo: 'H65.9', descricao: 'Otite média não supurativa não especificada' },
  { codigo: 'H66.9', descricao: 'Otite média supurativa não especificada' },
  { codigo: 'H81.1', descricao: 'Vertigem paroxística benigna (tontura)' },
  { codigo: 'H93.1', descricao: 'Zumbido (tinido)' },
  { codigo: 'I10', descricao: 'Hipertensão essencial (pressão alta)' },
  { codigo: 'I11.9', descricao: 'Cardiopatia hipertensiva sem insuficiência cardíaca' },
  { codigo: 'I20.9', descricao: 'Angina pectoris não especificada' },
  { codigo: 'I21.9', descricao: 'Infarto agudo do miocárdio não especificado' },
  { codigo: 'I25.9', descricao: 'Doença isquêmica crônica do coração não especificada' },
  { codigo: 'I48', descricao: 'Fibrilação e flutter atrial (arritmia)' },
  { codigo: 'I50.9', descricao: 'Insuficiência cardíaca não especificada' },
  { codigo: 'I63.9', descricao: 'AVC isquêmico - infarto cerebral não especificado' },
  { codigo: 'I64', descricao: 'Acidente vascular cerebral não especificado (AVC)' },
  { codigo: 'I83.9', descricao: 'Varizes dos membros inferiores não especificadas' },
  { codigo: 'J00', descricao: 'Rinofaringite aguda (resfriado comum)' },
  { codigo: 'J01.9', descricao: 'Sinusite aguda não especificada' },
  { codigo: 'J02.9', descricao: 'Faringite aguda não especificada' },
  { codigo: 'J03.9', descricao: 'Amigdalite aguda não especificada' },
  { codigo: 'J06.9', descricao: 'Infecção aguda das vias aéreas superiores não especificada' },
  { codigo: 'J11.1', descricao: 'Influenza com outras manifestações respiratórias, vírus não identificado' },
  { codigo: 'J18.9', descricao: 'Pneumonia não especificada' },
  { codigo: 'J20.9', descricao: 'Bronquite aguda não especificada' },
  { codigo: 'J30.4', descricao: 'Rinite alérgica não especificada' },
  { codigo: 'J45.9', descricao: 'Asma não especificada' },
  { codigo: 'K21.0', descricao: 'Doença de refluxo gastroesofágico com esofagite' },
  { codigo: 'K25.9', descricao: 'Úlcera gástrica não especificada' },
  { codigo: 'K29.7', descricao: 'Gastrite não especificada' },
  { codigo: 'K35.9', descricao: 'Apendicite aguda não especificada' },
  { codigo: 'K57.30', descricao: 'Doença diverticular do intestino grosso sem perfuração ou abscesso' },
  { codigo: 'K59.0', descricao: 'Constipação intestinal' },
  { codigo: 'K92.1', descricao: 'Melena' },
  { codigo: 'L23.9', descricao: 'Dermatite alérgica de contato não especificada' },
  { codigo: 'L50.9', descricao: 'Urticária não especificada' },
  { codigo: 'M10.9', descricao: 'Gota não especificada' },
  { codigo: 'M17.9', descricao: 'Gonartrose não especificada' },
  { codigo: 'M19.9', descricao: 'Artrose não especificada' },
  { codigo: 'M25.5', descricao: 'Dor articular' },
  { codigo: 'M47.8', descricao: 'Outras espondiloartrose' },
  { codigo: 'M54.2', descricao: 'Cervicalgia' },
  { codigo: 'M54.4', descricao: 'Lumbago com ciática' },
  { codigo: 'M54.5', descricao: 'Dor lombar baixa' },
  { codigo: 'M54.59', descricao: 'Dor na coluna não especificada' },
  { codigo: 'M54.9', descricao: 'Dorsalgia não especificada' },
  { codigo: 'M62.9', descricao: 'Transtorno muscular não especificado' },
  { codigo: 'M75.1', descricao: 'Síndrome do manguito rotador' },
  { codigo: 'M79.3', descricao: 'Paniculite' },
  { codigo: 'M79.7', descricao: 'Fibromialgia' },
  { codigo: 'N10', descricao: 'Pielonefrite aguda (infecção renal)' },
  { codigo: 'N20.0', descricao: 'Cálculo do rim (pedra no rim)' },
  { codigo: 'N20.2', descricao: 'Cálculo do rim com cálculo do ureter' },
  { codigo: 'N30.0', descricao: 'Cistite aguda (infecção urinária)' },
  { codigo: 'N39.0', descricao: 'Infecção do trato urinário de localização não especificada' },
  { codigo: 'N40', descricao: 'Hiperplasia da próstata' },
  { codigo: 'N76.0', descricao: 'Vaginite aguda' },
  { codigo: 'N92.1', descricao: 'Menstruação irregular com sangramento excessivo' },
  { codigo: 'N94.6', descricao: 'Dismenorreia (cólica menstrual) não especificada' },
  { codigo: 'O20.0', descricao: 'Ameaça de aborto' },
  { codigo: 'R00.0', descricao: 'Taquicardia não especificada' },
  { codigo: 'R05', descricao: 'Tosse' },
  { codigo: 'R06.0', descricao: 'Dispneia (falta de ar)' },
  { codigo: 'R07.4', descricao: 'Dor no peito não especificada' },
  { codigo: 'R10.0', descricao: 'Dor abdominal aguda' },
  { codigo: 'R10.4', descricao: 'Outras dores abdominais e as não especificadas' },
  { codigo: 'R11', descricao: 'Náusea e vômitos' },
  { codigo: 'R20.2', descricao: 'Parestesia cutânea (formigamento)' },
  { codigo: 'R42', descricao: 'Tontura e vertigem' },
  { codigo: 'R50.9', descricao: 'Febre não especificada' },
  { codigo: 'R51', descricao: 'Cefaleia / dor de cabeça não especificada' },
  { codigo: 'R52.9', descricao: 'Dor não especificada' },
  { codigo: 'R53', descricao: 'Mal-estar e fadiga (cansaço)' },
  { codigo: 'R55', descricao: 'Síncope e colapso (desmaio)' },
  { codigo: 'R60.0', descricao: 'Edema localizado (inchaço)' },
  { codigo: 'S00.9', descricao: 'Traumatismo superficial da cabeça não especificado' },
  { codigo: 'S20.2', descricao: 'Contusão do tórax' },
  { codigo: 'S60.9', descricao: 'Traumatismo superficial do punho e da mão' },
  { codigo: 'S80.9', descricao: 'Traumatismo superficial da perna não especificado' },
  { codigo: 'T14.9', descricao: 'Lesão não especificada' },
  { codigo: 'Z00.0', descricao: 'Exame médico geral' },
  { codigo: 'Z23', descricao: 'Necessidade de imunização contra doença bacteriana única' },
];

// Dimensões originais do PSD
const ORIG_W = 2090;
const ORIG_H = 2734;

// Canvas de exibição (proporcional)
const CANVAS_W = 794;
const CANVAS_H = Math.round(794 * (ORIG_H / ORIG_W)); // ≈ 1038px

// Escala para converter coordenadas originais → canvas
const SCALE = CANVAS_W / ORIG_W;

function gerarCodigoAutenticacao() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 11; i++) {
    codigo += chars[Math.floor(Math.random() * chars.length)];
  }
  return codigo;
}

const DIAS_EXTENSO: Record<number, string> = {
  1: 'UM', 2: 'DOIS', 3: 'TRÊS', 4: 'QUATRO', 5: 'CINCO',
  6: 'SEIS', 7: 'SETE', 8: 'OITO', 9: 'NOVE', 10: 'DEZ',
  11: 'ONZE', 12: 'DOZE', 13: 'TREZE', 14: 'QUATORZE', 15: 'QUINZE',
  20: 'VINTE', 30: 'TRINTA',
};
function diasPorExtenso(n: number): string {
  return DIAS_EXTENSO[n] ?? String(n);
}

// Quebra texto em linhas respeitando largura máxima em pixels
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function HapvidaPositionTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logoPos] = useState({ x: 99, y: 250 });
  const [dataHora, setDataHora] = useState('19/02/2026 12:32:14');
  const [cidBusca, setCidBusca] = useState('');
  const [cidDropdownAberto, setCidDropdownAberto] = useState(false);
  const [ip, setIp] = useState('10.200.125.141');
  const [codigoAuth, setCodigoAuth] = useState('3M15KLJSAF9');
  const [nomeMedico, setNomeMedico] = useState('RODOLFO CARDOSO DUTRA DE ALENCAR');
  const [codigodoenca, setCodigodoenca] = useState('N30.0');
  const [ufSelecionada, setUfSelecionada] = useState('AM');
  const [nomeHospital, setNomeHospital] = useState('HOSPITAL RIO NEGRO');
  const [enderecoHospital, setEnderecoHospital] = useState('R. TAPAJOS, 561 - CENTRO');
  const [cidadeHospital, setCidadeHospital] = useState('MANAUUS- AM, CEP 69010-150 telefone (92) 4002-3633');
  const [crm, setCrm] = useState('CRM 12596-AM');
  const [linkValidacao, setLinkValidacao] = useState('https://webhap.hapvida-validacao.info/');
  const [nomePaciente, setNomePaciente] = useState('NEYMAR JUNIOR GAMA');
  const [cpfPaciente, setCpfPaciente] = useState('704.762.672-77');
  const [diasAfastamento, setDiasAfastamento] = useState(1);
  const [dataApartir, setDataApartir] = useState('19/02/2026');
  const [horarioAtendimento, setHorarioAtendimento] = useState('12:32');
  const [assinaturaUrl, setAssinaturaUrl] = useState<string | null>('/images/hapvida-carimbo-default.png');

  const handleAssinaturaUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setAssinaturaUrl(url);
    };
    reader.readAsDataURL(file);
  }, []);

  const gerarHoraAtual = useCallback(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const data = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    setDataHora(data);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const logo = new Image();
    logo.onload = () => {
      const folha = new Image();
      folha.onload = () => {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.drawImage(folha, 0, 0, CANVAS_W, CANVAS_H);

        // Retângulo do cabeçalho
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(63.47 * SCALE, 178.75 * SCALE, 1963.05 * SCALE, 220.42 * SCALE);

        // Logo
        ctx.drawImage(logo, logoPos.x * SCALE, logoPos.y * SCALE, 394 * SCALE, 91 * SCALE);

        // ── Cabeçalho Hospital — PSD: X:555, Y:216, L:973, A:144 — centralizado
        const centerX = (555 + 973 / 2) * SCALE;
        // Linha 1: Nome do hospital — Arial bold 11.3pt → ~47px original
        const fontHosp1 = Math.round(47 * SCALE);
        ctx.font = `bold ${fontHosp1}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        const baseY1 = (216 + 47) * SCALE;
        ctx.fillText(nomeHospital, centerX, baseY1);
        // Underline do nome do hospital
        const w1 = ctx.measureText(nomeHospital).width;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, 1.5 * SCALE);
        ctx.beginPath();
        ctx.moveTo(centerX - w1 / 2, baseY1 + 3 * SCALE);
        ctx.lineTo(centerX + w1 / 2, baseY1 + 3 * SCALE);
        ctx.stroke();
        // Linha 2: Endereço — Arial regular 8.48pt → ~35px original
        const fontHosp2 = Math.round(35 * SCALE);
        ctx.font = `${fontHosp2}px Arial`;
        ctx.fillText(enderecoHospital, centerX, baseY1 + fontHosp2 * 1.4);
        // Linha 3: Cidade/telefone — Arial regular 8.48pt → ~35px original
        ctx.fillText(cidadeHospital, centerX, baseY1 + fontHosp2 * 1.4 * 2);

        // Título ATESTADO MÉDICO
        const fontSize = Math.round(40 * SCALE);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText('ATESTADO MÉDICO', 798 * SCALE, (499 + 38) * SCALE);

        // Corpo do atestado — PSD: X:133, Y:726, L:1815, A:192 — 10.36pt Arial Regular → ~43px original
        const fontCorpo = Math.round(43 * SCALE);
        ctx.font = `${fontCorpo}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        const diasExt = diasPorExtenso(diasAfastamento);
        const textoAtestado = `Atesto que atendi nesta data o (a) Sr (a) ${nomePaciente}, CPF ${cpfPaciente} ás ${horarioAtendimento}, sendo necessário o seu afastamento das atividades laborativas ou academicas por ${diasAfastamento} (${diasExt}) dia (s), apartir de ${dataApartir}, tendo como causa do atendimento o código abaixo:`;
        const maxLargura = 1815 * SCALE;
        const linhasAtestado = wrapText(ctx, textoAtestado, maxLargura);
        const lineHeight = fontCorpo * 1.35;
        linhasAtestado.forEach((linha, i) => {
          ctx.fillText(linha, 133 * SCALE, (726 + fontCorpo) * SCALE + i * lineHeight);
        });

        // Linha de rodapé
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, 4.3 * SCALE);
        ctx.beginPath();
        ctx.moveTo(102.69 * SCALE, 2461.97 * SCALE);
        ctx.lineTo((102.69 + 1887.44) * SCALE, 2461.97 * SCALE);
        ctx.stroke();

        // Linha interna (linha_3)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, 1.67 * SCALE);
        ctx.beginPath();
        ctx.moveTo(150.5 * SCALE, 1201.84 * SCALE);
        ctx.lineTo((150.5 + 733.54) * SCALE, 1201.84 * SCALE);
        ctx.stroke();

        // Linha tracejada (Linha_1)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, 0.83 * SCALE);
        ctx.setLineDash([6 * SCALE, 4 * SCALE]);
        ctx.beginPath();
        ctx.moveTo(149.91 * SCALE, 1073.25 * SCALE);
        ctx.lineTo((149.91 + 331.22) * SCALE, 1073.25 * SCALE);
        ctx.stroke();
        ctx.setLineDash([]);

        // Texto "Código da Doença"
        const fontCodigo = Math.round(36 * SCALE);
        ctx.font = `${fontCodigo}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText('Código da Doença', 149 * SCALE, (1093 + 36) * SCALE);

        // Valor Código da Doença — PSD: X:150, Y:1017, L:118, A:32 — 10.36pt Arial Regular → ~43px original
        const fontCodigoValor = Math.round(43 * SCALE);
        ctx.font = `bold ${fontCodigoValor}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText(codigodoenca, 150 * SCALE, (1017 + 32) * SCALE);

        // Texto "Local e Data"
        const fontLocal = Math.round(28 * SCALE);
        ctx.font = `${fontLocal}px Arial`;
        ctx.fillText('Local e Data', 388 * SCALE, (1218 + 28) * SCALE);

        // Nome do Médico — PSD: X:150, Y:1448, L:938, A:33 — 10.36pt Arial Regular → ~43px original
        const fontMedico = Math.round(43 * SCALE);
        ctx.font = `${fontMedico}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText(nomeMedico, 150 * SCALE, (1448 + 33) * SCALE);

        // CRM — PSD: X:149, Y:1564, L:324, A:33 — 10.36pt Arial Regular → ~43px original
        ctx.font = `${fontMedico}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText(crm, 149 * SCALE, (1564 + 33) * SCALE);

        // Linha_4 — PSD: X:150.5, Y:1515.5, L:733.54, A:1.67
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, 1.67 * SCALE);
        ctx.beginPath();
        ctx.moveTo(150.5 * SCALE, 1515.5 * SCALE);
        ctx.lineTo((150.5 + 733.54) * SCALE, 1515.5 * SCALE);
        ctx.stroke();

        // Texto "Aceito a Colocação do CID. Assinado us ___"
        // PSD: X:130, Y:1742, L:1238, A:43
        const fontAceito = Math.round(43 * SCALE);
        ctx.font = `${fontAceito}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText('Aceito a Colocação do CID. Assinado us ___________________', 130 * SCALE, (1742 + 33) * SCALE);

        // Código de Autenticação — PSD: X:132, Y:1824, L:826, A:42 — 10.36pt Arial Regular → ~43px original
        const fontAuth = Math.round(43 * SCALE);
        ctx.font = `${fontAuth}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText(`Código de Autenticação: ${codigoAuth}`, 132 * SCALE, (1824 + 33) * SCALE);

        // Solicitação da senha — PSD: X:132, Y:1875, L:885, A:41 — 10.36pt Arial Regular → ~43px original
        ctx.font = `${fontAuth}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText(`Solicitação da senha: ${dataHora}`, 132 * SCALE, (1875 + 33) * SCALE);

        // Link de validação — PSD: X:133, Y:1987, L:835, A:91 — 10.36pt Arial Regular → ~43px original
        // Linha 1: "Link para validação do Atestado Médico:"  Linha 2: URL
        ctx.font = `${fontAuth}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText('Link para validação do Atestado Médico:', 133 * SCALE, (1987 + 33) * SCALE);
        ctx.fillText(linkValidacao, 133 * SCALE, (1987 + 33 + 43) * SCALE);

        // Rodapé: data/hora e IP (Arial Regular ~10.36pt → ~43px no original)
        const fontRodape = Math.round(43 * SCALE);
        ctx.font = `${fontRodape}px Arial`;
        ctx.fillStyle = '#000000';
        // Data/hora — alinhado à esquerda no X inicial
        ctx.textAlign = 'left';
        ctx.fillText(dataHora, 574 * SCALE, (2481 + 33) * SCALE);
        // IP — alinhado à direita no fim do bloco
        ctx.textAlign = 'right';
        ctx.fillText(ip, (574 + 1014) * SCALE, (2481 + 33) * SCALE);
        ctx.textAlign = 'left';

        // Assinatura/Carimbo do Médico — PSD: X:1478, Y:1209, L:358, A:661
        const drawCarimboAndWatermark = (carImgEl: HTMLImageElement | null) => {
          if (carImgEl) {
            ctx.drawImage(carImgEl, 1478 * SCALE, 1209 * SCALE, 358 * SCALE, 661 * SCALE);
          }

          // ── MARCA D'ÁGUA PREVIEW ─────────────────────────────────────────────
          const wmText = 'PREVIEW - DATA SISTEMAS';
          const wmFontSize = Math.round(90 * SCALE);
          const wmAngle = -Math.PI / 6;
          const wmSpacingX = CANVAS_W * 0.65;
          const wmSpacingY = CANVAS_H * 0.18;
          ctx.save();
          ctx.globalAlpha = 0.10;
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${wmFontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          for (let row = -1; row <= 6; row++) {
            for (let col = -1; col <= 2; col++) {
              ctx.save();
              const cx = col * wmSpacingX + (row % 2 === 0 ? 0 : wmSpacingX * 0.5);
              const cy = row * wmSpacingY;
              ctx.translate(cx, cy);
              ctx.rotate(wmAngle);
              ctx.fillText(wmText, 0, 0);
              ctx.restore();
            }
          }
          ctx.restore();
        };

        if (assinaturaUrl) {
          const carImg = new Image();
          carImg.onload = () => drawCarimboAndWatermark(carImg);
          carImg.src = assinaturaUrl;
        } else {
          drawCarimboAndWatermark(null);
        }
      };
      folha.src = '/images/hapvida-folha.png';
    };
    logo.src = logoHapvida;
  }, [logoPos, dataHora, ip, codigoAuth, nomeMedico, crm, linkValidacao, assinaturaUrl, codigodoenca, nomePaciente, cpfPaciente, diasAfastamento, dataApartir, horarioAtendimento, nomeHospital, enderecoHospital, cidadeHospital]);

  return (
    <div style={{ minHeight: '100vh', background: '#444', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', gap: '16px' }}>
      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Preview Hapvida — /teste7</div>

      {/* Formulário de controles */}
      <div style={{ background: '#333', borderRadius: '8px', padding: '16px', width: '100%', maxWidth: '794px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Data e Hora */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Data/Hora</Label>
          <Input
            value={dataHora}
            onChange={e => setDataHora(e.target.value)}
            placeholder="DD/MM/AAAA HH:MM:SS"
            style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }}
          />
          <Button size="sm" onClick={gerarHoraAtual} style={{ whiteSpace: 'nowrap', background: '#555', color: '#fff' }}>
            ⏰ Hora Atual
          </Button>
        </div>

        {/* ── DADOS DO PACIENTE ── */}
        <div style={{ borderTop: '1px solid #555', paddingTop: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>DADOS DO PACIENTE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Nome</Label>
          <Input value={nomePaciente} onChange={e => setNomePaciente(e.target.value.toUpperCase())} placeholder="Ex: NEYMAR JUNIOR GAMA" style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>CPF</Label>
          <Input value={cpfPaciente} onChange={e => setCpfPaciente(e.target.value)} placeholder="Ex: 704.762.672-77" style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Dias afastamento</Label>
          <Input type="number" min={1} max={30} value={diasAfastamento} onChange={e => setDiasAfastamento(Number(e.target.value))} style={{ background: '#222', color: '#fff', border: '1px solid #555', width: '70px' }} />
          <Label style={{ color: '#ccc', fontSize: '13px' }}>A partir de</Label>
          <Input value={dataApartir} onChange={e => setDataApartir(e.target.value)} placeholder="DD/MM/AAAA" style={{ background: '#222', color: '#fff', border: '1px solid #555', width: '130px' }} />
          <Label style={{ color: '#ccc', fontSize: '13px' }}>Horário</Label>
          <Input value={horarioAtendimento} onChange={e => setHorarioAtendimento(e.target.value)} placeholder="HH:MM" style={{ background: '#222', color: '#fff', border: '1px solid #555', width: '90px' }} />
        </div>

        {/* ── DADOS DA DOENÇA ── */}
        <div style={{ borderTop: '1px solid #555', paddingTop: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>DADOS DA DOENÇA</div>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Buscar Doença</Label>
            <Input
              value={cidBusca}
              onChange={e => { setCidBusca(e.target.value); setCidDropdownAberto(true); }}
              onFocus={() => setCidDropdownAberto(true)}
              placeholder="Digite nome da doença ou código CID..."
              style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }}
            />
          </div>
          {cidDropdownAberto && cidBusca.length >= 2 && (() => {
            const busca = cidBusca.toLowerCase();
            const filtrados = CID_LIST.filter(c =>
              c.descricao.toLowerCase().includes(busca) || c.codigo.toLowerCase().includes(busca)
            ).slice(0, 10);
            if (filtrados.length === 0) return null;
            return (
              <div style={{
                position: 'absolute', left: '108px', right: 0, top: '38px',
                background: '#1a1a1a', border: '1px solid #666', borderRadius: '6px',
                zIndex: 100, maxHeight: '260px', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
              }}>
                {filtrados.map(c => (
                  <div
                    key={c.codigo}
                    onClick={() => {
                      setCodigodoenca(c.codigo);
                      setCidBusca(`${c.codigo} — ${c.descricao}`);
                      setCidDropdownAberto(false);
                    }}
                    style={{
                      padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #333',
                      display: 'flex', gap: '10px', alignItems: 'baseline',
                      color: '#fff', fontSize: '13px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#2a2a2a')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: '#4ade80', fontWeight: 'bold', minWidth: '60px', fontFamily: 'monospace' }}>{c.codigo}</span>
                    <span style={{ color: '#ddd' }}>{c.descricao}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Cód. Selecionado</Label>
          <Input
            value={codigodoenca}
            onChange={e => setCodigodoenca(e.target.value.toUpperCase())}
            placeholder="Ex: M54.59"
            style={{ background: '#222', color: '#4ade80', border: '1px solid #555', flex: 1, fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}
          />
        </div>

        {/* ── DADOS DO HOSPITAL ── */}
        <div style={{ borderTop: '1px solid #555', paddingTop: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>DADOS DO HOSPITAL</div>

        {/* Seletor de Estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Estado (UF)</Label>
          <select
            value={ufSelecionada}
            onChange={e => setUfSelecionada(e.target.value)}
            style={{ background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '6px', padding: '6px 10px', flex: 1, fontSize: '13px' }}
          >
            {UFS_DISPONIVEIS.map(uf => (
              <option key={uf} value={uf}>{uf} — {UF_LABELS[uf] ?? uf}</option>
            ))}
          </select>
        </div>

        {/* Seletor de Unidade */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Unidade</Label>
          <select
            value={nomeHospital}
            onChange={e => {
              const unidade = getUnidadesPorUF(ufSelecionada).find(u => u.nome.toUpperCase() === e.target.value);
              if (unidade) {
                setNomeHospital(unidade.nome.toUpperCase());
                setEnderecoHospital(unidade.endereco.toUpperCase());
                setCidadeHospital(unidade.cidade.toUpperCase());
              }
            }}
            style={{ background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '6px', padding: '6px 10px', flex: 1, fontSize: '12px' }}
          >
            <option value="">— Selecione uma unidade —</option>
            {getUnidadesPorUF(ufSelecionada).map(u => (
              <option key={u.nome} value={u.nome.toUpperCase()}>
                [{u.tipo.slice(0,3).toUpperCase()}] {u.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Campos manuais (editáveis após seleção) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Nome Hospital</Label>
          <Input value={nomeHospital} onChange={e => setNomeHospital(e.target.value.toUpperCase())} placeholder="Ex: HOSPITAL RIO NEGRO" style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444', flex: 1, fontSize: '12px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Endereço</Label>
          <Input value={enderecoHospital} onChange={e => setEnderecoHospital(e.target.value.toUpperCase())} placeholder="Ex: R. TAPAJOS, 561 - CENTRO" style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444', flex: 1, fontSize: '12px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Cidade/Tel.</Label>
          <Input value={cidadeHospital} onChange={e => setCidadeHospital(e.target.value)} placeholder="Ex: MANAUS-AM, CEP... telefone..." style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444', flex: 1, fontSize: '12px' }} />
        </div>

        {/* ── DADOS DO MÉDICO ── */}
        <div style={{ borderTop: '1px solid #555', paddingTop: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>DADOS DO MÉDICO</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Nome</Label>
          <Input value={nomeMedico} onChange={e => setNomeMedico(e.target.value.toUpperCase())} placeholder="Ex: RODOLFO CARDOSO DUTRA DE ALENCAR" style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>CRM</Label>
          <Input value={crm} onChange={e => setCrm(e.target.value.toUpperCase())} placeholder="Ex: CRM 12596-AM" style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Carimbo</Label>
          <label style={{ flex: 1, cursor: 'pointer' }}>
            <div style={{ background: '#222', border: '1px dashed #666', borderRadius: '6px', padding: '8px 12px', color: assinaturaUrl && assinaturaUrl !== '/images/hapvida-carimbo-default.png' ? '#4ade80' : '#aaa', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {assinaturaUrl && assinaturaUrl !== '/images/hapvida-carimbo-default.png' ? '✅ Carimbo personalizado — clique para trocar' : '📎 Carimbo padrão ativo — clique para substituir'}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleAssinaturaUpload} />
          </label>
        </div>

        {/* ── DADOS INFORMATIVOS ── */}
        <div style={{ borderTop: '1px solid #555', paddingTop: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>DADOS INFORMATIVOS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>IP</Label>
          <Input value={ip} onChange={e => setIp(e.target.value)} placeholder="Ex: 10.200.125.141" style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Cód. Auth.</Label>
          <Input value={codigoAuth} onChange={e => setCodigoAuth(e.target.value.toUpperCase())} placeholder="Ex: 3M15KLJSAF9" maxLength={16} style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1, fontFamily: 'monospace', letterSpacing: '2px' }} />
          <Button size="sm" onClick={() => setCodigoAuth(gerarCodigoAutenticacao())} style={{ whiteSpace: 'nowrap', background: '#555', color: '#fff' }}>
            🔀 Gerar Código
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ background: '#fff', display: 'block', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      />
    </div>
  );
}
