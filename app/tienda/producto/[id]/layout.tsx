import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blis-corp.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const { data: producto } = await supabaseAdmin
      .from('productos')
      .select('nombre, slug, imagen_principal, meta_descripcion, meta_titulo, descripcion')
      .eq('slug', id)
      .single()

    if (!producto) {
      return {
        title: 'Producto no encontrado',
      }
    }

    const titulo = producto.meta_titulo || producto.nombre
    const descripcion = producto.meta_descripcion || producto.descripcion?.replace(/<[^>]*>/g, '').substring(0, 160) || ''
    const imagen = producto.imagen_principal || undefined
    const url = `${SITE_URL}/tienda/producto/${producto.slug}`

    return {
      title: titulo,
      description: descripcion,
      openGraph: {
        title: titulo,
        description: descripcion,
        url,
        siteName: 'BLIS Corp',
        type: 'website',
        ...(imagen && { images: [{ url: imagen, width: 1200, height: 630, alt: producto.nombre }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: titulo,
        description: descripcion,
        ...(imagen && { images: [imagen] }),
      },
    }
  } catch {
    return {
      title: 'Producto',
    }
  }
}

export default function ProductoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
