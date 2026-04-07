"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Chrome, Facebook, Apple, ArrowRight, Github } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const { login } = useAuth();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
        try {
            const role = login(id, password);
            if (role) {
                onClose();
                // Usamos location.href para asegurar una limpieza completa del estado de la home
                window.location.href = role === "admin" ? "/superadmin" : "/miembros";
            } else {
                setError(true);
                setTimeout(() => setError(false), 2000);
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(true);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#0A0D11] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-blis-red/20 blur-[80px] rounded-full pointer-events-none -translate-y-1/2" />

                        <div className="p-8 md:p-10 relative z-10">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                        {mode === "login" ? "Bienvenido" : "Únete"}
                                    </h2>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                        Acceso Corporativo Blis Corp
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Social Logins */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {[
                                    { icon: Chrome, color: "hover:text-amber-500", label: "Google" },
                                    { icon: Facebook, color: "hover:text-blue-500", label: "Facebook" },
                                    { icon: Apple, color: "hover:text-white", label: "Apple" }
                                ].map((social, i) => (
                                    <button
                                        key={i}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 group ${social.color}`}
                                    >
                                        <social.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                                            {social.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5" />
                                </div>
                                <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.3em]">
                                    <span className="bg-[#0A0D11] px-4 text-gray-600">O usa tu cuenta</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blis-red transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Usuario o Correo"
                                            value={id}
                                            onChange={(e) => setId(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:border-blis-red transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blis-red transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:border-blis-red transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-[10px] text-blis-red font-black uppercase tracking-widest text-center"
                                    >
                                        Datos incorrectos. Verifica tus credenciales.
                                    </motion.p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-blis-red hover:text-white transition-all shadow-xl flex items-center justify-center gap-2 group/btn"
                                >
                                    {mode === "login" ? "Entrar Ahora" : "Crear Cuenta"}
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </button>
                            </form>

                            {/* Footer - Registration disabled */}
                            {/* <div className="mt-8 text-center">
                                <button
                                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                                    className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    {mode === "login"
                                        ? "¿No tienes cuenta? Regístrate gratis"
                                        : "¿Ya tienes cuenta? Inicia sesión"}
                                </button>
                            </div> */}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
