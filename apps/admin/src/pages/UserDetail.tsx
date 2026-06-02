import { Link, useParams } from 'react-router-dom';
import { useStore, transactions } from '../lib/store';
import { can } from '../lib/rbac';
import { Card, Badge } from '../components/ui';
import { fmtNaira, fmtDate, fmtDay } from '../lib/mock';

export default function UserDetail() {
  const { id } = useParams();
  const { users, role, decideKyc, toggleFreeze } = useStore();
  const user = users.find((u) => u.uid === id);

  if (!user) {
    return (
      <Card className="p-8 text-center text-forest-deep/60">
        User not found. <Link to="/users" className="font-semibold text-green-brand">Back to users</Link>
      </Card>
    );
  }

  const tx = transactions.filter((t) => t.userId === user.uid).slice(0, 8);
  const canDecide = can(role, 'kyc.decide');
  const canFreeze = can(role, 'user.freeze');

  return (
    <div className="space-y-6">
      <Link to="/users" className="text-sm font-semibold text-green-brand hover:underline">
        ← Users
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-bright/20 text-xl font-bold text-forest">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <div className="text-lg font-bold">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-forest-deep/60">{user.email}</div>
            </div>
          </div>

          <dl className="mt-5 space-y-2.5 text-sm">
            <Row k="Phone" v={user.phone ?? '—'} />
            <Row k="Date of birth" v={user.dob ?? '—'} />
            <Row k="BVN (last 4)" v={user.bvnLast4 ? `•••• ${user.bvnLast4}` : '—'} />
            <Row k="Risk profile" v={user.riskProfile ?? '—'} />
            <Row k="Joined" v={fmtDay(user.createdAt)} />
            <div className="flex items-center justify-between">
              <dt className="text-forest-deep/50">Account</dt>
              <dd>
                <Badge tone={user.status === 'active' ? 'green' : 'red'}>{user.status}</Badge>
              </dd>
            </div>
          </dl>

          {canFreeze && (
            <button
              onClick={() => toggleFreeze(user.uid)}
              className={`mt-5 w-full rounded-lg px-4 py-2 text-sm font-semibold ${
                user.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-bright/15 text-forest hover:bg-green-bright/25'
              }`}
            >
              {user.status === 'active' ? 'Freeze account' : 'Unfreeze account'}
            </button>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">KYC verification</h2>
              <Badge tone={user.kycStatus === 'verified' ? 'green' : user.kycStatus === 'pending' ? 'amber' : user.kycStatus === 'rejected' ? 'red' : 'gray'}>
                {user.kycStatus}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-forest-deep/60">
              {user.kycStatus === 'verified'
                ? `Verified ${user.kycVerifiedAt ? fmtDate(user.kycVerifiedAt) : ''}.`
                : user.kycStatus === 'pending'
                  ? 'Documents submitted and awaiting review.'
                  : user.kycStatus === 'rejected'
                    ? 'Verification was rejected. User must resubmit.'
                    : 'No KYC submitted yet.'}
            </p>

            {canDecide ? (
              user.kycStatus === 'pending' || user.kycStatus === 'rejected' ? (
                <div className="mt-4 flex gap-3">
                  <button onClick={() => decideKyc(user.uid, 'verified')} className="rounded-lg bg-green-brand px-4 py-2 text-sm font-semibold text-white hover:bg-forest">
                    Approve KYC
                  </button>
                  {user.kycStatus === 'pending' && (
                    <button onClick={() => decideKyc(user.uid, 'rejected')} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                      Reject
                    </button>
                  )}
                </div>
              ) : null
            ) : (
              <p className="mt-4 text-xs font-medium text-forest-deep/40">Your role can view but not decide KYC.</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-3 font-bold">Recent transactions</h2>
            <div className="divide-y divide-line text-sm">
              {tx.length === 0 && <div className="py-3 text-forest-deep/50">No transactions.</div>}
              {tx.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2.5">
                  <span className="font-medium capitalize">{t.type.replace('_', ' ')}</span>
                  <Badge tone={t.status === 'success' ? 'green' : t.status === 'pending' ? 'amber' : 'red'}>{t.status}</Badge>
                  <span className="ml-auto font-semibold">{fmtNaira(t.amount)}</span>
                  <span className="w-32 text-right text-xs text-forest-deep/40">{fmtDate(t.createdAt)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-forest-deep/50">{k}</dt>
      <dd className="font-medium capitalize">{v}</dd>
    </div>
  );
}
