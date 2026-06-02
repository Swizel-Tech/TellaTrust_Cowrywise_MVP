import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import Logo from './Logo';

/** Split-screen branded shell for the login & signup pages. */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* left brand panel */}
      <div
        className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between"
        style={{ background: 'radial-gradient(120% 100% at 20% 0%, #14502a 0%, #0F2A18 50%, #04100a 100%)' }}
      >
        <div className="pointer-events-none absolute -right-16 top-24 h-80 w-80 rounded-full bg-green-brand/25 blur-3xl animate-blob" />
        <Link to="/" className="relative"><Logo size={36} withWordmark light /></Link>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight">Watch your money <span className="text-green-bright">do more.</span></h2>
          <p className="mt-4 max-w-sm text-mint/80">
            Join over two million people saving and investing the smart way with TellaTrust.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#2FA84F', '#3CC264', '#9FE2B4', '#1C7A3E'].map((c, i) => (
                <span key={i} className="h-9 w-9 rounded-full border-2 border-[#0F2A18]" style={{ background: c }} />
              ))}
            </div>
            <p className="text-sm text-mint/80"><b className="text-white">2M+</b> growing their wealth</p>
          </div>
        </div>
        <p className="relative text-xs text-mint/50">© {new Date().getFullYear()} Swizel Technologies Limited</p>
      </div>

      {/* right form panel */}
      <div className="flex items-center justify-center bg-white px-6 py-12 dark:bg-[#07120c]">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo size={32} withWordmark /></div>
          <h1 className="text-2xl font-extrabold text-forest-deep dark:text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-forest-deep/60 dark:text-mint/60">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <div className="mt-6 text-center text-sm text-forest-deep/60 dark:text-mint/60">{footer}</div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-forest-deep/80 dark:text-mint/80">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm text-forest-deep outline-none ring-green-brand/40 transition focus:border-green-brand focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </label>
  );
}

export function PasswordField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-forest-deep/80 dark:text-mint/80">{label}</span>
      <div className="relative">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          className="w-full rounded-xl border border-line bg-soft px-4 py-2.5 pr-11 text-sm text-forest-deep outline-none ring-green-brand/40 transition focus:border-green-brand focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-deep/40 transition hover:text-forest-deep dark:text-mint/40">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {show
              ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 004.2 4.2M9.9 4.2A10.9 10.9 0 0112 4c6.5 0 10 7 10 7a18 18 0 01-3 3.6M6.1 6.1A18 18 0 002 11s3.5 7 10 7a10.9 10.9 0 003.4-.5" /></>
              : <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>}
          </svg>
        </button>
      </div>
    </label>
  );
}
