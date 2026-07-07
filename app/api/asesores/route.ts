import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const activo = searchParams.get('activo');
    
    let query = supabase
      .from('asesores')
      .select('id, nombre, email, telefono, whatsapp, foto_url, activo')
      .order('nombre', { ascending: true });
    
    if (activo !== null) {
      query = query.eq('activo', activo === 'true');
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/asesores:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const {
      nombre,
      email,
      telefono,
      whatsapp,
      foto_url,
      activo = true
    } = body;
    
    const empresaId = DEFAULT_EMPRESA_ID; // TODO: Obtener del contexto
    
    const { data, error } = await supabase
      .from('asesores')
      .insert({
        empresa_id: empresaId,
        nombre,
        email,
        telefono,
        whatsapp,
        foto_url,
        activo
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/asesores:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('asesores')
      .update({ ...updates, actualizado_en: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/asesores:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('asesores')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Error] /api/asesores:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}