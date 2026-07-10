import { NextRequest, NextResponse } from 'next/server'
import { getCachedLandingTemplate } from '@/lib/cache/template'

export async function GET(request: NextRequest) {
  try {
    const data = await getCachedLandingTemplate()

    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se encontró template activo' 
      }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ 
      success: false, 
      error: 'Error del servidor' 
    }, { status: 500 })
  }
}
