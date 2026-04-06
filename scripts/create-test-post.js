const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('ERROR: Missing env variables');
  console.log('URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.log('KEY:', supabaseKey ? 'OK' : 'MISSING');
  process.exit(1);
}

console.log('✅ Variables cargadas');
const supabase = createClient(supabaseUrl, supabaseKey);
const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

async function createTestPost() {
  console.log('🚀 Creando post de prueba...');
  
  // Obtener categoría
  const { data: categorias, error: catError } = await supabase
    .from('blog_categorias')
    .select('id, nombre')
    .eq('empresa_id', EMPRESA_ID)
    .limit(1);
  
  if (catError) {
    console.log('ERROR categorias:', catError.message);
    return;
  }
  
  if (!categorias || categorias.length === 0) {
    console.log('ERROR: No hay categorías');
    return;
  }
  
  const categoriaId = categorias[0].id;
  console.log('📌 Categoría:', categorias[0].nombre);
  
  const post = {
    empresa_id: EMPRESA_ID,
    titulo: 'Inversión Inmobiliaria: 5 Claves para el Éxito en 2026',
    slug: 'inversion-inmobiliaria-5-claves-exito-2026',
    contenido: `
# Inversión Inmobiliaria: 5 Claves para el Éxito en 2026

El mercado inmobiliario está evolucionando rápidamente. En BLIS Corp, hemos analizado las tendencias más importantes que definirán el éxito de las inversiones en el próximo año.

## 1. Ubicación Estratégica

La ubicación sigue siendo el factor más importante. Sin embargo, el concepto de "buena ubicación" ha evolucionado. Ahora buscamos:

- Acceso a transporte público
- Cercanía a centros tecnológicos
- Zonas con desarrollo urbano planificado

## 2. Análisis de Plusvalía

Es fundamental analizar el potencial de apreciación del inmueble. Considera:

- Planes de desarrollo urbano
- Proyectos de infraestructura
- Tendencias demográficas

## 3. Diversificación

No pongas todos tus huevos en la misma canasta. La diversificación incluye:

- Diferentes tipos de propiedades
- Varias ubicaciones
- Mix de renta y venta

## 4. Due Diligence

Investiga antes de invertir:

- Historial del vendedor
- Situación legal del inmueble
- Estado físico de la propiedad

## 5. Asesoría Profesional

Contar con expertos que entiendan el mercado local es invaluable.

---

**¿Listo para invertir?** Contacta a uno de nuestros asesores.
    `,
    extracto: 'Descubre las 5 claves fundamentales para tener éxito en tus inversiones inmobiliarias en 2026.',
    imagen_portada: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
    categoria_id: categoriaId,
    estado: 'publicado',
    es_premium: false,
    precio_coins: 0,
    recompensa_segundos: 60,
    recompensa_coins: 5,
    tiempo_lectura_minutos: 5
  };
  
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single();
  
  if (error) {
    console.log('❌ ERROR:', error.message);
    return;
  }
  
  console.log('✅ Post creado exitosamente!');
  console.log('📋 ID:', data.id);
  console.log('📝 Título:', data.titulo);
  console.log('🔗 Slug:', data.slug);
  console.log('\n🌐 Visita: http://localhost:3000/blog');
}

createTestPost();