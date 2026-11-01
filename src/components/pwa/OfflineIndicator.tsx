import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside 
      aria-label="Offline Mode Notice"
      className="fixed bottom-14 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 p-3 rounded-xl border border-amber-500/40 bg-[#0c0d16]/95 backdrop-blur-md shadow-2xl text-amber-200 animate-slideUp font-sans"
    >
      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4 text-amber-400" />
      </div>
      <div className="text-xs leading-tight">
        <div className="flex items-center gap-1.5 font-semibold font-mono text-amber-300">
          <span>OFFLINE MODE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </div>
        <p className="text-[11px] text-amber-200/80 mt-0.5">
          Cached mission shell is active. Live NASA ephemeris and telemetry calculations require reconnection.
        </p>
      </div>
    </aside>
  );
};
