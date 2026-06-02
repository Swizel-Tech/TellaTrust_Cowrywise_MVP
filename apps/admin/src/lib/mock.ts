// Deterministic mock data for the TellaTrust admin console (no backend needed).
import type {
  UserProfile,
  Transaction,
  InvestmentProduct,
  SavingsPlanType,
  KycStatus,
  TransactionType,
  Role,
} from '@tellavault/shared';

// ---- admin-local types (not part of the shared customer model) ----
export type TicketStatus = 'open' | 'pending' | 'resolved';
export interface TicketMessage {
  from: 'customer' | 'agent';
  body: string;
  at: number;
}
export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  status: TicketStatus;
  priority: 'low' | 'normal' | 'high';
  createdAt: number;
  messages: TicketMessage[];
}

export type LogCategory = 'auth' | 'transaction' | 'kyc' | 'account' | 'admin' | 'product';
export interface ActivityLog {
  id: string;
  at: number;
  actor: string;
  actorRole: Role;
  category: LogCategory;
  action: string;
  target: string;
  ip: string;
  city: string;
}

const DAY = 86_400_000;
const now = Date.now();

const FIRST = ['Ada', 'Emeka', 'Ngozi', 'Tunde', 'Chioma', 'Bola', 'Ifeanyi', 'Zainab', 'Kunle', 'Amaka', 'Yusuf', 'Funke', 'Obinna', 'Halima', 'Segun', 'Ada'];
const LAST = ['Okafor', 'Balogun', 'Eze', 'Adeyemi', 'Nwosu', 'Bello', 'Okonkwo', 'Ibrahim', 'Afolabi', 'Uche', 'Musa', 'Olawale'];
const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Benin City'];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

const KYC_CYCLE: KycStatus[] = ['verified', 'pending', 'verified', 'none', 'rejected', 'verified', 'pending'];

export const users: UserProfile[] = Array.from({ length: 24 }, (_, i) => {
  const firstName = pick(FIRST, i);
  const lastName = pick(LAST, i * 3 + 1);
  const kyc = pick(KYC_CYCLE, i);
  return {
    uid: `u_${(1000 + i).toString()}`,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: `+23480${(10000000 + i * 137).toString().slice(0, 8)}`,
    role: 'customer' as Role,
    kycStatus: kyc,
    riskProfile: pick(['conservative', 'balanced', 'aggressive'] as const, i),
    status: i % 11 === 0 ? 'frozen' : 'active',
    createdAt: now - (i * 5 + 2) * DAY,
    dob: `199${i % 9}-0${(i % 8) + 1}-1${i % 9}`,
    bvnLast4: kyc === 'verified' ? `${(2000 + i).toString().slice(-4)}` : undefined,
    kycVerifiedAt: kyc === 'verified' ? now - i * DAY : undefined,
  };
});

const TX_TYPES: TransactionType[] = ['deposit', 'withdrawal', 'plan_funding', 'investment_buy', 'investment_sell', 'interest'];

export const transactions: Transaction[] = Array.from({ length: 140 }, (_, i) => {
  const u = pick(users, i * 7 + 3);
  const type = pick(TX_TYPES, i);
  const amount = [5000, 12000, 25000, 50000, 7500, 100000, 3000][i % 7];
  return {
    id: `t_${(50000 + i).toString()}`,
    userId: u.uid,
    type,
    amount,
    currency: 'NGN' as const,
    status: i % 19 === 0 ? 'failed' : i % 7 === 0 ? 'pending' : 'success',
    balanceAfter: 50000 + ((i * 9173) % 400000),
    reference: `TT-${(900000 + i).toString()}`,
    createdAt: now - (i * 0.18) * DAY,
  };
});

