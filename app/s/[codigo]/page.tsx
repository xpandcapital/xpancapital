import { supabaseAdmin } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function ShortLinkPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const code = codigo.toLowerCase()

  const { data } = await supabaseAdmin
    .from("short_links")
    .select("url_destino")
    .eq("codigo", code)
    .single()

  if (data?.url_destino) {
    await supabaseAdmin.rpc("track_short_link_click", { link_code: code })

    redirect(data.url_destino)
  }

  redirect("/blog")
}
