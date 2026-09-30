import { Operator, DebitAccount, CreditAccount, Transaction, UserProfile, WhitelistNumber, AdminConfig } from '../types';

export const AFRICAN_COUNTRIES = [
  { code: 'CI', name: 'Côte d’Ivoire', dialCode: '+225', flag: '🇨🇮', digits: 10, placeholder: '07 00 12 34 56' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳', digits: 9, placeholder: '77 123 45 67' },
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯', digits: 8, placeholder: '97 12 34 56' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱', digits: 8, placeholder: '76 12 34 56' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', digits: 8, placeholder: '70 12 34 56' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬', digits: 8, placeholder: '90 12 34 56' },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲', digits: 9, placeholder: '6 91 23 45 67' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', flag: '🇬🇳', digits: 9, placeholder: '62 12 34 56' },
];

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  adminPhoneNumbers: ['+2250748918048', '+225 07 48 91 80 48', '0748918048'],
  mtnMerchantNumber: '+225 05 77 66 33 00',
  wavePaymentUrl: 'https://wave.com/pay/intersend_ci',
  moovUssdCode: '*155*1*0102030405#',
  tresorUssdCode: '*760*2*0710203040#',
  orangeUssdCode: '#144*82#'
};

export const INITIAL_OPERATORS: Operator[] = [
  {
    id: 'wave',
    name: 'Wave',
    brandName: 'Wave Mobile Money',
    logoColor: '#1EA8E7',
    badgeBg: '#E8F7FE',
    accentColor: '#16C3FF',
    active: true,
    feePercentage: 1.0, // Frais unique de 1%
    fixedFee: 0,
    minAmount: 250, // Minimum 250F
    maxAmount: 2000000, // Maximum 2 000 000F
    avgDelaySeconds: 15,
    ussdPrefix: 'wave://pay',
    reserveBalance: 14850000,
    countries: ['CI', 'SN', 'ML', 'BF'],
    description: 'Transferts rapides avec lien de paiement Wave sécurisé.'
  },
  {
    id: 'orange',
    name: 'Orange Money',
    brandName: 'Orange Money (OM)',
    logoColor: '#FF7900',
    badgeBg: '#FFF3E8',
    accentColor: '#FF7900',
    active: true,
    feePercentage: 1.0, // Frais unique de 1%
    fixedFee: 0,
    minAmount: 250,
    maxAmount: 2000000,
    avgDelaySeconds: 30,
    ussdPrefix: '#144*82#',
    reserveBalance: 22400000,
    countries: ['CI', 'SN', 'ML', 'BF', 'GN', 'CM'],
    description: 'Code d’autorisation sécurisé généré via #144*82#.'
  },
  {
    id: 'mtn',
    name: 'MTN MoMo',
    brandName: 'MTN Mobile Money',
    logoColor: '#FFCC00',
    badgeBg: '#FFFDE8',
    accentColor: '#E6A800',
    active: true,
    feePercentage: 1.0, // Frais unique de 1%
    fixedFee: 0,
    minAmount: 250,
    maxAmount: 2000000,
    avgDelaySeconds: 25,
    ussdPrefix: '*133#',
    reserveBalance: 18900000,
    countries: ['CI', 'BJ', 'CM', 'GN'],
    description: 'Copie du numéro marchand et composition *133#.'
  },
  {
    id: 'moov',
    name: 'Moov Money',
    brandName: 'Moov Africa (Flooz)',
    logoColor: '#0055A5',
    badgeBg: '#E8F1FC',
    accentColor: '#0055A5',
    active: true,
    feePercentage: 1.0, // Frais unique de 1%
    fixedFee: 0,
    minAmount: 250,
    maxAmount: 2000000,
    avgDelaySeconds: 40,
    ussdPrefix: '*155*1*0102030405#',
    reserveBalance: 11200000,
    countries: ['CI', 'BJ', 'TG', 'BF'],
    description: 'Moov Money avec composition USSD configurée.'
  },
  {
    id: 'tresor',
    name: 'Trésor Money',
    brandName: 'TrésorPay / TrésorMoney',
    logoColor: '#006B3F',
    badgeBg: '#E9F6EF',
    accentColor: '#00875A',
    active: false, // Service indisponible pour l'instant
    feePercentage: 1.0, // Frais unique de 1%
    fixedFee: 0,
    minAmount: 250,
    maxAmount: 2000000,
    avgDelaySeconds: 35,
    ussdPrefix: '*760#',
    reserveBalance: 9800000,
    countries: ['CI'],
    description: 'Service indisponible pour l\'instant.'
  }
];

