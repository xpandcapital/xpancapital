"use client";

import React, { useState, useEffect } from 'react';
import { getCachedSupabaseStorage } from '@/lib/cachedSupabaseStorage';
import { Loader2 } from 'lucide-react';
import logger from '@/lib/utils/logger';

export default function SupabaseStorageProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        logger.debug('[SupabaseStorageProvider] Starting initialization...');
        const storage = getCachedSupabaseStorage();
        await storage.ensureInitialized();
        
        // Create proxy
        const proxy = {
          getItem: (key: string) => storage.getItem(key),
          setItem: (key: string, value: string) => storage.setItem(key, value),
          removeItem: (key: string) => storage.removeItem(key),
          key: (index: number) => {
            const keys = storage.getKeys();
            return keys[index] || null;
          },
          get length() {
            return storage.getKeys().length;
          },
          clear: () => {
            storage.getKeys().forEach(key => storage.removeItem(key));
          },
        };
        
        // Override localStorage
        Object.defineProperty(window, 'localStorage', {
          value: proxy,
          writable: false,
          configurable: true,
        });
        
        logger.debug('[SupabaseStorageProvider] localStorage overridden successfully');
        setIsReady(true);
      } catch (e) {
        logger.error('[SupabaseStorageProvider] Failed to initialize:', e);
        setIsReady(true); // Continue anyway with fallback
      }
    };
    
    init();
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blis-red animate-spin" />
          <p className="text-gray-400 text-sm">Conectando con base de datos...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
