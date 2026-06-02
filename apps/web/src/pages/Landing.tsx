import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useTheme } from '../lib/useTheme';
import { fmtMoney, type Cur } from '../lib/money';

/* ----------------------------- tiny icons ----------------------------- */
const Sun = (p: { className?: string }) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const Moon = (p: { className?: string }) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
);
const Globe = (p: { className?: string }) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
  </svg>
);
const Bolt = (p: { className?: string }) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" /></svg>
);
const Chart = (p: { className?: string }) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19h16" /><path d="M7 16V9M12 16V5M17 16v-4" />
  </svg>
);
const Shield = (p: { className?: string }) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" />
  </svg>
);
const XIcon = (p: { className?: string }) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5.3-6.9L4.8 22H1.7l7.8-8.9L1 2h6.9l4.8 6.4zM17.7 20h1.7L7 4H5.2z" /></svg>
);
const Instagram = (p: { className?: string }) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const LinkedIn = (p: { className?: string }) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3.5 8.5h3.9V21H3.5zM10 8.5h3.7v1.7h.1c.5-1 1.8-2 3.7-2 3.9 0 4.6 2.6 4.6 5.9V21h-3.9v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H10z" /></svg>
);
const YouTube = (p: { className?: string }) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.3-.4-4.9a2.5 2.5 0 0 0-1.8-1.8C19.2 5 12 5 12 5s-7.2 0-8.8.3A2.5 2.5 0 0 0 1.4 7.1C1 8.7 1 12 1 12s0 3.3.4 4.9a2.5 2.5 0 0 0 1.8 1.8C4.8 19 12 19 12 19s7.2 0 8.8-.3a2.5 2.5 0 0 0 1.8-1.8C23 15.3 23 12 23 12zm-13 3.2V8.8L15.5 12z" /></svg>
);

/* --------------------------- count-up hook ---------------------------- */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ------------------------------- data --------------------------------- */
const features = [
  { icon: Bolt, title: 'Automated savings', body: 'Create regular, fixed or goal plans and let TellaTrust save for you, earning steady returns on autopilot.' },
  { icon: Chart, title: 'Naira & USD investments', body: 'Access curated mutual funds and stocks, with portfolios tracked beautifully in real time.' },
  { icon: Shield, title: 'Full transparency', body: 'Every transaction and activity is logged, filterable and exportable. Nothing hidden, ever.' },
];

const steps = [
  { n: 1, t: 'Create your account', d: 'Sign up in under a minute with a guided, step-by-step flow.' },
  { n: 2, t: 'Fund your wallet', d: 'Top up instantly and watch your balance update in real time.' },
  { n: 3, t: 'Create a savings plan', d: 'Pick a plan type, set a target and choose your frequency.' },
  { n: 4, t: 'Invest & grow', d: 'Buy into funds or stocks and watch your money do more.' },
];

const NAV = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Security', href: '#security' },
];

// Self-playing states for the hero balance card.
const cards = [
  {
    balance: 284500, change: '+12.4%',
    alloc: [['Savings', 180000], ['Funds', 74000], ['Stocks', 30000]] as [string, number][],
    line: 'M0,95 C40,90 60,70 90,72 C130,75 150,40 190,38 C230,36 260,18 320,8',
    area: 'M0,95 C40,90 60,70 90,72 C130,75 150,40 190,38 C230,36 260,18 320,8 L320,120 L0,120 Z',
    endY: 8,
  },
  {
    balance: 312800, change: '+15.1%',
    alloc: [['Savings', 192000], ['Funds', 86000], ['Stocks', 35000]] as [string, number][],
    line: 'M0,100 C50,98 70,60 100,64 C140,68 160,30 200,26 C240,22 270,12 320,6',
    area: 'M0,100 C50,98 70,60 100,64 C140,68 160,30 200,26 C240,22 270,12 320,6 L320,120 L0,120 Z',
    endY: 6,
  },
  {
    balance: 268900, change: '+9.7%',
    alloc: [['Savings', 170000], ['Funds', 68000], ['Stocks', 31000]] as [string, number][],
    line: 'M0,82 C40,86 70,98 100,90 C140,80 160,58 200,54 C250,46 280,30 320,20',
    area: 'M0,82 C40,86 70,98 100,90 C140,80 160,58 200,54 C250,46 280,30 320,20 L320,120 L0,120 Z',
    endY: 20,
  },
];

