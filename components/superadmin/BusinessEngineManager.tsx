"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Boxes, Briefcase, Zap, Clock, ChevronRight } from 'lucide-react';
import { useBusinessSettings } from '@/context/BusinessSettingsContext';
import { createPortal } from 'react-dom';

export const BusinessEngineManager = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { settings, updateSettings } = useBusinessSettings();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

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
                        className="bg-zinc-950 border border-white/10 w-full max-w-4xl rounded-[3rem] p-1 relative z-10 shadow-2xl overflow-hidden"
                    >
                        <div className="bg-white/[0.02] flex flex-col h-[70vh]">
                            {/* Header */}
                            <div className="p-8 md:p-10 flex justify-between items-center border-b border-white/5">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
                                        <Zap className="w-3 h-3" /> Motor de Inteligencia v2.4
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Centro de Operación de Negocio</h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all group active:scale-90"
                                >
                                    <X className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Inventory Intelligence */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                            <Boxes className="w-3 h-3" /> Inteligencia de Stock
                                        </h3>

                                        <div
                                            className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col justify-between gap-6 group ${settings.enablePerishables ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5 opacity-60'}`}
                                            onClick={() => updateSettings({ enablePerishables: !settings.enablePerishables })}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${settings.enablePerishables ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-white/10 text-gray-500 group-hover:bg-white/20'}`}>
                                                    <Clock className="w-6 h-6" />
                                                </div>
                                                <div className={`w-10 h-6 rounded-full relative transition-all ${settings.enablePerishables ? 'bg-amber-500' : 'bg-white/10'}`}>
                                                    <motion.div animate={{ x: settings.enablePerishables ? 20 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Perecibles e Insumos</h3>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Alertas de caducidad, gestión de descartes y lotes críticos.</p>
                                            </div>
                                        </div>

                                        <div
                                            className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col justify-between gap-6 group ${settings.enableSerialization ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5 opacity-60'}`}
                                            onClick={() => updateSettings({ enableSerialization: !settings.enableSerialization })}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${settings.enableSerialization ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/10 text-gray-500 group-hover:bg-white/20'}`}>
                                                    <Zap className="w-6 h-6" />
                                                </div>
                                                <div className={`w-10 h-6 rounded-full relative transition-all ${settings.enableSerialization ? 'bg-indigo-500' : 'bg-white/10'}`}>
                                                    <motion.div animate={{ x: settings.enableSerialization ? 20 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Serialización Única</h3>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Asignación de UIDs a nivel de unidad para trazabilidad total.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Strategy */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                            <Briefcase className="w-3 h-3 text-indigo-400" /> Estrategia de Negocio
                                        </h3>
                                        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Modelo de Transacción Predominante</p>
                                            <div className="flex flex-col gap-3">
                                                {(['physical', 'digital', 'mixed'] as const).map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => updateSettings({ businessType: type })}
                                                        className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-4 ${settings.businessType === type ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'}`}
                                                    >
                                                        <span className="text-lg">{type === 'physical' ? '📦' : type === 'digital' ? '⚡' : '🔄'}</span>
                                                        <span className="flex-1 text-left">{type === 'physical' ? 'Solo Físico' : type === 'digital' ? 'Solo Digital' : 'Modelo Híbrido'}</span>
                                                        {settings.businessType === type && <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />}
                                                    </button>
                                                ))}
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
                    <Zap className="w-5 h-5 text-indigo-500" />
                </div>
                <span className="flex-1 text-left text-[10px] font-black uppercase tracking-widest">
                    MOTOR: {settings.enablePerishables ? 'PERECIBLES' : ''} {settings.enableSerialization ? 'SERIAL' : ''} {!settings.enablePerishables && !settings.enableSerialization ? 'BÁSICO' : ''}
                </span>
            </button>
            {mounted && createPortal(modalContent, document.body)}
        </div>
    );
};
