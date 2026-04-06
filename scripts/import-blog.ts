/**
 * Script para importar blog de revista.blis-corp.com
 * Ejecutar con: npx ts-node scripts/import-blog.ts
 * 
 * Schema real de blog_posts:
 * - id, empresa_id, titulo, slug, contenido, extracto
 * - seo_title, seo_description
 * - imagen_portada, imagen_alt
 * - categoria_id
 * - autor_id
 * - estado, publicado_en
 * - es_premium, metodo_pago, precio_coins, precio_usd
 * - recompensa_segundos, recompensa_coins
 * - vistas, tiempo_lectura_minutos
 * - creado_en, actualizado_en
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BLOG_URL = 'https://revista.blis-corp.com/wp-json/wp/v2/posts?per_page=100&_embed';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

// Mapeo de categorías WP a IDs de blog_categorias
const CATEGORY_MAP: Record<string, string> = {
  'Para Agentes': '',
  'Propietarios': '',
  'Construcción': '',
  'Informativo': '',
  'Curiosidades': '',
  'Paso a paso': '',
  'Arquitectura': '',
  'Tips': '',
};

interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  modified: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: { width: number; height: number; };
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }>>;
    author?: Array<{ id: number; name: string; }>;
  };
}

// Artículos que tendrán BlisCoins (índices de artículos destacados)
const PREMIUM_ARTICLES = [0, 1, 2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

async function downloadImage(url: string, filename: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const { data, error } = await supabase.storage
      .from('cms')
      .upload(`blog/${filename}`, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error(`  ⚠️ Error subiendo imagen:`, error.message);
      return url;
    }
    
    const { data: publicUrl } = supabase.storage
      .from('cms')
      .getPublicUrl(`blog/${filename}`);
    
    return publicUrl.publicUrl;
  } catch (error) {
    console.error(`  ⚠️ Error descargando imagen`);
    return url;
  }
}

async function getOrCreateCategories(): Promise<Record<string, string>> {
  console.log('📁 Verificando categorías...');
  
  const categorias = [
    { nombre: 'Para Agentes', slug: 'para-agentes' },
    { nombre: 'Propietarios', slug: 'propietarios' },
    { nombre: 'Construcción', slug: 'construccion' },
    { nombre: 'Informativo', slug: 'informativo' },
    { nombre: 'Curiosidades', slug: 'curiosidades' },
    { nombre: 'Paso a paso', slug: 'paso-a-paso' },
    { nombre: 'Arquitectura', slug: 'arquitectura' },
    { nombre: 'Tips', slug: 'tips' },
    { nombre: 'Sin categoría', slug: 'sin-categoria' },
  ];
  
  const categoryMap: Record<string, string> = {};
  
  for (const cat of categorias) {
    // Check if exists
    const { data: existing } = await supabase
      .from('blog_categorias')
      .select('id')
      .eq('slug', cat.slug)
      .single();
    
    if (existing) {
      categoryMap[cat.nombre] = existing.id;
    } else {
      // Create new
      const { data: created, error } = await supabase
        .from('blog_categorias')
        .insert({ ...cat, empresa_id: EMPRESA_ID })
        .select('id')
        .single();
      
      if (!error && created) {
        categoryMap[cat.nombre] = created.id;
      }
    }
  }
  
  console.log(`✅ ${Object.keys(categoryMap).length} categorías disponibles`);
  return categoryMap;
}

async function getOrCreateAuthor(): Promise<string | null> {
  // Return null since autor_id is nullable and we don't have a valid author
  return null;
}

function generateRandomRecentDate(index: number, total: number): string {
  // Distribute dates across last 6 months
  const now = new Date();
  const daysAgo = Math.floor((index / total) * 180); // Spread across 6 months
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

async function fetchAllPosts(): Promise<WPPost[]> {
  console.log('📊 Obteniendo artículos del blog...');
  
  const allPosts: WPPost[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await fetch(`${BLOG_URL}&page=${page}`);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        hasMore = false;
        break;
      }
      
      const posts = data as WPPost[];
      
      if (posts.length === 0) {
        hasMore = false;
      } else {
        allPosts.push(...posts);
        console.log(`  Página ${page}: ${posts.length} artículos`);
        page++;
      }
    } catch (error) {
      console.error(`Error en página ${page}:`, error);
      hasMore = false;
    }
  }
  
  console.log(`✅ Total: ${allPosts.length} artículos`);
  return allPosts;
}

async function importBlog() {
  try {
    console.log('🚀 Iniciando importación del blog...\n');
    
    // Preparar categorías
    const categoryMap = await getOrCreateCategories();
    const defaultAuthorId = await getOrCreateAuthor();
    
    // Obtener posts
    const posts = await fetchAllPosts();
    
    let successCount = 0;
    let errorCount = 0;
    
    // Procesar cada post
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const shortTitle = post.title.rendered.replace(/<[^>]*>/g, '').substring(0, 40);
      console.log(`\n[${i + 1}/${posts.length}] ${shortTitle}...`);
      
      // Obtener categoría
      const categoryName = post._embedded?.['wp:term']?.[0]
        ?.find(t => t.taxonomy === 'category')?.name || 'Sin categoría';
      const categoriaId = categoryMap[categoryName] || categoryMap['Sin categoría'];
      
      // Descargar imagen
      let imageUrl: string | null = null;
      let imageAlt = '';
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        imageAlt = media.alt_text || shortTitle;
        const filename = `${post.slug}-featured.jpg`;
        imageUrl = await downloadImage(media.source_url, filename);
        if (imageUrl) console.log(`  📷 Imagen descargada`);
      }
      
      // Limpiar contenido
      const content = post.content.rendered
        .replace(/<!-- .*? -->/g, '')
        .replace(/\n{3,}/g, '\n\n');
      
      const excerpt = post.excerpt.rendered
        .replace(/<[^>]*>/g, '')
        .replace(/\[&hellip;\]/g, '...')
        .trim()
        .substring(0, 200);
      
      // Generar fecha reciente (no la de 2022)
      const recentDate = generateRandomRecentDate(i, posts.length);
      
      // Determinar si es premium (con BlisCoins)
      const esPremium = PREMIUM_ARTICLES.includes(i);
      const precioCoins = esPremium ? 15 : null;
      const recompensaCoins = esPremium ? 10 : null;
      const recompensaSegundos = esPremium ? 600 : null; // 10 min de lectura
      
      // Calcular tiempo de lectura
      const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const tiempoLectura = Math.ceil(wordCount / 200); // 200 palabras/min
      
      // Crear artículo
      // First check if slug exists
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', post.slug)
        .single();
      
      const postData = {
        empresa_id: EMPRESA_ID,
        titulo: post.title.rendered.replace(/<[^>]*>/g, ''),
        slug: post.slug,
        contenido: content,
        extracto: excerpt || post.title.rendered.replace(/<[^>]*>/g, '').substring(0, 200),
        imagen_portada: imageUrl,
        imagen_alt: imageAlt,
        categoria_id: categoriaId,
        estado: 'publicado',
        publicado_en: recentDate,
        creado_en: recentDate,
        actualizado_en: recentDate,
        es_premium: esPremium,
        precio_coins: precioCoins,
        recompensa_coins: recompensaCoins,
        recompensa_segundos: recompensaSegundos,
        tiempo_lectura_minutos: tiempoLectura,
        vistas: Math.floor(Math.random() * 500) + 50,
      };
      
      let error;
      if (existingPost) {
        // Update existing
        const result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', existingPost.id);
        error = result.error;
      } else {
        // Insert new
        const result = await supabase
          .from('blog_posts')
          .insert(postData);
        error = result.error;
      }
      
      if (error) {
        console.error(`  ❌ Error:`, error.message);
        errorCount++;
      } else {
        console.log(`  ✅ Guardado${esPremium ? ' (BlisCoins)' : ''}`);
        successCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ Importación completada!');
    console.log(`📊 Exitosos: ${successCount}`);
    console.log(`📊 Errores: ${errorCount}`);
    console.log(`📊 Total artículos: ${posts.length}`);
    console.log(`🪙 Artículos con BlisCoins: ${PREMIUM_ARTICLES.length}`);
    
  } catch (error) {
    console.error('❌ Error en importación:', error);
  }
}

importBlog();