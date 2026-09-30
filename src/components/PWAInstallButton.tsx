import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { IntersendEmblem } from './BrandLogos';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  // If already running standalone as PWA, hide install prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstalledNotice(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  // Header compact button
  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`px-2.5 py-1.5 rounded-xl bg-[#DFF6FF] border-2 border-[#001F54] text-[#001F54] text-[11px] font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#001F54] hover:bg-[#c6edfe] active:translate-y-0.5 cursor-pointer select-none ${className}`}
          title="Installer Intersend sur votre téléphone"
        >
          <Download className="w-3.5 h-3.5 text-[#0A6CF1]" />
          <span className="font-display">Installer PWA</span>
        </button>

        {/* Modal Guide */}
        {showGuide && (
          <InstallGuideModal isIOS={isIOS} onClose={() => setShowGuide(false)} />
        )}
      </>
    );
  }

  // Banner variant for home/profile
  return (
    <>
      <div className={`p-4 rounded-2xl bg-gradient-to-r from-[#001F54] to-[#0A3E8A] border-3 border-[#001F54] text-white shadow-[4px_4px_0px_#001F54] flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 border-2 border-[#16C3FF] shadow-sm shrink-0 flex items-center justify-center">
            <IntersendEmblem size={34} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-sm text-white truncate font-display">
                Installer Intersend
              </h4>
              <span className="px-1.5 py-0.2 rounded bg-[#FFB703] text-[#001F54] text-[9px] font-black uppercase">
                PWA Native
              </span>
            </div>
            <p className="text-xs text-[#DFF6FF] line-clamp-1 mt-0.5">
              Accessible sans connexion & ouverture native instantanée
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3.5 py-2 rounded-xl btn-cartoon-gold text-xs font-black shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          <span>Installer</span>
        </button>
      </div>

      {showGuide && (
        <InstallGuideModal isIOS={isIOS} onClose={() => setShowGuide(false)} />
      )}
    </>
  );
};

const InstallGuideModal: React.FC<{ isIOS: boolean; onClose: () => void }> = ({ isIOS, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#001F54]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl border-3 border-[#001F54] shadow-[6px_6px_0px_#001F54] p-6 space-y-4 animate-fadeIn text-[#001F54]">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2">
            <IntersendEmblem size={28} />
            <h3 className="font-display font-black text-base">Installation Intersend PWA</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-3 text-xs leading-relaxed">
            <p className="font-bold text-[#001F54]">
              Pour installer l'application sur votre iPhone / iPad (iOS Safari) :
            </p>
            <div className="p-3 bg-[#F4F9FD] rounded-xl border-2 border-[#001F54]/20 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-100 text-[#0A6CF1] shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">1. Bouton Partager</span>
                  <span className="text-slate-600">Touchez l'icône de partage dans la barre Safari au bas de votre écran.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">2. « Sur l'écran d'accueil »</span>
                  <span className="text-slate-600">Faites défiler et sélectionnez <strong>Sur l'écran d'accueil</strong> puis validez <strong>Ajouter</strong>.</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              L'application se lancera ensuite en plein écran comme une application native depuis votre écran d'accueil.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs leading-relaxed">
            <p className="font-bold text-[#001F54]">
              Pour installer Intersend sur Android ou votre navigateur :
            </p>
            <div className="p-3 bg-[#F4F9FD] rounded-xl border-2 border-[#001F54]/20 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#001F54] text-[#FFB703] flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <span className="font-bold block">Menu du navigateur (⋮)</span>
                  <span className="text-slate-600">Touchez les 3 points en haut à droite de Chrome.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#001F54] text-[#FFB703] flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <span className="font-bold block">« Installer l'application »</span>
                  <span className="text-slate-600">Cliquez sur « Installer Intersend » pour ajouter le paquet autonome à vos applications.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl btn-cartoon-blue text-xs font-black cursor-pointer"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
};
