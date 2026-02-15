import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CnhDetalhamento from "@/components/cnh/CnhDetalhamento";
import { Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || '';

export default function VerificarCnh() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("ID não informado.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/verify-cnh?id=${encodeURIComponent(id)}`)
      .then(res => {
        if (!res.ok) throw new Error("CNH não encontrada");
        return res.json();
      })
      .then(result => {
        setData({
          nome: result.nome,
          nomeCivil: result.nome,
          docIdentidade: result.doc_identidade,
          cpf: result.cpf,
          dataNascimento: result.data_nascimento,
          pai: result.pai,
          mae: result.mae,
          categoria: result.categoria,
          numeroRegistro: result.numero_registro,
          hab: result.hab,
          obs: result.obs,
          localEmissao: result.local_emissao,
          uf: result.uf,
          dataEmissao: result.data_emissao,
          espelho: result.espelho,
          renach: result.renach,
          foto: result.foto_url,
        });
      })
      .catch(() => setError("CNH não encontrada ou link inválido."))
      .finally(() => setLoading(false));
  }, [id]);

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
      <CnhDetalhamento data={data} />
    </div>
  );
}
