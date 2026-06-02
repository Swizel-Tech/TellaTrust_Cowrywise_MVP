import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell, { Field, PasswordField } from '../components/AuthShell';
import SocialButtons from '../components/SocialButtons';
import { useAuth } from '../lib/auth';
import { getRemembered, hasPin, verifyPin, unlockSession, forgetRemembered } from '../lib/pin';

export default function Login() {
  const { signIn, resetPassword, configured } = useAuth();
  const navigate = useNavigate();
  const remembered = getRemembered();
  const canPin = !!(remembered?.uid && hasPin(remembered.uid));
  const [mode, setMode] = useState<'pin' | 'password'>(canPin ? 'pin' : 'password');

  if (mode === 'pin' && remembered?.uid) {
    return (
      <AuthShell
        title={`Welcome back, ${remembered.name ?? ''}`.trim()}
        subtitle="Enter your 4-digit PIN to continue."
        footer={<button onClick={() => setMode('password')} className="font-semibold text-green-brand">Use email &amp; password instead</button>}
      >
        <PinUnlock
          uid={remembered.uid}
          onUnlock={async () => {
            try { await signIn(remembered.email, remembered.pw, true); unlockSession(); navigate('/app'); } catch { /* */ }
          }}
          onForget={() => { forgetRemembered(); setMode('password'); }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your TellaTrust account."
      footer={<>New here? <Link to="/signup" className="font-semibold text-green-brand">Create an account</Link></>}
    >
      <SocialButtons />
      <PasswordLogin signIn={signIn} resetPassword={resetPassword} configured={configured} onDone={() => navigate('/app')} />
    </AuthShell>
  );
}

function PasswordLogin({
  signIn, resetPassword, configured, onDone,
}: {
  signIn: (e: string, p: string, r?: boolean) => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  configured: boolean;
  onDone: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setInfo(''); setBusy(true);
    try { await signIn(email, password, remember); onDone(); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Could not sign in.'); }
    finally { setBusy(false); }
  };

  const forgot = async () => {
    setErr(''); setInfo('');
    if (!email) { setErr('Enter your email first, then tap “Forgot password”.'); return; }
    try { await resetPassword(email); setInfo(`Password reset link sent to ${email}.`); }
    catch { setInfo(`If an account exists for ${email}, a reset link has been sent.`); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {!configured && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          Firebase isn't connected yet — add your keys to <code>apps/web/.env</code> to enable login.
        </p>
      )}
      <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
      <PasswordField label="Password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-forest-deep/70 dark:text-mint/70">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-green-600" />
          Remember me
        </label>
        <button type="button" onClick={forgot} className="font-semibold text-green-brand">Forgot password?</button>
      </div>
      {err && <p className="text-sm text-red-500">{err}</p>}
      {info && <p className="text-sm text-green-brand">{info}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-gradient-to-br from-emerald-400 to-green-brand py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:opacity-60">
        {busy ? 'Signing in…' : 'Log in'}
      </button>
    </form>
  );
}

function PinUnlock({ uid, onUnlock, onForget }: { uid: string; onUnlock: () => void; onForget: () => void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (verifyPin(uid, next)) onUnlock();
        else { setErr('Incorrect PIN.'); setPin(''); }
      }, 120);
    }
  };

  return (
    <div className="text-center">
      <div className="my-5 flex justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-4 w-4 rounded-full transition ${i < pin.length ? 'scale-110 bg-green-brand' : 'bg-forest-deep/15 dark:bg-white/15'}`} />
        ))}
      </div>
      {err && <p className="mb-3 text-sm text-red-500">{err}</p>}
      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} onClick={() => press(d)} className="aspect-square rounded-2xl bg-white text-2xl font-bold text-forest-deep shadow-sm ring-1 ring-emerald-100 transition hover:bg-emerald-50 active:scale-95 dark:bg-white/5 dark:text-white dark:ring-white/10">{d}</button>
        ))}
        <span />
        <button onClick={() => press('0')} className="aspect-square rounded-2xl bg-white text-2xl font-bold text-forest-deep shadow-sm ring-1 ring-emerald-100 transition hover:bg-emerald-50 active:scale-95 dark:bg-white/5 dark:text-white dark:ring-white/10">0</button>
        <button onClick={() => setPin(pin.slice(0, -1))} className="aspect-square rounded-2xl text-xl font-bold text-forest-deep/50 transition hover:bg-emerald-50/60">⌫</button>
      </div>
      <button onClick={onForget} className="mt-6 text-sm font-semibold text-forest-deep/50 hover:text-red-500 dark:text-mint/50">Use another account</button>
    </div>
  );
}
