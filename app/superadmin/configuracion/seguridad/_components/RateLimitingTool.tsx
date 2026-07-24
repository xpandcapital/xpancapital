"use client";

import { useState } from 'react';
import {
  Gauge, Plus, Trash2, X, Zap, Route, Timer, ArrowUpDown,
  ShieldAlert, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RateLimitingConfig, RateLimitRule } from '../_types';
import { defaultRateLimitingConfig } from '../_types';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

const RUTAS_SUGERIDAS = [
  { ruta: '/api/leads', metodo: 'POST', descripcion: 'Formularios de leads', protege_contra: 'Spam masivo de leads falsos' },
  { ruta: '/api/leads', metodo: 'GET', descripcion: 'Lectura de leads', protege_contra: 'Scraping de datos por bots' },
  { ruta: '/login', metodo: 'POST', descripcion: 'Inicio de sesión', protege_contra: 'Ataques de fuerza bruta' },
  { ruta: '/api/checkout', metodo: 'POST', descripcion: 'Checkout de pagos', protege_contra: 'Fraude con tarjetas robadas' },
  { ruta: '/api/blog/comments', metodo: 'POST', descripcion: 'Comentarios del blog', protege_contra: 'Spam con links maliciosos' },
  { ruta: '/api/postulantes/public', metodo: 'POST', descripcion: 'Postulaciones', protege_contra: 'CVs basura automatizados' },
  { ruta: '/api/formularios/public', metodo: 'POST', descripcion: 'Formularios públicos', protege_contra: 'Relleno con datos falsos' },
  { ruta: '/api/chat/send', metodo: 'POST', descripcion: 'Chat en vivo', protege_contra: 'Inundación con spam' },
  { ruta: '/api/cursos', metodo: 'GET', descripcion: 'Lectura de cursos', protege_contra: 'Scraping de contenido educativo' },
  { ruta: '/api/productos', metodo: 'GET', descripcion: 'Lectura de productos', protege_contra: 'Scraping de catálogo y precios' },
]

const METODOS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

interface Props {
  config?: RateLimitingConfig
  saving?: boolean
  onSave?: () => void
  onUpdate?: (updates: Partial<RateLimitingConfig>) => void
}

