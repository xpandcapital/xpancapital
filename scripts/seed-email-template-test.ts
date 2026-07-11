// Seed: Plantilla de correo de prueba — Xpand Capital
// Ejecutar: $env:NEXT_PUBLIC_SUPABASE_URL="URL"; $env:SUPABASE_SERVICE_ROLE_KEY="KEY"; npx tsx scripts/seed-email-template-test.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://zpseniwasxlvjbffymuq.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwc2VuaXdhc3hsdmpiZmZ5bXVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzcxMjY1MiwiZXhwIjoyMDk5Mjg4NjUyfQ.myjXH7EgTtstgLeTHcGUPAoLvqmHFj-UCiX8rmtg1Jw"

async function seed() {
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } })

  const empresaId = "e8d21d17-e708-49c8-8975-e782b1223b1a"

  // ─── Plantilla: Compra completada ───
  const settings = {
    bodyBg: "#050505",
    containerBg: "#0a0a0a",
    width: 600,
    fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
    sectionGap: 0,
    activePaletteId: "xpand-gold",
    palettes: [
      {
        id: "xpand-gold",
        body_bg: "#050505",
        container_bg: "#0a0a0a",
        text: "#e5e5e5",
        primary_color: "#d5c108",
        secondary_color: "#1a1a1a",
        accent_color: "#d5c108",
      },
    ],
    subject: "¡Gracias por tu compra, {{nombre}}! — Xpand Capital",
    previewText: "Tu pedido ha sido confirmado. Bienvenido a la comunidad.",
    evento: "transaccion_compra_completada_invitado",
  }

  const blocks = [
    {
      id: "hdr-001",
      type: "header",
      content: {
        logoUrl: "/images/logo%20expand%20blanco%20vertical.png",
        logoWidth: 180,
        logoAlign: "center",
        backgroundColor: "#050505",
      },
    },
    {
      id: "txt-001",
      type: "text",
      content: {
        text: `<h1 style="color:#d5c108;font-size:28px;margin:0 0 12px;font-family:'Montserrat',sans-serif">¡Gracias por tu compra, {{nombre}}!</h1>
<p style="color:#cccccc;font-size:16px;line-height:1.6;margin:0">Tu pedido ha sido procesado exitosamente. Estamos encantados de darte la bienvenida a la comunidad de <strong style="color:#d5c108">Xpand Capital</strong>.</p>`,
        padding: "32px 40px",
      },
    },
    {
      id: "rcpt-001",
      type: "receipt",
      content: {
        title: "Resumen de tu compra",
        showSubtotal: true,
        showDiscount: true,
        showTotal: true,
        padding: "24px 40px",
      },
    },
    {
      id: "btn-001",
      type: "button",
      content: {
        text: "Acceder a mi cuenta",
        url: "{{enlace_acceso}}",
        backgroundColor: "#d5c108",
        textColor: "#000000",
        borderRadius: 8,
        padding: "16px 48px",
        align: "center",
        fullWidth: false,
      },
    },
    {
      id: "txt-002",
      type: "text",
      content: {
        text: `<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px;padding:20px 24px;margin:0">
<p style="color:#d5c108;font-size:14px;font-weight:bold;margin:0 0 8px">🔐 Tus credenciales de acceso</p>
<p style="color:#888;font-size:14px;margin:4px 0"><strong style="color:#ccc">Email:</strong> {{email}}</p>
<p style="color:#888;font-size:14px;margin:4px 0"><strong style="color:#ccc">Contraseña:</strong> {{password_temporal}}</p>
<p style="color:#666;font-size:12px;margin:12px 0 0">Te recomendamos cambiar tu contraseña al iniciar sesión.</p>
</div>`,
        padding: "16px 40px 24px",
      },
    },
    {
      id: "div-001",
      type: "divider",
      content: { color: "#1a1a1a", thickness: 1, padding: "20px 40px" },
    },
    {
      id: "ftr-001",
      type: "footer",
      content: {
        text: `<p style="color:#555;font-size:12px;margin:0 0 8px">© ${new Date().getFullYear()} Xpand Capital Academy. Todos los derechos reservados.</p>
<p style="color:#444;font-size:11px;margin:0">El trading conlleva riesgos. Infórmate adecuadamente.</p>`,
        socialLinks: [],
        padding: "20px 40px 32px",
      },
    },
  ]

  // Primero buscar si ya existe una plantilla para este evento
  const { data: existing } = await supabase
    .from("email_templates")
    .select("id")
    .eq("empresa_id", empresaId)
    .eq("evento", "transaccion_compra_completada_invitado")
    .maybeSingle()

  let result
  if (existing?.id) {
    result = await supabase
      .from("email_templates")
      .update({
        nombre: "Compra Completada — Xpand Capital",
        descripcion: "Plantilla de bienvenida tras una compra exitosa. Incluye credenciales de acceso.",
        settings,
        blocks,
      })
      .eq("id", existing.id)
  } else {
    result = await supabase
      .from("email_templates")
      .insert({
        empresa_id: empresaId,
        nombre: "Compra Completada — Xpand Capital",
        descripcion: "Plantilla de bienvenida tras una compra exitosa. Incluye credenciales de acceso.",
        settings,
        blocks,
        evento: "transaccion_compra_completada_invitado",
      })
  }

  const { error } = result

  if (error) {
    console.error("❌ Error:", error)
  } else {
    console.log("✅ Plantilla 'Compra Completada — Xpand Capital' creada exitosamente.")
    console.log("   Evento vinculado: transaccion_compra_completada_invitado")
  }
}

seed()
