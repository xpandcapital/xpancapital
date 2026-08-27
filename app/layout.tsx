import type { Metadata } from "next";
import { Montserrat, Geist } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xpand Capital | Academia de Trading & Forex",
  description: "Educación financiera de élite y estrategias de inversión diseñadas para generar resultados reales en el mercado de divisas.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/favicon%20xpand.png",
    apple: "/images/favicon%20xpand.png",
  },
};

export const viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("scroll-smooth", "font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if(window.location.hash.includes("type=recovery")&&!window.location.pathname.startsWith("/reset-password"))window.location.replace("/reset-password"+window.location.hash)` }} />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased bg-[#050505] text-white`}>
        <LayoutShell>{children}</LayoutShell>
        <Analytics />
      </body>
    </html>
  );
}
