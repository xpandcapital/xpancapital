"use client";

import { useSearchParams } from 'next/navigation';
import { SidebarSecurity } from './_components';
import { useSecurity } from './_hooks';

export default function SeguridadPage() {
  const searchParams = useSearchParams();
  const initialTool = searchParams.get('tool') || undefined;
  const {
    config,
    saving,
    saveConfig,
    updateGeobloqueo,
    updateSecurityHeaders,
    updateRateLimiting,
  } = useSecurity();

  return (
    <SidebarSecurity
      initialTool={initialTool}
      geobloqueoConfig={config.geobloqueo}
      securityHeadersConfig={config.security_headers}
      rateLimitingConfig={config.rate_limiting}
      saving={saving}
      onSave={saveConfig}
      onUpdateGeobloqueo={updateGeobloqueo}
      onUpdateSecurityHeaders={updateSecurityHeaders}
      onUpdateRateLimiting={updateRateLimiting}
    />
  );
}
