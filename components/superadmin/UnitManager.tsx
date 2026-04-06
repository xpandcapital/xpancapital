"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ChevronUp, ChevronDown, Check, X, Scale, Move, Hash, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUnits } from "@/context/UnitContext";
import { createPortal } from "react-dom";

const UNIT_TYPES = [
    { id: "quantity", label: "Contable (Unidades)", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "weight", label: "Peso (kg, g, lbs)", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "volume", label: "Volumen (L, ml, oz)", color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "distance", label: "Longitud (m, cm, in)", color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "digital", label: "Digital (Infinito)", color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { id: "other", label: "Otros Formatos", color: "text-gray-500", bg: "bg-gray-500/10" },
];

export function UnitManager() {
    const { units, addUnit, deleteUnit, updateUnit, reorderUnits, fetchUnits } = useUnits();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // New Unit Form
    const [newName, setNewName] = useState("");
    const [newAbbr, setNewAbbr] = useState("");
    const [newType, setNewType] = useState<any>("quantity");

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editAbbr, setEditAbbr] = useState("");
    const [editType, setEditType] = useState<any>("quantity");

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim() && newAbbr.trim()) {
            await addUnit(newName.trim(), newAbbr.trim(), newType);
            setNewName("");
            setNewAbbr("");
            await fetchUnits(); // Force refresh
        }
    };

    const startEditing = (unit: any) => {
        setEditingId(unit.id);
        setEditName(unit.name);
        setEditAbbr(unit.abbreviation);
        setEditType(unit.type);
    };

    const saveEdit = async (id: string) => {
        if (editName.trim() && editAbbr.trim()) {
            await updateUnit(id, editName.trim(), editAbbr.trim(), editType);
            await fetchUnits(); // Force refresh
            setEditingId(null);
        }
    };

    const moveUp = async (index: number) => {
        if (index === 0) return;
        const newUnits = [...units];
        const temp = newUnits[index];
        newUnits[index] = newUnits[index - 1];
        newUnits[index - 1] = temp;
        await reorderUnits(newUnits);
        await fetchUnits(); // Force refresh
    };

    const moveDown = async (index: number) => {
        if (index === units.length - 1) return;
        const newUnits = [...units];
        const temp = newUnits[index];
        newUnits[index] = newUnits[index + 1];
        newUnits[index + 1] = temp;
        await reorderUnits(newUnits);
        await fetchUnits(); // Force refresh
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
                        className="bg-zinc-950 border border-white/10 w-full max-w-xl rounded-[2.5rem] p-6 md:p-10 relative z-10 shadow-2xl space-y-8 overflow-hidden mx-auto"
                    >
                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                                    <Scale className="w-3.5 h-3.5" /> Inventario
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Unidades de Medida</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Left Column: Create Unit */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.1em] flex items-center gap-2">
                                        <Plus className="w-3 h-3 text-amber-500" /> Nueva Unidad
                                    </h4>

                                    <form onSubmit={handleAdd} className="space-y-3 bg-white/5 border border-white/5 p-5 rounded-[2rem]">
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre</span>
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                placeholder="Ej. Kilogramos"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-gray-700 placeholder:text-[9px] placeholder:font-black placeholder:uppercase outline-none focus:border-amber-500/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Símbolo</span>
                                            <input
                                                type="text"
                                                value={newAbbr}
                                                onChange={(e) => setNewAbbr(e.target.value)}
                                                placeholder="Ej. kg"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-gray-700 placeholder:text-[9px] placeholder:font-black placeholder:uppercase outline-none focus:border-amber-500/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Tipo</span>
                                            <select
                                                value={newType}
                                                onChange={(e) => setNewType(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white outline-none appearance-none cursor-pointer"
                                            >
                                                {UNIT_TYPES.map(t => <option key={t.id} value={t.id} className="bg-zinc-900">{t.label}</option>)}
                                            </select>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!newName.trim() || !newAbbr.trim()}
                                            className="w-full py-3 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/10 disabled:opacity-20 transition-all hover:scale-105 active:scale-95 mt-2"
                                        >
                                            Crear Unidad
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Right Column: List & Reorder */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.1em] flex items-center gap-2">
                                    <Scale className="w-3 h-3 text-amber-500" /> Unidades Activas
                                </h4>

                                <div className="space-y-2">
                                    {units.map((unit, index) => {
                                        const typeInfo = UNIT_TYPES.find(t => t.id === unit.type) || UNIT_TYPES[4];
                                        const isEditing = editingId === unit.id;

                                        return (
                                            <motion.div
                                                key={unit.id}
                                                layout
                                                transition={{
                                                    layout: { type: "spring", stiffness: 600, damping: 35 }
                                                }}
                                                className="group bg-white/[0.02] border border-white/5 rounded-xl flex items-center min-h-[60px] p-3 hover:border-amber-500/30 transition-all overflow-hidden relative"
                                            >
                                                {isEditing ? (
                                                    <div className="space-y-2 w-full">
                                                        <div className="flex gap-2">
                                                            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-white uppercase min-w-0" />
                                                            <input value={editAbbr} onChange={(e) => setEditAbbr(e.target.value)} className="w-14 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-white uppercase text-center shrink-0" />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <select value={editType} onChange={(e) => setEditType(e.target.value as any)} className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-white uppercase appearance-none min-w-0">
                                                                {UNIT_TYPES.map(t => <option key={t.id} value={t.id} className="bg-zinc-900">{t.label}</option>)}
                                                            </select>
                                                            <button onClick={() => saveEdit(unit.id)} className="bg-emerald-500 p-1.5 rounded-lg text-white hover:scale-110 shrink-0"><Check className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                            {/* Flechas de ordenamiento */}
                                                            <div className="flex flex-col gap-0.5 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveUp(index)}
                                                                    disabled={index === 0}
                                                                    className={`p-1 rounded-md transition-all ${index === 0 ? 'text-gray-800 opacity-20' : 'text-gray-400 hover:text-amber-500 hover:bg-white/10 active:scale-95'}`}
                                                                >
                                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveDown(index)}
                                                                    disabled={index === units.length - 1}
                                                                    className={`p-1 rounded-md transition-all ${index === units.length - 1 ? 'text-gray-800 opacity-20' : 'text-gray-400 hover:text-amber-500 hover:bg-white/10 active:scale-95'}`}
                                                                >
                                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>

                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-[10px] font-black text-white uppercase tracking-wider leading-none">{unit.name}</span>
                                                                    <span className="text-[8px] font-black text-gray-600 bg-white/5 px-1 rounded uppercase shrink-0">{unit.abbreviation}</span>
                                                                </div>
                                                                <span className={`text-[7.5px] font-bold uppercase tracking-widest ${typeInfo.color} mt-0.5`}>{typeInfo.label}</span>
                                                            </div>
                                                        </div>

                                                        {/* Acciones compactas a la derecha */}
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); startEditing(unit); }}
                                                                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={async (e) => { e.stopPropagation(); await deleteUnit(unit.id); await fetchUnits(); }}
                                                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
                            <Info className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                                Las unidades permiten especificar el contenido del producto. Puedes usar las flechas para cambiar el orden de selección.
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
                    <Scale className="w-5 h-5 text-amber-500" />
                </div>
                <span className="flex-1 text-left text-[10px] font-black uppercase tracking-widest">
                    Unidades
                </span>
            </button>

            {mounted && createPortal(modalContent, document.body)}
        </div>
    );
}
