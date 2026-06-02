interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  light?: boolean;
}

/** The TellaTrust diagonal-stripe mark, optionally with the wordmark. */
export default function Logo({ size = 40, withWordmark = false, light = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 120 120" aria-label="TellaTrust logo">
        <g transform="rotate(-22 60 60)">
          <rect x="34" y="14" width="9.5" height="92" rx="4.75" fill="#2b9248" />
          <rect x="48" y="10" width="9.5" height="100" rx="4.75" fill="#33b257" />
          <rect x="62" y="14" width="9.5" height="92" rx="4.75" fill="#3cc264" />
          <rect x="76" y="20" width="9.5" height="82" rx="4.75" fill="#43cf6c" />
          <rect x="90" y="28" width="9.5" height="70" rx="4.75" fill="#49d06f" />
        </g>
      </svg>
      {withWordmark && (
        <span
          className={`text-xl font-extrabold tracking-tight ${
            light ? 'text-white' : 'text-forest-deep'
          }`}
        >
          Tella<span className="text-green-bright">Trust</span>
        </span>
      )}
    </span>
  );
}
