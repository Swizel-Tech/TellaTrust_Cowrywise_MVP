import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell, { Field, PasswordField } from '../components/AuthShell';
import SocialButtons from '../components/SocialButtons';
import { useAuth } from '../lib/auth';

export default function Signup() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await signUp(form.email, form.password, form.firstName, form.lastName);
      navigate('/app');
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start saving and investing in minutes."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-green-brand">Log in</Link></>}
    >
      <SocialButtons />
      <form onSubmit={submit} className="space-y-4">
        {!configured && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            Firebase isn't connected yet — add your keys to <code>apps/web/.env</code> to enable sign-up.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" required value={form.firstName} onChange={set('firstName')} placeholder="Joshua" />
          <Field label="Last name" required value={form.lastName} onChange={set('lastName')} placeholder="Edobor" />
        </div>
        <Field label="Email" type="email" required value={form.email} onChange={set('email')} placeholder="you@email.com" />
        <PasswordField label="Password" required minLength={6} value={form.password} onChange={set('password')} placeholder="At least 6 characters" />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-gradient-to-br from-green-brand to-forest py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-center text-xs text-forest-deep/45 dark:text-mint/45">
          Demo prototype · money is simulated.
        </p>
      </form>
    </AuthShell>
  );
}
