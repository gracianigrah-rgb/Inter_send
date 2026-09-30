import React from 'react';

interface AfricanPatternProps {
  className?: string;
  variant?: 'strip' | 'banner' | 'corner' | 'badge';
  color?: string;
}

export const AfricanPatternStrip: React.FC<{ className?: string; height?: number }> = ({ 
  className = '', 
  height = 12 
}) => {
  return (
    <div 
      className={`w-full overflow-hidden flex items-center select-none ${className}`} 
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg 
        width="100%" 
        height={height} 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="repeat-x"
      >
        <defs>
          <pattern id="african-chevron-pattern" width="36" height={height} patternUnits="userSpaceOnUse">
            {/* Top & bottom border lines */}
            <line x1="0" y1="0" x2="36" y2="0" stroke="#FFB703" strokeWidth="1.5" />
            <line x1="0" y1={height} x2="36" y2={height} stroke="#16C3FF" strokeWidth="1.5" />
            
            {/* Geometric African Chevron triangles */}
            <polygon points="0,0 9,10 18,0" fill="#FFB703" opacity="0.9" />
            <polygon points="18,0 27,10 36,0" fill="#16C3FF" opacity="0.9" />
            <polygon points="9,10 18,0 27,10" fill="#0A6CF1" opacity="0.95" />
            <polygon points="0,12 9,2 18,12" fill="#001F54" opacity="0.8" />
            <polygon points="18,12 27,2 36,12" fill="#FFB703" opacity="0.9" />
            <circle cx="18" cy="5" r="1.5" fill="#DFF6FF" />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill="url(#african-chevron-pattern)" />
      </svg>
    </div>
  );
};

export const AfricanShieldIcon: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 3C27 7 35 6 35 18C35 28 26 35 20 38C14 35 5 28 5 18C5 6 13 7 20 3Z" fill="#001F54" stroke="#FFB703" strokeWidth="2.5"/>
      <path d="M20 7V34" stroke="#FFB703" strokeWidth="2" strokeDasharray="3 2"/>
      <circle cx="20" cy="20" r="5" fill="#0A6CF1" stroke="#16C3FF" strokeWidth="1.5"/>
      <path d="M12 16L20 22L28 16" stroke="#DFF6FF" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 24L20 30L28 24" stroke="#FFB703" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

export const AfricanMotifBanner: React.FC<{ title: string; subtitle?: string; className?: string }> = ({
  title,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#001F54] text-white p-5 border-3 border-[#001F54] shadow-[4px_4px_0px_#001F54] ${className}`}>
      {/* Decorative background geometry */}
      <div className="absolute right-0 top-0 bottom-0 w-36 opacity-15 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <polygon points="50,10 90,90 10,90" stroke="#FFB703" strokeWidth="4" />
          <polygon points="50,25 75,75 25,75" stroke="#16C3FF" strokeWidth="3" />
          <circle cx="50" cy="55" r="10" fill="#FFB703" />
        </svg>
      </div>

      <AfricanPatternStrip className="mb-3 rounded" height={8} />

      <h2 className="text-xl font-bold tracking-tight text-white font-display flex items-center gap-2">
        <AfricanShieldIcon size={24} />
        {title}
      </h2>
      {subtitle && <p className="text-sm text-[#DFF6FF]/90 mt-1">{subtitle}</p>}
    </div>
  );
};
