import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/supabase/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { profilePic, nombre, apellido, telefono } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const updates: Record<string, unknown> = {}

    if (nombre !== undefined) updates.nombre = nombre
    if (apellido !== undefined) updates.apellido = apellido
    if (telefono !== undefined) updates.telefono = telefono

    // Subir avatar a Storage si es base64
    if (profilePic && typeof profilePic === 'string' && profilePic.startsWith('data:image')) {
      try {
        const fileExt = profilePic.includes('image/png') ? 'png' : 'jpg'
        const fileName = `avatars/${user.userId}-${Date.now()}.${fileExt}`
        const base64Data = profilePic.split(',')[1]
        const buffer = Buffer.from(base64Data, 'base64')

        // Intentar subir, crear bucket si no existe
        let uploadResult = await supabase.storage
          .from('cms-images')
          .upload(fileName, buffer, {
            contentType: profilePic.includes('image/png') ? 'image/png' : 'image/jpeg',
            upsert: true,
          })

        if (uploadResult.error?.message?.includes('Bucket')) {
          await supabase.storage.createBucket('cms-images', { public: true })
          uploadResult = await supabase.storage
            .from('cms-images')
            .upload(fileName, buffer, {
              contentType: profilePic.includes('image/png') ? 'image/png' : 'image/jpeg',
              upsert: true,
            })
        }

        if (!uploadResult.error) {
          const { data: urlData } = supabase.storage.from('cms-images').getPublicUrl(uploadResult.data.path)
          if (urlData?.publicUrl) {
            updates.avatar_url = urlData.publicUrl
          }
        }
      } catch (err) {
        console.error('[avatar] Upload error:', err)
      }
    } else if (profilePic === null) {
      updates.avatar_url = null
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.userId)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, data: { avatar_url: updates.avatar_url || null, ...updates } })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}
