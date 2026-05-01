'use client';

import { useState } from 'react';

interface ConfirmActionProps {
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

export function ConfirmAction({
  message,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
}: ConfirmActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        {message}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
      <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">{message}</span>
      <button
        onClick={() => { setIsOpen(false); onConfirm(); }}
        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all ${
          variant === 'danger' ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]'
        }`}
      >
        {confirmLabel}
      </button>
      <button
        onClick={() => setIsOpen(false)}
        className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 px-2.5 py-1 rounded-md hover:bg-white/[0.04] transition-all"
      >
        {cancelLabel}
      </button>
    </div>
  );
}
