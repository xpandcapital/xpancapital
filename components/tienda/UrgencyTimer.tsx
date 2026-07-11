"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";

export function UrgencyTimer() {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Timer Logic based on strictly kept localStorage so it stays realistic
        const initTimer = () => {
            const now = new Date().getTime();
            const storedEndTime = localStorage.getItem("shopDeadline");

            let endTime;
            if (!storedEndTime || parseInt(storedEndTime) < now) {
                // Set new 24h deadline
                endTime = now + 24 * 60 * 60 * 1000;
                localStorage.setItem("shopDeadline", endTime.toString());
            } else {
                endTime = parseInt(storedEndTime);
            }

            return endTime;
        };

        const targetTime = initTimer();

        const calculateTimeLeft = () => {
            const difference = targetTime - new Date().getTime();

            if (difference > 0) {
                return {
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return { hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!isMounted || !timeLeft) return null;

    const formatNum = (num: number) => num.toString().padStart(2, '0');

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-blis-red/10 border border-blis-red/30 rounded-2xl md:rounded-xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 relative overflow-hidden group"
            >
                {/* Pulse background effect */}
                <div className="absolute inset-0 bg-blis-red opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full animate-[shimmer_3s_infinite]" />

                <div className="flex items-center gap-3 z-10">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blis-red/20 flex items-center justify-center animate-pulse">
                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-blis-red" />
                    </div>
                    <div>
                        <h4 className="text-white font-black uppercase text-xs md:text-base tracking-wide leading-none md:leading-normal">
                            Oferta Flash Finaliza Pronto
                        </h4>
                        <p className="text-gray-400 text-[9px] md:text-xs mt-0.5">
                            Bloquea tu precio antes que el stock digital rote.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 z-10 scale-90 md:scale-100 origin-center md:origin-right">
                    <TimeUnit value={formatNum(timeLeft.hours)} label="HRS" />
                    <span className="text-blis-red font-black text-lg md:text-xl animate-pulse">:</span>
                    <TimeUnit value={formatNum(timeLeft.minutes)} label="MIN" />
                    <span className="text-blis-red font-black text-lg md:text-xl animate-pulse">:</span>
                    <TimeUnit value={formatNum(timeLeft.seconds)} label="SEG" />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function TimeUnit({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-black/80 border border-blis-red/40 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(213,193,8,0.2)]">
                <span className="text-white font-mono text-lg md:text-xl font-bold">{value}</span>
            </div>
            <span className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                {label}
            </span>
        </div>
    );
}

