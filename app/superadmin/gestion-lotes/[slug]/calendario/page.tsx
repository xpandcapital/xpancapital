'use client';

import { useProject } from '../_hooks/ProjectContext';
import { useLotes } from '../_hooks/useLotes';
import { CalendarGrid } from '../_components/CalendarGrid';

export default function CalendarioPage() {
  const { activeProjectId } = useProject();
  const lotes = useLotes(activeProjectId || '');
  return (
    <div className="max-w-7xl mx-auto">
      <CalendarGrid lots={lotes.activeLots} />
    </div>
  );
}
