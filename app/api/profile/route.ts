import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/supabase/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const SOCIAL_FIELDS = [
  'website_url', 'facebook_url', 'instagram_url', 'twitter_url',
  'youtube_url', 'linkedin_url', 'tiktok_url', 'whatsapp_url',
  'telegram_url', 'discord_url', 'github_url'
] as const

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data, error } = await supabase
      .from('profiles')
      .select('nombre, apellido, avatar_url, biografia, pais, ciudad, ' + SOCIAL_FIELDS.join(', ') + ', telefono')
      .eq('id', user.userId)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { profilePic, nombre, apellido, telefono, biografia } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const updates: Record<string, unknown> = {}

    if (nombre !== undefined) updates.nombre = nombre
    if (apellido !== undefined) updates.apellido = apellido
    if (telefono !== undefined) updates.telefono = telefono
    if (biografia !== undefined) updates.biografia = biografia

    // Redes sociales
    for (const field of SOCIAL_FIELDS) {
      if (field in body) {
        const val = body[field]
        updates[field] = val === '' ? null : val
      }
    }

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
