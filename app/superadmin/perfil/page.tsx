"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Camera, Lock, Mail, Phone, Save, ShieldCheck, User as UserIcon, X, RotateCw, FlipHorizontal, Check, Search, ChevronDown, Trash2, Bell, ShoppingCart, GraduationCap, FileText, UserPlus, Settings } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isAdminRole, ROLE_CONFIG } from "@/lib/auth/permissions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { getSupabase } from "@/lib/supabase";

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
    const [zoom, setZoom] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [flipX, setFlipX] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, zoom: 1 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

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

        const cropSize = 500;
        canvas.width = cropSize;
        canvas.height = cropSize;

        const container = containerRef.current;
        const scale = cropSize / container.offsetWidth;

        ctx.save();
        ctx.translate(cropSize / 2, cropSize / 2);
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
                            { x: 1, y: 1 },    // BM
                            { x: -1, y: 1 },   // BL
                            { x: 1, y: -1 },   // TM
                            { x: -1, y: -1 }   // TL
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
                    <button onClick={onCancel} className="flex-1 py-5 bg-zinc-900 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-white/5 hover:bg-white/5 transition-all">Cancelar</button>
                    <button onClick={doCrop} className="flex-1 py-5 bg-blis-red text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-blis-red/20 transition-all flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Aplicar</button>
                </div>
            </motion.div>
        </div>
    );
}