export const INITIAL_DEBIT_ACCOUNTS: DebitAccount[] = [
  {
    id: 'deb-orange-01',
    operatorId: 'orange',
    accountName: 'Intersend Collecte OM CI #1',
    accountNumber: '+225 07 99 88 11 22',
    currentBalance: 8450000,
    dailyLimit: 25000000,
    active: true,
    ussdPayCode: '#144*82#'
  },
  {
    id: 'deb-wave-01',
    operatorId: 'wave',
    accountName: 'Intersend Merchant Wave Pool',
    accountNumber: '+225 01 44 22 10 99',
    currentBalance: 12600000,
    dailyLimit: 30000000,
    active: true,
    ussdPayCode: 'https://wave.com/pay/intersend_ci'
  },
  {
    id: 'deb-mtn-01',
    operatorId: 'mtn',
    accountName: 'Intersend MoMo Collecte Abidjan',
    accountNumber: '+225 05 77 66 33 00',
    currentBalance: 6900000,
    dailyLimit: 20000000,
    active: true,
    ussdPayCode: '*133#'
  },
  {
    id: 'deb-moov-01',
    operatorId: 'moov',
    accountName: 'Intersend Flooz Débit Central',
    accountNumber: '+225 01 02 03 04 05',
    currentBalance: 4200000,
    dailyLimit: 15000000,
    active: true,
    ussdPayCode: '*155*1*0102030405#'
  },
  {
    id: 'deb-tresor-01',
    operatorId: 'tresor',
    accountName: 'TrésorPay Intersend Compte Trésorerie',
    accountNumber: '+225 07 10 20 30 40',
    currentBalance: 5100000,
    dailyLimit: 20000000,
    active: true,
    ussdPayCode: '*760*2*0710203040#'
  }
];

export const INITIAL_CREDIT_ACCOUNTS: CreditAccount[] = [
  {
    id: 'cred-wave-01',
    operatorId: 'wave',
    accountName: 'Compte Déboursement Wave Rapide',
    accountNumber: '+225 01 77 88 99 00',
    availableBalance: 9800000,
    minThresholdAlert: 2000000,
    active: true
  },
  {
    id: 'cred-orange-01',
    operatorId: 'orange',
    accountName: 'Compte Envoi Liquidité Orange',
    accountNumber: '+225 07 55 44 33 22',
    availableBalance: 14200000,
    minThresholdAlert: 3000000,
    active: true
  },
  {
    id: 'cred-mtn-01',
    operatorId: 'mtn',
    accountName: 'Compte Décaissement MTN MoMo',
    accountNumber: '+225 05 22 11 00 99',
    availableBalance: 11500000,
    minThresholdAlert: 2500000,
    active: true
  },
  {
    id: 'cred-moov-01',
    operatorId: 'moov',
    accountName: 'Compte Déboursement Moov Flooz',
    accountNumber: '+225 01 88 77 66 55',
    availableBalance: 7800000,
    minThresholdAlert: 1500000,
    active: true
  },
  {
    id: 'cred-tresor-01',
    operatorId: 'tresor',
    accountName: 'Compte Paiement TrésorMoney',
    accountNumber: '+225 07 40 30 20 10',
    availableBalance: 6400000,
    minThresholdAlert: 1500000,
    active: true
  }
];