export const products: InvestmentProduct[] = [
  { id: 'p_halal', assetClass: 'mutual_fund', name: 'Halal Fixed Income Fund', fundManager: 'TellaTrust AM', currency: 'NGN', unitPrice: 1.34, historicalReturns: [11, 12, 13, 12.5], riskLevel: 'low', description: 'Sharia-compliant fixed-income fund.', isActive: true },
  { id: 'p_money', assetClass: 'mutual_fund', name: 'Money Market Fund', fundManager: 'TellaTrust AM', currency: 'NGN', unitPrice: 1.18, historicalReturns: [14, 15, 16, 15.5], riskLevel: 'low', description: 'Short-term instruments, daily liquidity.', isActive: true },
  { id: 'p_eurobond', assetClass: 'mutual_fund', name: 'Eurobond (USD) Fund', fundManager: 'TellaTrust AM', currency: 'USD', unitPrice: 1.62, historicalReturns: [6, 7, 8, 7.5], riskLevel: 'medium', description: 'Dollar-denominated sovereign & corporate bonds.', isActive: true },
  { id: 'p_balanced', assetClass: 'mutual_fund', name: 'Balanced Growth Fund', fundManager: 'TellaTrust AM', currency: 'NGN', unitPrice: 2.04, historicalReturns: [18, 9, 22, 16], riskLevel: 'high', description: 'Blend of equities and fixed income.', isActive: true },
  { id: 'p_dangcem', assetClass: 'stock', name: 'Dangote Cement', ticker: 'DANGCEM', currency: 'NGN', unitPrice: 645.0, historicalReturns: [], riskLevel: 'medium', description: 'NGX-listed equity.', isActive: true },
  { id: 'p_mtnn', assetClass: 'stock', name: 'MTN Nigeria', ticker: 'MTNN', currency: 'NGN', unitPrice: 232.5, historicalReturns: [], riskLevel: 'medium', description: 'NGX-listed equity.', isActive: true },
  { id: 'p_gtco', assetClass: 'stock', name: 'GTCO', ticker: 'GTCO', currency: 'NGN', unitPrice: 58.4, historicalReturns: [], riskLevel: 'high', description: 'NGX-listed equity.', isActive: false },
];

export const planTypes: SavingsPlanType[] = [
  { id: 'sp_regular', name: 'Regular Savings', description: 'Flexible save & withdraw anytime.', interestRatePA: 10, minTenorDays: 0, penaltyOnBreak: 0, allowsWithdrawal: true },
  { id: 'sp_fixed', name: 'Fixed Lock', description: 'Lock funds for higher returns.', interestRatePA: 16, minTenorDays: 90, penaltyOnBreak: 0.2, allowsWithdrawal: false },
  { id: 'sp_goal', name: 'Goal Save', description: 'Save toward a target.', interestRatePA: 13, minTenorDays: 30, penaltyOnBreak: 0.05, allowsWithdrawal: true },
];

const SUBJECTS = ['Withdrawal not received', 'KYC stuck on pending', 'Cannot fund wallet', 'How do I break a fixed plan?', 'App keeps logging me out', 'Wrong interest credited'];

export const tickets: SupportTicket[] = Array.from({ length: 9 }, (_, i) => {
  const u = pick(users, i * 5 + 2);
  const status: TicketStatus = i % 3 === 0 ? 'open' : i % 3 === 1 ? 'pending' : 'resolved';
  return {
    id: `tk_${(700 + i).toString()}`,
    userId: u.uid,
    userName: `${u.firstName} ${u.lastName}`,
    subject: pick(SUBJECTS, i),
    status,
    priority: pick(['low', 'normal', 'high'] as const, i + 1),
    createdAt: now - (i * 0.6 + 0.2) * DAY,
    messages: [
      { from: 'customer', body: `Hi, ${pick(SUBJECTS, i).toLowerCase()}. Please help.`, at: now - (i * 0.6 + 0.2) * DAY },
      ...(status !== 'open'
        ? [{ from: 'agent' as const, body: 'Thanks for reaching out — looking into this now.', at: now - (i * 0.6 + 0.1) * DAY }]
        : []),
    ],
  };
});

const LOG_DEFS: { category: LogCategory; action: string }[] = [
  { category: 'auth', action: 'User signed in' },
  { category: 'auth', action: 'Failed login attempt' },
  { category: 'transaction', action: 'Wallet funded' },
  { category: 'transaction', action: 'Withdrawal requested' },
  { category: 'kyc', action: 'KYC submitted' },
  { category: 'kyc', action: 'KYC approved' },
  { category: 'account', action: 'Profile updated' },
  { category: 'account', action: 'PIN changed' },
  { category: 'product', action: 'Investment purchased' },
  { category: 'admin', action: 'Role changed' },
];

export const activityLogs: ActivityLog[] = Array.from({ length: 200 }, (_, i) => {
  const def = pick(LOG_DEFS, i * 3 + 1);
  const u = pick(users, i * 11 + 4);
  const isAdmin = def.category === 'admin';
  return {
    id: `lg_${(80000 + i).toString()}`,
    at: now - i * 0.12 * DAY,
    actor: isAdmin ? 'admin@tellatrust.io' : `${u.firstName} ${u.lastName}`,
    actorRole: (isAdmin ? 'admin' : 'customer') as Role,
    category: def.category,
    action: def.action,
    target: u.uid,
    ip: `102.89.${i % 255}.${(i * 7) % 255}`,
    city: pick(CITIES, i),
  };
});

export const fmtNaira = (n: number) => '₦' + n.toLocaleString('en-NG');
export const fmtDate = (ms: number) =>
  new Date(ms).toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const fmtDay = (ms: number) =>
  new Date(ms).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
