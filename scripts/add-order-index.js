const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://srjhrhiesienkofisvnv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhyaGllc2llbmtvZmlzdm52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEwODM4OSwiZXhwIjoyMDg5Njg0Mzg5fQ.OB-MHB9z6sIDxXC_c3yWYdxhVUCFOwa7zcxaYzqlhdY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Ejecutando migración para agregar order_index...');
  
  // 1. Agregar columna order_index si no existe
  const { error: alterError } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;'
  });
  
  if (alterError && !alterError.message.includes('already exists')) {
    console.log('Nota: La columna puede ya existir, continuando...');
  }
  
  // 2. Actualizar proyectos existentes
  const { data: projects, error: selectError } = await supabase
    .from('projects')
    .select('id, created_at')
    .order('created_at', { ascending: true });
  
  if (selectError) {
    console.error('Error obteniendo proyectos:', selectError);
    return;
  }
  
  console.log(`Actualizando ${projects.length} proyectos...`);
  
  // 3. Asignar order_index basado en el orden actual
  for (let i = 0; i < projects.length; i++) {
    const { error: updateError } = await supabase
      .from('projects')
      .update({ order_index: i })
      .eq('id', projects[i].id);
    
    if (updateError) {
      console.error(`Error actualizando proyecto ${projects[i].id}:`, updateError);
    }
  }
  
  console.log('✅ Migración completada exitosamente!');
  
  // 4. Verificar
  const { data: verify, error: verifyError } = await supabase
    .from('projects')
    .select('id, name, order_index')
    .order('order_index');
  
  if (verify) {
    console.log('Proyectos ordenados:');
    verify.forEach(p => console.log(`  - ${p.name} (order_index: ${p.order_index})`));
  }
}

runMigration();
