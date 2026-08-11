import { Producto } from "@/lib/hooks/useProducts";

export interface ProductDef {
  id: string;
  slug?: string;
  title: string;
  category: string;
  productType: 'curso' | 'pack' | 'ebook' | 'kit';
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
  precio_coins?: number;
  curso_id?: string;
  reviews?: { name: string; avatar?: string; rating: number; date: string; comment: string }[];
}

export function mapTipoToProductType(tipo: string): ProductDef['productType'] {
  const map: Record<string, ProductDef['productType']> = {
    'digital': 'ebook',
    'fisico': 'pack',
    'servicio': 'curso',
    'suscripcion': 'curso',
  };
  return map[tipo] || 'curso';
}

export function mapProductoToProductDef(producto: Producto): ProductDef {
  const tipoMapping: Record<string, ProductDef['productType']> = {
    'digital': 'ebook',
    'fisico': 'kit',
    'servicio': 'curso',
    'suscripcion': 'curso'
  };
  
  const productType = tipoMapping[producto.tipo] || 'curso';
  
  const categoryMapping: Record<string, string> = {
    'cursos': 'Cursos',
    'curso': 'Cursos',
    'academia': 'Cursos',
    'trading': 'Cursos',
    'forex': 'Cursos',
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
    image: producto.imagen_principal || '/images/placeholder.svg',
    images: producto.galeria || (producto.imagen_principal ? [producto.imagen_principal] : []),
    description: producto.descripcion || producto.contenido || '',
    content: producto.contenido || producto.descripcion || '',
    stock: producto.stock_ilimitado ? 999 : (producto.stock || 0),
    isCourse: producto.tipo === 'servicio' || producto.tipo === 'digital',
    isHot: producto.destacado || false,
    curso_id: producto.curso_id,
  };
}
