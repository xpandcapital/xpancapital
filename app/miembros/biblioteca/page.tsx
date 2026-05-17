"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Download,
    Eye,
    Search,
    Filter,
    X,
    ChevronRight,
    Bookmark,
    AlertCircle,
    ArrowUpRight,
    TrendingUp,
    Target,
    Home,
    Sun,
    Languages,
    Sparkles,
    Clock,
    Heart
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect, useCallback } from "react";

// Types
interface EBook {
    id: string;
    title: string;
    author: string;
    category: string;
    downloadLink: string;
    imgSrc: string;
    isFeatured?: boolean;
}
// Hook para obtener libros desde API
function useLibros() {
    const [libros, setLibros] = useState<EBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function cargar() {
            try {
                const all: EBook[] = [];
                let page = 1;
                while (true) {
                    const res = await fetch(`/api/biblioteca/libros?page=${page}&limit=100`);
                    const d = await res.json();
                    if (!d.libros || d.libros.length === 0) break;
                    all.push(...d.libros.map((l: any) => ({
                        id: l.id,
                        title: l.titulo,
                        author: l.autor,
                        category: l.categoria,
                        downloadLink: l.download_link || "",
                        imgSrc: l.portada_url || "",
                        isFeatured: l.is_featured,
                    })));
                    if (d.libros.length < 100) break;
                    page++;
                }
                setLibros(all);
            } catch (e: any) {
                setError(e.message || "Error de conexión");
            } finally {
                setLoading(false);
            }
        }
        cargar();
    }, []);
    return { libros, loading, error };
}

// Data extracted from campus.blis-corp.com/libros/ (legacy fallback)
const EXTRACTED_BOOKS: EBook[] = [
    {
        id: "1",
        title: "Guía para el profesional inmobiliario",
        author: "Blis Editorial",
        category: "Bienes Raíces",
        downloadLink: "https://drive.google.com/file/d/1pXfAqqEHSu-4OWmUBJQTVx2Hp72f2JId/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/Guia-profesional-inmobiliario-scaled.webp",
        isFeatured: true
    },
    {
        id: "2",
        title: "Aprende alemán en 7 días",
        author: "Ramón Campayo",
        category: "Idiomas",
        downloadLink: "https://drive.google.com/file/d/1IWScLAzOFcBaA4RDCS4T_umpuPvPIwC_/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/Aprende-aleman-en-7-dias.webp"
    },
    {
        id: "3",
        title: "Los cuatro acuerdos",
        author: "Miguel Ruiz",
        category: "Espiritualidad",
        downloadLink: "https://drive.google.com/file/d/1EAaVzSqitk0ucHFXDAELx55evf751AEz/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/Los-cuatro-acuerdos.webp"
    },
    {
        id: "4",
        title: "El código del dinero",
        author: "Raimon Samsó",
        category: "Finanzas",
        downloadLink: "https://drive.google.com/file/d/1Z0FFSJX42soB-XkWb7EK4RiElY44UYnY/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/el-codigo-del-dinero.webp"
    },
    {
        id: "5",
        title: "Meditaciones Toltecas para el día a día",
        author: "Miguel Ruiz",
        category: "Espiritualidad",
        downloadLink: "https://drive.google.com/file/d/1pXfAqqEHSu-4OWmUBJQTVx2Hp72f2JId/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/meditaciones-toltecas.webp"
    },
    {
        id: "6",
        title: "La maestría del ser",
        author: "Miguel Ruiz Jr.",
        category: "Crecimiento Personal",
        downloadLink: "https://drive.google.com/file/d/1IWScLAzOFcBaA4RDCS4T_umpuPvPIwC_/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/La-maestria-del-ser.webp"
    },
    {
        id: "7",
        title: "Piense y hágase rico",
        author: "Napoleon Hill",
        category: "Finanzas",
        downloadLink: "https://drive.google.com/file/d/1Z0FFSJX42soB-XkWb7EK4RiElY44UYnY/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/Piense-y-hagase-rico.webp"
    },
    {
        id: "8",
        title: "El vendedor más grande del mundo",
        author: "Og Mandino",
        category: "Ventas",
        downloadLink: "https://drive.google.com/file/d/1pXfAqqEHSu-4OWmUBJQTVx2Hp72f2JId/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/El-vendedor-mas-grande-del-mundo.webp"
    },
    {
        id: "9",
        title: "Padre Rico, Padre Pobre",
        author: "Robert Kiyosaki",
        category: "Finanzas",
        downloadLink: "https://drive.google.com/file/d/1EAaVzSqitk0ucHFXDAELx55evf751AEz/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/Padre-Rico-Padre-Pobre.webp"
    },
    {
        id: "10",
        title: "Vendes o Vendes",
        author: "Grant Cardone",
        category: "Ventas",
        downloadLink: "https://drive.google.com/file/d/1IWScLAzOFcBaA4RDCS4T_umpuPvPIwC_/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/Vendes-o-vendes.webp"
    },
    {
        id: "11",
        title: "El cuadrante del flujo de dinero",
        author: "Robert Kiyosaki",
        category: "Finanzas",
        downloadLink: "https://drive.google.com/file/d/1Z0FFSJX42soB-XkWb7EK4RiElY44UYnY/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/el-cuadrante-del-flujo-de-dinero.webp"
    },
    {
        id: "12",
        title: "La semana laboral de 4 horas",
        author: "Timothy Ferriss",
        category: "Productividad",
        downloadLink: "https://drive.google.com/file/d/1pXfAqqEHSu-4OWmUBJQTVx2Hp72f2JId/view",
        imgSrc: "https://campus.blis-corp.com/wp-content/uploads/2024/02/la-semana-laboral-de-4-horas.webp"
    }
];

