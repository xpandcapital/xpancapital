import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { getApiKey } from '@/lib/api-keys'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const { service, key, token_vimeo, url_cloudinary, merchant_id } = await req.json();

        // 1. Priorizamos Headers por si acaso
        const hKey = req.headers.get('x-api-key');
        let activeKey = key || hKey;

        // 2. Si no hay key, intentar obtenerla de API Nube
        if (!activeKey) {
            const auth = await getAuthUser(req)
            if (auth) {
                const supabase = createClient()
                const serviceKeyMap: Record<string, string> = {
                    'ai-gemini': 'gemini_key',
                    'ai-openai': 'openai_key',
                    'ai-groq': 'groq_key',
                    'resend': 'resend_key',
                    'email': 'resend_key',
                }
                const keyName = serviceKeyMap[service] || service
                const dbKey = await getApiKey(supabase, keyName, auth.userId, auth.empresaId)
                if (dbKey) activeKey = dbKey
            }
        }

        if (!service) return NextResponse.json({ ok: false, msg: 'Falta servicio' }, { status: 400 });

        // --- AI: Gemini ---
        if (service === 'ai-gemini') {
            if (!activeKey) return NextResponse.json({ ok: false, msg: 'Gemini: Sin Key. Agréga tu gemini_key en API Nube.' })
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`, { next: { revalidate: 0 } });
            if (!r.ok) return NextResponse.json({ ok: false, msg: 'Gemini: Key Inválida o sin acceso' });
            return NextResponse.json({ ok: true, msg: 'Gemini Activo' });
        }

        // --- AI: OpenAI ---
        if (service === 'ai-openai') {
            if (!activeKey) return NextResponse.json({ ok: false, msg: 'OpenAI: Sin Key. Agréga tu openai_key en API Nube.' })
            const r = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${activeKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: 'id' }], max_tokens: 1 }),
            });
            if (r.status === 401) return NextResponse.json({ ok: false, msg: 'OpenAI: Key Inválida' });
            return NextResponse.json({ ok: r.ok, msg: r.ok ? 'OpenAI Listo' : `OpenAI Error: ${r.status}` });
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

        // --- Peru: SUNAT/RENIEC (Decolecta) ---
        if (service === 'peru') {
            const r = await fetch('https://api.decolecta.com/v1/tipo-cambio/sbs/average?currency=USD', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${activeKey}`, 'Accept': 'application/json' },
                next: { revalidate: 0 }
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) return NextResponse.json({ ok: false, msg: d.error || d.message || `Token Inválido (HTTP ${r.status})` });
            return NextResponse.json({ ok: true, msg: `SUNAT/RENIEC OK (TC: ${d.buy_price || d.sell_price || '...'})` });
        }

        // --- AI: Groq ---
        if (service === 'ai-groq') {
            if (!activeKey) return NextResponse.json({ ok: false, msg: 'Groq: Sin Key. Agréga tu groq_key en API Nube.' })
            const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${activeKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: 'id' }], max_tokens: 1 }),
            });
            if (r.status === 401) return NextResponse.json({ ok: false, msg: 'Groq: Key Inválida' });
            return NextResponse.json({ ok: r.ok, msg: r.ok ? 'Groq Listo' : `Groq Error: ${r.status}` });
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

        // --- Pasarela: Izipay (Micuentaveb) ---
        if (service === 'izipay') {
            if (!activeKey || !merchant_id) return NextResponse.json({ ok: false, msg: 'Izipay: Falta Shop ID o Secret Key' });
            const authString = Buffer.from(`${merchant_id}:${activeKey}`).toString('base64');
            const env = extra?.izipay_environment || 'sandbox';
            try {
                const r = await fetch('https://api.micuentaweb.pe/api-payment/v4/Charge/CreatePayment', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${authString}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: 100,
                        currency: 'USD',
                        orderId: `TEST-${Date.now()}`,
                        customer: { email: 'test@blis-corp.com' },
                    }),
                    next: { revalidate: 0 }
                });
                const data = await r.json().catch(() => ({}));
                if (r.status === 401 || r.status === 403) return NextResponse.json({ ok: false, msg: 'Izipay: Credenciales inválidas (401/403)' });
                if (data.status === 'ERROR') return NextResponse.json({ ok: false, msg: `Izipay: ${data.answer?.errorMessage || 'Error del servidor'}` });
                return NextResponse.json({ ok: true, msg: `Izipay: Conectado (${env}) - API responde correctamente` });
            } catch {
                return NextResponse.json({ ok: false, msg: 'Izipay: Error de conexión' });
            }
        }

        // --- Ecuador: ApiConsult (Zampisoft) ---
        if (service === 'apiconsult') {
            const r = await fetch(`https://apiconsult.zampisoft.com/api/consultar?identificacion=0900000000&token=${encodeURIComponent(activeKey)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 0 }
            });

            const data = await r.json().catch(() => ({}));

            if (data.error === 'Token incorrecto' || data.error === 'Token Invalido') {
                return NextResponse.json({ ok: false, msg: 'ApiConsult: Token Inválido o Error de Sesión' });
            }

            if (r.ok && !data.error) {
                return NextResponse.json({ ok: true, msg: 'ApiConsult: Conectado' });
            }

            if (!r.ok && r.status !== 200) {
                return NextResponse.json({ ok: false, msg: `ApiConsult: Error HTTP ${r.status}` });
            }

            return NextResponse.json({ ok: true, msg: `ApiConsult: Conectado${data.error ? ' (' + data.error + ')' : ''}` });
        }

        return NextResponse.json({ ok: false, msg: 'Servicio no soportado en Proxy' }, { status: 400 });

    } catch {
        return NextResponse.json({ ok: false, msg: 'Error de Red: El Proxy no alcanzó el destino' }, { status: 500 });
    }
}
