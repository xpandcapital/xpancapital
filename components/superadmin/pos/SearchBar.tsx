"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, Plus } from 'lucide-react';
import { stripHtml } from '@/lib/strip-html';

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    filteredSearchProducts: any[];
    handleQuickAdd: (p: any) => void;
    currency: string;
    searchRef: React.RefObject<HTMLInputElement | null>;
    transactionType: string;
    total: number;
}

export function SearchBar({
    searchQuery,
    setSearchQuery,
    filteredSearchProducts,
    handleQuickAdd,
    currency,
    searchRef,
    transactionType,
    total,
}: SearchBarProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center relative z-[100]">
            <div className="flex-1 flex items-center gap-2 lg:gap-4 bg-zinc-950 border-2 border-white/5 rounded-2xl lg:rounded-[2rem] p-2 lg:p-3 focus-within:border-blis-red/50 transition-all shadow-2xl">
                <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
                    <ScanLine className="w-4 h-4 lg:w-6 lg:h-6 text-blis-red" />
                </div>
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="ESCANEE O BUSQUE..."
                    className="flex-1 bg-transparent text-sm lg:text-lg font-black uppercase tracking-tighter outline-none placeholder:text-zinc-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="hidden sm:block px-5 py-2 rounded-xl bg-zinc-900/50 text-[9px] font-black text-gray-500 uppercase tracking-widest border border-white/5">
                    F1 - BUSCAR
                </div>
            </div>

            <div className="bg-emerald-600 px-6 lg:px-10 py-2 lg:py-3 rounded-2xl lg:rounded-[2rem] shadow-[0_15px_30px_rgba(5,150,105,0.3)] border border-white/10 shrink-0 flex flex-col items-center justify-center">
                <div className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-0.5">Total {transactionType}</div>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm lg:text-xl font-black text-white/60">{currency}</span>
                    <span className="text-2xl lg:text-5xl font-black text-white tracking-tighter leading-none">{(total || 0).toLocaleString()}</span>
                </div>
            </div>

            <AnimatePresence>
                {searchQuery && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 lg:left-4 lg:right-[220px] mt-2 bg-zinc-900 border border-white/10 rounded-2xl lg:rounded-[2.5rem] shadow-3xl overflow-hidden z-[110]"
                    >
                        {(filteredSearchProducts || []).length > 0 ? (
                            filteredSearchProducts.map((p: any) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleQuickAdd(p)}
                                    className="w-full flex items-center gap-6 p-5 hover:bg-white/[0.03] text-left border-b border-white/[0.02] last:border-0 group transition-all"
                                >
                                    <div className="w-14 h-14 bg-black rounded-xl overflow-hidden shrink-0">
                                        <img src={p.imagen_principal || p.image || '/images/placeholder-product.jpg'} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[11px] font-black uppercase tracking-tighter mb-1">{stripHtml(p.nombre || p.title)}</div>
                                        <div className="flex gap-4">
                                            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">SKU: {p.id.substring(0, 8)}</span>
                                        </div>
                                    </div>
                                    <div className="text-xl font-black mr-4">{currency}{(p.precio_usd || p.price || 0).toLocaleString()}</div>
                                    <Plus className="w-5 h-5 text-blis-red opacity-0 group-hover:opacity-100 transition-all mr-2" />
                                </button>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">Sin resultados</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
