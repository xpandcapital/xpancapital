"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ContentSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    description?: string;
    content?: string;
    image?: string;
    imageAlt?: string;
    imagePosition?: 'left' | 'right' | 'top' | 'bottom' | 'background';
    backgroundColor?: string;
    accentColor?: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    bullets?: Array<{ icon?: string; title: string; description?: string }>;
    layout?: 'split' | 'boxed' | 'full';
  };
}

export function ContentSection({ data = {} }: ContentSectionProps) {
  const {
    title = "",
    subtitle = "",
    description = "",
    content = "",
    image = "",
    imageAlt = "",
    imagePosition = "right",
    backgroundColor = "#0a0a0a",
    accentColor = "#B10D24",
    ctaText = "",
    ctaLink = "",
    secondaryCtaText = "",
    secondaryCtaLink = "",
    bullets = [],
    layout = "split"
  } = data;

  const renderContent = () => (
    <>
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
      
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white mb-6"
        >
          {title}
        </motion.h2>
      )}
      
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg mb-6"
        >
          {description}
        </motion.p>
      )}
      
      {content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-300 mb-8 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
      
      {bullets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          {bullets.map((bullet, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
              </div>
              <div>
                <p className="font-bold text-white">{bullet.title}</p>
                {bullet.description && (
                  <p className="text-sm text-gray-400">{bullet.description}</p>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
      
      {(ctaText || secondaryCtaText) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4"
        >
          {ctaText && ctaLink && (
            <Link
              href={ctaLink}
              className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all hover:scale-105"
              style={{ backgroundColor: accentColor, color: '#fff' }}
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          
          {secondaryCtaText && secondaryCtaLink && (
            <Link
              href={secondaryCtaLink}
              className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-white/10 text-white hover:bg-white/5 transition-all"
            >
              {secondaryCtaText}
            </Link>
          )}
        </motion.div>
      )}
    </>
  );

  const renderImage = () => (
    image && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative rounded-[2rem] overflow-hidden"
        style={{ aspectRatio: '4/3' }}
      >
        <img
          src={image}
          alt={imageAlt || title || ""}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${backgroundColor}, transparent)` }}
        />
      </motion.div>
    )
  );

  if (imagePosition === "background" && image) {
    return (
      <section className="relative min-h-[80vh] flex items-center" style={{ backgroundColor }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="max-w-2xl">
            {renderContent()}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "boxed") {
    return (
      <section className="py-20 md:py-32" style={{ backgroundColor }}>
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {imagePosition === "left" ? (
                <>
                  {renderImage()}
                  <div>{renderContent()}</div>
                </>
              ) : (
                <>
                  <div>{renderContent()}</div>
                  {renderImage()}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Split layout (default)
  return (
    <section className="py-20 md:py-32" style={{ backgroundColor }}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className={`grid gap-12 items-center ${
          imagePosition === "top" ? "grid-cols-1" :
          imagePosition === "bottom" ? "grid-cols-1" :
          "lg:grid-cols-2"
        }`}>
          {imagePosition === "right" || imagePosition === "bottom" ? (
            <>
              <div>{renderContent()}</div>
              {renderImage()}
            </>
          ) : (
            <>
              {renderImage()}
              <div>{renderContent()}</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}