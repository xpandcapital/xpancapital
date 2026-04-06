"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

export function CapturePopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Show popup after 5 seconds
        const timer = setTimeout(() => setIsOpen(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(190,11,60,0.15)]"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            <div className="mb-8">
                                <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-2">
                                    Acceso <span className="text-blis-red">V.I.P</span>
                                </h3>
                                <p className="text-gray-400 font-light text-sm">
                                    Únete a nuestro círculo cerrado de inversionistas y recibe ofertas pre-venta antes que nadie.
                                </p>
                            </div>

                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsOpen(false); }}>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        placeholder="TU CORREO CORPORATIVO"
                                        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-sm tracking-wider text-white placeholder:text-gray-600 focus:outline-none focus:border-blis-red focus:bg-white/10 transition-all"
                                    />
                                    <div className="absolute top-0 right-0 h-full w-1 flex flex-col justify-between py-2 pr-2">
                                        <div className="w-full h-1 bg-blis-red/50" />
                                        <div className="w-full h-1 bg-blis-red/20" />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onHoverStart={() => setIsHovered(true)}
                                    onHoverEnd={() => setIsHovered(false)}
                                    className="w-full relative flex items-center justify-center px-6 py-4 bg-blis-red text-white text-sm font-bold tracking-widest uppercase rounded-sm overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center">
                                        Solicitar Acceso
                                        <motion.div
                                            animate={{ x: isHovered ? 5 : 0 }}
                                            className="ml-2"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.div>
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 ease-out" />
                                </motion.button>
                            </form>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-mono">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span>SSL SECURE CONNECTION</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
