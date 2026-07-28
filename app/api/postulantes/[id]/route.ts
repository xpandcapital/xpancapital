import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const EMPRESA_ID = DEFAULT_EMPRESA_ID

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()

    const { data: postulante, error } = await supabase
      .from('postulantes')
      .select('*')
      .eq('id', id)
      .eq('empresa_id', EMPRESA_ID)
      .single()

    if (error) return NextResponse.json({ error: 'Postulante no encontrado' }, { status: 404 })

    let puesto = null
    if (postulante.puesto_trabajo_id) {
      const { data: pData } = await supabase
        .from('puestos_trabajo')
        .select('id, nombre, slug')
        .eq('id', postulante.puesto_trabajo_id)
        .single()
      puesto = pData
    }

    return NextResponse.json({ success: true, data: { ...postulante, puesto } })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()
    const body = await request.json()

    const { id: _id, puesto: _puesto, creado_en: _c, actualizado_en: _a, ...updates } = body

    if (updates.estado === 'aceptado' && !updates.correo_corporativo && !updates.usuario_creado) {
      const existing = await supabase.from('postulantes').select('correo_contacto').eq('id', id).single()
      if (!existing.data?.correo_contacto) {
        return NextResponse.json({ error: 'Se requiere un correo corporativo para aceptar un postulante' }, { status: 400 })
      }
    }

    const { data: prevData } = await supabase
      .from('postulantes')
      .select('estado, usuario_creado, correo_contacto, nombre_completo, celular_contacto')
      .eq('id', id)
      .single()

    updates.actualizado_en = new Date().toISOString()

    const { data, error } = await supabase
      .from('postulantes')
      .update(updates)
      .eq('id', id)
      .select('*, puesto:puestos_trabajo(id, nombre, slug)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (updates.estado === 'aceptado' && data && !data.usuario_creado) {
      const email = (data.correo_corporativo || data.correo_contacto || '').toLowerCase().trim()
      const password = data.contrasena_asignada || Math.random().toString(36).slice(-10) + 'Aa1!'

      if (email) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === email)

        if (!existingUser) {
          const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              nombre: data.nombre_completo || 'Sin nombre',
              empresa_id: EMPRESA_ID,
            },
          })

          if (!authError && newUser.user?.id) {
            await supabase.from('profiles').upsert({
              id: newUser.user.id,
              email,
              nombre: data.nombre_completo || 'Sin nombre',
              empresa_id: EMPRESA_ID,
              rol: 'empleado',
              telefono: data.celular_contacto || null,
              creado_en: new Date().toISOString(),
            }, { onConflict: 'id' })

            const generatedPassword = data.contrasena_asignada ? null : password
            const patchData: Record<string, any> = { usuario_creado: true, correo_corporativo: email }
            if (generatedPassword) patchData.contrasena_asignada = generatedPassword

            await supabase.from('postulantes').update(patchData).eq('id', id)
          }
        }
      }

      const { data: existingAdvisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('postulante_id', id)
        .single()

      if (!existingAdvisor) {
        await supabase.from('advisors').insert({
          name: data.nombre_completo || 'Sin nombre',
          email: email || data.correo_contacto || '',
          phone: data.celular_contacto || '',
          phone_code: '+593',
          puesto: data.puesto_postula || null,
          lugar_residencia: data.lugar_residencia || null,
          estado_civil: data.estado_civil || null,
          nivel_estudios: data.nivel_estudios || null,
          aspiracion_salarial: data.aspiracion_salarial || null,
          disponibilidad_inmediata: data.disponibilidad_inmediata === 'si' || data.disponibilidad_inmediata === 'Sí',
          disponibilidad_viaje: data.disponibilidad_viaje === 'si' || data.disponibilidad_viaje === 'Sí',
          acceso_tecnologia: data.acceso_tecnologia || null,
          herramientas: data.herramientas_dominadas ? data.herramientas_dominadas.split(',').map((s: string) => s.trim()) : null,
          postulante_id: id,
          aceptado_en: new Date().toISOString(),
          is_active: true,
          notes: `Creado desde postulante. Puesto: ${data.puesto_postula || 'N/A'}${data.experiencia_reciente ? '. Exp: ' + data.experiencia_reciente.substring(0, 100) : ''}`,
        })
      }
    }

    const { data: updatedData } = await supabase
      .from('postulantes')
      .select('*, puesto:puestos_trabajo(id, nombre, slug)')
      .eq('id', id)
      .single()

    return NextResponse.json({ success: true, data: updatedData || data })
  } catch (err: any) {
    console.error('[PUT /api/postulantes/[id]]', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()

    const { error } = await supabase.from('postulantes').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}