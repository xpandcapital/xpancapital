/**
 * AI Security Scanner para Xpand Capital
 *
 * Ejecuta 8 queries de auditoría en paralelo sobre Supabase,
 * envía los hallazgos a Gemini AI y retorna un reporte estructurado
 * con hallazgos, puntaje de seguridad y recomendaciones.
 */

import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GEMINI_KEY = process.env.GEMINI_API_KEY

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export interface ScannerFinding {
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  evidence: string
}

export interface ScannerRecommendation {
  action: 'active' | 'passive'
  title: string
  description: string
  urgency: 'inmediato' | '24h' | '72h' | 'semanal'
}

export interface ScannerResult {
  security_score: number
  scan_timestamp: string
  summary: string
  findings: ScannerFinding[]
  recommendations: ScannerRecommendation[]
  raw_data: Record<string, unknown>
}

// Datos recolectados en crudo para enviar a Gemini
interface ScanRawData {
  nuevos_admins: Array<{ email: string; rol: string; created_at: string }>
  templates_sospechosos: Array<{ id: string; nombre: string; snippet: string }>
  config_seguridad: { geobloqueo: boolean; security_headers: boolean; rate_limiting: boolean; bot_protection: boolean; alerts: boolean }
  api_keys_recientes: Array<{ id: string; nombre: string; created_at: string }>
  leads_xss: Array<{ id: string; nombre: string; campo: string; valor: string }>
  comentarios_spam: Array<{ id: string; contenido: string }>
  volumen_bloqueos: number
  logins_anomalos: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export async function collectScanData(): Promise<ScanRawData> {
  const supabase = getSupabase()

  const hace24h = new Date()
  hace24h.setDate(hace24h.getDate() - 1)

  const hace72h = new Date()
  hace72h.setDate(hace72h.getDate() - 3)

  const [
    { data: nuevosAdmins },
    { data: templates },
    { data: siteConfig },
    { data: apiKeys },
    { data: leads },
    { data: comments },
    { count: bloqueos },
    { count: loginsAnomalos },
  ] = await Promise.all([
    supabase.from('profiles').select('email, rol, created_at')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .in('rol', ['admin', 'superadmin'])
      .gte('created_at', hace72h.toISOString())
      .order('created_at', { ascending: false }).limit(10),
    supabase.from('templates').select('id, nombre, slug, secciones')
      .eq('empresa_id', DEFAULT_EMPRESA_ID).limit(50),
    supabase.from('site_config').select('security_config')
      .eq('empresa_id', DEFAULT_EMPRESA_ID).single(),
    supabase.from('api_keys').select('id, nombre, created_at')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .gte('created_at', hace72h.toISOString())
      .order('created_at', { ascending: false }).limit(10),
    supabase.from('leads').select('id, nombre, email, mensaje, datos')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('creado_en', { ascending: false }).limit(100),
    supabase.from('blog_comments').select('id, contenido')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('created_at', { ascending: false }).limit(50),
    supabase.from('security_logs').select('*', { count: 'exact', head: true })
      .eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', hace24h.toISOString()),
    supabase.from('login_history').select('*', { count: 'exact', head: true })
      .eq('empresa_id', DEFAULT_EMPRESA_ID).eq('es_anomalo', true)
      .gte('created_at', hace24h.toISOString()),
  ])

  // Detectar templates con código sospechoso
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templatesSospechosos: Array<{ id: string; nombre: string; snippet: string }> = []
  const patronesMaliciosos = ['<script', 'eval(', 'document.cookie', 'fetch(', 'XMLHttpRequest', '$.post', '$.ajax', 'base64,', 'atob(']
  for (const t of (templates || [])) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const texto = JSON.stringify((t as any).secciones || {}).toLowerCase()
    for (const patron of patronesMaliciosos) {
      if (texto.includes(patron)) {
        templatesSospechosos.push({
          id: t.id,
          nombre: t.nombre,
          snippet: texto.substring(Math.max(0, texto.indexOf(patron) - 50), texto.indexOf(patron) + 100)
        })
        break
      }
    }
  }

  // Detectar XSS en leads
  const leadsXss: Array<{ id: string; nombre: string; campo: string; valor: string }> = []
  for (const l of (leads || [])) {
    for (const campo of ['nombre', 'email', 'mensaje']) {
      const valor = String((l as Record<string, unknown>)[campo] || '')
      if (/<script|<\/script>|javascript:|onerror=|onload=/.test(valor.toLowerCase())) {
        leadsXss.push({ id: l.id, nombre: l.nombre || l.email || '', campo, valor: valor.substring(0, 200) })
      }
    }
  }

