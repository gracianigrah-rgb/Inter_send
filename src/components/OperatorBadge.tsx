import React from 'react';
import { Operator, OperatorId } from '../types';
import { 
  WavePenguinLogo, 
  OrangeMoneyLogo, 
  MoovMoneyLogo, 
  MtnMoneyLogo, 
  TresorMoneyLogo,
  IntersendEmblem 
} from './BrandLogos';
import { AlertCircle } from 'lucide-react';

interface OperatorBadgeProps {
  operatorId: OperatorId;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  showName?: boolean;
  showBadgeOnly?: boolean;
}

export const OperatorLogo: React.FC<{ operatorId: OperatorId; size?: number }> = ({ 
  operatorId, 
  size = 40 
}) => {
  switch (operatorId) {
    case 'wave':
      return <WavePenguinLogo size={size} />;
    case 'orange':
      return <OrangeMoneyLogo size={size} />;
    case 'mtn':
      return <MtnMoneyLogo size={size} />;
    case 'moov':
      return <MoovMoneyLogo size={size} />;
    case 'tresor':
      return <TresorMoneyLogo size={size} />;
    default:
      return (
        <div 
          style={{ width: size, height: size }} 
          className="rounded-2xl bg-[#001F54] flex items-center justify-center p-1 border-2 border-[#001F54]"
        >
          <IntersendEmblem size={size * 0.8} />
        </div>
      );
  }
};

export const OperatorCardSelect: React.FC<{
  operator: Operator;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}> = ({ operator, selected, onSelect, disabled = false }) => {
  // Trésor Money rule: Service indisponible pour l'instant et ne pas initier d'opération
  const isTresorUnavailable = operator.id === 'tresor';
  const isEffectiveDisabled = disabled || isTresorUnavailable;

  const handleClick = () => {
    if (isTresorUnavailable || isEffectiveDisabled) {
      return;
    }
    onSelect();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isEffectiveDisabled}
      aria-disabled={isEffectiveDisabled}
      className={`relative w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3.5 border-3 select-none ${
        isTresorUnavailable
          ? 'bg-slate-100/95 border-slate-300 opacity-60 cursor-not-allowed shadow-none'
          : disabled
            ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100 border-slate-300'
            : selected
              ? 'bg-[#DFF6FF] border-[#001F54] shadow-[4px_4px_0px_#001F54] translate-x-[-1px] translate-y-[-1px] cursor-pointer'
              : 'bg-white border-[#001F54] shadow-[2px_2px_0px_#001F54] hover:bg-[#F4F9FD] active:translate-y-[2px] active:shadow-[1px_1px_0px_#001F54] cursor-pointer'
      }`}
    >
      <div className={isTresorUnavailable ? 'filter grayscale-[50%]' : ''}>
        <OperatorLogo operatorId={operator.id} size={48} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className={`font-bold text-base font-display truncate ${
            isTresorUnavailable ? 'text-slate-500' : 'text-[#001F54]'
          }`}>
            {operator.brandName}
          </h4>

          {selected && !isTresorUnavailable && (
            <span className="h-6 w-6 rounded-full bg-[#001F54] text-[#FFB703] flex items-center justify-center text-xs font-black shadow-sm shrink-0">
              ✓
            </span>
          )}

          {isTresorUnavailable && (
            <span className="h-6 px-2 rounded-full bg-red-100 border border-red-300 text-red-700 flex items-center justify-center text-[10px] font-black shrink-0">
              Non disponible
            </span>
          )}
        </div>

        {/* Trésor Money: explicitly write "service indisponible pour l'instant" */}
        {isTresorUnavailable ? (
          <div className="mt-1.5 flex flex-col gap-0.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Service indisponible pour l'instant</span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold pl-0.5">
              Impossible d'initier une opération Trésor Money
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1 text-xs text-[#001F54]/75">
            <span className="font-semibold text-[#0A6CF1]">Frais: {operator.feePercentage}%</span>
            <span>·</span>
            <span>Délai ~{operator.avgDelaySeconds}s</span>
          </div>
        )}
      </div>
    </button>
  );
};
