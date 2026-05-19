"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollText, Trash2, RefreshCw, Globe, Route, Server, Zap, Eye, Filter, Bot, Info
} from 'lucide-react';
import Flag from 'react-world-flags';
import type { AccessLogsStats, AccessLogEntry } from '../_types';

const PAISES: Record<string, string> = {
  AF: "Afganistán", AL: "Albania", DE: "Alemania", AD: "Andorra", AO: "Angola",
  AG: "Antigua y Barbuda", SA: "Arabia Saudita", DZ: "Argelia", AR: "Argentina",
  AM: "Armenia", AU: "Australia", AT: "Austria", AZ: "Azerbaiyán",
  BS: "Bahamas", BD: "Bangladesh", BB: "Barbados", BH: "Baréin", BE: "Bélgica",
  BZ: "Belice", BJ: "Benín", BY: "Bielorrusia", BO: "Bolivia", BA: "Bosnia y Herzegovina",
  BW: "Botsuana", BR: "Brasil", BN: "Brunéi", BG: "Bulgaria", BF: "Burkina Faso",
  BI: "Burundi", BT: "Bután", CV: "Cabo Verde", KH: "Camboya", CM: "Camerún",
  CA: "Canadá", QA: "Qatar", TD: "Chad", CL: "Chile", CN: "China", CY: "Chipre",
  CO: "Colombia", KM: "Comoras", CG: "Congo", CD: "Congo (RDC)", KP: "Corea del Norte",
  KR: "Corea del Sur", CI: "Costa de Marfil", CR: "Costa Rica", HR: "Croacia",
  CU: "Cuba", DK: "Dinamarca", DM: "Dominica", EC: "Ecuador", EG: "Egipto",
  SV: "El Salvador", AE: "Emiratos Árabes", ER: "Eritrea", SK: "Eslovaquia",
  SI: "Eslovenia", ES: "España", US: "Estados Unidos", EE: "Estonia", ET: "Etiopía",
  PH: "Filipinas", FI: "Finlandia", FJ: "Fiyi", FR: "Francia", GA: "Gabón",
  GM: "Gambia", GE: "Georgia", GH: "Ghana", GD: "Granada", GR: "Grecia",
  GT: "Guatemala", GN: "Guinea", GQ: "Guinea Ecuatorial", GW: "Guinea-Bisáu",
  GY: "Guyana", HT: "Haití", HN: "Honduras", HK: "Hong Kong", HU: "Hungría",
  IN: "India", ID: "Indonesia", IQ: "Irak", IR: "Irán", IE: "Irlanda",
  IS: "Islandia", IL: "Israel", IT: "Italia", JM: "Jamaica", JP: "Japón",
  JO: "Jordania", KZ: "Kazajistán", KE: "Kenia", KG: "Kirguistán", KI: "Kiribati",
  KW: "Kuwait", LA: "Laos", LS: "Lesoto", LV: "Letonia", LB: "Líbano",
  LR: "Liberia", LY: "Libia", LI: "Liechtenstein", LT: "Lituania", LU: "Luxemburgo",
  MO: "Macao", MK: "Macedonia Norte", MG: "Madagascar", MY: "Malasia", MW: "Malaui",
  MV: "Maldivas", ML: "Malí", MT: "Malta", MA: "Marruecos", MU: "Mauricio",
  MR: "Mauritania", MX: "México", FM: "Micronesia", MD: "Moldavia", MC: "Mónaco",
  MN: "Mongolia", ME: "Montenegro", MZ: "Mozambique", MM: "Myanmar", NA: "Namibia",
  NR: "Nauru", NP: "Nepal", NI: "Nicaragua", NE: "Níger", NG: "Nigeria",
  NO: "Noruega", NZ: "Nueva Zelanda", OM: "Omán", NL: "Países Bajos", PK: "Pakistán",
  PW: "Palaos", PA: "Panamá", PG: "Papúa Nueva Guinea", PY: "Paraguay", PE: "Perú",
  PL: "Polonia", PT: "Portugal", PR: "Puerto Rico", GB: "Reino Unido", CZ: "República Checa",
  DO: "Rep. Dominicana", RW: "Ruanda", RO: "Rumanía", RU: "Rusia", WS: "Samoa",
  SM: "San Marino", LC: "Santa Lucía", ST: "Santo Tomé", SN: "Senegal", RS: "Serbia",
  SC: "Seychelles", SL: "Sierra Leona", SG: "Singapur", SY: "Siria", SO: "Somalia",
  LK: "Sri Lanka", ZA: "Sudáfrica", SD: "Sudán", SS: "Sudán del Sur", SE: "Suecia",
  CH: "Suiza", SR: "Surinam", TH: "Tailandia", TW: "Taiwán", TZ: "Tanzania",
  TJ: "Tayikistán", TL: "Timor Oriental", TG: "Togo", TO: "Tonga", TT: "Trinidad y Tobago",
  TN: "Túnez", TM: "Turkmenistán", TR: "Turquía", TV: "Tuvalu", UA: "Ucrania",
  UG: "Uganda", UY: "Uruguay", UZ: "Uzbekistán", VU: "Vanuatu", VA: "Vaticano",
  VE: "Venezuela", VN: "Vietnam", YE: "Yemen", ZM: "Zambia", ZW: "Zimbabue",
};

