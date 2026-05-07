'use client';

import { Eye } from 'lucide-react';

interface SeoPanelProps {
  seoTitle: string;
  seoDescription: string;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
}

export default function SeoPanel({ seoTitle, seoDescription, onSeoTitleChange, onSeoDescriptionChange }: SeoPanelProps) {
  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <Eye className="w-4 h-4 text-gray-400" />
        SEO
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Title</label>
          <input
            type="text"
            value={seoTitle}
            onChange={e => onSeoTitleChange(e.target.value)}
            placeholder="Título para buscadores"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Description</label>
          <textarea
            value={seoDescription}
            onChange={e => onSeoDescriptionChange(e.target.value)}
            placeholder="Descripción para buscadores"
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}
