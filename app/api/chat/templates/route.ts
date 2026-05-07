import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Listar plantillas de la empresa
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departamento = searchParams.get("departamento");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabaseAdmin
      .from("chat_plantillas")
      .select("*")
      .eq("empresa_id", auth.empresaId)
      .eq("activo", true)
      .order("titulo", { ascending: true });

    if (departamento) {
      query = query.eq("departamento", departamento);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error("[chat/templates GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear plantilla
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { titulo, contenido, departamento = "general", atajo } = body;

    if (!titulo?.trim() || !contenido?.trim()) {
      return NextResponse.json(
        { error: "Título y contenido son requeridos" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from("chat_plantillas")
      .insert({
        empresa_id: auth.empresaId,
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        departamento,
        atajo: atajo?.trim() || null,
        activo: true,
        creado_por: auth.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[chat/templates POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar plantilla
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de plantilla requerido" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from("chat_plantillas")
      .select("id")
      .eq("id", id)
      .eq("empresa_id", auth.empresaId)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("chat_plantillas")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[chat/templates PUT] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar plantilla (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de plantilla requerido" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from("chat_plantillas")
      .select("id")
      .eq("id", id)
      .eq("empresa_id", auth.empresaId)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from("chat_plantillas")
      .update({ activo: false })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[chat/templates DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
