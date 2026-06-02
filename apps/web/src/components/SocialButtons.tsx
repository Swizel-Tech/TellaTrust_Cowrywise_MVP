import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import SocialAuthModal from './SocialAuthModal';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);
const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.36 1.43c0 1.14-.42 2.2-1.25 3.06-.99 1.03-2.18 1.62-3.45 1.52a3.5 3.5 0 0 1-.03-.43c0-1.1.48-2.27 1.28-3.08C13.69 1.7 14.96 1.13 16 1c.02.14.36.29.36.43zM20.8 17.1c-.5 1.16-.74 1.67-1.39 2.69-.9 1.43-2.18 3.21-3.76 3.22-1.4.01-1.77-.91-3.67-.9-1.9.01-2.3.92-3.7.9-1.58-.01-2.79-1.62-3.7-3.04-2.52-3.96-2.79-8.6-1.23-11.07 1.1-1.75 2.85-2.78 4.49-2.78 1.67 0 2.72.92 4.1.92 1.34 0 2.15-.92 4.09-.92 1.46 0 3.01.8 4.11 2.17-3.61 1.98-3.02 7.13.16 8.81z" />
  </svg>
);

export default function SocialButtons() {
  const { signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState<'google' | 'apple' | null>(null);

  const complete = async () => {
    const provider = modal;
    setModal(null);
    if (!provider) return;
    try {
      await signInWithProvider(provider);
      navigate('/app');
    } catch { /* stay on page */ }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setModal('google')}
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white py-2.5 text-sm font-semibold text-forest-deep transition hover:bg-soft dark:border-white/15 dark:bg-white/5 dark:text-white">
          <GoogleIcon /> Google
        </button>
        <button onClick={() => setModal('apple')}
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white py-2.5 text-sm font-semibold text-forest-deep transition hover:bg-soft dark:border-white/15 dark:bg-white/5 dark:text-white">
          <AppleIcon /> Apple
        </button>
      </div>

      {modal && <SocialAuthModal provider={modal} onCancel={() => setModal(null)} onComplete={complete} />}

      <div className="my-5 flex items-center gap-3 text-xs text-forest-deep/40 dark:text-mint/40">
        <span className="h-px flex-1 bg-line dark:bg-white/10" /> or use email <span className="h-px flex-1 bg-line dark:bg-white/10" />
      </div>
    </>
  );
}
