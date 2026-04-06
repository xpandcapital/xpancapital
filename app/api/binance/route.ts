import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ALLOWED_PUBLIC = [
    '/api/v3/ticker/price', '/api/v3/ticker/24hr', '/api/v3/klines',
    '/api/v3/depth', '/api/v3/exchangeInfo', '/api/v3/ticker',
    '/fapi/v1/ticker/price', '/fapi/v1/ticker/24hr', '/fapi/v1/klines', '/fapi/v1/depth',
    '/fapi/v1/exchangeInfo'
];

const ALLOWED_PRIVATE = [
    '/api/v3/account', '/api/v3/order', '/api/v3/openOrders',
    '/fapi/v1/order', '/fapi/v2/account', '/fapi/v2/balance', '/fapi/v1/leverage', '/fapi/v1/marginType',
    '/sapi/v1/margin/account', '/sapi/v1/margin/isolated/account',
    '/sapi/v1/margin/order', '/sapi/v1/margin/loan', '/sapi/v1/margin/repay',
    '/sapi/v1/asset/get-funding-asset', '/sapi/v1/simple-earn/flexible/position',
    '/sapi/v1/asset/transfer'
];

const isAllowedEndpoint = (ep: string, list: string[]) => list.some(a => ep.startsWith(a));

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { endpoint, method, params, apiKey: receivedApiKey, apiSecret: receivedApiSecret } = body;

        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint faltante' }, { status: 400 });
        }

        const isPublicEndpoint = isAllowedEndpoint(endpoint, ALLOWED_PUBLIC);
        const isPrivateEndpoint = isAllowedEndpoint(endpoint, ALLOWED_PRIVATE);

        if (!isPublicEndpoint && !isPrivateEndpoint) {
            return NextResponse.json({ error: 'Endpoint no permitido' }, { status: 403 });
        }

        if (isPrivateEndpoint && (!receivedApiKey || !receivedApiSecret)) {
            return NextResponse.json({ error: 'API Keys de Binance faltantes. Conecta tus llaves en la sección API Nube.' }, { status: 401 });
        }

        const apiKey = (receivedApiKey || "").trim();
        const apiSecret = (receivedApiSecret || "").trim();

        // Clean empty params
        const cleanParams: any = {};
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== null) {
                    cleanParams[key] = value;
                }
            }
        }

        const queryString = new URLSearchParams(cleanParams).toString();
        const timestamp = Date.now();
        let finalQuery = queryString;

        if (isPrivateEndpoint) {
            if (!cleanParams.recvWindow) cleanParams.recvWindow = 60000;
            let queryWithTimestamp = new URLSearchParams(cleanParams).toString();
            queryWithTimestamp += `&timestamp=${timestamp}`;
            const signature = crypto
                .createHmac('sha256', apiSecret)
                .update(queryWithTimestamp)
                .digest('hex');
            finalQuery = `${queryWithTimestamp}&signature=${signature}`;
        }

        const baseUrl = endpoint.startsWith('/fapi') ? 'https://fapi.binance.com' : 'https://api.binance.com';
        const url = `${baseUrl}${endpoint}?${finalQuery}`;

        const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
        const reqMethod = (method || 'GET').toUpperCase();
        if (!validMethods.includes(reqMethod)) {
            return NextResponse.json({ error: 'Método HTTP no válido' }, { status: 400 });
        }

        console.log(`[BINANCE API PROXY] ${reqMethod} ${endpoint}`);

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (isPrivateEndpoint) {
            headers['X-MBX-APIKEY'] = apiKey;
        }

        const response = await fetch(url, { method: reqMethod, headers });

        let data;
        try { data = await response.json(); }
        catch { return NextResponse.json({ error: 'Respuesta inválida de Binance' }, { status: 502 }); }

        if (!response.ok) {
            console.error('[BINANCE API ERROR]', data?.msg || response.status);
            return NextResponse.json({ error: data.msg || 'Error en Binance API' }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[BINANCE PROXY EXCEPTION]:', error.message);
        return NextResponse.json({ error: 'Fallo interno en el túnel proxy' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint || !isAllowedEndpoint(endpoint, ALLOWED_PUBLIC)) {
        return NextResponse.json({ error: 'Endpoint no permitido' }, { status: 403 });
    }

    // Reenviar todos los query params excepto 'endpoint' a Binance
    const forwardParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
        if (key !== 'endpoint') forwardParams.set(key, value);
    });
    const queryStr = forwardParams.toString();
    const baseUrl = endpoint.startsWith('/fapi') ? 'https://fapi.binance.com' : 'https://api.binance.com';
    const binanceUrl = `${baseUrl}${endpoint}${queryStr ? '?' + queryStr : ''}`;

    try {
        const response = await fetch(binanceUrl);
        let data;
        try { data = await response.json(); }
        catch { return NextResponse.json({ error: 'Respuesta inválida de Binance' }, { status: 502 }); }
        if (!response.ok) {
            return NextResponse.json({ error: data.msg || 'Error en Binance API' }, { status: response.status });
        }
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Fallo de red al consultar mercado' }, { status: 500 });
    }
}
