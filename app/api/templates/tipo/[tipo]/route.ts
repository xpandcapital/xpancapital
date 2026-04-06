import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

const VALID_TIPOS = [
  'landing', 'blog', 'blog_post', 'tienda', 'producto',
  'curso', 'leccion', 'proyecto', 'funnel', 'captura',
  'checkout', 'thankyou'
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  try {
    const { tipo } = await params
    
    if (!VALID_TIPOS.includes(tipo)) {
      return NextResponse.json({ 
        success: false, 
        error: `Tipo de template inválido. Tipos válidos: ${VALID_TIPOS.join(', ')}` 
      }, { status: 400 })
    }
    
    const supabase = getSupabase()
    
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('tipo_contenido', tipo)
      .eq('estado', 'activo')
      .eq('es_principal', true)
      .single()

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: `No se encontró template activo para tipo: ${tipo}` 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch {
    return NextResponse.json({ 
      success: false, 
      error: 'Error del servidor' 
    }, { status: 500 })
  }
}