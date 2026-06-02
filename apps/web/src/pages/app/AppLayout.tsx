import { NavLink, Outlet, useNavigate, useOutletContext, useLocation, Link } from 'react-router-dom';
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
  user: 'M16 18a4 4 0 0 0-8 0M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7',
  more: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z',
  back: 'M15 18l-6-6 6-6',
};

type Item = { to: string; label: string; d: string; end: boolean; tour?: string };

const nav: Item[] = [
  { to: '/app', label: 'Dashboard', d: I.home, end: true, tour: 'nav-dashboard' },
  { to: '/app/savings', label: 'Savings', d: I.savings, end: false, tour: 'nav-savings' },
  { to: '/app/invest', label: 'Invest', d: I.invest, end: false, tour: 'nav-invest' },
  { to: '/app/portfolio', label: 'Portfolio', d: I.portfolio, end: false, tour: 'nav-portfolio' },
  { to: '/app/stash', label: 'Stash', d: I.stash, end: false },
  { to: '/app/nest', label: 'Nest (kids)', d: I.nest, end: false },
  { to: '/app/groups', label: 'Save with others', d: I.groups, end: false },
  { to: '/app/transactions', label: 'Transactions', d: I.txns, end: false },
  { to: '/app/notifications', label: 'Notifications', d: I.bell, end: false },
  { to: '/app/learn', label: 'Learn', d: I.learn, end: false },
  { to: '/app/referral', label: 'Refer & earn', d: I.gift, end: false },
];

// Bottom-tab-bar primaries (mobile). The rest live in the "More" sheet.
const PRIMARY = ['/app', '/app/savings', '/app/invest', '/app/portfolio'];
const tabs = nav.filter((n) => PRIMARY.includes(n.to));
const moreItems: Item[] = [
  ...nav.filter((n) => !PRIMARY.includes(n.to)),
  { to: '/app/profile', label: 'Profile', d: I.user, end: false },
];

const ALL_TITLES: Item[] = [...nav, { to: '/app/profile', label: 'Profile & settings', d: I.user, end: false }];
function pageTitle(pathname: string): string {
  if (pathname === '/app') return 'Dashboard';
  const m = ALL_TITLES.filter((n) => n.to !== '/app' && pathname.startsWith(n.to)).sort((a, b) => b.to.length - a.to.length)[0];
  return m?.label ?? 'TellaTrust';
}

const TOUR: TourStep[] = [
  { sel: 'nav-dashboard', title: 'Your money, at a glance', body: 'The dashboard shows your balance, net worth, savings and investments — all in one place.' },
  { sel: 'cur-toggle', title: 'Naira or Dollar', body: 'Flip between ₦ and $ anytime. Every figure across the app updates instantly.' },
  { sel: 'nav-savings', title: 'Automate your savings', body: 'Create flexible, fixed or goal plans and let TellaTrust save for you on autopilot.' },
  { sel: 'nav-invest', title: 'Invest with confidence', body: 'Buy into mutual funds and live NGX stocks. Prices tick in real time.' },
  { sel: 'nav-portfolio', title: 'Track your portfolio', body: 'See your holdings, allocation and all-time gains as they grow.' },
  { sel: 'avatar', title: 'Profile, KYC & PIN', body: 'Verify your identity, edit your details, and manage your 4-digit PIN here.' },
  { sel: 'support', title: 'We\'re here to help', body: 'Tap the chat bubble anytime to reach our support assistant.' },
];

