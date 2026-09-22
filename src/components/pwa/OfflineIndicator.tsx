import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-center sm:justify-start gap-2 rounded-xl bg-amber-600 dark:bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-amber-950/20 border border-amber-500/40 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
      <span>Offline Mode — Cached data is active. Reconnect to sync.</span>
    </div>
  );
};
