// Firestore data layer for TellaTrust (prototype, client-side simulated money).
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Wallet, Transaction, SavingsPlan, AppNotification, Holding, UserProfile } from '@tellavault/shared';

export const PLAN_TYPES = [
  { id: 'regular', name: 'Regular Savings', rate: 10, tenor: 90, desc: 'Flexible savings you can break anytime.' },
  { id: 'fixed', name: 'Fixed Lock', rate: 13, tenor: 180, desc: 'Lock funds for a higher rate.' },
  { id: 'goal', name: 'Goal / Life Goals', rate: 9, tenor: 120, desc: 'Save towards a specific target.' },
];

export function watchWallet(uid: string, cb: (w: Wallet | null) => void): Unsubscribe {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'wallets', uid), (s) => cb(s.exists() ? (s.data() as Wallet) : null));
}

export function watchTransactions(uid: string, cb: (t: Transaction[]) => void, max = 100): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, 'transactions'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.slice(0, max).map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))),
  );
}

export function watchPlans(uid: string, cb: (p: SavingsPlan[]) => void): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, 'savings_plans'), where('userId', '==', uid));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavingsPlan, 'id'>) }))),
  );
}

export function watchNotifications(uid: string, cb: (n: AppNotification[]) => void): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, 'notifications'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppNotification, 'id'>) }))),
  );
}

export async function markNotificationRead(id: string) {
  if (!db) return;
  await updateDoc(doc(db, 'notifications', id), { read: true });
}

/** SIMULATED funding: credit wallet, log a transaction + notification. */
export async function fundWallet(uid: string, amount: number) {
  if (!db) throw new Error('Firebase not configured');
  const wref = doc(db, 'wallets', uid);
  const snap = await getDoc(wref);
  const current = (snap.data()?.availableBalance as number) ?? 0;
  const updated = current + amount;
  await updateDoc(wref, { availableBalance: updated, updatedAt: Date.now() });
  await addDoc(collection(db, 'transactions'), {
    userId: uid,
    type: 'deposit',
    amount,
    currency: 'NGN',
    status: 'success',
    balanceAfter: updated,
    reference: `TT-${Date.now()}`,
    metadata: { simulated: true },
    createdAt: Date.now(),
  });
  await addDoc(collection(db, 'notifications'), {
    userId: uid,
    title: 'Wallet funded',
    body: `Your wallet was credited (simulated). New balance ₦${updated.toLocaleString()}.`,
    type: 'transaction',
    read: false,
    createdAt: Date.now(),
  });
  return updated;
}

export interface NewPlanInput {
  name: string;
  typeId: string;
  target: number;
  frequency: SavingsPlan['frequency'];
  contribution: number;
  tenorDays: number;
  initial: number;
}

/** Create a savings plan, moving the initial deposit from available to locked. */
export async function createPlan(uid: string, input: NewPlanInput) {
  if (!db) throw new Error('Firebase not configured');
  const wref = doc(db, 'wallets', uid);
  const snap = await getDoc(wref);
  const available = (snap.data()?.availableBalance as number) ?? 0;
  const locked = (snap.data()?.lockedBalance as number) ?? 0;
  if (input.initial > available) throw new Error('Insufficient wallet balance for the initial deposit.');

  const now = Date.now();
  const planRef = await addDoc(collection(db, 'savings_plans'), {
    userId: uid,
    typeId: input.typeId,
    name: input.name,
    targetAmount: input.target,
    currentAmount: input.initial,
    frequency: input.frequency,
    contributionAmount: input.contribution,
    startDate: now,
    maturityDate: now + input.tenorDays * 86_400_000,
    interestEarned: 0,
    status: 'active',
    autoDebit: input.frequency !== 'none',
  });

  if (input.initial > 0) {
    const updated = available - input.initial;
    await updateDoc(wref, { availableBalance: updated, lockedBalance: locked + input.initial, updatedAt: now });
    await addDoc(collection(db, 'transactions'), {
      userId: uid,
      type: 'plan_funding',
      amount: input.initial,
      currency: 'NGN',
      status: 'success',
      balanceAfter: updated,
      reference: `TT-${now}`,
      metadata: { planId: planRef.id },
      createdAt: now,
    });
  }
  await addDoc(collection(db, 'notifications'), {
    userId: uid,
    title: 'Savings plan created',
    body: `Your plan "${input.name}" is now active.`,
    type: 'savings',
    read: false,
    createdAt: now,
  });
  return planRef.id;
}

/* ----------------------------- KYC + profile ----------------------------- */

