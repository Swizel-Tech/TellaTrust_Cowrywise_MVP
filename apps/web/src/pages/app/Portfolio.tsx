import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { fmtMoney } from '../../lib/money';
import { watchHoldings } from '../../lib/db';
import { productById, useLivePrices } from '../../lib/market';
import type { Holding } from '@tellavault/shared';
import { useAppCtx } from './AppLayout';

const DONUT = ['#1C7A3E', '#2FA84F', '#3CC264', '#9FE2B4', '#0F2A18', '#7bd49a'];

export default function Portfolio() {
  const { user } = useAuth();
  const { cur } = useAppCtx();
  const prices = useLivePrices();
  const [holdings, setHoldings] = useState<Holding[]>([]);

  useEffect(() => {
    if (!user) return;
    return watchHoldings(user.uid, setHoldings);
  }, [user]);

  const rows = holdings.map((h) => {
    const prod = productById(h.productId);
    const price = prices[h.productId]?.price ?? prod?.basePrice ?? 0;
    const value = h.units * price;
    const cost = h.units * h.avgBuyPrice;
    const pl = value - cost;
    const plPct = cost > 0 ? (pl / cost) * 100 : 0;
    return { h, prod, price, value, pl, plPct };
  });

  const total = rows.reduce((s, r) => s + r.value, 0);
  const totalCost = rows.reduce((s, r) => s + r.h.units * r.h.avgBuyPrice, 0);
  const totalPl = total - totalCost;

  // donut segments
  let acc = 0;
  const segs = rows.map((r, i) => {
    const frac = total > 0 ? r.value / total : 0;
    const seg = { color: DONUT[i % DONUT.length], from: acc, to: acc + frac, label: r.prod?.ticker ?? '?' };
    acc += frac;
    return seg;
  });
  const grad = segs.length
    ? `conic-gradient(${segs.map((s) => `${s.color} ${s.from * 360}deg ${s.to * 360}deg`).join(',')})`
    : 'conic-gradient(#DDE7E0 0deg 360deg)';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-extrabold">Portfolio</h1>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-emerald-500/20"
          style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 45%, #059669 100%)' }}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/25 blur-3xl" />
          <p className="text-xs uppercase tracking-wider text-white/80">Total portfolio value</p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums">{fmtMoney(total, cur)}</p>
          <p className={`mt-2 text-sm font-semibold ${totalPl >= 0 ? 'text-white' : 'text-red-100'}`}>
            {totalPl >= 0 ? '▲' : '▼'} {fmtMoney(Math.abs(totalPl), cur)} all-time
          </p>
        </div>

        <div className="flex items-center gap-5 rounded-3xl border border-emerald-100/70 bg-white shadow-sm p-6 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: grad }}>
            <div className="absolute inset-[14px] grid place-items-center rounded-full bg-white text-center dark:bg-[#0a160e]">
              <span className="text-xs font-bold">{rows.length}<br />holdings</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {rows.length === 0 && <p className="text-sm text-forest-deep/50 dark:text-mint/50">No holdings yet.</p>}
            {segs.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="font-semibold">{s.label}</span>
                <span className="text-forest-deep/45 dark:text-mint/45">{Math.round((s.to - s.from) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100/70 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="mb-3 text-sm font-bold">Your holdings</p>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-forest-deep/50 dark:text-mint/50">
            You don't own any investments yet. Head to <b>Invest</b> to get started.
          </p>
        ) : (
          <div className="divide-y divide-line dark:divide-white/10">
            {rows.map((r) => (
              <div key={r.h.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold">{r.prod?.name ?? r.h.productId}</p>
                  <p className="text-xs text-forest-deep/50 dark:text-mint/50">{r.h.units.toFixed(4)} units · avg {fmtMoney(r.h.avgBuyPrice, cur)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums">{fmtMoney(r.value, cur)}</p>
                  <p className={`text-xs font-bold tabular-nums ${r.pl >= 0 ? 'text-green-brand' : 'text-red-500'}`}>
                    {r.pl >= 0 ? '+' : '−'}{Math.abs(r.plPct).toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
