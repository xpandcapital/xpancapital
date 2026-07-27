import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const EMPRESA_ID = 'e8d21d17-e708-49c8-8975-e782b1223b1a'

interface Article {
  titulo: string
  seo_title: string
  seo_description: string
  extracto: string
  categoria: string
  tags: string[]
  contenido: string
}

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[¿?¡!:,.\/]/g, '')
    .replace(/\s+/g, '-')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .substring(0, 80)
}

async function main() {
  const categorias = (await supabase.from('blog_categorias').select('id,nombre').eq('empresa_id', EMPRESA_ID)).data || []
  const catMap: Record<string, string> = {}
  for (const c of categorias) catMap[c.nombre.toLowerCase()] = c.id
  
  console.log(`📂 Categorías: ${Object.keys(catMap).join(', ')}`)

  let articles: Article[] = []
  const jsonPath = join(process.cwd(), 'data', 'articulos-blog.json')
  if (existsSync(jsonPath)) {
    articles = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    console.log(`✅ ${articles.length} artículos cargados desde JSON`)
  }

  let inserted = 0
  for (const a of articles) {
    const catId = (catMap as any)[a.categoria.toLowerCase()]
    if (!catId) { console.log(`⚠️ Categoría no encontrada: ${a.categoria}`); continue }

    const slug = slugify(a.titulo)
    const { error } = await supabase.from('blog_posts').upsert({
      empresa_id: EMPRESA_ID,
      titulo: a.titulo,
      slug,
      contenido: a.contenido,
      extracto: a.extracto,
      seo_title: a.seo_title,
      seo_description: a.seo_description,
      categoria_id: catId,
      imagen_portada: '/images/blog/default.jpg',
      imagen_alt: `Xpand Capital - ${a.titulo}`,
      estado: 'publicado',
      tiempo_lectura_minutos: Math.max(3, Math.floor(a.contenido.length / 800)),
      visibilidad: 'publico',
    }, { onConflict: 'slug' })

    if (error) {
      if (error.code === '23505') console.log(`⏭️ Ya existe: ${a.titulo.substring(0, 60)}`)
      else console.log(`❌ Error: ${a.titulo.substring(0, 60)} - ${error.message}`)
    } else {
      inserted++
      console.log(`✅ [${inserted}] ${a.titulo.substring(0, 60)}`)
    }
  }

  console.log(`\n📊 Insertados: ${inserted} de ${articles.length}`)
}

main().catch(console.error)
