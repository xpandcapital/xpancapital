"use client"

import { usePathname } from 'next/navigation'
import { PermissionGuard } from '@/components/ui/PermissionGuard'

const PATH_TO_SECTION: Record<string, string> = {
  '/superadmin': 'dashboard:ver',
  '/superadmin/dashboard': 'dashboard:ver',
  '/superadmin/proyectos': 'proyectos:ver',
  '/superadmin/gestion-lotes': 'lotes:ver',
  '/superadmin/contratos': 'contratos:ver',
  '/superadmin/asesores': 'asesores:ver',
  '/superadmin/pos': 'pos:ver',
  '/superadmin/ventas': 'ventas:ver',
  '/superadmin/formasdepago': 'formasdepago:ver',
  '/superadmin/productos': 'productos:ver',
  '/superadmin/clientes': 'clientes:ver',
  '/superadmin/cursos': 'cursos:ver',
  '/superadmin/biblioteca': 'biblioteca:ver',
  '/superadmin/certificados': 'certificados:ver',
  '/superadmin/mis-capacitaciones': 'capacitaciones:ver',
  '/superadmin/trading': 'trading:ver',
  '/superadmin/templates': 'templates:ver',
  '/superadmin/mails': 'mails:ver',
  '/superadmin/calendarios': 'calendarios:ver',
  '/superadmin/formularios': 'formularios:ver',
  '/superadmin/leads': 'leads:ver',
  '/superadmin/campanas': 'campanas:ver',
  '/superadmin/blog': 'blog:ver',
  '/superadmin/usuarios': 'equipo:ver',
  '/superadmin/postulantes': 'postulantes:ver',
  '/superadmin/utilidades': 'utilidades:ver',
  '/superadmin/configuracion': 'configuracion:ver',
  '/superadmin/api-nube': 'api-nube:ver',
  '/superadmin/analiticas': 'analiticas:ver',
  '/superadmin/ajustes/comercio': 'ajustes:ver',
  '/superadmin/ajustes/roles': 'roles:ver',
  '/superadmin/perfil': 'perfil:ver',
  '/superadmin/integraciones': 'configuracion:ver',
  '/superadmin/chat': 'chat:ver',
  '/superadmin/correo': 'correo:ver',
  '/superadmin/notificaciones': 'notificaciones:ver',
  '/superadmin/transmisiones': 'transmisiones:ver',
  '/superadmin/whatsapp': 'campanas:ver',
  '/superadmin/blog/rutas': 'blog:ver',
  '/superadmin/configuracion/seguridad': 'configuracion:ver',
  '/superadmin/configuracion/correo': 'configuracion:ver',
  '/superadmin/productos/entregas': 'productos:ver',
}

function getSectionFromPath(pathname: string): string | null {
  if (PATH_TO_SECTION[pathname]) return PATH_TO_SECTION[pathname]
  const sortedKeys = Object.keys(PATH_TO_SECTION).sort((a, b) => b.length - a.length)
  for (const key of sortedKeys) {
    if (pathname.startsWith(key)) return PATH_TO_SECTION[key]
  }
  return null
}

export function SuperadminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/superadmin/acceso') return <>{children}</>
  if (pathname === '/superadmin/perfil') return <>{children}</>

  const section = getSectionFromPath(pathname)

  if (!section) return <>{children}</>

  return (
    <PermissionGuard section={section}>
      {children}
    </PermissionGuard>
  )
}