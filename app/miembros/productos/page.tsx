"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Play, Download, ExternalLink, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MY_PRODUCTS = [
    {
        id: "cu1",
        title: "Captación Inmobiliaria Desde Cero: De Tocar Puertas a Cerrar Exclusivas",
        category: "Capacitaciones",
        type: "Curso",
        image: "/images/CURSO-CAPTACIÓN INMOBILIARIA DESDE CERO.webp",
        purchaseDate: "12 Feb 2026",
        status: "En Progreso (75%)",
        accent: "sky"
    },
    {
        id: "cu2",
        title: "Cero Fallos: Vende Rápido y al Mejor Precio",
        category: "Capacitaciones",
        type: "Curso",
        image: "/images/CURSO-Como vender inmuebles sin errores.webp",
        purchaseDate: "15 Feb 2026",
        status: "Iniciado (30%)",
        accent: "sky"
    },
    {
        id: "k1",
        title: "Pack VIP: Contratos de Corretaje (Venta y Alquiler)",
        category: "Kits de Agentes",
        type: "Kit",
        image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&aspect=1",
        purchaseDate: "20 Feb 2026",
        status: "Disponible",
        accent: "orange"
    }
];

export default function ProductsPage() {
    return (
        <div className="space-y-8 px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Mis Compras</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">Gestiona tus herramientas, kits y capacitaciones adquiridas.</p>
                </div>
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mt-4 sm:mt-0 w-full sm:w-auto overflow-x-auto">
                    <button className="px-4 py-2 sm:py-3 bg-blis-red text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg flex-1 sm:flex-none whitespace-nowrap">Todos</button>
                    <button className="px-4 py-2 sm:py-3 text-gray-400 hover:text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-colors flex-1 sm:flex-none whitespace-nowrap">Cursos</button>
                    <button className="px-4 py-2 sm:py-3 text-gray-400 hover:text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-colors flex-1 sm:flex-none whitespace-nowrap">Kits</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {MY_PRODUCTS.map((product, i) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden hover:border-blis-red/30 transition-all flex flex-col"
                    >
                        <div className="relative w-full pb-[100%] overflow-hidden bg-black">
                            <div className="absolute inset-0">
                                <Image
                                    src={product.image}
                                    alt={product.title}
                                    fill
                                    className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

                            <div className="absolute top-4 left-4">
                                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/10">
                                    {product.type}
                                </span>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="w-14 h-14 rounded-full bg-blis-red flex items-center justify-center shadow-[0_0_20px_rgba(190,11,60,0.6)]">
                                    {product.type === "Curso" ? <Play className="w-5 h-5 text-white fill-white ml-1" /> : <Download className="w-5 h-5 text-white" />}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <p className="text-blis-red font-black uppercase tracking-widest text-[10px] mb-2">{product.category}</p>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 leading-tight group-hover:text-blis-red transition-colors min-h-[50px]">
                                {product.title}
                            </h3>

                            <div className="mt-auto space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    <span>Adquirido: {product.purchaseDate}</span>
                                    <span className="text-white">{product.status}</span>
                                </div>

                                <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2">
                                    {product.type === "Curso" ? "Continuar Lección" : "Descargar Archivos"}
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Placeholder for "Add More" */}
                <Link href="/tienda" className="border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center group hover:border-blis-red/20 transition-all hover:bg-blis-red/5">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blis-red transition-colors">
                        <ShoppingBag className="w-6 h-6 text-gray-500 group-hover:text-white" />
                    </div>
                    <h3 className="text-white font-black uppercase tracking-tight">Adquirir Más Herramientas</h3>
                    <p className="text-gray-500 text-xs mt-2 font-medium">Explora el catálogo completo de BlisTienda.</p>
                </Link>
            </div>
        </div>
    );
}

