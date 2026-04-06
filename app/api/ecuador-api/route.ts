import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://apiconsult.zampisoft.com/api/consultar';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const full = searchParams.get('full') === 'true';

    // Priorizamos el token enviado desde el cliente (headers)
    const ACTIVE_TOKEN = request.headers.get('x-apiconsult-token');

    if (!id) {
        return NextResponse.json({ success: false, message: 'ID (Cédula/RUC) es requerido' }, { status: 400 });
    }

    if (!ACTIVE_TOKEN) {
        return NextResponse.json({ success: false, message: 'ApiConsult Token no configurado' }, { status: 500 });
    }

    try {
        console.log(`[EcuadorAPI Proxy] Querying for ${id} using token: ${ACTIVE_TOKEN.substring(0, 5)}...`);

        // El endpoint es el mismo para Cédula y RUC en Zampisoft
        const url = `${API_BASE_URL}?identificacion=${id}&token=${ACTIVE_TOKEN}${full ? '&full=true' : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        // Zampisoft devuelve los datos directamente en el objeto o bajo claves específicas
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Ecuador API Proxy Error:', error);
        return NextResponse.json({ success: false, message: 'Fallo la comunicación con el proveedor (Ecuador)' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const ACTIVE_TOKEN = request.headers.get('x-apiconsult-token');

    if (!ACTIVE_TOKEN) {
        return NextResponse.json({ success: false, message: 'ApiConsult Token no configurado' }, { status: 500 });
    }

    try {
        const body = await request.json();

        console.log(`[EcuadorAPI Proxy] Signing document using token: ${ACTIVE_TOKEN.substring(0, 5)}...`);

        const response = await fetch('https://apiconsult.zampisoft.com/api/firmar', {
            method: 'POST',
            headers: {
                'X-API-KEY': ACTIVE_TOKEN,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Ecuador API Sign Error:', error);
        return NextResponse.json({ success: false, message: 'Fallo la comunicación con el firmador (Ecuador)' }, { status: 500 });
    }
}
