"use client";

import { useState, useCallback, useEffect } from 'react';
import type { Client, DbProfile } from '../../_types';
import { mapDbToClient } from '../../_utils/mapDbToClient';
import { useToast } from '@/components/ui/Toast';
import { useActionGuard } from '@/hooks/useActionGuard';

export function useClientDetail(clientId: string) {
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

    useEffect(() => {
        fetchClient();
    }, [fetchClient]);

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

    const adjustCoins = useCallback((amount: number, reason: string) => {
        if (!client || !reason) {
            showToast('Falta razón del ajuste', 'error');
            return;
        }
        updateClient({
            blisCoins: client.blisCoins + amount,
            transactions: [{
                id: `TX-${Date.now()}`,
                date: new Date().toLocaleDateString(),
                amount,
                type: 'Ajuste',
                description: 'Ajuste de Saldo',
                reason
            }, ...client.transactions]
        }, false);
        showToast('Saldo actualizado', 'success');
    }, [client, updateClient, showToast]);

    return {
        client,
        loading,
        saving,
        fetchClient,
        updateClient,
        adjustCoins
    };
}
