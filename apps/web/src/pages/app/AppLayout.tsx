import { NavLink, Outlet, useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Logo from '../../components/Logo';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/useTheme';
import type { Cur } from '../../lib/money';
import { seedWelcome } from '../../lib/db';
import SupportWidget from '../../components/SupportWidget';
import Tour, { type TourStep } from '../../components/Tour';

type Ctx = { cur: Cur; setCur: (c: Cur) => void };
export function useAppCtx() {
  return useOutletContext<Ctx>();
}

const I = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  savings: 'M12 3v18M5 8h9a3 3 0 0 1 0 6H7',
  invest: 'M4 19h16M7 16V9M12 16V5M17 16v-4',
  portfolio: 'M12 3v9l8 0a8 8 0 1 0-8 8',
  txns: 'M4 7h16M4 12h16M4 17h10',
  bell: 'M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16zM10 21h4',
  learn: 'M12 4L2 9l10 5 8-4v6M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5',
  gift: 'M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7S10 2 7 4s5 3 5 3M12 7s2-5 5-3-5 3-5 3',
  stash: 'M3 7h18v10H3zM3 10h18M7 14h4',
  nest: 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z',
  groups: 'M16 14a4 4 0 1 0-8 0M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19a4 4 0 0 0-3-3.8M4 19a4 4 0 0 1 3-3.8',
};

const nav = [
  { to: '/app', label: 'Dashboard', d: I.home, end: true, tour: 'nav-dashboard' },
  { to: '/app/savings', label: 'Savings', d: I.savings, end: false, tour: 'nav-savings' },
  { to: '/app/invest', label: 'Invest', d: I.invest, end: false, tour: 'nav-invest' },
  { to: '/app/portfolio', label: 'Portfolio', d: I.portfolio, end: false, tour: 'nav-portfolio' },
  { to: '/app/stash', label: 'Stash', d: I.stash, end: false, tour: '' },
  { to: '/app/nest', label: 'Nest (kids)', d: I.nest, end: false, tour: '' },
  { to: '/app/groups', label: 'Save with others', d: I.groups, end: false, tour: '' },
  { to: '/app/transactions', label: 'Transactions', d: I.txns, end: false, tour: '' },
  { to: '/app/notifications', label: 'Notifications', d: I.bell, end: false, tour: '' },
  { to: '/app/learn', label: 'Learn', d: I.learn, end: false, tour: '' },
  { to: '/app/referral', label: 'Refer & earn', d: I.gift, end: false, tour: '' },
];

const TOUR: TourStep[] = [
  { sel: 'nav-dashboard', title: 'Your money, at a glance', body: 'The dashboard shows your balance, net worth, savings and investments — all in one place.' },
  { sel: 'cur-toggle', title: 'Naira or Dollar', body: 'Flip between ₦ and $ anytime. Every figure across the app updates instantly.' },
  { sel: 'nav-savings', title: 'Automate your savings', body: 'Create flexible, fixed or goal plans and let TellaTrust save for you on autopilot.' },
  { sel: 'nav-invest', title: 'Invest with confidence', body: 'Buy into mutual funds and live NGX stocks. Prices tick in real time.' },
  { sel: 'nav-portfolio', title: 'Track your portfolio', body: 'See your holdings, allocation and all-time gains as they grow.' },
  { sel: 'avatar', title: 'Profile, KYC & PIN', body: 'Verify your identity, edit your details, and manage your 4-digit PIN here.' },
  { sel: 'support', title: 'We\'re here to help', body: 'Tap the chat bubble anytime to reach our support assistant.' },
];

