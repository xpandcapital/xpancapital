"use client"

import { useState } from 'react'
import { X, Check, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react'
import type { Advisor, Role } from '../_types'
import { PermissionSelector } from '@/components/ui/PermissionSelector'
import type { PermisosAdicionales, UserRole } from '@/lib/auth/permissions'
import { ROLE_CONFIG } from '@/lib/auth/permissions'
import { SearchableSelect } from '@/components/ui/SearchableSelect'

interface EmployeeModalProps {
  advisor: Advisor | null
  roles: Role[]
  onClose: () => void
}

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'toggle'
  placeholder?: string
  options?: string[]
  optionLabels?: string[]
}

const FIELD_GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Datos Personales',
    fields: [
      { key: 'name', label: 'Nombre Completo *', type: 'text', placeholder: 'Nombre del empleado' },
      { key: 'email', label: 'Email *', type: 'email', placeholder: 'correo@ejemplo.com' },
      { key: 'phone', label: 'Teléfono', type: 'text', placeholder: '0991234567' },
      { key: 'document_id', label: 'Cédula / RUC', type: 'text', placeholder: '1712345678' },
      { key: 'fecha_nacimiento', label: 'Fecha de Nacimiento', type: 'date' },
      { key: 'estado_civil', label: 'Estado Civil', type: 'select', options: ['Soltero/a', 'Casado/a', 'Unión Libre', 'Divorciado/a', 'Viudo/a'] },
      { key: 'lugar_residencia', label: 'Lugar de Residencia', type: 'text', placeholder: 'País y Ciudad' },
    ],
  },
  {
    title: 'Información Laboral',
    fields: [
      { key: 'puesto', label: 'Puesto / Cargo', type: 'text', placeholder: 'Asesor Inmobiliario' },
      { key: 'nivel_estudios', label: 'Nivel de Estudios', type: 'select', options: ['Primaria', 'Secundaria', 'Técnico', 'Universitario', 'Postgrado'] },
      { key: 'aspiracion_salarial', label: 'Aspiración Salarial', type: 'text', placeholder: '$500 - $1000' },
      { key: 'acceso_tecnologia', label: 'Acceso a Tecnología', type: 'text', placeholder: 'PC, Smartphone, Internet' },
    ],
  },
  {
    title: 'Disponibilidad',
    fields: [
      { key: 'disponibilidad_inmediata', label: 'Disponibilidad Inmediata', type: 'toggle' },
      { key: 'disponibilidad_viaje', label: 'Disponibilidad para Viajar', type: 'toggle' },
    ],
  },
  {
    title: 'Comisiones',
    fields: [
      { key: 'commission_type', label: 'Tipo de Comisión', type: 'select', options: ['percentage', 'fixed'], optionLabels: ['Porcentaje (%)', 'Monto Fijo ($)'] },
      { key: 'commission_value', label: 'Valor de Comisión', type: 'number' },
      { key: 'commission_trigger_percent', label: 'Liberar al (%) Pagado', type: 'number' },
    ],
  },
]

