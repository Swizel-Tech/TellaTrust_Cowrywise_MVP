const videos = [
  { t: 'Intro to Stock Investing', tag: 'INVESTING', c: 'from-sky-400 to-blue-500' },
  { t: 'Understanding Mutual Funds', tag: 'FUNDS', c: 'from-amber-400 to-orange-500' },
  { t: 'Risks & How to Avoid Them', tag: 'INVESTING', c: 'from-violet-400 to-fuchsia-500' },
  { t: 'Saving on Autopilot', tag: 'SAVINGS', c: 'from-emerald-400 to-green-600' },
];
const reads = [
  { t: 'Why the Nigerian stock market is booming', m: '4 min', c: 'from-blue-500 to-indigo-600' },
  { t: 'What stocks really are (and why you don\'t need millions)', m: '3 min', c: 'from-emerald-500 to-teal-600' },
  { t: 'Building a money habit that sticks', m: '6 min', c: 'from-rose-400 to-pink-600' },
  { t: 'Dollar funds: hedging against naira swings', m: '5 min', c: 'from-amber-400 to-orange-600' },
];

export default function Learn() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Start learning</h1>
        <p className="mt-1 text-sm text-forest-deep/60 dark:text-mint/60">Bite-sized money lessons. Watch, read, grow.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-deep/50 dark:text-mint/50">Learn in 60 seconds</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((v) => (
            <div key={v.t} className={`group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${v.c} p-4 text-white shadow-lg transition hover:-translate-y-1`}>
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">#{v.tag}</span>
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/30 backdrop-blur transition group-hover:scale-110">▶</span>
              </div>
              <p className="absolute bottom-3 left-4 right-4 text-sm font-bold leading-tight">{v.t}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-deep/50 dark:text-mint/50">Have a quick read</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reads.map((r) => (
            <div key={r.t} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
              <div className={`h-28 bg-gradient-to-br ${r.c}`} />
              <div className="p-4">
                <p className="text-sm font-bold leading-snug">{r.t}</p>
                <p className="mt-2 text-xs text-forest-deep/45 dark:text-mint/45">{r.m} read</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
