import { describe, it, expect } from 'vitest'
import {
  getProfileCompleteness,
  requiresProfileCompletion,
  isStaffRole,
  PROFILE_MIN_PCT,
} from '../../lib/profile-completeness'

const FULL_PROFILE = {
  avatar_url: 'https://x/a.jpg',
  nombre: 'Ana',
  apellido: 'Pérez',
  fecha_nacimiento: '1990-05-12',
  telefono: '+51999999999',
  pais: 'PE',
  ciudad: 'Lima',
  biografia: 'Hola',
  website_url: 'https://x.com',
  instagram_url: 'https://instagram.com/x',
}

describe('getProfileCompleteness', () => {
  it('devuelve 0% con perfil nulo y 7 tareas', () => {
    const r = getProfileCompleteness(null)
    expect(r.pct).toBe(0)
    expect(r.completed).toBe(0)
    expect(r.total).toBe(7)
  })

  it('devuelve 100% con perfil completo', () => {
    const r = getProfileCompleteness(FULL_PROFILE)
    expect(r.pct).toBe(100)
    expect(r.tasks.every(t => t.done)).toBe(true)
  })

  it('incluye la tarea de fecha de nacimiento', () => {
    const r = getProfileCompleteness({ ...FULL_PROFILE, fecha_nacimiento: '' })
    expect(r.tasks.find(t => t.key === 'fecha_nacimiento')?.done).toBe(false)
  })

  it('cuenta ubicación si hay país O ciudad', () => {
    const onlyCity = getProfileCompleteness({ ...FULL_PROFILE, pais: '', ciudad: 'Lima' })
    expect(onlyCity.tasks.find(t => t.key === 'ubicacion')?.done).toBe(true)
    const onlyCountry = getProfileCompleteness({ ...FULL_PROFILE, pais: 'PE', ciudad: '' })
    expect(onlyCountry.tasks.find(t => t.key === 'ubicacion')?.done).toBe(true)
  })

  it('exige al menos 2 redes sociales', () => {
    const one = getProfileCompleteness({ ...FULL_PROFILE, instagram_url: '' })
    expect(one.tasks.find(t => t.key === 'sociales')?.done).toBe(false)

    const two = getProfileCompleteness({ ...FULL_PROFILE, instagram_url: '', facebook_url: 'https://fb.com/x' })
    expect(two.tasks.find(t => t.key === 'sociales')?.done).toBe(true)
  })

  it('ignora cadenas vacías o solo espacios', () => {
    const r = getProfileCompleteness({ ...FULL_PROFILE, biografia: '   ' })
    expect(r.tasks.find(t => t.key === 'biografia')?.done).toBe(false)
  })

  it('requiere nombre Y apellido', () => {
    const sinApellido = getProfileCompleteness({ ...FULL_PROFILE, apellido: '' })
    expect(sinApellido.tasks.find(t => t.key === 'nombre')?.done).toBe(false)
  })
})

describe('isStaffRole', () => {
  it('reconoce roles de staff', () => {
    for (const r of ['superadmin', 'admin', 'editor', 'empleado']) {
      expect(isStaffRole(r)).toBe(true)
    }
  })

  it('no considera staff a cliente/usuario/vacío', () => {
    for (const r of ['cliente', 'usuario', '', null, undefined]) {
      expect(isStaffRole(r as string | null | undefined)).toBe(false)
    }
  })
})

describe('requiresProfileCompletion (regresión del gating)', () => {
  it('umbral: 5/7 (71%) bloquea y 6/7 (86%) permite (con fecha)', () => {
    const cinco = { nombre: 'A', apellido: 'B', fecha_nacimiento: '1990-01-01', telefono: '1', pais: 'PE', biografia: 'bio' }
    expect(getProfileCompleteness(cinco).pct).toBe(71)
    expect(requiresProfileCompletion({ rol: 'cliente', profileLoaded: true, profile: cinco })).toBe(true)

    const seis = { ...cinco, avatar_url: 'x' }
    expect(getProfileCompleteness(seis).pct).toBe(86)
    expect(requiresProfileCompletion({ rol: 'cliente', profileLoaded: true, profile: seis })).toBe(false)
  })

  it('la fecha de nacimiento es OBLIGATORIA aunque el % sea alto', () => {
    const sinFecha = {
      avatar_url: 'x', nombre: 'A', apellido: 'B', telefono: '1', pais: 'PE',
      biografia: 'bio', website_url: 'a', instagram_url: 'b',
    }
    expect(getProfileCompleteness(sinFecha).pct).toBe(86)
    expect(requiresProfileCompletion({ rol: 'cliente', profileLoaded: true, profile: sinFecha })).toBe(true)
  })

  it('fail-open: si no se pudo leer el perfil, NO bloquea', () => {
    expect(requiresProfileCompletion({ rol: 'cliente', profileLoaded: false, profile: null })).toBe(false)
    expect(requiresProfileCompletion({ rol: 'cliente', profileLoaded: false, profile: {} })).toBe(false)
  })

  it('staff nunca se bloquea aunque el perfil esté vacío', () => {
    for (const rol of ['superadmin', 'admin', 'editor', 'empleado']) {
      expect(requiresProfileCompletion({ rol, profileLoaded: true, profile: {} })).toBe(false)
    }
  })

  it('cliente con perfil vacío sí se bloquea', () => {
    expect(requiresProfileCompletion({ rol: 'cliente', profileLoaded: true, profile: {} })).toBe(true)
  })

  it('rol desconocido o ausente se trata como no-staff', () => {
    expect(requiresProfileCompletion({ rol: undefined, profileLoaded: true, profile: {} })).toBe(true)
    expect(requiresProfileCompletion({ rol: 'usuario', profileLoaded: true, profile: {} })).toBe(true)
  })

  it('el umbral es 80 (no cambiar sin actualizar este test)', () => {
    expect(PROFILE_MIN_PCT).toBe(80)
  })
})
