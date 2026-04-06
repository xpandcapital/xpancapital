import { useState, useCallback } from 'react';

export function useSettings(initialSettings) {
  const [settings, setSettings] = useState(initialSettings);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  return {
    settings,
    setSettings,
    updateSetting,
    updateSettings,
    resetSettings
  };
}