import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSession(): Promise<string> {
  const { data } = await supabase.from('api_keys').select('key_name, key_value');
  const keys: Record<string, string> = {};
  data?.forEach((k: any) => { keys[k.key_name] = k.key_value || ''; });
  return keys.envato_elements_session || '';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !url.includes('envatousercontent.com')) {
    return new NextResponse('URL inválida', { status: 400 });
  }

  const session = await getSession();

  const res = await fetch(url, {
    headers: {
      'Cookie': session,
      'Referer': 'https://app.envato.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });

  if (!res.ok) {
    return new NextResponse('Error al obtener imagen', { status: res.status });
  }

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') || 'image/jpeg';

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    }
  });
}
