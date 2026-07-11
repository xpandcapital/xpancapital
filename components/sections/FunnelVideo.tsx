"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

interface FunnelVideoProps {
  data?: {
    title?: string;
    subtitle?: string;
    description?: string;
    videoUrl?: string;
    videoThumbnail?: string;
    autoplay?: boolean;
    showOverlay?: boolean;
    overlayText?: string;
    accentColor?: string;
   layout?: 'full' | 'split' | 'boxed';
  };
}

export function FunnelVideo({ data = {} }: FunnelVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const {
    title = "Mira Nuestro Video",
    subtitle = "Descubre la Oportunidad",
    description = "Conoce en detalle todo lo que tenemos para ti.",
    videoUrl = "",
    videoThumbnail = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
    autoplay = false,
    showOverlay = true,
    overlayText = "",
    accentColor = "#a89a00",
    layout = "split"
  } = data;

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/embed")) return url;
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const handlePlay = () => {
    if (videoUrl) {
      setIsPlaying(true);
    }
  };

  if (layout === "full") {
    return (
      <section className="relative min-h-[80vh] bg-black overflow-hidden">
        {isPlaying && videoUrl ? (
          <div className="absolute inset-0">
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${videoThumbnail})` }}
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
              <div className="text-center px-4">
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-bold uppercase tracking-widest mb-4"
                    style={{ color: accentColor }}
                  >
                    {subtitle}
                  </motion.p>
                )}
                {title && (
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white mb-6"
                  >
                    {title}
                  </motion.h2>
                )}
                {description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 text-lg max-w-2xl mx-auto mb-8"
                  >
                    {description}
                  </motion.p>
                )}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handlePlay}
                  className="w-24 h-24 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ 
                    backgroundColor: `${accentColor}20`,
                    boxShadow: `0 0 60px ${accentColor}40`
                  }}
                >
                  <Play className="w-10 h-10" style={{ color: accentColor }} fill={accentColor} />
                </motion.button>
              </div>
            </div>
            {showOverlay && overlayText && (
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                <p className="text-white font-bold text-center">{overlayText}</p>
              </div>
            )}
          </>
        )}
      </section>
    );
  }

  return (
    <section className="py-20 md:py-32 bg-zinc-950">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className={`grid gap-12 items-center ${layout === 'split' ? 'md:grid-cols-2' : ''}`}>
          {layout === 'split' && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              {subtitle && (
                <p
                  className="text-sm font-bold uppercase tracking-widest mb-4"
                  style={{ color: accentColor }}
                >
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white mb-6">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-gray-400 text-lg mb-8">
                  {description}
                </p>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: layout === 'split' ? 50 : 0, y: layout === 'boxed' ? 30 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            className={`relative ${layout === 'boxed' ? 'max-w-3xl mx-auto' : ''}`}
          >
            <div
              className={`relative overflow-hidden bg-black ${
                layout === 'boxed' ? 'rounded-[2rem] shadow-2xl' : 'rounded-[2rem]'
              }`}
              style={{ aspectRatio: '16/9' }}
            >
              {isPlaying && videoUrl ? (
                <iframe
                  src={getEmbedUrl(videoUrl)}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${videoThumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <button
                    onClick={handlePlay}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ 
                        backgroundColor: `${accentColor}90`,
                        boxShadow: `0 0 40px ${accentColor}60`
                      }}
                    >
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </button>
                </>
              )}
            </div>
            {overlayText && !isPlaying && (
              <p className="text-center text-gray-400 mt-4 text-sm">{overlayText}</p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
