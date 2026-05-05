import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blis Corp | Luxury Tech Real Estate",
  description: "El futuro de las inversiones inmobiliarias",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/pwa-icon.png",
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
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
      <body className={`${montserrat.variable} font-sans antialiased bg-black text-white selection:bg-blis-red/30 selection:text-white`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
