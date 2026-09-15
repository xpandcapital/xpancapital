export interface ProfileTask {
  key: string
  label: string
  done: boolean
}

export interface ProfileCompleteness {
  pct: number
  completed: number
  total: number
  tasks: ProfileTask[]
}

export const PROFILE_MIN_PCT = 80

const SOCIAL_FIELDS = [
  'website_url', 'facebook_url', 'instagram_url', 'twitter_url',
  'youtube_url', 'linkedin_url', 'tiktok_url', 'whatsapp_url',
  'telegram_url', 'discord_url', 'github_url',
]

function hasValue(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

export function getProfileCompleteness(profile: Record<string, unknown> | null | undefined): ProfileCompleteness {
  const p = (profile || {}) as Record<string, any>

  const tasks: ProfileTask[] = [
    { key: 'avatar', label: 'Foto de perfil', done: hasValue(p.avatar_url) },
    { key: 'nombre', label: 'Nombre completo', done: hasValue(p.nombre) && hasValue(p.apellido) },
    { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', done: hasValue(p.fecha_nacimiento) },
    { key: 'telefono', label: 'Teléfono', done: hasValue(p.telefono) },
    { key: 'ubicacion', label: 'País / Ciudad', done: hasValue(p.pais) || hasValue(p.ciudad) },
    { key: 'biografia', label: 'Biografía', done: hasValue(p.biografia) },
    { key: 'sociales', label: 'Redes sociales (2+)', done: SOCIAL_FIELDS.filter(f => hasValue(p[f])).length >= 2 },
  ]

  const completed = tasks.filter(t => t.done).length
  const total = tasks.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return { pct, completed, total, tasks }
}

/** Roles de staff exentos del gating de perfil. */
export const STAFF_ROLES = ['superadmin', 'admin', 'editor', 'empleado'] as const

export function isStaffRole(rol?: string | null): boolean {
  return typeof rol === 'string' && (STAFF_ROLES as readonly string[]).includes(rol)
}

export interface ProfileGateInput {
  rol?: string | null
  /** true solo si la lectura del perfil fue fiable (sin error/timeout). */
  profileLoaded: boolean
  profile?: Record<string, unknown> | null
}

/**
 * Decide si el usuario debe ser redirigido a completar su perfil en /miembros.
 * - Fail-open: si no se pudo leer el perfil (profileLoaded=false) NO bloquea.
 * - El staff (superadmin/admin/editor/empleado) siempre está exento.
 */
export function requiresProfileCompletion({ rol, profileLoaded, profile }: ProfileGateInput): boolean {
  if (!profileLoaded) return false
  if (isStaffRole(rol)) return false
  const p = (profile || {}) as Record<string, unknown>
  // La fecha de nacimiento es obligatoria para clientes (saludo de cumpleaños)
  if (!hasValue(p.fecha_nacimiento)) return true
  return getProfileCompleteness(profile).pct < PROFILE_MIN_PCT
}
