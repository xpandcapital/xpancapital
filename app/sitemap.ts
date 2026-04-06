import { MetadataRoute } from 'next'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function fetchPosts() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/blog_posts?select=slug,actualizado_en&empresa_id=eq.${DEFAULT_EMPRESA_ID}&estado=eq.publicado`, {
      headers: {
        'apikey': supabaseServiceKey!,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    })
    return await response.json()
  } catch {
    return []
  }
}

async function fetchProducts() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/productos?select=slug,actualizado_en&empresa_id=eq.${DEFAULT_EMPRESA_ID}&activo=eq.true`, {
      headers: {
        'apikey': supabaseServiceKey!,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    })
    return await response.json()
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blis-corp.com'
  
  const posts = await fetchPosts()
  const productsList = await fetchProducts()
  
  const blogUrls = posts.map((post: { slug: string; actualizado_en: string }) => ({
    url: `${baseUrl}/blog/articulo/${post.slug}`,
    lastModified: post.actualizado_en ? new Date(post.actualizado_en) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const productUrls = productsList.map((product: { slug: string; actualizado_en: string }) => ({
    url: `${baseUrl}/tienda/producto/${product.slug}`,
    lastModified: product.actualizado_en ? new Date(product.actualizado_en) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tienda`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/miembros/perfil`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/tienda/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...blogUrls,
    ...productUrls,
  ]
}