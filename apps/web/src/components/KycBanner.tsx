import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/** Amber prompt shown when the signed-in user hasn't completed KYC. */
export default function KycBanner() {
  const { profile } = useAuth();
  if (!profile || profile.kycStatus === 'verified') return null;
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300">!</span>
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <b>Verify your identity</b> to fund your wallet and start investing. It takes a minute.
        </p>
      </div>
      <Link to="/app/profile" className="shrink-0 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:brightness-105">
        Complete KYC →
      </Link>
    </div>
  );
}
