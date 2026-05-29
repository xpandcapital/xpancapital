"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart, Coins, CreditCard, MapPin, User, Mail, Phone,
    CheckCircle2, Loader2, ArrowLeft, Lock, Shield, Package,
    Zap, Truck, Gift, Star, Wallet, Building2, Globe, Copy, MessageCircle
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

type PaymentMethod = 'coins' | 'izipay' | 'paypal' | 'transfer' | 'crypto_manual' | 'whatsapp';

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

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('izipay');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [orderEmail, setOrderEmail] = useState("");
    const [isNewUser, setIsNewUser] = useState(false);
    const [formasPago, setFormasPago] = useState<any[]>([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const isRedirectingRef = useRef(false);
    const [isIzipayModal, setIsIzipayModal] = useState(false);
    const [izipayFormToken, setIzipayFormToken] = useState('');
    const [izipayPublicKey, setIzipayPublicKey] = useState('');
    const [izipayOrderId, setIzipayOrderId] = useState('');
    const [izipayTotal, setIzipayTotal] = useState(0);
    const [izipayScriptLoaded, setIzipayScriptLoaded] = useState(false);
    const [krKey, setKrKey] = useState(0);
    const [selectedAsesor, setSelectedAsesor] = useState<string | null>(null);

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

    // Restaurar datos del formulario después de cerrar modal Izipay
    useEffect(() => {
        const saved = sessionStorage.getItem('checkout_form')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setForm(prev => ({ ...prev, ...parsed }))
            } catch {}
            sessionStorage.removeItem('checkout_form')
        }
    }, []);

    const totalUSD = getCartTotal();
    const totalCoins = cart.reduce((sum, item) =>
        sum + (item.precio_coins || Math.round((item.price || 0) * 10)), 0);
    const canPayWithCoins = blisCoins >= totalCoins && totalCoins > 0;

    // Costo de procesamiento por método (independiente de la selección)
    function getMethodFee(slug: string) {
        const fp = formasPago.find((f: any) => f.slug === slug)
        const cfg = fp?.config || {}
        const type = cfg.processing_fee_type
        const value = parseFloat(cfg.processing_fee_value || '0')
        const label = cfg.processing_fee_label || 'Costo de procesamiento'
        if (!type || !value || value <= 0) return { amount: 0, label: '', type: '' }
        if (type === 'fixed') return { amount: value, label, type: 'fixed' }
        if (type === 'percentage') return { amount: Math.round(totalUSD * value) / 100, label, type: 'percentage' }
        return { amount: 0, label: '', type: '' }
    }

    const getMethodTotal = (slug: string) => (totalUSD || 0) + getMethodFee(slug).amount

    // Fee del método seleccionado
    const processingFee = useMemo(() => getMethodFee(paymentMethod), [paymentMethod, formasPago, totalUSD])
    const grandTotal = (totalUSD || 0) + processingFee.amount

    // Detectar si hay productos físicos
    const hasPhysicalProducts = useMemo(() =>
        cart.some(item => item.productType === 'pack' || (item as any).tipo === 'fisico'),
        [cart]
    );

    // Redirigir si carrito vacío (excepto si estamos en flujo Izipay)
    useEffect(() => {
        const izipayFlow = sessionStorage.getItem('izipay_flow_active')
        if (cart.length === 0 && !isComplete && !isRedirectingRef.current && !izipayFlow) {
            router.push('/tienda')
        }
    }, [cart.length, isComplete, router]);

    // En flujo canje BLISCOINS, redirigir si no hay usuario
    useEffect(() => {
        if (isRedeemFlow && !user) {
            showToast('Inicia sesión para canjear con BLIS Coins.', 'error');
            router.push('/tienda');
        }
    }, [isRedeemFlow, user, showToast, router]);

    // Fetch formas de pago activas
    useEffect(() => {
        fetch("/api/admin/formas-pago?public=1")
            .then(r => r.json()).then(d => { if (d.success) setFormasPago(d.formas || []); }).catch(() => {});
    }, []);

    // Precargar tema classic de Izipay (para que esté listo antes del SDK)
    useEffect(() => {
        const baseUrl = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0'
        if (!document.getElementById('izipay-kr-classic-css')) {
            const link = document.createElement('link')
            link.id = 'izipay-kr-classic-css'
            link.rel = 'stylesheet'
            link.href = `${baseUrl}/ext/classic-reset.css`
            document.head.appendChild(link)
        }

        // CSS customizado para Blis Corp
        if (!document.getElementById('izipay-kr-blis-css')) {
            const customCss = document.createElement('style')
            customCss.id = 'izipay-kr-blis-css'
            customCss.textContent = `
                .kr-embedded {
                    --kr-global-color-primary: #10b981;
                }
                /* Header del popin */
                .kr-embedded[kr-popin] .kr-popin-modal-header {
                    background-color: #1a1a1a !important;
                }
                .kr-embedded[kr-popin] .kr-popin-modal-header span.kr-popin-shop-name span {
                    color: #10b981 !important;
                    font-family: 'Montserrat', sans-serif !important;
                }
                /* Botón de pago estilo checkout */
                .kr-embedded .kr-payment-button {
                    background-color: #10b981 !important;
                    color: #fff !important;
                    font-family: 'Montserrat', sans-serif !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    border-radius: 16px !important;
                    transition: all 0.3s !important;
                }
                .kr-embedded .kr-payment-button:hover {
                    background-color: #059669 !important;
                    box-shadow: 0 0 30px rgba(16,185,129,0.3) !important;
                }
                .kr-embedded .kr-payment-button:disabled {
                    opacity: 0.5 !important;
                }
                /* Campos de tarjeta - bordes redondeados y estilo */
                .kr-embedded .kr-pan,
                .kr-embedded .kr-expiry,
                .kr-embedded .kr-security-code,
                .kr-embedded .kr-installment-number,
                .kr-embedded .kr-first-installment-delay,
                .kr-embedded .kr-card-holder-name {
                    margin-bottom: 12px !important;
                    border-radius: 14px !important;
                    overflow: hidden !important;
                    border: 1px solid #e5e7eb !important;
                    background: #fff !important;
                    transition: border-color 0.2s, box-shadow 0.2s !important;
                }
                .kr-embedded .kr-pan.kr-field-focused,
                .kr-embedded .kr-expiry.kr-field-focused,
                .kr-embedded .kr-security-code.kr-field-focused,
                .kr-embedded .kr-card-holder-name.kr-field-focused,
                .kr-embedded .kr-installment-number.kr-field-focused {
                    border-color: #10b981 !important;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
                }
                .kr-embedded .kr-pan iframe,
                .kr-embedded .kr-expiry iframe,
                .kr-embedded .kr-security-code iframe,
                .kr-embedded .kr-installment-number iframe,
                .kr-embedded .kr-first-installment-delay iframe,
                .kr-embedded .kr-card-holder-name iframe {
                    border-radius: 14px !important;
                }
                /* Placeholders */
                .kr-embedded input::placeholder {
                    color: #9ca3af !important;
                    font-family: 'Montserrat', sans-serif !important;
                    font-size: 14px !important;
                }
                /* Labels */
                .kr-embedded .kr-field-label {
                    font-family: 'Montserrat', sans-serif !important;
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    color: #6b7280 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }
                /* Errores */
                .kr-embedded .kr-form-error {
                    font-family: 'Montserrat', sans-serif !important;
                    font-size: 13px !important;
                    color: #ef4444 !important;
                    background: #fef2f2 !important;
                    padding: 12px 16px !important;
                    border-radius: 12px !important;
                    border: 1px solid #fecaca !important;
                    margin-top: 8px !important;
                }
                .kr-embedded .kr-form-error.kr-form-error-visible {
                    display: block !important;
                }
                /* Campos con error */
                .kr-embedded .kr-field-error .kr-pan,
                .kr-embedded .kr-field-error .kr-expiry,
                .kr-embedded .kr-field-error .kr-security-code {
                    border-color: #ef4444 !important;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
                }
                /* Footer del popin */
                .kr-embedded .kr-popin-modal-footer {
                    background-color: #1a1a1a !important;
                }
                .kr-embedded[kr-popin] {
                    background-color: #f8f9fa !important;
                }
                /* Errores */
                .kr-embedded .kr-form-error {
                    font-family: 'Montserrat', sans-serif !important;
                    font-size: 13px !important;
                }
                /* Marcas de tarjeta */
                .kr-brand-buttons .kr-brand-button .kr-brand-button-label {
                    font-family: 'Montserrat', sans-serif !important;
                    font-size: 11px !important;
                }
                /* Centrado para modo embebido */
                .kr-embedded:not([kr-popin]) {
                    max-width: 420px !important;
                    margin: 0 auto !important;
                    padding: 4px 0 !important;
                }
            `
            document.head.appendChild(customCss)
        }

        if (!document.getElementById('izipay-kr-classic-js')) {
            const s = document.createElement('script')
            s.id = 'izipay-kr-classic-js'
            s.src = `${baseUrl}/ext/classic.js`
            s.async = true
            s.onload = () => {
                // Parchar config con branding Blis Corp
                if ((window as any).KR_CONFIGURATION) {
                    const cfg = (window as any).KR_CONFIGURATION
                    if (cfg.button) {
                        cfg.button.template = '<span style="font-family:Montserrat,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">{label} {price}</span>'
                    }
                    if (cfg.merchant?.header) {
                        cfg.merchant.header.backgroundColor = '#1a1a1a'
                        if (cfg.merchant.header.shopName) {
                            cfg.merchant.header.shopName.color = '#10b981'
                        }
                    }
                    if (cfg.popin?.form) {
                        cfg.popin.form.layout = 'compact'
                    }
                }
            }
            document.head.appendChild(s)
        }
    }, []);

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
                imagen: item.image || (item as any).imagen_principal || '',
            }));

            const commonPayload = {
                empresa_id: DEFAULT_EMPRESA_ID,
                user_id: userId,
                nombre: `${form.nombre} ${form.apellido}`.trim(),
                email: form.email,
                telefono: form.telefono,
                productos: productosPayload,
                tiene_fisicos: hasPhysicalProducts,
                processing_fee: processingFee,
                direccion_envio: hasPhysicalProducts ? {
                    direccion: form.direccion,
                    ciudad: form.ciudad,
                    pais: form.pais,
                    notas: form.notas,
                } : null,
            };

            // Flujo Izipay
            if (paymentMethod === 'izipay') {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15000);

                let res: Response;
                try {
                    res = await fetch('/api/get-izipay-token', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            ...commonPayload,
                            total_usd: grandTotal,
                            pais: form.pais,
                        }),
                        signal: controller.signal,
                    });
                } catch (fetchErr: any) {
                    clearTimeout(timeout);
                    if (fetchErr.name === 'AbortError') {
                        throw new Error('El servicio de pago está tardando demasiado. Intenta de nuevo en unos minutos.');
                    }
                    throw new Error('No se pudo conectar con la pasarela de pago. Verifica tu conexión.');
                }
                clearTimeout(timeout);

                const data = await res.json();

                if (!data.success) {
                    const errMsg = data.error || '';
                    if (errMsg.includes('no está configurado') || errMsg.includes('configura')) {
                        throw new Error('Medio de pago no disponible por el momento. Por favor intenta con otro método.');
                    }
                    throw new Error(data.error || 'Error al conectar con la pasarela de pago');
                }

                isRedirectingRef.current = true;
                sessionStorage.setItem('izipay_flow_active', '1')

                setIzipayFormToken(data.formToken)
                setIzipayPublicKey(data.publicKey || '')
                setIzipayOrderId(data.ordenId)
                setIzipayTotal(grandTotal)
                setKrKey(k => k + 1)
                setIsIzipayModal(true)
                setIsProcessing(false)
                return;
            }

            // Flujo PayPal
            if (paymentMethod === 'paypal') {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15000);

                let res: Response;
                try {
                    res = await fetch('/api/paypal/create-order', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ ...commonPayload, total_usd: grandTotal }),
                        signal: controller.signal,
                    });
                } catch (fetchErr: any) {
                    clearTimeout(timeout);
                    if (fetchErr.name === 'AbortError') {
                        throw new Error('El servicio de pago está tardando demasiado. Intenta de nuevo.');
                    }
                    throw new Error('No se pudo conectar con PayPal.');
                }
                clearTimeout(timeout);

                const data = await res.json();
                if (!data.success) {
                    throw new Error(data.error || 'Error al conectar con PayPal');
                }

                isRedirectingRef.current = true;
                sessionStorage.setItem('izipay_flow_active', '1')

                setIzipayTotal(grandTotal)
                setKrKey(k => k + 1)
                setIsIzipayModal(true)
                setIsProcessing(false)

                // Cargar SDK de PayPal con delay para que el modal renderice
                setTimeout(() => {
                    const existingScript = document.getElementById('paypal-sdk-script')
                    if (existingScript) existingScript.remove()
                    const script = document.createElement('script')
                    script.id = 'paypal-sdk-script'
                    script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=USD&intent=capture&enable-funding=applepay`
                    script.onload = () => {
                        const btnContainer = document.getElementById('paypal-btn-container')
                        if (!btnContainer || !(window as any).paypal) return
                        btnContainer.innerHTML = ''
                        ;(window as any).paypal.Buttons({
                            style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'paypal' },
                            createOrder: () => data.orderID,
                            onApprove: async (paypalData: any) => {
                                const capRes = await fetch('/api/paypal/capture-order', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ orderID: paypalData.orderID, ordenId: data.ordenId }),
                                })
                                const capData = await capRes.json()
                                if (capData.success) {
                                    clearCart()
                                    window.location.href = `/tienda/checkout/status?izipay_success=1&order_id=${data.ordenId}&total=${totalUSD.toFixed(2)}`
                                } else {
                                    showToast('Error al confirmar el pago.', 'error')
                                    setIsProcessing(false)
                                }
                            },
                            onCancel: () => { setIsProcessing(false); showToast('Pago cancelado.', 'error') },
                            onError: () => { setIsProcessing(false); showToast('Error en PayPal.', 'error') },
                        }).render('#paypal-btn-container')
                    }
                    script.onerror = () => {
                        setIsProcessing(false)
                        showToast('Error al cargar PayPal SDK.', 'error')
                    }
                    document.head.appendChild(script)
                }, 300)
                return;
            }

            // Flujo WhatsApp
            if (paymentMethod === 'whatsapp') {
                const payload = {
                    ...commonPayload,
                    metodo_pago: 'whatsapp',
                    asesor_id: selectedAsesor,
                    monto_coins: 0,
                    monto_usd: grandTotal,
                    estado: 'pendiente',
                }
                console.log('[WhatsApp Checkout] Enviando:', { asesorId: selectedAsesor, total: grandTotal, productos: payload.productos?.length })
                const res = await fetch('/api/checkout', {
                    method: 'POST', headers,
                    body: JSON.stringify(payload),
                })
                const data = await res.json()
                console.log('[WhatsApp Checkout] Respuesta:', { success: data.success, ordenId: data.ordenId, error: data.error, status: res.status })
                if (!data.success) throw new Error(data.error || 'Error al procesar')
                isRedirectingRef.current = true
                clearCart()
                setIsProcessing(false)
                router.push(`/tienda/checkout/pago-pendiente?order_id=${data.ordenId}`)
                return;
            }

            // Flujo transferencia y crypto manual
            if (paymentMethod === 'transfer' || paymentMethod === 'crypto_manual') {
                const res = await fetch('/api/checkout', {
                    method: 'POST', headers,
                    body: JSON.stringify({
                        ...commonPayload,
                        metodo_pago: paymentMethod,
                        selected_country: selectedCountry || form.pais,
                        monto_coins: 0,
                        monto_usd: grandTotal,
                        estado: 'pendiente',
                    })
                })
                const data = await res.json()
                if (!data.success) throw new Error(data.error || 'Error al procesar')
                isRedirectingRef.current = true
                clearCart()
                setIsProcessing(false)
                router.push(`/tienda/checkout/pago-pendiente?order_id=${data.ordenId}`)
                return;
            }

            // Flujo BLIS Coins
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...commonPayload,
                    metodo_pago: paymentMethod,
                    monto_coins: paymentMethod === 'coins' ? totalCoins : 0,
                    monto_usd: paymentMethod === 'coins' ? 0 : grandTotal,
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
            const msg = err instanceof Error ? err.message : 'Error desconocido';
            showToast(msg, 'error');
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

    const closeIzipayModal = () => {
        try { window.KR?.removeForms() } catch {}
        // Guardar datos antes del reload
        sessionStorage.setItem('checkout_form', JSON.stringify(form))
        window.location.reload()
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
                                {/* Todos los métodos en orden desde formasPago */}
                                {formasPago.map((fp: any) => {
                                    if (fp.slug === 'coins') {
                                        const disabled = !canPayWithCoins || totalCoins <= 0;
                                        return (
                                            <PayOption key={fp.id}
                                                selected={paymentMethod === 'coins'}
                                                onClick={() => {
                                                    if (disabled) {
                                                        showToast(totalCoins <= 0 ? "Tu carrito no tiene costo en BLISCOINS" : `Te faltan ${(totalCoins - blisCoins).toLocaleString()} BLISCOINS`, "info");
                                                        return;
                                                    }
                                                    setPaymentMethod('coins');
                                                }}
                                                disabled={disabled}
                                                icon={<Coins className="w-5 h-5 text-amber-400" />}
                                                bg={disabled ? "bg-amber-500/5 border-amber-500/10 opacity-60" : "bg-amber-500/10 border-amber-500/40"}
                                                label="Pagar con BLIS Coins"
                                                sublabel={disabled ? (totalCoins <= 0 ? "Este carrito no aplica para BLISCOINS" : `Te faltan ${(totalCoins - blisCoins).toLocaleString()} BLISCOINS`) : `Saldo: ${blisCoins.toLocaleString()} BLIS`}
                                                amount={`${totalCoins.toLocaleString()} COINS`} />
                                        );
                                    }
                                    if (fp.slug === 'transfer') {
                                        if (fp.activo === false) return null;
                                        return (
                                            <div key={fp.id}>
                                                <PayOption selected={paymentMethod === 'transfer'} onClick={() => setPaymentMethod('transfer')}
                                                    icon={<Building2 className="w-5 h-5 text-sky-400" />} bg="bg-sky-500/10 border-sky-500/40"
                                                    label="Transferencia Bancaria" sublabel="Selecciona tu país" amount={`$${getMethodTotal('transfer').toFixed(2)}`} />
                                                {paymentMethod === 'transfer' && (() => {
                                                    const cts: Record<string, any> = fp.config?.countries || {};
                                                    const keys = Object.keys(cts);
                                                    const sel = cts[selectedCountry] || (keys.length === 1 ? cts[keys[0]] : null);
                                                    const bks: any[] = sel?.banks || [];
                                                    const wpp = fp.config?.whatsapp || "";
                                                    const ins = fp.config?.instructions || "";
                                                    const msg = encodeURIComponent(`Hola! Confirmo mi pago:\n\n👤 ${form.nombre || ''} ${form.apellido || ''}\n📧 ${form.email || ''}\n🛒 ${cart.map(c => c.title).join(', ')}\n💰 $${totalUSD.toFixed(2)}\n${sel ? `🏦 ${sel.label}` : ''}\n\nAdjunto comprobante.`);
                                                    return (<div className="mt-3 p-4 bg-sky-500/5 border border-sky-500/20 rounded-2xl space-y-4">
                                                        <p className="text-xs text-sky-400 font-bold uppercase flex gap-2"><Building2 className="w-4 h-4"/>Datos Bancarios</p>
                                                        {keys.length > 1 && <div className="flex flex-wrap gap-2">{keys.map(k => <button key={k} onClick={() => setSelectedCountry(k)} className={`px-4 py-2 rounded-xl text-xs font-bold ${selectedCountry === k ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>{cts[k].flag || '🏳️'} {cts[k].label}</button>)}</div>}
                                                        {bks.length > 0 ? <div className="space-y-3">{bks.map((b: any, i: number) => (
                                                            <div key={i} className="bg-black/30 border border-white/10 rounded-xl p-3">
                                                                <p className="text-sm font-bold text-white">{b.name} <span className="text-[10px] text-gray-500 ml-1">{b.currency === 'USD' ? '$' : 'S/'}</span></p>
                                                                <p className="text-xs text-gray-400 flex items-center gap-2">Cuenta: <span className="text-white font-mono">{b.account_number}</span> <button onClick={() => { navigator.clipboard.writeText((b.account_number || '').replace(/[\s-]/g, '')) }} className="text-gray-500 hover:text-white"><Copy className="w-3 h-3" /></button></p>
                                                                <p className="text-xs text-gray-400">Titular: <span className="text-white">{b.account_holder}</span></p>
                                                                {b.cci && <p className="text-xs text-gray-400 flex items-center gap-2">CCI: <span className="text-white font-mono">{b.cci}</span> <button onClick={() => { navigator.clipboard.writeText((b.cci || '').replace(/[\s-]/g, '')) }} className="text-gray-500 hover:text-white"><Copy className="w-3 h-3" /></button></p>}
                                                            </div>
                                                        ))}</div> : <p className="text-xs text-gray-500 italic">No hay bancos configurados</p>}
                                                        <p className="text-[10px] text-gray-500 text-center">Podrás enviar tu comprobante en el siguiente paso.</p>
                                                        {ins && <p className="text-[10px] text-gray-500 text-center">{ins}</p>}
                                                    </div>);
                                                })()}
                                            </div>
                                        );
                                    }
                                    if (fp.slug === 'crypto_manual') {
                                        if (fp.activo === false) return null;
                                        const imap: Record<string, any> = { crypto_manual: Globe };
                                        const cmap: Record<string, string> = { crypto_manual: "bg-orange-500/10 border-orange-500/40" };
                                        const tmap: Record<string, string> = { crypto_manual: "text-orange-400" };
                                        const Ic = imap[fp.slug] || Globe;
                                        return (<div key={fp.id}>
                                            <PayOption selected={paymentMethod === fp.slug} onClick={() => setPaymentMethod(fp.slug as PaymentMethod)}
                                                icon={<Ic className={`w-5 h-5 ${tmap[fp.slug] || 'text-gray-400'}`} />} bg={cmap[fp.slug] || "bg-gray-500/10 border-gray-500/40"}
                                                label={fp.nombre} sublabel={fp.descripcion || ""} amount={`$${getMethodTotal(fp.slug).toFixed(2)}`} />
                                            {paymentMethod === 'crypto_manual' && (() => {
                                                const wls: any[] = fp.config?.wallets || [];
                                                const wpp = fp.config?.whatsapp || "";
                                                const ins = fp.config?.instructions || "";
                                                const msg = encodeURIComponent(`Hola! Confirmo pago con criptomonedas:\n\n👤 ${form.nombre || ''} ${form.apellido || ''}\n📧 ${form.email || ''}\n🛒 ${cart.map(c => c.title).join(', ')}\n💰 $${totalUSD.toFixed(2)}\n\nAdjunto el hash/ID de mi transacción.`);
                                                return (<div className="mt-3 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-4">
                                                    <p className="text-xs text-orange-400 font-bold uppercase flex gap-2"><Wallet className="w-4 h-4"/>Carteras Crypto — Elige tu red</p>
                                                    {wls.length > 0 ? <div className="space-y-3">{wls.map((w: any, i: number) => (
                                                        <div key={i} className="bg-black/30 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                                            <div className="flex-1"><p className="text-xs font-bold text-white mb-1">{w.label || w.network}</p>
                                                                {w.address ? <><p className="text-[10px] font-mono text-gray-400 break-all select-all flex items-center gap-1">{w.address} <button onClick={() => { navigator.clipboard.writeText((w.address || '').trim()) }} className="text-gray-500 hover:text-white"><Copy className="w-3 h-3" /></button></p>
                                                                {w.holder && <p className="text-[10px] text-gray-500 mt-0.5">Titular: <span className="text-white">{w.holder}</span></p>}</> : <p className="text-[10px] text-gray-600 italic">Dirección no configurada</p>}
                                                            </div>
                                                            {w.qr_url && <img src={w.qr_url} alt="QR" className="w-20 h-20 rounded-xl object-cover border border-white/10 flex-shrink-0" />}
                                                        </div>
                                                    ))}</div> : <p className="text-xs text-gray-500 italic">No hay wallets configuradas aún</p>}
                                                    <p className="text-[10px] text-gray-500 text-center">Podrás enviar tu comprobante en el siguiente paso.</p>
                                                    {ins && <p className="text-[10px] text-gray-500 text-center">{ins}</p>}
                                                </div>);
                                            })()}
                                        </div>);
                                    }
                                    // WhatsApp
                                    if (fp.slug === 'whatsapp') {
                                        if (fp.activo === false) return null;
                                        const asesoresList: any[] = fp.asesores || []
                                        return (
                                            <div key={fp.id}>
                                                <PayOption selected={paymentMethod === 'whatsapp'} onClick={() => {
                                                    setPaymentMethod('whatsapp')
                                                    if (asesoresList.length > 0 && !selectedAsesor) {
                                                        setSelectedAsesor(asesoresList[0].id)
                                                    }
                                                }}
                                                    icon={<img src="/icons/brands/whatsapp.svg" className="w-5 h-5" alt="WhatsApp" />} bg="bg-green-500/10 border-green-500/40"
                                                    label="WhatsApp" sublabel={fp.descripcion || "Coordina tu pago con un asesor"} amount={`$${getMethodTotal('whatsapp').toFixed(2)}`} />
                                                {paymentMethod === 'whatsapp' && (
                                                    <div className="mt-3 p-4 bg-green-500/5 border border-green-500/20 rounded-2xl space-y-3">
                                                        <p className="text-xs text-green-400 font-bold uppercase flex gap-2"><img src="/icons/brands/whatsapp.svg" className="w-4 h-4" alt="" />Elige tu asesor</p>
                                                        {asesoresList.length === 0 ? (
                                                            <p className="text-xs text-gray-500 italic">No hay asesores disponibles en este momento.</p>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {asesoresList.map((a: any) => (
                                                                    <button
                                                                        key={a.id}
                                                                        onClick={() => setSelectedAsesor(a.id)}
                                                                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedAsesor === a.id ? 'bg-green-500/10 border border-green-500/30' : 'bg-black/30 border border-white/5 hover:bg-white/5'}`}
                                                                    >
                                                                        {a.foto_url ? (
                                                                            <img src={a.foto_url} alt={a.nombre} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                                                        ) : (
                                                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                                                <img src="/icons/brands/whatsapp.svg" className="w-5 h-5" alt="" />
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <p className="text-sm font-bold text-white">{a.nombre}</p>
                                                                            <p className="text-[10px] text-gray-400">Blis Expert Team</p>
                                                                        </div>
                                                                        {selectedAsesor === a.id && <div className="ml-auto w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    // izipay, paypal y otras pasarelas
                                    const imap: Record<string, any> = { izipay: CreditCard, paypal: null };
                                    const cmap: Record<string, string> = { izipay: "bg-emerald-500/10 border-emerald-500/40", paypal: "bg-blue-500/10 border-blue-500/40" };
                                    const tmap: Record<string, string> = { izipay: "text-emerald-400", paypal: "text-blue-400" };
                                    const Ic = imap[fp.slug] || CreditCard;
                                    const brandIcon = fp.slug === 'paypal' ? <img src="/icons/brands/paypal.svg" alt="PayPal" className="w-5 h-5" /> : <Ic className={`w-5 h-5 ${tmap[fp.slug] || 'text-gray-400'}`} />;
                                    return <PayOption key={fp.id} selected={paymentMethod === fp.slug} onClick={() => setPaymentMethod(fp.slug as PaymentMethod)}
                                        icon={brandIcon} bg={cmap[fp.slug] || "bg-gray-500/10 border-gray-500/40"}
                                        label={fp.nombre} sublabel={fp.descripcion || ""} amount={`$${getMethodTotal(fp.slug).toFixed(2)}`} />;
                                })}
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
                                {processingFee.amount > 0 && (
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>{processingFee.label}</span>
                                        <span>+${processingFee.amount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="h-px bg-white/5 my-2" />
                                <div className="flex justify-between items-end">
                                    <span className="font-black uppercase tracking-widest text-sm">Total</span>
                                    <div className="text-right">
                                        <p className="text-2xl font-black">${grandTotal.toFixed(2)}</p>
                                        {processingFee.amount > 0 && (
                                            <p className="text-[10px] text-gray-400">Incluye costo de procesamiento</p>
                                        )}
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

            {/* ── Modal Izipay ───────────────────────────────────────────── */}
            {isIzipayModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col overflow-hidden">
                  {/* Barra de confianza superior con animación */}
                  <motion.div
                    className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 border-b border-emerald-200 rounded-t-3xl relative overflow-hidden"
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    style={{ backgroundSize: '200% 100%' }}
                  >
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(16,185,129,0.3) 20px, rgba(16,185,129,0.3) 21px)' }} />
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Lock className="w-3 h-3 text-emerald-600" />
                        </motion.div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">SSL 256-bit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
                          <Shield className="w-3 h-3 text-emerald-600" />
                        </motion.div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">PCI-DSS L1</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 relative z-10">
                      <div className="w-9 h-7 rounded-lg bg-white/80 flex items-center justify-center"><img src="/icons/brands/visa.svg" alt="Visa" className="h-4 w-auto" /></div>
                      <div className="w-9 h-7 rounded-lg bg-white/80 flex items-center justify-center"><img src="/icons/brands/mastercard.svg" alt="Mastercard" className="h-4 w-auto" /></div>
                      <div className="w-9 h-7 rounded-lg bg-white/80 flex items-center justify-center"><img src="/icons/brands/amex.svg" alt="Amex" className="h-4 w-auto" /></div>
                      <div className="w-9 h-7 rounded-lg bg-white/80 flex items-center justify-center"><img src="/icons/brands/diners-club.svg" alt="Diners" className="h-4 w-auto" /></div>
                    </div>
                  </motion.div>

                  <div className="p-6 overflow-y-auto flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                          animate={{ boxShadow: ['0 0 20px rgba(16,185,129,0.2)', '0 0 35px rgba(16,185,129,0.4)', '0 0 20px rgba(16,185,129,0.2)'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <CreditCard className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <span className="font-black text-gray-900 text-xl tracking-tight">Blis Bank</span>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Pasarela de pago segura</p>
                        </div>
                      </div>
                      <button onClick={() => closeIzipayModal()} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 text-lg font-bold transition-colors" title="Cerrar">&times;</button>
                    </div>

                    {/* Formulario */}
                    <div className="bg-[#f1f2f4] rounded-2xl p-4 relative" style={paymentMethod === 'paypal' ? { minHeight: '180px' } : { maxHeight: '50vh', overflow: 'auto' }}>
                      {paymentMethod === 'paypal' ? (
                        <div id="paypal-btn-container" key={krKey} style={{ minHeight: '150px', maxHeight: '50vh', overflowY: 'auto' }} />
                      ) : (
                        <div className="kr-embedded" key={krKey} kr-form-token={izipayFormToken} kr-language="es-ES">
                          <div className="kr-pan"></div>
                          <div className="kr-expiry"></div>
                          <div className="kr-security-code"></div>
                          <button className="kr-payment-button"></button>
                          <div className="kr-form-error"></div>
                        </div>
                      )}
                    </div>

                    {/* Footer de confianza con animaciones */}
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between px-3">
                        <div className="flex items-center gap-2">
                          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                          <span className="text-[11px] text-gray-500 font-medium">Conexión cifrada activa</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                          <Lock className="w-3 h-3" />
                          <span>E2E Encryption</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 px-1">
                        {[
                          { icon: Shield, text: 'Datos encriptados', color: 'emerald' },
                          { icon: Zap, text: 'Pago instantáneo', color: 'amber' },
                          { icon: Building2, text: 'Respaldo bancario', color: 'blue' },
                        ].map(({ icon: Icon, text, color }) => {
                          const colors: Record<string, string> = {
                            emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
                            amber: 'bg-amber-50 border-amber-100 text-amber-700',
                            blue: 'bg-blue-50 border-blue-100 text-blue-700',
                          }
                          return (
                            <div key={text} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border ${colors[color]}`}>
                              <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}>
                                <Icon className="w-4 h-4" />
                              </motion.div>
                              <span className="text-[9px] font-bold text-center leading-tight">{text}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <div className="w-11 h-9 rounded-xl bg-white/10 flex items-center justify-center"><img src="/icons/brands/visa.svg" alt="Visa" className="h-4 w-auto" /></div>
                        <div className="w-11 h-9 rounded-xl bg-white/10 flex items-center justify-center"><img src="/icons/brands/mastercard.svg" alt="MC" className="h-4 w-auto" /></div>
                        <div className="w-11 h-9 rounded-xl bg-white/10 flex items-center justify-center"><img src="/icons/brands/amex.svg" alt="Amex" className="h-4 w-auto" /></div>
                        <div className="w-11 h-9 rounded-xl bg-white/10 flex items-center justify-center"><img src="/icons/brands/diners-club.svg" alt="Diners" className="h-4 w-auto" /></div>
                      </div>
                    </div>

                    {paymentMethod === 'izipay' && (
                      <IzipayScriptLoader
                        loaded={izipayScriptLoaded}
                        publicKey={izipayPublicKey}
                        onLoad={() => setIzipayScriptLoaded(true)}
                        onSuccess={async () => {
                          await fetch('/api/izipay-confirm', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ordenId: izipayOrderId }),
                          }).catch(() => {})
                          sessionStorage.removeItem('izipay_flow_active')
                          clearCart()
                          setIsIzipayModal(false)
                          window.location.href = `/tienda/checkout/status?izipay_success=1&order_id=${izipayOrderId}&total=${izipayTotal.toFixed(2)}`
                        }}
                        onError={(msg) => {
                          setIsIzipayModal(false)
                          setIsProcessing(false)
                          showToast(msg, 'error')
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            <FooterSections />
        </main>
    );
}

// ── Componente opción de pago ──────────────────────────────────────────────────
function PayOption({ selected, onClick, icon, bg, label, sublabel, amount, badge, disabled }: {
    selected: boolean; onClick: () => void; icon: React.ReactNode;
    bg: string; label: string; sublabel: string; amount: string; badge?: string; disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between text-left ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${
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

// ── Cargador del SDK KR para modal Izipay ────────────────────────────────────
function IzipayScriptLoader({ loaded, onLoad, onSuccess, onError, publicKey }: {
  loaded: boolean; onLoad: () => void; onSuccess: () => void; onError: (msg: string) => void; publicKey: string;
}) {
  useEffect(() => {
    if (loaded || typeof window === 'undefined') return
    if (document.getElementById('izipay-kr-modal-script')) return

    const script = document.createElement('script')
    script.id = 'izipay-kr-modal-script'
    script.src = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js?t=' + Date.now()
    script.setAttribute('kr-public-key', publicKey)
    script.async = true
    script.onload = () => {
      let a = 0
      const w = () => {
        a++
        if (window.KR) {
          window.KR.onSubmit((r: any) => {
            const st = r?.clientAnswer?.orderStatus || r?.orderStatus
            if (st === 'PAID') onSuccess()
            else onError('Pago rechazado.')
            return true
          })
          window.KR.onError((e: any) => { onError(e?.message || 'Error en la pasarela.'); return true })
          onLoad()
        } else if (a < 20) setTimeout(w, 300)
        else onError('La pasarela no respondió.')
      }
      w()
    }
    script.onerror = () => onError('Error al cargar SDK.')
    document.head.appendChild(script)
    return () => { try { window.KR?.removeForms() } catch {} }
  }, [loaded])
  return null
}
