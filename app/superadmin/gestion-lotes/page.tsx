"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function GestionLotesIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al selector de proyectos (slug _none_)
    router.replace('/superadmin/gestion-lotes/_none_');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <Loader2 className="w-10 h-10 text-blis-red animate-spin" />
    </div>
  );
}