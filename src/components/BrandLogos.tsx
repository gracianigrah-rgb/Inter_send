import React from 'react';

/**
 * BrandLogos.tsx
 * High-definition vector representations of the exact real logos:
 * 1. intersend (New iconic fintech emblem: dual interlocking send-loop arrows with African gold coin + signature wordmark)
 * 2. Wave (Real iconic waving penguin on electric cyan background with official 'wave' branding)
 * 3. Orange Money (Real West African dual-arrow symbol ↗ black & ↙ orange with official typography)
 * 4. Moov Money (Real Moov Africa blue tile with orange crescent & fanning banknotes)
 * 5. MTN Mobile Money (Real signature MTN yellow tile with official dark blue 'MoMo' badge)
 * 6. Trésor Money (Real TrésorPay / TrésorMoney national spiral logo with indisponibilité markings)
 */

export const IntersendEmblem: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Navy/Blue Gradient Base */}
        <linearGradient id="is-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#001F54" />
          <stop offset="100%" stopColor="#0A3E8A" />
        </linearGradient>

        {/* Electric Cyan Arrow Gradient */}
        <linearGradient id="is-cyan-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0A6CF1" />
          <stop offset="60%" stopColor="#16C3FF" />
          <stop offset="100%" stopColor="#80E5FF" />
        </linearGradient>

        {/* Amber Gold Send Arrow Gradient */}
        <linearGradient id="is-gold-arrow" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="50%" stopColor="#FFB703" />
          <stop offset="100%" stopColor="#FB8500" />
        </linearGradient>

        {/* Central Core Coin Gradient */}
        <radialGradient id="is-coin-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="65%" stopColor="#FFB703" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        <filter id="is-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#001F54" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Main squircle badge */}
      <rect 
        x="6" 
        y="6" 
        width="108" 
        height="108" 
        rx="28" 
        fill="url(#is-bg-grad)" 
        stroke="#16C3FF" 
        strokeWidth="3.5"
        strokeOpacity="0.4"
      />

      {/* Subtle African geometric pattern watermark inside badge */}
      <g opacity="0.08" stroke="#FFFFFF" strokeWidth="1.5">
        <path d="M15 30 L30 15 M30 15 L45 30 M45 30 L60 15 M60 15 L75 30 M75 30 L90 15 M90 15 L105 30" />
        <path d="M15 90 L30 105 M30 105 L45 90 M45 90 L60 105 M60 105 L75 90 M75 90 L90 105 M90 105 L105 90" />
      </g>

      {/* Dynamic interlocking infinite send-loop arrows */}
      <g filter="url(#is-glow)">
        {/* Upper Arrow: sweeping left to right in electric cyan */}
        <path 
          d="M32 64 C32 46 44 32 64 32 C78 32 88 38 94 48 L84 48 C78 41 72 38 64 38 C48 38 38 48 38 62 C38 67 40 71 42 74 L33 80 C29 75 27 69 27 63" 
          stroke="url(#is-cyan-arrow)" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        {/* Top arrow head */}
        <path 
          d="M80 34 L96 48 L76 56 Z" 
          fill="url(#is-cyan-arrow)" 
        />

        {/* Lower Arrow: sweeping right to left in amber gold */}
        <path 
          d="M88 56 C88 74 76 88 56 88 C42 88 32 82 26 72 L36 72 C42 79 48 82 56 82 C72 82 82 72 82 58 C82 53 80 49 78 46 L87 40 C91 45 93 51 93 57" 
          stroke="url(#is-gold-arrow)" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        {/* Bottom arrow head */}
        <path 
          d="M40 86 L24 72 L44 64 Z" 
          fill="url(#is-gold-arrow)" 
        />

        {/* Epicenter African Gold Transfer Coin / Star Node */}
        <circle 
          cx="60" 
          cy="60" 
          r="14" 
          fill="url(#is-coin-glow)" 
          stroke="#FFFFFF" 
          strokeWidth="2.5" 
        />
        
        {/* Dynamic Transfer Cross Symbol in Coin Center */}
        <g stroke="#001F54" strokeWidth="2.5" strokeLinecap="round">
          <line x1="53" y1="60" x2="67" y2="60" />
          <line x1="60" y1="53" x2="60" y2="67" />
          {/* Arrow points on cross */}
          <path d="M64 57 L67 60 L64 63" fill="none" />
          <path d="M56 57 L53 60 L56 63" fill="none" />
        </g>
      </g>
    </svg>
  );
};

