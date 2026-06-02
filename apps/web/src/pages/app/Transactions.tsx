import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { fmtMoney, type Cur } from '../../lib/money';
import { watchTransactions } from '../../lib/db';
import type { Transaction, TransactionType } from '@tellavault/shared';
import { useAppCtx } from './AppLayout';

const LABEL: Record<TransactionType, string> = {
  deposit: 'Wallet funding',
  withdrawal: 'Withdrawal',
  plan_funding: 'Savings deposit',
  plan_payout: 'Plan payout',
  investment_buy: 'Investment buy',
  investment_sell: 'Investment sell',
  interest: 'Interest earned',
};

const CREDIT: TransactionType[] = ['deposit', 'plan_payout', 'investment_sell', 'interest'];

export function TxnRow({ t, cur }: { t: Transaction; cur: Cur }) {
  const credit = CREDIT.includes(t.type);
  const date = new Date(t.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${credit ? 'bg-green-bright/15 text-green-brand' : 'bg-forest/10 text-forest dark:bg-white/10 dark:text-mint'}`}>
          {credit ? '↓' : '↑'}
        </span>
        <div>
          <p className="text-sm font-semibold">{LABEL[t.type]}</p>
          <p className="text-xs text-forest-deep/50 dark:text-mint/50">{date} · {t.reference}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold tabular-nums ${credit ? 'text-green-brand' : 'text-forest-deep dark:text-white'}`}>
          {credit ? '+' : '−'}{fmtMoney(t.amount, cur)}
        </p>
        <p className="text-xs text-forest-deep/45 dark:text-mint/45">Bal {fmtMoney(t.balanceAfter, cur)}</p>
      </div>
    </div>
  );
}

export default function Transactions() {
  const { user } = useAuth();
  const { cur } = useAppCtx();
  const [txns, setTxns] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    return watchTransactions(user.uid, setTxns);
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold">Transactions</h1>
      <p className="mt-1 text-sm text-forest-deep/60 dark:text-mint/60">Every movement on your wallet, newest first.</p>
      <div className="mt-6 rounded-2xl border border-emerald-100/70 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-white/[0.04]">
        {txns.length === 0 ? (
          <p className="py-10 text-center text-sm text-forest-deep/50 dark:text-mint/50">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-line dark:divide-white/10">
            {txns.map((t) => <TxnRow key={t.id} t={t} cur={cur} />)}
          </div>
        )}
      </div>
    </div>
  );
}
