export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSessionAndCredentials() {
  const { data } = await supabase.from('api_keys').select('key_name, key_value');
  const keys: Record<string, string> = {};
  data?.forEach((k: any) => { keys[k.key_name] = k.key_value || ''; });
  return {
    email: keys.envato_elements_email || '',
    password: keys.envato_elements_password || '',
    session: keys.envato_elements_session || '',
  };
}

async function loginToElements(email: string, password: string): Promise<string> {
  const loginPageRes = await fetch('https://account.envato.com/sign_in?to=elements', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  
  const html = await loginPageRes.text();
  const csrfMatch = html.match(/name="authenticity_token"\s+value="([^"]+)"/);
  const csrfToken = csrfMatch ? csrfMatch[1] : '';
  
  const rawCookies = loginPageRes.headers.get('set-cookie') || '';
  const cookies = rawCookies.split(',').map(c => c.split(';')[0].trim()).join('; ');

  const loginRes = await fetch('https://account.envato.com/sign_in', {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://account.envato.com/sign_in',
    },
    body: new URLSearchParams({
      'authenticity_token': csrfToken,
      'user_session[email]': email,
      'user_session[password]': password,
      'user_session[remember_me]': '1',
      'commit': 'Sign in',
    }).toString(),
  });

  let currentCookies = cookies;
  const newCookies = loginRes.headers.get('set-cookie') || '';
  if (newCookies) {
    newCookies.split(',').forEach(c => {
      const part = c.split(';')[0].trim();
      if (part) currentCookies += '; ' + part;
    });
  }

  // Seguir redirects
  let redirectUrl = loginRes.headers.get('location') || '';
  let hops = 0;
  while (redirectUrl && hops < 6) {
    hops++;
    const r = await fetch(redirectUrl, {
      redirect: 'manual',
      headers: { 'Cookie': currentCookies, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const rc = r.headers.get('set-cookie') || '';
    if (rc) rc.split(',').forEach(c => { const p = c.split(';')[0].trim(); if (p) currentCookies += '; ' + p; });
    redirectUrl = r.headers.get('location') || '';
    if (!redirectUrl || r.status === 200) break;
  }
  
  return currentCookies;
}

async function getDownloadUrl(itemSlug: string, session: string): Promise<string> {
  // Intentar obtener la URL de descarga directa desde la API interna de Elements
  const itemUrl = `https://elements.envato.com/${itemSlug}`;
  
  // Primero visitar la página del item para obtener el download token
  const pageRes = await fetch(itemUrl, {
    headers: {
      'Cookie': session,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    }
  });
  
  if (!pageRes.ok) throw new Error(`Error ${pageRes.status} al acceder al item`);
  
  const html = await pageRes.text();
  
  // Buscar en __NEXT_DATA__ el item ID real
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  let itemId = '';
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]);
      itemId = nextData?.props?.pageProps?.item?.id ||
               nextData?.props?.pageProps?.data?.id ||
               nextData?.props?.pageProps?.itemId || '';
    } catch {}
  }

  if (!itemId) {
    // Intentar extraer ID del HTML
    const idMatch = html.match(/"id"\s*:\s*"?(\d+)"?/);
    itemId = idMatch ? idMatch[1] : '';
  }

  if (!itemId) throw new Error('No se pudo obtener el ID del item para descargar');

  // Llamar al endpoint de descarga de Elements
  const downloadEndpoints = [
    `https://elements.envato.com/api/v2/items/${itemId}/download`,
    `https://elements.envato.com/api/items/${itemId}/download`,
    `https://elements.envato.com/s/items/${itemId}/download`,
  ];

  for (const endpoint of downloadEndpoints) {
    const dlRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Cookie': session,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': itemUrl,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ item_id: itemId }),
    });

    if (dlRes.ok) {
      const dlData = await dlRes.json();
      const url = dlData.download_url || dlData.url || dlData.link;
      if (url) return url;
    }
  }

  throw new Error('No se pudo obtener la URL de descarga. El item puede requerir activación manual en elements.envato.com');
}

const PLATFORM_LABELS: Record<string, string> = {
  mailchimp: 'MailChimp', stampready: 'StampReady',
  campaignmonitor: 'Campaign Monitor', generic: 'HTML Genérico',
};

function detectPlatform(html: string): string {
  const h = html.toLowerCase();
  if (h.includes('mc:edit') || h.includes('mailchimp')) return 'mailchimp';
  if (h.includes('stampready')) return 'stampready';
  if (h.includes('campaignmonitor') || h.includes('editable')) return 'campaignmonitor';
  return 'generic';
}

