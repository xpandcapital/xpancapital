import { DynamicSections } from "@/components/layout/DynamicSections";
import { CapturePopup } from "@/components/ui/CapturePopup";
import { SideAnchorNav } from "@/components/ui/SideAnchorNav";

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen relative">
      <SideAnchorNav />
      <CapturePopup />
      <DynamicSections />
    </main>
  );
}