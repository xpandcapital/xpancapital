export const dynamic = 'force-dynamic';
import { LegalPage } from "@/components/legal/LegalPage"
import type { LegalPageData } from "@/components/legal/LegalPage"

const data: LegalPageData = {
  hero: {
    title: "Política de Privacidad",
    subtitle: "Cómo protegemos y manejamos su información personal",
    lastUpdated: "01/05/2026",
    icon: "shield",
  },
  articles: [
    {
      title: "1. Responsable del Tratamiento",
      icon: "file",
      content: `<p><strong>XPAND CORP S.A.C.</strong>, con domicilio en la ciudad de Arequipa, Perú, es el responsable del tratamiento de sus datos personales. Puede contactar a nuestro Delegado de Protección de Datos en: <strong>privacidad@xpancapital.org</strong></p>`,
    },
    {
      title: "2. Datos que Recolectamos",
      icon: "file",
      content: `<p>Recolectamos los siguientes tipos de información:</p>
<ul>
  <li><strong>Información de cuenta:</strong> nombre, apellido, dirección de correo electrónico, número de teléfono</li>
  <li><strong>Información de compra:</strong> historial de transacciones, productos adquiridos, método de pago (procesado por terceros)</li>
  <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas, tiempo de permanencia</li>
  <li><strong>Datos de marketing:</strong> preferencias de comunicación, interacciones con campañas de email</li>
  <li><strong>Contenido generado por el usuario:</strong> comentarios, reseñas, formularios de contacto</li>
</ul>`,
    },
    {
      title: "3. Finalidad del Tratamiento",
      icon: "book",
      content: `<p>Utilizamos sus datos para las siguientes finalidades:</p>
<ul>
  <li>Procesar y entregar sus compras de contenido educativo digital</li>
  <li>Crear y gestionar su cuenta de usuario</li>
  <li>Enviar comunicaciones relacionadas con su cuenta y transacciones</li>
  <li>Enviar newsletters y contenido promocional (con su consentimiento)</li>
  <li>Mejorar y personalizar su experiencia en la Plataforma</li>
  <li>Cumplir con obligaciones legales y regulatorias</li>
  <li>Prevenir fraudes y garantizar la seguridad de la Plataforma</li>
</ul>`,
    },
    {
      title: "4. Base Legal",
      icon: "scale",
      content: `<p>El tratamiento de sus datos se realiza sobre las siguientes bases legales:</p>
<ul>
  <li><strong>Ejecución contractual:</strong> Para procesar sus compras y proporcionar los servicios contratados</li>
  <li><strong>Consentimiento:</strong> Para el envío de comunicaciones comerciales y el uso de cookies no esenciales</li>
  <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y prevenir fraudes</li>
  <li><strong>Obligación legal:</strong> Para cumplir con requerimientos fiscales y regulatorios</li>
</ul>`,
    },
    {
      title: "5. Terceros y Transferencias",
      icon: "shield",
      content: `<p>Compartimos datos con los siguientes tipos de terceros:</p>
<ul>
  <li><strong>Procesadores de pago:</strong> Para procesar transacciones (no almacenamos datos de tarjetas)</li>
  <li><strong>Proveedores de infraestructura:</strong> Alojamiento web, bases de datos, email</li>
  <li><strong>Herramientas de análisis:</strong> Para entender el uso de la Plataforma</li>
  <li><strong>Autoridades competentes:</strong> Cuando sea requerido por ley</li>
</ul>
<p>Todos los terceros están sujetos a acuerdos de confidencialidad y protección de datos.</p>`,
    },
    {
      title: "6. Sus Derechos (ARCO)",
      icon: "check",
      content: `<p>Usted tiene los siguientes derechos sobre sus datos personales:</p>
<ul>
  <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre usted</li>
  <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
  <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios</li>
  <li><strong>Oposición:</strong> Oponerse al tratamiento para fines de marketing</li>
  <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
</ul>
<p>Para ejercer estos derechos, envíe un email a <strong>privacidad@xpancapital.org</strong>. Responderemos en un plazo máximo de 20 días hábiles.</p>`,
    },
    {
      title: "7. Seguridad y Retención",
      icon: "shield",
      content: `<p>Implementamos medidas técnicas y organizativas para proteger sus datos contra accesos no autorizados, pérdida o alteración. Estas incluyen cifrado SSL, autenticación de dos factores para acceso administrativo, y auditorías periódicas de seguridad.</p>
<p>Conservamos sus datos personales durante el tiempo necesario para cumplir con las finalidades descritas y las obligaciones legales aplicables. Los datos de cuenta se conservan mientras la cuenta permanezca activa.</p>`,
    },
    {
      title: "8. Cambios a esta Política",
      content: `<p>Podemos actualizar esta Política de Privacidad periódicamente. La fecha de última actualización se refleja al inicio de este documento. Le notificaremos cambios significativos a través de la Plataforma o por correo electrónico.</p>`,
    },
  ],
  sidebar: { enabled: true, position: "left" },
}

export default function PrivacidadPage() {
  return <LegalPage data={data} slug="privacidad" />
}


