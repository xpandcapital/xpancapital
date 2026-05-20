import { unstable_cache } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export const getCachedProjects = unstable_cache(
  async () => {
    const { data } = await supabaseAdmin
      .from('projects')
      .select('id, name, status, website, location, description, cover_image, gallery_images, logo_url, primary_color, secondary_color, start_date, end_date, order_index')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('order_index', { ascending: true, nullsFirst: false })
      .limit(50)
    return data || []
  },
  ['landing-projects'],
  { revalidate: 120, tags: ['landing-projects'] }
)

export const getCachedProducts = unstable_cache(
  async () => {
    const { data } = await supabaseAdmin
      .from('productos')
      .select(`
        *,
        categoria:producto_categorias(id, nombre, slug, icono)
      `)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('activo', true)
      .order('creado_en', { ascending: false })
    return data || []
  },
  ['landing-products'],
  { revalidate: 120, tags: ['landing-products'] }
)

export const getCachedCategories = unstable_cache(
  async () => {
    const { data } = await supabaseAdmin
      .from('producto_categorias')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('activo', true)
      .order('orden', { ascending: true })
    return data || []
  },
  ['landing-categories'],
  { revalidate: 120, tags: ['landing-categories'] }
)
