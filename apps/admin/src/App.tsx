import { useState } from 'react';
import { ROLE_LABELS, type Role } from '@tellavault/shared';

// Which roles may see each nav item (mirrors the RBAC model in the plan).
const NAV: { label: string; roles: Role[] }[] = [
  { label: 'Dashboard', roles: ['support', 'finance', 'compliance', 'admin', 'super_admin'] },
  { label: 'Users', roles: ['support', 'compliance', 'admin', 'super_admin'] },
  { label: 'Transactions', roles: ['finance', 'admin', 'super_admin'] },
  { label: 'KYC review', roles: ['compliance', 'admin', 'super_admin'] },
  { label: 'Products', roles: ['admin', 'super_admin'] },
  { label: 'Support inbox', roles: ['support', 'admin', 'super_admin'] },
  { label: 'Activity logs', roles: ['support', 'finance', 'compliance', 'admin', 'super_admin'] },
  { label: 'Admins & roles', roles: ['super_admin'] },
];

const ALL_ROLES: Role[] = ['support', 'finance', 'compliance', 'admin', 'super_admin'];

export default function App() {
  // Demo role switcher — in production this comes from the signed-in user's custom claim.
  const [role, setRole] = useState<Role>('super_admin');
  const visible = NAV.filter((n) => n.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-soft text-forest-deep">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-forest-deep text-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <svg width="28" height="28" viewBox="0 0 120 120">
            <g transform="rotate(-22 60 60)">
              <rect x="40" y="16" width="9" height="88" rx="4.5" fill="#3cc264" />
              <rect x="55" y="12" width="9" height="96" rx="4.5" fill="#43cf6c" />
              <rect x="70" y="16" width="9" height="88" rx="4.5" fill="#49d06f" />
            </g>
          </svg>
          <span className="text-lg font-extrabold">
            Tella<span className="text-green-bright">Trust</span>
          </span>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {visible.map((n) => (
            <a
              key={n.label}
              href="#"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-mint/90 hover:bg-white/10"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="px-5 py-4 text-xs text-mint/60">Swizel Technologies Limited</div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-line bg-white px-8 py-4">
          <h1 className="text-lg font-bold">Admin Console</h1>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-forest-deep/60">Viewing as</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-lg border border-line bg-soft px-3 py-1.5 font-semibold"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className="p-8">
          <div className="rounded-2xl border border-line bg-white p-8">
            <h2 className="text-xl font-bold">Welcome to the TellaTrust admin shell</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-deep/70">
              This is the role-gated console scaffold. The sidebar above shows only the sections the
              selected role can access — switch roles to see RBAC in action. Real screens (user
              management, transactions, KYC, products, support inbox and the filterable activity
              logs) are built out in Phase 5.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {['Total users', 'Active plans', 'Logged events (24h)'].map((k) => (
                <div key={k} className="rounded-xl bg-soft p-5">
                  <div className="text-xs uppercase tracking-wide text-forest-deep/50">{k}</div>
                  <div className="mt-1 text-2xl font-extrabold text-forest">—</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