const AUTHORS = [
    "Napoleon Hill", "Robert Kiyosaki", "Miguel Ruiz", "Raimon Samsó", "Grant Cardone", "Og Mandino", "Blis Editorial", "Ramón Campayo", "Timothy Ferriss"
];

const CATEGORIES = [
    "Finanzas", "Ventas", "Bienes Raíces", "Espiritualidad", "Idiomas", "Crecimiento Personal", "Productividad"
];

// Helper: Simple fuzzy match
const isFuzzyMatch = (target: string, query: string) => {
    const t = target.toLowerCase();
    const q = query.toLowerCase();

    if (t.includes(q)) return true;

    // Check for some typos/errors: simple logic, if 70% of chars match in order
    let matchCount = 0;
    let targetIdx = 0;
    for (let char of q) {
        const foundIdx = t.indexOf(char, targetIdx);
        if (foundIdx !== -1) {
            matchCount++;
            targetIdx = foundIdx + 1;
        }
    }
    return (matchCount / q.length) >= 0.8;
};

const CATEGORY_STYLES: Record<string, { gradient: string; icon: any }> = {
    "Finanzas": { gradient: "from-emerald-600 to-teal-900", icon: TrendingUp },
    "Ventas": { gradient: "from-blue-600 to-indigo-900", icon: Target },
    "Bienes Raíces": { gradient: "from-amber-600 to-orange-900", icon: Home },
    "Espiritualidad": { gradient: "from-purple-600 to-fuchsia-900", icon: Sun },
    "Idiomas": { gradient: "from-rose-600 to-red-900", icon: Languages },
    "Crecimiento Personal": { gradient: "from-cyan-600 to-blue-900", icon: Sparkles },
    "Productividad": { gradient: "from-slate-600 to-zinc-900", icon: Clock },
    "default": { gradient: "from-zinc-700 to-black", icon: BookOpen }
};

