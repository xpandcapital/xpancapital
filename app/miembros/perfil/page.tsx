"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Shield, Camera, Lock, Bell, CheckCircle2, ChevronDown, Trash2, X, RotateCcw, ZoomIn, ZoomOut, Check, Search, RotateCw, FlipHorizontal, Coins, TrendingUp, TrendingDown, Clock, BookOpen, Sparkles, ShoppingCart, GraduationCap, FileText, UserPlus, Settings, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isAdminRole } from "@/lib/auth/permissions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useCoins } from "@/lib/hooks/useCoins";
import { useShop } from "@/context/ShopContext";
import { useReferrals } from "@/lib/hooks/useReferrals";
import { ReferralPanel } from "@/components/profile/ReferralPanel";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";

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

function PushNotificationToggle() {
  const [supported, setSupported] = useState(false)
  const [granted, setGranted] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const endpointRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const s = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setSupported(s)
    if (!s) return
    setGranted(Notification.permission === 'granted')
    Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ]).then(sw => {
      sw.pushManager.getSubscription().then(sub => {
        setSubscribed(!!sub)
        if (sub) endpointRef.current = sub.endpoint
      })
    }).catch(() => {})
  }, [])

  const toggle = async () => {
    if (subscribed) {
      await fetch(`/api/notificaciones/suscribir?endpoint=${encodeURIComponent(endpointRef.current || '')}`, { method: 'DELETE' })
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) { const sub = await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe() }
      setSubscribed(false)
      endpointRef.current = null
      return
    }
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setGranted(perm === 'granted')
      if (perm !== 'granted') return
      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg) return
      const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidPublic })
      const rawKey = sub.getKey ? sub.getKey('p256dh') : null
      const rawAuth = sub.getKey ? sub.getKey('auth') : null
      const p256dh = rawKey ? btoa(String.fromCharCode(...new Uint8Array(rawKey))) : ''
      const auth = rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : ''
      await fetch('/api/notificaciones/suscribir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint, keys: { p256dh, auth }, browser: navigator.userAgent }),
      })
      setSubscribed(true)
      endpointRef.current = sub.endpoint
    } catch {}
    setLoading(false)
  }

  if (!supported) return null

  return (
    <button onClick={toggle} disabled={loading} className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group text-left disabled:opacity-50">
      <div className="flex items-center gap-4">
        <Bell className={`w-5 h-5 ${subscribed ? 'text-emerald-400' : 'text-gray-500'} group-hover:text-blis-red transition-colors`} />
        <div>
          <span className="text-sm font-bold text-white block">Notificaciones del Navegador</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {subscribed ? 'Activadas' : granted ? 'Desactivadas' : 'No configuradas'}
          </span>
                            </div>
                        </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${subscribed ? 'text-emerald-400' : 'text-gray-600'}`}>
        {loading ? '...' : subscribed ? 'Activado' : 'Activar'}
      </span>
    </button>
  )
}

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const { balance, transactions, loading: coinsLoading, fetchBalance, fetchTransactions } = useCoins(user?.id);
    const { coinsEnabled } = useShop();

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

    const [name, setName] = useState(user?.nombre || user?.name?.split(' ')[0] || "");
    const [lastName, setLastName] = useState(user?.apellido || user?.name?.split(' ').slice(1).join(' ') || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || user?.phone || "");
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const [profilePic, setProfilePic] = useState<string | null>(user?.profilePic || null);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Redes sociales y biografía
    const [biografia, setBiografia] = useState('');
    const [socials, setSocials] = useState<Record<string, string>>({});
    const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
    useEffect(() => {
        if (!user?.id) return
        fetch('/api/profile', { headers: { 'x-blis-user-id': user.id, 'x-blis-empresa-id': user.empresa_id || '', 'x-blis-user-rol': user.role } })
            .then(r => r.json())
            .then(d => {
                if (d.success && d.data) {
                    setBiografia(d.data.biografia || '')
                    setWhatsappPhone(d.data.whatsapp || '')
                    setDiasRestantes(typeof d.data.dias_restantes === 'number' ? d.data.dias_restantes : null)
                    const s: Record<string, string> = {}
                    const fields = ['website_url','facebook_url','instagram_url','twitter_url','youtube_url','linkedin_url','tiktok_url','whatsapp_url','telegram_url','discord_url','github_url']
                    fields.forEach(f => { if (d.data[f]) s[f] = d.data[f] })
                    setSocials(s)
                }
            })
            .catch(() => {})
    }, [user?.id])

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [changingPassword, setChangingPassword] = useState(false);
    const [loginHistory, setLoginHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [closingSessions, setClosingSessions] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        setLoadingHistory(true);
        fetch('/api/auth/login-history')
            .then(r => r.json())
            .then(d => { if (d.success) setLoginHistory(d.sessions || []); })
            .catch(() => {})
            .finally(() => setLoadingHistory(false));
    }, [user?.id]);

    // Sync with global state
    useEffect(() => {
        if (user) {
            if (user.nombre || user.name) setName(user.nombre || user.name?.split(' ')[0] || '');
            if (user.apellido) setLastName(user.apellido);
            else if (user.name && !user.nombre) setLastName(user.name.split(' ').slice(1).join(' ') || '');
            if (user.email) setEmail(user.email);
            if (user.profilePic) setProfilePic(user.profilePic);
            if (user.phone) {
                const matchedCountry = COUNTRIES.find(c => user.phone!.startsWith(c.code));
                if (matchedCountry) {
                    setSelectedCountry(matchedCountry);
                    setPhone(user.phone.slice(matchedCountry.code.length));
                } else {
                    setPhone(user.phone);
                }
            }
        }
    }, [user]);

    const handleUpdate = async () => {
        const fullPhone = phone ? `${selectedCountry.code}${phone.replace(/\s+/g, '')}` : '';
        updateProfile({ nombre: name, apellido: lastName, profilePic, phone: fullPhone });
        // Guardar todos los datos vía API (service role)
        const payload: Record<string, string | null> = { nombre: name, apellido: lastName, email, biografia, telefono: fullPhone, profilePic }
        const fields = ['website_url','facebook_url','instagram_url','twitter_url','youtube_url','linkedin_url','tiktok_url','whatsapp_url','telegram_url','discord_url','github_url']
        fields.forEach(f => { payload[f] = socials[f] || null })
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (res.ok && data.success) {
                showToast("¡Éxito! Tus datos han sido actualizados en la base de datos de Xpand Capital.", "success");
            } else {
                showToast(data.error || "Error al actualizar", "error");
            }
        } catch {
            showToast("Error al actualizar", "error");
        }
    };

    const handleChangePassword = async () => {
        setPasswordError(null);
        if (newPassword.length < 6) {
            setPasswordError("La nueva contraseña debe tener al menos 6 caracteres");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Las contraseñas no coinciden");
            return;
        }
        setChangingPassword(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPasswordError(data.error || 'Error al cambiar la contraseña');
                setChangingPassword(false);
                return;
            }
            setShowPasswordModal(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            showToast("Contraseña actualizada correctamente", "success");
        } catch {
            setPasswordError("Error al cambiar la contraseña");
        }
    setChangingPassword(false);
  };

  const saveWhatsappPhone = async () => {
    setSavingWhatsapp(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp: whatsappPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Número de WhatsApp guardado", "success");
      } else {
        showToast(data.error || "Error al guardar", "error");
      }
    } catch {
      showToast("Error al guardar", "error");
    }
    setSavingWhatsapp(false);
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(213,193,8,0.1)_0%,transparent_40%)] pointer-events-none" />

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
                    <p className="text-gray-400 font-medium text-xs sm:text-sm leading-relaxed max-w-xl">
                        {user?.role || 'Miembro de Xpand Capital'}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-4 mt-2">
                        <div className="bg-white/5 border border-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">
                            ID: {user?.id?.slice(0, 8)?.toUpperCase() || 'N/A'}
                        </div>
                        <div className="bg-white/5 border border-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Miembro'}
                        </div>
                        {diasRestantes !== null && (
                            <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${diasRestantes <= 7 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'} de acceso
                            </div>
                        )}
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
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Nombres</label>
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
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Apellidos</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blis-red transition-colors" />
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
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

                        {/* Biografía */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Biografía</label>
                            <textarea
                                value={biografia}
                                onChange={(e) => setBiografia(e.target.value)}
                                rows={3}
                                placeholder="Cuéntanos sobre ti..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:outline-none focus:border-blis-red transition-all resize-none placeholder-gray-600"
                            />
                        </div>

                        {/* Redes Sociales */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Redes Sociales</label>
                            {[
                                { key: 'website_url', icon: '🌐', label: 'Sitio Web', placeholder: 'https://...' },
                                { key: 'facebook_url', icon: '📘', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                                { key: 'instagram_url', icon: '📸', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                                { key: 'twitter_url', icon: '🐦', label: 'Twitter / X', placeholder: 'https://x.com/...' },
                                { key: 'youtube_url', icon: '▶️', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
                                { key: 'linkedin_url', icon: '💼', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
                                { key: 'tiktok_url', icon: '🎵', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
                                { key: 'whatsapp_url', icon: '💬', label: 'WhatsApp', placeholder: 'https://wa.me/...' },
                                { key: 'telegram_url', icon: '✈️', label: 'Telegram', placeholder: 'https://t.me/...' },
                                { key: 'discord_url', icon: '🎮', label: 'Discord', placeholder: 'https://discord.gg/...' },
                                { key: 'github_url', icon: '💻', label: 'GitHub', placeholder: 'https://github.com/...' },
                            ].map(({ key, icon, label, placeholder }) => (
                                <div key={key} className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">{icon}</span>
                                    <input
                                        type="url"
                                        value={socials[key] || ''}
                                        onChange={(e) => setSocials(prev => ({ ...prev, [key]: e.target.value }))}
                                        placeholder={placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-medium text-white focus:outline-none focus:border-blis-red transition-all placeholder-gray-600"
                                    />
                                </div>
                            ))}
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
                        <PushNotificationToggle />
                        <div className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl text-left">
                            <div className="flex items-center gap-4">
                                <MessageSquare className="w-5 h-5 text-gray-500" />
                                <div>
                                    <span className="text-sm font-bold text-white block">WhatsApp</span>
                                    <span className="text-[10px] text-gray-500">Recibe notificaciones por WhatsApp</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="text" value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} placeholder="+51 999 999 999" className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white w-40 text-center" />
                                <button onClick={saveWhatsappPhone} disabled={savingWhatsapp} className="px-3 py-1.5 bg-blis-red text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-blis-red/90 transition-all disabled:opacity-50">
                                    {savingWhatsapp ? "..." : "Guardar"}
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => { setPasswordError(null); setShowPasswordModal(true); }}
                            className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <Lock className="w-5 h-5 text-gray-500 group-hover:text-blis-red transition-colors" />
                                <span className="text-sm font-bold text-white">Cambiar Contraseña</span>
                            </div>
                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Activo</span>
                        </button>

                        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-gray-500" />
                                Historial de Sesiones
                            </h3>
                            {loadingHistory ? (
                                <p className="text-[10px] text-gray-600 uppercase tracking-widest">Cargando...</p>
                            ) : loginHistory.length === 0 ? (
                                <p className="text-[10px] text-gray-600 uppercase tracking-widest">Sin registros</p>
                            ) : (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {loginHistory.slice(0, 5).map((session: any, i: number) => (
                                        <div key={session.id || i} className="flex items-center justify-between text-[10px] text-gray-500 bg-white/[0.02] px-3 py-2 rounded-lg">
                                            <span className="uppercase tracking-wider">{session.pais || 'Desconocido'} — {session.ip || 'N/A'}</span>
                                            <span>{new Date(session.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={async () => {
                                if (!confirm("¿Cerrar sesión en todos los demás dispositivos?")) return;
                                setClosingSessions(true);
                                try {
                                    const res = await fetch('/api/auth/login-history', { method: 'DELETE' });
                                    const data = await res.json();
                                    if (data.success) showToast("Sesiones cerradas en otros dispositivos", "success");
                                    else showToast(data.error || "Error al cerrar sesiones", "error");
                                } catch { showToast("Error al cerrar sesiones", "error"); }
                                setClosingSessions(false);
                            }}
                            disabled={closingSessions}
                            className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group text-left disabled:opacity-50"
                        >
                            <div className="flex items-center gap-4">
                                <Shield className="w-5 h-5 text-gray-500 group-hover:text-blis-red transition-colors" />
                                <span className="text-sm font-bold text-white">{closingSessions ? 'Cerrando...' : 'Cerrar Otras Sesiones'}</span>
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={async () => {
                            if (!confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.")) return;
                            showToast("Solicitud enviada. Un administrador se pondrá en contacto contigo para verificar la identidad.", "success");
                        }}
                        className="w-full py-5 bg-zinc-900 border border-white/5 text-gray-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar Cuenta
                    </button>
                </div>
            </div>

            {/* Coins Section */}
            <div className={`mt-12 space-y-6 ${!coinsEnabled ? 'hidden' : ''}`}>
                <h2 className="text-lg font-black text-white uppercase tracking-widest px-4 flex items-center gap-3">
                    <Coins className="w-5 h-5 text-amber-500" /> Xpand Coins
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
                            <p className="text-gray-600 text-xs mt-2">Lee artículos para ganar Xpand Coins</p>
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

                {/* Modal Cambiar Contraseña */}
                {showPasswordModal && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget && !changingPassword) { setShowPasswordModal(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); } }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
                        >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-blis-red" /> Nueva Contraseña
                                    </h3>
                                    <button
                                        onClick={() => { if (!changingPassword) { setShowPasswordModal(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); } }}
                                        className="text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {passwordError && (
                                    <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                                        <p className="text-red-400 text-sm font-medium text-center">{passwordError}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            Contraseña Actual
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blis-red/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            Nueva Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blis-red/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            Confirmar Nueva Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repite la contraseña"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blis-red/50 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                        className="w-full py-4 bg-blis-red text-white font-black uppercase tracking-widest rounded-xl hover:bg-[#87082a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {changingPassword ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Lock className="w-4 h-4" />
                                        )}
                                        {changingPassword ? "Cambiando..." : "Cambiar Contraseña"}
                                    </button>
                                </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}



