"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

interface FunnelCountdownProps {
  data?: {
    title?: string;
    subtitle?: string;
    description?: string;
    endDate?: string;
    endMessage?: string;
    showDays?: boolean;
    showHours?: boolean;
    showMinutes?: boolean;
    showSeconds?: boolean;
    accentColor?: string;
    urgentMessage?: string;
    layout?: 'inline' | 'card' | 'banner';
  };
}

export function FunnelCountdown({ data = {} }: FunnelCountdownProps) {
  const {
    title = "Tiempo Restante",
    subtitle = "Oferta Limitada",
    description = "Esta oferta termina pronto. No te lo pierdas.",
    endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endMessage = "¡La oferta ha terminado!",
    showDays = true,
    showHours = true,
    showMinutes = true,
    showSeconds = true,
    accentColor = "#B10D24",
    urgentMessage = "¡Últimos lugares disponibles!",
    layout = "card"
  } = data;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - Date.now();

      if (difference <= 0) {
        setIsEnded(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const TimeBlock = ({ value, label, show = true }: { value: number; label: string; show?: boolean }) => {
    if (!show) return null;
    
    return (
      <div className="flex flex-col items-center">
        <div
          className="w-16 md:w-20 h-16 md:h-20 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${accentColor}15`,
            border: `1px solid ${accentColor}30`
          }}
        >
          <span
            className="text-2xl md:text-3xl font-black"
            style={{ color: accentColor }}
          >
            {String(value).padStart(2, '0')}
          </span>
        </div>
        <span className="text-xs text-gray-400 mt-2 uppercase tracking-widest">{label}</span>
      </div>
    );
  };

  if (isEnded) {
    return (
      <section className="py-12 bg-zinc-900" style={{ borderLeft: `4px solid ${accentColor}` }}>
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 text-center">
          <p className="text-xl font-bold text-white">{endMessage}</p>
        </div>
      </section>
    );
  }

  if (layout === "banner") {
    return (
      <section
        className="py-4 text-white"
        style={{ backgroundColor: accentColor }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" />
              <span className="font-bold">{title}:</span>
              <span className="font-mono">
                {showDays && `${timeLeft.days}d `}
                {showHours && `${timeLeft.hours}h `}
                {showMinutes && `${timeLeft.minutes}m `}
                {showSeconds && `${timeLeft.seconds}s`}
              </span>
            </div>
            {urgentMessage && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-bold">{urgentMessage}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "inline") {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: accentColor }} />
          <span className="text-sm font-bold text-white">{title}:</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          {showDays && (
            <span style={{ color: accentColor }}>
              {timeLeft.days}<span className="text-gray-400 text-xs ml-1">d</span>
            </span>
          )}
          {showHours && (
            <span style={{ color: accentColor }}>
              {timeLeft.hours}<span className="text-gray-400 text-xs ml-1">h</span>
            </span>
          )}
          {showMinutes && (
            <span style={{ color: accentColor }}>
              {timeLeft.minutes}<span className="text-gray-400 text-xs ml-1">m</span>
            </span>
          )}
          {showSeconds && (
            <span style={{ color: accentColor }}>
              {timeLeft.seconds}<span className="text-gray-400 text-xs ml-1">s</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  // Card layout (default)
  return (
    <section className="py-20 md:py-32 bg-zinc-950">
      <div className="w-full max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-zinc-900 border border-white/10 rounded-[2rem] p-8 md:p-12 text-center"
          style={{
            boxShadow: `0 0 60px ${accentColor}15`
          }}
        >
          {subtitle && (
            <p
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: accentColor }}
            >
              {subtitle}
            </p>
          )}
          
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-4">
            {title}
          </h2>
          
          {description && (
            <p className="text-gray-400 mb-8">{description}</p>
          )}

          <div className="flex items-center justify-center gap-4 mb-8">
            <TimeBlock value={timeLeft.days} label="Días" show={showDays} />
            {showDays && showHours && <span className="text-3xl text-gray-600">:</span>}
            <TimeBlock value={timeLeft.hours} label="Horas" show={showHours} />
            {showHours && showMinutes && <span className="text-3xl text-gray-600">:</span>}
            <TimeBlock value={timeLeft.minutes} label="Minutos" show={showMinutes} />
            {showMinutes && showSeconds && <span className="text-3xl text-gray-600">:</span>}
            <TimeBlock value={timeLeft.seconds} label="Segs" show={showSeconds} />
          </div>

          {urgentMessage && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <AlertTriangle className="w-4 h-4" style={{ color: accentColor }} />
              <span className="text-sm font-bold" style={{ color: accentColor }}>
                {urgentMessage}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}