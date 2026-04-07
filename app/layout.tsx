import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/sections/Header";
import { CursorWrapper } from "@/components/ui/CursorWrapper";
import { AuthProvider } from "@/hooks/useAuth";
import { ShopProvider } from "@/context/ShopContext";
import { SalesProvider } from "@/context/SalesContext";
import { ToastProvider } from "@/components/ui/Toast";
import { LandingCMSProvider } from "@/context/LandingCMSContext";
import { PWARegistrar } from "@/components/utils/PWARegistrar";
import { DynamicMetadata } from "@/components/utils/DynamicMetadata";

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
    <html lang="es" className="scroll-smooth">
      <body className={`${montserrat.variable} font-sans antialiased bg-black text-white selection:bg-blis-red/30 selection:text-white cyber-texture`}>
<LandingCMSProvider>
          <DynamicMetadata />
          <AuthProvider>
            <ToastProvider>
              <ShopProvider>
                <SalesProvider>
                  <CursorWrapper />
                  <PWARegistrar />
                  <Header />
                  {children}
                </SalesProvider>
              </ShopProvider>
            </ToastProvider>
          </AuthProvider>
        </LandingCMSProvider>
      </body>
    </html>
  );
}