import React from 'react';
import { Delete, ShieldCheck } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  maxLength?: number;
  onChange: (newValue: string) => void;
  onComplete?: (completedPin: string) => void;
  label?: string;
  hint?: string;
  error?: string | null;
  masked?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  value,
  maxLength = 4,
  onChange,
  onComplete,
  label = 'Entrez votre code secret (PIN)',
  hint = 'Code à 4 chiffres pour sécuriser vos transactions inter-opérateurs',
  error = null,
  masked = true
}) => {
  const handleDigit = (digit: string) => {
    if (value.length < maxLength) {
      const next = value + digit;
      onChange(next);
      if (next.length === maxLength && onComplete) {
        onComplete(next);
      }
      // Haptic feedback if supported on mobile
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(25);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleDelete = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      {/* Title & guidance */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-[#001F54] font-display">
          {label}
        </h3>
        {hint && (
          <p className="text-xs text-[#001F54]/70 mt-1 max-w-xs mx-auto">
            {hint}
          </p>
        )}
      </div>

      {/* 4 PIN Dots */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {Array.from({ length: maxLength }).map((_, idx) => {
          const filled = idx < value.length;
          return (
            <div
              key={idx}
              className={`w-12 h-14 rounded-2xl flex items-center justify-center transition-all duration-150 border-3 ${
                filled
                  ? 'bg-[#001F54] border-[#001F54] text-[#FFB703] shadow-[3px_3px_0px_#FFB703] scale-105'
                  : 'bg-white border-[#001F54]/30 shadow-[2px_2px_0px_#001F54]/20'
              } ${error ? 'border-red-500 bg-red-50 animate-shake' : ''}`}
            >
              {filled ? (
                masked ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FFB703] shadow-sm"></div>
                ) : (
                  <span className="text-xl font-black text-white font-mono">{value[idx]}</span>
                )
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#001F54]/20"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 px-3 py-1.5 rounded-xl bg-red-100 border-2 border-red-500 text-red-700 text-xs font-bold text-center animate-bounce">
          {error}
        </div>
      )}

      {/* In-app tactile keypad (Gros boutons semi-cartoon) */}
      <div className="grid grid-cols-3 gap-3.5 w-full max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            className="h-16 rounded-2xl bg-white border-3 border-[#001F54] text-[#001F54] font-black text-2xl shadow-[3px_3px_0px_#001F54] hover:bg-[#DFF6FF] active:translate-y-1 active:shadow-[1px_1px_0px_#001F54] transition-all flex items-center justify-center cursor-pointer select-none"
          >
            {digit}
          </button>
        ))}

        {/* Clear Button */}
        <button
          type="button"
          onClick={handleClear}
          disabled={value.length === 0}
          className="h-16 rounded-2xl bg-[#DFF6FF] border-3 border-[#001F54] text-[#001F54] text-xs font-bold shadow-[3px_3px_0px_#001F54] hover:bg-[#c9eefd] active:translate-y-1 active:shadow-[1px_1px_0px_#001F54] transition-all flex items-center justify-center cursor-pointer select-none disabled:opacity-40"
        >
          Effacer
        </button>

        {/* Zero */}
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-16 rounded-2xl bg-white border-3 border-[#001F54] text-[#001F54] font-black text-2xl shadow-[3px_3px_0px_#001F54] hover:bg-[#DFF6FF] active:translate-y-1 active:shadow-[1px_1px_0px_#001F54] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          0
        </button>

        {/* Delete Single Digit */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={value.length === 0}
          className="h-16 rounded-2xl bg-[#FFB703] border-3 border-[#001F54] text-[#001F54] shadow-[3px_3px_0px_#001F54] hover:bg-[#fca800] active:translate-y-1 active:shadow-[1px_1px_0px_#001F54] transition-all flex items-center justify-center cursor-pointer select-none disabled:opacity-40"
          aria-label="Effacer le dernier chiffre"
        >
          <Delete className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#001F54]/60 mt-5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#0A6CF1]" />
        Clavier sécurisé chiffré Intersend
      </div>
    </div>
  );
};
