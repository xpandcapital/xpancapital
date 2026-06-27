export const dynamic = 'force-dynamic';
import { getCachedLandingTemplate } from "@/lib/cache/template";
import { DynamicSections } from "@/components/layout/DynamicSections";
import { CapturePopup } from "@/components/ui/CapturePopup";
import { SideAnchorNav } from "@/components/ui/SideAnchorNav";

export default async function Home() {
  const template = await getCachedLandingTemplate();

  return (
    <main className="bg-black text-white min-h-screen relative">
      <SideAnchorNav />
      <CapturePopup />
      <DynamicSections
        templateType="landing"
        sectionOrder={template?.sectionOrder as string[] | undefined}
        sectionVisibility={template?.sectionVisibility as Record<string, boolean> | undefined}
        sections={template?.secciones as any}
      />
    </main>
  );
}
