import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function recordLoginAttempt(
  request: { cookies: { get: (name: string) => { value: string } | undefined } },
  ip: string,
  pais: string,
  userAgent: string
): Promise<void> {
  if (!supabaseUrl || !supabaseServiceKey) return

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const accessToken = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-' + supabaseUrl.split('.')[0].split('//')[1] + '-auth-token')?.value

    if (!accessToken) return

    const { data: { user } } = await supabase.auth.getUser(accessToken)
    if (!user?.id || !user?.email) return

    const { data: historial } = await supabase
      .from('login_history')
      .select('pais')
      .eq('user_id', user.id)

    const paisesPrevios = new Set((historial || []).map(h => h.pais))
    const esAnomalo = !paisesPrevios.has(pais) && paisesPrevios.size > 0

    await supabase.from('login_history').insert({
      user_id: user.id,
      email: user.email,
      ip,
      pais,
      created_at: new Date().toISOString(),
    })

    if (esAnomalo) {
      await supabase.from('security_alerts').insert({
        tipo: 'login_geo',
        nivel: 'warning',
        titulo: `[GEO] Login desde nueva ubicacion: ${pais}`,
        detalle: `${user.email} inicio sesion desde ${pais} por primera vez. Historial: ${[...paisesPrevios].join(', ')}`,
        metadata: { email: user.email, pais, ip, historial: [...paisesPrevios] },
      })
    }
  } catch {
    // Silencioso
  }
}
