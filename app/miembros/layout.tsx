"use client";

import { MiembrosSidebar } from "@/components/miembros/MiembrosSidebar";
import { MiembrosHeader } from "@/components/miembros/MiembrosHeader";

export default function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-black h-[calc(100vh-80px)] mt-20 overflow-hidden selection:bg-blis-red/30 relative">
            <MiembrosSidebar />
            <div className="flex-1 flex flex-col relative min-w-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(213,193,8,0.05)_0%,transparent_50%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

                <main className="flex-1 z-10 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

