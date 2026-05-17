"use client";

import { motion } from "framer-motion";
import { FileText, Download, Shield, Clock, ExternalLink, Loader2, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCompras } from "@/lib/hooks/useCompras";
import Link from "next/link";

export default function ContratosPage() {
    const { user } = useAuth();
    const { compras, loading } = useCompras();

    const documentos = compras?.filter(c => c.estado === 'completado') || [];
    const totalDocs = documentos.length;

    return (
        <div className="space-y-10 px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20">
            <div className="w-full mx-auto">
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none">Mis Documentos</h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Accede a tus contratos, guías y documentos legales adquiridos.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blis-red" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                            <Shield className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-4xl font-black text-white">{totalDocs}</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Documentos Adquiridos</p>
                        </div>
                        <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                            <Clock className="w-8 h-8 text-emerald-400 mb-4" />
                            <h3 className="text-4xl font-black text-white">{user?.role === 'admin' || user?.role === 'superadmin' ? 'Premium' : 'Activo'}</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Estado de Cuenta</p>
                        </div>
                        <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                            <Package className="w-8 h-8 text-amber-400 mb-4" />
                            <h3 className="text-4xl font-black text-white">{compras?.length || 0}</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Total de Compras</p>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl">
                        <div className="p-8 border-b border-white/5">
                            <h2 className="text-lg font-black text-white uppercase tracking-widest">Mis Documentos y Guías</h2>
                        </div>
                        {documentos.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {documentos.map((doc, i) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blis-red/10 group-hover:border-blis-red/20 transition-colors">
                                                <FileText className="w-6 h-6 text-gray-400 group-hover:text-blis-red transition-colors" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-white truncate group-hover:text-blis-red transition-colors">
                                                    {doc.producto?.nombre || `Documento #${doc.id?.slice(0, 8)}`}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-gray-600 font-bold uppercase">
                                                        {doc.creado_en ? new Date(doc.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                    <span className="text-[10px] text-emerald-500 font-bold uppercase">Adquirido</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {doc.producto?.nombre && (
                                                <Link
                                                    href={`/miembros/productos/${doc.id}`}
                                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Ver Detalle
                                                </Link>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold uppercase text-sm">Sin documentos aún</p>
                                <p className="text-gray-600 text-xs mt-1">Los documentos de tus compras aparecerán aquí</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
