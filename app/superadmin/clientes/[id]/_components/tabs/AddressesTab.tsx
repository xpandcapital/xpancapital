"use client";

import { useState } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import type { Client, Address } from '../../../_types';
import { useToast } from '@/components/ui/Toast';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface AddressesTabProps {
    client: Client;
    onUpdate: (fields: Partial<Client>, showToast?: boolean) => void;
}

export function AddressesTab({ client, onUpdate }: AddressesTabProps) {
    const { showToast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [newAddress, setNewAddress] = useState<Partial<Address>>({ type: 'Envio', label: '', address: '', city: '' });

    const handleAddAddress = () => {
        if (!newAddress.address) return showToast('Completa la dirección', 'warning');
        onUpdate({
            addresses: [{
                id: `AD-${Date.now()}`,
                ...newAddress
            } as Address, ...client.addresses]
        }, false);
        setIsAdding(false);
        setNewAddress({ type: 'Envio', label: '', address: '', city: '' });
        showToast('Dirección agregada', 'success');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase">Direcciones Guardadas</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                >
                    {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
            </div>

            {isAdding && (
                <div className="p-8 bg-zinc-900 border border-white/10 rounded-3xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Etiqueta</label>
                            <input
                                placeholder="Ej: Casa, Oficina..."
                                value={newAddress.label}
                                onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Tipo</label>
                            <SearchableSelect
                                value={newAddress.type || 'Envio'}
                                onChange={v => setNewAddress({ ...newAddress, type: v as Address['type'] })}
                                options={[
                                    { value: 'Envio', label: 'Envío' },
                                    { value: 'Facturacion', label: 'Facturación' },
                                    { value: 'Oficina', label: 'Oficina' },
                                ]}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Dirección</label>
                        <input
                            placeholder="Dirección completa..."
                            value={newAddress.address}
                            onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Ciudad</label>
                        <input
                            placeholder="Ciudad..."
                            value={newAddress.city}
                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full"
                        />
                    </div>
                    <button
                        onClick={handleAddAddress}
                        className="w-full"
                    >
                        Guardar Dirección
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.addresses.map(addr => (
                    <div key={addr.id} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl hover:border-white/20 transition-all">
                        <div className="text-[9px] font-black text-gray-600 uppercase mb-2">{addr.type}</div>
                        <h4 className="font-black text-sm uppercase mb-1">{addr.label || 'Sin etiqueta'}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{addr.address}</p>
                        <p className="text-[10px] text-gray-600 mt-1">{addr.city}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