export const INITIAL_WHITELIST_NUMBERS: WhitelistNumber[] = [
  {
    id: 'wl-admin-1',
    phoneNumber: '+2250748918048',
    operatorId: 'orange',
    ownerName: 'Super Admin Intersend',
    type: 'ADMIN',
    reason: 'Administrateur Principal Maître',
    addedAt: '2026-01-01'
  },
  {
    id: 'wl-1',
    phoneNumber: '+225 07 08 09 10 11',
    operatorId: 'orange',
    ownerName: 'Ibrahim Koné',
    type: 'VIP',
    reason: 'Commerçant agréé Adjamé',
    addedAt: '2026-02-15'
  },
  {
    id: 'wl-2',
    phoneNumber: '+225 01 44 55 66 77',
    operatorId: 'wave',
    ownerName: 'Awa Diop',
    type: 'AUTHORIZED',
    reason: 'Client régulier vérifié',
    addedAt: '2026-03-01'
  },
  {
    id: 'wl-4',
    phoneNumber: '+225 07 99 99 99 00',
    operatorId: 'orange',
    ownerName: 'Fraude Suspectée #88',
    type: 'BLACKLISTED',
    reason: 'Tentative suspecte',
    addedAt: '2026-03-18'
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-master',
    phoneNumber: '+2250748918048',
    countryCode: 'CI',
    firstName: 'Administrateur',
    lastName: 'Intersend',
    pin: '2026',
    walletBalance: 2500000,
    kycStatus: 'VERIFIED',
    isAdmin: true,
    createdAt: '2026-01-01',
    savedNumbers: [
      { name: 'Compte OM Central', number: '07 48 91 80 48', operatorId: 'orange' },
      { name: 'Compte MoMo Central', number: '05 77 66 33 00', operatorId: 'mtn' }
    ]
  },
  {
    id: 'usr-default',
    phoneNumber: '+225 07 88 55 44 11',
    countryCode: 'CI',
    firstName: 'Kofi',
    lastName: 'Assamoi',
    pin: '2026',
    walletBalance: 85500,
    kycStatus: 'VERIFIED',
    isAdmin: false,
    createdAt: '2026-01-12',
    savedNumbers: [
      { name: 'Maman (Wave)', number: '01 02 03 04 05', operatorId: 'wave' },
      { name: 'Boutique Plateau (Orange)', number: '07 55 66 77 88', operatorId: 'orange' },
      { name: 'Frère (MTN)', number: '05 11 22 33 44', operatorId: 'mtn' }
    ]
  },
  {
    id: 'usr-2',
    phoneNumber: '+221 77 456 78 90',
    countryCode: 'SN',
    firstName: 'Fatou',
    lastName: 'Ndiaye',
    pin: '1234',
    walletBalance: 42000,
    kycStatus: 'VERIFIED',
    isAdmin: false,
    createdAt: '2026-02-04',
    savedNumbers: []
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-94821',
    reference: 'IS-20260929-8472',
    createdAt: '2026-09-29T19:42:00Z',
    completedAt: '2026-09-29T19:43:00Z',
    sourceOperatorId: 'orange',
    sourceNumber: '+225 07 88 55 44 11',
    sourceCountry: 'CI',
    destinationOperatorId: 'wave',
    destinationNumber: '+225 01 02 03 04 05',
    destinationCountry: 'CI',
    amount: 25000,
    fee: 250, // 1%
    totalDebited: 25250,
    amountReceived: 25000,
    status: 'COMPLETED',
    processingMode: 'ADMIN',
    senderName: 'Kofi Assamoi',
    senderId: 'usr-default',
    recipientName: 'Maman',
    orangeAuthCode: '4821',
    statusMessage: 'Transaction effectuée avec succès'
  },
  {
    id: 'TRX-94820',
    reference: 'IS-20260929-7921',
    createdAt: '2026-09-29T20:15:00Z',
    sourceOperatorId: 'mtn',
    sourceNumber: '+225 05 12 34 56 78',
    sourceCountry: 'CI',
    destinationOperatorId: 'moov',
    destinationNumber: '+225 01 98 76 54 32',
    destinationCountry: 'CI',
    amount: 50000,
    fee: 500, // 1%
    totalDebited: 50500,
    amountReceived: 50000,
    status: 'PROCESSING',
    processingMode: 'ADMIN',
    senderName: 'Amadou Touré',
    senderId: 'usr-2',
    recipientName: 'Salimata Bamba',
    statusMessage: 'Transaction en cours, veuillez patienter...'
  }
];

