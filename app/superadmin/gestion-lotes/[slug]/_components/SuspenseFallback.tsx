import { Loader2 } from 'lucide-react';

export function SuspenseFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <Loader2 className="w-10 h-10 text-blis-red animate-spin" />
    </div>
  );
}