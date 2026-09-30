import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Operator, OperatorId, Transaction, UserProfile, DebitAccount, AdminConfig, AdminNotification } from '../types';
import { OperatorLogo, OperatorCardSelect } from './OperatorBadge';
import { AfricanPatternStrip } from './AfricanPattern';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  RotateCcw,
  Sparkles,
  PhoneCall,
  ExternalLink,
  Lock,
  Hourglass,
  Info
} from 'lucide-react';

interface SendMoneyFlowProps {
  user: UserProfile;
  operators: Operator[];
  debitAccounts: DebitAccount[];
  adminConfig: AdminConfig;
  onTransactionCreated: (tx: Transaction) => void;
  onTransactionUpdated: (tx: Transaction) => void;
  onAdminNotify: (notification: AdminNotification) => void;
  onGoToTransactions: () => void;
}

export const SendMoneyFlow: React.FC<SendMoneyFlowProps> = ({
  user,
  operators,
  debitAccounts,
  adminConfig,
  onTransactionCreated,
  onTransactionUpdated,
  onAdminNotify,
  onGoToTransactions
}) => {
  // Restore persisted draft if available
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem('intersend_active_step');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [sourceOperatorId, setSourceOperatorId] = useState<OperatorId>('orange');
  const [sourceNumber, setSourceNumber] = useState<string>(user.phoneNumber);
  
  const [destOperatorId, setDestOperatorId] = useState<OperatorId>('wave');
  const [destNumber1, setDestNumber1] = useState<string>('');
  const [destNumber2, setDestNumber2] = useState<string>('');
  const [numberMatchError, setNumberMatchError] = useState<string | null>(null);

  // Safeguard: Never allow Trésor Money to be active in flow
  useEffect(() => {
    if (sourceOperatorId === 'tresor') {
      setSourceOperatorId('orange');
    }
    if (destOperatorId === 'tresor') {
      setDestOperatorId('wave');
    }
  }, [sourceOperatorId, destOperatorId]);

  const [amount, setAmount] = useState<number>(10000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('10000');

  // Orange Money 4-digit auth code
  const [orangeAuthCode, setOrangeAuthCode] = useState<string>('');
  const [orangeCodeError, setOrangeCodeError] = useState<string | null>(null);

  // Active transaction being processed
  const [activeTx, setActiveTx] = useState<Transaction | null>(() => {
    const saved = localStorage.getItem('intersend_active_tx');
    return saved ? JSON.parse(saved) : null;
  });

  // State: 'INPUT' | 'PROCESSING' | 'COMPLETED'
  const [txLifecycleState, setTxLifecycleState] = useState<'INPUT' | 'PROCESSING' | 'COMPLETED'>(() => {
    const saved = localStorage.getItem('intersend_active_tx');
    if (saved) {
      const tx = JSON.parse(saved);
      if (tx.status === 'COMPLETED') return 'COMPLETED';
      if (tx.status === 'PROCESSING') return 'PROCESSING';
    }
    return 'INPUT';
  });

  const [copiedMtn, setCopiedMtn] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sourceOperator = operators.find(o => o.id === sourceOperatorId) || operators[0];
  const destOperator = operators.find(o => o.id === destOperatorId) || operators[1];

  // STRICT UNIQUE 1% FEE AS REQUIRED
  const calculatedFee = Math.max(1, Math.round(amount * 0.01));
  const totalDebited = amount + calculatedFee;

  // Persist session step & active transaction
  useEffect(() => {
    localStorage.setItem('intersend_active_step', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    if (activeTx) {
      localStorage.setItem('intersend_active_tx', JSON.stringify(activeTx));
    } else {
      localStorage.removeItem('intersend_active_tx');
    }
  }, [activeTx]);

  // Matching check for double verification
  const numbersMatch = destNumber1.trim() !== '' && destNumber1.trim() === destNumber2.trim();

  // Reset helper
  const handleStartNew = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentStep(1);
    setDestNumber1('');
    setDestNumber2('');
    setNumberMatchError(null);
    setOrangeAuthCode('');
    setOrangeCodeError(null);
    setActiveTx(null);
    setTxLifecycleState('INPUT');
    localStorage.removeItem('intersend_active_tx');
    localStorage.removeItem('intersend_active_step');
  };

  // Step 2 validation
  const handleSourceNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceNumber.trim() || sourceNumber.trim().length < 8) {
      alert('Veuillez renseigner un numéro émetteur valide.');
      return;
    }
    setCurrentStep(3);
  };

  // Step 4 verification (Double check)
  const handleDestNumbersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean1 = destNumber1.replace(/\s+/g, '');
    const clean2 = destNumber2.replace(/\s+/g, '');

    if (clean1.length < 8) {
      setNumberMatchError('Le premier numéro saisi est incomplet.');
      return;
    }
    if (clean1 !== clean2) {
      setNumberMatchError('Erreur de vérification : les deux numéros ne sont pas identiques.');
      return;
    }
    setNumberMatchError(null);
    setCurrentStep(5);
  };

  // Step 5 amount submit (250F min - 2 000 000F max)
  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customAmountInput.replace(/\D/g, ''), 10);
    if (isNaN(parsed) || parsed < 250) {
      alert('Le montant minimum de transaction est de 250 FCFA.');
      return;
    }
    if (parsed > 2000000) {
      alert('Le montant maximum de transaction est de 2 000 000 FCFA.');
      return;
    }
    setAmount(parsed);
    setCurrentStep(6);
  };

  // Helper to trigger automated transition after wait time (60s for Orange/Wave, 120s for MTN/Trésor)
  const startCompletionTimer = (created: Transaction, durationSeconds: number) => {
    setTimerSecondsLeft(durationSeconds);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimerSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          const completed: Transaction = {
            ...created,
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            statusMessage: 'Transaction effectuée avec succès'
          };
          setActiveTx(completed);
          setTxLifecycleState('COMPLETED');
          onTransactionUpdated(completed);

          // Confetti celebration
          try {
            confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#0A6CF1', '#FFB703', '#16C3FF', '#001F54']
            });
          } catch {
            // ignore
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Base transaction creator
  const createBaseTransaction = (): Transaction => {
    const debitAccount = debitAccounts.find(d => d.operatorId === sourceOperatorId);
    return {
      id: `TRX-${Math.floor(10000 + Math.random() * 90000)}`,
      reference: `IS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      sourceOperatorId: sourceOperator.id,
      sourceNumber: sourceNumber,
      sourceCountry: 'CI',
      destinationOperatorId: destOperator.id,
      destinationNumber: destNumber1,
      destinationCountry: 'CI',
      amount: amount,
      fee: calculatedFee,
      totalDebited: totalDebited,
      amountReceived: amount,
      status: 'PROCESSING',
      processingMode: 'ADMIN',
      senderName: `${user.firstName} ${user.lastName}`,
      senderId: user.id,
      collectedByAccountId: debitAccount?.id,
      statusMessage: 'Transaction en cours, veuillez patienter...'
    };
  };

  // ---------------- OPERATOR SPECIFIC HANDLERS ----------------

  // A. ORANGE MONEY: Dial #144*82# then submit 4 digits OTP
  const handleOrangeDial = () => {
    // Notify admin
    onAdminNotify({
      id: `notif-${Date.now()}`,
      title: 'Orange Money USSD #144*82# Déclenché',
      message: `${user.firstName} (${sourceNumber}) compose #144*82# pour autoriser ${amount.toLocaleString('fr-FR')} F vers ${destOperator.name}.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'DIALER_TRIGGERED'
    });

    // Compose directly
    window.location.href = 'tel:%23144*82%23';
  };

  const handleOrangeAuthCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orangeAuthCode || orangeAuthCode.length !== 4) {
      setOrangeCodeError('Veuillez entrer le code à 4 chiffres généré par Orange.');
      return;
    }
    setOrangeCodeError(null);

    const newTx: Transaction = {
      ...createBaseTransaction(),
      orangeAuthCode: orangeAuthCode,
      statusMessage: 'Transaction en cours, veuillez patienter...'
    };

    setActiveTx(newTx);
    setTxLifecycleState('PROCESSING');
    onTransactionCreated(newTx);

    // Notify Admin of code entered
    onAdminNotify({
      id: `notif-${Date.now()}`,
      title: 'Code Orange Saisi',
      message: `Code [${orangeAuthCode}] validé par ${sourceNumber} pour transaction ${newTx.reference}.`,
      timestamp: new Date().toISOString(),
      read: false,
      transactionId: newTx.id,
      type: 'OTP_ENTERED'
    });

    // 1 minute (60 seconds) completion timer as requested
    startCompletionTimer(newTx, 60);
  };

  // B. MOOV MONEY: Link validate button to admin configured USSD
  const handleMoovValidate = () => {
    const ussdCode = adminConfig.moovUssdCode || '*155*1*0102030405#';
    const newTx = createBaseTransaction();

    setActiveTx(newTx);
    setTxLifecycleState('PROCESSING');
    onTransactionCreated(newTx);

    // Notify Admin
    onAdminNotify({
      id: `notif-${Date.now()}`,
      title: 'Moov Money Déclenché',
      message: `Transaction Moov de ${amount.toLocaleString('fr-FR')} F par ${sourceNumber}. USSD déclenché : ${ussdCode}.`,
      timestamp: new Date().toISOString(),
      read: false,
      transactionId: newTx.id,
      type: 'DIALER_TRIGGERED'
    });

    // Trigger USSD dial
    window.location.href = `tel:${encodeURIComponent(ussdCode)}`;

    // 60-90 seconds completion
    startCompletionTimer(newTx, 75);
  };

  // C. MTN MONEY: Copy admin merchant number then dial *133#
  const handleMtnCopyAndDial = () => {
    const merchantNum = adminConfig.mtnMerchantNumber || '+225 05 77 66 33 00';
    navigator.clipboard.writeText(merchantNum.replace(/\s+/g, ''));
    setCopiedMtn(true);

    const newTx = createBaseTransaction();
    setActiveTx(newTx);
    setTxLifecycleState('PROCESSING');
    onTransactionCreated(newTx);

    // Notify Admin
    onAdminNotify({
      id: `notif-${Date.now()}`,
      title: 'Numéro MTN MoMo Copié',
      message: `${sourceNumber} a copié le numéro marchand ${merchantNum} et compose *133# pour un transfert de ${amount.toLocaleString('fr-FR')} F.`,
      timestamp: new Date().toISOString(),
      read: false,
      transactionId: newTx.id,
      type: 'DIALER_TRIGGERED'
    });

    // Redirect to dial *133#
    setTimeout(() => {
      window.location.href = 'tel:*133%23';
    }, 700);

    // 2 minutes (120 seconds) completion timer as requested
    startCompletionTimer(newTx, 120);
  };

  // D. WAVE: Link button to admin configured payment URL
  const handleWavePayLink = () => {
    const waveUrl = adminConfig.wavePaymentUrl || 'https://wave.com/pay/intersend_ci';
    const newTx = createBaseTransaction();

    setActiveTx(newTx);
    setTxLifecycleState('PROCESSING');
    onTransactionCreated(newTx);

    // Notify Admin
    onAdminNotify({
      id: `notif-${Date.now()}`,
      title: 'Paiement Wave Initié',
      message: `${sourceNumber} redirigé vers le lien Wave (${waveUrl}) pour ${amount.toLocaleString('fr-FR')} F.`,
      timestamp: new Date().toISOString(),
      read: false,
      transactionId: newTx.id,
      type: 'DIALER_TRIGGERED'
    });

    // Open Wave URL in new tab / deep link
    window.open(waveUrl, '_blank');

    // 1 minute (60 seconds) completion timer as requested
    startCompletionTimer(newTx, 60);
  };

  // E. TRÉSOR MONEY: Service indisponible pour l'instant (ne pas initier d'opération)
  const handleTresorValidate = () => {
    // Opérations suspendues conformément aux directives
    return;
  };

  return (
    <div className="w-full max-w-md mx-auto pb-24">
      {/* Step Header */}
      {txLifecycleState === 'INPUT' && (
        <div className="bg-[#001F54] text-white p-5 rounded-3xl border-3 border-[#001F54] shadow-[4px_4px_0px_#001F54] mb-5 relative overflow-hidden">
          <AfricanPatternStrip height={8} className="mb-3 rounded opacity-80" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#FFB703] text-[#001F54] font-black text-xs flex items-center justify-center border-2 border-[#001F54]">
                {currentStep}/6
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#16C3FF]">
                Transfert Inter-Opérateurs
              </span>
            </div>

            <span className="text-[11px] font-black text-[#FFB703] bg-[#001F54] border border-[#FFB703] px-2 py-0.5 rounded-full">
              Frais 1% fixes
            </span>
          </div>

          <h2 className="text-xl font-black text-white font-display mt-2">
            {currentStep === 1 && '1. Réseau à débiter'}
            {currentStep === 2 && '2. Numéro à débiter'}
            {currentStep === 3 && '3. Réseau à créditer'}
            {currentStep === 4 && '4. Numéro destinataire & confirmation'}
            {currentStep === 5 && '5. Montant du transfert'}
            {currentStep === 6 && '6. Validation du débit'}
          </h2>
        </div>
      )}

      {/* STEP 1: Sélectionner le réseau à débuter (Source Operator) */}
      {txLifecycleState === 'INPUT' && currentStep === 1 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white p-4 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54]">
            <p className="text-xs font-bold text-[#001F54]/75 mb-3 uppercase tracking-wider">
              Sélectionnez l'opérateur émetteur (compte qui envoie)
            </p>
            <div className="space-y-2.5">
              {operators.map((op) => (
                <OperatorCardSelect
                  key={op.id}
                  operator={op}
                  selected={sourceOperatorId === op.id}
                  onSelect={() => {
                    if (op.id === 'tresor') return;
                    setSourceOperatorId(op.id);
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={sourceOperatorId === 'tresor'}
            onClick={() => {
              if (sourceOperatorId === 'tresor') return;
              setCurrentStep(2);
            }}
            className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-black ${
              sourceOperatorId === 'tresor' 
                ? 'bg-slate-200 text-slate-400 border-2 border-slate-300 cursor-not-allowed'
                : 'btn-cartoon-blue cursor-pointer'
            }`}
          >
            <span>Continuer vers le numéro source</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* STEP 2: Numéro à débuter */}
      {txLifecycleState === 'INPUT' && currentStep === 2 && (
        <form onSubmit={handleSourceNumberSubmit} className="space-y-4 animate-fadeIn">
          <div className="bg-white p-5 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-100">
              <OperatorLogo operatorId={sourceOperator.id} size={42} />
              <div>
                <span className="text-[11px] font-bold text-[#001F54]/60 uppercase">Opérateur sélectionné</span>
                <h4 className="font-black text-sm text-[#001F54]">{sourceOperator.brandName}</h4>
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-[#001F54] mb-1.5 block">
                Numéro de téléphone à débiter
              </label>
              <input
                type="tel"
                autoFocus
                value={sourceNumber}
                onChange={(e) => setSourceNumber(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                className="w-full h-14 px-4 rounded-xl bg-[#F4F9FD] border-3 border-[#001F54] font-mono font-black text-base text-[#001F54] shadow-[2px_2px_0px_#001F54] focus:outline-none focus:bg-white"
              />
            </div>

            {user.savedNumbers.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#001F54]/60 uppercase block mb-1.5">
                  Numéros fréquents :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {user.savedNumbers.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSourceNumber(item.number);
                        setSourceOperatorId(item.operatorId);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#DFF6FF] border-2 border-[#001F54] text-xs font-bold text-[#001F54] hover:bg-[#c3eafd] cursor-pointer"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-1/3 h-14 rounded-2xl btn-cartoon-white font-bold text-sm cursor-pointer"
            >
              ← Retour
            </button>
            <button
              type="submit"
              className="flex-1 h-14 rounded-2xl btn-cartoon-blue flex items-center justify-center gap-2 text-base font-black cursor-pointer"
            >
              <span>Valider le numéro</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Sélectionner le réseau à créditer (Destination Operator) */}
      {txLifecycleState === 'INPUT' && currentStep === 3 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-[#DFF6FF] p-3 rounded-2xl border-2 border-[#001F54] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <OperatorLogo operatorId={sourceOperator.id} size={30} />
              <div className="text-xs">
                <span className="font-bold text-[#001F54]/60 block text-[10px]">DEPUIS</span>
                <span className="font-black text-[#001F54]">{sourceOperator.name} ({sourceNumber})</span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#0A6CF1]">✓ Validé</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54]">
            <p className="text-xs font-bold text-[#001F54]/75 mb-3 uppercase tracking-wider">
              Sélectionnez l'opérateur à créditer (compte récepteur)
            </p>
            <div className="space-y-2.5">
              {operators.map((op) => (
                <OperatorCardSelect
                  key={op.id}
                  operator={op}
                  selected={destOperatorId === op.id}
                  onSelect={() => {
                    if (op.id === 'tresor') return;
                    setDestOperatorId(op.id);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-1/3 h-14 rounded-2xl btn-cartoon-white font-bold text-sm cursor-pointer"
            >
              ← Retour
            </button>
            <button
              type="button"
              disabled={destOperatorId === 'tresor'}
              onClick={() => {
                if (destOperatorId === 'tresor') return;
                setCurrentStep(4);
              }}
              className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-black ${
                destOperatorId === 'tresor'
                  ? 'bg-slate-200 text-slate-400 border-2 border-slate-300 cursor-not-allowed'
                  : 'btn-cartoon-blue cursor-pointer'
              }`}
            >
              <span>Numéro destinataire</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Mentionner le numéro une fois et une seconde fois pour vérification */}
      {txLifecycleState === 'INPUT' && currentStep === 4 && (
        <form onSubmit={handleDestNumbersSubmit} className="space-y-4 animate-fadeIn">
          <div className="bg-white p-5 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-100">
              <OperatorLogo operatorId={destOperator.id} size={42} />
              <div>
                <span className="text-[11px] font-bold text-[#001F54]/60 uppercase">Réseau récepteur</span>
                <h4 className="font-black text-sm text-[#001F54]">{destOperator.brandName}</h4>
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-[#001F54] mb-1.5 block">
                1. Numéro à créditer (1ère saisie)
              </label>
              <input
                type="tel"
                autoFocus
                value={destNumber1}
                onChange={(e) => setDestNumber1(e.target.value)}
                placeholder="Ex: 01 02 03 04 05"
                className="w-full h-14 px-4 rounded-xl bg-[#F4F9FD] border-3 border-[#001F54] font-mono font-black text-base text-[#001F54] shadow-[2px_2px_0px_#001F54] focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-[#001F54] mb-1.5 flex items-center justify-between">
                <span>2. Confirmer le numéro (2nde vérification)</span>
                {destNumber2 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    numbersMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                  }`}>
                    {numbersMatch ? '✓ Concordance parfaite' : '✕ Ne correspond pas'}
                  </span>
                )}
              </label>
              <input
                type="tel"
                value={destNumber2}
                onChange={(e) => setDestNumber2(e.target.value)}
                placeholder="Retapez exactement le même numéro"
                className={`w-full h-14 px-4 rounded-xl font-mono font-black text-base text-[#001F54] shadow-[2px_2px_0px_#001F54] focus:outline-none ${
                  destNumber2 && !numbersMatch 
                    ? 'bg-red-50 border-3 border-red-500' 
                    : numbersMatch
                      ? 'bg-emerald-50 border-3 border-emerald-600'
                      : 'bg-[#F4F9FD] border-3 border-[#001F54]'
                }`}
              />
            </div>

            {numberMatchError && (
              <div className="p-3 rounded-xl bg-red-100 border-2 border-red-500 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{numberMatchError}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="w-1/3 h-14 rounded-2xl btn-cartoon-white font-bold text-sm cursor-pointer"
            >
              ← Retour
            </button>
            <button
              type="submit"
              disabled={!numbersMatch}
              className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-black cursor-pointer transition-all ${
                numbersMatch ? 'btn-cartoon-gold' : 'opacity-40 bg-slate-300 border-3 border-slate-400 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>Valider les numéros</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: Montant & Frais Uniques 1% (250F - 2 000 000F) */}
      {txLifecycleState === 'INPUT' && currentStep === 5 && (
        <form onSubmit={handleAmountSubmit} className="space-y-4 animate-fadeIn">
          <div className="bg-white p-5 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase text-[#001F54]">
                  Montant à envoyer (FCFA)
                </label>
                <span className="text-[10px] font-bold text-slate-500">
                  Min: 250 F · Max: 2 000 000 F
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={customAmountInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setCustomAmountInput(raw);
                    const num = parseInt(raw, 10);
                    if (!isNaN(num)) setAmount(num);
                  }}
                  className="w-full h-16 px-4 rounded-xl bg-[#F4F9FD] border-3 border-[#001F54] font-mono font-black text-2xl text-[#001F54] shadow-[2px_2px_0px_#001F54] focus:outline-none focus:bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#001F54]">
                  FCFA
                </span>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div>
              <span className="text-[11px] font-bold text-[#001F54]/60 uppercase block mb-1.5">
                Montants rapides :
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 5000, 25000, 100000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val);
                      setCustomAmountInput(val.toString());
                    }}
                    className={`py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                      amount === val
                        ? 'bg-[#001F54] text-[#FFB703] border-[#001F54]'
                        : 'bg-[#DFF6FF] text-[#001F54] border-[#001F54] hover:bg-[#c3eafd]'
                    }`}
                  >
                    {val >= 1000 ? `${val / 1000}k F` : `${val} F`}
                  </button>
                ))}
              </div>
            </div>

            {/* Strict 1% Fee Transparency Breakdown */}
            <div className="p-4 rounded-xl bg-[#DFF6FF] border-2 border-[#001F54] space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#001F54]">
                <span>Montant à transférer :</span>
                <span className="font-mono">{amount.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-[#001F54]">
                <span>Frais uniques (1%) :</span>
                <span className="font-mono font-bold text-[#0A6CF1]">+{calculatedFee.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="pt-2 border-t-2 border-[#001F54]/20 flex justify-between font-black text-sm text-[#001F54]">
                <span>Total débité :</span>
                <span className="font-mono text-base text-[#001F54]">{totalDebited.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-800 text-[11px]">
                <span>Le destinataire recevra :</span>
                <span className="font-mono font-black">{amount.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* 2 minutes guarantee notice */}
            <div className="p-3 rounded-xl bg-[#FFFDE8] border-2 border-[#FFB703] text-xs text-[#001F54] font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFB703] shrink-0" />
              <span>Votre transfert sera effectué dans les 2 minutes qui suivent la validation.</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="w-1/3 h-14 rounded-2xl btn-cartoon-white font-bold text-sm cursor-pointer"
            >
              ← Retour
            </button>
            <button
              type="submit"
              className="flex-1 h-14 rounded-2xl btn-cartoon-gold flex items-center justify-center gap-2 text-base font-black cursor-pointer"
            >
              <span>Continuer vers validation</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 6: VALIDATION SPECIFIQUE PAR OPERATEUR */}
      {txLifecycleState === 'INPUT' && currentStep === 6 && (
        <div className="space-y-4 animate-fadeIn">
          {/* Summary Card */}
          <div className="bg-white p-5 rounded-3xl border-3 border-[#001F54] shadow-[4px_4px_0px_#001F54] space-y-4">
            <div className="text-center pb-3 border-b-2 border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A6CF1]">
                Validation du Débit
              </span>
              <h3 className="text-2xl font-black text-[#001F54] font-display mt-0.5">
                {amount.toLocaleString('fr-FR')} FCFA
              </h3>
              <p className="text-[11px] font-bold text-slate-500 mt-1">
                Frais uniques 1% : {calculatedFee.toLocaleString('fr-FR')} FCFA · Total : {totalDebited.toLocaleString('fr-FR')} FCFA
              </p>
            </div>

            {/* Operator specific confirmation zone */}

            {/* 1. CAS ORANGE MONEY: Bouton #144*82# + Champ 4 chiffres */}
            {sourceOperatorId === 'orange' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#FFF3E8] border-2 border-[#FF7900] space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-black text-[#FF7900]">
                    <PhoneCall className="w-4 h-4" />
                    <span>Étape 1 : Obtenir votre code secret Orange</span>
                  </div>
                  <p className="text-[#001F54] font-medium leading-relaxed">
                    Appuyez sur le bouton ci-dessous pour composer directement <strong className="font-mono font-black">#144*82#</strong> sur votre téléphone. Vous recevrez un code d'autorisation à 4 chiffres.
                  </p>

                  <button
                    type="button"
                    onClick={handleOrangeDial}
                    className="w-full h-13 rounded-xl bg-[#FF7900] text-white border-2 border-[#001F54] font-black text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#001F54] hover:bg-[#e06b00] active:translate-y-0.5 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Composer #144*82# sur le téléphone</span>
                  </button>
                </div>

                {/* Étape 2: Champ de 4 chiffres à revenir compléter */}
                <form onSubmit={handleOrangeAuthCodeSubmit} className="space-y-3 pt-1">
                  <label className="text-xs font-black uppercase text-[#001F54] block">
                    Étape 2 : Entrez le code à 4 chiffres reçu
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={orangeAuthCode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      setOrangeAuthCode(v);
                    }}
                    placeholder="● ● ● ●"
                    className="w-full h-14 text-center font-mono font-black text-2xl tracking-widest rounded-xl bg-[#F4F9FD] border-3 border-[#001F54] text-[#001F54] shadow-[2px_2px_0px_#001F54] focus:outline-none focus:bg-white"
                  />

                  {orangeCodeError && (
                    <div className="p-2.5 rounded-xl bg-red-100 border border-red-400 text-red-700 text-xs font-bold text-center">
                      {orangeCodeError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-14 rounded-2xl btn-cartoon-gold font-black text-base flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    <span>Confirmer la transaction</span>
                  </button>
                </form>
              </div>
            )}

            {/* 2. CAS MOOV MONEY: Bouton lié au code USSD configuré par l'admin */}
            {sourceOperatorId === 'moov' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#E8F1FC] border-2 border-[#0055A5] space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-black text-[#0055A5]">
                    <PhoneCall className="w-4 h-4" />
                    <span>Validation directe Moov Money Flooz</span>
                  </div>
                  <p className="text-[#001F54] leading-relaxed">
                    Cliquez sur le bouton ci-dessous pour déclencher l'opération USSD directement sur votre compte Moov.
                  </p>
                  <div className="p-2.5 rounded-lg bg-white border border-[#0055A5]/30 font-mono text-center font-black text-xs text-[#0055A5]">
                    {adminConfig.moovUssdCode || '*155*1*0102030405#'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleMoovValidate}
                  className="w-full h-14 rounded-2xl btn-cartoon-blue font-black text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>Valider et composer l'opération USSD</span>
                </button>
              </div>
            )}

            {/* 3. CAS MTN MONEY: Copier numéro marchand puis composer *133# */}
            {sourceOperatorId === 'mtn' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FFFDE8] border-2 border-[#E6A800] space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-black text-[#001F54]">
                    <Copy className="w-4 h-4 text-[#E6A800]" />
                    <span>Paiement Marchand MTN MoMo</span>
                  </div>
                  <p className="text-[#001F54] leading-relaxed">
                    Copiez le numéro marchand officiel ci-dessous. Dès la copie, l'application vous dirigera vers la composition de <strong className="font-mono font-black">*133#</strong> pour effectuer le paiement de <strong>{totalDebited.toLocaleString('fr-FR')} FCFA</strong>.
                  </p>

                  <div className="p-3 rounded-xl bg-white border-2 border-[#001F54] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Numéro Marchand Intersend</span>
                      <span className="font-mono font-black text-base text-[#001F54]">
                        {adminConfig.mtnMerchantNumber || '+225 05 77 66 33 00'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#E6A800]">
                      {copiedMtn ? '✓ Copié !' : 'À copier'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleMtnCopyAndDial}
                  className="w-full h-14 rounded-2xl bg-[#FFCC00] text-black border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] font-black text-base flex items-center justify-center gap-2 hover:bg-[#ebd500] cursor-pointer"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copier le numéro et composer *133#</span>
                </button>
              </div>
            )}

            {/* 4. CAS WAVE: Lien de paiement configuré par l'admin */}
            {sourceOperatorId === 'wave' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#E8F7FE] border-2 border-[#1EA8E7] space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-black text-[#1EA8E7]">
                    <ExternalLink className="w-4 h-4" />
                    <span>Lien Sécurisé Wave</span>
                  </div>
                  <p className="text-[#001F54] leading-relaxed">
                    Appuyez sur le bouton pour être redirigé vers l'application Wave ou le lien de paiement officiel Intersend.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleWavePayLink}
                  className="w-full h-14 rounded-2xl bg-[#1EA8E7] text-white border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] font-black text-base flex items-center justify-center gap-2 hover:bg-[#1997d1] cursor-pointer"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Payer avec Wave</span>
                </button>
              </div>
            )}

            {/* 5. CAS TRÉSOR MONEY - SERVICE INDISPONIBLE */}
            {sourceOperatorId === 'tresor' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-amber-50 border-3 border-amber-300 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-700">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-amber-900 text-base">
                      Service indisponible pour l'instant
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed font-semibold mt-1">
                      Les opérations avec Trésor Money sont momentanément suspendues. Aucune transaction ne peut être initiée avec cet opérateur.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full h-14 rounded-2xl btn-cartoon-blue flex items-center justify-center gap-2 text-base font-black cursor-pointer"
                >
                  <span>Changer de réseau émetteur</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCurrentStep(5)}
            className="w-full py-2.5 text-xs font-bold text-[#001F54]/70 hover:text-[#001F54] text-center"
          >
            ← Modifier le montant
          </button>
        </div>
      )}

      {/* ÉCRAN 1: "Transaction en cours, veuillez patienter..." */}
      {txLifecycleState === 'PROCESSING' && activeTx && (
        <div className="bg-white p-6 rounded-3xl border-3 border-[#001F54] shadow-[5px_5px_0px_#001F54] text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-[#FFFDE8] border-3 border-[#001F54] text-[#FFB703] flex items-center justify-center mx-auto shadow-md">
            <Hourglass className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <div>
            <h3 className="text-xl font-black text-[#001F54] font-display">
              Transaction en cours
            </h3>
            <p className="text-sm font-bold text-[#0A6CF1] mt-1">
              Veuillez patienter...
            </p>
            <p className="text-xs text-[#001F54]/70 mt-2 max-w-xs mx-auto">
              Votre opération sera effectuée dans les 2 minutes qui suivent.
            </p>
          </div>

          {/* Countdown indicator */}
          <div className="p-4 rounded-2xl bg-[#F4F9FD] border-2 border-[#001F54] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#001F54]">
              <span>Délai estimé restant :</span>
              <span className="font-mono text-sm text-[#0A6CF1]">{timerSecondsLeft}s</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-[#001F54]">
              <div 
                className="h-full bg-gradient-to-r from-[#FFB703] to-[#16C3FF] transition-all duration-1000"
                style={{ width: `${Math.max(5, 100 - (timerSecondsLeft / 120) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Transaction Summary Card */}
          <div className="p-4 rounded-xl bg-[#DFF6FF] border-2 border-[#001F54] text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Référence :</span>
              <span className="font-mono font-bold text-[#001F54]">{activeTx.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Émetteur ({activeTx.sourceOperatorId.toUpperCase()}) :</span>
              <span className="font-mono text-[#001F54]">{activeTx.sourceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Destinataire ({activeTx.destinationOperatorId.toUpperCase()}) :</span>
              <span className="font-mono text-[#001F54]">{activeTx.destinationNumber}</span>
            </div>
            <div className="pt-2 border-t border-[#001F54]/20 flex justify-between font-black text-[#001F54]">
              <span>Montant à créditer :</span>
              <span className="font-mono text-sm">{activeTx.amount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onGoToTransactions}
              className="w-full h-12 rounded-xl btn-cartoon-white text-xs font-bold cursor-pointer"
            >
              Suivre dans l'historique
            </button>
          </div>
        </div>
      )}

      {/* ÉCRAN 2: "Transaction effectuée" (Reçu final) */}
      {txLifecycleState === 'COMPLETED' && activeTx && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-3xl border-3 border-[#001F54] shadow-[5px_5px_0px_#001F54] space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-3 border-[#001F54] text-emerald-800 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-[#001F54] font-display">
                Transaction effectuée !
              </h3>
              <p className="text-xs font-semibold text-emerald-700 mt-1">
                Le compte destinataire a été crédité avec succès.
              </p>
            </div>

            {/* Official Receipt Box */}
            <div className="p-4 rounded-2xl bg-[#F4F9FD] border-2 border-[#001F54] text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-[11px] font-bold text-slate-500">Référence</span>
                <span className="font-mono font-black text-xs text-[#001F54] flex items-center gap-1">
                  {activeTx.reference}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeTx.reference);
                      setCopiedRef(true);
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="p-1 text-[#0A6CF1] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedRef && <span className="text-[10px] text-emerald-600">✓</span>}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Depuis ({activeTx.sourceOperatorId.toUpperCase()})</span>
                  <span className="font-mono font-bold text-[#001F54]">{activeTx.sourceNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Vers ({activeTx.destinationOperatorId.toUpperCase()})</span>
                  <span className="font-mono font-bold text-[#001F54]">{activeTx.destinationNumber}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-[#001F54]">Montant crédité</span>
                <span className="font-mono font-black text-sm text-[#001F54]">
                  {activeTx.amount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Frais (1% unique)</span>
                <span className="font-mono">+{activeTx.fee.toLocaleString('fr-FR')} FCFA</span>
              </div>

              <div className="pt-2 border-t-2 border-[#001F54] flex justify-between items-center font-black">
                <span className="text-[#001F54]">Total Débité</span>
                <span className="font-mono text-base text-[#001F54]">
                  {activeTx.totalDebited.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleStartNew}
                className="w-full h-14 rounded-2xl btn-cartoon-gold font-black text-base flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                <span>Effectuer un nouveau transfert</span>
              </button>

              <button
                type="button"
                onClick={onGoToTransactions}
                className="w-full h-12 rounded-xl btn-cartoon-white font-bold text-xs cursor-pointer"
              >
                Voir mes transactions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
