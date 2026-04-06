import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const estado = searchParams.get('estado');
    const asesorId = searchParams.get('asesor_id');
    
    let query = supabase
      .from('campanas')
      .select(`
        *,
        asesor:asesores(id, nombre, email, telefono, whatsapp)
      `)
      .order('creado_en', { ascending: false });
    
    if (estado) {
      query = query.eq('estado', estado);
    }
    
    if (asesorId) {
      query = query.eq('asesor_id', asesorId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/campanas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const {
      nombre,
      descripcion,
      asesor_id,
      notificar_email = true,
      notificar_whatsapp = false,
      emails_notificacion = [],
      whatsapp_notificacion = [],
      notion_database_id,
      notion_sync = false
    } = body;
    
    const empresaId = '6186f014-c8c7-4027-9f08-8acf2bae3eae'; // TODO: Obtener del contexto
    
    const { data, error } = await supabase
      .from('campanas')
      .insert({
        empresa_id: empresaId,
        nombre,
        descripcion,
        asesor_id,
        notificar_email,
        notificar_whatsapp,
        emails_notificacion,
        whatsapp_notificacion,
        notion_database_id,
        notion_sync,
        estado: 'activa'
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/campanas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}