export function EmployeeModal({ advisor, roles, onClose }: EmployeeModalProps) {
  const isEditing = !!advisor
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [createdPassword, setCreatedPassword] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: advisor?.name || '',
    email: advisor?.email || '',
    phone: advisor?.phone || '',
    phone_code: advisor?.phone_code || '+593',
    document_id: advisor?.document_id || '',
    puesto: advisor?.puesto || '',
    rol: advisor?.rol || 'empleado',
    lugar_residencia: advisor?.lugar_residencia || '',
    estado_civil: advisor?.estado_civil || '',
    nivel_estudios: advisor?.nivel_estudios || '',
    aspiracion_salarial: advisor?.aspiracion_salarial || '',
    disponibilidad_inmediata: advisor?.disponibilidad_inmediata ?? true,
    disponibilidad_viaje: advisor?.disponibilidad_viaje ?? false,
    acceso_tecnologia: advisor?.acceso_tecnologia || '',
    commission_type: advisor?.commission_type || 'percentage',
    commission_value: advisor?.commission_value || 0,
    commission_trigger_percent: advisor?.commission_trigger_percent || 30,
    is_active: advisor?.is_active ?? true,
    notes: advisor?.notes || '',
    password: '',
  })
  const [permisosAdicionales, setPermisosAdicionales] = useState<PermisosAdicionales>(
    advisor?.permisos_adicionales || { extra: [], denied: [] }
  )

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setToast('Nombre y email son obligatorios')
      return
    }
    setSaving(true)
    try {
      if (isEditing && advisor) {
        const res = await fetch('/api/admin/equipo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: advisor.id, ...form, permisos_adicionales: permisosAdicionales }),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Error al guardar')
        setToast('Empleado actualizado')
      } else {
        const { name, ...rest } = form
        const res = await fetch('/api/admin/equipo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...rest, nombre: name, permisos_adicionales: permisosAdicionales }),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Error al crear')
        if (data.generatedPassword) setCreatedPassword(data.generatedPassword)
        setToast('Empleado creado exitosamente')
      }
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!advisor?.email) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/equipo/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: advisor.email }),
      })
      const data = await res.json()
      if (data.success && data.generatedPassword) {
        setCreatedPassword(data.generatedPassword)
      } else {
        setToast('Contraseña restablecida')
      }
    } catch {
      setToast('Error al restablecer contraseña')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">{isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
            <p className="text-white/40 text-xs mt-1">{isEditing ? `Editando: ${advisor?.name}` : 'Se creará un usuario en el sistema'}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"><X className="w-5 h-5" /></button>
        </div>

        {toast && (
          <div className="mx-6 mt-4 px-4 py-2 rounded-xl text-sm font-bold bg-blis-red/10 border border-blis-red/30 text-blis-red">{toast}</div>
        )}

        {createdPassword ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2"><KeyRound className="w-4 h-4 text-emerald-400" /><p className="text-emerald-400 font-bold text-sm">Empleado {isEditing ? 'actualizado' : 'creado'} exitosamente</p></div>
              <p className="text-gray-300 text-xs mb-3">Comparte estas credenciales con el miembro del equipo:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg p-3"><span className="text-[10px] text-gray-500 uppercase font-bold w-12">Email</span><code className="flex-1 text-emerald-300 font-mono text-sm break-all">{form.email}</code></div>
                <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg p-3"><span className="text-[10px] text-gray-500 uppercase font-bold w-12">Clave</span><code className="flex-1 text-emerald-300 font-mono text-sm break-all">{createdPassword}</code></div>
              </div>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-blis-red rounded-xl text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all">Cerrar</button>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(90vh - 160px)' }}>
            {FIELD_GROUPS.map(group => (
              <div key={group.title}>
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">{group.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.fields.map(field => {
                    if (field.type === 'toggle') {
                      return (
                        <div key={field.key} className="flex items-center gap-3">
                          <button onClick={() => updateField(field.key, !form[field.key as keyof typeof form])} className={`w-12 h-6 rounded-full transition-colors relative ${form[field.key as keyof typeof form] ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${form[field.key as keyof typeof form] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </button>
                          <span className="text-white text-sm font-medium">{form[field.key as keyof typeof form] ? 'Sí' : 'No'}</span>
                          <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">{field.label}</label>
                        </div>
                      )
                    }
                    if (field.type === 'select') {
                      const opts = (field.options || []).map((v, i) => ({ value: v, label: (field.optionLabels || [])[i] || v }))
                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{field.label}</label>
                          <SearchableSelect options={opts} value={form[field.key as keyof typeof form] as string} onChange={(val) => updateField(field.key, val)} />
                        </div>
                      )
                    }
                    if (field.type === 'date') {
                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{field.label}</label>
                          <input type="date" value={form[field.key as keyof typeof form] as string || ''} onChange={(e) => updateField(field.key, e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors text-xs" />
                        </div>
                      )
                    }
                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{field.label}</label>
                        <input type={field.type === 'number' ? 'number' : 'text'} value={form[field.key as keyof typeof form] as string || (field.type === 'number' ? '' : '')} onChange={(e) => updateField(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors text-xs" placeholder={field.placeholder} />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Role */}
            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Rol y Permisos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(roles.length > 0 ? roles : [
                  { id: '1', nombre: 'empleado', label: 'Empleado', color: '#10b981' },
                  { id: '2', nombre: 'editor', label: 'Editor', color: '#8b5cf6' },
                  { id: '3', nombre: 'admin', label: 'Admin', color: '#f59e0b' },
                  { id: '4', nombre: 'superadmin', label: 'Super Admin', color: '#be0b3c' },
                ]).map(role => {
                  const cfg = ROLE_CONFIG[role.nombre as UserRole]
                  const isSelected = form.rol === role.nombre
                  return (
                    <button key={role.id || role.nombre} onClick={() => updateField('rol', role.nombre)} className={`p-3 rounded-xl border text-center transition-all ${isSelected ? `${cfg?.bgColor || 'bg-blis-red/10'} ${cfg?.color || 'text-white'} border-current` : 'border-white/5 bg-white/[0.02] text-gray-400 hover:border-white/10'}`}>
                      <p className="text-xs font-bold">{role.label}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">{role.nombre}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Permisos adicionales */}
            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Permisos Personalizados</h3>
              <p className="text-[10px] text-gray-600 mb-3">Agrega o deniega permisos específicos además de los del rol seleccionado.</p>
              <PermissionSelector
                role={(form.rol || 'editor') as UserRole}
                permisosAdicionales={permisosAdicionales}
                onChange={setPermisosAdicionales}
              />
            </div>

            {/* Password (new only) */}
            {!isEditing && (
              <div>
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Contraseña</h3>
                <div className="space-y-1">
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateField('password', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-blis-red/50 transition-colors text-xs" placeholder="Dejar vacío para generar automáticamente" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest">Se genera automáticamente si se deja vacío</p>
                </div>
              </div>
            )}

            {/* Reset Password (editing only) */}
            {isEditing && advisor?.email && (
              <div>
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Acceso</h3>
                <button onClick={handleResetPassword} disabled={saving} className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50">
                  <KeyRound className="w-3.5 h-3.5" /> Restablecer Contraseña
                </button>
                <p className="text-[10px] text-gray-600 mt-1">Se generará una nueva contraseña temporal para {advisor.email}</p>
              </div>
            )}

            {/* Active + Notes */}
            <div className="flex items-center gap-3">
              <button onClick={() => updateField('is_active', !form.is_active)} className={`w-12 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-white text-sm font-medium">{form.is_active ? 'Miembro Activo' : 'Miembro Inactivo'}</span>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Observaciones</label>
              <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={2} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors resize-none text-xs" placeholder="Notas adicionales..." />
            </div>
          </div>
        )}

        {!createdPassword && (
          <div className="p-6 border-t border-white/5 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={!form.name.trim() || !form.email.trim() || saving} className="px-6 py-2.5 bg-blis-red rounded-xl text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isEditing ? 'Guardar Cambios' : 'Crear Empleado'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}