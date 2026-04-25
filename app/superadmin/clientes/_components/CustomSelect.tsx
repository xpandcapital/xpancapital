"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomSelectProps {
    value: string;
    label?: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
    icon?: React.ComponentType<{ className?: string }>;
    className?: string;
}

export function CustomSelect({ value, label, options, onChange, icon: Icon, className = "" }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`relative ${label ? 'space-y-2' : ''} ${className}`}>
            {label && <label className="text-[10px] text-gray-600 font-black uppercase ml-1">{label}</label>}
            <button onClick={() => setIsOpen(!isOpen)} className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-xs text-left text-white flex justify-between items-center group hover:border-blis-red transition-all shadow-xl ${!label ? 'py-4' : ''}`}>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blis-red transition-all" />}
                    <span>{options.find(o => o.value === value)?.label || value}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[10002]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-0 right-0 top-full mt-2 z-[10003] bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-4xl backdrop-blur-xl min-w-[180px]"
                        >
                            {options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                    className={`w-full text-left px-5 py-3 text-xs font-bold transition-all hover:bg-blis-red hover:text-white ${value === opt.value ? 'bg-white/5 text-blis-red' : 'text-gray-400'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
