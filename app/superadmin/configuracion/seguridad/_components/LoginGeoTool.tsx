"use client";

import { useState, useEffect, useCallback } from 'react';
import { Globe, MapPin, AlertTriangle, RefreshCw, Eye, ChevronRight, User, Shield } from 'lucide-react';
import Flag from 'react-world-flags';
import Link from 'next/link';

const PAISES: Record<string, string> = {
  CN: "China", RU: "Rusia", US: "EE.UU.", GB: "Reino Unido", DE: "Alemania",
  FR: "Francia", BR: "Brasil", IN: "India", JP: "Japón", KR: "Corea Sur",
  MX: "México", AR: "Argentina", CO: "Colombia", PE: "Perú", CL: "Chile",
  ES: "España", IT: "Italia", NL: "Países Bajos", AU: "Australia", CA: "Canadá",
  NG: "Nigeria", PK: "Pakistán", VN: "Vietnam", ID: "Indonesia", TH: "Tailandia",
  PH: "Filipinas", AE: "Emiratos", SA: "Arabia", EG: "Egipto", ZA: "Sudáfrica",
  TR: "Turquía", UA: "Ucrania", PL: "Polonia", SE: "Suecia", NO: "Noruega",
  FI: "Finlandia", IL: "Israel", SG: "Singapur", HK: "Hong Kong", TW: "Taiwán",
  NZ: "Nueva Zelanda", IE: "Irlanda", AT: "Austria", CH: "Suiza", BE: "Bélgica",
  PT: "Portugal", VE: "Venezuela", EC: "Ecuador", UY: "Uruguay", PY: "Paraguay",
  BO: "Bolivia", CR: "Costa Rica", PA: "Panamá", GT: "Guatemala", HN: "Honduras",
  SV: "El Salvador", NI: "Nicaragua", DO: "Rep. Dominicana", CU: "Cuba",
  KE: "Kenia", TZ: "Tanzania", UG: "Uganda", ET: "Etiopía", GH: "Ghana",
  MA: "Marruecos", DZ: "Argelia", TN: "Túnez", IR: "Irán", KP: "Corea Norte",
};

interface LoginEntry {
  id: string;
  email: string;
  pais: string;
  ip: string;
  user_agent?: string;
  es_anomalo: boolean;
  created_at: string;
}

export function LoginGeoTool() {
  const [logins, setLogins] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seguridad/login-history');
      const json = await res.json();
      if (json.success) setLogins(json.data || []);
    } catch { /* */ }
    finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchLogins(); const i = setInterval(fetchLogins, 60000); return () => clearInterval(i) }, [fetchLogins]);

  const anomalos = logins.filter(l => l.es_anomalo);
  const normales = logins.filter(l => !l.es_anomalo);

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-white">Login Geo Anomaly</h2>
            <p className="text-[11px] text-gray-500">Detección de inicios de sesión desde ubicaciones inusuales</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {anomalos.length > 0 && (
              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-full border border-red-500/20">
                {anomalos.length} anomalías
              </span>
            )}
            <button onClick={fetchLogins} className="p-2 bg-zinc-900 rounded-lg text-gray-400 hover:text-white">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Explicación */}
        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-cyan-400">¿Cómo funciona?</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Cada vez que un usuario inicia sesión, registramos su país de origen. Si un usuario que normalmente accede desde Ecuador de repente inicia sesión desde México, Brasil o cualquier país nuevo, el sistema lo marca como <strong className="text-red-400">anómalo</strong> y genera una alerta. Esto permite detectar accesos no autorizados aunque las credenciales sean correctas.
              </p>
              <p className="text-[10px] text-gray-600 mt-2">
                Ejemplo: admin@bliscorp.com siempre entra desde 🇪🇨 Ecuador. Si un atacante roba sus credenciales e inicia sesión desde 🇧🇷 Brasil, el sistema lo detecta inmediatamente.
              </p>
            </div>
          </div>
        </div>

        {/* Anomalías */}
        {anomalos.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Inicios de sesión anómalos ({anomalos.length})
            </h4>
            <div className="space-y-2">
              {anomalos.map(l => (
                <div key={l.id} className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-sm font-bold text-white">{l.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-3 rounded-sm overflow-hidden shrink-0 flex items-center justify-center">
                          <Flag code={l.pais} height="10" />
                        </div>
                        <span className="text-xs text-red-400 font-bold">{PAISES[l.pais] || l.pais} ({l.pais})</span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(l.created_at).toLocaleString('es-PE')}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <span className="text-[10px] text-red-400/70">
                          ⚠️ Esta ubicación no está en el historial normal de este usuario. Posible acceso no autorizado.
                        </span>
                      </div>
                    </div>
                    <Link href="/superadmin/usuarios" className="text-[10px] text-blis-red hover:text-white flex items-center gap-1 shrink-0">
                      <Eye className="w-3 h-3" /> Revisar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historial normal */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Últimos inicios de sesión ({logins.length})
          </h4>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {logins.length === 0 && !loading && (
              <p className="text-xs text-gray-600 text-center py-6">
                Aún no hay registros de inicio de sesión. El sistema empezará a registrar cuando los usuarios inicien sesión.
              </p>
            )}
            {normales.slice(0, 20).map(l => (
              <div key={l.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.02]">
                <User className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-xs text-gray-300 flex-1 truncate">{l.email}</span>
                <div className="w-5 h-3 rounded-sm overflow-hidden shrink-0 flex items-center justify-center">
                  <Flag code={l.pais} height="10" />
                </div>
                <span className="text-[10px] text-gray-500">{PAISES[l.pais] || l.pais}</span>
                <span className="text-[10px] text-gray-600">{new Date(l.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
