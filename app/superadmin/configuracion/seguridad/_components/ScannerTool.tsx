"use client";

import { useState, useCallback } from 'react';
import { Search, Shield, RefreshCw, Zap, AlertTriangle, CheckCircle, Info, ExternalLink, Brain, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScannerResult, ScannerFinding, ScannerRecommendation } from '@/lib/security-scanner';

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle, label: 'Crítico' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertTriangle, label: 'Alto' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Info, label: 'Medio' },
  low: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Info, label: 'Bajo' },
};

const URGENCY_CONFIG = {
  inmediato: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Inmediato' },
  '24h': { color: 'text-orange-400', bg: 'bg-orange-500/10', label: '24 horas' },
  '72h': { color: 'text-amber-400', bg: 'bg-amber-500/10', label: '72 horas' },
  semanal: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Esta semana' },
};

export function ScannerTool() {
  const [result, setResult] = useState<ScannerResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [expandedFinding, setExpandedFinding] = useState<number | null>(null);
  const [expandedRec, setExpandedRec] = useState<number | null>(null);

  const runScan = useCallback(async () => {
    setScanning(true);
    setError('');
    try {
      const res = await fetch('/api/admin/seguridad/scanner', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        setError(json.error || 'Error al ejecutar el escaneo');
      }
    } catch {
      setError('Error de conexión al ejecutar el escaneo');
    } finally {
      setScanning(false);
    }
  }, []);

  const scoreColor = !result ? 'text-gray-500' :
    result.security_score >= 90 ? 'text-emerald-400' :
    result.security_score >= 70 ? 'text-amber-400' : 'text-red-400';

  const scoreBg = !result ? 'bg-gray-500' :
    result.security_score >= 90 ? 'bg-emerald-400' :
    result.security_score >= 70 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-white">Scanner de Seguridad</h2>
            <p className="text-[11px] text-gray-500">Análisis inteligente de intrusiones · Código · Configuración · Accesos</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={runScan}
              disabled={scanning}
              className="px-5 py-2.5 bg-blis-red text-white text-sm font-bold rounded-xl hover:bg-blis-red/80 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(213,193,8,0.3)]"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Escaneando sistema...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Escanear Ahora
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {!result && !scanning && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-400 mb-2">Sin escaneos realizados</h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              El escáner analiza tu base de datos en busca de señales de compromiso: administradores sospechosos, código malicioso en templates, XSS en formularios, configuración debilitada y más. Haz clic en <strong className="text-white">Escanear Ahora</strong> para comenzar.
            </p>
          </div>
        )}

        {scanning && (
          <div className="text-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mx-auto mb-4 w-12 h-12">
              <RefreshCw className="w-12 h-12 text-blis-red/50" />
            </motion.div>
            <h3 className="text-sm font-bold text-white mb-2">Escaneando sistema...</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Revisando perfiles de administrador, templates, configuración de seguridad, formularios, comentarios y más. Esto puede tomar unos segundos.
            </p>
          </div>
        )}

        {result && (
          <>
            {/* Score */}
            <div className="flex items-center gap-4 bg-zinc-900 rounded-xl border border-white/5 p-5">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 120 120" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(39,39,42)" strokeWidth="8" />
                  <motion.circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                    className={scoreColor.replace('text-', '')}
                    strokeDasharray={`${(result.security_score / 100) * 327} 327`}
                    initial={{ strokeDasharray: '0 327' }}
                    animate={{ strokeDasharray: `${(result.security_score / 100) * 327} 327` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 8px currentColor)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-xl font-black ${scoreColor}`}>{result.security_score}</span>
                  <span className="text-[9px] text-gray-500">/100</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-black uppercase ${scoreColor}`}>
                  {result.security_score >= 90 ? 'Sistema Protegido' : result.security_score >= 70 ? 'Atención Requerida' : 'Riesgo Detectado'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{result.summary}</p>
                <p className="text-[10px] text-gray-600 mt-2">
                  Escaneo realizado: {new Date(result.scan_timestamp).toLocaleString('es-PE')}
                </p>
              </div>
            </div>

            {/* Hallazgos */}
            {result.findings.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Hallazgos ({result.findings.length})
                </h4>
                <div className="space-y-2">
                  {result.findings.map((f, i) => {
                    const cfg = SEVERITY_CONFIG[f.severity];
                    const Icon = cfg.icon;
                    const isExpanded = expandedFinding === i;
                    return (
                      <div key={i} className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
                        <div
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                          onClick={() => setExpandedFinding(isExpanded ? null : i)}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${cfg.color}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
                              <span className="text-[10px] text-gray-500 uppercase">{f.category}</span>
                            </div>
                            <p className="text-xs text-gray-300 truncate">{f.title}</p>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="px-4 pb-4 space-y-2">
                                <p className="text-xs text-gray-300">{f.description}</p>
                                {f.evidence && (
                                  <div className="bg-black/30 rounded-lg p-3">
                                    <span className="text-[10px] text-gray-500 uppercase">Evidencia</span>
                                    <code className="block text-[10px] text-gray-400 mt-1 font-mono break-all">{f.evidence}</code>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {result.recommendations.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Recomendaciones ({result.recommendations.length})
                </h4>
                <div className="space-y-2">
                  {result.recommendations.map((r, i) => {
                    const urg = URGENCY_CONFIG[r.urgency];
                    const isExpanded = expandedRec === i;
                    return (
                      <div key={i} className="rounded-xl border border-white/5 bg-zinc-900 overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedRec(isExpanded ? null : i)}>
                          <div className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.action === 'active' ? 'bg-blis-red/20 text-blis-red' : 'bg-blue-500/20 text-blue-400'}`}>
                            {r.action === 'active' ? 'ACTIVO' : 'PASIVO'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-300 truncate">{r.title}</p>
                          </div>
                          <span className={`text-[9px] font-bold ${urg.color} shrink-0`}>{urg.label}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="px-4 pb-4">
                                <p className="text-xs text-gray-400 leading-relaxed">{r.description}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {result.findings.length === 0 && result.recommendations.length === 0 && (
              <div className="text-center py-8 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-400">Sistema Limpio</h4>
                <p className="text-xs text-gray-400 mt-1">No se encontraron amenazas ni configuraciones débiles.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

