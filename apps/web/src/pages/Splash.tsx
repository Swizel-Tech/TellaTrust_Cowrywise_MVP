import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

interface Slide {
  key: string;
  bg: string;
  icon: JSX.Element;
  title: string;
  sub: string;
}

const CoinIcon = (
  <svg width="44" height="44" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="none" stroke="#eafff0" strokeWidth="2" />
    <text
      x="12"
      y="16.5"
      fontSize="11"
      fill="#eafff0"
      textAnchor="middle"
      fontWeight="bold"
      fontFamily="Inter, sans-serif"
    >
      ₦
    </text>
  </svg>
);
const BarsIcon = (
  <svg width="44" height="44" viewBox="0 0 24 24">
    <rect x="3" y="13" width="4" height="8" fill="#eafff0" />
    <rect x="10" y="8" width="4" height="13" fill="#eafff0" />
    <rect x="17" y="4" width="4" height="17" fill="#eafff0" />
  </svg>
);
const LockIcon = (
  <svg width="42" height="42" viewBox="0 0 24 24">
    <rect x="5" y="10" width="14" height="11" rx="2" fill="#eafff0" />
    <path d="M8 10 V7 a4 4 0 0 1 8 0 V10" fill="none" stroke="#eafff0" strokeWidth="2" />
  </svg>
);

const slides: Slide[] = [
  {
    key: 'brand',
    bg: 'linear-gradient(160deg,#000,#0F2A18)',
    icon: <Logo size={56} />,
    title: 'TellaTrust',
    sub: 'Save · Invest · Grow',
  },
  {
    key: 'save',
    bg: 'linear-gradient(160deg,#0F2A18,#1C7A3E)',
    icon: CoinIcon,
    title: 'Save automatically',
    sub: 'Set a goal, automate deposits, and watch it grow with steady returns.',
  },
  {
    key: 'invest',
    bg: 'linear-gradient(160deg,#13402a,#2FA84F)',
    icon: BarsIcon,
    title: 'Invest with clarity',
    sub: 'Mutual funds and stocks, tracked in real time, no guesswork.',
  },
  {
    key: 'trust',
    bg: 'linear-gradient(160deg,#0F2A18,#000)',
    icon: LockIcon,
    title: 'Built on trust',
    sub: 'Bank-grade flows, full activity logs, and you in control.',
  },
];

export default function Splash() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const last = i === slides.length - 1;

  const finish = () => {
    localStorage.setItem('tv_splash_seen', '1');
    // In the installed app, go straight to login after the splash sequence.
    navigate('/login');
  };
  const next = () => (last ? finish() : setI((v) => v + 1));

  const slide = slides[i];

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6 text-center text-mint"
      style={{ background: slide.bg }}
    >
      <button
        onClick={finish}
        className="absolute right-5 text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white"
        style={{ top: 'calc(1.25rem + env(safe-area-inset-top))' }}
      >
        Skip
      </button>

      <div key={slide.key} className="animate-fade-up flex flex-col items-center">
        <div className="mb-5">{slide.icon}</div>
        <h1 className="text-3xl font-extrabold text-white">{slide.title}</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-mint/90">{slide.sub}</p>
      </div>

      <div className="absolute flex gap-2" style={{ bottom: 'calc(6.5rem + env(safe-area-inset-bottom))' }}>
        {slides.map((s, idx) => (
          <span
            key={s.key}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? 'w-6 bg-green-bright' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>

      <button
        onClick={next}
        className="absolute rounded-full bg-green-bright px-10 py-3 text-sm font-bold text-ink shadow-lg transition hover:brightness-110"
        style={{ bottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}
      >
        {last ? 'Get started' : 'Next'}
      </button>
    </div>
  );
}
