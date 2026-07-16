import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

async function getSession(): Promise<string> {
  const { data } = await supabase.from('api_keys').select('key_name, key_value');
  const keys: Record<string, string> = {};
  data?.forEach((k: any) => { keys[k.key_name] = k.key_value || ''; });
  return keys.envato_elements_session || '';
}

// Extrae el mapa de UUID → URL firmada de imágenes del HTML
function extractSignedImageMap(html: string): Map<string, string> {
  const map = new Map<string, string>();
  // Buscar todas las URLs firmadas: elements-cover-images/<UUID>?...&s=<hash>
  const imgPattern = /elements-cover-images\/([0-9a-f-]{36})\?([^"'\s\\]+)/g;
  let m;
  while ((m = imgPattern.exec(html)) !== null) {
    const uuid = m[1];
    const params = m[2].replace(/\\u0026/g, '&').replace(/\\"/g, '');
    // Preferir w=433 (tamaño de thumbnail), sino tomar cualquiera
    const fullUrl = `https://elements-resized.envatousercontent.com/elements-cover-images/${uuid}?${params}`;
    if (!map.has(uuid) || params.includes('w=433')) {
      map.set(uuid, fullUrl);
    }
  }
  return map;
}

// Extrae el mapa de UUID → URL del item (href con slug real)
function extractItemUrlMap(html: string): Map<string, string> {
  const map = new Map<string, string>();
  // href="/web-templates/matrix-multipurpose-responsive-email-templates-ac508a0f..."
  // o href="/search/web-templates/UUID..."
  const hrefPattern = /href="(\/(?:web-templates|search\/web-templates)\/[a-z0-9-]+)"[^>]*data-analytics-item_id="([0-9a-f-]{36})"/g;
  const hrefPattern2 = /data-analytics-item_id="([0-9a-f-]{36})"[^>]*href="(\/(?:web-templates|search\/web-templates)\/[a-z0-9-]+)"/g;
  let m;
  while ((m = hrefPattern.exec(html)) !== null) {
    if (!map.has(m[2])) map.set(m[2], m[1]);
  }
  while ((m = hrefPattern2.exec(html)) !== null) {
    if (!map.has(m[1])) map.set(m[1], m[2]);
  }
  return map;
}

function extractItemsFromHTML(html: string): any[] {
  const items: any[] = [];
  const seen = new Set<string>();

  // Construir mapa de imágenes firmadas y URLs reales
  const imageMap = extractSignedImageMap(html);
  const urlMap = extractItemUrlMap(html);

  // Extraer todos los UUIDs únicos con sus metadatos
  const uuids: string[] = [];
  const uuidPattern = /data-analytics-item_id="([0-9a-f-]{36})"/g;
  let m;
  while ((m = uuidPattern.exec(html)) !== null) {
    if (!uuids.includes(m[1])) uuids.push(m[1]);
  }

  for (const uuid of uuids) {
    if (seen.has(uuid)) continue;
    seen.add(uuid);

    // Extraer título y autor del bloque que contiene este UUID
    const idx = html.indexOf(`data-analytics-item_id="${uuid}"`);
    if (idx === -1) continue;
    const blockStart = Math.max(0, idx - 300);
    const blockEnd = Math.min(html.length, idx + 300);
    const block = html.slice(blockStart, blockEnd);

    const itemType = block.match(/data-analytics-item_type="([^"]+)"/)?.[1] || '';
    if (!itemType.includes('web-templates')) continue;

    const title = block.match(/data-analytics-item_title="([^"]+)"/)?.[1]?.trim() || 'Email Template';
    const author = block.match(/data-analytics-item_author="([^"]+)"/)?.[1] || 'Elements';

    // Obtener thumbnail firmada (pública, no requiere auth)
    const thumbnail = imageMap.get(uuid) || '';

    // Obtener URL real del item con slug
    const itemPath = urlMap.get(uuid) || `/web-templates/${uuid}`;
    const itemUrl = `https://elements.envato.com${itemPath}`;

    // Slug para descarga — usar la última parte del path
    const slug = itemPath.split('/').pop() || uuid;

    items.push({
      id: uuid,
      envatoId: uuid,
      slug,
      title,
      thumbnail,
      author,
      category: 'Email Templates',
      url: itemUrl,
      source: 'elements',
      isElements: true,
      price: null,
      rating: null,
      sales: 0,
    });
  }

  return items;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const session = await getSession();

  if (!session) {
    return NextResponse.json({
      success: false,
      needsSession: true,
      error: 'Pega las cookies de tu sesión de Envato Elements.',
    }, { status: 401 });
  }

  const apiUrl = new URL('https://app.envato.com/search');
  apiUrl.searchParams.set('itemType', 'web-templates');
  if (query) apiUrl.searchParams.set('term', query);
  apiUrl.searchParams.set('filter.categories', 'Email Templates');
  apiUrl.searchParams.set('sort', 'popular');
  apiUrl.searchParams.set('page', String(page));

  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9', // Forzar inglés para títulos correctos
    'Referer': 'https://app.envato.com/',
    'Cookie': session + '; preferredLanguage=en', // Forzar idioma inglés
  };

  try {
    const res = await fetch(apiUrl.toString(), { headers });
    const html = await res.text();

    if (html.includes('sign_in') && !html.includes('data-analytics-item_id')) {
      return NextResponse.json({
        success: false,
        needsSession: true,
        sessionExpired: true,
        error: 'Sesión expirada. Vuelve a app.envato.com y pega las cookies nuevamente.',
      }, { status: 401 });
    }

    const items = extractItemsFromHTML(html);

    return NextResponse.json({
      success: true,
      results: items,
      total: items.length,
      page,
    });

  } catch (err: any) {
    console.error('Elements fetch error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

