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
    if (!codigoLimpo) {
      setError('Informe a senha do atestado.');
      return;
    }
    setLoading(true);
    setError('');
    setData(null);
    try {
      const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api';
      const base = apiUrl.replace(/\/+$/, '').endsWith('/api')
        ? apiUrl.replace(/\/+$/, '')
        : `${apiUrl.replace(/\/+$/, '')}/api`;
      const response = await fetch(`${base}/verify-hapvida?codigo=${encodeURIComponent(codigoLimpo)}`);
      if (!response.ok) {
        setError('Atestado não encontrado. Verifique o código informado.');
        setLoading(false);
        return;
      }
      const result: AtestadoData = await response.json();
      setData(result);
      const now = new Date();
      setConsultaTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );
    } catch {
      setError('Erro ao consultar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConsultar();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'Verdana, Arial, Helvetica, sans-serif',
      fontSize: 13,
      color: '#333',
      overflowX: 'hidden',
    }}>

      {/* ===== HEADER ===== */}
      <div className="header" style={{ background: '#fff' }}>
        {/* Logo row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #e1dfe3',
          background: '#fff',
        }}>
          <img src={hapvidaLogo} alt="Hapvida - Plano de Saúde" style={{ height: 65, objectFit: 'contain' }} />
        </div>

        {/* Menu azul — idêntico ao .menu-topo do style-ie.css */}
        <div style={{ height: 49, borderBottom: '4px solid #005389', background: '#006EB6' }}>
          <div style={{ maxWidth: 1170, margin: '0 auto', display: 'flex', justifyContent: 'space-between', height: '100%' }}>
            <div style={{ display: 'flex' }}>
              {['Hapvida', 'Rede Exclusiva', 'Seja um Cliente'].map(item => (
                <a key={item} href="#" style={{
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  fontFamily: '"GloberBold", sans-serif',
                  fontSize: 15,
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  height: '100%',
                }}>
                  {item}
                </a>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              {['Perguntas Frequentes', 'Marcar Consulta'].map(item => (
                <a key={item} href="#" style={{
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  fontFamily: '"GloberBold", sans-serif',
                  fontSize: 15,
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  height: '100%',
                }}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN / CORPO ===== */}
      <div className="main corpo" style={{ maxWidth: 1170, margin: '0 auto', padding: '20px 15px' }}>
        <div className="content coluna_esquerda">
          <div className="ultimas_noticias">

            {/* Título — .titulo h1 do stlhapvida.css: font-size 18, color #005389 */}
            <span className="titulo">
              <h1 style={{
                fontFamily: 'Verdana, Arial, Helvetica, sans-serif',
                fontSize: 14,
                color: '#333',
                fontWeight: 'normal',
                marginBottom: 12,
              }}>
                Autenticação de Atestado - Exclusivo para Cliente Hap
              </h1>
            </span>

            {/* ===== UI-DIALOG — replicando exatamente o HTML original ===== */}
            {/* div inline style do HTML: position:relative; overflow:hidden; z-index:1000; height:auto; width:600px */}
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              zIndex: 1000,
              height: 'auto',
              width: '100%',
              maxWidth: 600,
              display: 'block',
              /* ui-widget ui-widget-content ui-corner-all */
              border: '1px solid #aaaaaa',
              background: '#eeeeee',
              color: '#333333',
              borderRadius: 4,
              fontFamily: 'Trebuchet MS, Tahoma, Verdana, Arial, sans-serif',
              fontSize: '1.1em',
            }}>
              {/* ui-dialog-titlebar ui-widget-header ui-corner-all:
                  border:0; font-weight:bold; border-bottom: 3px solid #005389; border-radius:0 */}
              <div style={{
                border: 0,
                fontWeight: 'bold',
                borderBottom: '3px solid #005389',
                borderRadius: 0,
                padding: '8px 10px',
                overflow: 'hidden',
                /* background do header jQuery UI smoothness: gradiente laranja */
                background: 'linear-gradient(to bottom, #fdd58e 0%, #f6a828 100%)',
              }}>
                <span style={{ fontSize: '1em', color: '#ffffff' }}>
                  Informe a senha e tenha todas as informações sobre o Atestado
                </span>
              </div>

              {/* ui-dialog-content ui-widget-content — #dialog font-size:12px */}
              <div id="dialog" style={{
                /* ui-widget-content: border:1px solid #ddd, background:#eeeeee */
                padding: '0 18px 10px',
                fontSize: 12,
                color: '#333333',
                background: '#eeeeee',
              }}>
                <p>&nbsp;</p>
                <br />
                <label><b>SENHA DO ATESTADO:</b></label>
                <br />
                {/* .ultimas_noticias input: height:18, padding:5px 0 0 4px, border:#ccc, font-size:12, text-transform:uppercase */}
                <input
                  type="text"
                  value={senha}
                  onChange={e => setSenha(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  size={25}
                  maxLength={56}
                  style={{
                    height: 18,
                    padding: '5px 0 0 4px',
                    color: '#585858',
                    border: '1px solid #cccccc',
                    fontSize: 12,
                    marginBottom: 5,
                    textTransform: 'uppercase',
                    fontFamily: 'Verdana, Arial, Helvetica, sans-serif',
                    outline: 'none',
                    background: '#fff',
                    width: 190,
                  }}
                />
                <br /><br />

                {error && (
                  <p style={{ color: '#c0392b', fontSize: 11, margin: '0 0 6px' }}>{error}</p>
                )}
              </div>

              {/* ui-dialog-buttonpane ui-widget-content ui-helper-clearfix */}
              <div style={{
                borderTop: '1px solid #dddddd',
                background: '#eeeeee',
                padding: '4px 10px 4px 0',
                overflow: 'hidden',
                textAlign: 'right',
              }}>
                <div style={{ display: 'inline-block' }}>
                  {/* ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only */}
                  <button
                    onClick={handleConsultar}
                    disabled={loading}
                    style={{
                      fontFamily: 'Trebuchet MS, Tahoma, Verdana, Arial, sans-serif',
                      fontSize: '1em',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      background: 'linear-gradient(to bottom, #ffffff 0%, #e6e6e6 100%)',
                      border: '1px solid #cccccc',
                      borderRadius: 4,
                      padding: '4px 10px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      margin: '4px 0',
                    }}
                    onMouseEnter={e => {
                      if (!loading) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#f48120';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#f48120';
                      }
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(to bottom, #ffffff 0%, #e6e6e6 100%)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#cccccc';
                    }}
                  >
                    <span style={{ color: '#333', fontWeight: 'bold' }}>{loading ? 'AGUARDE...' : 'CONSULTAR'}</span>
                  </button>
                </div>
              </div>
            </div>
            {/* FIM UI-DIALOG */}

            {/* ===== RESULTADO ===== */}
            {data && (
              <div style={{ marginTop: 24, maxWidth: 600, border: '1px solid #ccc', borderRadius: 4, background: '#fff' }}>
                <h3 style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#1a5276',
                  padding: '10px 16px',
                  borderBottom: '1px solid #ccc',
                  margin: 0,
                  fontFamily: 'Verdana, Arial, Helvetica, sans-serif',
                }}>
                  Autenticação de Atestado - Dados do Atestado
                </h3>

                <div style={{ padding: '12px 16px' }}>
                  <div style={{ background: '#1a4f7a', padding: '10px 14px', marginBottom: 16 }}>
                    <p style={{ color: '#fff', fontWeight: 'bold', fontSize: 11, margin: 0, textTransform: 'uppercase' }}>
                      INFORMACOES EM {formatDate(data.created_at)} {consultaTime}
                    </p>
                  </div>

                  <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, lineHeight: 2.2, color: '#222' }}>
                    <p style={{ margin: 0 }}>
                      <strong>ATESTADO EMITIDO PARA O BENEFICIARIO:</strong> {data.nome_paciente}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>PORTADOR DA CREDENCIAL:</strong> {formatCpf(data.cpf_paciente)}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>PELO MÉDICO:</strong> {data.nome_medico}{data.crm ? ` — ${data.crm}` : ''}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>LOCAL DE ATENDIMENTO:</strong> {data.nome_hospital}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>INICIO DA VALIDADE EM:</strong> {formatDate(data.data_apartir)}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>VÁLIDO POR:</strong> {data.dias_afastamento} DIA{data.dias_afastamento !== 1 ? 'S' : ''}
                    </p>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '16px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setData(null); setSenha(''); setConsultaTime(''); setError(''); }}
                      style={{
                        background: '#f6f6f6',
                        color: '#1c94c4',
                        border: '1px solid #cccccc',
                        borderRadius: 4,
                        padding: '5px 14px',
                        fontWeight: 'bold',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: 'Trebuchet MS, Tahoma, Verdana, Arial, sans-serif',
                      }}
                    >
                      VOLTAR
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="footer container" style={{ background: '#f0f0f0', borderTop: '1px solid #ddd', marginTop: 40 }}>
        <div style={{ maxWidth: 1170, margin: '0 auto', padding: '30px 15px 20px', display: 'flex', flexWrap: 'wrap' as const, gap: 24 }}>

          {/* Col 1 - Hapvida */}
          <div style={{ flex: '1 1 180px' }}>
            <h2 style={{ fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'Verdana, Arial, sans-serif' }}>Hapvida</h2>
            <h4 style={{ fontSize: 11, color: '#555', marginBottom: 8, fontWeight: 'bold' }}>Institucional</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Hapvida', 'Rede Exclusiva', 'Atendimento ao Cliente', 'Assessoria de Imprensa', 'Trabalhe Conosco'].map(i => (
                <li key={i} style={{ marginBottom: 4 }}>
                  <a href="#" style={{ color: '#006eb6', fontSize: 11, textDecoration: 'none' }}>{i}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2 - Atendimento */}
          <div style={{ flex: '1 1 280px' }}>
            <h2 style={{ fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'Verdana, Arial, sans-serif' }}>Atendimento</h2>
            <h4 style={{ fontSize: 11, color: '#555', marginBottom: 8, fontWeight: 'bold' }}>Atendimento On-line</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px' }}>
              {['Chat On-line', 'SAC', 'Deficientes Auditivos', 'Perguntas Frequentes', 'Fale Conosco'].map(i => (
                <li key={i} style={{ marginBottom: 4 }}>
                  <a href="#" style={{ color: '#006eb6', fontSize: 11, textDecoration: 'none' }}>{i}</a>
                </li>
              ))}
            </ul>
            <h4 style={{ fontSize: 11, color: '#555', marginBottom: 8, fontWeight: 'bold' }}>Atendimento Telefônico</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Call Center 24h (Capitais): 4002.3633 ou 4020.3633',
                'Call Center 24h (Pernambuco): 4002.2870',
                'Call Center 24h (Interior e capitais): 0300 313 3633',
                'Marcações de consultas e exames: 6h às 22h',
                'SAC 24h (exclusivo para telefones fixos): 0800 280 9130',
                'Ouvidoria (8h às 18h): 4020.9091',
              ].map(i => (
                <li key={i} style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>{i}</li>
              ))}
            </ul>
          </div>

          {/* Col 3 - Onde Encontrar */}
          <div style={{ flex: '1 1 180px' }}>
            <h2 style={{ fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'Verdana, Arial, sans-serif' }}>Onde Encontrar</h2>
            <h4 style={{ fontSize: 11, color: '#555', marginBottom: 8, fontWeight: 'bold' }}>Endereço</h4>
            <p style={{ fontSize: 10, color: '#555', margin: '0 0 14px', lineHeight: 1.7 }}>
              Av. Heráclito Graça, 406 Centro<br />CEP 60140-061 Fortaleza-CE
            </p>
            <h4 style={{ fontSize: 11, color: '#555', marginBottom: 8, fontWeight: 'bold' }}>Continue Conectado</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Facebook', 'Twitter'].map(i => (
                <li key={i} style={{ marginBottom: 4 }}>
                  <a href="#" style={{ color: '#006eb6', fontSize: 11, textDecoration: 'none' }}>{i}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Parceiros */}
        <div style={{ maxWidth: 1170, margin: '0 auto', padding: '0 15px 20px', display: 'flex', gap: 20, flexWrap: 'wrap' as const, alignItems: 'center' }}>
          <a href="#" target="_blank" rel="noreferrer">
            <img src={odonto} alt="Hapvida + Odonto" style={{ width: 240, height: 90, objectFit: 'contain' }} />
          </a>
          <a href="#" target="_blank" rel="noreferrer">
            <img src={maidaLogo} alt="Maida Health" style={{ width: 240, height: 90, objectFit: 'contain' }} />
          </a>
          <a href="#" target="_blank" rel="noreferrer">
            <img src={minhaSaude} alt="Minha Saúde Hapvida" style={{ width: 240, height: 90, objectFit: 'contain' }} />
          </a>
        </div>

        {/* Bottom info */}
        <div style={{ borderTop: '1px solid #ddd', padding: '14px 15px' }}>
          <div style={{ maxWidth: 1170, margin: '0 auto' }}>
            <div className="infos info-hapvida" style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 10, color: '#555', margin: 0, lineHeight: 1.8 }}>
                Hapvida Saúde (ANS 36.825-3) - Todos os direitos reservados<br />
                <a href="#" style={{ color: '#006eb6', textDecoration: 'none' }}>Políticas de Privacidade</a><br />
                <a href="#" target="_blank" rel="noreferrer">
                  <img src={ansLogo} alt="ANS" style={{ height: 28, marginTop: 4, objectFit: 'contain', verticalAlign: 'middle' }} />
                </a>
              </p>
              <div style={{ marginTop: 6 }}>
                <img src={ansSelo} alt="ANS - Selo Hapvida" style={{ height: 36, objectFit: 'contain' }} />
              </div>
            </div>
            <div className="infos info-browser">
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