export default function AdminProfile() {
    const { user, updateProfile } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (user && !isAdminRole(user.role)) {
            router.replace("/miembros/perfil");
        }
    }, [user, router]);

    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [cropperSrc, setCropperSrc] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const countryBtnRef = useRef<HTMLButtonElement>(null);
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [notifications, setNotifications] = useState(true);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

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

    // Flag para no reiniciar los campos cuando el usuario está editando
    const [formInitialized, setFormInitialized] = useState(false);

    // Inicializar campos del formulario SOLO UNA VEZ cuando el usuario carga
    useEffect(() => {
        if (user && !formInitialized) {
            const fullName = user.name || "";
            const parts = fullName.trim().split(/\s+/);
            setName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
            setEmail(user.email || "");
            const rawPhone = user.phone || "";
            const phoneMatch = rawPhone.match(/^(\+\d+)\s*(.*)$/);
            if (phoneMatch) {
                const foundCountry = COUNTRIES.find(c => c.code === phoneMatch[1]);
                if (foundCountry) setSelectedCountry(foundCountry);
                setPhone(phoneMatch[2] || "");
            } else {
                setPhone(rawPhone);
            }
            setProfilePic(user.profilePic || null);
            setFormInitialized(true);
        }
    }, [user, formInitialized])

    // Calcular posición del dropdown de países y cerrar al hacer click fuera
    useEffect(() => {
        if (isCountryOpen && countryBtnRef.current) {
            const rect = countryBtnRef.current.getBoundingClientRect()
            setDropdownPos({ top: rect.bottom + 8, left: rect.left })
        }
    }, [isCountryOpen])

    useEffect(() => {
        if (!isCountryOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest('.country-dropdown') && !target.closest('.country-trigger')) {
                setIsCountryOpen(false)
                setCountrySearch("")
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isCountryOpen])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setCropperSrc(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async () => {
        try {
            const fullPhone = phone ? `${selectedCountry.code} ${phone}` : '';
            await updateProfile({ name: `${name} ${lastName}`.trim(), email, phone: fullPhone, profilePic });
            showToast("Perfil actualizado correctamente", "success");
        } catch (error) {
            showToast("Error al actualizar perfil", "error");
        }
    };

    return (
        <div className="space-y-8 w-full mx-auto pb-16 px-4 md:px-8 pt-8 md:pt-8">
            <AnimatePresence>
                {cropperSrc && (
                    <ImageCropper
                        src={cropperSrc}
                        onCrop={(base64) => {
                            setProfilePic(base64);
                            setCropperSrc(null);
                        }}
                        onCancel={() => setCropperSrc(null)}
                    />
                )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Mi Perfil</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Administra tus datos personales, credenciales y vinculaciones de seguridad.</p>
                </div>
                <button
                    onClick={handleUpdate}
                    className="w-full sm:w-auto bg-blis-red text-white px-8 py-4 sm:py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)] mt-4 sm:mt-0"
                >
                    <Save className="w-5 h-5" /> Guardar Perfil
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-10">
                    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-10 flex flex-col items-center text-center">
                        <div
                            className="relative group cursor-pointer mb-8"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            <div className="w-40 h-40 rounded-full bg-zinc-900 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                                {profilePic ? (
                                    <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-20 h-20 text-gray-600" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">{name} {lastName}</h2>
                            <p className="text-gray-500 font-mono text-sm mb-6">{ROLE_CONFIG[user?.role || 'usuario']?.label || 'Miembro'}</p>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors border border-white/5"
                        >
                            Actualizar Fotografía
                        </button>
                    </div>

                    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-8">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Seguridad y Cuentas Vinculadas</h3>
                        <div className="flex items-center justify-between mb-6 bg-black/50 p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                <span className="text-sm font-medium text-white">Autenticación 2FA</span>
                            </div>
                            <span className="text-[10px] px-3 py-1 bg-white/5 rounded-md text-gray-500 font-black uppercase tracking-widest">Inactiva</span>
                        </div>
                        <button className="w-full flex items-center justify-center gap-4 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white text-gray-300 hover:text-black transition-all">
                            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            <span className="font-bold text-sm tracking-widest uppercase">Vincular Base Google</span>
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-zinc-950 border border-white/5 rounded-3xl">
                        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                            <h2 className="text-xl font-black text-white uppercase tracking-widest">Datos Personales</h2>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Nombres</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red transition-all text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Apellidos</label>
                                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red transition-all text-sm font-bold" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /> Correo Principal (Login)</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all text-sm font-bold" />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Phone className="w-4 h-4 text-amber-400" /> Teléfono / WhatsApp Corporativo</label>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <button
                                            ref={countryBtnRef}
                                            onClick={() => setIsCountryOpen(!isCountryOpen)}
                                            className="country-trigger h-full bg-white/5 border border-white/10 rounded-xl px-4 flex items-center gap-2 hover:bg-white/10 transition-all text-sm font-bold text-white min-w-[100px]"
                                        >
                                            <span>{selectedCountry.flag}</span>
                                            <span>{selectedCountry.code}</span>
                                            <ChevronDown className={`w-3 h-3 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                    {isCountryOpen && typeof window !== 'undefined' && createPortal(
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="country-dropdown fixed bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden z-[9999] shadow-2xl w-56"
                                            style={{ top: dropdownPos.top, left: dropdownPos.left }}
                                        >
                                            <div className="p-2 border-b border-white/5 bg-black/20 sticky top-0 z-10">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        placeholder="País..."
                                                        value={countrySearch}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-[10px] font-bold text-white focus:outline-none focus:border-blis-red transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map((c) => (
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
                                            </div>
                                        </motion.div>,
                                        document.body
                                    )}
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="123 456 7890" className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red transition-all text-sm font-bold" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blis-red/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3 relative z-10">
                            <Lock className="w-6 h-6 text-blis-red" />
                            <h2 className="text-xl font-black text-white uppercase tracking-widest">Seguridad</h2>
                        </div>
                        <div className="p-8 space-y-6 relative z-10">
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <Bell className="w-5 h-5 text-gray-400 group-hover:text-blis-red transition-colors" />
                                    <span className="text-sm font-bold text-white uppercase tracking-widest">Notificaciones Push</span>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative p-1 transition-colors duration-300 ${notifications ? 'bg-blis-red' : 'bg-zinc-800'}`}>
                                    <motion.div animate={{ x: notifications ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                                </div>
                            </button>

                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                                <h3 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-gray-500" />
                                    Tipos de Notificación
                                </h3>
                                <div className="space-y-3">
                                    {NOTIFICACION_TIPOS.map(({ key, label, icon: IconComp, color }) => (
                                        <button
                                            key={key}
                                            onClick={() => handleToggleTipo(key, !notificacionesTipos[key])}
                                            className="w-full flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5`}>
                                                    <IconComp className={`w-4 h-4 ${color}`} />
                                                </div>
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
                                <h3 className="text-xs font-black text-white uppercase tracking-tight">Cambio de Contraseña</h3>
                                <p className="text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-widest">Por seguridad, recibirás un enlace en tu correo para restablecer tu clave.</p>
                                <button className="text-[10px] text-blis-red font-black uppercase tracking-[0.2em] border-b-2 border-blis-red/30 pb-1 hover:border-blis-red transition-all">Solicitar Enlace</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