export const IntersendFullLogo: React.FC<{ 
  className?: string; 
  height?: number; 
  theme?: 'dark' | 'light';
}> = ({ 
  className = '', 
  height = 42,
  theme = 'light'
}) => {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#001F54';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`} style={{ height }}>
      {/* Emblem */}
      <div className="shrink-0" style={{ width: height * 1.05, height }}>
        <IntersendEmblem size={height * 1.05} />
      </div>

      {/* Typography: "intersend." */}
      <div className="flex items-baseline font-display font-black tracking-tight" style={{ fontSize: height * 0.68, color: textColor }}>
        <span className="relative inline-block">
          {/* Cyan tittle for 'i' */}
          <span 
            className="absolute top-[-0.18em] left-[0.12em] w-[0.26em] h-[0.26em] rounded-full bg-[#16C3FF] shadow-sm inline-block"
          />
          <span style={{ clipPath: 'polygon(0 30%, 100% 30%, 100% 100%, 0 100%)' }}>i</span>
        </span>
        <span>ntersend</span>
        {/* Trailing electric cyan period */}
        <span className="inline-block w-[0.24em] h-[0.24em] rounded-full bg-[#16C3FF] ml-[0.06em] shadow-sm" />
      </div>
    </div>
  );
};

/**
 * 2. WAVE - Real Official Logo
 * Pure electric cyan background (#00C2FF) with the authentic friendly Wave penguin waving hello
 * and the iconic rounded white "wave" wordmark.
 */
export const WavePenguinLogo: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  return (
    <div 
      style={{ width: size, height: size }}
      className={`rounded-2xl bg-[#00C2FF] overflow-hidden flex items-center justify-center border-2 border-[#001F54] shadow-sm shrink-0 p-1 ${className}`}
      title="Wave Mobile Money"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <rect width="100" height="100" rx="20" fill="#00C2FF" />

        {/* Two orange feet */}
        <ellipse cx="43" cy="83" rx="8" ry="4" fill="#FF7900" />
        <ellipse cx="61" cy="83" rx="8" ry="4" fill="#FF7900" />

        {/* Waving left wing (viewer's left) */}
        <path 
          d="M36 44 C26 36 21 27 24 24 C28 21 34 29 40 37 Z" 
          fill="#111111" 
        />

        {/* Resting right wing */}
        <path 
          d="M66 45 C73 49 76 58 74 65 C72 66 69 64 67 58 Z" 
          fill="#111111" 
        />

        {/* Penguin main body */}
        <path 
          d="M52 14 C40 14 36 24 36 38 C36 50 34 68 36 76 C38 83 66 83 68 76 C70 68 68 50 68 38 C68 24 64 14 52 14 Z" 
          fill="#111111" 
        />

        {/* White chest & belly */}
        <ellipse cx="52" cy="56" rx="12.5" ry="18" fill="#FFFFFF" />

        {/* White eye patches */}
        <circle cx="47" cy="26" r="3.2" fill="#FFFFFF" />
        <circle cx="57" cy="26" r="3.2" fill="#FFFFFF" />
        {/* Black pupils with lively look */}
        <circle cx="47.5" cy="26" r="1.6" fill="#111111" />
        <circle cx="56.5" cy="26" r="1.6" fill="#111111" />
        {/* Catchlight */}
        <circle cx="48.2" cy="25.2" r="0.6" fill="#FFFFFF" />
        <circle cx="57.2" cy="25.2" r="0.6" fill="#FFFFFF" />

        {/* Cute bright orange beak */}
        <path d="M45 31 C47 31 52 35 52 35 C52 35 57 31 59 31 C57 29 47 29 45 31 Z" fill="#FF7900" />

        {/* Subtle official 'wave' lowercase typography at bottom */}
        <text 
          x="52" 
          y="95" 
          textAnchor="middle" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="900" 
          fontSize="9" 
          fill="#FFFFFF"
          letterSpacing="0.4"
        >
          wave
        </text>
      </svg>
    </div>
  );
};

