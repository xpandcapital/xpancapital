"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    CreditCard, Coins, Building2, ShieldCheck, Loader2,
    ToggleLeft, ToggleRight, Settings, Save, Globe, Wallet,
    Plus, Trash2, Phone, ChevronDown, ChevronRight, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Bank { name: string; account_number: string; account_holder: string; cci: string; account_type: string; }
interface Wallet { network: string; address: string; label: string; }
interface Country { label: string; flag: string; currency: string; banks: Bank[]; }
interface FormaPago {
    id: string; nombre: string; slug: string; descripcion: string;
    activo: boolean; config: Record<string, any>; orden: number;
}

const ICONOS: Record<string, any> = { helio_card: CreditCard, helio_crypto: Wallet, coins: Coins, transfer: Building2, crypto_manual: Globe };
const COLORES: Record<string, string> = { helio_card: "bg-blue-500/10 border-blue-500/20 text-blue-400", helio_crypto: "bg-purple-500/10 border-purple-500/20 text-purple-400", coins: "bg-amber-500/10 border-amber-500/20 text-amber-400", transfer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", crypto_manual: "bg-orange-500/10 border-orange-500/20 text-orange-400" };
const MONEDAS: Record<string, string> = { "PEN": "S/", "USD": "$", "EUR": "€", "MXN": "MX$", "COP": "COL$", "ARS": "AR$", "CLP": "CLP$" };

export default function FormasPagoAdminPage() {
    const [formas, setFormas] = useState<FormaPago[]>([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [expandedPais, setExpandedPais] = useState<Record<string, boolean>>({});

    const cargar = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/formas-pago");
        const d = await res.json();
        if (d.success) {
            setFormas(d.formas || []);
            // Auto-expand transferencia
            const t = (d.formas || []).find((f: FormaPago) => f.slug === 'transfer' && f.activo);
            if (t) setExpanded(t.id);
        }
        setLoading(false);
    };

    useEffect(() => { cargar(); }, []);

    const toggleActivo = async (forma: FormaPago) => {
        setGuardando(forma.id);
        await fetch("/api/admin/formas-pago", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: forma.id, activo: !forma.activo }) });
        setFormas(prev => prev.map(f => f.id === forma.id ? { ...f, activo: !f.activo } : f));
        setGuardando(null);
    };

    const guardarConfig = async (forma: FormaPago) => {
        setGuardando(forma.id);
        await fetch("/api/admin/formas-pago", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: forma.id, config: forma.config }) });
        setGuardando(null);
    };

    // Helpers para transferencia
    const getCountries = (forma: FormaPago): Record<string, Country> => forma.config?.countries || {};
    const updateForma = (formaId: string, config: Record<string, any>) => {
        setFormas(prev => prev.map(f => f.id === formaId ? { ...f, config: { ...f.config, ...config } } : f));
    };
    const addCountry = (formaId: string) => {
        const key = prompt("Código del país (ej: peru, usa, mexico):")?.toLowerCase();
        if (!key) return;
        const forma = formas.find(f => f.id === formaId)!;
        const countries = { ...getCountries(forma), [key]: { label: key.charAt(0).toUpperCase() + key.slice(1), flag: "🏳️", currency: "PEN", banks: [] } };
        updateForma(formaId, { countries });
        setExpandedPais(prev => ({ ...prev, [`${formaId}-${key}`]: true }));
    };
    const removeCountry = (formaId: string, key: string) => {
        if (!confirm("¿Eliminar este país y todos sus bancos?")) return;
        const countries = { ...getCountries(formas.find(f => f.id === formaId)!) };
        delete countries[key];
        updateForma(formaId, { countries });
    };
    const updateCountryField = (formaId: string, key: string, field: string, value: string) => {
        const countries = { ...getCountries(formas.find(f => f.id === formaId)!) };
        countries[key] = { ...countries[key], [field]: value };
        updateForma(formaId, { countries });
    };
    const addBank = (formaId: string, countryKey: string) => {
        const countries = { ...getCountries(formas.find(f => f.id === formaId)!) };
        const currency = countries[countryKey]?.currency || "PEN";
        countries[countryKey].banks = [...(countries[countryKey].banks || []), { name: "", account_number: "", account_holder: "", cci: "", account_type: "ahorros" }];
        updateForma(formaId, { countries });
    };
    const removeBank = (formaId: string, countryKey: string, idx: number) => {
        const countries = { ...getCountries(formas.find(f => f.id === formaId)!) };
        countries[countryKey].banks = countries[countryKey].banks.filter((_: any, i: number) => i !== idx);
        updateForma(formaId, { countries });
    };
    const updateBankField = (formaId: string, countryKey: string, idx: number, field: string, value: string) => {
        const countries = { ...getCountries(formas.find(f => f.id === formaId)!) };
        countries[countryKey].banks[idx] = { ...countries[countryKey].banks[idx], [field]: value };
        updateForma(formaId, { countries });
    };

    // Helpers para crypto manual
    const getWallets = (forma: FormaPago): Wallet[] => forma.config?.wallets || [];
    const updateWallet = (formaId: string, idx: number, field: string, value: string) => {
        const wallets = [...getWallets(formas.find(f => f.id === formaId)!)];
        wallets[idx] = { ...wallets[idx], [field]: value };
        updateForma(formaId, { wallets });
    };

    // Helpers genéricos
    const updateSimple = (formaId: string, key: string, value: string) => { updateForma(formaId, { [key]: value }); };

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
                            const countries = getCountries(forma);
                            const wallets = getWallets(forma);
                            const countryKeys = Object.keys(countries);
                            const isExpanded = expanded === forma.id;

                            return (
                                <div key={forma.id} className={`bg-zinc-900/50 border rounded-2xl p-6 transition-all ${forma.activo ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
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
                                        <Button onClick={() => toggleActivo(forma)} disabled={guardando === forma.id} variant="ghost" className={`text-xs ${forma.activo ? 'text-emerald-400' : 'text-gray-600'}`}>
                                            {guardando === forma.id ? <Loader2 className="w-6 h-6 animate-spin" /> : forma.activo ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                                        </Button>
                                    </div>

                                    {forma.activo && (
                                        <>
                                            {/* ── PAÍSES (Transferencia) ── */}
                                            {forma.slug === 'transfer' && (
                                                <div className="space-y-3 ml-16">
                                                    {countryKeys.length > 0 && (
                                                        <div className="space-y-3">
                                                            {countryKeys.map(key => {
                                                                const c = countries[key];
                                                                const paisExpanded = expandedPais[`${forma.id}-${key}`];
                                                                return (
                                                                    <div key={key} className="bg-black/30 border border-white/5 rounded-xl p-4">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <button onClick={() => setExpandedPais(prev => ({ ...prev, [`${forma.id}-${key}`]: !paisExpanded }))} className="flex items-center gap-2 text-white font-bold">
                                                                                {paisExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                                                <span className="text-lg">{c.flag || "🏳️"}</span>
                                                                                <span>{c.label || key}</span>
                                                                                <span className="text-xs text-gray-500">({MONEDAS[c.currency] || c.currency})</span>
                                                                                <span className="text-[10px] text-gray-600">{c.banks?.length || 0} bancos</span>
                                                                            </button>
                                                                            <div className="flex items-center gap-2">
                                                                                <button onClick={() => removeCountry(forma.id, key)} className="text-red-400 hover:text-red-300 text-xs"><Trash2 className="w-4 h-4" /></button>
                                                                            </div>
                                                                        </div>

                                                                        {paisExpanded && (
                                                                            <div className="pt-3 space-y-3 border-t border-white/5">
                                                                                <div className="grid grid-cols-3 gap-3">
                                                                                    <div>
                                                                                        <label className="text-[9px] text-gray-600 uppercase block mb-1">Nombre del País</label>
                                                                                        <Input value={c.label} onChange={e => updateCountryField(forma.id, key, 'label', e.target.value)} className="bg-white/5 border-white/10 text-white text-xs" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="text-[9px] text-gray-600 uppercase block mb-1">Bandera (emoji)</label>
                                                                                        <Input value={c.flag} onChange={e => updateCountryField(forma.id, key, 'flag', e.target.value)} className="bg-white/5 border-white/10 text-white text-xs" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="text-[9px] text-gray-600 uppercase block mb-1">Moneda</label>
                                                                                        <select value={c.currency} onChange={e => updateCountryField(forma.id, key, 'currency', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white">
                                                                                            <option value="PEN">PEN (Soles)</option>
                                                                                            <option value="USD">USD (Dólares)</option>
                                                                                            <option value="EUR">EUR (Euros)</option>
                                                                                            <option value="MXN">MXN (Pesos MX)</option>
                                                                                            <option value="COP">COP (Pesos CO)</option>
                                                                                            <option value="ARS">ARS (Pesos AR)</option>
                                                                                            <option value="CLP">CLP (Pesos CL)</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Bancos del país */}
                                                                                <div className="space-y-3 mt-3">
                                                                                    {(c.banks || []).map((bank: Bank, idx: number) => (
                                                                                        <div key={idx} className="bg-black/20 border border-white/5 rounded-lg p-3">
                                                                                            <div className="flex justify-between items-center mb-2">
                                                                                                <span className="text-[10px] text-gray-500 font-bold">Banco #{idx + 1}</span>
                                                                                                <button onClick={() => removeBank(forma.id, key, idx)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                                            </div>
                                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                                                <div>
                                                                                                    <label className="text-[9px] text-gray-600 block mb-0.5">Banco</label>
                                                                                                    <Input value={bank.name} onChange={e => updateBankField(forma.id, key, idx, 'name', e.target.value)} placeholder="BCP" className="bg-white/5 border-white/10 text-white text-[10px] h-8" />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <label className="text-[9px] text-gray-600 block mb-0.5">N° Cuenta</label>
                                                                                                    <Input value={bank.account_number} onChange={e => updateBankField(forma.id, key, idx, 'account_number', e.target.value)} placeholder="123-456" className="bg-white/5 border-white/10 text-white text-[10px] h-8 font-mono" />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <label className="text-[9px] text-gray-600 block mb-0.5">Titular</label>
                                                                                                    <Input value={bank.account_holder} onChange={e => updateBankField(forma.id, key, idx, 'account_holder', e.target.value)} placeholder="BLIS Corp SAC" className="bg-white/5 border-white/10 text-white text-[10px] h-8" />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <label className="text-[9px] text-gray-600 block mb-0.5">CCI</label>
                                                                                                    <Input value={bank.cci} onChange={e => updateBankField(forma.id, key, idx, 'cci', e.target.value)} placeholder="002..." className="bg-white/5 border-white/10 text-white text-[10px] h-8 font-mono" />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <label className="text-[9px] text-gray-600 block mb-0.5">Tipo Cuenta</label>
                                                                                                    <select value={bank.account_type} onChange={e => updateBankField(forma.id, key, idx, 'account_type', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-[10px] text-white h-8">
                                                                                                        <option value="ahorros">Ahorros</option>
                                                                                                        <option value="corriente">Corriente</option>
                                                                                                    </select>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                    <Button size="sm" variant="outline" onClick={() => addBank(forma.id, key)} className="text-xs border-white/10 text-gray-400 hover:text-white w-full">
                                                                                        <Plus className="w-3 h-3 mr-1" /> Agregar Banco en {c.label || key}
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    <Button size="sm" variant="outline" onClick={() => addCountry(forma.id)} className="text-xs border-white/10 text-gray-400 hover:text-white">
                                                        <Plus className="w-3 h-3 mr-1" /> Agregar País
                                                    </Button>
                                                </div>
                                            )}

                                            {/* ── WALLETS (Crypto Manual) ── */}
                                            {forma.slug === 'crypto_manual' && (
                                                <div className="ml-16 space-y-3">
                                                    {wallets.map((w: Wallet, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-3 bg-black/30 border border-white/5 rounded-xl p-3">
                                                            <div className="w-32 flex-shrink-0">
                                                                <Input value={w.label} onChange={e => updateWallet(forma.id, idx, 'label', e.target.value)}
                                                                    placeholder="Ej: USDT TRC20" className="bg-white/5 border-white/10 text-white text-[10px] h-8" />
                                                            </div>
                                                            <Input value={w.address} onChange={e => updateWallet(forma.id, idx, 'address', e.target.value)}
                                                                placeholder="Dirección de wallet" className="bg-white/5 border-white/10 text-white text-[10px] flex-1 h-8 font-mono" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* ── Botón Configurar (WhatsApp + Instrucciones + Helio + BLISCOINS) ── */}
                                            <div className="ml-16 mt-3">
                                                <Button variant="ghost" size="sm" onClick={() => setExpanded(isExpanded ? null : forma.id)} className="text-xs text-gray-500">
                                                    <Settings className="w-4 h-4 mr-1" /> {isExpanded ? 'Ocultar Configuración' : 'Configurar'}
                                                </Button>
                                            </div>

                                            {isExpanded && (
                                                <div className="ml-16 mt-4 space-y-3 border-t border-white/5 pt-4">
                                                    {/* WhatsApp + Instructions (manual methods) */}
                                                    {['transfer', 'crypto_manual'].includes(forma.slug) && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> WhatsApp</label>
                                                                <Input value={forma.config?.whatsapp || ""} onChange={e => updateSimple(forma.id, 'whatsapp', e.target.value)} placeholder="+51999999999" className="bg-white/5 border-white/10 text-white text-sm" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Instrucciones</label>
                                                                <Input value={forma.config?.instructions || ""} onChange={e => updateSimple(forma.id, 'instructions', e.target.value)} placeholder="Instrucciones que verá el cliente" className="bg-white/5 border-white/10 text-white text-sm" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Helio Card */}
                                                    {forma.slug === 'helio_card' && (
                                                        <div className="space-y-3">
                                                            <p className="text-sm font-bold text-white">Helio API — Tarjetas</p>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                <Input value={forma.config?.api_key || ""} onChange={e => updateSimple(forma.id, 'api_key', e.target.value)} placeholder="API Key (pk_live_...)" className="bg-white/5 border-white/10 text-white text-xs font-mono" />
                                                                <Input value={forma.config?.secret_key || ""} onChange={e => updateSimple(forma.id, 'secret_key', e.target.value)} placeholder="Secret Key (sk_live_...)" type="password" className="bg-white/5 border-white/10 text-white text-xs font-mono" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Helio Crypto */}
                                                    {forma.slug === 'helio_crypto' && (
                                                        <div className="space-y-3">
                                                            <p className="text-sm font-bold text-white">Helio Crypto API</p>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                <Input value={forma.config?.api_key || ""} onChange={e => updateSimple(forma.id, 'api_key', e.target.value)} placeholder="API Key" className="bg-white/5 border-white/10 text-white text-xs font-mono" />
                                                                <Input value={forma.config?.secret_key || ""} onChange={e => updateSimple(forma.id, 'secret_key', e.target.value)} placeholder="Secret Key" type="password" className="bg-white/5 border-white/10 text-white text-xs font-mono" />
                                                                <Input value={forma.config?.webhook_url || ""} onChange={e => updateSimple(forma.id, 'webhook_url', e.target.value)} placeholder="Webhook URL" className="bg-white/5 border-white/10 text-white text-xs" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* BLISCOINS */}
                                                    {forma.slug === 'coins' && (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <Input value={forma.config?.rate || "10"} onChange={e => updateSimple(forma.id, 'rate', e.target.value)} type="number" placeholder="Tasa (1 USD = X BLIS)" className="bg-white/5 border-white/10 text-white text-sm" />
                                                            <Input value={forma.config?.min_coins || "0"} onChange={e => updateSimple(forma.id, 'min_coins', e.target.value)} type="number" placeholder="Mínimo BLISCOINS" className="bg-white/5 border-white/10 text-white text-sm" />
                                                        </div>
                                                    )}

                                                    <Button onClick={() => guardarConfig(forma)} disabled={guardando === forma.id} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                                                        <Save className="w-3 h-3 mr-1" /> Guardar Configuración
                                                    </Button>
                                                </div>
                                            )}
                                        </>
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