/** SIMULATED BVN + DOB verification. Accepts an 11-digit BVN. */
export async function submitKyc(uid: string, bvn: string, dob: string) {
  if (!db) throw new Error('Firebase not configured');
  if (!/^\d{11}$/.test(bvn)) throw new Error('BVN must be exactly 11 digits.');
  if (!dob) throw new Error('Please enter your date of birth.');
  const age = (Date.now() - new Date(dob).getTime()) / (365.25 * 86_400_000);
  if (age < 18) throw new Error('You must be at least 18 years old.');
  await updateDoc(doc(db, 'users', uid), {
    kycStatus: 'verified',
    bvnLast4: bvn.slice(-4),
    dob,
    kycVerifiedAt: Date.now(),
  });
  await addDoc(collection(db, 'notifications'), {
    userId: uid,
    title: 'Identity verified',
    body: 'Your BVN and date of birth were verified (simulated). You can now fund your wallet.',
    type: 'security',
    read: false,
    createdAt: Date.now(),
  });
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  if (!db) throw new Error('Firebase not configured');
  await updateDoc(doc(db, 'users', uid), patch);
}

/* ------------------------------- investing ------------------------------- */

export function watchHoldings(uid: string, cb: (h: Holding[]) => void): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, 'holdings'), where('userId', '==', uid));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Holding, 'id'>) }))));
}

/** SIMULATED buy: spend wallet cash on a product, upsert the holding. */
export async function buyInvestment(uid: string, productId: string, amount: number, price: number, label: string) {
  if (!db) throw new Error('Firebase not configured');
  if (amount <= 0) throw new Error('Enter an amount.');
  const wref = doc(db, 'wallets', uid);
  const wsnap = await getDoc(wref);
  const available = (wsnap.data()?.availableBalance as number) ?? 0;
  if (amount > available) throw new Error('Insufficient wallet balance.');

  const units = amount / price;
  const hid = `${uid}_${productId}`;
  const href = doc(db, 'holdings', hid);
  const hsnap = await getDoc(href);
  const prevUnits = (hsnap.data()?.units as number) ?? 0;
  const prevAvg = (hsnap.data()?.avgBuyPrice as number) ?? 0;
  const newUnits = prevUnits + units;
  const newAvg = newUnits > 0 ? (prevUnits * prevAvg + amount) / newUnits : price;

  const now = Date.now();
  await setDoc(href, {
    userId: uid,
    productId,
    units: newUnits,
    avgBuyPrice: newAvg,
    currentValue: newUnits * price,
    updatedAt: now,
  }, { merge: true });

  const updated = available - amount;
  await updateDoc(wref, { availableBalance: updated, updatedAt: now });
  await addDoc(collection(db, 'transactions'), {
    userId: uid,
    type: 'investment_buy',
    amount,
    currency: 'NGN',
    status: 'success',
    balanceAfter: updated,
    reference: `TT-${now}`,
    metadata: { productId, units },
    createdAt: now,
  });
  await addDoc(collection(db, 'notifications'), {
    userId: uid,
    title: 'Investment purchased',
    body: `You invested ₦${amount.toLocaleString()} in ${label}.`,
    type: 'investment',
    read: false,
    createdAt: now,
  });
}

/* ------------------------------- stash ---------------------------------- */

/** SIMULATED withdrawal to a bank account. */
export async function withdrawToBank(uid: string, amount: number, bank: string) {
  if (!db) throw new Error('Firebase not configured');
  if (amount <= 0) throw new Error('Enter an amount.');
  const wref = doc(db, 'wallets', uid);
  const snap = await getDoc(wref);
  const avail = (snap.data()?.availableBalance as number) ?? 0;
  if (amount > avail) throw new Error('Insufficient balance.');
  const updated = avail - amount;
  const now = Date.now();
  await updateDoc(wref, { availableBalance: updated, updatedAt: now });
  await addDoc(collection(db, 'transactions'), {
    userId: uid, type: 'withdrawal', amount, currency: 'NGN', status: 'success',
    balanceAfter: updated, reference: `TT-${now}`, metadata: { bank }, createdAt: now,
  });
  await addDoc(collection(db, 'notifications'), {
    userId: uid, title: 'Withdrawal successful',
    body: `₦${amount.toLocaleString()} sent to ${bank} (simulated).`,
    type: 'transaction', read: false, createdAt: now,
  });
  return updated;
}

/* -------------------------------- nest ---------------------------------- */

export interface NestInput { childFirst: string; childLast: string; dob: string; initial: number; }

