export const dynamic = 'force-dynamic';
import { getCachedLandingTemplate } from "@/lib/cache/template";
import { getCachedProjects, getCachedProducts, getCachedCategories } from "@/lib/cache/data";
import { DynamicSections } from "@/components/layout/DynamicSections";
import { CapturePopup } from "@/components/ui/CapturePopup";
import { SideAnchorNav } from "@/components/ui/SideAnchorNav";

export default async function Home() {
  const template = await getCachedLandingTemplate();

  let projects: any[] = [];
  let products: any[] = [];
  let categories: any[] = [];

  try {
    [projects, products, categories] = await Promise.all([
      getCachedProjects(),
      getCachedProducts(),
      getCachedCategories(),
    ]);
  } catch {
    // Si falla la precarga, los componentes harán su propia carga en el cliente
  }

  return (
    <main className="bg-black text-white min-h-screen relative">
      <SideAnchorNav />
      <CapturePopup />
      <DynamicSections
        templateType="landing"
        sectionOrder={template?.sectionOrder}
        sectionVisibility={template?.sectionVisibility}
        sections={template?.secciones}
        initialProjects={projects}
        initialProducts={products}
        initialCategories={categories}
      />
    </main>
  );
}
