'use client';

import { Tag } from 'lucide-react';

interface TagsPanelProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export default function TagsPanel({ tags, tagInput, onTagInputChange, onAddTag, onRemoveTag }: TagsPanelProps) {
  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <Tag className="w-4 h-4 text-gray-400" />
        Tags
      </h3>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={tagInput}
          onChange={e => onTagInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
          placeholder="Agregar tag..."
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm"
        />
        <button
          onClick={onAddTag}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs font-bold">
            {tag}
            <button onClick={() => onRemoveTag(tag)} className="text-gray-400 hover:text-white">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
