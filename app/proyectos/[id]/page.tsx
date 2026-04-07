"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, MapPin, Calendar, Ruler, CheckCircle, 
  ChevronLeft, ChevronRight, ExternalLink, 
  Loader2, Phone, Mail, Share2
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/sections/Header";
import { FooterSections } from "@/components/sections/Footer";
import { ConstructionLoader } from "@/components/ui/ConstructionLoader";

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
  created_at: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    
    async function fetchProject() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .eq("is_active", true)
          .single();

        if (error) throw error;
        
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar proyecto");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (!project || project.gallery_images.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentImageIndex((prev) => (prev + 1) % project.gallery_images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [project]);

  const handlePrevImage = () => {
    if (!project) return;
    setDirection(-1);
    setCurrentImageIndex((prev) => 
      (prev - 1 + project.gallery_images.length) % project.gallery_images.length
    );
  };

  const handleNextImage = () => {
    if (!project) return;
    setDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % project.gallery_images.length);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "EN PLANOS":
        return { label: "En Planos", color: "#10B981", available: true };
      case "PREVENTA":
        return { label: "Preventa", color: "#F59E0B", available: true };
      case "VENTA CON ESCRITURA":
        return { label: "Con Escritura", color: "#3B82F6", available: true };
      case "VENTA FINALIZADA":
        return { label: "Venta Finalizada", color: "#EF4444", available: false };
      case "PROYECTO ENTREGADO":
        return { label: "Entregado", color: "#8B5CF6", available: false };
      default:
        return { label: status, color: "#6B7280", available: true };
    }
  };

  if (loading) {
    return <ConstructionLoader />;
  }

  if (error || !project) {
    return (
      <main className="bg-black min-h-screen text-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <h1 className="text-4xl font-black mb-4">Proyecto no encontrado</h1>
          <p className="text-gray-400 mb-8">{error || "El proyecto que buscas no existe o ha sido eliminado."}</p>
          <Link 
            href="/#projects" 
            className="px-8 py-4 bg-blis-red text-white rounded-2xl font-bold flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Ver Proyectos
          </Link>
        </div>
        <FooterSections />
      </main>
    );
  }

  const statusInfo = getStatusInfo(project.status);
  const primaryColor = project.primary_color || "#B10D24";
  const images = project.gallery_images?.length > 0 
    ? project.gallery_images 
    : project.cover_image 
      ? [project.cover_image] 
      : ["/images/arkadia-1.webp"];

  return (
    <main className="bg-black min-h-screen text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[80vh]">
        {/* Background Gradient */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            background: `radial-gradient(circle at 30% 20%, ${primaryColor}40 0%, transparent 50%)` 
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 md:px-8 pt-32 pb-12">
          <Link 
            href="/#projects" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Volver a Proyectos</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
                  />
                </AnimatePresence>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Status Badge */}
                <div 
                  className="absolute top-6 left-6 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full"
                  style={{ 
                    backgroundColor: `${statusInfo.color}20`,
                    borderColor: statusInfo.color,
                    border: `1px solid ${statusInfo.color}50`,
                    color: statusInfo.color
                  }}
                >
                  {statusInfo.label}
                </div>
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDirection(idx > currentImageIndex ? 1 : -1);
                        setCurrentImageIndex(idx);
                      }}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? 'border-white scale-105' 
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Project Info */}
            <div className="flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span 
                  className="text-xs font-black uppercase tracking-widest mb-4 block"
                  style={{ color: primaryColor }}
                >
                  Proyecto Inmobiliario
                </span>
                
                <h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-6"
                  style={{ textShadow: `0 0 40px ${primaryColor}60` }}
                >
                  {project.name}
                </h1>
                
                {/* Key Info */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {project.location && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                      <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Ubicación</p>
                        <p className="text-white font-bold">{project.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <CheckCircle className="w-5 h-5" style={{ color: statusInfo.color }} />
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Estado</p>
                      <p className="text-white font-bold">{statusInfo.label}</p>
                    </div>
                  </div>
                  
                  {project.start_date && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                      <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Inicio</p>
                        <p className="text-white font-bold">
                          {new Date(project.start_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {project.end_date && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                      <Ruler className="w-5 h-5" style={{ color: primaryColor }} />
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Entrega</p>
                        <p className="text-white font-bold">
                          {new Date(project.end_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                {project.description && (
                  <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    {project.description}
                  </p>
                )}
                
                {/* CTAs */}
                <div className="flex flex-wrap gap-4">
                  {statusInfo.available && (
                    <Link
                      href={`/formulario/registro-inversores?proyecto=${project.id}`}
                      className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all hover:scale-105 shadow-2xl"
                      style={{ backgroundColor: primaryColor, color: '#fff' }}
                    >
                      Me Interesa
                    </Link>
                  )}
                  
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-white/10 text-white hover:bg-white/5 transition-all flex items-center gap-3"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Sitio Web
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Gallery Section */}
      {images.length > 3 && (
        <section className="py-20 bg-zinc-950">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-12 text-center">
              Galería del Proyecto
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setDirection(idx > currentImageIndex ? 1 : -1);
                    setCurrentImageIndex(idx);
                  }}
                  className="aspect-square rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:border-white/30 transition-all"
                  style={{ boxShadow: `0 0 20px ${primaryColor}20` }}
                >
                  <div 
                    className="w-full h-full bg-cover bg-center hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Contact CTA */}
      <section className="py-20" style={{ background: `linear-gradient(135deg, ${primaryColor}20 0%, transparent 50%)` }}>
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">
            ¿Te interesa {project.name}?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Nuestro equipo de asesores está listo para ayudarte con toda la información que necesitas sobre este proyecto.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="tel:+51999999999"
              className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 border border-white/10 text-white hover:bg-white/5 transition-all"
            >
              <Phone className="w-5 h-5" />
              Llamar Ahora
            </a>
            <Link
              href="/contacto"
              className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all hover:scale-105"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
            >
              <Mail className="w-5 h-5" />
              Contactar
            </Link>
          </div>
        </div>
      </section>
      
      <FooterSections />
    </main>
  );
}