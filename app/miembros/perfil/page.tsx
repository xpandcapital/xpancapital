"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Shield, Camera, Lock, Bell, CheckCircle2, ChevronDown, Trash2, X, RotateCcw, ZoomIn, ZoomOut, Check, Search, RotateCw, FlipHorizontal, Coins, TrendingUp, TrendingDown, Clock, BookOpen, Sparkles, ShoppingCart, GraduationCap, FileText, UserPlus, Settings } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isAdminRole } from "@/lib/auth/permissions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useCoins } from "@/lib/hooks/useCoins";
import { useReferrals } from "@/lib/hooks/useReferrals";
import { ReferralPanel } from "@/components/profile/ReferralPanel";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";

const NOTIFICACION_TIPOS = [
  { key: "blog", label: "Blog", icon: FileText, color: "text-violet-400" },
  { key: "leads", label: "Leads", icon: UserPlus, color: "text-emerald-400" },
  { key: "compras", label: "Compras", icon: ShoppingCart, color: "text-amber-400" },
  { key: "cursos", label: "Cursos", icon: GraduationCap, color: "text-blue-400" },
  { key: "sistema", label: "Sistema", icon: Settings, color: "text-gray-400" },
];

const COUNTRIES = [
    { name: "Ecuador", code: "+593", flag: "🇪🇨" },
    { name: "Colombia", code: "+57", flag: "🇨🇴" },
    { name: "Perú", code: "+51", flag: "🇵🇪" },
    { name: "México", code: "+52", flag: "🇲🇽" },
    { name: "España", code: "+34", flag: "🇪🇸" },
    { name: "Argentina", code: "+54", flag: "🇦🇷" },
    { name: "Chile", code: "+56", flag: "🇨🇱" },
    { name: "Venezuela", code: "+58", flag: "🇻🇪" },
    { name: "EE.UU.", code: "+1", flag: "🇺🇸" },
];

