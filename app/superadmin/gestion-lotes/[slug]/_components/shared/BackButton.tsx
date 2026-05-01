'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export function BackButton({ href, label = 'Volver' }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-3 py-1.5 rounded-lg"
    >
      <ChevronLeft className="w-3.5 h-3.5" />
      {label}
    </Link>
  );
}
