import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import type { UserProfile } from '@tellavault/shared';
import { remember as rememberCred, setRememberedMeta, getRemembered } from './pin';

interface AuthCtx {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, remember?: boolean) => Promise<void>;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  reloadProfile: () => Promise<void>;
}

// Demo credentials so social sign-in is fully simulated yet creates a real session.
const SOCIAL: Record<'google' | 'apple', { email: string; pw: string; first: string; last: string }> = {
  google: { email: 'tella.google.demo@tellatrust.app', pw: 'Demo#Google1', first: 'Google', last: 'User' },
  apple: { email: 'tella.apple.demo@tellatrust.app', pw: 'Demo#Apple1', first: 'Apple', last: 'User' },
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && db) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        const p = snap.exists() ? (snap.data() as UserProfile) : null;
        setProfile(p);
        if (p && getRemembered()) setRememberedMeta(u.uid, p.firstName); // enable PIN re-login
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const applyPersistence = async (remember: boolean) => {
    if (!auth) return;
    try { await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence); } catch { /* ignore */ }
  };

  const bootstrap = async (uid: string, firstName: string, lastName: string, email: string) => {
    if (!db) return;
    const profileDoc: UserProfile = {
      uid, firstName, lastName, email,
      role: 'customer', kycStatus: 'none', status: 'active', createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', uid), profileDoc);
    await setDoc(doc(db, 'wallets', uid), {
      uid, availableBalance: 0, lockedBalance: 0, currency: 'NGN', updatedAt: Date.now(),
    });
    setProfile(profileDoc);
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, remember = true) => {
    if (!auth || !db) throw new Error('Firebase is not configured yet. Add your keys to apps/web/.env');
    await applyPersistence(remember);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
    await bootstrap(cred.user.uid, firstName, lastName, email);
    if (remember) rememberCred(email, password);
  };

  const signIn = async (email: string, password: string, remember = true) => {
    if (!auth) throw new Error('Firebase is not configured yet. Add your keys to apps/web/.env');
    await applyPersistence(remember);
    await signInWithEmailAndPassword(auth, email, password);
    if (remember) rememberCred(email, password);
  };

  // Simulated Google/Apple sign-in: signs into (or creates) a shared demo account.
  const signInWithProvider = async (provider: 'google' | 'apple') => {
    if (!auth || !db) throw new Error('Firebase is not configured yet. Add your keys to apps/web/.env');
    const { email, pw, first, last } = SOCIAL[provider];
    await applyPersistence(true);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
    } catch {
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      await updateProfile(cred.user, { displayName: `${first} ${last}` });
      await bootstrap(cred.user.uid, first, last, email);
    }
    rememberCred(email, pw);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase is not configured yet. Add your keys to apps/web/.env');
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    if (auth) await signOut(auth);
  };

  const reloadProfile = async () => {
    if (user && db) {
      const snap = await getDoc(doc(db, 'users', user.uid));
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
    }
  };

  return (
    <Ctx.Provider value={{ user, profile, loading, configured: isFirebaseConfigured, signUp, signIn, signInWithProvider, resetPassword, logout, reloadProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
