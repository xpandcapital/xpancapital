"use client";

import { motion } from "framer-motion";
import {
    Play,
    FileText,
    Download,
    ChevronRight,
    Clock,
    Star,
    Trophy,
    TrendingUp,
    Zap,
    DownloadCloud
} from "lucide-react";
import Image from "next/image";

export default function UserDashboard() {
    const stats = [
        { title: "Cursos Completados", value: "3/8", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
        { title: "Documentos Listos", value: "12", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Tiempo de Estudio", value: "24h", icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
        { title: "Plusvalía Estimada", value: "+18%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "BLISCOINS", value: "2,450", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { title: "Nivel de Inversor", value: "Gold", icon: Zap, color: "text-blis-red", bg: "bg-blis-red/10" },
    ];

    const myCourses = [
        {
            title: "Captación Inmobiliaria Desde Cero",
            progress: 75,
            image: "/images/CURSO-CAPTACIÓN INMOBILIARIA DESDE CERO.webp",
            lastAccessed: "Hace 2 horas"
        },
        {
            title: "Cero Fallos: Vende Rápido y al Mejor Precio",
            progress: 30,
            image: "/images/CURSO-Como vender inmuebles sin errores.webp",
            lastAccessed: "Ayer"
        }
    ];

    const recentDownloads = [
        { name: "Contrato Arrendamiento_V1.pdf", size: "2.4 MB", date: "Hoy" },
        { name: "Ebook_Vendedor_PRO.pdf", size: "15.8 MB", date: "24 Feb" },
        { name: "Checklist_Inversionista.xlsx", size: "1.1 MB", date: "20 Feb" },
    ];

    return (
        <div className="space-y-10 pb-20 px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-gradient-to-r from-blis-red/10 to-transparent p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blis-red/20 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full sm:w-auto"
                >
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 leading-none sm:leading-tight">
                        Bienvenido, <span className="text-blis-red">Kevin Valdez</span>
                    </h1>
                    <p className="text-gray-400 font-medium text-xs sm:text-sm max-w-xl">Tienes 2 cursos pendientes por terminar y 3 nuevos recursos VIP disponibles.</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                    <button className="w-full sm:w-auto bg-white text-black font-black uppercase tracking-widest px-6 py-4 sm:py-3 rounded-2xl hover:bg-blis-red hover:text-white transition-all text-xs flex justify-center items-center shadow-xl">
                        Ir a la Academia
                    </button>
                    <button className="w-full sm:w-auto bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest px-6 py-4 sm:py-3 rounded-2xl hover:bg-white/10 transition-all text-xs flex justify-center items-center">
                        Nuevo Contrato
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-black/40 border border-white/5 py-2 px-3 sm:py-4 sm:px-6 rounded-xl sm:rounded-2xl group hover:border-white/10 transition-all relative overflow-hidden"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl w-max ${stat.bg} ${stat.color} flex-shrink-0`}>
                                <stat.icon className="w-4 h-4 sm:w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-[7px] sm:text-xs mb-0 sm:mb-1 line-clamp-2 h-[1.8em] sm:h-[2.5em] leading-tight flex items-end">{stat.title}</p>
                                <h3 className="text-lg sm:text-2xl font-black text-white leading-none">{stat.value}</h3>
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                            <Zap className="w-8 h-8 text-white/5" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Courses Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            Continuar Aprendiendo
                            <span className="h-px bg-white/10 flex-1 hidden md:block w-32" />
                        </h2>
                        <button className="text-xs text-blis-red font-black uppercase tracking-widest hover:text-white transition-colors">Ver Todo</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {myCourses.map((course, i) => (
                            <div key={i} className="group cursor-pointer bg-black/40 border border-white/5 rounded-[1.5rem] overflow-hidden hover:border-blis-red/30 transition-all flex flex-col">
                                <div className="aspect-square relative overflow-hidden">
                                    <Image
                                        src={course.image}
                                        alt={course.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-blis-red flex items-center justify-center shadow-[0_0_20px_rgba(190,11,60,0.6)]">
                                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex justify-between items-center text-[8px] font-black text-white uppercase tracking-widest mb-1.5">
                                            <span>Progreso</span>
                                            <span>{course.progress}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progress}%` }}
                                                className="h-full bg-blis-red shadow-[0_0_10px_rgba(190,11,60,0.8)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <h4 className="text-white font-black uppercase tracking-tight text-sm mb-2 leading-tight group-hover:text-blis-red transition-colors line-clamp-2 h-[2.5rem]">{course.title}</h4>
                                    <div className="flex items-center gap-2 text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                                        <Clock className="w-2.5 h-2.5" />
                                        <span>{course.lastAccessed}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Column: Downloads & Perks */}
                <div className="space-y-8">
                    {/* Downloads Card */}
                    <div className="bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Descargas Recientes</h2>
                            <DownloadCloud className="w-4 h-4 text-blis-red" />
                        </div>
                        <div className="p-4 space-y-2">
                            {recentDownloads.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="p-2 bg-black rounded-lg text-white group-hover:text-blis-red transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <h5 className="text-xs font-bold text-white truncate">{doc.name}</h5>
                                            <span className="text-[10px] text-gray-500 uppercase font-black">{doc.size}</span>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:text-blis-red transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/5 bg-black">
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                Gestionar Recursos <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Pro Insight Card */}
                    <div className="bg-gradient-to-br from-blis-red to-red-900 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(190,11,60,0.2)] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                            <Star className="w-24 h-24 stroke-[2px]" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 relative z-10">¿Sabías que...?</h3>
                        <p className="text-white/80 text-sm font-medium mb-8 leading-relaxed relative z-10">
                            Los inversores que utilizan el <b>Arsenal de Licitaciones</b> junto con el curso de <b>Captación</b> han reportado una tasa de cierre un 40% mayor este trimestre.
                        </p>
                        <button className="w-full bg-white text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-xl hover:scale-105 transition-transform relative z-10">
                            Explorar Licitaciones
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
