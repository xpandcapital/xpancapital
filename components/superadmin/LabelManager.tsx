"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Check, QrCode, Barcode as BarcodeIcon, Layout, Maximize2, Type } from 'lucide-react';
import { useLabel, LabelLayout, CodeType } from '@/context/LabelContext';
import { createPortal } from 'react-dom';

export const LabelManager = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { settings, updateSettings } = useLabel();

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
                        className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 relative z-10 shadow-2xl space-y-8"
                    >
                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-blis-red font-black text-[10px] uppercase tracking-widest">
                                    <Settings className="w-3 h-3" /> Configuración Global
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Etiquetas de Inventario</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Default Code Type */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <QrCode className="w-3 h-3" /> Formato Predeterminado
                                </label>
                                <div className="bg-white/5 p-1 rounded-2xl flex items-center gap-1 border border-white/5">
                                    <button
                                        onClick={() => updateSettings({ defaultType: 'qr' })}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settings.defaultType === 'qr' ? 'bg-blis-red text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        QR
                                    </button>
                                    <button
                                        onClick={() => updateSettings({ defaultType: 'barcode' })}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settings.defaultType === 'barcode' ? 'bg-blis-red text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Barras
                                    </button>
                                </div>
                            </div>

                            {/* Layout */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Layout className="w-3 h-3" /> Orientación
                                </label>
                                <div className="bg-white/5 p-1 rounded-2xl flex items-center gap-1 border border-white/5">
                                    <button
                                        onClick={() => updateSettings({ layout: 'vertical' })}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settings.layout === 'vertical' ? 'bg-blis-red text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Vertical
                                    </button>
                                    <button
                                        onClick={() => updateSettings({ layout: 'horizontal' })}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settings.layout === 'horizontal' ? 'bg-blis-red text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Horizontal
                                    </button>
                                </div>
                            </div>

                            {/* Height */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Maximize2 className="w-3 h-3" /> Altura (cm)
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {[1, 2, 3, 4, 5].map(h => (
                                        <button
                                            key={h}
                                            onClick={() => updateSettings({ heightCm: h })}
                                            className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border ${settings.heightCm === h ? 'bg-blis-red border-blis-red text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'}`}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title Lines */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Type className="w-3 h-3" /> Líneas en Título
                                </label>
                                <div className="bg-white/5 p-1 rounded-2xl flex items-center gap-1 border border-white/5">
                                    {[1, 2].map(l => (
                                        <button
                                            key={l}
                                            onClick={() => updateSettings({ titleLines: l as 1 | 2 })}
                                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settings.titleLines === l ? 'bg-blis-red text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            {l} Línea{l > 1 ? 's' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Data Selectors */}
                        <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Información en Etiqueta</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { key: 'showName', label: 'Nombre' },
                                    { key: 'showSku', label: 'SKU' },
                                    { key: 'showPrice', label: 'Precio' },
                                    { key: 'showCategory', label: 'Categoría' }
                                ].map(item => (
                                    <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                                        <div
                                            onClick={() => updateSettings({ [item.key]: !settings[item.key as keyof typeof settings] })}
                                            className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${settings[item.key as keyof typeof settings] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/5 border-white/10 group-hover:border-white/30'}`}
                                        >
                                            {settings[item.key as keyof typeof settings] && <Check className="w-3 h-3 font-black" />}
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 hover:border-emerald-500 transition-all active:scale-95"
                        >
                            Guardar configuración
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all text-gray-400 hover:text-white group"
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <BarcodeIcon className="w-5 h-5 text-blis-red" />
                </div>
                <span className="flex-1 text-left text-[10px] font-black uppercase tracking-widest">
                    Etiquetas
                </span>
            </button>

            {mounted && createPortal(modalContent, document.body)}
        </>
    );
};
