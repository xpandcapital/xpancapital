'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calculator, ChevronDown, LayoutDashboard, Map as MapIcon,
  Trophy, Settings, Calendar as CalendarIcon, X, Menu,
} from 'lucide-react';

interface NavigationHeaderProps {
  projectSlug: string;
  projectName: string;
  projectLogo: string | null;
  projects: { id: string; name: string; slug?: string }[];
  activeProjectId: string;
}

export function NavigationHeader({
  projectSlug,
  projectName,
  projectLogo,
  projects,
  activeProjectId,
}: NavigationHeaderProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path: string) => pathname?.includes(path) || (path === '' && pathname === `/superadmin/gestion-lotes/${projectSlug}`);

  const tabs = [
    { path: '', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendario', label: 'Calendario', icon: CalendarIcon },
    { path: '/masterplan', label: 'Masterplan', icon: MapIcon },
    { path: '/sorteos', label: 'Sorteos', icon: Trophy },
    { path: '/configuracion', label: 'Configuracion', icon: Settings },
  ];

  const getSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  return (
    <header className="z-50 mx-4">
      <div className="max-w-7xl mx-auto bg-black/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl">
        <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Logo + Title + Project Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {projectLogo ? (
              <img src={projectLogo} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1.5" />
            ) : (
              <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <Calculator className="w-6 h-6 text-rose-500" />
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              {/* Titulo + Dropdown unificado */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 text-sm md:text-base font-black text-white cursor-pointer hover:text-zinc-200 transition-colors"
                >
                  <span>Gestion de Lotes</span>
                  <span className="text-rose-500">|</span>
                  <span className="text-zinc-400 truncate">{projectName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-black border border-white/[0.06] rounded-xl shadow-2xl z-50 overflow-hidden min-w-[200px]">
                    {projects.map(p => (
                      <Link
                        key={p.id}
                        href={`/superadmin/gestion-lotes/${p.slug || getSlug(p.name)}`}
                        onClick={() => setDropdownOpen(false)}
                        className={`block w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          p.id === activeProjectId ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden md:flex bg-black/60 p-1 rounded-xl border border-white/[0.06] gap-1">
            {tabs.map(tab => (
              <Link
                key={tab.path}
                href={tab.path ? `/superadmin/gestion-lotes/${projectSlug}${tab.path}` : `/superadmin/gestion-lotes/${projectSlug}`}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isActive(tab.path)
                    ? 'bg-rose-500 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 bg-white/[0.03] border border-white/[0.06] rounded-xl"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/[0.06] px-4 py-3 space-y-1">
            {tabs.map(tab => (
              <Link
                key={tab.path}
                href={tab.path ? `/superadmin/gestion-lotes/${projectSlug}${tab.path}` : `/superadmin/gestion-lotes/${projectSlug}`}
                onClick={() => setMobileOpen(false)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive(tab.path) ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:bg-white/[0.05]'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 inline mr-2" />
                {tab.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
