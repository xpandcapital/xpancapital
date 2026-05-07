import {
  Layout, Palette, Users, MapPin,
  MessageSquare, HelpCircle, Briefcase, DollarSign,
  TrendingUp, Calculator, FileText, Globe, Folder,
  Video, Star, Clock, Sparkles, Settings, Bell, Package,
  CheckCircle, ArrowLeft
} from "lucide-react";

export interface SectionConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export const LANDING_SECTIONS: SectionConfig[] = [
  { key: 'hero', label: 'Inicio', icon: <Layout className="w-4 h-4" /> },
  { key: 'about', label: 'Trayectoria', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'video', label: 'Nuestra Visión', icon: <Video className="w-4 h-4" /> },
  { key: 'process', label: 'Metodología', icon: <Briefcase className="w-4 h-4" /> },
  { key: 'operations', label: 'Backstage', icon: <Globe className="w-4 h-4" /> },
  { key: 'market', label: 'Mercado', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'calculator', label: 'Calculadora', icon: <Calculator className="w-4 h-4" /> },
  { key: 'map', label: 'Dominio Territorial', icon: <MapPin className="w-4 h-4" /> },
  { key: 'projects', label: 'Portafolio', icon: <Folder className="w-4 h-4" /> },
  { key: 'catalog', label: 'Tienda', icon: <FileText className="w-4 h-4" /> },
  { key: 'team', label: 'Equipo', icon: <Users className="w-4 h-4" /> },
  { key: 'testimonials', label: 'Testimonios', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
  { key: 'blog', label: 'Blog', icon: <FileText className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

export const THANKYOU_SECTIONS: SectionConfig[] = [
  { key: 'thankYouHero', label: 'Hero de Gracias', icon: <CheckCircle className="w-4 h-4" /> },
  { key: 'thankYouNextSteps', label: 'Próximos Pasos', icon: <ArrowLeft className="w-4 h-4" /> },
  { key: 'funnelCTA', label: 'CTA Final', icon: <Sparkles className="w-4 h-4" /> },
  { key: 'stats', label: 'Estadísticas', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

export const FUNNEL_SECTIONS: SectionConfig[] = [
  { key: 'funnelHero', label: 'Hero Principal', icon: <Layout className="w-4 h-4" /> },
  { key: 'funnelCountdown', label: 'Contador', icon: <Clock className="w-4 h-4" /> },
  { key: 'funnelVideo', label: 'Video', icon: <Video className="w-4 h-4" /> },
  { key: 'funnelBenefits', label: 'Beneficios', icon: <Star className="w-4 h-4" /> },
  { key: 'stats', label: 'Estadísticas', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'funnelTestimonials', label: 'Testimonios', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'funnelPricing', label: 'Precios', icon: <DollarSign className="w-4 h-4" /> },
  { key: 'funnelCTA', label: 'CTA Final', icon: <Sparkles className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

export const CAPTURE_SECTIONS: SectionConfig[] = [
  { key: 'captureHero', label: 'Hero con Formulario', icon: <Layout className="w-4 h-4" /> },
  { key: 'funnelVideo', label: 'Video', icon: <Video className="w-4 h-4" /> },
  { key: 'funnelBenefits', label: 'Beneficios', icon: <Star className="w-4 h-4" /> },
  { key: 'stats', label: 'Estadísticas', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'funnelTestimonials', label: 'Testimonios', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'content', label: 'Contenido', icon: <FileText className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

export const BLOG_SECTIONS: SectionConfig[] = [
  { key: 'blogHero', label: 'Hero de Blog', icon: <Layout className="w-4 h-4" /> },
  { key: 'blogPosts', label: 'Últimos Artículos', icon: <FileText className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

export const TIENDA_SECTIONS: SectionConfig[] = [
  { key: 'shopHero', label: 'Hero de Tienda', icon: <Layout className="w-4 h-4" /> },
  { key: 'shopCategories', label: 'Categorías', icon: <Folder className="w-4 h-4" /> },
  { key: 'shopSidebar', label: 'Sidebar (Filtros)', icon: <Layout className="w-4 h-4" /> },
  { key: 'shopProducts', label: 'Productos', icon: <Package className="w-4 h-4" /> },
  { key: 'shopUrgency', label: 'Barra de Urgencia', icon: <Clock className="w-4 h-4" /> },
  { key: 'shopNotifications', label: 'Notificaciones Live', icon: <Bell className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

export const SECTIONS_BY_TYPE: Record<string, SectionConfig[]> = {
  landing: LANDING_SECTIONS,
  thankyou: THANKYOU_SECTIONS,
  funnel: FUNNEL_SECTIONS,
  captura: CAPTURE_SECTIONS,
  blog: BLOG_SECTIONS,
  blog_post: BLOG_SECTIONS,
  tienda: TIENDA_SECTIONS,
  producto: LANDING_SECTIONS,
  curso: LANDING_SECTIONS,
  leccion: LANDING_SECTIONS,
  proyecto: LANDING_SECTIONS,
  checkout: LANDING_SECTIONS,
};

export const CONFIG_SECTION: SectionConfig = { key: 'config', label: 'Configuración', icon: <Settings className="w-4 h-4" /> };

export const ICON_OPTIONS_SPANISH: Record<string, string> = {
  'TrendingUp': 'Tendencia Al alza',
  'Shield': 'Escudo',
  'Users': 'Usuarios',
  'Clock': 'Reloj',
  'Zap': 'Rayo',
  'Award': 'Premio',
  'Star': 'Estrella',
  'Check': 'Check',
  'Mail': 'Email',
  'Phone': 'Teléfono',
  'Calendar': 'Calendario',
  'MapPin': 'Ubicación',
  'Building2': 'Edificio',
  'Target': 'Objetivo',
};

export const ICON_OPTIONS = Object.keys(ICON_OPTIONS_SPANISH);

export interface TemplateData {
  id: string;
  nombre: string;
  slug: string;
  tipo_contenido: string;
  estado: string;
  es_principal: boolean;
  secciones: Record<string, any>;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
  config?: {
    showHeader?: boolean;
    customHeader?: {
      enabled?: boolean;
      logo?: string;
      logoLink?: string;
      backgroundColor?: string;
      textColor?: string;
      links?: Array<{ text: string; href: string; external?: boolean }>;
      cta?: { text: string; href: string; style: 'primary' | 'secondary' };
    };
    showFooter?: boolean;
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
  };
}

export function getSectionsForType(tipo: string): SectionConfig[] {
  return SECTIONS_BY_TYPE[tipo] || LANDING_SECTIONS;
}