// Rutas típicas de escaneo de bots
const BOT_SCAN_PATTERNS = [
  'wp-includes', 'wp-admin', 'wp-content', 'wp-login', 'xmlrpc.php',
  'wp-json', 'wp-config', '.env', 'admin.php', 'config.php',
  'phpmyadmin', 'phpinfo', 'shell.php', 'backup', '.git',
  'actuator', 'swagger', 'api-docs', 'drupal', 'joomla',
];

export function AccessLogsTool() {
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [stats, setStats] = useState<AccessLogsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [filtroMotivo, setFiltroMotivo] = useState('');
  const [filtroPais, setFiltroPais] = useState('');
  const [ocultarBots, setOcultarBots] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/admin/seguridad/logs?stats=1'),
        fetch(`/api/admin/seguridad/logs?limit=200&motivo=${filtroMotivo}&pais=${filtroPais}`)
      ]);
      const statsJson = await statsRes.json();
      const logsJson = await logsRes.json();
      if (statsJson.success) setStats(statsJson.data);
      if (logsJson.success) setLogs(logsJson.data || []);
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [filtroMotivo, filtroPais]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const clearLogs = async () => {
    if (!window.confirm('¿Eliminar todos los logs de seguridad?')) return;
    setClearing(true);
    try {
      const res = await fetch('/api/admin/seguridad/logs', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLogs([]);
        setStats(null);
        fetchData();
      }
    } catch { /* silencioso */ }
    finally { setClearing(false) }
  };

  const filteredLogs = useMemo(() => {
    if (!ocultarBots) return logs;
    return logs.filter(log => !BOT_SCAN_PATTERNS.some(p => log.ruta.toLowerCase().includes(p.toLowerCase())));
  }, [logs, ocultarBots]);

  const botScanCount = logs.filter(log => BOT_SCAN_PATTERNS.some(p => log.ruta.toLowerCase().includes(p.toLowerCase()))).length;

  const maxBar = stats?.por_hora?.reduce((max, h) => Math.max(max, h.count), 0) || 1;

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Logs de Acceso</h2>
            <p className="text-xs text-gray-500">Registro de intentos bloqueados · Últimas 24 horas</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2 bg-zinc-900 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Actualizar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={clearLogs}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* KPIs */}
        {stats && (
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-zinc-900 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px] text-gray-500 uppercase font-bold">Bloqueos hoy</span>
              </div>
              <span className="text-2xl font-black text-white">{stats.total_hoy}</span>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] text-gray-500 uppercase font-bold">Países</span>
              </div>
              <span className="text-2xl font-black text-white">{stats.paises_unicos}</span>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] text-gray-500 uppercase font-bold">IPs únicas</span>
              </div>
              <span className="text-2xl font-black text-white">{stats.ips_unicas}</span>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Route className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] text-gray-500 uppercase font-bold">Rutas atacadas</span>
              </div>
              <span className="text-2xl font-black text-white">{stats.top_rutas?.length || 0}</span>
            </div>
          </div>
        )}

        {/* Gráfico de barras */}
        {stats && stats.por_hora.length > 0 && (
          <div className="bg-zinc-900 rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-bold text-gray-400 uppercase">Bloqueos por hora (últimas 24h)</span>
              {stats.pico_hora && (
                <span className="text-[10px] text-gray-600 ml-auto">
                  Pico: {stats.pico_hora.hora}h ({stats.pico_hora.count} bloqueos)
                </span>
              )}
            </div>
            <div className="flex items-end gap-1 h-28">
              {Array.from({ length: 24 }, (_, i) => {
                const label = `${i}h`;
                const entry = stats.por_hora.find(h => h.hora === label) || { hora: label, count: 0 };
                const height = maxBar > 0 ? Math.max(2, (entry.count / maxBar) * 100) : 0;
                const isPico = stats.pico_hora?.hora === i;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <span className="text-[9px] text-gray-600 mb-1">{entry.count}</span>
                    <div
                      className={`w-full rounded-t transition-all ${isPico ? 'bg-purple-500' : 'bg-purple-500/30 hover:bg-purple-500/50'}`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[8px] text-gray-600 mt-1">{i}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info: Bot scans */}
        {botScanCount > 0 && (
          <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/10 rounded-xl px-4 py-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-blue-400 font-bold">
                {botScanCount} peticiones son escaneos automáticos de bots
              </p>
              <p className="text-[10px] text-blue-400/60 mt-1">
                Rutas como <code className="bg-blue-500/10 px-1 rounded">wp-includes</code>, <code className="bg-blue-500/10 px-1 rounded">.env</code> o <code className="bg-blue-500/10 px-1 rounded">xmlrpc.php</code> son bots que escanean internet buscando vulnerabilidades conocidas. No son un ataque dirigido a tu sitio — el geobloqueo los está frenando correctamente.
              </p>
            </div>
            <button
              onClick={() => setOcultarBots(!ocultarBots)}
              className={`text-[10px] px-2 py-1 rounded-md shrink-0 transition-colors ${
                ocultarBots ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-gray-500'
              }`}
            >
              {ocultarBots ? 'Mostrar' : 'Ocultar'}
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={filtroMotivo}
            onChange={e => setFiltroMotivo(e.target.value)}
            className="bg-zinc-900 rounded-lg px-3 py-1.5 text-xs text-white outline-none border border-white/5"
          >
            <option value="">Todos los motivos</option>
            <option value="geobloqueo">Geobloqueo</option>
            <option value="rate_limit">Rate Limiting</option>
          </select>
          <input
            type="text"
            value={filtroPais}
            onChange={e => setFiltroPais(e.target.value.toUpperCase())}
            placeholder="Filtrar por país (CN, RU...)"
            maxLength={2}
            className="bg-zinc-900 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none border border-white/5 w-40"
          />
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Hora</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">País</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">IP</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Ruta</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Método</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-600">
                    {stats?.total_hoy === 0
                      ? 'Sin bloqueos hoy — tus sistemas de seguridad están tranquilos'
                      : ocultarBots
                        ? 'Todas las peticiones filtradas son escaneos de bots'
                        : 'No se encontraron logs con los filtros actuales'}
                  </td>
                </tr>
              )}
              {filteredLogs.map((log, i) => (
                <tr key={log.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-gray-400 font-mono text-[10px]">
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800/50">
                        <Flag code={log.pais} height="14" />
                      </div>
                      <span className="text-white text-[11px] truncate max-w-[100px]">
                        {PAISES[log.pais] || log.pais}
                      </span>
                      <span className="text-[9px] text-gray-600">{log.pais}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-gray-400 font-mono text-[10px]">{log.ip}</td>
                  <td className="py-2 px-3 text-gray-300 font-mono text-[10px] truncate max-w-[200px]">{log.ruta}</td>
                  <td className="py-2 px-3">
                    <span className={`font-bold ${
                      log.metodo === 'POST' ? 'text-green-400' :
                      log.metodo === 'GET' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>{log.metodo}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      log.motivo === 'geobloqueo'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {log.motivo === 'geobloqueo' ? 'Geobloqueo' : 'Rate Limit'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="flex justify-center py-6">
            <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
