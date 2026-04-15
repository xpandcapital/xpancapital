import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    const empresaId = searchParams.get('empresa_id') || EMPRESA_ID;
    const estado = searchParams.get('estado');

    let query = supabase
      .from('postulantes')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('creado_en', { ascending: false });

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/postulantes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const {
      nombre,
      apellido,
      email,
      telefono,
      puesto,
      linkedin_url,
      experiencia_años = 0,
      nota,
      cv_url,
      estado = 'nuevo',
    } = body;

    const empresaId = body.empresa_id || EMPRESA_ID;

    const { data, error } = await supabase
      .from('postulantes')
      .insert({
        empresa_id: empresaId,
        nombre,
        apellido,
        email,
        telefono,
        puesto,
        linkedin_url,
        experiencia_años,
        nota,
        cv_url,
        estado,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/postulantes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { ...updates } = body;

    const { data, error } = await supabase
      .from('postulantes')
      .update({ ...updates, actualizado_en: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/postulantes:', error);
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
      .from('postulantes')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Error] /api/postulantes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}