import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { fmtMoney } from '../../lib/money';
import { contributeGroup, createGroup, watchGroups, type Group } from '../../lib/db';
import { useAppCtx } from './AppLayout';

const EMOJIS = ['💞', '⚽', '🏀', '🏠', '✈️', '🎓', '🎉', '💍'];
const COLORS = ['from-rose-400 to-pink-600', 'from-emerald-400 to-green-600', 'from-sky-400 to-blue-600', 'from-violet-400 to-fuchsia-600', 'from-amber-400 to-orange-600'];

export default function Groups() {
  const { user, profile } = useAuth();
  const { cur } = useAppCtx();
  const [groups, setGroups] = useState<Group[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ name: '', emoji: EMOJIS[0], target: 200000, initial: 10000 });
  const [contrib, setContrib] = useState<{ g: Group; amt: number } | null>(null);
  const verified = profile?.kycStatus === 'verified';

  useEffect(() => {
    if (!user) return;
    return watchGroups(user.uid, setGroups);
  }, [user]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErr(''); setBusy(true);
    try { await createGroup(user.uid, f.name, f.emoji, f.target, f.initial, profile?.firstName ?? 'You'); setOpen(false); setF({ ...f, name: '' }); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Could not create group.'); }
    finally { setBusy(false); }
  };

  const give = async () => {
    if (!user || !contrib) return;
    setBusy(true);
    try { await contributeGroup(user.uid, contrib.g.id, contrib.amt); setContrib(null); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Save with others</h1>
          <p className="mt-1 text-sm text-forest-deep/60 dark:text-mint/60">Pool money towards a shared goal with friends and family.</p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="rounded-full bg-gradient-to-br from-emerald-400 to-green-brand px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:brightness-110">
          {open ? 'Close' : '+ New group'}
        </button>
      </div>

      {open && (
        verified ? (
          <form onSubmit={create} className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-2">
            <label className="sm:col-span-2 block text-sm font-semibold">Group name
              <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Detty December, Family Vacation"
                className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white" />
            </label>
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-sm font-semibold">Icon</p>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button type="button" key={e} onClick={() => setF({ ...f, emoji: e })}
                    className={`grid h-10 w-10 place-items-center rounded-xl text-lg transition ${f.emoji === e ? 'bg-gradient-to-br from-emerald-400 to-green-brand' : 'bg-emerald-50 dark:bg-white/5'}`}>{e}</button>
                ))}
              </div>
            </div>
            <label className="block text-sm font-semibold">Target (₦)
              <input type="number" min={1000} value={f.target} onChange={(e) => setF({ ...f, target: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white" />
            </label>
            <label className="block text-sm font-semibold">Your first deposit (₦)
              <input type="number" min={0} value={f.initial} onChange={(e) => setF({ ...f, initial: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm font-normal outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white" />
            </label>
            {err && <p className="sm:col-span-2 text-sm text-red-500">{err}</p>}
            <button type="submit" disabled={busy} className="sm:col-span-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-brand py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60">
              {busy ? 'Creating…' : 'Create group'}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            Verify your identity first. Head to <Link to="/app/profile" className="font-bold underline">Profile</Link>.
          </div>
        )
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {groups.length === 0 && !open && (
          <p className="sm:col-span-2 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 py-12 text-center text-sm text-forest-deep/50 dark:border-white/10 dark:bg-white/[0.02] dark:text-mint/50">
            No groups yet. Start one and invite others to chip in.
          </p>
        )}
        {groups.map((g, i) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          const grad = COLORS[i % COLORS.length];
          return (
            <div key={g.id} className="overflow-hidden rounded-2xl border border-emerald-100/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className={`flex items-center gap-3 bg-gradient-to-br ${grad} p-4 text-white`}>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/25 text-xl">{g.emoji}</span>
                <div>
                  <p className="font-bold">{g.name}</p>
                  <p className="text-xs text-white/85">{g.members.length} members</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-2xl font-extrabold tabular-nums">{fmtMoney(g.current, cur)}</p>
                <p className="text-xs text-forest-deep/50 dark:text-mint/50">of {fmtMoney(g.target, cur)} goal</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-50 dark:bg-white/10">
                  <div className={`h-full rounded-full bg-gradient-to-r ${grad}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {g.members.slice(0, 4).map((m, j) => (
                      <span key={j} title={m} className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-green-600 text-[10px] font-bold uppercase text-white dark:border-[#0a160e]">{m[0]}</span>
                    ))}
                  </div>
                  <button onClick={() => setContrib({ g, amt: 5000 })} className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-green-700 transition hover:bg-emerald-100 dark:bg-white/5 dark:text-mint">Contribute</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {contrib && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setContrib(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-6 dark:border-white/10 dark:bg-[#0a160e]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Contribute to {contrib.g.emoji} {contrib.g.name}</h3>
            <input type="number" min={100} value={contrib.amt} onChange={(e) => setContrib({ ...contrib, amt: Number(e.target.value) })}
              className="mt-4 w-full rounded-xl border border-line bg-soft px-4 py-2.5 text-sm outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <button onClick={give} disabled={busy} className="mt-4 w-full rounded-xl bg-gradient-to-br from-emerald-400 to-green-brand py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60">
              {busy ? 'Processing…' : `Add ${fmtMoney(contrib.amt, cur)}`}
            </button>
            <button onClick={() => setContrib(null)} className="mt-2 w-full rounded-xl py-2 text-sm font-semibold text-forest-deep/60 dark:text-mint/60">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