/* ============================== component ============================= */
export default function Landing() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState('EN');
  const [cur, setCur] = useState<Cur>('NGN');
  const [idx, setIdx] = useState(0);
  const balance = useCountUp(cards[idx].balance);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % cards.length), 3800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-forest-deep dark:bg-[#07120c] dark:text-mint">
      {/* ============ STICKY GLASS NAV ============ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-line/70 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#07120c]/70'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="#top" className="flex items-center"><Logo size={32} withWordmark light={theme === 'dark'} /></a>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-forest-deep/70 transition hover:bg-forest/5 hover:text-forest-deep dark:text-mint/70 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* language */}
            <label className="hidden items-center gap-1 rounded-full border border-line/70 px-2.5 py-1.5 text-xs font-semibold text-forest-deep/70 sm:flex dark:border-white/10 dark:text-mint/70">
              <Globe className="h-3.5 w-3.5" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="cursor-pointer bg-transparent pr-1 outline-none"
                aria-label="Language"
              >
                <option>EN</option><option>FR</option><option>YO</option><option>HA</option><option>IG</option>
              </select>
            </label>

            {/* theme toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-full border border-line/70 text-forest-deep/80 transition hover:bg-forest/5 dark:border-white/10 dark:text-mint dark:hover:bg-white/5"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 h-[18px] w-[18px]" /> : <Moon className="h-[16px] w-[16px]" />}
            </button>

            <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-forest-deep/80 transition hover:bg-forest/5 sm:block dark:text-mint dark:hover:bg-white/5">
              Log in
            </Link>
            <Link to="/signup" className="rounded-full bg-gradient-to-br from-green-brand to-forest px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-forest/20 transition hover:brightness-110">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section
        id="top"
        className="relative overflow-hidden"
        style={{ background: 'radial-gradient(125% 90% at 80% -10%, #14502a 0%, #0F2A18 45%, #04100a 100%)' }}
      >
        {/* animated blobs + grid */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-green-brand/30 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        {/* floating coins */}
        <Coin className="absolute left-[12%] top-[30%] h-9 w-9 animate-float-slow" />
        <Coin className="absolute right-[14%] bottom-[18%] h-7 w-7 animate-float" />
        <Coin className="absolute left-[42%] top-[14%] h-5 w-5 animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-28">
          {/* copy */}
          <div className="text-center lg:text-left">
            <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-mint backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-bright" /> Save · Invest · Grow
            </span>
            <h1 className="animate-fade-up mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Watch your money <span className="text-shimmer">do more</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-5 max-w-md text-base leading-relaxed text-mint/85 lg:mx-0 sm:text-lg">
              One beautiful app for all your savings and investment needs. Trusted, transparent, and
              built to grow your wealth the smart way.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
              <Link to="/signup" className="group rounded-full bg-green-bright px-8 py-3.5 text-sm font-bold text-ink shadow-xl shadow-black/20 transition hover:brightness-110">
                Start building wealth
                <span className="ml-1.5 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a href="#how" className="rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">
                See how it works
              </a>
            </div>
            {/* trust */}
            <div className="animate-fade-up mt-9 flex items-center justify-center gap-3 lg:justify-start">
              <div className="flex -space-x-2">
                {['#2FA84F', '#3CC264', '#9FE2B4', '#1C7A3E'].map((c, i) => (
                  <span key={i} className="h-8 w-8 rounded-full border-2 border-[#0F2A18]" style={{ background: c }} />
                ))}
              </div>
              <p className="text-sm text-mint/80"><b className="text-white">2M+</b> Nigerians growing their wealth</p>
            </div>
          </div>

          {/* glass app card */}
          <div className="animate-fade-up relative mx-auto w-full max-w-sm [animation-delay:120ms]">
            <div className="glass-dark overflow-hidden rounded-[28px] p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-mint/70">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-bright" /> Total balance
                  </p>
                  <p className="mt-1 text-3xl font-extrabold tabular-nums text-white">{fmtMoney(balance, cur)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex rounded-full bg-white/10 p-0.5 text-[11px] font-bold">
                    {(['NGN', 'USD'] as Cur[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCur(c)}
                        className={`rounded-full px-2.5 py-1 transition ${cur === c ? 'bg-green-bright text-ink' : 'text-mint/70 hover:text-white'}`}
                      >
                        {c === 'NGN' ? '₦' : '$'}
                      </button>
                    ))}
                  </div>
                  <span key={`c${idx}`} className="animate-fade-in rounded-full bg-green-bright/15 px-3 py-1 text-xs font-bold text-green-bright">
                    {cards[idx].change}
                  </span>
                </div>
              </div>
              <GrowthChart d={cards[idx].line} area={cards[idx].area} endY={cards[idx].endY} animKey={idx} />
              <div key={`a${idx}`} className="mt-5 grid grid-cols-3 gap-2">
                {cards[idx].alloc.map(([k, v], j) => (
                  <div
                    key={k}
                    className="animate-fade-up rounded-2xl bg-white/5 p-3 text-center ring-1 ring-white/10"
                    style={{ animationDelay: `${j * 70}ms` }}
                  >
                    <p className="text-[11px] text-mint/60">{k}</p>
                    <p className="mt-0.5 text-sm font-bold text-white">{fmtMoney(v, cur, { compact: true })}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center gap-1.5">
                {cards.map((_, j) => (
                  <span
                    key={j}
                    className={`h-1.5 rounded-full transition-all duration-300 ${j === idx ? 'w-5 bg-green-bright' : 'w-1.5 bg-white/25'}`}
                  />
                ))}
              </div>
            </div>
            {/* floating chip */}
            <div className="absolute -right-4 -top-4 animate-float rounded-2xl bg-green-bright px-4 py-2.5 text-xs font-bold text-ink shadow-xl">
              Interest paid +{fmtMoney(1240, cur)}
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="relative z-10 border-t border-white/10 py-5">
          <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
            <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12 text-sm font-semibold uppercase tracking-wider text-mint/50">
              {marqueeItems.concat(marqueeItems).map((t, i) => (
                <span key={i} className="whitespace-nowrap">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-green-brand">Everything in one place</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight">How would you like to grow?</h2>
          <p className="mx-auto mt-3 max-w-xl text-forest-deep/60 dark:text-mint/60">
            All your wealth-building tools, finally in one beautifully simple app.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group glass animate-fade-up rounded-3xl p-7 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl dark:bg-white/[0.04]"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-green-brand to-forest text-white shadow-lg shadow-forest/20 transition group-hover:scale-110">
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-deep/70 dark:text-mint/70">{f.body}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-green-brand opacity-0 transition group-hover:opacity-100">
                Learn more →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS (inline) ============ */}
      <section id="how" className="relative overflow-hidden bg-soft py-24 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-green-brand">Get started in minutes</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight">How it works</h2>
            <p className="mx-auto mt-3 max-w-xl text-forest-deep/60 dark:text-mint/60">
              Four simple steps from sign-up to growing your money.
            </p>
          </div>

          <div className="relative mt-16">
            {/* connecting line */}
            <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-transparent via-green-brand/40 to-transparent lg:block" />
            <div className="grid gap-8 lg:grid-cols-4">
              {steps.map((s, i) => (
                <div key={s.n} className="animate-fade-up text-center" style={{ animationDelay: `${i * 110}ms` }}>
                  <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-green-bright to-forest text-lg font-extrabold text-white shadow-xl shadow-forest/25 ring-8 ring-soft dark:ring-[#0a160e]">
                    {s.n}
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{s.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-forest-deep/65 dark:text-mint/65">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECURITY / SHOWCASE ============ */}
      <section id="security" className="relative overflow-hidden py-24" style={{ background: 'radial-gradient(120% 100% at 10% 0%, #14502a 0%, #0F2A18 50%, #04100a 100%)' }}>
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-green-brand/20 blur-3xl animate-blob" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div className="text-white">
            <Shield className="h-10 w-10 text-green-bright" />
            <h2 className="mt-5 text-4xl font-extrabold tracking-tight">Built on trust, by design.</h2>
            <p className="mt-4 max-w-md text-mint/80">
              Bank-grade flows, a full append-only activity log, and complete transparency over every
              naira. You stay in control, always.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[['256-bit', 'Encryption'], ['100%', 'Logged activity'], ['24/7', 'Live support']].map(([a, b]) => (
                <div key={b} className="glass-dark rounded-2xl p-4">
                  <p className="text-2xl font-extrabold text-green-bright">{a}</p>
                  <p className="mt-0.5 text-xs text-mint/70">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-dark rounded-3xl p-7">
            <p className="text-xs uppercase tracking-wider text-mint/60">Portfolio growth</p>
            <GrowthChart big />
            <p className="mt-4 text-sm text-mint/70">Estimations based on conservative mutual funds since 2019.</p>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="px-6 py-24">
        <div className="glass relative mx-auto max-w-4xl overflow-hidden rounded-[32px] p-12 text-center dark:bg-white/[0.04]">
          <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-green-brand/20 blur-3xl animate-blob" />
          <h2 className="relative text-4xl font-extrabold tracking-tight sm:text-5xl">Your future won't wait.</h2>
          <p className="relative mt-3 text-forest-deep/60 dark:text-mint/60">Start growing today, it takes a minute.</p>
          <Link to="/signup" className="relative mt-8 inline-block rounded-full bg-gradient-to-br from-green-brand to-forest px-9 py-4 text-sm font-bold text-white shadow-xl shadow-forest/25 transition hover:brightness-110">
            Create your free account
          </Link>
        </div>
      </section>

      {/* ============ RICH FOOTER ============ */}
      <Footer theme={theme} toggle={toggle} lang={lang} setLang={setLang} />
    </div>
  );
}

/* ----------------------------- sub-parts ----------------------------- */
const marqueeItems = ['Regulated & licensed', 'SEC-grade standards', 'Bank-level security', '2M+ savers', 'Naira & USD', 'Mutual funds', 'Stocks', 'Automated savings'];

function Coin({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="#3CC264" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="#9FE2B4" strokeWidth="2" opacity="0.6" />
      <text x="24" y="31" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#06120a" fontFamily="Inter">₦</text>
    </svg>
  );
}

function GrowthChart({
  d = cards[0].line,
  area = cards[0].area,
  endY = cards[0].endY,
  animKey,
  big,
}: {
  d?: string;
  area?: string;
  endY?: number;
  animKey?: number;
  big?: boolean;
}) {
  return (
    <svg viewBox="0 0 320 120" className={`mt-4 w-full ${big ? 'h-40' : 'h-28'}`}>
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3CC264" stopOpacity="0.45" />
          <stop offset="1" stopColor="#3CC264" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#area)" className="transition-all duration-700 ease-out" />
      <path
        key={animKey}
        d={d}
        fill="none" stroke="#3CC264" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="1000" className="animate-draw"
      />
      <circle cx="320" cy={endY} r="4.5" fill="#9FE2B4" className="transition-all duration-700 ease-out" />
    </svg>
  );
}

function Footer({ theme, toggle, lang, setLang }: { theme: string; toggle: () => void; lang: string; setLang: (v: string) => void }) {
  const cols: { h: string; items: string[] }[] = [
    { h: 'Product', items: ['Savings', 'Mutual funds', 'Stocks', 'Sprout for business', 'Kids'] },
    { h: 'Company', items: ['About us', 'Careers', 'Press', 'Ambassadors', 'Blog'] },
    { h: 'Resources', items: ['Help center', 'Security', 'FAQs', 'Glossary', 'Interest estimator'] },
    { h: 'Legal', items: ['Privacy', 'Terms', 'Complaints', 'Vulnerability policy'] },
  ];
  const socials = [
    { I: XIcon, label: 'X' }, { I: Instagram, label: 'Instagram' },
    { I: LinkedIn, label: 'LinkedIn' }, { I: YouTube, label: 'YouTube' },
  ];
  return (
    <footer className="border-t border-line bg-soft pt-16 dark:border-white/10 dark:bg-[#060f0a]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* brand */}
          <div>
            <Logo size={32} withWordmark light={theme === 'dark'} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-forest-deep/60 dark:text-mint/60">
              Save, invest and grow your money the smart way. A Swizel Technologies Limited prototype.
            </p>
            <div className="mt-5 flex gap-2.5">
              {socials.map(({ I, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-line text-forest-deep/70 transition hover:-translate-y-0.5 hover:border-green-brand hover:text-green-brand dark:border-white/10 dark:text-mint/70">
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
            {/* app badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              {['App Store', 'Google Play'].map((s) => (
                <span key={s} className="flex items-center gap-2 rounded-xl bg-forest-deep px-3.5 py-2 text-xs font-semibold text-white dark:bg-white/10">
                  <span className="text-green-bright">▼</span> {s}
                </span>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.h}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest-deep/50 dark:text-mint/50">{c.h}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.items.map((it) => (
                  <li key={it}>
                    <a href="#" className="text-sm text-forest-deep/75 transition hover:text-green-brand dark:text-mint/75">{it}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line py-7 text-sm text-forest-deep/55 dark:border-white/10 dark:text-mint/55 sm:flex-row">
          <p>© {new Date().getFullYear()} TellaTrust · Swizel Technologies Limited. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-semibold dark:border-white/10">
              <Globe className="h-4 w-4" />
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="cursor-pointer bg-transparent outline-none" aria-label="Language">
                <option value="EN">English</option><option value="FR">Français</option>
                <option value="YO">Yorùbá</option><option value="HA">Hausa</option><option value="IG">Igbo</option>
              </select>
            </label>
            <button onClick={toggle} aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-forest-deep/70 transition hover:text-green-brand dark:border-white/10 dark:text-mint">
              {theme === 'dark' ? <Sun className="h-[16px] w-[16px]" /> : <Moon className="h-[15px] w-[15px]" />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
