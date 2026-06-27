"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollText, Trash2, RefreshCw, Globe, Route, Server, Zap, Eye, Filter, Bot, Info, ChevronLeft, ChevronRight
} from 'lucide-react';
import Flag from 'react-world-flags';
import type { AccessLogsStats, AccessLogEntry } from '../_types';
import { NativeSelect } from '@/components/ui/SearchableSelect';

const PAISES: Record<string, string> = {
  CN: "China", RU: "Rusia", US: "EE.UU.", GB: "Reino Unido", DE: "Alemania", FR: "Francia",
  BR: "Brasil", IN: "India", JP: "Japon", KR: "Corea Sur", MX: "Mexico", AR: "Argentina",
  CO: "Colombia", PE: "Peru", CL: "Chile", ES: "España", IT: "Italia", VN: "Vietnam",
  PK: "Pakistan", BD: "Bangladesh", ID: "Indonesia", TH: "Tailandia", MY: "Malasia",
  NG: "Nigeria", AE: "Emiratos", SA: "Arabia", EG: "Egipto", ZA: "Sudafrica", TR: "Turquia",
  UA: "Ucrania", PL: "Polonia", SE: "Suecia", NO: "Noruega", DK: "Dinamarca", FI: "Finlandia",
  IL: "Israel", SG: "Singapur", HK: "Hong Kong", TW: "Taiwan", AU: "Australia", CA: "Canada",
  IR: "Iran", KP: "Corea Norte", AF: "Afganistan", IQ: "Irak", SY: "Siria", SD: "Sudan",
  LY: "Libia", YE: "Yemen", SO: "Somalia", MM: "Myanmar", BY: "Bielorrusia",
  VE: "Venezuela", EC: "Ecuador", UY: "Uruguay", PY: "Paraguay", BO: "Bolivia",
  KE: "Kenia", TZ: "Tanzania", UG: "Uganda", ET: "Etiopia", GH: "Ghana",
  MA: "Marruecos", DZ: "Argelia", TN: "Tunez", LT: "Lituania", LV: "Letonia",
  KZ: "Kazajistan", UZ: "Uzbekistan", MN: "Mongolia", LA: "Laos", KH: "Camboya",
};

const BOT_SCAN_PATTERNS = ['wp-includes','wp-admin','wp-login','xmlrpc.php','.env','.git','phpmyadmin','shell.php','config.php','admin.php'];

