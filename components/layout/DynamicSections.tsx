"use client";

import dynamic from "next/dynamic";
import { useLandingCMS } from "@/context/LandingCMSContext";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { VideoShowcase } from "@/components/sections/VideoShowcase";
import { InteractiveData } from "@/components/sections/InteractiveData";
import { Calculator } from "@/components/sections/Calculator";
import { Process } from "@/components/sections/Process";
import { Operations } from "@/components/sections/Operations";
import { ProjectMap } from "@/components/sections/ProjectMap";
import { Projects } from "@/components/sections/Projects";
import { Catalog } from "@/components/sections/Catalog";
import { Team } from "@/components/sections/Team";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { BlogPremium } from "@/components/sections/BlogPremium";
import { FooterSections } from "@/components/sections/Footer";
import { ConstructionLoader } from "@/components/ui/ConstructionLoader";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

import { ThankYouHero } from "@/components/sections/ThankYouHero";
import { ThankYouNextSteps } from "@/components/sections/ThankYouNextSteps";
import { FunnelHero } from "@/components/sections/FunnelHero";
import { FunnelBenefits } from "@/components/sections/FunnelBenefits";
import { FunnelCTA } from "@/components/sections/FunnelCTA";
import { FunnelVideo } from "@/components/sections/FunnelVideo";
import { FunnelTestimonials } from "@/components/sections/FunnelTestimonials";
import { FunnelPricing } from "@/components/sections/FunnelPricing";
import { FunnelCountdown } from "@/components/sections/FunnelCountdown";
import { CaptureHero } from "@/components/sections/CaptureHero";
import { ContentSection } from "@/components/sections/ContentSection";
import { StatsSection } from "@/components/sections/StatsSection";

// Shop Sections
import { ShopHeroSlider } from "@/components/tienda/ShopHeroSlider";
import { ProductCategorySlider } from "@/components/tienda/ProductCategorySlider";
import { ShopSidebar } from "@/components/tienda/ShopSidebar";
import { UrgencyTimer } from "@/components/tienda/UrgencyTimer";
import { LiveBuyerNotification } from "@/components/tienda/LiveBuyerNotification";
import { ProductGrid } from "@/components/tienda/ProductGrid";

// Blog Sections
import { BlogHero } from "@/components/sections/BlogHero";
import { BlogPosts } from "@/components/sections/BlogPosts";

interface SectionData {
  [key: string]: unknown;
}

