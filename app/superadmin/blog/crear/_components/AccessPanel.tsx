'use client';

import { Lock, Globe, EyeOff } from 'lucide-react';

interface AccessPanelProps {
  contrasena: string;
  visibilidad: 'publico' | 'oculto';
  onContrasenaChange: (value: string) => void;
  onVisibilidadChange: (value: 'publico' | 'oculto') => void;
}

export default function AccessPanel({ contrasena, visibilidad, onContrasenaChange, onVisibilidadChange }: AccessPanelProps) {
  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <Lock className="w-4 h-4 text-gray-400" />
        Acceso y visibilidad
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contraseña</label>
          <input
            type="text"
            value={contrasena}
            onChange={e => onContrasenaChange(e.target.value)}
            placeholder="Dejar vacío si es público"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm"
          />
          <p className="text-[9px] text-gray-500 mt-1">El lector deberá ingresar esta contraseña para ver el artículo.</p>
        </div>
        <div className="pt-2 border-t border-white/5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Visibilidad en listados</label>
          <div className="flex gap-2">
            <button
              onClick={() => onVisibilidadChange('publico')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                visibilidad === 'publico'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/20'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Público
            </button>
            <button
              onClick={() => onVisibilidadChange('oculto')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                visibilidad === 'oculto'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/20'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" /> Oculto
            </button>
          </div>
          <p className="text-[9px] text-gray-500 mt-1">
            {visibilidad === 'oculto'
              ? 'El artículo no aparecerá en listados ni búsquedas públicas. Solo accesible por URL directa.'
              : 'El artículo será visible en todos los listados públicos.'}
          </p>
        </div>
      </div>
    </div>
  );
}
