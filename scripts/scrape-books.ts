/**
 * Script: Scraping de libros desde campus.xpandcapital.org (WordPress REST API)
 * Uso: npx tsx scripts/scrape-books.ts
 */

const WP_API = "https://campus.xpandcapital.org/wp-json/wp/v2";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "biblioteca-portadas";

interface WpCategory {
  id: number;
  name: string;
  slug: string;
}

interface WpPost {
  id: number;
  title: { rendered: string };
  slug: string;
  jetpack_featured_media_url: string;
  categories: number[];
  excerpt: { rendered: string };
  content: { rendered: string };
  link: string;
}

interface Book {
  titulo: string;
  autor: string;
  portada_url: string;
  descripcion: string;
  download_link: string;
  is_featured: boolean;
  orden: number;
}

async function fetchCategories(): Promise<Map<number, string>> {
  console.log("📂 Cargando categorías (autores)...");
  const map = new Map<number, string>();

  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${WP_API}/categories?per_page=100&page=${page}`);
    if (!res.ok) break;
    const cats: WpCategory[] = await res.json();
    if (cats.length === 0) break;
    for (const c of cats) map.set(c.id, c.name);
  }

  console.log(`   ${map.size} categorías cargadas`);
  return map;
}

async function fetchPosts(page: number): Promise<{ posts: WpPost[]; total: number }> {
  const url = `${WP_API}/posts?per_page=100&page=${page}&_fields=id,title,slug,jetpack_featured_media_url,categories,excerpt,content,link`;
  const res = await fetch(url);
  const total = parseInt(res.headers.get("X-WP-Total") || "0");
  const posts: WpPost[] = await res.json();
  return { posts, total };
}

function extractDownloadLink(post: WpPost): string {
  const html = post.content.rendered || "";
  const pdfMatch = html.match(/href="([^"]*\.pdf[^"]*)"/i);
  if (pdfMatch) return pdfMatch[1];
  const driveMatch = html.match(/drive\.google\.com\/file\/d\/([^/"']+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/view`;
  const anyLink = html.match(/href="(https?:\/\/[^"]+)"/i);
  if (anyLink && !anyLink[1].includes("campus.xpandcapital.org")) return anyLink[1];
  return post.link;
}

function cleanHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "").trim().slice(0, 500) || "";
}

async function uploadCoverToSupabase(imageUrl: string, filename: string): Promise<string | null> {
  if (!imageUrl) return null;

  try {
    // Check if file already exists (skip if so)
    const checkUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
    const checkRes = await fetch(checkUrl, { method: "HEAD" });
    if (checkRes.ok) return checkUrl;

    // Download image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    // Upload to Supabase
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": imgRes.headers.get("content-type") || "image/jpeg",
      },
      body: buffer,
    });

    if (uploadRes.ok) return checkUrl;

    // Try with upsert
    const upsertRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": imgRes.headers.get("content-type") || "image/jpeg",
        "x-upsert": "true",
      },
      body: buffer,
    });

    return upsertRes.ok ? checkUrl : null;
  } catch (err) {
    console.error(`   ❌ Error subiendo ${filename}:`, (err as Error).message);
    return null;
  }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ─── MAIN ──────────────────────────────────────────────
async function main() {
  console.log("🚀 Iniciando scraping de libros...\n");

  // 1. Fetch categories
  const authorMap = await fetchCategories();

  // 2. Fetch all posts
  console.log("\n📚 Cargando libros...");
  const allBooks: Book[] = [];
  const { posts: firstPage, total } = await fetchPosts(1);
  const totalPages = Math.ceil(total / 100);
  console.log(`   Total: ${total} libros en ${totalPages} páginas`);

  for (const post of firstPage) {
    const autor = post.categories.map((c) => authorMap.get(c) || "").filter(Boolean).join(", ") || "Xpand Editorial";
    allBooks.push({
      titulo: post.title.rendered,
      autor,
      portada_url: post.jetpack_featured_media_url || "",
      descripcion: cleanHtml(post.excerpt.rendered),
      download_link: extractDownloadLink(post),
      is_featured: false,
      orden: allBooks.length,
    });
  }

  for (let page = 2; page <= totalPages; page++) {
    const { posts } = await fetchPosts(page);
    for (const post of posts) {
      const autor = post.categories.map((c) => authorMap.get(c) || "").filter(Boolean).join(", ") || "Xpand Editorial";
      allBooks.push({
        titulo: post.title.rendered,
        autor,
        portada_url: post.jetpack_featured_media_url || "",
        descripcion: cleanHtml(post.excerpt.rendered),
        download_link: extractDownloadLink(post),
        is_featured: false,
        orden: allBooks.length,
      });
    }
    process.stdout.write(`\r   Página ${page}/${totalPages} — ${allBooks.length} libros`);
  }
  console.log(`\n   ✅ ${allBooks.length} libros scrapeados\n`);

  // 3. Create storage bucket (si no existe)
  console.log("🪣 Verificando bucket de storage...");
  const bucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
    headers: { Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!bucketRes.ok) {
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
    });
    console.log("   Bucket creado");
  } else {
    console.log("   Bucket ya existe");
  }

  // 4. Upload covers to Supabase
  console.log("\n🖼️  Migrando portadas a Supabase Storage...");
  let uploaded = 0;
  let skipped = 0;
  const booksWithUrls: (Book & { supabase_url: string | null })[] = [];

  for (let i = 0; i < allBooks.length; i++) {
    const book = allBooks[i];
    if (!book.portada_url) {
      booksWithUrls.push({ ...book, supabase_url: null });
      skipped++;
      continue;
    }

    const ext = book.portada_url.split(".").pop()?.split("?")[0] || "jpg";
    const filename = `covers/${slugify(book.titulo)}.${ext}`;
    const supabaseUrl = await uploadCoverToSupabase(book.portada_url, filename);

    booksWithUrls.push({ ...book, supabase_url: supabaseUrl || book.portada_url });

    if (supabaseUrl) uploaded++;
    else skipped++;

    if ((i + 1) % 20 === 0) process.stdout.write(`\r   ${i + 1}/${allBooks.length} (${uploaded} OK, ${skipped} skip)`);
  }
  console.log(`\r   ✅ ${uploaded} subidas, ${skipped} saltadas\n`);

  // 5. Insert into Supabase
  console.log("💾 Insertando en la base de datos...");
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < booksWithUrls.length; i += batchSize) {
    const batch = booksWithUrls.slice(i, i + batchSize).map((b) => ({
      titulo: b.titulo,
      autor: b.autor,
      portada_url: b.supabase_url,
      descripcion: b.descripcion,
      download_link: b.download_link,
      is_featured: b.is_featured,
      orden: b.orden,
    }));

    const { error } = await supabase.from("biblioteca_libros").insert(batch);
    if (error) {
      console.error(`   ❌ Error en batch ${i}:`, error.message);
    } else {
      process.stdout.write(`\r   ${Math.min(i + batchSize, booksWithUrls.length)}/${booksWithUrls.length} insertados`);
    }
  }
  console.log("\n   ✅ Inserción completada\n");

  console.log(`🎉 Listo! ${booksWithUrls.length} libros en la base de datos.`);
  console.log(`   ${uploaded} portadas en Supabase Storage.`);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});


