import { NextResponse } from 'next/server'
import { collectScanData, runGeminiScan } from '@/lib/security-scanner'

export async function POST() {
  try {
    const rawData = await collectScanData()
    const result = await runGeminiScan(rawData)
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('[Scanner API] Error:', err)
    return NextResponse.json({ success: false, error: 'Error al ejecutar el escaneo' }, { status: 500 })
  }
}