export function AccessLogsTool() {
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [stats, setStats] = useState<AccessLogsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [filtroMotivo, setFiltroMotivo] = useState('');
  const [filtroPais, setFiltroPais] = useState('');
  const [ocultarBots, setOcultarBots] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const dias = 1;
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('dias', String(dias));
      if (filtroMotivo) params.set('motivo', filtroMotivo);
      if (filtroPais) params.set('pais', filtroPais);

      const [statsRes, logsRes] = await Promise.all([
        fetch(`/api/admin/seguridad/logs?stats=1&dias=${dias}`),
        fetch(`/api/admin/seguridad/logs?${params.toString()}`)
      ]);
      const statsJson = await statsRes.json();
      const logsJson = await logsRes.json();

      if (statsJson.success) {
        setStats(statsJson.data);
      }
      if (logsJson.success) {
        setLogs(logsJson.data || []);
        setTotal(logsJson.total || 0);
        setHasMore(logsJson.hasMore || false);
      }
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [filtroMotivo, filtroPais, page]);

  useEffect(() => {
    setPage(1);
  }, [filtroMotivo, filtroPais]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const clearLogs = async () => {
    if (!window.confirm('Eliminar todos los logs')) return;
    setClearing(true);
    try {
      await fetch('/api/admin/seguridad/logs', { method: 'DELETE' });
      setLogs([]); setStats(null); setTotal(0);
      fetchData();
    } catch { /* */ }
    finally { setClearing(false) }
  };

  const filteredLogs = useMemo(() => {
    if (!ocultarBots) return logs;
    return logs.filter(log => !BOT_SCAN_PATTERNS.some(p => log.ruta.toLowerCase().includes(p.toLowerCase())));
  }, [logs, ocultarBots]);

  const botScanCount = logs.filter(log => BOT_SCAN_PATTERNS.some(p => log.ruta.toLowerCase().includes(p.toLowerCase()))).length;
  const maxBar = stats?.por_hora?.reduce((max, h) => Math.max(max, h.count), 0) || 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header compacto */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-3">
        <div className="w-7 h-7 bg-purple-500/10 rounded-md flex items-center justify-center shrink-0">
          <ScrollText className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xs font-black uppercase tracking-tight text-white">Logs de Acceso</h2>
          <p className="text-[9px] text-gray-500">Registro de intentos bloqueados · {total} total</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={fetchData} className="p-1.5 bg-zinc-900 rounded-md text-gray-400 hover:text-white" title="Actualizar">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={clearLogs} disabled={clearing}
            className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-md text-[9px] font-medium hover:bg-red-500/20 disabled:opacity-50">
            <Trash2 className="w-3 h-3" /> Limpiar
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* KPIs */}
        {stats && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Zap, color: 'text-red-400', label: 'Bloqueos', value: stats.total_bloqueos },
              { icon: Globe, color: 'text-blue-400', label: 'Paises', value: stats.paises_unicos },
              { icon: Server, color: 'text-amber-400', label: 'IPs', value: stats.ips_unicas },
              { icon: Route, color: 'text-green-400', label: 'Rutas', value: stats.top_rutas?.length || 0 },
            ].map((k, i) => (
              <div key={i} className="bg-zinc-900 rounded-lg border border-white/5 px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <k.icon className={`w-3 h-3 ${k.color}`} />
                  <span className="text-[9px] text-gray-500 uppercase font-bold">{k.label}</span>
                </div>
                <span className="text-xl font-black text-white">{k.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Gráfico */}
        {stats && stats.por_hora.length > 0 && (
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Eye className="w-3 h-3 text-purple-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Bloqueos por hora (24h)</span>
              {stats.pico_hora && (
                <span className="text-[8px] text-gray-600 ml-auto">Pico {stats.pico_hora.hora}h · {stats.pico_hora.count}</span>
              )}
            </div>
            <div className="flex items-end gap-0.5 h-20">
              {Array.from({ length: 24 }, (_, i) => {
                const entry = stats.por_hora.find(h => h.hora === `${i}h`) || { hora: `${i}h`, count: 0 };
                const height = maxBar > 0 ? Math.max(1, (entry.count / maxBar) * 100) : 0;
                const isPico = stats.pico_hora?.hora === i;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className={`w-full rounded-t transition-all ${isPico ? 'bg-purple-500' : 'bg-purple-500/25 hover:bg-purple-500/40'}`} style={{ height: `${height}%` }} />
                    <span className="text-[7px] text-gray-600 mt-0.5">{i}h</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Banner bots */}
        {botScanCount > 0 && (
          <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/10 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-blue-400 font-bold">{botScanCount} escaneos de bots</p>
              <p className="text-[9px] text-blue-400/50 truncate">
                Rutas como wp-includes, .env o xmlrpc.php son bots buscando vulnerabilidades.
              </p>
            </div>
            <button onClick={() => setOcultarBots(!ocultarBots)}
              className={`text-[9px] px-2 py-0.5 rounded shrink-0 transition-colors ${ocultarBots ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-gray-500'}`}>
              {ocultarBots ? 'Mostrar' : 'Ocultar'}
            </button>
          </div>
        )}

        {/* Filtros compactos */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3 h-3 text-gray-500 shrink-0" />
          <NativeSelect value={filtroMotivo} onChange={setFiltroMotivo}
            options={[
              { value: 'geobloqueo', label: 'Geobloqueo' },
              { value: 'rate_limit', label: 'Rate Limit' },
            ]}
            placeholder="Todos"
            className="bg-zinc-900 rounded-md px-2 py-1 text-[10px] text-white outline-none border border-white/5 w-auto" />
          <input type="text" value={filtroPais} onChange={e => setFiltroPais(e.target.value.toUpperCase())}
            placeholder="País" maxLength={2}
            className="bg-zinc-900 rounded-md px-2 py-1 text-[10px] text-white placeholder-gray-500 outline-none border border-white/5 w-20" />
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-1.5 px-2 text-gray-500 font-medium w-14">Hora</th>
                <th className="text-left py-1.5 px-2 text-gray-500 font-medium w-24">País</th>
                <th className="text-left py-1.5 px-2 text-gray-500 font-medium w-32">IP</th>
                <th className="text-left py-1.5 px-2 text-gray-500 font-medium">Ruta</th>
                <th className="text-left py-1.5 px-2 text-gray-500 font-medium w-14">Método</th>
                <th className="text-left py-1.5 px-2 text-gray-500 font-medium w-20">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 && !loading && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-600">
                  {(stats?.total_bloqueos || 0) === 0 ? 'Sin bloqueos en las últimas 24h' : 'Sin resultados con los filtros actuales'}
                </td></tr>
              )}
              {filteredLogs.map((log, i) => (
                <tr key={log.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-1.5 px-2 text-gray-500 font-mono text-[9px]">
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                  </td>
                  <td className="py-1.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-3 rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800">
                        <Flag code={log.pais} height="10" />
                      </div>
                      <span className="text-gray-300 truncate max-w-[60px]" title={PAISES[log.pais] || log.pais}>
                        {PAISES[log.pais] || log.pais}
                      </span>
                      <span className="text-[8px] text-gray-600">{log.pais}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-gray-500 font-mono text-[9px] truncate max-w-[120px]" title={log.ip}>{log.ip}</td>
                  <td className="py-1.5 px-2 text-gray-400 font-mono text-[9px] truncate max-w-[280px]" title={log.ruta}>{log.ruta}</td>
                  <td className="py-1.5 px-2">
                    <span className={`font-bold ${log.metodo === 'POST' ? 'text-green-400' : log.metodo === 'GET' ? 'text-blue-400' : 'text-gray-400'}`}>{log.metodo}</span>
                  </td>
                  <td className="py-1.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${log.motivo === 'geobloqueo' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {log.motivo === 'geobloqueo' ? 'Geobloqueo' : 'Rate Limit'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {total > pageSize && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[9px] text-gray-600">
              Página {page} de {totalPages} ({total} registros)
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-2 py-1 bg-zinc-900 rounded text-[9px] text-gray-400 hover:text-white disabled:opacity-30 flex items-center gap-1">
                <ChevronLeft className="w-3 h-3" /> Anterior
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={!hasMore}
                className="px-2 py-1 bg-zinc-900 rounded text-[9px] text-gray-400 hover:text-white disabled:opacity-30 flex items-center gap-1">
                Siguiente <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-4">
            <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
