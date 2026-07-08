"use client";

import { useState, useCallback, useEffect } from 'react';
import type { Client, DbProfile, Transaction, Order, AuditLog, PrivateEvent, AcademicCourse, Certificate, Referral } from '../../_types';
import { mapDbToClient } from '../../_utils/mapDbToClient';
import { useToast } from '@/components/ui/Toast';
import { useActionGuard } from '@/hooks/useActionGuard';

export function useClientDetail(clientId: string) {
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [history, setHistory] = useState<AuditLog[]>([]);
    const [events, setEvents] = useState<PrivateEvent[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [automations, setAutomations] = useState<any[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [academicData, setAcademicData] = useState<{ progress: AcademicCourse[], certificates: Certificate[] }>({ progress: [], certificates: [] });
    const { showToast } = useToast();
    const { guard } = useActionGuard();

    const fetchClient = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/clientes?id=${clientId}`);
            const data = await res.json();
            if (data.success && data.data) {
                const profile = data.data as DbProfile;
                setClient(mapDbToClient(profile));
            }
        } catch {
            showToast('Error al cargar cliente', 'error');
        } finally {
            setLoading(false);
        }
    }, [clientId, showToast]);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/clientes/${clientId}/orders`);
            const data = await res.json();
            if (data.success) {
                setOrders(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    }, [clientId]);

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/clientes/${clientId}/transactions`);
            const data = await res.json();
            if (data.success) {
                setTransactions(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
        }
    }, [clientId]);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/clientes/${clientId}/history`);
            const data = await res.json();
            if (data.success) {
                setHistory(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    }, [clientId]);

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/clientes/${clientId}/events`);
            const data = await res.json();
            if (data.success) {
                setEvents(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching events:', err);
        }
    }, [clientId]);

    const fetchInsights = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/clientes/${clientId}/insights`);
            const data = await res.json();
            if (data.success) {
                setInsights(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching insights:', err);
        }
    }, [clientId]);

    const fetchAutomations = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/clientes/${clientId}/automations`);
            const data = await res.json();
            if (data.success) {
                setAutomations(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching automations:', err);
        }
    }, [clientId]);

    const fetchReferrals = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/clientes/${clientId}/referrals`);
            const data = await res.json();
            if (data.success) {
                setReferrals(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching referrals:', err);
        }
    }, [clientId]);

    const fetchAcademia = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/clientes/${clientId}/academia`);
            const data = await res.json();
            if (data.success) {
                setAcademicData(data.data || { progress: [], certificates: [] });
            }
        } catch (err) {
            console.error('Error fetching academia:', err);
        }
    }, [clientId]);

    useEffect(() => {
        fetchClient();
        fetchOrders();
        fetchTransactions();
        fetchHistory();
        fetchEvents();
        fetchInsights();
        fetchAutomations();
        fetchReferrals();
        fetchAcademia();
    }, [fetchClient, fetchOrders, fetchTransactions, fetchHistory, fetchEvents, fetchInsights, fetchAutomations, fetchReferrals, fetchAcademia]);

    const updateClient = useCallback(async (fields: Partial<Client>, silent = true) => {
        if (!guard('clientes', 'editar')) return;
        if (!client) return;

        const updated = { ...client, ...fields };
        setClient(updated);

        try {
            const dbUpdate: Record<string, unknown> = {};
            if (fields.firstName !== undefined) dbUpdate.nombre = fields.firstName;
            if (fields.lastName !== undefined) dbUpdate.apellido = fields.lastName;
            if (fields.email !== undefined) dbUpdate.email = fields.email;
            if (fields.phone !== undefined) dbUpdate.telefono = fields.phone;
            if (fields.tier !== undefined) {
                const tierMap: Record<string, string> = {
                    'Platinum Member': 'platinum',
                    'Gold Member': 'gold',
                    'Silver Member': 'silver',
                    'Bronze Member': 'bronze'
                };
                dbUpdate.nivel_id = tierMap[fields.tier] || 'bronze';
            }
            if (fields.documentType !== undefined) dbUpdate.tipo_documento = fields.documentType;
            if (fields.dni !== undefined) dbUpdate.numero_documento = fields.dni;
            if (fields.birthday !== undefined) dbUpdate.fecha_nacimiento = fields.birthday;
            if (fields.maritalStatus !== undefined) dbUpdate.estado_civil = fields.maritalStatus;
            if (fields.profession !== undefined) dbUpdate.profesion = fields.profession;
            if (fields.education !== undefined) dbUpdate.educacion = fields.education;
            if (fields.internalNotes !== undefined) dbUpdate.notas_internas = fields.internalNotes;
            if (fields.isNewsletterSubscribed !== undefined) dbUpdate.recibir_newsletter = fields.isNewsletterSubscribed;
            if (fields.isPushEnabled !== undefined) dbUpdate.recibir_push = fields.isPushEnabled;
            if (fields.isAccountFrozen !== undefined) dbUpdate.cuenta_congelada = fields.isAccountFrozen;
            if (fields.blisCoins !== undefined) dbUpdate.blis_coins = fields.blisCoins;

            if (Object.keys(dbUpdate).length > 0) {
                await fetch('/api/admin/clientes', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: client.id, ...dbUpdate })
                });
            }
        } catch {
            showToast('Error al guardar cambios', 'error');
        }

        if (!silent) showToast('Cambios guardados', 'success');
    }, [client, guard, showToast]);

    const adjustCoins = useCallback(async (amount: number, reason: string) => {
        if (!client || !reason) {
            showToast('Falta razón del ajuste', 'error');
            return;
        }

        try {
            const res = await fetch(`/api/admin/clientes/${client.id}/adjust-coins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, reason })
            });
            const data = await res.json();

            if (data.success) {
                setClient(prev => prev ? {
                    ...prev,
                    blisCoins: data.newBalance,
                    transactions: [data.transaction, ...(prev.transactions || [])]
                } : null);
                fetchTransactions();
                showToast('Saldo actualizado', 'success');
            } else {
                showToast(data.error || 'Error al ajustar', 'error');
            }
        } catch {
            showToast('Error al ajustar saldo', 'error');
        }
    }, [client, fetchTransactions, showToast]);

    const desbloquearCurso = useCallback(async (userId: string, cursoId: string) => {
      try {
        const res = await fetch('/api/admin/certificados/intentos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ desbloquear: true, user_id: userId, curso_id: cursoId }),
        })
        const data = await res.json()
        if (data.success) {
          showToast('Examen desbloqueado. Nuevo ciclo de intentos.', 'success')
          fetchAcademia()
        } else {
          showToast(data.error || 'Error al desbloquear', 'error')
        }
      } catch {
        showToast('Error al desbloquear examen', 'error')
      }
    }, [fetchAcademia, showToast])

    const deleteCertificate = useCallback(async (certId: string) => {
      try {
        const res = await fetch(`/api/certificados?id=${certId}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          showToast('Certificado eliminado', 'success')
          fetchAcademia()
        } else {
          showToast(data.error || 'Error al eliminar', 'error')
        }
      } catch {
        showToast('Error al eliminar certificado', 'error')
      }
    }, [fetchAcademia, showToast])

    return {
        client,
        loading,
        saving,
        orders,
        transactions,
        history,
        events,
        insights,
        automations,
        referrals,
        academicData,
        fetchClient,
        fetchOrders,
        fetchTransactions,
        fetchHistory,
        fetchEvents,
        fetchInsights,
        fetchAutomations,
        fetchReferrals,
        fetchAcademia,
        updateClient,
        adjustCoins,
        desbloquearCurso,
        deleteCertificate
    };
}
