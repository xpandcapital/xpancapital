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
const supabase = createClient(supabaseUrl, supabaseKey);
const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

const posts = [
  {
    titulo: 'Saneamiento Físico Legal: Guía Completa para Propietarios',
    slug: 'saneamiento-fisico-legal-guia-completa',
    contenido: `
# Saneamiento Físico Legal: Guía Completa para Propietarios

El saneamiento físico legal es uno de los temas más importantes que todo propietario debe conocer. En esta guía te explicamos todo lo que necesitas saber.

## ¿Qué es el Saneamiento Físico Legal?

Es el proceso mediante el cual se regulariza la situación de un inmueble ante los organismos públicos competentes, asegurando que cumple con todas las normativas vigentes.

##Documentos Requeridos

- Título de propiedad original
- Planos aprobados
- Certificado de habitabilidad
- Licencia de funcionamiento
- Pago de tributos actualizado

## Proceso Paso a Paso

1. **Verificación de documentos**: Recopilar toda la documentación
2. **Medición y verificación física**: Un perito verifica el estado del inmueble
3. **Regularización**: Se tramitan los permisos faltantes
4. **Inscripción**: Se inscribe correctamente en los registros públicos

## Costos Estimados

Los costos varían según el tipo de propiedad y su ubicación. Contacta con nuestros asesores para un presupuesto personalizado.
    `,
    extracto: 'Todo lo que necesitas saber sobre saneamiento físico legal para regularizar tu propiedad.',
    imagen_portada: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200',
    categoria_nombre: 'Legal',
    es_premium: false,
    tiempo_lectura_minutos: 6
  },
  {
    titulo: 'Domótica y Smart Homes: El Futuro de los Terrenos',
    slug: 'domotica-smart-homes-futuro-terrenos',
    contenido: `
# Domótica y Smart Homes: El Futuro de los Terrenos

La tecnología está transformando el mercado inmobiliario. Los terrenos con infraestructura para smart homes tienen una plusvalía superior al 18%.

## ¿Qué es la Domótica?

La domótica integra sistemas de automatización en el hogar, permitiendo controlar:

- Iluminación
- Climatización
- Seguridad
- Entretenimiento
- Energía

## Beneficios para Inversionistas

1. **Mayor plusvalía**: Los terrenos preparados para domótica se valoran más
2. **Atracción de compradores**: Millennials y Gen Z prefieren hogares inteligentes
3. **Ahorro energético**: Hasta 30% de reducción en costos de servicios

## Zonas con Mayor Potencial

- Nuevas urbanizaciones con fibra óptica
- Terrenos cerca de centros tecnológicos
- Proyectos planificados con infraestructura smart
    `,
    extracto: 'Descubre cómo la domótica está revolucionando el valor de los terrenos y propiedades.',
    imagen_portada: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200',
    categoria_nombre: 'Arquitectura',
    es_premium: true,
    precio_coins: 15,
    tiempo_lectura_minutos: 7
  },
  {
    titulo: 'Plusvalía Inmobiliaria: Cómo Calcular tu ROI Real',
    slug: 'plusvalia-inmobiliaria-calcular-roi-real',
    contenido: `
# Plusvalía Inmobiliaria: Cómo Calcular tu ROI Real

Calcular el retorno de inversión real en bienes raíces requiere considerar múltiples factores que muchos inversores ignoran.

## Fórmula del ROI Inmobiliario

\`\`\`
ROI = ((Valor Final - Valor Inicial + Ingresos - Gastos) / Inversión Inicial) × 100
\`\`\`

## Factores que Afectan la Plusvalía

1. **Ubicación**: El factor #1
2. **Desarrollo urbano**: Planes municipales
3. **Infraestructura**: Carreteras, metro, centros comerciales
4. **Gentrificación**: Transformación del vecindario

## Errores Comunes

- No considerar gastos ocultos (mantenimiento, impuestos)
- Sobreestimar el valor de renta
- Ignorar costos de oportunidad
- No reservar para contingencias

## Herramientas de Cálculo

En BLIS Corp contamos con modelos predictivos que analizan más de 50 variables para proyectar la plusvalía con un95% de precisión.
    `,
    extracto: 'Aprende a calcular correctamente el retorno de inversión en propiedades y terrenos.',
    imagen_portada: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    categoria_nombre: 'Inversiones',
    es_premium: true,
    precio_coins: 20,
    tiempo_lectura_minutos: 8
  },
  {
    titulo: '10 Tips para Comprar tu Primera Propiedad',
    slug: '10-tips-comprar-primera-propiedad',
    contenido: `
# 10 Tips para Comprar tu Primera Propiedad

Comprar tu primera propiedad es una de las decisiones financieras más importantes. Sigue estos tips para hacerlo correctamente.

## Los 10 Tips Esenciales

1. **Define tu presupuesto real**: Considera todos los costos, no solo el precio de compra

2. ** investiga la zona**: Visita a diferentes horas del día y habla con vecinos

3. **Revisa la documentación**: Título de propiedad, deudas, permisos

4. **Verifica servicios básicos**: Agua, luz, desagüe, internet

5. **Calcula gastos adicionales**: Notaría, impuestos, registro

6. **Negocia con información**: Usa datos de mercado similares

7. **Revisa el estado físico**: Inspeciona techos, paredes, instalaciones

8. **Considera el potencial de plusvalía**: No solo el valor actual

9. **Ten respaldo financiero**: Un colchón para emergencias

10. **Asesórate con expertos**: Un buen agente inmobiliario vale su peso en oro

## ¿Listo para Dar el Paso?

Contacta con nuestros asesores y te guiaremos en todo el proceso.
    `,
    extracto: 'Los 10 consejos más importantes para adquirir tu primera propiedad sin errores.',
    imagen_portada: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
    categoria_nombre: 'Tips',
    es_premium: false,
    tiempo_lectura_minutos: 5
  },
  {
    titulo: 'Embargo Inmobiliario: Todo lo que Debes Saber',
    slug: 'embargo-inmobiliario-todo-debes-saber',
    contenido: `
# Embargo Inmobiliario: Todo lo que Debes Saber

Un embargo inmobiliario puede afectar significativamente una propiedad. Conoce los detalles para evitar problemas.

## ¿Qué es un Embargo Inmobiliario?

Es una medida judicial que impide la libre disposición de un bien inmueble mientras se resuelve un proceso legal.

## Causas Comunes

- Deudas impagadas
- Procesos de divorcio
- Disputas de herencia
- Incumplimiento de contratos

## Duración del Embargo

Un embargo puede durar desde meses hasta años, dependiendo del tipo de proceso y la complejidad del caso.

## Cómo Verificar si una Propiedad tiene Embargo

1. Solicita un Certificate de Gravámenes en Sunarp
2. Verifica en los Registros Públicos
3. Consulta con un abogado especializado

## ¿Se Puede Comprar una Propiedad Embargada?

Técnicamente sí, pero conlleva riesgos significativos. Se recomienda esperar a que se levante el embargo.

## Prevención

- Maintén todas tus deudas al día
- Revisa los títulos antes de comprar
- Contrata un seguro de título
    `,
    extracto: 'Guía completa sobre embargos inmobiliarios: causas, duración y cómo evitarlos.',
    imagen_portada: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200',
    categoria_nombre: 'Legal',
    es_premium: false,
    tiempo_lectura_minutos: 6
  }
];

