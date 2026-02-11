import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChaData {
  nome: string;
  cpf: string;
  data_nascimento: string | null;
  categoria: string | null;
  validade: string | null;
  emissao: string | null;
  numero_inscricao: string | null;
  limite_navegacao: string | null;
  orgao_emissao: string | null;
  foto: string | null;
  hash: string | null;
}

export default function VerificarCha() {
  const [params] = useSearchParams();
  const cpf = params.get('cpf') || params.get('id') || '';
  const [data, setData] = useState<ChaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [consultaTime, setConsultaTime] = useState('');

  useEffect(() => {
    if (!cpf) {
      setError('CPF não fornecido.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data: result, error: fnError } = await supabase.functions.invoke('verify-cha', {
          body: { cpf: cpf.replace(/\D/g, '') },
        });

        if (fnError || result?.error) {
          setError('Usuário não encontrado.');
          return;
        }

        setData(result);
        const now = new Date();
        setConsultaTime(
          `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
        );
      } catch {
        setError('Erro ao consultar documento.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cpf]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-16 w-16 animate-spin text-[#609D46]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const fotoSrc = data.foto
    ? data.foto.startsWith('http') ? data.foto : `${window.location.origin}${data.foto}`
    : null;

  const fields = [
    { label: 'Nome (Name)', value: data.nome },
    { label: 'Data do Nascimento (Date of Birth)', value: data.data_nascimento },
    { label: 'CPF (Individual registration)', value: data.cpf },
    { label: 'Categoria (Category)', value: data.categoria },
    { label: 'Data de validade (Expiration date)', value: data.validade },
    { label: 'N⁰ de Inscrição (Registration number)', value: data.numero_inscricao },
    { label: 'Limites da Navegação (Navigation Limits)', value: data.limite_navegacao },
    { label: 'Órgão Emissor (Issuer)', value: data.orgao_emissao },
    { label: 'Data de Emissão (Issue Date)', value: data.emissao },
    { label: 'Hash', value: data.hash },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-[Roboto,sans-serif]" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Header */}
      <div className="flex justify-between items-center bg-[#96CA71] px-4 py-3">
        <div className="flex items-center gap-6">
          <ArrowLeft className="text-white w-6 h-6" />
          <h1 className="text-white text-xl font-bold">Detalhamento</h1>
        </div>
        <Info className="text-white w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center px-4 py-6 gap-4 bg-white mx-2 mt-3 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-center text-gray-900">CHA - Carteira de Habilitação de Amador</h2>
        <p className="text-sm text-[#609D46] -mt-2">Marinha do Brasil</p>

        {/* Photo */}
        {fotoSrc ? (
          <div className="w-32 h-40 rounded-lg overflow-hidden border border-gray-200 mt-2">
            <img src={fotoSrc} alt="Foto" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-32 h-40 rounded-lg bg-gray-100 border border-gray-200 mt-2 flex items-center justify-center">
            <span className="text-gray-400 text-xs">Sem foto</span>
          </div>
        )}

        {/* Fields */}
        <div className="w-full flex flex-col gap-4 mt-4">
          {fields.map((f, i) => (
            <div key={i} className="flex flex-col gap-1">
              <p className="text-xs text-[#609D46]">{f.label}</p>
              <strong className="text-base text-gray-900 uppercase border-b border-gray-300/60 pb-1 min-h-[1.4rem] overflow-hidden break-words">
                {f.value || '—'}
              </strong>
            </div>
          ))}
        </div>

        {/* Documento Válido */}
        <div className="w-full mt-6 bg-[#e8f5e1] rounded-xl p-6 flex flex-col items-center gap-2 border border-[#96CA71]/30">
          <CheckCircle2 className="text-[#609D46] w-10 h-10" />
          <p className="text-[#609D46] font-bold text-lg">DOCUMENTO VÁLIDO</p>
          <p className="text-sm text-gray-500">Consultado em: {consultaTime}</p>
        </div>
      </div>
    </div>
  );
}
