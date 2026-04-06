// Script para probar la conexión a Supabase
// Ejecutar con: npx ts-node scripts/test-supabase.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testConnection() {
  console.log(' � Probando conexión a Supabase...')
  console.log(' URL:', supabaseUrl)
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test 1: Verificar conexión
    const { data: empresas, error: errorEmpresas } = await supabase
      .from('empresas')
      .select('*')
      .limit(1)
    
    if (errorEmpresas) {
      console.error(' Error al consultar empresas:', errorEmpresas.message)
      return
    }
    
    console.log('✅ Conexión exitosa!')
    console.log('📊 Empresa encontrada:', empresas?.[0]?.nombre || 'N/A')
    
    // Test 2: Verificar niveles
    const { data: niveles, error: errorNiveles } = await supabase
      .from('niveles_cliente')
      .select('nombre, slug')
      .order('orden')
    
    if (niveles) {
      console.log('✅ Niveles de cliente:', niveles.map(n => n.nombre).join(', '))
    }
    
    // Test 3: Verificar paquetes de coins
    const { data: paquetes, error: errorPaquetes } = await supabase
      .from('coins_paquetes')
      .select('nombre, cantidad')
      .order('orden')
    
    if (paquetes) {
      console.log('✅ Paquetes de coins:', paquetes.length)
    }
    
    // Test 4: Verificar categorías de blog
    const { data: categorias, error: errorCategorias } = await supabase
      .from('blog_categorias')
      .select('nombre, slug')
    
    if (categorias) {
      console.log('✅ Categorías de blog:', categorias.map(c => c.nombre).join(', '))
    }
    
    console.log('\n🎉 ¡Todo funcionando correctamente!')
    console.log('📱 Puedes iniciar el proyecto con: npm run dev')
    
  } catch (err) {
    console.error(' Error de conexión:', err)
  }
}

testConnection()