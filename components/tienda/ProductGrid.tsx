"use client";

import { motion } from "framer-motion";
import { Star, ShoppingCart, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface Product {
    id: string;
    title: string;
    category: string;
    price: number;
    originalPrice?: number;
    rating: number;
    sales: string;
    image: string;
    isHot?: boolean;
}

const DUMMY_PRODUCTS: Product[] = [
    {
        id: "1",
        title: "Plan Anual",
        category: "Cursos",
        price: 599.00,
        originalPrice: 899.00,
        rating: 4.9,
        sales: "+3.8K",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&q=80",
        isHot: true,
    },
    {
        id: "2",
        title: "Plan Trimestral",
        category: "Cursos",
        price: 199.00,
        originalPrice: 299.00,
        rating: 4.8,
        sales: "+960",
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f44f?w=500&q=80",
    },
    {
        id: "3",
        title: "Análisis Técnico Profesional",
        category: "Cursos",
        price: 149.00,
        originalPrice: 249.00,
        rating: 4.7,
        sales: "+1.1K",
        image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=500&q=80",
    },
    {
        id: "4",
        title: "Psicología del Trader",
        category: "Cursos",
        price: 99.00,
        originalPrice: 179.00,
        rating: 4.8,
        sales: "+780",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80",
    },
    {
        id: "5",
        title: "Mentoría 1:1 Trader Profesional",
        category: "Cursos",
        price: 299.00,
        originalPrice: 499.00,
        rating: 5.0,
        sales: "+300",
        image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=500&q=80",
        isHot: true,
    }
];

export function ProductGrid({ data = {} }: { data?: { products?: Product[] } }) {
    const products = data.products || DUMMY_PRODUCTS;
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
            ))}
        </div>
    );
}


function ProductCard({ product, index }: { product: Product; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover="hover"
            whileTap={{ scale: 0.97 }}
            className="group relative flex flex-col glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-blis-red/30 transition-colors"
        >
            {/* Square Image 1:1 Aspect Ratio Container */}
            <div className="relative w-full aspect-square bg-[#0A0D11] overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />

                {/* Shine sweep on hover */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    variants={{
                        initial: { opacity: 0 },
                        hover: { opacity: [0, 0.15, 0], transition: { duration: 0.8 } }
                    }}
                    style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
                    }}
                />

                {/* Visual Overlays & Badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {product.isHot && (
                    <div className="absolute top-3 left-3 bg-blis-red text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(213,193,8,0.6)] animate-pulse">
                        Más Vendido
                    </div>
                )}

                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10">
                    <ShieldCheck className="w-3 h-3 text-[#209f89]" />
                    {product.sales}
                </div>
            </div>

            {/* Bottom Info Layout */}
            <div className="p-5 flex flex-col flex-1 bg-black">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2">{product.category}</p>
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-blis-red transition-colors">
                    {product.title}
                </h3>

                <div className="mt-auto">
                    {/* Trust Signals */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center bg-[#209f89]/10 text-[#209f89] px-2 py-0.5 rounded text-xs font-bold border border-[#209f89]/20">
                            <Star className="w-3 h-3 fill-current mr-1" />
                            {product.rating}
                        </div>
                        <span className="text-gray-500 text-xs">Exclusivo Xpand</span>
                    </div>

                    {/* Price and Action Line — botón deslizante */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            {product.originalPrice && (
                                <span className="text-gray-500 text-xs line-through font-mono">
                                    ${product.originalPrice.toFixed(2)}
                                </span>
                            )}
                            <span className="text-white font-black text-xl tracking-tighter drop-shadow-md">
                                ${product.price.toFixed(2)}
                            </span>
                        </div>

                        <div className="relative overflow-hidden rounded-xl">
                            <motion.button
                                variants={{
                                    initial: { y: 6, opacity: 0.7 },
                                    hover: { y: 0, opacity: 1 }
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-10 h-10 rounded-xl bg-blis-red/20 text-blis-red border border-blis-red/30 flex items-center justify-center hover:bg-blis-red hover:text-white hover:shadow-[0_0_20px_rgba(213,193,8,0.4)] transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

