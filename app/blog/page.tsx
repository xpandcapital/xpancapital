"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/sections/Header";
import { FooterSections } from "@/components/sections/Footer";
import { BlogHero } from "@/components/sections/BlogHero";
import { BlogPremium } from "@/components/sections/BlogPremium";
import { AutoSlider } from "@/components/ui/AutoSlider";
import { ArrowRight } from "lucide-react";

const EMPRESA_ID = "6186f014-c8c7-4027-9f08-8acf2bae3eae";

export default function BlogMagazinePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/blog?empresa_id=${EMPRESA_ID}`);
        const data = await res.json();
        if (data.success && data.data && isMounted) {
          const mapped = data.data
            .filter((p: any) => p.estado === "publicado")
            .map((p: any) => ({
              id: p.id,
              title: p.titulo,
              excerpt: p.extracto || "",
              category: p.categoria?.nombre || "General",
              image: p.imagen_portada || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
              isPremium: p.es_premium,
              slug: p.slug,
              date: p.publicado_en
                ? new Date(p.publicado_en).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })
                : "",
            }));
          setArticles(mapped);
        }
      } catch (e) {
        console.error("Blog fetch error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch_();
    return () => { isMounted = false; };
  }, []);

  const getArticleSlug = (art: any) => art.slug || art.id || "";

  return (
    <main className="min-h-screen text-white bg-[#050505]">
      <Header />

      {/* 1. Hero con slideshow */}
      <BlogHero data={{}} />

      {/* 2. Slider horizontal de todos los artículos */}
      <section className="py-16 px-4 md:px-8 xl:px-16 border-b border-white/5 bg-[#050505]">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Últimas Publicaciones</p>
              <h2 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3">
                <div className="w-2 h-8 rounded-full bg-blis-red" />
                Artículos Recientes
              </h2>
            </div>
          </div>
          {loading ? (
            <div className="flex gap-5 overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="shrink-0 w-[280px] h-[320px] bg-white/5 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <AutoSlider
              articles={articles}
              variant="dark"
              direction="ltr"
              getArticleSlug={getArticleSlug}
            />
          )}
        </div>
      </section>

      {/* 3. Segunda fila slider inverso (RTL) */}
      {articles.length > 3 && (
        <section className="py-10 px-4 md:px-8 xl:px-16 border-b border-white/5 bg-[#060606]">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Más Contenido</p>
                <h2 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3">
                  <div className="w-2 h-8 rounded-full bg-emerald-500" />
                  También Te Puede Interesar
                </h2>
              </div>
            </div>
            <AutoSlider
              articles={[...articles].reverse()}
              variant="dark"
              direction="rtl"
              getArticleSlug={getArticleSlug}
            />
          </div>
        </section>
      )}

      {/* 4. Grid Premium con efectos bonitos */}
      <BlogPremium />

      {/* 5. CTA final */}
      <section className="py-20 px-4 md:px-8 text-center bg-[#050505] border-t border-white/5">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">¿Listo para más?</p>
        <h2 className="text-3xl md:text-5xl font-black uppercase mb-6">
          Inteligencia de Mercado<br />
          <span className="text-blis-red">Exclusiva</span>
        </h2>
        <p className="text-gray-400 text-base max-w-xl mx-auto mb-8">
          Accede a análisis profundos, tendencias del mercado inmobiliario y estrategias de inversión solo para socios.
        </p>
        <a
          href="/miembros"
          className="inline-flex items-center gap-3 px-10 py-5 bg-blis-red text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-red-700 transition-all shadow-[0_0_30px_rgba(177,13,36,0.4)] active:scale-95"
        >
          Quiero Ser Socio <ArrowRight className="w-5 h-5" />
        </a>
      </section>

      <FooterSections />
    </main>
  );
}
