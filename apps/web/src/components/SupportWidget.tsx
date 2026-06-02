import { useEffect, useRef, useState } from 'react';

interface Msg { from: 'me' | 'agent'; text: string; }

const QUICK = ['How do I fund my wallet?', 'Verify my identity', 'How do investments work?'];

function reply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('fund') || t.includes('deposit') || t.includes('add cash')) return 'To fund your wallet, go to Dashboard → Fund wallet. You\'ll need to complete KYC first. Funding is simulated in this demo.';
  if (t.includes('kyc') || t.includes('verify') || t.includes('bvn')) return 'Open Profile → Identity verification, enter any 11-digit BVN and your date of birth. It verifies instantly in the demo.';
  if (t.includes('invest') || t.includes('stock') || t.includes('fund')) return 'Head to Invest to browse mutual funds and live NGX stocks. Pick one, enter an amount, and confirm — it shows up in your Portfolio.';
  if (t.includes('withdraw')) return 'Withdrawals to bank are coming in the next build. For now you can move money between your wallet, savings and investments.';
  if (t.includes('pin')) return 'Your 4-digit PIN unlocks the app each session. You set it the first time you sign in. Forgot it? Log out and back in to reset.';
  if (t.includes('hi') || t.includes('hello') || t.includes('hey')) return 'Hi there! 👋 I\'m Tella, your support assistant. How can I help today?';
  return 'Thanks for reaching out! A human agent will follow up shortly. Meanwhile, you can ask me about funding, KYC, investing or your PIN.';
}

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'agent', text: 'Hi! 👋 I\'m Tella, your TellaTrust assistant. Ask me anything.' }]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing, open]);

  const send = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setMsgs((m) => [...m, { from: 'me', text: v }]);
    setText('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: 'agent', text: reply(v) }]);
    }, 900);
  };

  return (
    <>
      {/* launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Support chat"
        data-tour="support"
        className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-green-brand text-white shadow-xl shadow-emerald-500/30 transition hover:scale-105 md:bottom-5"
      >
        {open ? '✕' : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-40 right-5 z-40 flex h-[28rem] max-h-[70dvh] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0a160e] md:bottom-24">
          <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-400 to-green-brand px-4 py-3 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 font-bold">T</span>
            <div>
              <p className="text-sm font-bold leading-tight">TellaTrust Support</p>
              <p className="flex items-center gap-1 text-xs text-white/80"><span className="h-1.5 w-1.5 rounded-full bg-white" /> Online now</p>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto bg-emerald-50/40 p-4 dark:bg-white/[0.02]">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.from === 'me' ? 'bg-green-brand text-white' : 'bg-white text-forest-deep shadow-sm dark:bg-white/10 dark:text-mint'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl bg-white px-3.5 py-3 shadow-sm dark:bg-white/10">
                  {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-deep/40" style={{ animationDelay: `${i * 120}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-emerald-100 p-2 dark:border-white/10">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button key={q} onClick={() => send(q)} className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-green-brand transition hover:bg-emerald-100 dark:bg-white/5">{q}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-center gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…"
                className="flex-1 rounded-full border border-line bg-soft px-4 py-2 text-sm outline-none focus:border-green-brand dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <button type="submit" className="grid h-9 w-9 place-items-center rounded-full bg-green-brand text-white transition hover:brightness-110">→</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
