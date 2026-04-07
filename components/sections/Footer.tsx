"use client";

import { motion } from "framer-motion";
import { Facebook, Instagram, Linkedin, Twitter, PlayCircle, Youtube, MessageCircle, Mail, Phone, MapPin, Video as VideoIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useLandingCMS } from "@/context/LandingCMSContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { extractVideoUrl } from "@/lib/utils/video";

interface Project {
    id: string;
    name: string;
}

export function FooterSections() {
    const { cmsData, templateData, siteConfig } = useLandingCMS();
    const { showToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    
    // Footer video content
    const footerVideo = {
        title: cmsData?.footer?.videoTitle || "Dentro de la Fábrica",
        subtitle: cmsData?.footer?.videoSubtitle || "Conoce nuestro rigor metodológico",
        url: cmsData?.footer?.videoUrl || "",
        thumbnail: cmsData?.footer?.videoThumbnail || "/images/edificio-blis.webp"
    };
    
    // Use siteConfig for socials, with fallbacks
    const socials = {
        whatsapp: siteConfig?.socialWhatsapp || cmsData?.footer?.socials?.whatsapp || "",
        instagram: siteConfig?.socialInstagram || cmsData?.footer?.socials?.instagram || "",
        facebook: siteConfig?.socialFacebook || cmsData?.footer?.socials?.facebook || "",
        youtube: siteConfig?.socialYoutube || cmsData?.footer?.socials?.youtube || "",
        tiktok: siteConfig?.socialTiktok || cmsData?.footer?.socials?.tiktok || "",
        linkedin: siteConfig?.socialLinkedin || cmsData?.footer?.socials?.linkedin || "",
        twitter: siteConfig?.socialTwitter || cmsData?.footer?.socials?.twitter || "",
    };
    
    // Footer content from siteConfig with cmsData fallbacks
    const footer = cmsData?.footer || {};
    const description = siteConfig?.footerDescription || footer.description || "Liderando la transformación digital.";
    const copyright = siteConfig?.footerCopyright || footer.copyright || "© 2026 BLIS Corp. Todos los derechos reservados.";
    const vipTitle = siteConfig?.footerVipTitle || footer.vipTitle || "Acceso VIP";
    const vipDescription = siteConfig?.footerVipDescription || footer.vipDescription || "Únete a la lista de inversores selectos para recibir análisis de mercado y oportunidades antes del lanzamiento público.";
    const vipPlaceholder = siteConfig?.footerVipPlaceholder || footer.vipPlaceholder || "Tu correo corporativo";
    const vipButtonText = siteConfig?.footerVipButton || footer.vipButtonText || "Suscribirme";
    const projectsTitle = siteConfig?.footerProjectsTitle || footer.projectsTitle || "Proyectos";
    const legalTitle = siteConfig?.footerLegalTitle || footer.legalTitle || "Legal";
    const legalLinks = footer.legalLinks || [
        { text: "Privacidad", href: "/privacidad" },
        { text: "Términos", href: "/terminos" },
        { text: "Transparencia", href: "/transparencia" },
        { text: "Reclamaciones", href: "/reclamaciones" }
    ];
    const locationText = siteConfig?.footerLocationText || footer.locationText || "Diseñado con visión en 🇪🇨 Ecuador · 🇵🇪 Perú";
    const showProjects = siteConfig?.footerShowProjects ?? (footer.showProjects !== false);
    
    const logoVertical = siteConfig?.logoVertical || templateData?.config?.branding?.logoVertical || footer.logoVertical || "/images/logo-blis-vertical.png";
    const logoHorizontal = siteConfig?.logoHorizontal || templateData?.config?.branding?.logoHorizontal || footer.logoHorizontal || "/images/blis-logo.png";

    // Fetch projects from database
    useEffect(() => {
        if (showProjects) {
            async function fetchProjects() {
                try {
                    const { data, error } = await supabase
                        .from('projects')
                        .select('id, name')
                        .eq('is_active', true)
                        .order('order_index', { ascending: true, nullsFirst: false });
                    
                    if (!error && data) {
                        setProjects(data);
                    }
                } catch (err) {
                    console.error('Error loading projects:', err);
                }
            }
            fetchProjects();
        }
    }, [showProjects]);

    const globalLinks = [
        { icon: MessageCircle, url: socials.whatsapp, name: "WhatsApp" },
        { icon: Instagram, url: socials.instagram, name: "Instagram" },
        { icon: Facebook, url: socials.facebook, name: "Facebook" },
        { icon: Youtube, url: socials.youtube, name: "YouTube" },
        { icon: VideoIcon, url: socials.tiktok, name: "TikTok" },
        { icon: Linkedin, url: socials.linkedin, name: "LinkedIn" },
        { icon: Twitter, url: socials.twitter, name: "X (Twitter)" },
    ];

    const activeLinks = globalLinks.filter(link => link.url !== "" && link.url !== "#");
    
    // Contact info from siteConfig
    const contactInfo = {
        email: siteConfig?.contactEmail || "",
        phone: siteConfig?.contactPhone || "",
        address: siteConfig?.contactAddress || ""
    };

    return (
        <>
            {/* Video Section */}
            <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl overflow-hidden glass-card max-w-4xl mx-auto border border-white/10 group"
                        style={{ aspectRatio: '4/3' }}
                    >
                        {isVideoPlaying && footerVideo.url ? (
                            <iframe
                                src={extractVideoUrl(footerVideo.url)}
                                className="absolute inset-0 w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                        ) : (
                            <>
                                <div 
                                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-20 transition-opacity duration-700"
                                    style={{ backgroundImage: `url('${footerVideo.thumbnail}')` }}
                                />
                                <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
                                    <button 
                                        onClick={() => extractVideoUrl(footerVideo.url) && setIsVideoPlaying(true)}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blis-red/20 border border-blis-red text-blis-red flex items-center justify-center mb-6 hover:scale-110 transition-transform backdrop-blur-md cursor-pointer"
                                    >
                                        <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                                    </button>
                                    <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-widest text-white mb-2">
                                        Dentro de la <span className="text-blis-red">{footerVideo.title.replace('Dentro de la ', '')}</span>
                                    </h3>
                                    <p className="text-sm text-gray-400 tracking-wider">{footerVideo.subtitle}</p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-950 pt-16 pb-10 border-t border-white/10 relative overflow-hidden" id="footer">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-blis-red/15 rounded-full blur-[150px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">

                    {/* ---- MOBILE LAYOUT ---- */}
                    <div className="block lg:hidden">
                        <div className="flex flex-col items-center text-center mb-10">
                            <img
                                src={logoVertical}
                                alt="Logo"
                                className="h-36 w-auto object-contain drop-shadow-[0_0_20px_rgba(190,11,60,0.6)] mb-4"
                            />
                            <p className="text-gray-500 font-light text-sm max-w-xs mb-6">{description}</p>
                            <div className="flex flex-wrap gap-3 justify-center mb-8">
                                {activeLinks.map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}
                                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-blis-red hover:border-blis-red hover:bg-blis-red/10 transition-all">
                                        <link.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-10">
                            {showProjects && projects.length > 0 && (
                                <div className="text-center">
                                    <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4">{projectsTitle}</h4>
                                    <ul className="space-y-3 text-gray-500 font-light text-sm">
                                        {projects.slice(0, 6).map((project) => (
                                            <li key={project.id}>
                                                <a href={`/proyectos/${project.id}`} className="hover:text-blis-red transition-colors">
                                                    {project.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="text-center">
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4">{legalTitle}</h4>
                                <ul className="space-y-3 text-gray-500 font-light text-sm">
                                    {legalLinks.map((link, i) => (
                                        <li key={i}><a href={link.href} className="hover:text-blis-red transition-colors">{link.text}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col items-center text-center mb-10">
                            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-3">{vipTitle}</h4>
                            <p className="text-gray-500 font-light text-sm mb-4 max-w-xs">{vipDescription}</p>
                            <form className="flex flex-col gap-3 w-full max-w-xs" onSubmit={(e) => { e.preventDefault(); showToast("Suscripción exitosa.", "success"); }}>
                                <input
                                    type="email"
                                    placeholder={vipPlaceholder}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blis-red text-white transition-colors text-sm text-center"
                                    required
                                />
                                <button type="submit" className="px-4 py-3 bg-blis-red text-white uppercase text-xs font-bold tracking-widest rounded-lg hover:bg-blis-red/80 transition-colors shadow-[0_0_15px_rgba(190,11,60,0.3)]">
                                    {vipButtonText}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ---- DESKTOP LAYOUT ---- */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-12 mb-16">
                        <div className="lg:col-span-4 flex flex-col items-start pr-4">
                            <img src={logoHorizontal} alt="Logo" className="h-32 sm:h-40 w-auto object-contain drop-shadow-[0_0_20px_rgba(190,11,60,0.6)] mb-6" />
                            <p className="text-gray-500 font-light mb-8 max-w-sm">{description}</p>
                            <div className="flex flex-wrap gap-3">
                                {activeLinks.map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}
                                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-blis-red hover:border-blis-red hover:bg-blis-red/10 transition-all shadow-[0_0_15px_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(190,11,60,0.6)]">
                                        <link.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>
                        
                        {showProjects && projects.length > 0 && (
                            <div className="lg:col-span-2">
                                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">{projectsTitle}</h4>
                                <ul className="space-y-4 text-gray-500 font-light">
                                    {projects.slice(0, 8).map((project) => (
                                        <li key={project.id}>
                                            <a href={`/proyectos/${project.id}`} className="hover:text-blis-red transition-colors">
                                                {project.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div className="lg:col-span-2">
                            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">{legalTitle}</h4>
                            <ul className="space-y-4 text-gray-500 font-light">
                                {legalLinks.map((link, i) => (
                                    <li key={i}><a href={link.href} className="hover:text-blis-red transition-colors">{link.text}</a></li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="lg:col-span-4">
                            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">{vipTitle}</h4>
                            <p className="text-gray-500 font-light mb-4">{vipDescription}</p>
                            <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); showToast("Suscripción exitosa.", "success"); }}>
                                <input type="email" placeholder={vipPlaceholder} className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blis-red text-white transition-colors" required />
                                <button type="submit" className="px-4 py-3 bg-blis-red text-white uppercase text-sm font-bold tracking-widest rounded-lg hover:bg-blis-red/80 transition-colors shadow-[0_0_15px_rgba(190,11,60,0.3)]">{vipButtonText}</button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-white/10 pt-8 flex flex-col items-center md:flex-row justify-between md:items-center gap-3 text-xs font-mono text-gray-600 uppercase tracking-widest">
                        <p className="text-center md:text-left">{copyright}</p>
                        <p className="text-center md:text-right" dangerouslySetInnerHTML={{ __html: locationText }} />
                    </div>
                    
                    {/* Contact Info */}
                    {(contactInfo.email || contactInfo.phone || contactInfo.address) && (
                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
                            {contactInfo.email && (
                                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                    <Mail className="w-3 h-3" />
                                    {contactInfo.email}
                                </a>
                            )}
                            {contactInfo.phone && (
                                <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                    <Phone className="w-3 h-3" />
                                    {contactInfo.phone}
                                </a>
                            )}
                            {contactInfo.address && (
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    {contactInfo.address}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </footer>
        </>
    );
}