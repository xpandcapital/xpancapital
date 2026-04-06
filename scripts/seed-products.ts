import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEFAULT_EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

const products = [
    {
        nombre: 'Captación Inmobiliaria Desde Cero',
        slug: 'captacion-inmobiliaria-desde-cero',
        descripcion: 'Aprende las técnicas más avanzadas para captar propiedades en exclusiva sin tener que perseguir a los propietarios.',
        tipo: 'servicio',
        precio_usd: 97.00,
        precio_coins: 970,
        imagen_principal: '/images/CURSO-CAPTACIÓN INMOBILIARIA DESDE CERO.webp',
        categoria_nombre: 'Capacitaciones',
        destacado: true,
        stock_ilimitado: true
    },
    {
        nombre: 'Cero Fallos: Vende Rápido y al Mejor Precio',
        slug: 'cero-fallos-vende-rapido',
        descripcion: 'Aprende a evitar los errores comunes que hacen que las propiedades se queden estancadas en el mercado por meses.',
        tipo: 'servicio',
        precio_usd: 79.00,
        precio_coins: 790,
        imagen_principal: '/images/CURSO-Como vender inmuebles sin errores.webp',
        categoria_nombre: 'Capacitaciones',
        destacado: true,
        stock_ilimitado: true
    },
    {
        nombre: 'Deja de Cometer Errores al Comprar Inmuebles',
        slug: 'errores-al-comprar-inmuebles',
        descripcion: 'Tu guía definitiva para comprar sin riesgos. Identifica vicios ocultos, problemas legales y negocia como un profesional.',
        tipo: 'servicio',
        precio_usd: 85.00,
        precio_coins: 850,
        imagen_principal: '/images/CURSO-Deja de cometer errores al comprar inmuebles.webp',
        categoria_nombre: 'Capacitaciones',
        stock_ilimitado: true
    },
    {
        nombre: 'Experto Captador de Llamadas en Frío',
        slug: 'experto-captador-llamadas-frio',
        descripcion: 'Domina el teléfono. Convierte cada llamada en una cita y cada cita en una exclusiva escrita.',
        tipo: 'servicio',
        precio_usd: 110.00,
        precio_coins: 1100,
        imagen_principal: '/images/CURSO-EXPERTO CAPTADOR DE LLAMADAS EN FRIO.webp',
        categoria_nombre: 'Capacitaciones',
        destacado: true,
        stock_ilimitado: true
    },
    {
        nombre: 'Fotografía Inmobiliaria con Smartphone',
        slug: 'fotografia-inmobiliaria-smartphone',
        descripcion: 'Aprende a tomar fotos profesionales de propiedades usando solo tu celular.',
        tipo: 'digital',
        precio_usd: 49.00,
        precio_coins: 490,
        imagen_principal: '/images/CURSO-Fotografia inmobiliaria con smartphone.webp',
        categoria_nombre: 'Capacitaciones',
        stock_ilimitado: true
    },
    {
        nombre: 'Marketing Inmobiliario Digital',
        slug: 'marketing-inmobiliario-digital',
        descripcion: 'Domina las redes sociales y el marketing digital para atraer clientes potenciales de calidad.',
        tipo: 'servicio',
        precio_usd: 79.00,
        precio_coins: 790,
        imagen_principal: '/images/CURSO-TE AYUDAMOS A CREAR TU PLAN DE COMERCIALIZACION.webp',
        categoria_nombre: 'Capacitaciones',
        stock_ilimitado: true
    },
    {
        nombre: 'Productividad para Agentes',
        slug: 'productividad-agentes-inmobiliarios',
        descripcion: 'Organiza tu día, prioriza tareas y multiplica tu productividad como agente inmobiliario.',
        tipo: 'digital',
        precio_usd: 59.00,
        precio_coins: 590,
        imagen_principal: '/images/CURSO-VUELVE TU DÍA PRODUCTIVO COMO AGENTE INMOBILIARIO.webp',
        categoria_nombre: 'Capacitaciones',
        stock_ilimitado: true
    },
    {
        nombre: 'Pack VIP Contratos',
        slug: 'pack-vip-contratos',
        descripcion: 'Pack completo de contratos inmobiliarios revisados por abogados especializados.',
        tipo: 'fisico',
        precio_usd: 85.00,
        precio_coins: 850,
        imagen_principal: 'https://images.unsplash.com/photo-1589211062033-f117094ba490?w=800&q=80',
        categoria_nombre: 'Kits de Agentes',
        destacado: true,
        stock_ilimitado: false,
        stock: 50
    },
    {
        nombre: 'Estudio de Mercado Inmobiliario',
        slug: 'estudio-mercado-inmobiliario',
        descripcion: 'Herramientas y plantillas para evaluar el potencial de cualquier mercado inmobiliario.',
        tipo: 'digital',
        precio_usd: 150.00,
        precio_coins: 1500,
        imagen_principal: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
        categoria_nombre: 'Kits Desarrolladores',
        stock_ilimitado: true
    },
    {
        nombre: 'Guía Pro: Sin Agentes',
        slug: 'guia-pro-sin-agentes',
        descripcion: 'Ebook completo para propietarios que quieren vender sin intermediarios.',
        tipo: 'digital',
        precio_usd: 29.00,
        precio_coins: 290,
        imagen_principal: 'https://images.unsplash.com/photo-1450101499163-c8848c66cb85?w=800&q=80',
        categoria_nombre: 'Ebooks Propietarios',
        stock_ilimitado: true
    },
    {
        nombre: 'Blindaje Arrendamiento',
        slug: 'blindaje-arrendamiento',
        descripcion: 'Contratos y cláusulas de protección para propietarios que arriendan.',
        tipo: 'digital',
        precio_usd: 95.00,
        precio_coins: 950,
        imagen_principal: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80',
        categoria_nombre: 'Contratos Legales',
        destacado: true,
        stock_ilimitado: true
    },
    {
        nombre: 'Promesa Compraventa Premium',
        slug: 'promesa-compraventa-premium',
        descripcion: 'Plantilla de promesa de compraventa con todas las cláusulas de protección.',
        tipo: 'digital',
        precio_usd: 120.00,
        precio_coins: 1200,
        imagen_principal: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80',
        categoria_nombre: 'Contratos Legales',
        stock_ilimitado: true
    },
    {
        nombre: 'Evaluación Financiera Masterclass',
        slug: 'evaluacion-financiera-masterclass',
        descripcion: 'Masterclass sobre cómo evaluar la rentabilidad de cualquier proyecto inmobiliario.',
        tipo: 'servicio',
        precio_usd: 199.00,
        precio_coins: 1990,
        imagen_principal: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        categoria_nombre: 'Capacitaciones',
        destacado: true,
        stock_ilimitado: true
    },
    {
        nombre: 'Negociación Letal',
        slug: 'negociacion-letal',
        descripcion: 'Técnicas avanzadas de negociación inmobiliaria para cerrar mejores сделки.',
        tipo: 'digital',
        precio_usd: 120.00,
        precio_coins: 1200,
        imagen_principal: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
        categoria_nombre: 'Kits Desarrolladores',
        stock_ilimitado: true
    },
    {
        nombre: 'Anticresis y Mutuos',
        slug: 'anticresis-y-mutuos',
        descripcion: 'Contratos completos para operaciones de anticresis y mutuos hipotecarios.',
        tipo: 'digital',
        precio_usd: 65.00,
        precio_coins: 650,
        imagen_principal: 'https://images.unsplash.com/photo-1521791136064-7986c2959213?w=800&q=80',
        categoria_nombre: 'Contratos Legales',
        stock_ilimitado: true
    }
]

