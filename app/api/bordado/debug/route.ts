import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { getApiKey } from '@/lib/api-keys'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 15
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const diagnostics: Record<string, any> = {}

  try {
    const auth = await getAuthUser(request)
    diagnostics.auth = auth ? {
      userId: auth.userId?.slice(0, 8) + '...',
      empresaId: auth.empresaId?.slice(0, 8) + '...',
      rol: auth.rol
    } : null

    if (!auth) {
      return NextResponse.json({ error: 'No autenticado', diagnostics }, { status: 401 })
    }

    const supabase = createClient()

    const replicateKey = await getApiKey(supabase, 'replicate_key', auth.userId, auth.empresaId)
    diagnostics.replicate_key = {
      found: !!replicateKey,
      preview: replicateKey ? replicateKey.slice(0, 6) + '...' : null
    }

    if (replicateKey) {
      try {
        const res = await fetch('https://api.replicate.com/v1/models', {
          headers: { Authorization: `Token ${replicateKey}` }
        })
        diagnostics.replicate_connection = {
          status: res.status,
          ok: res.ok
        }
      } catch (e: any) {
        diagnostics.replicate_connection = { error: e.message }
      }
    }

    const geminiKey = await getApiKey(supabase, 'gemini_key', auth.userId, auth.empresaId)
    diagnostics.gemini_key = {
      found: !!geminiKey,
      preview: geminiKey ? geminiKey.slice(0, 6) + '...' : null
    }

    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`
        )
        diagnostics.gemini_connection = {
          status: res.status,
          ok: res.ok
        }
      } catch (e: any) {
        diagnostics.gemini_connection = { error: e.message }
      }
    }

    return NextResponse.json({ ok: true, diagnostics })
  } catch (error: any) {
    diagnostics.error = error.message
    return NextResponse.json({ ok: false, diagnostics }, { status: 500 })
  }
}
