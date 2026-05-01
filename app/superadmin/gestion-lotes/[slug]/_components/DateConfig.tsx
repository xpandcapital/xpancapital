'use client';

import { ProjectConfig } from '../_types';
import { Settings } from 'lucide-react';

interface Props {
  config: ProjectConfig;
  projectName: string;
  onChange: (field: string, value: any) => void;
}

export function DateConfig({ config, projectName, onChange }: Props) {
  const toMonthInput = (val: string) => val ? val.substring(0, 7) : '';

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-4">
        <Settings className="w-4 h-4 text-rose-400 inline mr-1.5" />Configuracion de Fechas de {projectName}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Inicio de Pagos</label>
          <input
            type="month"
            value={toMonthInput(config.startMonth)}
            onChange={(e) => onChange('startMonth', e.target.value)}
            className="w-full p-2.5 text-sm text-white bg-black/60 border border-white/[0.06] rounded-lg outline-none color-invert"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Firma de Promesa</label>
          <input
            type="month"
            value={toMonthInput(config.signatureMonth)}
            onChange={(e) => onChange('signatureMonth', e.target.value)}
            className="w-full p-2.5 text-sm text-white bg-black/60 border border-rose-500/20 rounded-lg outline-none color-invert"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Escritura</label>
          <input
            type="month"
            value={toMonthInput(config.escrituraMonth)}
            onChange={(e) => onChange('escrituraMonth', e.target.value)}
            className="w-full p-2.5 text-sm text-white bg-black/60 border border-emerald-500/20 rounded-lg outline-none color-invert"
          />
        </div>
      </div>
      <p className="text-[9px] text-zinc-600 mt-3 text-center">Estas fechas aplican por defecto. Puedes modificar fechas especificas para cada lote en su expediente.</p>
    </div>
  );
}
