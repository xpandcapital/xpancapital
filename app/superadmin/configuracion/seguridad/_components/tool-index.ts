import type { SecurityToolDef } from '../_types'

export const SECURITY_TOOLS: SecurityToolDef[] = [
  {
    id: 'geobloqueo',
    name: 'Geobloqueo',
    description: 'Control de acceso por país usando Vercel Edge Network',
    cat: 'Control de Acceso',
    icon: 'Shield',
    status: 'active',
    configKey: 'geobloqueo',
  },
  {
    id: 'rate_limiting',
    name: 'Rate Limiting',
    description: 'Límite de peticiones por IP para prevenir abusos',
    cat: 'Protección Web',
    icon: 'Gauge',
    status: 'coming_soon',
    configKey: 'rate_limiting',
  },
  {
    id: 'firewall',
    name: 'Firewall',
    description: 'Reglas de firewall personalizadas por ruta',
    cat: 'Protección Web',
    icon: 'Wall',
    status: 'coming_soon',
    configKey: 'firewall',
  },
  {
    id: 'access_logs',
    name: 'Logs de Acceso',
    description: 'Registro y monitoreo de visitas al sitio',
    cat: 'Monitoreo',
    icon: 'ScrollText',
    status: 'coming_soon',
    configKey: 'access_logs',
  },
  {
    id: 'alerts',
    name: 'Alertas',
    description: 'Notificaciones ante intentos de acceso bloqueados',
    cat: 'Monitoreo',
    icon: 'Bell',
    status: 'coming_soon',
    configKey: 'alerts',
  },
]
