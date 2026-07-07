import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { verifyTurnstileToken } from '@/lib/bot-protection'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const EMPRESA_ID = DEFAULT_EMPRESA_ID

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'cvs'
    const token = formData.get('cf_turnstile_response') as string | null

    // Verificación Turnstile
    const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey)
    const { data: siteConfig } = await serviceSupabase.from('site_config').select('security_config').eq('empresa_id', EMPRESA_ID).single()
    const bp = siteConfig?.security_config?.bot_protection
    if (bp?.habilitado && bp?.rutas?.some((r: { ruta: string; habilitado: boolean }) => r.habilitado && r.ruta === '/api/postulantes/upload')) {
      const result = await verifyTurnstileToken(token || '', bp.secret_key)
      if (!result.success) return NextResponse.json({ error: 'Verificación de seguridad fallida' }, { status: 400 })
    }

    if (!file) return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF, DOC y DOCX' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo no puede superar los 10MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const path = `${folder}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('postulantes')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: urlData } = supabase.storage.from('postulantes').getPublicUrl(path)

    return NextResponse.json({ success: true, url: urlData.publicUrl, path })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    if (!path) return NextResponse.json({ error: 'Path es requerido' }, { status: 400 })

    const { error } = await supabase.storage.from('postulantes').remove([path])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}