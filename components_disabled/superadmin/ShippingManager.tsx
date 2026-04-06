"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, MapPin, Zap, Settings, Trash2, ShieldCheck, ChevronRight, Briefcase, Info, Scale, ArrowRight, Clock } from 'lucide-react';

import { useShipping, ShippingZone, COUNTRY_CURRENCY_MAP } from '@/context/ShippingContext';
import { useCurrency } from '@/context/CurrencyContext';
import { createPortal } from 'react-dom';

export const ShippingManager = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
    const { shippingSettings, updateShippingSettings, previewZoneCost } = useShipping();
    const { convertAmount, selectedCurrency, safetyMarkup } = useCurrency();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const currentLocal = COUNTRY_CURRENCY_MAP[shippingSettings.selectedCountry] || { currency: 'USD', symbol: '$' };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="bg-zinc-950 border border-white/10 w-full max-w-6xl rounded-[3rem] p-1 relative z-10 shadow-2xl overflow-hidden"
                    >
                        <div className="bg-white/[0.02] flex flex-col h-[85vh]">
                            {/* Header */}
                            <div className="p-8 md:p-10 flex justify-between items-center border-b border-white/5">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em]">
                                        <Truck className="w-4 h-4" /> Inteligencia Logística Multi-País
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Centro de Operaciones de Envío</h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all group active:scale-90"
                                >
                                    <X className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide space-y-12">
                                {/* Country and Carrier Selector */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-indigo-400" /> Mercado Principal
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { code: 'PE' as const, name: 'Perú', flag: '🇵🇪' },
                                                { code: 'EC' as const, name: 'Ecuador', flag: '🇪🇨' },
                                                { code: 'MX' as const, name: 'México', flag: '🇲🇽' },
                                                { code: 'CO' as const, name: 'Colombia', flag: '🇨🇴' },
                                                { code: 'CL' as const, name: 'Chile', flag: '🇨🇱' },
                                                { code: 'AR' as const, name: 'Argentina', flag: '🇦🇷' },
                                                { code: 'ES' as const, name: 'España', flag: '🇪🇸' },
                                            ].map((country) => (
                                                <button
                                                    key={country.code}
                                                    onClick={() => updateShippingSettings({ selectedCountry: country.code, activeCarrier: 'custom' })}
                                                    className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${shippingSettings.selectedCountry === country.code ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_15px_30px_rgba(99,102,241,0.2)]' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}
                                                >
                                                    {country.flag} {country.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                            <Zap className="w-3 h-3 text-emerald-400" /> Preajustes de Operador
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'custom', name: 'Manual', icon: Settings, color: 'text-gray-400', countries: ['PE', 'EC', 'MX', 'CO', 'CL', 'AR', 'ES'] },
                                                { id: 'shalom', name: 'Shalom', icon: Truck, color: 'text-red-500', countries: ['PE'] },
                                                { id: 'olva', name: 'Olva', icon: Truck, color: 'text-blue-500', countries: ['PE'] },
                                                { id: 'servientrega', name: 'Servientrega', icon: Truck, color: 'text-green-500', countries: ['EC', 'CO'] },
                                                { id: 'estafeta', name: 'Estafeta', icon: Truck, color: 'text-yellow-500', countries: ['MX'] },
                                                { id: 'coordinadora', name: 'Coordinadora', icon: Truck, color: 'text-blue-600', countries: ['CO'] },
                                                { id: 'starken', name: 'Starken', icon: Truck, color: 'text-red-600', countries: ['CL'] },
                                                { id: 'andreani', name: 'Andreani', icon: Truck, color: 'text-orange-500', countries: ['AR'] },
                                                { id: 'correos_es', name: 'Correos ES', icon: Truck, color: 'text-yellow-400', countries: ['ES'] },
                                            ].filter(c => c.countries.includes(shippingSettings.selectedCountry)).map((carrier) => (
                                                <button
                                                    key={carrier.id}
                                                    onClick={() => {
                                                        const updates: any = { activeCarrier: carrier.id };
                                                        if (carrier.id === 'shalom') {
                                                            updates.volumetricFactor = 5000;
                                                            updates.heavyChargeFactor = 3000;
                                                            updates.documentFlatRate = 12;
                                                            updates.zones = [
                                                                { id: 's1', name: 'Lima Metropolitana', basePrice: 10, perGramPrice: 0.002, estimatedDays: '1-2', isActive: true },
                                                                { id: 's2', name: 'Provincias Principal', basePrice: 18, perGramPrice: 0.006, estimatedDays: '2-4', isActive: true },
                                                                { id: 's3', name: 'Selva / Iquitos', basePrice: 35, perGramPrice: 0.012, estimatedDays: '5-7', isActive: true },
                                                            ];
                                                        } else if (carrier.id === 'servientrega') {
                                                            const isEC = shippingSettings.selectedCountry === 'EC';
                                                            updates.volumetricFactor = 5000;
                                                            updates.documentFlatRate = isEC ? 4.5 : 12000;
                                                            updates.zones = isEC ? [
                                                                { id: 'se1', name: 'Intramunicipal', basePrice: 3.5, perGramPrice: 0.001, estimatedDays: '1', isActive: true },
                                                                { id: 'se2', name: 'Nacional Ecuador', basePrice: 6.5, perGramPrice: 0.003, estimatedDays: '1-2', isActive: true },
                                                            ] : [
                                                                { id: 'sc1', name: 'Bogotá / Local', basePrice: 9500, perGramPrice: 0.002, estimatedDays: '1', isActive: true },
                                                                { id: 'sc2', name: 'Nacional Colombia', basePrice: 14000, perGramPrice: 0.005, estimatedDays: '2-3', isActive: true },
                                                            ];
                                                        } else if (carrier.id === 'estafeta') {
                                                            updates.volumetricFactor = 5000;
                                                            updates.documentFlatRate = 120;
                                                            updates.zones = [
                                                                { id: 'm1', name: 'Local MX', basePrice: 85, perGramPrice: 0.015, estimatedDays: '1-2', isActive: true },
                                                                { id: 'm2', name: 'Nacional Express', basePrice: 175, perGramPrice: 0.035, estimatedDays: '1-2', isActive: true },
                                                            ];
                                                        } else if (carrier.id === 'coordinadora') {
                                                            updates.volumetricFactor = 4500;
                                                            updates.zones = [
                                                                { id: 'c1', name: 'Urbano Principal', basePrice: 11000, perGramPrice: 0.003, estimatedDays: '1-2', isActive: true },
                                                                { id: 'c2', name: 'Regional / Nacional', basePrice: 16500, perGramPrice: 0.006, estimatedDays: '2-4', isActive: true },
                                                            ];
                                                        } else if (carrier.id === 'starken') {
                                                            updates.volumetricFactor = 5000;
                                                            updates.zones = [
                                                                { id: 'ch1', name: 'Región Metropolitana', basePrice: 4300, perGramPrice: 0.8, estimatedDays: '1-2', isActive: true },
                                                                { id: 'ch2', name: 'Nacional General', basePrice: 6500, perGramPrice: 1.5, estimatedDays: '2-5', isActive: true },
                                                            ];
                                                        } else if (carrier.id === 'andreani') {
                                                            updates.volumetricFactor = 6000;
                                                            updates.zones = [
                                                                { id: 'a1', name: 'Buenos Aires / CABA', basePrice: 6500, perGramPrice: 1.2, estimatedDays: '1-2', isActive: true },
                                                                { id: 'a2', name: 'Nacional Argentina', basePrice: 9800, perGramPrice: 2.5, estimatedDays: '3-6', isActive: true },
                                                            ];
                                                        } else if (carrier.id === 'correos_es') {
                                                            updates.volumetricFactor = 6000;
                                                            updates.documentFlatRate = 0.82;
                                                            updates.zones = [
                                                                { id: 'e1', name: 'Local / Peninsular', basePrice: 6.5, perGramPrice: 0.002, estimatedDays: '1-2', isActive: true },
                                                                { id: 'e2', name: 'Baleares / Canarias', basePrice: 12.5, perGramPrice: 0.005, estimatedDays: '3-5', isActive: true },
                                                            ];
                                                        }
                                                        updateShippingSettings(updates);
                                                    }}
                                                    className={`px-5 py-3 rounded-2xl border transition-all flex items-center gap-3 ${shippingSettings.activeCarrier === carrier.id ? 'bg-white text-black border-white shadow-xl ring-2 ring-emerald-500/20' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                                                >
                                                    <carrier.icon className={`w-4 h-4 ${shippingSettings.activeCarrier === carrier.id ? 'text-emerald-500' : carrier.color}`} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{carrier.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                                    <div className="xl:col-span-2 space-y-6">
                                        <div className="flex justify-between items-center px-4">
                                            <div className="space-y-1">
                                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-emerald-400" /> Tarifarios por Zona ({shippingSettings.selectedCountry})
                                                </h3>
                                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Precios en {currentLocal.currency}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newZone: ShippingZone = {
                                                        id: Date.now().toString(),
                                                        name: 'Nueva Zona',
                                                        basePrice: 10,
                                                        perGramPrice: 0.005,
                                                        estimatedDays: '2-4',
                                                        isActive: true
                                                    };
                                                    updateShippingSettings({ zones: [...shippingSettings.zones, newZone] });
                                                }}
                                                className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 text-[9px] hover:text-white transition-all font-black uppercase tracking-widest"
                                            >
                                                + Zona
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {shippingSettings.zones.map((zone, idx) => (
                                                <div key={zone.id} className="bg-zinc-900/30 border border-white/5 p-6 rounded-[3rem] space-y-8 hover:bg-zinc-900/50 transition-all group relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-20" />

                                                    {/* Top Row: Meta & Identity */}
                                                    <div className="flex flex-wrap items-center justify-between gap-6">
                                                        <div className="flex items-center gap-5">
                                                            <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                                                                <button
                                                                    onClick={() => {
                                                                        if (idx === 0) return;
                                                                        const updated = [...shippingSettings.zones];
                                                                        [updated[idx], updated[idx - 1]] = [updated[idx - 1], updated[idx]];
                                                                        updateShippingSettings({ zones: updated });
                                                                    }}
                                                                    className="p-1 hover:text-emerald-400 disabled:opacity-20"
                                                                    disabled={idx === 0}
                                                                >
                                                                    <ArrowRight className="w-4 h-4 -rotate-90" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (idx === shippingSettings.zones.length - 1) return;
                                                                        const updated = [...shippingSettings.zones];
                                                                        [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
                                                                        updateShippingSettings({ zones: updated });
                                                                    }}
                                                                    className="p-1 hover:text-emerald-400 disabled:opacity-20"
                                                                    disabled={idx === shippingSettings.zones.length - 1}
                                                                >
                                                                    <ArrowRight className="w-4 h-4 rotate-90" />
                                                                </button>
                                                            </div>

                                                            <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-emerald-500 font-black text-sm shrink-0">
                                                                {idx + 1}
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                                                                    <input
                                                                        value={zone.name}
                                                                        onChange={(e) => {
                                                                            const updated = [...shippingSettings.zones];
                                                                            updated[idx].name = e.target.value;
                                                                            updateShippingSettings({ zones: updated });
                                                                        }}
                                                                        className="bg-transparent border-none text-white font-black uppercase text-sm md:text-base outline-none p-0 w-64 md:w-80 truncate"
                                                                        placeholder="Ej: LIMA METROPOLITANA"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 w-fit">
                                                                    <Clock className="w-3 h-3 text-gray-600 shrink-0" />
                                                                    <input
                                                                        value={zone.estimatedDays}
                                                                        onChange={(e) => {
                                                                            const updated = [...shippingSettings.zones];
                                                                            updated[idx].estimatedDays = e.target.value;
                                                                            updateShippingSettings({ zones: updated });
                                                                        }}
                                                                        className="bg-transparent border-none text-[8px] text-gray-500 font-bold uppercase tracking-[0.2em] outline-none p-0 w-24"
                                                                        placeholder="EST. DÍAS"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => setZoneToDelete(zone.id)}
                                                            className="p-4 bg-white/5 hover:bg-rose-500/10 text-gray-700 hover:text-rose-500 rounded-3xl transition-all active:scale-90"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    {/* Pricing Grid: Corrected and Spaced */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        {/* Base Cost Box */}
                                                        <div className="bg-black/20 rounded-[2.5rem] border border-white/5 p-4 md:p-5 space-y-4">
                                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-500 px-1">
                                                                <span>Costo Base Operador</span>
                                                                <span className="text-emerald-500">Local {currentLocal.currency}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-[1.2] min-w-0 flex items-center bg-black/40 px-4 py-3 rounded-2xl border border-white/10 focus-within:border-emerald-500/30 transition-all">
                                                                    <span className="text-[10px] font-black text-emerald-500 mr-2 tracking-tighter uppercase shrink-0">{currentLocal.currency}</span>
                                                                    <input
                                                                        type="number"
                                                                        value={zone.basePrice}
                                                                        onChange={(e) => {
                                                                            const updated = [...shippingSettings.zones];
                                                                            updated[idx].basePrice = Number(e.target.value);
                                                                            updateShippingSettings({ zones: updated });
                                                                        }}
                                                                        className="bg-transparent border-none text-white font-black text-sm w-full outline-none p-0"
                                                                    />
                                                                </div>
                                                                <ArrowRight className="w-3 h-3 text-gray-800 shrink-0" />
                                                                <div className="flex-1 min-w-0 bg-emerald-500/5 px-4 py-3 rounded-2xl border border-emerald-500/10 text-right">
                                                                    <div className="text-[6px] font-black text-emerald-400 uppercase tracking-widest mb-1 text-right">Fin {selectedCurrency.code}</div>
                                                                    <div className="text-sm font-black text-white leading-none truncate">
                                                                        {selectedCurrency.symbol}{previewZoneCost(zone.basePrice, shippingSettings.selectedCountry).toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Gram Cost Box */}
                                                        <div className="bg-black/20 rounded-[2.5rem] border border-white/5 p-4 md:p-5 space-y-4">
                                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-500 px-1">
                                                                <span>Extra x Gramo</span>
                                                                <span className="text-indigo-400">Local {currentLocal.currency}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-[1.2] min-w-0 flex items-center bg-black/40 px-4 py-3 rounded-2xl border border-white/10 focus-within:border-indigo-500/30 transition-all">
                                                                    <span className="text-[10px] font-black text-indigo-400 mr-2 tracking-tighter uppercase shrink-0">{currentLocal.currency}</span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.0001"
                                                                        value={zone.perGramPrice}
                                                                        onChange={(e) => {
                                                                            const updated = [...shippingSettings.zones];
                                                                            updated[idx].perGramPrice = Number(e.target.value);
                                                                            updateShippingSettings({ zones: updated });
                                                                        }}
                                                                        className="bg-transparent border-none text-white font-black text-sm w-full outline-none p-0"
                                                                    />
                                                                </div>
                                                                <ArrowRight className="w-3 h-3 text-gray-800 shrink-0" />
                                                                <div className="flex-1 min-w-0 bg-indigo-500/5 px-4 py-3 rounded-2xl border border-indigo-500/10 text-right">
                                                                    <div className="text-[6px] font-black text-indigo-400 uppercase tracking-widest mb-1 text-right">Fin {selectedCurrency.code}</div>
                                                                    <div className="text-sm font-black text-white leading-none truncate">
                                                                        +{selectedCurrency.symbol}{previewZoneCost(zone.perGramPrice, shippingSettings.selectedCountry).toFixed(4)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Global Logic Sidebar */}
                                    <div className="space-y-10">
                                        <div className="bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 space-y-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                                    <ShieldCheck className="w-6 h-6 text-amber-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Protección de Arbitraje</h4>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Gestión de riesgos cambiarios</p>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl space-y-4">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed text-center italic">
                                                    "Toda conversión moneda local ({currentLocal.currency}) → Tienda ({selectedCurrency.code}) se incrementa con margen de seguridad."
                                                </p>
                                                <div className="flex justify-center items-center gap-4">
                                                    <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 flex flex-col items-center">
                                                        <span className="text-[8px] font-black text-gray-500 uppercase mb-1">Margen Actual</span>
                                                        <span className="text-xl font-black text-amber-500">{(safetyMarkup * 100).toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6 pt-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tarifa Plana Documentos</label>
                                                        <span className="text-[9px] font-black text-indigo-400">{currentLocal.currency} {shippingSettings.documentFlatRate}</span>
                                                    </div>
                                                    <div className="flex items-center bg-black/40 px-4 py-3 rounded-2xl border border-white/5 focus-within:border-indigo-500/30 transition-all">
                                                        <span className="text-[8px] text-indigo-400 mr-2 font-black uppercase">{currentLocal.currency}</span>
                                                        <input
                                                            type="number"
                                                            value={shippingSettings.documentFlatRate}
                                                            onChange={(e) => updateShippingSettings({ documentFlatRate: Number(e.target.value) })}
                                                            className="bg-transparent border-none text-white font-black text-xs w-full outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex flex-col px-1 gap-1">
                                                        <label className="text-[9px] font-black text-white uppercase tracking-widest">Peso Volumétrico</label>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">(Largo * Ancho * Alto) / X</span>
                                                            <span className="text-[9px] font-black text-emerald-400">DIVISOR = {shippingSettings.volumetricFactor}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center bg-black/40 px-4 py-3 rounded-2xl border border-white/5 focus-within:border-emerald-500/30 transition-all">
                                                        <span className="text-[8px] text-emerald-400 mr-2 font-black uppercase">FACTOR</span>
                                                        <input
                                                            type="number"
                                                            value={shippingSettings.volumetricFactor}
                                                            onChange={(e) => updateShippingSettings({ volumetricFactor: Number(e.target.value) })}
                                                            className="bg-transparent border-none text-white font-black text-xs w-full outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 p-5 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                                                            <Scale className="w-5 h-5 text-gray-500" />
                                                            <span className="text-[8px] font-black text-gray-600 uppercase">Zonas</span>
                                                            <span className="text-sm font-black text-white">{shippingSettings.zones.length}</span>
                                                        </div>
                                                        <div className="flex-1 p-5 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                                                            <Briefcase className="w-5 h-5 text-gray-500" />
                                                            <span className="text-[8px] font-black text-gray-600 uppercase">Carrier</span>
                                                            <span className="text-[10px] font-black text-white uppercase">{shippingSettings.activeCarrier}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all text-gray-400 hover:text-white group"
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="flex-1 text-left text-[10px] font-black uppercase tracking-widest">
                    ENVÍOS: {shippingSettings.selectedCountry} ({shippingSettings.activeCarrier})
                </span>
            </button>
            {/* Delete Confirmation Portal */}
            {zoneToDelete && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setZoneToDelete(null)}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm relative z-10 shadow-2xl space-y-6 text-center"
                    >
                        <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-2">
                            <Trash2 className="w-8 h-8 text-rose-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">¿Eliminar Zona?</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                Esta acción eliminará la configuración de tarifas y tiempos de entrega para esta región.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setZoneToDelete(null)}
                                className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    const updated = shippingSettings.zones.filter(z => z.id !== zoneToDelete);
                                    updateShippingSettings({ zones: updated });
                                    setZoneToDelete(null);
                                }}
                                className="flex-1 px-6 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 transition-all"
                            >
                                Eliminar
                            </button>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}

            {mounted && createPortal(modalContent, document.body)}
        </div>
    );
};
