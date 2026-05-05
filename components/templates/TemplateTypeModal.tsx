"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layout, FileText, ShoppingBag, Package, GraduationCap, BookOpen, Building2, Funnel, Target, CreditCard, CheckCircle, Check, Scale } from "lucide-react";
import { TipoContenido } from "@/lib/hooks/useTemplates";

interface TemplateTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { nombre: string; slug: string; tipo_contenido: TipoContenido; descripcion?: string; mostrar_en_menu: boolean; mostrar_en_footer: boolean }) => Promise<boolean>;
}

const TIPO_OPTIONS: { tipo: TipoContenido; label: string; icon: React.ComponentType<{ className?: string }>; descripcion: string }[] = [
  { tipo: 'landing', label: "Landing Page", icon: Layout, descripcion: "Página principal con múltiples secciones (hero, about, testimonios, etc.)" },
  { tipo: 'blog', label: "Blog", icon: FileText, descripcion: "Listado de posts con categorías, filtros y navegación" },
  { tipo: 'tienda', label: "Tienda", icon: ShoppingBag, descripcion: "Catálogo de productos con filtros y vistas" },
  { tipo: 'curso', label: "Curso / Academia", icon: GraduationCap, descripcion: "Página de curso con módulos, lecciones y contenido" },
  { tipo: 'proyecto', label: "Proyecto", icon: Building2, descripcion: "Página de proyecto con información y galería" },
  { tipo: 'funnel', label: "Funnel de Ventas", icon: Funnel, descripcion: "Página de conversión con pasos y CTA" },
  { tipo: 'captura', label: "Página de Captura", icon: Target, descripcion: "Página simple para capturar leads" },
  { tipo: 'producto', label: "Detalle de Producto", icon: Package, descripcion: "Página individual de producto"},
  { tipo: 'leccion', label: "Detalle de Lección", icon: BookOpen, descripcion: "Página individual de lección" },
  { tipo: 'checkout', label: "Checkout", icon: CreditCard, descripcion: "Página de pago y facturación" },
  { tipo: 'thankyou', label: "Thank You Page", icon: CheckCircle, descripcion: "Página de confirmación post-compra" },
  { tipo: 'legal', label: "Páginas Legales", icon: Scale, descripcion: "Términos, privacidad, reembolsos, cookies, aviso legal" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function TemplateTypeModal({ isOpen, onClose, onCreate }: TemplateTypeModalProps) {
  const [selectedTipo, setSelectedTipo] = useState<TipoContenido | null>(null);
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mostrarEnMenu, setMostrarEnMenu] = useState(true);
  const [mostrarEnFooter, setMostrarEnFooter] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleNombreChange = (value: string) => {
    setNombre(value);
    if (!slug) {
      setSlug(slugify(value));
    }
  };

  const handleCreate = async () => {
    if (!selectedTipo || !nombre) return;

    setLoading(true);
    try {
      const success = await onCreate({
        nombre,
        slug,
        tipo_contenido: selectedTipo,
        descripcion: descripcion || undefined,
        mostrar_en_menu: mostrarEnMenu,
        mostrar_en_footer: mostrarEnFooter
      });

      if (success) {
        setSelectedTipo(null);
        setNombre("");
        setSlug("");
        setDescripcion("");
        setMostrarEnMenu(true);
        setMostrarEnFooter(true);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTipo(null);
    setNombre("");
    setSlug("");
    setDescripcion("");
    setMostrarEnMenu(true);
    setMostrarEnFooter(true);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden z-[101] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Nuevo Template</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                  Tipo de Contenido
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TIPO_OPTIONS.map(({ tipo, label, icon: Icon, descripcion: desc }) => (
                    <button
                      key={tipo}
                      onClick={() => setSelectedTipo(tipo)}
                      className={`p-4 rounded-xl border transition-all text-left ${
                        selectedTipo === tipo
                          ? 'bg-blis-red/10 border-blis-red text-white'
                          : 'bg-zinc-900 border-white/5 text-gray-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${selectedTipo === tipo ? 'text-blis-red' : ''}`} />
                      <div className="text-sm font-bold">{label}</div>
                      <div className="text-[10px] text-gray-500 mt-1 line-clamp-2">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedTipo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                      Nombre del Template *
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => handleNombreChange(e.target.value)}
                      placeholder="Ej: Landing Principal, Blog 2024, Tienda Dark..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                      Slug (URL)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm whitespace-nowrap">localhost/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="landing, blog, tienda..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 text-sm font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Déjalo vacío para la página principal. Ej: "promo-2024" → localhost/promo-2024
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe el propósito de este template..."
                      rows={2}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Visibilidad
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${mostrarEnMenu ? 'bg-blis-red border-blis-red' : 'border-white/20'}`}>
                        {mostrarEnMenu && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-gray-300">Mostrar en menú principal</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${mostrarEnFooter ? 'bg-blis-red border-blis-red' : 'border-white/20'}`}>
                        {mostrarEnFooter && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-gray-300">Mostrar en footer</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-white/5 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedTipo || !nombre || loading}
                className="px-6 py-3 bg-blis-red text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_10px_20px_rgba(190,11,60,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Template"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}