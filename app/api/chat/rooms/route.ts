import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from("chat_salas")
      .select(`
        *,
        miembros:chat_miembros(count)
      `)
      .eq("empresa_id", auth.empresaId)
      .eq("estado", "activo")
      .order("ultima_actividad", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error("[chat/rooms GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { tipo = "directo", nombre, descripcion, miembros = [] } = body;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Crear sala
    const { data: sala, error: salaError } = await supabaseAdmin
      .from("chat_salas")
      .insert({
        empresa_id: auth.empresaId,
        tipo,
        nombre,
        descripcion,
        creado_por: auth.userId,
      })
      .select()
      .single();

    if (salaError) throw salaError;

    // Agregar miembros
    const miembrosInsert = [
      { sala_id: sala.id, user_id: auth.userId, rol_sala: "admin" },
      ...miembros.map((m: string) => ({
        sala_id: sala.id,
        user_id: m,
        rol_sala: "miembro",
      })),
    ];

    await supabaseAdmin.from("chat_miembros").insert(miembrosInsert);

    return NextResponse.json({ success: true, data: sala });
  } catch (error: any) {
    console.error("[chat/rooms POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
