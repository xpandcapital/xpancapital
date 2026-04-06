"use client";

import { motion } from "framer-motion";

const trustPartners = [
    { name: "Banco Pichincha", type: "Financiera", color: "text-yellow-500" },
    { name: "Notaría Pública 1", type: "Legal", color: "text-gray-300" },
    { name: "Municipio de Latacunga", type: "Gobierno", color: "text-blue-400" },
    { name: "Banco del Pacífico", type: "Financiera", color: "text-blue-500" },
    { name: "Notaría Pública 3", type: "Legal", color: "text-gray-300" },
    { name: "Municipio de Pujilí", type: "Gobierno", color: "text-amber-500" },
    { name: "Produbanco", type: "Financiera", color: "text-emerald-500" },
];

export function TrustBadges() {
    return (
        <section className="relative overflow-hidden z-20 border-t border-white/10 bg-black/30 backdrop-blur-sm py-10">
            {/* Infinite Marquee Container */}
            <div className="relative flex overflow-x-hidden w-full group">
                {/* Fade edges */}
                <div className="absolute top-0 left-0 w-16 sm:w-32 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-16 sm:w-32 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

                {/* Animated Track */}
                <motion.div
                    className="flex shrink-0 gap-8 sm:gap-16 items-center px-4 sm:px-8"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 35,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {/* Render array twice for seamless looping */}
                    {[...trustPartners, ...trustPartners].map((partner, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700 cursor-default shrink-0"
                        >
                            <span className={`text-base sm:text-2xl font-black uppercase tracking-tighter ${partner.color} whitespace-nowrap`}>
                                {partner.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
