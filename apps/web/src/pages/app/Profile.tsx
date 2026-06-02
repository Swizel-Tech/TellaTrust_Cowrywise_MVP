import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { submitKyc, updateUserProfile } from '../../lib/db';
import { hasPin, setPin as savePin, verifyPin, clearPin } from '../../lib/pin';

export default function Profile() {
  const { profile, reloadProfile } = useAuth();
  const verified = profile?.kycStatus === 'verified';

  // profile edit
  const [p, setP] = useState({
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    phone: profile?.phone ?? '',
  });
  const [savedMsg, setSavedMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // kyc
  const [bvn, setBvn] = useState('');
  const [dob, setDob] = useState(profile?.dob ?? '');
  const [kycErr, setKycErr] = useState('');
  const [kycBusy, setKycBusy] = useState(false);

  if (!profile) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSavedMsg('');
    try {
      await updateUserProfile(profile.uid, p);
      await reloadProfile();
      setSavedMsg('Saved.');
    } finally {
      setSavingProfile(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycErr('');
    setKycBusy(true);
    try {
      await submitKyc(profile.uid, bvn, dob);
      await reloadProfile();
    } catch (e2) {
      setKycErr(e2 instanceof Error ? e2.message : 'Verification failed.');
    } finally {
      setKycBusy(false);
    }
  };

  const inputCls =
    'mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-green-brand to-forest text-xl font-bold uppercase text-white">
          {profile.firstName[0]}{profile.lastName[0]}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold">{profile.firstName} {profile.lastName}</h1>
          <p className="text-sm text-forest-deep/60 dark:text-mint/60">{profile.email}</p>
        </div>
      </div>

      {/* KYC */}
      <section className="rounded-2xl border border-line bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Identity verification (KYC)</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${verified ? 'bg-green-bright/15 text-green-brand' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}>
            {verified ? '✓ Verified' : 'Not verified'}
          </span>
        </div>

        {verified ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info label="BVN" value={`••••••• ${profile.bvnLast4 ?? ''}`} />
            <Info label="Date of birth" value={profile.dob ?? '—'} />
            <Info label="Verified on" value={profile.kycVerifiedAt ? new Date(profile.kycVerifiedAt).toLocaleDateString() : '—'} />
          </div>
        ) : (
          <form onSubmit={verify} className="mt-4 grid gap-4 sm:grid-cols-2">
            <p className="sm:col-span-2 text-sm text-forest-deep/60 dark:text-mint/60">
              Enter your BVN and date of birth to verify your identity. This is <b>simulated</b> — any 11-digit number works.
            </p>
            <label className="block text-sm font-semibold">
              Bank Verification Number (BVN)
              <input value={bvn} onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="11 digits" inputMode="numeric" className={inputCls} />
            </label>
            <label className="block text-sm font-semibold">
              Date of birth
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
            </label>
            {kycErr && <p className="sm:col-span-2 text-sm text-red-500">{kycErr}</p>}
            <button type="submit" disabled={kycBusy} className="sm:col-span-2 rounded-xl bg-gradient-to-br from-green-brand to-forest py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60">
              {kycBusy ? 'Verifying…' : 'Verify my identity'}
            </button>
          </form>
        )}
      </section>

      {/* Security & PIN */}
      <PinSettings uid={profile.uid} inputCls={inputCls} />

      {/* Profile details */}
      <section className="rounded-2xl border border-line bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="text-lg font-bold">Personal details</h2>
        <form onSubmit={saveProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">First name
            <input value={p.firstName} onChange={(e) => setP({ ...p, firstName: e.target.value })} className={inputCls} />
          </label>
          <label className="block text-sm font-semibold">Last name
            <input value={p.lastName} onChange={(e) => setP({ ...p, lastName: e.target.value })} className={inputCls} />
          </label>
          <label className="block text-sm font-semibold">Phone
            <input value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} placeholder="+234…" className={inputCls} />
          </label>
          <label className="block text-sm font-semibold">Email
            <input value={profile.email} disabled className={`${inputCls} opacity-60`} />
          </label>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={savingProfile} className="rounded-xl bg-forest px-5 py-2.5 text-sm font-bold text-white transition hover:bg-forest-deep disabled:opacity-60">
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
            {savedMsg && <span className="text-sm text-green-brand">{savedMsg}</span>}
          </div>
        </form>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-soft p-3 dark:bg-white/5">
      <p className="text-xs uppercase tracking-wide text-forest-deep/50 dark:text-mint/50">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}

function PinSettings({ uid, inputCls }: { uid: string; inputCls: string }) {
  const [exists, setExists] = useState(hasPin(uid));
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 4);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if (exists && !verifyPin(uid, current)) { setErr('Current PIN is incorrect.'); return; }
    if (next.length !== 4) { setErr('PIN must be 4 digits.'); return; }
    if (next !== confirm) { setErr('PINs do not match.'); return; }
    savePin(uid, next);
    setExists(true);
    setCurrent(''); setNext(''); setConfirm('');
    setMsg(exists ? 'PIN updated.' : 'PIN set. You can now unlock with it.');
  };

  const remove = () => {
    clearPin(uid);
    setExists(false);
    setCurrent(''); setNext(''); setConfirm('');
    setMsg('PIN removed.');
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Security &amp; PIN</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${exists ? 'bg-emerald-100 text-green-700' : 'bg-forest-deep/5 text-forest-deep/50 dark:bg-white/10 dark:text-mint/50'}`}>
          {exists ? '🔒 PIN on' : 'No PIN'}
        </span>
      </div>
      <p className="mt-1 text-sm text-forest-deep/60 dark:text-mint/60">
        {exists ? 'Your 4-digit PIN unlocks the app each session and lets you log in faster.' : 'Add a 4-digit PIN for quick unlock and faster login.'}
      </p>
      <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-3">
        {exists && (
          <label className="block text-sm font-semibold">Current PIN
            <input value={current} onChange={(e) => setCurrent(onlyDigits(e.target.value))} inputMode="numeric" placeholder="••••" className={inputCls} />
          </label>
        )}
        <label className="block text-sm font-semibold">{exists ? 'New PIN' : 'PIN'}
          <input value={next} onChange={(e) => setNext(onlyDigits(e.target.value))} inputMode="numeric" placeholder="4 digits" className={inputCls} />
        </label>
        <label className="block text-sm font-semibold">Confirm
          <input value={confirm} onChange={(e) => setConfirm(onlyDigits(e.target.value))} inputMode="numeric" placeholder="Repeat PIN" className={inputCls} />
        </label>
        {err && <p className="sm:col-span-3 text-sm text-red-500">{err}</p>}
        {msg && <p className="sm:col-span-3 text-sm text-green-brand">{msg}</p>}
        <div className="sm:col-span-3 flex gap-3">
          <button type="submit" className="rounded-xl bg-forest px-5 py-2.5 text-sm font-bold text-white transition hover:bg-forest-deep">
            {exists ? 'Update PIN' : 'Set PIN'}
          </button>
          {exists && <button type="button" onClick={remove} className="rounded-xl px-5 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10">Remove PIN</button>}
        </div>
      </form>
    </section>
  );
}
