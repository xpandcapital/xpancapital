export interface CertificateElement {
  id: string
  type: 'name' | 'course' | 'date' | 'qr'
  x: number
  y: number
  fontSize: number
  color: string
  fontWeight: string
}

export interface CertificateTemplate {
  id: string
  title: string
  description: string
  backgroundImage: string | null
  elements: CertificateElement[]
}

export interface DBTemplate {
  id: string
  nombre: string
  descripcion?: string
  ancho: number
  alto: number
  color_fondo: string
  color_primario: string
  color_secundario: string
  color_texto: string
  color_texto_secundario: string
  tamano_titulo: number
  tamano_cuerpo: number
  posicion_nombre: { x: number; y: number }
  posicion_curso: { x: number; y: number }
  posicion_fecha: { x: number; y: number }
  posicion_codigo: { x: number; y: number }
  logo_url?: string
  fondo_url?: string
  firma_url?: string
  texto_titulo: string
  texto_subtitulo: string
  texto_completado: string
  texto_fecha: string
  texto_firma: string
  activo: boolean
  elementos?: CertificateElement[]
}

export function dbToLocal(db: DBTemplate): CertificateTemplate {
  if (db.elementos && db.elementos.length > 0) {
    return {
      id: db.id,
      title: db.nombre,
      description: db.descripcion || '',
      backgroundImage: db.fondo_url || null,
      elements: db.elementos.map(el => ({
        ...el,
        fontSize: el.fontSize || 32
      }))
    }
  }
  
  return {
    id: db.id,
    title: db.nombre,
    description: db.descripcion || '',
    backgroundImage: db.fondo_url || null,
    elements: [
      {
        id: 'name',
        type: 'name',
        x: db.posicion_nombre?.x || 50,
        y: db.posicion_nombre?.y || 40,
        fontSize: db.tamano_titulo || 48,
        color: db.color_texto || '#ffffff',
        fontWeight: '900'
      },
      {
        id: 'course',
        type: 'course',
        x: db.posicion_curso?.x || 50,
        y: db.posicion_curso?.y || 55,
        fontSize: db.tamano_cuerpo ? Math.max(db.tamano_cuerpo, 24) : 32,
        color: db.color_primario || '#B10D24',
        fontWeight: '700'
      },
      {
        id: 'date',
        type: 'date',
        x: db.posicion_fecha?.x || 30,
        y: db.posicion_fecha?.y || 80,
        fontSize: db.tamano_cuerpo || 16,
        color: db.color_texto_secundario || '#9ca3af',
        fontWeight: '600'
      },
      {
        id: 'qr',
        type: 'qr',
        x: db.posicion_codigo?.x || 85,
        y: db.posicion_codigo?.y || 90,
        fontSize: 80,
        color: '#000000',
        fontWeight: 'normal'
      }
    ]
  }
}

export function localToDb(local: CertificateTemplate): Partial<DBTemplate> {
  const nameEl = local.elements.find(e => e.type === 'name')
  const courseEl = local.elements.find(e => e.type === 'course')
  const dateEl = local.elements.find(e => e.type === 'date')
  const qrEl = local.elements.find(e => e.type === 'qr')

  return {
    nombre: local.title,
    descripcion: local.description,
    ancho: 297,
    alto: 210,
    color_fondo: '#0a0a0a',
    color_primario: courseEl?.color || '#B10D24',
    color_secundario: '#10B981',
    color_texto: nameEl?.color || '#ffffff',
    color_texto_secundario: dateEl?.color || '#9ca3af',
    tamano_titulo: nameEl?.fontSize || 48,
    tamano_cuerpo: dateEl?.fontSize || 16,
    posicion_nombre: { x: nameEl?.x || 50, y: nameEl?.y || 40 },
    posicion_curso: { x: courseEl?.x || 50, y: courseEl?.y || 55 },
    posicion_fecha: { x: dateEl?.x || 30, y: dateEl?.y || 80 },
    posicion_codigo: { x: qrEl?.x || 85, y: qrEl?.y || 90 },
    fondo_url: local.backgroundImage || undefined,
    elementos: local.elements,
    activo: true
  }
}

export const createNewTemplate = (): CertificateTemplate => ({
  id: 'new',
  title: 'Nueva Plantilla',
  description: 'Configura el diseño de tus certificados.',
  backgroundImage: null,
  elements: [
    { id: 'name', type: 'name', x: 50, y: 40, fontSize: 48, color: '#ffffff', fontWeight: '900' },
    { id: 'course', type: 'course', x: 50, y: 55, fontSize: 32, color: '#B10D24', fontWeight: '700' },
    { id: 'date', type: 'date', x: 30, y: 80, fontSize: 16, color: '#9ca3af', fontWeight: '600' },
    { id: 'qr', type: 'qr', x: 85, y: 90, fontSize: 80, color: '#000000', fontWeight: 'normal' }
  ]
})