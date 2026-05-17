"use client";

import { motion } from "framer-motion";
import { Star, ShoppingCart, ShieldCheck, ChevronLeft, ChevronRight, Heart, Clock } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useShop } from "@/context/ShopContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { ProductDef } from "@/lib/types/shop";

const TYPE_STYLES: Record<string, { label: string; color: string }> = {
    cursos: { label: "Curso", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
    ebook: { label: "Ebook", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    contratos: { label: "Contrato", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    kits: { label: "Kit", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    packs: { label: "Pack", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    mentoría: { label: "Mentoría", color: "bg-blis-red/20 text-blis-red border-blis-red/30" },
    general: { label: "Producto", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

interface CategorySliderProps {
    id?: string; // Para el hook de Sidebar (Anchor Link)
    title?: string;
    subtitle?: string;
    products?: ProductDef[];
    data?: {
        id?: string;
        title?: string;
        subtitle?: string;
        products?: ProductDef[];
    };
}

export function ProductCategorySlider(props: CategorySliderProps) {
    const { 
        id = props.data?.id || "products", 
        title = props.data?.title || "Productos", 
        subtitle = props.data?.subtitle || "", 
        products = props.data?.products || [] 
    } = props;

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const checkScroll = () => {
        const el = scrollContainerRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    const slide = (dir: "left" | "right") => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const amount = window.innerWidth >= 1024 ? 700 : 320;
        el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
    };

    return (
        <section id={id} className="scroll-mt-24 mb-20 relative">
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div className="flex-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 mb-2"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            {title}
                        </h2>
                        <span className="h-1 bg-gradient-to-r from-blis-red to-transparent flex-1 hidden md:block max-w-[200px]" />
                    </motion.div>
                    <p className="text-gray-400 font-medium max-w-2xl text-sm md:text-lg leading-relaxed border-l-2 border-white/10 pl-4">
                        {subtitle}
                    </p>
                </div>

                <div className="flex gap-3 self-end md:self-center">
                    <button
                        onClick={() => slide("left")}
                        disabled={!canScrollLeft}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all backdrop-blur-xl group/prev active:scale-95 ${canScrollLeft
                            ? "bg-white/5 border-white/10 text-white hover:bg-white hover:text-black hover:border-white"
                            : "bg-white/5 border-white/5 text-white/10 cursor-not-allowed"
                            }`}
                    >
                        <ChevronLeft className="w-6 h-6 group-hover/prev:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => slide("right")}
                        disabled={!canScrollRight}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all backdrop-blur-xl group/next active:scale-95 ${canScrollRight
                            ? "bg-white/5 border-white/10 text-white hover:bg-white hover:text-black hover:border-white"
                            : "bg-white/5 border-white/5 text-white/10 cursor-not-allowed"
                            }`}
                    >
                        <ChevronRight className="w-6 h-6 group-hover/next:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* overflow-hidden clips the cards to this container, preventing page-level horizontal scroll */}
            <div className="overflow-hidden">
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    className="flex overflow-x-auto gap-6 pb-12 pt-2 scrollbar-hide snap-x snap-mandatory"
                >
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="snap-start flex-shrink-0 w-[280px] md:w-[330px] group relative flex flex-col glass-card rounded-3xl overflow-hidden border border-white/5 hover:border-blis-red/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(190,11,60,0.2)]"
                        >
                            <ProductCardInner
                                product={product}
                                onTriggerAuth={() => setIsAuthModalOpen(true)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Factorizamos la lógica de Tarjeta que antes vivía en el Grid (ProductCard)
function ProductCardInner({ product, onTriggerAuth }: { product: ProductDef, onTriggerAuth: () => void }) {
    const { user } = useAuth();
    const { favorites, toggleFavorite, addToCart, openCart, blisCoins, purchasedProducts } = useShop();
    const { showToast } = useToast();
    const router = useRouter();
    const isLiked = favorites.some(fav => fav.id === product.id);
    const isPurchased = purchasedProducts.some(p => p.id === product.id);
    const categoryKey = product.category?.toLowerCase() || 'general';
    const typeStyle = TYPE_STYLES[categoryKey] || { label: product.category || 'Producto', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };

    return (
        <div className="flex flex-col flex-1">
            <div className="relative w-full aspect-square bg-[#0A0D11] overflow-hidden">
                <Link href={`/tienda/producto/${product.slug || product.id}`} className="absolute inset-0 z-0">
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                        quality={90}
                    />
                </Link>

                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />

                {isPurchased && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.6)] z-10">
                        ✓ Ya Comprado
                    </div>
                )}

                {product.isHot && !isPurchased && (
                    <div className="absolute top-4 right-4 bg-blis-red text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(190,11,60,0.6)] animate-pulse z-10">
                        Top Vendedor
                    </div>
                )}

                {(product as any).hasTimer && (
                    <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-blis-red to-amber-600 backdrop-blur-xl text-white border border-white/20 p-2.5 rounded-2xl flex items-center justify-between shadow-[0_10px_30px_rgba(190,11,60,0.4)] z-10">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 animate-spin-slow" />
                            <span className="text-[10px] uppercase tracking-tighter font-black">Oferta Limitada</span>
                        </div>
                        <span className="text-[12px] font-mono font-black tracking-widest bg-black/20 px-2 py-0.5 rounded-lg">12:44:09</span>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1 bg-[#050505] relative">
                <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${typeStyle.color}`}>
                        {typeStyle.label}
                    </span>
                    <div className="flex items-center bg-white/5 px-2 py-0.5 rounded text-emerald-400 text-[9px] font-black border border-white/10">
                        <Star className="w-3 h-3 fill-current mr-1 text-[8px]" />
                        {product.rating}
                    </div>
                </div>

                <Link href={`/tienda/producto/${product.slug || product.id}`}>
                    <h3 className="text-lg md:text-xl font-black text-white mb-4 line-clamp-2 leading-tight group-hover:text-blis-red transition-all duration-300 tracking-tight">
                        {product.title}
                    </h3>
                </Link>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            {product.originalPrice ? (
                                <span className="text-gray-600 text-[12px] line-through font-mono leading-none mb-1">
                                    ${product.originalPrice.toFixed(2)}
                                </span>
                            ) : (
                                <div className="h-[12px] mb-1" />
                            )}
                            <div className="flex flex-col">
                                <span className="text-white font-black text-3xl tracking-tighter leading-none">
                                    ${product.price.toFixed(2)}
                                </span>
                                <span className={`text-emerald-500 font-black text-[10px] mt-2 flex items-center gap-1 uppercase tracking-widest transition-opacity ${user ? 'opacity-100' : 'opacity-40'}`} suppressHydrationWarning>
                                    {Math.round(product.price * 10).toLocaleString()} BLISC
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!user) {
                                        onTriggerAuth();
                                    } else {
                                        toggleFavorite({
                                            id: product.id,
                                            title: product.title,
                                            image: product.image,
                                            price: product.price
                                        });
                                    }
                                }}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${isLiked
                                    ? 'bg-blis-red border-blis-red text-white shadow-[0_0_20px_rgba(190,11,60,0.4)]'
                                    : 'bg-white/5 border-white/10 text-white hover:bg-white hover:text-black hover:border-white'}`}
                                title="Favoritos"
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            </button>

                            <button
                                onClick={() => {
                                    if (isPurchased) {
                                        showToast("Ya has comprado este producto.", "info");
                                        return;
                                    }
                                    addToCart({
                                        id: product.id,
                                        title: product.title,
                                        image: product.image,
                                        price: product.price
                                    })
                                    showToast(`"${product.title}" agregado al carrito`, "success");
                                    openCart();
                                }}
                                disabled={isPurchased}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-90 group/cart ${isPurchased ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-blis-red hover:text-white'}`}
                                title={isPurchased ? "Ya comprado" : "Añadir al Carrito"}
                            >
                                <ShoppingCart className="w-6 h-6 group-hover/cart:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {user && !isPurchased && (
                        <button
                            onClick={() => {
                                const coinPrice = product.precio_coins || Math.round((product.price || 0) * 10);
                                if (blisCoins < coinPrice) {
                                    showToast("No tienes suficientes BLISCOINS para este producto.", "error");
                                    return;
                                }
                                addToCart({
                                    id: product.id,
                                    title: product.title,
                                    image: product.image,
                                    price: product.price,
                                    productType: product.productType,
                                    precio_coins: product.precio_coins,
                                    curso_id: product.curso_id,
                                    slug: product.slug,
                                });
                                router.push('/tienda/checkout?redeem=1');
                            }}
                            className="w-full py-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-white transition-all font-black uppercase tracking-widest text-[11px] group/redeem"
                        >
                            <Star className="w-4 h-4 fill-current group-hover/redeem:animate-spin" />
                            Canjear por BLISCOINS
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
