import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data } = await supabase.from('api_keys').select('key_name, key_value');
  const keys: Record<string, string> = {};
  data?.forEach((k: any) => { keys[k.key_name] = k.key_value || ''; });

  const hasPersonalToken = !!(keys.envato_personal_token || keys.envato_api_key);
  const hasOAuthToken = !!keys.envato_oauth_access_token;
  const hasOAuthCredentials = !!(keys.envato_oauth_client_id || keys.envato_client_id);
  const expiresAt = keys.envato_oauth_expires_at;
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : true;

  // Si tiene OAuth token y no está expirado → conectado
  if (hasOAuthToken && !isExpired) {
    // Verificar con la API que el token es válido
    try {
      const userRes = await fetch('https://api.envato.com/v1/market/private/user/username.json', {
        headers: { 'Authorization': `Bearer ${keys.envato_oauth_access_token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        return NextResponse.json({
          connected: true,
          method: 'oauth',
          username: userData.username,
          expiresAt,
        });
      }
    } catch {}
  }

  // Si tiene token personal → conectado con token personal
  if (hasPersonalToken) {
    try {
      const userRes = await fetch('https://api.envato.com/v1/market/private/user/username.json', {
        headers: { 'Authorization': `Bearer ${keys.envato_personal_token || keys.envato_api_key}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        return NextResponse.json({
          connected: true,
          method: 'personal_token',
          username: userData.username,
        });
      }
    } catch {}
  }

  return NextResponse.json({
    connected: false,
    hasOAuthCredentials,
    hasPersonalToken,
  });
}
