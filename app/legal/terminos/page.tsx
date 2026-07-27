export const dynamic = 'force-dynamic';
import { LegalPage } from "@/components/legal/LegalPage"
import type { LegalPageData } from "@/components/legal/LegalPage"

const data: LegalPageData = {
  hero: {
    title: "Términos y Condiciones",
    subtitle: "Última actualización: 01 de mayo de 2026",
    lastUpdated: "01/05/2026",
    icon: "scale",
  },
  articles: [
    {
      title: "1. Aceptación de los Términos",
      icon: "check",
      content: `<p>Al acceder y utilizar el sitio web <strong>xpancapital.org</strong> (en adelante, "la Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar la Plataforma.</p>
<p>Xpand Capital S.A.C. se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación. El uso continuado de la Plataforma constituye la aceptación de dichas modificaciones.</p>`,
    },
    {
      title: "2. Descripción del Servicio — Contenido Educativo Digital",
      icon: "book",
      content: `<p><strong>Xpand Capital S.A.C.</strong>, a través de su plataforma digital xpancapital.org, se dedica <strong>exclusivamente a la comercialización de contenido educativo digital</strong>, incluyendo pero no limitado a:</p>
<ul>
  <li>Ebooks y guías prácticas para emprendedores</li>
  <li>Cursos en línea sobre inversión, desarrollo inmobiliario y negocios</li>
  <li>Asesorías y mentorías empresariales personalizadas</li>
  <li>Herramientas digitales, plantillas y recursos descargables</li>
  <li>Membresías de acceso a contenido premium</li>
</ul>
<p><strong>Las actividades de intermediación y venta inmobiliaria se gestionan únicamente por canales offline y presenciales</strong>, conforme a lo requerido por las entidades reguladoras, a través de nuestro Oficial de Cumplimiento. Está terminantemente prohibido todo tipo de transacción inmobiliaria mediante pasarelas de pago digitales sin haber superado previamente los filtros y requisitos que las entidades reguladoras exigen.</p>`,
    },
    {
      title: "3. Registro de Cuenta",
      icon: "file",
      content: `<p>Para acceder a ciertos contenidos o realizar compras, es posible que deba crear una cuenta. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta.</p>
<p>Debe proporcionar información precisa, actualizada y completa durante el proceso de registro. Xpand Capital S.A.C. se reserva el derecho de suspender o cancelar cuentas que proporcionen información falsa o incompleta.</p>`,
    },
    {
      title: "4. Compras y Pagos",
      icon: "file",
      content: `<p>Los pagos realizados en la Plataforma se procesan a través de pasarelas de pago de terceros. Xpand Capital S.A.C. no almacena datos de tarjetas de crédito o débito.</p>
<p>Todos los precios están expresados en <strong>dólares estadounidenses (USD)</strong> e incluyen los impuestos aplicables según la legislación peruana, a menos que se indique lo contrario.</p>
<p>Al realizar una compra, usted acepta que el procesador de pago pueda verificar su información y autorizar la transacción. Xpand Capital S.A.C. no es responsable de demoras o rechazos por parte del procesador de pago.</p>`,
    },
    {
      title: "5. Productos Digitales — Acceso y Licencia",
      icon: "book",
      content: `<p>Los productos digitales adquiridos a través de la Plataforma (ebooks, cursos, plantillas, etc.) se entregan mediante acceso a su cuenta de miembro o vía descarga directa.</p>
<p>Al adquirir un producto digital, se le otorga una <strong>licencia de uso personal, no exclusiva e intransferible</strong>. Está prohibida la redistribución, reventa, modificación o creación de obras derivadas sin autorización expresa por escrito de Xpand Capital S.A.C.</p>
<p>El acceso a los cursos y membresías es personal e intransferible. Compartir credenciales de acceso constituye una violación de estos términos y puede resultar en la cancelación de su cuenta.</p>`,
    },
    {
      title: "6. Propiedad Intelectual",
      icon: "shield",
      content: `<p>Todo el contenido de la Plataforma, incluyendo textos, gráficos, logotipos, imágenes, videos, software, y la disposición de los mismos, es propiedad exclusiva de Xpand Capital S.A.C. o de sus licenciantes y está protegido por las leyes de propiedad intelectual de Perú y tratados internacionales.</p>
<p>Las marcas "Xpand Capital", el logotipo y cualquier otra marca registrada son propiedad de Xpand Capital S.A.C.</p>`,
    },
    {
      title: "7. Limitación de Responsabilidad",
      icon: "alert",
      content: `<p>Xpand Capital S.A.C. no será responsable por daños directos, indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar la Plataforma o los productos adquiridos.</p>
<p>El contenido educativo proporcionado es de carácter informativo y no constituye asesoramiento financiero, legal o fiscal profesional. Se recomienda consultar con un profesional calificado antes de tomar decisiones de inversión.</p>`,
    },
    {
      title: "8. Ley Aplicable y Jurisdicción",
      icon: "scale",
      content: `<p>Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. Cualquier disputa relacionada con estos términos será sometida a la jurisdicción exclusiva de los tribunales de Colombia.</p>
<p>Para usuarios residentes en Ecuador, se aplicarán las disposiciones de protección al consumidor establecidas en la legislación ecuatoriana que resulten aplicables.</p>`,
    },
    {
      title: "9. Contacto",
      icon: "file",
      content: `<p>Para cualquier consulta relacionada con estos Términos y Condiciones, puede contactarnos a través de:</p>
<ul>
  <li><strong>Email:</strong> info@xpancapital.org</li>
  <li><strong>WhatsApp:</strong> +57 322 350 1170</li>
  <li><strong>Dirección:</strong> Colombia · Latam</li>
</ul>`,
    },
  ],
  sidebar: { enabled: true, position: "left" },
}

export default function TerminosPage() {
  return <LegalPage data={data} slug="terminos" />
}

