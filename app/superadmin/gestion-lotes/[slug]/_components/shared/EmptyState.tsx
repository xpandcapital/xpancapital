'use client';

import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
        {icon || <FolderOpen className="w-8 h-8 text-zinc-600" />}
      </div>
      <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider">{title}</h3>
      {description && <p className="text-xs text-zinc-600 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
