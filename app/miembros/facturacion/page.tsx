"use client";

import { motion } from "framer-motion";
import { CreditCard, DollarSign, Download, Clock, Star, TrendingUp, AlertCircle, ChevronRight, Wallet } from "lucide-react";

const BILLING_HISTORY = [
    { id: "inv-102", title: "Masterclass: Inteligencia Competitiva", date: "25 Feb 2026", amount: "$249.00", status: "Pagado" },
    { id: "inv-101", title: "Guía PRO: Cómo Vender tu Inmueble Sin Agentes", date: "12 Feb 2026", amount: "$29.99", status: "Pagado" },
];

export default function BillingPage() {
    return (
        <div className="space-y-10 px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20">
            <div className="w-full mx-auto">
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Finanzas & Facturación</h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">Gestiona tus pagos, BLISCOINS de lealtad y descarga tus facturas oficiales.</p>
            </div>

            {/* Billing Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                    <Star className="w-8 h-8 text-emerald-500 mb-4 fill-emerald-500" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">BLISCOINS Acumulados</p>
                    <h3 className="text-4xl font-black text-white">2,450 <span className="text-sm text-emerald-500 uppercase">BLISCOINS</span></h3>
                    <button className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-4 flex items-center gap-1 hover:text-white transition-colors">
                        Canjear por Créditos <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blis-red/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                    <TrendingUp className="w-8 h-8 text-blis-red mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">Inversión Total Blis</p>
                    <h3 className="text-4xl font-black text-white">$278<span className="text-sm text-blis-red">.99</span></h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">2 Licencias Activas</p>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                    <CreditCard className="w-8 h-8 text-white mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">Método de Pago</p>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">**** 4242</h3>
                    <button className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-4 flex items-center gap-1 hover:text-white transition-colors">
                        Gestionar Tarjetas <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Billing History Table */}
                <div className="lg:col-span-2 bg-zinc-950/50 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-black text-white uppercase tracking-widest">Historial de Transacciones</h2>
                        <button className="text-[10px] text-blis-red font-black uppercase tracking-widest hover:text-white transition-colors">Ver Todo el Año</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/[0.02] text-gray-500 font-bold uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="px-8 py-6 font-normal">Suscripción / Producto</th>
                                    <th className="px-8 py-6 font-normal">Fecha</th>
                                    <th className="px-8 py-6 font-normal">Monto</th>
                                    <th className="px-8 py-6 font-normal">Estado</th>
                                    <th className="px-8 py-6 font-normal">Recibo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {BILLING_HISTORY.map((item, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-white uppercase tracking-tight group-hover:text-blis-red transition-colors">{item.title}</p>
                                            <span className="text-[9px] text-gray-600 font-black uppercase">{item.id}</span>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-medium">{item.date}</td>
                                        <td className="px-8 py-6 font-mono font-bold text-white">{item.amount}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20">
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-black/40 text-center border-t border-white/5">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Se muestran las últimas 2 transacciones del mes de Febrero.</p>
                    </div>
                </div>

                {/* Billing Sidebar: Wallet / Credits */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(190,11,60,0.1)_0%,transparent_50%)] pointer-events-none" />
                        <Wallet className="w-10 h-10 text-blis-red mb-6" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 leading-tight">Créditos Blis en Billetera</h3>
                        <p className="text-gray-500 text-xs font-medium mb-8 leading-relaxed">
                            Usa tus créditos Blis para obtener descuentos directos en cualquier kit o mentoría premium de la tienda.
                        </p>
                        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 mb-8">
                            <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest block mb-1">Saldo Disponible</span>
                            <span className="text-3xl font-black text-white">$45<span className="text-sm text-gray-500">.00</span></span>
                        </div>
                        <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-blis-red hover:text-white transition-all shadow-xl">
                            Añadir Fondos
                        </button>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-[2rem] flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-black text-amber-500 uppercase tracking-tight mb-1">Renovación Próxima</p>
                            <p className="text-[10px] text-gray-500 font-medium">Tienes una licencia corporativa que vence el 15 de Marzo.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
