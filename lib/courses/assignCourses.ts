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

  const cursoProducts = productos.filter(
    (p) => p.productType === 'curso' || p.tipo === 'servicio'
  )

  for (const product of cursoProducts) {
    try {
      let cursoId = product.curso_id || null
      let cursoExists = !!cursoId

      if (!cursoExists && (product.slug || product.producto_id || product.id)) {
        const lookup = product.slug || product.producto_id || product.id
        const { data: cursoBySlug } = await supabase
          .from('cursos')
          .select('id')
          .eq('slug', lookup)
          .maybeSingle()
        if (cursoBySlug) {
          cursoId = cursoBySlug.id
          cursoExists = true
        }
      }

      if (!cursoExists && product.id) {
        const { data: cursoData } = await supabase
          .from('cursos')
          .select('id')
          .eq('id', product.id)
          .maybeSingle()
        if (cursoData) {
          cursoId = cursoData.id
          cursoExists = true
        }
      }

      if (!cursoExists) {
        error = error || `No se encontró el curso vinculado al producto "${product.nombre || product.id}"`
        continue
      }

      if (cursoExists && cursoId) {
        const { data: advisor } = await supabase
          .from('advisors')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle()

        let advisorId = advisor?.id
        if (!advisorId) {
          const { data: newAdvisor, error: createAdvError } = await supabase
            .from('advisors')
            .insert({
              email: email.toLowerCase(),
              name: nombre || email.split('@')[0],
            })
            .select('id')
            .single()
          if (createAdvError) {
            error = 'No se pudo crear el registro de asesor'
            continue
          }
          advisorId = newAdvisor?.id
        }

        if (advisorId) {
          const { error: assignError } = await supabase.from('equipo_cursos').insert({
            advisor_id: advisorId,
            curso_id: cursoId,
            user_id: userId,
            estado: 'asignado',
            lecciones_completadas: [],
          })

          if (assignError && assignError.code !== '23505') {
            error = 'Error al asignar el curso'
          } else if (!assignError) {
            assigned++
          } else if (assignError?.code === '23505') {
            await supabase
              .from('equipo_cursos')
              .update({ user_id: userId, estado: 'asignado' })
              .eq('advisor_id', advisorId)
              .eq('curso_id', cursoId)
            assigned++
          }
        }
      }
    } catch (e) {
      console.error('[assignCoursesToUser] Error en auto-asignación de curso:', e)
      error = 'Error interno al asignar curso'
    }
  }

  return { assigned, error }
}
