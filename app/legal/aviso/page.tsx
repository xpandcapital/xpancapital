import { LegalPage } from "@/components/legal/LegalPage"
import type { LegalPageData } from "@/components/legal/LegalPage"

const data: LegalPageData = {
  hero: {
    title: "Aviso Legal",
    subtitle: "Información legal y corporativa de BLIS CORP S.A.C.",
    lastUpdated: "01/05/2026",
    icon: "alert",
  },
  articles: [
    {
      title: "1. Identificación del Titular",
      icon: "file",
      content: `<p>En cumplimiento de la legislación aplicable, se informa a los usuarios de la Plataforma los siguientes datos del titular:</p>
<ul>
  <li><strong>Denominación Social:</strong> BLIS CORP S.A.C.</li>
  <li><strong>Número de Partida Registral:</strong> 11449191</li>
  <li><strong>Zona Registral:</strong> N° XII - Oficina Registral Arequipa</li>
  <li><strong>Fecha de Constitución:</strong> 27 de julio de 2020</li>
  <li><strong>Domicilio Fiscal:</strong> Ciudad, provincia y departamento de Arequipa, República del Perú</li>
  <li><strong>Email de Contacto:</strong> legal@blis-corp.com</li>
</ul>`,
    },
    {
      title: "2. Objeto Social",
      icon: "book",
      content: `<p>BLIS CORP S.A.C. tiene por objeto social, entre otras actividades:</p>
<ul>
  <li><strong>Actividades Inmobiliarias:</strong> Intermediación en la compra, venta o arrendamiento de terrenos e inmuebles; promoción y construcción de viviendas y edificios</li>
  <li><strong>Servicios Empresariales:</strong> Asesoría financiera, legal, comercial, marketing y capacitación empresarial</li>
  <li><strong>Comercio General:</strong> Importación, exportación y distribución de bienes</li>
  <li><strong>Publicidad y Medios:</strong> Diseño gráfico, administración de páginas web, desarrollo de software y producción audiovisual</li>
  <li><strong>Contenido Educativo:</strong> Creación y comercialización de ebooks, cursos en línea, asesorías empresariales, herramientas digitales y plantillas para emprendedores</li>
</ul>`,
    },
    {
      title: "3. Naturaleza de la Plataforma Digital",
      icon: "alert",
      content: `<p><strong>AVISO IMPORTANTE SOBRE EL USO DE LA PLATAFORMA:</strong></p>
<p>BLIS CORP S.A.C., a través de su plataforma digital <strong>blis-corp.com</strong>, se dedica <strong>exclusivamente a la comercialización de contenido educativo digital</strong> (ebooks, cursos en línea, asesorías empresariales, herramientas y plantillas para emprendedores).</p>

<p><strong>Las actividades de intermediación y venta inmobiliaria se gestionan únicamente por canales offline y presenciales</strong>, conforme a lo requerido por las entidades reguladoras, a través de nuestro Oficial de Cumplimiento.</p>

<p><strong>Está terminantemente prohibido todo tipo de transacción inmobiliaria mediante pasarelas de pago digitales</strong> sin haber superado previamente los filtros y requisitos que las entidades reguladoras exigen, incluyendo pero no limitado a: verificación de identidad, declaración de origen de fondos, y cumplimiento de normativa anti-lavado de activos (AML) y prevención de financiamiento del terrorismo (CFT).</p>

<p>Cualquier intento de utilizar la Plataforma para realizar transacciones inmobiliarias sin la debida autorización será considerado una violación de estos términos y podrá resultar en la cancelación inmediata de la cuenta y la notificación a las autoridades competentes.</p>`,
    },
    {
      title: "4. Operaciones en Ecuador y Perú",
      icon: "shield",
      content: `<p>BLIS CORP S.A.C. mantiene operaciones comerciales en la República del Perú y la República del Ecuador. Las transacciones realizadas en cada país se rigen por la legislación local aplicable.</p>
<p>Para operaciones en Ecuador, la empresa cumple con las disposiciones de la Superintendencia de Compañías, Valores y Seguros, y demás normativa ecuatoriana pertinente.</p>`,
    },
    {
      title: "5. Propiedad Intelectual del Sitio Web",
      icon: "shield",
      content: `<p>Todos los elementos que componen este sitio web (marcas, logotipos, textos, imágenes, videos, software, base de datos, código fuente, diseño gráfico) son propiedad exclusiva de BLIS CORP S.A.C. o de terceros que han autorizado su uso, y están protegidos por las leyes de propiedad intelectual e industrial.</p>
<p>Queda prohibida la reproducción total o parcial, distribución, comunicación pública o transformación de cualquier elemento de este sitio web sin la autorización expresa y por escrito de BLIS CORP S.A.C.</p>`,
    },
    {
      title: "6. Exclusión de Responsabilidad",
      content: `<p>BLIS CORP S.A.C. no se hace responsable de los daños y perjuicios que pudieran derivarse de:</p>
<ul>
  <li>La falta de disponibilidad o continuidad del funcionamiento de la Plataforma</li>
  <li>La presencia de virus o elementos lesivos en los contenidos</li>
  <li>El uso ilícito, negligente o fraudulento de la Plataforma por parte de los usuarios</li>
  <li>La falta de veracidad o actualización de los contenidos publicados por terceros</li>
</ul>`,
    },
  ],
  sidebar: { enabled: true, position: "left" },
}

export default function AvisoLegalPage() {
  return <LegalPage data={data} slug="aviso" />
}