function ImageCropper({ src, onCrop, onCancel }: { src: string; onCrop: (base64: string) => void; onCancel: () => void }) {
    const [zoom, setZoom] = useState(0); // Initialized on load
    const [rotation, setRotation] = useState(0);
    const [flipX, setFlipX] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, zoom: 1 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Constraint logic to prevent black bars
    const clampPosition = useCallback((pos: { x: number; y: number }, currentZoom: number, currentRotation: number) => {
        if (!imageRef.current || !containerRef.current) return pos;
        const containerSize = containerRef.current.offsetWidth;
        const img = imageRef.current;

        let imgW = img.naturalWidth * currentZoom;
        let imgH = img.naturalHeight * currentZoom;

        if (currentRotation % 180 !== 0) {
            [imgW, imgH] = [imgH, imgW];
        }

        const limitX = Math.max(0, (imgW - containerSize) / 2);
        const limitY = Math.max(0, (imgH - containerSize) / 2);

        return {
            x: Math.min(Math.max(pos.x, -limitX), limitX),
            y: Math.min(Math.max(pos.y, -limitY), limitY)
        };
    }, []);

    // Initial setup to fit image
    const onImageLoad = () => {
        if (!imageRef.current || !containerRef.current) return;
        const container = containerRef.current.offsetWidth;
        const img = imageRef.current;
        const initialZoom = Math.max(container / img.naturalWidth, container / img.naturalHeight);
        setZoom(initialZoom);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isResizing) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleResizeDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStart({ x: e.clientX, zoom: zoom });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const newPos = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
            setPosition(clampPosition(newPos, zoom, rotation));
        }
        if (isResizing) {
            const deltaX = e.clientX - resizeStart.x;
            const newZoom = Math.max(0.01, resizeStart.zoom + deltaX / 200);

            if (imageRef.current && containerRef.current) {
                const container = containerRef.current.offsetWidth;
                const minZoomNeeded = rotation % 180 === 0
                    ? Math.max(container / imageRef.current.naturalWidth, container / imageRef.current.naturalHeight)
                    : Math.max(container / imageRef.current.naturalHeight, container / imageRef.current.naturalWidth);

                const finalZoom = Math.max(newZoom, minZoomNeeded);
                setZoom(finalZoom);
                setPosition(prev => clampPosition(prev, finalZoom, rotation));
            } else {
                setZoom(newZoom);
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newZoom = Math.min(Math.max(zoom + delta, 0.01), 10);

        if (imageRef.current && containerRef.current) {
            const container = containerRef.current.offsetWidth;
            const minZoomNeeded = rotation % 180 === 0
                ? Math.max(container / imageRef.current.naturalWidth, container / imageRef.current.naturalHeight)
                : Math.max(container / imageRef.current.naturalHeight, container / imageRef.current.naturalWidth);

            const finalZoom = Math.max(newZoom, minZoomNeeded);
            setZoom(finalZoom);
            setPosition(prev => clampPosition(prev, finalZoom, rotation));
        } else {
            setZoom(newZoom);
        }
    };

    const rotate = () => {
        setRotation(prev => {
            const newRotation = (prev + 90) % 360;
            if (imageRef.current && containerRef.current) {
                const container = containerRef.current.offsetWidth;
                const minZoomNeeded = newRotation % 180 === 0
                    ? Math.max(container / imageRef.current.naturalWidth, container / imageRef.current.naturalHeight)
                    : Math.max(container / imageRef.current.naturalHeight, container / imageRef.current.naturalWidth);

                const finalZoom = Math.max(zoom, minZoomNeeded);
                setZoom(finalZoom);
                setTimeout(() => setPosition(p => clampPosition(p, finalZoom, newRotation)), 0);
            }
            return newRotation;
        });
    };
    const flip = () => setFlipX(prev => prev * -1);

    const doCrop = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx || !imageRef.current || !containerRef.current) return;

        const cropSize = 500; // High quality output
        canvas.width = cropSize;
        canvas.height = cropSize;

        const container = containerRef.current;
        const scale = cropSize / container.offsetWidth;

        ctx.save();
        ctx.translate(cropSize / 2, cropSize / 2);

        // Match the coordinate system of the CSS transform
        // The image is absolute positioned at center 50% usually? 
        // No, current implementation is just translate(pos.x, pos.y)

        ctx.translate(position.x * scale, position.y * scale);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom * flipX * scale, zoom * scale);

        ctx.drawImage(
            imageRef.current,
            -imageRef.current.naturalWidth / 2,
            -imageRef.current.naturalHeight / 2
        );

        ctx.restore();
        onCrop(canvas.toDataURL("image/jpeg", 0.95));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4" onWheel={handleWheel}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950 border border-white/10 rounded-[3rem] p-10 max-w-md w-full space-y-8 shadow-2xl"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Ajustar Imagen</h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            Scroll o Esquinas para Zoom • Arrastra para mover
                        </p>
                    </div>
                    <button onClick={onCancel} className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div
                    ref={containerRef}
                    className="aspect-square w-full bg-black rounded-[2rem] overflow-hidden border border-white/5 cursor-move relative touch-none flex items-center justify-center"
                    onMouseDown={handleMouseDown}
                >
                    <div className="relative" style={{ width: 0, height: 0 }}>
                        <img
                            ref={imageRef}
                            src={src}
                            onLoad={onImageLoad}
                            alt="Crop"
                            className="max-w-none select-none pointer-events-none"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom * flipX}, ${zoom})`,
                                transformOrigin: "center center",
                                width: imageRef.current?.naturalWidth || 'auto',
                                height: imageRef.current?.naturalHeight || 'auto',
                                position: 'absolute',
                                left: -(imageRef.current?.naturalWidth || 0) / 2,
                                top: -(imageRef.current?.naturalHeight || 0) / 2
                            }}
                        />

                        {/* Control Handles in 4 Corners */}
                        {[
                            { x: 1, y: 1 },    // Bottom Right
                            { x: -1, y: 1 },   // Bottom Left
                            { x: 1, y: -1 },   // Top Right
                            { x: -1, y: -1 }   // Top Left
                        ].map((handle, i) => (
                            <div
                                key={i}
                                className="absolute z-10 w-6 h-6 bg-blis-red rounded-full border-4 border-black shadow-xl flex items-center justify-center pointer-events-auto hover:scale-110 transition-transform"
                                style={{
                                    transform: `translate(${position.x + (imageRef.current?.naturalWidth || 0) / 2 * zoom * flipX * handle.x}px, ${position.y + (imageRef.current?.naturalHeight || 0) / 2 * zoom * handle.y}px)`,
                                    left: -12,
                                    top: -12,
                                    cursor: (handle.x * handle.y > 0) ? 'nwse-resize' : 'nesw-resize'
                                }}
                                onMouseDown={handleResizeDown}
                            >
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                        ))}
                    </div>

                    {/* Mask Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-[10px] border-black/40" />
                    <div className="absolute inset-0 border-2 border-white/10 pointer-events-none rounded-full ring-[200px] ring-black/80" />
                    <div className="absolute inset-0 border-2 border-blis-red/40 pointer-events-none rounded-full" />
                </div>

                <div className="flex gap-4">
                    <button onClick={rotate} className="flex-1 p-4 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2">
                        <RotateCw className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Girar</span>
                    </button>
                    <button onClick={flip} className="flex-1 p-4 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2">
                        <FlipHorizontal className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Espejo</span>
                    </button>
                </div>

                <div className="flex gap-4 pt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-5 bg-zinc-900 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-white/5 hover:bg-white/5 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={doCrop}
                        className="flex-1 py-5 bg-blis-red text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-blis-red/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Guardar Perfil
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const { balance, transactions, loading: coinsLoading, fetchBalance, fetchTransactions } = useCoins(user?.id);

    useEffect(() => {
        if (user && isAdminRole(user.role)) {
            router.replace("/superadmin/perfil");
        }
    }, [user, router]);

    useEffect(() => {
        if (user?.id) {
            fetchBalance();
            fetchTransactions(10);
        }
    }, [user?.id, fetchBalance, fetchTransactions]);

    const [name, setName] = useState(user?.name || "Kevin Valdez");
    const [email, setEmail] = useState(user?.email || "kevin.inv@bliscorp.com");
    const [phone, setPhone] = useState(user?.phone || "991234567");
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const [profilePic, setProfilePic] = useState<string | null>(user?.profilePic || null);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [notifications, setNotifications] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [notificacionesTipos, setNotificacionesTipos] = useState<Record<string, boolean>>({
        blog: true,
        leads: true,
        compras: true,
        cursos: true,
        sistema: true,
    });
    const [tiposCargados, setTiposCargados] = useState(false);

    useEffect(() => {
        if (!user?.id || tiposCargados) return;
        const loadTipos = async () => {
            const supabase = getSupabase();
            if (!supabase) return;
            const { data } = await supabase
                .from("profiles")
                .select("notificaciones_tipos")
                .eq("id", user.id)
                .single();
            if (data?.notificaciones_tipos) {
                setNotificacionesTipos(data.notificaciones_tipos);
            }
            setTiposCargados(true);
        };
        loadTipos();
    }, [user?.id, tiposCargados]);

    const handleToggleTipo = async (key: string, enabled: boolean) => {
        const nuevos = { ...notificacionesTipos, [key]: enabled };
        setNotificacionesTipos(nuevos);
        if (!user?.id) return;
        const supabase = getSupabase();
        if (!supabase) return;
        await supabase
            .from("profiles")
            .update({ notificaciones_tipos: nuevos })
            .eq("id", user.id);
    };

    // Sync with global state
    useEffect(() => {
        if (user) {
            if (user.name) setName(user.name);
            if (user.email) setEmail(user.email);
            if (user.profilePic) setProfilePic(user.profilePic);
        }
    }, [user]);

    const handleUpdate = () => {
        updateProfile({ name, profilePic });
        showToast("¡Éxito! Tus datos han sido actualizados en la base de datos de Blis Corp.", "success");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedBase64: string) => {
        setProfilePic(croppedBase64);
        setTempImage(null);
        updateProfile({ profilePic: croppedBase64 });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4 md:px-8 pt-8 md:pt-8 w-full">
            {/* Header Profile Card */}
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 bg-zinc-950/50 border border-white/5 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden shadow-2xl w-full">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,11,60,0.1)_0%,transparent_40%)] pointer-events-none" />

                <div className="relative group shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-blis-red to-red-900 p-1 shadow-2xl overflow-hidden ring-4 ring-white/5 relative">
                        {profilePic ? (
                            <img src={profilePic} alt="Profile" className="w-full h-full object-cover rounded-[1.8rem] sm:rounded-[2.2rem]" />
                        ) : (
                            <div className="w-full h-full rounded-[1.8rem] sm:rounded-[2.2rem] bg-black/40 flex items-center justify-center text-white font-black text-4xl sm:text-5xl">
                                {name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2 sm:p-3 bg-blis-red text-white rounded-xl sm:rounded-2xl border-4 border-black hover:scale-110 transition-transform shadow-xl z-20"
                    >
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                </div>

                {tempImage && (
                    <ImageCropper
                        src={tempImage}
                        onCrop={onCropComplete}
                        onCancel={() => setTempImage(null)}
                    />
                )}

                <div className="text-center md:text-left space-y-3 sm:space-y-4 w-full">
                    <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3">
                        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none">{name}</h1>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 className="w-3 h-3" /> Verificado
                        </span>
                    </div>
                    <p className="text-gray-400 font-medium text-xs sm:text-sm leading-relaxed max-w-xl">Inversor Residencial Senior & Miembro Fundador de Blis Academy.</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-4 mt-2">
                        <div className="bg-white/5 border border-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">ID: BLIS-7742</div>
                        <div className="bg-white/5 border border-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">Desde: Enero 2026</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Account Settings */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-white uppercase tracking-widest px-4 flex items-center gap-3">
                        <User className="w-5 h-5 text-blis-red" /> Información de Cuenta
                    </h2>
                    <div className="bg-zinc-950/30 border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Nombre Completo</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blis-red transition-colors" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:border-blis-red transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Correo Electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blis-red transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:border-blis-red transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Teléfono Corporativo</label>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setIsCountryOpen(!isCountryOpen)}
                                        className="h-full bg-white/5 border border-white/10 rounded-2xl px-4 flex items-center gap-2 hover:bg-white/10 transition-all text-sm font-bold text-white"
                                    >
                                        <span>{selectedCountry.flag}</span>
                                        <span>{selectedCountry.code}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isCountryOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl"
                                                onBlur={(e) => {
                                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                                        setIsCountryOpen(false);
                                                        setCountrySearch("");
                                                    }
                                                }}
                                            >
                                                <div className="p-2 border-b border-white/5 bg-black/20 sticky top-0 z-10">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                                                        <input
                                                            type="text"
                                                            autoFocus
                                                            placeholder="Buscar país..."
                                                            value={countrySearch}
                                                            onChange={(e) => setCountrySearch(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-[10px] font-bold text-white focus:outline-none focus:border-blis-red transition-all placeholder:text-gray-600"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto scrollbar-hide">
                                                    {COUNTRIES.filter(c =>
                                                        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                                        c.code.includes(countrySearch)
                                                    ).map((c) => (
                                                        <button
                                                            key={c.code}
                                                            onClick={() => {
                                                                setSelectedCountry(c);
                                                                setIsCountryOpen(false);
                                                                setCountrySearch("");
                                                            }}
                                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                                                        >
                                                            <span className="text-lg">{c.flag}</span>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{c.name}</span>
                                                                <span className="text-[9px] text-gray-500 font-bold">{c.code}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {COUNTRIES.filter(c =>
                                                        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                                        c.code.includes(countrySearch)
                                                    ).length === 0 && (
                                                            <div className="px-4 py-6 text-center">
                                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sin resultados</p>
                                                            </div>
                                                        )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="relative group flex-1">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blis-red transition-colors" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:border-blis-red transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleUpdate}
                            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blis-red hover:text-white transition-all shadow-xl"
                        >
                            Actualizar Datos
                        </button>
                    </div>
                </div>

                {/* Security and Preferences */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-white uppercase tracking-widest px-4 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blis-red" /> Seguridad & Accesos
                    </h2>
                    <div className="bg-zinc-950/30 border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                        <button
                            onClick={() => showToast("Función para cambiar contraseña habilitada. Revisa tu email para el enlace de seguridad.", "info")}
                            className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <Lock className="w-5 h-5 text-gray-500 group-hover:text-blis-red transition-colors" />
                                <span className="text-sm font-bold text-white">Cambiar Contraseña</span>
                            </div>
                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Activo</span>
                        </button>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <Bell className="w-5 h-5 text-gray-500 group-hover:text-blis-red transition-colors" />
                                <span className="text-sm font-bold text-white">Notificaciones Push</span>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative p-1 transition-colors duration-300 ${notifications ? 'bg-blis-red' : 'bg-zinc-800'}`}>
                                <motion.div
                                    animate={{ x: notifications ? 24 : 0 }}
                                    className="w-4 h-4 bg-white rounded-full"
                                />
                            </div>
                        </button>

                        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Bell className="w-3.5 h-3.5 text-gray-500" />
                                Tipos de Notificación
                            </h3>
                            <div className="space-y-2">
                                {NOTIFICACION_TIPOS.map(({ key, label, icon: IconComp, color }) => (
                                    <button
                                        key={key}
                                        onClick={() => handleToggleTipo(key, !notificacionesTipos[key])}
                                        className="w-full flex items-center justify-between p-2.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <IconComp className={`w-4 h-4 ${color}`} />
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
                                        </div>
                                        <div className={`w-10 h-5 rounded-full relative p-0.5 transition-colors duration-300 ${notificacionesTipos[key] ? 'bg-blis-red' : 'bg-zinc-800'}`}>
                                            <motion.div animate={{ x: notificacionesTipos[key] ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-blis-red/5 border border-blis-red/20 rounded-[2rem] space-y-4">
                            <h3 className="text-xs font-black text-white uppercase tracking-tight">Autenticación de 2 Factores</h3>
                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-widest">Añade una capa extra de seguridad a tu portal de inversión.</p>
                            <button
                                onClick={() => showToast("Iniciando configuración de 2FA...", "info")}
                                className="text-[10px] text-blis-red font-black uppercase tracking-[0.2em] border-b-2 border-blis-red/30 pb-1 hover:border-blis-red transition-all"
                            >
                                Configurar Ahora
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.")) {
                                showToast("Solicitud enviada. Un administrador se pondrá en contacto contigo para verificar la identidad.", "success");
                            }
                        }}
                        className="w-full py-5 bg-zinc-900 border border-white/5 text-gray-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar Cuenta
                    </button>
                </div>
            </div>

            {/* Coins Section */}
            <div className="mt-12 space-y-6">
                <h2 className="text-lg font-black text-white uppercase tracking-widest px-4 flex items-center gap-3">
                    <Coins className="w-5 h-5 text-amber-500" /> Blis Coins
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 p-8 rounded-[2.5rem] shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center">
                                <Coins className="w-7 h-7 text-black" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Balance Actual</p>
                                <p className="text-4xl font-black text-white">{coinsLoading ? '...' : balance.toLocaleString()}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-amber-300/70 font-medium">Coins disponibles para canjear</p>
                    </div>

                    {/* Earned Card */}
                    <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 p-8 rounded-[2.5rem] shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-black" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Ganados</p>
                                <p className="text-4xl font-black text-white">{transactions.filter(t => t.monto > 0).length}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-emerald-300/70 font-medium">Lecturas completadas</p>
                    </div>

                    {/* Spent Card */}
                    <div className="bg-gradient-to-br from-red-500/20 to-rose-500/10 border border-red-500/30 p-8 rounded-[2.5rem] shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center">
                                <TrendingDown className="w-7 h-7 text-black" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Canjeados</p>
                                <p className="text-4xl font-black text-white">{Math.abs(transactions.filter(t => t.monto < 0).reduce((sum, t) => sum + t.monto, 0)).toLocaleString()}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-red-300/70 font-medium">Coins usados en contenido</p>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-zinc-950/30 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" /> Últimas Transacciones
                        </h3>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {transactions.length} movimientos
                        </span>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm">No hay transacciones aún</p>
                            <p className="text-gray-600 text-xs mt-2">Lee artículos para ganar Blis Coins</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {transactions.slice(0, 10).map((tx, i) => (
                                <div key={tx.id || i} className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.monto > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                            {tx.monto > 0 ? (
                                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{tx.descripcion || tx.tipo}</p>
                                            <p className="text-[10px] text-gray-500">
                                                {new Date(tx.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-black ${tx.monto > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {tx.monto > 0 ? '+' : ''}{tx.monto}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reading History */}
                <div className="bg-zinc-950/30 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-500" /> Historial de Lectura
                        </h3>
                        <Link href="/blog" className="text-[10px] font-bold text-blis-red uppercase tracking-widest hover:text-white transition-colors">
                            Ver Blog
                        </Link>
                    </div>

                    <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Función en desarrollo</p>
                        <p className="text-gray-600 text-xs mt-2">Próximamente verás tu historial de artículos leídos</p>
                    </div>
                </div>

                {/* Unlocked Articles */}
                <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 p-8 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" /> Contenido Premium Desbloqueado
                        </h3>
                    </div>

                    <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 text-amber-500/50 mx-auto mb-4" />
                        <p className="text-gray-400 text-sm">Desbloquea contenido premium</p>
                        <p className="text-gray-500 text-xs mt-2">Los artículos que desbloquees aparecerán aquí</p>
                        <Link href="/blog" className="mt-4 inline-block px-6 py-3 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-amber-400 transition-all">
                            Explorar Blog
                        </Link>
                    </div>
                </div>

                {/* Referral Program */}
                <ReferralPanel />
            </div>
        </div>
    );
}
