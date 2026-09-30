import React, { useEffect, useState } from 'react';
import { IntersendEmblem } from './BrandLogos';

interface SplashLoadingProps {
  onComplete: () => void;
}

export const SplashLoading: React.FC<SplashLoadingProps> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 2.2 seconds display then smooth fade out to login/onboarding screen
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        onComplete();
      }, 350);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      onClick={() => onComplete()}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-400 select-none cursor-pointer ${
        fading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      title="Chargement..."
    >
      {/* Background subtle radial ambient glow */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-[#16C3FF]/20 via-[#0A6CF1]/15 to-[#FFB703]/10 blur-3xl pointer-events-none animate-pulse" />

      {/* Screen center: UNIQUEMENT LE LOGO D'INTERSEND */}
      <div className="relative flex flex-col items-center justify-center p-6">
        {/* Animated logo container with tactile border and shadow */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-[36px] bg-white border-4 border-[#001F54] shadow-[0px_10px_0px_#001F54] flex items-center justify-center p-3 transition-transform duration-300 transform hover:scale-105 animate-bounce-short">
          <IntersendEmblem size={135} />
        </div>

        {/* Brand name wordmark below emblem: intersend. */}
        <div className="mt-6 flex items-baseline font-display font-black text-4xl sm:text-5xl tracking-tight text-[#001F54]">
          <span className="relative inline-block">
            {/* Signature cyan dot over 'i' */}
            <span className="absolute top-[-0.18em] left-[0.12em] w-[0.26em] h-[0.26em] rounded-full bg-[#16C3FF] shadow-sm inline-block" />
            <span style={{ clipPath: 'polygon(0 30%, 100% 30%, 100% 100%, 0 100%)' }}>i</span>
          </span>
          <span>ntersend</span>
          {/* Signature cyan period */}
          <span className="inline-block w-[0.24em] h-[0.24em] rounded-full bg-[#16C3FF] ml-[0.06em] shadow-sm" />
        </div>

        {/* Minimalist discreet loading shimmer line */}
        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-6 border border-[#001F54]/20">
          <div className="h-full w-1/2 bg-gradient-to-r from-[#0A6CF1] to-[#16C3FF] rounded-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
};
