/**
 * TellaTrust Cloud Functions (prototype).
 *
 * These illustrate the server-only business logic the plan describes:
 *  - new users get a default role + a wallet
 *  - only a super_admin can change another user's role (RBAC enforcement)
 *  - wallet funding is SIMULATED and always writes a transaction + audit log
 *
 * This is a proof of concept: no real payment rails are touched.
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

initializeApp();
const db = getFirestore();

type Role = 'customer' | 'support' | 'finance' | 'compliance' | 'admin' | 'super_admin';

async function writeAudit(params: {
  actorId: string;
  actorRole: Role;
  action: string;
  target: string;
  before?: unknown;
  after?: unknown;
}) {
  await db.collection('audit_logs').add({
    ...params,
    createdAt: Date.now(),
  });
}

/** Every new account starts as a customer and gets a zeroed NGN wallet. */
export const onCreateUser = beforeUserCreated(async (event) => {
  const user = event.data;
  if (!user) return {};
  await db.collection('wallets').doc(user.uid).set({
    uid: user.uid,
    availableBalance: 0,
    lockedBalance: 0,
    currency: 'NGN',
    updatedAt: Date.now(),
  });
  return { customClaims: { role: 'customer' as Role } };
});

/** super_admin-only: set another user's role (RBAC + audit). */
export const setUserRole = onCall(async (request) => {
  const callerRole = (request.auth?.token.role as Role) ?? 'customer';
  if (callerRole !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only a super_admin can change roles.');
  }
  const { uid, role } = request.data as { uid: string; role: Role };
  if (!uid || !role) throw new HttpsError('invalid-argument', 'uid and role are required.');

  const before = (await db.collection('users').doc(uid).get()).data()?.role;
  await getAuth().setCustomUserClaims(uid, { role });
  await db.collection('users').doc(uid).set({ role }, { merge: true });
  await writeAudit({
    actorId: request.auth!.uid,
    actorRole: callerRole,
    action: 'set_user_role',
    target: uid,
    before,
    after: role,
  });
  return { ok: true };
});

/** SIMULATED wallet funding — credits the wallet and records a transaction. */
export const simulateFunding = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  const uid = request.auth.uid;
  const amount = Number((request.data as { amount: number }).amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpsError('invalid-argument', 'A positive amount is required.');
  }

  const walletRef = db.collection('wallets').doc(uid);
  const newBalance = await db.runTransaction(async (tx) => {
    const snap = await tx.get(walletRef);
    const current = (snap.data()?.availableBalance as number) ?? 0;
    const updated = current + amount;
    tx.set(walletRef, { availableBalance: updated, updatedAt: Date.now() }, { merge: true });
    tx.set(db.collection('transactions').doc(), {
      userId: uid,
      type: 'deposit',
      amount,
      currency: 'NGN',
      status: 'success',
      balanceAfter: updated,
      reference: `TV-${Date.now()}`,
      metadata: { simulated: true },
      createdAt: Date.now(),
    });
    return updated;
  });

  await db.collection('notifications').add({
    userId: uid,
    title: 'Wallet funded',
    body: `Your wallet was credited (simulated). New balance: ₦${newBalance.toLocaleString()}.`,
    type: 'transaction',
    read: false,
    createdAt: Date.now(),
  });
  await writeAudit({
    actorId: uid,
    actorRole: 'customer',
    action: 'simulate_funding',
    target: uid,
    after: amount,
  });

  return { ok: true, balance: newBalance };
});
