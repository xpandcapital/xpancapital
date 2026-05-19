import { NextRequest, NextResponse } from 'next/server'
import { getReplicateKey, enhanceImage } from '@/lib/embroidery/client'

export const maxDuration = 120
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, scale = 4 } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'Se requiere imageUrl' }, { status: 400 })
    }

    const token = await getReplicateKey(request)
    const resultUrl = await enhanceImage(imageUrl, scale, token)

    return NextResponse.json({ url: resultUrl })
  } catch (error: any) {
    console.error('[enhance] Error:', error)
    return NextResponse.json({ error: error.message || 'Error mejorando imagen' }, { status: 500 })
  }
}
