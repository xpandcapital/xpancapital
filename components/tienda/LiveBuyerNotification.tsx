"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";

const BUYERS = [
    { name: "Carlos M.", flagCode: "co" },
    { name: "Ana S.", flagCode: "mx" },
    { name: "Felipe R.", flagCode: "co" },
    { name: "Mariana L.", flagCode: "pe" },
    { name: "Roberto T.", flagCode: "ec" },
    { name: "Elena C.", flagCode: "ar" },
    { name: "Andrea P.", flagCode: "cl" },
    { name: "Diego J.", flagCode: "co" },
    { name: "Mauricio G.", flagCode: "ve" },
    { name: "Sofia M.", flagCode: "co" },
    { name: "Javier L.", flagCode: "mx" },
    { name: "Camila R.", flagCode: "pe" },
];

interface LiveBuyerNotificationProps {
    products?: string[];
    data?: any;
}

export function LiveBuyerNotification({ products }: LiveBuyerNotificationProps) {
    const [notification, setNotification] = useState<{ name: string; flagCode: string; product: string; time: number } | null>(null);
    const productNames = products && products.length > 0 ? products : [
        "Plan Anual",
        "Plan Trimestral",
    ];

    useEffect(() => {
        const showRandomNotification = () => {
            const randomBuyer = BUYERS[Math.floor(Math.random() * BUYERS.length)];
            // 80% Anual, 20% Trimestral
            const randomProduct = Math.random() < 0.8 ? productNames[0] : productNames[1];
            const randomTime = Math.floor(Math.random() * 59) + 1;

            setNotification({
                name: randomBuyer.name,
                flagCode: randomBuyer.flagCode,
                product: randomProduct,
                time: randomTime
            });

            // Hide after 8.5 seconds para ser mas legible como solicitó el usuario
            setTimeout(() => {
                setNotification(null);
            }, 8500);

            // Schedule next one
            const nextInterval = Math.floor(Math.random() * (30000 - 10000 + 1) + 10000);
            setTimeout(showRandomNotification, nextInterval);
        };

        // First notification logic
        const initialDelay = setTimeout(showRandomNotification, 2000);
        return () => clearTimeout(initialDelay);
    }, []);

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: 20, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="fixed bottom-4 left-4 md:left-[272px] z-[70] bg-black/95 backdrop-blur-2xl p-4 pr-10 rounded-2xl border-2 border-[#209f89] shadow-[0_0_40px_rgba(32,159,137,0.6)] flex items-start gap-4 w-[calc(100%-32px)] md:w-[300px] pointer-events-auto"
                >
                    <button onClick={() => setNotification(null)} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10">
                        <X className="w-4 h-4" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-[#209f89]/20 border border-[#209f89] flex flex-shrink-0 items-center justify-center relative mt-1">
                        <div className="absolute inset-0 rounded-full border border-[#209f89] animate-ping opacity-70" />
                        <ShoppingBag className="w-4 h-4 text-[#209f89]" />
                    </div>

                    <div className="overflow-hidden flex-1 relative z-10">
                        <p className="text-white text-sm font-black leading-tight truncate">
                            {notification.name} <span className="text-gray-400 font-normal text-xs">compró</span>
                        </p>
                        <p className="text-blis-red font-black text-[13px] mt-1 line-clamp-2 leading-tight">
                            {notification.product}
                        </p>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1.5">
                            Hace {notification.time} {notification.time === 1 ? 'min' : 'mins'}
                        </p>
                    </div>

                    {/* Flag prominent in bottom right of the notification box */}
                    <div
                        className="absolute bottom-3 right-4 w-7 h-5 rounded-sm overflow-hidden border border-white/20 shadow-[0_2px_5px_rgba(0,0,0,0.5)] z-0"
                        title="País de compra"
                    >
                        <Image
                            src={`https://flagcdn.com/w40/${notification.flagCode}.png`}
                            alt={`Bandera de ${notification.flagCode}`}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
