import RgDetalhamento from "@/components/rg/RgDetalhamento";

const exemploData = {
  nome: "MARIA VIRGÍNIA DE ALBUQUERQUE CRUZ",
  nomeSocial: "",
  cpf: "233.333.213-31",
  genero: "MASCULINO",
  dataNascimento: "02/02/2002",
  nacionalidade: "BRA",
  naturalidade: "SAO PAULO",
  validade: "16/10/2035",
  mae: "SILVANE MARIANO DE OLIVEIRA",
  pai: "MANOEL JERÔNIMO DA SILVA",
  orgaoExpedidor: "SSP",
  localEmissao: "AL",
  dataEmissao: "16/10/2025",
  foto: null,
};

export default function PreviewDetalhamentoCin() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0', padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <RgDetalhamento data={exemploData} />
    </div>
  );
}
