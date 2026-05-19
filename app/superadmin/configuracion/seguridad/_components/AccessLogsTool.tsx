"use client";

import { useState, useEffect, useCallback } from 'react';
import { ScrollText, Trash2, RefreshCw, Globe, Route, Server, Zap, Eye, Filter } from 'lucide-react';
import type { AccessLogsStats, AccessLogEntry } from '../_types';

export function AccessLogsTool() {
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [stats, setStats] = useState<AccessLogsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [filtroMotivo, setFiltroMotivo] = useState('');
  const [filtroPais, setFiltroPais] = useState('');

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
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-600">
                    {stats?.total_hoy === 0
                      ? 'Sin bloqueos hoy — tus sistemas de seguridad están tranquilos'
                      : 'No se encontraron logs con los filtros actuales'}
                  </td>
                </tr>
              )}
              {logs.map((log, i) => (
                <tr key={log.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-gray-400 font-mono text-[10px]">
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-white font-bold">{log.pais}</span>
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
