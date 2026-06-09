export function SunRay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-foreground/10 blur-3xl dark:bg-foreground/15" />
      <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-foreground/20 blur-2xl dark:bg-foreground/25" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.12] dark:opacity-[0.18] text-foreground"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        <defs>
          <linearGradient id="rayGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="url(#rayGradient)" strokeWidth="1">
          {Array.from({ length: 28 }).map((_, i) => {
            const startX = 1200 + i * 30;
            const endX = -200 - i * 40;
            return <line key={i} x1={startX} y1={-50} x2={endX} y2={900} />;
          })}
        </g>
      </svg>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/60" />
    </div>
  );
}