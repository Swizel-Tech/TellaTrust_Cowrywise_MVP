import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { fmtMoney } from '../../lib/money';
import { createPlan, PLAN_TYPES, watchPlans } from '../../lib/db';
import type { SavingsPlan } from '@tellavault/shared';
import { useAppCtx } from './AppLayout';

const TYPE_STYLE: Record<string, { grad: string; icon: string }> = {
  regular: { grad: 'from-emerald-400 to-green-600', icon: '💧' },
  fixed: { grad: 'from-sky-400 to-blue-600', icon: '🔒' },
  goal: { grad: 'from-violet-400 to-fuchsia-600', icon: '🎯' },
};

export default function Savings() {
  const { user } = useAuth();
  const { cur } = useAppCtx();
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({
    name: '',
    typeId: PLAN_TYPES[0].id,
    target: 100000,
    frequency: 'monthly' as SavingsPlan['frequency'],
    contribution: 10000,
    initial: 5000,
  });

  useEffect(() => {
    if (!user) return;
    return watchPlans(user.uid, (all) => setPlans(all.filter((p) => p.typeId !== 'nest')));
  }, [user]);

  const totalSaved = plans.reduce((s, p) => s + p.currentAmount, 0);
  const activeCount = plans.filter((p) => p.status === 'active').length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErr(''); setBusy(true);
    try {
      const type = PLAN_TYPES.find((t) => t.id === f.typeId)!;
      await createPlan(user.uid, { ...f, tenorDays: type.tenor });
      setOpen(false);
      setF({ ...f, name: '' });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not create plan.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* hero */}
      <div className="relative overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-emerald-500/25"
        style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 45%, #047857 100%)' }}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full opacity-25" viewBox="0 0 400 80" preserveAspectRatio="none"><path d="M0,50 C90,80 150,20 240,40 C320,56 360,34 400,46 L400,80 L0,80 Z" fill="white" /></svg>
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/80">Total savings</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">{fmtMoney(totalSaved, cur)}</p>
            <p className="mt-1 text-sm text-white/80">Across {activeCount} active plan{activeCount === 1 ? '' : 's'}</p>
          </div>
          <button onClick={() => setOpen((v) => !v)} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-green-700 shadow-md transition hover:brightness-95">
            {open ? 'Close' : '+ New plan'}
          </button>
        </div>
      </div>

      {/* plan type chips */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLAN_TYPES.map((t) => {
          const s = TYPE_STYLE[t.id];
          return (
            <button key={t.id} onClick={() => { setF({ ...f, typeId: t.id }); setOpen(true); }}
              className="flex items-start gap-3 rounded-2xl border border-emerald-100/70 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${s.grad} text-lg shadow-md`}>{s.icon}</span>
              <div>
                <p className="font-bold">{t.name}</p>
                <p className="text-xs text-forest-deep/55 dark:text-mint/55">{t.rate}% p.a. · {t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {open && (
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-2">
          <label className="sm:col-span-2 block text-sm font-semibold">
            Plan name
            <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. New laptop, Rent, Emergency fund"
              className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </label>
          <label className="block text-sm font-semibold">Plan type
            <select value={f.typeId} onChange={(e) => setF({ ...f, typeId: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white">
              {PLAN_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.rate}% p.a.</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">Frequency
            <select value={f.frequency} onChange={(e) => setF({ ...f, frequency: e.target.value as SavingsPlan['frequency'] })}
              className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="daily">Daily</option><option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option><option value="none">One-off</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">Target amount (₦)
            <input type="number" min={1000} value={f.target} onChange={(e) => setF({ ...f, target: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </label>
          <label className="block text-sm font-semibold">Initial deposit (₦)
            <input type="number" min={0} value={f.initial} onChange={(e) => setF({ ...f, initial: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </label>
          {err && <p className="sm:col-span-2 text-sm text-red-500">{err}</p>}
          <button type="submit" disabled={busy} className="sm:col-span-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-brand py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:brightness-110 disabled:opacity-60">
            {busy ? 'Creating…' : 'Create plan'}
          </button>
        </form>
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-deep/50 dark:text-mint/50">Your plans</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.length === 0 && !open && (
            <p className="sm:col-span-2 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 py-12 text-center text-sm text-forest-deep/50 dark:border-white/10 dark:bg-white/[0.02] dark:text-mint/50">
              No plans yet. Pick a plan type above to start.
            </p>
          )}
          {plans.map((p) => {
            const pct = Math.min(100, Math.round((p.currentAmount / p.targetAmount) * 100));
            const type = PLAN_TYPES.find((t) => t.id === p.typeId);
            const s = TYPE_STYLE[p.typeId] ?? TYPE_STYLE.regular;
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-emerald-100/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className={`h-1.5 bg-gradient-to-r ${s.grad}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${s.grad} text-sm`}>{s.icon}</span>
                      <h3 className="font-bold">{p.name}</h3>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-green-700">{type?.name ?? 'Plan'}</span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold tabular-nums">{fmtMoney(p.currentAmount, cur)}</p>
                  <p className="text-xs text-forest-deep/50 dark:text-mint/50">of {fmtMoney(p.targetAmount, cur)} target</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-50 dark:bg-white/10">
                    <div className={`h-full rounded-full bg-gradient-to-r ${s.grad} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-forest-deep/50 dark:text-mint/50">{pct}% · matures {new Date(p.maturityDate).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
