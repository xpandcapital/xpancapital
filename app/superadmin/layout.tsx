import { SuperadminSidebar } from "@/components/superadmin/SuperadminSidebar";
import { SuperadminGuard } from "@/components/superadmin/SuperadminGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-black h-auto md:h-[calc(100vh-80px)] mt-20 overflow-visible md:overflow-hidden selection:bg-blis-red/30 relative">
            <SuperadminSidebar />
            <div className="flex-1 flex flex-col relative z-50 min-w-0 pl-[56px] md:pl-0 transition-[padding] duration-300">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#209f89_0%,transparent_50%)] opacity-[0.03] pointer-events-none" />
                <main className="flex-1 p-0 md:p-0 z-50 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 w-full max-w-full">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <SuperadminGuard>
                            {children}
                        </SuperadminGuard>
                    </div>
                </main>
            </div>
        </div>
    );
}