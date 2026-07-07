"use client";

import { useState, useEffect, useRef } from "react";

export function CustomCursor() {
    const ringRef = useRef<HTMLDivElement>(null);
    const ringInnerRef = useRef<HTMLDivElement>(null);
    const spinnerRef = useRef<HTMLDivElement>(null);
    const mounted = useRef(false);

    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
            setIsTouchDevice(true);
        }
    }, []);

    const pos = useRef({ x: -999, y: -999 });
    const ringPos = useRef({ x: -999, y: -999 });
    const animFrame = useRef<number>(0);

    useEffect(() => {
        if (mounted.current) return;
        mounted.current = true;
        
        const ring = ringRef.current;
        const ringInner = ringInnerRef.current;
        const spinner = spinnerRef.current;
        if (!ring || !ringInner || !spinner) return;

        let lastHovering = false;
        let touchFadeTimer: ReturnType<typeof setTimeout> | null = null;
        let isTouching = false;

        const onMove = (e: MouseEvent) => {
            if (isTouching) return;
            pos.current.x = e.clientX;
            pos.current.y = e.clientY;

            if (ring.style.opacity === "0") ring.style.opacity = "1";

            const hovering = !!(e.target as HTMLElement).closest('a,button,input,textarea,select,[role="button"],label');
            if (hovering !== lastHovering) {
                lastHovering = hovering;
                if (hovering) {
                    ring.style.width = "52px";
                    ring.style.height = "52px";
                    ringInner.style.border = "2px dashed rgba(190,11,60,0.9)";
                    ringInner.style.background = "rgba(190,11,60,0.06)";
                    spinner.style.display = "block";
                } else {
                    ring.style.width = "36px";
                    ring.style.height = "36px";
                    ringInner.style.border = "1.5px solid rgba(190,11,60,0.85)";
                    ringInner.style.background = "transparent";
                    spinner.style.display = "none";
                }
            }
        };

        const onTouchStart = (e: TouchEvent) => {
            isTouching = true;
            const touch = e.touches[0];
            if (!touch) return;

            if (touchFadeTimer) clearTimeout(touchFadeTimer);

            const x = touch.clientX;
            const y = touch.clientY;
            ringPos.current.x = x;
            ringPos.current.y = y;
            ring.style.transition = "opacity 0.08s ease, width 0.12s ease, height 0.12s ease";
            ring.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
            ring.style.opacity = "1";
            ring.style.width = "44px";
            ring.style.height = "44px";
        };

        const onTouchEnd = () => {
            touchFadeTimer = setTimeout(() => {
                ring.style.transition = "opacity 0.25s ease, width 0.15s ease, height 0.15s ease";
                ring.style.opacity = "0";
                setTimeout(() => {
                    ring.style.width = "36px";
                    ring.style.height = "36px";
                    isTouching = false;
                }, 250);
            }, 50);
        };

        const onLeave = () => { if (!isTouching) ring.style.opacity = "0"; };
        const onEnter = () => { if (!isTouching) ring.style.opacity = "1"; };

        document.addEventListener("mousemove", onMove, { passive: true });
        document.addEventListener("mouseleave", onLeave);
        document.addEventListener("mouseenter", onEnter);
        document.addEventListener("touchstart", onTouchStart, { passive: true });
        document.addEventListener("touchend", onTouchEnd, { passive: true });
        document.addEventListener("touchcancel", onTouchEnd, { passive: true });

        const animate = () => {
            if (!isTouching) {
                ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.4;
                ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.4;
                ring.style.transform = `translate3d(${ringPos.current.x}px,${ringPos.current.y}px,0) translate(-50%,-50%)`;
            }
            animFrame.current = requestAnimationFrame(animate);
        };
        animFrame.current = requestAnimationFrame(animate);

        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseleave", onLeave);
            document.removeEventListener("mouseenter", onEnter);
            document.removeEventListener("touchstart", onTouchStart);
            document.removeEventListener("touchend", onTouchEnd);
            document.removeEventListener("touchcancel", onTouchEnd);
            cancelAnimationFrame(animFrame.current);
            if (touchFadeTimer) clearTimeout(touchFadeTimer);
        };
    }, []);

    if (isTouchDevice) return null;

    return (
        <>
            <div
                ref={ringRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "36px",
                    height: "36px",
                    pointerEvents: "none",
                    zIndex: 99998,
                    opacity: 0,
                    willChange: "transform",
                    transition: "width 0.2s ease, height 0.2s ease, opacity 0.3s ease",
                }}
            >
                <div
                    ref={ringInnerRef}
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: "1.5px solid rgba(190,11,60,0.85)",
                        boxShadow: "0 0 10px 2px rgba(190,11,60,0.5)",
                        background: "transparent",
                        transition: "border 0.15s, background 0.15s",
                    }}
                />
                <div
                    ref={spinnerRef}
                    style={{
                        display: "none",
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: "2px solid transparent",
                        borderTopColor: "rgba(190,11,60,1)",
                        borderRightColor: "rgba(190,11,60,0.4)",
                        animation: "cursor-spin 0.8s linear infinite",
                    }}
                />
            </div>

            <style>{`
                @keyframes cursor-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}