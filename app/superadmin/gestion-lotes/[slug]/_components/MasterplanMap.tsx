'use client';

import { ProjectConfig, Lote, LotPin } from '../_types';
import { Trash2 } from 'lucide-react';

interface Props {
  config: ProjectConfig;
  lots: Lote[];
  onMapClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRemovePin: (pinId: string) => void;
  onSelectLot: (lotId: string) => void;
}

function getPinColor(loteNumber: string, lots: Lote[]): string {
  const lot = lots.find(l => l.loteNumber === loteNumber);
  if (!lot) return '#3f3f46';
  if (lot.status === 'Desistido') return '#ef4444';
  if (lot.status === 'Activo') return '#22c55e';
  return '#3f3f46';
}

export function MasterplanMap({ config, lots, onMapClick, onRemovePin, onSelectLot }: Props) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden relative flex-1 min-h-[400px]">
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button
          onClick={() => {
            const iframe = `<iframe src="${window.location.origin}/superadmin/gestion-lotes/embed/${''}" width="100%" height="600px" style="border:none;"></iframe>`;
            navigator.clipboard.writeText(iframe);
          }}
          className="bg-black/80 backdrop-blur border border-white/[0.06] text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
        >
          Obtener Codigo Web
        </button>
      </div>

      {config.masterplanImage ? (
        <div className="relative w-full h-full" onClick={onMapClick}>
          <img src={config.masterplanImage} alt="Masterplan" className="w-full h-full object-contain" />
          {config.lotPins.map((pin: LotPin) => {
            const lote = lots.find(l => l.loteNumber === pin.loteNumber);
            return (
              <div
                key={pin.id}
                className="absolute group cursor-pointer"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                onClick={(e) => { e.stopPropagation(); }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform"
                  style={{ backgroundColor: getPinColor(pin.loteNumber, lots) }}
                />
                <div className="absolute top-3 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center gap-1 bg-black/90 backdrop-blur border border-white/[0.06] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-10">
                  <span className="text-[10px] font-black text-white uppercase">{pin.loteNumber}</span>
                  {lote && (
                    <button onClick={() => onSelectLot(lote.id)} className="text-[9px] font-bold text-rose-400 hover:text-rose-300 uppercase">
                      Auditar
                    </button>
                  )}
                  <button onClick={() => onRemovePin(pin.id)} className="text-zinc-500 hover:text-rose-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full p-8 text-center">
          <div>
            <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm mb-2">Sin mapa cargado</p>
            <p className="text-zinc-600 text-xs">Sube una imagen del masterplan en Configuracion</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function MasterplanPinsList({ config, lots, onSelectLot }: { config: ProjectConfig; lots: Lote[]; onSelectLot: (lotId: string) => void }) {
  const unmapped = lots.filter(l => !config.lotPins.some(p => p.loteNumber === l.loteNumber));

  return (
    <div className="w-full lg:w-64 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 flex flex-col max-h-[600px]">
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-3">Pines en Mapa ({config.lotPins.length})</h3>
      <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
        {config.lotPins.map((pin: LotPin) => {
          const lote = lots.find(l => l.loteNumber === pin.loteNumber);
          return (
            <button
              key={pin.id}
              onClick={() => lote && onSelectLot(lote.id)}
              className="w-full flex items-center justify-between bg-black/60 border border-white/[0.04] rounded-lg px-3 py-2 text-left hover:bg-white/[0.02] transition-all"
            >
              <span className="text-[10px] font-black text-white uppercase">{pin.loteNumber}</span>
              <span className="text-[8px] font-bold text-zinc-500">{lote?.clientName || 'Sin cliente'}</span>
            </button>
          );
        })}
        {config.lotPins.length === 0 && (
          <p className="text-[9px] text-zinc-600 text-center py-4">Haz clic en el mapa para asignar lotes</p>
        )}
      </div>

      {unmapped.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Sin mapear ({unmapped.length})</p>
          <div className="flex flex-wrap gap-1">
            {unmapped.map(l => (
              <button
                key={l.id}
                onClick={() => onSelectLot(l.id)}
                className="text-[8px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-md px-2 py-0.5 uppercase"
              >
                {l.loteNumber}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
