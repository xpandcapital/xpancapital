"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Tag, Settings2, Save, Move, Hash, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSku } from "@/context/SkuContext";
import { useCategories } from "@/context/CategoryContext";
import { createPortal } from "react-dom";

export function SkuManager() {
    const { skuPatterns, addSkuPattern, deleteSkuPattern, updateSkuPattern, fetchPatterns } = useSku();
    const { categories, updateSkuPrefix } = useCategories();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrefix, setNewPrefix] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editPrefix, setEditPrefix] = useState("");

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim() && newPrefix.trim()) {
            await addSkuPattern(newName.trim(), newPrefix.trim());
            setNewName("");
            setNewPrefix("");
            await fetchPatterns(); // Force refresh
        }
    };

    const startEditing = (p: { id: string, name: string, prefix: string }) => {
        setEditingId(p.id);
        setEditName(p.name);
        setEditPrefix(p.prefix);
    };

    const saveEdit = async (id: string) => {
        if (editName.trim() && editPrefix.trim()) {
            await updateSkuPattern(id, editName.trim(), editPrefix.trim());
            await fetchPatterns(); // Force refresh
            setEditingId(null);
        }
    };

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
                        className="bg-zinc-950 border border-white/10 w-full max-w-xl rounded-[2.5rem] p-8 relative z-10 shadow-2xl space-y-8"
                    >
                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest">
                                    <Hash className="w-3.5 h-3.5" /> Inventario
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Patrones de SKU</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Left Column: Category SKUs */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.1em] flex items-center gap-2">
                                        <Tag className="w-3 h-3 text-blue-400" /> Por Categoría
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {categories.map((cat) => (
                                            <div key={cat.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 group hover:border-blue-500/30 transition-all">
                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter truncate">{cat.name}</span>
                                                {editingCatId === cat.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            autoFocus
                                                            maxLength={5}
                                                            value={editPrefix}
                                                            onChange={(e) => setEditPrefix(e.target.value.toUpperCase())}
                                                            onBlur={() => {
                                                                if (editPrefix.length >= 1) updateSkuPrefix(cat.id, editPrefix);
                                                                setEditingCatId(null);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && editPrefix.length >= 1) {
                                                                    updateSkuPrefix(cat.id, editPrefix);
                                                                    setEditingCatId(null);
                                                                }
                                                            }}
                                                            className="w-full bg-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-xl px-3 py-2 outline-none border border-blue-500/50"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-black text-white tracking-[0.2em] uppercase">{cat.skuPrefix}</span>
                                                        <button
                                                            onClick={() => {
                                                                setEditingCatId(cat.id);
                                                                setEditPrefix(cat.skuPrefix);
                                                            }}
                                                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Standalone SKUs */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.1em] flex items-center gap-2">
                                        <Hash className="w-3 h-3 text-blue-400" /> Independientes
                                    </h4>

                                    <form onSubmit={handleAdd} className="space-y-2">
                                        <div className="flex flex-col gap-2 bg-white/5 border border-white/5 p-4 rounded-2xl">
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => {
                                                    setNewName(e.target.value);
                                                    if (!newPrefix) setNewPrefix(e.target.value.substring(0, 3).toUpperCase());
                                                }}
                                                placeholder="Nombre (ej. Promo)"
                                                className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 placeholder:text-[9px] placeholder:font-black placeholder:uppercase"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newPrefix}
                                                    onChange={(e) => setNewPrefix(e.target.value.toUpperCase())}
                                                    placeholder="Prefijo"
                                                    maxLength={5}
                                                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 placeholder:text-[9px] placeholder:font-black placeholder:uppercase"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newName.trim() || newPrefix.length < 1 || newPrefix.length > 5}
                                                    className="bg-blue-600 text-white px-5 rounded-xl disabled:opacity-20 transition-all font-black"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                    <div className="space-y-2">
                                        {skuPatterns.map((p) => (
                                            <div key={p.id} className="group bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500/30 transition-all">
                                                {editingId === p.id ? (
                                                    <div className="flex gap-2 w-full">
                                                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 bg-white/10 rounded-xl px-3 text-[11px] text-white" />
                                                        <button onClick={() => saveEdit(p.id)} disabled={editPrefix.length < 1 || editPrefix.length > 5} className="bg-emerald-500 p-2 rounded-xl text-white"><Check className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{p.name}</span>
                                                            <span className="text-sm font-black text-white tracking-[0.2em] uppercase">{p.prefix}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button onClick={() => startEditing(p)} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all"><Edit2 className="w-4 h-4" /></button>
                                                            <button onClick={async () => { await deleteSkuPattern(p.id); await fetchPatterns(); }} className="p-2 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
                            <Info className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                                Los prefijos ayudan a generar SKUs automáticos. Recomendamos usar 3 letras.
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
                    <Hash className="w-5 h-5 text-purple-500" />
                </div>
                <span className="flex-1 text-left text-[10px] font-black uppercase tracking-widest">
                    SKU
                </span>
            </button>

            {mounted && createPortal(modalContent, document.body)}
        </div>
    );
}
