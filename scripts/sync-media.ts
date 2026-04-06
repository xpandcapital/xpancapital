import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae';
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

async function syncMedia() {
  console.log('📁 Sincronizando imágenes desde public/images...');
  
  const files = fs.readdirSync(IMAGES_DIR);
  const imageFiles = files.filter(f => 
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.gif')
  );
  
  console.log(`📊 Encontradas ${imageFiles.length} imágenes`);
  
  let uploaded = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const file of imageFiles) {
    const filePath = path.join(IMAGES_DIR, file);
    const fileName = file.replace(/\.[^/.]+$/, '');
    
    try {
      // Verificar si ya existe en la BD
      const { data: existing } = await supabase
        .from('email_media')
        .select('id')
        .eq('empresa_id', EMPRESA_ID)
        .eq('nombre', fileName)
        .single();
      
      if (existing) {
        console.log(`⏭️  Saltando ${file} (ya existe)`);
        skipped++;
        continue;
      }
      
      // Leer archivo
      const fileBuffer = fs.readFileSync(filePath);
      const fileExt = file.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = fileExt === 'webp' ? 'image/webp' : 
                          fileExt === 'png' ? 'image/png' : 
                          fileExt === 'gif' ? 'image/gif' : 'image/jpeg';
      
      // Subir a Supabase Storage
      const storagePath = `email-media/${EMPRESA_ID}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cms')
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: true
        });
      
      if (uploadError) {
        console.error(`❌ Error subiendo ${file}:`, uploadError.message);
        errors++;
        continue;
      }
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('cms')
        .getPublicUrl(storagePath);
      
      const publicUrl = urlData.publicUrl;
      
      // Guardar en BD
      const tipo = fileExt === 'gif' ? 'gif' : 'image';
      
      const { error: dbError } = await supabase
        .from('email_media')
        .insert([{
          empresa_id: EMPRESA_ID,
          nombre: fileName,
          url: publicUrl,
          tipo,
          categoria: 'proyecto'
        }]);
      
      if (dbError) {
        console.error(`❌ Error guardando ${file} en BD:`, dbError.message);
        errors++;
        continue;
      }
      
      console.log(`✅ ${file} -> ${publicUrl}`);
      uploaded++;
      
    } catch (err) {
      console.error(`❌ Error procesando ${file}:`, err);
      errors++;
    }
  }
  
  console.log('\n📊 Resumen:');
  console.log(`✅ Subidas: ${uploaded}`);
  console.log(`⏭️  Saltadas: ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
  console.log('¡Listo!');
}

syncMedia().catch(console.error);