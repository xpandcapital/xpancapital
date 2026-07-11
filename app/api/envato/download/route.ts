export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getBestToken(): Promise<{ token: string; method: string }> {
  const { data } = await supabase.from('api_keys').select('key_name, key_value');
  const keys: Record<string, string> = {};
  data?.forEach((k: any) => { keys[k.key_name] = k.key_value || ''; });

  // Prioridad: OAuth access token (no expirado) > refresh > personal token
  const oauthToken = keys.envato_oauth_access_token || '';
  const refreshToken = keys.envato_oauth_refresh_token || '';
  const expiresAt = keys.envato_oauth_expires_at;
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : true;
  const clientId = keys.envato_oauth_client_id || keys.envato_client_id || '';
  const clientSecret = keys.envato_oauth_client_secret || keys.envato_client_secret || '';

  if (oauthToken && !isExpired) {
    return { token: oauthToken, method: 'oauth' };
  }

  // Intentar refrescar el token OAuth
  if (refreshToken && clientId && clientSecret) {
    try {
      const res = await fetch('https://api.envato.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      });
      if (res.ok) {
        const data = await res.json();
        const newExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();
        await supabase.from('api_keys').upsert([
          { key_name: 'envato_oauth_access_token', key_value: data.access_token },
          { key_name: 'envato_oauth_expires_at',   key_value: newExpiry },
        ], { onConflict: 'key_name' });
        return { token: data.access_token, method: 'oauth_refreshed' };
      }
    } catch {}
  }

  // Fallback: personal token
  const personalToken = keys.envato_personal_token || keys.envato_api_key || '';
  return { token: personalToken, method: 'personal_token' };
}

const PLATFORM_LABELS: Record<string, string> = {
  mailchimp: 'MailChimp', stampready: 'StampReady',
  campaignmonitor: 'Campaign Monitor', sendgrid: 'SendGrid',
  freshmail: 'FreshMail', activecampaign: 'ActiveCampaign',
  mymail: 'MyMail', icontact: 'iContact', generic: 'HTML Genérico'
};

function detectPlatform(html: string): string {
  const h = html.toLowerCase();
  if (h.includes('mc:edit') || h.includes('mc:repeatable') || h.includes('mailchimp')) return 'mailchimp';
  if (h.includes('stampready') || h.includes('sr:')) return 'stampready';
  if (h.includes('campaignmonitor') || h.includes('editable')) return 'campaignmonitor';
  if (h.includes('sendgrid')) return 'sendgrid';
  if (h.includes('activecampaign')) return 'activecampaign';
  return 'generic';
}

async function processZipBuffer(zipBuffer: ArrayBuffer) {
  const zip = new JSZip();
  await zip.loadAsync(zipBuffer);

  // Extraer imágenes como base64
  const imageMap: Record<string, string> = {};
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp'
  };

  await Promise.all(
    Object.entries(zip.files).map(async ([path, entry]) => {
      if ((entry as any).dir) return;
      if (!imageExts.some(ext => path.toLowerCase().endsWith(ext))) return;
      try {
        const buf = await (entry as any).async('nodebuffer');
        const ext = (path.toLowerCase().split('.').pop() || 'png');
        const b64 = `data:${mimeMap[ext] || 'image/png'};base64,${buf.toString('base64')}`;
        const fn = path.split('/').pop() || '';
        imageMap[path] = b64;
        imageMap[fn] = b64;
        imageMap['images/' + fn] = b64;
      } catch {}
    })
  );

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

  // Encontrar HTMLs (excluir Documentation/)
  const htmlEntries = Object.entries(zip.files)
    .filter(([p, e]) => !(e as any).dir && p.toLowerCase().endsWith('.html') && !p.toLowerCase().includes('documentation'))
    .sort(([a], [b]) => a.localeCompare(b));

  if (htmlEntries.length === 0) return null;

  const htmlFiles = await Promise.all(
    htmlEntries.map(async ([path, entry]) => {
      const raw = await (entry as any).async('string');
      const htmlContent = fixImages(raw);
      const platform = detectPlatform(htmlContent);
      return {
        path,
        name: path.split('/').pop()?.replace('.html', '') || path,
        htmlContent,
        platform,
        platformLabel: PLATFORM_LABELS[platform] || 'HTML Genérico'
      };
    })
  );

  return htmlFiles;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_id } = body;
    if (!item_id) return NextResponse.json({ success: false, error: 'item_id requerido' }, { status: 400 });

    const { token, method } = await getBestToken();
    if (!token) return NextResponse.json({
      success: false,
      error: 'No hay API key de Envato. Ve a Configuración → API Keys y agrega tu Envato Personal Token.'
    }, { status: 401 });

    // ── Estrategia 1: Envato Market — compras individuales ────────────────────
    let zipBuffer: ArrayBuffer | null = null;

    const marketUrl = `https://api.envato.com/v3/market/buyer/download?item_id=${item_id}&shorten_url=false`;
    const marketRes = await fetch(marketUrl, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    if (marketRes.ok) {
      const dlData = await marketRes.json();
      const zipUrl = dlData.download || dlData.url || dlData.direct_download_url;
      if (zipUrl) {
        const zipRes = await fetch(zipUrl, { headers: { 'Authorization': `Bearer ${token}` } });
        if (zipRes.ok) zipBuffer = await zipRes.arrayBuffer();
      }
    }

    // ── Estrategia 2: Envato Elements — suscripción ───────────────────────────
    // Elements usa un endpoint diferente
    if (!zipBuffer) {
      const elementsUrl = `https://elements.envato.com/api/download/${item_id}`;
      const elementsRes = await fetch(elementsUrl, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (elementsRes.ok) {
        const elData = await elementsRes.json();
        const zipUrl = elData.download_url || elData.url;
        if (zipUrl) {
          const zipRes = await fetch(zipUrl, { headers: { 'Authorization': `Bearer ${token}` } });
          if (zipRes.ok) zipBuffer = await zipRes.arrayBuffer();
        }
      }
    }

    // ── Estrategia 3: endpoint alternativo de compras ─────────────────────────
    if (!zipBuffer) {
      const altUrl = `https://api.envato.com/v1/market/buyer/download?item_id=${item_id}`;
      const altRes = await fetch(altUrl, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (altRes.ok) {
        const altData = await altRes.json();
        const zipUrl = altData.download || altData[item_id];
        if (zipUrl) {
          const zipRes = await fetch(typeof zipUrl === 'string' ? zipUrl : zipUrl.url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (zipRes.ok) zipBuffer = await zipRes.arrayBuffer();
        }
      }
    }

    if (!zipBuffer) {
      // Verificar si al menos tiene el token válido
      const meRes = await fetch('https://api.envato.com/v1/market/private/user/account.json', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meOk = meRes.ok;

      return NextResponse.json({
        success: false,
        needsPurchase: true,
        error: meOk
          ? `No se pudo descargar el item ${item_id}. Si usas Envato Elements, descarga el ZIP manualmente desde elements.envato.com y súbelo con el botón "Subir .zip".`
          : `Token de Envato inválido o sin permisos. Ve a Configuración → API Keys y verifica tu Personal Token.`,
        purchaseUrl: `https://themeforest.net/item/${item_id}`
      }, { status: 403 });
    }
    const htmlFiles = await processZipBuffer(zipBuffer);

    if (!htmlFiles || htmlFiles.length === 0) {
      return NextResponse.json({ success: false, error: 'No se encontraron archivos HTML en el ZIP descargado' }, { status: 400 });
    }

    return NextResponse.json({ success: true, htmlFiles });

  } catch (err) {
    console.error('Error /api/envato/download:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

