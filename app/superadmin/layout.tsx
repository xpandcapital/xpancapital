import { SuperadminSidebar } from "@/components/superadmin/SuperadminSidebar";
import { SuperadminGuard } from "@/components/superadmin/SuperadminGuard";

export const dynamic = 'force-dynamic';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-black min-h-[calc(100dvh-80px)]">
            <SuperadminSidebar />
            <div className="flex-1 pt-24 pl-[56px] md:pl-0">
                <div className="max-w-[1600px] mx-auto w-full pb-20">
                    <SuperadminGuard>
                        {children}
                    </SuperadminGuard>
                </div>
            </div>
        </div>
    );
}