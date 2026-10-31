import { useMemo, type CSSProperties } from 'react';
import { CHAR_COLORS } from '../data/characters';

/** A smiling star for "Good job!" moments. */
export function StarMascot({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <polygon
        points="50,8 61.76,35.82 91.85,38.4 69.02,58.18 75.86,87.6 50,72 24.14,87.6 30.98,58.18 8.15,38.4 38.24,35.82"
        fill="#FFD54A"
        stroke="#FFC21A"
        strokeWidth={7}
        strokeLinejoin="round"
      />
      <circle cx={42} cy={50} r={3.4} fill="#2F2A3A" />
      <circle cx={58} cy={50} r={3.4} fill="#2F2A3A" />
      <circle cx={36} cy={57} r={4} fill="#FF8FA3" opacity={0.5} />
      <circle cx={64} cy={57} r={4} fill="#FF8FA3" opacity={0.5} />
      <path d="M43 58 Q50 65 57 58" stroke="#2F2A3A" strokeWidth={2.6} strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** A small, soft burst of confetti. Not rendered when motion is reduced. */
export function Confetti({ count = 16 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 110 + Math.random() * 90;
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist * 0.75,
          rot: Math.round(Math.random() * 360),
          color: CHAR_COLORS[i % CHAR_COLORS.length],
          round: i % 3 === 0,
        };
      }),
    [count],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={p.round ? 'confetti-piece round' : 'confetti-piece'}
          style={
            {
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--rot': `${p.rot}deg`,
              background: p.color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
