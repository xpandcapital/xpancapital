export const dynamic = 'force-dynamic';
import { LegalPage } from "@/components/legal/LegalPage"
import type { LegalPageData } from "@/components/legal/LegalPage"

const data: LegalPageData = {
  hero: {
    title: "Política de Cookies",
    subtitle: "Cómo utilizamos cookies y tecnologías similares",
    lastUpdated: "01/05/2026",
    icon: "cookie",
  },
  articles: [
    {
      title: "1. ¿Qué son las Cookies?",
      icon: "book",
      content: `<p>Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo (ordenador, tableta, teléfono móvil) cuando usted los visita. Las cookies permiten que el sitio web recuerde información sobre su visita, como sus preferencias de idioma, contenido del carrito de compras, y estado de sesión.</p>`,
    },
    {
      title: "2. Tipos de Cookies que Utilizamos",
      icon: "file",
      content: `<p><strong>Cookies Esenciales (Técnicas):</strong></p>
<ul>
  <li>Cookie de sesión de Supabase (autenticación)</li>
  <li>Cookie de carrito de compras</li>
  <li>Cookie de preferencias de consentimiento</li>
</ul>
<p>Estas cookies son necesarias para el funcionamiento básico de la Plataforma y no pueden desactivarse.</p>

<p><strong>Cookies Analíticas:</strong></p>
<ul>
  <li>Google Analytics (_ga, _gid): medición de tráfico y comportamiento</li>
  <li>Hotjar (_hj*): mapas de calor y grabaciones de sesión</li>
</ul>
<p>Estas cookies nos ayudan a entender cómo utilizan los usuarios la Plataforma para mejorar su experiencia.</p>

<p><strong>Cookies Funcionales:</strong></p>
<ul>
  <li>Preferencias de idioma y moneda</li>
  <li>Últimos productos vistos</li>
  <li>Estado de tutoriales y guías</li>
</ul>`,
    },
    {
      title: "3. Cookies de Terceros",
      icon: "shield",
      content: `<p>Algunos servicios de terceros que utilizamos pueden instalar sus propias cookies:</p>
<ul>
  <li><strong>Procesadores de pago:</strong> Cookies de seguridad para prevenir fraudes</li>
  <li><strong>Google:</strong> Analytics, reCAPTCHA</li>
  <li><strong>Meta (Facebook):</strong> Pixel de seguimiento de conversiones</li>
</ul>
<p>No tenemos control sobre las cookies de terceros. Le recomendamos revisar las políticas de privacidad de estos servicios.</p>`,
    },
    {
      title: "4. Cómo Gestionar las Cookies",
      icon: "check",
      content: `<p>Usted puede controlar y gestionar las cookies de varias maneras:</p>
<ul>
  <li><strong>Configuración del navegador:</strong> La mayoría de los navegadores permiten bloquear o eliminar cookies (consulte la sección de ayuda de su navegador)</li>
  <li><strong>Panel de preferencias:</strong> Al visitar nuestro sitio por primera vez, puede aceptar o rechazar cookies no esenciales</li>
  <li><strong>Herramientas de terceros:</strong> Puede optar por no participar en Google Analytics instalando el complemento de inhabilitación</li>
</ul>
<p><strong>Tenga en cuenta que deshabilitar cookies esenciales puede afectar el funcionamiento de la Plataforma.</strong></p>`,
    },
    {
      title: "5. Actualizaciones de esta Política",
      content: `<p>Esta Política de Cookies puede ser actualizada para reflejar cambios en nuestras prácticas o en la legislación aplicable. Le recomendamos revisar esta página periódicamente.</p>`,
    },
  ],
  sidebar: { enabled: true, position: "left" },
}

export default function CookiesPage() {
  return <LegalPage data={data} slug="cookies" />
}
