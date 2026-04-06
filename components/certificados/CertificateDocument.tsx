import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCrl508MvS7OjXtS5hQ.eot',
      fontWeight: 400
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCrl508MvS7OjXtS5hQ.eot',
      fontWeight: 600
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCrl508MvS7OjXtS5hQ.eot',
      fontWeight: 800
    }
  ]
})

interface CertificateTemplate {
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
  fuente_titulo: string
  fuente_cuerpo: string
  tamano_titulo: number
  tamano_cuerpo: number
  posicion_nombre: { x: number; y: number }
  posicion_curso: { x: number; y: number }
  posicion_fecha: { x: number; y: number }
  posicion_codigo: { x: number; y: number }
  posicion_logo: { x: number; y: number }
  posicion_firma: { x: number; y: number }
  logo_url?: string
  fondo_url?: string
  sello_url?: string
  firma_url?: string
  texto_titulo: string
  texto_subtitulo: string
  texto_completado: string
  texto_fecha: string
  texto_firma: string
}

interface CertificateData {
  nombre: string
  cursoNombre: string
  fechaEmision: string
  codigoVerificacion: string
  horas?: number
}

const createStyles = (template: CertificateTemplate) => {
  const mmToPoints = (mm: number) => mm * 2.83465
  
  return StyleSheet.create({
    page: {
      width: mmToPoints(template.ancho),
      height: mmToPoints(template.alto),
      backgroundColor: template.color_fondo,
      position: 'relative',
      overflow: 'hidden'
    },
    background: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0
    },
    container: {
      position: 'relative',
      width: '100%',
      height: '100%',
      zIndex: 10,
      padding: 40
    },
    title: {
      fontFamily: template.fuente_titulo,
      fontSize: template.tamano_titulo,
      fontWeight: 800,
      color: template.color_primario,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 4
    },
    subtitle: {
      fontFamily: template.fuente_cuerpo,
      fontSize: template.tamano_cuerpo + 2,
      color: template.color_texto_secundario,
      textAlign: 'center',
      marginTop: 20
    },
    name: {
      fontFamily: template.fuente_titulo,
      fontSize: template.tamano_titulo - 4,
      fontWeight: 600,
      color: template.color_texto,
      textAlign: 'center',
      marginTop: 30
    },
    course: {
      fontFamily: template.fuente_cuerpo,
      fontSize: template.tamano_titulo - 12,
      fontWeight: 600,
      color: template.color_secundario,
      textAlign: 'center',
      marginTop: 10
    },
    completedText: {
      fontFamily: template.fuente_cuerpo,
      fontSize: template.tamano_cuerpo,
      color: template.color_texto_secundario,
      textAlign: 'center',
      marginTop: 15
    },
    dateContainer: {
      position: 'absolute',
      bottom: 80,
      left: 60
    },
    dateLabel: {
      fontFamily: template.fuente_cuerpo,
      fontSize: template.tamano_cuerpo - 4,
      color: template.color_texto_secundario,
      marginBottom: 5
    },
    dateValue: {
      fontFamily: template.fuente_cuerpo,
      fontSize: template.tamano_cuerpo,
      fontWeight: 600,
      color: template.color_texto
    },
    codeContainer: {
      position: 'absolute',
      bottom: 40,
      right: 60
    },
    codeLabel: {
      fontFamily: template.fuente_cuerpo,
      fontSize: template.tamano_cuerpo - 6,
      color: template.color_texto_secundario,
      textAlign: 'right'
    },
    codeValue: {
      fontFamily: 'Courier',
      fontSize: template.tamano_cuerpo - 4,
      fontWeight: 600,
      color: template.color_texto
    },
    logo: {
      position: 'absolute',
      top: 40,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 120,
      height: 'auto'
    },
    signatureContainer: {
      position: 'absolute',
      bottom: 80,
      right: 60,
      alignItems: 'center'
    },
    signatureLine: {
      width: 150,
      height: 1,
      backgroundColor: template.color_texto,
      marginBottom: 5
    },
    signatureText: {
      fontFamily: template.fuente_cuerpo,
      fontSize: template.tamano_cuerpo - 4,
      color: template.color_texto,
      textAlign: 'center'
    },
    signatureRole: {
      fontFamily: template.fuente_cuerpo,
      fontSize: template.tamano_cuerpo - 6,
      color: template.color_texto_secundario,
      marginTop: 2
    },
    border: {
      position: 'absolute',
      top: 15,
      left: 15,
      right: 15,
      bottom: 15,
      borderWidth: 2,
      borderColor: template.color_primario,
      borderRadius: 8
    },
    decorativeCorner: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderTopWidth: 4,
      borderLeftWidth: 4,
      borderColor: template.color_primario
    }
  })
}

interface CertificateDocumentProps {
  template: CertificateTemplate
  data: CertificateData
}

export function CertificateDocument({ template, data }: CertificateDocumentProps) {
  const styles = createStyles(template)
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Document>
      <Page size={[template.ancho * 2.83465, template.alto * 2.83465]} style={styles.page}>
        {template.fondo_url && (
          <Image src={template.fondo_url} style={styles.background} />
        )}
        
        <View style={styles.border}>
          <View style={[styles.decorativeCorner, { top: 15, left: 15 }]} />
          <View style={[styles.decorativeCorner, { top: 15, right: 15, transform: 'rotate(90deg)' }]} />
          <View style={[styles.decorativeCorner, { bottom: 15, left: 15, transform: 'rotate(-90deg)' }]} />
          <View style={[styles.decorativeCorner, { bottom: 15, right: 15, transform: 'rotate(180deg)' }]} />
        </View>

        {template.logo_url && (
          <Image src={template.logo_url} style={styles.logo} />
        )}

        <View style={styles.container}>
          <View style={{ marginTop: 60 }}>
            <Text style={styles.title}>{template.texto_titulo}</Text>
            <Text style={styles.subtitle}>{template.texto_subtitulo}</Text>
            <Text style={styles.name}>{data.nombre}</Text>
            <Text style={styles.completedText}>{template.texto_completado}</Text>
            <Text style={styles.course}>{data.cursoNombre}</Text>
            
            {data.horas && data.horas > 0 && (
              <Text style={styles.completedText}>
                con una duración de {data.horas} horas académicas
              </Text>
            )}
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>{template.texto_fecha}:</Text>
          <Text style={styles.dateValue}>{formatDate(data.fechaEmision)}</Text>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Código de verificación:</Text>
          <Text style={styles.codeValue}>{data.codigoVerificacion}</Text>
        </View>

        {template.firma_url ? (
          <View style={styles.signatureContainer}>
            <Image src={template.firma_url} style={{ width: 120, height: 60 }} />
            <Text style={styles.signatureText}>{template.texto_firma}</Text>
          </View>
        ) : (
          <View style={styles.signatureContainer}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>{template.texto_firma}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}

export type { CertificateTemplate, CertificateData }