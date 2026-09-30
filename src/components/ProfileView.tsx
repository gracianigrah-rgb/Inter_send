import React, { useState } from 'react';
import { UserProfile, Operator } from '../types';
import { OperatorLogo } from './OperatorBadge';
import { AfricanPatternStrip } from './AfricanPattern';
import { User, Phone, ShieldCheck, KeyRound, Plus, LogOut, LayoutDashboard, CheckCircle2, ChevronRight, Award, Lock, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface ProfileViewProps {
  user: UserProfile;
  operators: Operator[];
  isAdmin?: boolean;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onLockSession: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  operators,
  isAdmin = false,
  onOpenAdmin,
  onLogout,
  onLockSession,
  onUpdateUser
}) => {
  const [showAddNumberModal, setShowAddNumberModal] = useState(false);
  const [newNumberName, setNewNumberName] = useState('');
  const [newNumberVal, setNewNumberVal] = useState('');
  const [newNumberOp, setNewNumberOp] = useState(operators[0].id);

  const handleAddNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumberName.trim() || !newNumberVal.trim()) return;

    const updated: UserProfile = {
      ...user,
      savedNumbers: [
        ...user.savedNumbers,
        {
          name: newNumberName.trim(),
          number: newNumberVal.trim(),
          operatorId: newNumberOp
        }
      ]
    };

    onUpdateUser(updated);
    setNewNumberName('');
    setNewNumberVal('');
    setShowAddNumberModal(false);
  };

  return (
    <div className="w-full max-w-md mx-auto pb-24 space-y-4">
      {/* Profile Header Card with African Banner */}
      <div className="bg-[#001F54] text-white p-6 rounded-3xl border-3 border-[#001F54] shadow-[4px_4px_0px_#001F54] relative overflow-hidden">
        <AfricanPatternStrip height={8} className="mb-4 rounded opacity-80" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFB703] border-3 border-white text-[#001F54] flex items-center justify-center font-black text-2xl font-display shadow-md">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-black text-white font-display truncate">
                {user.firstName} {user.lastName}
              </h2>
              <span className="w-5 h-5 rounded-full bg-[#16C3FF] text-[#001F54] flex items-center justify-center text-[10px] font-bold" title="Compte Vérifié">
                ✓
              </span>
            </div>
            <p className="text-xs font-mono text-[#DFF6FF] mt-0.5">{user.phoneNumber}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-[#16C3FF]/20 text-[#16C3FF] text-[10px] font-bold border border-[#16C3FF]/40">
                KYC Niveau 1
              </span>
              <span className="text-[10px] text-[#DFF6FF]/70">Plafond: 2 000 000 F/jour</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Access Switch Shortcut (Only visible to authorized administrators) */}
      {isAdmin && (
        <button
          type="button"
          onClick={onOpenAdmin}
          className="w-full p-4 rounded-2xl bg-[#FFFDE8] border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] flex items-center justify-between hover:bg-[#fff9c2] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#001F54] text-[#FFB703] flex items-center justify-center font-bold">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-[#001F54]">Tableau de Bord Admin CRUD</h4>
              <p className="text-[11px] text-[#001F54]/75">
                Gérer les transactions, numéros, passerelles et administrateurs
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#001F54]" />
        </button>
      )}

      {/* Saved Numbers Section */}
      <div className="bg-white p-5 rounded-3xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-[#001F54] uppercase tracking-wider">
            Mes Comptes & Numéros Enregistrés
          </h3>
          <button
            type="button"
            onClick={() => setShowAddNumberModal(true)}
            className="text-xs font-bold text-[#0A6CF1] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>

        {user.savedNumbers.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">Aucun numéro enregistré</p>
        ) : (
          <div className="space-y-2">
            {user.savedNumbers.map((sn, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F9FD] border-2 border-[#001F54]/30"
              >
                <div className="flex items-center gap-2.5">
                  <OperatorLogo operatorId={sn.operatorId} size={32} />
                  <div>
                    <span className="font-bold text-xs text-[#001F54] block">{sn.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">{sn.number}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase text-[#0A6CF1] px-2 py-0.5 rounded bg-[#DFF6FF]">
                  {sn.operatorId}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PWA Installation Card */}
      <div>
        <PWAInstallButton variant="banner" />
      </div>

      {/* Security & Settings */}
      <div className="bg-white p-5 rounded-3xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] space-y-3">
        <h3 className="font-black text-sm text-[#001F54] uppercase tracking-wider">
          Sécurité & Authentification
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#0A6CF1]" />
            <span className="font-bold text-[#001F54]">Code PIN à 4 chiffres</span>
          </div>
          <span className="font-mono font-bold text-slate-600">● ● ● ●</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-[#001F54]">Chiffrement inter-réseau</span>
          </div>
          <span className="font-bold text-emerald-600 text-[11px]">Actif</span>
        </div>

        <div className="pt-2 space-y-2">
          {/* Quick Lock: keeps phone remembered so next login only requires 4-digit PIN! */}
          <button
            type="button"
            onClick={onLockSession}
            className="w-full py-3 rounded-xl border-2 border-[#001F54] bg-[#DFF6FF] text-[#001F54] font-black text-xs hover:bg-[#cbf0fd] shadow-[2px_2px_0px_#001F54] flex items-center justify-center gap-1.5 cursor-pointer"
            title="Verrouille l'application. Au retour, seul votre code PIN à 4 chiffres sera demandé"
          >
            <Lock className="w-4 h-4 text-[#0A6CF1]" />
            <span>Verrouiller l'accès (Code PIN requis au retour)</span>
          </button>

          {/* Full Logout: forgets device */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-600 font-bold text-xs hover:bg-slate-100 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter (Changer d'appareil)</span>
          </button>
        </div>
      </div>

      {/* Add Number Modal */}
      {showAddNumberModal && (
        <div className="fixed inset-0 z-50 bg-[#001F54]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddNumber}
            className="bg-white w-full max-w-sm rounded-3xl border-3 border-[#001F54] shadow-[6px_6px_0px_#001F54] p-5 space-y-4"
          >
            <h3 className="font-black text-base text-[#001F54]">Ajouter un numéro favori</h3>

            <div>
              <label className="text-xs font-bold text-[#001F54] mb-1 block">Nom / Libellé</label>
              <input
                type="text"
                autoFocus
                value={newNumberName}
                onChange={(e) => setNewNumberName(e.target.value)}
                placeholder="Ex: Mon Wave personnel"
                className="w-full h-11 px-3 rounded-xl border-2 border-[#001F54] text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#001F54] mb-1 block">Opérateur</label>
              <select
                value={newNumberOp}
                onChange={(e) => setNewNumberOp(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl border-2 border-[#001F54] text-xs font-bold"
              >
                {operators.filter(op => op.id !== 'tresor').map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#001F54] mb-1 block">Numéro</label>
              <input
                type="tel"
                value={newNumberVal}
                onChange={(e) => setNewNumberVal(e.target.value)}
                placeholder="Ex: 01 02 03 04 05"
                className="w-full h-11 px-3 rounded-xl border-2 border-[#001F54] text-xs font-mono font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddNumberModal(false)}
                className="w-1/2 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl btn-cartoon-blue font-bold text-xs"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
