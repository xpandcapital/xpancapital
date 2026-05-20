import { Loader2 } from "lucide-react";

export function SectionSkeleton() {
  return (
    <section className="pt-10 md:pt-20 pb-24 bg-black relative">
      <div className="container mx-auto px-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    </section>
  );
}
