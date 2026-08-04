export interface Platform {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  connected: boolean;
  points: number;
  rate: number; // Value of 1 point in IQD (fixed at 1000)
  apiUrl?: string;
  apiKey?: string;
  status: 'connected' | 'syncing' | 'error';
  lastSynced: string;
}

export interface Transaction {
  id: string;
  type: 'sync' | 'convert' | 'withdraw' | 'transfer';
  platformId?: string;
  platformName?: string;
  platformNameAr?: string;
  points?: number;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  walletType?: string;
  walletDetails?: string;
  // Recipient details for transfers
  recipientName?: string;
  recipientCountry?: string;
  recipientAmount?: number;
  recipientCurrency?: string;
  feeUsd?: number;
}

export interface WalletOption {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  fields: {
    key: string;
    labelAr: string;
    labelEn: string;
    placeholder: string;
    type: string;
  }[];
}

export interface OnboardingData {
  purpose: 'provide' | 'search' | 'both';
  selectedCategories: string[];
  selectedProducts?: string[];
  experienceYears?: number;
  bio?: string;
  location?: string;
  countryId?: string;
  workMode?: 'remote' | 'in_person' | 'both';
  workingHours?: string;
  price?: string;
  contactPhone?: string;
  phoneVisibility?: 'everyone' | 'only_accepted' | 'only_admin';
  contactMethods?: string[];
  portfolioLinks?: string[];
  certificates?: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  phone: string; // fallback field for old contact column or backwards compatibility
  email?: string;
  appUrl?: string;
  password?: string;
  registeredAt: string;
  earnedForOwner: number; // dynamically calculated or converted based on base amount
  walletType: string;
  status: 'active' | 'suspended';
  role?: 'owner' | 'manager' | 'assistant' | 'user';
  isDistinguished?: boolean; // Whether the user is a VIP/Distinguished member
  distinguishedRewardsUSD?: number; // Accumulated distinguished rewards in USD
  balance?: number; // Current withdrawable cash balance for this user
  withdrawn?: number; // Total amount withdrawn by this user
  referredBy?: string; // UID of the user who referred this user
  referredUsers?: string[]; // Array of UIDs of users referred by this user
  referralPoints?: number; // Total points earned from referrals
  referralsCredited?: number; // Number of referrals already credited
  onboarding?: OnboardingData; // Onboarding configuration details
  phoneVisibility?: 'everyone' | 'only_accepted' | 'only_admin'; // Who can see the phone number
  profileChangesHistory?: {
    field: string;
    oldValue: string;
    newValue: string;
    changedAt: string;
  }[]; // Audit log of profile changes
  messages?: {
    id: string;
    sender: string;
    content: string;
    date: string;
  }[]; // Messages from site owner/admin
}

export interface CountryConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  currencyCode: string;
  currencySymbol: string;
  rate: number; // Value of 1 point in this country's currency
  flag: string;
  provinces?: { id: string; nameAr: string; nameEn: string; }[];
}

export interface SystemNotification {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  type: 'gift' | 'security' | 'info' | 'system' | 'cash';
  timestamp: string;
  read: boolean;
  claimed?: boolean;
  giftPoints?: number;
}

export interface BankCard {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  bankName: string;
  cardType: 'visa' | 'mastercard' | 'qi' | 'local' | 'other';
  isPrimary: boolean;
  status: 'active' | 'pending_verification' | 'suspended';
  colorTheme: string;
  createdAt: string;
}



