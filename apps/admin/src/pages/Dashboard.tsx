import { Link } from 'react-router-dom';
import { useStore, transactions } from '../lib/store';
import { Card, StatCard, BarChart, Badge, Donut } from '../components/ui';
import { fmtNaira, fmtDate } from '../lib/mock';

const DAY = 86_400_000;

export default function Dashboard() {
  const { users, logs, tickets } = useStore();

  const verified = users.filter((u) => u.kycStatus === 'verified').length;
  const pendingKyc = users.filter((u) => u.kycStatus === 'pending').length;
  const volume = transactions.filter((t) => t.status === 'success').reduce((s, t) => s + t.amount, 0);
  const openTickets = tickets.filter((t) => t.status !== 'resolved').length;

  // last 7 days transaction volume
  const now = Date.now();
  const byDay = Array.from({ length: 7 }, (_, i) => {
    const start = now - (6 - i) * DAY;
    const label = new Date(start).toLocaleDateString('en-NG', { weekday: 'short' });
    const value = transactions
      .filter((t) => t.createdAt >= start && t.createdAt < start + DAY && t.status === 'success')
      .reduce((s, t) => s + t.amount, 0);
    return { label, value };
  });

  const kycSeg = [
    { label: 'Verified', value: verified, color: '#2FA84F' },
    { label: 'Pending', value: pendingKyc, color: '#f59e0b' },
    { label: 'None', value: users.filter((u) => u.kycStatus === 'none').length, color: '#cbd5e1' },
    { label: 'Rejected', value: users.filter((u) => u.kycStatus === 'rejected').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={users.length.toString()} sub="+3 this week" accent="text-forest" />
        <StatCard label="KYC verified" value={`${Math.round((verified / users.length) * 100)}%`} sub={`${verified} of ${users.length}`} />
        <StatCard label="Tx volume (sim)" value={fmtNaira(volume)} sub="all-time, successful" />
        <StatCard label="Open tickets" value={openTickets.toString()} sub={`${pendingKyc} KYC awaiting`} accent="text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="font-bold">Transaction volume</h2>
            <span className="text-xs text-forest-deep/50">last 7 days</span>
          </div>
          <BarChart data={byDay} />
          <div className="mt-2 flex justify-between text-[11px] text-forest-deep/50">
            {byDay.map((d) => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-bold">KYC status</h2>
          <div className="flex items-center gap-4">
            <Donut segments={kycSeg} />
            <div className="space-y-1.5 text-sm">
              {kycSeg.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-forest-deep/70">{s.label}</span>
                  <span className="ml-auto font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Recent activity</h2>
          <Link to="/logs" className="text-sm font-semibold text-green-brand hover:underline">
            View all logs →
          </Link>
        </div>
        <div className="divide-y divide-line">
          {logs.slice(0, 6).map((l) => (
            <div key={l.id} className="flex items-center gap-3 py-2.5 text-sm">
              <Badge tone={l.category === 'kyc' ? 'green' : l.category === 'admin' ? 'blue' : 'gray'}>{l.category}</Badge>
              <span className="font-medium">{l.action}</span>
              <span className="text-forest-deep/50">· {l.actor}</span>
              <span className="ml-auto text-xs text-forest-deep/40">{fmtDate(l.at)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
