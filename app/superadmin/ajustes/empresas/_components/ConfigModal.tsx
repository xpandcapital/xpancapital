"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Building2, Palette, Globe, FileText, Crown, ToggleLeft } from 'lucide-react'
import { Empresa, EmpresaConfig, ConfigTab, CONFIG_TABS, PLANES, PAISES, MONEDAS, ZONAS_HORARIAS } from '../_types'
import { useToast } from '@/components/ui/Toast'

interface Props {
  empresa: Empresa | undefined
  config: EmpresaConfig | null
  saving: boolean
  onSave: (empresaId: string, empresa: Partial<Empresa>, config: Partial<EmpresaConfig>) => Promise<boolean | string>
  onClose: () => void
}

const TAB_ICONS: Record<ConfigTab, React.ReactNode> = {
  identidad: <Building2 className="w-4 h-4" />,
  apariencia: <Palette className="w-4 h-4" />,
  regional: <Globe className="w-4 h-4" />,
  fiscal: <FileText className="w-4 h-4" />,
  plan: <Crown className="w-4 h-4" />,
  features: <ToggleLeft className="w-4 h-4" />,
}

export function ConfigModal({ empresa, config, saving, onSave, onClose }: Props) {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<ConfigTab>('identidad')
  const [empresaForm, setEmpresaForm] = useState<Partial<Empresa>>({})
  const [configForm, setConfigForm] = useState<Partial<EmpresaConfig>>({})
  const [localSaving, setLocalSaving] = useState(false)

  useEffect(() => {
    if (empresa) {
      setEmpresaForm({
        nombre: empresa.nombre,
        nombre_legal: empresa.nombre_legal || '',
        slug: empresa.slug,
        dominio_principal: empresa.dominio_principal || '',
        color_primario: empresa.color_primario,
        color_secundario: empresa.color_secundario,
        color_acento: empresa.color_acento,
        pais_fiscal: empresa.pais_fiscal,
        moneda_base: empresa.moneda_base,
        idioma: empresa.idioma,
        zona_horaria: empresa.zona_horaria,
        ruc: empresa.ruc || '',
        razon_social: empresa.razon_social || '',
        direccion_fiscal: empresa.direccion_fiscal || '',
        plan: empresa.plan,
        activo: empresa.activo,
        plan_limite_usuarios: empresa.plan_limite_usuarios,
        plan_limite_productos: empresa.plan_limite_productos,
      })
    }
  }, [empresa])

  useEffect(() => {
    if (config) setConfigForm({ ...config })
  }, [config])

  if (!empresa) return null

  const handleSave = async () => {
    setLocalSaving(true)
    const result = await onSave(empresa.id, empresaForm, configForm)
    setLocalSaving(false)
    if (result === true) {
      showToast('Configuración guardada', 'success')
    } else {
      showToast(typeof result === 'string' ? result : 'Error al guardar', 'error')
    }
  }

  const updateEmpresa = (field: string, value: unknown) => setEmpresaForm(prev => ({ ...prev, [field]: value }))
  const updateConfig = (field: string, value: unknown) => setConfigForm(prev => ({ ...prev, [field]: value }))

  const inputClass = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50"
  const labelClass = "text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block"

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ backgroundColor: empresa.color_primario }}>{empresa.nombre.charAt(0)}</div>
            <div>
              <h2 className="text-lg font-black text-white">Configurar Empresa</h2>
              <p className="text-xs text-gray-500">/{empresa.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-1 px-6 py-3 overflow-x-auto shrink-0">
          {CONFIG_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-blis-red text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              {TAB_ICONS[tab.id]}{tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {activeTab === 'identidad' && (
            <div className="space-y-4">
              <div><label className={labelClass}>Nombre Comercial</label><input type="text" value={empresaForm.nombre || ''} onChange={e => updateEmpresa('nombre', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Nombre Legal</label><input type="text" value={empresaForm.nombre_legal || ''} onChange={e => updateEmpresa('nombre_legal', e.target.value)} className={inputClass} placeholder="Razón social legal" /></div>
              <div><label className={labelClass}>Slug (URL)</label><input type="text" value={empresaForm.slug || ''} onChange={e => updateEmpresa('slug', e.target.value)} className={`${inputClass} font-mono`} /></div>
              <div><label className={labelClass}>Dominio Principal</label><input type="text" value={empresaForm.dominio_principal || ''} onChange={e => updateEmpresa('dominio_principal', e.target.value)} className={inputClass} placeholder="www.miempresa.com" /></div>
            </div>
          )}

          {activeTab === 'apariencia' && (
            <div className="space-y-4">
              {['color_primario', 'color_secundario', 'color_acento'].map(field => {
                const labels: Record<string, string> = { color_primario: 'Color Primario', color_secundario: 'Color Secundario', color_acento: 'Color de Acento' }
                const value = (empresaForm as Record<string, unknown>)[field] as string || ''
                return (
                  <div key={field}>
                    <label className={labelClass}>{labels[field]}</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={value} onChange={e => updateEmpresa(field, e.target.value)} className="w-12 h-12 rounded-xl border border-white/10 cursor-pointer" />
                      <input type="text" value={value} onChange={e => updateEmpresa(field, e.target.value)} className={`flex-1 ${inputClass} font-mono`} />
                      <div className="w-12 h-12 rounded-xl border border-white/10" style={{ backgroundColor: value }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'regional' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>País Fiscal</label>
                <select value={empresaForm.pais_fiscal || 'PE'} onChange={e => updateEmpresa('pais_fiscal', e.target.value)} className={inputClass}>
                  {PAISES.map(p => <option key={p.code} value={p.code}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Moneda Base</label>
                <select value={empresaForm.moneda_base || 'USD'} onChange={e => updateEmpresa('moneda_base', e.target.value)} className={inputClass}>
                  {MONEDAS.map(m => <option key={m.code} value={m.code}>{m.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Idioma</label>
                <select value={empresaForm.idioma || 'es'} onChange={e => updateEmpresa('idioma', e.target.value)} className={inputClass}>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Zona Horaria</label>
                <select value={empresaForm.zona_horaria || 'America/Lima'} onChange={e => updateEmpresa('zona_horaria', e.target.value)} className={inputClass}>
                  {ZONAS_HORARIAS.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'fiscal' && (
            <div className="space-y-4">
              <div><label className={labelClass}>RUC / NIT / RFC</label><input type="text" value={empresaForm.ruc || ''} onChange={e => updateEmpresa('ruc', e.target.value)} className={inputClass} placeholder="20123456789" /></div>
              <div><label className={labelClass}>Razón Social</label><input type="text" value={empresaForm.razon_social || ''} onChange={e => updateEmpresa('razon_social', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Dirección Fiscal</label><textarea value={empresaForm.direccion_fiscal || ''} onChange={e => updateEmpresa('direccion_fiscal', e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Av. Principal 123, Lima, Perú" /></div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Plan</label>
                <select value={empresaForm.plan || 'free'} onChange={e => updateEmpresa('plan', e.target.value)} className={inputClass}>
                  {PLANES.map(p => <option key={p.id} value={p.id}>{p.nombre} (hasta {p.usuarios} usuarios)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Límite de Usuarios</label><input type="number" value={empresaForm.plan_limite_usuarios || 5} onChange={e => updateEmpresa('plan_limite_usuarios', parseInt(e.target.value))} className={inputClass} /></div>
                <div><label className={labelClass}>Límite de Productos</label><input type="number" value={empresaForm.plan_limite_productos || 50} onChange={e => updateEmpresa('plan_limite_productos', parseInt(e.target.value))} className={inputClass} /></div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={empresaForm.activo !== false} onChange={e => updateEmpresa('activo', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
                <span className="text-white text-sm font-bold">Empresa Activa</span>
              </div>
            </div>
          )}

          {activeTab === 'features' && configForm && (
            <div className="space-y-3">
              {[
                { key: 'blog_activo', label: 'Blog', desc: 'Sección de blog y artículos' },
                { key: 'tienda_activa', label: 'Tienda', desc: 'Catálogo y ventas online' },
                { key: 'academia_activa', label: 'Academia', desc: 'Cursos y certificaciones' },
                { key: 'referidos_activa' as keyof EmpresaConfig, label: 'Referidos', desc: 'Sistema de referidos' },
                { key: 'bliscoins_activo', label: 'BLIS Coins', desc: 'Sistema de monedas virtuales' },
                { key: 'envios_activo', label: 'Envíos', desc: 'Gestión de envíos' },
              ].map(item => {
                const key = item.key as keyof EmpresaConfig
                const checked = configForm[key] as boolean
                return (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <p className="text-white text-sm font-bold">{item.label}</p>
                      <p className="text-gray-500 text-[11px]">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={!!checked} onChange={e => updateConfig(key, e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blis-red after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  </div>
                )
              })}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div><label className={labelClass}>Coins por Lectura</label><input type="number" value={configForm.coins_por_lectura || 0} onChange={e => updateConfig('coins_por_lectura', parseInt(e.target.value))} className={inputClass} /></div>
                <div><label className={labelClass}>Segundos Lectura</label><input type="number" value={configForm.segundos_lectura || 0} onChange={e => updateConfig('segundos_lectura', parseInt(e.target.value))} className={inputClass} /></div>
                <div><label className={labelClass}>Coins por Registro</label><input type="number" value={configForm.coins_registro || 0} onChange={e => updateConfig('coins_registro', parseInt(e.target.value))} className={inputClass} /></div>
                <div><label className={labelClass}>Coins por Referido</label><input type="number" value={configForm.coins_referido || 0} onChange={e => updateConfig('coins_referido', parseInt(e.target.value))} className={inputClass} /></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 shrink-0">
          <button onClick={handleSave} disabled={localSaving} className="w-full bg-blis-red text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
            <Save className="w-4 h-4" />{localSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}