async function processZip(zipBuffer: ArrayBuffer) {
  const zip = new JSZip();
  await zip.loadAsync(zipBuffer);

  const imageMap: Record<string, string> = {};
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
  const mimeMap: Record<string, string> = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', svg:'image/svg+xml', webp:'image/webp' };

  await Promise.all(Object.entries(zip.files).map(async ([path, entry]) => {
    if ((entry as any).dir) return;
    if (!imageExts.some(ext => path.toLowerCase().endsWith(ext))) return;
    try {
      const buf = await (entry as any).async('nodebuffer');
      const ext = path.toLowerCase().split('.').pop() || 'png';
      const b64 = `data:${mimeMap[ext] || 'image/png'};base64,${buf.toString('base64')}`;
      const fn = path.split('/').pop() || '';
      imageMap[path] = b64; imageMap[fn] = b64; imageMap['images/' + fn] = b64;
    } catch {}
  }));

  const fixImages = (html: string) => html
    .replace(/src=["']([^"']+)["']/gi, (m, src) => {
      if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) return m;
      const fn = src.split('/').pop() || '';
      const r = imageMap[src] || imageMap[fn] || imageMap['images/' + fn];
      return r ? `src="${r}"` : `src="https://placehold.co/600x300/1a1a1a/555?text=${encodeURIComponent(fn)}"`;
    })
    .replace(/background=["']([^"']+)["']/gi, (m, src) => {
      if (src.startsWith('http') || src.startsWith('data:')) return m;
      const fn = src.split('/').pop() || '';
      const r = imageMap[src] || imageMap[fn];
      return r ? `background="${r}"` : m;
    });

  const htmlEntries = Object.entries(zip.files)
    .filter(([p, e]) => !(e as any).dir && p.toLowerCase().endsWith('.html') && !p.toLowerCase().includes('documentation'))
    .sort(([a], [b]) => a.localeCompare(b));

  if (htmlEntries.length === 0) return null;

  return Promise.all(htmlEntries.map(async ([path, entry]) => {
    const raw = await (entry as any).async('string');
    const htmlContent = fixImages(raw);
    const platform = detectPlatform(htmlContent);
    return { path, name: path.split('/').pop()?.replace('.html', '') || path, htmlContent, platform, platformLabel: PLATFORM_LABELS[platform] || 'HTML Genérico' };
  }));
}

export async function POST(request: NextRequest) {
  try {
    const { item_slug, item_url } = await request.json();
    if (!item_slug && !item_url) return NextResponse.json({ success: false, error: 'Se requiere item_slug o item_url' }, { status: 400 });

    const credentials = await getSessionAndCredentials();
    let { email, password } = credentials;
    let session = credentials.session;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        needsCredentials: true,
        error: 'Agrega envato_elements_email y envato_elements_password en Configuración → API Keys',
      }, { status: 401 });
    }

    // Login si no hay sesión
    if (!session) {
      session = await loginToElements(email, password);
      await supabase.from('api_keys').upsert(
        { key_name: 'envato_elements_session', key_value: session },
        { onConflict: 'key_name' }
      );
    }

    const slug = item_slug || item_url.split('/').pop()?.split('?')[0] || '';

    // Obtener URL de descarga
    let downloadUrl: string;
    try {
      downloadUrl = await getDownloadUrl(slug, session);
    } catch {
      // Reintentar con login fresco
      session = await loginToElements(email, password);
      await supabase.from('api_keys').upsert(
        { key_name: 'envato_elements_session', key_value: session },
        { onConflict: 'key_name' }
      );
      downloadUrl = await getDownloadUrl(slug, session);
    }

    // Descargar ZIP
    const zipRes = await fetch(downloadUrl, {
      headers: { 'Cookie': session, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    if (!zipRes.ok) throw new Error(`Error ${zipRes.status} descargando el ZIP`);

    const zipBuffer = await zipRes.arrayBuffer();
    const htmlFiles = await processZip(zipBuffer);

    if (!htmlFiles || htmlFiles.length === 0) {
      return NextResponse.json({ success: false, error: 'No se encontraron HTMLs en el ZIP' }, { status: 400 });
    }

    return NextResponse.json({ success: true, htmlFiles });

  } catch (err: any) {
    console.error('Elements download error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

