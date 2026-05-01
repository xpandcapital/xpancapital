'use client';

import { useState } from 'react';
import { ProjectConfig } from '../_types';

export function useProjectConfig() {
  const [config, setConfig] = useState<ProjectConfig>({
    startMonth: '2025-04',
    signatureMonth: '2026-04',
    escrituraMonth: '2027-01',
    masterplanImage: null,
    lotPins: [],
  });

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addMapPin = (loteNumber: string, x: number, y: number) => {
    setConfig(prev => ({
      ...prev,
      lotPins: [...prev.lotPins, { id: crypto.randomUUID(), loteNumber, x, y }],
    }));
  };

  const removeMapPin = (pinId: string) => {
    setConfig(prev => ({
      ...prev,
      lotPins: prev.lotPins.filter(p => p.id !== pinId),
    }));
  };

  return { config, setConfig, updateConfig, addMapPin, removeMapPin };
}