async function getCategories() {
  const { data, error } = await supabase
    .from('blog_categorias')
    .select('id, nombre')
    .eq('empresa_id', EMPRESA_ID);
  
  if (error) {
    console.log('Error obteniendo categorías:', error.message);
    return {};
  }
  
  const cats = {};
  data.forEach(c => cats[c.nombre] = c.id);
  return cats;
}

async function createPosts() {
  console.log('🚀 Creando posts adicionales...\n');
  
  const categorias = await getCategories();
  console.log('📌 Categorías encontradas:', Object.keys(categorias).join(', '), '\n');
  
  for (const post of posts) {
    const categoriaId = categorias[post.categoria_nombre];
    
    if (!categoriaId) {
      console.log(`⚠️ Categoría "${post.categoria_nombre}" no encontrada, usando primera disponible`);
    }
    
    const postData = {
      empresa_id: EMPRESA_ID,
      titulo: post.titulo,
      slug: post.slug,
      contenido: post.contenido,
      extracto: post.extracto,
      imagen_portada: post.imagen_portada,
      categoria_id: categoriaId || Object.values(categorias)[0],
      estado: 'publicado',
      es_premium: post.es_premium,
      precio_coins: post.es_premium ? post.precio_coins : 0,
      recompensa_segundos: 60,
      recompensa_coins: 5,
      tiempo_lectura_minutos: post.tiempo_lectura_minutos
    };
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();
    
    if (error) {
      console.log(`❌ Error en "${post.titulo}":`, error.message);
    } else {
      console.log(`✅ "${post.titulo}" ${post.es_premium ? '💰(Premium)' : ''}`);
    }
  }
  
  console.log('\n🎉 Posts creados!');
  console.log('🌐 Ver en: http://localhost:3000/blog');
}

createPosts();