"use client";

import { motion } from "framer-motion";
import { Facebook, Instagram, Linkedin, Twitter, PlayCircle, Youtube, MessageCircle, Mail, Phone, MapPin, Video as VideoIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

import { useLandingCMS } from "@/context/LandingCMSContext";

export function FooterSections() {
    const { cmsData } = useLandingCMS();
    const { showToast } = useToast();
    const { 
        description = "Somos la firma élite en desarrollo de software y tecnología real estate.", 
        socials = {}, 
        logoVertical = "/images/logo-blis-vertical.png", 
        logoHorizontal = "/images/blis-logo.png" 
    } = cmsData?.footer || {};

    const globalLinks = [
        { icon: MessageCircle, url: socials.whatsapp || "", name: "WhatsApp" },
        { icon: Instagram, url: socials.instagram || "", name: "Instagram" },
        { icon: Facebook, url: socials.facebook || "", name: "Facebook" },
        { icon: Youtube, url: socials.youtube || "", name: "YouTube" },
        { icon: VideoIcon, url: socials.tiktok || "", name: "TikTok" },
        { icon: Linkedin, url: socials.linkedin || "", name: "LinkedIn" },
        { icon: Twitter, url: socials.twitter || "", name: "X (Twitter)" },
        { icon: Mail, url: "", name: "Email" },
    ];

    const activeLinks = globalLinks.filter(link => link.url !== "");

    const proyectos = ["Residencial Montana", "Residencial Ventura", "Arkadia Club", "Montebello"];
    const legal = ["Privacidad", "Términos", "Transparencia", "Reclamaciones"];

    return (
        <>
            {/* Video Section */}
            <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl overflow-hidden glass-card max-w-4xl mx-auto border border-white/10 group flex flex-col items-center justify-center"
                        style={{ aspectRatio: '4/3' }}
                    >
                        <div className="absolute inset-0 bg-[url('/images/edificio-blis.webp')] bg-cover bg-center opacity-30 group-hover:opacity-20 transition-opacity duration-700" />
                        <div className="relative z-10 flex flex-col items-center p-8">
                            <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blis-red/20 border border-blis-red text-blis-red flex items-center justify-center mb-6 hover:scale-110 transition-transform backdrop-blur-md">
                                <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                            </button>
                            <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-widest text-white mb-2">Dentro de la <span className="text-blis-red">Fábrica</span></h3>
                            <p className="text-sm text-gray-400 tracking-wider">Conoce nuestro rigor metodológico</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-950 pt-16 pb-10 border-t border-white/10 relative overflow-hidden" id="footer">
                {/* Neon Red Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-blis-red/15 rounded-full blur-[150px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">

                    {/* ---- MOBILE LAYOUT ---- */}
                    <div className="block lg:hidden">
                        {/* Logo + Text centered */}
                        <div className="flex flex-col items-center text-center mb-10">
                            <img
                                src={logoVertical}
                                alt="Blis Corp"
                                className="h-36 w-auto object-contain drop-shadow-[0_0_20px_rgba(190,11,60,0.6)] mb-4"
                            />
                            <p className="text-gray-500 font-light text-sm max-w-xs mb-6">
                                {description}
                            </p>
                            {/* Social icons centered */}
                            <div className="flex flex-wrap gap-3 justify-center mb-8">
                                {activeLinks.map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}
                                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-blis-red hover:border-blis-red hover:bg-blis-red/10 transition-all">
                                        <link.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Proyectos + Legal: 2 columns */}
                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="text-center">
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Proyectos</h4>
                                <ul className="space-y-3 text-gray-500 font-light text-sm">
                                    {proyectos.map((item, i) => (
                                        <li key={i}><a href="#" className="hover:text-blis-red transition-colors">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="text-center">
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Legal</h4>
                                <ul className="space-y-3 text-gray-500 font-light text-sm">
                                    {legal.map((item, i) => (
                                        <li key={i}><a href="#" className="hover:text-blis-red transition-colors">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Acceso VIP — centered */}
                        <div className="flex flex-col items-center text-center mb-10">
                            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-3">Acceso VIP</h4>
                            <p className="text-gray-500 font-light text-sm mb-4 max-w-xs">
                                Únete a la lista de inversores selectos para recibir análisis de mercado y oportunidades antes del lanzamiento público.
                            </p>
                            <form className="flex flex-col gap-3 w-full max-w-xs" onSubmit={(e) => { e.preventDefault(); showToast("Suscripción exitosa.", "success"); }}>
                                <input
                                    type="email"
                                    placeholder="Tu correo corporativo"
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blis-red text-white transition-colors text-sm text-center"
                                    required
                                />
                                <button type="submit" className="px-4 py-3 bg-blis-red text-white uppercase text-xs font-bold tracking-widest rounded-lg hover:bg-blis-red/80 transition-colors shadow-[0_0_15px_rgba(190,11,60,0.3)]">
                                    Suscribirme
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ---- DESKTOP LAYOUT ---- */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-12 mb-16">
                        <div className="lg:col-span-4 flex flex-col items-start pr-4">
                            <img src={logoHorizontal} alt="Blis Corp Logo" className="h-32 sm:h-40 w-auto object-contain drop-shadow-[0_0_20px_rgba(190,11,60,0.6)] mb-6" />
                            <p className="text-gray-500 font-light mb-8 max-w-sm">
                                {description}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {activeLinks.map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}
                                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-blis-red hover:border-blis-red hover:bg-blis-red/10 transition-all shadow-[0_0_15px_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(190,11,60,0.6)]">
                                        <link.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Proyectos</h4>
                            <ul className="space-y-4 text-gray-500 font-light">
                                {proyectos.map((item, i) => (
                                    <li key={i}><a href="#" className="hover:text-blis-red transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:col-span-2">
                            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Legal</h4>
                            <ul className="space-y-4 text-gray-500 font-light">
                                {legal.map((item, i) => (
                                    <li key={i}><a href="#" className="hover:text-blis-red transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:col-span-4">
                            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Acceso VIP</h4>
                            <p className="text-gray-500 font-light mb-4">
                                Únete a la lista de inversores selectos para recibir análisis de mercado y oportunidades antes del lanzamiento público.
                            </p>
                            <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); showToast("Suscripción exitosa.", "success"); }}>
                                <input type="email" placeholder="Tu correo corporativo" className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blis-red text-white transition-colors" required />
                                <button type="submit" className="px-4 py-3 bg-blis-red text-white uppercase text-sm font-bold tracking-widest rounded-lg hover:bg-blis-red/80 transition-colors shadow-[0_0_15px_rgba(190,11,60,0.3)]">Suscribirme</button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-white/10 pt-8 flex flex-col items-center md:flex-row justify-between md:items-center gap-3 text-xs font-mono text-gray-600 uppercase tracking-widest">
                        <p className="text-center md:text-left">© {new Date().getFullYear()} Blis Corp. Todos los derechos reservados.</p>
                        <p className="text-center md:text-right flex items-center gap-2">
                            Diseñado con visión en
                            <span className="inline-flex items-center gap-1">🇪🇨 Ecuador</span>
                            <span className="text-white/20">·</span>
                            <span className="inline-flex items-center gap-1">🇵🇪 Perú</span>
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
