import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const categoria = body.categoria || 'proyecto';
    
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    
    if (!fs.existsSync(imagesDir)) {
      return NextResponse.json({ error: 'Directorio no encontrado' }, { status: 404 });
    }
    
    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter(f => 
      f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.gif')
    );
    
    const results = {
      uploaded: [] as string[],
      skipped: [] as string[],
      errors: [] as { file: string; error: string }[]
    };
    
    for (const file of imageFiles) {
      const filePath = path.join(imagesDir, file);
      const fileName = file.replace(/\.[^/.]+$/, '');
      
      try {
        // Verificar si ya existe
        const { data: existing } = await supabase
          .from('email_media')
          .select('id')
          .eq('empresa_id', EMPRESA_ID)
          .eq('nombre', fileName)
          .single();
        
        if (existing) {
          results.skipped.push(file);
          continue;
        }
        
        // Leer archivo
        const fileBuffer = fs.readFileSync(filePath);
        const fileExt = file.split('.').pop()?.toLowerCase() || 'jpg';
        const contentType = fileExt === 'webp' ? 'image/webp' : 
                            fileExt === 'png' ? 'image/png' : 
                            fileExt === 'gif' ? 'image/gif' : 'image/jpeg';
        
        // Subir a Storage
        const storagePath = `email-media/${EMPRESA_ID}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('cms')
          .upload(storagePath, fileBuffer, { contentType, upsert: true });
        
        if (uploadError) {
          results.errors.push({ file, error: uploadError.message });
          continue;
        }
        
        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('cms')
          .getPublicUrl(storagePath);
        
        // Guardar en BD
        const tipo = fileExt === 'gif' ? 'gif' : 'image';
        
        const { error: dbError } = await supabase
          .from('email_media')
          .insert([{
            empresa_id: EMPRESA_ID,
            nombre: fileName,
            url: urlData.publicUrl,
            tipo,
            categoria
          }]);
        
        if (dbError) {
          results.errors.push({ file, error: dbError.message });
          continue;
        }
        
        results.uploaded.push(file);
        
      } catch (err) {
        results.errors.push({ file, error: String(err) });
      }
    }
    
    return NextResponse.json({
      success: true,
      total: imageFiles.length,
      uploaded: results.uploaded.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
      details: results
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error al sincronizar', 
      details: String(error) 
    }, { status: 500 });
  }
}