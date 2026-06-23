"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star, ShoppingCart, ShieldCheck, ChevronLeft, ChevronRight,
    Heart, Clock, CheckCircle2, Truck, RotateCcw, Lock,
    MessageCircle, Users, Eye, TrendingUp, Layers, Info, X, Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { FooterSections } from "@/components/sections/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/components/ui/Toast";
import { useProducts, Producto } from "@/lib/hooks/useProducts";
import { ProductDef, mapProductoToProductDef } from "@/lib/types/shop";

// --- Subcomponentes de Urgencia ---

const UrgencyBar = () => {
    const [timeLeft, setTimeLeft] = useState(454); // 7m 34s = 454 seconds

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full fixed top-[80px] left-0 z-[50] bg-zinc-950/90 backdrop-blur-2xl border-y border-emerald-500/20 py-2.5 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            <motion.div
                animate={{ x: [0, -1500] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="flex whitespace-nowrap gap-20 items-center"
            >
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
                        <span className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            OFERTA EXPIRA EN: <span className="text-white font-mono text-xs">{formatTime(timeLeft)}</span>
                        </span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> ACCESO INMEDIATO</span>
                        <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> GARANTÍA BLIS CORP</span>
                        <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> PAGO 100% SEGURO</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

const CountdownTimer = ({ duration = 300 }: { duration?: number }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-blis-red uppercase tracking-widest mb-1">La oferta finaliza en:</span>
            <div className="flex gap-2">
                {formatTime(timeLeft).split(':').map((part, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="bg-zinc-900 border border-white/5 w-12 h-12 rounded-xl flex items-center justify-center">
                            <span className="text-2xl font-black text-white font-mono">{part}</span>
                        </div>
                        {i < 2 && <span className="text-blis-red font-black text-xl">:</span>}
                    </div>
                ))}
            </div>
            <div className="flex w-full justify-between px-2 mt-1 text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                <span>Horas</span>
                <span>Minutos</span>
                <span>Segundos</span>
            </div>
        </div>
    );
};

const TestimonialSlider = () => {
    const [current, setCurrent] = useState(0);
    const testimonials = [
        {
            name: "Natalia Gomez",
            avatar: "https://i.pravatar.cc/100?u=natalia",
            text: "¡Increíble producto! Fue la mejor inversión de mi carrera en ventas digitales.",
            role: "Inversionista Digital"
        },
        {
            name: "Marco Reus",
            avatar: "https://i.pravatar.cc/100?u=marco",
            text: "La calidad de los contratos es de otro nivel. Ahorré meses de trabajo legal.",
            role: "Emprendedor Tech"
        },
        {
            name: "Elena Velez",
            avatar: "https://i.pravatar.cc/100?u=elena",
            text: "El soporte y la comunidad Blis son brutales. Recomendado 100%.",
            role: "Consultora Digital"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative overflow-hidden h-32">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 ring-2 ring-blis-red/20">
                            <Image src={testimonials[current].avatar} width={40} height={40} alt="User" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <p className="text-[11px] font-black text-white uppercase tracking-tighter">{testimonials[current].name}</p>
                                <CheckCircle2 className="w-3 h-3 text-blue-400 fill-current" />
                            </div>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{testimonials[current].role}</p>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">"{testimonials[current].text}"</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const LiveNotification = () => {
    const [show, setShow] = useState(false);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");

    const names = ["Carlos R.", "María G.", "Pedro S.", "Lucía M.", "Juan P.", "Elena V."];
    const locations = ["Quito", "Guayaquil", "Cuenca", "Manta", "Ambato", "Loja"];

    useEffect(() => {
        const interval = setInterval(() => {
            setName(names[Math.floor(Math.random() * names.length)]);
            setLocation(locations[Math.floor(Math.random() * locations.length)]);
            setShow(true);
            setTimeout(() => setShow(false), 5000);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="fixed bottom-6 left-6 z-[100] bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-2xl max-w-xs"
                >
                    <div className="w-12 h-12 rounded-full bg-blis-red/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-blis-red" />
                    </div>
                    <div>
                        <p className="text-white text-xs font-black uppercase tracking-tighter">{name} acaba de comprar!</p>
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Desde {location}</p>
                        <p className="text-emerald-500 text-[9px] font-black mt-1">HACE 2 MINUTOS</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Main Page Component ---

// mapProductoToProductDef ya importado desde @/lib/types/shop

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { addToCart, toggleFavorite, favorites, coinsEnabled, purchasedProducts } = useShop();
    const { showToast } = useToast();
    const { fetchProductBySlug, loading } = useProducts();

    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [scrolled, setScrolled] = useState(false);
    const [memberCount, setMemberCount] = useState(0);
    const [product, setProduct] = useState<ProductDef | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"descripcion" | "detalles" | "reviews">("descripcion");

    const isLiked = product ? favorites.some(fav => fav.id === product.id) : false;
    const purchasedInfo = product ? purchasedProducts.find(p => p.id === product.id) : null;
    const isPurchased = !!purchasedInfo;
    const purchasedCursoId = purchasedInfo?.curso_id || null;

    // Load product from Supabase or fallback to mock
    useEffect(() => {
        const loadProduct = async () => {
            setIsLoading(true);
            
            // Try to fetch from Supabase
            const supabaseProduct = await fetchProductBySlug(id);
            
            if (supabaseProduct) {
                setProduct(mapProductoToProductDef(supabaseProduct));
            }
            
            setIsLoading(false);
        };
        
        loadProduct();
        setMemberCount(Math.floor(Math.random() * 5000) + 2000);
    }, [id, fetchProductBySlug]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 100);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (isLoading) {
        return (
            <main className="bg-[#050505] min-h-screen text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </main>
        );
    }

    if (!product) {
        return (
            <main className="bg-[#050505] min-h-screen text-white flex flex-col items-center justify-center">
                <p className="text-gray-400 mb-4">Producto no encontrado</p>
                <button 
                    onClick={() => router.push('/tienda')}
                    className="px-6 py-3 bg-white text-black font-black uppercase text-sm rounded-xl hover:bg-blis-red hover:text-white transition-all"
                >
                    Volver a la Tienda
                </button>
            </main>
        );
    }

    const discountPercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    return (
        <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-blis-red selection:text-white relative">
            {/* Liquid Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blis-red/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] bg-blue-600/5 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[80px]" />
            </div>

            <CustomCursor />
            <Header />
            <LiveNotification />

            {/* Top Urgency Bar (Fixed & Full Width) */}
            <UrgencyBar />

            {/* Spacer to push content below the fixed bars (Header 80px + UrgencyBar 52px) */}
            <div className="h-[132px]" />

            <div className="pb-20 px-4 md:px-8 lg:px-16 max-w-[1600px] mx-auto relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                    {/* Left Column: Galería + Tabs */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Imagen principal */}
                        <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 aspect-[4/3]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 1.03 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={(product.images?.[activeImage]) || product.image}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        unoptimized
                                    />
                                </motion.div>
                            </AnimatePresence>
                            {/* Badge descuento */}
                            {discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 bg-blis-red text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg z-10">
                                    -{discountPercentage}% OFF
                                </div>
                            )}
                            {/* Favorito */}
                            <button
                                onClick={() => toggleFavorite({ id: product.id, title: product.title, image: product.image, price: product.price, category: product.category })}
                                className={`absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center border transition-all z-10 ${isLiked ? "bg-pink-500/20 border-pink-500/40 text-pink-400" : "bg-black/50 border-white/10 text-gray-400 hover:text-pink-400"}`}
                            >
                                <Heart className={`w-5 h-5 transition-all ${isLiked ? "fill-pink-400" : ""}`} />
                            </button>
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2.5rem] pointer-events-none" />
                        </div>

                        {/* Thumbnails galería */}
                        {(product.images?.length || 0) > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {product.images!.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-blis-red shadow-[0_0_15px_rgba(190,11,60,0.4)]" : "border-white/10 opacity-60 hover:opacity-100"}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                            <div className="flex border-b border-white/5">
                                {(["descripcion", "detalles", "reviews"] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? "text-white border-b-2 border-blis-red bg-blis-red/5" : "text-gray-500 hover:text-gray-300"}`}
                                    >
                                        {tab === "descripcion" ? "Descripción" : tab === "detalles" ? "Detalles" : "Reviews"}
                                    </button>
                                ))}
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-6"
                                >
                                    {activeTab === "descripcion" && (
                                        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                                            {product.description ? (
                                                <div 
                                                    className="prose prose-invert prose-sm max-w-none [&>h1]:text-lg [&>h1]:font-black [&>h1]:text-white [&>h1]:mb-4 [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-3 [&>h2]:mt-6 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:text-blis-red [&>h3]:mb-2 [&>h3]:mt-4 [&>p]:text-gray-400 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul]:text-gray-400 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol]:text-gray-400 [&>li]:mb-1 [&>img]:rounded-2xl [&>img]:w-full [&>img]:my-4 [&_img]:rounded-xl [&_img]:max-w-full [&>strong]:text-white [&>strong]:font-bold [&>em]:text-gray-300 [&>em]:italic [&_a]:text-blis-red [&_a]:underline [&_a]:hover:text-red-400"
                                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                                />
                                            ) : (
                                                <p>Este producto incluye todo lo necesario para llevar tu negocio inmobiliario al siguiente nivel. Contenido creado por expertos BLIS con más de 10 años de experiencia en el mercado latinoamericano.</p>
                                            )}
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                {["Acceso inmediato tras la compra", "Licencia de uso permanente", "Actualizaciones incluidas", "Soporte prioritario BLIS"].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                                        <span className="text-gray-300">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === "detalles" && (
                                        <div className="space-y-3">
                                            {[
                                                { label: "Categoría", value: product.category },
                                                { label: "Tipo", value: product.productType || "Digital" },
                                                { label: "Formato", value: "PDF / Acceso Online" },
                                                { label: "Idioma", value: "Español" },
                                                { label: "Actualización", value: "Incluida" },
                                                { label: "Stock", value: (product.stock || 999) > 100 ? "Ilimitado" : `${product.stock} unidades` },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex items-center justify-between py-2 border-b border-white/5">
                                                    <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">{label}</span>
                                                    <span className="text-sm text-white font-bold">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeTab === "reviews" && (
                                        <div className="space-y-4">
                                            {(product.reviews || [
                                                { name: "Andrés B.", date: "Hace 1 hora",  comment: "Simplemente brutal. La calidad del contenido es de otro planeta.", rating: 5 },
                                                { name: "Lucía P.",  date: "Hace 3 horas", comment: "Mejor inversión que he hecho este año. Vale cada centavo.",          rating: 5 },
                                                { name: "Roberto M.", date: "Ayer",        comment: "Sigan así, las herramientas son excelentes.",                         rating: 4 }
                                            ]).map((review: any, i: number) => (
                                                <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blis-red/20 flex items-center justify-center text-xs font-black text-blis-red">{review.name.charAt(0)}</div>
                                                            <div>
                                                                <p className="text-xs font-black text-white">{review.name}</p>
                                                                <p className="text-[9px] text-gray-500">{review.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-400 italic">"{review.comment}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Column: Unified Checkout-Style Panel (MONOLITHIC) */}
                    <div className="lg:col-span-5 h-full">
                        <div className="sticky top-[150px] z-[30] glass-card rounded-[3.5rem] overflow-hidden flex flex-col p-1 shadow-2xl h-fit">
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blis-red/50 to-transparent" />

                            <div className="p-8 space-y-8">
                                {/* Section 1: Header Info */}
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2 text-[8px] font-black uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5 text-blis-red bg-blis-red/10 px-2.5 py-1.5 rounded-lg border border-blis-red/20 shadow-[0_0_15px_rgba(190,11,60,0.1)]">
                                            <TrendingUp className="w-3 h-3" /> BEST SELLER
                                        </div>
                                        <div className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-2.5 py-1.5 rounded-lg border border-blue-400/20">
                                            <Users className="w-3 h-3" /> {memberCount || '...'} MIEMBROS
                                        </div>
                                        <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 ml-auto">
                                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                            <span className="text-[9px] font-black text-white">4.9</span>
                                        </div>
                                    </div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                                        {product.title}
                                    </h1>
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

                                {/* Section 2: Pricing & BlisCoins (UNIFIED ROW) */}
                                <div className="space-y-6">
                                    <div className="bg-zinc-950/60 rounded-[2rem] p-7 border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex flex-col relative z-10">
                                            <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-2">Inversión Directa</p>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-5xl font-black text-white tracking-tighter">
                                                    {product.price.toFixed(2)}<span className="text-xl text-emerald-500 ml-1">$</span>
                                                </span>
                                                {product.originalPrice && (
                                                    <span className="text-zinc-600 font-mono line-through text-lg italic">
                                                        ${product.originalPrice.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="h-12 w-px bg-white/10 hidden sm:block rotate-12" />

                                        {coinsEnabled && (
                                        <div className="flex items-center gap-4 relative z-10 bg-amber-500/5 px-4 py-2 rounded-2xl border border-amber-500/10">
                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-black text-amber-500 leading-none">{Math.round(product.price * 10)}</span>
                                                <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-[0.1em] mt-1">BLISCOINS</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

                                {/* Section 3: Call to Action Buttons */}
                                <div className="space-y-3">
                                    {isPurchased ? (
                                        <>
                                            <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-4 rounded-2xl flex items-center justify-center gap-3">
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span className="text-base font-black uppercase tracking-tight">Ya has comprado este producto</span>
                                            </div>
                                            {purchasedCursoId ? (
                                                <Link
                                                    href={`/miembros/academia?iniciar=${purchasedCursoId}`}
                                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-[0.98] group"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                    <span className="text-xl font-black uppercase tracking-tight">Ir al Curso</span>
                                                </Link>
                                            ) : (
                                                <Link
                                                    href="/miembros/productos"
                                                    className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                    <span className="text-base font-bold uppercase tracking-tight">Ver Mis Productos</span>
                                                </Link>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {/* Add to Cart Button */}
                                            <motion.button
                                                onClick={() => {
                                                    addToCart({ ...product, price: product.price * quantity });
                                                    showToast("¡Añadido al carrito!", "success");
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                                            >
                                                <ShoppingCart className="w-5 h-5" />
                                                <span className="text-base font-bold uppercase tracking-tight">Añadir al Carrito</span>
                                            </motion.button>

                                            {/* Buy Now Button */}
                                            <motion.button
                                                onClick={() => {
                                                    addToCart({ ...product, price: product.price * quantity });
                                                    router.push('/tienda/checkout');
                                                }}
                                                animate={{
                                                    scale: [1, 1.02, 1],
                                                    boxShadow: [
                                                        "0 15px 40px rgba(16,185,129,0.3)",
                                                        "0 20px 60px rgba(16,185,129,0.5)",
                                                        "0 15px 40px rgba(16,185,129,0.3)"
                                                    ]
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-[0.98] group relative overflow-hidden border border-emerald-400/30"
                                            >
                                                <Lock className="w-5 h-5" />
                                                <span className="text-xl font-black uppercase tracking-tight">Comprar Ahora</span>
                                            </motion.button>
                                        </>
                                    )}

                                    <div className="flex justify-center gap-6 py-1 opacity-50">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">SSL SECURE</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">ACCESO INMEDIATO</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

                                {/* Section 4: Scarcity & Social Proof */}
                                <div className="space-y-5 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blis-red animate-pulse" />
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">
                                                <span className="text-blis-red">84</span> Personas comprando ahora
                                            </p>
                                        </div>
                                        <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                            ALTA DEMANDA
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (product.stock || 5) * 5)}%` }}
                                                transition={{ duration: 2 }}
                                                className="h-full bg-gradient-to-r from-blis-red to-amber-500 shadow-[0_0_15px_rgba(190,11,60,0.5)]"
                                            />
                                        </div>
                                        <p className="text-center text-[8px] font-bold text-blis-red uppercase tracking-[0.3em] animate-pulse">
                                            {product.stock && product.stock <= 10 ? `SOLO QUEDAN ${product.stock} UNIDADES — STOCK LIMITADO` : "OFERTA POR TIEMPO LIMITADO"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA final */}
                <div className="mt-16">
                    <div className="glass-card p-10 rounded-[2.5rem] border-white/5 text-center space-y-6">
                        <CountdownTimer />
                        <h2 className="text-3xl font-black uppercase">¡No esperes más para dominar el mercado!</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-sm">Únete a miles de profesionales que ya usan las herramientas BLIS para escalar su negocio.</p>
                        <motion.button
                            onClick={() => { addToCart({ ...product, price: product.price }); router.push('/tienda/checkout'); }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black uppercase tracking-widest text-sm rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:brightness-110 transition-all"
                        >
                            <Lock className="w-5 h-5" /> Comprar Ahora — ${product.price.toFixed(2)}
                        </motion.button>
                    </div>
                </div>
            </div >

            <FooterSections />

            <style jsx global>{`
                .glass-card {
                    background: linear-gradient(160deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
                    backdrop-filter: blur(40px) saturate(180%);
                    -webkit-backdrop-filter: blur(40px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 80px -20px rgba(0, 0, 0, 0.4);
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .glass-card:hover {
                    background: linear-gradient(160deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
                    border-color: rgba(190, 11, 60, 0.3);
                    box-shadow: 0 40px 100px -30px rgba(190, 11, 60, 0.2);
                    transform: translateY(-8px) scale(1.01);
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
            `}</style>
        </main >
    );
}
