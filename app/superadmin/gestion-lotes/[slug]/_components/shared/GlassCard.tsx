'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', padding = 'p-5', hover = false }: GlassCardProps) {
  return (
    <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl ${padding} ${hover ? 'hover:bg-white/[0.05] transition-all' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface SubCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SubCard({ children, className = '' }: SubCardProps) {
  return (
    <div className={`bg-white/[0.02] backdrop-blur-sm border border-white/[0.04] rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}
