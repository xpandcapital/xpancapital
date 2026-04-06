import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://srjhrhiesienkofisvnv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhyaGllc2llbmtvZmlzdm52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEwODM4OSwiZXhwIjoyMDg5Njg0Mzg5fQ.OB-MHB9z6sIDxXC_c3yWYdxhVUCFOwa7zcxaYzqlhdY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('Creating tables...');
  
  // Check if tables exist by trying to select from them
  const tables = ['asesores', 'campanas', 'leads_new', 'integraciones'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code === '42P01') {
      console.log(`Table ${table} does not exist - needs to be created in Supabase Dashboard`);
    } else if (error) {
      console.log(`Table ${table} error:`, error.message);
    } else {
      console.log(`Table ${table} already exists`);
    }
  }
  
  // Try to insert sample data
  console.log('\nInserting sample data...');
  
  // Insert sample asesor
  const { data: asesorData, error: asesorError } = await supabase
    .from('asesores')
    .upsert({
      nombre: 'Kevin Valdez',
      email: 'kevin@bliscorp.com',
      telefono: '+51 999 888 777',
      whatsapp: '51999888777',
      activo: true
    }, { onConflict: 'email' })
    .select();
    
  if (asesorError) {
    console.log('Asesores table not ready:', asesorError.message);
  } else {
    console.log('Sample asesor inserted:', asesorData);
  }
  
  // Insert sample campaña
  const { data: campanaData, error: campanaError } = await supabase
    .from('campanas')
    .upsert({
      nombre: 'Campaña Principal',
      descripcion: 'Campaña principal de captación de leads',
      estado: 'activa',
      notificar_email: true
    }, { onConflict: 'nombre' })
    .select();
    
  if (campanaError) {
    console.log('Campanas table not ready:', campanaError.message);
  } else {
    console.log('Sample campaña inserted:', campanaData);
  }
}

createTables();