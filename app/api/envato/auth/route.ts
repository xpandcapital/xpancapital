import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

async function getEnvatoOAuthCredentials() {
  const { data } = await supabase.from('api_keys').select('key_name, key_value');
  const keys: Record<string, string> = {};
  data?.forEach((k: any) => { keys[k.key_name] = k.key_value || ''; });
  return {
    clientId: keys.envato_oauth_client_id || keys.envato_client_id || '',
    clientSecret: keys.envato_oauth_client_secret || keys.envato_client_secret || '',
  };
}

export async function GET(request: NextRequest) {
  const { clientId } = await getEnvatoOAuthCredentials();

  if (!clientId) {
    return NextResponse.json({
      success: false,
      error: 'No hay Envato OAuth Client ID configurado. Ve a Configuración → API Keys y agrega envato_oauth_client_id y envato_oauth_client_secret. Regístralos en https://build.envato.com/register/'
    }, { status: 400 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/envato/callback`;

  const authUrl = `https://api.envato.com/authorization?` + new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
  }).toString();

  return NextResponse.redirect(authUrl);
}

