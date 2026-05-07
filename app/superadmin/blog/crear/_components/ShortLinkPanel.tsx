'use client';

import { useState } from 'react';
import { Link2, Copy, Check, Edit2, Trash2, Loader2, X, MousePointerClick, ExternalLink } from 'lucide-react';

interface ShortLinkPanelProps {
  shortCode: string;
  shortCodeEditing: boolean;
  shortCodeSaving: boolean;
  linkCopied: boolean;
  onShortCodeChange: (code: string) => void;
  onSaveShortCode: () => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

export default function ShortLinkPanel({
  shortCode, shortCodeEditing, shortCodeSaving, linkCopied,
  onShortCodeChange, onSaveShortCode, onStartEditing,
  onCancelEditing, onDelete, onCopy,
}: ShortLinkPanelProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-emerald-400" />
        Enlace corto
      </h3>

      {shortCode && !shortCodeEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onCopy}
              className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-mono hover:bg-emerald-500/20 transition-all group"
            >
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 opacity-50" />
                blis-corp.com/s/{shortCode}
              </span>
              {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
            <a
              href={`/s/${shortCode}`}
              target="_blank"
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Abrir enlace"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onStartEditing}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Editar código"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(); setConfirmDelete(false); }}
                  className="px-2.5 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                title="Eliminar enlace"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-600 flex items-center gap-1.5">
            <MousePointerClick className="w-3 h-3" />
            Comparte este enlace en redes sociales y mide los clicks desde el Acortador en Utilidades.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs font-mono shrink-0">blis-corp.com/s/</span>
            <input
              type="text"
              value={shortCode}
              onChange={e => onShortCodeChange(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              placeholder="código-personalizado"
              maxLength={20}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 text-sm font-mono transition-all"
              onKeyDown={e => e.key === 'Enter' && onSaveShortCode()}
              autoFocus
            />
            <button
              onClick={onSaveShortCode}
              disabled={shortCodeSaving || !shortCode.trim()}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {shortCodeSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Guardar'}
            </button>
            <button
              onClick={onCancelEditing}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-gray-600">
            Solo letras minúsculas y números, 3-20 caracteres.
          </p>
        </div>
      )}
    </div>
  );
}
