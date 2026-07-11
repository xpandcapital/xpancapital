"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export interface ScannerLog {
  id: string;
  timestamp: number;
  par: string;
  mensaje: string;
  tipo: 'scan' | 'warning' | 'valid';
}

interface ScannerConsoleProps {
  logs: ScannerLog[];
  maxHeight?: string;
  onNavigate?: (par: string) => void;
}

const tipoStyles = {
  scan: {
    icon: Activity,
    textColor: 'text-gray-400',
    bgHover: 'hover:bg-gray-800/50',
    dotColor: 'bg-gray-500',
    borderAccent: '',
  },
  warning: {
    icon: AlertTriangle,
    textColor: 'text-amber-400/80',
    bgHover: 'hover:bg-amber-900/20',
    dotColor: 'bg-amber-500',
    borderAccent: '',
  },
  valid: {
    icon: CheckCircle2,
    textColor: 'text-emerald-400',
    bgHover: 'hover:bg-emerald-900/30 cursor-pointer',
    dotColor: 'bg-emerald-500',
    borderAccent: 'border-l-2 border-emerald-500/50',
  },
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const playBeep = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (e) {
    // Silent fail if audio context not available
  }
};

export const ScannerConsole: React.FC<ScannerConsoleProps> = ({
  logs,
  maxHeight = 'h-48',
  onNavigate,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastLogRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playValidBeep = useCallback(() => {
    playBeep();
  }, []);

  useEffect(() => {
    if (logs.length > 0) {
      const latestLog = logs[0];
      if (latestLog.id !== lastLogRef.current) {
        lastLogRef.current = latestLog.id;
        
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
        
        if (latestLog.tipo === 'valid') {
          playValidBeep();
        }
      }
    }
  }, [logs, playValidBeep]);

  const handleRowClick = (log: ScannerLog) => {
    if (log.tipo === 'valid' && onNavigate) {
      onNavigate(log.par);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#111318] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blis-red animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono">
            Consola del Scanner
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-mono text-gray-600">
          <span>{logs.length} entradas</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`overflow-y-auto custom-scrollbar ${maxHeight}`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d5c108 transparent',
        }}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-gray-600">
            <Clock size={20} className="mb-2 opacity-30" />
            <span className="text-[10px] font-mono uppercase tracking-widest">
              Esperando actividad del scanner...
            </span>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {logs.map((log, index) => {
              if (!log.mensaje || log.mensaje.trim() === '') return null;
              
              const style = tipoStyles[log.tipo] || tipoStyles.scan;
              const Icon = style.icon;
              const isClickable = log.tipo === 'valid' && onNavigate;

              return (
                <div
                  key={log.id}
                  onClick={() => handleRowClick(log)}
                  className={`flex items-start gap-3 px-4 py-2 transition-all font-mono ${style.bgHover} ${
                    index === 0 ? 'bg-white/[0.02]' : ''
                  } ${style.borderAccent}`}
                >
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <span className="text-[9px] font-mono text-gray-500">
                      {formatTime(log.timestamp)}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`}></div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded bg-white/5 text-gray-300 shrink-0 font-mono">
                    {log.par}
                  </span>

                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Icon size={11} className={`${style.textColor} mt-0.5 shrink-0`} />
                    <span className={`text-[11px] font-medium leading-relaxed ${style.textColor}`}>
                      {log.mensaje}
                    </span>
                  </div>

                  {isClickable && (
                    <span className="text-[9px] font-mono text-emerald-500/60 shrink-0 uppercase tracking-wider animate-pulse">
                      click
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d5c108;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d4;
        }
      `}</style>
    </div>
  );
};

