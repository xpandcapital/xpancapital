"use client";

import React, { useState, useEffect } from 'react';
import { getCachedSupabaseStorage } from '@/lib/cachedSupabaseStorage';
import { Loader2 } from 'lucide-react';

export default function GestionDeLotesWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('[Wrapper] Initializing Supabase storage...');
        const storage = getCachedSupabaseStorage();
        await storage.ensureInitialized();
        console.log('[Wrapper] Supabase storage ready');
        setIsReady(true);
      } catch (e) {
        console.error('[Wrapper] Failed to initialize:', e);
        setError(e instanceof Error ? e.message : 'Error initializing');
        setIsReady(true); // Show the app anyway with fallback
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
