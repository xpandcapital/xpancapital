import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://peruapi.com/api';
const API_TOKEN = process.env.NEXT_PUBLIC_PERU_API_TOKEN || '';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // Priorizamos el token enviado desde el cliente (headers o query)
    const headerToken = request.headers.get('x-peru-api-token');
    const queryToken = searchParams.get('token');

    // Si el header está presente (incluso si es vacío), lo usamos para dar control total al Dashboard
    const ACTIVE_TOKEN = headerToken !== null ? headerToken : (queryToken || API_TOKEN);

    if (!type) {
        return NextResponse.json({ success: false, message: 'Faltan parámetros' }, { status: 400 });
    }

    if (!id && type !== 'tipo_cambio') {
        return NextResponse.json({ success: false, message: 'ID es requerido para este tipo' }, { status: 400 });
    }

    if (!ACTIVE_TOKEN) {
        return NextResponse.json({ success: false, message: 'API Token no configurado' }, { status: 500 });
    }

    try {
        console.log(`[PeruAPI Proxy] Querying ${type}${id ? ` for ${id}` : ''} using token: ${ACTIVE_TOKEN.substring(0, 5)}...`);
        const url = id
            ? `${API_BASE_URL}/${type}/${id}?api_token=${ACTIVE_TOKEN}`
            : `${API_BASE_URL}/${type}?api_token=${ACTIVE_TOKEN}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API Proxy Error:', error);
        return NextResponse.json({ success: false, message: 'Fallo la comunicación con el proveedor' }, { status: 500 });
    }
}
