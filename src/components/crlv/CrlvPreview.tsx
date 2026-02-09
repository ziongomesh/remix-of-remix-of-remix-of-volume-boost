import { UseFormReturn } from 'react-hook-form';

interface CrlvPreviewProps {
  form: UseFormReturn<any>;
  customQrPreview?: string | null;
}

export function CrlvPreview({ form, customQrPreview }: CrlvPreviewProps) {
  const v = form.watch();

  return (
    <div className="bg-white text-black rounded-lg border border-border overflow-hidden" style={{ fontSize: '9px', fontFamily: 'Courier, monospace' }}>
      {/* Header */}
      <div className="bg-[#1a3a5c] text-white text-center py-2 px-3">
        <div className="text-[11px] font-bold tracking-wider">REPÚBLICA FEDERATIVA DO BRASIL</div>
        <div className="text-[8px] mt-0.5">CERTIFICADO DE REGISTRO E LICENCIAMENTO DE VEÍCULO</div>
        <div className="text-[8px]">CRLV DIGITAL - EXERCÍCIO {v.exercicio || '2026'}</div>
      </div>

      <div className="p-3 space-y-2">
        {/* Renavam / Placa / Exercício */}
        <div className="grid grid-cols-3 gap-2">
          <Field label="RENAVAM" value={v.renavam} />
          <Field label="PLACA" value={v.placa} highlight />
          <Field label="EXERCÍCIO" value={v.exercicio} />
        </div>

        {/* CRV info */}
        <div className="grid grid-cols-3 gap-2">
          <Field label="Nº CRV" value={v.numeroCrv} />
          <Field label="SEG. CRV" value={v.segurancaCrv} />
          <Field label="CÓD SEG CLA" value={v.codSegCla} />
        </div>

        <Divider label="CARACTERÍSTICAS DO VEÍCULO" />

        <div className="grid grid-cols-2 gap-2">
          <Field label="MARCA/MODELO" value={v.marcaModelo} span />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Field label="ANO FAB" value={v.anoFab} />
          <Field label="ANO MOD" value={v.anoMod} />
          <Field label="COR" value={v.cor} />
          <Field label="COMBUSTÍVEL" value={v.combustivel} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="ESPÉCIE/TIPO" value={v.especieTipo} />
          <Field label="CATEGORIA" value={v.categoria} />
          <Field label="CAT OBS" value={v.catObs || '***'} />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Field label="CARROCERIA" value={v.carroceria} />
        </div>

        <Divider label="ESPECIFICAÇÕES TÉCNICAS" />

        <div className="grid grid-cols-2 gap-2">
          <Field label="CHASSI" value={v.chassi} />
          <Field label="PLACA ANT." value={v.placaAnt || '*******/**'} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Field label="POTÊNCIA/CIL" value={v.potenciaCil} />
          <Field label="CAPACIDADE" value={v.capacidade} />
          <Field label="LOTAÇÃO" value={v.lotacao} />
          <Field label="PESO BRUTO" value={v.pesoBruto} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="MOTOR" value={v.motor} />
          <Field label="CMT" value={v.cmt} />
          <Field label="EIXOS" value={v.eixos} />
        </div>

        <Divider label="PROPRIETÁRIO" />

        <div className="grid grid-cols-1 gap-2">
          <Field label="NOME" value={v.nomeProprietario} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="CPF/CNPJ" value={v.cpfCnpj} />
          <Field label="DATA" value={v.data} />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Field label="LOCAL" value={v.local} />
        </div>

        {/* QR Code area */}
        <div className="flex items-center justify-center py-2">
          {customQrPreview ? (
            <img src={customQrPreview} alt="QR" className="h-20 w-20 object-contain border border-gray-300" />
          ) : (
            <div className="h-20 w-20 border border-dashed border-gray-400 flex items-center justify-center text-[7px] text-gray-400 text-center">
              QR CODE<br />AUTO
            </div>
          )}
        </div>

        {/* Observações */}
        {v.observacoes && (
          <div className="border-t border-gray-300 pt-1">
            <div className="text-[7px] text-gray-500 uppercase">Observações</div>
            <div className="text-[9px] font-bold whitespace-pre-wrap mt-0.5">{v.observacoes}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, highlight, span }: { label: string; value?: string; highlight?: boolean; span?: boolean }) {
  return (
    <div className={span ? 'col-span-full' : ''}>
      <div className="text-[7px] text-gray-500 uppercase leading-tight">{label}</div>
      <div className={`text-[9px] font-bold leading-tight min-h-[12px] ${highlight ? 'text-blue-800' : ''} ${!value ? 'text-gray-300' : ''}`}>
        {value || '---'}
      </div>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="border-t border-gray-300 pt-1 mt-1">
      <div className="text-[7px] font-bold text-gray-600 uppercase tracking-wide">{label}</div>
    </div>
  );
}
