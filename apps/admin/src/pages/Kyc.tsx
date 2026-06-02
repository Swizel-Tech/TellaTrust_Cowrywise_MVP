import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { can } from '../lib/rbac';
import { Card, Badge, StatCard } from '../components/ui';
import { fmtDay } from '../lib/mock';

export default function Kyc() {
  const { users, role, decideKyc } = useStore();
  const queue = users.filter((u) => u.kycStatus === 'pending');
  const canDecide = can(role, 'kyc.decide');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting review" value={queue.length.toString()} accent="text-amber-600" sub="pending KYC" />
        <StatCard label="Verified" value={users.filter((u) => u.kycStatus === 'verified').length.toString()} />
        <StatCard label="Rejected" value={users.filter((u) => u.kycStatus === 'rejected').length.toString()} accent="text-red-600" />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line p-4 font-bold">KYC review queue</div>
        {queue.length === 0 ? (
          <div className="p-8 text-center text-forest-deep/50">Queue is clear — no pending verifications. 🎉</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-soft text-left text-xs uppercase tracking-wide text-forest-deep/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">DOB</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Documents</th>
                <th className="px-4 py-3 text-right font-semibold">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {queue.map((u) => (
                <tr key={u.uid} className="hover:bg-soft/60">
                  <td className="px-4 py-3">
                    <Link to={`/users/${u.uid}`} className="font-semibold text-forest-deep hover:underline">
                      {u.firstName} {u.lastName}
                    </Link>
                    <div className="text-xs text-forest-deep/50">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 text-forest-deep/70">{u.dob}</td>
                  <td className="px-4 py-3 text-forest-deep/60">{fmtDay(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge tone="blue">ID card</Badge> <Badge tone="blue">Selfie</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {canDecide ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => decideKyc(u.uid, 'verified')} className="rounded-lg bg-green-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest">
                          Approve
                        </button>
                        <button onClick={() => decideKyc(u.uid, 'rejected')} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-forest-deep/40">View only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
