import { useState, useEffect, useCallback } from 'react'
import { Empresa, EmpresaConfig } from '../_types'

export function useEmpresaEdit(id: string) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [config, setConfig] = useState<EmpresaConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [empresaForm, setEmpresaForm] = useState<Record<string, unknown>>({})
  const [configForm, setConfigForm] = useState<Record<string, unknown>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/empresa?id=${id}`)
      const data = await res.json()
      if (data.success) {
        setEmpresa(data.empresa)
        setEmpresaForm(data.empresa || {})
        if (data.config) {
          setConfig(data.config)
          setConfigForm(data.config)
        } else {
          const defaults: EmpresaConfig = {
            blog_activo: true, tienda_activa: true, academia_activa: false,
            referidos_activo: true, bliscoins_activo: true, envios_activo: false,
            envios_gratis_monto: null, coins_por_lectura: 5, segundos_lectura: 60,
            coins_registro: 100, coins_referido: 50,
          }
          setConfig(defaults)
          setConfigForm(defaults as any)
        }
      }
    } catch {} finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [id])

  const save = useCallback(async (): Promise<boolean> => {
    if (!empresa) return false
    setSaving(true)
    try {
      const empresaChanges: Record<string, unknown> = {}
      const empresaFields = [
        'nombre', 'nombre_legal', 'slug', 'logo_url', 'logo_dark_url', 'favicon_url',
        'color_primario', 'color_secundario', 'color_acento',
        'moneda_base', 'monedas_activas', 'idioma', 'zona_horaria',
        'pais_fiscal', 'ruc', 'razon_social', 'direccion_fiscal',
        'dominio_principal', 'dominios_alias', 'activo', 'plan',
        'plan_limite_usuarios', 'plan_limite_productos', 'plan_limite_almacenamiento'
      ]
      empresaFields.forEach(field => {
        if (empresaForm[field as keyof typeof empresaForm] !== undefined && (empresaForm as Record<string, unknown>)[field] !== (empresa as unknown as Record<string, unknown>)[field]) {
          empresaChanges[field] = empresaForm[field]
        }
      })

      const configChanges: Record<string, unknown> = {}
      const configFields = [
        'blog_activo', 'tienda_activa', 'academia_activa', 'referidos_activo', 'bliscoins_activo',
        'envios_activo', 'envios_gratis_monto',
        'coins_por_lectura', 'segundos_lectura', 'coins_registro', 'coins_referido'
      ]
      configFields.forEach(field => {
        if (configForm[field as keyof typeof configForm] !== undefined && (configForm as Record<string, unknown>)[field] !== (config as unknown as Record<string, unknown>)?.[field]) {
          configChanges[field] = configForm[field]
        }
      })

      const hasEmpresaChanges = Object.keys(empresaChanges).length > 0
      const hasConfigChanges = Object.keys(configChanges).length > 0

      if (!hasEmpresaChanges && !hasConfigChanges) {
        setSaving(false)
        return true
      }

      const res = await fetch('/api/admin/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: empresa.id,
          empresa: hasEmpresaChanges ? empresaChanges : undefined,
          config: hasConfigChanges ? configChanges : undefined,
        }),
      })
      const data = await res.json()

      if (data.success) {
        fetchData()
        return true
      }
      return false
    } catch { return false }
    finally { setSaving(false) }
  }, [empresa, empresaForm, config, configForm, fetchData])

  return {
    empresa, config, loading, saving,
    empresaForm, setEmpresaForm,
    configForm, setConfigForm,
    save,
  }
}