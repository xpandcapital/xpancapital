"use client";

import React, { useState, useRef, useEffect } from "react";
import { Coins, Check, Globe, Settings2, Info, X, Search, ShieldCheck, RotateCw, ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";
import { createPortal } from "react-dom";

export function CurrencyManager() {
    const {
        currencies,
        selectedCurrency,
        taxCurrency,
        activeCurrencyCodes,
        isMultiCurrencyEnabled,
        isxpandCoinsEnabled,
        setSelectedCurrency,
        setTaxCurrency,
        toggleActiveCurrency,
        setIsMultiCurrencyEnabled,
        setIsxpandCoinsEnabled,
        exchangeRates,
        safetyMarkup,
        lastUpdated,
        setSafetyMarkup,
        refreshRates,
        setActiveCurrencyCodes
    } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [taxSearchTerm, setTaxSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'settings' | 'arbitrage'>('settings');
    const [isTaxSelectorOpen, setIsTaxSelectorOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const taxRef = useRef<HTMLDivElement>(null);

    const moveCurrency = (index: number, direction: 'up' | 'down') => {
        const newCodes = [...activeCurrencyCodes];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newCodes.length) return;

        const temp = newCodes[index];
        newCodes[index] = newCodes[newIndex];
        newCodes[newIndex] = temp;

        setActiveCurrencyCodes(newCodes);
    };

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const normalizeText = (text: string) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Filter currencies based on search
    const filteredCurrencies = currencies.filter(c => {
        const search = normalizeText(searchTerm);
        return normalizeText(c.name).includes(search) || normalizeText(c.code).includes(search);
    });

    const filteredTaxCurrencies = [...currencies]
        .filter(c => {
            const search = normalizeText(taxSearchTerm);
            return normalizeText(c.name).includes(search) || normalizeText(c.code).includes(search);
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    // Sort: Selected first, then alphabet
    const sortedCurrencies = [...filteredCurrencies].sort((a, b) => {
        if (a.code === selectedCurrency.code) return -1;
        if (b.code === selectedCurrency.code) return 1;
        return a.name.localeCompare(b.name);
    });

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
                        className="bg-zinc-950 border border-white/10 w-full max-w-3xl rounded-[2.5rem] p-6 md:p-10 relative z-10 shadow-2xl space-y-8"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                                    <Globe className="w-3.5 h-3.5" /> Localización & Finanzas
                                </div>
                                <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter italic">Centro de Divisas</h3>
                            </div>

                            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5 self-end md:self-auto">
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Base
                                </button>
                                <button
                                    onClick={() => setActiveTab('arbitrage')}
                                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'arbitrage' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Arbitraje & Tasas
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 ml-2 hover:bg-white/5 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-gray-500 hover:text-white" />
                                </button>
                            </div>
                        </div>

                        {activeTab === 'settings' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Left Column: Global Settings */}
                                <div className="space-y-6">
                                    {/* Tax Currency Box */}
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-6 space-y-4 relative" ref={taxRef}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <Globe className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-white uppercase tracking-wider">Moneda Fiscal</span>
                                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none">País de Facturación</span>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <button
                                                onClick={() => setIsTaxSelectorOpen(!isTaxSelectorOpen)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-left flex items-center justify-between hover:bg-white/10 transition-all font-black text-[10px] text-emerald-500 uppercase tracking-widest"
                                            >
                                                <span className="truncate">{taxCurrency.code} - {taxCurrency.name}</span>
                                                <Search className="w-4 h-4 text-emerald-500" />
                                            </button>

                                            <AnimatePresence>
                                                {isTaxSelectorOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="absolute inset-x-0 top-0 bg-zinc-900 border border-white/20 rounded-[2rem] shadow-2xl z-[60] p-4 flex flex-col gap-3 min-h-[250px]"
                                                    >
                                                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                                                            <Search className="w-3.5 h-3.5 text-gray-500" />
                                                            <input
                                                                autoFocus
                                                                type="text"
                                                                placeholder="Buscar..."
                                                                value={taxSearchTerm}
                                                                onChange={(e) => setTaxSearchTerm(e.target.value)}
                                                                className="flex-1 bg-transparent text-[10px] text-white outline-none placeholder:text-gray-700 placeholder:uppercase"
                                                            />
                                                        </div>
                                                        <div className="overflow-y-auto custom-scrollbar flex-1 space-y-1">
                                                            {filteredTaxCurrencies.map(c => (
                                                                <button
                                                                    key={c.code}
                                                                    onClick={() => {
                                                                        setTaxCurrency(c.code);
                                                                        setIsTaxSelectorOpen(false);
                                                                    }}
                                                                    className="w-full text-left p-3 hover:bg-emerald-500/20 rounded-xl text-[10px] font-black text-gray-400 hover:text-emerald-400 transition-all flex justify-between items-center uppercase tracking-widest border border-transparent hover:border-emerald-500/20"
                                                                >
                                                                    <span className="flex items-center gap-3">
                                                                        <span className="w-6 text-center">{c.symbol}</span>
                                                                        <span>{c.code}</span>
                                                                    </span>
                                                                    {taxCurrency.code === c.code && <Check className="w-3 h-3 text-emerald-500" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Toggles Box */}
                                    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 space-y-6 shadow-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-white uppercase tracking-wider">Multi-moneda</span>
                                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Asignación por producto</span>
                                            </div>
                                            <button
                                                onClick={() => setIsMultiCurrencyEnabled(!isMultiCurrencyEnabled)}
                                                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isMultiCurrencyEnabled ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/10'}`}
                                            >
                                                <motion.div
                                                    animate={{ x: isMultiCurrencyEnabled ? 28 : 4 }}
                                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                                                />
                                            </button>
                                        </div>

                                        <div className="h-px bg-white/5" />

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Xpand Coins</span>
                                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Moneda de Recompensa</span>
                                            </div>
                                            <button
                                                onClick={() => setIsxpandCoinsEnabled(!isxpandCoinsEnabled)}
                                                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isxpandCoinsEnabled ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/10'}`}
                                            >
                                                <motion.div
                                                    animate={{ x: isxpandCoinsEnabled ? 28 : 4 }}
                                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Selection List */}
                                <div className="space-y-4 flex flex-col min-h-0">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="BUSCAR MONEDA..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs text-white placeholder:text-gray-700 placeholder:text-[9px] placeholder:font-black placeholder:uppercase focus:outline-none focus:border-emerald-500/50 transition-all font-black uppercase tracking-widest"
                                        />
                                    </div>

                                    <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
                                                MODO SELECCIÓN
                                            </span>
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded-full">
                                                {activeCurrencyCodes.length} ACTIVAS
                                            </span>
                                        </div>

                                        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 flex-1 scroll-smooth">
                                            {sortedCurrencies.map((curr) => {
                                                const isSelected = selectedCurrency.code === curr.code;
                                                const isActive = activeCurrencyCodes.includes(curr.code);

                                                return (
                                                    <div
                                                        key={curr.code}
                                                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all border ${isSelected
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.1)]'
                                                            : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={() => setSelectedCurrency(curr.code)}
                                                            className="flex items-center gap-3 flex-1 text-left"
                                                        >
                                                            <span className={`text-[11px] font-black w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isSelected ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/5 text-gray-400'}`}>
                                                                {curr.symbol}
                                                            </span>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className={`text-[11px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                                                    {curr.code}
                                                                </span>
                                                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest truncate max-w-[150px]">{curr.name}</span>
                                                            </div>
                                                        </button>

                                                        {isMultiCurrencyEnabled && (
                                                            <button
                                                                onClick={() => toggleActiveCurrency(curr.code)}
                                                                className={`p-2.5 rounded-xl border transition-all ${isActive
                                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg'
                                                                    : 'bg-white/5 border-white/5 text-gray-700 hover:text-white'
                                                                    }`}
                                                            >
                                                                <Check className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-20'}`} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Arbitrage Margin Config */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Margen de Arbitraje & Cobertura
                                    </h3>
                                    <div className="p-8 rounded-[3rem] bg-amber-500/5 border border-amber-500/10 space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="text-sm font-black text-white uppercase tracking-tighter italic">Comisión Cambista / Volatilidad</h4>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Extra aplicado a favor del negocio.</p>
                                                </div>
                                                <div className="flex items-center bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                                                    <input
                                                        type="number"
                                                        value={(safetyMarkup * 100).toFixed(1)}
                                                        onChange={(e) => setSafetyMarkup(Number(e.target.value) / 100)}
                                                        className="bg-transparent border-none text-white font-black text-lg w-12 text-right outline-none"
                                                    />
                                                    <span className="text-amber-400 font-bold ml-1">%</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={safetyMarkup * 100}
                                                onChange={(e) => setSafetyMarkup(Number(e.target.value) / 100)}
                                                className="w-full accent-amber-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                                            <p className="text-[9px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest">
                                                Este margen asegura que no pierdas dinero si el dólar sube entre el momento de la venta y tu cambio físico de moneda.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Rates List */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-1">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <RotateCw className="w-3.5 h-3.5 text-emerald-400" /> Tasas Sincronizadas (USD)
                                        </h3>
                                        <button
                                            disabled={isRefreshing}
                                            onClick={async () => {
                                                setIsRefreshing(true);
                                                await refreshRates();
                                                setTimeout(() => setIsRefreshing(false), 1000); // Hold for visual feedback
                                            }}
                                            className={`px-4 py-2 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${isRefreshing
                                                ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                                                }`}
                                        >
                                            <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                            {isRefreshing ? 'SINCRONIZANDO...' : 'ACTUALIZAR'}
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-2">
                                        {activeCurrencyCodes.filter(code => exchangeRates[code]).map((code, index) => {
                                            const rate = exchangeRates[code];
                                            return (
                                                <div
                                                    key={code}
                                                    className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5 flex items-center justify-between transition-all hover:bg-white/10 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                disabled={index === 0}
                                                                onClick={() => moveCurrency(index, 'up')}
                                                                className="p-1 hover:bg-white/10 rounded-md transition-all disabled:opacity-0"
                                                            >
                                                                <ArrowUp className="w-3 h-3 text-emerald-500" />
                                                            </button>
                                                            <button
                                                                disabled={index === activeCurrencyCodes.length - 1}
                                                                onClick={() => moveCurrency(index, 'down')}
                                                                className="p-1 hover:bg-white/10 rounded-md transition-all disabled:opacity-0"
                                                            >
                                                                <ArrowDown className="w-3 h-3 text-emerald-500" />
                                                            </button>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-xs shadow-inner">
                                                            {code}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] leading-none mb-1">Tasa Global</span>
                                                            <span className="text-base font-black italic tracking-tighter text-white">{(rate as number).toFixed(2)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] text-amber-500/60 font-black uppercase tracking-[0.1em] leading-none mb-1">+ Arbitraje ({(safetyMarkup * 100).toFixed(1)}%)</span>
                                                        <div className="flex items-baseline gap-1 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/10">
                                                            <span className="text-lg font-black italic tracking-tighter text-amber-500">{((rate as number) * (1 + safetyMarkup)).toFixed(2)}</span>
                                                            <span className="text-[9px] text-amber-600/50 font-black">{(rate as number) > 100 ? '' : code}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.3em] text-center mt-4 italic">
                                        Última sincronización: {lastUpdated?.toLocaleTimeString() || 'No sincronizado'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="lg:hidden bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
                            <Info className="w-5 h-5 text-emerald-500 shrink-0" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                                La moneda fiscal determina los reportes contables.
                            </p>
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
                    <Coins className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="flex-1 text-left text-[10px] font-black uppercase tracking-widest">
                    MONEDA {selectedCurrency.code} ({selectedCurrency.symbol})
                </span>
            </button>

            {mounted && createPortal(modalContent, document.body)}
        </div>
    );
}
