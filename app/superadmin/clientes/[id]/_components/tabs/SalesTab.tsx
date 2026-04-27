"use client";

import { useState } from 'react';
import {
    ShoppingCart, ChevronRight, Ticket, FileText,
    Download, Send, X, Plus
} from 'lucide-react';
import type { Client, Order } from '../../../_types';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

interface SalesTabProps {
    client: Client;
    orders: Order[];
    onUpdate: (fields: Partial<Client>) => void;
}

export function SalesTab({ client, orders, onUpdate }: SalesTabProps) {
    const { showToast } = useToast();
    const [viewMode, setViewMode] = useState<'Venta' | 'Cotizacion'>('Venta');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isConfiguringCoupon, setIsConfiguringCoupon] = useState(false);
    const [couponForm, setCouponForm] = useState({ code: 'VIP-OFFER', discount: 15, type: 'Percentage' });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/5 pb-8 gap-6">
                <div className="flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-1">Actividad Comercial</h3>
                    <p className="text-[10px] text-gray-500 uppercase">{client.purchases} Operaciones registradas</p>
                </div>
                <div className="bg-black/40 p-1.5 rounded-2xl border border-white/10 flex gap-2">
                    <button
                        onClick={() => setViewMode('Venta')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'Venta' ? 'bg-blis-red text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Ventas
                    </button>
                    <button
                        onClick={() => setViewMode('Cotizacion')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'Cotizacion' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Cotizaciones
                    </button>
                </div>
            </div>

            {client.abandonedCart && (
                <div className="p-6 md:p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] relative overflow-hidden transition-all duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-xl">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-amber-500 uppercase tracking-tighter">Carrito Abandonado</span>
                                <span className="text-[11px] text-gray-400 font-bold uppercase">{client.abandonedCart.items} items por ${client.abandonedCart.total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsConfiguringCoupon(!isConfiguringCoupon)}
                            className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center gap-2 z-10 shadow-2xl ${isConfiguringCoupon ? 'bg-white/10 text-white' : 'bg-amber-500 text-black hover:scale-105 active:scale-95'}`}
                        >
                            <Ticket className="w-4 h-4" />
                            {isConfiguringCoupon ? 'Cerrar Opción' : 'Lanzar Cupón VIP'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {isConfiguringCoupon && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 flex flex-col lg:flex-row items-end gap-6 shadow-4xl">
                                    <div className="flex-1 w-full space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-600 ml-1 tracking-widest">Código</label>
                                        <input
                                            type="text"
                                            value={couponForm.code}
                                            onChange={e => setCouponForm({ ...couponForm, code: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-white/5 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-amber-500 transition-all"
                                        />
                                    </div>
                                    <div className="w-full lg:w-40 space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-600 ml-1 tracking-widest">Descuento %</label>
                                        <input
                                            type="number"
                                            value={couponForm.discount}
                                            onChange={e => setCouponForm({ ...couponForm, discount: Number(e.target.value) })}
                                            className="w-full bg-white/5 border-2 border-white/5 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-amber-500 transition-all text-center"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            showToast(`¡Cupón ${couponForm.code} enviado!`, 'success');
                                            setIsConfiguringCoupon(false);
                                        }}
                                        className="w-full lg:w-auto px-10 py-4 bg-emerald-500 text-black rounded-xl font-black uppercase text-[10px] hover:bg-emerald-400 active:scale-95 transition-all shadow-xl"
                                    >
                                        Enviar Oferta Ahora
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {orders.filter(o => o.type === viewMode).length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-30 flex flex-col items-center">
                        <FileText className="w-12 h-12 mb-4" />
                        <span className="text-[10px] font-black uppercase">No se hallaron registros</span>
                    </div>
                ) : (
                    orders.filter(o => o.type === viewMode).map(order => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex justify-between items-center hover:border-blue-500/30 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.type === 'Venta' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase group-hover:text-blue-400 transition-colors">{order.id}</span>
                                    <span className="text-[9px] text-gray-600 uppercase">{order.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{order.items} Producto(s)</span>
                                    <div className="flex gap-1.5 mt-1">
                                        {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/10" />)}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-black text-white">${order.total.toFixed(2)}</span>
                                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase ${order.status === 'Pagado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-white transition-all group-hover:translate-x-1" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed inset-y-0 right-0 w-full max-w-lg z-[10000] bg-black/95 backdrop-blur-xl p-8 border-l border-white/10 shadow-4xl flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                            <h3 className="text-lg font-black uppercase">Factura {selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white/5 rounded-2xl">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 space-y-8 overflow-y-auto pr-2">
                            <div className="bg-zinc-900 rounded-[2.5rem] p-8 space-y-2 border border-white/5 shadow-2xl">
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total de la Operación</div>
                                <div className="text-6xl font-black text-emerald-500 tracking-tighter">${selectedOrder.total.toFixed(2)}</div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-gray-600 ml-2 tracking-widest">Detalle</h4>
                                <div className="space-y-3">
                                    {(selectedOrder.products || []).map((prod, idx) => (
                                        <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-white">{prod.name}</span>
                                                <span className="text-[10px] text-gray-500 uppercase font-black">{prod.quantity} Uni • ${prod.price.toFixed(2)} c/u</span>
                                            </div>
                                            <div className="text-sm font-black">${(prod.price * prod.quantity).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-white/10 flex gap-4">
                            <button className="flex-1 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Bajar PDF
                            </button>
                            <button className="flex-1 py-5 bg-blis-red text-white rounded-2xl font-black uppercase text-[10px] hover:scale-[1.02] transition-all shadow-xl shadow-blis-red/20 flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" /> Re-Enviar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
