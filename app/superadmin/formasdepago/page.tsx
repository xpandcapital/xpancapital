"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    CreditCard, Coins, Building2, ShieldCheck, Loader2,
    ToggleLeft, ToggleRight, Settings, Save, Globe, Wallet,
    Plus, Trash2, Phone, ChevronDown, ChevronRight,
    ArrowUp, ArrowDown, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { NativeSelect } from "@/components/ui/SearchableSelect";

interface Bank { name: string; account_number: string; account_holder: string; cci: string; currency: string; account_type: string; }
interface Wallet { network: string; address: string; label: string; qr_url?: string; holder?: string; }
interface Country { label: string; flag: string; banks: Bank[]; }
interface FormaPago {
    id: string; nombre: string; slug: string; descripcion: string;
    activo: boolean; config: Record<string, any>; orden: number;
}

const ICONOS: Record<string, any> = { izipay: CreditCard, coins: Coins, transfer: Building2, crypto_manual: Globe, whatsapp: MessageCircle };
const COLORES: Record<string, string> = { izipay: "bg-blis-red/10 border-blis-red/20 text-blis-red", coins: "bg-amber-500/10 border-amber-500/20 text-amber-400", transfer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", crypto_manual: "bg-orange-500/10 border-orange-500/20 text-orange-400", whatsapp: "bg-green-500/10 border-green-500/20 text-green-400" };

export default function FormasPagoAdminPage() {
    const { showToast } = useToast();
    const [formas, setFormas] = useState<FormaPago[]>([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [expandedPais, setExpandedPais] = useState<Record<string, boolean>>({});

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/formas-pago");
            const d = await res.json();
            if (d.success && d.formas) setFormas(d.formas || []);
            else if (d.error) showToast(`Error: ${d.error}`, "error");
        } catch { showToast("Error al cargar formas de pago", "error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { cargar(); }, []);

    const toggleActivo = async (forma: FormaPago) => {
        setGuardando(forma.id);
        await fetch("/api/admin/formas-pago", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: forma.id, activo: !forma.activo }) });
        setFormas(prev => prev.map(f => f.id === forma.id ? { ...f, activo: !f.activo } : f));
        showToast(`${forma.nombre} ${forma.activo ? 'desactivado' : 'activado'}`, "success");
        setGuardando(null);
    };

    const guardarConfig = async (forma: FormaPago) => {
        setGuardando(forma.id);
        await fetch("/api/admin/formas-pago", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: forma.id, config: forma.config }) });
        showToast(`Configuración de ${forma.nombre} guardada`, "success");
        setGuardando(null);
    };

    const moverOrden = async (forma: FormaPago, dir: number) => {
        const idx = formas.findIndex(f => f.id === forma.id);
        const other = formas[idx + dir];
        if (!other) return;
        const a = forma.orden, b = other.orden;
        await Promise.all([
            fetch("/api/admin/formas-pago", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: forma.id, orden: b }) }),
            fetch("/api/admin/formas-pago", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: other.id, orden: a }) }),
        ]);
        cargar();
    };

    // ── Helpers países / bancos ──
    const getCountries = (forma: FormaPago): Record<string, Country> => forma.config?.countries || {};
    const updateForma = (formaId: string, config: Record<string, any>) => {
        setFormas(prev => prev.map(f => f.id === formaId ? { ...f, config: { ...f.config, ...config } } : f));
    };
    const addCountry = (formaId: string) => {
        const key = prompt("Código del país (ej: peru, usa, mexico):")?.toLowerCase();
        if (!key) return;
        updateForma(formaId, { countries: { ...getCountries(formas.find(f => f.id === formaId)!), [key]: { label: key.charAt(0).toUpperCase() + key.slice(1), flag: "🏳️", banks: [] } } });
        setExpandedPais(prev => ({ ...prev, [`${formaId}-${key}`]: true }));
    };
    const removeCountry = (formaId: string, key: string) => {
        if (!confirm("¿Eliminar este país y todos sus bancos?")) return;
        const c = { ...getCountries(formas.find(f => f.id === formaId)!) }; delete c[key];
        updateForma(formaId, { countries: c });
    };
    const updateCountryField = (formaId: string, key: string, field: string, value: string) => {
        const c = { ...getCountries(formas.find(f => f.id === formaId)!) }; c[key] = { ...c[key], [field]: value };
        updateForma(formaId, { countries: c });
    };
    const addBank = (formaId: string, countryKey: string) => {
        const c = { ...getCountries(formas.find(f => f.id === formaId)!) };
        c[countryKey].banks = [...(c[countryKey].banks || []), { name: "", account_number: "", account_holder: "", cci: "", currency: "PEN", account_type: "ahorros" }];
        updateForma(formaId, { countries: c });
    };
    const removeBank = (formaId: string, countryKey: string, idx: number) => {
        const c = { ...getCountries(formas.find(f => f.id === formaId)!) };
        c[countryKey].banks = c[countryKey].banks.filter((_: any, i: number) => i !== idx);
        updateForma(formaId, { countries: c });
    };
    const updateBankField = (formaId: string, countryKey: string, idx: number, field: string, value: string) => {
        const c = { ...getCountries(formas.find(f => f.id === formaId)!) };
        c[countryKey].banks[idx] = { ...c[countryKey].banks[idx], [field]: value };
        updateForma(formaId, { countries: c });
    };

    // ── Helpers wallets ──
    const getWallets = (forma: FormaPago): Wallet[] => forma.config?.wallets || [];
    const updateWallet = (formaId: string, idx: number, field: string, value: string) => {
        const w = [...getWallets(formas.find(f => f.id === formaId)!)];
        w[idx] = { ...w[idx], [field]: value };
        updateForma(formaId, { wallets: w });
    };
    const addWallet = (formaId: string) => {
        const w = [...getWallets(formas.find(f => f.id === formaId)!), { label: "", address: "", network: "", qr_url: "", holder: "" }];
        updateForma(formaId, { wallets: w });
    };
    const updateSimple = (formaId: string, key: string, value: string) => { updateForma(formaId, { [key]: value }); };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Formas de Pago</h1>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">Activa, desactiva, ordena y configura los métodos de pago</p>
                    </div>
                </div>
                {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blis-red" /></div> : (
                    <div className="space-y-4">
                        {formas.map((forma, i) => {
                            const Icon = ICONOS[forma.slug] || Settings;
                            const colorClass = COLORES[forma.slug] || "bg-gray-500/10 border-gray-500/20 text-gray-400";
                            const countries = getCountries(forma);
                            const wallets = getWallets(forma);
                            const countryKeys = Object.keys(countries);
                            const isExpanded = expanded === forma.id;

                            return (
                                <div key={forma.id} className={`bg-zinc-900/50 border rounded-2xl p-4 sm:p-6 transition-all overflow-hidden ${forma.activo ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                                    {/* Header + Toggle + Reorder */}
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="flex flex-col gap-0.5 mr-2">
                                            <button onClick={() => moverOrden(forma, -1)} disabled={i === 0} className="p-0.5 hover:text-white text-gray-600 disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                                            <button onClick={() => moverOrden(forma, 1)} disabled={i === formas.length - 1} className="p-0.5 hover:text-white text-gray-600 disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                                        </div>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border flex-shrink-0 ${colorClass}`}><Icon className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-base sm:text-lg font-black text-white truncate">{forma.nombre}</h3>
                                                    <Badge className={forma.activo ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]" : "bg-red-500/10 text-red-400 border-red-500/20 text-[9px]"}>{forma.activo ? "Activo" : "Inactivo"}</Badge>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-400 truncate">{forma.descripcion}</p>
                                            </div>
                                        </div>
                                        <Button onClick={() => toggleActivo(forma)} disabled={guardando === forma.id} variant="ghost" className={`text-xs flex-shrink-0 ${forma.activo ? 'text-emerald-400' : 'text-gray-600'}`}>
                                            {guardando === forma.id ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : forma.activo ? <ToggleRight className="w-8 h-8 sm:w-10 sm:h-10" /> : <ToggleLeft className="w-8 h-8 sm:w-10 sm:h-10" />}
                                        </Button>
                                    </div>

                                    {forma.activo && (
                                        <>
                                            {/* ── Botón Configurar ── */}
                                            <div className="ml-10 sm:ml-16 mt-3">
                                                <Button variant="ghost" size="sm" onClick={() => setExpanded(isExpanded ? null : forma.id)} className="text-xs text-gray-500">
                                                    <Settings className="w-4 h-4 mr-1" /> {isExpanded ? 'Ocultar Configuración' : 'Configurar'}
                                                </Button>
                                            </div>

                                            {/* ── SECCIÓN EXPANDIBLE ── */}
                                            {isExpanded && (
                                                <div className="ml-4 sm:ml-16 mt-4 space-y-3 border-t border-white/5 pt-4">
                                                    {/* WhatsApp + Instrucciones (transfer + crypto) */}
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

                                                    {/* ── PAÍSES + BANCOS (Transferencia) ── */}
                                                    {forma.slug === 'transfer' && (
                                                        <div className="space-y-3">
                                                            {countryKeys.length > 0 && (
                                                                <div className="space-y-3">
                                                                    {countryKeys.map(key => {
                                                                        const c = countries[key];
                                                                        const paisExpanded = expandedPais[`${forma.id}-${key}`];
                                                                        return (
                                                                            <div key={key} className="bg-black/30 border border-white/5 rounded-xl p-3 sm:p-4">
                                                                                <div className="flex items-center justify-between mb-3">
                                                                                    <button onClick={() => setExpandedPais(prev => ({ ...prev, [`${forma.id}-${key}`]: !paisExpanded }))} className="flex items-center gap-2 text-white font-bold text-sm">
                                                                                        {paisExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                                                        <span className="text-lg">{c.flag || "🏳️"}</span>
                                                                                        <span className="truncate">{c.label || key}</span>
                                                                                        <span className="text-[10px] text-gray-600 hidden sm:inline">{c.banks?.length || 0} bancos</span>
                                                                                    </button>
                                                                                    <button onClick={() => removeCountry(forma.id, key)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                                </div>
                                                                                {paisExpanded && (
                                                                                    <div className="pt-3 space-y-3 border-t border-white/5">
                                                                                        <div className="grid grid-cols-2 gap-2">
                                                                                            <div><label className="text-[9px] text-gray-600 block mb-0.5">Nombre</label><Input value={c.label} onChange={e => updateCountryField(forma.id, key, 'label', e.target.value)} className="bg-white/5 border-white/10 text-white text-[10px] h-8" /></div>
                                                                                            <div><label className="text-[9px] text-gray-600 block mb-0.5">Símbolo</label><Input value={c.flag} onChange={e => updateCountryField(forma.id, key, 'flag', e.target.value)} className="bg-white/5 border-white/10 text-white text-[10px] h-8" /></div>
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                            {(c.banks || []).map((bank: Bank, idx: number) => (
                                                                                                <div key={idx} className="bg-black/20 border border-white/5 rounded-lg p-2 sm:p-3">
                                                                                                    <div className="flex justify-between items-center mb-2">
                                                                                                        <span className="text-[10px] text-gray-500 font-bold">Banco #{idx + 1}</span>
                                                                                                        <button onClick={() => removeBank(forma.id, key, idx)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                                                                                                    </div>
                                                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                                                        {['name','account_number','account_holder','cci'].map(field => {
                                                                                                            const labels: Record<string,string> = { name:'Banco', account_number:'N° Cuenta', account_holder:'Titular', cci:'CCI' };
                                                                                                            return <div key={field}><label className="text-[9px] text-gray-600 block mb-0.5">{labels[field]}</label><Input value={(bank as any)[field]} onChange={e => updateBankField(forma.id, key, idx, field, e.target.value)} className="bg-white/5 border-white/10 text-white text-[10px] h-7 font-mono" /></div>;
                                                                                                        })}
                                                                                                        <div>
                                                                                                            <label className="text-[9px] text-gray-600 block mb-0.5">Tipo</label>
                                            <NativeSelect value={bank.account_type} onChange={v => updateBankField(forma.id, key, idx, 'account_type', v)} options={[{ value: 'ahorros', label: 'Ahorros' }, { value: 'corriente', label: 'Corriente' }]} className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-[10px] text-white h-7" />
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <label className="text-[9px] text-gray-600 block mb-0.5">Moneda</label>
                                            <NativeSelect value={bank.currency} onChange={v => updateBankField(forma.id, key, idx, 'currency', v)} options={[{ value: 'PEN', label: 'S/' }, { value: 'USD', label: '$' }]} className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-[10px] text-white h-7" />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}
                                                                                            <Button size="sm" variant="outline" onClick={() => addBank(forma.id, key)} className="text-[10px] border-white/10 text-gray-400 hover:text-white w-full h-8"><Plus className="w-3 h-3 mr-1" /> Agregar Banco</Button>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                            <Button size="sm" variant="outline" onClick={() => addCountry(forma.id)} className="text-[10px] border-white/10 text-gray-400 hover:text-white w-full"><Plus className="w-3 h-3 mr-1" /> Agregar País</Button>
                                                        </div>
                                                    )}

                                                    {/* ── WALLETS (Crypto Manual) ── */}
                                                    {forma.slug === 'crypto_manual' && (
                                                        <div className="space-y-3">
                                                            {wallets.map((w: Wallet, idx: number) => (
                                                                <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2">
                                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                                        <div className="w-full sm:w-32"><Input value={w.label} onChange={e => updateWallet(forma.id, idx, 'label', e.target.value)} placeholder="Red (USDT TRC20)" className="bg-white/5 border-white/10 text-white text-[10px] h-7" /></div>
                                                                        <Input value={w.address} onChange={e => updateWallet(forma.id, idx, 'address', e.target.value)} placeholder="Dirección de wallet" className="bg-white/5 border-white/10 text-white text-[10px] flex-1 h-7 font-mono" />
                                                                    </div>
                                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                                        <div className="w-full sm:w-32"><Input value={w.holder || ""} onChange={e => updateWallet(forma.id, idx, 'holder', e.target.value)} placeholder="Titular" className="bg-white/5 border-white/10 text-white text-[10px] h-7" /></div>
                                                                        <div className="flex-1"><Input value={w.qr_url || ""} onChange={e => updateWallet(forma.id, idx, 'qr_url', e.target.value)} placeholder="URL del QR" className="bg-white/5 border-white/10 text-white text-[10px] h-7" /></div>
                                                                        <div className="flex-shrink-0">
                                                                            <label className="cursor-pointer px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-1"><span className="hidden sm:inline">📷</span> Subir QR
                                                                                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                                                    const file = e.target.files?.[0]; if (!file) return;
                                                                                    setGuardando(forma.id);
                                                                                    try {
                                                                                        const fd = new FormData(); fd.append("file", file);
                                                                                        const res = await fetch("/api/admin/biblioteca/upload", { method: "POST", body: fd });
                                                                                        const d = await res.json();
                                                                                        if (d.success) { updateWallet(forma.id, idx, 'qr_url', d.url); showToast("QR subido", "success"); }
                                                                                        else showToast(d.error || "Error", "error");
                                                                                    } catch { showToast("Error al subir QR", "error"); }
                                                                                    setGuardando(null);
                                                                                }} />
                                                                            </label>
                                                                        </div>
                                                                        {w.qr_url && <img src={w.qr_url} alt="QR" className="w-8 h-8 rounded-lg object-cover border border-white/10 flex-shrink-0" />}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <Button size="sm" variant="outline" onClick={() => addWallet(forma.id)} className="text-[10px] border-white/10 text-gray-400 hover:text-white w-full h-8"><Plus className="w-3 h-3 mr-1" /> {wallets.length === 0 ? 'Agregar Wallet' : 'Agregar otra Wallet'}</Button>
                                                        </div>
                                                    )}

                                                    {/* Izipay — configurado en API Nube */}
                                                    {forma.slug === 'izipay' && (
                                                        <div className="p-3 bg-blis-red/5 border border-blis-red/10 rounded-xl">
                                                            <p className="text-xs text-gray-400">
                                                                Las credenciales de Izipay se gestionan en <span className="text-white font-bold">API Nube</span> → Pagos Perú → Izipay.
                                                            </p>
                                                        </div>
                                                    )}
                                                    {forma.slug === 'coins' && (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <Input value={forma.config?.rate || "10"} onChange={e => updateSimple(forma.id, 'rate', e.target.value)} type="number" placeholder="Tasa (1 USD = X BLIS)" className="bg-white/5 border-white/10 text-white text-sm" />
                                                            <Input value={forma.config?.min_coins || "0"} onChange={e => updateSimple(forma.id, 'min_coins', e.target.value)} type="number" placeholder="Mínimo BLISCOINS" className="bg-white/5 border-white/10 text-white text-sm" />
                                                        </div>
                                                    )}

                                                    {/* ── WHATSAPP ── */}
                                                    {forma.slug === 'whatsapp' && (
                                                        <div className="space-y-3">
                                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Modo de asignación</label>
                                                <NativeSelect
                                                    value={forma.config?.modo_asignacion || 'manual'}
                                                    onChange={v => updateSimple(forma.id, 'modo_asignacion', v)}
                                                    options={[
                                                        { value: 'manual', label: 'Manual — El cliente elige' },
                                                        { value: 'auto', label: 'Auto — Si solo hay 1, se autoasigna' },
                                                        { value: 'round_robin', label: 'Round Robin — Distribución equitativa' },
                                                    ]}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Asesores WhatsApp (ficticios)</label>
                                                                <div className="space-y-2">
                                                                    {(forma.config?.asesores_whatsapp || []).map((a: any, idx: number) => (
                                                                        <div key={idx} className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-2">
                                                                            <div className="flex items-center gap-3">
                                                                                {a.foto_url ? (
                                                                                    <img src={a.foto_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/10" />
                                                                                ) : (
                                                                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                                                        <img src="/icons/brands/whatsapp.svg" className="w-5 h-5" alt="" />
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                                                    <Input value={a.nombre || ''} onChange={e => {
                                                                                        const list = [...(forma.config?.asesores_whatsapp || [])]
                                                                                        list[idx] = { ...list[idx], nombre: e.target.value }
                                                                                        updateForma(forma.id, { asesores_whatsapp: list })
                                                                                    }} placeholder="Nombre" className="bg-white/5 border-white/10 text-white text-[10px] h-7" />
                                                                                    <Input value={a.telefono || ''} onChange={e => {
                                                                                        const list = [...(forma.config?.asesores_whatsapp || [])]
                                                                                        list[idx] = { ...list[idx], telefono: e.target.value }
                                                                                        updateForma(forma.id, { asesores_whatsapp: list })
                                                                                    }} placeholder="+51 999 888 777" className="bg-white/5 border-white/10 text-white text-[10px] h-7" />
                                                                                </div>
                                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                                    <label className="cursor-pointer px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-1">
                                                                                        📷
                                                                                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                                                            const file = e.target.files?.[0]; if (!file) return;
                                                                                            setGuardando(forma.id);
                                                                                            try {
                                                                                                const fd = new FormData(); fd.append("file", file);
                                                                                                const res = await fetch("/api/admin/biblioteca/upload", { method: "POST", body: fd });
                                                                                                const d = await res.json();
                                                                                                if (d.success) {
                                                                                                    const list = [...(forma.config?.asesores_whatsapp || [])]
                                                                                                    list[idx] = { ...list[idx], foto_url: d.url }
                                                                                                    updateForma(forma.id, { asesores_whatsapp: list })
                                                                                                }
                                                                                            } catch {}
                                                                                            setGuardando(null);
                                                                                        }} />
                                                                                    </label>
                                                                                    <button onClick={() => {
                                                                                        const list = (forma.config?.asesores_whatsapp || []).filter((_: any, i: number) => i !== idx)
                                                                                        updateForma(forma.id, { asesores_whatsapp: list })
                                                                                    }} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <Button size="sm" variant="outline" onClick={() => {
                                                                        const list = [...(forma.config?.asesores_whatsapp || []), { id: Math.random().toString(36).substring(2, 10), nombre: '', telefono: '', foto_url: '' }]
                                                                        updateForma(forma.id, { asesores_whatsapp: list })
                                                                    }} className="text-[10px] border-white/10 text-gray-400 hover:text-white w-full h-8">
                                                                        <Plus className="w-3 h-3 mr-1" /> Agregar Asesor
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Costo de procesamiento */}
                                                    <div className="border-t border-white/5 pt-3 mt-2">
                                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Costo de procesamiento</p>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                            <NativeSelect value={forma.config?.processing_fee_type || ''}
                                                                onChange={v => updateSimple(forma.id, 'processing_fee_type', v)}
                                                                options={[
                                                                    { value: 'fixed', label: 'Fijo ($)' },
                                                                    { value: 'percentage', label: '%' },
                                                                ]}
                                                                placeholder="Sin costo"
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white col-span-1" />
                                                            <Input value={forma.config?.processing_fee_value || ''}
                                                                onChange={e => updateSimple(forma.id, 'processing_fee_value', e.target.value)}
                                                                type="number" step="0.01" placeholder="Valor"
                                                                className="bg-white/5 border-white/10 text-white text-xs col-span-1" />
                                                            <Input value={forma.config?.processing_fee_label || ''}
                                                                onChange={e => updateSimple(forma.id, 'processing_fee_label', e.target.value)}
                                                                placeholder="Etiqueta" maxLength={25}
                                                                className="bg-white/5 border-white/10 text-white text-xs col-span-2"
                                                                title="Ej: Costo de procesamiento" />
                                                        </div>
                                                    </div>

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
