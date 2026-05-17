"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    CreditCard, Coins, Building2, ShieldCheck, Loader2,
    ToggleLeft, ToggleRight, Settings, Save, Globe, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface FormaPago {
    id: string;
    nombre: string;
    slug: string;
    descripcion: string;
    activo: boolean;
    config: Record<string, any>;
    orden: number;
}

const ICONOS: Record<string, any> = {
    helio_card: CreditCard,
    helio_crypto: Wallet,
    coins: Coins,
    transfer: Building2,
};

const COLORES: Record<string, string> = {
    helio_card: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    helio_crypto: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    coins: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    transfer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
};

export default function FormasPagoAdminPage() {
    const [formas, setFormas] = useState<FormaPago[]>([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState<string | null>(null);

    const cargar = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/formas-pago");
        const d = await res.json();
        if (d.success) setFormas(d.formas || []);
        setLoading(false);
    };

    useEffect(() => { cargar(); }, []);

    const toggleActivo = async (forma: FormaPago) => {
        setGuardando(forma.id);
        await fetch("/api/admin/formas-pago", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: forma.id, activo: !forma.activo }),
        });
        setFormas(prev => prev.map(f => f.id === forma.id ? { ...f, activo: !f.activo } : f));
        setGuardando(null);
    };

    const actualizarConfig = async (forma: FormaPago, key: string, value: string) => {
        const newConfig = { ...forma.config, [key]: value };
        setFormas(prev => prev.map(f => f.id === forma.id ? { ...f, config: newConfig } : f));
    };

    const guardarConfig = async (forma: FormaPago) => {
        setGuardando(forma.id);
        await fetch("/api/admin/formas-pago", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: forma.id, config: forma.config }),
        });
        setGuardando(null);
    };

    const configFields: Record<string, { label: string; key: string; placeholder: string }[]> = {
        transfer: [
            { label: "Banco", key: "bank_name", placeholder: "Ej: Banco de Crédito" },
            { label: "Número de Cuenta", key: "account_number", placeholder: "Ej: 123-456-789" },
            { label: "Titular", key: "account_holder", placeholder: "Ej: BLIS Corp SAC" },
            { label: "CCI", key: "cci", placeholder: "Ej: 00212300456789012345" },
            { label: "Instrucciones", key: "instructions", placeholder: "Envía el comprobante a..." },
        ],
        coins: [
            { label: "Tasa de conversión", key: "rate", placeholder: "10 (1 USD = 10 BLIS)" },
            { label: "Mínimo BLISCOINS", key: "min_coins", placeholder: "0" },
        ],
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Formas de Pago</h1>
                        <p className="text-gray-400 text-sm mt-1">Activa, desactiva y configura los métodos de pago de tu tienda</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blis-red" /></div>
                ) : (
                    <div className="space-y-4">
                        {formas.map((forma) => {
                            const Icon = ICONOS[forma.slug] || Settings;
                            const colorClass = COLORES[forma.slug] || "bg-gray-500/10 border-gray-500/20 text-gray-400";
                            const fields = configFields[forma.slug] || [];

                            return (
                                <div key={forma.id} className={`bg-zinc-900/50 border rounded-2xl p-6 transition-all ${forma.activo ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorClass}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-black text-white">{forma.nombre}</h3>
                                                    <Badge className={forma.activo ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
                                                        {forma.activo ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-400">{forma.descripcion}</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => toggleActivo(forma)}
                                            disabled={guardando === forma.id}
                                            variant="ghost"
                                            className={`text-xs ${forma.activo ? 'text-emerald-400 hover:text-emerald-300' : 'text-gray-600 hover:text-gray-400'}`}
                                        >
                                            {guardando === forma.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : forma.activo ? (
                                                <ToggleRight className="w-8 h-8" />
                                            ) : (
                                                <ToggleLeft className="w-8 h-8" />
                                            )}
                                        </Button>
                                    </div>

                                    {/* Config fields */}
                                    {fields.length > 0 && forma.activo && (
                                        <div className="mt-4 pl-16 space-y-3">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Configuración</p>
                                            {fields.map(field => (
                                                <div key={field.key} className="flex items-center gap-3">
                                                    <label className="text-xs text-gray-400 w-32 flex-shrink-0">{field.label}</label>
                                                    <Input
                                                        value={forma.config?.[field.key] || ""}
                                                        onChange={e => actualizarConfig(forma, field.key, e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className="bg-white/5 border-white/10 text-white text-sm flex-1"
                                                    />
                                                </div>
                                            ))}
                                            <Button
                                                onClick={() => guardarConfig(forma)}
                                                disabled={guardando === forma.id}
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                                            >
                                                <Save className="w-3 h-3 mr-1" /> Guardar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
