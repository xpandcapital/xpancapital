import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('nombre')

    if (error) {
      // If roles table doesn't exist yet, return defaults
      return NextResponse.json({
        success: true,
        data: [
          { id: '1', nombre: 'usuario', label: 'Usuario', permisos: ['ver_productos', 'comprar'], color: '#6b7280' },
          { id: '2', nombre: 'cliente', label: 'Cliente', permisos: ['ver_productos', 'comprar', 'ver_historial', 'favoritos'], color: '#3b82f6' },
          { id: '3', nombre: 'editor', label: 'Editor', permisos: ['ver_productos', 'comprar', 'ver_historial', 'favoritos', 'editar_contenido', 'crear_posts'], color: '#8b5cf6' },
          { id: '4', nombre: 'admin', label: 'Admin', permisos: ['ver_productos', 'comprar', 'ver_historial', 'favoritos', 'editar_contenido', 'crear_posts', 'gestionar_productos', 'ver_analiticas', 'gestionar_usuarios'], color: '#f59e0b' },
          { id: '5', nombre: 'superadmin', label: 'Super Admin', permisos: ['*'], color: '#be0b3c' },
        ],
      })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { nombre, label, descripcion, permisos, color } = body

    if (!nombre || !label) {
      return NextResponse.json({ error: 'Nombre y label son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('roles')
      .insert({ nombre, label, descripcion, permisos, color: color || '#6b7280' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}