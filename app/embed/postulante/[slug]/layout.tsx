import { Montserrat } from "next/font/google";
import "../../../globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata = {
  title: "Formulario de Postulación",
  robots: { index: false, follow: false },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${montserrat.variable} font-sans antialiased bg-zinc-950 text-white selection:bg-blis-red/30 selection:text-white`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}