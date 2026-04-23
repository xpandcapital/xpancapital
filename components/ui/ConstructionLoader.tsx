"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPARK_ANIMATIONS = [
  { xTarget: -12, yTarget: 18, repeatDelay: 0.4 },
  { xTarget: 15, yTarget: -8, repeatDelay: 1.2 },
  { xTarget: -8, yTarget: -15, repeatDelay: 0.7 },
  { xTarget: 20, yTarget: 10, repeatDelay: 1.8 },
  { xTarget: -18, yTarget: -5, repeatDelay: 0.9 },
];

export function ConstructionLoader() {
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const [phase, setPhase] = useState(0);
  
  const words = [
    "Analizando terreno",
    "Preparando cimientos",
    "Estructura inteligente",
    "Construyendo sueños",
    "Tu patrimonio listo"
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const increment = prev < 30 ? 3 : prev < 70 ? 2 : 1;
        return prev + increment + Math.random() * 2;
      });
    }, 150);

    const wordInterval = setInterval(() => {
      setCurrentWord(prev => (prev + 1) % words.length);
    }, 2500);

    const phaseInterval = setInterval(() => {
      setPhase(prev => (prev + 1) % 4);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(wordInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  // Building blocks animation
  const floors = [
    { delay: 0, width: 100 },
    { delay: 0.1, width: 95 },
    { delay: 0.2, width: 90 },
    { delay: 0.3, width: 85 },
    { delay: 0.4, width: 80 },
    { delay: 0.5, width: 75 },
  ];

  return (
    <div className="fixed inset-0 bg-black z-[9999] overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(190,11,60,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(190,11,60,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Dynamic glowing orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/3 w-[800px] h-[800px] rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: 'radial-gradient(circle, rgba(190,11,60,0.4) 0%, transparent 60%)',
          filter: 'blur(80px)'
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] rounded-full"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -30, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: 'radial-gradient(circle, rgba(32,159,137,0.4) 0%, transparent 60%)',
          filter: 'blur(80px)'
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${(i * 3.3) % 100}%`,
              top: '-10px',
            }}
            animate={{
              y: [0, typeof window !== 'undefined' ? window.innerHeight + 100 : 900],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 8 + (i % 4) * 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        
        {/* Building animation */}
        <div className="relative mb-16">
          {/* Crane */}
          <motion.div
            className="absolute -left-20 top-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg width="60" height="120" viewBox="0 0 60 120" fill="none">
              <motion.rect 
                x="5" y="0" width="4" height="120" 
                fill="#be0b3c"
                initial={{ height: 0, y: 120 }}
                animate={{ height: 120, y: 0 }}
                transition={{ duration: 1 }}
              />
              <motion.rect 
                x="5" y="5" width="50" height="3" 
                fill="#be0b3c"
                initial={{ width: 0 }}
                animate={{ width: 50 }}
                transition={{ duration: 0.5, delay: 1 }}
              />
              <motion.line 
                x1="55" y1="8" x2="55" y2="30" 
                stroke="#be0b3c" strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 1.5 }}
              />
            </svg>
          </motion.div>

          {/* Building container */}
          <div className="relative w-48 h-64">
            {/* Foundation */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-blis-red/60 to-blis-red/20 rounded-b-lg"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
              style={{ transformOrigin: 'center bottom' }}
            />

            {/* Building floors */}
            {floors.map((floor, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: `${16 + i * 38}px`,
                  height: '36px',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: progress > (i + 1) * 15 ? 1 : 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: floor.delay }}
              >
                <div 
                  className="h-full border-2 border-blis-red/40 rounded-t-sm relative overflow-hidden"
                  style={{ width: `${floor.width}px` }}
                >
                  {/* Windows */}
                  <div className="absolute inset-2 grid grid-cols-3 gap-1">
                    {[...Array(6)].map((_, j) => (
                      <motion.div
                        key={j}
                        className="bg-teal-500/60 rounded-sm"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: progress > (i + 1) * 15 + 5 ? [0.4, 0.8, 0.4] : 0,
                          backgroundColor: phase === j % 4 ? 'rgba(32,159,137,0.8)' : 'rgba(32,159,137,0.4)'
                        }}
                        transition={{ 
                          opacity: { duration: 0.1 },
                          backgroundColor: { duration: 0.3 }
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Floor glow on completion */}
                  {progress > (i + 1) * 15 && (
                    <motion.div
                      className="absolute inset-0 bg-blis-red/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            ))}

            {/* Roof */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: progress > 85 ? 1 : 0, y: progress > 85 ? 0 : -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-28 h-8 flex items-end justify-center">
                <div className="w-20 h-3 bg-gradient-to-b from-blis-red to-blis-red/50 rounded-t-full" />
              </div>
            </motion.div>

            {/* Antenna */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-0"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: progress > 90 ? 1 : 0, scaleY: progress > 90 ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ originY: 1, top: '-24px' }}
            >
              <div className="w-1 h-8 bg-blis-red mx-auto rounded-t-full" />
              <motion.div
                className="w-3 h-3 bg-red-500 rounded-full mx-auto -mt-1"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* Sparks during construction */}
          {progress > 20 && progress < 90 && (
            <div className="absolute -right-10 top-1/3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2"
                  style={{
                    background: 'radial-gradient(circle, #fff 0%, #be0b3c 50%, transparent 70%)',
                    borderRadius: '50%',
                  }}
                  animate={{
                    x: [0, SPARK_ANIMATIONS[i].xTarget],
                    y: [0, SPARK_ANIMATIONS[i].yTarget],
                    opacity: [1, 0],
                    scale: [1, 0]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                    repeatDelay: SPARK_ANIMATIONS[i].repeatDelay
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-10"
        >
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight mb-2">
            <motion.span
              className="inline-block"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(190,11,60,0.5)',
                  '0 0 40px rgba(190,11,60,0.8)',
                  '0 0 20px rgba(190,11,60,0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              BLIS
            </motion.span>
            <motion.span
              className="inline-block text-blis-red ml-2"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(190,11,60,0.3)',
                  '0 0 30px rgba(190,11,60,0.6)',
                  '0 0 20px rgba(190,11,60,0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              CORP
            </motion.span>
          </h1>
          <p className="text-white/30 text-xs uppercase tracking-[0.5em]">
            Luxury Tech Real Estate
          </p>
        </motion.div>

        {/* Animated text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentWord}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-white/50 text-center mb-10 text-lg font-light tracking-wide"
          >
            {words[currentWord]}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full max-w-sm">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4 relative">
            <motion.div
              className="h-full rounded-full relative"
              style={{
                background: 'linear-gradient(90deg, #be0b3c 0%, #be0b3c 60%, #209f89 100%)'
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.2 }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40 text-xs tracking-wider uppercase">
              Construyendo
            </span>
            <motion.span 
              className="text-white text-sm font-bold"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {Math.min(Math.round(progress), 100)}%
            </motion.span>
          </div>
        </div>

        {/* Bottom decoration */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-blis-red/50" />
          <svg width="20" height="20" viewBox="0 0 24 24" className="text-blis-red/50">
            <path fill="currentColor" d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zm-1 15.27l-6-3V8.82l6 3v7.63zm8-3l-6 3V11.8l6-3v7.64z" />
          </svg>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-blis-red/50" />
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
      `}</style>
    </div>
  );
}