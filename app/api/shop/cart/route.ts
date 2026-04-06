import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'user_id requerido' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Error de configuración' }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin
      .from('carritos')
      .select('items')
      .eq('user_id', userId)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      items: data?.items || [] 
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, items } = body
    
    if (!user_id) {
      return NextResponse.json({ success: false, error: 'user_id requerido' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Error de configuración' }, { status: 500 })
    }

    const { error: upsertError } = await supabaseAdmin
      .from('carritos')
      .upsert({
        user_id,
        empresa_id: DEFAULT_EMPRESA_ID,
        items: items || [],
        actualizado_en: new Date().toISOString()
      }, {
        onConflict: 'empresa_id,user_id'
      })

    if (upsertError) {
      return NextResponse.json({ success: false, error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'user_id requerido' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Error de configuración' }, { status: 500 })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('carritos')
      .delete()
      .eq('user_id', userId)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}