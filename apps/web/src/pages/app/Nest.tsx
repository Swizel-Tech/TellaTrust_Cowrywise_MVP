import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { fmtMoney } from '../../lib/money';
import { createNest, watchPlans } from '../../lib/db';
import type { SavingsPlan } from '@tellavault/shared';
import { useAppCtx } from './AppLayout';

export default function Nest() {
  const { user, profile } = useAuth();
  const { cur } = useAppCtx();
  const [nests, setNests] = useState<SavingsPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ childFirst: '', childLast: '', dob: '', initial: 10000 });
  const verified = profile?.kycStatus === 'verified';

  useEffect(() => {
    if (!user) return;
    return watchPlans(user.uid, (all) => setNests(all.filter((p) => p.typeId === 'nest')));
  }, [user]);

  const total = nests.reduce((s, n) => s + n.currentAmount, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErr(''); setBusy(true);
    try { await createNest(user.uid, f); setOpen(false); setF({ childFirst: '', childLast: '', dob: '', initial: 10000 }); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Could not create Nest.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-pink-500/20"
        style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 45%, #be185d 100%)' }}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
        <p className="text-xs uppercase tracking-wider text-white/80">Nest savings 🐣</p>
        <p className="mt-1 text-4xl font-extrabold tabular-nums">{fmtMoney(total, cur)}</p>
        <p className="mt-2 max-w-md text-sm text-white/85">Build a lasting legacy for your kids. Funds stay locked until your child turns 18.</p>
        <button onClick={() => setOpen((v) => !v)} className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-pink-600 shadow-md transition hover:brightness-95">
          {open ? 'Close' : "+ Set up a child's Nest"}
        </button>
      </div>

      {open && (
        verified ? (
          <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-pink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-2">
            <h3 className="sm:col-span-2 text-lg font-bold">Set up your child's Nest</h3>
            <label className="block text-sm font-semibold">Child's first name
              <input required value={f.childFirst} onChange={(e) => setF({ ...f, childFirst: e.target.value })} placeholder="First name"
                className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-pink-400 dark:border-white/10 dark:bg-white/5 dark:text-white" />
            </label>
            <label className="block text-sm font-semibold">Child's surname
              <input required value={f.childLast} onChange={(e) => setF({ ...f, childLast: e.target.value })} placeholder="Surname"
                className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-pink-400 dark:border-white/10 dark:bg-white/5 dark:text-white" />
            </label>
            <label className="block text-sm font-semibold">Date of birth
              <input type="date" required value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-pink-400 dark:border-white/10 dark:bg-white/5 dark:text-white" />
            </label>
            <label className="block text-sm font-semibold">Initial deposit (₦)
              <input type="number" min={0} value={f.initial} onChange={(e) => setF({ ...f, initial: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-pink-400 dark:border-white/10 dark:bg-white/5 dark:text-white" />
            </label>
            <p className="sm:col-span-2 text-xs text-forest-deep/55 dark:text-mint/55">By continuing, you agree that funds in this Nest remain locked until your child turns 18.</p>
            {err && <p className="sm:col-span-2 text-sm text-red-500">{err}</p>}
            <button type="submit" disabled={busy} className="sm:col-span-2 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-500/20 transition hover:brightness-110 disabled:opacity-60">
              {busy ? 'Creating…' : "Create Nest"}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            Verify your identity first. Head to <Link to="/app/profile" className="font-bold underline">Profile</Link>.
          </div>
        )
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {nests.length === 0 && !open && (
          <p className="sm:col-span-2 rounded-2xl border border-dashed border-pink-200 bg-pink-50/40 py-12 text-center text-sm text-forest-deep/50 dark:border-white/10 dark:bg-white/[0.02] dark:text-mint/50">
            No Nests yet. Set up your first child's Nest above.
          </p>
        )}
        {nests.map((n) => {
          const pct = Math.min(100, Math.round((n.currentAmount / n.targetAmount) * 100));
          const years = Math.max(0, Math.round((n.maturityDate - Date.now()) / (365.25 * 86_400_000)));
          return (
            <div key={n.id} className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="h-1.5 bg-gradient-to-r from-pink-400 to-pink-600" />
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 text-lg">🐣</span>
                  <h3 className="font-bold">{n.name}</h3>
                </div>
                <p className="mt-3 text-2xl font-extrabold tabular-nums">{fmtMoney(n.currentAmount, cur)}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-pink-50 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-forest-deep/50 dark:text-mint/50">Unlocks in ~{years} year{years === 1 ? '' : 's'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
