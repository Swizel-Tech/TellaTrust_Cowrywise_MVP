import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { KycStatus } from '@tellavault/shared';
import { useStore } from '../lib/store';
import { Card, Badge } from '../components/ui';
import { fmtDay } from '../lib/mock';

const KYC_TONE: Record<KycStatus, string> = { verified: 'green', pending: 'amber', rejected: 'red', none: 'gray' };

export default function Users() {
  const { users } = useStore();
  const [q, setQ] = useState('');
  const [kyc, setKyc] = useState<'all' | KycStatus>('all');

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return users.filter((u) => {
      const matchQ = !t || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(t);
      const matchK = kyc === 'all' || u.kycStatus === kyc;
      return matchQ && matchK;
    });
  }, [users, q, kyc]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email…"
          className="w-64 rounded-lg border border-line bg-soft px-3 py-2 text-sm outline-none focus:border-green-brand"
        />
        <select
          value={kyc}
          onChange={(e) => setKyc(e.target.value as 'all' | KycStatus)}
          className="rounded-lg border border-line bg-soft px-3 py-2 text-sm font-medium outline-none focus:border-green-brand"
        >
          <option value="all">All KYC</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="none">None</option>
        </select>
        <span className="ml-auto text-sm text-forest-deep/50">{rows.length} users</span>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-soft text-left text-xs uppercase tracking-wide text-forest-deep/50">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">KYC</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Joined</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((u) => (
            <tr key={u.uid} className="hover:bg-soft/60">
              <td className="px-4 py-3 font-semibold">
                {u.firstName} {u.lastName}
              </td>
              <td className="px-4 py-3 text-forest-deep/70">{u.email}</td>
              <td className="px-4 py-3">
                <Badge tone={KYC_TONE[u.kycStatus]}>{u.kycStatus}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={u.status === 'active' ? 'green' : 'red'}>{u.status}</Badge>
              </td>
              <td className="px-4 py-3 text-forest-deep/60">{fmtDay(u.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <Link to={`/users/${u.uid}`} className="font-semibold text-green-brand hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
