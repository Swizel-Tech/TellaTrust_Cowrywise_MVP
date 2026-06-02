import { useLayoutEffect, useState } from 'react';

export interface TourStep { sel: string; title: string; body: string; }

export default function Tour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[i];
  const last = i === steps.length - 1;

  useLayoutEffect(() => {
    const el = document.querySelector(`[data-tour="${step.sel}"]`) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const t = setTimeout(update, 280);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { clearTimeout(t); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [i, step.sel]);

  const pad = 8;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const tipW = 320;

  let tipTop = vh / 2 - 80;
  let tipLeft = vw / 2 - tipW / 2;
  if (rect) {
    const below = rect.bottom + 16;
    const placeAbove = below + 170 > vh;
    tipTop = placeAbove ? Math.max(12, rect.top - 178) : below;
    tipLeft = Math.min(Math.max(12, rect.left), vw - tipW - 12);
  }

  return (
    <div className="fixed inset-0 z-[60]">
      {/* dim + spotlight */}
      {rect ? (
        <div
          className="pointer-events-none fixed rounded-2xl ring-2 ring-emerald-300 transition-all duration-300"
          style={{
            top: rect.top - pad, left: rect.left - pad,
            width: rect.width + pad * 2, height: rect.height + pad * 2,
            boxShadow: '0 0 0 9999px rgba(4,16,10,0.62)',
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-[rgba(4,16,10,0.62)]" />
      )}

      {/* tooltip */}
      <div className="fixed w-[320px] rounded-2xl border border-emerald-100 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#0a160e]"
        style={{ top: tipTop, left: tipLeft }}>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-green-brand dark:bg-emerald-500/15">
            Step {i + 1} of {steps.length}
          </span>
          <button onClick={onClose} className="text-sm font-semibold text-forest-deep/40 hover:text-forest-deep dark:text-mint/40">Skip</button>
        </div>
        <h3 className="mt-3 text-lg font-extrabold text-forest-deep dark:text-white">{step.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-forest-deep/65 dark:text-mint/65">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, j) => (
              <span key={j} className={`h-1.5 rounded-full transition-all ${j === i ? 'w-5 bg-green-brand' : 'w-1.5 bg-forest-deep/15 dark:bg-white/15'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && <button onClick={() => setI(i - 1)} className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest-deep/60 dark:text-mint/60">Back</button>}
            <button onClick={() => (last ? onClose() : setI(i + 1))} className="rounded-full bg-gradient-to-br from-emerald-400 to-green-brand px-5 py-1.5 text-sm font-bold text-white">
              {last ? 'Finish 🎉' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
