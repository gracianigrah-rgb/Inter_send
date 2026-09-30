export type OperatorId = 'moov' | 'wave' | 'orange' | 'mtn' | 'tresor';

export interface Operator {
  id: OperatorId;
  name: string;
  brandName: string;
  logoColor: string;
  badgeBg: string;
  accentColor: string;
  active: boolean;
  feePercentage: number; // 1% unique
  fixedFee: number;
  minAmount: number; // 250 FCFA
  maxAmount: number; // 2 000 000 FCFA
  avgDelaySeconds: number;
  ussdPrefix: string;
  reserveBalance: number;
  countries: string[];
  description: string;
}

export type TransactionStatus = 
  | 'PENDING_ADMIN_RECEPTION'  // En attente / En cours
  | 'PROCESSING'               // Transaction en cours (USSD / OTP saisi)
  | 'RECEIVED_BY_INTERSEND'    // Fonds reçus par l'administrateur
  | 'DISBURSING_TO_RECIPIENT'  // En cours de transfert vers destinataire
  | 'COMPLETED'                // Transaction effectuée
  | 'FAILED'                   // Échoué
  | 'CANCELLED';               // Annulé

export type ProcessingMode = 'ADMIN';

export interface Transaction {
  id: string;
  reference: string;
  createdAt: string;
  completedAt?: string;
  sourceOperatorId: OperatorId;
  sourceNumber: string;
  sourceCountry: string;
  destinationOperatorId: OperatorId;
  destinationNumber: string;
  destinationCountry: string;
  amount: number;
  fee: number; // 1%
  totalDebited: number;
  amountReceived: number;
  status: TransactionStatus;
  processingMode: ProcessingMode;
  senderName: string;
  senderId: string;
  recipientName?: string;
  notes?: string;
  collectedByAccountId?: string;
  disbursedByAccountId?: string;
  adminNote?: string;
  orangeAuthCode?: string; // Code 4 chiffres saisi par l'utilisateur après #144*82#
  stepState?: string;
  statusMessage?: string;
}

export interface AdminConfig {
  adminPhoneNumbers: string[];
  mtnMerchantNumber: string;
  wavePaymentUrl: string;
  moovUssdCode: string;
  tresorUssdCode: string;
  orangeUssdCode: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  transactionId?: string;
  type: 'DIALER_TRIGGERED' | 'OTP_ENTERED' | 'NEW_TRANSACTION' | 'STATUS_CHANGE';
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  pin: string; // 4 digits
  walletBalance: number;
  kycStatus: 'VERIFIED' | 'PENDING' | 'TIER_1';
  createdAt: string;
  isAdmin?: boolean;
  savedNumbers: {
    name: string;
    number: string;
    operatorId: OperatorId;
  }[];
}

export interface WhitelistNumber {
  id: string;
  phoneNumber: string;
  operatorId: OperatorId;
  ownerName: string;
  type: 'AUTHORIZED' | 'VIP' | 'BLACKLISTED' | 'ADMIN';
  reason?: string;
  addedAt: string;
}

export interface DebitAccount {
  id: string;
  operatorId: OperatorId;
  accountName: string;
  accountNumber: string;
  currentBalance: number;
  dailyLimit: number;
  active: boolean;
  ussdPayCode: string;
}

export interface CreditAccount {
  id: string;
  operatorId: OperatorId;
  accountName: string;
  accountNumber: string;
  availableBalance: number;
  minThresholdAlert: number;
  active: boolean;
}

export type MainTab = 'send' | 'transactions' | 'profile';

