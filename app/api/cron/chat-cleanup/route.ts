import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Verificar que es una solicitud autorizada (cron de Vercel)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Eliminar archivos antiguos (>30 días)
    const { data: archivosAntiguos, error: archivosError } = await supabaseAdmin
      .from("chat_mensajes")
      .update({
        archivo_eliminado: true,
        archivo_eliminado_en: new Date().toISOString(),
      })
      .in("tipo", ["imagen", "video", "audio", "archivo"])
      .eq("archivo_eliminado", false)
      .lt("creado_en", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .select("id, archivo_url");

    if (archivosError) throw archivosError;

    // 2. Eliminar archivos físicos de Storage
    if (archivosAntiguos && archivosAntiguos.length > 0) {
      const archivosAEliminar = archivosAntiguos
        .filter((m) => m.archivo_url)
        .map((m) => {
          // Extraer path del archivo_url
          const url = new URL(m.archivo_url);
          const pathParts = url.pathname.split("/");
          return pathParts.slice(pathParts.indexOf("chat-media") + 1).join("/");
        });

      if (archivosAEliminar.length > 0) {
        await supabaseAdmin.storage.from("chat-media").remove(archivosAEliminar);
      }
    }

    // 3. Limpiar visitantes inactivos (>7 días sin actividad)
    const { error: visitantesError } = await supabaseAdmin
      .from("chat_visitantes")
      .update({ estado: "cerrado" })
      .eq("estado", "activo")
      .lt("ultima_actividad", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (visitantesError) throw visitantesError;

    // 4. Limpiar presencia antigua (>5 minutos sin ping)
    const { error: presenciaError } = await supabaseAdmin
      .from("chat_presencia")
      .update({ estado: "offline" })
      .neq("estado", "offline")
      .lt("ultimo_ping", new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (presenciaError) throw presenciaError;

    return NextResponse.json({
      success: true,
      archivos_eliminados: archivosAntiguos?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[cron/chat-cleanup] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
