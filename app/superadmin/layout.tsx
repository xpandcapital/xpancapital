import { SuperadminSidebar } from "@/components/superadmin/SuperadminSidebar";
import { SuperadminGuard } from "@/components/superadmin/SuperadminGuard";
import { GlobalSearch } from "@/components/superadmin/GlobalSearch";

export const dynamic = 'force-dynamic';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-black min-h-[calc(100dvh-80px)] overflow-x-hidden">
            <SuperadminSidebar />
            <div className="flex-1 pt-20 md:pt-24 pl-4 md:pl-6 lg:pl-16">
                <div className="max-w-[1600px] mx-auto w-full pb-20 overflow-x-hidden">
                    <SuperadminGuard>
                        <GlobalSearch />
                        {children}
                    </SuperadminGuard>
                </div>
            </div>
        </div>
    );
}