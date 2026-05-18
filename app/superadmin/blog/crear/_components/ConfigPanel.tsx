'use client';

import { Coins, RotateCcw } from 'lucide-react';
import { useShop } from "@/context/ShopContext";

interface ConfigPanelProps {
  es_premium: boolean;
  precio_coins: number;
  sin_recompensa: boolean;
  estado: string;
  onPremiumChange: (checked: boolean) => void;
  onPrecioCoinsChange: (value: number) => void;
  onSinRecompensaChange: (checked: boolean) => void;
  onEstadoChange: (value: string) => void;
}

export default function ConfigPanel({
  es_premium,
  precio_coins,
  sin_recompensa,
  estado,
  onPremiumChange,
  onPrecioCoinsChange,
  onSinRecompensaChange,
  onEstadoChange,
}: ConfigPanelProps) {
  const { coinsEnabled } = useShop();
  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-sm font-bold mb-4">Configuración</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="es_premium"
            checked={es_premium}
            onChange={e => onPremiumChange(e.target.checked)}
            className="w-4 h-4 rounded border-white/30 bg-white/5"
          />
          <label htmlFor="es_premium" className="text-sm font-bold">Contenido Premium</label>
        </div>

        {es_premium && coinsEnabled && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Precio (BLIS Coins)</label>
            <input
              type="number"
              value={precio_coins}
              onChange={e => onPrecioCoinsChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 text-sm"
            />
          </div>
        )}

        {coinsEnabled && (<><div className="flex items-center gap-3 pt-2 border-t border-white/5">
          <input
            type="checkbox"
            id="sin_recompensa"
            checked={sin_recompensa}
            onChange={e => onSinRecompensaChange(e.target.checked)}
            className="w-4 h-4 rounded border-white/30 bg-white/5"
          />
          <label htmlFor="sin_recompensa" className="text-sm font-bold flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-gray-500" /> Sin recompensa de coins
          </label>
        </div>
        <p className="text-[9px] text-gray-500 mt-1 ml-7">No se otorgarán BLIS Coins por leer este artículo.</p>
        </>)}

        <div className="pt-2 border-t border-white/5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estado</label>
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              estado === 'publicado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              {estado === 'publicado' ? 'Publicado' : 'Borrador'}
            </span>
            {estado === 'publicado' && (
              <button
                onClick={() => onEstadoChange('borrador')}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
