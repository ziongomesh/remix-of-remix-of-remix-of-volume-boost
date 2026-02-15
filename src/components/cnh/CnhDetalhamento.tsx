interface CnhDetalhamentoProps {
  data: {
    nome?: string;
    nomeCivil?: string;
    docIdentidade?: string;
    cpf?: string;
    dataNascimento?: string;
    pai?: string;
    mae?: string;
    categoria?: string;
    numeroRegistro?: string;
    hab?: string;
    obs?: string;
    localEmissao?: string;
    uf?: string;
    dataEmissao?: string;
    espelho?: string;
    renach?: string;
    foto?: string | File;
  };
}

export default function CnhDetalhamento({ data }: CnhDetalhamentoProps) {
  const fotoUrl = data.foto instanceof File ? URL.createObjectURL(data.foto) : (typeof data.foto === 'string' && data.foto ? data.foto : null);

  const Field = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex flex-col gap-1 w-full">
      <p style={{ fontSize: '0.8rem', color: '#609D46' }}>{label}</p>
      <strong style={{
        minHeight: '1.4rem',
        fontSize: '1.1rem',
        overflow: 'hidden',
        textTransform: 'uppercase',
        borderBottom: '#A8A8A860 solid 1px',
        fontFamily: '"Roboto", sans-serif',
        fontWeight: 700,
        display: 'block',
        paddingBottom: '4px',
      }}>
        {value || ''}
      </strong>
    </div>
  );

  return (
    <div style={{
      fontFamily: '"Roboto", sans-serif',
      background: '#f5f5f5',
      borderRadius: '12px',
      overflow: 'hidden',
      maxWidth: '420px',
      width: '100%',
      margin: '0 auto',
      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#96CA71',
        padding: '0.8rem 1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
          <span style={{ color: '#fff', fontSize: '1.2rem' }}>←</span>
          <h1 style={{ color: '#FFFEFF', fontSize: '1.3rem', fontWeight: 700 }}>Detalhamento</h1>
        </div>
        <span style={{ color: '#fff', fontSize: '1.1rem' }}>ⓘ</span>
      </div>

      {/* Content */}
      <div style={{ padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#333', fontWeight: 400, letterSpacing: 2 }}>CNH</h2>
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1rem' }}>SENATRAN</p>

        {/* Foto */}
        <div style={{
          width: 100, height: 120,
          border: '1px solid #ccc',
          borderRadius: 4,
          marginBottom: '1rem',
          overflow: 'hidden',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {fotoUrl ? (
            <img src={fotoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#ccc', fontSize: '2rem' }}>👤</span>
          )}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
          <Field label="Nome" value={data.nome} />
          <Field label="Nome Civil" value={data.nomeCivil || data.nome} />
          <Field label="Doc. Identidade/Órg. Emissor/UF" value={data.docIdentidade} />
          <Field label="CPF" value={data.cpf} />
          <Field label="Data de Nascimento" value={data.dataNascimento} />
          <Field label="Filiação Pai" value={data.pai} />
          <Field label="Filiação Mãe" value={data.mae} />
          <Field label="Permissão" value="" />
          <Field label="ACC" value="" />
          <Field label="Cat. Hab." value={data.categoria} />
          <Field label="N° Registro" value={data.numeroRegistro} />
          <Field label="1ª Habilitação" value={data.hab} />
          <Field label="Observações" value={data.obs} />
          <Field label="Local" value={data.localEmissao} />
          <Field label="UF" value={data.uf} />
          <Field label="Data de Emissão" value={data.dataEmissao} />
          <Field label="Número Validação CNH" value={data.espelho} />
          <Field label="Número Formulário RENACH" value={data.renach} />
        </div>
      </div>
    </div>
  );
}
