import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { service, key, token_vimeo, url_cloudinary, merchant_id } = await req.json();

        // 1. Priorizamos Headers por si acaso
        const hKey = req.headers.get('x-api-key');
        const activeKey = key || hKey;

        if (!service) return NextResponse.json({ ok: false, msg: 'Falta servicio' }, { status: 400 });

        // --- AI: Gemini ---
        if (service === 'ai-gemini') {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`, { next: { revalidate: 0 } });
            if (!r.ok) return NextResponse.json({ ok: false, msg: 'Gemini: Key Inválida' });
            return NextResponse.json({ ok: true, msg: 'Gemini Activo (Proxy)' });
        }

        // --- AI: OpenAI ---
        if (service === 'ai-openai') {
            const r = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${activeKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: 'id' }], max_tokens: 1 }),
                next: { revalidate: 0 }
            });
            if (r.status === 401) return NextResponse.json({ ok: false, msg: 'OpenAI: Key Inválida' });
            return NextResponse.json({ ok: r.ok, msg: r.ok ? 'OpenAI Listo (Proxy)' : `OpenAI Error: ${r.status}` });
        }

        // --- Email: Resend ---
        if (service === 'resend' || service === 'email') {
            const r = await fetch('https://api.resend.com/domains', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${activeKey}`, 'Content-Type': 'application/json' },
                next: { revalidate: 0 }
            });
            if (r.status === 401 || r.status === 403) return NextResponse.json({ ok: false, msg: 'Resend: Key Inválida' });
            return NextResponse.json({ ok: r.ok, msg: r.ok ? 'Resend: Conectado' : `Resend Error: ${r.status}` });
        }

        // --- Peru: SUNAT/RENIEC ---
        if (service === 'peru') {
            const r = await fetch(`https://peruapi.com/api/tipo_cambio?api_token=${activeKey}`, { next: { revalidate: 0 } });
            const d = await r.json();
            if (!r.ok) return NextResponse.json({ ok: false, msg: d.message || 'Token Inválido' });
            return NextResponse.json({ ok: true, msg: `SUNAT/RENIEC OK (TC: ${d.data?.venta || '...'})` });
        }

        // --- AI: Groq ---
        if (service === 'ai-groq') {
            if (!activeKey) return NextResponse.json({ ok: false, msg: 'Groq: Sin Key' });
            const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${activeKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: 'id' }], max_tokens: 1 }),
                next: { revalidate: 0 }
            });
            if (r.status === 401) return NextResponse.json({ ok: false, msg: 'Groq: Key Inválida' });
            return NextResponse.json({ ok: r.ok, msg: r.ok ? 'Groq Listo (Proxy)' : `Groq Error: ${r.status}` });
        }

        // --- Video: YouTube ---
        if (service === 'youtube' || (service === 'video' && activeKey)) {
            const r = await fetch(`https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=PE&key=${activeKey}`, { next: { revalidate: 0 } });
            if (!r.ok) return NextResponse.json({ ok: false, msg: 'YouTube: Key Inválida' });
            return NextResponse.json({ ok: true, msg: 'YouTube Activo' });
        }

        // --- Video: Vimeo ---
        if (service === 'vimeo') {
            const r = await fetch(`https://api.vimeo.com/me`, {
                headers: { 'Authorization': `Bearer ${token_vimeo || activeKey}` },
                next: { revalidate: 0 }
            });
            if (!r.ok) return NextResponse.json({ ok: false, msg: 'Vimeo: Token Inválido' });
            return NextResponse.json({ ok: true, msg: 'Vimeo Activo' });
        }

        // --- Media: Cloudinary (Pre-check) ---
        if (service === 'media' || service === 'cloudinary') {
            const url = url_cloudinary || activeKey;
            if (!url || !url.includes('cloudinary://')) return NextResponse.json({ ok: false, msg: 'Cloudinary: Formato URL Inválido' });
            return NextResponse.json({ ok: true, msg: 'Cloudinary: Configurado' });
        }

        // --- Facturación: ApiSunat ---
        if (service === 'apisunat' || service === 'facturacion') {
            const r = await fetch('https://sandbox.apisunat.pe/api/v3/organizations', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${activeKey}`, 'Content-Type': 'application/json' },
                next: { revalidate: 0 }
            });
            if (r.status === 401) return NextResponse.json({ ok: false, msg: 'ApiSunat: Token Inválido o Expirado' });
            return NextResponse.json({ ok: r.ok, msg: r.ok ? 'ApiSunat: Conectado (Sandbox)' : `ApiSunat Error: ${r.status}` });
        }

        // --- Pasarela: Izipay ---
        if (service === 'izipay') {
            if (!activeKey || !merchant_id) return NextResponse.json({ ok: false, msg: 'Izipay: Falta Merchant ID o Key' });
            return NextResponse.json({ ok: true, msg: 'Izipay: Configuración Validada (Proxy)' });
        }

        // --- Ecuador: ApiConsult (Zampisoft) ---
        if (service === 'apiconsult') {
            const r = await fetch(`https://apiconsult.zampisoft.com/api/consultar?identificacion=0900000000&token=${activeKey}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 0 }
            });

            const data = await r.json().catch(() => ({}));

            if (data.error === 'Token incorrecto') {
                return NextResponse.json({ ok: false, msg: 'ApiConsult: Token Inválido o Error de Sesión' });
            }

            return NextResponse.json({ ok: true, msg: 'ApiConsult: Conectado' });
        }

        return NextResponse.json({ ok: false, msg: 'Servicio no soportado en Proxy' }, { status: 400 });

    } catch {
        return NextResponse.json({ ok: false, msg: 'Error de Red: El Proxy no alcanzó el destino' }, { status: 500 });
    }
}
