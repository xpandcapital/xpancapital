/**
 * Script rápido: inserta libros en BD sin migrar imágenes
 * Uso: npx tsx -e "process.env.NEXT_PUBLIC_SUPABASE_URL='...'; process.env.SUPABASE_SERVICE_ROLE_KEY='...'; require('./scripts/seed-books.ts')"
 */

async function main2() {
  const WP_API = "https://campus.xpancapital.org/wp-json/wp/v2";
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch categories → author names
  console.log("📂 Cargando autores...");
  const authorMap = new Map<number, string>();
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${WP_API}/categories?per_page=100&page=${page}`);
    if (!res.ok) break;
    const cats: any[] = await res.json();
    if (cats.length === 0) break;
    for (const c of cats) authorMap.set(c.id, c.name);
  }
  console.log(`   ${authorMap.size} autores`);

  // 2. Fetch posts with download links
  console.log("📚 Cargando libros...");
  const allBooks: any[] = [];

  for (let page = 1; page <= 10; page++) {
    const url = `${WP_API}/posts?per_page=100&page=${page}&_embed&_fields=id,title,slug,jetpack_featured_media_url,categories,excerpt,content,link`;
    const res = await fetch(url);
    if (!res.ok) break;
    const posts: any[] = await res.json();
    if (posts.length === 0) break;

    for (const post of posts) {
      const autor = (post.categories || []).map((c: number) => authorMap.get(c) || "").filter(Boolean).join(", ") || "Xpand Editorial";
      const html = post.content?.rendered || "";
      const pdfMatch = html.match(/href="([^"]*\.pdf[^"]*)"/i);
      const driveMatch = html.match(/drive\.google\.com\/file\/d\/([^/"']+)/);
      let dl = post.link;
      if (pdfMatch) dl = pdfMatch[1];
      else if (driveMatch) dl = `https://drive.google.com/file/d/${driveMatch[1]}/view`;

      allBooks.push({
        titulo: post.title.rendered,
        autor,
        portada_url: post.jetpack_featured_media_url || null,
        descripcion: post.excerpt?.rendered?.replace(/<[^>]*>/g, "").trim().slice(0, 500) || null,
        download_link: dl,
        is_featured: false,
        activo: true,
        orden: allBooks.length,
      });
    }
    console.log(`   Página ${page} → ${allBooks.length} libros`);
    if (posts.length < 100) break;
  }
  console.log(`   ✅ ${allBooks.length} libros scrapeados\n`);

  // 3. Insert in batches
  console.log("💾 Insertando...");
  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < allBooks.length; i += batchSize) {
    const batch = allBooks.slice(i, i + batchSize);
    const { error } = await supabase.from("biblioteca_libros").insert(batch);
    if (error) {
      console.error(`   ❌ Batch ${i}: ${error.message}`);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r   ${inserted}/${allBooks.length}`);
    }
  }
  console.log(`\n   ✅ ${inserted} libros insertados\n🎉 Listo!`);
}

main2().catch((err) => { console.error("❌", err); process.exit(1); });


