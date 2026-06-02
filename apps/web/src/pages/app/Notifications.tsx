import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { markNotificationRead, watchNotifications } from '../../lib/db';
import type { AppNotification } from '@tellavault/shared';

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) return;
    return watchNotifications(user.uid, setItems);
  }, [user]);

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Notifications</h1>
        {unread > 0 && <span className="rounded-full bg-green-brand px-3 py-1 text-xs font-bold text-white">{unread} unread</span>}
      </div>

      {/* welcome + tour */}
      <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-500/20">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-xl" />
        <p className="text-lg font-extrabold">Welcome to TellaTrust! 🎉</p>
        <p className="mt-1 max-w-md text-sm text-white/90">Get the most out of your account — take a 60-second tour of the main features.</p>
        <button onClick={() => window.dispatchEvent(new Event('tt:start-tour'))} className="mt-3 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-green-700 transition hover:brightness-95">
          ✦ Take the tour
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-forest-deep/50 dark:border-white/10 dark:text-mint/50">
            You're all caught up.
          </p>
        )}
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read && markNotificationRead(n.id)}
            className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
              n.read
                ? 'border-emerald-100/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]'
                : 'border-green-brand/30 bg-green-bright/5 dark:border-green-brand/30'
            }`}
          >
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-green-brand'}`} />
            <div>
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-sm text-forest-deep/65 dark:text-mint/65">{n.body}</p>
              <p className="mt-1 text-xs text-forest-deep/40 dark:text-mint/40">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
