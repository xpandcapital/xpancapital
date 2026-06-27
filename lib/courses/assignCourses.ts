import { createClient } from '@supabase/supabase-js'

interface ProductInput {
  producto_id?: string
  id?: string
  slug?: string
  nombre?: string
  productType?: string
  tipo?: string
  curso_id?: string
  precio_unitario?: number
  price?: number
  cantidad?: number
  imagen?: string
}

interface AssignResult {
  assigned: number
  error: string | null
}

export async function assignCoursesToUser(
  supabase: ReturnType<typeof createClient>,
  productos: ProductInput[],
  email: string,
  userId: string,
  nombre: string
): Promise<AssignResult> {
  let assigned = 0
  let error: string | null = null

  if (!productos?.length || !email || !userId) {
    return { assigned, error: 'Faltan datos para asignar cursos' }
  }

  const { data: advisor } = await supabase
    .from('advisors')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  const typedAdvisor = advisor as { id: string } | null
  let advisorId = typedAdvisor?.id
  if (!advisorId) {
    const { data: newAdvisor, error: createAdvError } = await supabase
      .from('advisors')
      .insert({
        email: email.toLowerCase(),
        name: nombre || email.split('@')[0],
      } as never)
      .select('id')
      .single()
    if (createAdvError) {
      return { assigned: 0, error: 'No se pudo crear el registro de asesor' }
    }
    advisorId = (newAdvisor as { id: string } | null)?.id
  }

  if (!advisorId) {
    return { assigned: 0, error: 'No se pudo obtener el ID del asesor' }
  }

  for (const product of productos) {
    try {
      const productoId = product.producto_id || product.id
      if (!productoId) continue

      // Buscar curso_id real desde BD (fuente de verdad)
      const { data: producto } = await supabase
        .from('productos')
        .select('curso_id, nombre')
        .eq('id', productoId)
        .maybeSingle()

      let cursoId = ((producto as { curso_id?: string; nombre?: string } | null)?.curso_id)
        || product.curso_id || null

      // Fallback: buscar por slug del producto si no hay curso_id explícito
      if (!cursoId && product.slug) {
        const { data: cursoBySlug } = await supabase
          .from('cursos')
          .select('id')
          .eq('slug', product.slug)
          .maybeSingle()
        if (cursoBySlug) {
          cursoId = (cursoBySlug as { id: string }).id
        }
      }

      // Fallback: buscar por ID del producto en cursos
      if (!cursoId && productoId) {
        const { data: cursoData } = await supabase
          .from('cursos')
          .select('id')
          .eq('id', productoId)
          .maybeSingle()
        if (cursoData) {
          cursoId = (cursoData as { id: string }).id
        }
      }

      if (!cursoId) continue

      const { error: assignError } = await supabase.from('equipo_cursos').insert({
        advisor_id: advisorId,
        curso_id: cursoId,
        user_id: userId,
        estado: 'asignado',
        lecciones_completadas: [],
      } as never)

      if (assignError && assignError.code !== '23505') {
        console.error('[assignCoursesToUser] Error asignando curso:', assignError)
        error = error || 'Error al asignar el curso'
      } else if (!assignError) {
        assigned++
      } else if (assignError?.code === '23505') {
        const { error: updateError } = await supabase
          .from('equipo_cursos')
          .update({ user_id: userId, estado: 'asignado' } as never)
          .eq('advisor_id', advisorId)
          .eq('curso_id', cursoId) as unknown as { error: { code?: string } | null }
        if (updateError) {
          console.error('[assignCoursesToUser] Error actualizando duplicado:', updateError)
          error = error || 'Error al actualizar curso existente'
        } else {
          assigned++
        }
      }
    } catch (e) {
      console.error('[assignCoursesToUser] Error en auto-asignación de curso:', e)
      error = error || 'Error interno al asignar curso'
    }
  }

  return { assigned, error }
}
