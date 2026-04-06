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
  return {
    id: producto.id,
    slug: producto.slug || producto.id,
    title: producto.nombre,
    category: producto.categoria?.nombre || 'General',
    productType: mapTipoToProductType(producto.tipo),
    price: producto.precio_usd || 0,
    originalPrice: producto.precio_usd ? producto.precio_usd * 1.3 : undefined,
    rating: 4.8,
    sales: '+100',
    image: producto.imagen_principal || '/images/placeholder-product.jpg',
    description: producto.descripcion,
    stock: producto.stock_ilimitado ? 999 : producto.stock,
    isCourse: producto.tipo === 'servicio' || producto.tipo === 'digital'
  };
}
