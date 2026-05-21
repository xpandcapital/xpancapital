"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowUpRight, X, MapPin, Ruler, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLandingCMS } from "@/context/LandingCMSContext";
import logger from "@/lib/utils/logger";

interface ProjectData {
  id: string;
  name: string;
  status: string;
  website: string | null;
  location: string | null;
  description: string | null;
  cover_image: string | null;
  gallery_images: string[];
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  start_date: string | null;
  end_date: string | null;
  lots?: Array<{
    id: string;
    lot_area: number;
    total_price: number;
    client_name: string;
    status: string;
  }>;
}

interface ProjectWithComputed extends ProjectData {
  totalLots: number;
  totalArea: number;
  soldLots: number;
  details: string;
  color: string;
  glowColor: string;
  carouselImages: string[];
  fullDescription: string;
  webLink: string;
}

function TiltCard({
  project,
  index,
  onOpen,
}: {
  project: ProjectWithComputed;
  index: number;
  onOpen: (p: ProjectWithComputed) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useTransform(mouseY, [0, 1], [10, -10]);
  const rotateY = useTransform(mouseX, [0, 1], [-10, 10]);
  const glowX = useTransform(mouseX, [0, 1], [-50, 50]);
  const glowY = useTransform(mouseY, [0, 1], [-50, 50]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const statusInfo = getStatusLabel(project.status);
  const primaryColor = project.primary_color || "#be0b3c";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      onClick={() => onOpen(project)}
      className="group relative overflow-hidden rounded-2xl border border-white/5 cursor-pointer glass-card h-[350px]"
    >
      {/* Glow tracker — sigue al cursor */}
      <motion.div
        className="absolute w-[120%] h-[120%] -inset-[10%] pointer-events-none rounded-[inherit] z-0"
        style={{
          x: glowX,
          y: glowY,
          background: `radial-gradient(circle at center, rgba(255,30,86,0.18) 0%, transparent 50%)`,
        }}
      />

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-60"
        style={{ backgroundImage: `url(${project.cover_image || project.carouselImages?.[0] || "/images/placeholder-project.webp"})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:via-black/30 transition-colors duration-500" />

      <div className="relative z-10 flex flex-col h-full justify-between p-8">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`px-3 py-1 text-xs font-black uppercase tracking-widest border rounded-full backdrop-blur-md transition-all duration-300 ${
              statusInfo.available
                ? "bg-green-500/10 border-green-500/50 text-green-400"
                : "bg-red-500/10 border-red-500/50 text-red-400"
            }`}
          >
            {statusInfo.label}
          </div>
          <div
            className="p-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg"
            style={{ backgroundColor: `${primaryColor}40` }}
          >
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        </div>

        <div>
          <h3
            className="text-2xl font-black uppercase tracking-wide text-white transition-colors duration-300"
            style={{ textShadow: `0 0 20px ${primaryColor}` }}
          >
            {project.name}
          </h3>
          <div className="text-sm font-mono tracking-widest text-gray-300 mt-2 uppercase flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/50" />
            {project.details}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case "EN PLANOS":
      return { label: "En Planos", available: true };
    case "PREVENTA":
      return { label: "Preventa", available: true };
    case "VENTA CON ESCRITURA":
      return { label: "Con Escritura", available: true };
    case "VENTA FINALIZADA":
      return { label: "Venta Finalizada", available: false };
    case "PROYECTO ENTREGADO":
      return { label: "Entregado", available: false };
    default:
      return { label: status, available: true };
  }
}

export function Projects() {
  const { cmsData } = useLandingCMS();
  const { title, subtitle, description } = cmsData.projects;
  
  const [projects, setProjects] = useState<ProjectWithComputed[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithComputed | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function fetchProjects() {
      try {
        setLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const { data, error } = await supabase
          .from("projects")
          .select("id, name, status, website, location, description, cover_image, gallery_images, logo_url, primary_color, secondary_color, start_date, end_date, order_index")
          .order("order_index", { ascending: true, nullsFirst: false })
          .limit(50);

        clearTimeout(timeoutId);

        if (isCancelled) return;

        if (error) {
          console.error("Supabase query error:", error);
          setProjects([]);
          return;
        }

        if (!data || data.length === 0) {
          setProjects([]);
          return;
        }

        const formattedProjects: ProjectWithComputed[] = data.map((project: any) => {
          const color = project.primary_color || "#be0b3c";
          const startDate = project.start_date ? new Date(project.start_date) : null;
          const endDate = project.end_date ? new Date(project.end_date) : null;
          let duration = "";
          if (startDate && endDate) {
            const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            duration = `${months} meses`;
          }

          const galleryImages = project.gallery_images || [];

          return {
            ...project,
            totalLots: 0,
            totalArea: 0,
            soldLots: 0,
            details: duration || "Proyecto",
            color: `from-[${color}]/80 to-[${color}]/40`,
            glowColor: `${color}35`,
            carouselImages: galleryImages.length > 0
              ? galleryImages
              : project.cover_image
                ? [project.cover_image]
                : ["/images/arkadia-1.webp"],
            fullDescription: project.description || "Proyecto inmobiliario de alta calidad.",
            webLink: project.website || "#",
          };
        });

        setProjects(formattedProjects);
      } catch (err) {
        if (!isCancelled) {
          console.error("Error loading projects:", err);
          setProjects([]);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchProjects();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleOpenModal = (e: any) => {
      const projName = e.detail;
      const proj = projects.find((p) => p.name === projName);
      if (proj) {
        setSelectedProject(proj);
        setCurrentImageIndex(0);
      }
    };
    window.addEventListener("openProjectModal", handleOpenModal as EventListener);
    return () => window.removeEventListener("openProjectModal", handleOpenModal as EventListener);
  }, [projects]);

  useEffect(() => {
    if (!selectedProject) return;

    let timer: NodeJS.Timeout;

    if (isCooldown) {
      timer = setTimeout(() => {
        setIsCooldown(false);
        setCurrentImageIndex((prev) => (prev + 1) % selectedProject.carouselImages.length);
      }, 5000);
    } else {
      timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % selectedProject.carouselImages.length);
      }, 3000);
    }

    return () => {
      if (isCooldown) {
        clearTimeout(timer);
      } else {
        clearInterval(timer);
      }
    };
  }, [selectedProject, currentImageIndex, isCooldown]);

  const handleManualNavigation = (direction: "next" | "prev", e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedProject) return;

    setIsCooldown(true);
    if (direction === "next") {
      setDirection(1);
      setCurrentImageIndex((prev) => (prev + 1) % selectedProject.carouselImages.length);
    } else {
      setDirection(-1);
      setCurrentImageIndex((prev) => (prev - 1 + selectedProject.carouselImages.length) % selectedProject.carouselImages.length);
    }
  };

  const nextImage = (e: React.MouseEvent) => handleManualNavigation("next", e);
  const prevImage = (e: React.MouseEvent) => handleManualNavigation("prev", e);

  const openModal = (project: ProjectWithComputed) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  if (loading) {
    return (
      <section className="pt-12 md:pt-10 pb-24 bg-black relative">
        <div className="container mx-auto px-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="pt-12 md:pt-10 pb-24 bg-black relative">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider">
            {title || 'Portafolio'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-white">{subtitle || 'DE PROYECTOS'}</span>
          </h2>
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto font-light">
            {description || 'Una colección de activos invaluables diseñados y ejecutados con precisión matemática y estética suprema. Haz clic para explorar detalles.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <TiltCard
              key={project.id}
              project={project}
              index={index}
              onOpen={openModal}
            />
          ))}
        </div>
      </div>

      {/* Modal de Detalles */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-black border border-white/10 rounded-2xl overflow-hidden max-w-[1200px] w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row cyber-texture relative"
              style={{
                boxShadow: `0px 0px 100px 10px ${selectedProject.glowColor}, inset 0px 0px 30px 2px ${selectedProject.glowColor}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedProject(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-[60]">
                <X className="w-6 h-6" />
              </button>

              {/* Carousel Half */}
              <div className="w-full md:w-1/2 shrink-0 relative bg-black md:m-6 md:rounded-2xl overflow-hidden shadow-2xl border-b md:border border-white/10 group/carousel aspect-square md:h-auto">
                <motion.div
                  className="absolute inset-0 z-0"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    const swipeThreshold = 50;
                    if (info.offset.x < -swipeThreshold) {
                      handleManualNavigation("next", { stopPropagation: () => {} } as any);
                    } else if (info.offset.x > swipeThreshold) {
                      handleManualNavigation("prev", { stopPropagation: () => {} } as any);
                    }
                  }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${selectedProject.carouselImages[(currentImageIndex + selectedProject.carouselImages.length) % selectedProject.carouselImages.length]})`,
                      }}
                    />
                  </AnimatePresence>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950/40 via-transparent to-transparent z-10" />

                {/* Carousel Controls */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-20">
                  <button onClick={prevImage} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextImage} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Carousel Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {selectedProject.carouselImages.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
                  ))}
                </div>
              </div>

              {/* Content Half */}
              <div className="flex-1 p-8 md:p-12 relative flex flex-col justify-center">
                <span className="text-sm font-bold uppercase tracking-widest mb-4 block" style={{ color: selectedProject.primary_color }}>
                  Expediente Técnico
                </span>
                <h3 className="text-4xl md:text-5xl font-black text-white uppercase leading-tight mb-6">
                  {selectedProject.name}
                </h3>

                <div className="space-y-4 mb-8">
                  {selectedProject.location && (
                    <div className="flex items-center gap-4 border border-white/10 rounded-lg p-3 bg-white/5">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-200 font-light">{selectedProject.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 border border-white/10 rounded-lg p-3 bg-white/5">
                    <Ruler className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200 font-light">{selectedProject.totalArea.toLocaleString()}m² Totales</span>
                  </div>
                  <div className="flex items-center gap-4 border border-white/10 rounded-lg p-3 bg-white/5">
                    <CheckCircle className="w-5 h-5 text-blis-red" />
                    <span className="text-gray-200 font-bold">{getStatusLabel(selectedProject.status).label}</span>
                  </div>
                </div>

                <p className="text-gray-400 font-light leading-relaxed mb-8">
                  {selectedProject.fullDescription}
                </p>

                {selectedProject.webLink && selectedProject.webLink !== "#" && (
                  <a
                    href={selectedProject.webLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-xl border font-bold uppercase tracking-widest transition-all duration-300 hover:text-white flex items-center justify-center gap-2"
                    style={{
                      borderColor: selectedProject.primary_color,
                      backgroundColor: `${selectedProject.primary_color}15`,
                      color: selectedProject.primary_color,
                    }}
                  >
                    <span>Ver Sitio Web</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
