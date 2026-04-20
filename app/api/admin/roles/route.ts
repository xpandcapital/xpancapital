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
      return NextResponse.json({ success: true, data: [
        { id: '1', nombre: 'usuario', label: 'Usuario', permisos: ['miembros:ver', 'productos:ver', 'perfil:ver', 'perfil:editar'] },
        { id: '2', nombre: 'cliente', label: 'Cliente', permisos: ['miembros:ver', 'productos:ver', 'cursos:ver', 'certificados:ver', 'perfil:ver', 'perfil:editar', 'facturacion:ver'] },
        { id: '3', nombre: 'editor', label: 'Editor', permisos: ['dashboard:ver', 'proyectos:ver', 'lotes:ver', 'contratos:ver', 'asesores:ver', 'productos:ver', 'productos:editar', 'clientes:ver', 'cursos:ver', 'cursos:editar', 'leads:ver', 'blog:ver', 'blog:crear', 'equipo:ver', 'perfil:ver', 'perfil:editar'] },
        { id: '4', nombre: 'admin', label: 'Admin', permisos: ['*'] },
        { id: '5', nombre: 'superadmin', label: 'Super Admin', permisos: ['*'] },
      ] })
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

    if (updates.permisos) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('rol', data.nombre)

      if (profiles && profiles.length > 0) {
        console.log(`[Roles API] Role "${data.nombre}" updated, ${profiles.length} profiles may be affected`)
      }
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

    const { data: role } = await supabase
      .from('roles')
      .select('nombre')
      .eq('id', id)
      .single()

    const SYSTEM_ROLES = ['superadmin', 'admin', 'editor', 'cliente', 'usuario']
    if (role && SYSTEM_ROLES.includes(role.nombre)) {
      return NextResponse.json({ error: 'No se pueden eliminar los roles del sistema' }, { status: 403 })
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