"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart, Coins, CreditCard, MapPin, User, Mail, Phone,
    CheckCircle2, Loader2, ArrowLeft, Lock, Shield, Package,
    Zap, Truck, Gift, Star
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { Header } from "@/components/sections/Header";
import { FooterSections } from "@/components/sections/Footer";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { DEFAULT_EMPRESA_ID } from "@/lib/empresa";

type PaymentMethod = 'coins' | 'cryptomus_card' | 'cryptomus_crypto' | 'transfer';

interface CheckoutForm {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    // Envío — solo para físicos
    direccion: string;
    ciudad: string;
    pais: string;
    notas: string;
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutLoading />}>
            <CheckoutContent />
        </Suspense>
    );
}

function CheckoutLoading() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Header />
            <div className="max-w-6xl mx-auto px-4 pt-40 pb-20">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
                    <div className="space-y-2">
                        <div className="w-48 h-8 bg-white/5 rounded animate-pulse" />
                        <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
                    </div>
                </div>
            </div>
            <FooterSections />
        </main>
    );
}

function CheckoutContent() {
    const { cart, blisCoins, clearCart, getCartTotal } = useShop();
    const { user } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRedeemFlow = searchParams.get('redeem') === '1';

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cryptomus_card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [orderEmail, setOrderEmail] = useState("");
    const [isNewUser, setIsNewUser] = useState(false);

    const [form, setForm] = useState<CheckoutForm>({
        nombre: user?.name?.split(" ")[0] || '',
        apellido: user?.name?.split(" ").slice(1).join(" ") || '',
        email: user?.email || '',
        telefono: user?.phone || '',
        direccion: '',
        ciudad: '',
        pais: 'PE',
        notas: ''
    });

    const totalUSD = getCartTotal();
    const totalCoins = cart.reduce((sum, item) =>
        sum + (item.precio_coins || Math.round((item.price || 0) * 10)), 0);
    const canPayWithCoins = blisCoins >= totalCoins && totalCoins > 0;

    // Detectar si hay productos físicos
    const hasPhysicalProducts = useMemo(() =>
        cart.some(item => item.productType === 'pack' || (item as any).tipo === 'fisico'),
        [cart]
    );

    // Redirigir si carrito vacío
    useEffect(() => {
        if (cart.length === 0 && !isComplete) router.push('/tienda');
    }, [cart.length, isComplete, router]);

    // En flujo canje BLISCOINS, redirigir si no hay usuario
    useEffect(() => {
        if (isRedeemFlow && !user) {
            showToast('Inicia sesión para canjear con BLIS Coins.', 'error');
            router.push('/tienda');
        }
    }, [isRedeemFlow, user, showToast, router]);

    // Pre-llenar con datos del usuario
    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                nombre: user.name?.split(" ")[0] || prev.nombre,
                apellido: user.name?.split(" ").slice(1).join(" ") || prev.apellido,
                email: user.email || prev.email,
                telefono: user.phone || prev.telefono,
            }));
        }
    }, [user]);

    // Si viene de canje BLISCOINS, seleccionar ese método y validar saldo
    useEffect(() => {
        if (isRedeemFlow && blisCoins < totalCoins) {
            showToast('Saldo de BLIS Coins insuficiente para completar el canje.', 'error');
            router.push('/tienda');
        } else if (isRedeemFlow) {
            setPaymentMethod('coins');
        }
    }, [isRedeemFlow, blisCoins, totalCoins, showToast, router]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async () => {
        // Validar campos requeridos
        if (!form.nombre.trim() || !form.email.trim()) {
            showToast('Por favor completa tu nombre y email', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            showToast('Email inválido', 'error');
            return;
        }
        if (hasPhysicalProducts && (!form.direccion.trim() || !form.ciudad.trim())) {
            showToast('Completa tu dirección de envío', 'error');
            return;
        }
        if (paymentMethod === 'coins' && !canPayWithCoins) {
            showToast('No tienes suficientes BLIS Coins', 'error');
            return;
        }

        setIsProcessing(true);

        try {
            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || user?.id;

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            const productosPayload = cart.map(item => ({
                producto_id: item.id,
                cantidad: 1,
                precio_unitario: item.price || (item as any).precio_usd || 0,
                nombre: item.title,
                productType: item.productType,
                precio_coins: item.precio_coins,
                curso_id: item.curso_id,
                slug: item.slug,
            }));

            const commonPayload = {
                empresa_id: DEFAULT_EMPRESA_ID,
                user_id: userId,
                nombre: `${form.nombre} ${form.apellido}`.trim(),
                email: form.email,
                telefono: form.telefono,
                productos: productosPayload,
                tiene_fisicos: hasPhysicalProducts,
                direccion_envio: hasPhysicalProducts ? {
                    direccion: form.direccion,
                    ciudad: form.ciudad,
                    pais: form.pais,
                    notas: form.notas,
                } : null,
            };

            // Flujo Cryptomus (tarjeta o crypto)
            if (paymentMethod === 'cryptomus_card' || paymentMethod === 'cryptomus_crypto') {
                const res = await fetch('/api/cryptomus/create-invoice', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        ...commonPayload,
                        mode: paymentMethod === 'cryptomus_card' ? 'card' : 'crypto',
                        monto_usd: totalUSD,
                    }),
                });

                const data = await res.json();

                if (!data.success) throw new Error(data.error || 'Error al crear factura');

                setOrderEmail(form.email);
                clearCart();

                // Redirigir a la página de pago de Cryptomus
                window.location.href = data.paymentUrl;
                return;
            }

            // Flujo BLIS Coins y Transferencia (checkout tradicional)
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...commonPayload,
                    metodo_pago: paymentMethod === 'coins' ? 'coins' : 'stripe',
                    monto_coins: paymentMethod === 'coins' ? totalCoins : 0,
                    monto_usd: paymentMethod === 'coins' ? 0 : totalUSD,
                })
            });

            const data = await res.json();

            if (!data.success) throw new Error(data.error || 'Error al procesar');

            if (data.alreadyPurchased && data.alreadyPurchased.length > 0) {
                showToast(`Ya tenías estos productos: ${data.alreadyPurchased.join(', ')}`, 'warning');
            }

            if (data.courseAssignmentError) {
                showToast('Compra OK pero hubo un problema al asignar cursos. Contacta soporte.', 'warning');
            } else if ((data.coursesAssigned || 0) > 0) {
                showToast(`¡Compra exitosa! ${data.coursesAssigned} curso(s) asignado(s) a tu cuenta.`, 'success');
            }

            setOrderEmail(form.email);
            setIsNewUser(data.isNewUser || false);
            clearCart();
            setIsComplete(true);
        } catch (err) {
            console.error('Checkout error:', err);
            showToast('Error al procesar. Intenta de nuevo.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Pantalla de éxito ──────────────────────────────────────────────────────
    if (isComplete) {
        return (
            <main className="min-h-screen bg-[#050505] text-white">
                <Header />
                <div className="max-w-2xl mx-auto px-4 pt-40 pb-20 text-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="w-28 h-28 mx-auto mb-8 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.2)]"
                    >
                        <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4 mb-10"
                    >
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            ¡Compra Exitosa!
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Revisa tu email en <span className="text-white font-bold">{orderEmail}</span>
                        </p>

                        {isNewUser ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mt-6 text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                        <Gift className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="font-black text-amber-400 uppercase tracking-widest text-sm mb-1">
                                            ¡Tu cuenta fue creada!
                                        </p>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Te enviamos un email a <span className="text-white font-bold">{orderEmail}</span> con tu contraseña temporal. Úsala para acceder a tus productos digitales.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                Tus productos ya están disponibles en tu cuenta.
                            </p>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        <Link href="/miembros" className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <Zap className="w-5 h-5" /> Acceder a Mis Productos
                        </Link>
                        <Link href="/tienda" className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold uppercase rounded-2xl transition-all">
                            Seguir Comprando
                        </Link>
                    </motion.div>

                    {/* Stars */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12 flex items-center justify-center gap-1"
                    >
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="ml-3 text-sm text-gray-500">Más de 4,800 clientes satisfechos</span>
                    </motion.div>
                </div>
                <FooterSections />
            </main>
        );
    }

    // ── Formulario de checkout ─────────────────────────────────────────────────
    const inputCls = "w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 placeholder-gray-600 transition-all";
    const labelCls = "text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block";

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Header />

            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-32 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Checkout</h1>
                        <p className="text-gray-500 text-sm">{cart.length} {cart.length === 1 ? 'producto' : 'productos'} · ${totalUSD.toFixed(2)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* ── Formulario ────────────────────────────────────────── */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Datos de contacto */}
                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8 space-y-5">
                            <h2 className="text-base font-black uppercase tracking-widest flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <User className="w-4 h-4 text-emerald-400" />
                                </div>
                                Información de Contacto
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Nombre *</label>
                                    <input name="nombre" type="text" value={form.nombre} onChange={handleInput} className={inputCls} placeholder="Juan" required />
                                </div>
                                <div>
                                    <label className={labelCls}>Apellido</label>
                                    <input name="apellido" type="text" value={form.apellido} onChange={handleInput} className={inputCls} placeholder="Pérez" />
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Email * <span className="text-emerald-500 normal-case font-normal ml-2">(Aquí recibirás tu acceso)</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input name="email" type="email" value={form.email} onChange={handleInput} className={`${inputCls} pl-11`} placeholder="tu@email.com" required />
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Teléfono / WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input name="telefono" type="tel" value={form.telefono} onChange={handleInput} className={`${inputCls} pl-11`} placeholder="+51 999 999 999" />
                                </div>
                            </div>

                            {/* Info para usuarios no logueados */}
                            {!user && (
                                <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 flex items-start gap-3">
                                    <Gift className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-[12px] text-gray-400 leading-relaxed">
                                        Si no tienes cuenta, <span className="text-amber-400 font-bold">la crearemos automáticamente</span> con este email y te enviaremos tu contraseña de acceso junto con tu compra.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Dirección de envío — solo si hay productos físicos */}
                        <AnimatePresence>
                            {hasPhysicalProducts && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8 space-y-5 overflow-hidden"
                                >
                                    <h2 className="text-base font-black uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                            <Truck className="w-4 h-4 text-sky-400" />
                                        </div>
                                        Dirección de Envío
                                    </h2>

                                    <div>
                                        <label className={labelCls}>Dirección *</label>
                                        <input name="direccion" type="text" value={form.direccion} onChange={handleInput} className={inputCls} placeholder="Calle, número, referencias..." required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Ciudad *</label>
                                            <input name="ciudad" type="text" value={form.ciudad} onChange={handleInput} className={inputCls} placeholder="Lima" required />
                                        </div>
                                        <div>
                                            <label className={labelCls}>País</label>
                                            <select name="pais" value={form.pais} onChange={handleInput} className={inputCls}>
                                                <option value="PE">🇵🇪 Perú</option>
                                                <option value="MX">🇲🇽 México</option>
                                                <option value="CO">🇨🇴 Colombia</option>
                                                <option value="CL">🇨🇱 Chile</option>
                                                <option value="AR">🇦🇷 Argentina</option>
                                                <option value="EC">🇪🇨 Ecuador</option>
                                                <option value="US">🇺🇸 USA</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Notas de entrega</label>
                                        <textarea name="notas" value={form.notas} onChange={handleInput} rows={2} className={`${inputCls} resize-none`} placeholder="Instrucciones especiales..." />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Método de pago */}
                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
                            <h2 className="text-base font-black uppercase tracking-widest flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blis-red/10 border border-blis-red/20 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-blis-red" />
                                </div>
                                Método de Pago
                            </h2>

                            <div className="space-y-3">
                                {/* BLIS Coins */}
                                {canPayWithCoins && (
                                    <PayOption
                                        selected={paymentMethod === 'coins'}
                                        onClick={() => setPaymentMethod('coins')}
                                        icon={<Coins className="w-5 h-5 text-amber-400" />}
                                        bg="bg-amber-500/10 border-amber-500/40"
                                        label="Pagar con BLIS Coins"
                                        sublabel={`Saldo disponible: ${blisCoins.toLocaleString()} coins`}
                                        amount={`${totalCoins.toLocaleString()} COINS`}
                                    />
                                )}

                                {/* Cryptomus - Tarjeta */}
                                <PayOption
                                    selected={paymentMethod === 'cryptomus_card'}
                                    onClick={() => setPaymentMethod('cryptomus_card')}
                                    icon={<CreditCard className="w-5 h-5 text-emerald-400" />}
                                    bg="bg-emerald-500/10 border-emerald-500/40"
                                    label="Tarjeta de Crédito / Débito"
                                    sublabel="Visa, Mastercard, AMEX — Pago seguro vía Cryptomus"
                                    amount={`$${totalUSD.toFixed(2)}`}
                                    badge="Recibes USDT"
                                />

                                {/* Cryptomus - Criptomonedas */}
                                <PayOption
                                    selected={paymentMethod === 'cryptomus_crypto'}
                                    onClick={() => setPaymentMethod('cryptomus_crypto')}
                                    icon={<Coins className="w-5 h-5 text-yellow-400" />}
                                    bg="bg-yellow-500/10 border-yellow-500/40"
                                    label="Criptomonedas"
                                    sublabel="BTC, ETH, USDT, USDC, LTC y más — vía Cryptomus"
                                    amount={`$${totalUSD.toFixed(2)}`}
                                    badge="Recibes USDT"
                                />

                                {/* Transferencia */}
                                <PayOption
                                    selected={paymentMethod === 'transfer'}
                                    onClick={() => setPaymentMethod('transfer')}
                                    icon={<Shield className="w-5 h-5 text-sky-400" />}
                                    bg="bg-sky-500/10 border-sky-500/40"
                                    label="Transferencia Bancaria"
                                    sublabel="Recibirás las instrucciones por email"
                                    amount={`$${totalUSD.toFixed(2)}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Resumen del pedido ────────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 sticky top-28 space-y-6">
                            <h2 className="text-base font-black uppercase tracking-widest flex items-center gap-3">
                                <Package className="w-4 h-4 text-gray-400" />
                                Tu Pedido
                            </h2>

                            {/* Items */}
                            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/5">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold line-clamp-2 leading-tight">{item.title}</p>
                                            <p className="text-[10px] text-gray-500 uppercase mt-0.5">{item.category}</p>
                                            <p className="text-emerald-400 font-bold text-sm mt-1">${(item.price || (item as any).precio_usd || 0).toFixed(2)}</p>
                                        </div>
                                        {/* Tipo badge */}
                                        <div className={`self-start px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border ${
                                            (item as any).productType === 'pack' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                        }`}>
                                            {(item as any).productType === 'pack' ? 'Físico' : 'Digital'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totales */}
                            <div className="border-t border-white/5 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${totalUSD.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Envío</span>
                                    <span className={hasPhysicalProducts ? "text-white" : "text-emerald-400"}>
                                        {hasPhysicalProducts ? "A calcular" : "Gratis (Digital)"}
                                    </span>
                                </div>
                                <div className="h-px bg-white/5 my-2" />
                                <div className="flex justify-between items-end">
                                    <span className="font-black uppercase tracking-widest text-sm">Total</span>
                                    <div className="text-right">
                                        <p className="text-2xl font-black">${totalUSD.toFixed(2)}</p>
                                        {paymentMethod === 'coins' && canPayWithCoins && (
                                            <p className="text-[10px] text-amber-400 font-bold">{totalCoins.toLocaleString()} COINS</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Botón */}
                            <motion.button
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                whileTap={{ scale: 0.97 }}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                            >
                                {isProcessing ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                                ) : (
                                    <><Lock className="w-4 h-4" /> Completar Compra</>
                                )}
                            </motion.button>

                            {/* Garantías */}
                            <div className="space-y-2">
                                {[
                                    { icon: Shield, text: "Pago 100% seguro con SSL" },
                                    { icon: Zap, text: "Acceso inmediato tras el pago" },
                                    { icon: Lock, text: "Sin reembolsos — productos digitales" },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-2 text-[11px] text-gray-500">
                                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FooterSections />
        </main>
    );
}

// ── Componente opción de pago ──────────────────────────────────────────────────
function PayOption({ selected, onClick, icon, bg, label, sublabel, amount, badge }: {
    selected: boolean; onClick: () => void; icon: React.ReactNode;
    bg: string; label: string; sublabel: string; amount: string; badge?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between text-left ${
                selected ? bg : 'bg-white/[0.02] border-white/8 hover:border-white/20'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-white/10' : 'bg-white/5'}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-bold text-sm text-white">{label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{sublabel}</p>
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                <p className="font-black text-base text-white">{amount}</p>
                {badge && (
                    <p className="text-[9px] font-black text-emerald-400 uppercase mt-0.5 tracking-wider">{badge}</p>
                )}
            </div>
        </button>
    );
}
