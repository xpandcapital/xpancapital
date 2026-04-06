"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface FloatingLottieProps {
    url: string;
    className?: string;
}

export function FloatingLottie({ url, className }: FloatingLottieProps) {
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        fetch(url)
            .then(async (res) => {
                if (!res.ok) throw new Error("Fetch failed");
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return res.json();
                } else {
                    throw new Error("Not a JSON response");
                }
            })
            .then((data) => setAnimationData(data))
            .catch(() => {
                // Silently swallow errors (e.g. CORS, 403, XML instead of JSON) 
                // to prevent Next.js red overlay from ruining the UI experience.
            });
    }, [url]);

    if (!animationData) return null;

    return (
        <div className={className}>
            <Lottie animationData={animationData} loop={true} autoplay={true} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}
