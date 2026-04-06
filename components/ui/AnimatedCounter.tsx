"use client";

import { useState, useEffect, useRef } from "react";

interface AnimatedCounterProps {
    target: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    className?: string;
}

export function AnimatedCounter({ target, prefix = "", suffix = "", duration = 2000, className = "" }: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const startTime = performance.now();
                    const animate = (currentTime: number) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.round(eased * target));
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
        <span ref={ref} className={`tabular-nums ${className}`}>
            {prefix}{count}{suffix}
        </span>
    );
}
