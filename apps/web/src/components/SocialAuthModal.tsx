import { useState } from 'react';

const GoogleG = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);

export default function SocialAuthModal({
  provider, onCancel, onComplete,
}: { provider: 'google' | 'apple'; onCancel: () => void; onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const account = provider === 'google'
    ? { name: 'Tochukwu Demo', email: 'tella.google.demo@tellatrust.app' }
    : { name: 'Tochukwu Demo', email: 'tella.apple.demo@tellatrust.app' };

  const choose = () => {
    setLoading(true);
    setTimeout(onComplete, 1100);
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      {provider === 'google' ? (
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-6 py-3">
            <svg className="h-6" viewBox="0 0 74 24"><text x="0" y="18" fontFamily="Arial" fontSize="20" fontWeight="500"><tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan></text></svg>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="px-8 py-7 text-center text-gray-800">
            <GoogleG />
            <h2 className="mt-3 text-xl font-medium text-gray-900">Choose an account</h2>
            <p className="text-sm text-gray-500">to continue to <span className="font-medium">TellaTrust</span></p>

            <div className="mt-6 divide-y rounded-xl border text-left">
              <button onClick={choose} disabled={loading} className="flex w-full items-center gap-3 px-4 py-3 transition hover:bg-gray-50">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-sm font-bold text-white">TD</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900">{account.name}</span>
                  <span className="block truncate text-xs text-gray-500">{account.email}</span>
                </span>
                {loading && <span className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />}
              </button>
              <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                <span className="grid h-9 w-9 place-items-center rounded-full border text-gray-400">＋</span> Use another account
              </button>
            </div>
            <p className="mt-6 text-left text-xs leading-relaxed text-gray-500">
              To continue, Google will share your name, email address and profile picture with TellaTrust.
            </p>
            <p className="mt-4 text-[11px] text-gray-400">Simulated Google sign-in · demo only</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-black text-white shadow-2xl">
          <div className="flex items-center justify-between px-6 py-3">
            <span className="text-sm text-white/60">tellatrust.app</span>
            <button onClick={onCancel} className="text-white/50 hover:text-white"></button>
          </div>
          <div className="px-8 py-10 text-center">
            <svg className="mx-auto h-9 w-9" viewBox="0 0 24 24" fill="white"><path d="M16.36 1.43c0 1.14-.42 2.2-1.25 3.06-.99 1.03-2.18 1.62-3.45 1.52a3.5 3.5 0 0 1-.03-.43c0-1.1.48-2.27 1.28-3.08C13.69 1.7 14.96 1.13 16 1c.02.14.36.29.36.43zM20.8 17.1c-.5 1.16-.74 1.67-1.39 2.69-.9 1.43-2.18 3.21-3.76 3.22-1.4.01-1.77-.91-3.67-.9-1.9.01-2.3.92-3.7.9-1.58-.01-2.79-1.62-3.7-3.04-2.52-3.96-2.79-8.6-1.23-11.07 1.1-1.75 2.85-2.78 4.49-2.78 1.67 0 2.72.92 4.1.92 1.34 0 2.15-.92 4.09-.92 1.46 0 3.01.8 4.11 2.17-3.61 1.98-3.02 7.13.16 8.81z" /></svg>
            <h2 className="mt-4 text-2xl font-semibold">Sign in with Apple</h2>
            <p className="mt-2 text-sm text-white/60">Continue to TellaTrust as</p>
            <p className="mt-1 font-medium">{account.email}</p>
            <button onClick={choose} disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90">
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" /> : '􀉪'} Continue
            </button>
            <button onClick={onCancel} className="mt-3 w-full text-sm text-white/50 hover:text-white">Cancel</button>
            <p className="mt-6 text-[11px] text-white/30">Simulated Apple sign-in · demo only</p>
          </div>
        </div>
      )}
    </div>
  );
}
