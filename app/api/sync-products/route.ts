import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

// Mapeo de prefijos a categorías
const CATEGORY_MAP: Record<string, { nombre: string; slug: string }> = {
  'CURSO': { nombre: 'Capacitaciones', slug: 'capacitaciones' },
  'CURSO-': { nombre: 'Capacitaciones', slug: 'capacitaciones' },
  'EBOOK': { nombre: 'Ebooks Propietarios', slug: 'ebooks-propietarios' },
  'KIT': { nombre: 'Kits de Agentes', slug: 'kits-agentes' },
};

// Productos a crear desde imágenes
const PRODUCTS_TO_CREATE = [
  { prefix: 'CURSO', file: 'CURSO-VUELVE TU DÍA PRODUCTIVO COMO AGENTE INMOBILIARIO.webp', name: 'Vuelve Tu Día Productivo Como Agente Inmobiliario', category: 'Capacitaciones' },
  { prefix: 'CURSO', file: 'CURSO-TE AYUDAMOS A CREAR TU PLAN DE COMERCIALIZACION.webp', name: 'Plan de Comercialización', category: 'Capacitaciones' },
  { prefix: 'CURSO', file: 'CURSO-Deja de cometer errores al comprar inmuebles.webp', name: 'Deja de Cometer Errores al Comprar Inmuebles', category: 'Capacitaciones' },
  { prefix: 'CURSO', file: 'CURSO-como crear contenido en redes sociales.webp', name: 'Crear Contenido en Redes Sociales', category: 'Capacitaciones' },
  { prefix: 'CURSO', file: 'CURSO-Fotografia inmobiliaria con smartphone.webp', name: 'Fotografía Inmobiliaria con Smartphone', category: 'Capacitaciones' },
  { prefix: 'CURSO', file: 'CURSO-EXPERTO CAPTADOR DE LLAMADAS EN FRIO.webp', name: 'Experto Captador de Llamadas en Frío', category: 'Capacitaciones' },
  { prefix: 'CURSO', file: 'CURSO-Como vender inmuebles sin errores.webp', name: 'Cómo Vender Inmuebles Sin Errores', category: 'Capacitaciones' },
  { prefix: 'CURSO', file: 'CURSO-CAPTACIÓN INMOBILIARIA DESDE CERO.webp', name: 'Captación Inmobiliaria Desde Cero', category: 'Capacitaciones' },
  { prefix: 'PRODUCTO', file: 'PRODUCTO BLIS CORP E-books.png', name: 'E-books BLIS CORP', category: 'Ebooks Propietarios' },
  { prefix: 'PRODUCTO', file: 'producto-web-2.png', name: 'Producto Web', category: 'Capacitaciones' },
  { prefix: 'PRODUCTO', file: 'Web-de-producto.webp', name: 'Web de Producto', category: 'Capacitaciones' },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar/crear categorías
    const categoriesNeeded = ['Capacitaciones', 'Ebooks Propietarios', 'Kits de Agentes', 'Kits Desarrolladores', 'Contratos Legales'];
    
    for (const catName of categoriesNeeded) {
      const slug = generateSlug(catName);
      const { data: existing } = await supabase
        .from('producto_categorias')
        .select('id')
        .eq('empresa_id', EMPRESA_ID)
        .eq('slug', slug)
        .single();
      
      if (!existing) {
        await supabase
          .from('producto_categorias')
          .insert({
            empresa_id: EMPRESA_ID,
            nombre: catName,
            slug: slug,
            orden: categoriesNeeded.indexOf(catName)
          });
        console.log(`Creada categoría: ${catName}`);
      }
    }
    
    // 2. Obtener categorías
    const { data: categories } = await supabase
      .from('producto_categorias')
      .select('id, nombre, slug')
      .eq('empresa_id', EMPRESA_ID);
    
    const categoryMap: Record<string, string> = {};
    categories?.forEach(c => { categoryMap[c.nombre] = c.id; });
    
    // 3. Subir imágenes y crear productos
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    const results = {
      created: [] as string[],
      skipped: [] as string[],
      errors: [] as { file: string; error: string }[]
    };
    
    for (const product of PRODUCTS_TO_CREATE) {
      const filePath = path.join(imagesDir, product.file);
      
      try {
        // Verificar si ya existe
        const slug = generateSlug(product.name);
        const { data: existing } = await supabase
          .from('productos')
          .select('id')
          .eq('empresa_id', EMPRESA_ID)
          .eq('slug', slug)
          .single();
        
        if (existing) {
          results.skipped.push(product.file);
          continue;
        }
        
        // Leer archivo
        if (!fs.existsSync(filePath)) {
          results.errors.push({ file: product.file, error: 'Archivo no encontrado' });
          continue;
        }
        
        const fileBuffer = fs.readFileSync(filePath);
        const fileExt = product.file.split('.').pop()?.toLowerCase() || 'jpg';
        const contentType = fileExt === 'webp' ? 'image/webp' : 
                           fileExt === 'png' ? 'image/png' : 'image/jpeg';
        
        // Subir a Storage
        const storagePath = `productos/${EMPRESA_ID}/${slug}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('cms')
          .upload(storagePath, fileBuffer, { contentType, upsert: true });
        
        if (uploadError) {
          results.errors.push({ file: product.file, error: uploadError.message });
          continue;
        }
        
        // URL pública
        const { data: urlData } = supabase.storage.from('cms').getPublicUrl(storagePath);
        const imageUrl = urlData.publicUrl;
        
        // Crear producto
        const categoryId = categoryMap[product.category];
        
        const { error: dbError } = await supabase
          .from('productos')
          .insert({
            empresa_id: EMPRESA_ID,
            nombre: product.name,
            slug: slug,
            descripcion: '',
            contenido: '',
            tipo: 'digital',
            categoria_id: categoryId,
            imagen_principal: imageUrl,
            stock_ilimitado: true,
            activo: true,
            destacado: false,
            metodo_pago: 'ambos',
            precio_usd: 0,
            precio_coins: 0
          });
        
        if (dbError) {
          results.errors.push({ file: product.file, error: dbError.message });
          continue;
        }
        
        results.created.push(product.file);
        
      } catch (err) {
        results.errors.push({ file: product.file, error: String(err) });
      }
    }
    
    return NextResponse.json({
      success: true,
      created: results.created.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
      details: results
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error al sincronizar productos', 
      details: String(error) 
    }, { status: 500 });
  }
}