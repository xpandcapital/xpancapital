"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    X, User, Mail, Phone, MapPin, Shield, Star, Ban, Trash2,
    Crown, Bell, DollarSign, ShoppingBag, GraduationCap, Users, MessageCircle,
    Sparkles, Zap, Clock, ChevronRight, TrendingUp
} from 'lucide-react';
import type { Client } from '../../_types';
import { useToast } from '@/components/ui/Toast';

interface ClientSidebarProps {
    client: Client;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onClose?: () => void;
}

const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'economy', label: 'Bóveda', icon: DollarSign },
    { id: 'sales', label: 'Ventas', icon: ShoppingBag },
    { id: 'addresses', label: 'Direcciones', icon: MapPin },
    { id: 'academia', label: 'Academia', icon: GraduationCap },
    { id: 'gamificacion', label: 'Gamificación', icon: TrendingUp },
    { id: 'referrals', label: 'Referidos', icon: Users },
    { id: 'comms', label: 'Comunicaciones', icon: MessageCircle },
    { id: 'ai', label: 'Insights IA', icon: Sparkles },
    { id: 'automations', label: 'Automatizaciones', icon: Zap },
    { id: 'history', label: 'Historial', icon: Clock },
];

export function ClientSidebar({ client, activeTab, onTabChange, onClose }: ClientSidebarProps) {
    const { showToast } = useToast();
    const router = useRouter();

    const handleFreeze = () => {
        showToast(`Cliente ${client.isFrozen ? 'descongelado' : 'congelado'}`, client.isFrozen ? 'info' : 'warning');
    };

    const handleVIP = () => {
        showToast(`Cliente marcado como ${client.isVIP ? 'no-VIP' : 'VIP'}`, 'success');
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 border-r border-white/5">
            <div className="flex-1 overflow-y-auto">
                <div className="relative p-6 border-b border-white/5">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg hover:bg-white/10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black ${
                                client.isVIP ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-black' :
                                client.isFrozen ? 'bg-zinc-800 text-gray-500' :
                                'bg-blis-red text-white'
                            }`}>
                                {client.firstName?.charAt(0)}{client.lastName?.charAt(0)}
                            </div>
                            {client.isFrozen && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-zinc-950">
                                    <Ban className="w-3 h-3 text-gray-500" />
                                </div>
                            )}
                            {client.isVIP && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-2 border-zinc-950">
                                    <Crown className="w-3 h-3 text-black" />
                                </div>
                            )}
                        </div>

                        <h2 className="text-sm font-black uppercase">{client.firstName} {client.lastName}</h2>
                        <p className="text-[10px] text-gray-500 mt-1">{client.email}</p>

                        <div className="flex gap-2 mt-3 flex-wrap justify-center">
                            {client.emailVerified && (
                                <span className="text-[7px] font-black uppercase px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center gap-1">
                                    <Shield className="w-2.5 h-2.5" /> Verificado
                                </span>
                            )}
                            {client.isNewsletterSubscribed && (
                                <span className="text-[7px] font-black uppercase px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center gap-1">
                                    <Bell className="w-2.5 h-2.5" /> News
                                </span>
                            )}
                            <span className={`text-[7px] font-black uppercase px-2 py-1 rounded-lg ${
                                client.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                client.status === 'inactive' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-rose-500/10 text-rose-500'
                            }`}>
                                {client.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                                activeTab === tab.id
                                    ? 'bg-white/5 text-white'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                <tab.icon className="w-4 h-4" />
                                <span className="text-[11px] font-black uppercase">{tab.label}</span>
                            </span>
                            {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-white/5 space-y-2">
                <button
                    onClick={handleVIP}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                        client.isVIP
                            ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    <Star className="w-4 h-4" /> {client.isVIP ? 'Quitar VIP' : 'Hacer VIP'}
                </button>
                <button
                    onClick={handleFreeze}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                        client.isFrozen
                            ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                            : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                    }`}
                >
                    <Ban className="w-4 h-4" /> {client.isFrozen ? 'Descongelar' : 'Congelar'}
                </button>
                <button
                    onClick={() => showToast('Cliente eliminado', 'error')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase hover:bg-rose-500/20 transition-all"
                >
                    <Trash2 className="w-4 h-4" /> Eliminar
                </button>
            </div>
        </div>
    );
}
