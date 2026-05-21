"use client";

import { useState, useEffect, useRef } from "react";

interface AnimatedCounterProps {
    target: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    className?: string;
}

const SCRAMBLE_CHARS = "0123456789";

export function AnimatedCounter({ target, prefix = "", suffix = "", duration = 2000, className = "" }: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const [scrambling, setScrambling] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const startTime = performance.now();
                    const scrambleUntil = duration * 0.35;
                    let lastScramble = 0;
                    const animate = (currentTime: number) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        if (elapsed < scrambleUntil) {
                            // Fase scramble: dígitos aleatorios cambian rápido
                            setScrambling(true);
                            if (elapsed - lastScramble > 50) {
                                lastScramble = elapsed;
                                const r = Math.round(target * (0.15 + Math.random() * 0.7));
                                setCount(r);
                            }
                        } else {
                            // Fase settle: ease-out cubic hacia el valor real
                            setScrambling(false);
                            const settleProgress = (elapsed - scrambleUntil) / (duration - scrambleUntil);
                            const eased = 1 - Math.pow(1 - settleProgress, 3);
                            const finalProgress = 0.35 + 0.65 * eased;
                            setCount(Math.round(finalProgress * target));
                        }
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return (
        <span ref={ref} className={`tabular-nums ${scrambling ? "animate-pulse" : ""} ${className}`}>
            {prefix}{count}{suffix}
        </span>
    );
}
