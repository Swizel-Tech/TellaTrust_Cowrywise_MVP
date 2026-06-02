import { useState } from 'react';
import { useStore } from '../lib/store';
import { can } from '../lib/rbac';
import { Card, Badge } from '../components/ui';
import { fmtDate, type TicketStatus } from '../lib/mock';

const TONE: Record<TicketStatus, string> = { open: 'red', pending: 'amber', resolved: 'green' };

export default function Support() {
  const { tickets, role, replyTicket, setTicketStatus } = useStore();
  const [activeId, setActiveId] = useState<string>(tickets[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const canReply = can(role, 'ticket.reply');

  const active = tickets.find((t) => t.id === activeId) ?? tickets[0];

  const send = () => {
    if (!draft.trim() || !active) return;
    replyTicket(active.id, draft.trim());
    setDraft('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-line p-4 font-bold">
          Inbox <span className="text-sm font-normal text-forest-deep/50">({tickets.filter((t) => t.status !== 'resolved').length} open)</span>
        </div>
        <div className="max-h-[70vh] divide-y divide-line overflow-auto">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`block w-full px-4 py-3 text-left hover:bg-soft ${active?.id === t.id ? 'bg-soft' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{t.subject}</span>
                <Badge tone={TONE[t.status]}>{t.status}</Badge>
              </div>
              <div className="mt-0.5 flex items-center justify-between text-xs text-forest-deep/50">
                <span>{t.userName}</span>
                <span className={t.priority === 'high' ? 'font-semibold text-red-500' : ''}>{t.priority}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {active && (
        <Card className="flex flex-col">
          <div className="flex items-center justify-between border-b border-line p-4">
            <div>
              <div className="font-bold">{active.subject}</div>
              <div className="text-xs text-forest-deep/50">{active.userName} · ticket {active.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={TONE[active.status]}>{active.status}</Badge>
              {canReply && active.status !== 'resolved' && (
                <button onClick={() => setTicketStatus(active.id, 'resolved')} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-soft">
                  Mark resolved
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-auto p-5">
            {active.messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.from === 'agent' ? 'bg-green-brand text-white' : 'bg-soft text-forest-deep'}`}>
                  <div>{m.body}</div>
                  <div className={`mt-1 text-[10px] ${m.from === 'agent' ? 'text-white/70' : 'text-forest-deep/40'}`}>{fmtDate(m.at)}</div>
                </div>
              </div>
            ))}
          </div>

          {canReply ? (
            <div className="flex items-center gap-2 border-t border-line p-4">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a reply…"
                className="flex-1 rounded-lg border border-line bg-soft px-3 py-2 text-sm outline-none focus:border-green-brand"
              />
              <button onClick={send} className="rounded-lg bg-green-brand px-4 py-2 text-sm font-semibold text-white hover:bg-forest">
                Send
              </button>
            </div>
          ) : (
            <div className="border-t border-line p-4 text-xs text-forest-deep/40">Your role can read tickets but not reply.</div>
          )}
        </Card>
      )}
    </div>
  );
}
