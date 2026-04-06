import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PROJECTS_DATA = [
  {
    id: 'MONTANA',
    name: 'Residencial Montana',
    status: 'PROYECTO ENTREGADO',
    description: 'Residencial Montana ofrece una comunidad privada de 21 lotes distribuidos en un área total de 8,000m². Diseñado bajo un enfoque sostenible, el proyecto está planificado para completarse en 2 años, promoviendo espacios residenciales armónicos y funcionales.',
    location: 'Pujilí, Cotopaxi',
    website: 'https://montana.blis-corp.com',
    primary_color: '#4aa021',
    secondary_color: '#2d5a12',
    cover_image: '/images/montana-avances.webp',
    gallery_images: [
      '/images/montana-1.webp',
      '/images/montana-2.webp',
      '/images/montana-3.webp',
      '/images/montana-4.webp',
      '/images/montana-5.webp',
      '/images/montana-6.webp',
      '/images/montana-7.webp',
      '/images/montana-8.webp',
      '/images/montana-9.webp',
      '/images/montana-10.webp',
      '/images/montana-11.webp'
    ],
    logo_url: '/images/montana-logo.png'
  },
  {
    id: 'VENTURA',
    name: 'Residencial Ventura',
    status: 'PROYECTO ENTREGADO',
    description: 'Residencial Ventura cuenta con 20,000m² distribuidos en 30 lotes exclusivos. Con un tiempo estimado de entrega de 3 años, el diseño prioriza la privacidad de cada unidad e integra tecnología domótica para una convivencia eficiente.',
    location: 'Quito, Pichincha',
    website: 'https://ventura.blis-corp.com',
    primary_color: '#eab534',
    secondary_color: '#b8921a',
    cover_image: '/images/ventura-avances.webp',
    gallery_images: [
      '/images/Ventura-1.webp',
      '/images/Ventura-2.webp',
      '/images/Ventura-3.webp',
      '/images/Ventura-4.webp',
      '/images/Ventura-5.webp',
      '/images/Ventura-6.webp',
      '/images/Ventura-7.webp',
      '/images/Ventura-8.webp',
      '/images/Ventura-9.webp',
      '/images/Ventura-10.webp'
    ],
    logo_url: '/images/ventura-logo.png'
  },
  {
    id: 'ARKADIA',
    name: 'Residencial Arkadia',
    status: 'PROYECTO ENTREGADO',
    description: 'Desarrollado sobre un terreno de 15,000m², Residencial Arkadia comprende 20 lotes con una proyección de desarrollo de 2 años. El proyecto destaca por su integración de parques internos y la implementación de cristalería fotovoltaica para mejorar la eficiencia energética.',
    location: 'Pujilí, Cotopaxi',
    website: 'https://arkadia.blis-corp.com',
    primary_color: '#6b2468',
    secondary_color: '#4a1845',
    cover_image: '/images/arkadia-avances.webp',
    gallery_images: [
      '/images/arkadia-1.webp',
      '/images/arkadia-2.webp',
      '/images/arkadia-3.webp',
      '/images/arkadia-4.webp',
      '/images/arkadia-5.webp'
    ],
    logo_url: '/images/arkadia-logo.png'
  },
  {
    id: 'MONTEBELLO',
    name: 'Montebello Ambato',
    status: 'VENTA CON ESCRITURA',
    description: 'Montebello Ambato es un desarrollo mixto que incluye 40 lotes en una extensión de 17,000m², programado para entregarse en 2.5 años. El complejo integra áreas residenciales privadas con seguridad controlada y zonas destinadas al desarrollo comercial.',
    location: 'Ambato, Tungurahua',
    website: 'https://montebello.ec',
    primary_color: '#89c426',
    secondary_color: '#014053',
    cover_image: '/images/montebello-avances.webp',
    gallery_images: [
      '/images/montebello-1.webp',
      '/images/montebello-2.webp',
      '/images/montebello-3.webp',
      '/images/montebello-4.webp',
      '/images/montebello-5.webp',
      '/images/montebello-6.webp',
      '/images/montebello-7.webp',
      '/images/montebello-8.webp'
    ],
    logo_url: '/images/montebello-logo.png'
  },
  {
    id: 'CUMBRES',
    name: 'Cumbres Residencial',
    status: 'PROYECTO ENTREGADO',
    description: 'Ubicado estratégicamente, Cumbres Residencial distribuye 30 lotes a lo largo de 15,000m² de terreno. Su desarrollo integral toma 2 años y prioriza un paisajismo planificado junto con sistemas de arquitectura contemporánea que favorecen el entorno.',
    location: 'Latacunga, Cotopaxi',
    website: 'https://cumbres.ec',
    primary_color: '#7d5ab8',
    secondary_color: '#33a0b8',
    cover_image: '/images/cumbres-avances.webp',
    gallery_images: [
      '/images/Cumbres-1.webp',
      '/images/cumbres-2.webp',
      '/images/cumbres-3.webp',
      '/images/cumbres-4.webp',
      '/images/cumbres-5.webp',
      '/images/cumbres-6.webp',
      '/images/cumbres-7.webp',
      '/images/cumbres-8.webp',
      '/images/cumbres-9.webp',
      '/images/cumbres-11.webp',
      '/images/cumbres-12.webp',
      '/images/cumbres-13.webp'
    ],
    logo_url: '/images/cumbres-logo.png'
  },
  {
    id: 'VICTORIA',
    name: 'Villa Victoria',
    status: 'EN PLANOS',
    description: 'Villa Victoria ofrece 20 lotes consolidados en un área de 11,000m², con un plazo de ejecución de 2 años. El conjunto residencial está equipado con infraestructura moderna que brinda facilidades cotidianas, incluyendo circuitos de áreas recreativas para la comunidad.',
    location: 'Pujilí, Cotopaxi',
    website: 'https://victoria.ec',
    primary_color: '#0d8a8d',
    secondary_color: '#095f61',
    cover_image: '/images/victoria-avances.webp',
    gallery_images: [
      '/images/victoria-1.webp',
      '/images/victoria-2.webp',
      '/images/victoria-3.webp',
      '/images/victoria-4.webp',
      '/images/victoria-5.webp',
      '/images/victoria-6.webp'
    ],
    logo_url: '/images/victoria-logo.png'
  }
];

async function seedProjects() {
  console.log('🔄 Iniciando actualización de proyectos con imágenes...\n');

  for (const project of PROJECTS_DATA) {
    console.log(`📁 Procesando: ${project.name}`);
    
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(`❌ Error verificando proyecto ${project.id}:`, fetchError);
      continue;
    }

    const updateData = {
      name: project.name,
      status: project.status,
      description: project.description,
      cover_image: project.cover_image,
      gallery_images: project.gallery_images,
      primary_color: project.primary_color,
      secondary_color: project.secondary_color,
      website: project.website,
      location: project.location,
      logo_url: project.logo_url,
      updated_at: new Date().toISOString()
    };

    if (existingProject) {
      const { error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id);

      if (updateError) {
        console.error(`❌ Error actualizando ${project.name}:`, updateError);
      } else {
        console.log(`✅ Actualizado: ${project.name} (${project.gallery_images.length} imágenes)`);
      }
    } else {
      const { error: insertError } = await supabase
        .from('projects')
        .insert([{
          id: project.id,
          ...updateData,
          is_active: true
        }]);

      if (insertError) {
        console.error(`❌ Error creando ${project.name}:`, insertError);
      } else {
        console.log(`✅ Creado: ${project.name} (${project.gallery_images.length} imágenes)`);
      }
    }
  }

  console.log('\n✨ Proceso completado!');
}

seedProjects().catch(console.error);