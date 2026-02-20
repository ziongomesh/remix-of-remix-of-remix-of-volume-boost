import { useState } from 'react';

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
  endereco_hospital: string | null;
  cidade_hospital: string | null;
  nome_medico: string;
  crm: string | null;
  codigo_autenticacao: string;
  data_hora: string | null;
  ip: string | null;
  link_validacao: string | null;
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
    <div style={{ minWidth: 0, background: '#f5f5f5', minHeight: '100vh', fontFamily: 'Verdana, Arial, Helvetica, sans-serif', fontSize: 13, color: '#333' }}>

      {/* HEADER */}
      <div className="header" style={{ background: '#fff' }}>
        {/* Logo centered */}
        <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', borderBottom: '1px solid #e1dfe3' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hapvida_logo.svg/320px-Hapvida_logo.svg.png"
            alt="Hapvida - Plano de Saúde"
            style={{ height: 55, objectFit: 'contain' }}
          />
        </div>
        {/* Menu azul */}
        <div style={{ background: '#006EB6', borderBottom: '4px solid #005389' }}>
          <div style={{ maxWidth: 1170, margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              {['Hapvida', 'Rede Exclusiva', 'Seja um Cliente'].map(item => (
                <a key={item} href="#" style={{ color: '#fff', display: 'block', padding: '15px 18px', fontFamily: '"GloberBold", sans-serif', fontSize: 14, fontWeight: 'bold', textDecoration: 'none' }}>
                  {item}
                </a>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              {['Perguntas Frequentes', 'Marcar Consulta'].map(item => (
                <a key={item} href="#" style={{ color: '#fff', display: 'block', padding: '15px 18px', fontFamily: '"GloberBold", sans-serif', fontSize: 14, fontWeight: 'bold', textDecoration: 'none' }}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main corpo" style={{ maxWidth: 1170, margin: '0 auto', padding: '20px 15px' }}>
        <div style={{ background: '#fff', border: '1px solid #D5D5D5', padding: '20px 25px' }}>

          {/* Title */}
          <div style={{ borderBottom: '2px solid #006EB6', paddingBottom: 8, marginBottom: 20 }}>
            <h1 style={{ fontSize: 16, color: '#333', fontWeight: 'bold', margin: 0 }}>
              Autenticação de Atestado - Exclusivo para Cliente Hap
            </h1>
          </div>

          {/* Dialog box - idêntico ao original */}
          <div
            className="ui-dialog ui-widget ui-widget-content ui-corner-all"
            style={{
              position: 'relative',
              overflow: 'hidden',
              zIndex: 1000,
              height: 'auto',
              width: '100%',
              maxWidth: 600,
              display: 'block',
              border: '1px solid #aaaaaa',
              borderRadius: 6,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {/* Dialog title bar */}
            <div style={{
              background: 'linear-gradient(#e9e9e9, #d8d8d8)',
              borderBottom: '1px solid #aaa',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 'bold', fontSize: 13, color: '#333' }}>
                Informe a senha e tenha todas as informações sobre o Atestado
              </span>
            </div>

            {/* Dialog content */}
            <div style={{ padding: '16px 20px' }}>
              <br />
              <label style={{ fontWeight: 'bold', fontSize: 12 }}>SENHA DO ATESTADO:</label>
              <br /><br />
              <input
                type="text"
                value={senha}
                onChange={e => setSenha(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                maxLength={56}
                style={{
                  width: 200,
                  padding: '4px 6px',
                  border: '1px solid #aaa',
                  borderRadius: 3,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  outline: 'none',
                }}
              />
              <br /><br />

              {error && (
                <p style={{ color: '#c0392b', fontSize: 12, marginBottom: 8 }}>{error}</p>
              )}
            </div>

            {/* Dialog button pane */}
            <div style={{
              background: '#f5f5f5',
              borderTop: '1px solid #ddd',
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleConsultar}
                disabled={loading}
                style={{
                  padding: '6px 20px',
                  background: loading ? '#aaa' : '#006EB6',
                  color: '#fff',
                  border: '1px solid #005a9a',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Verdana, Arial, sans-serif',
                  letterSpacing: 1,
                }}
              >
                {loading ? 'AGUARDE...' : 'CONSULTAR'}
              </button>
            </div>
          </div>

          {/* RESULTADO */}
          {data && (
            <div style={{ marginTop: 24, maxWidth: 600, border: '1px solid #ccc', borderRadius: 4, background: '#fff' }}>
              <h3 style={{ fontSize: 13, fontWeight: 'bold', color: '#1a5276', padding: '10px 16px', borderBottom: '1px solid #ccc', margin: 0 }}>
                Autenticação de Atestado - Dados do Atestado
              </h3>

              <div style={{ padding: '12px 16px' }}>
                {/* Caixa azul escuro */}
                <div style={{ background: '#1a4f7a', padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, margin: 0, textTransform: 'uppercase' }}>
                    INFORMACOES EM {formatDate(data.created_at)} {consultaTime}
                  </p>
                </div>

                {/* Dados */}
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
                    onClick={() => { setData(null); setSenha(''); setConsultaTime(''); }}
                    style={{
                      background: '#1a5276',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 3,
                      padding: '6px 20px',
                      fontWeight: 'bold',
                      fontSize: 12,
                      cursor: 'pointer',
                      letterSpacing: 0.5,
                      fontFamily: 'Verdana, Arial, sans-serif',
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

      {/* FOOTER */}
      <footer style={{ background: '#f0f0f0', borderTop: '1px solid #ddd', marginTop: 40, padding: '30px 0 0' }}>
        <div style={{ maxWidth: 1170, margin: '0 auto', padding: '0 15px', display: 'flex', flexWrap: 'wrap' as const, gap: 20 }}>
          {/* Col 1 */}
          <div style={{ flex: '1 1 200px' }}>
            <h2 style={{ fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 10, textTransform: 'uppercase' }}>Hapvida</h2>
            <h4 style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>Institucional</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Hapvida', 'Rede Exclusiva', 'Atendimento ao Cliente', 'Assessoria de Imprensa', 'Trabalhe Conosco'].map(i => (
                <li key={i}><a href="#" style={{ color: '#006eb6', fontSize: 11, textDecoration: 'none' }}>{i}</a></li>
              ))}
            </ul>
          </div>
          {/* Col 2 */}
          <div style={{ flex: '1 1 260px' }}>
            <h2 style={{ fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 10, textTransform: 'uppercase' }}>Atendimento</h2>
            <h4 style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>Atendimento On-line</h4>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 10 }}>
              {['Chat On-line', 'SAC', 'Deficientes Auditivos', 'Perguntas Frequentes', 'Fale Conosco'].map(i => (
                <li key={i}><a href="#" style={{ color: '#006eb6', fontSize: 11, textDecoration: 'none' }}>{i}</a></li>
              ))}
            </ul>
            <h4 style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>Atendimento Telefônico</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>Call Center 24h (Capitais): 4002.3633 ou 4020.3633</li>
              <li style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>Call Center 24h (Pernambuco): 4002.2870</li>
              <li style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>SAC 24h: 0800 280 9130</li>
              <li style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>Ouvidoria (8h às 18h): 4020.9091</li>
            </ul>
          </div>
          {/* Col 3 */}
          <div style={{ flex: '1 1 200px' }}>
            <h2 style={{ fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 10, textTransform: 'uppercase' }}>Onde Encontrar</h2>
            <h4 style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>Endereço</h4>
            <p style={{ fontSize: 10, color: '#555' }}>Av. Heráclito Graça, 406 Centro<br />CEP 60140-061 Fortaleza-CE</p>
            <h4 style={{ fontSize: 11, color: '#555', margin: '10px 0 6px' }}>Continue Conectado</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Facebook', 'Twitter'].map(i => (
                <li key={i}><a href="#" style={{ color: '#006eb6', fontSize: 11, textDecoration: 'none' }}>{i}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div style={{ background: '#e0e0e0', marginTop: 20, padding: '12px 15px', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: '#555', margin: 0 }}>
            Hapvida Saúde (ANS 36.825-3) - Todos os direitos reservados &nbsp;|&nbsp;
            <a href="#" style={{ color: '#006eb6', textDecoration: 'none' }}>Políticas de Privacidade</a>
          </p>
          <p style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
            Os Sistemas Online são compatíveis com os principais navegadores. Para melhor funcionamento mantenha seu navegador sempre atualizado.
          </p>
        </div>
      </footer>
    </div>
  );
}
