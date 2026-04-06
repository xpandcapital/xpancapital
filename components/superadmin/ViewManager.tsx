"use client";

import React, { useState, useEffect } from "react";
import { Eye, Check, X, LayoutGrid, List, Rows, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export function ViewManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [defaultView, setDefaultView] = useState<string>("rows"); // Default to List (Rows icon)

    useEffect(() => {
        setMounted(true);
        const savedView = localStorage.getItem("blis_default_view");
        if (savedView) setDefaultView(savedView);
        return () => setMounted(false);
    }, []);

    const handleSetDefault = (view: string) => {
        setDefaultView(view);
        localStorage.setItem("blis_default_view", view);
        // We could also trigger a custom event or context update if needed
    };

    const views = [
        { id: "compact", name: "Compacta", icon: List, desc: "Máxima densidad, ideal para gestión rápida." },
        { id: "list", name: "Lista Detallada", icon: Rows, desc: "Vista clásica con imágenes y estados." },
        { id: "grid", name: "Cuadrícula Visual", icon: LayoutGrid, desc: "Enfoque en fotos y diseño retail." },
    ];

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
                        className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-6 md:p-10 relative z-10 shadow-2xl space-y-8"
                    >
                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest">
                                    <Eye className="w-3.5 h-3.5" /> Visualización
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Vista Predeterminada</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {views.map((v) => {
                                const isSelected = defaultView === v.id;
                                return (
                                    <button
                                        key={v.id}
                                        onClick={() => handleSetDefault(v.id)}
                                        className={`w-full group relative flex items-center gap-4 p-5 rounded-[2rem] transition-all border ${isSelected
                                            ? 'bg-blue-500/10 border-blue-500/30'
                                            : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/5 text-gray-500 group-hover:text-blue-400'
                                            }`}>
                                            <v.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col text-left flex-1 min-w-0">
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                                {v.name}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest leading-none mt-1 truncate">
                                                {v.desc}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <div className="bg-blue-500 text-white p-1 rounded-full">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4 items-center">
                            <Info className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                                Esta configuración controla qué vista verás al cargar la sección de productos.
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
                    <Eye className="w-5 h-5 text-blue-500" />
                </div>
                <span className="flex-1 text-left text-[10px] font-black uppercase tracking-widest">
                    Vista
                </span>
            </button>

            {mounted && createPortal(modalContent, document.body)}
        </div>
    );
}
