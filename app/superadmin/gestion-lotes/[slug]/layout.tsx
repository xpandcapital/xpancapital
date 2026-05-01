'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useGestionLotes } from './_hooks/useGestionLotes';
import { NavigationHeader } from './_components/NavigationHeader';
import { LoadingSpinner } from './_components/LoadingSpinner';
import { ProjectProvider } from './_hooks/ProjectContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params?.slug as string;

  const { isLoading, projects, activeProjectId, activeProjectName, activeProjectLogo } = useGestionLotes(slug);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ProjectProvider value={{ projects, activeProjectId, activeProjectName, activeProjectLogo, slug }}>
      <div className="h-full bg-black overflow-auto pt-10">
        <style>{`
          .color-invert::-webkit-calendar-picker-indicator { filter: invert(1); }
          .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
          .scrollbar-thin::-webkit-scrollbar-track { background: #000; }
          .scrollbar-thin::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        `}</style>

        <NavigationHeader
          projectSlug={slug}
          projectName={activeProjectName || projects.find(p => p.id === activeProjectId)?.name || ''}
          projectLogo={activeProjectLogo}
          projects={projects}
          activeProjectId={activeProjectId || ''}
        />

        <main className="p-4 md:p-6 pb-32">
          {children}
        </main>
      </div>
    </ProjectProvider>
  );
}

export default function GestionLotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
