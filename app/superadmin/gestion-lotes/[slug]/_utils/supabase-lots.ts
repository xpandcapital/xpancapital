import { supabase } from '@/lib/supabaseClient';
import { Lote } from '../_types';

export async function loadLotsFromSupabase(projectId: string): Promise<Lote[]> {
  if (!projectId) return [];

  const { data, error } = await supabase
    .from('project_lots')
    .select('*')
    .eq('project_id', projectId);

  if (error || !data) {
    console.error('[SupabaseLots] Error loading lots:', error);
    return [];
  }

  return data.map((sl: any) => ({
    id: sl.id,
    loteNumber: sl.lot_number || '',
    lotArea: sl.lot_area || 0,
    clientName: sl.client_name || 'No especificado',
    owners: sl.owners && sl.owners.length > 0 ? sl.owners : [{ id: crypto.randomUUID(), name: sl.client_name || 'No especificado', documentId: '', email: '', phoneCode: '+593', phone: '' }],
    totalPrice: sl.total_price || 0,
    expectedQuota: sl.expected_quota || 0,
    initialPayments: sl.initial_payments || [{ id: crypto.randomUUID(), description: 'Entrada Inicial', expected: 0, actual: 0, paymentDate: '', receiptAttached: null }],
    payments: sl.payments || [],
    conditions: sl.conditions || { authorizedHold: false, regularPayer: true },
    startMonth: sl.start_month || '2025-04',
    signatureMonth: sl.signature_month || '2026-04',
    escrituraMonth: sl.escritura_month || '2027-01',
    status: sl.status === 'Disponible' ? 'Activo' : sl.status || 'Activo',
    specialObservations: sl.special_observations || '',
    reminders: sl.reminders || [],
    alternateContact: sl.alternate_contact || { name: '', phoneCode: '+593', phone: '' },
    documents: [],
    showQuotas: false,
    agentName: sl.agent_name || '',
    commissionType: sl.commission_type || 'porcentaje',
    commissionValue: Number(sl.commission_value) || 0,
    commissionTriggerPercent: Number(sl.commission_trigger_percent) || 30,
    tradeInValue: Number(sl.trade_in_value) || 0,
    entersRaffle: sl.enters_raffle || false,
    lateFees: Number(sl.late_fees) || 0,
    refundAmount: Number(sl.refund_amount) || 0,
    generatedMessage: sl.generated_message || undefined,
  }));
}

export async function syncLotToSupabase(lot: Lote, projectId: string): Promise<void> {
  const toDate = (val: string | null | undefined) => {
    if (!val) return null;
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}$/)) return `${val}-01`;
    return val;
  };

  const normalizeStatus = (status: string) => {
    if (status === 'Activo') return 'Disponible';
    return status;
  };

  const supabaseLot = {
    project_id: projectId,
    lot_number: lot.loteNumber,
    lot_area: lot.lotArea || 0,
    client_name: lot.clientName || 'No especificado',
    owners: lot.owners || [],
    total_price: lot.totalPrice || 0,
    expected_quota: lot.expectedQuota || 0,
    initial_payments: lot.initialPayments || [],
    payments: lot.payments || [],
    conditions: lot.conditions || { authorizedHold: false, regularPayer: true },
    start_month: toDate(lot.startMonth) || '2025-04-01',
    signature_month: toDate(lot.signatureMonth) || '2026-04-01',
    escritura_month: toDate(lot.escrituraMonth) || '2027-01-01',
    status: normalizeStatus(lot.status),
    special_observations: lot.specialObservations || '',
    reminders: lot.reminders || [],
    alternate_contact: lot.alternateContact || { name: '', phoneCode: '+593', phone: '' },
    documents: lot.documents || [],
    trade_in_value: lot.tradeInValue || 0,
    late_fees: lot.lateFees || 0,
    refund_amount: lot.refundAmount || 0,
    enters_raffle: lot.entersRaffle || false,
    agent_name: lot.agentName || '',
    commission_type: lot.commissionType || 'porcentaje',
    commission_value: lot.commissionValue || 0,
    commission_trigger_percent: lot.commissionTriggerPercent || 30,
    generated_message: lot.generatedMessage || null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: selectError } = await supabase
    .from('project_lots')
    .select('id')
    .eq('project_id', projectId)
    .eq('lot_number', lot.loteNumber)
    .maybeSingle();

  if (selectError) {
    console.error('[SupabaseLots] Error checking lot:', lot.loteNumber, selectError);
    return;
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('project_lots')
      .update(supabaseLot)
      .eq('id', existing.id);
    if (updateError) console.error('[SupabaseLots] Error updating:', lot.loteNumber, updateError);
  } else {
    const { error: insertError } = await supabase
      .from('project_lots')
      .insert(supabaseLot);
    if (insertError) console.error('[SupabaseLots] Error inserting:', lot.loteNumber, insertError);
  }
}

export async function syncAllLotsToSupabase(lots: Lote[], projectId: string): Promise<void> {
  if (!projectId || !lots || lots.length === 0) return;
  for (const lot of lots) {
    await syncLotToSupabase(lot, projectId);
  }
}
