import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { fmtMoney } from '../../lib/money';
import { fundWallet, watchHoldings, watchPlans, watchTransactions, watchWallet } from '../../lib/db';
import { productById, useLivePrices } from '../../lib/market';
import type { Holding, SavingsPlan, Transaction, Wallet } from '@tellavault/shared';
import { useAppCtx } from './AppLayout';
import { TxnRow } from './Transactions';
import KycBanner from '../../components/KycBanner';

const QUICK = [5000, 10000, 50000, 100000];

const Icon = ({ d, className }: { d: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const ICONS = {
  saved: 'M12 3v18M5 8h9a3 3 0 0 1 0 6H7',
  invest: 'M4 19h16M7 16V9M12 16V5M17 16v-4',
  plans: 'M9 11l3 3 8-8M21 12a9 9 0 1 1-6.2-8.5',
  txns: 'M4 7h16M4 12h16M4 17h10',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 9a3 3 0 100 6 3 3 0 000-6z',
  eyeoff: 'M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 4.2A10.9 10.9 0 0112 4c6.5 0 10 7 10 7a18 18 0 01-3 3.6M6.1 6.1A18 18 0 002 11s3.5 7 10 7a10.9 10.9 0 003.4-.5',
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { cur } = useAppCtx();
  const prices = useLivePrices();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [amount, setAmount] = useState(10000);
  const [busy, setBusy] = useState(false);
  const [hide, setHide] = useState(false);
  const verified = profile?.kycStatus === 'verified';

  useEffect(() => {
    if (!user) return;
    const u1 = watchWallet(user.uid, setWallet);
    const u2 = watchTransactions(user.uid, setTxns);
    const u3 = watchPlans(user.uid, setPlans);
    const u4 = watchHoldings(user.uid, setHoldings);
    return () => { u1(); u2(); u3(); u4(); };
  }, [user]);

  const totalSaved = plans.reduce((s, p) => s + p.currentAmount, 0);
  const portfolio = holdings.reduce((s, h) => s + h.units * (prices[h.productId]?.price ?? productById(h.productId)?.basePrice ?? 0), 0);
  const available = wallet?.availableBalance ?? 0;
  const locked = wallet?.lockedBalance ?? 0;
  const netWorth = available + locked + portfolio;
  const mask = (s: string) => (hide ? '••••••' : s);

  const fund = async () => {
    if (!user || amount <= 0 || !verified) return;
    setBusy(true);
    try { await fundWallet(user.uid, amount); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <KycBanner />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* balance card */}
        <div className="relative overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-emerald-500/25"
          style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 45%, #047857 100%)' }}>
          {/* decorative */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-8 h-48 w-48 rounded-full bg-emerald-300/30 blur-2xl" />
          <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full opacity-30" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M0,60 C80,90 140,20 220,40 C300,60 360,30 400,50 L400,100 L0,100 Z" fill="rgba(255,255,255,0.18)" />
            <path d="M0,75 C90,55 150,95 240,70 C320,48 370,78 400,66 L400,100 L0,100 Z" fill="rgba(255,255,255,0.12)" />
          </svg>

          <div className="relative flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/80">
              Available balance
              <button onClick={() => setHide((v) => !v)} aria-label="Toggle balance" className="opacity-80 hover:opacity-100">
                <Icon className="h-4 w-4" d={hide ? ICONS.eyeoff : ICONS.eye} />
              </button>
            </p>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">↑ 12.4% this month</span>
          </div>
          <p className="relative mt-1 text-5xl font-extrabold tabular-nums tracking-tight">{mask(fmtMoney(available, cur))}</p>

          <div className="relative mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
            <span>Locked · <b className="text-white">{mask(fmtMoney(locked, cur))}</b></span>
            <span>Investments · <b className="text-white">{mask(fmtMoney(portfolio, cur))}</b></span>
            <span>Net worth · <b className="text-white">{mask(fmtMoney(netWorth, cur))}</b></span>
          </div>
        </div>

        {/* right column */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-sm font-bold">Fund wallet <span className="text-forest-deep/40 dark:text-mint/40">(simulated)</span></p>
            {!verified ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-forest-deep/60 dark:text-mint/60">Verify your identity to enable funding.</p>
                <Link to="/app/profile" className="block rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 py-2.5 text-center text-sm font-bold text-white shadow-md shadow-orange-500/20">Complete KYC →</Link>
              </div>
            ) : (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  {QUICK.map((q) => (
                    <button key={q} onClick={() => setAmount(q)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${amount === q ? 'bg-gradient-to-br from-emerald-400 to-green-brand text-white' : 'bg-emerald-50 text-green-700 dark:bg-white/5 dark:text-mint/70'}`}>
                      {fmtMoney(q, cur, { compact: true })}
                    </button>
                  ))}
                </div>
                <input type="number" value={amount} min={100} onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-3 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <button onClick={fund} disabled={busy} className="mt-3 w-full rounded-xl bg-gradient-to-br from-emerald-400 to-green-brand py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:brightness-110 disabled:opacity-60">
                  {busy ? 'Funding…' : `Add ${fmtMoney(amount, cur)}`}
                </button>
              </>
            )}
          </div>

          {/* promo banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500 p-5 text-white shadow-lg shadow-orange-500/20">
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/20 blur-xl" />
            <p className="text-lg font-extrabold">It's Salary Week! 💸</p>
            <p className="mt-1 text-sm text-white/90">Top up your savings, funds and stocks to keep your money growing.</p>
            <Link to="/app/invest" className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-bold text-orange-600">Top up now →</Link>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {([
          ['Total saved', mask(fmtMoney(totalSaved, cur)), ICONS.saved, 'from-emerald-400 to-green-600'],
          ['Investments', mask(fmtMoney(portfolio, cur)), ICONS.invest, 'from-sky-400 to-blue-600'],
          ['Active plans', String(plans.filter((p) => p.status === 'active').length), ICONS.plans, 'from-violet-400 to-fuchsia-600'],
          ['Transactions', String(txns.length), ICONS.txns, 'from-amber-400 to-orange-600'],
        ] as [string, string, string, string][]).map(([k, v, d, g]) => (
          <div key={k} className="flex items-center gap-3 rounded-2xl border border-emerald-100/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${g} text-white shadow-md`}>
              <Icon className="h-5 w-5" d={d} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs uppercase tracking-wide text-forest-deep/50 dark:text-mint/50">{k}</p>
              <p className="text-xl font-extrabold tabular-nums">{v}</p>
            </div>
          </div>
        ))}
      </div>

      {/* quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {([
          ['Create a savings plan', '/app/savings', 'Automate towards a goal', ICONS.saved, 'from-emerald-400 to-green-600'],
          ['Invest in funds & stocks', '/app/invest', 'Grow with the market', ICONS.invest, 'from-sky-400 to-blue-600'],
          ['View your portfolio', '/app/portfolio', 'Track your holdings', ICONS.plans, 'from-violet-400 to-fuchsia-600'],
        ] as [string, string, string, string, string][]).map(([t, to, d, ic, g]) => (
          <Link key={to} to={to} className="group flex items-start gap-3 rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${g} text-white shadow-md transition group-hover:scale-110`}>
              <Icon className="h-5 w-5" d={ic} />
            </span>
            <div>
              <p className="font-bold group-hover:text-green-brand">{t}</p>
              <p className="mt-0.5 text-sm text-forest-deep/55 dark:text-mint/55">{d}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* recent activity */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <p className="mb-3 text-sm font-bold">Recent activity</p>
        {txns.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-2xl dark:bg-white/5">🌱</span>
            <p className="text-sm text-forest-deep/50 dark:text-mint/50">No activity yet. Verify and fund your wallet to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-line dark:divide-white/10">
            {txns.slice(0, 6).map((t) => <TxnRow key={t.id} t={t} cur={cur} />)}
          </div>
        )}
      </div>
    </div>
  );
}
