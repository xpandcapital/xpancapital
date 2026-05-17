"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Download,
    Eye,
    Search,
    Filter,
    X,
    ChevronRight, ChevronLeft, User, Star,
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
                    if (!d.success || !d.libros || d.libros.length === 0) break;
                    all.push(...d.libros.map((l: any) => ({
                        id: l.id,
                        title: l.titulo,
                        author: l.autor,
                        category: getSmartCategory(l.autor, l.titulo),
                        downloadLink: l.download_link || "",
                        imgSrc: l.portada_url || "",
                        isFeatured: l.is_featured || false,
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

// ── Clasificador inteligente por autor/título ──
const CATEGORY_RULES: Record<string, string[]> = {
    "Finanzas": ["Kiyosaki", "Buffett", "Clason", "Eker", "Graham", "Macias", "Cardone", "Belfort", "Trump", "Keller", "Ferriss"],
    "Liderazgo": ["Maxwell", "Sharma", "Rohn", "Carnegie", "Goleman", "Covey", "Branson", "Blanchard", "Mandino"],
    "Ventas": ["Cardone", "Belfort", "Mandino", "Dey", "Proctor", "Kawasaki", "Godin", "Tracy"],
    "Crecimiento Personal": ["Ruiz", "Osho", "Chopra", "Tolle", "Dyer", "Hay", "Weiss", "Riso", "Sordo", "Stamateas", "Corbera", "Fromm", "Fisher", "Hansen", "Punset", "Baron"],
    "Emprendimiento": ["Muñoz", "Urzua", "Abratte", "Cruz", "Samso", "Fernandez", "Klaric", "Guerrero", "Cañongo", "Gomez", "Figueroa", "Nacho Muñoz"],
    "Idiomas": ["Campayo"],
    "Inmobiliaria": ["Keller", "Trump"],
};

function getSmartCategory(author: string, title: string): string {
    const a = author.toLowerCase();
    const t = title.toLowerCase();

    if (t.includes("alemán") || t.includes("inglés") || t.includes("ingles") || t.includes("idioma")) return "Idiomas";
    if (t.includes("inmobiliario") || t.includes("inmobiliaria") || t.includes("bienes raíces") || t.includes("bienes raices")) return "Inmobiliaria";
    if (t.includes("dinero") || t.includes("finanza") || t.includes("rico") || t.includes("pobre") || t.includes("millonario") || t.includes("inversión") || t.includes("inversion") || t.includes("bolsa")) return "Finanzas";
    if (t.includes("vender") || t.includes("venta") || t.includes("negociación") || t.includes("persuasión") || t.includes("marketing")) return "Ventas";
    if (t.includes("líder") || t.includes("lider") || t.includes("equipo") || t.includes("influencia") || t.includes("carisma")) return "Liderazgo";

    for (const [cat, keywords] of Object.entries(CATEGORY_RULES)) {
        if (keywords.some(k => a.includes(k.toLowerCase()))) return cat;
    }

    return "Desarrollo Personal";
}

const CATEGORY_ICONS: Record<string, string> = {
    "Finanzas": "💰",
    "Liderazgo": "👑",
    "Ventas": "💎",
    "Crecimiento Personal": "🧠",
    "Emprendimiento": "🚀",
    "Idiomas": "🌍",
    "Inmobiliaria": "🏠",
    "Desarrollo Personal": "✨",
};

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
    const [currentPage, setCurrentPage] = useState(1);
    const [slideIndex, setSlideIndex] = useState(0);
    const booksPerPage = 12;
    const { libros, loading, error } = useLibros();

    // Persistence for Saved Books
    useEffect(() => {
        const saved = localStorage.getItem("blis_saved_ebooks");
        if (saved) setSavedIds(JSON.parse(saved));
    }, []);

    // Auto-rotación del carrusel
    useEffect(() => {
        const featured = libros.filter(b => b.isFeatured);
        if (featured.length < 2) return;
        const timer = setInterval(() => {
            setSlideIndex(prev => (prev + 1) % featured.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [libros]);

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
    }, [searchQuery, selectedCategory, selectedAuthor, onlySaved, savedIds, libros]);

    const visibleBooks = useMemo(() => {
        const start = (currentPage - 1) * booksPerPage;
        return filteredBooks.slice(start, start + booksPerPage);
    }, [filteredBooks, currentPage, booksPerPage]);

    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    const categories = useMemo(() => Array.from(new Set(libros.map(b => b.category))).sort(), [libros]);
    const authors = useMemo(() => Array.from(new Set(libros.map(b => b.author))).sort(), [libros]);

    const authorCovers = useMemo(() => {
        const map: Record<string, string> = {};
        for (const b of libros) {
            if (!map[b.author] && b.imgSrc) map[b.author] = b.imgSrc;
        }
        return map;
    }, [libros]);

    const featuredBooks = useMemo(() => libros.filter(b => b.isFeatured).slice(0, 10), [libros]);

    return (
<div className="min-h-screen bg-transparent text-white px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20 relative">
            {/* Background effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blis-red/5 via-blis-red/2 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-full mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 bg-blis-red/10 border border-blis-red/20 rounded-full text-blis-red text-[10px] font-black uppercase tracking-[0.3em]">Acceso VIP</span>
                            {!loading && <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-400 text-[10px] font-bold">{libros.length} libros</span>}
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-none">
                            Biblioteca <span className="text-transparent bg-clip-text bg-gradient-to-r from-blis-red via-red-400 to-amber-400">Digital</span>
                        </h1>
                        <p className="text-sm text-gray-400 font-light max-w-xl">
                            {loading ? "Cargando catálogo..." : `${libros.length} libros curados para tu crecimiento profesional y personal`}
                        </p>
                    </div>

                    {/* Search */}
                    <div className="w-full lg:w-96">
                        <div className="relative group/search">
                            <div className="absolute inset-0 bg-gradient-to-r from-blis-red/20 to-transparent rounded-2xl blur-md opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-2 group-focus-within/search:border-blis-red/50 transition-all duration-300">
                                <Search className="w-5 h-5 text-gray-500 ml-3 group-focus-within/search:text-blis-red transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Buscar por título, autor o categoría..."
                                    className="w-full bg-transparent border-none outline-none text-white placeholder:text-gray-600 text-sm py-3 px-3"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(""); setCurrentPage(1); }} className="p-2 text-gray-500 hover:text-white mr-1">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {!loading && !searchQuery && !selectedCategory && !selectedAuthor && !onlySaved && libros.length > 0 && (
                    <>
                        {/* ── Sección: Destacados ── */}
                        {featuredBooks.length > 0 && (
                            <div className="mb-12 relative group/carousel">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blis-red rounded-full animate-pulse" />
                                        Destacados
                                    </h2>
                                    <div className="flex gap-2">
                                        <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))}
                                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30"
                                            disabled={slideIndex === 0}>
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setSlideIndex(Math.min(featuredBooks.length - 1, slideIndex + 1))}
                                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30"
                                            disabled={slideIndex >= featuredBooks.length - 1}>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-hidden rounded-3xl">
                                    <motion.div className="flex gap-0"
                                        animate={{ x: `-${slideIndex * 100}%` }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                                        {featuredBooks.map((book) => (
                                            <div key={book.id} className="w-full flex-shrink-0 cursor-pointer"
                                                onClick={() => { setSelectedCategory(book.category); setCurrentPage(1); }}>
                                                <div className="relative h-48 sm:h-64 md:h-80 rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 group">
                                                    {book.imgSrc ? (
                                                        <Image src={book.imgSrc} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="100vw" priority />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blis-red/5 to-amber-500/5">
                                                            <BookOpen className="w-16 h-16 text-gray-700" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="px-2 py-0.5 bg-blis-red/20 border border-blis-red/30 rounded-full text-blis-red text-[9px] font-bold uppercase">
                                                                {book.category}
                                                            </span>
                                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                        </div>
                                                        <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter text-white mb-1 line-clamp-2">{book.title}</h3>
                                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                                            <User className="w-3 h-3" /> {book.author}
                                                        </p>
                                                    </div>
                                                    {/* Slide dots */}
                                                    <div className="absolute bottom-6 right-6 flex gap-1.5">
                                                        {featuredBooks.map((_, i) => (
                                                            <button key={i} onClick={(e) => { e.stopPropagation(); setSlideIndex(i); }}
                                                                className={`w-2 h-2 rounded-full transition-all ${i === slideIndex ? 'bg-blis-red w-6' : 'bg-white/30 hover:bg-white/60'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {featuredBooks.length === 0 && (
                            <div className="mb-10">
                                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Recién Agregados
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
                                    {libros.slice(0, 10).map((book, i) => (
                                        <motion.div key={book.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex-shrink-0 w-36 sm:w-44 snap-start group cursor-pointer"
                                            onClick={() => { setSelectedCategory(book.category); setCurrentPage(1); }}>
                                            <div className="relative aspect-[3/4.2] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-blis-red/40 transition-all duration-300 mb-2 shadow-lg">
                                                {book.imgSrc ? (
                                                    <Image src={book.imgSrc} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="176px" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                                        <BookOpen className="w-8 h-8 text-gray-600" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute top-2 right-2 z-10">
                                                    <div className="w-8 h-8 rounded-full bg-blis-red/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowUpRight className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                            <h4 className="text-xs font-bold text-white truncate group-hover:text-blis-red transition-colors">{book.title}</h4>
                                            <p className="text-[10px] text-gray-500 truncate">{book.author}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Sección: Categorías ── */}
                        <div className="mb-12">
                            <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" /> Categorías
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {categories.map((cat) => {
                                    const count = libros.filter(b => b.category === cat).length;
                                    const icon = CATEGORY_ICONS[cat] || "📚";
                                    const glowColors: Record<string, string> = {
                                        "Finanzas": "shadow-amber-500/20 border-amber-500/20 group-hover:border-amber-400/50",
                                        "Ventas": "shadow-purple-500/20 border-purple-500/20 group-hover:border-purple-400/50",
                                        "Liderazgo": "shadow-blue-500/20 border-blue-500/20 group-hover:border-blue-400/50",
                                        "Crecimiento Personal": "shadow-emerald-500/20 border-emerald-500/20 group-hover:border-emerald-400/50",
                                        "Emprendimiento": "shadow-rose-500/20 border-rose-500/20 group-hover:border-rose-400/50",
                                        "Idiomas": "shadow-cyan-500/20 border-cyan-500/20 group-hover:border-cyan-400/50",
                                        "Inmobiliaria": "shadow-orange-500/20 border-orange-500/20 group-hover:border-orange-400/50",
                                        "Desarrollo Personal": "shadow-teal-500/20 border-teal-500/20 group-hover:border-teal-400/50",
                                    };
                                    const glow = glowColors[cat] || "shadow-white/5 border-white/5 group-hover:border-white/20";
                                    return (
                                        <motion.button key={cat}
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                                            className={`group relative p-5 rounded-2xl bg-white/[0.03] backdrop-blur-sm border ${glow} transition-all duration-300 text-left overflow-hidden shadow-lg`}
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/[0.01] -mr-12 -mt-12 group-hover:bg-white/[0.04] transition-colors" />
                                            <div className="absolute top-3 right-3 text-3xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">{icon}</div>
                                            <div className="relative z-10">
                                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
                                                <h3 className="text-sm font-black text-white group-hover:text-white transition-colors truncate">{cat}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] text-gray-500">{count} libros</span>
                                                    <div className="flex-1 h-px bg-white/10" />
                                                    <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Sección: Autores ── */}
                        <div className="mb-10 pb-6 border-b border-white/5">
                            <h2 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full" /> Autores Destacados
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                                {authors.slice(0, 12).map((author) => {
                                    const count = libros.filter(b => b.author === author).length;
                                    const cover = authorCovers[author];
                                    return (
                                        <motion.button key={author}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => { setSelectedAuthor(author); setCurrentPage(1); }}
                                            className="group flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                                        >
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-white/5 flex-shrink-0 relative">
                                                {cover ? (
                                                    <Image src={cover} alt={author} fill className="object-cover" sizes="48px" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blis-red/10 to-amber-500/10">
                                                        <User className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-left min-w-0">
                                                <h3 className="text-xs font-bold text-white group-hover:text-blis-red transition-colors truncate">{author}</h3>
                                                <span className="text-[10px] text-gray-500">{count} libros</span>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Main Content Layout */}
                {/* Horizontal Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider mr-2">Filtrar:</span>
                    <button
                        onClick={() => { setSelectedCategory(null); setSelectedAuthor(null); setOnlySaved(false); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${!selectedCategory && !selectedAuthor && !onlySaved ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setOnlySaved(!onlySaved)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${onlySaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
                    >
                        <Heart className={`w-3 h-3 ${onlySaved ? 'fill-current' : ''}`} /> Guardados
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    {categories.slice(0, 8).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => { setSelectedCategory(selectedCategory === cat ? null : cat); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${selectedCategory === cat ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
                        >
                            {cat}
                        </button>
                    ))}
                    {categories.length > 8 && (
                        <span className="text-[10px] text-gray-600 px-2">+{categories.length - 8} más</span>
                    )}
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <select
                        value={selectedAuthor || ""}
                        onChange={(e) => { setSelectedAuthor(e.target.value || null); setCurrentPage(1); }}
                        className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_12px_center]"
                    >
                        <option value="" className="bg-[#0a0a0a]">Por Autor</option>
                        {authors.map(a => (
                            <option key={a} value={a} className="bg-[#0a0a0a]">{a}</option>
                        ))}
                    </select>
                </div>

                {/* Results Grid */}
                <div className="pb-20">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                                <p className="text-center text-gray-500 text-sm py-8">Cargando {libros.length || '...'} libros...</p>
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
                            <>
                                <motion.div
                                    key="books-grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-12"
                                >
                                    {/* Page info + results count */}
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500">
                                            {filteredBooks.length > 0
                                                ? `Mostrando ${(currentPage - 1) * booksPerPage + 1}–${Math.min(currentPage * booksPerPage, filteredBooks.length)} de ${filteredBooks.length} libros`
                                                : "Sin resultados"}
                                        </p>
                                        {totalPages > 1 && (
                                            <p className="text-xs text-gray-600">Página {currentPage} de {totalPages}</p>
                                        )}
                                    </div>
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

                                    {totalPages > 1 && (
                                        <div className="flex justify-center pt-8">
                                            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-2xl p-1.5 backdrop-blur-sm">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-2.5 rounded-xl hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                                                </button>
                                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                                    let pageNum: number;
                                                    if (totalPages <= 7) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 4) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 3) {
                                                        pageNum = totalPages - 6 + i;
                                                    } else {
                                                        pageNum = currentPage - 3 + i;
                                                    }
                                                    return (
                                                        <button key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                                                pageNum === currentPage
                                                                    ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                            }`}>
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2.5 rounded-xl hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </>
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

            </div>
        </div>
    );
}
