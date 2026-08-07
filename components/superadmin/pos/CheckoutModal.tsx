"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Banknote, CreditCard, Coins, ArrowRightLeft,
    CheckCircle2, ShieldCheck, MessageSquare, Copy,
    Printer
} from 'lucide-react';
import { stripHtml } from '@/lib/strip-html';
import { PaymentPanel } from './PaymentPanel';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
    total: number;
    documentType: string;
    currency: string;
    country: string;
    taxRate: number;
    cart: any[];
    // Payment
    paymentMethod: string;
    setPaymentMethod: (m: 'cash' | 'card' | 'xpandCoins' | 'transfer') => void;
    receivedAmount: string;
    setReceivedAmount: (v: string) => void;
    isIssuingInvoice: boolean;
    emitElectronicInvoice: boolean;
    setEmitElectronicInvoice: (v: boolean) => void;
    invoiceResult: { success: boolean; msg: string; detail?: string } | null;
    setInvoiceResult: (r: { success: boolean; msg: string; detail?: string } | null) => void;
    // Finalize action
    onFinalize: () => void;
}

export function CheckoutModal({
    isOpen, onClose, customer, total, documentType, currency, country, taxRate, cart,
    paymentMethod, setPaymentMethod, receivedAmount, setReceivedAmount,
    isIssuingInvoice, emitElectronicInvoice, setEmitElectronicInvoice,
    invoiceResult, setInvoiceResult, onFinalize,
}: CheckoutModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
                onClick={() => {
                    onClose();
                    setInvoiceResult(null);
                }}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-zinc-950 border border-white/10 p-12 rounded-[4rem] w-full max-w-6xl relative z-10 shadow-3xl flex gap-10 overflow-hidden"
            >
                <div className="flex-1 space-y-10 min-w-0">
                    {!invoiceResult ? (
                        <>
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Finalizar Venta</h2>
                                <div className="flex gap-4 mt-2 items-center">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Doc: {documentType}</span>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">|</span>
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cliente: {stripHtml(customer?.name) || 'Venta General'}</span>

                                    <button
                                        onClick={() => {
                                            const phone = customer?.phone || customer?.cellphone;
                                            if (!phone) {
                                                alert('El cliente no tiene un número de celular configurado.');
                                                return;
                                            }
                                            const text = encodeURIComponent(`Hola ${customer?.name || ''}, adjunto tu comprobante de venta por ${currency}${total}. Gracias por tu compra.`);
                                            window.open(`https://wa.me/${phone.replace(/\s+/g, '')}?text=${text}`, '_blank');
                                        }}
                                        className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full ml-auto hover:bg-emerald-500/20 transition-all"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">WhatsApp</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'cash', icon: Banknote, label: 'Efectivo', desc: country === 'EC' ? 'Saldo físico / caja' : 'Pago físico', color: 'emerald' },
                                    { id: 'card', icon: CreditCard, label: 'Tarjeta', desc: country === 'EC' ? 'Datafast / Medianet' : 'IziPay', color: 'blue' },
                                    { id: 'xpandCoins', icon: Coins, label: 'Xpand Coins', desc: 'Canje de Puntos', color: 'amber' },
                                    { id: 'transfer', icon: ArrowRightLeft, label: country === 'EC' ? 'Deuna / Pichincha' : 'Transferencia', desc: country === 'EC' ? 'Interbancario' : 'Yape / Plin', color: 'purple' }
                                ].map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id as any)}
                                        className={`group relative p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 ${paymentMethod === method.id ? 'bg-emerald-500/10 border-emerald-500 shadow-2xl' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center shrink-0 transition-all ${paymentMethod === method.id ? 'text-emerald-500' : 'text-zinc-700'}`}>
                                            <method.icon className="w-7 h-7" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[12px] font-black uppercase text-white mb-1">{method.label}</div>
                                            <div className="text-[8px] font-bold text-gray-500 uppercase truncate">{method.desc}</div>
                                        </div>
                                        {paymentMethod === method.id && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-500" />}
                                    </button>
                                ))}
                            </div>

                            {(country === 'PE' || country === 'EC') && (
                                <div className="pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => setEmitElectronicInvoice(!emitElectronicInvoice)}
                                        className={`w-full p-8 rounded-[3rem] border-2 transition-all flex items-center justify-between group overflow-hidden relative ${emitElectronicInvoice ? 'bg-emerald-500/10 border-emerald-500 shadow-2xl' : 'bg-black/40 border-white/5'}`}
                                    >
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${emitElectronicInvoice ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-700'}`}>
                                                <ShieldCheck className="w-7 h-7" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-black uppercase text-white tracking-widest leading-none mb-1">Facturación Electrónica {country === 'PE' ? 'SUNAT' : 'SRI'}</div>
                                                <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Enviar comprobante legal {country === 'PE' ? 'a ApiSunat' : 'vía ApiConsult'}</div>
                                            </div>
                                        </div>
                                        <div className={`w-14 h-7 rounded-full relative transition-all border-2 shrink-0 ${emitElectronicInvoice ? 'bg-emerald-500 border-emerald-500' : 'bg-zinc-900 border-white/10'}`}>
                                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${emitElectronicInvoice ? 'left-8' : 'left-0.5'}`} />
                                        </div>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-10 py-12">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-pulse">
                                    <CheckCircle2 className="w-16 h-16" />
                                </div>
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-black p-1.5 rounded-full shadow-lg">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black uppercase text-white tracking-widest italic">Venta Exitosa</h3>
                                <p className="text-emerald-500/60 text-xs font-bold uppercase tracking-[0.2em]">{invoiceResult?.msg}</p>
                            </div>

                            {invoiceResult?.detail && (
                                <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/20 w-full space-y-4 shadow-2xl relative overflow-hidden">
                                    <div className="flex items-center justify-between text-left">
                                        <div>
                                            <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.3em]">Clave de Acceso {country === 'EC' ? 'SRI' : 'SUNAT'}</span>
                                        </div>
                                        <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase">Autorizado</span>
                                    </div>
                                    <div className="text-[11px] font-mono text-white break-all leading-relaxed bg-black/60 p-6 rounded-3xl border border-white/10 select-all transition-all cursor-pointer group relative">
                                        {invoiceResult.detail}
                                        <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <Copy className="w-3 h-3 text-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 w-full">
                                <button onClick={() => window.print()} className="flex-1 py-6 bg-zinc-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[2rem] border border-white/10 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                                    <Printer className="w-4 h-4" /> Comprobante
                                </button>
                                <button onClick={() => { setInvoiceResult(null); onClose(); }} className="flex-[2] py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-[2rem] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/10">
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!invoiceResult && (
                    <PaymentPanel
                        country={country}
                        currency={currency}
                        total={total}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        receivedAmount={receivedAmount}
                        setReceivedAmount={setReceivedAmount}
                        isIssuingInvoice={isIssuingInvoice}
                        emitElectronicInvoice={emitElectronicInvoice}
                        setEmitElectronicInvoice={setEmitElectronicInvoice}
                        onFinalize={onFinalize}
                    />
                )}
            </motion.div>
        </div>
    );
}
