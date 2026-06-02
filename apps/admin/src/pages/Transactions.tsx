import { useMemo, useState } from 'react';
import type { TransactionStatus } from '@tellavault/shared';
import { useStore, transactions } from '../lib/store';
import { Card, Badge, StatCard } from '../components/ui';
import { fmtNaira, fmtDate } from '../lib/mock';

export default function Transactions() {
  const { users } = useStore();
  const [status, setStatus] = useState<'all' | TransactionStatus>('all');
  const [q, setQ] = useState('');

  const nameFor = (uid: string) => {
    const u = users.find((x) => x.uid === uid);
    return u ? `${u.firstName} ${u.lastName}` : uid;
  };

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (status !== 'all' && tx.status !== status) return false;
      if (t && !`${tx.reference} ${tx.type} ${nameFor(tx.userId)}`.toLowerCase().includes(t)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q, users]);

  const success = transactions.filter((t) => t.status === 'success');
  const volume = success.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total volume (sim)" value={fmtNaira(volume)} sub={`${success.length} successful`} />
        <StatCard label="Pending" value={transactions.filter((t) => t.status === 'pending').length.toString()} accent="text-amber-600" />
        <StatCard label="Failed" value={transactions.filter((t) => t.status === 'failed').length.toString()} accent="text-red-600" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ref, type, name…"
            className="w-56 rounded-lg border border-line bg-soft px-3 py-2 text-sm outline-none focus:border-green-brand"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | TransactionStatus)} className="rounded-lg border border-line bg-soft px-3 py-2 text-sm font-medium outline-none focus:border-green-brand">
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <span className="ml-auto text-sm text-forest-deep/50">{rows.length} transactions</span>
        </div>

        <div className="max-h-[62vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-soft text-left text-xs uppercase tracking-wide text-forest-deep/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.slice(0, 200).map((t) => (
                <tr key={t.id} className="hover:bg-soft/60">
                  <td className="px-4 py-2.5 font-mono text-xs text-forest-deep/70">{t.reference}</td>
                  <td className="px-4 py-2.5">{nameFor(t.userId)}</td>
                  <td className="px-4 py-2.5 capitalize">{t.type.replace('_', ' ')}</td>
                  <td className="px-4 py-2.5 font-semibold">{fmtNaira(t.amount)}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={t.status === 'success' ? 'green' : t.status === 'pending' ? 'amber' : 'red'}>{t.status}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-forest-deep/50">{fmtDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
