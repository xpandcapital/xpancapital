import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { DEFAULT_EMPRESA_ID } from "@/lib/empresa";
import { Header } from "@/components/sections/Header";
import { XpandFooter } from "@/components/sections/xpand/XpandFooter";
import { BlogHero } from "@/components/sections/BlogHero";
import { BlogPremium } from "@/components/sections/BlogPremium";
import { AutoSlider } from "@/components/ui/AutoSlider";
import { ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic'

const getCachedBlogPosts = unstable_cache(
  async () => {
    const { data: posts } = await supabaseAdmin
      .from("blog_posts")
      .select("id, titulo, slug, extracto, imagen_portada, estado, publicado_en, es_premium, categoria_id, visibilidad")
      .eq("empresa_id", DEFAULT_EMPRESA_ID)
      .eq("estado", "publicado")
      .neq("visibilidad", "oculto")
      .order("publicado_en", { ascending: false })
      .limit(100);

    if (!posts?.length) return [];

    const categoriaIds = [...new Set(posts.map((p) => p.categoria_id).filter(Boolean))] as string[];
    let categoriaMap = new Map();
    if (categoriaIds.length > 0) {
      const { data: categorias } = await supabaseAdmin
        .from("blog_categorias")
        .select("id, nombre, slug")
        .in("id", categoriaIds);
      categoriaMap = new Map((categorias || []).map((c) => [c.id, c]));
    }

    return posts.map((post) => ({
      ...post,
      categoria: post.categoria_id ? categoriaMap.get(post.categoria_id) || null : null,
    }));
  },
  ["blog-posts-home"],
  { revalidate: 86400, tags: ["blog-posts"] }
);

export default async function BlogMagazinePage() {
  const rawArticles = await getCachedBlogPosts();

  const articles = rawArticles.map((p: any) => ({
    id: p.id,
    title: p.titulo,
    excerpt: p.extracto || "",
    category: p.categoria?.nombre || "General",
    image:
      p.imagen_portada ||
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    isPremium: p.es_premium,
    slug: p.slug,
    date: p.publicado_en
      ? new Date(p.publicado_en).toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "",
  }));

  return (
    <main className="min-h-screen text-white bg-[#050505]">
      <Header />

      <BlogHero data={{}} />

      <section className="py-16 px-4 md:px-8 xl:px-16 border-b border-white/5 bg-[#050505]">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                Últimas Publicaciones
              </p>
              <h2 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3">
                <div className="w-2 h-8 rounded-full bg-blis-red" />
                Artículos Recientes
              </h2>
            </div>
          </div>
          <AutoSlider
            articles={articles}
            variant="dark"
            direction="ltr"
          />
        </div>
      </section>

      {articles.length > 3 && (
        <section className="py-10 px-4 md:px-8 xl:px-16 border-b border-white/5 bg-[#060606]">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                  Más Contenido
                </p>
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
            />
          </div>
        </section>
      )}

      <BlogPremium />

      <section className="py-20 px-4 md:px-8 text-center bg-[#050505] border-t border-white/5">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">
          ¿Listo para más?
        </p>
        <h2 className="text-3xl md:text-5xl font-black uppercase mb-6">
          Inteligencia de Mercado
          <br />
          <span className="text-blis-red">Exclusiva</span>
        </h2>
        <p className="text-gray-400 text-base max-w-xl mx-auto mb-8">
          Accede a análisis profundos, tendencias del mercado inmobiliario y
          estrategias de inversión solo para socios.
        </p>
        <a
          href="/miembros"
          className="inline-flex items-center gap-3 px-10 py-5 bg-blis-red text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-red-700 transition-all shadow-[0_0_30px_rgba(168,154,0,0.4)] active:scale-95"
        >
          Quiero Ser Socio <ArrowRight className="w-5 h-5" />
        </a>
      </section>

      <XpandFooter />
    </main>
  );
}

