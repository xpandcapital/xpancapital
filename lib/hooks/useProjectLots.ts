import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type ProjectLot = {
  id: string;
  project_id: string;
  lot_number: string;
  lot_area: number;
  owners: Array<{
    id: string;
    name: string;
    documentId: string;
    email: string;
    phoneCode: string;
    phone: string;
  }>;
  client_name: string;
  total_price: number;
  expected_quota: number;
  initial_payment_expected: number;
  initial_payment_paid: number;
  start_month: string;
  signature_month: string;
  escritura_month: string;
  conditions: {
    authorizedHold: boolean;
    regularPayer: boolean;
  };
  initial_payments: Array<{
    id: string;
    description: string;
    expected: number;
    actual: number;
    paymentDate: string;
    receiptAttached: string | null;
  }>;
  payments: Array<{
    id: number;
    month: string;
    expected: number;
    actual: number;
    receiptAttached: string | null;
    paymentDate: string;
  }>;
  documents: Array<{
    name: string;
    type: string;
  }>;
  reminders: Array<{
    id: string;
    text: string;
    date: string;
    completed: boolean;
  }>;
  special_observations: string;
  trade_in_value: number;
  agent_id: string | null;
  status: string;
  enters_raffle: boolean;
  late_fees: number;
  refund_amount: number;
  alternate_contact: {
    name: string;
    phone: string;
    phone_code: string;
  };
  created_at: string;
  updated_at: string;
};

export function useProjectLots(projectId: string | null) {
  const [lots, setLots] = useState<ProjectLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLots = useCallback(async () => {
    if (!projectId) {
      setLots([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('project_lots')
        .select('*')
        .eq('project_id', projectId)
        .order('lot_number');

      if (fetchError) throw fetchError;
      
      const mappedLots = (data || []).map(lot => ({
        ...lot,
        owners: Array.isArray(lot.owners) ? lot.owners : [],
        conditions: typeof lot.conditions === 'object' ? lot.conditions : { authorizedHold: false, regularPayer: true },
        initial_payments: Array.isArray(lot.initial_payments) ? lot.initial_payments : [],
        payments: Array.isArray(lot.payments) ? lot.payments : [],
        documents: Array.isArray(lot.documents) ? lot.documents : [],
        reminders: Array.isArray(lot.reminders) ? lot.reminders : [],
        alternate_contact: typeof lot.alternate_contact === 'object' ? lot.alternate_contact : { name: '', phone: '', phone_code: '+593' },
      }));

      setLots(mappedLots);
      setError(null);
    } catch (e) {
      console.error('Error loading lots:', e);
      setError(e instanceof Error ? e.message : 'Error loading lots');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadLots();
  }, [loadLots]);

  const createLot = async (lot: Omit<ProjectLot, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('project_lots')
        .insert([{
          ...lot,
          project_id: projectId,
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      setLots(prev => [...prev, {
        ...data,
        owners: Array.isArray(data.owners) ? data.owners : [],
        conditions: typeof data.conditions === 'object' ? data.conditions : { authorizedHold: false, regularPayer: true },
        initial_payments: Array.isArray(data.initial_payments) ? data.initial_payments : [],
        payments: Array.isArray(data.payments) ? data.payments : [],
        documents: Array.isArray(data.documents) ? data.documents : [],
        reminders: Array.isArray(data.reminders) ? data.reminders : [],
        alternate_contact: typeof data.alternate_contact === 'object' ? data.alternate_contact : { name: '', phone: '', phone_code: '+593' },
      }]);
      
      return data;
    } catch (e) {
      console.error('Error creating lot:', e);
      throw e;
    }
  };

  const updateLot = async (lotId: string, updates: Partial<ProjectLot>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('project_lots')
        .update(updates)
        .eq('id', lotId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setLots(prev => prev.map(lot => 
        lot.id === lotId ? {
          ...lot,
          ...data,
          owners: Array.isArray(data.owners) ? data.owners : lot.owners,
          conditions: typeof data.conditions === 'object' ? data.conditions : lot.conditions,
          initial_payments: Array.isArray(data.initial_payments) ? data.initial_payments : lot.initial_payments,
          payments: Array.isArray(data.payments) ? data.payments : lot.payments,
          documents: Array.isArray(data.documents) ? data.documents : lot.documents,
          reminders: Array.isArray(data.reminders) ? data.reminders : lot.reminders,
          alternate_contact: typeof data.alternate_contact === 'object' ? data.alternate_contact : lot.alternate_contact,
        } : lot
      ));
      
      return data;
    } catch (e) {
      console.error('Error updating lot:', e);
      throw e;
    }
  };

  const deleteLot = async (lotId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('project_lots')
        .delete()
        .eq('id', lotId);

      if (deleteError) throw deleteError;
      
      setLots(prev => prev.filter(lot => lot.id !== lotId));
    } catch (e) {
      console.error('Error deleting lot:', e);
      throw e;
    }
  };

  const findLotByNumber = (lotNumber: string) => {
    return lots.find(lot => lot.lot_number.toLowerCase() === lotNumber.toLowerCase());
  };

  return {
    lots,
    isLoading,
    error,
    loadLots,
    createLot,
    updateLot,
    deleteLot,
    findLotByNumber,
  };
}
