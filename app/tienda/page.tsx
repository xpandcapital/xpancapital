"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { XpandFooter } from "@/components/sections/xpand/XpandFooter";
import { ShopHeroSlider } from "@/components/tienda/ShopHeroSlider";
import { ProductCategorySlider } from "@/components/tienda/ProductCategorySlider";
import { ShopSidebar } from "@/components/tienda/ShopSidebar";
import { LiveBuyerNotification } from "@/components/tienda/LiveBuyerNotification";

import { mapProductoToProductDef, ProductDef } from "@/lib/types/shop";
import { ProductSearch } from "@/components/tienda/ProductSearch";
import type { ProductoCategoria } from "@/lib/hooks/useProducts";
import { DEFAULT_EMPRESA_ID } from "@/lib/empresa";

const EMPRESA_ID = DEFAULT_EMPRESA_ID;

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<ProductDef[]>([]);
  const [categories, setCategories] = useState<ProductoCategoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`/api/productos?empresa_id=${EMPRESA_ID}&all=true`),
          fetch(`/api/productos/categorias?empresa_id=${EMPRESA_ID}`)
        ]);
        
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        
        if (isMounted) {
          if (productsData.success && productsData.data) {
            const mapped = productsData.data
              .filter((p: any) => p.activo !== false && p.visible_en_tienda !== false)
              .map((p: any) => mapProductoToProductDef(p));
            setAllProducts(mapped);
          }
          
          if (categoriesData.success && categoriesData.data) {
            setCategories(categoriesData.data);
          }
        }
      } catch (e) {
        console.error("Shop fetch error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const getProductsForCategory = (categoriaNombre: string) => {
    const catLower = categoriaNombre.toLowerCase();
    return allProducts.filter(p => {
      const pCat = p.category?.toLowerCase() || "";
      return pCat === catLower || pCat.includes(catLower);
    });
  };

  return (
    <main className="min-h-screen text-white bg-black">

      <div className="relative flex">
        <ShopSidebar />

        <div className="flex-1 md:ml-64 px-4 md:px-8 xl:px-10 pt-24 pb-16 space-y-10 min-w-0">

          <ShopHeroSlider products={allProducts} />

          <ProductSearch products={allProducts} />

          {loading ? (
            <div className="space-y-16">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse mb-6" />
                  <div className="flex gap-5 overflow-hidden">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="shrink-0 w-[280px] h-[360px] bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {allProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-xl font-black uppercase mb-2">Pronto nuevos productos</p>
                  <p className="text-sm">Estamos cargando el catálogo de productos.</p>
                </div>
              ) : (
                <>
                  {categories.map((category) => {
                    const categoryProducts = getProductsForCategory(category.nombre);
                    if (categoryProducts.length === 0) return null;
                    return (
                      <ProductCategorySlider 
                        key={category.id}
                        id={category.slug || category.id}
                        title={category.nombre}
                        subtitle={`${categoryProducts.length} producto${categoryProducts.length !== 1 ? 's' : ''} disponible${categoryProducts.length !== 1 ? 's' : ''}`}
                        products={categoryProducts}
                      />
                    );
                  })}

                  {(() => {
                    const categorizedIds = new Set(
                      categories.flatMap(cat => getProductsForCategory(cat.nombre).map(p => p.id))
                    );
                    const uncategorized = allProducts.filter(p => !categorizedIds.has(p.id));
                    if (uncategorized.length === 0) return null;
                    return (
                      <ProductCategorySlider 
                        id="otros"
                        title="Otros Productos"
                        subtitle={`${uncategorized.length} producto${uncategorized.length !== 1 ? 's' : ''} disponible${uncategorized.length !== 1 ? 's' : ''}`}
                        products={uncategorized}
                      />
                    );
                  })()}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <LiveBuyerNotification products={allProducts.map(p => p.title).filter(Boolean)} />
      <XpandFooter />
    </main>
  );
}
