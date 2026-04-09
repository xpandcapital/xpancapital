import { Producto } from "@/lib/hooks/useProducts";

export interface ProductDef {
  id: string;
  slug?: string;
  title: string;
  category: string;
  productType: 'curso' | 'pack' | 'mentoría' | 'ebook' | 'contratos' | 'kit';
  price: number;
  originalPrice?: number;
  rating: number;
  sales: string;
  image: string;
  images?: string[];
  description?: string;
  content?: string;
  isHot?: boolean;
  stock?: number;
  isCourse?: boolean;
  reviews?: { name: string; avatar?: string; rating: number; date: string; comment: string }[];
}

export function mapTipoToProductType(tipo: string): ProductDef['productType'] {
  const map: Record<string, ProductDef['productType']> = {
    'digital': 'ebook',
    'fisico': 'pack',
    'servicio': 'curso',
    'suscripcion': 'mentoría'
  };
  return map[tipo] || 'ebook';
}

export function mapProductoToProductDef(producto: Producto): ProductDef {
  const tipoMapping: Record<string, ProductDef['productType']> = {
    'digital': 'ebook',
    'fisico': 'kit',
    'servicio': 'curso',
    'suscripcion': 'mentoría'
  };
  
  const productType = tipoMapping[producto.tipo] || 'ebook';
  
  const categoryMapping: Record<string, string> = {
    'capacitaciones': 'Cursos',
    'cursos': 'Cursos',
    'curso': 'Cursos',
    'ebooks': 'Ebooks',
    'ebook': 'Ebooks',
    'libros': 'Ebooks',
    'contratos': 'Contratos',
    'contrato': 'Contratos',
    'legal': 'Contratos',
    'kits': 'Kits',
    'kit': 'Kits',
    'plantillas': 'Kits',
    'pack': 'Packs',
    'paquete': 'Packs',
    'desarrolladores': 'Desarrolladores',
    'mentoría': 'Mentoría',
    'mentoria': 'Mentoría',
    'membresias': 'Mentoría',
    'membresía': 'Mentoría'
  };
  
  const rawCategory = producto.categoria?.nombre?.toLowerCase() || '';
  const mappedCategory = categoryMapping[rawCategory] || producto.categoria?.nombre || 'General';
  
  return {
    id: producto.id,
    slug: producto.slug || producto.id,
    title: producto.nombre,
    category: mappedCategory,
    productType: productType,
    price: producto.precio_usd || 0,
    originalPrice: producto.precio_comparacion || (producto.precio_usd ? producto.precio_usd * 1.3 : undefined),
    rating: 4.8,
    sales: '+100',
    image: producto.imagen_principal || '/images/blog-1.jpg',
    images: producto.galeria || (producto.imagen_principal ? [producto.imagen_principal] : []),
    description: producto.descripcion || producto.contenido || '',
    content: producto.contenido || producto.descripcion || '',
    stock: producto.stock_ilimitado ? 999 : (producto.stock || 0),
    isCourse: producto.tipo === 'servicio' || producto.tipo === 'digital',
    isHot: producto.destacado || false
  };
}
