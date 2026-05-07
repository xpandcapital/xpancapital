"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, ChevronLeft, ChevronRight,
    User, MessageSquare, MapPin, X, CheckCircle2, ChevronRight as ChevronRightIcon,
    History, AlertCircle, ShieldCheck, Users
} from 'lucide-react';
import { stripHtml } from '@/lib/strip-html';
import { formatDateInput, calculateAge } from './_types';

// ── CustomDatePicker ──────────────────────────────────────
const CustomDatePicker = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [viewDate, setViewDate] = useState(() => {
        if (value && value.includes('/')) {
            const [d, m, y] = value.split('/');
            return new Date(parseInt(y), parseInt(m) - 1, 1);
        }
        return new Date();
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1));
    };

    const selectDate = (day: number) => {
        const d = day.toString().padStart(2, '0');
        const m = (viewDate.getMonth() + 1).toString().padStart(2, '0');
        const y = viewDate.getFullYear();
        onChange(`${d}/${m}/${y}`);
        setIsOpen(false);
    };

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1940; i--) years.push(i);

    return (
        <div className="space-y-1 relative" ref={containerRef}>
            <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{label}</div>
            <div className="relative group">
                <input
                    type="text"
                    className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none focus:border-blis-red/50 transition-all pr-10"
                    value={value}
                    onChange={(e) => onChange(formatDateInput(e.target.value))}
                    placeholder="DD/MM/AAAA"
                />
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-blis-red transition-colors"
                >
                    <Calendar className="w-3.5 h-3.5" />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute bottom-full mb-4 left-0 right-0 z-[1000] bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-4"
                        style={{ minWidth: '240px' }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <div className="flex gap-2 items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{months[viewDate.getMonth()]}</span>
                                <select
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-blis-red cursor-pointer"
                                    value={viewDate.getFullYear()}
                                    onChange={handleYearChange}
                                >
                                    {years.map(y => <option key={y} value={y} className="bg-zinc-950 text-white">{y}</option>)}
                                </select>
                            </div>
                            <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-3">
                            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                                <span key={`${d}-${i}`} className="text-[8px] font-black text-gray-600 uppercase">{d}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                                const day = i + 1;
                                const isSelected = value === `${day.toString().padStart(2, '0')}/${(viewDate.getMonth() + 1).toString().padStart(2, '0')}/${viewDate.getFullYear()}`;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => selectDate(day)}
                                        className={`p-2 text-[9px] font-black rounded-lg transition-all hover:bg-blis-red/20 ${isSelected ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' : 'text-gray-400'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── CustomerInfo (customer form panel) ────────────────────
interface CustomerInfoProps {
    customer: any;
    country: string;
    docLabels: { dni: string; ruc: string; };
    dniSearch: string;
    setDniSearch: (v: string) => void;
    isSearchingCustomer: boolean;
    isCustomerExpanded: boolean;
    setIsCustomerExpanded: (v: boolean) => void;
    repDniSearch: string;
    setRepDniSearch: (v: string) => void;
    isSearchingRep: boolean;
    handleCustomerSearch: () => void;
    handleForceRefreshCustomer: () => void;
    handleRepSearch: () => void;
    updateCustomerFields: (fields: any) => void;
    setCustomer: (c: any) => void;
}

function CustomerInfo({
    customer, country, docLabels, dniSearch, setDniSearch,
    isSearchingCustomer, isCustomerExpanded, setIsCustomerExpanded,
    repDniSearch, setRepDniSearch, isSearchingRep,
    handleCustomerSearch, handleForceRefreshCustomer, handleRepSearch,
    updateCustomerFields, setCustomer,
}: CustomerInfoProps) {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <div className="flex items-end justify-between ml-1">
                    <label className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Documento ({docLabels.dni} / {docLabels.ruc})</label>
                    {dniSearch.length > 0 && (
                        <span className={`text-[9px] font-black tracking-widest ${dniSearch.length === (country === 'EC' ? (dniSearch.length > 10 ? 13 : 10) : (dniSearch.length > 8 ? 11 : 8))
                            ? 'text-emerald-500'
                            : (dniSearch.length > (country === 'EC' ? 13 : 11) ? 'text-rose-500' : 'text-amber-500')
                            }`}>
                            {dniSearch.length} / {country === 'EC' ? (dniSearch.length > 10 ? 13 : 10) : (dniSearch.length > 8 ? 11 : 8)}
                        </span>
                    )}
                </div>
                <div className="relative group">
                    <input
                        type="text"
                        className={`w-full bg-black/60 border-2 p-5 rounded-3xl font-black text-lg outline-none transition-all placeholder:text-zinc-900 ${dniSearch.length > 0 && dniSearch.length !== (country === 'EC' ? (dniSearch.length > 10 ? 13 : 10) : (dniSearch.length > 8 ? 11 : 8))
                            ? 'border-amber-500/30 focus:border-amber-500/60'
                            : 'border-white/5 focus:border-blis-red/50'
                            }`}
                        placeholder={country === 'PE' ? "EJ: 44332211" : (country === 'EC' ? "EJ: 0900000000" : "00000000")}
                        value={dniSearch}
                        onChange={(e) => setDniSearch(e.target.value)}
                    />
                    <button
                        onClick={handleCustomerSearch}
                        disabled={isSearchingCustomer}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blis-red text-white rounded-2xl shadow-lg shadow-blis-red/20 hover:scale-110 active:scale-95 transition-all text-[10px] font-black uppercase"
                    >
                        {isSearchingCustomer ? '...' : 'CONSULTAR'}
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/5 p-5 rounded-[2rem] space-y-4 shadow-2xl relative group h-fit overflow-visible">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="text-[9px] text-blis-red font-black uppercase tracking-[0.2em] mb-1">
                            {customer?.id && customer.id !== '0' ? 'Cliente Identificado' : 'Nuevo Cliente / Venta General'}
                        </div>
                        <input
                            type="text"
                            className="w-full bg-transparent text-xl font-black uppercase tracking-tighter leading-tight outline-none placeholder:text-zinc-800"
                            placeholder="NOMBRE O RAZÓN SOCIAL..."
                            value={customer?.name || ''}
                            onChange={(e) => updateCustomerFields({ name: e.target.value })}
                        />
                        {customer?.id && customer.id !== '0' && (
                            <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                                {customer.type === 'natural' ? 'Persona Natural' : 'Persona Jurídica'} - {customer.id}
                            </div>
                        )}
                    </div>
                    {customer?.id && customer.id !== '0' && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleForceRefreshCustomer}
                                disabled={isSearchingCustomer}
                                className="p-2 bg-black/40 hover:bg-blis-red/20 text-gray-500 hover:text-blis-red rounded-xl transition-all"
                                title="Actualizar datos desde RENIEC/SRI"
                            >
                                <History className={`w-4 h-4 ${isSearchingCustomer ? 'animate-spin' : ''}`} />
                            </button>
                            <button onClick={() => setCustomer(null)} className="p-2 bg-black/40 hover:bg-rose-500/20 text-gray-500 hover:text-rose-500 rounded-xl transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {customer?.lastUpdate && (
                    <div className="absolute right-5 top-14 text-[8px] font-black uppercase text-gray-600 tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="hidden sm:inline">ACTUALIZADO:</span> {new Date(customer.lastUpdate).toLocaleDateString()}
                    </div>
                )}

                {customer?.type === 'juridica' && (
                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-3 animate-in fade-in duration-500">
                        <div className="flex items-end justify-between">
                            <label className="text-[8px] text-blis-red font-black uppercase tracking-widest">Persona Autorizada (Representante)</label>
                            {repDniSearch.length > 0 && (
                                <span className={`text-[9px] font-black tracking-widest ${repDniSearch.length === (country === 'EC' ? 10 : 8)
                                    ? 'text-emerald-500'
                                    : 'text-amber-500'
                                    }`}>
                                    {repDniSearch.length} / {country === 'EC' ? 10 : 8}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    className={`w-full bg-black border border-white/5 p-3 rounded-xl text-[10px] font-black outline-none transition-all placeholder:text-zinc-900 ${repDniSearch.length > 0 && repDniSearch.length !== (country === 'EC' ? 10 : 8)
                                        ? 'border-amber-500/30 focus:border-amber-500/60'
                                        : 'focus:border-blis-red/30'
                                        }`}
                                    placeholder={country === 'PE' ? "EJ: 44332211" : (country === 'EC' ? "EJ: 0900000000" : "00000000")}
                                    value={repDniSearch}
                                    onChange={(e) => setRepDniSearch(e.target.value)}
                                />
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-800" />
                            </div>
                            <button
                                onClick={handleRepSearch}
                                disabled={isSearchingRep}
                                className="px-4 bg-zinc-800 hover:bg-blis-red text-[8px] font-black uppercase rounded-xl transition-all"
                            >
                                {isSearchingRep ? '...' : 'BUSCAR'}
                            </button>
                        </div>

                        {customer.representative && (
                            <div className="p-4 bg-blis-red/5 rounded-xl border border-blis-red/10 animate-in slide-in-from-left-2 duration-300 space-y-3 relative overflow-visible">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-[7px] text-gray-500 font-black uppercase">Persona Autorizada</div>
                                        <div className="text-[10px] font-black uppercase text-white truncate">{stripHtml(customer.representative?.name)}</div>
                                        <div className="text-[8px] text-blis-red/60 font-black uppercase">{customer.representative.id}</div>
                                    </div>
                                    <button onClick={() => updateCustomerFields({ representative: undefined })} className="p-1 hover:text-rose-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="relative z-50">
                                    <CustomDatePicker
                                        label="Cumpleaños / Nacimiento"
                                        value={customer.representative.birthDate || ''}
                                        onChange={(val) => updateCustomerFields({
                                            representative: { ...customer.representative, birthDate: val }
                                        })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1 relative group">
                        <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare className="w-3 h-3 text-emerald-500" /> WhatsApp
                            {customer?.hasWhatsApp === true && <span className="text-emerald-400 text-[7px]">✓ ACTIVO</span>}
                            {customer?.hasWhatsApp === false && <span className="text-gray-600 text-[7px]">✗ Sin WhatsApp</span>}
                        </div>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-black outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-800"
                            value={customer?.phone || ''}
                            placeholder="900 000 000"
                            onChange={(e) => updateCustomerFields({ phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1 group">
                        <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-blue-500" /> Dirección (Envío)
                        </div>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-black outline-none focus:border-blue-500/30 transition-all placeholder:text-zinc-800"
                            value={customer?.address || ''}
                            placeholder="Jr. Las Begonias..."
                            onChange={(e) => updateCustomerFields({ address: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Correo Electrónico</div>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-black outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-800"
                            value={customer?.email || ''}
                            placeholder="cliente@mail.com"
                            onChange={(e) => updateCustomerFields({ email: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isCustomerExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4 pt-2 border-t border-white/5"
                    >
                        {(customer?.status || customer?.condition) && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Condición (SUNAT/SRI)</div>
                                    <div className={`p-3 rounded-xl text-[9px] font-black uppercase border flex items-center gap-2 ${customer.status?.includes('HABIDO') || customer.status?.includes('ACTIVO') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${customer.status?.includes('HABIDO') || customer.status?.includes('ACTIVO') ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                        {customer.status || 'SIN DATOS'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Estado</div>
                                    <div className={`p-3 rounded-xl text-[9px] font-black uppercase border flex items-center gap-2 ${customer.condition === 'ACTIVO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${customer.condition === 'ACTIVO' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        {customer.condition || 'SIN DATOS'}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-4 gap-2 h-fit overflow-visible relative">
                            <div className="space-y-1">
                                <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">País</div>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none"
                                    value={customer?.country || 'PERÚ'}
                                    onChange={(e) => updateCustomerFields({ country: e.target.value })}
                                />
                            </div>
                            <div className={`${customer?.type === 'juridica' ? 'col-span-3' : 'col-span-2'} relative z-30 overflow-visible`}>
                                {customer?.type === 'juridica' ? (
                                    <div className="space-y-1">
                                        <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Inscripción / Inicio</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none"
                                            value={customer?.birthDate || ''}
                                            placeholder="DD/MM/AAAA"
                                            onChange={(e) => updateCustomerFields({ birthDate: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <CustomDatePicker
                                        label="Fecha Nacimiento"
                                        value={customer?.birthDate || ''}
                                        onChange={(val) => updateCustomerFields({ birthDate: val })}
                                    />
                                )}
                            </div>
                            {customer?.type !== 'juridica' && (
                                <div className="space-y-1">
                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest text-center">Edad</div>
                                    <div className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black text-center text-blis-red uppercase">
                                        {calculateAge(customer?.birthDate)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Dpto.</div>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none"
                                    value={customer?.department || ''}
                                    onChange={(e) => updateCustomerFields({ department: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Prov.</div>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none"
                                    value={customer?.province || ''}
                                    onChange={(e) => updateCustomerFields({ province: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Dist.</div>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none"
                                    value={customer?.district || ''}
                                    onChange={(e) => updateCustomerFields({ district: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Dirección Comercial / Fiscal / Extensa</div>
                            <textarea
                                className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-bold outline-none focus:border-blis-red/30 transition-all resize-none h-14 placeholder:text-zinc-800"
                                value={customer?.address || ''}
                                placeholder="CALLE / AVENIDA / NÚMERO / DEPTO..."
                                onChange={(e) => updateCustomerFields({ address: e.target.value })}
                            />
                        </div>

                        {country === 'EC' && customer?.type === 'natural' && (
                            customer?.maritalStatus || customer?.motherName || customer?.fatherName ||
                            customer?.nationality || customer?.education || customer?.profession ||
                            customer?.gender || customer?.bloodType || customer?.birthPlace ||
                            customer?.licencia || customer?.disability || customer?.conditionCedulado
                        ) && (
                                <div className="mt-3 rounded-2xl border border-white/8 overflow-hidden">
                                    <div className="bg-blis-red/10 border-b border-blis-red/20 px-3 py-2 flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-blis-red" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blis-red">Ficha Ciudadana · Registro Civil</span>
                                        {customer?.conditionCedulado && (
                                            <span className="ml-auto text-[7px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">{customer.conditionCedulado}</span>
                                        )}
                                    </div>
                                    <div className="p-3 space-y-3 bg-black/20">
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {customer?.gender && (
                                                <div className="bg-black/40 px-2 py-1.5 rounded-lg">
                                                    <div className="text-[7px] text-gray-600 font-black uppercase">Género</div>
                                                    <div className="text-[8px] font-black text-white uppercase mt-0.5">{customer.gender}</div>
                                                </div>
                                            )}
                                            {customer?.nationality && (
                                                <div className="bg-black/40 px-2 py-1.5 rounded-lg">
                                                    <div className="text-[7px] text-gray-600 font-black uppercase">Nac.</div>
                                                    <div className="text-[8px] font-black text-white uppercase mt-0.5">{customer.nationality}</div>
                                                </div>
                                            )}
                                            {customer?.bloodType && (
                                                <div className="bg-black/40 px-2 py-1.5 rounded-lg border border-rose-500/20">
                                                    <div className="text-[7px] text-gray-600 font-black uppercase">Sangre</div>
                                                    <div className="text-[8px] font-black text-rose-400 uppercase mt-0.5">{customer.bloodType}</div>
                                                </div>
                                            )}
                                            {customer?.maritalStatus && (
                                                <div className="bg-black/40 px-2 py-1.5 rounded-lg border border-amber-500/20">
                                                    <div className="text-[7px] text-gray-600 font-black uppercase">Est. Civil</div>
                                                    <div className="text-[8px] font-black text-amber-400 uppercase mt-0.5">{customer.maritalStatus}</div>
                                                </div>
                                            )}
                                            {customer?.education && (
                                                <div className="bg-black/40 px-2 py-1.5 rounded-lg">
                                                    <div className="text-[7px] text-gray-600 font-black uppercase">Instrucción</div>
                                                    <div className="text-[8px] font-black text-white uppercase mt-0.5">{customer.education}</div>
                                                </div>
                                            )}
                                            {customer?.profession && (
                                                <div className="bg-black/40 px-2 py-1.5 rounded-lg">
                                                    <div className="text-[7px] text-gray-600 font-black uppercase">Profesión</div>
                                                    <div className="text-[8px] font-black text-white uppercase mt-0.5">{customer.profession}</div>
                                                </div>
                                            )}
                                        </div>
                                        {customer?.spouseName && (
                                            <div className="bg-emerald-500/5 border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                                                <div>
                                                    <div className="text-[7px] text-gray-600 font-black uppercase">Cónyuge / Conviviente</div>
                                                    <div className="text-[9px] font-black text-emerald-400 uppercase">{customer.spouseName}</div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {customer?.motherName && (
                                                <div className="border border-white/5 bg-black/40 px-2.5 py-2 rounded-lg">
                                                    <div className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Madre</div>
                                                    <div className="text-[8px] font-black text-gray-300 uppercase mt-0.5">{customer.motherName}</div>
                                                </div>
                                            )}
                                            {customer?.fatherName && (
                                                <div className="border border-white/5 bg-black/40 px-2.5 py-2 rounded-lg">
                                                    <div className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Padre</div>
                                                    <div className="text-[8px] font-black text-gray-300 uppercase mt-0.5">{customer.fatherName}</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {customer?.birthPlace && (
                                                <div className="border border-blue-500/10 bg-blue-500/5 px-2.5 py-2 rounded-lg">
                                                    <div className="text-[7px] text-blue-500/80 font-black uppercase tracking-widest">Lugar Nacim.</div>
                                                    <div className="text-[8px] font-black text-blue-400 uppercase mt-0.5">{customer.birthPlace}</div>
                                                </div>
                                            )}
                                            {customer?.licencia && (
                                                <div className="border border-amber-500/10 bg-amber-500/5 px-2.5 py-2 rounded-lg">
                                                    <div className="text-[7px] text-amber-500/80 font-black uppercase tracking-widest">Licencia Conducir</div>
                                                    <div className="text-[8px] font-black text-amber-500 uppercase mt-0.5">{typeof customer.licencia === "string" ? customer.licencia : "Si"}</div>
                                                </div>
                                            )}
                                        </div>
                                        {customer?.disability === 'SI' && (
                                            <div className="bg-blis-red/10 border border-blis-red/20 p-2.5 rounded-lg flex items-start gap-2">
                                                <div className="p-1 bg-blis-red/20 rounded-md shrink-0">
                                                    <Users className="w-3.5 h-3.5 text-blis-red" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[8px] font-black text-blis-red uppercase tracking-widest">Carnet CONADIS</span>
                                                        <span className="text-[9px] font-black bg-blis-red text-white px-2 py-0.5 rounded-full">{customer.disabilityPct}%</span>
                                                    </div>
                                                    <div className="text-[7px] text-blis-red/70 font-black uppercase mt-1">Tipo: {customer.disabilityType || 'NO ESPECIFICADO'}</div>
                                                    {customer.conadisCard && <div className="text-[7px] text-blis-red/50 uppercase font-black">N° {customer.conadisCard}</div>}
                                                </div>
                                            </div>
                                        )}
                                        {customer?.deathDate && (
                                            <div className="bg-zinc-900 border border-zinc-700 p-2.5 rounded-lg flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 text-gray-500 shrink-0" />
                                                <div>
                                                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Fecha Defunción</div>
                                                    <div className="text-[10px] font-black text-gray-200 uppercase tracking-widest line-through">{customer.deathDate}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsCustomerExpanded(!isCustomerExpanded)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-gray-500 hover:text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-white/10 flex items-center justify-center gap-2"
            >
                {isCustomerExpanded ? 'OCULTAR DETALLES' : 'VER TODOS LOS DETALLES'}
                <ChevronRightIcon className={`w-3.5 h-3.5 transition-transform ${isCustomerExpanded ? '-rotate-90' : 'rotate-90'}`} />
            </button>
        </div>
    );
}

export { CustomDatePicker, CustomerInfo };
export { formatDateInput, calculateAge } from './_types';
