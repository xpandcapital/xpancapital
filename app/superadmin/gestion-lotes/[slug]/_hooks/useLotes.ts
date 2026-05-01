'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Lote, ProjectConfig, DashboardStats, Owner, InitialPayment, Reminder, Payment } from '../_types';
import { generateMonthList } from '../_utils/months';
import { loadLotsFromSupabase, syncLotToSupabase } from '../_utils/supabase-lots';

export function useLotes(activeProjectId: string) {
  const [lots, setLots] = useState<Lote[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const projectConfig: ProjectConfig = {
    startMonth: '2025-04',
    signatureMonth: '2026-04',
    escrituraMonth: '2027-01',
    masterplanImage: null,
    lotPins: [],
  };

  // Load lots from Supabase when project changes
  useEffect(() => {
    if (!activeProjectId) return;
    let cancelled = false;
    setIsSyncing(true);
    
    // Timeout safety: if Supabase takes >15s, bail out
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.error('[useLotes] Timeout loading lots for project:', activeProjectId);
        setIsSyncing(false);
      }
    }, 15000);

    loadLotsFromSupabase(activeProjectId)
      .then(data => {
        if (!cancelled) {
          setLots(data);
          setIsSyncing(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[useLotes] Error loading lots:', err);
          setIsSyncing(false);
        }
      })
      .finally(() => clearTimeout(timeout));

    return () => { cancelled = true; clearTimeout(timeout); };
  }, [activeProjectId]);

  // Lazy sync to Supabase (debounced)
  useEffect(() => {
    if (!activeProjectId || lots.length === 0) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      lots.forEach(lot => syncLotToSupabase(lot, activeProjectId));
    }, 2000);
    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [lots, activeProjectId]);

  // --- Derived State ---
  const { activeLots, desistidoLots } = useMemo(() => {
    const active: Lote[] = [];
    const desistido: Lote[] = [];
    lots.forEach(lot => {
      const num = (lot.loteNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const isDesistidoLot = lot.status === 'Desistido' || lot.loteNumber?.toLowerCase().startsWith('z') || num.startsWith('zdes');
      if (isDesistidoLot) desistido.push(lot);
      else active.push(lot);
    });
    return { activeLots: active, desistidoLots: desistido };
  }, [lots]);

  const dashboardStats = useMemo((): DashboardStats => {
    const stats: DashboardStats = { activeLotsCount: 0, totalToCollectNow: 0, totalCollectedSoFar: 0, totalFutureQuotas: 0, totalSaldoEscritura: 0 };
    activeLots.forEach(lot => {
      if (lot.status !== 'Activo') return;
      stats.activeLotsCount++;
      const totalInitialExpected = lot.initialPayments?.reduce((acc, p) => acc + Number(p.expected), 0) || 0;
      const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
      const totalQuotasPaid = lot.payments.reduce((acc, p) => acc + Number(p.actual), 0);
      const tradeIn = lot.tradeInValue || 0;
      const lateFees = lot.lateFees || 0;
      const pastDueInitial = Math.max(0, totalInitialExpected - totalInitialPaid);
      const pastDueQuotas = lot.payments.reduce((acc, p) => acc + Math.max(0, p.expected - p.actual), 0);
      const toCollectNow = pastDueInitial + pastDueQuotas + lateFees;
      stats.totalToCollectNow += toCollectNow;
      stats.totalCollectedSoFar += totalInitialPaid + totalQuotasPaid;
      const sigMonth = lot.signatureMonth || projectConfig.signatureMonth;
      const escMonth = lot.escrituraMonth || projectConfig.escrituraMonth;
      const remainingPaymentsCount = lot.payments.filter(p => {
        const [pMonth, pYear] = (p.month || '').split(' ');
        const monthIdx = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].indexOf(pMonth);
        if (monthIdx < 0) return false;
        const pKey = `${pYear}-${String(monthIdx + 1).padStart(2, '0')}`;
        return pKey >= sigMonth && pKey < escMonth;
      }).length;
      stats.totalFutureQuotas += remainingPaymentsCount * lot.expectedQuota;
      stats.totalSaldoEscritura += Math.max(0, lot.totalPrice - totalInitialPaid - totalQuotasPaid - tradeIn - toCollectNow - (remainingPaymentsCount * lot.expectedQuota));
    });
    return stats;
  }, [activeLots, projectConfig]);

  const sortedLots = useMemo(() => {
    return [...activeLots].sort((a, b) => {
      const numA = parseInt((a.loteNumber || '').replace(/\D/g, '')) || 0;
      const numB = parseInt((b.loteNumber || '').replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [activeLots]);

  const sortedDesistidoLots = useMemo(() => {
    return [...desistidoLots].sort((a, b) => (a.loteNumber || '').localeCompare(b.loteNumber || ''));
  }, [desistidoLots]);

  const selectedLot = useMemo(() => lots.find(l => l.id === selectedLotId) || null, [lots, selectedLotId]);

  // --- CRUD Operations ---
  const updateSelectedLot = useCallback((updatedLot: Lote) => {
    setLots(prev => prev.map(l => l.id === updatedLot.id ? updatedLot : l));
  }, []);

  const deleteLot = useCallback((lotId: string) => {
    setLots(prev => prev.filter(l => l.id !== lotId));
    if (selectedLotId === lotId) setSelectedLotId(null);
  }, [selectedLotId]);

  const toggleLotStatus = useCallback((lotId: string, refundAmount: number) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return { ...l, status: l.status === 'Desistido' ? 'Activo' : 'Desistido', refundAmount };
    }));
  }, []);

  const updateLotField = useCallback((lotId: string, field: string, value: any) => {
    setLots(prev => prev.map(l => l.id === lotId ? { ...l, [field]: value } : l));
  }, []);

  const clearAllPayments = useCallback((lotId: string) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return { ...l, payments: l.payments.map(p => ({ ...p, actual: 0, paymentDate: '', receiptAttached: null })), initialPayments: l.initialPayments.map(ip => ({ ...ip, actual: 0, paymentDate: '', receiptAttached: null })) };
    }));
  }, []);

  // --- Owner Operations ---
  const addOwner = useCallback((lotId: string) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return { ...l, owners: [...l.owners, { id: crypto.randomUUID(), name: '', documentId: '', email: '', phoneCode: '+593', phone: '' }] };
    }));
  }, []);

  const updateOwner = useCallback((lotId: string, ownerId: string, field: string, value: string) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return { ...l, owners: l.owners.map(o => o.id === ownerId ? { ...o, [field]: value } : o) };
    }));
  }, []);

  const removeOwner = useCallback((lotId: string, ownerId: string) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      const owners = l.owners.filter(o => o.id !== ownerId);
      return { ...l, owners: owners.length > 0 ? owners : [{ id: crypto.randomUUID(), name: 'No especificado', documentId: '', email: '', phoneCode: '+593', phone: '' }], clientName: owners.map(o => o.name).join(' y ') || 'No especificado' };
    }));
  }, []);

  // --- Initial Payment Operations ---
  const addInitialPayment = useCallback((lotId: string) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return { ...l, initialPayments: [...l.initialPayments, { id: crypto.randomUUID(), description: 'Nuevo Abono', expected: 0, actual: 0, paymentDate: '', receiptAttached: null }] };
    }));
  }, []);

  const updateInitialPayment = useCallback((lotId: string, paymentId: string, field: string, value: any) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return { ...l, initialPayments: l.initialPayments.map(ip => ip.id === paymentId ? { ...ip, [field]: value } : ip) };
    }));
  }, []);

  const removeInitialPayment = useCallback((lotId: string, paymentId: string) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return { ...l, initialPayments: l.initialPayments.filter(ip => ip.id !== paymentId) };
    }));
  }, []);

  // --- Payment Field Operations ---
  const updatePaymentField = useCallback((lotId: string, paymentIdx: number, field: string, value: any) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      const payments = [...l.payments];
      if (payments[paymentIdx]) payments[paymentIdx] = { ...payments[paymentIdx], [field]: field === 'actual' ? Number(value) : value };
      return { ...l, payments };
    }));
  }, []);

  // --- Reminder Operations ---
  const addReminder = useCallback((lotId: string) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return { ...l, reminders: [...l.reminders, { id: crypto.randomUUID(), text: '', completed: false }] };
    }));
  }, []);

  const updateReminder = useCallback((lotId: string, reminderId: string, field: string, value: any) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return { ...l, reminders: l.reminders.map(r => r.id === reminderId ? { ...r, [field]: value } : r) };
    }));
  }, []);

  const removeReminder = useCallback((lotId: string, reminderId: string) => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return { ...l, reminders: l.reminders.filter(r => r.id !== reminderId) };
    }));
  }, []);

  return {
    lots,
    setLots,
    isSyncing,
    selectedLotId,
    setSelectedLotId,
    activeLots,
    desistidoLots,
    dashboardStats,
    sortedLots,
    sortedDesistidoLots,
    selectedLot,
    updateSelectedLot,
    deleteLot,
    toggleLotStatus,
    updateLotField,
    clearAllPayments,
    addOwner,
    updateOwner,
    removeOwner,
    addInitialPayment,
    updateInitialPayment,
    removeInitialPayment,
    updatePaymentField,
    addReminder,
    updateReminder,
    removeReminder,
  };
}
