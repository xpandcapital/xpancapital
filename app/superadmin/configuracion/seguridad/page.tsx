"use client";

import { useSearchParams } from 'next/navigation';
import { SidebarSecurity } from './_components';
import { useSecurity } from './_hooks';

export default function SeguridadPage() {
  const searchParams = useSearchParams();
  const initialTool = searchParams.get('tool') || undefined;
  const { config, saving, saveConfig, updateGeobloqueo } = useSecurity();

  return (
    <SidebarSecurity
      initialTool={initialTool}
      geobloqueoConfig={config.geobloqueo}
      saving={saving}
      onSave={saveConfig}
      onUpdateGeobloqueo={updateGeobloqueo}
    />
  );
}
