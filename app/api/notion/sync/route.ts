import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { queryDatabase, mapNotionPageToLot, getDatabaseSchema, resolveNotionId } from '@/lib/notion';
import logger from '@/lib/utils/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { project_id, database_id } = await request.json();

    if (!project_id || !database_id) {
      return NextResponse.json(
        { success: false, error: 'Se requieren project_id y database_id' },
        { status: 400 }
      );
    }

    // 1. Verificar que el proyecto existe
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', project_id)
      .single();

    if (projError || !project) {
      return NextResponse.json({ success: false, error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // 2. Resolver el ID - puede ser página o base de datos
    let resolvedDbId = database_id;
    let detectedDatabases: { id: string; title: string }[] = [];
    
    try {
      const resolved = await resolveNotionId(database_id);
      
      if (resolved.type === 'page' && resolved.databases && resolved.databases.length > 0) {
        // Es una página con bases de datos dentro - tomar la primera
        detectedDatabases = resolved.databases;
        resolvedDbId = resolved.databases[0].id;
        logger.debug(`[Notion Sync] Detected page with ${resolved.databases.length} database(s). Using: ${resolved.databases[0].title}`);
      } else if (resolved.type === 'page' && (!resolved.databases || resolved.databases.length === 0)) {
        return NextResponse.json({
          success: false,
          error: 'La página no contiene bases de datos. Asegúrate de que la página tenga una base de datos inline.',
          databases_found: []
        }, { status: 400 });
      } else {
        resolvedDbId = resolved.id;
      }
    } catch (resolveErr: any) {
      return NextResponse.json({
        success: false,
        error: `Error resolviendo ID: ${resolveErr.message}`
      }, { status: 400 });
    }

    // 3. Obtener schema de la DB de Notion para debug
    let schema: any = null;
    try {
      schema = await getDatabaseSchema(resolvedDbId);
    } catch (err) {
      logger.error('Error obteniendo schema:', err);
    }

    // 4. Obtener todas las páginas de la DB de Notion
    const pages = await queryDatabase(resolvedDbId);

    if (pages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No se encontraron lotes en la base de datos de Notion',
        synced: 0,
        total: 0,
      });
    }

    // 5. Mapear páginas de Notion a lotes y FILTRAR zDesistidos
    const allLots = pages.map(page => mapNotionPageToLot(page, project_id));
    // Ignorar lotes especiales (zDesistidos, desistidos, etc.)
    const lots = allLots.filter(lot => {
      const name = (lot.lot_number || '').toLowerCase();
      return !name.includes('zdesistido') && !name.startsWith('zdesistid');
    });
    
    const filteredCount = allLots.length - lots.length;
    if (filteredCount > 0) {
      logger.debug(`[Notion Sync] Filtered out ${filteredCount} special lots (zDesistidos)`);
    }

    // 6. Sincronizar con Supabase usando upsert por notion_page_id
    let synced = 0;
    let errors = 0;
    const details: any[] = [];

    for (const lot of lots) {
      try {
        // Verificar si ya existe un lote con este notion_page_id
        const { data: existing } = await supabase
          .from('project_lots')
          .select('id, lot_number, status, client_name')
          .eq('notion_page_id', lot.notion_page_id)
          .eq('project_id', project_id)
          .single();

        if (existing) {
          // Actualizar por notion_page_id
          const { error } = await supabase
            .from('project_lots')
            .update({
              lot_number: lot.lot_number,
              client_name: lot.client_name,
              status: lot.status,
              total_price: lot.total_price,
              lot_area: lot.lot_area,
              expected_quota: lot.expected_quota,
              owners: lot.owners,
              initial_payments: lot.initial_payments,
              alternate_contact: lot.alternate_contact,
              notion_page_id: lot.notion_page_id,
              notion_last_sync: lot.notion_last_sync,
              extra_data: lot.extra_data,
            })
            .eq('id', existing.id);

          if (error) throw error;
          details.push({ action: 'updated', lot: lot.lot_number, client: lot.client_name });
        } else {
          // Extraer solo el número del lote — "Lote 01" → "01", "LOTE-01" → "01", "Lote 1" → "01"
          const extractNum = (str: string) => {
            const m = str?.match(/(\d+)/);
            return m ? m[1].padStart(2, '0') : null;
          };
          const lotNum = extractNum(lot.lot_number || '');

          // Buscar lote existente cuyo número coincida
          // Traer todos los lotes del proyecto sin notion_page_id para comparar
          const { data: candidates } = await supabase
            .from('project_lots')
            .select('id, lot_number')
            .eq('project_id', project_id)
            .is('notion_page_id', null);

          const byNumber = candidates?.find(c => extractNum(c.lot_number) === lotNum) || null;

          if (byNumber) {
            // Actualizar lote existente sin notion_page_id (match por número)
            const { error } = await supabase
              .from('project_lots')
              .update({
                client_name: lot.client_name,
                status: lot.status,
                total_price: lot.total_price,
                lot_area: lot.lot_area,
                expected_quota: lot.expected_quota,
                owners: lot.owners,
                initial_payments: lot.initial_payments,
                alternate_contact: lot.alternate_contact,
                notion_page_id: lot.notion_page_id,
                notion_last_sync: lot.notion_last_sync,
                extra_data: lot.extra_data,
              })
              .eq('id', byNumber.id);

            if (error) throw error;
            details.push({ action: 'linked', lot: lot.lot_number, client: lot.client_name });
          } else {
            // Crear nuevo lote
            const { error } = await supabase
              .from('project_lots')
              .insert({
                ...lot,
                payments: [],
              });

            if (error) throw error;
            details.push({ action: 'created', lot: lot.lot_number, status: lot.status });
          }
        }
        synced++;
      } catch (err: any) {
        logger.error(`Error sincronizando lote ${lot.lot_number}:`, err.message);
        errors++;
        details.push({ action: 'error', lot: lot.lot_number, error: err.message });
      }
    }

    // 6. Guardar database_id en el proyecto para futura sincronización automática
    await supabase
      .from('projects')
      .update({ notion_database_id: database_id, notion_last_sync: new Date().toISOString() })
      .eq('id', project_id);

    return NextResponse.json({
      success: true,
      message: `Sincronizados ${synced} lotes de "${project.name}"`,
      synced,
      errors,
      total: pages.length,
      details: details.slice(0, 20), // máx 20 en respuesta
      notion_fields: schema ? Object.keys(schema.properties || {}) : [],
    });

  } catch (err: any) {
    logger.error('Error en sync Notion:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// GET — sincronización automática de todos los proyectos con notion_database_id
export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, notion_database_id')
      .not('notion_database_id', 'is', null);

    if (error) throw error;
    if (!projects?.length) {
      return NextResponse.json({ success: true, message: 'No hay proyectos con Notion configurado', synced: 0 });
    }

    const results = [];
    for (const project of projects) {
      try {
        const pages = await queryDatabase(project.notion_database_id);
        const lots = pages.map(page => mapNotionPageToLot(page, project.id));
        let count = 0;

        for (const lot of lots) {
          const { data: existing } = await supabase
            .from('project_lots')
            .select('id')
            .eq('notion_page_id', lot.notion_page_id)
            .eq('project_id', project.id)
            .single();

          if (existing) {
            await supabase.from('project_lots').update({
              client_name: lot.client_name,
              status: lot.status,
              total_price: lot.total_price,
              lot_area: lot.lot_area,
              notion_last_sync: lot.notion_last_sync,
              extra_data: lot.extra_data,
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

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
