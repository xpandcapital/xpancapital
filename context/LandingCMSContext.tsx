"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface HeroData {
    title1: string;
    title2: string;
    subtitle: string;
    description: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
    videoBackground: string;
}

interface AboutData {
    yearsExperience: string;
    yearsLabel: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
    title1?: string;
    title2?: string;
    missionTitle: string;
    missionText: string;
    videoUrl: string;
    videoThumbnail: string;
}

interface VideoData {
    title: string;
    subtitle: string;
    description?: string;
    embedUrl: string;
    thumbnail: string;
    viewsCount?: string;
}

interface BlogData {
    title: string;
    subtitle: string;
    description: string;
}

interface ProcessStep {
    title: string;
    description: string;
    icon: string;
    image: string;
}

interface ProcessData {
    title: string;
    subtitle: string;
    steps: ProcessStep[];
}

interface OperationsData {
    title: string;
    subtitle: string;
    sliderImages: string[];
    stats: { sales: string; urbanizations: string; clients: string; conferences: string };
}

interface MarketInsight {
    type: string;
    title: string;
    text: string;
}

interface MarketStat {
    title: string;
    value: string;
    desc: string;
    icon: string;
    color: string;
}

interface MarketData {
    title: string;
    subtitle1: string;
    subtitle2: string;
    description: string;
    insights: MarketInsight[];
    stats: MarketStat[];
}

interface CalculatorData {
    title: string;
    subtitle: string;
    description: string;
    planosRatio: string;
    preventaRatio: string;
    escrituraRatio: string;
    tirValue: string;
    planosLabel: string;
    preventaLabel: string;
    escrituraLabel: string;
    planosDesc: string;
    preventaDesc: string;
    escrituraDesc: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
}

interface MapLocation {
    name: string;
    fullName: string;
    city: string;
    province: string;
    coordinates: { top: string; left: string };
    status: string;
    dotColor: string;
}

interface MapData {
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: string;
    locations: MapLocation[];
}

interface CatalogData {
    title: string;
    subtitle: string;
    description?: string;
    btnText?: string;
    btnLink?: string;
}

interface ProjectsData {
    title: string;
    subtitle: string;
    description: string;
    btnText?: string;
    btnLink?: string;
}

interface TeamMember {
    name: string;
    role: string;
    image: string;
    socials: Record<string, string>;
}

interface TeamData {
    title: string;
    ceoName: string;
    ceoRole: string;
    ceoQuote: string;
    ceoDescription1: string;
    ceoDescription2: string;
    ceoImage: string;
    widget1Label?: string;
    widget1Value?: string;
    widget2Label?: string;
    widget2Value?: string;
    members: TeamMember[];
}

interface TestimonialItem {
    quote: string;
    author: string;
    role: string;
    image: string;
}

interface TestimonialsData {
    title: string;
    subtitle: string;
    items: TestimonialItem[];
}

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqData {
    title: string;
    subtitle?: string;
    satisfactionRate?: string;
    ctaText?: string;
    ctaLink?: string;
    items: FaqItem[];
}

interface FooterData {
    description: string;
    copyright: string;
    logoVertical: string;
    logoHorizontal: string;
    socials: Record<string, string>;
    vipTitle: string;
    vipDescription: string;
    vipPlaceholder: string;
    vipButtonText: string;
    projectsTitle: string;
    legalTitle: string;
    legalLinks: Array<{ text: string; href: string }>;
    locationText: string;
    showProjects: boolean;
    videoTitle: string;
    videoSubtitle: string;
    videoUrl: string;
    videoThumbnail: string;
}

interface CommercialData {
    country: string;
    currency: string;
    taxName: string;
    taxRate: number;
}

export interface LandingCMSData {hero: HeroData;
    about: AboutData;
    video: VideoData;
    process: ProcessData;
    operations: OperationsData;
    market: MarketData;
    calculator: CalculatorData;
    map: MapData;
    projects: CatalogData;
    catalog: CatalogData;
    team: TeamData;
    testimonials: TestimonialsData;
    faq: FaqData;
    blog: BlogData;
    footer: FooterData;
    commercial: CommercialData;
}

