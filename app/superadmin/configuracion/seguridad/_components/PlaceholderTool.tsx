"use client";

import { Wrench } from 'lucide-react';

interface Props {
  toolId: string;
}

const TOOL_NAMES: Record<string, string> = {
  rate_limiting: 'Rate Limiting',
  firewall: 'Firewall',
  access_logs: 'Logs de Acceso',
  alerts: 'Alertas',
};

export function PlaceholderTool({ toolId }: Props) {
  const name = TOOL_NAMES[toolId] || toolId;

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">{name}</h2>
            <p className="text-xs text-gray-500">En desarrollo</p>
          </div>
        </div>
      </div>
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
          <Wrench className="w-7 h-7 text-gray-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-400 mb-1">Próximamente</h3>
        <p className="text-xs text-gray-600 max-w-xs">
          Esta herramienta de seguridad estará disponible en una próxima actualización.
        </p>
      </div>
    </div>
  );
}