export async function createNest(uid: string, input: NestInput) {
  if (!db) throw new Error('Firebase not configured');
  const wref = doc(db, 'wallets', uid);
  const snap = await getDoc(wref);
  const avail = (snap.data()?.availableBalance as number) ?? 0;
  const locked = (snap.data()?.lockedBalance as number) ?? 0;
  if (input.initial > avail) throw new Error('Insufficient wallet balance.');
  const now = Date.now();
  const dob = new Date(input.dob);
  const mat = new Date(dob); mat.setFullYear(dob.getFullYear() + 18);
  const planRef = await addDoc(collection(db, 'savings_plans'), {
    userId: uid, typeId: 'nest', name: `${input.childFirst}'s Nest`,
    targetAmount: 5_000_000, currentAmount: input.initial, frequency: 'monthly',
    contributionAmount: 0, startDate: now, maturityDate: mat.getTime(), interestEarned: 0,
    status: 'active', autoDebit: true,
  });
  if (input.initial > 0) {
    const updated = avail - input.initial;
    await updateDoc(wref, { availableBalance: updated, lockedBalance: locked + input.initial, updatedAt: now });
    await addDoc(collection(db, 'transactions'), {
      userId: uid, type: 'plan_funding', amount: input.initial, currency: 'NGN', status: 'success',
      balanceAfter: updated, reference: `TT-${now}`, metadata: { nest: planRef.id }, createdAt: now,
    });
  }
  await addDoc(collection(db, 'notifications'), {
    userId: uid, title: 'Nest created 🐣',
    body: `${input.childFirst}'s Nest is now growing. Funds stay locked until age 18.`,
    type: 'savings', read: false, createdAt: now,
  });
  return planRef.id;
}

/* ----------------------------- group savings ---------------------------- */

export interface Group { id: string; ownerId: string; name: string; emoji: string; target: number; current: number; members: string[]; createdAt: number; }

export function watchGroups(uid: string, cb: (g: Group[]) => void): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, 'groups'), where('ownerId', '==', uid));
  return onSnapshot(q, (s) => cb(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Group, 'id'>) }))));
}

export async function createGroup(uid: string, name: string, emoji: string, target: number, initial: number, ownerName: string) {
  if (!db) throw new Error('Firebase not configured');
  const wref = doc(db, 'wallets', uid);
  const snap = await getDoc(wref);
  const avail = (snap.data()?.availableBalance as number) ?? 0;
  if (initial > avail) throw new Error('Insufficient balance.');
  const now = Date.now();
  const ref = await addDoc(collection(db, 'groups'), {
    ownerId: uid, name, emoji, target, current: initial, members: [ownerName, 'Ada', 'Emeka'], createdAt: now,
  });
  if (initial > 0) {
    const updated = avail - initial;
    await updateDoc(wref, { availableBalance: updated, updatedAt: now });
    await addDoc(collection(db, 'transactions'), {
      userId: uid, type: 'plan_funding', amount: initial, currency: 'NGN', status: 'success',
      balanceAfter: updated, reference: `TT-${now}`, metadata: { group: ref.id }, createdAt: now,
    });
  }
  return ref.id;
}

export async function contributeGroup(uid: string, groupId: string, amount: number) {
  if (!db) throw new Error('Firebase not configured');
  if (amount <= 0) throw new Error('Enter an amount.');
  const gref = doc(db, 'groups', groupId);
  const gsnap = await getDoc(gref);
  const wref = doc(db, 'wallets', uid);
  const wsnap = await getDoc(wref);
  const avail = (wsnap.data()?.availableBalance as number) ?? 0;
  if (amount > avail) throw new Error('Insufficient balance.');
  const current = (gsnap.data()?.current as number) ?? 0;
  const now = Date.now();
  await updateDoc(gref, { current: current + amount });
  const updated = avail - amount;
  await updateDoc(wref, { availableBalance: updated, updatedAt: now });
  await addDoc(collection(db, 'transactions'), {
    userId: uid, type: 'plan_funding', amount, currency: 'NGN', status: 'success',
    balanceAfter: updated, reference: `TT-${now}`, metadata: { group: groupId }, createdAt: now,
  });
}

/* --------------------------- welcome seeding ---------------------------- */

export async function seedWelcome(uid: string, firstName: string) {
  if (!db) return;
  const flag = `tt_welcomed_${uid}`;
  if (localStorage.getItem(flag)) return;
  localStorage.setItem(flag, '1');
  const base = Date.now();
  await addDoc(collection(db, 'notifications'), {
    userId: uid, title: `Welcome to TellaTrust, ${firstName}! 🎉`,
    body: 'Your account is ready. Verify your identity, fund your wallet and start growing your money.',
    type: 'announcement', read: false, createdAt: base,
  });
  await addDoc(collection(db, 'notifications'), {
    userId: uid, title: 'Take a quick tour ✦',
    body: 'New here? Tap “Take a tour” in the sidebar — or the button on this page — to explore the main features.',
    type: 'announcement', read: false, createdAt: base - 1,
  });
}
