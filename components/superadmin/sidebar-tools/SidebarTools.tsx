"use client";

import React, { useState, useEffect } from 'react';
import {
    Calculator as CalcIcon,
    Table as TableIcon,
    MessageSquare,
    Percent,
    Timer,
    Scale,
    Coins,
    Search,
    ChevronRight,
    ChevronDown,
    Sparkles,
    Globe,
    Variable,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TOOL_INDEX } from './tool-index';
import { CompactAIStatus } from './CompactAIStatus';
import { SmartAITool } from './SmartAITool';
import { CalculatorSuite } from './CalculatorSuite';
import { IgvTool } from './IgvTool';
import { CurrencyConverter } from './CurrencyConverter';
import { TaskTimer } from './TaskTimer';
import { UnitConverter } from './UnitConverter';
import { MiniSpreadsheet } from './MiniSpreadsheet';
import { FormulaCalc } from './FormulaCalc';
import { NoteTool } from './NoteTool';

export const SidebarTools = () => {
    const [activeTool, setActiveTool] = useState<string>('calc');
    const [selectedCountry, setSelectedCountry] = useState('Perú');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCats, setExpandedCats] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const handleOpenTool = (e: any) => {
            if (e.detail) {
                setActiveTool(e.detail);
                setIsCollapsed(false);
            }
        };
        window.addEventListener('open-blis-tool', handleOpenTool);
        return () => window.removeEventListener('open-blis-tool', handleOpenTool);
    }, []);

    const toggleCat = (cat: string) => {
        if (isCollapsed) setIsCollapsed(false);
        setExpandedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    };

    const favorites = [
        { id: 'calc', name: 'Calculadora IA', icon: CalcIcon, component: <CalculatorSuite />, cat: 'Favoritos' },
        { id: 'igv', name: 'Impuestos IA', icon: Percent, component: <IgvTool />, cat: 'Favoritos' },
        { id: 'currency', name: 'Divisas IA', icon: Coins, component: <CurrencyConverter />, cat: 'Favoritos' },
        { id: 'timer', name: 'Productividad', icon: Timer, component: <TaskTimer />, cat: 'Favoritos' },
        { id: 'unit', name: 'Metodología', icon: Scale, component: <UnitConverter />, cat: 'Favoritos' },
        { id: 'excel', name: 'Análisis Matriz', icon: TableIcon, component: <MiniSpreadsheet />, cat: 'Favoritos' },
        { id: 'formulas', name: 'Inteligencia', icon: Variable, component: <FormulaCalc />, cat: 'Favoritos' },
        { id: 'wa', name: 'Enlace Rápido', icon: MessageSquare, component: <NoteTool />, cat: 'Favoritos' },
    ];

    const allCategories = ['Favoritos', 'Finanzas', 'Logística', 'Oficina', 'Marketing', 'Técnico', 'Multimedia'];

    const filteredTools = TOOL_INDEX.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const regionalLinks: Record<string, { name: string, url: string }[]> = {
        'Perú': [
            { name: 'SUNAT', url: 'https://www.sunat.gob.pe/' },
            { name: 'RUC / Datos', url: 'https://e-consultaruc.sunat.gob.pe/' },
            { name: 'Dólar Hoy', url: 'https://cuantoestaeldolar.pe/' },
            { name: 'Gobierno', url: 'https://www.gob.pe/' },
            { name: 'Indecopi', url: 'https://www.gob.pe/indecopi' },
            { name: 'VUCE', url: 'https://www.vuce.gob.pe/' }
        ],
        'Ecuador': [
            { name: 'SRI', url: 'https://www.sri.gob.ec/' },
            { name: 'Gob Ecuador', url: 'https://www.gob.ec/' },
            { name: 'Aduana', url: 'https://www.aduana.gob.ec/' },
            { name: 'Defensa', url: 'https://www.defensadelconsumidor.gob.ec/' }
        ],
        'Chile': [
            { name: 'SII Chile', url: 'https://www.sii.cl/' },
            { name: 'SERNAC', url: 'https://www.sernac.cl/' },
            { name: 'Aduanas', url: 'https://www.aduna.cl/' },
            { name: 'Trámites', url: 'https://www.chileatiende.gob.cl/' }
        ],
        'Colombia': [
            { name: 'DIAN', url: 'https://www.dian.gov.co/' },
            { name: 'SIC', url: 'https://www.sic.gov.co/' },
            { name: 'MUISCA', url: 'https://muisca.dian.gov.co/' }
        ],
        'Internacional': [
            { name: 'OMC', url: 'https://www.wto.org/' },
            { name: 'FedEx', url: 'https://www.fedex.com/tracking' },
            { name: 'DHL', url: 'https://www.dhl.com/' },
            { name: 'Alibaba', url: 'https://www.alibaba.com/' }
        ]
    };

    return (
        <div className="flex bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden h-full shadow-2xl relative">
            <motion.div
                animate={{ width: isCollapsed ? 64 : 220 }}
                className="border-r border-white/5 bg-zinc-950/60 flex flex-col shrink-0 relative transition-all duration-300 ease-in-out"
            >
                <CompactAIStatus isCollapsed={isCollapsed} />

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-10 w-6 h-6 bg-blis-red rounded-full flex items-center justify-center text-white shadow-lg shadow-blis-red/20 z-50 hover:scale-110 transition-transform"
                >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 rotate-180" />}
                </button>

                <div className="p-4 border-b border-white/5 bg-black/40 group overflow-hidden">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={isCollapsed ? "" : "Buscar (IA)..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-zinc-900/50 border border-white/10 rounded-xl text-[10px] font-black text-white placeholder:text-zinc-600 outline-none focus:border-blis-red/40 transition-all font-outfit
                                ${isCollapsed ? 'p-2 w-8 h-8' : 'p-2 pl-8'}
                            `}
                        />
                        <Search className={`absolute transition-all text-zinc-600 group-hover:text-blis-red
                            ${isCollapsed ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4' : 'left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5'}
                        `} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar scrollbar-hide overflow-x-hidden">
                    {searchQuery && !isCollapsed ? (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                            <span className="px-3 py-2 text-[7px] font-black text-zinc-700 uppercase tracking-widest block">Inteligencia Detectada</span>
                            {filteredTools.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { setActiveTool(t.id); setSearchQuery(''); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left group"
                                >
                                    <t.icon className="w-4 h-4 shrink-0 text-zinc-700 group-hover:text-blis-red" />
                                    <div className="truncate">
                                        <div className="text-[9px] font-black uppercase truncate">{t.name}</div>
                                        <span className="text-[6px] text-blis-red font-black uppercase tracking-tighter">AI READY</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        allCategories.map(cat => (
                            <div key={cat} className="space-y-0.5">
                                {!isCollapsed && (
                                    <button
                                        onClick={() => toggleCat(cat)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] hover:text-zinc-500 transition-colors group"
                                    >
                                        <span>{cat}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedCats.includes(cat) ? 'rotate-180' : ''}`} />
                                    </button>
                                )}

                                <AnimatePresence>
                                    {(expandedCats.includes(cat) || isCollapsed) && (
                                        <motion.div
                                            initial={isCollapsed ? { opacity: 1 } : { height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden space-y-0.5"
                                        >
                                            {(cat === 'Favoritos' ? favorites : TOOL_INDEX.filter(t => t.cat === cat)).map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setActiveTool(t.id)}
                                                    title={isCollapsed ? t.name : ""}
                                                    className={`w-full flex items-center rounded-xl transition-all group relative
                                                        ${isCollapsed ? 'justify-center py-4' : 'gap-4 px-4 py-3'}
                                                        ${activeTool === t.id
                                                            ? 'bg-white/5 text-white'
                                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]'}
                                                    `}
                                                >
                                                    <t.icon className={`transition-transform flex-shrink-0
                                                        ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}
                                                        ${activeTool === t.id ? 'text-blis-red scale-110' : 'text-zinc-800 group-hover:text-zinc-500'}
                                                    `} />
                                                    {!isCollapsed && (
                                                        <span className="text-[10px] font-black uppercase tracking-[0.1em] truncate">{t.name}</span>
                                                    )}
                                                    {activeTool === t.id && (
                                                        <motion.div layoutId="sidebar-active" className="absolute left-0 top-1 bottom-1 w-0.5 bg-blis-red rounded-full shadow-[0_0_8px_rgba(230,0,50,0.4)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-white/5 space-y-3 bg-black/20 overflow-hidden">
                    <div className="relative">
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className={`w-full bg-zinc-900/80 border border-white/5 rounded-xl font-black text-zinc-500 outline-none appearance-none cursor-pointer hover:bg-zinc-800 transition-all
                                ${isCollapsed ? 'h-8 w-8 text-[0px] p-0' : 'p-2 text-[9px]'}
                            `}
                        >
                            {Object.keys(regionalLinks).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {!isCollapsed && <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 w-2.5 h-2.5 text-zinc-700 pointer-events-none" />}
                        {isCollapsed && <Globe className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />}
                    </div>
                </div>
            </motion.div>

            <div className="flex-1 overflow-hidden flex flex-col items-center bg-[radial-gradient(circle_at_top_right,rgba(230,0,50,0.02),transparent)] relative">

                <div className="flex-1 w-full overflow-y-auto p-12 pb-24 flex flex-col items-center custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTool}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="w-full max-w-6xl mx-auto flex items-center justify-center"
                        >
                            {(() => {
                                const staticTool = favorites.find(t => t.id === activeTool);
                                if (staticTool) return staticTool.component;

                                const registryTool = TOOL_INDEX.find(t => t.id === activeTool);
                                if (registryTool) return <SmartAITool tool={registryTool} />;

                                return (
                                    <div className="bg-zinc-950 p-12 rounded-xl border border-white/5 text-center space-y-6 max-w-md shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-blis-red/5 animate-pulse" />
                                        <Sparkles className="w-16 h-16 text-blis-red mx-auto relative z-10" />
                                        <div className="relative z-10 space-y-2">
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Motor Cognitivo</h3>
                                            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Alineando inteligencia para {activeTool}...</p>
                                            <div className="pt-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blis-red animate-bounce [animation-delay:-0.3s]" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blis-red animate-bounce [animation-delay:-0.15s]" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blis-red animate-bounce" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};