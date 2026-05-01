'use client';

import { useRouter } from 'next/navigation';
import { useProject } from '../_hooks/ProjectContext';
import { useLotes } from '../_hooks/useLotes';
import { useProjectConfig } from '../_hooks/useProjectConfig';
import { MasterplanMap, MasterplanPinsList } from '../_components/MasterplanMap';

export default function MasterplanPage() {
  const { activeProjectId, slug } = useProject();
  const router = useRouter();
  const lotes = useLotes(activeProjectId || '');
  const { config, addMapPin, removeMapPin } = useProjectConfig();

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const num = prompt('Ingresa SOLO el numero del lote:');
    if (num && /^\d+$/.test(num.trim())) addMapPin(num.trim(), x, y);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4">
        <MasterplanMap config={config} lots={lotes.activeLots} onMapClick={handleMapClick} onRemovePin={removeMapPin} onSelectLot={(lotId) => router.push(`/superadmin/gestion-lotes/${slug}/lote/${lotId}`)} />
        <MasterplanPinsList config={config} lots={lotes.activeLots} onSelectLot={(lotId) => router.push(`/superadmin/gestion-lotes/${slug}/lote/${lotId}`)} />
      </div>
    </div>
  );
}
