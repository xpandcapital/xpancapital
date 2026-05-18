import { NextRequest, NextResponse } from 'next/server'
import { getReplicateKey, removeBackground } from '@/lib/embroidery/client'

export const maxDuration = 120
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'Se requiere imageUrl' }, { status: 400 })
    }

    const token = await getReplicateKey(request)
    const resultUrl = await removeBackground(imageUrl, token)

    return NextResponse.json({ url: resultUrl })
  } catch (error: any) {
    console.error('[remove-bg] Error:', error)
    return NextResponse.json({ error: error.message || 'Error removiendo fondo' }, { status: 500 })
  }
}
