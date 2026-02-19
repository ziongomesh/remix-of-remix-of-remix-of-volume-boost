import { useEffect, useRef, useState, useCallback } from 'react';
import logoHapvida from '@/assets/logo-hapvida.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [ip, setIp] = useState('10.200.125.141');
  const [codigoAuth, setCodigoAuth] = useState('3M15KLJSAF9');
  const [nomeMedico, setNomeMedico] = useState('RODOLFO CARDOSO DUTRA DE ALENCAR');
  const [codigodoenca, setCodigodoenca] = useState('N30.0');
  const [crm, setCrm] = useState('CRM 12596-AM');
  const [linkValidacao, setLinkValidacao] = useState('https://webhap.hapvida-validacao.info/');
  const [nomePaciente, setNomePaciente] = useState('NEYMAR JUNIOR GAMA');
  const [cpfPaciente, setCpfPaciente] = useState('704.762.672-77');
  const [diasAfastamento, setDiasAfastamento] = useState(1);
  const [dataApartir, setDataApartir] = useState('19/02/2026');
  const [horarioAtendimento, setHorarioAtendimento] = useState('12:32');
  const [assinaturaUrl, setAssinaturaUrl] = useState<string | null>(null);
  const assinaturaImgRef = useRef<HTMLImageElement | null>(null);

  const handleAssinaturaUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setAssinaturaUrl(url);
      const img = new Image();
      img.onload = () => { assinaturaImgRef.current = img; };
      img.src = url;
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
        if (assinaturaImgRef.current) {
          ctx.drawImage(
            assinaturaImgRef.current,
            1478 * SCALE,
            1209 * SCALE,
            358 * SCALE,
            661 * SCALE
          );
        }
      };
      folha.src = '/images/hapvida-folha.png';
    };
    logo.src = logoHapvida;
  }, [logoPos, dataHora, ip, codigoAuth, nomeMedico, crm, linkValidacao, assinaturaUrl, codigodoenca, nomePaciente, cpfPaciente, diasAfastamento, dataApartir, horarioAtendimento]);

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

        {/* Nome do Paciente */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Nome</Label>
          <Input
            value={nomePaciente}
            onChange={e => setNomePaciente(e.target.value.toUpperCase())}
            placeholder="Ex: NEYMAR JUNIOR GAMA"
            style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }}
          />
        </div>

        {/* CPF do Paciente */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>CPF</Label>
          <Input
            value={cpfPaciente}
            onChange={e => setCpfPaciente(e.target.value)}
            placeholder="Ex: 704.762.672-77"
            style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }}
          />
        </div>

        {/* Dias de afastamento + data apartir + horário */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Dias afastamento</Label>
          <Input
            type="number"
            min={1}
            max={30}
            value={diasAfastamento}
            onChange={e => setDiasAfastamento(Number(e.target.value))}
            style={{ background: '#222', color: '#fff', border: '1px solid #555', width: '70px' }}
          />
          <Label style={{ color: '#ccc', fontSize: '13px' }}>A partir de</Label>
          <Input
            value={dataApartir}
            onChange={e => setDataApartir(e.target.value)}
            placeholder="DD/MM/AAAA"
            style={{ background: '#222', color: '#fff', border: '1px solid #555', width: '130px' }}
          />
          <Label style={{ color: '#ccc', fontSize: '13px' }}>Horário</Label>
          <Input
            value={horarioAtendimento}
            onChange={e => setHorarioAtendimento(e.target.value)}
            placeholder="HH:MM"
            style={{ background: '#222', color: '#fff', border: '1px solid #555', width: '90px' }}
          />
        </div>

        {/* ── DADOS DA DOENÇA ── */}
        <div style={{ borderTop: '1px solid #555', paddingTop: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>DADOS DA DOENÇA</div>

        {/* Código da Doença */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Cód. Doença (CID)</Label>
          <Input
            value={codigodoenca}
            onChange={e => setCodigodoenca(e.target.value.toUpperCase())}
            placeholder="Ex: N30.0"
            style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }}
          />
        </div>

        {/* Nome do Médico */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Nome do Médico</Label>
          <Input
            value={nomeMedico}
            onChange={e => setNomeMedico(e.target.value.toUpperCase())}
            placeholder="Ex: RODOLFO CARDOSO DUTRA DE ALENCAR"
            style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }}
          />
        </div>

        {/* CRM */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>CRM</Label>
          <Input
            value={crm}
            onChange={e => setCrm(e.target.value.toUpperCase())}
            placeholder="Ex: CRM 12596-AM"
            style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }}
          />
        </div>

        {/* Assinatura / Carimbo do Médico */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Assinatura/Carimbo</Label>
          <label style={{ flex: 1, cursor: 'pointer' }}>
            <div style={{
              background: '#222', border: '1px dashed #666', borderRadius: '6px',
              padding: '8px 12px', color: assinaturaUrl ? '#4ade80' : '#aaa',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              {assinaturaUrl ? '✅ Assinatura carregada — clique para trocar' : '📎 Clique para enviar assinatura/carimbo (PNG sem fundo ou fundo branco)'}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleAssinaturaUpload} />
          </label>
          {assinaturaUrl && (
            <img src={assinaturaUrl} alt="preview assinatura" style={{ height: '48px', background: '#fff', borderRadius: '4px', padding: '2px' }} />
          )}
        </div>

        {/* Link de Validação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Link Validação</Label>
          <Input
            value={linkValidacao}
            onChange={e => setLinkValidacao(e.target.value)}
            placeholder="Ex: https://webhap.hapvida-validacao.info/"
            style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1, fontSize: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>IP</Label>
          <Input
            value={ip}
            onChange={e => setIp(e.target.value)}
            placeholder="Ex: 10.200.125.141"
            style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1 }}
          />
        </div>

        {/* Código de Autenticação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Label style={{ color: '#ccc', minWidth: '100px', fontSize: '13px' }}>Cód. Auth.</Label>
          <Input
            value={codigoAuth}
            onChange={e => setCodigoAuth(e.target.value.toUpperCase())}
            placeholder="Ex: 3M15KLJSAF9"
            maxLength={16}
            style={{ background: '#222', color: '#fff', border: '1px solid #555', flex: 1, fontFamily: 'monospace', letterSpacing: '2px' }}
          />
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
