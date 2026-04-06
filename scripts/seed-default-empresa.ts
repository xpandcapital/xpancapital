import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEFAULT_EMPRESA_ID = '00000000-0000-0000-0000-000000000001'

async function seedDefaultEmpresa() {
  console.log('🌱 Iniciando seed de empresa por defecto...')

  try {
    // 1. Crear empresa
    const { error: empresaError } = await supabase
      .from('empresas')
      .upsert({
        id: DEFAULT_EMPRESA_ID,
        nombre: 'BLIS CORP',
        slug: 'blis-corp',
        nombre_legal: 'BLIS CORP S.A.C.',
        logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200',
        color_primario: '#B10D24',
        color_secundario: '#000000',
        color_acento: '#10B981',
        moneda_base: 'USD',
        idioma: 'es',
        zona_horaria: 'America/Lima',
        activo: true,
        plan: 'enterprise'
      }, { onConflict: 'id' })

    if (empresaError) {
      console.log('ℹEmpresa ya existe o error:', empresaError.message)
    } else {
      console.log('✅ Empresa creada')
    }

    // 2. Crear configuración
    const { error: configError } = await supabase
      .from('empresa_config')
      .upsert({
        id: DEFAULT_EMPRESA_ID,
        empresa_id: DEFAULT_EMPRESA_ID,
        blog_activo: true,
        tienda_activa: true,
        academia_activa: false,
        referidos_activo: true,
        bliscoins_activo: true,
        coins_por_lectura: 5,
        segundos_lectura: 60,
        coins_registro: 100,
        coins_referido: 50
      }, { onConflict: 'id' })

    if (configError) {
      console.log('ℹ️ Config ya existe o error:', configError.message)
    } else {
      console.log('✅ Configuración creada')
    }

    // 3. Crear niveles de cliente
    const niveles = [
      { id: `${DEFAULT_EMPRESA_ID}-101`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Bronce', slug: 'bronce', color: '#CD7F32', icono: 'Award', orden: 1, comision_porcentaje: 5 },
      { id: `${DEFAULT_EMPRESA_ID}-102`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Plata', slug: 'plata', color: '#C0C0C0', icono: 'Award', orden: 2, comision_porcentaje: 10 },
      { id: `${DEFAULT_EMPRESA_ID}-103`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Oro', slug: 'oro', color: '#FFD700', icono: 'Award', orden: 3, comision_porcentaje: 15 },
      { id: `${DEFAULT_EMPRESA_ID}-104`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Platino', slug: 'platino', color: '#E5E4E2', icono: 'Crown', orden: 4, comision_porcentaje: 20 }
    ]

    for (const nivel of niveles) {
      const { error } = await supabase
        .from('niveles_cliente')
        .upsert({ ...nivel }, { onConflict: 'id' })
      
      if (!error) console.log(`✅ Nivel ${nivel.nombre} creado`)
    }

    // 4. Crear categorías de blog
    const categorias = [
      { id: `${DEFAULT_EMPRESA_ID}-201`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Inversiones', slug: 'inversiones' },
      { id: `${DEFAULT_EMPRESA_ID}-202`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Arquitectura', slug: 'arquitectura' },
      { id: `${DEFAULT_EMPRESA_ID}-203`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Legal', slug: 'legal' },
      { id: `${DEFAULT_EMPRESA_ID}-204`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Construcción', slug: 'construccion' },
      { id: `${DEFAULT_EMPRESA_ID}-205`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Tips', slug: 'tips' },
      { id: `${DEFAULT_EMPRESA_ID}-206`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Propietarios', slug: 'propietarios' },
      { id: `${DEFAULT_EMPRESA_ID}-207`, empresa_id: DEFAULT_EMPRESA_ID, nombre: 'Curiosidades', slug: 'curiosidades' }
    ]

    for (const cat of categorias) {
      const { error } = await supabase
        .from('blog_categorias')
        .upsert({ ...cat }, { onConflict: 'id' })
      
      if (!error) console.log(`✅ Categoría ${cat.nombre} creada`)
    }

    // 5. Crear bucket de storage
    try {
      await supabase.storage.createBucket('images', { public: true })
      console.log('✅ Bucket "images" creado')
    } catch {
      console.log('ℹ️ Bucket ya existe o requiere creación manual en Dashboard')
    }

    console.log('\n🎉 Seed completado exitosamente!')
    console.log('📋 Empresa ID:', DEFAULT_EMPRESA_ID)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedDefaultEmpresa()