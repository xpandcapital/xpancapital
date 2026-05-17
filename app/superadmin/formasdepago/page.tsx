"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    CreditCard, Coins, Building2, ShieldCheck, Loader2,
    ToggleLeft, ToggleRight, Settings, Save, Globe, Wallet,
    Plus, Trash2, Phone, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Bank { name: string; account_number: string; account_holder: string; cci: string; currency: string; account_type: string; }
interface Wallet { network: string; address: string; label: string; }
interface FormaPago {
    id: string; nombre: string; slug: string; descripcion: string;
    activo: boolean; config: Record<string, any>; orden: number;
}

const ICONOS: Record<string, any> = { helio_card: CreditCard, helio_crypto: Wallet, coins: Coins, transfer: Building2, crypto_manual: Globe };
const COLORES: Record<string, string> = { helio_card: "bg-blue-500/10 border-blue-500/20 text-blue-400", helio_crypto: "bg-purple-500/10 border-purple-500/20 text-purple-400", coins: "bg-amber-500/10 border-amber-500/20 text-amber-400", transfer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", crypto_manual: "bg-orange-500/10 border-orange-500/20 text-orange-400" };

export default function FormasPagoAdminPage() {
    const [formas, setFormas] = useState<FormaPago[]>([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);

    const cargar = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/formas-pago");
        const d = await res.json();
        if (d.success) setFormas(d.formas || []);
        setLoading(false);
    };

    useEffect(() => { cargar(); }, []);
    useEffect(() => {
        if (formas.length > 0 && !expanded) {
            const first = formas.find(f => ['helio_card', 'helio_crypto', 'transfer', 'crypto_manual', 'coins'].includes(f.slug));
            if (first) setExpanded(first.id);
        }
    }, [formas]);

    const toggleActivo = async (forma: FormaPago) => {
        setGuardando(forma.id);
        await fetch("/api/admin/formas-pago", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: forma.id, activo: !forma.activo }) });
        setFormas(prev => prev.map(f => f.id === forma.id ? { ...f, activo: !f.activo } : f));
        setGuardando(null);
    };

    const updateConfig = (formaId: string, config: Record<string, any>) => {
        setFormas(prev => prev.map(f => f.id === formaId ? { ...f, config: { ...f.config, ...config } } : f));
    };

    const guardarConfig = async (forma: FormaPago) => {
        setGuardando(forma.id);
        await fetch("/api/admin/formas-pago", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: forma.id, config: forma.config }) });
        setGuardando(null);
    };

    const addBank = (formaId: string) => {
        const forma = formas.find(f => f.id === formaId)!;
        const banks = [...(forma.config?.banks || []), { name: "", account_number: "", account_holder: "", cci: "", currency: "PEN", account_type: "ahorros" }];
        updateConfig(formaId, { banks });
    };

    const removeBank = (formaId: string, idx: number) => {
        const forma = formas.find(f => f.id === formaId)!;
        const banks = (forma.config?.banks || []).filter((_: any, i: number) => i !== idx);
        updateConfig(formaId, { banks });
    };

    const updateBank = (formaId: string, idx: number, field: string, value: string) => {
        const forma = formas.find(f => f.id === formaId)!;
        const banks = [...(forma.config?.banks || [])];
        banks[idx] = { ...banks[idx], [field]: value };
        updateConfig(formaId, { banks });
    };

    const updateWallet = (formaId: string, idx: number, field: string, value: string) => {
        const forma = formas.find(f => f.id === formaId)!;
        const wallets = [...(forma.config?.wallets || [])];
        wallets[idx] = { ...wallets[idx], [field]: value };
        updateConfig(formaId, { wallets });
    };

    const updateSimple = (formaId: string, key: string, value: string) => {
        updateConfig(formaId, { [key]: value });
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div><h1 className="text-3xl font-black uppercase tracking-tighter">Formas de Pago</h1><p className="text-gray-400 text-sm mt-1">Activa, desactiva y configura los métodos de pago</p></div>
                </div>
                {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blis-red" /></div> : (
                    <div className="space-y-4">
                        {formas.map(forma => {
                            const Icon = ICONOS[forma.slug] || Settings;
                            const colorClass = COLORES[forma.slug] || "bg-gray-500/10 border-gray-500/20 text-gray-400";
                            const banks = forma.config?.banks || [];
                            const wallets = forma.config?.wallets || [];
                            const isExpanded = expanded === forma.id;

                            return (
                                <div key={forma.id} className={`bg-zinc-900/50 border rounded-2xl p-6 transition-all ${forma.activo ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorClass}`}><Icon className="w-6 h-6" /></div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-black text-white">{forma.nombre}</h3>
                                                    <Badge className={forma.activo ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>{forma.activo ? "Activo" : "Inactivo"}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-400">{forma.descripcion}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(banks.length > 0 || wallets.length > 0 || ['coins', 'helio_card', 'helio_crypto', 'transfer', 'crypto_manual'].includes(forma.slug)) && (
                                                <Button variant="ghost" size="sm" onClick={() => setExpanded(isExpanded ? null : forma.id)} className="text-xs text-gray-500">
                                                    <Settings className="w-4 h-4" /> {isExpanded ? 'Ocultar' : 'Configurar'}
                                                </Button>
                                            )}
                                            <Button onClick={() => toggleActivo(forma)} disabled={guardando === forma.id} variant="ghost" className={`text-xs ${forma.activo ? 'text-emerald-400' : 'text-gray-600'}`}>
                                                {guardando === forma.id ? <Loader2 className="w-6 h-6 animate-spin" /> : forma.activo ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Expanded config */}
                                    {isExpanded && forma.activo && (
                                        <div className="mt-6 pl-16 space-y-4 border-t border-white/5 pt-4">
                                            {/* Helio Card API config */}
                                            {forma.slug === 'helio_card' && (
                                                <div className="space-y-3">
                                                    <p className="text-sm font-bold text-white">Configuración Helio API — Tarjetas</p>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Helio API Key (pública)</label>
                                                            <Input value={forma.config?.api_key || ""} onChange={e => updateSimple(forma.id, 'api_key', e.target.value)}
                                                                placeholder="pk_live_..." className="bg-white/5 border-white/10 text-white text-xs font-mono" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Helio Secret Key</label>
                                                            <Input value={forma.config?.secret_key || ""} onChange={e => updateSimple(forma.id, 'secret_key', e.target.value)}
                                                                placeholder="sk_live_..." type="password" className="bg-white/5 border-white/10 text-white text-xs font-mono" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Helio Crypto config */}
                                            {forma.slug === 'helio_crypto' && (
                                                <div className="space-y-3">
                                                    <p className="text-sm font-bold text-white">Configuración Helio Crypto</p>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Helio API Key (pública)</label>
                                                            <Input value={forma.config?.api_key || ""} onChange={e => updateSimple(forma.id, 'api_key', e.target.value)}
                                                                placeholder="pk_live_..." className="bg-white/5 border-white/10 text-white text-xs font-mono" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Helio Secret Key</label>
                                                            <Input value={forma.config?.secret_key || ""} onChange={e => updateSimple(forma.id, 'secret_key', e.target.value)}
                                                                placeholder="sk_live_..." type="password" className="bg-white/5 border-white/10 text-white text-xs font-mono" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Webhook URL (para confirmaciones)</label>
                                                            <Input value={forma.config?.webhook_url || ""} onChange={e => updateSimple(forma.id, 'webhook_url', e.target.value)}
                                                                placeholder="https://tu-api.com/webhook/helio" className="bg-white/5 border-white/10 text-white text-xs" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* WhatsApp + Instructions (for manual methods) */}
                                            {['transfer', 'crypto_manual'].includes(forma.slug) && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> WhatsApp</label>
                                                        <Input value={forma.config?.whatsapp || ""} onChange={e => updateSimple(forma.id, 'whatsapp', e.target.value)}
                                                            placeholder="+51999999999" className="bg-white/5 border-white/10 text-white text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Instrucciones</label>
                                                        <Input value={forma.config?.instructions || ""} onChange={e => updateSimple(forma.id, 'instructions', e.target.value)}
                                                            placeholder="Instrucciones que verá el cliente" className="bg-white/5 border-white/10 text-white text-sm" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Banks management */}
                                            {banks.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-bold text-white">Cuentas Bancarias</p>
                                                        <Button size="sm" variant="outline" onClick={() => addBank(forma.id)} className="text-xs border-white/10 text-gray-400 hover:text-white">
                                                            <Plus className="w-3 h-3 mr-1" /> Agregar Banco
                                                        </Button>
                                                    </div>
                                                    {banks.map((bank: Bank, idx: number) => (
                                                        <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs text-gray-400 font-bold">Banco #{idx + 1}</span>
                                                                <button onClick={() => removeBank(forma.id, idx)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-[10px] text-gray-600 uppercase block mb-1">Nombre del Banco</label>
                                                                    <Input value={bank.name} onChange={e => updateBank(forma.id, idx, 'name', e.target.value)} placeholder="Banco de Crédito" className="bg-white/5 border-white/10 text-white text-xs" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-gray-600 uppercase block mb-1">Titular</label>
                                                                    <Input value={bank.account_holder} onChange={e => updateBank(forma.id, idx, 'account_holder', e.target.value)} placeholder="BLIS Corp SAC" className="bg-white/5 border-white/10 text-white text-xs" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-gray-600 uppercase block mb-1">N° Cuenta</label>
                                                                    <Input value={bank.account_number} onChange={e => updateBank(forma.id, idx, 'account_number', e.target.value)} placeholder="123-456-789" className="bg-white/5 border-white/10 text-white text-xs" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-gray-600 uppercase block mb-1">CCI</label>
                                                                    <Input value={bank.cci} onChange={e => updateBank(forma.id, idx, 'cci', e.target.value)} placeholder="00212300456789012345" className="bg-white/5 border-white/10 text-white text-xs" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-gray-600 uppercase block mb-1">Moneda</label>
                                                                    <select value={bank.currency} onChange={e => updateBank(forma.id, idx, 'currency', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white">
                                                                        <option value="PEN">Soles (PEN)</option>
                                                                        <option value="USD">Dólares (USD)</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-gray-600 uppercase block mb-1">Tipo Cuenta</label>
                                                                    <select value={bank.account_type} onChange={e => updateBank(forma.id, idx, 'account_type', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white">
                                                                        <option value="ahorros">Ahorros</option>
                                                                        <option value="corriente">Corriente</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Wallets management */}
                                            {wallets.length > 0 && (
                                                <div className="space-y-3">
                                                    <p className="text-sm font-bold text-white">Carteras Crypto</p>
                                                    {wallets.map((w: Wallet, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-3">
                                                            <span className="text-xs text-gray-400 w-32 flex-shrink-0">{w.label || w.network}</span>
                                                            <Input value={w.address} onChange={e => updateWallet(forma.id, idx, 'address', e.target.value)}
                                                                placeholder={`Dirección de ${w.network}`} className="bg-white/5 border-white/10 text-white text-xs flex-1 font-mono" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* BLISCOINS config */}
                                            {forma.slug === 'coins' && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tasa (1 USD = X BLIS)</label>
                                                        <Input value={forma.config?.rate || "10"} onChange={e => updateSimple(forma.id, 'rate', e.target.value)}
                                                            type="number" className="bg-white/5 border-white/10 text-white text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Mínimo BLISCOINS</label>
                                                        <Input value={forma.config?.min_coins || "0"} onChange={e => updateSimple(forma.id, 'min_coins', e.target.value)}
                                                            type="number" className="bg-white/5 border-white/10 text-white text-sm" />
                                                    </div>
                                                </div>
                                            )}

                                            <Button onClick={() => guardarConfig(forma)} disabled={guardando === forma.id} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                                                <Save className="w-3 h-3 mr-1" /> Guardar Configuración
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
