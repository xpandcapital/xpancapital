import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DEFAULT_EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

const PROJECTS = [
  {
    name: "Residencial Montana",
    status: "PROYECTO ENTREGADO",
    website: "https://montana.blis-corp.com",
    location: "Pujilí, Cotopaxi",
    primary_color: "#4aa021",
    secondary_color: "#4aa02180",
    description: "Residencial Montana ofrece una comunidad privada de 21 lotes distribuidos en un área total de 8,000m². Diseñado bajo un enfoque sostenible, el proyecto está planificado para completarse en 2 años, promoviendo espacios residenciales armónicos y funcionales.",
    lots_count: 21,
    area: "8000m2",
    delivery_time: "2 años",
    image: "/images/montana-avances.webp",
    slider_images: [
      "/images/montana-1.webp",
      "/images/montana-2.webp",
      "/images/montana-3.webp",
      "/images/montana-4.webp",
      "/images/montana-5.webp"
    ]
  },
  {
    name: "Residencial Ventura",
    status: "PROYECTO ENTREGADO",
    website: "https://ventura.blis-corp.com",
    location: "Quito, Pichincha",
    primary_color: "#eab534",
    secondary_color: "#eab53480",
    description: "Residencial Ventura cuenta con 20,000m² distribuidos en 30 lotes exclusivos. Con un tiempo estimado de entrega de 3 años, el diseño prioriza la privacidad de cada unidad e integra tecnología domótica para una convivencia eficiente.",
    lots_count: 30,
    area: "20000m2",
    delivery_time: "3 años",
    image: "/images/ventura-avances.webp",
    slider_images: [
      "/images/Ventura-1.webp",
      "/images/Ventura-2.webp",
      "/images/Ventura-3.webp",
      "/images/Ventura-4.webp",
      "/images/Ventura-5.webp"
    ]
  },
  {
    name: "Residencial Arkadia",
    status: "PROYECTO ENTREGADO",
    website: "https://arkadia.blis-corp.com",
    location: "Pujilí, Cotopaxi",
    primary_color: "#6b2468",
    secondary_color: "#6b246880",
    description: "Desarrollado sobre un terreno de 15,000m², Residencial Arkadia comprende 20 lotes con una proyección de desarrollo de 2 años. El proyecto destaca por su integración de parques internos y la implementación de cristalería fotovoltaica para mejorar la eficiencia energética.",
    lots_count: 20,
    area: "15000m2",
    delivery_time: "2 años",
    image: "/images/arkadia-avances.webp",
    slider_images: [
      "/images/arkadia-1.webp",
      "/images/arkadia-2.webp",
      "/images/arkadia-3.webp",
      "/images/arkadia-4.webp",
      "/images/arkadia-5.webp"
    ]
  },
  {
    name: "Montebello Ambato",
    status: "EN PLANOS",
    website: "https://montebello.ec",
    location: "Ambato, Tungurahua",
    primary_color: "#89c426",
    secondary_color: "#014053",
    description: "Montebello Ambato es un desarrollo mixto que incluye 40 lotes en una extensión de 17,000m², programado para entregarse en 2.5 años. El complejo integra áreas residenciales privadas con seguridad controlada y zonas destinadas al desarrollo comercial.",
    lots_count: 40,
    area: "17000m2",
    delivery_time: "2.5 años",
    image: "/images/montebello-avances.webp",
    slider_images: [
      "/images/montebello-1.webp",
      "/images/montebello-2.webp",
      "/images/montebello-3.webp",
      "/images/montebello-4.webp",
      "/images/montebello-5.webp"
    ]
  },
  {
    name: "Cumbres Residencial",
    status: "PROYECTO ENTREGADO",
    website: "https://cumbres.ec",
    location: "Latacunga, Cotopaxi",
    primary_color: "#7d5ab8",
    secondary_color: "#33a0b8",
    description: "Ubicado estratégicamente, Cumbres Residencial distribuye 30 lotes a lo largo de 15,000m² de terreno. Su desarrollo integral toma 2 años y prioriza un paisajismo planificado junto con sistemas de arquitectura contemporánea que favorecen el entorno.",
    lots_count: 30,
    area: "15000m2",
    delivery_time: "2 años",
    image: "/images/cumbres-avances.webp",
    slider_images: [
      "/images/cumbres-1.webp",
      "/images/cumbres-2.webp",
      "/images/cumbres-3.webp",
      "/images/cumbres-4.webp",
      "/images/cumbres-5.webp"
    ]
  },
  {
    name: "Villa Victoria",
    status: "PREVENTA",
    website: "https://victoria.ec",
    location: "Pujilí, Cotopaxi",
    primary_color: "#0d8a8d",
    secondary_color: "#0d8a8d80",
    description: "Villa Victoria ofrece 20 lotes consolidados en un área de 11,000m², con un plazo de ejecución de 2 años. El conjunto residencial está equipado con infraestructura moderna que brinda facilidades cotidianas, incluyendo circuitos de áreas recreativas para la comunidad.",
    lots_count: 20,
    area: "11000m2",
    delivery_time: "2 años",
    image: "/images/victoria-avances.webp",
    slider_images: [
      "/images/victoria-1.webp",
      "/images/victoria-2.webp",
      "/images/victoria-3.webp",
      "/images/victoria-4.webp",
      "/images/victoria-5.webp"
    ]
  }
]

async function seedProjects() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('Checking existing projects...')

  const { data: existing } = await supabase
    .from('projects')
    .select('id, name')
    .eq('empresa_id', DEFAULT_EMPRESA_ID)

  if (existing && existing.length > 0) {
    console.log(`Found ${existing.length} existing projects:`)
    existing.forEach(p => console.log(`  - ${p.name}`))
    console.log('Skipping project creation.')
    return
  }

  console.log('Creating projects...')

  for (const project of PROJECTS) {
    const id = crypto.randomUUID()
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        id: id,
        name: project.name,
        status: project.status,
        website: project.website,
        location: project.location,
        primary_color: project.primary_color,
        secondary_color: project.secondary_color,
        logo_url: project.image,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error(`Error creating ${project.name}:`, error)
    } else {
      console.log(`Created: ${project.name} (${data.id})`)
    }
  }

  console.log('Done!')
}

seedProjects()