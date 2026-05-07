import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const EMPRESA_ID = "6186f014-c8c7-4027-9f08-8acf2bae3eae";

// GET pública - obtener configuración del widget para visitantes
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from("chat_config")
      .select("widget_mensaje_bienvenida, widget_mensaje_fuera_horario, widget_activo, ia_activa, ia_modelo, derivacion_automatica, derivacion_despues_mensajes, palabras_clave_derivacion, paginas_widget, permitir_archivos, max_file_size_mb, tipos_archivo_permitidos, horario_atencion")
      .eq("empresa_id", EMPRESA_ID)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    // Si no existe config, devolver defaults
    const config = data || {
      widget_activo: true,
      widget_mensaje_bienvenida: "¡Hola! Bienvenido a BLIS Corp. ¿En qué podemos ayudarte hoy?",
      widget_mensaje_fuera_horario: "Gracias por contactarnos. En este momento no hay asesores disponibles, pero dejaste tu mensaje y te responderemos lo antes posible.",
      ia_activa: false,
      derivacion_automatica: false,
      paginas_widget: ["/", "/tienda", "/blog", "/contacto", "/proyectos"],
      permitir_archivos: true,
    };

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    console.error("[chat/widget-config] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
