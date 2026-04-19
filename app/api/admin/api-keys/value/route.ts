import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const keyName = searchParams.get('key')

    if (!keyName) {
      return NextResponse.json({ error: 'key parameter is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('key_name', keyName)
      .eq('empresa_id', EMPRESA_ID)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Key not found', value: null }, { status: 404 })
    }

    return NextResponse.json({ value: data.key_value })
  } catch (error) {
    console.error('[API Keys Value] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}