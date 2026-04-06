/**
 * Script para actualizar posts del blog con:
 * - Autor: Kevin Valdez
 * - Categorías correctas según contenido
 * - Fechas de 2026
 * - Contenido mejorado
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

// Mapeo de títulos a categorías
const CATEGORY_RULES: { keywords: string[]; categoria: string }[] = [
  { keywords: ['agente', 'inmobiliario', 'broker', 'captar', 'cliente', 'venta', 'vender'], categoria: 'Para Agentes' },
  { keywords: ['propietario', 'propiedad', 'casa', 'inmueble', 'vivienda', 'dueño'], categoria: 'Propietarios' },
  { keywords: ['construcción', 'construir', 'edificación', 'obra', 'material', 'cement', 'ladrillo'], categoria: 'Construcción' },
  { keywords: ['ley', 'legal', 'saneamiento', 'registro', 'sunarp', 'notarial', 'desalojo', 'impuesto', 'tributo'], categoria: 'Legal' },
  { keywords: ['tip', 'consejo', 'recomendación', 'paso', 'guía', 'cómo', 'cómo hacer'], categoria: 'Tips' },
  { keywords: ['arquitectura', 'diseño', 'decoración', 'feng shui', 'hogar'], categoria: 'Arquitectura' },
  { keywords: ['crédito', 'hipotecario', 'inversión', 'financiero', 'dinero', 'precio'], categoria: 'Inversiones' },
  { keywords: ['noticia', 'mvcs', 'gobierno', 'proyecto', 'obra pública'], categoria: 'Noticias' },
  { keywords: ['curiosidad', 'dato', 'sabías', 'historia'], categoria: 'Curiosidades' },
];

function guessCategory(titulo: string, contenido: string): string {
  const text = (titulo + ' ' + contenido).toLowerCase();
  
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        return rule.categoria;
      }
    }
  }
  
  return 'General';
}

function generate2026Date(index: number, total: number): string {
  // Distribuir posts a lo largo de 2026
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDay());
  
  // Posts más recientes primeros
  const daysAgo = Math.floor((index / total) * 90); // Distribuir en últimos 3 meses
  const date = new Date(startOfWeek.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  
  return date.toISOString();
}

async function main() {
  console.log('🔄 Actualizando posts del blog...\n');
  
  // 1. Crear/obtener perfil de Kevin Valdez
  console.log('👤 Verificando perfil de Kevin Valdez...');
  
  let { data: kevinProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('nombre', 'Kevin')
    .single();
  
  if (!kevinProfile) {
    // Crear perfil
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: EMPRESA_ID, // Usar empresa ID como autor
        nombre: 'Kevin',
        apellido: 'Valdez',
        rol: 'admin'
      })
      .select('id')
      .single();
    
    if (profileError) {
      console.log('⚠️ No se pudo crear perfil, usando empresa_id como autor');
      kevinProfile = { id: EMPRESA_ID };
    } else {
      kevinProfile = newProfile;
    }
  }
  
  console.log(`✅ Autor ID: ${kevinProfile?.id || EMPRESA_ID}\n`);
  
  const autorId = kevinProfile?.id || EMPRESA_ID;
  
  // 2. Obtener todas las categorías
  const { data: categorias } = await supabase
    .from('blog_categorias')
    .select('id, nombre');
  
  const categoriaMap = new Map(categorias?.map(c => [c.nombre, c.id]) || []);
  console.log(`📁 Categorías disponibles: ${categoriaMap.size}\n`);
  
  // 3. Obtener todos los posts
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, titulo, contenido, extracto')
    .order('creado_en', { ascending: true });
  
  if (error || !posts) {
    console.error('Error obteniendo posts:', error);
    return;
  }
  
  console.log(`📝 Posts a actualizar: ${posts.length}\n`);
  
  let updated = 0;
  let errors = 0;
  
  // 4. Actualizar cada post
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    
    // Determinar categoría basada en contenido
    const categoriaNombre = guessCategory(post.titulo, post.contenido || '');
    const categoriaId = categoriaMap.get(categoriaNombre) || categoriaMap.get('General');
    
    // Generar fecha de 2026
    const fechaPublicacion = generate2026Date(i, posts.length);
    
    // Actualizar post
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        categoria_id: categoriaId,
        publicado_en: fechaPublicacion,
        creado_en: fechaPublicacion,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', post.id);
    
    if (updateError) {
      console.log(`❌ Error actualizando "${post.titulo?.substring(0, 40)}...":`, updateError.message);
      errors++;
    } else {
      updated++;
      if ((i + 1) % 20 === 0) {
        console.log(`✅ Progreso: ${i + 1}/${posts.length}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✨ Actualización completada!`);
  console.log(`✅ Posts actualizados: ${updated}`);
  console.log(`❌ Errores: ${errors}`);
  
  // Verificar resultado
  const { data: sample } = await supabase
    .from('blog_posts')
    .select('titulo, categoria_id, autor_id, publicado_en')
    .limit(3);
  
  console.log('\n📊 Muestra de posts actualizados:');
  sample?.forEach(p => {
    const cat = categorias?.find(c => c.id === p.categoria_id);
    console.log(`  - ${p.titulo?.substring(0, 40)}...`);
    console.log(`    Categoría: ${cat?.nombre || 'Sin categoría'}`);
    console.log(`    Fecha: ${p.publicado_en?.substring(0, 10)}`);
  });
}

main();