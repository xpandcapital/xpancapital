export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { syncNotionReceipts } from '@/lib/notion-receipts';
import { resolveNotionId } from '@/lib/notion';
import logger from '@/lib/utils/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { project_id, receipts_database_id } = await request.json();

    if (!project_id || !receipts_database_id) {
      return NextResponse.json(
        { success: false, error: 'Se requieren project_id y receipts_database_id' },
        { status: 400 }
      );
    }

    // Resolver el ID - puede ser página o base de datos
    let resolvedDbId = receipts_database_id;
    
    try {
      const resolved = await resolveNotionId(receipts_database_id);
      
      if (resolved.type === 'page' && resolved.databases && resolved.databases.length > 0) {
        resolvedDbId = resolved.databases[0].id;
        logger.debug(`[Notion Receipts Sync] Using database: ${resolved.databases[0].title}`);
      } else if (resolved.type === 'page' && (!resolved.databases || resolved.databases.length === 0)) {
        return NextResponse.json({
          success: false,
          error: 'La página no contiene bases de datos de recibos.',
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

    // 1. Obtener recibos de Notion
    const { receipts, errors, success } = await syncNotionReceipts(resolvedDbId, project_id);

    if (!success) {
      return NextResponse.json({ success: false, errors }, { status: 500 });
    }

    // 2. Obtener TODOS los lotes del proyecto para vincular
    // Crear mapa de notion_page_id -> lot_id
    const { data: lots } = await supabase
      .from('project_lots')
      .select('id, lot_number, notion_page_id, client_name')
      .eq('project_id', project_id);

logger.debug(`[Notion Receipts Sync] Found ${lots?.length || 0} lots in project`);

    // Mapa: notion_page_id -> lot database id
    const notionPageToLotId = new Map<string, string>();
    // Mapa: lot_number normalizado -> lot database id (fallback)
    const lotNumberToId = new Map<string, string>();

    if (lots) {
      lots.forEach(lot => {
        if (lot.notion_page_id) {
          notionPageToLotId.set(lot.notion_page_id, lot.id);
          logger.debug(`[Notion Receipts Sync] Mapped notion_page ${lot.notion_page_id?.substring(0, 8)}... -> lot ${lot.lot_number}`);
        }
        if (lot.lot_number) {
          const normalized = lot.lot_number.replace(/[^0-9]/g, '').padStart(2, '0');
          lotNumberToId.set(normalized, lot.id);
        }
      });
    }

    // 3. Sincronizar cada recibo
    let synced = 0;
    let linked = 0;
    let unlinked = 0;
    let desistido = 0;
    const details: any[] = [];
    const unlinkedReceipts: any[] = [];

    for (const receipt of receipts) {
      try {
        // Los recibos desistidos no se vinculan a ningún lote
        if (receipt.is_desistido) {
          const { data: existing } = await supabase
            .from('notion_receipts')
            .select('id')
            .eq('notion_page_id', receipt.notion_page_id)
            .maybeSingle();

          const receiptData = {
            project_id,
            lot_id: null,
            notion_page_id: receipt.notion_page_id,
            notion_receipt_id: receipt.notion_receipt_id,
            lot_number: receipt.lot_number,
            receipt_number: receipt.receipt_number,
            amount: receipt.amount,
            date: receipt.date,
            receipt_type: receipt.receipt_type,
            concept: receipt.concept,
            payment_method: receipt.payment_method,
            reference: receipt.reference,
            file_url: receipt.file_url,
            client_name: receipt.client_name,
            is_desistido: true,
            notion_last_sync: new Date().toISOString(),
          };

          if (existing) {
            await supabase.from('notion_receipts').update(receiptData).eq('id', existing.id);
          } else {
            await supabase.from('notion_receipts').insert(receiptData);
          }
          
          desistido++;
          synced++;
          details.push({ action: 'desistido', receipt: receipt.concept || receipt.notion_page_id?.substring(0, 8) });
          continue;
        }

        // Buscar lote por notion_page_id (el campo de relación en Notion)
        let lotId: string | null = null;
        
        if (receipt.lot_notion_id) {
          lotId = notionPageToLotId.get(receipt.lot_notion_id) || null;
        }
        
        // Fallback: buscar por número de lote normalizado
        if (!lotId && receipt.lot_number) {
          const normalized = receipt.lot_number.replace(/[^0-9]/g, '').padStart(2, '0');
          lotId = lotNumberToId.get(normalized) || null;
        }

        const { data: existing } = await supabase
          .from('notion_receipts')
          .select('id')
          .eq('notion_page_id', receipt.notion_page_id)
          .maybeSingle();

        const receiptData = {
          project_id,
          lot_id: receipt.is_desistido ? null : lotId,
          notion_page_id: receipt.notion_page_id,
          notion_receipt_id: receipt.notion_receipt_id,
          lot_number: receipt.lot_number,
          receipt_number: receipt.receipt_number,
          amount: receipt.amount,
          date: receipt.date,
          receipt_type: receipt.receipt_type,
          concept: receipt.concept,
          payment_method: receipt.payment_method,
          reference: receipt.reference,
          file_url: receipt.file_url,
          client_name: receipt.client_name,
          is_desistido: receipt.is_desistido,
          notion_last_sync: new Date().toISOString(),
        };

        if (existing) {
          await supabase
            .from('notion_receipts')
            .update(receiptData)
            .eq('id', existing.id);
          details.push({ action: 'updated', receipt: receipt.concept || receipt.notion_page_id?.substring(0, 8) });
        } else {
          await supabase
            .from('notion_receipts')
            .insert(receiptData);
          details.push({ action: 'created', receipt: receipt.concept || receipt.notion_page_id?.substring(0, 8) });
        }

        if (lotId) {
          linked++;
        } else {
          unlinked++;
          unlinkedReceipts.push({
            receipt_id: receipt.notion_page_id?.substring(0, 8),
            lot_notion_id: receipt.lot_notion_id?.substring(0, 8),
            amount: receipt.amount,
            concept: receipt.concept
          });
        }
        synced++;
      } catch (err: any) {
        errors.push(`Error sincronizando recibo ${receipt.notion_page_id}: ${err.message}`);
      }
    }

    // 4. Actualizar proyecto con último sync de recibos
    await supabase
      .from('projects')
      .update({ notion_receipts_last_sync: new Date().toISOString() })
      .eq('id', project_id);

    logger.debug(`[Notion Receipts Sync] Complete: ${synced} synced, ${linked} linked, ${unlinked} unlinked, ${desistido} desistido`);

    return NextResponse.json({
      success: true,
      message: `Sincronizados ${synced} recibos (${linked} vinculados, ${desistido} desistidos)`,
      synced,
      linked,
      unlinked,
      desistido,
      total: receipts.length,
      errors: errors.length > 0 ? errors : undefined,
      unlinked_sample: unlinkedReceipts.slice(0, 10),
      details: details.slice(0, 20),
    });

  } catch (err: any) {
    logger.error('Error en sync-receipts:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// GET — obtener recibos de un proyecto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const lot_id = searchParams.get('lot_id');

    let query = supabase.from('notion_receipts').select('*');
    
    if (lot_id) {
      query = query.eq('lot_id', lot_id);
    } else if (project_id) {
      query = query.eq('project_id', project_id);
    } else {
      return NextResponse.json({ success: false, error: 'Se requiere project_id o lot_id' }, { status: 400 });
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, receipts: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
