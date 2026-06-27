"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layout, FileText, ShoppingBag, Package, GraduationCap, BookOpen,
  Building2, Funnel, Target, CreditCard, CheckCircle, Scale,
  MoreVertical, Edit2, Copy, Trash2, Star, Globe, EyeOff,
  Check, ExternalLink
} from "lucide-react";
import { Template, TipoContenido, ESTADOS } from "@/lib/hooks/useTemplates";

interface TemplateCardProps {
  template: Template;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string, esPrincipal: boolean) => void;
  onDeactivate: (id: string) => void;
  onSetPrincipal: (id: string) => void;
}

const TIPO_ICONS: Record<TipoContenido, React.ComponentType<{ className?: string }>> = {
  landing: Layout,
  blog: FileText,
  blog_post: FileText,
  tienda: ShoppingBag,
  producto: Package,
  curso: GraduationCap,
  leccion: BookOpen,
  proyecto: Building2,
  funnel: Funnel,
  captura: Target,
  checkout: CreditCard,
  thankyou: CheckCircle,
  legal: Scale
};

const TIPO_LABELS: Record<TipoContenido, string> = {
  landing: "Landing",
  legal: "Legal",
  blog: "Blog",
  blog_post: "Post",
  tienda: "Tienda",
  producto: "Producto",
  curso: "Curso",
  leccion: "Lección",
  proyecto: "Proyecto",
  funnel: "Funnel",
  captura: "Captura",
  checkout: "Checkout",
  thankyou: "Thank You"
};

const MOCKUP_IMAGES: Record<TipoContenido, string> = {
  landing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  blog: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
  blog_post: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
  tienda: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
  producto: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
  curso: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80",
  leccion: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80",
  proyecto: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  funnel: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  captura: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
  checkout: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&q=80",
  legal: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
  thankyou: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80"
};

export function TemplateCard({
  template,
  onDuplicate,
  onDelete,
  onActivate,
  onDeactivate,
  onSetPrincipal
}: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const TipoIcon = TIPO_ICONS[template.tipo_contenido];
  const estadoInfo = ESTADOS[template.estado];

  // Get the preview image: thumbnail_url > og_imagen > static mockup
  const previewImage = template.thumbnail_url || template.og_imagen || MOCKUP_IMAGES[template.tipo_contenido];

  // Get the preview URL based on template type and slug
  const getPreviewUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    if (template.tipo_contenido === 'landing') {
      return template.es_principal ? `${baseUrl}/` : `${baseUrl}/${template.slug}`;
    }
    if (template.tipo_contenido === 'blog') {
      return template.es_principal ? `${baseUrl}/blog` : `${baseUrl}/${template.slug}`;
    }
    if (template.tipo_contenido === 'tienda') {
      return template.es_principal ? `${baseUrl}/tienda` : `${baseUrl}/${template.slug}`;
    }
    if (template.tipo_contenido === 'curso') {
      return template.es_principal ? `${baseUrl}/cursos` : `${baseUrl}/${template.slug}`;
    }
    if (template.tipo_contenido === 'funnel') {
      return `${baseUrl}/embudo/${template.slug}`;
    }
    if (template.tipo_contenido === 'captura') {
      return `${baseUrl}/formulario/${template.slug}`;
    }
    if (template.tipo_contenido === 'thankyou') {
      return `${baseUrl}/gracias`;
    }
    if (template.tipo_contenido === 'proyecto') {
      return `${baseUrl}/proyectos/${template.slug}`;
    }
    return template.slug ? `${baseUrl}/${template.slug}` : `${baseUrl}/`;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de eliminar "${template.nombre}"?`)) {
      onDelete(template.id);
    }
    setShowMenu(false);
  };

  const previewUrl = getPreviewUrl();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] group h-full flex flex-col"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden bg-zinc-900 shrink-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Imagen de Preview Estática (Instantánea) */}
        <img 
          src={previewImage} 
          alt={template.nombre}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 blur-[2px] opacity-40' : 'scale-100 opacity-60'}`}
        />

        {/* Overlay en Hover con botón de acción directo */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <Link
                href={`/superadmin/templates/${template.id}`}
                className="px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blis-red hover:text-white transition-all shadow-2xl"
              >
                Editar Diseño
              </Link>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-black/50 text-white border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
              >
                 <ExternalLink className="w-3.5 h-3.5" /> Ver en Vivo
              </a>
            </motion.div>
          </div>
        )}

        {/* Overlay con gradiente para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {template.es_principal && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-blis-red text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1 z-10">
            <Star className="w-3 h-3" />
            Principal
          </div>
        )}

        <div className="absolute top-3 right-3 z-10">
          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
            estadoInfo.color === 'gray' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
            estadoInfo.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            estadoInfo.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {estadoInfo.label}
          </span>
        </div>

        {!template.mostrar_en_menu && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="px-2 py-1 bg-zinc-800/80 text-gray-400 text-[9px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              Oculto
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm truncate">{template.nombre}</h3>
            <div className="flex items-center gap-2 mt-1">
              <TipoIcon className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[11px] text-gray-500">{TIPO_LABELS[template.tipo_contenido]}</span>
              {template.slug && (
                <>
                  <span className="text-gray-600">·</span>
                  <span className="text-[11px] text-gray-500 font-mono truncate max-w-[100px]">
                    /{template.slug}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <Link
                  href={`/superadmin/templates/${template.id}`}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-gray-300 hover:text-white text-sm transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Link>

                <button
                  onClick={() => {
                    onDuplicate(template.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-gray-300 hover:text-white text-sm transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Duplicar
                </button>

                {template.estado === 'activo' ? (
                  <button
                    onClick={() => {
                      onDeactivate(template.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-amber-400 hover:text-amber-300 text-sm transition-colors"
                  >
                    <EyeOff className="w-4 h-4" />
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onActivate(template.id, template.es_principal);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Activar
                  </button>
                )}

                {template.estado === 'activo' && !template.es_principal && (
                  <button
                    onClick={() => {
                      onSetPrincipal(template.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-blis-red hover:text-red-300 text-sm transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Hacer Principal
                  </button>
                )}

                {template.estado === 'borrador' && (
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-sm transition-colors border-t border-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {template.descripcion && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-3">{template.descripcion}</p>
        )}

        <div className="flex items-center gap-2">
          <Link
            href={`/superadmin/templates/${template.id}`}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center border border-white/5"
          >
            Editar
          </Link>

          {template.estado === 'activo' && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blis-red/20 hover:bg-blis-red/30 text-blis-red text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-blis-red/30 flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}