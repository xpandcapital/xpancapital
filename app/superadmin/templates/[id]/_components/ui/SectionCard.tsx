export function SectionCard({ title, dimension, children }: { title: string; dimension?: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {dimension && <span className="text-xs text-gray-500">{dimension}</span>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
