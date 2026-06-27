import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*, lots:project_lots(*)')
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 404 })

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()
    const body = await request.json()

    if (body.id && body.id.toUpperCase() !== id.toUpperCase()) {
      const { data: existing } = await supabase.from('projects').select('id').eq('id', id).single()
      if (existing) {
        const { data: newData, error: insertError } = await supabase
          .from('projects')
            .insert([{ ...body, id: body.id.toUpperCase(), order_index: (existing as any).order_index ?? 0 }])
          .select()
          .single()
        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
        await supabase.from('project_lots').update({ project_id: body.id.toUpperCase() }).eq('project_id', id)
        await supabase.from('projects').delete().eq('id', id)
        return NextResponse.json({ success: true, data: newData })
      }
    }

    const { id: bodyId, ...updates } = body
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()

    await supabase.from('project_lots').delete().eq('project_id', id)
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}