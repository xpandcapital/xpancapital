export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "biblioteca-portadas";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Crear bucket si no existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b: any) => b.name === BUCKET);
    if (!exists) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET, { public: true });
      if (createErr) {
        console.warn("[upload] Error al crear bucket:", createErr.message);
      }
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `qrs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, file, { upsert: true, contentType: file.type });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    return NextResponse.json({ success: true, url: data.publicUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Error al subir archivo" }, { status: 500 });
  }
}

