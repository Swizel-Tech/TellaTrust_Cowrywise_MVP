// Currency formatting for TellaTrust. Balances are stored in Naira (base);
// USD is a demo conversion for display only.

export type Cur = 'NGN' | 'USD';

export const FX_RATE = 1600; // demo rate: ₦1,600 = $1
export const CUR_SYMBOL: Record<Cur, string> = { NGN: '₦', USD: '$' };

const THIN = ' '; // hair space so ₦ doesn't collide with the digits

export function fmtMoney(naira: number, cur: Cur = 'NGN', opts: { compact?: boolean } = {}): string {
  const sym = CUR_SYMBOL[cur];
  const v = cur === 'USD' ? naira / FX_RATE : naira;
  if (opts.compact) {
    if (v >= 1_000_000) return sym + THIN + (v / 1_000_000).toFixed(1) + 'm';
    if (v >= 1000) return sym + THIN + Math.round(v / 1000) + 'k';
    return sym + THIN + Math.round(v);
  }
  return sym + THIN + Math.round(v).toLocaleString();
}
