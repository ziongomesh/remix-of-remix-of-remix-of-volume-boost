import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { isUsingMySQL } from '@/lib/db-config';
import logoHapvida from '@/assets/logo-hapvida.png';

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
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AtestadoData | null>(null);
  const [error, setError] = useState('');
  const [consultaTime, setConsultaTime] = useState('');

  const handleConsultar = async () => {
    const codigoLimpo = codigo.trim().toUpperCase();
    if (!codigoLimpo) {
      setError('Informe o código de autenticação.');
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
    <div className="min-h-screen bg-[#f5f5f5] font-[Roboto,sans-serif]" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Header Hapvida */}
      <div style={{ background: '#e30613', padding: '0' }}>
        <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', borderBottom: '3px solid #e30613' }}>
          <img src={logoHapvida} alt="Hapvida" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <div style={{ background: '#e30613', padding: '10px 16px', textAlign: 'center' }}>
          <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
            Autenticação de Atestado Médico
          </p>
        </div>
      </div>

      {/* Corpo */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>

        {/* Card de consulta */}
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.12)', padding: '24px 20px', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#333', marginBottom: 6 }}>
            Consultar Atestado
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
            Digite o <strong>Código de Autenticação</strong> impresso no rodapé do atestado médico para verificar sua autenticidade.
          </p>

          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
            Código de Autenticação
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Ex: AB3K7XQLN2P"
              maxLength={20}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1.5px solid #ccc',
                borderRadius: 6,
                fontSize: '0.95rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: 2,
                outline: 'none',
                textTransform: 'uppercase',
              }}
            />
            <button
              onClick={handleConsultar}
              disabled={loading}
              style={{
                background: loading ? '#aaa' : '#e30613',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Consultar
            </button>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 12px', background: '#fff5f5', border: '1px solid #ffcccc', borderRadius: 6 }}>
              <XCircle size={18} color="#e30613" />
              <span style={{ fontSize: '0.85rem', color: '#c0392b' }}>{error}</span>
            </div>
          )}
        </div>

        {/* Resultado */}
        {data && (
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            {/* Cabeçalho verde */}
            <div style={{ background: '#2e7d32', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={22} color="#fff" />
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>ATESTADO VÁLIDO</p>
                <p style={{ color: '#a5d6a7', fontSize: '0.75rem', margin: 0 }}>Consultado às {consultaTime}</p>
              </div>
            </div>

            {/* Campos */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Paciente */}
              <Section title="Dados do Paciente">
                <Field label="Nome" value={data.nome_paciente} />
                <Field label="CPF" value={formatCpf(data.cpf_paciente)} />
                <FieldRow>
                  <Field label="Afastamento" value={`${data.dias_afastamento} dia(s)`} />
                  <Field label="A partir de" value={formatDate(data.data_apartir)} />
                </FieldRow>
                {data.horario_atendimento && <Field label="Horário de Atendimento" value={data.horario_atendimento} />}
              </Section>

              {/* CID */}
              <Section title="Diagnóstico (CID-10)">
                <Field label="Código CID" value={data.codigo_doenca} mono />
                {data.descricao_doenca && <Field label="Descrição" value={data.descricao_doenca} />}
              </Section>

              {/* Hospital */}
              <Section title="Hospital / Unidade">
                <Field label="Nome" value={data.nome_hospital} />
                {data.endereco_hospital && <Field label="Endereço" value={data.endereco_hospital} />}
                {data.cidade_hospital && <Field label="Cidade" value={data.cidade_hospital} />}
              </Section>

              {/* Médico */}
              <Section title="Médico Responsável">
                <Field label="Nome" value={data.nome_medico} />
                {data.crm && <Field label="CRM" value={data.crm} />}
              </Section>

              {/* Autenticação */}
              <Section title="Dados de Autenticação">
                <Field label="Código" value={data.codigo_autenticacao} mono />
                {data.data_hora && <Field label="Data / Hora" value={data.data_hora} />}
                {data.ip && <Field label="IP de Emissão" value={data.ip} mono />}
                <Field label="Data de Emissão" value={formatDate(data.created_at)} />
              </Section>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, padding: '0 16px' }}>
          <p style={{ fontSize: '0.72rem', color: '#999', lineHeight: 1.6 }}>
            Este portal verifica a autenticidade de atestados médicos emitidos pelo sistema.<br />
            Em caso de dúvidas, entre em contato com a unidade emissora.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Componentes auxiliares ─────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#e30613', letterSpacing: 1, marginBottom: 10, borderBottom: '1px solid #f0f0f0', paddingBottom: 4 }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>;
}

function Field({ label, value, mono }: { label: string; value: string | number | null | undefined; mono?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: '0.72rem', color: '#888', marginBottom: 2 }}>{label}</p>
      <p style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#222',
        fontFamily: mono ? 'monospace' : undefined,
        borderBottom: '1px solid #eee',
        paddingBottom: 4,
        wordBreak: 'break-word',
      }}>
        {value || '—'}
      </p>
    </div>
  );
}
