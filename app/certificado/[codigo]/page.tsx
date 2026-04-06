"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
    Award, CheckCircle2, XCircle, 
    Calendar, User, BookOpen, Loader2,
    Download
} from "lucide-react";
import { useParams } from "next/navigation";
import { useVerifyCertificado } from "@/lib/hooks/useCertificados";

export default function CertificadoPage() {
    const params = useParams();
    const codigo = params.codigo as string;
    const { certificado, valid, loading, error } = useVerifyCertificado(codigo);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        document.title = valid ? "Certificado Válido | BLIS Corp" : "Verificar Certificado | BLIS Corp";
    }, [valid]);

    const handleDownload = async () => {
        if (!certificado?.id) return;
        
        setDownloading(true);
        try {
            const response = await fetch(`/api/certificados/pdf?id=${certificado.id}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificado-${codigo}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            console.error('Error downloading certificate');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                {valid && certificado ? (
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500/20 to-blis-red/20 px-8 py-4 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-bold text-emerald-400">
                                    CERTIFICADO VÁLIDO
                                </span>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 text-center space-y-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blis-red to-amber-500 rounded-full">
                                <Award className="w-10 h-10 text-white" />
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-gray-400 uppercase tracking-widest">
                                    Este certificado verifica que
                                </p>
                                <h1 className="text-3xl md:text-4xl font-black text-white">
                                    {certificado.nombre}
                                </h1>
                            </div>

                            {certificado.curso && (
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                                    <BookOpen className="w-5 h-5 text-blis-red" />
                                    <div className="text-left">
                                        <p className="text-xs text-gray-500">ha completado satisfactoriamente el curso</p>
                                        <p className="text-lg font-bold text-white">
                                            {certificado.curso.nombre}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <Calendar className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 mb-1">Fecha de emisión</p>
                                    <p className="text-sm font-bold text-white">
                                        {new Date(certificado.fecha_emision).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <User className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 mb-1">Código de verificación</p>
                                    <p className="text-xs font-mono font-bold text-white break-all">
                                        {certificado.codigo_verificacion}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blis-red text-white font-bold text-sm rounded-xl hover:bg-blis-red/80 transition-colors disabled:opacity-50"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Descargando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Descargar PDF
                                    </>
                                )}
                            </button>

                            <div className="border-t border-white/10 pt-8">
                                <p className="text-[10px] text-gray-600 tracking-widest">
                                    Emitido por BLIS CORP
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-zinc-900 border border-red-500/20 rounded-[2rem] p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Certificado No Válido
                        </h1>
                        
                        <p className="text-gray-400 mb-6">
                            {error || "El código de verificación no corresponde a ningún certificado válido."}
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                            <p className="text-xs text-gray-500 mb-1">Código proporcionado:</p>
                            <p className="font-mono text-sm text-white">
                                {codigo}
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}