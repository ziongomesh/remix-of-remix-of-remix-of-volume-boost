import { useState } from 'react';
import hapvidaLogo from '@/assets/hapvida-logo.gif';
import maidaLogo from '@/assets/hapvida-maida.png';
import minhaSaude from '@/assets/hapvida-minha-saude.jpg';
import odonto from '@/assets/hapvida-odonto.png';
import ansLogo from '@/assets/hapvida-ans.png';
import ansSelo from '@/assets/hapvida-ans-selo.png';

interface AtestadoData {
  id: number;
  nome_paciente: string;
  cpf_paciente: string;
  dias_afastamento: number;
  data_apartir: string;
  horario_atendimento: string;
  codigo_doenca: string;
  descricao_doenca: string | null;
  nome_hospital: string;
  nome_medico: string;
  crm: string | null;
  codigo_autenticacao: string;
  created_at: string;
}

function formatCpf(cpf: string): string {
  const clean = (cpf || '').replace(/\D/g, '');
  if (clean.length === 11) return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return cpf;
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  const s = String(d).substring(0, 10);
  if (s.includes('-')) {
    const [y, m, day] = s.split('-');
    return `${day}/${m}/${y}`;
  }
  return s;
}

export default function VerificarHapvida() {
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AtestadoData | null>(null);
  const [error, setError] = useState('');
  const [consultaTime, setConsultaTime] = useState('');

  const handleConsultar = async () => {
    const codigoLimpo = senha.trim().toUpperCase();
    if (!codigoLimpo) { setError('Informe a senha do atestado.'); return; }
    setLoading(true); setError(''); setData(null);
    try {
      const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api';
      const base = apiUrl.replace(/\/+$/, '').endsWith('/api')
        ? apiUrl.replace(/\/+$/, '')
        : `${apiUrl.replace(/\/+$/, '')}/api`;
      const response = await fetch(`${base}/verify-hapvida?codigo=${encodeURIComponent(codigoLimpo)}`);
      if (!response.ok) { setError('Atestado não encontrado. Verifique o código informado.'); setLoading(false); return; }
      const result: AtestadoData = await response.json();
      setData(result);
      const now = new Date();
      setConsultaTime(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`);
    } catch { setError('Erro ao consultar. Tente novamente.'); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleConsultar(); };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Verdana, Arial, Helvetica, sans-serif', fontSize: 13, color: '#333', overflowX: 'hidden' }}>

      {/* ===== HEADER ===== */}
      {/* Menu azul com logo centralizado em aba branca */}
      <div style={{ background: '#006EB6', borderBottom: '4px solid #005389', position: 'relative', height: 49 }}>
        <div style={{ maxWidth: 1170, margin: '0 auto', display: 'flex', alignItems: 'stretch', height: '100%', position: 'relative' }}>

          {/* Links esquerda */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {['Hapvida', 'Rede Exclusiva', 'Seja um Cliente'].map(item => (
              <a key={item} href="#" style={{ color: '#fff', padding: '0 18px', fontSize: 14, fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', height: '100%', fontFamily: 'Verdana, Arial, sans-serif' }}>
                {item}
              </a>
            ))}
          </div>

          {/* Logo centralizado — aba branca que sobe acima do menu */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: -10, zIndex: 10 }}>
            <div style={{
              background: '#fff',
              borderRadius: '0 0 50% 50% / 0 0 20px 20px',
              padding: '6px 20px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              minWidth: 130,
              height: 65,
            }}>
              <img src={hapvidaLogo} alt="Hapvida" style={{ height: 50, objectFit: 'contain' }} />
            </div>
          </div>

          {/* Links direita */}
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            {['Perguntas Frequentes', 'Marcar Consulta'].map(item => (
              <a key={item} href="#" style={{ color: '#fff', padding: '0 18px', fontSize: 14, fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', height: '100%', fontFamily: 'Verdana, Arial, sans-serif' }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      {/* Área branca com caixa cinza centralizada — como no site original */}
      <div style={{ background: '#fff', padding: '30px 15px 50px' }}>
        <div style={{ maxWidth: 740, margin: '0 auto', background: '#ebebeb', padding: '20px 30px 30px' }}>

          {/* Título pequeno azul acima do dialog */}
          <p style={{ color: '#006EB6', fontSize: 12, fontWeight: 'bold', marginBottom: 8, fontFamily: 'Verdana, Arial, sans-serif' }}>
            Autenticação de Atestado - Exclusivo para Cliente Hap
          </p>

          {/* Dialog box */}
          <div style={{
            border: '1px solid #aaa',
            background: '#fff',
            borderRadius: 2,
            maxWidth: 480,
          }}>
            {/* Titlebar — azul escuro com texto branco */}
            <div style={{
              background: '#1a5276',
              padding: '10px 14px',
              borderRadius: '2px 2px 0 0',
            }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, fontFamily: 'Trebuchet MS, Tahoma, Verdana, Arial, sans-serif' }}>
                Informe a senha e tenha todas as informações sobre o Atestado
              </span>
            </div>

            {/* Conteúdo */}
            <div style={{ padding: '14px 16px 10px', background: '#fff' }}>
              <label style={{ fontWeight: 'bold', fontSize: 12, display: 'block', marginBottom: 6 }}>
                SENHA DO ATESTADO:
              </label>
              <input
                type="text"
                value={senha}
                onChange={e => setSenha(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                size={25}
                maxLength={56}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #aaa',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  fontFamily: 'Verdana, Arial, sans-serif',
                  outline: 'none',
                  width: 190,
                  display: 'block',
                }}
              />
              {error && <p style={{ color: '#c0392b', fontSize: 11, marginTop: 6 }}>{error}</p>}
            </div>

            {/* Button pane — linha separadora e botão azul à direita */}
            <div style={{
              borderTop: '1px solid #ddd',
              padding: '8px 12px',
              background: '#fff',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleConsultar}
                disabled={loading}
                style={{
                  background: loading ? '#aaa' : '#006EB6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 2,
                  padding: '6px 18px',
                  fontSize: 12,
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Verdana, Arial, sans-serif',
                  letterSpacing: 0.5,
                }}
              >
                {loading ? 'AGUARDE...' : 'CONSULTAR'}
              </button>
            </div>
          </div>

          {/* RESULTADO */}
          {data && (
            <div style={{ marginTop: 20, maxWidth: 480, border: '1px solid #aaa', borderRadius: 2, background: '#fff' }}>
              <div style={{ background: '#1a4f7a', padding: '10px 14px' }}>
                <p style={{ color: '#fff', fontWeight: 'bold', fontSize: 11, margin: 0, textTransform: 'uppercase' }}>
                  INFORMACOES EM {formatDate(data.created_at)} {consultaTime}
                </p>
              </div>
              <div style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: 12, lineHeight: 2.2, color: '#222' }}>
                <p style={{ margin: 0 }}><strong>ATESTADO EMITIDO PARA O BENEFICIARIO:</strong> {data.nome_paciente}</p>
                <p style={{ margin: 0 }}><strong>PORTADOR DA CREDENCIAL:</strong> {formatCpf(data.cpf_paciente)}</p>
                <p style={{ margin: 0 }}><strong>PELO MÉDICO:</strong> {data.nome_medico}{data.crm ? ` — ${data.crm}` : ''}</p>
                <p style={{ margin: 0 }}><strong>LOCAL DE ATENDIMENTO:</strong> {data.nome_hospital}</p>
                <p style={{ margin: 0 }}><strong>INICIO DA VALIDADE EM:</strong> {formatDate(data.data_apartir)}</p>
                <p style={{ margin: 0 }}><strong>VÁLIDO POR:</strong> {data.dias_afastamento} DIA{data.dias_afastamento !== 1 ? 'S' : ''}</p>
              </div>
              <div style={{ borderTop: '1px solid #ddd', padding: '8px 12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setData(null); setSenha(''); setConsultaTime(''); setError(''); }}
                  style={{ background: '#006EB6', color: '#fff', border: 'none', borderRadius: 2, padding: '6px 18px', fontWeight: 'bold', fontSize: 12, cursor: 'pointer', fontFamily: 'Verdana, Arial, sans-serif' }}
                >
                  VOLTAR
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ===== FOOTER ===== */}
      {/* Linha laranja separadora */}
      <div style={{ height: 6, background: '#f6a828' }} />

      {/* Footer cinza escuro */}
      <footer style={{ background: '#3d3d3d', color: '#ccc', padding: '30px 0 0' }}>
        <div style={{ maxWidth: 1170, margin: '0 auto', padding: '0 15px 24px', display: 'flex', flexWrap: 'wrap' as const, gap: 0 }}>

          {/* Col HAPVIDA */}
          <div style={{ flex: '0 0 200px', marginRight: 40 }}>
            <h2 style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Hapvida</h2>
            <h4 style={{ fontSize: 11, color: '#006EB6', marginBottom: 8, fontWeight: 'bold' }}>Institucional</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Hapvida', 'Rede Exclusiva', 'Atendimento ao Cliente', 'Assessoria de Imprensa', 'Trabalhe Conosco'].map(i => (
                <li key={i} style={{ marginBottom: 5 }}>
                  <a href="#" style={{ color: '#bbb', fontSize: 11, textDecoration: 'none' }}>{i}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col ATENDIMENTO */}
          <div style={{ flex: '0 0 480px', marginRight: 40 }}>
            <h2 style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Atendimento</h2>
            <div style={{ display: 'flex', gap: 30 }}>
              {/* Online */}
              <div>
                <h4 style={{ fontSize: 11, color: '#006EB6', marginBottom: 8, fontWeight: 'bold' }}>Atendimento On-line</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {['Chat On-line', 'SAC', 'Deficientes Auditivos', 'Perguntas Frequentes', 'Fale Conosco'].map(i => (
                    <li key={i} style={{ marginBottom: 5 }}>
                      <a href="#" style={{ color: '#bbb', fontSize: 11, textDecoration: 'none' }}>{i}</a>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Telefônico */}
              <div style={{ maxWidth: 260 }}>
                <h4 style={{ fontSize: 11, color: '#006EB6', marginBottom: 8, fontWeight: 'bold' }}>Atendimento Telefônico</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    'Call Center 24h (Capitais): 4002.3633 ou 4020.3633',
                    'Call Center 24h (Pernambuco): 4002.2870',
                    'Call Center 24h (Interior e capitais): 0300 313 3633',
                    'Marcações de consultas e exames: 6h às 22h',
                    'SAC 24h (exclusivo para telefones fixos): 0800 280 9130',
                    'Ouvidoria (8h às 18h): 4020.9091',
                  ].map(i => (
                    <li key={i} style={{ fontSize: 10, color: '#bbb', marginBottom: 5, lineHeight: 1.4 }}>{i}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Col ONDE ENCONTRAR */}
          <div style={{ flex: '1 1 200px' }}>
            <h2 style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Onde Encontrar</h2>
            <div style={{ display: 'flex', gap: 30 }}>
              <div>
                <h4 style={{ fontSize: 11, color: '#006EB6', marginBottom: 8, fontWeight: 'bold' }}>Endereço</h4>
                <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 14px', lineHeight: 1.7 }}>
                  Av. Heráclito Graça, 406 Centro<br />CEP 60140-061 Fortaleza-CE
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: 11, color: '#006EB6', marginBottom: 8, fontWeight: 'bold' }}>Continue Conectado</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {['Facebook', 'Twitter'].map(i => (
                    <li key={i} style={{ marginBottom: 5 }}>
                      <a href="#" style={{ color: '#bbb', fontSize: 11, textDecoration: 'none' }}>{i}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Parceiros */}
        <div style={{ borderTop: '1px solid #555', padding: '16px 15px' }}>
          <div style={{ maxWidth: 1170, margin: '0 auto', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' as const }}>
            <a href="#" target="_blank" rel="noreferrer">
              <img src={odonto} alt="Hapvida + Odonto" style={{ height: 60, objectFit: 'contain', filter: 'brightness(0.9)' }} />
            </a>
            <a href="#" target="_blank" rel="noreferrer">
              <img src={maidaLogo} alt="Maida Health" style={{ height: 60, objectFit: 'contain', filter: 'brightness(0.9)' }} />
            </a>
            <a href="#" target="_blank" rel="noreferrer">
              <img src={minhaSaude} alt="Minha Saúde Hapvida" style={{ height: 60, objectFit: 'contain', filter: 'brightness(0.9)' }} />
            </a>
          </div>
        </div>

        {/* Bottom info */}
        <div style={{ borderTop: '1px solid #555', padding: '14px 15px 20px' }}>
          <div style={{ maxWidth: 1170, margin: '0 auto', display: 'flex', flexWrap: 'wrap' as const, gap: 20, alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 10, color: '#999', margin: '0 0 4px' }}>
                Hapvida Saúde (ANS 36.825-3) - Todos os direitos reservados
              </p>
              <a href="#" style={{ fontSize: 10, color: '#006eb6', textDecoration: 'none' }}>Políticas de Privacidade</a>
              <br />
              <a href="#" target="_blank" rel="noreferrer">
                <img src={ansLogo} alt="ANS" style={{ height: 26, marginTop: 6, objectFit: 'contain' }} />
              </a>
            </div>
            <div>
              <img src={ansSelo} alt="ANS - Selo Hapvida" style={{ height: 34, objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, maxWidth: 340 }}>
              <p style={{ fontSize: 10, color: '#888', margin: 0, lineHeight: 1.6 }}>
                Os Sistemas Online são compatíveis com os principais navegadores. Para melhor funcionamento mantenha seu navegador sempre atualizado.
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
