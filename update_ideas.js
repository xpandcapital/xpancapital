const fs = require('fs');
const path = './app/superadmin/api-nube/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const newIdeasObj = JSON.parse(fs.readFileSync('./new_ideas.json', 'utf8'));

// We need to replace `const API_IDEAS: Record... = { ... };`
// and the function `getAppIdeas`

const startIdeas = content.indexOf('const API_IDEAS: Record');
const endIdeas = content.indexOf('const GENERIC_IDEAS');
if (startIdeas === -1 || endIdeas === -1) {
    console.error("Could not find boundaries for API_IDEAS");
    process.exit(1);
}

// Also find getAppIdeas
const startGetAppIdeas = content.indexOf('    const getAppIdeas = (appId: string) => {');
const endGetAppIdeas = content.indexOf('    const [categoryOrder, setCategoryOrder]');

if (startGetAppIdeas === -1 || endGetAppIdeas === -1) {
    console.error("Could not find boundaries for getAppIdeas");
    process.exit(1);
}

const newApiIdeasCode = `const API_IDEAS: Record<string, { title: string; ideas: { category: string; items: string[] }[] }> = ${JSON.stringify(newIdeasObj, null, 4)};\n\n`;

const newGetAppIdeasCode = `    const getAppIdeas = (appId: string) => {
        const map: Record<string, string> = {
            'notion': 'notion',
            'planifyx': 'planifyx', 'whatsapp': 'planifyx', 'twilio': 'planifyx',
            'brand2social': 'brand2social',
            'cpanel': 'cpanel',
            'gemini': 'ia_llm', 'openai': 'ia_llm', 'groq': 'ia_llm', 'anthropic': 'ia_llm', 'opencodego': 'ia_llm', 'opengozen': 'ia_llm',
            'replicate': 'multimedia', 'stability': 'multimedia', 'elevenlabs': 'multimedia', 'freepik': 'multimedia', 'huggingface': 'multimedia',
            'stripe': 'pagos_tarjeta', 'mercadopago': 'pagos_tarjeta', 'paypal': 'pagos_tarjeta', 'payu_col': 'pagos_tarjeta', 'epayco': 'pagos_tarjeta', 'wompi': 'pagos_tarjeta', 'bancolombia': 'pagos_tarjeta', 'izipay': 'pagos_tarjeta', 'culqi': 'pagos_tarjeta', 'paymentez': 'pagos_tarjeta', 'placetopay': 'pagos_tarjeta',
            'yape_plin': 'pagos_qr',
            'google_maps': 'mapas', 'mapbox': 'mapas', 'locationiq': 'mapas', 'openstreetmap': 'mapas',
            'peruapi': 'identidad', 'reniec': 'identidad', 'registro_civil_ec': 'identidad', 'datauno': 'identidad',
            'apisunat': 'facturacion', 'sri': 'facturacion', 'dian': 'facturacion', 'apiconsult': 'facturacion',
            'olva': 'logistica', 'serpost': 'logistica',
            'binance': 'crypto', 'coinbase': 'crypto', 'kraken': 'crypto', 'bybit': 'crypto', 'okx': 'crypto', 'coinmarketcap': 'crypto', 'coingecko': 'crypto',
            'tradingview': 'trading', 'metatrader': 'trading', 'ibkr': 'trading', 'alpaca': 'trading', 'threecommas': 'trading', 'cryptohopper': 'trading', 'quantconnect': 'trading', 'ccxt': 'trading',
            'resend': 'email', 'sendgrid': 'email', 'mailgun': 'email',
            'pusher': 'push', 'onesignal': 'push', 'pushwoosh': 'push', 'fcm': 'push',
            'canva': 'multimedia', 'adilo': 'multimedia', 'unsplash': 'multimedia', 'pexels': 'multimedia', 'pixabay': 'multimedia', 'brandfetch': 'multimedia', 'envato': 'multimedia', 'iconfinder': 'multimedia', 'flaticon': 'multimedia',
            'youtube': 'multimedia', 'vimeo': 'multimedia',
            'pdfmonkey': 'documentos', 'docspring': 'documentos', 'pandadoc': 'documentos',
            'onfido': 'verificacion_bio', 'jumio': 'verificacion_bio', 'authenteq': 'verificacion_bio',
            'supabase': 'basedatos', 'firebase': 'basedatos', 'mongodb': 'basedatos', 'planetscale': 'basedatos', 'upstash': 'basedatos',
            'adsense': 'publicidad', 'google_ads': 'publicidad', 'meta_pixel': 'publicidad', 'tiktok_pixel': 'publicidad',
            'google_analytics': 'analytics', 'mixpanel': 'analytics', 'hotjar': 'analytics', 'plausible': 'analytics', 'amplitude': 'analytics',
            'pabbly': 'automatizacion', 'make': 'automatizacion', 'n8n': 'automatizacion', 'zapier': 'automatizacion',
            'calendly': 'calendarios', 'calcom': 'calendarios', 'flaxxa': 'calendarios',
            'cloudinary': 'almacenamiento', 'aws_s3': 'almacenamiento',
            'blis_config': 'gamificacion'
        };
        const key = map[appId] || 'basedatos';
        return API_IDEAS[key];
    };\n\n`;

// First replace getAppIdeas because it's further down
content = content.slice(0, startGetAppIdeas) + newGetAppIdeasCode + content.slice(endGetAppIdeas);

// Then replace API_IDEAS and GENERIC_IDEAS
const endGeneric = content.indexOf('export default function AdminCloudPage');
content = content.slice(0, startIdeas) + newApiIdeasCode + content.slice(endGeneric);

fs.writeFileSync(path, content);
console.log("Ideas updated successfully");