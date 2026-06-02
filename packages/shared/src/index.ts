// Shared domain types for TellaTrust (used by web, admin and functions).

export type Role =
  | 'customer'
  | 'support'
  | 'finance'
  | 'compliance'
  | 'admin'
  | 'super_admin';

export type Currency = 'NGN' | 'USD';
export type KycStatus = 'none' | 'pending' | 'verified' | 'rejected';
export type AccountStatus = 'active' | 'frozen';

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  kycStatus: KycStatus;
  riskProfile?: 'conservative' | 'balanced' | 'aggressive';
  status: AccountStatus;
  createdAt: number;
  dob?: string;
  bvnLast4?: string;
  kycVerifiedAt?: number;
}

export interface Wallet {
  uid: string;
  availableBalance: number;
  lockedBalance: number;
  currency: Currency;
  updatedAt: number;
}

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'plan_funding'
  | 'plan_payout'
  | 'investment_buy'
  | 'investment_sell'
  | 'interest';

export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  balanceAfter: number;
  reference: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

export type PlanFrequency = 'daily' | 'weekly' | 'monthly' | 'none';
export type PlanStatus = 'active' | 'matured' | 'broken' | 'completed';

export interface SavingsPlanType {
  id: string;
  name: string;
  description: string;
  interestRatePA: number;
  minTenorDays: number;
  penaltyOnBreak: number;
  allowsWithdrawal: boolean;
}

export interface SavingsPlan {
  id: string;
  userId: string;
  typeId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  frequency: PlanFrequency;
  contributionAmount: number;
  startDate: number;
  maturityDate: number;
  interestEarned: number;
  status: PlanStatus;
  autoDebit: boolean;
}

export type AssetClass = 'mutual_fund' | 'stock';

export interface InvestmentProduct {
  id: string;
  assetClass: AssetClass;
  name: string;
  ticker?: string;
  fundManager?: string;
  currency: Currency;
  unitPrice: number;
  historicalReturns: number[];
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  isActive: boolean;
}

export interface Holding {
  id: string;
  userId: string;
  productId: string;
  units: number;
  avgBuyPrice: number;
  currentValue: number;
  updatedAt: number;
}

export type NotificationType =
  | 'transaction'
  | 'savings'
  | 'investment'
  | 'security'
  | 'announcement'
  | 'support';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: Role;
  action: string;
  target: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  createdAt: number;
}

export const ROLE_LABELS: Record<Role, string> = {
  customer: 'Customer',
  support: 'Support',
  finance: 'Finance',
  compliance: 'Compliance',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}
