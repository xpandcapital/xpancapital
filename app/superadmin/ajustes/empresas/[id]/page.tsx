"use client"

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Building2, Palette, Globe, FileText, Crown, ToggleLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useEmpresaEdit } from './useEmpresaEdit'
import { useToast } from '@/components/ui/Toast'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { PLANES, PAISES, MONEDAS, ZONAS_HORARIAS } from '../_types'
import { NativeSelect, SearchableSelect } from '@/components/ui/SearchableSelect'

type Tab = 'identidad' | 'apariencia' | 'regional' | 'fiscal' | 'plan' | 'features'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'identidad', label: 'Identidad', icon: <Building2 className="w-4 h-4" /> },
  { id: 'apariencia', label: 'Apariencia', icon: <Palette className="w-4 h-4" /> },
  { id: 'regional', label: 'Regional', icon: <Globe className="w-4 h-4" /> },
  { id: 'fiscal', label: 'Fiscal', icon: <FileText className="w-4 h-4" /> },
  { id: 'plan', label: 'Plan', icon: <Crown className="w-4 h-4" /> },
  { id: 'features', label: 'Features', icon: <ToggleLeft className="w-4 h-4" /> },
]

export default function EmpresaEditPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const id = params.id as string
  const { empresa, config, loading, saving, empresaForm, setEmpresaForm, configForm, setConfigForm, save } = useEmpresaEdit(id)
  const [activeTab, setActiveTab] = useState<Tab>('identidad')

  const handleSave = async () => {
    const ok = await save()
    if (ok) {
      showToast('Configuración guardada', 'success')
    } else {
      showToast('Error al guardar', 'error')
    }
  }

  const upd = (field: string, value: unknown) => setEmpresaForm(prev => ({ ...prev, [field]: value }))
  const updConfig = (field: string, value: unknown) => setConfigForm(prev => ({ ...prev, [field]: value }))

  const input = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 text-sm"
  const label = "text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Empresa no encontrada</p>
          <button onClick={() => router.push('/superadmin/ajustes/empresas')} className="text-blis-red hover:underline text-sm">Volver a empresas</button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto px-4 md:px-8 pt-8 pb-20 bg-black">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/superadmin/ajustes/empresas')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: empresaForm.color_primario as string || '#be0b3c' }}>
          {(empresaForm.nombre as string || '').charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">{empresaForm.nombre as string || ''}</h1>
          <p className="text-xs text-gray-500 font-mono">/{empresaForm.slug as string || ''}</p>
        </div>
        <div className="flex-1" />
        <button onClick={handleSave} disabled={saving} className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-blis-red text-white shadow-[0_4px_12px_rgba(190,11,60,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 md:p-8">
        {activeTab === 'identidad' && (
          <div className="space-y-5">
            <h2 className="text-lg font-black text-white uppercase tracking-wide mb-4 border-b border-white/5 pb-4">Identidad de la Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className={label}>Nombre Comercial</label><input type="text" value={(empresaForm.nombre as string) || ''} onChange={e => upd('nombre', e.target.value)} className={input} /></div>
              <div><label className={label}>Nombre Legal</label><input type="text" value={(empresaForm.nombre_legal as string) || ''} onChange={e => upd('nombre_legal', e.target.value)} className={input} placeholder="Razón social legal" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className={label}>Slug (URL)</label><input type="text" value={(empresaForm.slug as string) || ''} onChange={e => upd('slug', e.target.value)} className={`${input} font-mono`} /></div>
              <div><label className={label}>Dominio Principal</label><input type="text" value={(empresaForm.dominio_principal as string) || ''} onChange={e => upd('dominio_principal', e.target.value)} className={input} placeholder="www.miempresa.com" /></div>
            </div>
          </div>
        )}

        {activeTab === 'apariencia' && (
          <div className="space-y-5">
            <h2 className="text-lg font-black text-white uppercase tracking-wide mb-4 border-b border-white/5 pb-4">Apariencia</h2>
            {[
              { field: 'color_primario', label: 'Color Primario' },
              { field: 'color_secundario', label: 'Color Secundario' },
              { field: 'color_acento', label: 'Color de Acento' },
            ].map(({ field, label: lbl }) => {
              const val = (empresaForm[field] as string) || '#be0b3c'
              return (
                <div key={field}>
                  <label className={label}>{lbl}</label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={val} onChange={e => upd(field, e.target.value)} className="w-14 h-14 rounded-xl border border-white/10 cursor-pointer bg-transparent" />
                    <input type="text" value={val} onChange={e => upd(field, e.target.value)} className={`flex-1 ${input} font-mono`} />
                    <div className="w-14 h-14 rounded-xl border border-white/10 shrink-0" style={{ backgroundColor: val }} />
                  </div>
                </div>
              )
            })}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={label}>Logo</label>
                <ImageUpload value={(empresaForm.logo_url as string) || ''} onChange={v => upd('logo_url', v)} folder="empresas/logos" />
              </div>
              <div>
                <label className={label}>Favicon</label>
                <ImageUpload value={(empresaForm.favicon_url as string) || ''} onChange={v => upd('favicon_url', v)} folder="empresas/favicons" compact />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'regional' && (
          <div className="space-y-5">
            <h2 className="text-lg font-black text-white uppercase tracking-wide mb-4 border-b border-white/5 pb-4">Configuración Regional</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={label}>País Fiscal</label>
                <SearchableSelect value={(empresaForm.pais_fiscal as string) || 'PE'} onChange={v => upd('pais_fiscal', v)} options={PAISES.map(p => ({ value: p.code, label: p.nombre }))} className={input} />
              </div>
              <div>
                <label className={label}>Moneda Base</label>
                <SearchableSelect value={(empresaForm.moneda_base as string) || 'USD'} onChange={v => upd('moneda_base', v)} options={MONEDAS.map(m => ({ value: m.code, label: m.nombre }))} className={input} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={label}>Idioma</label>
                <NativeSelect value={(empresaForm.idioma as string) || 'es'} onChange={v => upd('idioma', v)} options={[{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }, { value: 'pt', label: 'Português' }]} className={input} />
              </div>
              <div>
                <label className={label}>Zona Horaria</label>
                <SearchableSelect value={(empresaForm.zona_horaria as string) || 'America/Lima'} onChange={v => upd('zona_horaria', v)} options={ZONAS_HORARIAS.map(tz => ({ value: tz, label: tz.replace('_', ' ') }))} className={input} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fiscal' && (
          <div className="space-y-5">
            <h2 className="text-lg font-black text-white uppercase tracking-wide mb-4 border-b border-white/5 pb-4">Datos Fiscales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className={label}>RUC / NIT / RFC</label><input type="text" value={(empresaForm.ruc as string) || ''} onChange={e => upd('ruc', e.target.value)} className={input} placeholder="20123456789" /></div>
              <div><label className={label}>Razón Social</label><input type="text" value={(empresaForm.razon_social as string) || ''} onChange={e => upd('razon_social', e.target.value)} className={input} /></div>
            </div>
            <div><label className={label}>Dirección Fiscal</label><textarea value={(empresaForm.direccion_fiscal as string) || ''} onChange={e => upd('direccion_fiscal', e.target.value)} className={`${input} resize-none`} rows={3} placeholder="Av. Principal 123, Lima, Perú" /></div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-5">
            <h2 className="text-lg font-black text-white uppercase tracking-wide mb-4 border-b border-white/5 pb-4">Plan y Límites</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={label}>Plan</label>
                <NativeSelect value={(empresaForm.plan as string) || 'free'} onChange={v => upd('plan', v)} options={PLANES.map(p => ({ value: p.id, label: `${p.nombre} (hasta ${p.usuarios} usuarios)` }))} className={input} />
              </div>
              <div><label className={label}>Límite de Usuarios</label><input type="number" value={(empresaForm.plan_limite_usuarios as number) || 5} onChange={e => upd('plan_limite_usuarios', parseInt(e.target.value))} className={input} /></div>
              <div><label className={label}>Límite de Productos</label><input type="number" value={(empresaForm.plan_limite_productos as number) || 50} onChange={e => upd('plan_limite_productos', parseInt(e.target.value))} className={input} /></div>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={empresaForm.activo !== false} onChange={e => upd('activo', e.target.checked)} className="sr-only peer" />
                <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
              <div>
                <p className="text-white font-bold text-sm">Empresa Activa</p>
                <p className="text-gray-500 text-[11px]">Las empresas inactivas no se muestran públicamente</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && configForm && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-wide mb-4 border-b border-white/5 pb-4">Módulos y Features</h2>
            {[
              { key: 'blog_activo', label: 'Blog', desc: 'Sección de blog y artículos' },
              { key: 'tienda_activa', label: 'Tienda', desc: 'Catálogo y ventas online' },
              { key: 'academia_activa', label: 'Academia', desc: 'Cursos y certificaciones' },
              { key: 'referidos_activo', label: 'Referidos', desc: 'Sistema de referidos' },
              { key: 'bliscoins_activo', label: 'BLIS Coins', desc: 'Sistema de monedas virtuales' },
              { key: 'envios_activo', label: 'Envíos', desc: 'Gestión de envíos' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-white text-sm font-bold">{item.label}</p>
                  <p className="text-gray-500 text-[11px]">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={!!configForm[item.key]} onChange={e => updConfig(item.key, e.target.checked)} className="sr-only peer" />
                  <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blis-red after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            ))}
            <div className="border-t border-white/5 pt-5 mt-5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Configuración de BLIS Coins</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className={label}>Coins por Lectura</label><input type="number" value={(configForm.coins_por_lectura as number) ?? 0} onChange={e => updConfig('coins_por_lectura', parseInt(e.target.value))} className={input} /></div>
                <div><label className={label}>Segundos Lectura</label><input type="number" value={(configForm.segundos_lectura as number) ?? 0} onChange={e => updConfig('segundos_lectura', parseInt(e.target.value))} className={input} /></div>
                <div><label className={label}>Coins por Registro</label><input type="number" value={(configForm.coins_registro as number) ?? 0} onChange={e => updConfig('coins_registro', parseInt(e.target.value))} className={input} /></div>
                <div><label className={label}>Coins por Referido</label><input type="number" value={(configForm.coins_referido as number) ?? 0} onChange={e => updConfig('coins_referido', parseInt(e.target.value))} className={input} /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="bg-blis-red text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  )
}