function Glyph({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function AppLayout() {
  const { profile, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [cur, setCur] = useState<Cur>('NGN');
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);
  const [tour, setTour] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSub = location.pathname !== '/app';
  const title = pageTitle(location.pathname);
  const initials = profile ? (profile.firstName[0] ?? '') + (profile.lastName[0] ?? '') : 'U';

  // close the More sheet whenever the route changes
  useEffect(() => setMore(false), [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('tt_tour_done')) {
      const t = setTimeout(() => setTour(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (profile) seedWelcome(profile.uid, profile.firstName);
  }, [profile]);

  useEffect(() => {
    const start = () => setTour(true);
    window.addEventListener('tt:start-tour', start);
    return () => window.removeEventListener('tt:start-tour', start);
  }, []);

  const closeTour = () => { setTour(false); localStorage.setItem('tt_tour_done', '1'); };
  const doLogout = async () => { await logout(); navigate('/login'); };
  const goBack = () => navigate(-1);

  return (
    <div className="flex min-h-[100dvh] bg-gradient-to-b from-emerald-50/50 to-white text-forest-deep dark:from-[#07120c] dark:to-[#07120c] dark:text-mint">
      {/* desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-emerald-100/70 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a160e] md:flex">
        <div className="px-2 py-3"><Logo size={30} withWordmark light={theme === 'dark'} /></div>
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
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
              <Glyph d={n.d} className="h-5 w-5" />
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
        {/* top bar */}
        <header className="sticky top-0 z-30 border-b border-emerald-100/70 bg-white/80 px-4 pt-safe backdrop-blur-xl dark:border-white/10 dark:bg-[#0a160e]/80 sm:px-5">
          <div className="flex h-14 items-center justify-between gap-2">
            {/* left: back + title (mobile sub-pages) / greeting */}
            <div className="flex min-w-0 items-center gap-1">
              {isSub && (
                <button onClick={goBack} aria-label="Back" className="-ml-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-forest-deep/80 transition hover:bg-emerald-50 active:scale-95 md:hidden dark:text-mint dark:hover:bg-white/5">
                  <Glyph d={I.back} className="h-6 w-6" />
                </button>
              )}
              {isSub ? (
                <b className="truncate text-base font-bold text-forest-deep dark:text-white md:hidden">{title}</b>
              ) : (
                <p className="truncate text-sm text-forest-deep/60 dark:text-mint/60 md:hidden">
                  Howdy, <b className="text-forest-deep dark:text-white">{profile?.firstName ?? 'there'}</b>
                </p>
              )}
              {/* desktop greeting */}
              <p className="hidden truncate text-sm text-forest-deep/60 dark:text-mint/60 md:block">
                Howdy, <b className="text-forest-deep dark:text-white">{profile?.firstName ?? 'there'}</b>
              </p>
            </div>

            {/* right: actions */}
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-green-700 sm:flex dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                🌱 Seed
              </span>
              <div data-tour="cur-toggle" className="flex rounded-full bg-emerald-50 p-0.5 text-xs font-bold dark:bg-white/5">
                {(['NGN', 'USD'] as Cur[]).map((c) => (
                  <button key={c} onClick={() => setCur(c)} className={`rounded-full px-2.5 py-1 transition sm:px-3 ${cur === c ? 'bg-gradient-to-br from-emerald-400 to-green-brand text-white' : 'text-forest-deep/60 dark:text-mint/60'}`}>
                    <span className="sm:hidden">{c === 'NGN' ? '₦' : '$'}</span>
                    <span className="hidden sm:inline">{c === 'NGN' ? '₦ NGN' : '$ USD'}</span>
                  </button>
                ))}
              </div>
              <button onClick={toggle} aria-label="Toggle theme" className="hidden h-9 w-9 place-items-center rounded-full border border-emerald-100 text-forest-deep/70 transition hover:bg-emerald-50 sm:grid dark:border-white/10 dark:text-mint dark:hover:bg-white/5">
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
          </div>
        </header>

        <main className="flex-1 px-5 pt-5 pb-tabbar sm:px-7 sm:pt-7 md:pb-8">
          <Outlet context={{ cur, setCur } satisfies Ctx} />
        </main>
      </div>

      {/* mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-emerald-100/70 bg-white/90 pb-safe backdrop-blur-xl dark:border-white/10 dark:bg-[#0a160e]/95 md:hidden">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold transition ${
                isActive ? 'text-green-brand' : 'text-forest-deep/50 dark:text-mint/50'
              }`
            }
          >
            <Glyph d={t.d} className="h-[22px] w-[22px]" />
            {t.label}
          </NavLink>
        ))}
        <button onClick={() => setMore(true)} className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold text-forest-deep/50 transition dark:text-mint/50">
          <Glyph d={I.more} className="h-[22px] w-[22px]" />
          More
        </button>
      </nav>

      {/* "More" slide-up sheet (mobile) */}
      {more && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMore(false)} />
          <div className="absolute inset-x-0 bottom-0 animate-fade-up rounded-t-3xl border-t border-emerald-100 bg-white pb-safe dark:border-white/10 dark:bg-[#0a160e]">
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-forest-deep/15 dark:bg-white/15" />
            <div className="grid grid-cols-4 gap-2 p-5">
              {moreItems.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className="flex flex-col items-center gap-1.5 rounded-2xl p-2 text-center text-[11px] font-medium text-forest-deep/80 transition hover:bg-emerald-50 active:scale-95 dark:text-mint/80 dark:hover:bg-white/5"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-green-brand dark:bg-white/5">
                    <Glyph d={n.d} className="h-5 w-5" />
                  </span>
                  {n.label}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-emerald-100 px-5 py-3 dark:border-white/10">
              <button onClick={() => { setMore(false); setTour(true); }} className="flex-1 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-green-brand dark:bg-white/5">
                ✦ Take a tour
              </button>
              <button onClick={toggle} aria-label="Toggle theme" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-100 text-forest-deep/70 dark:border-white/10 dark:text-mint">
                {theme === 'dark' ? '☀' : '☾'}
              </button>
              <button onClick={doLogout} className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-500 dark:bg-red-500/10">
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      <SupportWidget />
      {tour && <Tour steps={TOUR} onClose={closeTour} />}
    </div>
  );
}
