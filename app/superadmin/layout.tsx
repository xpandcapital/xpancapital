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
        <div className="flex bg-black min-h-[calc(100dvh-80px)]">
            <SuperadminSidebar />
            <div className="flex-1 pt-24 pl-16">
                <div className="max-w-[1600px] mx-auto w-full pb-20">
                    <SuperadminGuard>
                        <GlobalSearch />
                        {children}
                    </SuperadminGuard>
                </div>
            </div>
        </div>
    );
}