"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Home, ShoppingBag, ArrowRight, Construction } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Grid Tilting
    const gridRotateX = useTransform(springY, [-500, 500], [10, -10]);
    const gridRotateY = useTransform(springX, [-500, 500], [-10, 10]);

    // Parallax for Background Elements
    const parallaxX = useTransform(springX, [-1000, 1000], [20, -20]);
    const parallaxY = useTransform(springY, [-1000, 1000], [20, -20]);

    // Parallax for stars/particles
    const starsParallaxX1 = useTransform(springX, [-1000, 1000], [50, -50]);
    const starsParallaxY1 = useTransform(springY, [-1000, 1000], [50, -50]);
    const starsParallaxX2 = useTransform(springX, [-1000, 1000], [30, -30]);
    const starsParallaxY2 = useTransform(springY, [-1000, 1000], [30, -30]);

    const [isMounted, setIsMounted] = useState(false);
    const [starPositions, setStarPositions] = useState<{ top: string; left: string; scale: number; duration: number; parallaxType: number }[]>([]);

    useEffect(() => {
        setIsMounted(true);
        setStarPositions([...Array(20)].map(() => ({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            scale: Math.random() * 1.5 + 0.5,
            duration: Math.random() * 3 + 2,
            parallaxType: Math.random() > 0.5 ? 1 : 2
        })));
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const moveX = clientX - window.innerWidth / 2;
            const moveY = clientY - window.innerHeight / 2;
            mouseX.set(moveX);
            mouseY.set(moveY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    if (!isMounted) return null;

    return (
        <div className="h-screen w-full bg-[#020202] flex flex-col items-center justify-center relative overflow-hidden selection:bg-blis-red/30 px-4">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* 3D Perspective Grid */}
                <motion.div
                    style={{
                        rotateX: gridRotateX,
                        rotateY: gridRotateY,
                        perspective: 1000
                    }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="w-[150%] h-[150%] bg-[linear-gradient(to_right,#be0b3c10_1px,transparent_1px),linear-gradient(to_bottom,#be0b3c10_1px,transparent_1px)] bg-[size:60px_60px] transform-gpu opacity-20"
                        style={{ transform: 'rotateX(60deg) translateY(-20%)' }} />
                </motion.div>

                {/* Silhouettes - Reduced opacity for cleaner black */}
                <motion.div
                    style={{ x: parallaxX, y: parallaxY }}
                    className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-between px-10 md:px-20 opacity-5 pointer-events-none"
                >
                    <div className="w-20 md:w-40 h-[40vh] md:h-[60vh] bg-gradient-to-t from-red-950/20 to-transparent"
                        style={{ clipPath: 'polygon(0% 100%, 0% 20%, 50% 0%, 100% 20%, 100% 100%)' }} />
                    <div className="w-20 md:w-32 h-[30vh] md:h-[50vh] bg-gradient-to-t from-blis-red/5 to-transparent"
                        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                    <div className="w-32 md:w-48 h-[50vh] md:h-[70vh] bg-gradient-to-t from-red-950/20 to-transparent"
                        style={{ clipPath: 'polygon(0% 100%, 0% 30%, 30% 30%, 30% 0%, 70% 0%, 70% 30%, 100% 30%, 100% 100%)' }} />
                </motion.div>

                {/* Floating Particles */}
                {starPositions.map((star, i) => (
                    <motion.div
                        key={i}
                        style={{
                            top: star.top,
                            left: star.left,
                            x: star.parallaxType === 1 ? starsParallaxX1 : starsParallaxX2,
                            y: star.parallaxType === 1 ? starsParallaxY1 : starsParallaxY2,
                        }}
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                            backgroundColor: ["#fff", "#be0b3c", "#fff"]
                        }}
                        transition={{
                            duration: star.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute w-[1px] h-[1px] rounded-full blur-[0.5px]"
                    />
                ))}
            </div>

            {/* Content Container - Compact for no scroll */}
            <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center justify-center h-full pt-10 pb-20">
                {/* Status Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-2 md:mb-4 px-3 py-1 bg-blis-red/10 border border-blis-red/20 backdrop-blur-sm rounded-full flex items-center gap-2"
                >
                    <Construction className="w-3 h-3 text-blis-red" />
                    <span className="text-blis-red text-[9px] md:text-[11px] font-black uppercase tracking-widest leading-none">Sitio Bajo Construcción</span>
                </motion.div>

                <div className="relative mb-0 md:mb-6">
                    <div className="relative">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[150px] md:text-[380px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/5 select-none block"
                        >
                            404
                        </motion.span>
                    </div>

                    {/* Highly Pronounced Glitch Shadows */}
                    <motion.span
                        animate={{
                            x: [-5, 5, -2, 3, 0],
                            y: [2, -2, 1, 0],
                            opacity: [0.2, 0.4, 0.1, 0.3, 0.2]
                        }}
                        transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 left-0 text-[150px] md:text-[380px] font-black leading-none tracking-tighter text-blis-red select-none -z-10 translate-x-2"
                    >
                        404
                    </motion.span>
                    <motion.span
                        animate={{
                            x: [4, -4, 2, -3, 0],
                            y: [-1, 1, -2, 0],
                            opacity: [0.2, 0.3, 0.1, 0.4, 0.2]
                        }}
                        transition={{ duration: 0.12, repeat: Infinity, ease: "linear", delay: 0.05 }}
                        className="absolute top-0 left-0 text-[150px] md:text-[380px] font-black leading-none tracking-tighter text-blue-800 select-none -z-10 -translate-x-2"
                    >
                        404
                    </motion.span>
                </div>

                {/* Messaging */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4 md:space-y-6"
                >
                    <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                        ERROR EN LA <span className="text-blis-red underline decoration-white/10 underline-offset-8">RUTA</span>
                    </h2>
                    <p className="text-gray-400 font-bold text-base md:text-2xl max-w-sm md:max-w-2xl mx-auto leading-tight md:leading-relaxed">
                        Parece que has llegado a un lugar incorrecto o que se ha movido de lugar, <span className="text-white/80">lamentamos las molestias.</span>
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full sm:w-auto"
                >
                    <Link
                        href="/"
                        className="group w-full sm:w-auto px-6 py-3 bg-blis-red text-white font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-2 shadow-[0_15px_30px_rgba(190,11,60,0.4)] hover:scale-105 active:scale-95 transition-all"
                    >
                        <Home className="w-3.5 h-3.5" />
                        Volver a inicio
                    </Link>
                    <Link
                        href="/tienda"
                        className="group w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Regresar a la tienda
                        <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>

            {/* Absolute Bottom Tag */}
            <div className="absolute bottom-16 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 w-full justify-center px-10">
                <div className="hidden md:block h-px w-8 bg-white/20" />
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] md:tracking-[0.8em] whitespace-nowrap">Blis // Operacional // Error</p>
                <div className="hidden md:block h-px w-8 bg-white/20" />
            </div>
        </div>
    );
}