const categories = [
    { nombre: 'Capacitaciones', slug: 'capacitaciones', descripcion: 'Cursos y formaciones para profesionales inmobiliarios' },
    { nombre: 'Kits de Agentes', slug: 'kits-agentes', descripcion: 'Herramientas y recursos para agentes inmobiliarios' },
    { nombre: 'Kits Desarrolladores', slug: 'kits-desarrolladores', descripcion: 'Recursos para desarrolladores de proyectos' },
    { nombre: 'Ebooks Propietarios', slug: 'ebooks-propietarios', descripcion: 'Guías digitales para propietarios' },
    { nombre: 'Contratos Legales', slug: 'contratos-legales', descripcion: 'Plantillas de contratos revisados por abogados' }
]

async function seedProducts() {
    console.log('🌱 Starting products seed...')
    
    // Seed categories
    const categoryMap: Record<string, string> = {}
    
    for (const cat of categories) {
        const { data, error } = await supabase
            .from('producto_categorias')
            .upsert({empresa_id: DEFAULT_EMPRESA_ID, nombre: cat.nombre, slug: cat.slug, descripcion: cat.descripcion }, { onConflict: 'empresa_id,slug' })
            .select()
            .single()
        
        if (error) {
            console.log(`⚠️ Category ${cat.nombre}: ${error.message}`)
        } else if (data) {
            categoryMap[cat.nombre] = data.id
            console.log(`✅ Category: ${cat.nombre}`)
        }
    }
    
    // Seed products
    for (const product of products) {
        const categoria_id = categoryMap[product.categoria_nombre]
        
        const { error } = await supabase
            .from('productos')
            .upsert({
                empresa_id: DEFAULT_EMPRESA_ID,
                nombre: product.nombre,
                slug: product.slug,
                descripcion: product.descripcion,
                tipo: product.tipo,
                precio_usd: product.precio_usd,
                precio_coins: product.precio_coins,
                imagen_principal: product.imagen_principal,
                categoria_id,
                destacado: product.destacado || false,
                activo: true,
                stock_ilimitado: product.stock_ilimitado ?? true,
                stock: product.stock ?? 0,
                metodo_pago: 'ambos'
            }, { onConflict: 'empresa_id,slug' })
        
        if (error) {
            console.log(`⚠️ Product ${product.nombre}: ${error.message}`)
        } else {
            console.log(`✅ Product: ${product.nombre}`)
        }
    }
    
    console.log('🎉 Seed completed!')
}

seedProducts()