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
      .from("chat_config")
      .select("*")
      .eq("empresa_id", auth.empresaId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    // Si no existe, crear configuración por defecto
    if (!data) {
      const { data: newConfig, error: createError } = await supabaseAdmin
        .from("chat_config")
        .insert({
          empresa_id: auth.empresaId,
          widget_activo: true,
          widget_color: "#ef4444",
          widget_posicion: "bottom-right",
          widget_mensaje_bienvenida: "¡Hola! Bienvenido a BLIS Corp. ¿En qué podemos ayudarte hoy?",
          widget_mensaje_fuera_horario: "Gracias por contactarnos. En este momento no hay asesores disponibles, pero dejaste tu mensaje y te responderemos lo antes posible.",
          horario_atencion: { lunes: "09:00-18:00", martes: "09:00-18:00", miercoles: "09:00-18:00", jueves: "09:00-18:00", viernes: "09:00-18:00" },
          ia_activa: false,
          ia_modelo: "gemini-1.5-flash",
          ia_prompt_sistema: "Eres un asistente virtual amigable de BLIS Corp, una empresa de tecnología y bienes raíces. Responde de manera profesional y concisa. Si no sabes algo, ofrece transferir la conversación a un asesor humano.",
          ia_max_tokens: 1024,
          derivacion_automatica: true,
          derivacion_despues_mensajes: 3,
          palabras_clave_derivacion: ["asesor", "agente", "humano", "persona", "llamada", "teléfono"],
          notificar_email: true,
          notificar_push: true,
          sonido_nuevo_mensaje: true,
          permitir_archivos: true,
          max_file_size_mb: 10,
          tipos_archivo_permitidos: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "txt"],
          paginas_widget: ["/", "/tienda", "/blog", "/contacto", "/proyectos"],
        })
        .select()
        .single();

      if (createError) throw createError;
      return NextResponse.json({ success: true, data: newConfig });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[chat/config GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from("chat_config")
      .update(body)
      .eq("empresa_id", auth.empresaId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[chat/config PUT] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
