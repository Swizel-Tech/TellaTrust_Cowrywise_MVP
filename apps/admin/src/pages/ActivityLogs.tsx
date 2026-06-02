import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { can } from '../lib/rbac';
import { Card, Badge, BarChart } from '../components/ui';
import { fmtDate, type LogCategory } from '../lib/mock';

const CATEGORIES: (LogCategory | 'all')[] = ['all', 'auth', 'transaction', 'kyc', 'account', 'product', 'admin'];
const TONE: Record<LogCategory, string> = {
  auth: 'blue',
  transaction: 'green',
  kyc: 'amber',
  account: 'gray',
  product: 'green',
  admin: 'red',
};

export default function ActivityLogs() {
  const { logs, role } = useStore();
  const [cat, setCat] = useState<LogCategory | 'all'>('all');
  const [q, setQ] = useState('');
  const [days, setDays] = useState(7);
  const canExport = can(role, 'logs.export');

  const filtered = useMemo(() => {
    const cutoff = Date.now() - days * 86_400_000;
    const t = q.trim().toLowerCase();
    return logs.filter((l) => {
      if (l.at < cutoff) return false;
      if (cat !== 'all' && l.category !== cat) return false;
      if (t && !`${l.action} ${l.actor} ${l.target} ${l.city}`.toLowerCase().includes(t)) return false;
      return true;
    });
  }, [logs, cat, q, days]);

  const byCat = useMemo(() => {
    const cats: LogCategory[] = ['auth', 'transaction', 'kyc', 'account', 'product', 'admin'];
    return cats.map((c) => ({ label: c, value: filtered.filter((l) => l.category === c).length }));
  }, [filtered]);

  const exportCsv = () => {
    const header = ['timestamp', 'actor', 'role', 'category', 'action', 'target', 'ip', 'city'];
    const rows = filtered.map((l) => [
      new Date(l.at).toISOString(),
      l.actor,
      l.actorRole,
      l.category,
      l.action,
      l.target,
      l.ip,
      l.city,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tellatrust-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-bold">Events by category</h2>
          <span className="text-xs text-forest-deep/50">{filtered.length} events · last {days}d</span>
        </div>
        <BarChart data={byCat} height={120} />
        <div className="mt-2 flex justify-between text-[11px] capitalize text-forest-deep/50">
          {byCat.map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search action, actor, IP…"
            className="w-56 rounded-lg border border-line bg-soft px-3 py-2 text-sm outline-none focus:border-green-brand"
          />
          <select value={cat} onChange={(e) => setCat(e.target.value as LogCategory | 'all')} className="rounded-lg border border-line bg-soft px-3 py-2 text-sm font-medium capitalize outline-none focus:border-green-brand">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All categories' : c}
              </option>
            ))}
          </select>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-lg border border-line bg-soft px-3 py-2 text-sm font-medium outline-none focus:border-green-brand">
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <div className="ml-auto">
            <button
              onClick={exportCsv}
              disabled={!canExport}
              className="rounded-lg bg-forest-deep px-4 py-2 text-sm font-semibold text-white enabled:hover:bg-forest disabled:opacity-40"
              title={canExport ? 'Download CSV' : 'Your role cannot export'}
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-soft text-left text-xs uppercase tracking-wide text-forest-deep/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">IP · City</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.slice(0, 200).map((l) => (
                <tr key={l.id} className="hover:bg-soft/60">
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-forest-deep/60">{fmtDate(l.at)}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={TONE[l.category]}>{l.category}</Badge>
                  </td>
                  <td className="px-4 py-2.5 font-medium">{l.action}</td>
                  <td className="px-4 py-2.5 text-forest-deep/70">{l.actor}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-forest-deep/50">
                    {l.ip} · {l.city}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