export default function AppLayout() {
  const { profile, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [cur, setCur] = useState<Cur>('NGN');
  const [menu, setMenu] = useState(false);
  const [tour, setTour] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = profile ? (profile.firstName[0] ?? '') + (profile.lastName[0] ?? '') : 'U';

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // first-visit guided tour
  useEffect(() => {
    if (!localStorage.getItem('tt_tour_done')) {
      const t = setTimeout(() => setTour(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  // seed welcome notifications once per user
  useEffect(() => {
    if (profile) seedWelcome(profile.uid, profile.firstName);
  }, [profile]);

  // allow other pages (e.g. Notifications) to launch the tour
  useEffect(() => {
    const start = () => setTour(true);
    window.addEventListener('tt:start-tour', start);
    return () => window.removeEventListener('tt:start-tour', start);
  }, []);

  const closeTour = () => { setTour(false); localStorage.setItem('tt_tour_done', '1'); };

  const doLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-emerald-50/50 to-white text-forest-deep dark:from-[#07120c] dark:to-[#07120c] dark:text-mint">
      {/* sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-emerald-100/70 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a160e] md:flex">
        <div className="px-2 py-3"><Logo size={30} withWordmark light={theme === 'dark'} /></div>
        <nav className="mt-4 flex-1 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-tour={n.tour || undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-400 to-green-brand text-white shadow-md shadow-emerald-500/20'
                    : 'text-forest-deep/70 hover:bg-emerald-50 dark:text-mint/70 dark:hover:bg-white/5'
                }`
              }
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={n.d} />
              </svg>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => setTour(true)} className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-green-brand transition hover:bg-emerald-50 dark:hover:bg-white/5">
          ✦ Take a tour
        </button>
        <Link to="/app/profile" className="rounded-xl px-3 py-2.5 text-sm font-medium text-forest-deep/70 transition hover:bg-emerald-50 dark:text-mint/70 dark:hover:bg-white/5">
          Profile &amp; settings
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-emerald-100/70 bg-white/70 px-5 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a160e]/80">
          <p className="text-sm text-forest-deep/60 dark:text-mint/60">
            Howdy, <b className="text-forest-deep dark:text-white">{profile?.firstName ?? 'there'}</b>
          </p>
          <div className="flex items-center gap-2.5">
            {/* account level */}
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-green-700 sm:flex dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              🌱 Seed
            </span>
            <div data-tour="cur-toggle" className="flex rounded-full bg-emerald-50 p-0.5 text-xs font-bold dark:bg-white/5">
              {(['NGN', 'USD'] as Cur[]).map((c) => (
                <button key={c} onClick={() => setCur(c)} className={`rounded-full px-3 py-1 transition ${cur === c ? 'bg-gradient-to-br from-emerald-400 to-green-brand text-white' : 'text-forest-deep/60 dark:text-mint/60'}`}>
                  {c === 'NGN' ? '₦ NGN' : '$ USD'}
                </button>
              ))}
            </div>
            <button onClick={toggle} aria-label="Toggle theme" className="grid h-9 w-9 place-items-center rounded-full border border-emerald-100 text-forest-deep/70 transition hover:bg-emerald-50 dark:border-white/10 dark:text-mint dark:hover:bg-white/5">
              {theme === 'dark' ? '☀' : '☾'}
            </button>

            <div className="relative" ref={menuRef}>
              <button data-tour="avatar" onClick={() => setMenu((v) => !v)} className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-green-brand text-xs font-bold uppercase text-white ring-2 ring-transparent transition hover:ring-emerald-300/50">
                {initials}
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xl dark:border-white/10 dark:bg-[#0a160e]">
                  <div className="border-b border-emerald-100 px-4 py-3 dark:border-white/10">
                    <p className="text-sm font-bold">{profile?.firstName} {profile?.lastName}</p>
                    <p className="truncate text-xs text-forest-deep/55 dark:text-mint/55">{profile?.email}</p>
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${profile?.kycStatus === 'verified' ? 'bg-emerald-100 text-green-700' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}>
                      {profile?.kycStatus === 'verified' ? '✓ Verified' : 'KYC pending'}
                    </span>
                  </div>
                  <Link to="/app/profile" onClick={() => setMenu(false)} className="block px-4 py-2.5 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-white/5">My profile</Link>
                  <Link to="/app/profile" onClick={() => setMenu(false)} className="block px-4 py-2.5 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-white/5">Settings &amp; PIN</Link>
                  <button onClick={doLogout} className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7">
          <Outlet context={{ cur, setCur } satisfies Ctx} />
        </main>
      </div>

      <SupportWidget />
      {tour && <Tour steps={TOUR} onClose={closeTour} />}
    </div>
  );
}