export interface TemplateData {
    id: string;
    nombre: string;
    slug: string;
    secciones: LandingCMSData;
    sectionOrder?: string[];
    sectionVisibility?: Record<string, boolean>;
    config?: {
        showHeader?: boolean;
        showFooter?: boolean;
        branding?: {
            name?: string;
            primaryColor?: string;
            secondaryColor?: string;
            backgroundColor?: string;
            textColor?: string;
            accentColor?: string;
            logoHorizontal?: string;
            logoVertical?: string;
            logoHorizontalLight?: string;
            logoVerticalLight?: string;
        };
        customHeader?: {
            enabled?: boolean;
            logo?: string;
            logoLink?: string;
            backgroundColor?: string;
            textColor?: string;
            links?: Array<{ text: string; href: string; external?: boolean }>;
            cta?: { text: string; href: string; style: 'primary' | 'secondary' };
        };
        customFooter?: {
            enabled?: boolean;
            logo?: string;
            description?: string;
            backgroundColor?: string;
            textColor?: string;
            links?: Array<{ label: string; href: string }>;
            socials?: {
                facebook?: string;
                instagram?: string;
                linkedin?: string;
                youtube?: string;
                tiktok?: string;
            };
            copyright?: string;
        };
    };
}

interface LandingCMSContextType {
    cmsData: LandingCMSData;
    templateData: TemplateData | null;
    siteConfig: {
        siteName: string;
        siteTagline: string;
        logoHorizontal: string;
        logoVertical: string;
        favicon: string;
        primaryColor: string;
        secondaryColor: string;
        socialInstagram: string;
        socialFacebook: string;
        socialYoutube: string;
        socialTiktok: string;
        socialLinkedin: string;
        socialWhatsapp: string;
        socialTwitter: string;
        footerDescription: string;
        footerCopyright: string;
        footerVipTitle: string;
        footerVipDescription: string;
        footerVipPlaceholder: string;
        footerVipButton: string;
        footerProjectsTitle: string;
        footerLegalTitle: string;
        footerLocationText: string;
        footerShowProjects: boolean;
        contactEmail: string;
        contactPhone: string;
        contactAddress: string;
    };
    sectionOrder: string[];
    sectionVisibility: Record<string, boolean>;
    updateCMSData: (newData: Partial<LandingCMSData>) => Promise<{ success: boolean; error?: string }>;
    updateSection: <T extends keyof LandingCMSData>(section: T, data: Partial<LandingCMSData[T]>) => Promise<{ success: boolean; error?: string }>;
    publishChanges: () => Promise<{ success: boolean; error?: string }>;
    isSectionVisible: (sectionKey: string) => boolean;
    loading: boolean;
}

const DEFAULT_CMS_DATA: LandingCMSData = {
    hero: {
        title1: "BLIS",
        title2: "CORP",
        subtitle: "",
        description: "",
        primaryBtnText: "",
        primaryBtnLink: "",
        secondaryBtnText: "",
        secondaryBtnLink: "",
        videoBackground: "",
    },
    about: {
        yearsExperience: "",
        yearsLabel: "",
        stat1Value: "",
        stat1Label: "",
        stat2Value: "",
        stat2Label: "",
        stat3Value: "",
        stat3Label: "",
        missionTitle: "",
        missionText: "",
        videoUrl: "",
        videoThumbnail: "",
    },
    video: {
        title: "",
        subtitle: "",
        embedUrl: "",
        thumbnail: "",
    },
    blog: {
        title: "",
        subtitle: "",
        description: "",
    },
    process: { title: "", subtitle: "", steps: [] },
    operations: {
        title: "",
        subtitle: "",
        sliderImages: [],
        stats: { sales: "", urbanizations: "", clients: "", conferences: "" }
    },
    market: { 
        title: "", 
        subtitle1: "", 
        subtitle2: "", 
        description: "", 
        insights: [], 
        stats: []
    },
    calculator: { 
        title: "", 
        subtitle: "", 
        description: "",
        planosRatio: "", 
        preventaRatio: "", 
        escrituraRatio: "", 
        tirValue: "",
        planosLabel: "",
        preventaLabel: "Preventa",
        escrituraLabel: "Escritura en Mano",
        planosDesc: "Máxima rentabilidad, mayor tiempo de espera hasta escritura.",
        preventaDesc: "Trazado visible, inicio de obras, excelente relación costo-beneficio.",
        escrituraDesc: "Saneamiento y permisos 100% listos. Entrega física inmediata.",
        primaryBtnText: "Ver Proyectos",
        primaryBtnLink: "/proyectos",
        secondaryBtnText: "",
        secondaryBtnLink: ""
    },
    map: { title: "", subtitle: "", description: "", locations: [], backgroundImage: "" },
    projects: { title: "", subtitle: "", description: "", btnText: "", btnLink: "" },
    catalog: { title: "", subtitle: "", btnText: "", btnLink: "" },
    team: { title: "", ceoName: "", ceoRole: "", ceoQuote: "", ceoDescription1: "", ceoDescription2: "", ceoImage: "", members: [] },
    testimonials: { 
        title: "", 
        subtitle: "", 
        items: [] 
    },
    faq: { 
        title: "", 
        subtitle: "",
        satisfactionRate: "",
        ctaText: "",
        ctaLink: "",
        items: [] 
    },
    footer: { 
        description: "", 
        copyright: "", 
        logoVertical: "", 
        logoHorizontal: "", 
        socials: {},
        vipTitle: "",
        vipDescription: "",
        vipPlaceholder: "",
        vipButtonText: "",
        projectsTitle: "",
        legalTitle: "",
        legalLinks: [],
        locationText: "",
        showProjects: true,
        videoTitle: "",
        videoSubtitle: "",
        videoUrl: "",
        videoThumbnail: ""
    },
    commercial: { country: "EC", currency: "USD", taxName: "IVA", taxRate: 15 }
};

