"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserPlus, LogIn, Coins, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function StoreLogin() {
    const router = useRouter();
    const { user, loading, loginWithEmail, signUp } = useAuth();
    
    const [pendingCoins, setPendingCoins] = useState(0);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [turnstileSolved, setTurnstileSolved] = useState(false);
    const turnstileContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/admin/seguridad').then(r => r.json()).then(d => {
            if (d?.data?.bot_protection?.habilitado) {
                const key = d.data.bot_protection.site_key
                if (key) {
                    setTurnstileSiteKey(key)
                    if (!document.querySelector('script[src*="turnstile"]')) {
                        const script = document.createElement('script')
                        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
                        script.async = true
                        script.defer = true
                        document.head.appendChild(script)
                    }
                }
            }
        }).catch(() => {})
    }, [])

    useEffect(() => {
        if (!turnstileSiteKey || !turnstileContainerRef.current) return
        const el = turnstileContainerRef.current
        if (el.hasAttribute('data-rendered')) return
        let attempts = 0
        const tryRender = () => {
            if (window.turnstile) {
                window.turnstile.render(el, {
                    sitekey: turnstileSiteKey,
                    theme: 'dark',
                    language: 'es',
                    size: 'normal',
                    appearance: 'always',
                    callback: (token: string) => {
                        setTurnstileToken(token)
                        setTurnstileSolved(true)
                    }
                })
                el.setAttribute('data-rendered', '1')
            } else if (attempts < 30) {
                attempts++
                setTimeout(tryRender, 200)
            }
        }
        tryRender()
    }, [turnstileSiteKey])

    useEffect(() => {
        if (typeof window !== "undefined") {
            const pending = parseInt(localStorage.getItem('blis_pending_coins') || '0', 10);
            setPendingCoins(pending);
        }
    }, []);

    useEffect(() => {
        if (user) {
            router.push("/blog");
        }
    }, [user, router]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (isLogin) {
                const result = await loginWithEmail(email, password);
                if (!result.success) {
                    setError(result.error || "Error al iniciar sesión");
                    return;
                }
                alert("Has ingresado exitosamente.");
            } else {
                const result = await signUp(email, password, nombre, apellido);
                if (!result.success) {
                    setError(result.error || "Error al registrarse");
                    return;
                }

                let currentCoins = parseInt(localStorage.getItem('blis_coins') || '0', 10);
                
                if (pendingCoins > 0) {
                    localStorage.setItem('blis_coins', (currentCoins + pendingCoins).toString());
                    
                    const pendingArticles = JSON.parse(localStorage.getItem('blis_pending_articles') || '[]');
                    const claimedArticles = JSON.parse(localStorage.getItem('blis_claimed_articles') || '[]');
                    
                    pendingArticles.forEach((art: any) => {
                        if (!claimedArticles.includes(art.title)) {
                            claimedArticles.push(art.title);
                        }
                    });
                    
                    localStorage.setItem('blis_claimed_articles', JSON.stringify(claimedArticles));
                    localStorage.removeItem('blis_pending_coins');
                    localStorage.removeItem('blis_pending_articles');
                    
                    alert(`¡Has sido registrado y ${pendingCoins} Blis Coins pendientes han sido añadidos a tu billetera exitosamente!`);
                } else {
                    alert("Cuenta creada exitosamente. Revisa tu email para confirmar.");
                }
            }
            
            window.dispatchEvent(new Event('storage'));
            router.push("/blog");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center relative overflow-hidden py-10 px-4">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.1] bg-blis-red pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.05] bg-blue-900 pointer-events-none" />

            <div className="max-w-[400px] w-full relative z-10 flex flex-col items-center">
                
                <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2 text-center flex items-center gap-2">
                    {isLogin ? <LogIn className="text-blis-red w-6 h-6" /> : <UserPlus className="text-blis-red w-6 h-6" />}
                    {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                </h1>
                <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-8 border-b border-blis-red/20 pb-4 text-center">
                    Blis Corp Investors Club
                </p>

                {pendingCoins > 0 && !isLogin && (
                    <div className="w-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/50 rounded-2xl p-6 mb-8 text-center animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <Coins className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                        <h2 className="text-xl font-black text-amber-400 uppercase tracking-widest leading-tight">Tienes {pendingCoins} Blis Coins Pendientes</h2>
                        <p className="text-[11px] text-amber-200 mt-2 font-bold uppercase tracking-wider">¡Al completar tu registro, se te asignarán automáticamente!</p>
                    </div>
                )}

                {error && (
                    <div className="w-full bg-red-500/10 border border-red-500/50 rounded-2xl p-4 mb-6 text-center">
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleAuth} className="w-full space-y-5 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Tu nombre" 
                                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blis-red transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Apellido</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    placeholder="Tu apellido" 
                                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blis-red transition-all" 
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com" 
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blis-red transition-all" 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Contraseña</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blis-red transition-all tracking-[0.2em]" 
                        />
                    </div>

                    {turnstileSiteKey && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                {turnstileSolved ? (
                                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                                        ✓ Humano verificado
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider animate-pulse">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
                                        Escaneando conexión...
                                    </span>
                                )}
                            </div>
                            <div className={`rounded-xl border-2 transition-all duration-500 flex justify-center ${
                                turnstileSolved
                                    ? 'border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                                    : 'border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                            }`}>
                                <div ref={turnstileContainerRef} className="[&>iframe]:rounded-lg" />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full mt-4 bg-blis-red text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#87082a] transition-all flex items-center justify-center gap-3 text-sm shadow-[0_0_20px_rgba(190,11,60,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <ShieldCheck className="w-5 h-5" /> 
                                {isLogin ? "Acceder a mi Bóveda" : "Registrarme y Reclamar"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </button>
                    
                    <div className="pt-4 border-t border-white/5 text-center">
                        <p className="text-xs text-gray-400">
                            {isLogin ? "¿No tienes una cuenta aún?" : "¿Ya eres miembro VIP?"}
                            <br />
                            <button 
                                type="button" 
                                onClick={() => {setIsLogin(!isLogin); setError(null);}} 
                                className="text-blis-red font-bold uppercase tracking-widest text-[10px] mt-2 underline hover:text-white transition-colors"
                            >
                                {isLogin ? "Crear una cuenta nueva gratis" : "Iniciar Sesión Ahora"}
                            </button>
                        </p>
                    </div>
                </form>

            </div>
        </div>
    );
}