import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { fmtMoney } from '../../lib/money';
import { fundWallet, watchTransactions, watchWallet, withdrawToBank } from '../../lib/db';
import type { Transaction, Wallet } from '@tellavault/shared';
import { useAppCtx } from './AppLayout';
import { TxnRow } from './Transactions';
import KycBanner from '../../components/KycBanner';

const BANKS = ['GTBank', 'Access Bank', 'Zenith Bank', 'UBA', 'Kuda', 'Opay'];

export default function Stash() {
  const { user, profile } = useAuth();
  const { cur } = useAppCtx();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [mode, setMode] = useState<'fund' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState(10000);
  const [bank, setBank] = useState(BANKS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const verified = profile?.kycStatus === 'verified';
  const available = wallet?.availableBalance ?? 0;

  useEffect(() => {
    if (!user) return;
    const u1 = watchWallet(user.uid, setWallet);
    const u2 = watchTransactions(user.uid, setTxns);
    return () => { u1(); u2(); };
  }, [user]);

  const go = async () => {
    if (!user) return;
    setErr(''); setBusy(true);
    try {
      if (mode === 'fund') await fundWallet(user.uid, amount);
      else await withdrawToBank(user.uid, amount, bank);
      setMode(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.');
    } finally { setBusy(false); }
  };

  const actions = [
    { k: 'fund', label: 'Fund Stash', emoji: '💵', grad: 'from-emerald-400 to-green-600' },
    { k: 'save', label: 'Save my money', emoji: '🎯', grad: 'from-sky-400 to-blue-600', to: '/app/savings' },
    { k: 'invest', label: 'Invest my money', emoji: '📈', grad: 'from-violet-400 to-fuchsia-600', to: '/app/invest' },
    { k: 'withdraw', label: 'Withdraw to bank', emoji: '🏦', grad: 'from-amber-400 to-orange-600' },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <KycBanner />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-emerald-500/25"
          style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 45%, #047857 100%)' }}>
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
          <p className="text-xs uppercase tracking-wider text-white/80">Idle balance</p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums">{fmtMoney(available, cur)}</p>
          <p className="mt-2 text-sm text-white/80">Cash ready to save, invest or withdraw.</p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="mb-3 text-sm font-bold">What would you like to do?</p>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((a) => (
              'to' in a && a.to ? (
                <Link key={a.k} to={a.to} className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50/60 p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white/5">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${a.grad} text-lg`}>{a.emoji}</span>
                  <span className="text-xs font-bold">{a.label}</span>
                </Link>
              ) : (
                <button key={a.k} onClick={() => { setErr(''); setMode(a.k as 'fund' | 'withdraw'); }} className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50/60 p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white/5">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${a.grad} text-lg`}>{a.emoji}</span>
                  <span className="text-xs font-bold">{a.label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <p className="mb-3 text-sm font-bold">Stash activity</p>
        {txns.length === 0 ? (
          <p className="py-8 text-center text-sm text-forest-deep/50 dark:text-mint/50">No activity yet.</p>
        ) : (
          <div className="divide-y divide-line dark:divide-white/10">
            {txns.slice(0, 8).map((t) => <TxnRow key={t.id} t={t} cur={cur} />)}
          </div>
        )}
      </div>

      {/* fund / withdraw modal */}
      {mode && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setMode(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-6 dark:border-white/10 dark:bg-[#0a160e]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">{mode === 'fund' ? 'Fund your Stash' : 'Withdraw to bank'} <span className="text-forest-deep/40 dark:text-mint/40">(simulated)</span></h3>
            {!verified ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                Verify your identity first. Head to <Link to="/app/profile" className="font-bold underline">Profile</Link>.
              </div>
            ) : (
              <>
                {mode === 'withdraw' && (
                  <label className="mt-4 block text-sm font-semibold">Bank
                    <select value={bank} onChange={(e) => setBank(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white">
                      {BANKS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </label>
                )}
                <input type="number" min={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-4 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white" />
                {mode === 'withdraw' && <p className="mt-2 text-xs text-forest-deep/50 dark:text-mint/50">Available {fmtMoney(available, cur)}</p>}
                {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
                <button onClick={go} disabled={busy} className="mt-4 w-full rounded-xl bg-gradient-to-br from-emerald-400 to-green-brand py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:brightness-110 disabled:opacity-60">
                  {busy ? 'Processing…' : mode === 'fund' ? `Add ${fmtMoney(amount, cur)}` : `Withdraw ${fmtMoney(amount, cur)}`}
                </button>
              </>
            )}
            <button onClick={() => setMode(null)} className="mt-2 w-full rounded-xl py-2 text-sm font-semibold text-forest-deep/60 dark:text-mint/60">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
