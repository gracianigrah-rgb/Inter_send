import React, { useState } from 'react';
import { 
  Operator, 
  Transaction, 
  UserProfile, 
  DebitAccount, 
  CreditAccount, 
  WhitelistNumber,
  AdminConfig,
  AdminNotification,
  TransactionStatus
} from '../../types';
import { OperatorLogo } from '../OperatorBadge';
import { AfricanPatternStrip, AfricanShieldIcon } from '../AfricanPattern';
import { 
  Sliders, 
  Phone, 
  ArrowLeftRight, 
  Users, 
  Wallet, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Search, 
  ArrowLeft,
  Shield,
  Bell,
  Check,
  X,
  Link,
  PhoneCall,
  Save,
  Send
} from 'lucide-react';

interface AdminDashboardProps {
  operators: Operator[];
  setOperators: React.Dispatch<React.SetStateAction<Operator[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  debitAccounts: DebitAccount[];
  setDebitAccounts: React.Dispatch<React.SetStateAction<DebitAccount[]>>;
  creditAccounts: CreditAccount[];
  setCreditAccounts: React.Dispatch<React.SetStateAction<CreditAccount[]>>;
  whitelistNumbers: WhitelistNumber[];
  setWhitelistNumbers: React.Dispatch<React.SetStateAction<WhitelistNumber[]>>;
  adminConfig: AdminConfig;
  setAdminConfig: React.Dispatch<React.SetStateAction<AdminConfig>>;
  notifications: AdminNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AdminNotification[]>>;
  onCloseAdmin: () => void;
}

type AdminTab = 
  | 'transactions' 
  | 'gateways_admins' 
  | 'operators' 
  | 'numbers' 
  | 'users' 
  | 'debit_accounts' 
  | 'credit_accounts';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  operators,
  setOperators,
  transactions,
  setTransactions,
  users,
  setUsers,
  debitAccounts,
  setDebitAccounts,
  creditAccounts,
  setCreditAccounts,
  whitelistNumbers,
  setWhitelistNumbers,
  adminConfig,
  setAdminConfig,
  notifications,
  setNotifications,
  onCloseAdmin
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('transactions');
  const [searchTerm, setSearchTerm] = useState('');

  // Local state for gateway configuration edits
  const [mtnNum, setMtnNum] = useState(adminConfig.mtnMerchantNumber);
  const [waveUrl, setWaveUrl] = useState(adminConfig.wavePaymentUrl);
  const [moovUssd, setMoovUssd] = useState(adminConfig.moovUssdCode);
  const [tresorUssd, setTresorUssd] = useState(adminConfig.tresorUssdCode);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // New administrator input
  const [newAdminPhone, setNewAdminPhone] = useState('');

