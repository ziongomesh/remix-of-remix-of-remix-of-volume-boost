import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RgDetalhamento from "@/components/rg/RgDetalhamento";
import { Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || '';

function formatDate(d: string | null | undefined): string {
  if (!d) return '';
  const s = String(d).substring(0, 10);
  if (s.includes('-')) {
    const [y, m, day] = s.split('-');
    return `${day}/${m}/${y}`;
  }
  return s;
}

export default function VerificarCin() {
  const [searchParams] = useSearchParams();
  const cpf = searchParams.get("cpf");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cpf) {
      setError("CPF não informado.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/verify-cin?cpf=${encodeURIComponent(cpf)}`)
      .then(res => {
        if (!res.ok) throw new Error("RG não encontrado");
        return res.json();
      })
      .then(result => {
        setData({
          nome: result.nome,
          nomeSocial: result.nome_social,
          cpf: result.cpf,
          genero: result.genero,
          dataNascimento: formatDate(result.data_nascimento),
          nacionalidade: result.nacionalidade,
          naturalidade: result.naturalidade,
          validade: formatDate(result.validade),
          mae: result.mae,
          pai: result.pai,
          orgaoExpedidor: result.orgao_expedidor,
          localEmissao: result.local_emissao,
          dataEmissao: formatDate(result.data_emissao),
          foto: result.foto_url,
        });
      })
      .catch(() => setError("RG/CIN não encontrado ou link inválido."))
      .finally(() => setLoading(false));
  }, [cpf]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#609D46' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Roboto", sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>⚠️ {error}</h2>
          <p style={{ color: '#999' }}>Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0', padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <RgDetalhamento data={data} />
    </div>
  );
}
