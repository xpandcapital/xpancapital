import { Globe, Lightbulb, TrendingUp } from "lucide-react";

export default function AdminAnalytics() {
    return (
        <div className="space-y-8 w-full mx-auto px-4 md:px-8 pt-8 md:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Analíticas SEO & Tráfico</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Auditoría detallada de posicionamiento en buscadores (Requiere API Google Search Console).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border border-white/5 p-6 rounded-2xl">
                    <div className="w-12 h-12 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-4">
                        <Globe className="w-6 h-6" />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Impresiones Orgánicas</p>
                    <h3 className="text-3xl font-black text-white">--</h3>
                </div>
                <div className="bg-zinc-950 border border-white/5 p-6 rounded-2xl">
                    <div className="w-12 h-12 rounded-lg bg-blue-400/10 text-blue-400 flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Posición Promedio (SERP)</p>
                    <h3 className="text-3xl font-black text-white">--</h3>
                </div>
                <div className="bg-zinc-950 border border-white/5 p-6 rounded-2xl">
                    <div className="w-12 h-12 rounded-lg bg-blis-red/10 text-blis-red flex items-center justify-center mb-4">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Oportunidades Clave (Keywords)</p>
                    <h3 className="text-3xl font-black text-white">Pendiente</h3>
                </div>
            </div>

            <div className="bg-zinc-950/50 border border-dashed border-white/10 rounded-2xl p-16 text-center">
                <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Conectar Search Console</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Para ver las analíticas orgánicas y descubrir con qué palabras clave te encuentran los clientes en Google, debemos vincular el dominio a través de Google Cloud.</p>
                <button className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-colors font-bold text-sm tracking-wide">
                    Configurar Integración SEO
                </button>
            </div>
        </div>
    );
}