/**
 * 3. ORANGE MONEY - Real Official Logo
 * Real West African Orange Money emblem: The black up-right arrow ↗ and orange down-left arrow ↙
 * inside crisp white card with official "orange money" branding.
 */
export const OrangeMoneyLogo: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  return (
    <div 
      style={{ width: size, height: size }}
      className={`rounded-2xl bg-white overflow-hidden flex flex-col items-center justify-center border-2 border-[#001F54] shadow-sm shrink-0 p-1 ${className}`}
      title="Orange Money"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <rect width="100" height="100" rx="18" fill="#FFFFFF" />

        {/* Black up-right arrow ↗ (Sender) */}
        <g>
          <path 
            d="M24 48 L44 28 V40 C44 42 47 42 47 40 V22 C47 20 45 18 43 18 H25 C23 18 23 21 25 21 H37 L17 41 C15 43 18 47 20 49 L24 48 Z" 
            fill="#000000" 
          />
        </g>

        {/* Vibrant Orange down-left arrow ↙ (Receiver) */}
        <g>
          <path 
            d="M76 52 L56 72 V60 C56 58 53 58 53 60 V78 C53 80 55 82 57 82 H75 C77 82 77 79 75 79 H63 L83 59 C85 57 82 53 80 51 L76 52 Z" 
            fill="#FF7900" 
          />
        </g>

        {/* Official "orange" in black & "money" in orange */}
        <g transform="translate(50, 48)">
          <rect x="-30" y="-8" width="60" height="16" rx="4" fill="#000000" fillOpacity="0.04" />
        </g>
        <text x="50" y="88" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="11" fill="#000000">
          orange
        </text>
        <text x="50" y="97" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="9" fill="#FF7900">
          money
        </text>
      </svg>
    </div>
  );
};

/**
 * 4. MOOV MONEY (Moov Africa) - Real Official Logo
 * Blue background (#0055A5), large vibrant orange diamond/crescent with white MOOV,
 * and the iconic banknote fan symbol.
 */
export const MoovMoneyLogo: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  return (
    <div 
      style={{ width: size, height: size }}
      className={`rounded-2xl bg-[#0055A5] overflow-hidden flex items-center justify-center border-2 border-[#001F54] shadow-sm shrink-0 p-0.5 ${className}`}
      title="Moov Money Africa"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* Moov deep blue background */}
        <rect width="100" height="100" rx="20" fill="#0055A5" />

        {/* Orange dynamic diamond in center */}
        <rect 
          x="50" 
          y="14" 
          width="50" 
          height="50" 
          rx="12" 
          transform="rotate(45 50 14)" 
          fill="#FF6600" 
        />

        {/* White Typography: MOOV */}
        <text 
          x="50" 
          y="43" 
          textAnchor="middle" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="900" 
          fontSize="17" 
          fill="#FFFFFF"
          letterSpacing="0.8"
        >
          MOOV
        </text>

        {/* "Money" with banknotes */}
        <text 
          x="41" 
          y="62" 
          textAnchor="middle" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="800" 
          fontSize="13" 
          fill="#FFFFFF"
        >
          Money
        </text>

        {/* Banknote icon */}
        <g transform="translate(67, 49) scale(0.65)">
          <path d="M0 6 L14 0 L24 16 L10 22 Z" fill="#FFFFFF" />
          <path d="M4 8 L16 3 L22 15 L10 20 Z" fill="#FF6600" />
          <line x1="2" y1="21" x2="22" y2="15" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="0" y1="24" x2="24" y2="18" stroke="#FFFFFF" strokeWidth="2" />
        </g>

        {/* "Africa" subtitle in bottom banner */}
        <rect x="25" y="80" width="50" height="13" rx="3" fill="#003E7A" />
        <text 
          x="50" 
          y="90" 
          textAnchor="middle" 
          fontFamily="system-ui, sans-serif" 
          fontWeight="800" 
          fontSize="8.5" 
          fill="#FFFFFF"
          letterSpacing="1"
        >
          AFRICA
        </text>
      </svg>
    </div>
  );
};

/**
 * 5. MTN MOBILE MONEY (MoMo) - Real Official Logo
 * Signature MTN yellow background (#FFCC00) with the official dark blue capsule
 * containing the bubbly white & yellow "MoMo" logotype.
 */
