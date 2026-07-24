import {
  Settings,
  MousePointer2,
  Move,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Crosshair,
  Maximize,
  Palette,
} from "lucide-react";
import type { CertificateElement } from "../_types";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface Props {
  selectedId: string | null;
  activeElement: CertificateElement | undefined;
  onUpdate: (id: string, data: Partial<CertificateElement>) => void;
  onDeselect: () => void;
  startContinuousMove: (dx: number, dy: number) => void;
  stopContinuousMove: () => void;
  startContinuousScale: (delta: number) => void;
}

export function ElementSettings({
  selectedId,
  activeElement,
  onUpdate,
  onDeselect,
  startContinuousMove,
  stopContinuousMove,
  startContinuousScale,
}: Props) {
  return (
    <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-5 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blis-red/20 rounded-2xl">
          <Settings className="w-5 h-5 text-blis-red" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            Configuración
          </h3>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
            Personaliza el elemento actual
          </p>
        </div>
      </div>

      {!selectedId ? (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-4 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
          <MousePointer2 className="w-10 h-10 text-zinc-800" />
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
            Selecciona un elemento para editar
          </p>
        </div>
      ) : (
        activeElement && (
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Move className="w-3 h-3" /> Precisión Manual
              </label>
              <div className="flex flex-col items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onPointerDown={e => {
                      e.preventDefault();
                      startContinuousMove(-1, 0);
                    }}
                    onPointerUp={stopContinuousMove}
                    onPointerLeave={stopContinuousMove}
                    onPointerCancel={stopContinuousMove}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-blis-red hover:text-white rounded-xl transition-all shadow-md select-none touch-none"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onPointerDown={e => {
                      e.preventDefault();
                      startContinuousMove(0, -1);
                    }}
                    onPointerUp={stopContinuousMove}
                    onPointerLeave={stopContinuousMove}
                    onPointerCancel={stopContinuousMove}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-blis-red hover:text-white rounded-xl transition-all shadow-md select-none touch-none"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onUpdate(activeElement.id, { x: 50, y: 50 })}
                    className="w-10 h-10 flex items-center justify-center bg-blis-red/20 text-blis-red hover:bg-blis-red hover:text-white rounded-xl transition-all shadow-md"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                  <button
                    onPointerDown={e => {
                      e.preventDefault();
                      startContinuousMove(0, 1);
                    }}
                    onPointerUp={stopContinuousMove}
                    onPointerLeave={stopContinuousMove}
                    onPointerCancel={stopContinuousMove}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-blis-red hover:text-white rounded-xl transition-all shadow-md select-none touch-none"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                  <button
                    onPointerDown={e => {
                      e.preventDefault();
                      startContinuousMove(1, 0);
                    }}
                    onPointerUp={stopContinuousMove}
                    onPointerLeave={stopContinuousMove}
                    onPointerCancel={stopContinuousMove}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-blis-red hover:text-white rounded-xl transition-all shadow-md select-none touch-none"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Maximize className="w-3 h-3" /> Tamaño del Elemento
                </label>
                <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <button
                      onPointerDown={e => {
                        e.preventDefault();
                        startContinuousScale(-1);
                      }}
                      onPointerUp={stopContinuousMove}
                      onPointerLeave={stopContinuousMove}
                      onPointerCancel={stopContinuousMove}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-blis-red rounded-lg transition-colors text-white text-lg font-black select-none touch-none"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      step="1"
                      value={activeElement.fontSize}
                      onChange={e => onUpdate(activeElement.id, { fontSize: parseInt(e.target.value) })}
                      className="flex-1 accent-blis-red h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                      onPointerDown={e => {
                        e.preventDefault();
                        startContinuousScale(1);
                      }}
                      onPointerUp={stopContinuousMove}
                      onPointerLeave={stopContinuousMove}
                      onPointerCancel={stopContinuousMove}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-blis-red rounded-lg transition-colors text-white text-lg font-black select-none touch-none"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center justify-between pl-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">
                      Valor Exacto
                    </span>
                    <input
                      type="number"
                      value={activeElement.fontSize}
                      onChange={e =>
                        onUpdate(activeElement.id, { fontSize: parseInt(e.target.value) || 10 })
                      }
                      className="w-20 bg-black/50 border border-white/10 rounded-lg py-1.5 text-center text-xs font-mono text-white outline-none focus:border-blis-red"
                    />
                  </div>
                </div>
              </div>

              {activeElement.type !== "qr" && (
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Color y Peso
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="color"
                      value={activeElement.color}
                      onChange={e => onUpdate(activeElement.id, { color: e.target.value })}
                      className="w-full" buttonClassName="h-12 bg-black/40 border border-white/5 rounded-xl cursor-pointer p-1"
                    />
                    <SearchableSelect
                      value={activeElement.fontWeight}
                      onChange={(value) => onUpdate(activeElement.id, { fontWeight: value })}
                      options={[
                        { value: "normal", label: "Normal" },
                        { value: "600", label: "Semi Bold" },
                        { value: "700", label: "Bold" },
                        { value: "900", label: "Black Version" },
                      ]}
                      className="w-full" buttonClassName="bg-black/40 border border-white/5 rounded-xl px-2 text-[10px] font-black uppercase text-white outline-none focus:border-blis-red"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onDeselect}
              className="w-full" buttonClassName="py-4 border border-zinc-800 hover:border-zinc-700 rounded-xl text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all"
            >
              Deseleccionar Elemento
            </button>
          </div>
        )
      )}
    </div>
  );
}
