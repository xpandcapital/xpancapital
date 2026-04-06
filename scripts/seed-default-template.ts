import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DEFAULT_EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

const DEFAULT_SECTION_ORDER = [
  'hero', 'about', 'video', 'process', 'operations', 'market',
  'calculator', 'map', 'projects', 'catalog', 'team', 'testimonials',
  'faq', 'blog', 'footer'
];

const DEFAULT_SECTION_VISIBILITY = {
  hero: true,
  about: true,
  video: true,
  process: true,
  operations: true,
  market: true,
  calculator: true,
  map: true,
  projects: true,
  catalog: true,
  team: true,
  testimonials: true,
  faq: true,
  blog: true,
  footer: true
};

const DEFAULT_CMS_DATA = {
  hero: {
    title1: "BLIS",
    title2: "CORP",
    subtitle: "Tu Próximo Gran Patrimonio",
    description: "Desarrollamos Macro-Lotes y Terrenos con alta plusvalía.",
    primaryBtnText: "Comprar Terrenos",
    primaryBtnLink: "/tienda",
    secondaryBtnText: "Trayectoria",
    secondaryBtnLink: "#trayectoria",
    videoBackground: "/videos/cyber-bg.mp4",
  },
  about: {
    yearsExperience: "10+",
    lotsDelivered: "2500+",
    missionTitle: "Nuestra Misión",
    missionText: "Transformar el horizonte inmobiliario.",
    videoUrl: "",
    videoThumbnail: "/images/miniatura-de-video.webp",
  },
  process: {
    title: "Metodología",
    subtitle: "Nuestra Ruta de Éxito",
    steps: [
      { title: "Consulta", description: "Analizamos tus necesidades", icon: "message", image: "" },
      { title: "Selección", description: "Encontramos el terreno ideal", icon: "map", image: "" },
      { title: "Inversión", description: "Opciones de financiamiento", icon: "coins", image: "" },
      { title: "Entrega", description: "Formalización y escritura", icon: "key", image: "" }
    ]
  },
  operations: {
    title: "Backstage",
    subtitle: "Operaciones en Campo",
    sliderImages: [],
    stats: { sales: "5M", urbanizations: "12", clients: "850", conferences: "45" }
  },
  market: {
    title: "Mercado",
    subtitle1: "Inteligencia Inmobiliaria",
    subtitle2: "Datos",
    description: "Análisis en tiempo real del mercado inmobiliario.",
    insights: [],
    stats: [
      { title: "Plusvalía", value: "+25%", desc: "Anual", icon: "trending-up", color: "green" },
      { title: "Demanda", value: "85%", desc: "Regional", icon: "users", color: "blue" },
      { title: "Crecimiento", value: "12%", desc: "Mensual", icon: "chart", color: "purple" }
    ]
  },
  calculator: {
    title: "Plusvalía",
    subtitle: "Simulador",
    description: "Calcula tu retorno de inversión",
    planosRatio: "50",
    preventaRatio: "75",
    escrituraRatio: "91",
    tirValue: "22"
  },
  map: {
    title: "Mapa",
    subtitle: "Dominio Territorial",
    description: "Presencia en las principales ciudades",
    locations: [
      { name: "Lima", fullName: "Lima Metropolitana", city: "Lima", province: "Lima", coordinates: { top: "50%", left: "30%" }, status: "activo", dotColor: "#10B981" },
      { name: "Quito", fullName: "Quito", city: "Quito", province: "Pichincha", coordinates: { top: "40%", left: "60%" }, status: "activo", dotColor: "#10B981" },
      { name: "Guayaquil", fullName: "Guayaquil", city: "Guayaquil", province: "Guayas", coordinates: { top: "55%", left: "55%" }, status: "activo", dotColor: "#10B981" }
    ]
  },
  catalog: { title: "Tienda", subtitle: "Recursos de Élite" },
  team: {
    title: "Liderazgo",
    ceoName: "Kevin Valdez",
    ceoRole: "CEO",
    ceoQuote: "El éxito se construye con visión y perseverancia.",
    ceoDescription1: "Líder visionario con más de 10 años transformando el sector inmobiliario.",
    ceoDescription2: "Experto en identificación de oportunidades de inversión con alta rentabilidad.",
    ceoImage: "/images/kevin-valdez.webp",
    members: []
  },
  testimonials: {
    title: "Experiencias",
    subtitle: "Testimonios",
    items: [
      { quote: "Blis Corp redefinió nuestra estrategia de inversión. Los resultados superaron todas las expectativas.", author: "Rafael S.", role: "Inversor", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&q=80" },
      { quote: "Profesionalismo y transparencia en cada paso del proceso de inversión.", author: "María C.", role: "Empresaria", image: "https://images.unsplash.com/photo-1573497019940-1c28c8864f77?w=256&q=80" }
    ]
  },
  faq: {
    title: "Transparencia",
    items: [
      { question: "¿Cómo funciona el proceso de inversión?", answer: "Te guiamos paso a paso desde la selección del terreno hasta la escritura." },
      { question: "¿Qué garantías ofrecen?", answer: "Garantía de plusvalía y respaldo legal completo en cada transacción." },
      { question: "¿Puedo financiar mi terreno?", answer: "Sí, ofrecemos hasta 36 meses de financiamiento directo sin intereses." }
    ]
  },
  footer: {
    description: "Liderando la transformación digital del sector inmobiliario.",
    copyright: "© 2026 Blis Corp. Todos los derechos reservados.",
    logoVertical: "/images/logo-blis-vertical.png",
    logoHorizontal: "/images/blis-logo.png",
    socials: {
      instagram: "https://instagram.com/bliscorp",
      linkedin: "https://linkedin.com/company/bliscorp",
      youtube: "https://youtube.com/@bliscorp"
    }
  },
  commercial: { country: "EC", currency: "USD", taxName: "IVA", taxRate: 15 }
}

async function seedDefaultTemplate() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('Checking for existing landing templates...')

  const { data: existing } = await supabase
    .from('templates')
    .select('id')
    .eq('empresa_id', DEFAULT_EMPRESA_ID)
    .eq('tipo_contenido', 'landing')
    .single()

  if (existing) {
    console.log('Landing template already exists:', existing.id)
    console.log('Updating with default CMS data...')

    const { error } = await supabase
      .from('templates')
      .update({
        secciones: DEFAULT_CMS_DATA,
        sectionOrder: DEFAULT_SECTION_ORDER,
        sectionVisibility: DEFAULT_SECTION_VISIBILITY,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating template:', error)
      process.exit(1)
    }

    console.log('Template updated successfully!')
    process.exit(0)
  }

  console.log('Creating default landing template...')

  const { data, error } = await supabase
    .from('templates')
    .insert({
      empresa_id: DEFAULT_EMPRESA_ID,
      nombre: 'Landing 1',
      slug: 'inicio',
      tipo_contenido: 'landing',
      descripcion: 'Página principal de BLIS Corp',
      secciones: DEFAULT_CMS_DATA,
      sectionOrder: DEFAULT_SECTION_ORDER,
      sectionVisibility: DEFAULT_SECTION_VISIBILITY,
      estado: 'activo',
      es_principal: true,
      mostrar_en_menu: true,
      mostrar_en_footer: false,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating template:', error)
    process.exit(1)
  }

  console.log('Default template created successfully!')
  console.log('Template ID:', data.id)

  const { error: versionError } = await supabase
    .from('template_versiones')
    .insert({
      template_id: data.id,
      version: 1,
      secciones: DEFAULT_CMS_DATA,
      notas: 'Versión inicial - datos por defecto'
    })

  if (versionError) {
    console.error('Error creating version:', versionError)
  } else {
    console.log('Initial version saved')
  }

  process.exit(0)
}

seedDefaultTemplate()