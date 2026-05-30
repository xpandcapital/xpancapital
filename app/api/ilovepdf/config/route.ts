import { NextResponse } from 'next/server'
import { getApiKeyForRequest } from '@/lib/api-keys'

export async function GET(request: Request) {
  try {
    const publicKey = await getApiKeyForRequest(request as unknown as import('next/server').NextRequest, 'ilovepdf_public_key')

    return NextResponse.json({
      publicKey: publicKey || null,
    })
  } catch {
    return NextResponse.json({ publicKey: null, error: 'No autorizado' }, { status: 401 })
  }
}
