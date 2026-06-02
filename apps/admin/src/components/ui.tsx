import type { ReactNode } from 'react';

const ICONS: Record<string, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  users: 'M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM8 13a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM2 21v-1a4 4 0 0 1 4-4h2M14 21v-2a4 4 0 0 0-4-4',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  swap: 'M7 7h11l-3-3M17 17H6l3 3',
  box: 'M21 16V8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  chat: 'M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.6A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 21 11.5z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
};

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name] ?? ICONS.grid} />
    </svg>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-white ${className}`}>{children}</div>;
}

export function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-forest-deep/50">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-forest-deep">{value}</div>
      {sub && <div className={`mt-1 text-xs font-medium ${accent ?? 'text-forest-deep/50'}`}>{sub}</div>}
    </Card>
  );
}

const TONES: Record<string, string> = {
  green: 'bg-green-bright/15 text-forest',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-soft text-forest-deep/60',
  blue: 'bg-blue-100 text-blue-700',
};

export function Badge({ tone = 'gray', children }: { tone?: keyof typeof TONES | string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone] ?? TONES.gray}`}>
      {children}
    </span>
  );
}

// Dependency-free bar chart (inline SVG).
export function BarChart({ data, height = 160 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = 100 / (data.length * 1.6);
  return (
    <svg viewBox={`0 0 100 ${40}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {data.map((d, i) => {
        const h = (d.value / max) * 34;
        const x = (i + 0.3) * (100 / data.length);
        return <rect key={d.label} x={x} y={38 - h} width={bw} height={h} rx={0.8} fill="#2FA84F" />;
      })}
    </svg>
  );
}

export function Donut({ segments, size = 140 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 160 160" style={{ width: size, height: size }}>
      <g transform="rotate(-90 80 80)">
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={s.label} cx="80" cy="80" r={r} fill="none" stroke={s.color} strokeWidth="22"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />
          );
          offset += len;
          return el;
        })}
      </g>
    </svg>
  );
}
