import { ShieldCheck } from "lucide-react";

export default function AdminLogin() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#be0b3c_0%,transparent_30%)] opacity-[0.1] pointer-events-none" />

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(190,11,60,0.5)]">BLIS CORP</h1>
                    <p className="text-blis-red text-sm font-bold tracking-widest">HQ</p>
                    <p className="text-gray-500 mt-2 text-xs uppercase tracking-widest">Acceso Restringido</p>
                </div>

                <form className="space-y-6 bg-zinc-950/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blis-red rounded-tl-xl m-2 opacity-50"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blis-red rounded-tr-xl m-2 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blis-red rounded-bl-xl m-2 opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blis-red rounded-br-xl m-2 opacity-50"></div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Usuario / Email</label>
                        <input
                            type="email"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blis-red focus:bg-black transition-all"
                            placeholder="admin@bliscorp.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contraseña Segura</label>
                        <input
                            type="password"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blis-red focus:bg-black transition-all font-mono tracking-widest"
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="button" className="w-full bg-blis-red text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all hover:shadow-[0_0_30px_rgba(190,11,60,0.8)] flex items-center justify-center gap-3">
                        <ShieldCheck className="w-5 h-5" /> Entrar al Sistema
                    </button>
                </form>

                <p className="text-center text-xs text-gray-600 mt-8 font-mono">
                    IP Registrada y Monitoreada • Blis Corp SecureNet
                </p>
            </div>
        </div>
    );
}
