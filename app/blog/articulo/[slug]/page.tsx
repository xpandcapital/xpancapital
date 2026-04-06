"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import {
    Calendar as CalendarIcon, Coins, ArrowLeft, Clock, Sparkles, User, Bot,
    Share2, Facebook, Twitter, Linkedin, Link2, MessageSquare, Send,
    ChevronRight, ShoppingBag, TrendingUp, Bookmark, Lock as LockIcon, ArrowRight,
    Megaphone, Globe, Layout, CheckCircle2, AlertCircle, Loader2, Trash2, Edit2, X, Check
} from "lucide-react";
import { DEFAULT_EMPRESA_ID } from "@/lib/empresa";
import { Header } from "@/components/sections/Header";
import { FooterSections as Footer } from "@/components/sections/Footer";
import { usePublicBlog } from "@/lib/hooks/usePublicBlog";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/lib/hooks/useComments";
import Link from "next/link";

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    isPremium: boolean;
    price: number;
    rewardSeconds: number;
    rewardAmount: number;
}

const AdUnit = ({ type = "internal", position = "sidebar" }: { type: "adwords" | "internal", position: "mid" | "sidebar" }) => {
    return (
        <div className={`bg-gradient-to-br from-blis-red to-[#87082a] p-8 text-white relative overflow-hidden group shadow-2xl ${position === 'mid' ? 'my-16 rounded-[40px]' : 'rounded-3xl'}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Megaphone className="w-32 h-32" />
            </div>
            <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 block text-red-100">Anuncio Corporativo</span>
                <h3 className="text-2xl font-black uppercase mb-3 leading-tight">Proyecto "Hacienda Real"</h3>
                <p className="text-red-100/80 text-sm mb-6 max-w-md">Lotes de inversión con entrega inmediata y servicios habilitados. 15% de descuento exclusivo para lectores del Blog.</p>
                <button className="bg-white text-blis-red px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl">Más Información</button>
            </div>
        </div>
    );
};

export default function ArticleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { user, loading: authLoading } = useAuth();

    const [article, setArticle] = useState<Article | null>(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [reward, setReward] = useState(5);
    const [claimed, setClaimed] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showInsufficientCoins, setShowInsufficientCoins] = useState(false);
    const [userCoins, setUserCoins] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const articleContentRef = useRef<HTMLDivElement>(null);
    const progress = useMotionValue(0);
    const scaleX = useSpring(progress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const { getPostBySlug } = usePublicBlog();
    const { comments, loading: commentsLoading, fetchComments, createComment, updateComment, deleteComment } = useComments(article?.id || null);

    // Load user coins from profile
    useEffect(() => {
        if (user) {
            setUserCoins(user.blis_coins || 0);
        }
    }, [user]);

    // Fetch comments when article is loaded
    useEffect(() => {
        if (article?.id && isUnlocked) {
            fetchComments();
        }
    }, [article?.id, isUnlocked, fetchComments]);

    // Load article
    useEffect(() => {
        const loadArticle = async () => {
            setIsLoading(true);
            let found: Article | null = null;

            // Try Supabase
            const supabasePost = await getPostBySlug(slug);
            if (supabasePost) {
                found = {
                    id: supabasePost.id,
                    title: supabasePost.titulo,
                    slug: supabasePost.slug,
                    excerpt: supabasePost.extracto || '',
                    content: supabasePost.contenido || '',
                    image: supabasePost.imagen_portada || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
                    category: supabasePost.categoria?.nombre || 'General',
                    author: supabasePost.autor ? `${supabasePost.autor.nombre} ${supabasePost.autor.apellido || ''}`.trim() : 'Kevin Valdez',
                    date: supabasePost.publicado_en ? new Date(supabasePost.publicado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(supabasePost.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
                    readTime: `${supabasePost.tiempo_lectura_minutos || 5} min`,
                    isPremium: supabasePost.es_premium,
                    price: supabasePost.precio_coins || 0,
                    rewardSeconds: supabasePost.recompensa_segundos || 60,
                    rewardAmount: supabasePost.recompensa_coins || 5
                };
            }

            if (found) {
                setArticle(found);
                setTimeLeft(found.rewardSeconds);
                setReward(found.rewardAmount);

                // Non-premium articles are unlocked by default
                if (!found.isPremium) {
                    setIsUnlocked(true);
                } else {
                    // Premium articles: check if already unlocked (localStorage)
                    const unlockedArticles = JSON.parse(localStorage.getItem('blis_unlocked_articles') || '[]');
                    if (unlockedArticles.includes(found.id)) {
                        setIsUnlocked(true);
                    }
                }

                // Check if already claimed reward
                const claimedArticles = JSON.parse(localStorage.getItem('blis_claimed_articles') || '[]');
                if (claimedArticles.includes(found.id)) {
                    setClaimed(true);
                }
            }

            setIsLoading(false);
        };

        loadArticle();
    }, [slug, getPostBySlug]);

    // Reading progress scroll tracking
    useEffect(() => {
        const handleScroll = () => {
            if (!articleContentRef.current) return;
            const rect = articleContentRef.current.getBoundingClientRect();
            const currentOffset = -rect.top;
            const totalRange = rect.height - window.innerHeight / 2;
            let p = currentOffset / totalRange;
            p = Math.max(0, Math.min(1, p));
            progress.set(p);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [progress]);

    // Timer for reading reward
    useEffect(() => {
        if (!article || !isUnlocked || article.isPremium) return;
        if (claimed || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [article, isUnlocked, claimed, timeLeft]);

    // Claim reward
    const claimReward = async () => {
        if (!article || claimed || !user) return;

        setIsClaiming(true);

        try {
            const response = await fetch('/api/blog/lectura', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    post_id: article.id,
                    tiempo_segundos: article.rewardSeconds,
                    completado: true,
                    coins_cantidad: article.rewardAmount
                })
            });

            const data = await response.json();

            if (data.success) {
                setClaimed(true);
                setUserCoins(prev => prev + article.rewardAmount);

                // Update localStorage
                const claimedArticles = JSON.parse(localStorage.getItem('blis_claimed_articles') || '[]');
                if (!claimedArticles.includes(article.id)) {
                    claimedArticles.push(article.id);
                    localStorage.setItem('blis_claimed_articles', JSON.stringify(claimedArticles));
                }
            } else {
                console.error('Error claiming reward:', data.error);
            }
        } catch (err) {
            console.error('Error claiming reward:', err);
        } finally {
            setIsClaiming(false);
        }
    };

    // Unlock premium article
    const unlockPremiumArticle = async () => {
        if (!article || !user) return;

        if (userCoins < article.price) {
            setShowInsufficientCoins(true);
            setTimeout(() => setShowInsufficientCoins(false), 3000);
            return;
        }

        setIsUnlocking(true);

        try {
            // Deduct coins
            const spendResponse = await fetch('/api/coins/spend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    monto: article.price,
                    tipo: 'canje',
                    descripcion: `Desbloquear artículo: ${article.title}`,
                    referencia_id: article.id,
                    referencia_tipo: 'blog_post'
                })
            });

            const spendData = await spendResponse.json();

            if (spendData.success) {
                setUserCoins(prev => prev - article.price);
                setIsUnlocked(true);

                // Save to localStorage
                const unlockedArticles = JSON.parse(localStorage.getItem('blis_unlocked_articles') || '[]');
                if (!unlockedArticles.includes(article.id)) {
                    unlockedArticles.push(article.id);
                    localStorage.setItem('blis_unlocked_articles', JSON.stringify(unlockedArticles));
                }
            } else {
                console.error('Error unlocking:', spendData.error);
            }
        } catch (err) {
            console.error('Error unlocking:', err);
        } finally {
            setIsUnlocking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <p>Artículo no encontrado</p>
            </div>
        );
    }

    const relatedArticles: any[] = []; // We will fetch related from Supabase later or keep it empty for now

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-emerald-500/30">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-emerald-500 z-[1000] origin-left shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                style={{ scaleX }}
            />

            <Header />

            <main className="pt-32 pb-20 relative">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/[0.05] blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 left-[-10%] w-[600px] h-[600px] bg-emerald-900/[0.03] blur-[150px] rounded-full pointer-events-none" />

                <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                    {/* Back Button */}
                    <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all uppercase text-[10px] font-black tracking-[0.2em] group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al Blog
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest hidden md:block">Compartir</span>
                            <div className="flex items-center gap-2">
                                {[Facebook, Twitter, Linkedin, Link2].map((Icon, i) => (
                                    <button key={i} className="p-2.5 bg-white/5 hover:bg-emerald-500 border border-white/10 rounded-full transition-all group shadow-xl">
                                        <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Main Content */}
                        <div ref={articleContentRef} className="lg:col-span-8 flex flex-col">
                            {/* Reward Banner */}
                            {isUnlocked && !article.isPremium && !claimed && user && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="sticky top-28 left-0 right-0 z-[50] w-full flex justify-center mb-12"
                                >
                                    <button
                                        onClick={claimReward}
                                        disabled={timeLeft > 0 || isClaiming}
                                        className={`px-8 py-4 rounded-[40px] flex items-center gap-4 backdrop-blur-3xl transition-all duration-700 shadow-2xl border ${
                                            timeLeft > 0
                                                ? 'bg-blis-red border-red-400/50 text-white shadow-[0_0_30px_rgba(190,11,60,0.5)]'
                                                : 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-full ${timeLeft > 0 ? 'bg-white/10 animate-pulse' : 'bg-black/20'}`}>
                                            <Coins className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black tracking-widest uppercase text-[10px]">
                                                {timeLeft > 0 ? 'PROCESANDO LECTURA' : '¡RECLAMAR RECOMPENSA!'}
                                            </span>
                                            <span className={`text-[14px] font-black ${timeLeft > 0 ? 'text-white' : 'text-black'}`}>
                                                {timeLeft > 0 ? `FALTAN ${timeLeft} SEG` : `+${reward} BLIS COINS`}
                                            </span>
                                        </div>
                                    </button>
                                </motion.div>
                            )}

                            {claimed && (
                                <div className="sticky top-28 left-0 right-0 z-[50] w-full flex justify-center mb-12">
                                    <div className="px-8 py-4 rounded-[40px] flex items-center gap-4 bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-black tracking-widest uppercase text-[10px]">
                                            +{reward} COINS GANADOS
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Article Header */}
                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded font-black uppercase text-[10px] tracking-widest border border-emerald-500/30">
                                        {article.category}
                                    </span>
                                    {article.isPremium && (
                                        <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded font-black uppercase text-[10px] tracking-widest border border-amber-500/30 flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3" /> Premium
                                        </span>
                                    )}
                                    <span className="text-gray-500 mx-2">•</span>
                                    <span className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5" /> {article.readTime}
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-black uppercase text-white leading-[1.1] tracking-tight mb-8">
                                    {article.title}
                                </h1>

                                <div className="flex items-center gap-4 mb-10 pb-10 border-b border-white/5">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase text-white tracking-widest">{article.author}</span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{article.date}</span>
                                    </div>
                                </div>

                                {/* Featured Image */}
                                <div className="w-full aspect-video rounded-[40px] overflow-hidden shadow-2xl border border-white/5 relative group">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className={`w-full h-full object-cover transition-all duration-1000 ${!isUnlocked && 'blur-3xl scale-110 opacity-40'}`}
                                    />
                                    {!isUnlocked && article.isPremium && (
                                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-8 backdrop-blur-xl">
                                            <motion.div
                                                animate={{ boxShadow: ["0 0 20px rgba(245,158,11,0.1)", "0 0 50px rgba(245,158,11,0.4)", "0 0 20px rgba(245,158,11,0.1)"] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="w-24 h-24 bg-amber-500/10 border border-amber-500/30 rounded-[2.5rem] flex items-center justify-center mb-8 relative"
                                            >
                                                <LockIcon className="w-10 h-10 text-amber-500" />
                                                <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                                                    Restringido
                                                </div>
                                            </motion.div>

                                            <h3 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter leading-none">Contenido Premium</h3>
                                            <p className="text-gray-400 text-sm max-w-sm mb-12 leading-relaxed font-medium">
                                                Este artículo contiene información exclusiva para miembros premium.
                                            </p>

                                            <div className="flex flex-col items-center gap-6">
                                                {user ? (
                                                    <>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={unlockPremiumArticle}
                                                            disabled={isUnlocking}
                                                            className={`px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-2xl flex items-center gap-3 border ${
                                                                showInsufficientCoins
                                                                    ? 'bg-red-500/20 border-red-500 text-red-500 shadow-red-500/20'
                                                                    : 'bg-amber-500 border-amber-400/50 text-black shadow-amber-500/40 hover:shadow-amber-500/60'
                                                            }`}
                                                        >
                                                            {isUnlocking ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : showInsufficientCoins ? (
                                                                <AlertCircle className="w-4 h-4" />
                                                            ) : (
                                                                <Sparkles className="w-4 h-4" />
                                                            )}
                                                            {showInsufficientCoins ? 'Saldo Insuficiente' : `Desbloquear por ${article.price} Coins`}
                                                        </motion.button>
                                                        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
                                                            <Coins className="w-4 h-4 text-amber-500" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                                Tu saldo: <span className="text-white">{userCoins} Coins</span>
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => router.push('/tienda/login')}
                                                        className="px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-2xl"
                                                    >
                                                        Inicia Sesión para Desbloquear
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Article Content */}
                            {isUnlocked && (
                                <div className="py-10">
                                    <div className="prose prose-invert prose-2xl max-w-none text-gray-300 leading-relaxed space-y-8 font-light">
                                        <p className="text-2xl text-white font-medium italic border-l-4 border-emerald-500 pl-8 my-12 bg-white/5 py-8 rounded-r-3xl">
                                            "{article.excerpt}"
                                        </p>

                                        <div 
                                            className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: article.content || '<p>Contenido del artículo...</p>' }}
                                        />
                                    </div>

                                    {/* Comments Section */}
                                    <div className="mt-24 border-t border-white/5 pt-20">
                                        <div className="flex items-center justify-between mb-12">
                                            <h3 className="text-2xl font-black text-white uppercase flex items-center gap-4">
                                                <MessageSquare className="w-6 h-6 text-emerald-500" /> Comentarios
                                                {comments.length > 0 && (
                                                    <span className="text-sm font-bold text-emerald-500">({comments.length})</span>
                                                )}
                                            </h3>
                                        </div>

                                        {!user ? (
                                            <div className="p-12 bg-emerald-900/10 border border-dashed border-emerald-500/20 rounded-[32px] text-center flex flex-col items-center">
                                                <LockIcon className="w-10 h-10 text-emerald-500/40 mb-6" />
                                                <h4 className="text-xl font-black text-white uppercase mb-4 tracking-widest"> debate Exclusivo</h4>
                                                <p className="text-gray-500 text-sm max-w-sm mb-8">
                                                    Solo los miembros registrados pueden participar en la comunidad.
                                                </p>
                                                <button
                                                    onClick={() => router.push('/tienda/login')}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                                                >
                                                    Iniciar Sesión
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                    <div className="bg-zinc-900/40 border border-white/5 rounded-[28px] p-6">
                                                        <div className="flex gap-4">
                                                            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                                                                <User className="w-5 h-5 text-gray-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <textarea
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    placeholder="Escribe tu comentario..."
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all resize-none min-h-[100px]"
                                                                    maxLength={1000}
                                                                />
                                                                <div className="flex items-center justify-between mt-3">
                                                                    <span className="text-[10px] text-gray-500">{newComment.length}/1000</span>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={async () => {
                                                                            if (!user || !newComment.trim()) return;
                                                                            const result = await createComment(user.id, DEFAULT_EMPRESA_ID, newComment.trim());
                                                                            if (result.success) {
                                                                                setNewComment('');
                                                                            }
                                                                        }}
                                                                        disabled={!newComment.trim()}
                                                                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2"
                                                                    >
                                                                        <Send className="w-3.5 h-3.5" /> Comentar
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {commentsLoading ? (
                                                        <div className="flex items-center justify-center py-12">
                                                            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                                        </div>
                                                    ) : comments.length === 0 ? (
                                                        <div className="text-center py-12 text-gray-500">
                                                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                                            <p className="text-sm">Sé el primero en comentar</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {comments.map((comment) => (
                                                                <motion.div
                                                                    key={comment.id}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="bg-zinc-900/40 border border-white/5 rounded-[28px] p-6"
                                                                >
                                                                    <div className="flex gap-4">
                                                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                                                                            {comment.user?.avatar_url ? (
                                                                                <img src={comment.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                                            ) : (
                                                                                <span className="text-white font-black text-sm">
                                                                                    {(comment.user?.nombre || 'U')[0].toUpperCase()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-3 mb-2">
                                                                                <span className="font-black text-white text-sm">
                                                                                    {comment.user?.nombre || 'Usuario'} {comment.user?.apellido || ''}
                                                                                </span>
                                                                                <span className="text-[10px] text-gray-500">
                                                                                    {new Date(comment.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                                                </span>
                                                                            </div>
                                                                            {editingComment === comment.id ? (
                                                                                <div className="space-y-3">
                                                                                    <textarea
                                                                                        value={editText}
                                                                                        onChange={(e) => setEditText(e.target.value)}
                                                                                        className="w-full bg-white/5 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm outline-none resize-none min-h-[80px]"
                                                                                        maxLength={1000}
                                                                                    />
                                                                                    <div className="flex gap-2">
                                                                                        <button
                                                                                            onClick={async () => {
                                                                                                if (!user) return;
                                                                                                await updateComment(comment.id, user.id, editText);
                                                                                                setEditingComment(null);
                                                                                            }}
                                                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold flex items-center gap-1"
                                                                                        >
                                                                                            <Check className="w-3 h-3" /> Guardar
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => setEditingComment(null)}
                                                                                            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1"
                                                                                        >
                                                                                            <X className="w-3 h-3" /> Cancelar
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.contenido}</p>
                                                                            )}
                                                                        </div>
                                                                        {user?.id === comment.user?.id && editingComment !== comment.id && (
                                                                            <div className="flex gap-1 shrink-0">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingComment(comment.id);
                                                                                        setEditText(comment.contenido);
                                                                                    }}
                                                                                    className="p-2 hover:bg-white/5 rounded-lg transition-all"
                                                                                >
                                                                                    <Edit2 className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={async () => {
                                                                                        if (!user || !confirm('¿Eliminar este comentario?')) return;
                                                                                        await deleteComment(comment.id, user.id);
                                                                                    }}
                                                                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 flex flex-col gap-10">
                            <AdUnit type="internal" position="sidebar" />

                            <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-8 backdrop-blur-3xl shadow-2xl">
                                <h3 className="text-xs font-black uppercase text-white tracking-[0.2em] mb-10 pb-4 border-b border-white/5 flex items-center gap-3">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Artículos Relacionados
                                </h3>
                                <div className="space-y-8">
                                    {relatedArticles.slice(0, 5).map((ra, i) => (
                                        <Link key={i} href={`/blog/articulo/${ra.slug || ra.id}`} className="group flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                                <img src={ra.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h4 className="text-[11px] font-black uppercase leading-tight group-hover:text-emerald-500 transition-colors line-clamp-2">{ra.title}</h4>
                                                <span className="text-[9px] font-bold text-gray-500 uppercase">{ra.date}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link href="/blog" className="mt-12 w-full flex items-center justify-center gap-2 text-[9px] font-black uppercase text-gray-400 hover:text-white transition-colors tracking-[0.3em] group">
                                    Ver Archivo Completo <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}