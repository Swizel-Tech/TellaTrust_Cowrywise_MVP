import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { fmtMoney } from '../../lib/money';
import { buyInvestment, watchWallet } from '../../lib/db';
import { MARKET_NEWS, PRODUCTS, useLivePrices, type Product } from '../../lib/market';
import type { Wallet } from '@tellavault/shared';
import { useAppCtx } from './AppLayout';
import KycBanner from '../../components/KycBanner';

const QUICK = [5000, 25000, 100000];

export default function Investments() {
  const { user, profile } = useAuth();
  const { cur } = useAppCtx();
  const prices = useLivePrices();
  const [tab, setTab] = useState<'mutual_fund' | 'stock'>('mutual_fund');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [sel, setSel] = useState<Product | null>(null);
  const [amount, setAmount] = useState(25000);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const verified = profile?.kycStatus === 'verified';

  useEffect(() => {
    if (!user) return;
    return watchWallet(user.uid, setWallet);
  }, [user]);

  const list = PRODUCTS.filter((p) => p.assetClass === tab);
  const price = sel ? prices[sel.id]?.price ?? sel.basePrice : 0;
  const units = sel && price ? amount / price : 0;

  const buy = async () => {
    if (!user || !sel) return;
    setErr('');
    setBusy(true);
    try {
      await buyInvestment(user.uid, sel.id, amount, price, sel.name);
      setSel(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not complete purchase.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Invest</h1>
        <p className="mt-1 text-sm text-forest-deep/60 dark:text-mint/60">Mutual funds and live NGX stocks. Prices update in real time.</p>
      </div>

      <KycBanner />

      {/* market news */}
      <div className="rounded-2xl border border-line bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <p className="text-sm font-bold">Market news</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {MARKET_NEWS.map((n) => (
            <div key={n.id} className="w-64 shrink-0 rounded-xl bg-soft p-3 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-bold text-forest dark:bg-white/10 dark:text-mint">{n.tag}</span>
                <span className={`text-xs font-bold ${n.sentiment === 'up' ? 'text-green-brand' : n.sentiment === 'down' ? 'text-red-500' : 'text-forest-deep/40 dark:text-mint/40'}`}>
                  {n.sentiment === 'up' ? '▲' : n.sentiment === 'down' ? '▼' : '■'}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm font-medium">{n.title}</p>
              <p className="mt-2 text-xs text-forest-deep/45 dark:text-mint/45">{n.source} · {n.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-2">
        {([['mutual_fund', 'Mutual funds'], ['stock', 'Stocks']] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${tab === k ? 'bg-gradient-to-br from-emerald-400 to-green-brand text-white shadow-md shadow-emerald-500/20' : 'bg-white text-forest-deep/60 dark:bg-white/5 dark:text-mint/60'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* product grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((p) => {
          const tick = prices[p.id];
          const up = (tick?.changePct ?? 0) >= 0;
          return (
            <div key={p.id} className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-xs text-forest-deep/50 dark:text-mint/50">{p.ticker}{p.manager ? ` · ${p.manager}` : ''}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.risk === 'low' ? 'bg-green-bright/15 text-green-brand' : p.risk === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300'}`}>
                  {p.risk} risk
                </span>
              </div>
              <p className="mt-3 text-sm text-forest-deep/60 dark:text-mint/60">{p.blurb}</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xl font-extrabold tabular-nums">{fmtMoney(tick?.price ?? p.basePrice, cur)}</p>
                  <p className={`text-xs font-bold tabular-nums ${up ? 'text-green-brand' : 'text-red-500'}`}>
                    {up ? '▲' : '▼'} {Math.abs(tick?.changePct ?? 0).toFixed(2)}%{p.ratePA ? ` · ${p.ratePA}% p.a.` : ''}
                  </p>
                </div>
                <button
                  onClick={() => { setSel(p); setErr(''); }}
                  className="rounded-full bg-gradient-to-br from-green-brand to-forest px-5 py-2 text-sm font-bold text-white transition hover:brightness-110"
                >
                  Invest
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* buy modal */}
      {sel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setSel(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-line bg-white p-6 dark:border-white/10 dark:bg-[#0a160e]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Invest in {sel.name}</h3>
            <p className="text-sm text-forest-deep/55 dark:text-mint/55">{sel.ticker} · {fmtMoney(price, cur)} / unit</p>

            {!verified ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                Verify your identity (KYC) before investing. Head to <b>Profile</b> to complete it.
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK.map((q) => (
                    <button key={q} onClick={() => setAmount(q)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${amount === q ? 'bg-forest text-white' : 'bg-soft text-forest-deep/70 dark:bg-white/5 dark:text-mint/70'}`}>
                      {fmtMoney(q, cur, { compact: true })}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  min={1000}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-3 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <p className="mt-2 text-sm text-forest-deep/60 dark:text-mint/60">
                  ≈ <b className="tabular-nums">{units.toFixed(4)}</b> units · Wallet {fmtMoney(wallet?.availableBalance ?? 0, cur)}
                </p>
                {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
                <button onClick={buy} disabled={busy} className="mt-4 w-full rounded-xl bg-gradient-to-br from-green-brand to-forest py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60">
                  {busy ? 'Processing…' : `Invest ${fmtMoney(amount, cur)}`}
                </button>
              </>
            )}
            <button onClick={() => setSel(null)} className="mt-2 w-full rounded-xl py-2 text-sm font-semibold text-forest-deep/60 dark:text-mint/60">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