const MaterialBookCover = ({ book }: { book: EBook }) => {
    const style = CATEGORY_STYLES[book.category] || CATEGORY_STYLES.default;
    const Icon = style.icon;

    return (
        <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} flex flex-col p-8 justify-between border-l-4 border-black/20 overflow-hidden`}>
            {/* Background Essence Graphic */}
            <div className="absolute -right-8 -top-8 opacity-10 transform scale-[3] rotate-12">
                <Icon className="w-24 h-24 text-white" />
            </div>

            <div className="space-y-4 z-10">
                <div className={`w-12 h-1 bg-white/20 rounded-full`} />
                <h4 className="text-white font-black uppercase tracking-tighter text-2xl leading-none drop-shadow-xl">
                    {book.title}
                </h4>
            </div>

            <div className="space-y-4 z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black text-white border border-white/10">
                            {book.author.charAt(0)}
                        </div>
                        <p className="text-white/80 text-[10px] font-black uppercase tracking-widest truncate">
                            {book.author}
                        </p>
                    </div>
                </div>
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>
    );
};

export default function EbooksPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
    const [onlySaved, setOnlySaved] = useState(false);
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [visibleLimit, setVisibleLimit] = useState(24);
    const { libros, loading, error } = useLibros();

    // Persistence for Saved Books
    useEffect(() => {
        const saved = localStorage.getItem("blis_saved_ebooks");
        if (saved) setSavedIds(JSON.parse(saved));
    }, []);

    const toggleSave = (id: string) => {
        const newSaved = savedIds.includes(id)
            ? savedIds.filter(i => i !== id)
            : [...savedIds, id];
        setSavedIds(newSaved);
        localStorage.setItem("blis_saved_ebooks", JSON.stringify(newSaved));
    };

    const handleImageError = (id: string) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    // Filter Logic
    const filteredBooks = useMemo(() => {
        const filtered = libros.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || book.category === selectedCategory;
            const matchesAuthor = !selectedAuthor || book.author === selectedAuthor;
            const matchesSaved = !onlySaved || savedIds.includes(book.id);
            return matchesSearch && matchesCategory && matchesAuthor && matchesSaved;
        });
        return filtered;
    }, [searchQuery, selectedCategory, selectedAuthor, onlySaved, savedIds]);

    const visibleBooks = useMemo(() => filteredBooks.slice(0, visibleLimit), [filteredBooks, visibleLimit]);

    const categories = useMemo(() => Array.from(new Set(libros.map(b => b.category))).sort(), [libros]);
    const authors = useMemo(() => Array.from(new Set(libros.map(b => b.author))).sort(), [libros]);

    return (
        <div className="min-h-screen bg-transparent text-white px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20">
            <div className="w-full mx-auto">
                {/* Header & Integrated Search Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 relative z-10">
                    <div className="space-y-1 w-full lg:w-auto">
                        <span className="text-blis-red text-[10px] font-black uppercase tracking-[0.4em]">Acceso VIP</span>
                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black uppercase tracking-tighter leading-none sm:leading-tight">
                            BIBLIOTECA <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">DIGITAL</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">
                            {loading ? "Cargando biblioteca..." : `Explora nuestra colección de ${libros.length} libros y recursos especializados.`}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-1 max-w-2xl items-center gap-4 mt-4 lg:mt-0 w-full lg:w-auto">
                        <div className="relative flex-1 group/search w-full">
                            <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl p-1.5 backdrop-blur-xl group-focus-within/search:border-blis-red/50 transition-all">
                                <div className="pl-4 pr-2 text-gray-500">
                                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Encuentra tu próximo libro..."
                                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-white placeholder:text-gray-600 text-xs sm:text-sm font-bold py-3 sm:py-2"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setVisibleLimit(20);
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="p-2 text-gray-500 hover:text-white transition-colors mr-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {(searchQuery || selectedCategory || selectedAuthor || onlySaved) && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory(null);
                                    setSelectedAuthor(null);
                                    setOnlySaved(false);
                                    setVisibleLimit(20);
                                }}
                                className="w-full sm:w-auto px-6 py-4 sm:px-4 sm:py-3 bg-white/5 border border-white/10 text-gray-400 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blis-red hover:text-white hover:border-blis-red transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8 pb-20">
                    {/* Results Grid */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-4 gap-y-10">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="aspect-[3/4.2] rounded-2xl bg-zinc-800/50 mb-3" />
                                                <div className="h-3 bg-zinc-800/50 rounded w-3/4 mb-2" />
                                                <div className="h-2 bg-zinc-800/30 rounded w-1/2" />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : visibleBooks.length > 0 ? (
                                <motion.div
                                    key="books-grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-12"
                                >
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-4 gap-y-10">
                                        {visibleBooks.map((book, i) => (
                                            <motion.div
                                                key={book.id}
                                                initial={{ opacity: 0, y: 15 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: (i % 8) * 0.05 }}
                                                className="group flex flex-col h-full"
                                            >
                                                <div className="relative aspect-[3/4.2] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl group-hover:border-blis-red/30 transition-all duration-500 mb-4">
                                                    {/* 3D-ish Book Edge */}
                                                    <div className="absolute inset-y-0 left-0 w-1.5 bg-black/40 z-20 border-r border-white/5" />

                                                    {!imageErrors[book.id] ? (
                                                        <Image
                                                            src={book.imgSrc}
                                                            alt={book.title}
                                                            fill
                                                            priority={i < 4}
                                                            quality={80}
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                                            onError={() => handleImageError(book.id)}
                                                            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                        />
                                                    ) : (
                                                        <MaterialBookCover book={book} />
                                                    )}

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

                                                    {/* Quick Actions Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/60 backdrop-blur-[4px] z-30">
                                                        <div className="flex flex-col gap-3 scale-90 group-hover:scale-100 transition-transform p-4 w-full max-w-[200px]">
                                                            <a
                                                                href={book.downloadLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-white text-black font-black uppercase tracking-widest px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blis-red hover:text-white transition-all shadow-2xl text-[10px]"
                                                            >
                                                                <Eye className="w-4 h-4" /> Ver Libro
                                                            </a>
                                                            <a
                                                                href={book.downloadLink}
                                                                download
                                                                className="bg-black/40 border border-white/10 text-white font-black uppercase tracking-widest px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all backdrop-blur-md text-[10px]"
                                                            >
                                                                <Download className="w-4 h-4" /> Descargar
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Separated Info Section */}
                                                <div className="flex-1 flex flex-col px-1">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] text-blis-red font-black uppercase tracking-[0.2em]">{book.category}</span>
                                                        <button
                                                            onClick={() => toggleSave(book.id)}
                                                            className={`transition-colors p-1 rounded-lg ${savedIds.includes(book.id) ? 'text-blis-red' : 'text-gray-700 hover:text-white'}`}
                                                        >
                                                            <Heart className={`w-3.5 h-3.5 ${savedIds.includes(book.id) ? 'fill-current' : ''}`} />
                                                        </button>
                                                    </div>

                                                    <h3 className="text-white font-black uppercase tracking-tight leading-[1.2] text-sm group-hover:text-blis-red transition-colors duration-300 line-clamp-2 mb-2">
                                                        {book.title}
                                                    </h3>

                                                    <div className="mt-auto pt-2 border-t border-white/5 flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black text-gray-400 group-hover:bg-blis-red group-hover:text-white transition-colors">
                                                            {book.author.charAt(0)}
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">{book.author}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {filteredBooks.length > visibleLimit && (
                                        <div className="flex justify-center pt-8">
                                            <button
                                                onClick={() => setVisibleLimit(prev => prev + 24)}
                                                className="px-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3 active:scale-95"
                                            >
                                                Cargar más libros <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="no-results"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-32 text-center"
                                >
                                    {error ? (
                                        <>
                                            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                                <AlertCircle className="w-10 h-10 text-red-400" />
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Error de conexión</h3>
                                            <p className="text-gray-500 mt-2 max-w-xs">No se pudo cargar la biblioteca. Supabase puede estar sobrecargado.</p>
                                            <button onClick={() => window.location.reload()} className="mt-6 px-8 py-4 bg-blis-red/20 text-blis-red border border-blis-red/30 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blis-red hover:text-white transition-all">
                                                Reintentar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                                <Search className="w-10 h-10 text-gray-700" />
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">No encontramos nada...</h3>
                                            <p className="text-gray-500 mt-2 max-w-xs">Intenta con otros términos o limpia los filtros para ver todo el catálogo.</p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setSelectedCategory(null);
                                                    setSelectedAuthor(null);
                                                    setOnlySaved(false);
                                                }}
                                                className="mt-8 px-8 py-4 bg-blis-red/20 text-blis-red border border-blis-red/30 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blis-red hover:text-white transition-all"
                                            >
                                                Limpiar filtros
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Sidebar Filters */}
                    <aside className="w-full lg:w-80 shrink-0 space-y-8">
                        <div className="sticky top-24 space-y-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Filter className="w-5 h-5 text-blis-red" />
                                <h2 className="text-xl font-black uppercase tracking-tighter">Mega Filtros</h2>
                            </div>

                            {/* Guardados Toggle */}
                            <button
                                onClick={() => setOnlySaved(!onlySaved)}
                                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${onlySaved ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Heart className={`w-5 h-5 ${onlySaved ? 'fill-current' : ''}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Mis Guardados</span>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${onlySaved ? 'bg-emerald-400 animate-pulse' : 'bg-gray-700'}`} />
                            </button>

                            {/* Categorías */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Categorías</h3>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setVisibleLimit(20);
                                        }}
                                        className={`w-full px-5 py-4 rounded-xl text-left text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${!selectedCategory ? 'bg-blis-red text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <span>Todas</span>
                                        {!selectedCategory && <ChevronRight className="w-4 h-4" />}
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategory(selectedCategory === cat ? null : cat);
                                                setVisibleLimit(20);
                                            }}
                                            className={`w-full px-5 py-4 rounded-xl text-left text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${selectedCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <span>{cat}</span>
                                            {selectedCategory === cat ? <ChevronRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Autores */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Autores</h3>
                                <div className="relative">
                                    <select
                                        className="w-full bg-white/5 border border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl focus:ring-blis-red focus:border-blis-red appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                                        value={selectedAuthor || ""}
                                        onChange={(e) => {
                                            setSelectedAuthor(e.target.value || null);
                                            setVisibleLimit(20);
                                        }}
                                    >
                                        <option value="" className="bg-[#050505]">Filtrar por Autor...</option>
                                        {authors.map(a => (
                                            <option key={a} value={a} className="bg-[#050505]">{a}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

            </div>
        </div>
    );
}
