"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldCheck, QrCode, Award, ExternalLink, ArrowRight, BookOpen, User, Calendar, MapPin, Globe, Share2, X } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

function VerificationContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get("code") || "BC-2026-X83K-912L"; // Demo fallback

    const [status, setStatus] = useState<"verifying" | "valid" | "not_found">("verifying");
    const [certData, setCertData] = useState({
        name: "Kevin Valdez",
        course: "Captación Inmobiliaria Pro",
        date: "15 Feb 2026",
        id: code
    });

    useEffect(() => {
        // Mock verification logic based on URL code
        const timer = setTimeout(() => {
            if (code.startsWith("BC") || code === "DEMO") {
                setStatus("valid");
            } else {
                setStatus("not_found");
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [code]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blis-red/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full bg-zinc-950 border border-white/10 rounded-[3rem] p-10 md:p-16 space-y-10 relative z-10 shadow-2xl"
            >
                {/* Status Indicator */}
                <div className="flex flex-col items-center text-center space-y-6">
                    <AnimatePresence mode="wait">
                        {status === "verifying" && (
                            <motion.div
                                key="verifying"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center relative"
                            >
                                <div className="absolute inset-0 border-4 border-white/20 rounded-full border-t-white animate-spin" />
                                <ShieldCheck className="w-10 h-10 text-white/20" />
                            </motion.div>
                        )}
                        {status === "valid" && (
                            <motion.div
                                key="valid"
                                initial={{ scale: 0.8, opacity: 0, rotate: -20 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center relative shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                            >
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                <motion.div
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 bg-emerald-500/10 rounded-full"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-black uppercase tracking-tighter">
                            {status === "verifying" ? "Verificando..." : "Credencial Válida"}
                        </h1>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest px-4 py-1.5 bg-white/5 rounded-full inline-block border border-white/5">
                            ID: {code}
                        </p>
                    </div>
                </div>

                {status === "valid" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-6">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blis-red">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Curso Completado</p>
                                    <h2 className="text-lg font-black text-white leading-tight">{certData.course}</h2>
                                </div>
                            </div>

                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-6">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Titular de la Credencial</p>
                                    <h2 className="text-lg font-black text-white leading-tight">{certData.name}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Fecha de Logro</p>
                                <p className="text-sm font-black text-white">{certData.date}</p>
                            </div>
                            <div className="text-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Emitido por</p>
                                <p className="text-sm font-black text-white">BlisCorp Academy</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button className="w-full py-5 bg-blis-red text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                <Globe className="w-4 h-4" /> Ir a BlisCorp Academy
                            </button>
                            <button className="w-full py-5 bg-white/5 border border-white/10 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                <Share2 className="w-4 h-4" /> Compartir en LinkedIn
                            </button>
                        </div>
                    </motion.div>
                )}

                {status === "not_found" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8 flex flex-col items-center text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                            <X className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Credencial No Encontrada</h2>
                            <p className="text-gray-500 text-sm">El código de verificación proporcionado no coincide con nuestros registros. Por favor, verifica el enlace o contacta a soporte.</p>
                        </div>
                        <button
                            onClick={() => window.location.href = "/"}
                            className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all"
                        >
                            Volver al Inicio
                        </button>
                    </motion.div>
                )}

                <div className="pt-10 border-t border-white/5 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 text-white/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-[0.4em]">Node Secured Protocol v4.0</span>
                    </div>
                </div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-10 text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] flex items-center gap-4"
            >
                Blis Corp <span className="w-1 h-1 bg-gray-800 rounded-full" /> Digital Trust Network
            </motion.p>
        </div>
    );
}

export default function VerificationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blis-red/20 border-t-blis-red rounded-full animate-spin"></div>
            </div>
        }>
            <VerificationContent />
        </Suspense>
    );
}
