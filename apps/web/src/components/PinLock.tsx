import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../lib/auth';
import { hasPin, setPin as savePin, verifyPin, unlockSession } from '../lib/pin';

/** Shown when a session is signed-in but not yet unlocked. Creates a PIN on first use, else verifies. */
export default function PinLock({ onUnlock }: { onUnlock: () => void }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const uid = user?.uid ?? '';
  const creating = !hasPin(uid);

  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');
  const [err, setErr] = useState('');

  const active = stage === 'enter' ? pin : confirm;
  const setActive = (v: string) => (stage === 'enter' ? setPin(v) : setConfirm(v));

  const press = (d: string) => {
    setErr('');
    if (active.length >= 4) return;
    const next = active + d;
    setActive(next);
    if (next.length === 4) setTimeout(() => submit(next), 120);
  };
  const back = () => setActive(active.slice(0, -1));

  const submit = (value: string) => {
    if (creating) {
      if (stage === 'enter') {
        setStage('confirm');
        return;
      }
      if (value !== pin) {
        setErr('PINs do not match. Try again.');
        setPin(''); setConfirm(''); setStage('enter');
        return;
      }
      savePin(uid, value);
      unlockSession();
      onUnlock();
    } else {
      if (verifyPin(uid, value)) {
        unlockSession();
        onUnlock();
      } else {
        setErr('Incorrect PIN.');
        setPin('');
      }
    }
  };

  const doLogout = async () => { await logout(); navigate('/login'); };

  const title = creating ? (stage === 'enter' ? 'Create a 4-digit PIN' : 'Confirm your PIN') : 'Enter your PIN';
  const sub = creating ? 'Use this to unlock TellaTrust quickly next time.' : `Welcome back, ${profile?.firstName ?? ''}`;

  return (
    <div className="grid min-h-screen place-items-center p-6"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, #d1fae5 0%, #ecfdf5 45%, #ffffff 100%)' }}>
      <div className="w-full max-w-xs text-center">
        <div className="mb-6 flex justify-center"><Logo size={40} withWordmark /></div>
        <h1 className="text-xl font-extrabold text-forest-deep">{title}</h1>
        <p className="mt-1 text-sm text-forest-deep/55">{sub}</p>

        <div className="my-7 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-4 w-4 rounded-full transition ${i < active.length ? 'bg-green-brand scale-110' : 'bg-forest-deep/15'}`} />
          ))}
        </div>
        {err && <p className="mb-3 text-sm text-red-500">{err}</p>}

        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} onClick={() => press(d)}
              className="aspect-square rounded-2xl bg-white/80 text-2xl font-bold text-forest-deep shadow-sm ring-1 ring-emerald-100 transition hover:bg-emerald-50 active:scale-95">
              {d}
            </button>
          ))}
          <span />
          <button onClick={() => press('0')} className="aspect-square rounded-2xl bg-white/80 text-2xl font-bold text-forest-deep shadow-sm ring-1 ring-emerald-100 transition hover:bg-emerald-50 active:scale-95">0</button>
          <button onClick={back} className="aspect-square rounded-2xl text-xl font-bold text-forest-deep/50 transition hover:bg-emerald-50/60">⌫</button>
        </div>

        <button onClick={doLogout} className="mt-7 text-sm font-semibold text-forest-deep/50 hover:text-red-500">
          Not you? Log out
        </button>
      </div>
    </div>
  );
}
