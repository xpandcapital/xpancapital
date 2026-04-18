"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Timer, Clock, Globe, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function TaskTimer() {
    const [mode, setMode] = useState<'stopwatch' | 'countdown' | 'world'>('stopwatch');
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const [cdHours, setCdHours] = useState(0);
    const [cdMins, setCdMins] = useState(5);
    const [cdSecs, setCdSecs] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const playBeep = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, context.currentTime);
            gain.gain.setValueAtTime(0, context.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 1);
        } catch (e) { console.error("Audio failed", e); }
    };

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setSeconds(s => {
                    if (mode === 'countdown') {
                        if (s <= 1) {
                            setIsActive(false);
                            playBeep();
                            return 0;
                        }
                        return s - 1;
                    }
                    return s + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isActive, mode]);

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const startCountdown = () => {
        const total = (cdHours * 3600) + (cdMins * 60) + cdSecs;
        if (total > 0) {
            setSeconds(total);
            setIsActive(true);
        }
    };

    return (
        <div className="p-8 bg-zinc-900/40 rounded-[3rem] border border-white/5 space-y-6 max-w-xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="flex bg-black/60 p-1.5 rounded-2xl gap-1">
                {[
                    { id: 'stopwatch', label: 'Cronómetro', icon: Timer },
                    { id: 'countdown', label: 'Temporizador', icon: Clock },
                    { id: 'world', label: 'Reloj Global', icon: Globe }
                ].map(m => (
                    <button key={m.id} onClick={() => { setMode(m.id as any); setIsActive(false); setSeconds(0); }} className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-xl transition-all ${mode === m.id ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}>
                        <m.icon className="w-4 h-4" />
                        <span className="text-[7px] font-black uppercase tracking-widest">{m.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {mode === 'world' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4 py-4">
                        {[
                            { city: 'Lima', zone: 'America/Lima' },
                            { city: 'Madrid', zone: 'Europe/Madrid' },
                            { city: 'Miami', zone: 'America/New_York' },
                            { city: 'Tokio', zone: 'Asia/Tokyo' }
                        ].map(c => (
                            <div key={c.city} className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                                <div className="text-[8px] font-black text-zinc-600 uppercase mb-1 tracking-widest">{c.city}</div>
                                <div className="text-xl font-black text-white">
                                    {new Date().toLocaleTimeString('en-US', { timeZone: c.zone, hour12: false, hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="text-7xl font-black text-white font-mono tracking-widest bg-black/80 py-12 rounded-[2.5rem] border border-white/5 text-center shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,0,50,0.05),transparent)] pointer-events-none" />
                            {formatTime(seconds)}
                        </div>

                        {mode === 'countdown' && !isActive && (
                            <div className="flex items-center justify-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="text-center">
                                    <input type="number" value={cdHours} onChange={e => setCdHours(parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-xl font-black text-white outline-none border-b border-white/10" />
                                    <div className="text-[7px] font-black text-zinc-600 uppercase">H</div>
                                </div>
                                <span className="text-xl font-black text-zinc-800">:</span>
                                <div className="text-center">
                                    <input type="number" value={cdMins} onChange={e => setCdMins(parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-xl font-black text-white outline-none border-b border-white/10" />
                                    <div className="text-[7px] font-black text-zinc-600 uppercase">M</div>
                                </div>
                                <span className="text-xl font-black text-zinc-800">:</span>
                                <div className="text-center">
                                    <input type="number" value={cdSecs} onChange={e => setCdSecs(parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-xl font-black text-white outline-none border-b border-white/10" />
                                    <div className="text-[7px] font-black text-zinc-600 uppercase">S</div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={() => mode === 'countdown' && !isActive ? startCountdown() : setIsActive(!isActive)} className={`flex-[2] py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all ${isActive ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-blis-red text-white shadow-xl shadow-blis-red/20'}`}>
                                {isActive ? 'PAUSAR' : (mode === 'countdown' && seconds === 0 ? 'ESTABLECER' : 'EJECUTAR')}
                            </button>
                            <button onClick={() => { setIsActive(false); setSeconds(0); }} className="px-8 bg-zinc-900 text-zinc-600 rounded-[2rem] border border-white/5 hover:text-white transition-all">
                                <RefreshCcw className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export { TaskTimer };