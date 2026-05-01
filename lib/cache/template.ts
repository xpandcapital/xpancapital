import { unstable_cache } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export const getCachedLandingTemplate = unstable_cache(
  async () => {
    const { data } = await supabaseAdmin
      .from('templates')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('tipo_contenido', 'landing')
      .eq('es_principal', true)
      .eq('estado', 'activo')
      .maybeSingle()
    return data
  },
  ['landing-template'],
  { revalidate: 86400, tags: ['landing-template'] }
)

export const getCachedSiteConfig = unstable_cache(
  async () => {
    const { data } = await supabaseAdmin
      .from('site_config')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()
    return data
  },
  ['site-config'],
  { revalidate: 86400, tags: ['site-config', 'landing-template'] }
)
