"use client";

// Types ────────────────────────────────────────────────────────────────────────
import type { Customer, CartItem } from '@/context/SalesContext';
import type { Producto } from '@/lib/hooks/useProducts';

interface CartPanelProps {
    customer: Customer | null;
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
    updateCustomerFields: (fields: Partial<Customer>) => void;
    setCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
    cart: CartItem[];
    total: number;
    subtotal: number;
    tax: number;
    currency: string;
    taxName: string;
    taxRate: number;
    transactionType: string;
    documentType: string;
    globalDiscountAmount: number;
    setGlobalDiscountAmount: (v: number) => void;
    globalDiscountType: 'percent' | 'fixed';
    setGlobalDiscountType: (v: 'percent' | 'fixed') => void;
    couponCode: string;
    setCouponCode: (v: string) => void;
    shippingCost: number;
    setShippingCost: (v: number) => void;
    saveTransaction: () => void;
    preCheckout?: () => void;
    products: Producto[];
    handleQuickAdd: (p: Producto) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
    Ticket, FileText, X, Percent, Banknote,
    Tag, Package, Truck, Save, ChevronRight
} from 'lucide-react';
import { POSAIUpsell } from '@/components/superadmin/POSAIUpsell';

import { CustomerInfo as CustomerInfoPanel } from './CustomerInfo';

