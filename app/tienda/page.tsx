"use client";

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

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/sections/Header";
import { FooterSections } from "@/components/sections/Footer";
import { ShopHeroSlider } from "@/components/tienda/ShopHeroSlider";
import { ProductCategorySlider } from "@/components/tienda/ProductCategorySlider";
import { ShopSidebar } from "@/components/tienda/ShopSidebar";
import { UrgencyTimer } from "@/components/tienda/UrgencyTimer";
import { LiveBuyerNotification } from "@/components/tienda/LiveBuyerNotification";
import { CartSidebar } from "@/components/tienda/CartSidebar";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { mapProductoToProductDef } from "@/lib/types/shop";
import { StatsBar } from "@/components/tienda/StatsBar";
import { FlashDeals } from "@/components/tienda/FlashDeals";
import { TestimonialsCarousel } from "@/components/tienda/TestimonialsCarousel";
import { TopSellers } from "@/components/tienda/TopSellers";
import { TrustBanner } from "@/components/tienda/TrustBanner";
import { BundlesSection } from "@/components/tienda/BundlesSection";
import { ProductSearch } from "@/components/tienda/ProductSearch";
import { NewsletterBanner } from "@/components/tienda/NewsletterBanner";

const EMPRESA_ID = "6186f014-c8c7-4027-9f08-8acf2bae3eae";

// Mapeo de categorías a secciones del sidebar
const CATEGORY_SECTIONS = [
  { id: "cursos",         label: "Cursos",        match: ["capacitaciones", "cursos", "curso"] },
  { id: "ebooks",         label: "Ebooks",         match: ["ebooks", "ebook", "libros"] },
  { id: "contratos",      label: "Contratos",      match: ["contratos", "contrato", "legal"] },
  { id: "kits",           label: "Kits",           match: ["kits", "kit", "plantillas"] },
  { id: "desarrolladores",label: "Desarrolladores",match: ["desarrolladores", "pack", "paquete"] },
  { id: "mentoria",       label: "Mentoría",       match: ["mentoría", "mentoria", "membresias", "membresía"] },
];

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<ProductDef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/productos?empresa_id=${EMPRESA_ID}&all=true`);
        const data = await res.json();
        if (data.success && data.data && isMounted) {
          const mapped = data.data
            .filter((p: any) => p.activo !== false)
            .map((p: any) => mapProductoToProductDef(p));
          setAllProducts(mapped);
        }
      } catch (e) {
        console.error("Shop fetch error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  // Agrupar productos por sección
  const getProductsForSection = (section: typeof CATEGORY_SECTIONS[0]) => {
    return allProducts.filter(p => {
      const cat = p.category?.toLowerCase() || "";
      const type = p.productType?.toLowerCase() || "";
      return section.match.some(m => cat.includes(m) || type.includes(m));
    });
  };

  // Productos sin categoría específica van a "kits"
  const categorizedIds = new Set(
    CATEGORY_SECTIONS.flatMap(s => getProductsForSection(s).map(p => p.id))
  );
  const uncategorized = allProducts.filter(p => !categorizedIds.has(p.id));

  return (
    <main className="min-h-screen text-white bg-black">
      <CustomCursor />
      <Header />
      <CartSidebar />

      {/* Layout con sidebar fijo */}
      <div className="relative flex">
        {/* Sidebar fijo de categorías — w-64 = 256px */}
        <ShopSidebar />

        {/* Contenido principal: margen izquierdo = ancho sidebar (256px), padding top = altura header (~112px) */}
        <div className="flex-1 md:ml-64 px-4 md:px-8 xl:px-10 pt-24 pb-16 space-y-10 min-w-0">

          {/* Hero slider */}
          <ShopHeroSlider />

          {/* Urgency timer */}
          <UrgencyTimer />

          {/* Buscador de productos */}
          <ProductSearch products={allProducts} />

          {/* Stats con contadores animados */}
          <StatsBar />

          {/* Flash Deals con countdown */}
          <FlashDeals />

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
              {/* ── Carrusel 1 y 2 ── */}
              {CATEGORY_SECTIONS.slice(0, 2).map(section => {
                const products = getProductsForSection(section);
                if (products.length === 0) return null;
                return (
                  <ProductCategorySlider key={section.id} id={section.id}
                    title={section.label} subtitle={`${products.length} productos disponibles`} products={products} />
                );
              })}

              {/* ── Ranking top vendidos ── */}
              <TopSellers />

              {/* ── Carrusel 3 y 4 ── */}
              {CATEGORY_SECTIONS.slice(2, 4).map(section => {
                const products = getProductsForSection(section);
                if (products.length === 0) return null;
                return (
                  <ProductCategorySlider key={section.id} id={section.id}
                    title={section.label} subtitle={`${products.length} productos disponibles`} products={products} />
                );
              })}

              {/* ── Bundles / combos ── */}
              <BundlesSection />

              {/* ── Carrusel 5 y 6 + sin categoría ── */}
              {CATEGORY_SECTIONS.slice(4).map(section => {
                const products = getProductsForSection(section);
                if (products.length === 0) return null;
                return (
                  <ProductCategorySlider key={section.id} id={section.id}
                    title={section.label} subtitle={`${products.length} productos disponibles`} products={products} />
                );
              })}
              {uncategorized.length > 0 && (
                <ProductCategorySlider id="otros" title="Más Productos"
                  subtitle={`${uncategorized.length} productos disponibles`} products={uncategorized} />
              )}

              {/* ── Testimonios ── */}
              <TestimonialsCarousel />

              {/* ── Newsletter ── */}
              <NewsletterBanner />

              {/* ── Banner de confianza ── */}
              <TrustBanner />

              {allProducts.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-xl font-black uppercase mb-2">Pronto nuevos productos</p>
                  <p className="text-sm">Estamos cargando el catálogo de productos.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Notificaciones de compradores */}
      <LiveBuyerNotification />

      <FooterSections />
    </main>
  );
}
