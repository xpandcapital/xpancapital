"use client";

import { Award } from "lucide-react";

export default function MisCertificadosPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20">
            <div className="p-6 bg-zinc-900/50 rounded-full border border-white/5">
                <Award className="w-12 h-12 text-zinc-700" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Certificados en Proceso</h1>
                <p className="text-gray-400 mt-2 font-light max-w-xl mx-auto leading-tight text-xs sm:text-sm">
                    Estamos actualizando nuestro motor de generación de títulos. Tus logros están seguros y estarán disponibles muy pronto con un nuevo diseño premium.
                </p>
            </div>
        </div>
    );
}
