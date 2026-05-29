"use client";

import { motion, type Variants } from "framer-motion";
import { Mail, Phone, MapPin, PlayCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useLandingCMS } from "@/context/LandingCMSContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { extractVideoUrl } from "@/lib/utils/video";

interface Project {
    id: string;
    name: string;
}

const formFieldVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const formContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
};

export function FooterSections() {
    const { cmsData, templateData, siteConfig } = useLandingCMS();
    const { showToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVipSubmitting, setIsVipSubmitting] = useState(false);
    
    const footerVideo = {
        title: cmsData?.footer?.videoTitle || "Dentro de la Fábrica",
        subtitle: cmsData?.footer?.videoSubtitle || "Conoce nuestro rigor metodológico",
        url: cmsData?.footer?.videoUrl || "",
        thumbnail: cmsData?.footer?.videoThumbnail || undefined
    };
    
    const socials = {
        whatsapp: siteConfig?.socialWhatsapp || cmsData?.footer?.socials?.whatsapp || "",
        instagram: siteConfig?.socialInstagram || cmsData?.footer?.socials?.instagram || "",
        facebook: siteConfig?.socialFacebook || cmsData?.footer?.socials?.facebook || "",
        youtube: siteConfig?.socialYoutube || cmsData?.footer?.socials?.youtube || "",
        tiktok: siteConfig?.socialTiktok || cmsData?.footer?.socials?.tiktok || "",
        linkedin: siteConfig?.socialLinkedin || cmsData?.footer?.socials?.linkedin || "",
        twitter: siteConfig?.socialTwitter || cmsData?.footer?.socials?.twitter || "",
    };
    
    const footer = cmsData?.footer || {};
    const description = siteConfig?.footerDescription || footer.description || "Liderando la transformación digital.";
    const copyright = siteConfig?.footerCopyright || footer.copyright || "© 2026 BLIS Corp. Todos los derechos reservados.";
    const vipTitle = siteConfig?.footerVipTitle || footer.vipTitle || "Acceso VIP";
    const vipDescription = siteConfig?.footerVipDescription || footer.vipDescription || "Únete a la lista de inversores selectos para recibir análisis de mercado y oportunidades antes del lanzamiento público.";
    const vipPlaceholder = siteConfig?.footerVipPlaceholder || footer.vipPlaceholder || "Tu correo corporativo";
    const vipButtonText = siteConfig?.footerVipButton || footer.vipButtonText || "Suscribirme";
    const projectsTitle = siteConfig?.footerProjectsTitle || footer.projectsTitle || "Proyectos";
    const legalTitle = siteConfig?.footerLegalTitle || footer.legalTitle || "Legal";
    const legalLinks = (footer.legalLinks && footer.legalLinks.length > 0) ? footer.legalLinks : [
        { text: "Términos", href: "/legal/terminos" },
        { text: "Privacidad", href: "/legal/privacidad" },
        { text: "Reembolsos", href: "/legal/reembolsos" },
        { text: "Cookies", href: "/legal/cookies" },
        { text: "Aviso Legal", href: "/legal/aviso" },
        { text: "Reclamaciones", href: "/legal/reclamaciones" }
    ];

    const navLinks = [
        { text: "Inicio", href: "/" },
        { text: "Tienda", href: "/tienda" },
        { text: "Blog", href: "/blog" },
        { text: "Proyectos", href: "/#projects" },
        { text: "Academia", href: "/tienda#cursos" },
    ];

    const sitemapSections = [
        {
            title: "Explorar",
            links: [
                { text: "Tienda", href: "/tienda" },
                { text: "Cursos", href: "/tienda#cursos" },
                { text: "Ebooks", href: "/tienda#ebooks" },
                { text: "Kits", href: "/tienda#kits" },
                { text: "Mentoría", href: "/tienda#mentoria" },
            ]
        },
        {
            title: "Empresa",
            links: [
                { text: "Nosotros", href: "/#about" },
                { text: "Proyectos", href: "/#projects" },
                { text: "Blog", href: "/blog" },
                { text: "Contacto", href: "/legal/reclamaciones" },
            ]
        },
    ];
    const locationText = siteConfig?.footerLocationText || footer.locationText || "Diseñado con visión en 🇪🇨 Ecuador · 🇵🇪 Perú";
    const showProjects = siteConfig?.footerShowProjects ?? (footer.showProjects !== false);
    
    const logoVertical = siteConfig?.logoVertical || templateData?.config?.branding?.logoVertical || footer.logoVertical;
    const logoHorizontal = siteConfig?.logoHorizontal || templateData?.config?.branding?.logoHorizontal || footer.logoHorizontal;

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

    const brandIcon = (name: string) => `/icons/brands/${name}.svg`

    const globalLinks = [
        { iconUrl: brandIcon('whatsapp'), url: socials.whatsapp, name: "WhatsApp" },
        { iconUrl: brandIcon('instagram'), url: socials.instagram, name: "Instagram" },
        { iconUrl: brandIcon('facebook'), url: socials.facebook, name: "Facebook" },
        { iconUrl: brandIcon('youtube'), url: socials.youtube, name: "YouTube" },
        { iconUrl: brandIcon('tiktok'), url: socials.tiktok, name: "TikTok", isLight: true },
        { iconUrl: brandIcon('linkedin'), url: socials.linkedin, name: "LinkedIn" },
        { iconUrl: brandIcon('x'), url: socials.twitter, name: "X (Twitter)" },
    ];

    const activeLinks = globalLinks.filter(link => link.url !== "" && link.url !== "#");
    
    const contactInfo = {
        email: siteConfig?.contactEmail || "",
        phone: siteConfig?.contactPhone || "",
        address: siteConfig?.contactAddress || ""
    };

    const handleVipSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsVipSubmitting(true);
        setTimeout(() => {
            setIsVipSubmitting(false);
            showToast("Suscripción exitosa.", "success");
        }, 1200);
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
                                {footerVideo.thumbnail && (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-20 transition-opacity duration-700"
                                        style={{ backgroundImage: `url('${footerVideo.thumbnail}')` }}
                                    />
                                )}
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
                            {logoVertical ? (
                                <img
                                    src={logoVertical}
                                    alt="Logo"
                                    className="h-36 w-auto object-contain drop-shadow-[0_0_20px_rgba(190,11,60,0.6)] mb-4"
                                />
                            ) : (
                                <span className="text-2xl font-black text-white tracking-wider mb-4">BLIS CORP</span>
                            )}
                            <p className="text-gray-500 font-light text-sm max-w-xs mb-4">{description}</p>

                            <div className="flex flex-wrap gap-3 justify-center mb-6">
                                {navLinks.map((link, i) => (
                                    <a key={i} href={link.href} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-blis-red transition-colors">
                                        {link.text}
                                    </a>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center mb-8">
                                {activeLinks.map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}
                                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-blis-red hover:border-blis-red hover:bg-blis-red/10 transition-all">
                                        <img src={link.iconUrl} alt={link.name} className="w-4 h-4 brightness-0 invert opacity-60 group-hover:opacity-100" style={{ filter: 'brightness(0) invert(1)' }} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-10">
                            {sitemapSections.map((section, si) => (
                                <div key={si} className="text-center">
                                    <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">{section.title}</h4>
                                    <ul className="space-y-3 text-gray-500 font-light text-sm">
                                        {section.links.map((link, li) => (
                                            <li key={li}><a href={link.href} className="hover:text-blis-red transition-colors">{link.text}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            <div className="text-center">
                                <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">{legalTitle}</h4>
                                <ul className="space-y-3 text-gray-500 font-light text-sm">
                                    {legalLinks.map((link, i) => (
                                        <li key={i}><a href={link.href} className="hover:text-blis-red transition-colors">{link.text}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Formulario VIP — campos secuenciales */}
                        <motion.div
                            variants={formContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center mb-10"
                        >
                            <motion.h4 variants={formFieldVariants} className="text-white font-bold uppercase tracking-widest text-xs mb-3">{vipTitle}</motion.h4>
                            <motion.p variants={formFieldVariants} className="text-gray-500 font-light text-sm mb-4 max-w-xs">{vipDescription}</motion.p>
                            <form className="flex flex-col gap-3 w-full max-w-xs" onSubmit={handleVipSubmit}>
                                <motion.input
                                    variants={formFieldVariants}
                                    type="email"
                                    placeholder={vipPlaceholder}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blis-red text-white transition-colors text-sm text-center"
                                    required
                                />
                                <motion.button
                                    variants={formFieldVariants}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={isVipSubmitting}
                                    className="px-4 py-3 bg-blis-red text-white uppercase text-xs font-bold tracking-widest rounded-lg hover:bg-blis-red/80 transition-colors shadow-[0_0_15px_rgba(190,11,60,0.3)] disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {isVipSubmitting ? (
                                        <>
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            Enviando...
                                        </>
                                    ) : vipButtonText}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>

                    {/* ---- DESKTOP LAYOUT ---- */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-8 mb-16">
                        <div className="lg:col-span-3 flex flex-col items-start">
                            {logoHorizontal ? (
                                <img src={logoHorizontal} alt="Logo" className="h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(190,11,60,0.6)] mb-4" />
                            ) : (
                                <span className="text-xl font-black text-white tracking-wider mb-4">BLIS CORP</span>
                            )}
                            <p className="text-gray-500 font-light text-xs leading-relaxed mb-5 max-w-[220px]">{description}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5">
                                {navLinks.map((link, i) => (
                                    <a key={i} href={link.href} className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-blis-red transition-colors">
                                        {link.text}
                                    </a>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {activeLinks.map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}
                                        className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gray-500 hover:text-blis-red hover:border-blis-red/50 hover:bg-blis-red/10 transition-all">
                                        <img src={link.iconUrl} alt={link.name} className="w-3.5 h-3.5" style={{ filter: 'brightness(0) invert(1)' }} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {sitemapSections.map((section, si) => (
                            <div key={si} className="lg:col-span-2">
                                <h4 className="text-white font-bold uppercase tracking-[0.15em] text-[10px] mb-5 flex items-center gap-2">
                                    <span className="w-1 h-4 rounded-full bg-blis-red/60" />
                                    {section.title}
                                </h4>
                                <ul className="space-y-3 text-gray-500 font-light text-xs">
                                    {section.links.map((link, li) => (
                                        <li key={li}>
                                            <a href={link.href} className="hover:text-blis-red transition-colors flex items-center gap-2 group">
                                                <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-blis-red transition-colors" />
                                                {link.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div className="lg:col-span-2">
                            <h4 className="text-white font-bold uppercase tracking-[0.15em] text-[10px] mb-5 flex items-center gap-2">
                                <span className="w-1 h-4 rounded-full bg-amber-500/60" />
                                {legalTitle}
                            </h4>
                            <ul className="space-y-3 text-gray-500 font-light text-xs">
                                {legalLinks.map((link, i) => (
                                    <li key={i}>
                                        <a href={link.href} className="hover:text-blis-red transition-colors flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-blis-red transition-colors" />
                                            {link.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* VIP form — campos secuenciales desktop */}
                        <motion.div
                            variants={formContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="lg:col-span-3"
                        >
                            <motion.h4 variants={formFieldVariants} className="text-white font-bold uppercase tracking-[0.15em] text-[10px] mb-5 flex items-center gap-2">
                                <span className="w-1 h-4 rounded-full bg-emerald-500/60" />
                                {vipTitle}
                            </motion.h4>
                            <motion.p variants={formFieldVariants} className="text-gray-500 font-light text-xs leading-relaxed mb-4">{vipDescription}</motion.p>
                            <form className="flex gap-2" onSubmit={handleVipSubmit}>
                                <motion.input
                                    variants={formFieldVariants}
                                    type="email"
                                    placeholder={vipPlaceholder}
                                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blis-red text-white text-xs transition-colors"
                                    required
                                />
                                <motion.button
                                    variants={formFieldVariants}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={isVipSubmitting}
                                    className="px-5 py-2.5 bg-blis-red text-white uppercase text-[10px] font-bold tracking-widest rounded-xl hover:bg-blis-red/80 transition-colors shadow-[0_0_15px_rgba(190,11,60,0.3)] whitespace-nowrap disabled:opacity-60 flex items-center gap-2"
                                >
                                    {isVipSubmitting ? (
                                        <>
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            ...
                                        </>
                                    ) : vipButtonText}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col items-center md:flex-row justify-between md:items-center gap-3 text-xs font-mono text-gray-600 uppercase tracking-widest">
                        <p className="text-center md:text-left">{copyright}</p>
                        <p className="text-center md:text-right" dangerouslySetInnerHTML={{ __html: locationText }} />
                    </div>
                    
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
