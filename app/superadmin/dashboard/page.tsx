"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
    LayoutDashboard, DollarSign, PieChart, Activity, Home, Calendar,
    Wallet, FileCheck, AlertCircle, ChevronRight
} from 'lucide-react';
import { 
    PieChart as RePieChart, Pie, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

const formatCurrency = (val: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'USD' }).format(val);

export default function MontebelloDashboard() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const { data: results, error } = await supabase
            .from('contract_reconciliation')
            .select('*')
            .order('lot_id', { ascending: true });
        
        if (error) console.error("Error fetching:", error);
        setData(results || []);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const stats = useMemo(() => {
        const totalVentas = data.reduce((s, i) => s + (Number(i.total_price) || 0), 0);
        const totalRecaudado = data.reduce((s, i) => s + (Number(i.actual_paid_amount) || 0), 0);
        const totalDeudaHoy = data.reduce((s, i) => s + (Number(i.actual_balance_owed) || 0), 0);
        const totalProyectado = data.reduce((s, i) => s + (Number(i.projected_installments_dec2026) || 0), 0);
        const totalEscritura = data.reduce((s, i) => s + (Number(i.balance_due_deed) || 0), 0);
        
        return { totalVentas, totalRecaudado, totalDeudaHoy, totalProyectado, totalEscritura };
    }, [data]);

    const chartData = useMemo(() => [
        { name: 'Recaudado', value: stats.totalRecaudado || 0, color: '#10b981' },
        { name: 'Deuda Hoy', value: stats.totalDeudaHoy || 0, color: '#f59e0b' },
        { name: 'Proyectado', value: stats.totalProyectado || 0, color: '#3b82f6' },
        { name: 'Escritura', value: stats.totalEscritura || 0, color: '#be0b3c' }
    ], [stats]);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Montebello <span className="text-blis-red">Master Panel</span></h1>
                            <button onClick={fetchData} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                        <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" /> Auditoría de Cartera Inmobiliaria v4.1
                        </p>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                        <div className="p-3 bg-emerald-500/10 rounded-xl"><Wallet size={20} className="text-emerald-500" /></div>
                        <div>
                            <p className="text-[9px] font-black text-zinc-600 uppercase">Caja Total (32 Lotes)</p>
                            <p className="text-xl font-black text-white">{formatCurrency(stats.totalVentas)}</p>
                        </div>
                    </div>
                </div>

                {/* Grid de Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Recaudado Real', val: stats.totalRecaudado, icon: FileCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                        { label: 'Deuda Exigible Hoy', val: stats.totalDeudaHoy, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                        { label: 'Proyección 2026/27', val: stats.totalProyectado, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                        { label: 'Saldo Escrituras', val: stats.totalEscritura, icon: Home, color: 'text-blis-red', bg: 'bg-blis-red/5' },
                    ].map((s, i) => (
                        <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
                            <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} blur-3xl rounded-full -translate-y-1/2 translate-x-1/2`} />
                            <s.icon className={`${s.color} mb-4 relative z-10`} size={24} />
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest relative z-10">{s.label}</p>
                            <h4 className="text-3xl font-black text-white mt-1 relative z-10">{formatCurrency(s.val)}</h4>
                        </div>
                    ))}
                </div>

                {/* Tabla y Chart */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    <div className="xl:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                <LayoutDashboard size={18} className="text-blis-red" /> Detalle por Lote
                            </h3>
                            <span className="bg-white/5 text-zinc-500 text-[10px] px-3 py-1 rounded-full font-black">{data.length} EXPEDIENTES</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-black/40">
                                        <th className="p-5 text-[9px] font-black text-zinc-600 uppercase">Lote - Cliente</th>
                                        <th className="p-5 text-[9px] font-black text-zinc-600 uppercase">Recaudado</th>
                                        <th className="p-5 text-[9px] font-black text-amber-500 uppercase">Deuda Hoy</th>
                                        <th className="p-5 text-[9px] font-black text-zinc-600 uppercase text-right">Escritura</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {data.map((row, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-5 font-bold text-xs uppercase">
                                                <span className="text-blis-red mr-2">[{row.lot_id}]</span> {row.client_name}
                                            </td>
                                            <td className="p-5 text-xs font-black text-emerald-500">{formatCurrency(row.actual_paid_amount)}</td>
                                            <td className="p-5 text-xs font-black text-amber-500">{formatCurrency(row.actual_balance_owed)}</td>
                                            <td className="p-5 text-xs font-black text-right">{formatCurrency(row.balance_due_deed)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 self-start">Distribución de Capital</h3>
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie data={chartData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                                        {chartData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none' }} />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full space-y-3 mt-8">
                            {chartData.map((d, i) => (
                                <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase">
                                    <span className="flex items-center gap-2 text-zinc-500">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}
                                    </span>
                                    <span>{formatCurrency(d.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function RefreshCw(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
  )
}
