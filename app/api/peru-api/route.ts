import { NextResponse } from 'next/server'
import { fetchProxied } from '@/lib/fetch-with-proxy'

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
        const encodedToken = encodeURIComponent(ACTIVE_TOKEN);
        const url = id
            ? `${API_BASE_URL}/${type}/${encodeURIComponent(id)}?api_token=${encodedToken}`
            : `${API_BASE_URL}/${type}?api_token=${encodedToken}`;

        const response = await fetchProxied(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ success: false, message: data.mensaje || data.message || `Error HTTP ${response.status}` }, { status: response.status });
        }
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('API Proxy Error:', error);
        return NextResponse.json({ success: false, message: 'Fallo la comunicación con el proveedor' }, { status: 500 });
    }
}
