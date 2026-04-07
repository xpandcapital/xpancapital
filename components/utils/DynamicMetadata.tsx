"use client";

import { useEffect } from "react";
import { useLandingCMS } from "@/context/LandingCMSContext";

export function DynamicMetadata() {
    const { siteConfig } = useLandingCMS();

    useEffect(() => {
        // Update page title
        if (siteConfig?.siteName && siteConfig?.siteTagline) {
            document.title = `${siteConfig.siteName} | ${siteConfig.siteTagline}`;
        }

        // Update favicon
        if (siteConfig?.favicon) {
            const existingFavicon = document.querySelector('link[rel="icon"]');
            if (existingFavicon) {
                existingFavicon.setAttribute('href', siteConfig.favicon);
            } else {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.href = siteConfig.favicon;
                document.head.appendChild(link);
            }
        }

        // Update meta description
        if (siteConfig?.siteTagline) {
            const existingDesc = document.querySelector('meta[name="description"]');
            if (existingDesc) {
                existingDesc.setAttribute('content', siteConfig.siteTagline);
            }
        }

        // Update theme color
        if (siteConfig?.primaryColor) {
            const existingTheme = document.querySelector('meta[name="theme-color"]');
            if (existingTheme) {
                existingTheme.setAttribute('content', siteConfig.primaryColor);
            }
        }

        // Update OG image
        if (siteConfig?.siteName) {
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) {
                ogTitle.setAttribute('content', siteConfig.siteName);
            }
        }
    }, [siteConfig]);

    return null;
}