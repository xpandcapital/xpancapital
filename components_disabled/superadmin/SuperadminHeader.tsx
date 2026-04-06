import { Bell, Search } from "lucide-react";

export function SuperadminHeader() {
    return (
        <header className="h-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar proyectos, artículos..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blis-red focus:bg-white/10 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-gray-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blis-red rounded-full shadow-[0_0_8px_rgba(190,11,60,1)] text-[8px] flex items-center justify-center font-bold text-white"></span>
                </button>
                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="w-10 h-10 rounded-full bg-blis-red/20 border border-blis-red/50 flex items-center justify-center text-blis-red font-bold">
                        A
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-white">Super Administrador</p>
                        <p className="text-xs text-gray-500">Acceso Total</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