  // Detectar spam en comentarios
  const comentariosSpam: Array<{ id: string; contenido: string }> = []
  for (const c of (comments || [])) {
    const texto = (c.contenido || '').toLowerCase()
    if (/https?:\/\//.test(texto) || /<a\s|<script/.test(texto)) {
      comentariosSpam.push({ id: c.id, contenido: texto.substring(0, 300) })
    }
  }

  const sc = siteConfig?.security_config || {}

  return {
    nuevos_admins: (nuevosAdmins || []).map(a => ({
      email: a.email,
      rol: a.rol,
      created_at: a.created_at
    })),
    templates_sospechosos: templatesSospechosos,
    config_seguridad: {
      geobloqueo: sc?.geobloqueo?.habilitado === true,
      security_headers: sc?.security_headers?.habilitado === true,
      rate_limiting: sc?.rate_limiting?.habilitado === true,
      bot_protection: sc?.bot_protection?.habilitado === true,
      alerts: sc?.alerts?.habilitado === true,
    },
    api_keys_recientes: (apiKeys || []).map(k => ({
      id: k.id,
      nombre: k.nombre,
      created_at: k.created_at
    })),
    leads_xss: leadsXss,
    comentarios_spam: comentariosSpam,
    volumen_bloqueos: bloqueos || 0,
    logins_anomalos: loginsAnomalos || 0,
  }
}

export async function runGeminiScan(rawData: ScanRawData): Promise<ScannerResult> {
  const prompt = `Eres un analista de ciberseguridad experto para Xpand Capital. Has ejecutado un escaneo automático de seguridad y debes generar un reporte ESTRICTAMENTE en formato JSON (sin markdown, sin texto fuera del JSON).

DATOS DEL ESCANEO:
${JSON.stringify(rawData, null, 2)}

REGLAS PARA EL ANÁLISIS:
- Si hay nuevos_admins creados en las últimas 72h desde países inusuales → CRÍTICO. Recomendación activa: verificar identidad del admin, cambiar contraseña inmediatamente, auditar IP de creación.
- Si hay templates_sospechosos con eval(), <script>, document.cookie → CRÍTICO. Recomendación activa: eliminar el código manualmente, auditar quién modificó el template, restaurar desde backup.
- Si alguna herramienta de seguridad está desactivada → ALTO. Recomendación activa: reactivar la herramienta desde el panel de seguridad.
- Si hay leads_xss con <script> o javascript: → ALTO. Recomendación pasiva: sanitizar inputs del formulario, activa: eliminar los leads contaminados.
- Si hay comentarios_spam con links → MEDIO. Recomendación pasiva: activar moderación de comentarios.
- Si hay api_keys recientes → MEDIO. Recomendación activa: verificar quién las creó, rotar si no fueron autorizadas.
- Si volumen_bloqueos > 100 en 24h → MEDIO. Recomendación pasiva: monitorear patrones de ataque.
- Si hay logins_anomalos → ALTO. Recomendación activa: forzar cambio de contraseña a los usuarios afectados.

FORMATO DE RESPUESTA (SOLO JSON, sin \`\`\`json):
{
  "security_score": 85,
  "summary": "Resumen ejecutivo en español de 2-3 frases sobre el estado general de seguridad",
  "findings": [
    { "severity": "critical", "category": "cuentas", "title": "Título en español", "description": "Descripción detallada", "evidence": "Evidencia encontrada" }
  ],
  "recommendations": [
    { "action": "active", "title": "Título en español", "description": "Descripción detallada de qué hacer paso a paso", "urgency": "inmediato" }
  ]
}

IMPORTANTE: Todo el contenido debe estar en ESPAÑOL. Los títulos y descripciones deben ser claros y accionables. Si no hay hallazgos en una categoría, no incluyas findings vacíos. El security_score debe reflejar la gravedad real: 100 = perfecto, 0 = comprometido.`

  if (!GEMINI_KEY) {
    // Fallback sin IA: análisis básico programático
    return fallbackScan(rawData)
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const json = await res.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    // Extraer JSON de la respuesta (Gemini a veces lo envuelve en ```json)
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleanJson)

    return {
      security_score: parsed.security_score || 80,
      scan_timestamp: new Date().toISOString(),
      summary: parsed.summary || 'Escaneo completado.',
      findings: parsed.findings || [],
      recommendations: parsed.recommendations || [],
      raw_data: rawData,
    }
  } catch (err) {
    console.error('[Scanner] Error con Gemini:', err)
    return fallbackScan(rawData)
  }
}

