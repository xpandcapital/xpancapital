'use client';

import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { formatCurrency } from '../../_utils/formatters';
import { PlusCircle, Trash2, Paperclip } from 'lucide-react';

interface Props {
  lot: Lote;
  onAdd: () => void;
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
}

export function LoteInitialPayments({ lot, onAdd, onUpdate, onRemove }: Props) {
  return (
    <SubCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Entradas y Reservas</h3>
        <button onClick={onAdd} className="text-zinc-500 hover:text-white transition-colors">
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {lot.initialPayments.map((ip) => (
          <div key={ip.id} className="bg-black/60 border border-white/[0.04] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={ip.description}
                onChange={(e) => onUpdate(ip.id, 'description', e.target.value)}
                className="flex-1 p-1 text-xs text-white bg-transparent outline-none placeholder:text-zinc-600 font-bold"
                placeholder="Concepto"
              />
              {lot.initialPayments.length > 1 && (
                <button onClick={() => onRemove(ip.id)} className="text-zinc-600 hover:text-rose-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[8px] font-bold text-zinc-600 uppercase block">Esperado</label>
                <input
                  type="number"
                  value={ip.expected || ''}
                  onChange={(e) => onUpdate(ip.id, 'expected', Number(e.target.value))}
                  className="w-full p-1.5 text-xs text-white bg-transparent border border-white/[0.04] rounded-md outline-none focus:border-white/[0.12]"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-zinc-600 uppercase block">Pagado</label>
                <input
                  type="number"
                  value={ip.actual || ''}
                  onChange={(e) => onUpdate(ip.id, 'actual', Number(e.target.value))}
                  className={`w-full p-1.5 text-xs text-white bg-transparent rounded-md outline-none focus:border-white/[0.12] border ${
                    ip.actual >= ip.expected && ip.expected > 0 ? 'border-emerald-500/30' : 'border-white/[0.04]'
                  }`}
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-zinc-600 uppercase block">Fecha</label>
                <input
                  type="date"
                  value={ip.paymentDate || ''}
                  onChange={(e) => onUpdate(ip.id, 'paymentDate', e.target.value)}
                  className="w-full p-1.5 text-xs text-white bg-transparent border border-white/[0.04] rounded-md outline-none color-invert"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-1 text-[8px] text-zinc-600">
                <Paperclip className="w-2.5 h-2.5" />
                {ip.receiptAttached || 'Sin comprobante'}
              </div>
              <span className="text-[10px] font-black text-zinc-500">
                {formatCurrency(ip.actual)} / {formatCurrency(ip.expected)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SubCard>
  );
}
