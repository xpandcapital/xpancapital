'use client';

import { Lote, Owner } from '../../_types';
import { COUNTRY_CODES } from '../../_utils/constants';
import { SubCard } from '../shared/GlassCard';
import { User, PlusCircle, Trash2 } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface Props {
  lot: Lote;
  onAddOwner: () => void;
  onUpdateOwner: (ownerId: string, field: string, value: string) => void;
  onRemoveOwner: (ownerId: string) => void;
}

export function LoteOwners({ lot, onAddOwner, onUpdateOwner, onRemoveOwner }: Props) {
  return (
    <SubCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
          <User className="w-3.5 h-3.5 inline mr-1.5" />
          Propietarios
        </h3>
        <button onClick={onAddOwner} className="text-zinc-500 hover:text-white transition-colors">
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {lot.owners.map((owner) => (
          <OwnerCard
            key={owner.id}
            owner={owner}
            canRemove={lot.owners.length > 1}
            onUpdate={(f, v) => onUpdateOwner(owner.id, f, v)}
            onRemove={() => onRemoveOwner(owner.id)}
          />
        ))}
      </div>
    </SubCard>
  );
}

function OwnerCard({ owner, canRemove, onUpdate, onRemove }: {
  owner: Owner;
  canRemove: boolean;
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative bg-black/60 border border-white/[0.04] rounded-lg p-3">
      {canRemove && (
        <button onClick={onRemove} className="absolute top-2 right-2 text-zinc-600 hover:text-rose-400 transition-colors">
          <Trash2 className="w-3 h-3" />
        </button>
      )}
      <div className="space-y-2 pr-5">
        <input
          type="text"
          value={owner.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          className="w-full p-1.5 text-xs text-white bg-transparent border border-white/[0.06] rounded-md outline-none focus:border-white/[0.12] placeholder:text-zinc-600"
          placeholder="Nombre completo"
        />
        <input
          type="text"
          value={owner.documentId}
          onChange={(e) => onUpdate('documentId', e.target.value)}
          className="w-full p-1.5 text-xs text-white bg-transparent border border-white/[0.06] rounded-md outline-none uppercase placeholder:text-zinc-600"
          placeholder="Numero de Identidad"
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="flex gap-1">
            <SearchableSelect
              value={owner.phoneCode}
              onChange={v => onUpdate('phoneCode', v)}
              options={COUNTRY_CODES.map(c => ({ value: c.code, label: `${c.flag} ${c.code}` }))}
              className="w-20 p-1.5 text-xs text-white bg-black border border-white/[0.06] rounded-md outline-none"
            />
            <input
              type="text"
              value={owner.phone}
              onChange={(e) => onUpdate('phone', e.target.value)}
              className="flex-1 p-1.5 text-xs text-white bg-transparent border border-white/[0.06] rounded-md outline-none focus:border-white/[0.12] placeholder:text-zinc-600"
              placeholder="Telefono"
            />
          </div>
          <input
            type="email"
            value={owner.email}
            onChange={(e) => onUpdate('email', e.target.value)}
            className="p-1.5 text-xs text-white bg-transparent border border-white/[0.06] rounded-md outline-none focus:border-white/[0.12] placeholder:text-zinc-600"
            placeholder="Correo"
          />
        </div>
      </div>
    </div>
  );
}
