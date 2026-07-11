/**
 * Webhook de Notion → Xpand Capital
 * 
 * Notion no tiene webhooks nativos. Para sincronización en tiempo real usamos
 * dos estrategias combinadas:
 * 1. Polling cada 5 minutos via Supabase pg_cron o cron externo
 * 2. Este endpoint para disparar sincronización manual o desde Zapier/Make
 * 
 * Para configurar sincronización automática:
 * Opción A: Configurar un cron en Make.com o Zapier que llame GET /api/notion/sync cada 5 min
 * Opción B: Configurar Supabase pg_cron para llamar al endpoint
 * Opción C: Usar este webhook desde Make.com cuando cambia algo en Notion
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { queryDatabase, mapNotionPageToLot } from '@/lib/notion';

let _cachedSupabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (_cachedSupabase) return _cachedSupabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  _cachedSupabase = createClient(supabaseUrl, supabaseServiceKey)
  return _cachedSupabase
}

const supabase = new Proxy({} as any, {
  get(_: any, prop: string) {
    return getSupabase()[prop]
  }
})
// POST — recibir webhook de Make/Zapier cuando algo cambia en Notion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const secret = request.headers.get('x-webhook-secret');
    
    // Verificar secret si está configurado
    const { data: keys } = await supabase.from('api_keys').select('key_name, key_value');
    const keysMap: Record<string, string> = {};
    keys?.forEach((k: any) => { keysMap[k.key_name] = k.key_value || ''; });
    
    const webhookSecret = keysMap.notion_webhook_secret;
    if (webhookSecret && secret !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Disparar sincronización de todos los proyectos con Notion
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, notion_database_id')
      .not('notion_database_id', 'is', null);

    const results = [];
    for (const project of (projects || [])) {
      try {
        const pages = await queryDatabase(project.notion_database_id);
        let count = 0;
        for (const page of pages) {
          const lot = mapNotionPageToLot(page, project.id);
          const { data: existing } = await supabase
            .from('project_lots').select('id')
            .eq('notion_page_id', lot.notion_page_id).eq('project_id', project.id).single();

          if (existing) {
            await supabase.from('project_lots').update({
              client_name: lot.client_name, status: lot.status,
              total_price: lot.total_price, lot_area: lot.lot_area,
              notion_last_sync: lot.notion_last_sync, extra_data: lot.extra_data,
            }).eq('id', existing.id);
          } else {
            await supabase.from('project_lots').insert({ ...lot, payments: [], initial_payments: [] });
          }
          count++;
        }
        await supabase.from('projects').update({ notion_last_sync: new Date().toISOString() }).eq('id', project.id);
        results.push({ project: project.name, synced: count });
      } catch (err: any) {
        results.push({ project: project.name, error: err.message });
      }
    }

    return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// GET — endpoint de verificación de salud
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/notion/webhook',
    description: 'Webhook para sincronización de Notion → Xpand Capital',
    usage: 'POST a este endpoint desde Make.com o Zapier cuando cambie algo en Notion',
    timestamp: new Date().toISOString(),
  });
}