  // Transaction Status Change Actions
  const handleUpdateStatus = (txId: string, newStatus: TransactionStatus, note?: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        const updated: Transaction = {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : t.completedAt,
          adminNote: note || `Statut mis à jour en ${newStatus} par administrateur.`,
          statusMessage: newStatus === 'COMPLETED' ? 'Transaction effectuée avec succès' : 'Transaction en cours, veuillez patienter...'
        };
        return updated;
      }
      return t;
    }));

    // Update active transaction in localStorage if it matches
    const activeRaw = localStorage.getItem('intersend_active_tx');
    if (activeRaw) {
      try {
        const activeTx = JSON.parse(activeRaw);
        if (activeTx.id === txId) {
          localStorage.setItem('intersend_active_tx', JSON.stringify({
            ...activeTx,
            status: newStatus,
            completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : activeTx.completedAt,
            statusMessage: newStatus === 'COMPLETED' ? 'Transaction effectuée avec succès' : 'Transaction en cours, veuillez patienter...'
          }));
        }
      } catch {
        // ignore
      }
    }
  };

  // Add new administrator
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newAdminPhone.trim();
    if (!cleaned) return;

    if (!adminConfig.adminPhoneNumbers.includes(cleaned)) {
      const updatedList = [...adminConfig.adminPhoneNumbers, cleaned];
      setAdminConfig(prev => ({
        ...prev,
        adminPhoneNumbers: updatedList
      }));

      // Add to whitelist
      const newWl: WhitelistNumber = {
        id: `wl-admin-${Date.now()}`,
        phoneNumber: cleaned,
        operatorId: 'orange',
        ownerName: 'Administrateur Intersend',
        type: 'ADMIN',
        reason: 'Administrateur désigné',
        addedAt: new Date().toISOString().slice(0, 10)
      };
      setWhitelistNumbers(prev => [newWl, ...prev]);
    }
    setNewAdminPhone('');
  };

  // Remove admin
  const handleRemoveAdmin = (phone: string) => {
    if (phone.includes('0748918048') || phone === '+2250748918048') {
      alert('Impossible de supprimer le super administrateur maître (+2250748918048).');
      return;
    }
    setAdminConfig(prev => ({
      ...prev,
      adminPhoneNumbers: prev.adminPhoneNumbers.filter(p => p !== phone)
    }));
  };

  // Save Gateway settings
  const handleSaveGateways = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminConfig(prev => ({
      ...prev,
      mtnMerchantNumber: mtnNum,
      wavePaymentUrl: waveUrl,
      moovUssdCode: moovUssd,
      tresorUssdCode: tresorUssd
    }));
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'ID,Reference,Date,Source,SourceNumber,Dest,DestNumber,Montant,Frais,Statut,CodeOrange\n';
    const rows = transactions.map(t => 
      `${t.id},${t.reference},${t.createdAt},${t.sourceOperatorId},${t.sourceNumber},${t.destinationOperatorId},${t.destinationNumber},${t.amount},${t.fee},${t.status},${t.orangeAuthCode || ''}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intersend-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const totalVolume = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalFees = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((acc, t) => acc + t.fee, 0);

  const pendingCount = transactions.filter(
    t => t.status === 'PROCESSING' || t.status === 'PENDING_ADMIN_RECEPTION'
  ).length;

  return (
    <div className="min-h-screen bg-[#F4F9FD] text-[#001F54] flex flex-col antialiased">
      <AfricanPatternStrip height={10} />

      {/* Top Header */}
      <header className="bg-[#001F54] text-white border-b-3 border-[#001F54] px-4 py-3 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCloseAdmin}
            className="px-3 py-1.5 rounded-xl bg-[#DFF6FF] text-[#001F54] font-bold text-xs flex items-center gap-1.5 hover:bg-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'application</span>
          </button>
          <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <AfricanShieldIcon size={24} />
            <h1 className="text-lg font-black tracking-tight font-display text-white">
              intersend <span className="text-[#FFB703]">Console Administrateur</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-[#FFB703] text-[#001F54] text-xs font-black animate-pulse flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {pendingCount} Transaction(s) en cours
            </span>
          )}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-[#0A6CF1] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#095bc9] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>
        </div>
      </header>

      {/* Real-time Notifications Alert Box */}
      {notifications.length > 0 && (
        <div className="bg-[#FFFDE8] border-b-2 border-[#FFB703] px-4 sm:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <Bell className="w-4 h-4 text-[#E6A800] shrink-0" />
              <span className="font-bold text-[#001F54]">Dernière alerte ussd/paiement :</span>
              <span className="font-semibold text-slate-700 truncate max-w-md">
                {notifications[0].title} — {notifications[0].message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNotifications([])}
              className="text-[10px] font-bold text-slate-500 hover:text-black shrink-0 ml-2"
            >
              Effacer
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="bg-white border-b-2 border-slate-200 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#F4F9FD] border-2 border-[#001F54]/20">
            <span className="text-[10px] uppercase font-bold text-slate-500">Volume Total Traité</span>
            <p className="font-mono font-black text-lg text-[#001F54] mt-0.5">
              {totalVolume.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#DFF6FF] border-2 border-[#001F54]/20">
            <span className="text-[10px] uppercase font-bold text-slate-500">Commissions (1% net)</span>
            <p className="font-mono font-black text-lg text-[#0A6CF1] mt-0.5">
              {totalFees.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FFFDE8] border-2 border-[#FFB703]/50">
            <span className="text-[10px] uppercase font-bold text-slate-500">Transactions Réalisées</span>
            <p className="font-mono font-black text-lg text-[#001F54] mt-0.5">
              {transactions.length} tx
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#F4F9FD] border-2 border-[#001F54]/20">
            <span className="text-[10px] uppercase font-bold text-slate-500">Administrateurs Autorisés</span>
            <p className="font-mono font-black text-lg text-[#001F54] mt-0.5">
              {adminConfig.adminPhoneNumbers.length} numéros
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b-2 border-slate-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          {[
            { id: 'transactions', label: '1. Transactions & Suivi USSD', icon: ArrowLeftRight },
            { id: 'gateways_admins', label: '2. Administrateurs & Liens/USSD', icon: Shield },
            { id: 'operators', label: '3. Opérateurs', icon: Sliders },
            { id: 'numbers', label: '4. Numéros & Surveillance', icon: Phone },
            { id: 'users', label: '5. Utilisateurs', icon: Users },
            { id: 'debit_accounts', label: '6. Comptes Débiteurs', icon: Building2 },
            { id: 'credit_accounts', label: '7. Comptes à Créditer', icon: Wallet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  setSearchTerm('');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-2 ${
                  isActive
                    ? 'bg-[#001F54] text-[#FFB703] border-[#001F54] shadow-[2px_2px_0px_#001F54]'
                    : 'bg-white text-[#001F54] border-slate-200 hover:bg-[#DFF6FF]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {/* TAB 1: TRANSACTIONS & LIVE USSD ACTIONS */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54]">
              <div>
                <h3 className="text-lg font-black text-[#001F54] font-display">
                  Gestion des Transactions en Direct
                </h3>
                <p className="text-xs text-[#001F54]/75">
                  L'administrateur valide les transactions dès réception et peut modifier leur état immédiatement.
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par référence, numéro..."
                  className="h-10 pl-9 pr-3 text-xs rounded-xl border-2 border-[#001F54] focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#001F54] text-white">
                    <tr>
                      <th className="py-3 px-3">Réf / Date</th>
                      <th className="py-3 px-3">Émetteur</th>
                      <th className="py-3 px-3">Bénéficiaire</th>
                      <th className="py-3 px-3">Montant</th>
                      <th className="py-3 px-3">Frais (1%)</th>
                      <th className="py-3 px-3">Code Orange</th>
                      <th className="py-3 px-3">Statut</th>
                      <th className="py-3 px-3 text-right">Action Administrateur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions
                      .filter(t => 
                        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.sourceNumber.includes(searchTerm) ||
                        t.destinationNumber.includes(searchTerm)
                      )
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#F9FCFF]">
                          <td className="py-3 px-3">
                            <span className="font-mono font-black text-[#001F54] block">{tx.reference}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(tx.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <OperatorLogo operatorId={tx.sourceOperatorId} size={22} />
                              <div>
                                <span className="font-bold text-[#001F54] uppercase">{tx.sourceOperatorId}</span>
                                <span className="font-mono text-[10px] text-slate-500 block">{tx.sourceNumber}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <OperatorLogo operatorId={tx.destinationOperatorId} size={22} />
                              <div>
                                <span className="font-bold text-[#001F54] uppercase">{tx.destinationOperatorId}</span>
                                <span className="font-mono text-[10px] text-slate-500 block">{tx.destinationNumber}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono font-black text-[#001F54]">
                            {tx.amount.toLocaleString('fr-FR')} F
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-[#0A6CF1]">
                            +{tx.fee.toLocaleString('fr-FR')} F
                          </td>

                          <td className="py-3 px-3">
                            {tx.orangeAuthCode ? (
                              <span className="px-2 py-0.5 rounded bg-[#FFF3E8] border border-[#FF7900] text-[#FF7900] font-mono font-black text-xs">
                                {tx.orangeAuthCode}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {tx.status === 'COMPLETED' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                ✓ Effectué
                              </span>
                            ) : tx.status === 'PROCESSING' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                ⏳ En cours
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                ✕ {tx.status}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {tx.status !== 'COMPLETED' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(tx.id, 'COMPLETED')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer shadow-sm"
                                  title="Marquer comme effectué et créditer le destinataire"
                                >
                                  ✓ Valider Transfert
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(tx.id, 'FAILED')}
                                  className="px-2 py-1 rounded-lg bg-red-100 text-red-700 font-bold text-[11px] hover:bg-red-200 cursor-pointer"
                                >
                                  Rejeter
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Clôturé
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GESTION DES ADMINISTRATEURS & CONFIGURATION PASSERELLES */}
        {activeTab === 'gateways_admins' && (
          <div className="space-y-6">
            {/* Section 1: Gestion des Administrateurs */}
            <div className="bg-white p-5 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
                <div>
                  <h3 className="text-base font-black text-[#001F54] font-display flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#0A6CF1]" />
                    Numéros Autorisés à Administrer Intersend
                  </h3>
                  <p className="text-xs text-[#001F54]/75">
                    Seuls ces numéros peuvent accéder à cette console d'administration. Le numéro maître est <strong className="font-mono">+2250748918048</strong>.
                  </p>
                </div>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddAdmin} className="flex gap-2">
                <input
                  type="tel"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  placeholder="Ajouter un numéro admin (ex: +225 07 00 00 00 00)"
                  className="flex-1 h-11 px-4 rounded-xl border-2 border-[#001F54] text-xs font-mono font-bold"
                />
                <button
                  type="submit"
                  className="px-4 h-11 rounded-xl btn-cartoon-gold text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter Administrateur</span>
                </button>
              </form>

              {/* Admin numbers list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                {adminConfig.adminPhoneNumbers.map((phone, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#F4F9FD] border-2 border-[#001F54] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-black text-[#001F54] block">{phone}</span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {phone.includes('0748918048') ? '👑 Super Admin Maître' : 'Administrateur'}
                      </span>
                    </div>

                    {!phone.includes('0748918048') && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAdmin(phone)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Retirer les droits"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Configuration des Passerelles Débit (MTN, Wave, Moov, Trésor) */}
            <form onSubmit={handleSaveGateways} className="bg-white p-5 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
                <div>
                  <h3 className="text-base font-black text-[#001F54] font-display flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#0A6CF1]" />
                    Configuration des Débits Opérateurs (USSD, Liens & Numéros Marchands)
                  </h3>
                  <p className="text-xs text-[#001F54]/75">
                    Modifiez à volonté le numéro à copier pour MTN, le lien de paiement Wave, et les codes USSD Moov et Trésor.
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl btn-cartoon-blue text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les passerelles</span>
                </button>
              </div>

              {savedSettingsSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-800 text-xs font-bold">
                  ✓ Paramètres de passerelles enregistrés avec succès !
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MTN Merchant Number */}
                <div className="p-3.5 rounded-xl bg-[#FFFDE8] border-2 border-[#E6A800] space-y-1.5">
                  <label className="text-xs font-black text-[#001F54] block">
                    Numéro Marchand MTN MoMo (que le client copie)
                  </label>
                  <input
                    type="text"
                    value={mtnNum}
                    onChange={(e) => setMtnNum(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border-2 border-[#001F54] text-xs font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-600 block">
                    Le client copiera ce numéro avant de composer *133#.
                  </span>
                </div>

                {/* Wave Payment Link */}
                <div className="p-3.5 rounded-xl bg-[#E8F7FE] border-2 border-[#1EA8E7] space-y-1.5">
                  <label className="text-xs font-black text-[#001F54] block">
                    Lien de Paiement Wave
                  </label>
                  <input
                    type="text"
                    value={waveUrl}
                    onChange={(e) => setWaveUrl(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border-2 border-[#001F54] text-xs font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-600 block">
                    URL ou Deep link Wave déclenché au clic sur "Envoyer".
                  </span>
                </div>

                {/* Moov USSD Code */}
                <div className="p-3.5 rounded-xl bg-[#E8F1FC] border-2 border-[#0055A5] space-y-1.5">
                  <label className="text-xs font-black text-[#001F54] block">
                    Code USSD Moov Money Flooz
                  </label>
                  <input
                    type="text"
                    value={moovUssd}
                    onChange={(e) => setMoovUssd(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border-2 border-[#001F54] text-xs font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-600 block">
                    Code USSD composé directement au clic sur le bouton de validation.
                  </span>
                </div>

                {/* Trésor USSD Code */}
                <div className="p-3.5 rounded-xl bg-[#E9F6EF] border-2 border-[#006B3F] space-y-1.5">
                  <label className="text-xs font-black text-[#001F54] block">
                    Code USSD TrésorPay / TrésorMoney
                  </label>
                  <input
                    type="text"
                    value={tresorUssd}
                    onChange={(e) => setTresorUssd(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border-2 border-[#001F54] text-xs font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-600 block">
                    Code USSD TrésorPay composé automatiquement.
                  </span>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: OPÉRATEURS */}
        {activeTab === 'operators' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54]">
              <h3 className="text-base font-black text-[#001F54] font-display">
                Gestion des Opérateurs (Frais unique de 1% fixé)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operators.map((op) => (
                <div 
                  key={op.id}
                  className="bg-white p-5 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <OperatorLogo operatorId={op.id} size={40} />
                      <div>
                        <h4 className="font-black text-sm text-[#001F54]">{op.brandName}</h4>
                        <span className="text-[11px] font-mono text-slate-500">USSD: {op.ussdPrefix}</span>
                      </div>
                    </div>
                    {op.id === 'tresor' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                        INDISPONIBLE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ACTIF
                      </span>
                    )}
                  </div>

                  <div className="bg-[#F4F9FD] p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Commission :</span>
                      <span className="font-bold text-[#0A6CF1]">1.0% fixe</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Plafond :</span>
                      <span className="font-mono">250 F à 2 000 000 F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Réserve liquidité :</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {op.reserveBalance.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const amount = prompt(`Ajouter du solde de réserve à ${op.brandName} (FCFA) :`);
                      if (amount) {
                        const val = parseInt(amount, 10);
                        if (!isNaN(val)) {
                          setOperators(prev => prev.map(o => o.id === op.id ? { ...o, reserveBalance: o.reserveBalance + val } : o));
                        }
                      }
                    }}
                    className="w-full py-2 rounded-xl btn-cartoon-white text-xs font-bold cursor-pointer"
                  >
                    + Ajuster Réserve Liquidité
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NUMEROS */}
        {activeTab === 'numbers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54]">
              <div>
                <h3 className="text-base font-black text-[#001F54] font-display">
                  Gestion des Numéros & Surveillance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const phone = prompt('Numéro (+225...) :');
                  const name = prompt('Nom :');
                  if (phone && name) {
                    setWhitelistNumbers(prev => [{
                      id: `wl-${Date.now()}`,
                      phoneNumber: phone,
                      operatorId: 'orange',
                      ownerName: name,
                      type: 'AUTHORIZED',
                      addedAt: new Date().toISOString().slice(0, 10)
                    }, ...prev]);
                  }
                }}
                className="px-3.5 py-2 rounded-xl btn-cartoon-gold text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            <div className="bg-white rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#001F54] text-white">
                  <tr>
                    <th className="py-3 px-4">Numéro</th>
                    <th className="py-3 px-4">Titulaire</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {whitelistNumbers.map((num) => (
                    <tr key={num.id}>
                      <td className="py-3 px-4 font-mono font-bold text-[#001F54]">{num.phoneNumber}</td>
                      <td className="py-3 px-4">{num.ownerName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          num.type === 'ADMIN' ? 'bg-[#FFB703] text-[#001F54]' :
                          num.type === 'BLACKLISTED' ? 'bg-red-100 text-red-700' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {num.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {num.type !== 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => setWhitelistNumbers(prev => prev.filter(n => n.id !== num.id))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: UTILISATEURS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54]">
              <h3 className="text-base font-black text-[#001F54] font-display">
                Utilisateurs Enregistrés
              </h3>
            </div>

            <div className="bg-white rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#001F54] text-white">
                  <tr>
                    <th className="py-3 px-4">Nom et Prénom</th>
                    <th className="py-3 px-4">Numéro</th>
                    <th className="py-3 px-4">Rôle</th>
                    <th className="py-3 px-4">Solde</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 px-4 font-bold text-[#001F54]">{u.firstName} {u.lastName}</td>
                      <td className="py-3 px-4 font-mono">{u.phoneNumber}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isAdmin ? 'bg-[#FFB703] text-[#001F54]' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.isAdmin ? '👑 Administrateur' : 'Client'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {u.walletBalance.toLocaleString('fr-FR')} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: COMPTES DÉBITEURS */}
        {activeTab === 'debit_accounts' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54]">
              <h3 className="text-base font-black text-[#001F54] font-display">
                Comptes Débiteurs Intersend (Encaissement)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {debitAccounts.map((acc) => (
                <div key={acc.id} className="bg-white p-5 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <OperatorLogo operatorId={acc.operatorId} size={32} />
                    <h4 className="font-black text-sm text-[#001F54]">{acc.accountName}</h4>
                  </div>
                  <p className="font-mono text-slate-500">{acc.accountNumber}</p>
                  <div className="bg-[#DFF6FF] p-2.5 rounded-lg border border-[#001F54]/20 flex justify-between font-bold">
                    <span>Solde :</span>
                    <span className="font-mono">{acc.currentBalance.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: COMPTES À CRÉDITER */}
        {activeTab === 'credit_accounts' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54]">
              <h3 className="text-base font-black text-[#001F54] font-display">
                Comptes à Créditer (Pools de Liquidité de Reverssement)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creditAccounts.map((acc) => (
                <div key={acc.id} className="bg-white p-5 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <OperatorLogo operatorId={acc.operatorId} size={32} />
                    <h4 className="font-black text-sm text-[#001F54]">{acc.accountName}</h4>
                  </div>
                  <p className="font-mono text-slate-500">{acc.accountNumber}</p>
                  <div className="bg-[#FFFDE8] p-2.5 rounded-lg border border-[#FFB703] flex justify-between font-bold">
                    <span>Disponible :</span>
                    <span className="font-mono font-black text-emerald-800">
                      {acc.availableBalance.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
