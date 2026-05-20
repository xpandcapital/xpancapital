/**
 * Registro de inicios de sesión para detección de anomalías geográficas
 */

import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

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

    // Obtener el usuario desde las cookies de sesión
    const accessToken = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-' + supabaseUrl.split('.')[0].split('//')[1] + '-auth-token')?.value

    if (!accessToken) return

    // Verificar la sesión con el token
    const { data: { user } } = await supabase.auth.getUser(accessToken)
    if (!user?.id || !user?.email) return

    // Verificar si este país ya está en el historial del usuario
    const { data: historial } = await supabase
      .from('login_history')
      .select('pais')
      .eq('user_id', user.id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    const paisesPrevios = new Set((historial || []).map(h => h.pais))
    const esAnomalo = !paisesPrevios.has(pais) && paisesPrevios.size > 0

    await supabase.from('login_history').insert({
      empresa_id: DEFAULT_EMPRESA_ID,
      user_id: user.id,
      email: user.email,
      ip,
      pais,
      user_agent: userAgent || null,
      es_anomalo: esAnomalo,
    })

    // Si es anómalo, insertar alerta
    if (esAnomalo) {
      await supabase.from('security_alerts').insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        tipo: 'login_geo',
        nivel: 'warning',
        titulo: `[GEO] Login desde nueva ubicación: ${pais}`,
        detalle: `${user.email} inició sesión desde ${pais} por primera vez. Historial: ${[...paisesPrevios].join(', ')}`,
        metadata: { email: user.email, pais, ip, historial: [...paisesPrevios] },
      })
    }
  } catch {
    // Silencioso — no queremos que falle el login por esto
  }
}