function fallbackScan(rawData: ScanRawData): ScannerResult {
  const findings: ScannerFinding[] = []
  const recommendations: ScannerRecommendation[] = []
  let score = 100

  if (rawData.nuevos_admins.length > 0) {
    score -= 15
    findings.push({
      severity: 'critical',
      category: 'cuentas',
      title: 'Nuevos administradores detectados',
      description: `Se encontraron ${rawData.nuevos_admins.length} cuentas de administrador creadas en las últimas 72 horas. Verifica que sean legítimas.`,
      evidence: rawData.nuevos_admins.map(a => `${a.email} (${a.rol})`).join(', ')
    })
    recommendations.push({
      action: 'active',
      title: 'Verificar nuevos administradores',
      description: 'Revisa cada cuenta de admin nueva. Si no reconoces alguna, elimínala inmediatamente y fuerza cambio de contraseña.',
      urgency: 'inmediato'
    })
  }

  if (rawData.templates_sospechosos.length > 0) {
    score -= 20
    findings.push({
      severity: 'critical',
      category: 'codigo',
      title: 'Código sospechoso en templates',
      description: `Se detectaron ${rawData.templates_sospechosos.length} templates con posible código malicioso (eval, script, fetch).`,
      evidence: rawData.templates_sospechosos.map(t => `${t.nombre}: ${t.snippet}`).join(' | ')
    })
    recommendations.push({
      action: 'active',
      title: 'Eliminar código malicioso de templates',
      description: 'Abre cada template sospechoso en el editor, elimina el código inyectado y guarda. Considera restaurar desde un backup limpio.',
      urgency: 'inmediato'
    })
  }

  const configOk = Object.values(rawData.config_seguridad).filter(Boolean).length
  if (configOk < 4) {
    score -= 10
    findings.push({
      severity: 'high',
      category: 'config',
      title: 'Herramientas de seguridad desactivadas',
      description: `Solo ${configOk} de 5 herramientas de seguridad están activas. Ve al panel de seguridad y actívalas.`,
      evidence: `Activas: ${Object.entries(rawData.config_seguridad).filter(([,v]) => v).map(([k]) => k).join(', ')}`
    })
  }

  if (rawData.leads_xss.length > 0) {
    score -= 10
    findings.push({
      severity: 'high',
      category: 'datos',
      title: 'Posible XSS en formularios de leads',
      description: `${rawData.leads_xss.length} leads contienen código sospechoso en sus campos.`,
      evidence: rawData.leads_xss.map(l => `${l.nombre}: ${l.campo}=${l.valor.substring(0, 50)}`).join(' | ')
    })
  }

  if (rawData.api_keys_recientes.length > 0) {
    score -= 5
    findings.push({
      severity: 'medium',
      category: 'accesos',
      title: 'API Keys creadas recientemente',
      description: `Se encontraron ${rawData.api_keys_recientes.length} API keys nuevas. Verifica que sean autorizadas.`,
      evidence: rawData.api_keys_recientes.map(k => k.nombre).join(', ')
    })
  }

  if (rawData.comentarios_spam.length > 0) {
    score -= 3
    findings.push({
      severity: 'low',
      category: 'datos',
      title: 'Comentarios con enlaces detectados',
      description: `${rawData.comentarios_spam.length} comentarios contienen enlaces externos. Revisa que no sean spam.`,
      evidence: rawData.comentarios_spam.map(c => c.contenido.substring(0, 60)).join(' | ')
    })
  }

  if (rawData.logins_anomalos > 0) {
    score -= 8
    findings.push({
      severity: 'high',
      category: 'accesos',
      title: 'Inicios de sesión desde ubicaciones inusuales',
      description: `${rawData.logins_anomalos} inicios de sesión ocurrieron desde países no habituales para esos usuarios.`,
      evidence: `Logins anómalos: ${rawData.logins_anomalos}`
    })
    recommendations.push({
      action: 'active',
      title: 'Forzar cambio de contraseña',
      description: 'Para los usuarios con logins desde ubicaciones nuevas, fuerza un cambio de contraseña desde el panel de administración.',
      urgency: '24h'
    })
  }

  if (findings.length === 0) {
    findings.push({
      severity: 'low',
      category: 'general',
      title: 'Sin amenazas detectadas',
      description: 'El escaneo no encontró señales de compromiso. Las herramientas de seguridad están operando correctamente.',
      evidence: 'Todos los indicadores en verde'
    })
  }

  return {
    security_score: Math.max(0, Math.min(100, score)),
    scan_timestamp: new Date().toISOString(),
    summary: findings.find(f => f.severity === 'critical')
      ? 'Se detectaron amenazas críticas que requieren atención inmediata.'
      : 'El sistema se encuentra en estado aceptable, con hallazgos menores.',
    findings,
    recommendations,
    raw_data: rawData,
  }
}

