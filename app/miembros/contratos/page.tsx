"use client";

import { motion } from "framer-motion";
import { FileText, Download, ShieldCheck, Eye, Search, Filter, Clock, ChevronRight } from "lucide-react";

const MY_CONTRACTS = [
    {
        id: "con1",
        title: "Contrato de Arrendamiento - Blindaje 360",
        version: "v2.1",
        date: "Hoy, 14:20",
        size: "1.2 MB",
        status: "Listo",
        type: "PDF / Word"
    },
    {
        id: "con2",
        title: "Promesa de Compraventa Irrevocable",
        version: "v1.0",
        date: "15 Feb 2026",
        size: "2.5 MB",
        status: "Listo",
        type: "PDF"
    }
];

export default function ContractsPage() {
    return (
        <div className="space-y-10 px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Mis Contratos</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">Documentación legal y plantillas de alta coercibilidad preparadas para tus operaciones.</p>
                </div>
                <div className="relative w-full sm:w-80 mt-4 sm:mt-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar contrato..."
                        className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-blis-red focus:bg-white/10 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-6 mb-4">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Documentos Recientes</span>
                        <button className="flex items-center gap-2 text-[10px] font-black text-blis-red uppercase tracking-widest hover:text-white transition-colors">
                            <Filter className="w-3 h-3" /> Filtrar por Tipo
                        </button>
                    </div>

                    {MY_CONTRACTS.map((doc, i) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-zinc-950/50 border border-white/5 rounded-3xl p-6 hover:bg-zinc-900 transition-all group flex flex-col sm:flex-row items-center gap-6 shadow-xl"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blis-red/10 border border-blis-red/20 flex items-center justify-center text-blis-red group-hover:bg-blis-red group-hover:text-white transition-all">
                                <FileText className="w-8 h-8" />
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1 group-hover:text-blis-red transition-colors">{doc.title}</h3>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Generado: {doc.date}</span>
                                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Versión {doc.version}</span>
                                    <span className="text-white/20">|</span>
                                    <span className="text-white/40">{doc.type}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-2xl transition-all">
                                    <Eye className="w-5 h-5" />
                                </button>
                                <button className="px-6 py-4 bg-blis-red text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:shadow-[0_0_20px_rgba(190,11,60,0.4)] transition-all flex items-center gap-2">
                                    <Download className="w-4 h-4" /> Bajar
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    <div className="p-8 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center bg-black/20 hover:bg-white/5 transition-all group cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blis-red" />
                        </div>
                        <h4 className="text-white font-black uppercase tracking-tight text-sm">Ver Historial de Documentos</h4>
                        <p className="text-gray-600 text-[10px] mt-1 font-bold tracking-widest uppercase">Has generado 12 documentos este año</p>
                    </div>
                </div>

                {/* Sidebar: New Document CTA */}
                <div className="space-y-6">
                    <div className="bg-blis-red p-8 rounded-[2.5rem] text-white space-y-6 shadow-[0_20px_40px_rgba(190,11,60,0.3)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                            <ShieldCheck className="w-40 h-40" />
                        </div>

                        <div className="relative z-10">
                            <span className="bg-black/20 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6 inline-block">Asistente Blis Legal</span>
                            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-4">¿Necesitas un nuevo blindaje legal?</h2>
                            <p className="text-white/80 text-sm font-medium mb-8 leading-relaxed">
                                Elige una plantilla estandarizada y nuestro sistema la autocompletará con tus datos de perfil en segundos.
                            </p>
                            <button className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-black hover:text-white transition-all shadow-xl">
                                Crear Nuevo Documento
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem]">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Soporte Legal Directo</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                    <span className="text-xs font-black">SL</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">Abogado Asignado</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Chat Activo 24/7</p>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 transition-all opacity-50 cursor-not-allowed">
                                Iniciar Consultoría VIP
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
