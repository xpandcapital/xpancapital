export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/superadmin/mails?envato_error=${error || 'no_code'}`
    );
  }

  const { clientId, clientSecret } = await getEnvatoOAuthCredentials();
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/envato/callback`;

  // Intercambiar code por access_token
  const tokenRes = await fetch('https://api.envato.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error('Envato token error:', err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/superadmin/mails?envato_error=token_failed`
    );
  }

  const tokenData = await tokenRes.json();
  // { access_token, refresh_token, token_type, expires_in }

  // Guardar tokens en Supabase
  const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

  await supabase.from('api_keys').upsert([
    { key_name: 'envato_oauth_access_token',  key_value: tokenData.access_token },
    { key_name: 'envato_oauth_refresh_token', key_value: tokenData.refresh_token },
    { key_name: 'envato_oauth_expires_at',    key_value: expiresAt },
  ], { onConflict: 'key_name' });

  // Redirigir de vuelta al editor con éxito
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/superadmin/mails?envato_connected=1`
  );
}

