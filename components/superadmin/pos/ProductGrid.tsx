"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, Percent, Banknote, Package } from 'lucide-react';
import { stripHtml } from '@/lib/strip-html';
import { CartItem } from '@/context/SalesContext';

interface ProductGridProps {
    cart: CartItem[];
    updateQuantity: (id: string, qty: number) => void;
    updateItemDiscount: (id: string, disc: number, type: 'percent' | 'fixed') => void;
    removeFromCart: (id: string) => void;
    currency: string;
}

export const ProductGrid = React.memo(function ProductGrid({ cart, updateQuantity, updateItemDiscount, removeFromCart, currency }: ProductGridProps) {
    return (
        <div className="lg:flex-1 lg:overflow-y-auto h-auto lg:h-full bg-zinc-900/20 rounded-[2.5rem] border border-white/5 flex flex-col scrollbar-thin scrollbar-thumb-white/5">
            <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-md z-10 border-b border-white/5">
                <div className="grid grid-cols-12 w-full gap-2 lg:gap-4 text-[7px] lg:text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Descripción</div>
                    <div className="col-span-2 text-center">Cant.</div>
                    <div className="col-span-3 text-center">Dscto.</div>
                    <div className="col-span-2 text-right">Sub.</div>
                </div>
            </div>

            <div className="flex-1 p-4 pt-2 space-y-1.5 flex flex-col">
                {(cart || []).length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-10 py-12">
                        <Package className="w-16 h-16 mb-4" />
                        <h3 className="text-xs font-black uppercase tracking-[0.4em]">Terminal Lista</h3>
                        <p className="text-[9px] font-bold uppercase mt-1">Agregue productos para iniciar</p>
                    </div>
                ) : (
                    cart.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={item.id}
                            className="grid grid-cols-12 w-full gap-3 items-center bg-black/20 p-3 rounded-2xl border border-white/[0.02] hover:border-white/5 transition-all group"
                        >
                            <div className="col-span-1 font-black text-zinc-800 text-[10px]">{idx + 1}</div>
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-black rounded-lg overflow-hidden shrink-0">
                                    {item.image && <img src={item.image} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all" />}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-black uppercase tracking-tighter truncate leading-tight mb-0.5">{stripHtml(item.name)}</div>
                                    <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest leading-none">${(item.price || 0).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <div className="flex items-center gap-2.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-blis-red transition-colors"><Minus className="w-2.5 h-2.5" /></button>
                                    <span className="text-[10px] font-black min-w-[16px] text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-blis-red transition-colors"><Plus className="w-2.5 h-2.5" /></button>
                                </div>
                            </div>
                            <div className="col-span-3 flex justify-center gap-1.5">
                                <div className="flex bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                                    <button
                                        onClick={() => updateItemDiscount(item.id, item.discount || 0, 'percent')}
                                        className={`p-1.5 ${item.discountType === 'percent' ? 'bg-blis-red/20 text-blis-red' : 'text-gray-600'}`}
                                    >
                                        <Percent className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                        onClick={() => updateItemDiscount(item.id, item.discount || 0, 'fixed')}
                                        className={`p-1.5 ${item.discountType === 'fixed' ? 'bg-blis-red/20 text-blis-red' : 'text-gray-600'}`}
                                    >
                                        <Banknote className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    value={item.discount || ''}
                                    placeholder="0"
                                    onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0, item.discountType || 'fixed')}
                                    className="w-14 bg-black/40 border border-white/5 rounded-lg text-[10px] font-black text-center outline-none focus:border-blis-red/30"
                                />
                            </div>
                            <div className="col-span-2 text-right font-black text-[11px] flex items-center justify-end gap-2 pr-1">
                                <div className="flex flex-col items-end">
                                    {item.discount && item.discount > 0 && (
                                        <span className="text-[7px] text-blis-red line-through decoration-blis-red/40">{currency}{(item.price * item.quantity).toLocaleString()}</span>
                                    )}
                                    <span>{currency}{((item.price * item.quantity) - (item.discountType === 'percent' ? (item.price * item.quantity * (item.discount || 0) / 100) : (item.discount || 0))).toLocaleString()}</span>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="p-1.5 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
})
