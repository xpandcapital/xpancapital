"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
    Plus, Search, FileText, Save, Eye, Trash2, ChevronLeft, X,
    CheckCircle2, AlertCircle, Clock, Settings,
    FileUp, Image as ImageIcon, Camera, RotateCw, FlipHorizontal,
    Check, Bold, Italic, Underline, List, ListOrdered, BarChart2, ChevronDown,
    Heading1, Heading2, Link as LinkBtn, Quote, Code,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette,
    Smile, Strikethrough, Trash, Undo, Redo, Eraser,
    FileCode, Upload, Scissors, GripHorizontal, Sparkles,
    Check as CheckIcon, X as XIcon, Activity, Zap, Coins,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RichTextEditor, { ImageCropper } from "@/components/superadmin/RichTextEditor";
import useBlog from "@/lib/hooks/useBlog";
import { useSearchParams } from 'next/navigation';
import ImageSearch from "@/components/superadmin/ImageSearch";

interface Category {
    id: string;
    nombre: string;
    slug: string;
    icono?: string;
    color?: string;
}

export default function CreateBlogPost() {
    const { createPost, updatePost, uploadImage, getCategories, loading: blogLoading } = useBlog();
    
    const [empresaId, setEmpresaId] = useState<string>("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [showImageSearch, setShowImageSearch] = useState(false);
    const [imageSearchTarget, setImageSearchTarget] = useState<'cover' | 'content'>('cover');
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiStep, setAiStep] = useState(0);
    const [editPostId, setEditPostId] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const aiSteps = [
        "Analizando contexto de Blis Corp...",
        "Aplicando estrategia de copywriting profesional...",
        "Redactando en voz de Kevin Valdez...",
        "Generando SEO y metadatos...",
        "Finalizando estructura del artículo..."
    ];

    // Metadata
    const [status, setStatus] = useState<"Publicado" | "Borrador">("Borrador");
    const [categories, setCategories] = useState<Category[]>([]);
    const [savedCategories, setSavedCategories] = useState<string[]>(["PropTech", "Inversiones", "Eventos", "Actualizaciones"]);
    const [category, setCategory] = useState("Sin Categoría");
    const [savedTags, setSavedTags] = useState<string[]>(["Inmobiliaria", "Inversión", "Noticias", "Lanzamiento"]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [seoTitle, setSeoTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [saveTime, setSaveTime] = useState<string>("");
    const [mounted, setMounted] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    // Gamification & Premium
    const [isPremium, setIsPremium] = useState(false);
    const [price, setPrice] = useState(15);
    const [rewardSeconds, setRewardSeconds] = useState(60);
    const [rewardAmount, setRewardAmount] = useState(5);

    // Cargar empresa y categorías al montar
    useEffect(() => {
        const init = async () => {
            setSaveTime(new Date().toLocaleTimeString());
            setMounted(true);
            
            // Obtener empresa
            try {
                const res = await fetch('/api/empresas?slug=blis-corp');
                const data = await res.json();
                if (data.success && data.data?.id) {
                    setEmpresaId(data.data.id);
                    
                    // Cargar categorías de esta empresa
                    const catRes = await fetch(`/api/blog/categorias?empresa_id=${data.data.id}`);
                    const catData = await catRes.json();
                    if (catData.success && catData.data) {
                        setCategories(catData.data);
                        setSavedCategories(catData.data.map((c: Category) => c.nombre));
                    }
                }
            } catch (e) {
                console.error('Error cargando empresa:', e);
            }
        };
        init();
    }, []);

    // Load existing post for editing
    useEffect(() => {
        const loadPost = async () => {
            const postId = searchParams.get('id');
            if (!postId) return;

            try {
                const res = await fetch(`/api/blog?id=${postId}`);
                const data = await res.json();

                if (data.success && data.data && data.data.length > 0) {
                    const post = data.data[0];
                    setEditPostId(post.id);
                    setTitle(post.titulo || '');
                    setContent(post.contenido || '');
                    setExcerpt(post.extracto || '');
                    setSeoTitle(post.seo_title || '');
                    setCoverImage(post.imagen_portada || null);
                    setIsPremium(post.es_premium || false);
                    setPrice(post.precio_coins || 15);
                    setRewardSeconds(post.recompensa_segundos || 60);
                    setRewardAmount(post.recompensa_coins || 5);
                    setStatus(post.estado === 'publicado' ? 'Publicado' : 'Borrador');
                    
                    // Set category
                    if (post.categoria?.nombre) {
                        setCategory(post.categoria.nombre);
                    }
                }
            } catch (e) {
                console.error('Error loading post:', e);
            }
        };

        loadPost();
    }, [searchParams]);

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                if (!savedTags.includes(newTag)) {
                    setSavedTags([...savedTags, newTag]);
                }
            }
            setTagInput("");
        }
    };

    // Cover Image
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [coverCroppingSource, setCoverCroppingSource] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (prev) => {
                setCoverCroppingSource(prev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (publish: boolean = false) => {
        if (!empresaId) {
            setToastMessage("Error: No se encontró la empresa");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        if (!title.trim()) {
            setToastMessage("El título es requerido");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        setIsSaving(true);
        const newStatus = publish ? "publicado" : "borrador";

        try {
            // Subir imagen si existe
            let imageUrl: string | undefined = coverImage || undefined;
            // Si hay una imagen en base64 (data:), subirla a Supabase
            if (coverImage && coverImage.startsWith('data:')) {
                const base64Response = await fetch(coverImage);
                const blob = await base64Response.blob();
                const file = new File([blob], `cover-${Date.now()}.jpg`, { type: 'image/jpeg' });
                
                const uploadResult = await uploadImage(file, 'blog/covers');
                
                if (!uploadResult.success) {
                    console.error('Error subiendo imagen:', uploadResult.error);
                    // Continuar sin imagen si falla
                    imageUrl = undefined;
                } else {
                    imageUrl = uploadResult.url || undefined;
                }
            }

            // Encontrar categoría_id
            const categoriaId = categories.find(c => c.nombre === category)?.id || null;

            const postData = {
                empresa_id: empresaId,
                titulo: title.trim() || "Artículo Sin Título",
                contenido: content,
                extracto: excerpt?.substring(0, 200) || undefined,
                seo_title: seoTitle || title.trim().substring(0, 60) || undefined,
                seo_description: excerpt?.substring(0, 160) || undefined,
                imagen_portada: imageUrl || undefined,
                categoria_id: categoriaId || undefined,
                estado: newStatus as "borrador" | "publicado",
                es_premium: isPremium,
                metodo_pago: 'coins' as const,
                precio_coins: isPremium ? price : 0,
                recompensa_segundos: rewardSeconds,
                recompensa_coins: rewardAmount,
                tags: tags
            };

            let result;
            if (editPostId) {
                // Actualizar post existente
                result = await updatePost(editPostId, postData);
            } else {
                // Crear nuevo post
                result = await createPost(postData);
            }

            if (!result.success) {
                throw new Error(result.error || "Error al guardar");
            }

            setStatus(publish ? "Publicado" : "Borrador");
            setSaveTime(new Date().toLocaleTimeString());
            if (!editPostId && result.data?.id) {
                setEditPostId(result.data.id);
            }
            setToastMessage(publish ? "¡Artículo publicado!" : "Borrador guardado");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

        } catch (error) {
            console.error('Error guardando post:', error);
            setToastMessage(error instanceof Error ? error.message : "Error al guardar");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setShowDeleteConfirm(false);
        
        // Si hay un post guardado, eliminarlo de Supabase
        if (editPostId) {
            try {
                const result = await fetch(`/api/blog?id=${editPostId}`, {
                    method: 'DELETE'
                });
                const data = await result.json();
                
                if (!data.success) {
                    console.error('Error eliminando:', data.error);
                }
            } catch (e) {
                console.error('Error:', e);
            }
        }

        setToastMessage("Artículo eliminado");
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            window.location.href = '/superadmin/blog';
        }, 1500);
    };

    const handleImageSelect = (url: string) => {
        if (imageSearchTarget === 'cover') {
            setCoverImage(url);
        } else {
            // Insert image into content
            const imgHtml = `<img src="${url}" alt="Imagen" style="max-width: 100%; border-radius: 12px; margin: 1rem 0;" />`;
            setContent(prev => prev + imgHtml);
        }
        setShowImageSearch(false);
    };

    const cancelAIGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsGenerating(false);
        setShowAIModal(false);
    };

    const handleGenerateAI = async (genTitle: string, genPrompt: string) => {
        if (!genPrompt.trim()) return;
        setIsGenerating(true);
        setAiStep(0);
        setShowAIModal(true);

        abortControllerRef.current = new AbortController();

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            if (currentStep < aiSteps.length - 1) {
                setAiStep(currentStep);
            }
        }, 800);

        try {
            // --- UNIFIED KEY ORCHESTRATOR ---
            const getAIConfig = () => {
                const stored = localStorage.getItem('blis_ai_config');
                const defaults = { gemini_key: '', openai_key: '', groq_key: '' };
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        return {
                            gemini_key: parsed.gemini_key || localStorage.getItem('gemini_key') || '',
                            openai_key: parsed.openai_key || localStorage.getItem('openai_key') || '',
                            groq_key: parsed.groq_key || localStorage.getItem('groq_key') || ''
                        };
                    } catch { }
                }
                return {
                    gemini_key: localStorage.getItem('gemini_key') || '',
                    openai_key: localStorage.getItem('openai_key') || '',
                    groq_key: localStorage.getItem('groq_key') || ''
                };
            };

            const config = getAIConfig();
            const apiKey = config.gemini_key;
            const gptKey = config.openai_key;
            const groqKey = config.groq_key;

            const res = await fetch('/api/generate-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: genTitle, idea: genPrompt, apiKey, gptKey, groqKey }),
                signal: abortControllerRef.current.signal
            });

            clearInterval(interval);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error de red");
            }

            setAiStep(aiSteps.length - 1);
            await new Promise(r => setTimeout(r, 400)); // Finish loading bar

            setTitle(data.title);
            setSeoTitle(data.seoTitle);
            setExcerpt(data.excerpt);
            setCategory(data.category);
            setTags(data.tags);
            setSavedTags(prev => [...new Set([...prev, ...data.tags])]);
            setContent(data.content);

        } catch (error: any) {
            clearInterval(interval);
            if (error.name === 'AbortError') {
                return;
            }

            // Show error to the user gracefully without crashing the Next.js overlay
            if (typeof window !== 'undefined') {
                window.alert(`No se pudo generar el artículo con IA: ${error.message}\nVerifique su API Key en la configuración.`);
            }

            // Fallback (Mock) if API is unavailable or user didn't set key
            setAiStep(aiSteps.length - 1);
            const topic = genPrompt.trim();
            const shortTopic = topic.length > 40 ? topic.substring(0, 40) + "..." : topic;
            setTitle(`${shortTopic}: Técnicas Efectivas`);
            setSeoTitle(`Inversiones Estratégicas 2025 | Kevin Valdez - Blis Corp`);
            setExcerpt(`Descubre cómo analizar correctamente el mercado en América Latina con estas técnicas. Te comparto mi experiencia y datos reales.`.substring(0, 160));
            setCategory("Inversiones");
            setTags(["Inversiones", "PropTech", "Blis Corp", "Kevin Valdez"]);
            setSavedTags(prev => [...new Set([...prev, "Inversiones", "PropTech", "Blis Corp", "Kevin Valdez"])]);
            setContent(`<h2>Mi Visión Crítica</h2><p>Cuando empecé en el mundo inmobiliario, nadie me habló con honestidad sobre lo que realmente importa: los aspectos técnicos y legales profundos. Hoy quiero cambiar eso contigo.</p><blockquote class="image-prompt-suggestion" style="background:#2d0a4e; color:#b175ff; padding: 15px; border-radius: 10px;"><strong>🎨 Sugerencia de Imagen:</strong> Una foto hiperrealista de Kevin Valdez analizando un enorme plano arquitectónico sobre una mesa de cristal.</blockquote><p>El mercado latinoamericano está en un punto de inflexión. Súscríbete a nuestra newsletter y recibe análisis exclusivos y acceso anticipado a oportunidades.</p>`);
        } finally {
            setIsGenerating(false);
            setShowAIModal(false);
            setAiPrompt("");
            setAiStep(0);

            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    // --- AI Status Component (Blog Local) ---
    const useBlogAIStatus = () => {
        const [aiStatus, setAiStatus] = useState({
            gemini: false,
            gpt: false,
            groq: false,
            gModel: '...',
            oModel: '...',
            qModel: '...',
            loading: true
        });

        const checkConnections = async () => {
            setAiStatus(prev => ({ ...prev, loading: true }));

            // Get keys using current standard
            const stored = localStorage.getItem('blis_ai_config');
            let keys = { gemini_key: '', openai_key: '', groq_key: '' };
            if (stored) {
                try {
                    const p = JSON.parse(stored);
                    keys = {
                        gemini_key: p.gemini_key || '',
                        openai_key: p.openai_key || '',
                        groq_key: p.groq_key || ''
                    };
                } catch { }
            }

            const callProxy = async (service: string, key: string) => {
                try {
                    if (!key || key.length < 5) return { ok: false, msg: 'Offline' };
                    const r = await fetch('/api/test-connection', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ service, key }),
                    });
                    const d = await r.json();
                    return { ok: d.ok, msg: d.msg };
                } catch { return { ok: false, msg: 'Offline' }; }
            };

            const [g, o, q] = await Promise.all([
                callProxy('ai-gemini', keys.gemini_key),
                callProxy('ai-openai', keys.openai_key),
                callProxy('ai-groq', keys.groq_key)
            ]);

            setAiStatus({
                gemini: g.ok,
                gpt: o.ok,
                groq: q.ok,
                gModel: g.ok ? g.msg.replace(' (Proxy)', '') : 'Offline',
                oModel: o.ok ? o.msg.replace(' (Proxy)', '') : 'Offline',
                qModel: q.ok ? q.msg.replace(' (Proxy)', '') : 'Offline',
                loading: false
            });
        };

        useEffect(() => {
            checkConnections();
            window.addEventListener('blis_config_updated', checkConnections);
            return () => window.removeEventListener('blis_config_updated', checkConnections);
        }, []);

        return aiStatus;
    };

    const BlogAIStatus = () => {
        const status = useBlogAIStatus();
        return (
            <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-1.5 px-3 rounded-2xl shadow-xl">
                <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.gemini ? 'bg-purple-500 animate-pulse-slow' : 'bg-zinc-800'}`} />
                        <div className="flex flex-col leading-none">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-0.5">GEMINI</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-4 bg-white/5 self-center" />
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.gpt ? 'bg-cyan-500 animate-pulse-slow' : 'bg-zinc-800'}`} />
                        <div className="flex flex-col leading-none">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-0.5">OPENAI</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-4 bg-white/5 self-center" />
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.groq ? 'bg-orange-500 animate-pulse-slow' : 'bg-zinc-800'}`} />
                        <div className="flex flex-col leading-none">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-0.5">GROQ</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ContentMetrics = () => {
        const text = content.replace(/<[^>]*>/g, ' ');
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const readTime = Math.ceil(words / 225);

        return (
            <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-1.5 px-3 rounded-2xl shadow-xl">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{words} <span className="text-[7px] text-zinc-600">Palabras</span></span>
                    </div>
                    <div className="w-[1px] h-4 bg-white/5 self-center" />
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{readTime} <span className="text-[7px] text-zinc-600">MIN</span></span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full space-y-8 pb-32 animate-in fade-in duration-700 px-4 md:px-8 pt-0 md:pt-0">
            {/* Header Navbar - REDESIGNED GRID */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 items-center relative lg:sticky top-0 z-[90] bg-black/80 backdrop-blur-md py-3 border-b border-white/5 -mx-4 md:-mx-8 px-4 md:px-8 shadow-2xl gap-4 lg:gap-0">

                {/* Left Section: Back + Title (Strict Constraint) */}
                <div className="flex items-center gap-3 w-full lg:w-auto overflow-hidden">
                    <Link href="/superadmin/blog" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 shrink-0">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex-1 min-w-0 max-w-[180px] xl:max-w-[300px]">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-widest ${status === 'Publicado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {status}
                            </span>
                            <span className="text-[7px] text-gray-600 font-bold uppercase tracking-widest truncate">
                                {saveTime}
                            </span>
                        </div>
                        <h1 className="text-xs md:text-sm font-black text-white uppercase tracking-tighter leading-tight truncate">
                            {title || "Artículo Sin Título"}
                        </h1>
                    </div>
                </div>

                {/* Center Section: Metrics (Always Centered in Grid) */}
                <div className="flex items-center justify-center gap-2 w-full lg:w-auto order-3 lg:order-none">
                    <BlogAIStatus />
                    <ContentMetrics />
                </div>

                {/* Right Section: Buttons (Aligned Right) */}
                <div className="flex items-center justify-end gap-2 w-full lg:w-auto order-2 lg:order-none">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="h-9 px-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                    >
                        <Eye className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Vista Previa</span>
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="h-9 w-9 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-red-500"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        className={`h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-1.5 ${status === 'Borrador' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500' : 'bg-white/5 border border-white/5 text-gray-400'}`}
                    >
                        {isSaving ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Borrador</span>
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        className="h-9 px-6 bg-[#00E58F]/10 border border-[#00E58F]/30 text-[#00E58F] hover:bg-[#00E58F]/20 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,143,0.15)]"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Publicar
                    </button>
                </div>
            </div>

            {/* Mobile Action Buttons (Compact Horizontal) */}
            <div className="flex sm:hidden items-center gap-2 w-full mt-2 justify-end">
                <button
                    onClick={() => setShowPreview(true)}
                    className="h-10 px-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1 flex-1 justify-center"
                >
                    <Eye className="w-3.5 h-3.5" /> Vista Previa
                </button>
                <button
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    className={`h-10 px-3 flex-1 flex items-center justify-center gap-1 rounded-xl font-black text-[9px] uppercase tracking-widest border ${status === 'Borrador' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/5 text-gray-400'}`}
                >
                    {isSaving ? <RotateCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Borrador
                </button>
                <button
                    onClick={() => handleSave(true)}
                    className="h-10 px-3 shrink-0 bg-[#00E58F]/10 border border-[#00E58F]/30 text-[#00E58F] rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1"
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-10 px-3 flex-shrink-0 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-500"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="mb-6">
                {/* Big Title Input */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Escribe el título aquí..."
                    className="w-full bg-transparent border-0 text-xl md:text-3xl font-black text-white px-0 py-2 focus:ring-0 focus:outline-none placeholder:text-gray-700 tracking-tighter leading-tight"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Main Content Area (70%) */}
                <div className="lg:col-span-8 space-y-6">


                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Comienza a redactar la historia..."
                        onAIGenerate={handleGenerateAI}
                        isGeneratingAI={isGenerating}
                        onCancelAIGenerate={cancelAIGeneration}
                        onImageSearch={() => { setImageSearchTarget('content'); setShowImageSearch(true); }}
                    />
                </div>

                {/* Sidebar Setup (30%) */}
                <div className="lg:col-span-4 space-y-6 sticky top-[100px]">

                    {/* Featured Image */}
                    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Imagen Destacada</h3>
                            </div>
                            <button
                                onClick={() => { setImageSearchTarget('cover'); setShowImageSearch(true); }}
                                className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
                            >
                                <Search className="w-3 h-3" /> Buscar
                            </button>
                        </div>

                        <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverSelect} />

                        {coverImage ? (
                            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden group border border-white/10">
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button onClick={() => coverInputRef.current?.click()} className="p-3 bg-white text-black hover:bg-blis-red hover:text-white rounded-xl transition-colors"><Camera className="w-4 h-4" /></button>
                                    <button onClick={() => setCoverImage(null)} className="p-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => coverInputRef.current?.click()}
                                className="aspect-[16/9] w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3"
                            >
                                <div className="p-3 bg-white/5 rounded-full"><FileUp className="w-6 h-6 text-gray-500" /></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subir Portada</p>
                                    <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">1200 x 630px ideal</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Gamificación & Premium */}
                    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Premium & Gamificación</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Activar</span>
                                <button 
                                    onClick={() => setIsPremium(!isPremium)}
                                    className={`w-10 h-5 rounded-full relative transition-all duration-300 ${isPremium ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${isPremium ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>

                        {isPremium && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Costo de Desbloqueo (Blis Coins)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/30 transition-colors"
                                    />
                                    <Coins className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                </div>
                                <p className="text-[8px] text-gray-600 uppercase tracking-widest ml-1 mt-1">Precio que el usuario paga por acceder permanentemente.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Tiempo de Lectura (S)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={rewardSeconds}
                                        onChange={(e) => setRewardSeconds(parseInt(e.target.value) || 0)}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Recompensa (Coins)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={rewardAmount}
                                        onChange={(e) => setRewardAmount(parseInt(e.target.value) || 0)}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                    <Coins className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                </div>
                            </div>
                        </div>
                        <p className="text-[8px] text-emerald-500/60 font-medium uppercase tracking-widest text-center">Premio otorgado al usuario al completar la lectura.</p>
                    </div>

                    {/* Taxonomy (Categories & Tags) */}
                    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <List className="w-4 h-4 text-blis-red" />
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Taxonomía</h3>
                            </div>
                            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Relacionados auto</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Categoría Principal</label>
                            <input
                                type="text"
                                list="categories-list"
                                value={category === "Sin Categoría" ? "" : category}
                                onChange={(e) => setCategory(e.target.value)}
                                onBlur={(e) => {
                                    const val = e.target.value.trim();
                                    if (val && !savedCategories.includes(val)) setSavedCategories([...savedCategories, val]);
                                    if (!val) setCategory("Sin Categoría");
                                }}
                                placeholder="Escribe tu nueva categoría (Ej. PropTech)..."
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                            />
                            <datalist id="categories-list">
                                {savedCategories.map(c => <option key={c} value={c} />)}
                            </datalist>
                            <p className="text-[8px] text-gray-600 uppercase tracking-widest ml-1 mt-1">Los artículos relacionados se filtrarán por esta categoría.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Etiquetas (Tags)</label>
                            <div className="w-full bg-black border border-white/10 rounded-xl p-2 min-h-[50px] flex flex-wrap gap-2 focus-within:border-white/30 transition-colors">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-white/10 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-gray-400 hover:text-white"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    list="tags-list"
                                    placeholder="Añadir etiqueta (Enter)..."
                                    className="flex-1 bg-transparent min-w-[120px] text-sm text-white focus:outline-none px-2 py-1"
                                />
                                <datalist id="tags-list">
                                    {savedTags.filter(t => !tags.includes(t)).map(t => <option key={t} value={t} />)}
                                </datalist>
                            </div>
                        </div>
                    </div>

                    {/* SEO Meta */}
                    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-purple-500" />
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Optimización SEO</h3>
                            </div>
                            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Ideal para compartir</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Título SEO</label>
                            <input
                                type="text"
                                value={seoTitle}
                                onChange={(e) => setSeoTitle(e.target.value)}
                                placeholder="Título para sumario de Google..."
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-gray-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Extracto Corto (Excerpt)</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Breve resumen del artículo (max 160 caracteres). Aparecerá en las tarjetas y resultados de búsqueda."
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors resize-none h-24 placeholder:text-gray-700"
                            />
                            <p className="text-[9px] text-gray-500 font-bold ml-1 text-right">{excerpt.length}/160</p>
                            <p className="text-[8px] text-gray-400 font-bold ml-1 uppercase mt-2 text-center">Estos metadatos y la imagen de portada se integrarán automáticamente para compartir el enlace en redes sociales.</p>
                        </div>
                    </div>

                </div>
            </div>


            {/* ── Analytics Panel ─────────────────────────────────────────── */}
            <div className="mt-6">
                <button
                    onClick={() => setShowAnalytics(prev => !prev)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <BarChart2 className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <p className="text-[11px] font-black text-white uppercase tracking-widest">Analítica del Artículo</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Comportamiento, geografía, audiencia y tendencias</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest hidden sm:block">{showAnalytics ? "Ocultar" : "Ver métricas"}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showAnalytics ? "rotate-180" : ""}`} />
                    </div>
                </button>

                <AnimatePresence>
                    {showAnalytics && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-4">
                                {/* Row 1 — KPI cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: "Visitas Totales", value: "3,847", sub: "+12.4% este mes", color: "text-emerald-400", icon: "👁" },
                                        { label: "Tiempo Promedio", value: "04:32", sub: "min de lectura", color: "text-blue-400", icon: "⏱" },
                                        { label: "Tasa de Rebote", value: "34.5%", sub: "-5.2% vs anterior", color: "text-amber-400", icon: "↩" },
                                        { label: "CTR Búsqueda", value: "6.8%", sub: "Google Search", color: "text-purple-400", icon: "🔍" },
                                    ].map((kpi, i) => (
                                        <div key={i} className="bg-zinc-950 border border-white/5 rounded-2xl p-4 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{kpi.label}</p>
                                                <span className="text-base">{kpi.icon}</span>
                                            </div>
                                            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                                            <p className="text-[9px] text-gray-600 font-bold">{kpi.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Row 2 — Hours chart + Traffic Sources */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Hours of day heatmap */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Horarios de Lectura</p>
                                            <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">Hora local</span>
                                        </div>
                                        <div className="flex gap-1 items-end h-16">
                                            {[8, 12, 20, 35, 55, 70, 85, 95, 80, 60, 40, 25, 18, 30, 48, 65, 90, 100, 88, 72, 50, 30, 15, 8].map((h, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                    <div className="w-full bg-blue-500/80 rounded-sm" style={{ height: `${h}%` }} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-[8px] text-gray-600 font-bold">
                                            <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span>
                                        </div>
                                        <p className="text-[9px] text-gray-500">Pico máximo: <span className="text-blue-400 font-black">6:00 - 9:00 PM</span></p>
                                    </div>

                                    {/* Traffic Sources */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 space-y-3">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Fuentes de Tráfico</p>
                                        <div className="space-y-2.5">
                                            {[
                                                { name: "Google Orgánico", pct: 48, color: "bg-emerald-500" },
                                                { name: "Redes Sociales", pct: 27, color: "bg-purple-500" },
                                                { name: "Directo", pct: 14, color: "bg-blue-500" },
                                                { name: "Referidos", pct: 8, color: "bg-amber-500" },
                                                { name: "Email", pct: 3, color: "bg-blis-red" },
                                            ].map((src, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-[10px] text-gray-300 font-bold">{src.name}</span>
                                                        <span className="text-[10px] text-white font-black">{src.pct}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className={`h-full ${src.color} rounded-full`} style={{ width: `${src.pct}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3 — Countries + Age + Devices */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Countries */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 space-y-3">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Países Top</p>
                                        <div className="space-y-2">
                                            {[
                                                { flag: "🇪🇨", name: "Ecuador", pct: 61 },
                                                { flag: "🇺🇸", name: "USA", pct: 14 },
                                                { flag: "🇨🇴", name: "Colombia", pct: 10 },
                                                { flag: "🇲🇽", name: "México", pct: 8 },
                                                { flag: "🇪🇸", name: "España", pct: 7 },
                                            ].map((c, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="text-base">{c.flag}</span>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between mb-0.5">
                                                            <span className="text-[9px] text-gray-300 font-bold">{c.name}</span>
                                                            <span className="text-[9px] text-white font-black">{c.pct}%</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-white/5 rounded-full">
                                                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${c.pct}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Age distribution */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 space-y-3">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Rango de Edad</p>
                                        <div className="flex items-end gap-2 h-24 pt-2">
                                            {[
                                                { range: "18-24", pct: 18, color: "bg-blue-400" },
                                                { range: "25-34", pct: 100, color: "bg-purple-500" },
                                                { range: "35-44", pct: 72, color: "bg-emerald-500" },
                                                { range: "45-54", pct: 40, color: "bg-amber-500" },
                                                { range: "55+", pct: 20, color: "bg-blis-red" },
                                            ].map((age, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                    <div className={`w-full ${age.color} rounded-t-sm`} style={{ height: `${age.pct}%` }} />
                                                    <span className="text-[7px] text-gray-500 font-bold whitespace-nowrap">{age.range}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-gray-500">Mayor segmento: <span className="text-purple-400 font-black">25-34 años</span></p>
                                    </div>

                                    {/* Device types */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 space-y-3">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Dispositivos</p>
                                        <div className="space-y-3">
                                            {[
                                                { icon: "📱", name: "Móvil", pct: 62, color: "bg-emerald-500" },
                                                { icon: "💻", name: "Desktop", pct: 31, color: "bg-blue-500" },
                                                { icon: "⬛", name: "Tablet", pct: 7, color: "bg-amber-500" },
                                            ].map((d, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1.5">{d.icon} {d.name}</span>
                                                        <span className="text-[10px] text-white font-black">{d.pct}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full">
                                                        <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-gray-500 pt-1 border-t border-white/5">62% de lectores son mobile-first</p>
                                    </div>
                                </div>

                                {/* Row 4 — Engagement + Social Shares + Keywords */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Scroll depth */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 space-y-3">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Profundidad de Scroll</p>
                                        <div className="space-y-2">
                                            {[
                                                { label: "25% del artículo", pct: 92 },
                                                { label: "50% del artículo", pct: 71 },
                                                { label: "75% del artículo", pct: 45 },
                                                { label: "100% completo", pct: 28 },
                                            ].map((s, i) => (
                                                <div key={i} className="space-y-0.5">
                                                    <div className="flex justify-between">
                                                        <span className="text-[9px] text-gray-400 font-bold">{s.label}</span>
                                                        <span className="text-[9px] text-white font-black">{s.pct}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full">
                                                        <div className="h-full bg-gradient-to-r from-blis-red to-purple-500 rounded-full" style={{ width: `${s.pct}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Social shares */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 space-y-3">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Interacciones Sociales</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { net: "WhatsApp", val: "284", icon: "💬", color: "text-emerald-400" },
                                                { net: "LinkedIn", val: "127", icon: "💼", color: "text-blue-400" },
                                                { net: "Facebook", val: "93", icon: "👍", color: "text-blue-600" },
                                                { net: "Twitter/X", val: "61", icon: "🐦", color: "text-sky-400" },
                                            ].map((s, i) => (
                                                <div key={i} className="bg-white/5 rounded-xl p-3 text-center space-y-1">
                                                    <span className="text-lg">{s.icon}</span>
                                                    <p className={`text-base font-black ${s.color}`}>{s.val}</p>
                                                    <p className="text-[8px] text-gray-500 font-bold uppercase">{s.net}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Top keywords */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 space-y-3">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Keywords Orgánicas</p>
                                        <div className="space-y-2">
                                            {[
                                                { kw: "inversión inmobiliaria quito", pos: 3, clicks: 420 },
                                                { kw: "plusvalía CBD quito 2026", pos: 7, clicks: 185 },
                                                { kw: "preventa de lujo ecuador", pos: 12, clicks: 94 },
                                                { kw: "blis corporation blog", pos: 1, clicks: 320 },
                                            ].map((k, i) => (
                                                <div key={i} className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5 last:border-0">
                                                    <span className="text-[9px] text-gray-300 font-bold truncate">{k.kw}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${k.pos <= 3 ? "bg-emerald-500/20 text-emerald-400" : k.pos <= 10 ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-gray-400"}`}>#{k.pos}</span>
                                                        <span className="text-[9px] text-white font-black">{k.clicks}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer note */}
                                <p className="text-center text-[9px] text-gray-600 uppercase tracking-widest pb-2">
                                    Datos simulados · Integración real disponible con Google Analytics 4
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 border backdrop-blur-md px-6 py-4 rounded-2xl z-[300] flex items-center gap-3 ${
                            toastMessage.includes('Error') || toastMessage.includes('eliminado')
                            ? 'bg-red-500/20 border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                            : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                        }`}
                    >
                        {toastMessage.includes('Error') || toastMessage.includes('eliminado') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        <span className="text-sm font-black uppercase tracking-widest">{toastMessage || (status === "Publicado" ? "¡Artículo Publicado!" : "Progreso Guardado")}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cropper Modal explicitly for Cover Image */}
            {
                coverCroppingSource && typeof document !== 'undefined' && createPortal(
                    <ImageCropper
                        src={coverCroppingSource}
                        onCrop={(base64) => {
                            setCoverImage(base64);
                            setCoverCroppingSource(null);
                        }}
                        onCancel={() => setCoverCroppingSource(null)}
                    />,
                    document.body
                )
            }

            {/* AI Generation Modal */}
            <AnimatePresence>
                {showAIModal && typeof document !== 'undefined' && createPortal(
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-zinc-950 border border-purple-500/20 rounded-[3rem] p-10 w-full max-w-2xl shadow-[0_0_80px_rgba(168,85,247,0.15)]">
                            <div className="py-8 space-y-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                                        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
                                        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-purple-400" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-white font-black text-sm uppercase tracking-widest">{aiSteps[Math.min(aiStep, aiSteps.length - 1)]}</p>
                                        <p className="text-gray-600 text-xs">Paso {Math.min(aiStep + 1, aiSteps.length)} de {aiSteps.length}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-purple-500 rounded-full"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${Math.min((aiStep / aiSteps.length) * 100, 100)}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    {aiSteps.map((step, i) => (
                                        <div key={step} className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-all ${i < aiStep ? 'text-emerald-500' : i === aiStep ? 'text-purple-400' : 'text-gray-700'}`}>
                                            {i < aiStep ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : i === aiStep ? <RotateCw className="w-3.5 h-3.5 flex-shrink-0 animate-spin" /> : <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex-shrink-0" />}
                                            <span className={i === aiStep ? 'text-white' : ''}>{step}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-white/5 flex justify-center">
                                    <button
                                        onClick={cancelAIGeneration}
                                        className="h-[40px] px-6 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest text-red-500 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all w-full max-w-[200px]"
                                    >
                                        <X className="w-3.5 h-3.5" /> Detener Generación
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>

            {/* Preview Modal - AnimatePresence INSIDE portal */}
            {
                mounted && createPortal(
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black overflow-y-auto">
                                <div className="flex items-center justify-between px-6 md:px-10 py-3 sticky top-0 bg-[#0a0a0a] border-b border-white/5 z-10 w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vista Previa del Artículo</span>
                                    </div>
                                    <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-blis-red hover:bg-red-700 text-white flex items-center gap-2 rounded-lg transition-all font-black uppercase text-[10px] tracking-widest">
                                        <X className="w-3.5 h-3.5" /> Cerrar Vista Previa
                                    </button>
                                </div>
                                <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
                                    {coverImage && (<div className="aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-2xl"><img src={coverImage} alt="Cover" className="w-full h-full object-cover" /></div>)}
                                    {category && category !== "Sin Categoría" && (<span className="inline-block px-3 py-1 bg-blis-red/20 text-blis-red text-[10px] font-black uppercase tracking-widest rounded-full border border-blis-red/20">{category}</span>)}
                                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">{title || "Artículo Sin Título"}</h1>
                                    {excerpt && <p className="text-lg text-gray-400 leading-relaxed border-l-4 border-blis-red pl-6">{excerpt}</p>}
                                    <div className="flex flex-wrap gap-2">{tags.map(t => <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 font-bold">#{t}</span>)}</div>
                                    <div className="prose prose-invert max-w-none text-gray-300 prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter prose-h1:text-4xl prose-h2:text-2xl prose-blockquote:border-l-4 prose-blockquote:border-blis-red prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-li:mb-2" dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-600 italic">Sin contenido aún...</p>' }} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }

            {/* Delete Modal - AnimatePresence INSIDE portal */}
            {
                mounted && createPortal(
                    <AnimatePresence>
                        {showDeleteConfirm && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-950 border border-red-500/20 rounded-[2rem] p-8 w-full max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none" />
                                    <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center relative z-10 text-red-500 mb-4"><Trash2 className="w-8 h-8" /></div>
                                    <div className="space-y-2 relative z-10">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">¿Eliminar Artículo?</h3>
                                        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase px-4 leading-relaxed">Esta acción no se puede deshacer. Todos los datos se perderán.</p>
                                    </div>
                                    <div className="flex gap-3 relative z-10 w-full pt-4 border-t border-white/5">
                                        <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-gray-300 uppercase tracking-widest transition-all border border-white/5">Cancelar</button>
                                        <button onClick={handleDelete} className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)]">Eliminar</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }

            {/* Image Search Modal */}
            {
                showImageSearch && typeof document !== 'undefined' && createPortal(
                    <ImageSearch
                        onSelect={(url) => {
                            if (imageSearchTarget === 'cover') {
                                setCoverImage(url);
                            } else {
                                const imgHtml = `<img src="${url}" alt="Imagen" style="max-width: 100%; border-radius: 12px; margin: 1rem 0;" />`;
                                setContent(prev => prev + imgHtml);
                            }
                            setShowImageSearch(false);
                        }}
                        onClose={() => setShowImageSearch(false)}
                    />,
                    document.body
                )
            }

        </div >
    );
}