export function RateLimitingTool({ config, saving, onSave, onUpdate }: Props) {
  const rl = config || defaultRateLimitingConfig
  const [showNewRule, setShowNewRule] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [newRuta, setNewRuta] = useState('')
  const [newMetodo, setNewMetodo] = useState('POST')
  const [newLimite, setNewLimite] = useState(10)
  const [newVentana, setNewVentana] = useState(60)
  const [newDescripcion, setNewDescripcion] = useState('')
  const [newProtege, setNewProtege] = useState('')

  const reglasActivas = rl.reglas.filter(r => r.habilitado).length
  const totalReglas = rl.reglas.length

  const activarTodas = () => {
    if (!onUpdate) return
    onUpdate({ reglas: rl.reglas.map(r => ({ ...r, habilitado: true })) })
  }

  const addRule = () => {
    if (!newRuta.trim() || !onUpdate) return
    onUpdate({
      reglas: [
        ...rl.reglas,
        {
          ruta: newRuta.startsWith('/') ? newRuta : '/' + newRuta,
          metodo: newMetodo,
          limite: newLimite,
          ventana_segundos: newVentana,
          habilitado: true,
          descripcion: newDescripcion,
          protege_contra: newProtege,
        }
      ]
    })
    setNewRuta('')
    setNewDescripcion('')
    setNewProtege('')
    setShowNewRule(false)
  }

  const updateRule = (index: number, updates: Partial<RateLimitRule>) => {
    if (!onUpdate) return
    const nuevas = [...rl.reglas]
    nuevas[index] = { ...nuevas[index], ...updates }
    onUpdate({ reglas: nuevas })
  }

  const removeRule = (index: number) => {
    if (!onUpdate) return
    if (expandedIndex === index) setExpandedIndex(null)
    onUpdate({ reglas: rl.reglas.filter((_, i) => i !== index) })
  }

  const addSuggested = (sug: typeof RUTAS_SUGERIDAS[number]) => {
    if (!onUpdate) return
    const yaExiste = rl.reglas.some(reg => reg.ruta === sug.ruta && reg.metodo === sug.metodo)
    if (yaExiste) return
    onUpdate({
      reglas: [
        ...rl.reglas,
        {
          ruta: sug.ruta,
          metodo: sug.metodo,
          limite: 10,
          ventana_segundos: 60,
          habilitado: true,
          descripcion: sug.descripcion,
          protege_contra: sug.protege_contra,
        }
      ]
    })
  }

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Gauge className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Rate Limiting</h2>
            <p className="text-xs text-gray-500">Límite de peticiones por IP · Anti-spam · Anti fuerza bruta</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs ${rl.habilitado ? 'text-green-400' : 'text-gray-500'}`}>
              {rl.habilitado ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={() => onUpdate?.({ habilitado: !rl.habilitado })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                rl.habilitado ? 'bg-green-500' : 'bg-zinc-700'
              }`}
            >
              <motion.div
                animate={{ x: rl.habilitado ? 20 : 2 }}
                className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md"
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
            reglasActivas === 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-zinc-900'
          }`}>
            <Route className={`w-3.5 h-3.5 ${reglasActivas === 0 ? 'text-red-400' : 'text-blue-400'}`} />
            <span className={`text-xs ${reglasActivas === 0 ? 'text-red-400' : 'text-gray-300'}`}>
              {reglasActivas} / {totalReglas} reglas activas
            </span>
          </div>
          <button
            onClick={() => setShowNewRule(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blis-red/10 text-blis-red rounded-lg text-xs font-medium hover:bg-blis-red/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva regla
          </button>
          {totalReglas > 0 && reglasActivas < totalReglas && (
            <button
              onClick={activarTodas}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Activar todas
            </button>
          )}
        </div>
      </div>

      {rl.habilitado && (
        <div className="p-6 space-y-4">
          {/* Warning banner */}
          {reglasActivas === 0 && totalReglas > 0 && (
            <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-400">No hay reglas activas</p>
                <p className="text-xs text-red-400/70 mt-0.5">
                  Tus rutas no están protegidas contra abusos. Activa reglas individuales o usa <button onClick={activarTodas} className="underline hover:text-red-300">Activar todas</button>.
                </p>
              </div>
            </div>
          )}

          {totalReglas === 0 && (
            <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-400">Sin reglas configuradas</p>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  Agrega una nueva regla o selecciona una de las rutas sugeridas abajo.
                </p>
              </div>
            </div>
          )}

          {/* Reglas */}
          <div className="space-y-1.5">
            {rl.reglas.map((regla, i) => {
              const isExpanded = expandedIndex === i
              return (
                <motion.div
                  key={`${regla.ruta}-${regla.metodo}-${i}`}
                  layout
                  className={`rounded-lg border transition-colors ${
                    regla.habilitado ? 'bg-blue-500/3 border-blue-500/10' : 'bg-zinc-900 border-white/5 opacity-60'
                  }`}
                >
                  {/* Header row */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  >
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      regla.metodo === 'POST' ? 'bg-green-500/20 text-green-400' :
                      regla.metodo === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                      regla.metodo === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                      regla.metodo === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                      'bg-zinc-700 text-gray-400'
                    }`}>
                      {regla.metodo}
                    </span>

                    <code className="text-xs text-gray-300 font-mono flex-1 min-w-0 truncate">
                      {regla.ruta}
                    </code>

                    <div className="flex items-center gap-1 text-[10px] text-gray-500 shrink-0">
                      <ArrowUpDown className="w-3 h-3" />
                      <span className="text-white font-bold">{regla.limite}</span>
                      <span>req</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-gray-500 shrink-0">
                      <Timer className="w-3 h-3" />
                      <span className="text-white font-bold">{regla.ventana_segundos}</span>
                      <span>s</span>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); updateRule(i, { habilitado: !regla.habilitado }) }}
                      className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${
                        regla.habilitado ? 'bg-blue-500' : 'bg-zinc-700'
                      }`}
                    >
                      <motion.div
                        animate={{ x: regla.habilitado ? 14 : 1 }}
                        className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 shadow-md"
                      />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); removeRule(i) }}
                      className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="text-gray-600 shrink-0">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Expanded description */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-white/5 pt-3 mx-4">
                          <div className="grid grid-cols-2 gap-3">
                            {regla.descripcion ? (
                              <div className="bg-zinc-900 rounded-lg p-3">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Descripción</span>
                                <p className="text-[11px] text-gray-300 mt-1">{regla.descripcion}</p>
                              </div>
                            ) : (
                              <div className="bg-zinc-900 rounded-lg p-3">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Descripción</span>
                                <p className="text-[11px] text-gray-600 mt-1 italic">Sin descripción</p>
                              </div>
                            )}
                            {regla.protege_contra ? (
                              <div className="bg-zinc-900 rounded-lg p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                                  <span className="text-[10px] font-bold text-gray-500 uppercase">Protege contra</span>
                                </div>
                                <p className="text-[11px] text-amber-400/80">{regla.protege_contra}</p>
                              </div>
                            ) : (
                              <div className="bg-zinc-900 rounded-lg p-3">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Protege contra</span>
                                <p className="text-[11px] text-gray-600 mt-1 italic">Sin especificar</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {/* Form nueva regla */}
          <AnimatePresence>
            {showNewRule && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-zinc-900 rounded-xl border border-white/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blis-red" />
                    <span className="text-sm font-bold text-white">Nueva regla</span>
                    <button onClick={() => setShowNewRule(false)} className="ml-auto text-gray-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Ruta</label>
                      <input
                        type="text"
                        value={newRuta}
                        onChange={e => setNewRuta(e.target.value)}
                        placeholder="/api/leads"
                        className="w-full" buttonClassName="bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/5 focus:border-blis-red/30"
                        onKeyDown={e => { if (e.key === 'Enter') addRule() }}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Método</label>
                      <SearchableSelect
                        value={newMetodo}
                        onChange={setNewMetodo}
                        options={METODOS.map(m => ({ value: m, label: m }))}
                        className="w-full" buttonClassName="bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Límite (peticiones)</label>
                      <input
                        type="number"
                        min={1}
                        value={newLimite}
                        onChange={e => setNewLimite(parseInt(e.target.value) || 10)}
                        className="w-full" buttonClassName="bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/5 focus:border-blis-red/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Ventana (segundos)</label>
                      <input
                        type="number"
                        min={1}
                        value={newVentana}
                        onChange={e => setNewVentana(parseInt(e.target.value) || 60)}
                        className="w-full" buttonClassName="bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/5 focus:border-blis-red/30"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-gray-500 mb-1">Descripción</label>
                      <input
                        type="text"
                        value={newDescripcion}
                        onChange={e => setNewDescripcion(e.target.value)}
                        placeholder="Ej: Formularios de captación de leads"
                        className="w-full" buttonClassName="bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/5 focus:border-blis-red/30"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-gray-500 mb-1">Protege contra</label>
                      <input
                        type="text"
                        value={newProtege}
                        onChange={e => setNewProtege(e.target.value)}
                        placeholder="Ej: Spam masivo de leads falsos"
                        className="w-full" buttonClassName="bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/5 focus:border-blis-red/30"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowNewRule(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">Cancelar</button>
                    <button onClick={addRule} className="px-4 py-2 bg-blis-red text-white text-xs font-bold rounded-lg hover:bg-blis-red/80">Agregar</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rutas sugeridas */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-gray-400 uppercase">Rutas sugeridas</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RUTAS_SUGERIDAS.map(sug => {
                const yaExiste = rl.reglas.some(reg => reg.ruta === sug.ruta && reg.metodo === sug.metodo)
                return (
                  <button
                    key={`${sug.metodo}-${sug.ruta}`}
                    onClick={() => !yaExiste && addSuggested(sug)}
                    disabled={yaExiste}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] transition-colors ${
                      yaExiste
                        ? 'bg-zinc-900 text-gray-600 cursor-not-allowed'
                        : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-white border border-white/5'
                    }`}
                  >
                    <span className={`font-bold ${
                      sug.metodo === 'POST' ? 'text-green-400' :
                      sug.metodo === 'GET' ? 'text-blue-400' : 'text-gray-400'
                    }`}>{sug.metodo}</span>
                    <span className="font-mono">{sug.ruta}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mensaje de límite */}
          <div className="border-t border-white/5 pt-4">
            <label className="block text-xs text-gray-400 mb-2">
              Mensaje al exceder el límite (HTTP 429):
            </label>
            <input
              type="text"
              value={rl.mensaje_limite}
              onChange={(e) => onUpdate?.({ mensaje_limite: e.target.value })}
              className="w-full" buttonClassName="bg-zinc-900 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none border border-white/5 focus:border-blue-500/30"
            />
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2 border-t border-white/5">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blis-red text-white text-sm font-bold rounded-xl hover:bg-blis-red/80 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
