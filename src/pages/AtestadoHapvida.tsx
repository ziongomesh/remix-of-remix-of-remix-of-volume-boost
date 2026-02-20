import { useEffect, useRef, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, FileText, Hospital, User, Stethoscope, Info } from 'lucide-react';
import { getUnidadesPorUF, UF_LABELS, UFS_DISPONIVEIS } from '@/lib/hapvida-unidades';
import { buscarMedicos, getEstadosMedicos, getCidadesPorEstado, type MedicoHapvida } from '@/lib/hapvida-medicos';
import logoHapvida from '@/assets/logo-hapvida.png';
import mysqlApi from '@/lib/api-mysql';

// ── CID-10 list (abridged import from HapvidaPositionTool) ─────────────────
const CID_LIST: { codigo: string; descricao: string }[] = [
  { codigo: 'A09', descricao: 'Diarreia e gastroenterite de origem infecciosa presumível' },
  { codigo: 'A90', descricao: 'Dengue (dengue clássica)' },
  { codigo: 'B01.9', descricao: 'Varicela sem complicações (catapora)' },
  { codigo: 'B02.9', descricao: 'Herpes zoster sem complicações (cobreiro)' },
  { codigo: 'E03.9', descricao: 'Hipotireoidismo não especificado' },
  { codigo: 'E10.9', descricao: 'Diabetes mellitus tipo 1 sem complicações' },
  { codigo: 'E11.9', descricao: 'Diabetes mellitus tipo 2 sem complicações' },
  { codigo: 'E66.9', descricao: 'Obesidade não especificada' },
  { codigo: 'E78.0', descricao: 'Hipercolesterolemia pura (colesterol alto)' },
  { codigo: 'F32.0', descricao: 'Episódio depressivo leve' },
  { codigo: 'F32.1', descricao: 'Episódio depressivo moderado' },
  { codigo: 'F32.9', descricao: 'Episódio depressivo não especificado' },
  { codigo: 'F41.0', descricao: 'Transtorno do pânico (síndrome do pânico)' },
  { codigo: 'F41.1', descricao: 'Transtorno de ansiedade generalizada' },
  { codigo: 'F41.2', descricao: 'Transtorno misto ansioso e depressivo' },
  { codigo: 'F48.0', descricao: 'Neurastenia (esgotamento nervoso / burnout)' },
  { codigo: 'G43.9', descricao: 'Enxaqueca não especificada' },
  { codigo: 'G44.2', descricao: 'Cefaleia tensional' },
  { codigo: 'G47.0', descricao: 'Insônia' },
  { codigo: 'G51.0', descricao: 'Paralisia de Bell (paralisia facial)' },
  { codigo: 'G56.0', descricao: 'Síndrome do túnel do carpo' },
  { codigo: 'H10.9', descricao: 'Conjuntivite não especificada' },
  { codigo: 'H66.9', descricao: 'Otite média supurativa não especificada' },
  { codigo: 'H81.1', descricao: 'Vertigem paroxística benigna (tontura)' },
  { codigo: 'I10', descricao: 'Hipertensão essencial (pressão alta)' },
  { codigo: 'I50.9', descricao: 'Insuficiência cardíaca não especificada' },
  { codigo: 'I84.9', descricao: 'Hemorroidas não especificadas' },
  { codigo: 'J00', descricao: 'Rinofaringite aguda (resfriado comum / gripe)' },
  { codigo: 'J01.9', descricao: 'Sinusite aguda não especificada' },
  { codigo: 'J02.9', descricao: 'Faringite aguda não especificada' },
  { codigo: 'J03.9', descricao: 'Amigdalite aguda não especificada' },
  { codigo: 'J06.9', descricao: 'Infecção aguda das vias aéreas superiores' },
  { codigo: 'J18.9', descricao: 'Pneumonia não especificada' },
  { codigo: 'J20.9', descricao: 'Bronquite aguda não especificada' },
  { codigo: 'J30.4', descricao: 'Rinite alérgica não especificada' },
  { codigo: 'J45.9', descricao: 'Asma não especificada' },
  { codigo: 'K21.0', descricao: 'Refluxo gastroesofágico com esofagite (DRGE)' },
  { codigo: 'K29.7', descricao: 'Gastrite não especificada' },
  { codigo: 'K30', descricao: 'Dispepsia (má digestão / azia)' },
  { codigo: 'K35.9', descricao: 'Apendicite aguda não especificada' },
  { codigo: 'K58.9', descricao: 'Síndrome do intestino irritável' },
  { codigo: 'K59.0', descricao: 'Constipação intestinal (prisão de ventre)' },
  { codigo: 'K80.2', descricao: 'Colelitíase (cálculo na vesícula)' },
  { codigo: 'L20.9', descricao: 'Dermatite atópica não especificada (eczema)' },
  { codigo: 'L50.9', descricao: 'Urticária não especificada' },
  { codigo: 'M06.9', descricao: 'Artrite reumatoide não especificada' },
  { codigo: 'M10.9', descricao: 'Gota não especificada' },
  { codigo: 'M17.9', descricao: 'Gonartrose (artrose do joelho) não especificada' },
  { codigo: 'M47.9', descricao: 'Espondilose não especificada (artrose da coluna)' },
  { codigo: 'M51.1', descricao: 'Hérnia de disco lombar com radiculopatia' },
  { codigo: 'M54.2', descricao: 'Cervicalgia (dor no pescoço)' },
  { codigo: 'M54.4', descricao: 'Lumbago com ciática' },
  { codigo: 'M54.5', descricao: 'Dor lombar baixa (lombalgia)' },
  { codigo: 'M54.59', descricao: 'Dor lombar crônica não especificada' },
  { codigo: 'M65.9', descricao: 'Sinovite e tenossinovite não especificadas' },
  { codigo: 'M75.1', descricao: 'Síndrome do manguito rotador (ombro)' },
  { codigo: 'M79.3', descricao: 'Paniculite não especificada' },
  { codigo: 'N10', descricao: 'Nefrite tubulointersticial aguda (infecção renal)' },
  { codigo: 'N30.0', descricao: 'Cistite aguda (infecção urinária)' },
  { codigo: 'N39.0', descricao: 'Infecção do trato urinário sem localização especificada' },
  { codigo: 'N94.6', descricao: 'Dismenorreia não especificada (cólica menstrual)' },
  { codigo: 'R05', descricao: 'Tosse' },
  { codigo: 'R10.4', descricao: 'Outras dores abdominais e as não especificadas' },
  { codigo: 'R11', descricao: 'Náusea e vômitos' },
  { codigo: 'R50.9', descricao: 'Febre não especificada' },
  { codigo: 'R51', descricao: 'Cefaleia / dor de cabeça não especificada' },
  { codigo: 'S06.0', descricao: 'Concussão cerebral (traumatismo craniano)' },
  { codigo: 'S52.5', descricao: 'Fratura da extremidade distal do rádio' },
  { codigo: 'S82.9', descricao: 'Fratura da perna não especificada' },
  { codigo: 'T14.0', descricao: 'Ferimento superficial de região do corpo não especificada' },
  { codigo: 'Z76.9', descricao: 'Contato com serviços de saúde por razão não especificada' },
];

