import { Activity, Users, Eye, TrendingUp, ShieldCheck, DollarSign, Target, ArrowUpRight, ArrowDownRight, Clock, Star } from "lucide-react";
import { NativeSelect } from "@/components/ui/SearchableSelect";

export default function AdminDashboard() {
    const kpis = [
        { title: "Ingresos (YTD)", value: "$2.4M", trend: "+15.3%", positive: true, icon: DollarSign },
        { title: "Nuevos Prospectos", value: "342", trend: "+24%", positive: true, icon: Target },
        { title: "Conversión de Cierre", value: "4.8%", trend: "-0.5%", positive: false, icon: Activity },
        { title: "TIR Histórica Promedio", value: "22.4%", trend: "+1.2%", positive: true, icon: TrendingUp },
    ];

    const recentTransactions = [
        { client: "Roberto M.", lot: "Fase 1 - Lote 12", amount: "$120,500", status: "Completado", date: "Hoy, 10:42 AM", type: "Liquidación" },
        { client: "Familia Garza", lot: "Premium - Lote 05", amount: "$15,000", status: "Procesando", date: "Hoy, 09:15 AM", type: "Enganche" },
        { client: "Inversiones Capital", lot: "Fase 2 - Multi", amount: "$450,000", status: "Completado", date: "Ayer", type: "Liquidación" },
        { client: "Ana S.", lot: "Fase 1 - Lote 44", amount: "$5,000", status: "Pendiente", date: "Ayer", type: "Apartado" },
    ];

    const recentLeads = [
        { name: "Carlos López", email: "carlos.l@gmail.com", interest: "Alta Plusvalía", time: "hace 5 min" },
        { name: "Diana V.", email: "dvdiana@empresa.com", interest: "Fase 2", time: "hace 32 min" },
        { name: "M. Torres", email: "mtorres90@yahoo.com", interest: "Catálogo General", time: "hace 2 horas" },
    ];

    return (
        <div className="space-y-8 pb-12 w-full px-4 md:px-8 pt-8 md:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Dashboard HQ</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">Centro de comando operativo: Finanzas, CRM, Inventario y Analíticas.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-zinc-950 border border-white/5 p-3.5 sm:p-6 rounded-xl sm:rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blis-red/10 transition-colors" />
                        <div className="flex items-center gap-3 sm:gap-5 relative z-10">
                            <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl shrink-0 ${kpi.positive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-blis-red/10 text-blis-red'}`}>
                                <kpi.icon className="w-5 h-5 sm:w-8 h-8" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[7px] sm:text-xs mb-0.5 sm:mb-1 line-clamp-2 h-[1.8em] sm:h-[2.5em] leading-tight flex items-end">{kpi.title}</p>
                                <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                                    <h3 className="text-xl sm:text-3xl font-black text-white leading-none">{kpi.value}</h3>
                                    <span className={`text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md flex items-center gap-1 ${kpi.positive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-blis-red/10 text-blis-red'}`}>
                                        {kpi.positive ? <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 h-3" /> : <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 h-3" />}
                                        {kpi.trend}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-zinc-950 border border-white/5 rounded-2xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white">Ingresos vs Proyección (2026)</h2>
                        <NativeSelect options={[{ value: 'year', label: 'Este Año' }, { value: '6months', label: 'Últimos 6 Meses' }]} value="year" onChange={() => {}} className="bg-black border border-white/10 text-xs text-gray-400 px-3 py-1 rounded-lg focus:outline-none" />
                    </div>
                    {/* Fake Chart Area */}
                    <div className="flex-1 min-h-[300px] w-full rounded-xl border border-white/5 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] relative flex items-end px-4 gap-4 pb-4 pt-10">
                        {/* SVG Line mockup */}
                        <svg className="absolute inset-0 w-full h-full text-blis-red/40 drop-shadow-[0_0_10px_rgba(190,11,60,0.8)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <path d="M0,90 Q10,70 20,80 T40,60 T60,50 T80,20 T100,10" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path d="M0,90 Q10,70 20,80 T40,60 T60,50 T80,20 T100,10 L100,100 L0,100 Z" fill="currentColor" opacity="0.1" />
                        </svg>
                        {/* Y-Axis Labels */}
                        <div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between text-[10px] text-gray-500 font-mono">
                            <span>$1M</span>
                            <span>$500k</span>
                            <span>$0</span>
                        </div>
                    </div>
                </div>

                {/* Inventory Status */}
                <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-white mb-6">Estado de Inventario</h2>
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        {/* Fake Doughnut */}
                        <div className="w-48 h-48 rounded-full border-[16px] border-zinc-900 border-t-blis-red border-r-blis-red border-b-emerald-500 relative flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                            <div className="text-center">
                                <span className="block text-3xl font-black text-white">124</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Totales</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-gray-400"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Disponibles</span>
                            <span className="font-bold text-white">45 <span className="text-gray-600 font-normal">(36%)</span></span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-gray-400"><span className="w-3 h-3 rounded-full bg-blis-red"></span> Reservados</span>
                            <span className="font-bold text-white">22 <span className="text-gray-600 font-normal">(18%)</span></span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-gray-400"><span className="w-3 h-3 rounded-full bg-zinc-700"></span> Vendidos</span>
                            <span className="font-bold text-white">57 <span className="text-gray-600 font-normal">(46%)</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CRM Row: Transactions & Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Transactions Table */}
                <div className="lg:col-span-2 bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white">Últimas Transacciones (Compras y Reservas)</h2>
                        <button className="text-xs text-blis-red hover:text-white uppercase font-bold tracking-widest transition-colors">Ver Todo</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/[0.02] text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4 font-normal">Cliente</th>
                                    <th className="px-6 py-4 font-normal">Lote / Proyecto</th>
                                    <th className="px-6 py-4 font-normal">Monto</th>
                                    <th className="px-6 py-4 font-normal">Tipo</th>
                                    <th className="px-6 py-4 font-normal">Estado</th>
                                    <th className="px-6 py-4 font-normal">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentTransactions.map((tx, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{tx.client}</td>
                                        <td className="px-6 py-4">{tx.lot}</td>
                                        <td className="px-6 py-4 font-mono text-white">{tx.amount}</td>
                                        <td className="px-6 py-4 text-xs">{tx.type}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${tx.status === 'Completado' ? 'bg-emerald-400/10 text-emerald-400' :
                                                tx.status === 'Procesando' ? 'bg-blue-400/10 text-blue-400' :
                                                    'bg-amber-400/10 text-amber-400'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-2 text-xs">
                                            <Clock className="w-3 h-3" /> {tx.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Hot Leads from Capture popup */}
                <div className="bg-zinc-950 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" /> Prospectos Activos</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {recentLeads.map((lead, i) => (
                            <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-blis-red/30 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-white group-hover:text-blis-red transition-colors">{lead.name}</span>
                                    <span className="text-[10px] text-gray-500">{lead.time}</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">{lead.email}</p>
                                <span className="inline-block px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                                    Interés: <span className="text-white font-medium">{lead.interest}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/5 bg-black">
                        <button className="w-full py-2 bg-white/5 text-gray-300 rounded-lg text-sm font-bold hover:bg-white/10 transition-colors">
                            Ver CRM Completo
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}
