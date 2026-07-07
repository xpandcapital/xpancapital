import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const tipo = searchParams.get('tipo');
    
    let query = supabase
      .from('integraciones')
      .select('*')
      .eq('activa', true)
      .order('creado_en', { ascending: false });
    
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/integraciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const {
      tipo,
      nombre,
      config,
      activa = true
    } = body;
    
    const empresaId = DEFAULT_EMPRESA_ID; // TODO: Obtener del contexto
    
    // Verificar si ya existe una integración de este tipo
    const { data: existing } = await supabase
      .from('integraciones')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('tipo', tipo)
      .single();
    
    let result;
    
    if (existing) {
      // Actualizar existente
      const { data, error } = await supabase
        .from('integraciones')
        .update({
          nombre,
          config,
          activa,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Crear nueva
      const { data, error } = await supabase
        .from('integraciones')
        .insert({
          empresa_id: empresaId,
          tipo,
          nombre,
          config,
          activa
        })
        .select()
        .single();
      
      result = { data, error };
    }
    
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('[API Error] /api/integraciones:', error);
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
      .from('integraciones')
      .update({
        ...updates,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/integraciones:', error);
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
      .from('integraciones')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Error] /api/integraciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}