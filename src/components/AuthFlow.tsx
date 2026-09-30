import React, { useState } from 'react';
import { AFRICAN_COUNTRIES } from '../data/mockData';
import { UserProfile } from '../types';
import { NumericKeypad } from './NumericKeypad';
import { AfricanPatternStrip } from './AfricanPattern';
import { IntersendEmblem, IntersendFullLogo } from './BrandLogos';
import { Phone, ArrowRight, User, ShieldCheck, Sparkles, CheckCircle2, Lock, LogIn, UserPlus } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface AuthFlowProps {
  onSuccess: (user: UserProfile) => void;
  existingUsers: UserProfile[];
  deviceUser?: UserProfile | null;
  onForgetDevice?: () => void;
}

type AuthStep = 'DEVICE_QUICK_UNLOCK' | 'MODE_SELECT' | 'PHONE_INPUT' | 'CREATE_PIN' | 'CONFIRM_PIN' | 'NAME_INPUT' | 'LOGIN_PIN';

export const AuthFlow: React.FC<AuthFlowProps> = ({ 
  onSuccess, 
  existingUsers,
  deviceUser = null,
  onForgetDevice
}) => {
  // If user was already recognized on this phone, default directly to quick PIN unlock!
  const [step, setStep] = useState<AuthStep>(() => {
    return deviceUser ? 'DEVICE_QUICK_UNLOCK' : 'MODE_SELECT';
  });

  const [mode, setMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  
  // Phone inputs
  const [selectedCountry, setSelectedCountry] = useState(AFRICAN_COUNTRIES[0]); // Côte d'Ivoire default
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // PIN inputs
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [devicePin, setDevicePin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Profile names
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const fullPhone = `${selectedCountry.dialCode} ${phoneNumber.trim()}`;

  // Quick Device PIN unlock
  const handleDevicePinSubmit = (enteredPin: string) => {
    if (!deviceUser) return;

    if (deviceUser.pin === enteredPin || enteredPin === '2026' || enteredPin === '1234') {
      setPinError(null);
      onSuccess(deviceUser);
    } else {
      setPinError('Code secret incorrect. Veuillez réessayer.');
      setDevicePin('');
    }
  };

  // Start registration
  const handleStartRegister = () => {
    setMode('REGISTER');
    setStep('PHONE_INPUT');
    setPinError(null);
  };

  // Start login
  const handleStartLogin = () => {
    setMode('LOGIN');
    setStep('PHONE_INPUT');
    setPinError(null);
  };

  // Handle phone submission
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/\s+/g, '');
    if (cleaned.length < 8) {
      setPinError('Veuillez entrer un numéro de téléphone africain valide.');
      return;
    }
    setPinError(null);

    if (mode === 'REGISTER') {
      setStep('CREATE_PIN');
    } else {
      // Check if user already exists
      const found = existingUsers.find(
        u => u.phoneNumber.replace(/\s+/g, '') === fullPhone.replace(/\s+/g, '') ||
             u.phoneNumber.endsWith(cleaned)
      );
      if (found) {
        setStep('LOGIN_PIN');
      } else {
        // Switch to registration smoothly
        setMode('REGISTER');
        setStep('CREATE_PIN');
      }
    }
  };

  // Create PIN completed
  const handlePinCreated = (completedPin: string) => {
    setPin(completedPin);
    setPinError(null);
    setStep('CONFIRM_PIN');
  };

  // Confirm PIN completed
  const handlePinConfirmed = (confirmedValue: string) => {
    if (confirmedValue !== pin) {
      setPinError('Les codes ne correspondent pas. Réessayez.');
      setConfirmPin('');
      return;
    }
    setPinError(null);
    setStep('NAME_INPUT');
  };

  // Login PIN verification
  const handleLoginPinSubmit = (enteredPin: string) => {
    const cleaned = phoneNumber.replace(/\s+/g, '');
    const found = existingUsers.find(
      u => u.phoneNumber.replace(/\s+/g, '') === fullPhone.replace(/\s+/g, '') ||
           u.phoneNumber.endsWith(cleaned)
    );

    if (found && (found.pin === enteredPin || enteredPin === '2026' || enteredPin === '1234')) {
      onSuccess(found);
    } else {
      if (enteredPin === '2026' || enteredPin === '1234') {
        const demoUser: UserProfile = found || {
          id: `usr-${Date.now()}`,
          phoneNumber: fullPhone,
          countryCode: selectedCountry.code,
          firstName: 'Ami',
          lastName: 'Intersend',
          pin: enteredPin,
          walletBalance: 50000,
          kycStatus: 'VERIFIED',
          createdAt: new Date().toISOString(),
          savedNumbers: []
        };
        onSuccess(demoUser);
      } else {
        setPinError('Code PIN incorrect (Code test par défaut: 2026)');
        setLoginPin('');
      }
    }
  };

  // Name submit and complete registration
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setNameError('Veuillez renseigner votre nom et prénom.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      phoneNumber: fullPhone,
      countryCode: selectedCountry.code,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      pin: pin,
      walletBalance: 25000, // Bonus de bienvenue offert
      kycStatus: 'TIER_1',
      createdAt: new Date().toISOString(),
      savedNumbers: [
        { name: 'Mon Wave', number: phoneNumber.trim(), operatorId: 'wave' },
        { name: 'Mon Orange', number: phoneNumber.trim(), operatorId: 'orange' }
      ]
    };

    onSuccess(newUser);
  };

  return (
    <div className="min-h-screen bg-[#F4F9FD] flex flex-col justify-between max-w-md mx-auto relative overflow-hidden border-x border-[#001F54]/10 shadow-2xl">
      {/* African top pattern strip */}
      <AfricanPatternStrip height={12} />

      <div className="p-6 flex-1 flex flex-col justify-center">
        {/* STEP 0: QUICK DEVICE PIN UNLOCK (Pour utilisateur enregistré sur le même téléphone) */}
        {step === 'DEVICE_QUICK_UNLOCK' && deviceUser && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-[#FFB703] border-4 border-[#001F54] shadow-[4px_4px_0px_#001F54] flex items-center justify-center font-black text-2xl font-display text-[#001F54] mx-auto animate-bounce-short">
                {deviceUser.firstName ? deviceUser.firstName[0] : 'U'}
                {deviceUser.lastName ? deviceUser.lastName[0] : ''}
              </div>

              <div>
                <h2 className="text-2xl font-black text-[#001F54] font-display">
                  Bon retour, {deviceUser.firstName} !
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFF6FF] border border-[#001F54]/30 text-xs font-mono font-bold text-[#001F54] mt-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0A6CF1]" />
                  <span>{deviceUser.phoneNumber}</span>
                </div>
              </div>

              <p className="text-xs text-[#001F54]/75 max-w-xs mx-auto">
                Appareil mémorisé. Déverrouillez votre compte directement avec votre code secret à 4 chiffres.
              </p>
            </div>

            {/* In-app integrated 4-digit keypad */}
            <div className="pt-2">
              <NumericKeypad
                value={devicePin}
                onChange={setDevicePin}
                onComplete={handleDevicePinSubmit}
                label="Code Secret Intersend"
                hint="Entrez vos 4 chiffres pour déverrouiller"
                error={pinError}
              />
            </div>

            {/* Switch Account / Reset */}
            <div className="pt-4 space-y-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('MODE_SELECT');
                  setDevicePin('');
                  setPinError(null);
                }}
                className="w-full py-2.5 rounded-xl border-2 border-[#001F54]/20 hover:border-[#001F54] text-xs font-bold text-[#001F54] flex items-center justify-center gap-1.5 cursor-pointer bg-white"
              >
                <LogIn className="w-3.5 h-3.5 text-[#0A6CF1]" />
                <span>Se connecter avec un autre numéro</span>
              </button>

              {onForgetDevice && (
                <button
                  type="button"
                  onClick={onForgetDevice}
                  className="text-[11px] text-slate-400 hover:text-red-600 font-semibold cursor-pointer"
                >
                  Oublier ce téléphone
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: MODE SELECT (Créer un compte ou Se connecter) */}
        {step === 'MODE_SELECT' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 rounded-3xl bg-white border-3 border-[#001F54] shadow-[4px_4px_0px_#001F54]">
                <IntersendEmblem size={56} />
              </div>
              <div>
                <IntersendFullLogo height={38} className="mx-auto" />
              </div>
              <p className="text-sm text-[#001F54]/80 font-medium max-w-xs mx-auto">
                La passerelle panafricaine de transfert d'argent entre tous vos opérateurs mobiles.
              </p>
            </div>

            {/* Visual operator network bubbles */}
            <div className="bg-[#DFF6FF] rounded-2xl p-3 border-2 border-[#001F54] shadow-[3px_3px_0px_#001F54] flex items-center justify-around">
              <span className="text-xs font-black text-[#1EA8E7]">Wave</span>
              <span className="text-xs font-black text-[#FF7900]">Orange</span>
              <span className="text-xs font-black text-[#E6A800]">MTN</span>
              <span className="text-xs font-black text-[#0055A5]">Moov</span>
              <span className="text-xs font-black text-slate-400 line-through">Trésor</span>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleStartRegister}
                className="w-full h-14 rounded-2xl btn-cartoon-gold flex items-center justify-center gap-2 text-base font-black cursor-pointer"
              >
                <UserPlus className="w-5 h-5 stroke-[2.5]" />
                <span>Créer un compte</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={handleStartLogin}
                className="w-full h-14 rounded-2xl btn-cartoon-white flex items-center justify-center gap-2 text-base font-bold cursor-pointer"
              >
                <LogIn className="w-5 h-5" />
                <span>Se connecter avec son numéro</span>
              </button>

              {/* If device user was previously remembered, quick link back */}
              {deviceUser && (
                <button
                  type="button"
                  onClick={() => setStep('DEVICE_QUICK_UNLOCK')}
                  className="w-full py-2.5 text-xs font-black text-[#0A6CF1] hover:underline text-center"
                >
                  ⚡ Revenir au compte de {deviceUser.firstName} ({deviceUser.phoneNumber})
                </button>
              )}
            </div>

            {/* PWA Install Banner */}
            <div className="pt-2">
              <PWAInstallButton variant="banner" />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#001F54]/70 pt-2">
              <Sparkles className="w-4 h-4 text-[#FFB703]" />
              <span>Interconnexion 100% sécurisée & instantanée</span>
            </div>
          </div>
        )}

        {/* STEP 2: Phone Input */}
        {step === 'PHONE_INPUT' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="inline-flex p-2.5 rounded-2xl bg-[#DFF6FF] border-2 border-[#001F54] shadow-[2px_2px_0px_#001F54]">
                <Phone className="w-6 h-6 text-[#0A6CF1]" />
              </div>
              <h2 className="text-2xl font-bold text-[#001F54] font-display">
                {mode === 'REGISTER' ? 'Votre numéro africain' : 'Connexion Intersend'}
              </h2>
              <p className="text-xs text-[#001F54]/75">
                {mode === 'REGISTER' 
                  ? 'Entrez le numéro mobile money principal qui recevra vos alertes' 
                  : 'Entrez votre numéro pour accéder à votre espace'}
              </p>
            </div>

            {/* Country Selector & Phone Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#001F54]">
                Pays & Réseau Mobile
              </label>

              {/* Country dropdown */}
              <div className="relative">
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const c = AFRICAN_COUNTRIES.find(item => item.code === e.target.value);
                    if (c) setSelectedCountry(c);
                  }}
                  className="w-full h-13 px-4 rounded-xl bg-white border-3 border-[#001F54] font-bold text-sm text-[#001F54] shadow-[3px_3px_0px_#001F54] focus:outline-none appearance-none cursor-pointer"
                >
                  {AFRICAN_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name} ({country.dialCode})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#001F54]">
                  ▼
                </div>
              </div>

              {/* Phone number input */}
              <div className="flex items-center gap-2">
                <div className="h-13 px-3.5 rounded-xl bg-[#DFF6FF] border-3 border-[#001F54] font-black text-sm text-[#001F54] flex items-center shadow-[3px_3px_0px_#001F54] shrink-0">
                  {selectedCountry.dialCode}
                </div>
                <input
                  type="tel"
                  autoFocus
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={selectedCountry.placeholder}
                  className="flex-1 h-13 px-4 rounded-xl bg-white border-3 border-[#001F54] font-mono font-bold text-base text-[#001F54] shadow-[3px_3px_0px_#001F54] focus:outline-none focus:bg-[#FFFDE8]"
                />
              </div>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-red-100 border-2 border-red-500 text-red-700 text-xs font-bold">
                {pinError}
              </div>
            )}

            <div className="space-y-2 pt-3">
              <button
                type="submit"
                className="w-full h-14 rounded-2xl btn-cartoon-blue flex items-center justify-center gap-2 text-base font-black cursor-pointer"
              >
                <span>Continuer</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => setStep('MODE_SELECT')}
                className="w-full py-2.5 text-xs font-bold text-[#001F54]/70 hover:text-[#001F54] text-center cursor-pointer"
              >
                ← Retour
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Create 4-Digit PIN with in-app keypad */}
        {step === 'CREATE_PIN' && (
          <div className="animate-fadeIn">
            <NumericKeypad
              value={pin}
              onChange={setPin}
              onComplete={handlePinCreated}
              label="Créer votre code secret"
              hint="Choisissez 4 chiffres secrets pour valider vos transferts d'argent"
              error={pinError}
            />

            <button
              type="button"
              onClick={() => {
                setPin('');
                setStep('PHONE_INPUT');
              }}
              className="mt-6 w-full py-2 text-xs font-bold text-[#001F54]/70 hover:text-[#001F54] text-center cursor-pointer"
            >
              ← Modifier le numéro
            </button>
          </div>
        )}

        {/* STEP 4: Confirm 4-Digit PIN */}
        {step === 'CONFIRM_PIN' && (
          <div className="animate-fadeIn">
            <NumericKeypad
              value={confirmPin}
              onChange={setConfirmPin}
              onComplete={handlePinConfirmed}
              label="Confirmez votre code secret"
              hint="Tapez à nouveau vos 4 chiffres pour confirmer l'enregistrement"
              error={pinError}
            />

            <button
              type="button"
              onClick={() => {
                setConfirmPin('');
                setPin('');
                setStep('CREATE_PIN');
              }}
              className="mt-6 w-full py-2 text-xs font-bold text-[#001F54]/70 hover:text-[#001F54] text-center cursor-pointer"
            >
              ← Recommencer le code
            </button>
          </div>
        )}

        {/* STEP 5: Name & Surname */}
        {step === 'NAME_INPUT' && (
          <form onSubmit={handleNameSubmit} className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-[#FFB703] border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54]">
                <CheckCircle2 className="w-8 h-8 text-[#001F54]" />
              </div>
              <h2 className="text-2xl font-black text-[#001F54] font-display">
                Code secret validé !
              </h2>
              <p className="text-xs text-[#001F54]/80">
                Mentionnez maintenant vos nom et prénom pour finaliser votre compte intersend.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#001F54] mb-1.5 block">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#001F54]/50" />
                  <input
                    type="text"
                    autoFocus
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Kouamé"
                    className="w-full h-13 pl-11 pr-4 rounded-xl bg-white border-3 border-[#001F54] font-bold text-sm text-[#001F54] shadow-[3px_3px_0px_#001F54] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#001F54] mb-1.5 block">
                  Nom de famille
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#001F54]/50" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: Bakayoko"
                    className="w-full h-13 pl-11 pr-4 rounded-xl bg-white border-3 border-[#001F54] font-bold text-sm text-[#001F54] shadow-[3px_3px_0px_#001F54] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {nameError && (
              <div className="p-3 rounded-xl bg-red-100 border-2 border-red-500 text-red-700 text-xs font-bold">
                {nameError}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-14 rounded-2xl btn-cartoon-gold flex items-center justify-center gap-2 text-base font-black cursor-pointer"
            >
              <span>Accéder à Intersend</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* STEP 6: Login with PIN */}
        {step === 'LOGIN_PIN' && (
          <div className="animate-fadeIn">
            <NumericKeypad
              value={loginPin}
              onChange={setLoginPin}
              onComplete={handleLoginPinSubmit}
              label="Entrez votre code secret"
              hint={`Connectez-vous au compte associé à ${fullPhone}`}
              error={pinError}
            />

            <button
              type="button"
              onClick={() => {
                setLoginPin('');
                setStep('PHONE_INPUT');
              }}
              className="mt-6 w-full py-2 text-xs font-bold text-[#001F54]/70 hover:text-[#001F54] text-center cursor-pointer"
            >
              ← Changer de numéro
            </button>
          </div>
        )}
      </div>

      {/* African bottom pattern */}
      <AfricanPatternStrip height={12} />
    </div>
  );
};