// ── Canvas config ──────────────────────────────────────────────────────────
const ORIG_W = 2090;
const ORIG_H = 2734;
const CANVAS_W = 650;
const CANVAS_H = Math.round(650 * (ORIG_H / ORIG_W));
const SCALE = CANVAS_W / ORIG_W;

function gerarCodigo() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 11 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const DIAS_EXTENSO: Record<number, string> = {
  1: 'UM', 2: 'DOIS', 3: 'TRÊS', 4: 'QUATRO', 5: 'CINCO',
  6: 'SEIS', 7: 'SETE', 8: 'OITO', 9: 'NOVE', 10: 'DEZ',
  11: 'ONZE', 12: 'DOZE', 13: 'TREZE', 14: 'QUATORZE', 15: 'QUINZE',
  20: 'VINTE', 30: 'TRINTA',
};
function diasExt(n: number) { return DIAS_EXTENSO[n] ?? String(n); }

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function formatCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function nowStr() {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return `${p(n.getDate())}/${p(n.getMonth()+1)}/${n.getFullYear()} ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AtestadoHapvida() {
  const { admin, loading, refreshCredits } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiResCanvasRef = useRef<HTMLCanvasElement>(null);

  // Form state
  const [nomePaciente, setNomePaciente] = useState('');
  const [cpfPaciente, setCpfPaciente] = useState('');
  const [diasAfastamento, setDiasAfastamento] = useState(1);
  const [dataApartir, setDataApartir] = useState(() => {
    const n = new Date(); const p=(x:number)=>String(x).padStart(2,'0');
    return `${p(n.getDate())}/${p(n.getMonth()+1)}/${n.getFullYear()}`;
  });
  const [horario, setHorario] = useState(() => {
    const n = new Date(); const p=(x:number)=>String(x).padStart(2,'0');
    return `${p(n.getHours())}:${p(n.getMinutes())}`;
  });
  const [cidBusca, setCidBusca] = useState('');
  const [cidDropdown, setCidDropdown] = useState(false);
  const [codigoCid, setCodigoCid] = useState('N30.0');
  const [ufSelecionada, setUfSelecionada] = useState('AM');
  const [nomeHospital, setNomeHospital] = useState('HOSPITAL RIO NEGRO');
  const [enderecoHospital, setEnderecoHospital] = useState('R. TAPAJOS, 561 - CENTRO');
  const [cidadeHospital, setCidadeHospital] = useState('MANAUS- AM, CEP 69010-150');
  const [nomeMedico, setNomeMedico] = useState('');
  const [crm, setCrm] = useState('');
  const [linkValidacao, setLinkValidacao] = useState('https://webhap.hapvida-validacao.info/');

  // Busca de médicos
  const [ufMedico, setUfMedico] = useState('AM');
  const [cidadeMedico, setCidadeMedico] = useState('');
  const [medicoBusca, setMedicoBusca] = useState('');
  const [medicoDropdown, setMedicoDropdown] = useState(false);
  const cidadesMedico = ufMedico ? getCidadesPorEstado(ufMedico) : [];
  const medicosFiltrados = (() => {
    if (medicoBusca.length >= 2) return buscarMedicos(medicoBusca, ufMedico || undefined);
    if (cidadeMedico && ufMedico) return buscarMedicos(cidadeMedico, ufMedico).filter(m => m.cidade === cidadeMedico);
    if (ufMedico && !cidadeMedico) return buscarMedicos('', ufMedico).slice(0, 15);
    return [];
  })();
  const [ip, setIp] = useState('10.200.125.141');
  const [dataHora, setDataHora] = useState(nowStr);
  const [codigoAuth, setCodigoAuth] = useState(gerarCodigo);
  const [assinaturaUrl, setAssinaturaUrl] = useState<string | null>('/images/hapvida-carimbo-default.png');
  const [criando, setCriando] = useState(false);

  // ── Render canvas sem marca d'água (para PDF) ──────────────────────────
  const renderCanvas = useCallback((
    canvas: HTMLCanvasElement,
    scale: number,
    withWatermark: boolean
  ) => {
    return new Promise<void>((resolve) => {
      const ctx = canvas.getContext('2d')!;
      const S = scale;

      const logo = new Image();
      logo.onload = () => {
        const folha = new Image();
        folha.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(folha, 0, 0, canvas.width, canvas.height);

          // Borda cabeçalho
          ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
          ctx.strokeRect(63.47*S, 178.75*S, 1963.05*S, 220.42*S);

          // Logo
          ctx.drawImage(logo, 99*S, 250*S, 394*S, 91*S);

          // Nome hospital
          const cX = (555 + 973/2)*S;
          const fH1 = Math.round(47*S);
          ctx.font = `bold ${fH1}px Arial`; ctx.fillStyle='#000'; ctx.textAlign='center';
          const bY1 = (216+47)*S;
          ctx.fillText(nomeHospital, cX, bY1);
          const w1 = ctx.measureText(nomeHospital).width;
          ctx.strokeStyle='#000'; ctx.lineWidth=Math.max(1,1.5*S);
          ctx.beginPath(); ctx.moveTo(cX-w1/2, bY1+3*S); ctx.lineTo(cX+w1/2, bY1+3*S); ctx.stroke();
          const fH2 = Math.round(35*S); ctx.font=`${fH2}px Arial`;
          ctx.fillText(enderecoHospital, cX, bY1+fH2*1.4);
          ctx.fillText(cidadeHospital, cX, bY1+fH2*1.4*2);

          // Título
          const fT = Math.round(40*S); ctx.font=`bold ${fT}px Arial`;
          ctx.fillStyle='#000'; ctx.textAlign='left';
          ctx.fillText('ATESTADO MÉDICO', 798*S, (499+38)*S);

          // Corpo
          const fC = Math.round(43*S); ctx.font=`${fC}px Arial`;
          ctx.fillStyle='#000'; ctx.textAlign='left';
          const texto = `Atesto que atendi nesta data o (a) Sr (a) ${nomePaciente}, CPF ${cpfPaciente} ás ${horario}, sendo necessário o seu afastamento das atividades laborativas ou academicas por ${diasAfastamento} (${diasExt(diasAfastamento)}) dia (s), apartir de ${dataApartir}, tendo como causa do atendimento o código abaixo:`;
          const linhas = wrapText(ctx, texto, 1815*S);
          const lH = fC*1.35;
          linhas.forEach((l,i) => ctx.fillText(l, 133*S, (726+fC)*S + i*lH));

          // Linha rodapé
          ctx.strokeStyle='#000'; ctx.lineWidth=Math.max(1,4.3*S);
          ctx.beginPath(); ctx.moveTo(102.69*S,2461.97*S); ctx.lineTo((102.69+1887.44)*S,2461.97*S); ctx.stroke();

          // Linha interna
          ctx.lineWidth=Math.max(1,1.67*S);
          ctx.beginPath(); ctx.moveTo(150.5*S,1201.84*S); ctx.lineTo((150.5+733.54)*S,1201.84*S); ctx.stroke();

          // Linha tracejada
          ctx.lineWidth=Math.max(1,0.83*S); ctx.setLineDash([6*S,4*S]);
          ctx.beginPath(); ctx.moveTo(149.91*S,1073.25*S); ctx.lineTo((149.91+331.22)*S,1073.25*S); ctx.stroke();
          ctx.setLineDash([]);

          // Labels
          const fLabel = Math.round(36*S); ctx.font=`${fLabel}px Arial`;
          ctx.fillText('Código da Doença', 149*S, (1093+36)*S);
          const fCod = Math.round(43*S); ctx.font=`bold ${fCod}px Arial`;
          ctx.fillText(codigoCid, 150*S, (1017+32)*S);
          const fLoc = Math.round(28*S); ctx.font=`${fLoc}px Arial`;
          ctx.fillText('Local e Data', 388*S, (1218+28)*S);

          // Médico / CRM
          ctx.font=`${Math.round(43*S)}px Arial`;
          ctx.fillText(nomeMedico, 150*S, (1448+33)*S);
          ctx.fillText(crm, 149*S, (1564+33)*S);

          // Linha_4
          ctx.strokeStyle='#000'; ctx.lineWidth=Math.max(1,1.67*S);
          ctx.beginPath(); ctx.moveTo(150.5*S,1515.5*S); ctx.lineTo((150.5+733.54)*S,1515.5*S); ctx.stroke();

          // Aceito CID / Auth / Link
          const fA = Math.round(43*S); ctx.font=`${fA}px Arial`;
          ctx.fillText('Aceito a Colocação do CID. Assinado us ___________________', 130*S, (1742+33)*S);
          ctx.fillText(`Código de Autenticação: ${codigoAuth}`, 132*S, (1824+33)*S);
          ctx.fillText(`Solicitação da senha: ${dataHora}`, 132*S, (1875+33)*S);
          ctx.fillText('Link para validação do Atestado Médico:', 133*S, (1987+33)*S);
          ctx.fillText(linkValidacao, 133*S, (1987+33+43)*S);

          // Rodapé data/ip
          const fR = Math.round(43*S); ctx.font=`${fR}px Arial`;
          ctx.textAlign='left'; ctx.fillText(dataHora, 574*S, (2481+33)*S);
          ctx.textAlign='right'; ctx.fillText(ip, (574+1014)*S, (2481+33)*S);
          ctx.textAlign='left';

          // Carimbo + marca d'água
          const finalRender = (carImg: HTMLImageElement | null) => {
            if (carImg) ctx.drawImage(carImg, 1478*S, 1209*S, 358*S, 661*S);

            // Efeito carimbo do médico (sobre a assinatura)
            if (nomeMedico || crm) {
              const INK = '#1a3580'; // azul tinta de carimbo
              const carimboCX = (1478 + 358/2) * S;
              const carimboY = 1215 * S;
              const fMed = Math.round(30*S);
              const lineH = fMed * 1.45;
              const nomeDisplay = nomeMedico.startsWith('Dr') ? nomeMedico : `Dr. ${nomeMedico}`;

              ctx.save();
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';

              // Mede largura máxima para o box do carimbo
              ctx.font = `bold ${fMed}px Arial`;
              const w1 = ctx.measureText(nomeDisplay).width;
              ctx.font = `${fMed}px Arial`;
              const w2 = ctx.measureText('Médico').width;
              const w3 = ctx.measureText(crm).width;
              const maxW = Math.max(w1, w2, w3);
              const padX = 18*S; const padY = 12*S;
              const boxX = carimboCX - maxW/2 - padX;
              const boxY = carimboY - padY;
              const boxW = maxW + padX*2;
              const boxH = lineH*3 + padY*2;

              // Sombra azul espalhada (simula ink bleed)
              ctx.shadowColor = INK;
              ctx.shadowBlur = 3*S;

              // Borda dupla do carimbo
              ctx.strokeStyle = INK;
              ctx.lineWidth = Math.max(1, 3.5*S);
              ctx.strokeRect(boxX, boxY, boxW, boxH);
              ctx.lineWidth = Math.max(1, 1.2*S);
              ctx.strokeRect(boxX + 5*S, boxY + 5*S, boxW - 10*S, boxH - 10*S);

              // Textos
              ctx.fillStyle = INK;

              // Linha 1 - Nome (bold)
              ctx.font = `bold ${fMed}px Arial`;
              ctx.fillText(nomeDisplay, carimboCX, carimboY);

              // Linha 2 - Médico
              ctx.font = `${fMed}px Arial`;
              ctx.fillText('Médico', carimboCX, carimboY + lineH);

              // Linha 3 - CRM
              ctx.font = `bold ${fMed}px Arial`;
              ctx.fillText(crm, carimboCX, carimboY + lineH*2);

              ctx.restore();
            }

            if (withWatermark) {
              const wmText = 'PREVIEW - DATA SISTEMAS';
              const wmFontSize = Math.round(90*S);
              const wmSpacingX = canvas.width * 0.65;
              const wmSpacingY = canvas.height * 0.18;
              ctx.save();
              ctx.globalAlpha = 0.10;
              ctx.fillStyle = '#000';
              ctx.font = `bold ${wmFontSize}px Arial`;
              ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              for (let row = -1; row <= 6; row++) {
                for (let col = -1; col <= 2; col++) {
                  ctx.save();
                  const cx = col*wmSpacingX + (row%2===0 ? 0 : wmSpacingX*0.5);
                  const cy = row*wmSpacingY;
                  ctx.translate(cx, cy); ctx.rotate(-Math.PI/6);
                  ctx.fillText(wmText, 0, 0);
                  ctx.restore();
                }
              }
              ctx.restore();
            }

            resolve();
          };

          if (assinaturaUrl) {
            const carImg = new Image();
            carImg.onload = () => finalRender(carImg);
            carImg.onerror = () => finalRender(null);
            carImg.src = assinaturaUrl;
          } else {
            finalRender(null);
          }
        };
        folha.src = '/images/hapvida-folha.png';
      };
      logo.src = logoHapvida;
    });
  }, [nomePaciente, cpfPaciente, horario, diasAfastamento, dataApartir, codigoCid,
      nomeHospital, enderecoHospital, cidadeHospital, nomeMedico, crm,
      codigoAuth, dataHora, linkValidacao, ip, assinaturaUrl]);

  // ── Preview (com marca d'água) ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderCanvas(canvas, SCALE, true);
  }, [renderCanvas]);

  // ── Criar Atestado ─────────────────────────────────────────────────────
  const criarAtestado = useCallback(async () => {
    if (!admin) return;
    if (!nomePaciente.trim()) { toast.error('Informe o nome do paciente'); return; }
    if (!cpfPaciente.trim()) { toast.error('Informe o CPF do paciente'); return; }
    if (!nomeMedico.trim()) { toast.error('Informe o nome do médico'); return; }

    setCriando(true);
    try {
      // 1. Salvar no banco (desconta crédito)
      const cidItem = CID_LIST.find(c => c.codigo === codigoCid);
      await mysqlApi.hapvida.save({
        admin_id: admin.id,
        session_token: admin.session_token,
        nome_paciente: nomePaciente,
        cpf_paciente: cpfPaciente,
        dias_afastamento: diasAfastamento,
        data_apartir: dataApartir,
        horario_atendimento: horario,
        codigo_doenca: codigoCid,
        descricao_doenca: cidItem?.descricao || null,
        nome_hospital: nomeHospital,
        endereco_hospital: enderecoHospital,
        cidade_hospital: cidadeHospital,
        nome_medico: nomeMedico,
        crm,
        codigo_autenticacao: codigoAuth,
        data_hora: dataHora,
        ip,
        link_validacao: linkValidacao,
      });

      // 2. Gerar imagem em alta resolução (sem marca d'água)
      const hiResCanvas = hiResCanvasRef.current!;
      hiResCanvas.width = ORIG_W;
      hiResCanvas.height = ORIG_H;
      await renderCanvas(hiResCanvas, 1, false);

      // 3. Converter canvas → PNG blob → PDF via pdf-lib
      const { PDFDocument } = await import('pdf-lib');
      const imgData = hiResCanvas.toDataURL('image/png');
      const resp = await fetch(imgData);
      const imgBytes = await resp.arrayBuffer();
      const pdfDoc = await PDFDocument.create();
      const pngImg = await pdfDoc.embedPng(imgBytes);
      // A4 portrait: 595 × 842 pts  (210mm × 297mm)
      const page = pdfDoc.addPage([595, 842]);
      page.drawImage(pngImg, { x: 0, y: 0, width: 595, height: 842 });
      const pdfBytes = await pdfDoc.save();

      // 4. Download
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atestado-hapvida-${nomePaciente.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      await refreshCredits();
      toast.success('✅ Atestado gerado e 1 crédito descontado!');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao gerar atestado');
    } finally {
      setCriando(false);
    }
  }, [admin, nomePaciente, cpfPaciente, diasAfastamento, dataApartir, horario,
      codigoCid, nomeHospital, enderecoHospital, cidadeHospital, nomeMedico, crm,
      codigoAuth, dataHora, ip, linkValidacao, renderCanvas, refreshCredits]);

  const handleUploadCarimbo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAssinaturaUrl(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (!admin) return <Navigate to="/login" replace />;

  const cidFiltrados = cidBusca.length >= 2
    ? CID_LIST.filter(c => c.descricao.toLowerCase().includes(cidBusca.toLowerCase()) || c.codigo.toLowerCase().includes(cidBusca.toLowerCase())).slice(0, 10)
    : [];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Hospital className="h-7 w-7 text-primary" />
            Atestado Médico Hapvida
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Preencha os dados ao lado — o preview é atualizado em tempo real.</p>
        </div>

        <div className="flex gap-6 items-start">
          {/* ── FORMULÁRIO ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Paciente */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Dados do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nome Completo</Label>
                  <Input value={nomePaciente} onChange={e => setNomePaciente(e.target.value.toUpperCase())} placeholder="NOME DO PACIENTE" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">CPF</Label>
                    <Input value={cpfPaciente} onChange={e => setCpfPaciente(formatCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Horário Atendimento</Label>
                    <Input value={horario} onChange={e => setHorario(e.target.value)} placeholder="HH:MM" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Dias de Afastamento</Label>
                    <Input type="number" min={1} max={30} value={diasAfastamento} onChange={e => setDiasAfastamento(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">A partir de</Label>
                    <Input value={dataApartir} onChange={e => setDataApartir(e.target.value)} placeholder="DD/MM/AAAA" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Doença CID */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Código da Doença (CID-10)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Label className="text-xs text-muted-foreground">Buscar doença ou código</Label>
                  <Input
                    value={cidBusca}
                    onChange={e => { setCidBusca(e.target.value); setCidDropdown(true); }}
                    onFocus={() => setCidDropdown(true)}
                    placeholder="Ex: lombalgia, gripe, J00..."
                    className="mt-1"
                  />
                  {cidDropdown && cidFiltrados.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-52 overflow-y-auto">
                      {cidFiltrados.map(c => (
                        <div
                          key={c.codigo}
                          className="flex items-baseline gap-2 px-3 py-2 cursor-pointer hover:bg-accent text-sm border-b border-border last:border-0"
                          onClick={() => { setCodigoCid(c.codigo); setCidBusca(`${c.codigo} — ${c.descricao}`); setCidDropdown(false); }}
                        >
                          <span className="font-mono font-bold text-primary min-w-[60px]">{c.codigo}</span>
                          <span className="text-muted-foreground text-xs">{c.descricao}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Código CID selecionado</Label>
                  <Input value={codigoCid} onChange={e => setCodigoCid(e.target.value.toUpperCase())} className="font-mono font-bold text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Hospital */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hospital className="h-4 w-4 text-primary" /> Hospital / Unidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Estado (UF)</Label>
                    <select
                      value={ufSelecionada}
                      onChange={e => setUfSelecionada(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {UFS_DISPONIVEIS.map(uf => (
                        <option key={uf} value={uf}>{uf} — {UF_LABELS[uf] ?? uf}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Unidade</Label>
                    <select
                      value={nomeHospital}
                      onChange={e => {
                        const u = getUnidadesPorUF(ufSelecionada).find(u => u.nome.toUpperCase() === e.target.value);
                        if (u) { setNomeHospital(u.nome.toUpperCase()); setEnderecoHospital(u.endereco.toUpperCase()); setCidadeHospital(u.cidade.toUpperCase()); }
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">— Selecione —</option>
                      {getUnidadesPorUF(ufSelecionada).map(u => (
                        <option key={u.nome} value={u.nome.toUpperCase()}>[{u.tipo.slice(0,3).toUpperCase()}] {u.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nome Hospital</Label>
                  <Input value={nomeHospital} onChange={e => setNomeHospital(e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Endereço</Label>
                  <Input value={enderecoHospital} onChange={e => setEnderecoHospital(e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Cidade / Tel.</Label>
                  <Input value={cidadeHospital} onChange={e => setCidadeHospital(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Médico */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" /> Dados do Médico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Filtros estado + cidade */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <select
                      value={ufMedico}
                      onChange={e => { setUfMedico(e.target.value); setCidadeMedico(''); setMedicoBusca(''); setMedicoDropdown(false); }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Todos</option>
                      {getEstadosMedicos().map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Cidade</Label>
                    <select
                      value={cidadeMedico}
                      onChange={e => { setCidadeMedico(e.target.value); setMedicoBusca(''); setMedicoDropdown(true); }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={!ufMedico}
                    >
                      <option value="">— Todas —</option>
                      {cidadesMedico.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Campo de busca por texto */}
                <div className="relative space-y-1">
                  <Label className="text-xs text-muted-foreground">Buscar por nome, CRM ou especialidade</Label>
                  <Input
                    value={medicoBusca}
                    onChange={e => { setMedicoBusca(e.target.value); setMedicoDropdown(true); }}
                    onFocus={() => setMedicoDropdown(true)}
                    placeholder="Ex: cardiologia, Dr. Silva, CRM..."
                  />
                  {medicoDropdown && medicosFiltrados.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-56 overflow-y-auto">
                      {medicosFiltrados.map((m, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 cursor-pointer hover:bg-accent text-sm border-b border-border last:border-0"
                          onClick={() => {
                            setNomeMedico(m.nome);
                            setCrm(m.crm);
                            setMedicoBusca(`${m.nome} — ${m.crm}`);
                            setMedicoDropdown(false);
                          }}
                        >
                          <div className="font-medium text-foreground">{m.nome}</div>
                          <div className="text-xs text-muted-foreground">{m.crm} · {m.especialidade} · {m.cidade}/{m.uf}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Campos manuais */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nome do Médico</Label>
                  <Input value={nomeMedico} onChange={e => setNomeMedico(e.target.value.toUpperCase())} placeholder="DR. NOME COMPLETO" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">CRM</Label>
                  <Input value={crm} onChange={e => setCrm(e.target.value.toUpperCase())} placeholder="CRM 00000-UF" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Carimbo / Assinatura</Label>
                  <label className="block cursor-pointer">
                    <div className="border border-dashed border-border rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
                      {assinaturaUrl && assinaturaUrl !== '/images/hapvida-carimbo-default.png'
                        ? '✅ Carimbo personalizado — clique para trocar'
                        : '📎 Carimbo padrão — clique para substituir'}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadCarimbo} />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Informativos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" /> Dados Informativos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">IP</Label>
                    <Input value={ip} onChange={e => setIp(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Cód. Autenticação</Label>
                    <div className="flex gap-1">
                      <Input value={codigoAuth} onChange={e => setCodigoAuth(e.target.value.toUpperCase())} className="font-mono text-xs" maxLength={16} />
                      <Button variant="outline" size="sm" onClick={() => setCodigoAuth(gerarCodigo())} className="shrink-0 text-xs px-2">🔀</Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Data/Hora</Label>
                  <div className="flex gap-1">
                    <Input value={dataHora} onChange={e => setDataHora(e.target.value)} className="text-xs" />
                    <Button variant="outline" size="sm" onClick={() => setDataHora(nowStr())} className="shrink-0 text-xs px-2">⏰</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão criar */}
            <Button
              size="lg"
              className="w-full text-base font-bold h-12"
              onClick={criarAtestado}
              disabled={criando}
            >
              {criando ? (
                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Gerando atestado...</>
              ) : (
                '📄 Criar Atestado — 1 crédito'
              )}
            </Button>
          </div>

          {/* ── PREVIEW ── */}
          <div className="sticky top-6 shrink-0">
            <div className="text-xs text-muted-foreground mb-2 text-center font-medium uppercase tracking-wider">Preview (com marca d'água)</div>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="rounded-lg shadow-xl border border-border bg-white block"
              style={{ width: CANVAS_W, height: CANVAS_H }}
            />
          </div>
        </div>
      </div>

      {/* Canvas oculto para geração do PDF em alta resolução */}
      <canvas ref={hiResCanvasRef} style={{ display: 'none' }} />
    </DashboardLayout>
  );
}