const SECTION_COMPONENTS: Record<string, { 
component: React.ComponentType<{ data?: any }>; 
  id: string; 
  className?: string;
  needsData?: boolean;
}> = {
  hero: { component: Hero, id: "hero" },
  about: { component: About, id: "trayectoria", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center" },
  video: { component: VideoShowcase, id: "vision", className: "bg-black relative z-10" },
  process: { component: Process, id: "process", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center" },
  operations: { component: Operations, id: "operaciones", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center" },
  market: { component: InteractiveData, id: "insights", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center" },
  calculator: { component: Calculator, id: "calculadora", className: "scroll-mt-36 min-h-screen md:min-h-0 flex flex-col justify-center items-center bg-black relative z-10" },
  map: { component: ProjectMap, id: "mapa", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center" },
  projects: { component: Projects, id: "projects", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center items-center" },
  catalog: { component: Catalog, id: "catalog", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center" },
  team: { component: Team, id: "equipo", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center" },
  testimonials: { component: Testimonials, id: "testimonials", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center" },
  faq: { component: FAQ, id: "faq", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center" },
  blog: { component: BlogPremium, id: "blog", className: "scroll-mt-36 min-h-[70vh] md:min-h-0 flex flex-col justify-center" },
  footer: { component: FooterSections, id: "footer", className: "scroll-mt-36 bg-black relative z-10", needsData: true },
  
  thankyou: { component: ThankYouHero, id: "hero", needsData: true },
  thankYouHero: { component: ThankYouHero, id: "hero", needsData: true },
  thankYouNextSteps: { component: ThankYouNextSteps, id: "next-steps", needsData: true },
  
  funnel: { component: FunnelHero, id: "hero", needsData: true },
  funnelHero: { component: FunnelHero, id: "hero", needsData: true },
  funnelBenefits: { component: FunnelBenefits, id: "benefits", needsData: true },
  funnelCTA: { component: FunnelCTA, id: "cta", needsData: true },
  funnelVideo: { component: FunnelVideo, id: "video", needsData: true },
  funnelTestimonials: { component: FunnelTestimonials, id: "testimonials", needsData: true },
  funnelPricing: { component: FunnelPricing, id: "pricing", needsData: true },
  funnelCountdown: { component: FunnelCountdown, id: "countdown", needsData: true },
  
  capture: { component: CaptureHero, id: "hero", needsData: true },
  captureHero: { component: CaptureHero, id: "hero", needsData: true },
  
  content: { component: ContentSection, id: "content", needsData: true },
  contentSection: { component: ContentSection, id: "content", needsData: true },
  stats: { component: StatsSection, id: "stats", needsData: true },
  statsSection: { component: StatsSection, id: "stats", needsData: true },
  
  faqs: { component: FAQ, id: "faqs", needsData: true },

  // Shop Sections
  shopHero: { component: ShopHeroSlider, id: "shop-hero" },
  shopCategories: { component: ProductCategorySlider, id: "categories", needsData: true },
  shopSidebar: { component: ShopSidebar, id: "sidebar" },
  shopUrgency: { component: UrgencyTimer, id: "urgency" },
  shopNotifications: { component: LiveBuyerNotification, id: "notifications" },
  shopProducts: { component: ProductGrid, id: "products", needsData: true },

  // Blog Sections
  blogHero: { component: BlogHero, id: "blog-hero", needsData: true },
  blogPosts: { component: BlogPosts, id: "blog-posts", needsData: true },
};



const DEFAULT_ORDER_BY_TIPO: Record<string, string[]> = {
  landing: ["hero", "about", "video", "process", "operations", "market", "calculator", "map", "projects", "catalog", "team", "testimonials", "faq", "blog", "footer"],
  blog: ["blogHero", "blogPosts", "footer"],
  blog_post: ["blogHero", "content", "author", "related", "footer"],
  tienda: ["shopHero", "shopCategories", "shopProducts", "shopUrgency", "shopNotifications", "footer"],
  producto: ["hero", "gallery", "details", "related", "footer"],

  curso: ["hero", "modules", "instructor", "footer"],
  leccion: ["header", "video", "content", "resources", "footer"],
  proyecto: ["hero", "gallery", "details", "location", "contact", "footer"],
  funnel: ["funnelHero", "funnelVideo", "funnelBenefits", "stats", "funnelTestimonials", "funnelPricing", "funnelCountdown", "funnelCTA", "footer"],
  captura: ["captureHero", "funnelVideo", "funnelBenefits", "stats", "content", "footer"],
  checkout: ["hero", "summary", "payment", "security", "footer"],
  thankyou: ["thankYouHero", "thankYouNextSteps", "funnelCTA", "stats", "footer"],
  legal: ["legalHero", "legalArticles", "legalSidebar", "footer"]
};

interface DynamicSectionsProps {
  templateType?: string;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
  sections?: Record<string, SectionData>;
}

export function DynamicSections({ 
  templateType = "landing",
  sectionOrder: externalOrder,
  sectionVisibility: externalVisibility,
  sections: externalSections
}: DynamicSectionsProps) {
  const { loading, isSectionVisible: contextIsSectionVisible, sectionOrder: contextOrder, templateData } = useLandingCMS();

  const hasExternalData = !!(externalOrder && externalOrder.length > 0) || !!externalSections;

  // Solo mostrar skeleton si no hay datos externos (SSR) y el contexto aún está cargando
  if (loading && !hasExternalData) {
    return <ConstructionLoader />;
  }

  // Validate that the external order contains sections valid for this templateType
  const validSectionsForType = new Set(
    Object.keys(SECTION_COMPONENTS)
  );
  const defaultOrderForType = DEFAULT_ORDER_BY_TIPO[templateType] || DEFAULT_ORDER_BY_TIPO.landing;

  // If externalOrder exists but contains NONE of the valid sections for this type,
  // it means the template has a stale/wrong sectionOrder - fall back to defaults
  const externalOrderIsValid = externalOrder && externalOrder.length > 0 &&
    externalOrder.some(key => validSectionsForType.has(key)) &&
    // Make sure at least one section matches the expected type-specific sections
    externalOrder.some(key => defaultOrderForType.includes(key));

  const sectionOrder = (externalOrderIsValid ? externalOrder : null) ||
    (templateType === 'landing' ? contextOrder : null) ||
    defaultOrderForType;

  const checkVisibility = (sectionKey: string): boolean => {
    if (externalVisibility) {
      return externalVisibility[sectionKey] !== false;
    }
    if (templateType === 'landing') {
      return contextIsSectionVisible(sectionKey);
    }
    return true;
  };

  const getSectionDataFromProps = (sectionKey: string): SectionData | null => {
    if (externalSections) {
      return (externalSections[sectionKey] as SectionData) || null;
    }
    if (templateType === 'landing' && templateData?.secciones) {
      const section = templateData.secciones[sectionKey as keyof typeof templateData.secciones];
      return section ? (section as unknown as SectionData) : null;
    }
    return null;
  };

  return (
    <>
      {sectionOrder.map((sectionKey: string) => {
        if (!checkVisibility(sectionKey)) {
          return null;
        }

        const sectionConfig = SECTION_COMPONENTS[sectionKey];
        if (!sectionConfig) {
          return null;
        }

        const Component = sectionConfig.component;
        const sectionData = sectionConfig.needsData ? getSectionDataFromProps(sectionKey) : null;

        return (
          <section
            key={sectionKey}
            id={sectionConfig.id}
            className={sectionConfig.className}
          >
            {sectionConfig.needsData ? (
              <Component data={sectionData || {}} />
            ) : (
              <Component />
            )}
          </section>
        );
      })}
    </>
  );
}