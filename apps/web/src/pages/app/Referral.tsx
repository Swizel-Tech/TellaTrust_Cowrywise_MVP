import { useState } from 'react';
import { useAuth } from '../../lib/auth';

export default function Referral() {
  const { user } = useAuth();
  const code = ('TT' + (user?.uid ?? 'GUEST').slice(0, 6)).toUpperCase();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Refer &amp; earn</h1>
        <p className="mt-1 text-sm text-forest-deep/60 dark:text-mint/60">Invite friends and you both enjoy fee waivers.</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <p className="text-sm font-semibold text-white/80">Your referral code</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="rounded-2xl bg-white/20 px-5 py-3 text-2xl font-extrabold tracking-widest backdrop-blur">{code}</span>
          <button onClick={copy} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-700 transition hover:brightness-95">
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <p className="mt-4 max-w-md text-sm text-white/85">
          Enjoy zero fees on Naira investments when friends sign up and save or invest at least ₦5,000 with your code.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[['Friends joined', '0'], ['Pending', '0'], ['Rewards earned', '₦0']].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-white p-5 text-center dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-wide text-forest-deep/50 dark:text-mint/50">{k}</p>
            <p className="mt-1 text-2xl font-extrabold">{v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {['Share on WhatsApp', 'Share on X', 'Share on Facebook'].map((s) => (
          <button key={s} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-forest-deep transition hover:bg-soft dark:border-white/10 dark:bg-white/5 dark:text-mint">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
