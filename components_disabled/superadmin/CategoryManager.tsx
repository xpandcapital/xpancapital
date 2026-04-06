"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Edit2, ChevronUp, ChevronDown, Check, X, Tag, Move } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "@/context/CategoryContext";
import { createPortal } from "react-dom";

export function CategoryManager() {
    const { categories, addCategory, deleteCategory, renameCategory, reorderCategories, fetchCategories } = useCategories();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            const result = await addCategory(newCategoryName.trim());
            if (result.success) {
                setNewCategoryName("");
                await fetchCategories(); // Force refresh
            }
        }
    };

    const startEditing = (id: string, name: string) => {
        setEditingId(id);
        setEditText(name);
    };

    const saveEdit = async (id: string) => {
        if (editText.trim()) {
            await renameCategory(id, editText.trim());
            await fetchCategories(); // Force refresh
            setEditingId(null);
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newCategories.length) {
            [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
            await reorderCategories(newCategories);
            await fetchCategories(); // Force refresh
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
                        className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl space-y-8"
                    >
                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-blis-red font-black text-[10px] uppercase tracking-widest">
                                    <Tag className="w-3.5 h-3.5" /> Inventario
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Gestionar Categorías</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Add Category Input */}
                        <form onSubmit={handleAdd} className="relative group">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nueva categoría..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-blis-red/50 focus:bg-white/10 transition-all placeholder:text-gray-700 placeholder:uppercase placeholder:text-[9px] placeholder:font-black placeholder:tracking-widest"
                            />
                            <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blis-red transition-colors" />
                            <button
                                type="submit"
                                disabled={!newCategoryName.trim()}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${newCategoryName.trim() ? 'bg-blis-red text-white scale-100 shadow-lg' : 'bg-transparent text-gray-700 scale-90'}`}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>

                        {/* Category List */}
                        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-3">
                                {categories.map((category, index) => (
                                    <motion.div
                                        key={category.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="group bg-white/[0.02] border border-white/5 rounded-2xl flex items-center p-3 hover:border-white/20 hover:bg-white/5 transition-all"
                                    >
                                        <div className="flex flex-col gap-0.5 pr-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleMove(index, 'up')}
                                                disabled={index === 0}
                                                className={`p-1 rounded-md transition-all ${index === 0 ? 'text-gray-800 opacity-20' : 'text-gray-500 hover:text-white hover:bg-white/10 active:scale-95'}`}
                                            >
                                                <ChevronUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMove(index, 'down')}
                                                disabled={index === categories.length - 1}
                                                className={`p-1 rounded-md transition-all ${index === categories.length - 1 ? 'text-gray-800 opacity-20' : 'text-gray-500 hover:text-white hover:bg-white/10 active:scale-95'}`}
                                            >
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="flex-1 px-3">
                                            {editingId === category.id ? (
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(category.id)}
                                                    onBlur={() => saveEdit(category.id)}
                                                    className="w-full bg-white/10 border-none rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blis-red/40 outline-none"
                                                />
                                            ) : (
                                                <span className="text-xs font-black text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">
                                                    {category.name}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all pr-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => startEditing(category.id, category.name)}
                                                className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={async () => { 
                                                    await deleteCategory(category.id);
                                                    await fetchCategories(); 
                                                }}
                                                className="p-2 rounded-xl text-gray-500 hover:text-blis-red hover:bg-blis-red/10 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
                                {categories.length} Categorías totales
                            </span>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Move className="w-3 h-3" /> Flechas para reordenar
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
                    <Tag className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="flex-1 text-left text-[10px] font-black uppercase tracking-widest">
                    Categorías
                </span>
            </button>

            {mounted && createPortal(modalContent, document.body)}
        </div>
    );
}
