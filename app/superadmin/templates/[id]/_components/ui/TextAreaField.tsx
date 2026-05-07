export function TextAreaField({ label, value, onChange, rows = 3, placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div className="mt-2">
      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-blis-red outline-none transition-colors resize-none"
      />
    </div>
  );
}
