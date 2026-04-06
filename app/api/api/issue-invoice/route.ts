import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { document, token, env } = await req.json();

        if (!document || !token) {
            return NextResponse.json({ success: false, message: 'Faltan datos (document/token)' }, { status: 400 });
        }

        const baseUrl = env === 'app' ? 'https://app.apisunat.pe' : 'https://sandbox.apisunat.pe';

        const response = await fetch(`${baseUrl}/api/v3/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(document)
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Invoice issuance error:', error);
        return NextResponse.json({ success: false, message: 'Error interno en el servidor (Invoice Proxy)' }, { status: 500 });
    }
}
