"use client";

import { motion } from "framer-motion";
import { CreditCard, DollarSign, Download, Clock, Star, TrendingUp, Wallet, Loader2, ShoppingBag, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCompras } from "@/lib/hooks/useCompras";
import { useUserStats } from "@/lib/hooks/useUserStats";
import { useState } from "react";

export default function BillingPage() {
    const { user } = useAuth();
    const { compras, loading } = useCompras();
    const { stats, loading: statsLoading } = useUserStats();

    const totalInvertido = compras?.reduce((sum, c) => sum + (c.monto_usd || 0), 0) || 0;
    const blisCoins = stats?.blisCoins || 0;
    const nivel = stats?.nivelInversor || "Bronze";

    return (
        <div className="space-y-10 px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20">
            <div className="w-full mx-auto">
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none">Finanzas & Facturación</h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Gestiona tus pagos, BLISCOINS de lealtad y descarga tus facturas.</p>
            </div>

            {loading || statsLoading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blis-red" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                            <Star className="w-8 h-8 text-emerald-500 mb-4 fill-emerald-500" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">BLISCOINS Acumulados</p>
                            <h3 className="text-4xl font-black text-white">{blisCoins.toLocaleString()} <span className="text-sm text-emerald-500 uppercase">BLIS</span></h3>
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-4">Nivel: {nivel}</p>
                        </div>

                        <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blis-red/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                            <ShoppingBag className="w-8 h-8 text-blis-red mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">Total Adquirido</p>
                            <h3 className="text-4xl font-black text-white">${totalInvertido.toLocaleString()}<span className="text-sm text-blis-red">.00</span></h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">{compras?.length || 0} compras realizadas</p>
                        </div>

                        <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                            <Package className="w-8 h-8 text-white mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">Productos Activos</p>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{compras?.filter(c => c.estado === 'completado').length || 0} activos</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-4">En tu cuenta</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-zinc-950/50 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-lg font-black text-white uppercase tracking-widest">Historial de Compras</h2>
                            </div>
                            <div className="overflow-x-auto">
                                {compras && compras.length > 0 ? (
                                    <table className="w-full text-left text-sm text-gray-400">
                                        <thead className="bg-white/[0.02] text-gray-500 font-bold uppercase tracking-widest text-[9px]">
                                            <tr>
                                                <th className="px-8 py-6 font-normal">Producto</th>
                                                <th className="px-8 py-6 font-normal">Fecha</th>
                                                <th className="px-8 py-6 font-normal">Monto</th>
                                                <th className="px-8 py-6 font-normal">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {compras.slice(0, 10).map((compra, i) => (
                                                <tr key={compra.id || i} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <p className="font-bold text-white uppercase tracking-tight group-hover:text-blis-red transition-colors">
                                                            {compra.producto?.nombre || `Compra #${compra.id?.slice(0, 8)}`}
                                                        </p>
                                                        <span className="text-[9px] text-gray-600 font-black uppercase">{compra.id?.slice(0, 8)}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-xs font-medium">
                                                        {compra.creado_en ? new Date(compra.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                    </td>
                                                    <td className="px-8 py-6 font-mono font-bold text-white">${compra.monto_usd?.toLocaleString() || '0'}.00</td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${
                                                            compra.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            compra.estado === 'pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}>
                                                            {compra.estado || 'completado'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-12 text-center">
                                        <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500 font-bold uppercase text-sm">Sin compras aún</p>
                                        <p className="text-gray-600 text-xs mt-1">Tus transacciones aparecerán aquí</p>
                                    </div>
                                )}
                            </div>
                            {compras && compras.length > 10 && (
                                <div className="p-6 bg-black/40 text-center border-t border-white/5">
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Mostrando las últimas 10 de {compras.length} transacciones.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(190,11,60,0.1)_0%,transparent_50%)] pointer-events-none" />
                                <Wallet className="w-10 h-10 text-blis-red mb-6" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 leading-tight">Resumen Financiero</h3>
                                <div className="space-y-4 mb-8">
                                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest block mb-1">Total Invertido</span>
                                        <span className="text-2xl font-black text-white">${totalInvertido.toLocaleString()}<span className="text-sm text-gray-500">.00</span></span>
                                    </div>
                                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest block mb-1">BLISCOINS</span>
                                        <span className="text-2xl font-black text-emerald-400">{blisCoins.toLocaleString()} <span className="text-sm text-emerald-600">BLIS</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
