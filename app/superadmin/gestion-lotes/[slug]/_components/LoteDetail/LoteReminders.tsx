'use client';

import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { Bell, PlusCircle, Trash2, CheckSquare, Square } from 'lucide-react';

interface Props {
  lot: Lote;
  onAdd: () => void;
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
}

export function LoteReminders({ lot, onAdd, onUpdate, onRemove }: Props) {
  return (
    <SubCard className="border-rose-500/10 bg-rose-500/[0.02]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 inline mr-1.5" />Recordatorios
        </h3>
        <button onClick={onAdd} className="text-zinc-500 hover:text-white transition-colors">
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {lot.reminders.map((r) => (
          <div key={r.id} className="flex items-center gap-2 bg-black/60 border border-white/[0.04] rounded-lg px-3 py-2">
            <button onClick={() => onUpdate(r.id, 'completed', !r.completed)} className="text-zinc-500 hover:text-emerald-400 transition-colors">
              {r.completed ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>
            <input
              type="text"
              value={r.text}
              onChange={(e) => onUpdate(r.id, 'text', e.target.value)}
              placeholder="Ej: Llamar para cobro..."
              className={`flex-1 text-xs outline-none bg-transparent ${r.completed ? 'line-through text-zinc-600' : 'text-zinc-200 font-medium'}`}
            />
            <button onClick={() => onRemove(r.id)} className="text-zinc-600 hover:text-rose-400 transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </SubCard>
  );
}
