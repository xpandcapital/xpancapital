"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Building, Home, Layers } from "lucide-react";
import { useLandingCMS } from "@/context/LandingCMSContext";

export function ProjectMap() {
    const { cmsData } = useLandingCMS();
    const { locations, description, title, subtitle, backgroundImage } = cmsData.map;

    return (
        <section className="pt-10 md:pt-32 pb-32 bg-black relative overflow-hidden">
            <div className="absolute inset-0 cyber-texture opacity-50 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row gap-16 items-start">

                    {/* Left: Text & List */}
                    <div className="lg:w-1/3">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <span className="text-white/60 font-bold tracking-widest text-sm uppercase flex items-center gap-2 mb-4">
                                <Navigation className="w-4 h-4" /> {subtitle}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wide mb-6">
                                {title || 'Dominio'} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-white">Territorial</span>
                            </h2>
                            <p className="text-gray-400 font-light mb-10 leading-relaxed">
                                {description}
                            </p>

                            <motion.div
                                className="space-y-4"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={{
                                    hidden: {},
                                    visible: { transition: { staggerChildren: 0.08 } }
                                }}
                            >
                                {locations.map((loc, idx) => (
                                    <motion.div
                                        key={idx}
                                        variants={{
                                            hidden: { opacity: 0, y: 16 },
                                            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
                                        }}
                                        className="flex items-center gap-3 group cursor-pointer"
                                    >
                                        <div className="w-3 h-3 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-150" style={{ backgroundColor: loc.dotColor, boxShadow: `0 0 10px ${loc.dotColor}` }} />
                                        <div className="flex-1 flex items-center justify-between">
                                            <div>
                                                <span className="text-white font-bold text-sm uppercase tracking-wider transition-colors">{loc.name}</span>
                                                <span className="text-gray-500 text-xs ml-2 font-mono group-hover:text-white/70 transition-colors duration-300">{loc.city}</span>
                                            </div>
                                            <span
                                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${loc.status === "Culminado" ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-green-400 border-green-500/30 bg-green-500/10"
                                                    }`}
                                            >
                                                {loc.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right: Map Visualizer */}
                    <div className="lg:w-2/3 w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className={`relative h-[300px] sm:h-[400px] lg:min-h-[520px] lg:aspect-video w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] antigravity ${backgroundImage ? 'bg-cover' : 'bg-black/40'}`}
                            style={{
                                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            {!backgroundImage && (
                                <>
                                    {/* Radar rings */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />

                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-radial-gradient(circle at center, transparent 0, transparent 20px, rgba(255,255,255,0.8) 21px, transparent 22px)' }} />

                                    <svg className="absolute inset-0 w-full h-full opacity-[0.4]" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                        <text x="30" y="20" fill="#ffffff" fontSize="6" fontWeight="bold" fontFamily="monospace" opacity="0.8" style={{ letterSpacing: '1px' }}>ECUADOR</text>
                                        <path d="M 30,22 L 50,22" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
                                        <path d="M 60,15 L 75,5 L 100,3 L 125,5 L 135,15 L 140,30 L 100,35 L 75,25 Z" fill="#ffffff" fillOpacity="0.05" stroke="#ffffff" strokeWidth="0.3" strokeDasharray="1,1" />
                                        <text x="85" y="17" fill="#ffffff" fontSize="3" fontFamily="monospace" opacity="0.6">PICHINCHA</text>
                                        <text x="85" y="20" fill="#ffffff" fontSize="2.5" fontFamily="monospace" opacity="0.8">Quito</text>
                                        <path d="M 40,35 L 115,35 L 150,38 L 135,60 L 85,65 L 55,60 L 30,45 Z" fill="#ffffff" fillOpacity="0.08" stroke="#ffffff" strokeWidth="0.4" />
                                        <text x="45" y="45" fill="#ffffff" fontSize="3" fontFamily="monospace" opacity="0.6">COTOPAXI</text>
                                        <text x="45" y="48" fill="#ffffff" fontSize="2.5" fontFamily="monospace" opacity="0.8">Pujilí</text>
                                        <text x="110" y="45" fill="#ffffff" fontSize="2.5" fontFamily="monospace" opacity="0.8">Latacunga</text>
                                        <path d="M 65,65 L 130,60 L 150,75 L 125,85 L 60,80 Z" fill="#ffffff" fillOpacity="0.05" stroke="#ffffff" strokeWidth="0.3" strokeDasharray="1,1" />
                                        <text x="115" y="70" fill="#ffffff" fontSize="3" fontFamily="monospace" opacity="0.6">TUNGURAHUA</text>
                                        <text x="115" y="73" fill="#ffffff" fontSize="2.5" fontFamily="monospace" opacity="0.8">Ambato</text>
                                        <path d="M 90,30 L 75,50 L 95,65" fill="none" stroke="#ffffff" strokeWidth="0.2" strokeDasharray="2,2" opacity="0.5" />
                                    </svg>

                                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-transparent to-[#0a0a0a]/80 pointer-events-none" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/40 via-transparent to-[#0a0a0a]/40 pointer-events-none" />
                                </>
                            )}

                            {/* Pines — caen desde arriba con rebote spring */}
                            <motion.div
                                className="absolute inset-0"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={{
                                    hidden: {},
                                    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.6 } }
                                }}
                            >
                                {locations.map((loc, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="absolute flex flex-col items-center justify-center group z-20 cursor-pointer"
                                        style={loc.coordinates}
                                        variants={{
                                            hidden: { opacity: 0, y: -20, scale: 0 },
                                            visible: {
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                                transition: { type: "spring", stiffness: 200, damping: 14 }
                                            }
                                        }}
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('openProjectModal', { detail: loc.fullName }));
                                            const el = document.getElementById('proyectos');
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        {/* Pulse ring */}
                                        <div className="absolute -inset-3 rounded-full animate-ping opacity-50"
                                            style={{ backgroundColor: loc.dotColor, opacity: 0.2 }} />

                                        {/* Dot */}
                                        <div className="w-4 h-4 rounded-full relative z-10 border-2 border-black shadow-[0_0_12px_rgba(190,11,60,0.6)]"
                                            style={{ backgroundColor: loc.dotColor }} />

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 w-max bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-left shadow-lg">
                                            <p className="text-white text-xs font-black uppercase tracking-widest">{loc.name}</p>
                                            <p className="text-gray-400 text-[10px] font-mono mt-0.5">{loc.city}, {loc.province}</p>
                                            <span className="text-[9px] uppercase font-bold" style={{ color: loc.dotColor }}>{loc.status}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                                <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blis-red animate-pulse" />
                                    <span className="text-[10px] text-white uppercase tracking-widest font-mono">{locations.length} Proyectos Activos</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono uppercase">
                                        <Building className="w-3 h-3" /> Cotopaxi
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono uppercase">
                                        <Home className="w-3 h-3" /> Pichincha
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono uppercase">
                                        <Layers className="w-3 h-3" /> Tungurahua
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