export function CartPanel(props: CartPanelProps) {
    const {
        customer, country, docLabels, dniSearch, setDniSearch,
        isSearchingCustomer, isCustomerExpanded, setIsCustomerExpanded,
        repDniSearch, setRepDniSearch, isSearchingRep,
        handleCustomerSearch, handleForceRefreshCustomer, handleRepSearch,
        updateCustomerFields, setCustomer,
        cart, total, subtotal, tax, currency, taxName, taxRate,
        transactionType, documentType,
        globalDiscountAmount, setGlobalDiscountAmount,
        globalDiscountType, setGlobalDiscountType,
        couponCode, setCouponCode, shippingCost, setShippingCost,
        saveTransaction, preCheckout, products, handleQuickAdd,
    } = props;

    const openCheckout = () => {
        if (preCheckout) preCheckout();
    };

    return (
        <div className="w-full lg:w-[480px] flex flex-col bg-zinc-950 p-6 lg:p-8 space-y-6 relative h-auto lg:h-full lg:overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 border-t lg:border-t-0 lg:border-l border-white/5">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Documento & Cliente</h2>
                <div className="px-3 py-1 bg-blis-red/20 text-blis-red rounded-full text-[8px] font-black uppercase tracking-widest">
                    Sesión: Admin
                </div>
            </div>

            <CustomerInfoPanel
                customer={customer}
                country={country}
                docLabels={docLabels}
                dniSearch={dniSearch}
                setDniSearch={setDniSearch}
                isSearchingCustomer={isSearchingCustomer}
                isCustomerExpanded={isCustomerExpanded}
                setIsCustomerExpanded={setIsCustomerExpanded}
                repDniSearch={repDniSearch}
                setRepDniSearch={setRepDniSearch}
                isSearchingRep={isSearchingRep}
                handleCustomerSearch={handleCustomerSearch}
                handleForceRefreshCustomer={handleForceRefreshCustomer}
                handleRepSearch={handleRepSearch}
                updateCustomerFields={updateCustomerFields}
                setCustomer={setCustomer}
            />

            <div className="shrink-0">
                <POSAIUpsell
                    cart={cart}
                    catalog={products as unknown[] as { title: string }[]}
                    onAddProduct={handleQuickAdd}
                />
            </div>

            <div className="p-6 bg-zinc-900/50 rounded-[2rem] border border-white/5 space-y-4 shrink-0">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                    Beneficios & Descuentos Globales
                </h3>

                <div className="space-y-2">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Aplicar Cupón</label>
                    <div className="relative group/coupon">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="w-full bg-black/40 border border-white/5 pl-10 pr-4 py-3 rounded-2xl text-[11px] font-black text-white uppercase outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
                            placeholder="EJ: BLACKFRIDAY24"
                        />
                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/coupon:text-emerald-500 transition-colors" />
                        {couponCode && (
                            <button onClick={() => setCouponCode('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 hover:scale-110 transition-transform">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 min-w-0">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center justify-between">
                        <span>Descuento Manual Fijo</span>
                        {globalDiscountAmount > 0 && (
                            <button onClick={() => setGlobalDiscountAmount(0)} className="text-rose-500 hover:underline">Borrar</button>
                        )}
                    </label>
                    <div className="flex gap-2">
                        <div className="flex bg-black/40 rounded-xl border border-white/5 overflow-hidden shrink-0">
                            <button
                                onClick={() => setGlobalDiscountType('percent')}
                                className={`px-3 py-2 ${globalDiscountType === 'percent' ? 'bg-emerald-500/20 text-emerald-500' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Percent className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setGlobalDiscountType('fixed')}
                                className={`px-3 py-2 ${globalDiscountType === 'fixed' ? 'bg-emerald-500/20 text-emerald-500' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Banknote className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative flex-1 group/disc">
                            <input
                                type="number"
                                value={globalDiscountAmount || ''}
                                onChange={(e) => setGlobalDiscountAmount(parseFloat(e.target.value) || 0)}
                                className="w-full h-full bg-black/40 border border-white/5 px-4 rounded-xl text-[14px] font-black text-white outline-none focus:border-emerald-500/50 transition-all text-right placeholder:text-zinc-800"
                                placeholder="0.00"
                            />
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/disc:text-emerald-500" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center justify-between">
                        <span>Costo de Envío</span>
                    </label>
                    <div className="relative group/ship">
                        <input
                            type="number"
                            value={shippingCost || ''}
                            onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                            className="w-full bg-black/40 border border-white/5 pl-10 pr-4 py-3 rounded-2xl text-[14px] font-black text-amber-500 outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-800"
                            placeholder="0.00"
                        />
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/ship:text-amber-500 transition-colors" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-700">{currency}</span>
                    </div>
                    <button
                        onClick={() => {
                            alert('Módulo de Courrier Olva / Shalom se abrirá en la Siguiente Actualización...');
                        }}
                        className="w-full py-3 bg-amber-600/10 border border-amber-600/30 rounded-xl flex items-center justify-center gap-3 group hover:bg-amber-600/20 transition-all"
                    >
                        <Truck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Cotizar Envío Olva Courier</span>
                    </button>
                </div>
            </div>

            <div className="mt-auto pt-6 space-y-6 shrink-0 relative z-20">
                <div className="bg-zinc-950 border-2 border-white/10 p-8 rounded-[3rem] space-y-4 shadow-3xl">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[11px] font-black text-gray-600 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>{currency}{(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-black text-gray-600 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span>{taxName} ({taxRate}%)</span>
                                {documentType === 'ticket' && <span className="bg-blis-red/20 text-blis-red px-2 py-0.5 rounded text-[7px]">EXENTO</span>}
                            </div>
                            <span>{currency}{(tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>

                        {globalDiscountAmount > 0 && (
                            <div className="flex justify-between items-center text-[11px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                                <span>Dscto. Aplicado</span>
                                <div className="flex items-center gap-1">
                                    <span>-</span>
                                    <span>{currency}{(globalDiscountType === 'percent' ? (subtotal * (1 + taxRate / 100) * globalDiscountAmount / 100) : globalDiscountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        )}

                        <div className="pt-5 border-t border-white/10 flex flex-col xl:flex-row justify-between xl:items-end gap-5">
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-blis-red uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                                    {documentType === 'ticket' ? <Ticket className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                    Total {transactionType}
                                </div>
                                <div className="flex items-baseline gap-1.5 min-w-0 pr-2">
                                    <span className="text-2xl font-black text-zinc-700">{currency}</span>
                                    <div className="text-4xl xl:text-5xl font-black tracking-tighter text-white truncate">{(total || 0).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="shrink-0">
                                {transactionType === 'cotizacion' ? (
                                    <button
                                        onClick={saveTransaction}
                                        className="px-5 py-6 xl:p-6 bg-amber-500 text-black rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 hover:scale-105 w-full xl:w-auto justify-center"
                                    >
                                        <Save className="w-5 h-5" /> <span className="hidden xl:inline">GUARDAR</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={openCheckout}
                                        disabled={(cart || []).length === 0}
                                        className="px-5 py-6 xl:p-6 bg-emerald-500 text-black rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 disabled:opacity-20 shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 w-full xl:w-auto justify-center"
                                    >
                                        <span className="hidden xl:inline">COBRAR</span> <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