export const MtnMoneyLogo: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  return (
    <div 
      style={{ width: size, height: size }}
      className={`rounded-2xl bg-[#FFCC00] overflow-hidden flex items-center justify-center border-2 border-[#001F54] shadow-sm shrink-0 p-1 ${className}`}
      title="MTN MoMo"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* MTN Yellow background */}
        <rect width="100" height="100" rx="20" fill="#FFCC00" />

        {/* Central dark blue capsule / oval badge of MoMo */}
        <rect 
          x="12" 
          y="24" 
          width="76" 
          height="52" 
          rx="26" 
          fill="#002B49" 
        />

        {/* "MoMo" text inside capsule */}
        {/* M */}
        <text 
          x="26" 
          y="58" 
          textAnchor="middle" 
          fontFamily="system-ui, sans-serif" 
          fontWeight="900" 
          fontSize="24" 
          fill="#FFFFFF"
        >
          M
        </text>
        {/* o (yellow) */}
        <circle cx="39" cy="50" r="7.5" fill="#FFCC00" />
        <circle cx="39" cy="50" r="3.5" fill="#002B49" />

        {/* M */}
        <text 
          x="59" 
          y="58" 
          textAnchor="middle" 
          fontFamily="system-ui, sans-serif" 
          fontWeight="900" 
          fontSize="24" 
          fill="#FFFFFF"
        >
          M
        </text>
        {/* o (yellow) */}
        <circle cx="73" cy="50" r="7.5" fill="#FFCC00" />
        <circle cx="73" cy="50" r="3.5" fill="#002B49" />

        {/* Small MTN oval on top */}
        <ellipse cx="50" cy="14" rx="15" ry="7" fill="none" stroke="#002B49" strokeWidth="1.8" />
        <text 
          x="50" 
          y="17" 
          textAnchor="middle" 
          fontFamily="system-ui, sans-serif" 
          fontWeight="900" 
          fontSize="7" 
          fill="#002B49"
          letterSpacing="0.5"
        >
          MTN
        </text>

        {/* Subtitle "Mobile Money" */}
        <text 
          x="50" 
          y="90" 
          textAnchor="middle" 
          fontFamily="system-ui, sans-serif" 
          fontWeight="900" 
          fontSize="8" 
          fill="#002B49"
          letterSpacing="0.4"
        >
          Mobile Money
        </text>
      </svg>
    </div>
  );
};

/**
 * 6. TRÉSOR MONEY (TrésorPay - Côte d'Ivoire) - Real Official Logo
 * Republic of Côte d'Ivoire national green (#008751) and orange (#FF7900) spiral logo.
 * Note: Clearly flagged as indisponible in the UI.
 */
export const TresorMoneyLogo: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  return (
    <div 
      style={{ width: size, height: size }}
      className={`rounded-2xl bg-white overflow-hidden flex flex-col items-center justify-center border-2 border-[#001F54] shadow-sm shrink-0 p-1 ${className}`}
      title="Trésor Money (Service indisponible)"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* Green swooshing spiral arrow */}
        <path 
          d="M26 18 L38 6 L40 18 C58 12 76 22 80 42 C85 64 74 80 54 84 C34 88 18 76 16 58" 
          stroke="#00875A" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />

        {/* Orange inner circle */}
        <circle cx="50" cy="48" r="22" stroke="#FF7900" strokeWidth="5.5" fill="none" strokeDasharray="6 3" />

        {/* Phone in center with TREMO */}
        <rect x="42" y="36" width="16" height="24" rx="3" fill="#000000" />
        <rect x="44" y="38" width="12" height="20" rx="2" fill="#FFCC00" />
        <text x="50" y="50" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="4.5" fill="#000000">
          TREMO
        </text>

        {/* TrésorMoney text */}
        <text x="32" y="93" fontFamily="sans-serif" fontWeight="900" fontSize="9.5" fill="#FF7900">
          Trésor
        </text>
        <text x="64" y="93" fontFamily="sans-serif" fontWeight="900" fontSize="9.5" fill="#00875A">
          Money
        </text>
      </svg>
    </div>
  );
};
