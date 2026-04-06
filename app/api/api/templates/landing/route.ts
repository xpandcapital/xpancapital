import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('estado', 'activo')
      .eq('tipo_contenido', 'landing')
      .eq('es_principal', true)
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se encontró template activo' 
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