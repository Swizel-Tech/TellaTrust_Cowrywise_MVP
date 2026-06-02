import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '@tellavault/shared';
import { useStore } from '../lib/store';
import { ADMIN_ROLES, ROLE_LABELS, navFor } from '../lib/rbac';
import { Icon } from './ui';

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 120 120">
      <g transform="rotate(-22 60 60)">
        <rect x="40" y="16" width="9" height="88" rx="4.5" fill="#3cc264" />
        <rect x="55" y="12" width="9" height="96" rx="4.5" fill="#43cf6c" />
        <rect x="70" y="16" width="9" height="88" rx="4.5" fill="#49d06f" />
      </g>
    </svg>
  );
}

export default function Layout() {
  const { role, setRole } = useStore();
  const items = navFor(role);
  const loc = useLocation();
  const current = items.find((n) => loc.pathname === n.path || (n.path !== '/' && loc.pathname.startsWith(n.path)));

  return (
    <div className="flex min-h-screen bg-soft text-forest-deep">
      <aside className="sticky top-0 flex h-screen w-60 flex-col bg-forest-deep text-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <Logo />
          <span className="text-lg font-extrabold">
            Tella<span className="text-green-bright">Trust</span>
          </span>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {items.map((n) => (
            <NavLink
              key={n.path}
              to={n.path}
              end={n.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-white/15 text-white' : 'text-mint/80 hover:bg-white/10'
                }`
              }
            >
              <Icon name={n.icon} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-[11px] leading-relaxed text-mint/60">
          Swizel Technologies Ltd
          <br />
          Admin console · demo
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/90 px-8 py-4 backdrop-blur">
          <h1 className="text-lg font-bold">{current?.label ?? 'Admin'}</h1>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-forest-deep/50">Viewing as</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-lg border border-line bg-soft px-3 py-1.5 font-semibold outline-none focus:border-green-brand"
            >
              {ADMIN_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
        </header>
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
