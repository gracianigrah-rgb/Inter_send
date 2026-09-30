import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-2xl bg-[#001F54] border-2 border-[#FFB703] text-white shadow-[0px_4px_16px_rgba(0,31,84,0.4)] animate-bounce-short text-xs">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB703] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFB703]"></span>
        </span>
        <WifiOff className="w-4 h-4 text-[#FFB703] shrink-0" />
        <div className="leading-tight">
          <span className="font-black text-[#FFB703] block text-[11px]">Mode Hors-Ligne Actif</span>
          <span className="text-[10px] text-slate-300">Données locales & PWA fonctionnelles</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] bg-white/10 px-2 py-0.5 rounded-lg text-emerald-300 font-bold shrink-0">
        <Database className="w-3 h-3" />
        <span>Local</span>
      </div>
    </div>
  );
};