const DEFAULT_SITE_CONFIG = {
    siteName: '',
    siteTagline: '',
    logoHorizontal: '',
    logoVertical: '',
    favicon: '/favicon.ico',
    primaryColor: '#B10D24',
    secondaryColor: '#10B981',
    socialInstagram: '',
    socialFacebook: '',
    socialYoutube: '',
    socialTiktok: '',
    socialLinkedin: '',
    socialWhatsapp: '',
    socialTwitter: '',
    footerDescription: '',
    footerCopyright: '',
    footerVipTitle: '',
    footerVipDescription: '',
    footerVipPlaceholder: '',
    footerVipButton: '',
    footerProjectsTitle: '',
    footerLegalTitle: '',
    footerLocationText: '',
    footerShowProjects: true,
    contactEmail: '',
    contactPhone: '',
    contactAddress: ''
};

const LandingCMSContext = createContext<LandingCMSContextType | undefined>(undefined);

const DEFAULT_SECTION_ORDER = [
    'hero', 'about', 'video', 'process', 'operations', 'market',
    'calculator', 'map', 'projects', 'catalog', 'team', 'testimonials',
    'faq', 'blog', 'footer'
];

export const LandingCMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cmsData, setCmsData] = useState<LandingCMSData>(DEFAULT_CMS_DATA);
    const [templateData, setTemplateData] = useState<TemplateData | null>(null);
    const [siteConfig, setSiteConfig] = useState(DEFAULT_SITE_CONFIG);
    const [loading, setLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        async function loadCMSData() {
            try {
                // Load site config
                const siteConfigRes = await fetch('/api/site-config');
                const siteConfigData = await siteConfigRes.json();
                if (siteConfigData.success && siteConfigData.data) {
                    setSiteConfig(prev => ({
                        ...prev,
                        siteName: siteConfigData.data.site_name || prev.siteName,
                        siteTagline: siteConfigData.data.site_tagline || prev.siteTagline,
                        logoHorizontal: siteConfigData.data.logo_horizontal || prev.logoHorizontal,
                        logoVertical: siteConfigData.data.logo_vertical || prev.logoVertical,
                        favicon: siteConfigData.data.favicon || prev.favicon,
                        primaryColor: siteConfigData.data.primary_color || prev.primaryColor,
                        secondaryColor: siteConfigData.data.secondary_color || prev.secondaryColor,
                        socialInstagram: siteConfigData.data.social_instagram || '',
                        socialFacebook: siteConfigData.data.social_facebook || '',
                        socialYoutube: siteConfigData.data.social_youtube || '',
                        socialTiktok: siteConfigData.data.social_tiktok || '',
                        socialLinkedin: siteConfigData.data.social_linkedin || '',
                        socialWhatsapp: siteConfigData.data.social_whatsapp || '',
                        socialTwitter: siteConfigData.data.social_twitter || '',
                        footerDescription: siteConfigData.data.footer_description || prev.footerDescription,
                        footerCopyright: siteConfigData.data.footer_copyright || prev.footerCopyright,
                        footerVipTitle: siteConfigData.data.footer_vip_title || prev.footerVipTitle,
                        footerVipDescription: siteConfigData.data.footer_vip_description || prev.footerVipDescription,
                        footerVipPlaceholder: siteConfigData.data.footer_vip_placeholder || prev.footerVipPlaceholder,
                        footerVipButton: siteConfigData.data.footer_vip_button || prev.footerVipButton,
                        footerProjectsTitle: siteConfigData.data.footer_projects_title || prev.footerProjectsTitle,
                        footerLegalTitle: siteConfigData.data.footer_legal_title || prev.footerLegalTitle,
                        footerLocationText: siteConfigData.data.footer_location_text || prev.footerLocationText,
                        footerShowProjects: siteConfigData.data.footer_show_projects ?? prev.footerShowProjects,
                        contactEmail: siteConfigData.data.contact_email || '',
                        contactPhone: siteConfigData.data.contact_phone || '',
                        contactAddress: siteConfigData.data.contact_address || ''
                    }));
                }

                const response = await fetch('/api/cms/landing');
                const result = await response.json();
                
                if (result.success && result.data) {
                    setCmsData(prev => {
                        const merged = { ...prev };
                        for (const key in result.data) {
                            const sectionKey = key as keyof LandingCMSData;
                            const newValue = result.data[sectionKey as keyof typeof result.data];
                            if (newValue && typeof newValue === 'object' && !Array.isArray(newValue)) {
                                (merged as Record<string, unknown>)[sectionKey] = { ...prev[sectionKey], ...newValue };
                            } else {
                                (merged as Record<string, unknown>)[sectionKey] = newValue;
                            }
                        }
                        return merged;
                    });
                }
                
                const templateResponse = await fetch('/api/templates/landing');
                const templateResult = await templateResponse.json();
                
                if (templateResult.success && templateResult.data) {
                    setTemplateData(templateResult.data);
                    if (templateResult.data.secciones) {
                        setCmsData(prev => {
                            const merged = { ...prev };
                            for (const key in templateResult.data.secciones) {
                                const sectionKey = key as keyof LandingCMSData;
                                const newValue = templateResult.data.secciones[sectionKey as keyof typeof templateResult.data.secciones];
                                if (newValue && typeof newValue === 'object' && !Array.isArray(newValue)) {
                                    (merged as Record<string, unknown>)[sectionKey] = { ...prev[sectionKey], ...newValue };
                                } else {
                                    (merged as Record<string, unknown>)[sectionKey] = newValue;
                                }
                            }
                            return merged;
                        });
                    }
                } else {
                    const saved = localStorage.getItem("blis_cms_data");
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        setCmsData(prev => ({ ...prev, ...parsed }));
                    }
                }
            } catch {
                const saved = localStorage.getItem("blis_cms_data");
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        setCmsData(prev => ({ ...prev, ...parsed }));
                    } catch {
                        console.warn("Could not parse saved CMS data");
                    }
                }
            } finally {
                setLoading(false);
            }
        }
        
        loadCMSData();
    }, []);

    const isSectionVisible = useCallback((sectionKey: string): boolean => {
        if (!templateData?.sectionVisibility) return true;
        return templateData.sectionVisibility[sectionKey] !== false;
    }, [templateData]);

    const sectionOrder = templateData?.sectionOrder || DEFAULT_SECTION_ORDER;
    const sectionVisibility = templateData?.sectionVisibility || {};

    const updateCMSData = useCallback(async (newData: Partial<LandingCMSData>) => {
        setCmsData(prev => {
            const updated = { ...prev, ...newData };
            localStorage.setItem("blis_cms_data", JSON.stringify(updated));
            return updated;
        });
        setHasUnsavedChanges(true);
        return { success: true };
    }, []);

    const updateSection = useCallback(async <T extends keyof LandingCMSData>(section: T, sectionData: Partial<LandingCMSData[T]>) => {
        setCmsData(prev => {
            const updated = {
                ...prev,
                [section]: { ...prev[section], ...sectionData }
            };
            localStorage.setItem("blis_cms_data", JSON.stringify(updated));
            return updated;
        });
        setHasUnsavedChanges(true);
        return { success: true };
    }, []);

    const publishChanges = useCallback(async () => {
        try {
            const response = await fetch('/api/cms/landing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secciones: cmsData })
            });

            const result = await response.json();

            if (!result.success) {
                return { success: false, error: result.error || 'Error al guardar' };
            }

            localStorage.setItem("blis_landing_cms", JSON.stringify(cmsData));
            localStorage.setItem("blis_store_country", cmsData.commercial.country);
            localStorage.setItem("blis_store_currency", cmsData.commercial.currency);
            localStorage.setItem("blis_store_tax_name", cmsData.commercial.taxName);
            localStorage.setItem("blis_store_tax_rate", cmsData.commercial.taxRate.toString());
            
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event("cms_updated"));
            }

            setHasUnsavedChanges(false);
            return { success: true };
        } catch {
            return { success: false, error: 'Error de conexión' };
        }
    }, [cmsData]);

    return (
        <LandingCMSContext.Provider value={{ 
            cmsData, 
            templateData,
            siteConfig,
            sectionOrder,
            sectionVisibility,
            updateCMSData, 
            updateSection, 
            publishChanges, 
            isSectionVisible,
            loading 
        }}>
            {children}
        </LandingCMSContext.Provider>
    );
};

export const useLandingCMS = () => {
    const context = useContext(LandingCMSContext);
    if (!context) {
        throw new Error("useLandingCMS must be used within a LandingCMSProvider");
    }
    return context;
};