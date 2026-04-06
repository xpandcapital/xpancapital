import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getToken(): Promise<string> {
  const { data } = await supabase.from('api_keys').select('key_name, key_value');
  const keys: Record<string, string> = {};
  data?.forEach((k: any) => { keys[k.key_name] = k.key_value || ''; });
  return keys.envato_oauth_access_token || keys.envato_personal_token || keys.envato_api_key || '';
}

export async function GET(request: NextRequest) {
  const token = await getToken();
  if (!token) return NextResponse.json({ success: false, error: 'Sin token' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const term = searchParams.get('term') || '';

  // Listar compras del usuario en Envato Market
  const url = term
    ? `https://api.envato.com/v3/market/buyer/purchases?filter_by=by_site&site=themeforest.net&search=${encodeURIComponent(term)}`
    : `https://api.envato.com/v3/market/buyer/purchases?filter_by=by_site&site=themeforest.net&page=${page}`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ success: false, error: err, status: res.status }, { status: res.status });
  }

  const data = await res.json();

  // Mapear a formato similar al de búsqueda
  const purchases = (data.results || data.purchases || []).map((p: any) => {
    const item = p.item || p;
    const previews = item.previews || {};
    const landscape = previews.landscape_preview || {};
    const square = previews.icon_with_square_preview || {};
    const thumbnail = landscape.landscape_url || square.square_url || item.thumbnail_url || '';

    return {
      id: item.id,
      envatoId: item.id,
      purchaseCode: p.code || '',
      type: 'envato_template',
      title: item.name || item.slug || 'Item',
      thumbnail,
      source: 'envato',
      author: item.author_username || '',
      price: item.price_cents ? (item.price_cents / 100).toFixed(0) : null,
      rating: item.rating?.rating ? parseFloat(item.rating.rating).toFixed(1) : null,
      sales: item.number_of_sales || 0,
      url: item.url || `https://themeforest.net/item/${item.id}`,
      purchasedAt: p.sold_at || p.created_at || '',
      supported_until: p.supported_until || '',
    };
  });

  return NextResponse.json({
    success: true,
    purchases,
    total: data.total_results || data.count || purchases.length,
    page: data.current_page || 1,
    totalPages: data.total_pages || 1,
  });
}
