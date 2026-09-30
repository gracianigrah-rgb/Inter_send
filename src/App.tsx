import React, { useState, useEffect } from 'react';
import { 
  Operator, 
  Transaction, 
  UserProfile, 
  DebitAccount, 
  CreditAccount, 
  WhitelistNumber, 
  MainTab,
  AdminConfig,
  AdminNotification
} from './types';
import { 
  INITIAL_OPERATORS, 
  INITIAL_DEBIT_ACCOUNTS, 
  INITIAL_CREDIT_ACCOUNTS, 
  INITIAL_WHITELIST_NUMBERS, 
  INITIAL_USERS, 
  INITIAL_TRANSACTIONS,
  DEFAULT_ADMIN_CONFIG
} from './data/mockData';
import { SplashLoading } from './components/SplashLoading';
import { AuthFlow } from './components/AuthFlow';
import { SendMoneyFlow } from './components/SendMoneyFlow';
import { TransactionsView } from './components/TransactionsView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AfricanPatternStrip } from './components/AfricanPattern';
import { IntersendEmblem } from './components/BrandLogos';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Send, History, User, Shield } from 'lucide-react';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Recognized user on this device (allows quick PIN login without re-entering phone number)
  const [deviceUser, setDeviceUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('intersend_device_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('intersend_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync active user to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('intersend_active_user', JSON.stringify(currentUser));
      localStorage.setItem('intersend_device_user', JSON.stringify(currentUser));
      setDeviceUser(currentUser);
    } else {
      localStorage.removeItem('intersend_active_user');
    }
  }, [currentUser]);

  // View state: 'app' (client user interface) or 'admin' (Console d'administration)
  const [currentView, setCurrentView] = useState<'app' | 'admin'>('app');

  // Main client tabs: 'send', 'transactions', 'profile'
  const [currentTab, setCurrentTab] = useState<MainTab>('send');

  // Admin Configuration & Authorized Numbers (Master admin: +2250748918048)
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => {
    const saved = localStorage.getItem('intersend_admin_config');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN_CONFIG;
  });

  // Admin Live Notifications Feed
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('intersend_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistent / Global Application Data States
  const [operators, setOperators] = useState<Operator[]>(() => {
    const saved = localStorage.getItem('intersend_operators');
    return saved ? JSON.parse(saved) : INITIAL_OPERATORS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('intersend_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('intersend_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [debitAccounts, setDebitAccounts] = useState<DebitAccount[]>(() => {
    const saved = localStorage.getItem('intersend_debit_accounts');
    return saved ? JSON.parse(saved) : INITIAL_DEBIT_ACCOUNTS;
  });

  const [creditAccounts, setCreditAccounts] = useState<CreditAccount[]>(() => {
    const saved = localStorage.getItem('intersend_credit_accounts');
    return saved ? JSON.parse(saved) : INITIAL_CREDIT_ACCOUNTS;
  });

  const [whitelistNumbers, setWhitelistNumbers] = useState<WhitelistNumber[]>(() => {
    const saved = localStorage.getItem('intersend_whitelist');
    return saved ? JSON.parse(saved) : INITIAL_WHITELIST_NUMBERS;
  });

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem('intersend_admin_config', JSON.stringify(adminConfig));
  }, [adminConfig]);

  useEffect(() => {
    localStorage.setItem('intersend_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('intersend_operators', JSON.stringify(operators));
  }, [operators]);

  useEffect(() => {
    localStorage.setItem('intersend_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('intersend_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('intersend_debit_accounts', JSON.stringify(debitAccounts));
  }, [debitAccounts]);

  useEffect(() => {
    localStorage.setItem('intersend_credit_accounts', JSON.stringify(creditAccounts));
  }, [creditAccounts]);

  useEffect(() => {
    localStorage.setItem('intersend_whitelist', JSON.stringify(whitelistNumbers));
  }, [whitelistNumbers]);

  // Check if a user has Administrator privileges
  // Master number: +2250748918048 or any authorized phone in adminConfig
  const isUserAdmin = (user: UserProfile | null): boolean => {
    if (!user) return false;
    const cleanUserPhone = user.phoneNumber.replace(/[\s\-\(\)]/g, '');
    return adminConfig.adminPhoneNumbers.some(p => {
      const cleanP = p.replace(/[\s\-\(\)]/g, '');
      return cleanUserPhone === cleanP || cleanUserPhone.endsWith(cleanP) || cleanP.endsWith(cleanUserPhone);
    });
  };

  const userHasAdminAccess = isUserAdmin(currentUser);

  // Handle user transaction creation
  const handleTransactionCreated = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  // Handle transaction update
  const handleTransactionUpdated = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  // Handle admin notification dispatch
  const handleAdminNotify = (notification: AdminNotification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // If splash is showing, display ONLY the splash with logo as requested
  if (showSplash) {
    return <SplashLoading onComplete={() => setShowSplash(false)} />;
  }

  // If user is not yet logged in, show Auth Flow
  if (!currentUser) {
    return (
      <div className="relative">
        <OfflineIndicator />
        <AuthFlow
          existingUsers={users}
          deviceUser={deviceUser}
          onForgetDevice={() => {
            setDeviceUser(null);
            localStorage.removeItem('intersend_device_user');
          }}
          onSuccess={(loggedUser) => {
            // If this user is +2250748918048, grant admin
            const isAdmin = isUserAdmin(loggedUser);
            const enrichedUser = { ...loggedUser, isAdmin };
            if (!users.some(u => u.id === enrichedUser.id)) {
              setUsers(prev => [enrichedUser, ...prev]);
            }
            setCurrentUser(enrichedUser);
            setDeviceUser(enrichedUser);
            localStorage.setItem('intersend_active_user', JSON.stringify(enrichedUser));
            localStorage.setItem('intersend_device_user', JSON.stringify(enrichedUser));
          }}
        />
      </div>
    );
  }

  // If Admin Dashboard is active AND user is authorized administrator
  if (currentView === 'admin' && userHasAdminAccess) {
    return (
      <AdminDashboard
        operators={operators}
        setOperators={setOperators}
        transactions={transactions}
        setTransactions={setTransactions}
        users={users}
        setUsers={setUsers}
        debitAccounts={debitAccounts}
        setDebitAccounts={setDebitAccounts}
        creditAccounts={creditAccounts}
        setCreditAccounts={setCreditAccounts}
        whitelistNumbers={whitelistNumbers}
        setWhitelistNumbers={setWhitelistNumbers}
        adminConfig={adminConfig}
        setAdminConfig={setAdminConfig}
        notifications={notifications}
        setNotifications={setNotifications}
        onCloseAdmin={() => setCurrentView('app')}
      />
    );
  }

  // Client User App Interface
  return (
    <div className="min-h-screen bg-[#F4F9FD] flex flex-col justify-between selection:bg-[#FFB703] selection:text-[#001F54] antialiased">
      {/* Offline connectivity banner if internet is lost or weak */}
      <OfflineIndicator />

      {/* Top African Accent Pattern */}
      <AfricanPatternStrip height={10} />

      {/* Top Navigation Bar - NEVER displays "Mode Administrateur" to normal users */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-3 border-[#001F54] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Brand Wordmark with real Intersend logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-[#001F54] flex items-center justify-center p-0.5 shadow-sm">
              <IntersendEmblem size={24} />
            </div>
            <div>
              <div className="flex items-baseline font-display font-black text-lg tracking-tight text-black leading-none">
                <span className="relative inline-block">
                  <span className="absolute top-[-0.14em] left-[0.14em] w-[0.24em] h-[0.24em] rounded-full bg-[#16C3FF] shadow-sm inline-block" />
                  <span style={{ clipPath: 'polygon(0 30%, 100% 30%, 100% 100%, 0 100%)' }}>i</span>
                </span>
                <span>ntersend</span>
                <span className="inline-block w-[0.22em] h-[0.22em] rounded-full bg-[#16C3FF] ml-[0.06em] shadow-sm" />
              </div>
              <span className="text-[9px] uppercase font-bold text-[#0A6CF1] tracking-wider block mt-0.5">
                Mobile Money Inter-Réseaux
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* In-App PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Admin Switch button ONLY visible if connected with +2250748918048 or authorized admin */}
            {userHasAdminAccess && (
              <button
                type="button"
                onClick={() => setCurrentView('admin')}
                className="px-2.5 py-1.5 rounded-xl bg-[#FFFDE8] border-2 border-[#001F54] text-[#001F54] text-[11px] font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#001F54] hover:bg-[#fff9c2] active:translate-y-0.5 cursor-pointer"
                title="Accéder au panneau d'administration Intersend"
              >
                <Shield className="w-3.5 h-3.5 text-[#0A6CF1]" />
                <span className="font-display">Admin Console</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Content Container */}
      <main className="flex-1 px-4 pt-4 max-w-md w-full mx-auto">
        {/* Tab 1: ENVOYÉ */}
        {currentTab === 'send' && (
          <SendMoneyFlow
            user={currentUser}
            operators={operators}
            debitAccounts={debitAccounts}
            adminConfig={adminConfig}
            onTransactionCreated={handleTransactionCreated}
            onTransactionUpdated={handleTransactionUpdated}
            onAdminNotify={handleAdminNotify}
            onGoToTransactions={() => setCurrentTab('transactions')}
          />
        )}

        {/* Tab 2: TRANSACTIONS */}
        {currentTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            operators={operators}
            onOpenSend={() => setCurrentTab('send')}
          />
        )}

        {/* Tab 3: PROFIL */}
        {currentTab === 'profile' && (
          <ProfileView
            user={currentUser}
            operators={operators}
            isAdmin={userHasAdminAccess}
            onOpenAdmin={() => setCurrentView('admin')}
            onLockSession={() => {
              // Lock session on this device: keeps deviceUser so only 4-digit PIN is requested on return!
              setCurrentUser(null);
              localStorage.removeItem('intersend_active_user');
            }}
            onLogout={() => {
              // Complete logout: wipes remembered device user as well
              setCurrentUser(null);
              setDeviceUser(null);
              localStorage.removeItem('intersend_active_user');
              localStorage.removeItem('intersend_device_user');
              setShowSplash(true);
            }}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              setDeviceUser(updated);
              setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            }}
          />
        )}
      </main>

      {/* Fixed Ergonomic Bottom Tab Bar (3 onglets: Envoyé, Transactions, Profil) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-3 border-[#001F54] shadow-[0px_-4px_12px_rgba(0,31,84,0.06)]">
        <div className="max-w-md mx-auto grid grid-cols-3 h-16 items-center px-4">
          {/* Tab 1: Envoyé */}
          <button
            type="button"
            onClick={() => setCurrentTab('send')}
            className={`flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
              currentTab === 'send' ? 'text-[#001F54]' : 'text-[#001F54]/50 hover:text-[#001F54]'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              currentTab === 'send' 
                ? 'bg-[#FFB703] border-2 border-[#001F54] shadow-[2px_2px_0px_#001F54] -translate-y-1' 
                : ''
            }`}>
              <Send className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className={`text-[11px] font-black tracking-tight mt-0.5 ${
              currentTab === 'send' ? 'text-[#001F54]' : ''
            }`}>
              Envoyer
            </span>
          </button>

          {/* Tab 2: Transactions */}
          <button
            type="button"
            onClick={() => setCurrentTab('transactions')}
            className={`flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
              currentTab === 'transactions' ? 'text-[#001F54]' : 'text-[#001F54]/50 hover:text-[#001F54]'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              currentTab === 'transactions' 
                ? 'bg-[#16C3FF] border-2 border-[#001F54] shadow-[2px_2px_0px_#001F54] -translate-y-1' 
                : ''
            }`}>
              <History className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className={`text-[11px] font-black tracking-tight mt-0.5 ${
              currentTab === 'transactions' ? 'text-[#001F54]' : ''
            }`}>
              Transactions
            </span>
          </button>

          {/* Tab 3: Profil */}
          <button
            type="button"
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
              currentTab === 'profile' ? 'text-[#001F54]' : 'text-[#001F54]/50 hover:text-[#001F54]'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              currentTab === 'profile' 
                ? 'bg-[#0A6CF1] text-white border-2 border-[#001F54] shadow-[2px_2px_0px_#001F54] -translate-y-1' 
                : ''
            }`}>
              <User className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className={`text-[11px] font-black tracking-tight mt-0.5 ${
              currentTab === 'profile' ? 'text-[#001F54]' : ''
            }`}>
              Profil
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
