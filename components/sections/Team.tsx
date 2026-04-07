"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Crosshair, ArrowRight, Briefcase, Activity, Facebook, Instagram, Linkedin, Twitter, Youtube, MessageCircle, Mail, Phone, MapPin, Video as VideoIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useLandingCMS } from "@/context/LandingCMSContext";

export function Team() {
    const { cmsData } = useLandingCMS();
    const { ceoName, ceoRole, ceoQuote, ceoDescription1, ceoDescription2, ceoImage, title, members, widget1Label, widget1Value, widget2Label, widget2Value } = cmsData.team;

    // Use socials from the first member if available
    const socials = members[0]?.socials || {};

    const ceoLinks = [
        { icon: Linkedin, url: socials.linkedin || "", name: "LinkedIn" },
        { icon: MessageCircle, url: socials.whatsapp || "", name: "WhatsApp" },
        { icon: Instagram, url: socials.instagram || "", name: "Instagram" },
        { icon: Facebook, url: socials.facebook || "", name: "Facebook" },
        { icon: Twitter, url: socials.twitter || "", name: "X (Twitter)" },
        { icon: Mail, url: "", name: "Email" },
    ];

    const activeCeoLinks = ceoLinks.filter(link => link.url !== "");

    // Widget values with defaults
    const widgetLeft = { label: widget1Label || 'Cap. Administrado', value: widget1Value || '+$10M' };
    const widgetRight = { label: widget2Label || 'Garantía Fiduciaria', value: widget2Value || 'Cero Litigios' };

    return (
        <section className="pt-10 md:pt-20 pb-24 bg-gradient-to-t from-black via-zinc-950 to-black relative overflow-hidden">
            {/* Minimalist Background Lines */}
            <div className="absolute inset-0 top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5" />

            <div className="container mx-auto px-6 relative z-10 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

                    {/* Left: C.E.O. Image / Silhouette Placeholder */}
                    <div className="lg:col-span-5 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="relative lg:h-[700px] w-full rounded-2xl overflow-hidden glass-card p-2 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] antigravity"
                        >
                            <div className="w-full h-full rounded-xl overflow-hidden relative bg-black min-h-[620px]">
                                {/* Real CEO Photo */}
                                <div 
                                    className="absolute inset-0 bg-cover bg-center bg-top opacity-90 hover:opacity-100 transition-all duration-700"
                                    style={{ backgroundImage: ceoImage ? `url('${ceoImage}')` : 'none' }}
                                />
                                {(!ceoImage || ceoImage === '') && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                        <span className="text-gray-600 text-sm">Sin imagen</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70" />

                                <div className="absolute bottom-6 left-6 right-6 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-[1px] bg-blis-red" />
                                        <span className="text-blis-red uppercase tracking-widest text-xs font-bold font-mono">{title}</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase mt-2">{ceoName}</h3>
                                    <p className="text-gray-300 font-light mt-1 text-sm tracking-wide mb-5">{ceoRole}</p>

                                    <div className="flex flex-wrap gap-2.5">
                                        {activeCeoLinks.map((link, i) => (
                                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-300 hover:text-white hover:border-white transition-all bg-black/40 backdrop-blur-md hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                                <link.icon className="w-4 h-4" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Widget 1: Capital Administrado — top-left on mobile */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="absolute -top-4 left-0 xl:top-[-40px] xl:-right-12 xl:left-auto flex flex-col gap-2 glass-card p-3 xl:p-5 rounded-2xl w-40 xl:w-56 z-30 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] bg-black/80 backdrop-blur-xl flex"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="text-emerald-400 w-4 h-4" />
                                <span className="text-[9px] xl:text-[10px] font-mono text-gray-300 uppercase tracking-widest">{widgetLeft.label}</span>
                            </div>
                            <div className="text-xl xl:text-3xl font-black text-white tracking-tighter drop-shadow-md">
                                {widgetLeft.value}
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "100%" }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                    className="bg-emerald-400 h-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-40 -right-2 md:bottom-24 md:-right-4 xl:top-1/3 xl:-left-12 xl:bottom-auto flex flex-col gap-2 glass-card p-3 xl:p-4 rounded-2xl w-40 xl:w-56 z-30 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] bg-black/80 backdrop-blur-xl flex"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="text-blis-red w-4 h-4" />
                                <span className="text-[9px] xl:text-[10px] font-mono text-gray-300 uppercase tracking-widest">{widgetRight.label}</span>
                            </div>
                            <div className="text-lg xl:text-2xl font-black text-white tracking-tighter drop-shadow-md">
                                {widgetRight.value}
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "100%" }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                    className="bg-blis-red h-full shadow-[0_0_10px_rgba(190,11,60,0.8)]"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Copy & Vision */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                            className="bg-white/5 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white/5"
                        >
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight mb-8">
                                "{ceoQuote}"
                            </h2>

                            <p className="text-gray-400 font-light text-lg leading-relaxed mb-6">
                                {ceoDescription1}
                            </p>

                            <p className="text-gray-400 font-light text-lg leading-relaxed mb-10">
                                {ceoDescription2}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                                <div className="flex gap-4">
                                    <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                                    <div>
                                        <h4 className="text-white font-bold uppercase text-sm mb-1 tracking-wide">Deber Fiduciario</h4>
                                        <p className="text-gray-500 text-xs font-light">Proteger el capital del inversor con certeza jurídica en el 100% de operaciones.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Crosshair className="w-8 h-8 text-blis-red shrink-0" />
                                    <div>
                                        <h4 className="text-white font-bold uppercase text-sm mb-1 tracking-wide">Ejecución Táctica</h4>
                                        <p className="text-gray-500 text-xs font-light">Adquisición en zonas de alta proyección de infraestructura municipal.</p>
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
