// Test de conexión a Supabase
// Ejecutar con: node scripts/test-connection.mjs

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://srjhrhiesienkofisvnv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhyaGllc2llbmtvZmlzdm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDgzODksImV4cCI6MjA4OTY4NDM4OX0.uZ2g5UqJJpT9Xr3K9MibImfgqbYS_3sXBXOXGusCviE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Conexion a Supabase...')
  console.log('URL:', supabaseUrl)
  
  // Test empresas
  const { data: empresas, error: err1 } = await supabase.from('empresas').select('*').limit(1)
  if (err1) {
    console.log('Error:', err1.message)
    return
  }
  console.log('Empresa:', empresas?.[0]?.nombre || 'N/A')
  
  // Test niveles
  const { data: niveles } = await supabase.from('niveles_cliente').select('nombre').order('orden')
  console.log('Niveles:', niveles?.map(n => n.nombre).join(', '))
  
  // Test categorias
  const { data: cats } = await supabase.from('blog_categorias').select('nombre')
  console.log('Categorias:', cats?.map(c => c.nombre).join(', '))
  
  console.log('\n Todo OK!')
}

test()