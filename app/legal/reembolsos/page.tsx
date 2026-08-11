export const dynamic = 'force-dynamic';
import { LegalPage } from "@/components/legal/LegalPage"
import type { LegalPageData } from "@/components/legal/LegalPage"

const data: LegalPageData = {
  hero: {
    title: "Política de Reembolsos",
    subtitle: "Condiciones y procedimiento para solicitar devoluciones",
    lastUpdated: "01/05/2026",
    icon: "shield",
  },
  articles: [
    {
      title: "1. Productos Digitales — No Reembolsables por Naturaleza",
      icon: "book",
      content: `<p>Debido a la naturaleza de los productos digitales (acceso inmediato e irrevocable al contenido), <strong>las compras de productos digitales no son reembolsables</strong>, incluyendo pero no limitado a:</p>
<ul>
  <li>Ebooks y guías descargables</li>
  <li>Cursos en línea y lecciones grabadas</li>
  <li>Plantillas y herramientas digitales</li>
  <li>Membresías y suscripciones</li>
</ul>
<p>Al realizar una compra, usted reconoce y acepta esta política.</p>`,
    },
    {
      title: "2. Excepciones",
      icon: "alert",
      content: `<p>Se considerarán solicitudes de reembolso en los siguientes casos excepcionales:</p>
<ul>
  <li><strong>Error técnico comprobable:</strong> El producto no se puede acceder o descargar debido a un fallo técnico atribuible a nuestra plataforma, y el problema no se resuelve en un plazo de 72 horas desde su reporte</li>
  <li><strong>Producto no entregado:</strong> La compra fue procesada pero el acceso al producto no se habilitó en su cuenta</li>
  <li><strong>Cobro duplicado:</strong> Se realizó más de un cargo por el mismo producto</li>
  <li><strong>Producto incorrecto:</strong> Recibió acceso a un producto diferente al que compró</li>
</ul>`,
    },
    {
      title: "3. Productos Físicos",
      icon: "file",
      content: `<p>Para productos físicos (kits, materiales impresos, etc.):</p>
<ul>
  <li>Dispone de <strong>7 días calendario</strong> desde la recepción del producto para solicitar una devolución</li>
  <li>El producto debe estar en su estado original, sin usar y en su empaque original</li>
  <li>Los gastos de envío de la devolución son por cuenta del comprador, salvo que el producto llegue defectuoso o incorrecto</li>
</ul>`,
    },
    {
      title: "4. Proceso de Solicitud",
      icon: "check",
      content: `<p>Para solicitar un reembolso:</p>
<ol>
  <li>Envíe un email a <strong>soporte@xpandcapital.org</strong> con el asunto "Solicitud de Reembolso — [Número de Orden]"</li>
  <li>Incluya su número de orden, el producto adquirido y una descripción detallada del motivo</li>
  <li>Adjunte cualquier evidencia relevante (capturas de pantalla, recibos, etc.)</li>
  <li>Nuestro equipo revisará su solicitud en un plazo de <strong>5 días hábiles</strong></li>
  <li>Recibirá una respuesta por email con la resolución de su caso</li>
</ol>`,
    },
    {
      title: "5. Método de Reembolso",
      icon: "file",
      content: `<p>Los reembolsos aprobados se procesarán a través del mismo método de pago utilizado en la compra original. El tiempo que tarda en reflejarse el reembolso depende del procesador de pago y de su entidad financiera, pudiendo tomar entre 5 y 15 días hábiles.</p>`,
    },
    {
      title: "6. Cancelación de Suscripciones",
      content: `<p>Las suscripciones y membresías pueden cancelarse en cualquier momento desde su panel de cuenta. La cancelación será efectiva al final del período de facturación actual. No se realizan reembolsos parciales por períodos no utilizados.</p>`,
    },
  ],
  sidebar: { enabled: true, position: "left" },
}

export default function ReembolsosPage() {
  return <LegalPage data={data} slug="reembolsos" />
}

