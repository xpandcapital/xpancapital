"use client";

import { useState } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomDatePickerProps {
    value: string;
    label: string;
    onChange: (v: string) => void;
}

export function CustomDatePicker({ value, label, onChange }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(value || '2000-01-01'));
    const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const firstDay = (y: number, m: number) => new Date(y, m, 1).getDay();

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const days = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

    const handleDateSelect = (d: number) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
        onChange(date.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const changeMonth = (inc: number) => {
        const d = new Date(viewDate);
        d.setMonth(d.getMonth() + inc);
        setViewDate(d);
    };

    const currentYear = viewDate.getFullYear();
    const yearStart = currentYear - (currentYear % 12);
    const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

    return (
        <div className="relative space-y-2">
            <label className="text-[10px] text-gray-600 font-black uppercase ml-1">{label}</label>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-xs text-left text-white flex justify-between items-center group hover:border-blis-red transition-all shadow-xl">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 group-hover:text-blis-red transition-all" />
                    <span>{value || "Seleccionar Fecha"}</span>
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
                            className="absolute left-0 right-0 top-full mt-2 z-[10003] bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-4 shadow-4xl backdrop-blur-xl w-72 mx-auto lg:mx-0"
                        >
                            <div className="flex justify-between items-center mb-4 px-2">
                                <button onClick={() => viewMode === 'days' ? changeMonth(-1) : setViewDate(new Date(viewDate.getFullYear() - 12, 0))} className="p-2 hover:bg-white/5 rounded-xl transition-all"><ChevronRight className="rotate-180 w-4 h-4" /></button>
                                <button onClick={() => setViewMode(viewMode === 'days' ? 'months' : viewMode === 'months' ? 'years' : 'days')} className="text-[10px] font-black uppercase hover:text-blis-red transition-all">
                                    {viewMode === 'days' ? `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}` : viewMode === 'months' ? viewDate.getFullYear() : `${years[0]} - ${years[11]}`}
                                </button>
                                <button onClick={() => viewMode === 'days' ? changeMonth(1) : setViewDate(new Date(viewDate.getFullYear() + 12, 0))} className="p-2 hover:bg-white/5 rounded-xl transition-all"><ChevronRight className="w-4 h-4" /></button>
                            </div>

                            {viewMode === 'days' && (
                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {days.map(d => <span key={d} className="text-[8px] font-black text-gray-600 uppercase py-1">{d}</span>)}
                                    {Array(firstDay(viewDate.getFullYear(), viewDate.getMonth())).fill(0).map((_, i) => <div key={`empty-${i}`} />)}
                                    {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }, (_, i) => i + 1).map(d => {
                                        const isSelected = value === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toISOString().split('T')[0];
                                        return (
                                            <button
                                                key={d}
                                                onClick={() => handleDateSelect(d)}
                                                className={`text-[10px] py-2 rounded-xl transition-all ${isSelected ? 'bg-blis-red text-white font-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                {d}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {viewMode === 'months' && (
                                <div className="grid grid-cols-3 gap-2">
                                    {months.map((m, i) => (
                                        <button
                                            key={m}
                                            onClick={() => { setViewDate(new Date(viewDate.getFullYear(), i, 1)); setViewMode('days'); }}
                                            className={`text-[9px] font-black uppercase py-4 rounded-xl transition-all ${viewDate.getMonth() === i ? 'bg-white/10 text-white font-black' : 'text-gray-500 hover:bg-white/5'}`}
                                        >
                                            {m.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {viewMode === 'years' && (
                                <div className="grid grid-cols-3 gap-2">
                                    {years.map(y => (
                                        <button
                                            key={y}
                                            onClick={() => { setViewDate(new Date(y, viewDate.getMonth(), 1)); setViewMode('months'); }}
                                            className={`text-[9px] font-black uppercase py-4 rounded-xl transition-all ${viewDate.getFullYear() === y ? 'bg-white/10 text-white font-black' : 'text-gray-500 hover:bg-white/5'}`}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
