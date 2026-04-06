"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  image?: string;
  rating?: number;
}

interface FunnelTestimonialsProps {
  data?: {
    title?: string;
    subtitle?: string;
    testimonials?: Testimonial[];
    accentColor?: string;
    layout?: 'carousel' | 'grid' | 'featured';
    showRating?: boolean;
    autoPlay?: boolean;
    autoPlayInterval?: number;
  };
}

export function FunnelTestimonials({ data = {} }: FunnelTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const {
    title = "Lo que dicen nuestros clientes",
    subtitle = "Testimonios Reales",
    testimonials = [
      {
        quote: "Invertí hace 2 años y mi terreno ya vale el triple. La mejor decisión financiera que he tomado.",
        author: "Rafael S.",
        role: "Inversor Inmobiliario",
        rating: 5
      },
      {
        quote: "La asesoría fue excepcional. Me guiaron en todo el proceso y ahora tengo mi primera propiedad.",
        author: "María G.",
        role: "Primera Inversión",
        rating: 5
      },
      {
        quote: "Profesionales de verdad. Documentación en orden, tiempos cumplidos y rendimientos superiores.",
        author: "Carlos M.",
        role: "Empresario",
        rating: 5
      }
    ],
    accentColor = "#B10D24",
    layout = "carousel",
    showRating = true,
    autoPlayInterval = 5000
  } = data;

  const handlePrev = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
      />
    ));
  };

  if (layout === "grid") {
    return (
      <section className="py-20 md:py-32 bg-zinc-950">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {subtitle && (
              <p
                className="text-sm font-bold uppercase tracking-widest mb-4"
                style={{ color: accentColor }}
              >
                {subtitle}
              </p>
            )}
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
              {title}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8"
              >
                <Quote className="w-8 h-8 mb-4" style={{ color: accentColor, opacity: 0.5 }} />
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                
                {showRating && testimonial.rating && (
                  <div className="flex gap-1 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  {testimonial.image && (
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-bold text-white">{testimonial.author}</p>
                    {testimonial.role && (
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "featured") {
    const featured = testimonials[currentIndex];
    
    return (
      <section className="py-20 md:py-32 bg-black relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${accentColor} 0%, transparent 50%)`
          }}
        />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 text-center">
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: accentColor }}
            >
              {subtitle}
            </motion.p>
          )}
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-16"
          >
            {title}
          </motion.h2>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-8">
              <Quote className="w-12 h-12 mx-auto mb-6" style={{ color: accentColor }} />
              <p className="text-2xl md:text-3xl text-white font-light leading-relaxed mb-8">
                "{featured.quote}"
              </p>
              
              {showRating && featured.rating && (
                <div className="flex justify-center gap-1 mb-6">
                  {renderStars(featured.rating)}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              {featured.image && (
                <img
                  src={featured.image}
                  alt={featured.author}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="text-left">
                <p className="font-bold text-white text-lg">{featured.author}</p>
                {featured.role && (
                  <p className="text-gray-400">{featured.role}</p>
                )}
              </div>
            </div>
          </motion.div>

          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={handlePrev}
                className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNext}
                className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Default carousel layout
  return (
    <section className="py-20 md:py-32 bg-zinc-950">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {subtitle && (
            <p
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: accentColor }}
            >
              {subtitle}
            </p>
          )}
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            {title}
          </h2>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-6"
            >
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <div
                  key={index}
                  className="w-full md:w-1/2 lg:w-1/3 shrink-0 bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8"
                >
                  <Quote className="w-6 h-6 mb-4" style={{ color: accentColor, opacity: 0.5 }} />
                  <p className="text-gray-300 leading-relaxed mb-6 line-clamp-4">
                    "{testimonial.quote}"
                  </p>
                  
                  {showRating && testimonial.rating && (
                    <div className="flex gap-1 mb-4">
                      {renderStars(testimonial.rating)}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    {testimonial.image && (
                      <img
                        src={testimonial.image}
                        alt={testimonial.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold text-white text-sm">{testimonial.author}</p>
                      {testimonial.role && (
                        <p className="text-xs text-gray-400">{testimonial.role}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {testimonials.length > 3 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}