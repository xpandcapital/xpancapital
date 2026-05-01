import { SuperadminSidebar } from "@/components/superadmin/SuperadminSidebar";
import { SuperadminGuard } from "@/components/superadmin/SuperadminGuard";

export const dynamic = 'force-dynamic';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-black h-[calc(100dvh-80px)] overflow-hidden relative">
            <SuperadminSidebar />
            <div className="h-full flex-1 flex flex-col min-h-0 relative z-50 min-w-0 pl-[56px] md:pl-0 pt-24">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#209f89_0%,transparent_50%)] opacity-[0.03] pointer-events-none" />
                <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 w-full bg-black">
                    <div className="max-w-[1600px] mx-auto w-full flex flex-col pb-20">
                        <SuperadminGuard>
                            {children}
                        </SuperadminGuard>
                    </div>
                </main>
            </div>
        </div>
    );
}