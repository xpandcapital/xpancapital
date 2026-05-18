import { NextRequest, NextResponse } from 'next/server'
import { getReplicateKey, segmentWithSAM2 } from '@/lib/embroidery/client'

export const maxDuration = 120
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'Se requiere imageUrl' }, { status: 400 })
    }

    const token = await getReplicateKey(request)
    const masks = await segmentWithSAM2(imageUrl, token)

    return NextResponse.json({ masks, count: masks.length })
  } catch (error: any) {
    console.error('[segment] Error:', error)
    return NextResponse.json({ error: error.message || 'Error segmentando imagen' }, { status: 500 })
  }
}
