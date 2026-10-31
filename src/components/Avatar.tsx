import type { ReactNode } from 'react';
import { avatarInfo, type AvatarId } from '../data/avatars';

const INK = '#2F2A3A';

function Eyes({ y = 52, spread = 10 }: { y?: number; spread?: number }) {
  return (
    <>
      {[50 - spread, 50 + spread].map((x) => (
        <g key={x}>
          <circle cx={x} cy={y} r={4.2} fill={INK} />
          <circle cx={x + 1.4} cy={y - 1.4} r={1.4} fill="#fff" />
        </g>
      ))}
    </>
  );
}

function Cheeks({ y = 63 }: { y?: number }) {
  return (
    <>
      <circle cx={32} cy={y} r={5.5} fill="#FF8FA3" opacity={0.45} />
      <circle cx={68} cy={y} r={5.5} fill="#FF8FA3" opacity={0.45} />
    </>
  );
}

function Smile({ y = 67, width = 5 }: { y?: number; width?: number }) {
  return (
    <path
      d={`M${50 - width} ${y} Q50 ${y + 4.5} ${50 + width} ${y}`}
      stroke={INK}
      strokeWidth={2.4}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function artwork(id: AvatarId): ReactNode {
  switch (id) {
    case 'bear':
      return (
        <>
          {[26, 74].map((x) => (
            <g key={x}>
              <circle cx={x} cy={30} r={13} fill="#C68B59" />
              <circle cx={x} cy={30} r={7} fill="#EBC9A3" />
            </g>
          ))}
          <circle cx={50} cy={56} r={33} fill="#C68B59" />
          <ellipse cx={50} cy={66} rx={13} ry={10} fill="#EBC9A3" />
          <ellipse cx={50} cy={61} rx={5} ry={3.6} fill="#4A3226" />
          <Eyes y={50} spread={11} />
          <Cheeks y={62} />
          <Smile y={67.5} width={4} />
        </>
      );
    case 'bunny':
      return (
        <>
          {[37, 63].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={24} rx={9} ry={22} fill="#FFFFFF" stroke="#EBDDE4" strokeWidth={1.5} />
              <ellipse cx={x} cy={26} rx={4.5} ry={15} fill="#F7A8BE" />
            </g>
          ))}
          <circle cx={50} cy={60} r={30} fill="#FFFFFF" stroke="#EBDDE4" strokeWidth={1.5} />
          <ellipse cx={50} cy={64} rx={3.8} ry={2.8} fill="#F27C9C" />
          <Eyes y={55} spread={10} />
          <Cheeks y={66} />
          <path d="M50 67 Q47 71.5 43.5 69 M50 67 Q53 71.5 56.5 69" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </>
      );
    case 'cat':
      return (
        <>
          <polygon points="20,44 24,12 46,28" fill="#9DA3B4" strokeLinejoin="round" stroke="#9DA3B4" strokeWidth={4} />
          <polygon points="80,44 76,12 54,28" fill="#9DA3B4" strokeLinejoin="round" stroke="#9DA3B4" strokeWidth={4} />
          <polygon points="27,34 28,21 38,28" fill="#F3C1CF" />
          <polygon points="73,34 72,21 62,28" fill="#F3C1CF" />
          <circle cx={50} cy={57} r={32} fill="#9DA3B4" />
          <ellipse cx={50} cy={62} rx={3.6} ry={2.6} fill="#F27C9C" />
          <path d="M20 60 H34 M21 67 L34 64 M80 60 H66 M79 67 L66 64" stroke="#6E7487" strokeWidth={1.6} strokeLinecap="round" />
          <Eyes y={51} spread={11} />
          <path d="M50 64.5 Q47 69 43.5 66.5 M50 64.5 Q53 69 56.5 66.5" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </>
      );
    case 'panda':
      return (
        <>
          <circle cx={26} cy={31} r={12} fill={INK} />
          <circle cx={74} cy={31} r={12} fill={INK} />
          <circle cx={50} cy={57} r={32} fill="#FFFFFF" stroke="#E2E2E8" strokeWidth={1.5} />
          <ellipse cx={38} cy={53} rx={8} ry={10} fill={INK} transform="rotate(-25 38 53)" />
          <ellipse cx={62} cy={53} rx={8} ry={10} fill={INK} transform="rotate(25 62 53)" />
          <circle cx={39} cy={52} r={3.4} fill="#fff" />
          <circle cx={61} cy={52} r={3.4} fill="#fff" />
          <circle cx={39.5} cy={52.5} r={1.8} fill={INK} />
          <circle cx={60.5} cy={52.5} r={1.8} fill={INK} />
          <ellipse cx={50} cy={64} rx={4.2} ry={3} fill={INK} />
          <Cheeks y={66} />
          <Smile y={69} width={4} />
        </>
      );
    case 'frog':
      return (
        <>
          {[33, 67].map((x) => (
            <g key={x}>
              <circle cx={x} cy={33} r={13} fill="#7CCB6B" />
              <circle cx={x} cy={32} r={8} fill="#fff" />
              <circle cx={x + 1} cy={33} r={4.2} fill={INK} />
              <circle cx={x + 2.4} cy={31.6} r={1.4} fill="#fff" />
            </g>
          ))}
          <ellipse cx={50} cy={60} rx={36} ry={28} fill="#7CCB6B" />
          <circle cx={44} cy={55} r={1.4} fill="#4E9A43" />
          <circle cx={56} cy={55} r={1.4} fill="#4E9A43" />
          <Cheeks y={64} />
          <path d="M34 64 Q50 78 66 64" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </>
      );
    case 'chick':
      return (
        <>
          <ellipse cx={46} cy={22} rx={4} ry={8} fill="#FFC21A" transform="rotate(-20 46 22)" />
          <ellipse cx={54} cy={21} rx={4} ry={9} fill="#FFC21A" transform="rotate(15 54 21)" />
          <circle cx={50} cy={56} r={32} fill="#FFD54A" />
          <Eyes y={50} spread={11} />
          <Cheeks y={62} />
          <polygon points="43,59 57,59 50,68" fill="#F39A2B" stroke="#F39A2B" strokeWidth={3} strokeLinejoin="round" />
        </>
      );
    case 'owl':
      return (
        <>
          <polygon points="22,30 30,10 40,26" fill="#A47551" stroke="#A47551" strokeWidth={4} strokeLinejoin="round" />
          <polygon points="78,30 70,10 60,26" fill="#A47551" stroke="#A47551" strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={50} cy={56} rx={34} ry={35} fill="#A47551" />
          <ellipse cx={50} cy={72} rx={18} ry={14} fill="#E9D3B8" />
          <path d="M42 70 q3 3 6 0 M52 70 q3 3 6 0 M47 77 q3 3 6 0" stroke="#C8A988" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          {[36, 64].map((x) => (
            <g key={x}>
              <circle cx={x} cy={46} r={13} fill="#FFF8EC" />
              <circle cx={x} cy={47} r={6} fill={INK} />
              <circle cx={x + 2} cy={45} r={2} fill="#fff" />
            </g>
          ))}
          <polygon points="45,56 55,56 50,64" fill="#F39A2B" stroke="#F39A2B" strokeWidth={2.5} strokeLinejoin="round" />
        </>
      );
    case 'parrot':
      return (
        <>
          <path d="M44 22 Q40 6 50 8 Q46 16 52 22 Q56 8 64 12 Q56 18 58 26 Z" fill="#E5484D" />
          <circle cx={50} cy={56} r={33} fill="#4CB872" />
          <ellipse cx={64} cy={58} rx={14} ry={16} fill="#FFF8EC" />
          <circle cx={62} cy={52} r={4.2} fill={INK} />
          <circle cx={63.4} cy={50.6} r={1.4} fill="#fff" />
          <path d="M70 56 Q86 58 80 74 Q76 66 68 66 Z" fill="#F5A524" stroke="#E08E10" strokeWidth={1.5} strokeLinejoin="round" />
          <circle cx={38} cy={66} r={5.5} fill="#FF8FA3" opacity={0.45} />
          <path d="M22 50 Q30 44 38 50" stroke="#2E9E57" strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      );
    case 'penguin':
      return (
        <>
          <ellipse cx={50} cy={56} rx={34} ry={35} fill="#2F3A56" />
          <path d="M50 38 C36 30 22 42 26 60 C30 80 70 80 74 60 C78 42 64 30 50 38 Z" fill="#FFFFFF" />
          <Eyes y={52} spread={10} />
          <Cheeks y={62} />
          <ellipse cx={50} cy={62} rx={7} ry={4} fill="#F5A524" />
        </>
      );
    case 'duck':
      return (
        <>
          <path d="M48 22 Q50 12 56 16" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={50} cy={56} r={33} fill="#FFFFFF" stroke="#E3EEF2" strokeWidth={1.5} />
          <Eyes y={48} spread={11} />
          <Cheeks y={58} />
          <ellipse cx={50} cy={64} rx={13} ry={6.5} fill="#F5A524" />
          <path d="M39 64 H61" stroke="#E08E10" strokeWidth={1.6} strokeLinecap="round" />
        </>
      );
    case 'lion':
      return (
        <>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={50 + Math.cos(a) * 33} cy={55 + Math.sin(a) * 33} r={13} fill="#E9973A" />;
          })}
          <circle cx={50} cy={55} r={34} fill="#E9973A" />
          <circle cx={30} cy={34} r={7} fill="#F8C774" />
          <circle cx={70} cy={34} r={7} fill="#F8C774" />
          <circle cx={50} cy={56} r={27} fill="#F8C774" />
          <ellipse cx={50} cy={65} rx={11} ry={8} fill="#FFF0CF" />
          <ellipse cx={50} cy={60.5} rx={4.6} ry={3.2} fill="#6B3E1E" />
          <Eyes y={51} spread={10} />
          <Smile y={67} width={4} />
        </>
      );
    case 'fox':
      return (
        <>
          <polygon points="20,44 24,12 46,30" fill="#F08A4B" stroke="#F08A4B" strokeWidth={4} strokeLinejoin="round" />
          <polygon points="80,44 76,12 54,30" fill="#F08A4B" stroke="#F08A4B" strokeWidth={4} strokeLinejoin="round" />
          <polygon points="27,35 28,21 38,30" fill="#FFE3D3" />
          <polygon points="73,35 72,21 62,30" fill="#FFE3D3" />
          <circle cx={50} cy={58} r={31} fill="#F08A4B" />
          <ellipse cx={39} cy={69} rx={14} ry={11} fill="#FFF4EA" />
          <ellipse cx={61} cy={69} rx={14} ry={11} fill="#FFF4EA" />
          <ellipse cx={50} cy={64} rx={4.4} ry={3.2} fill={INK} />
          <Eyes y={53} spread={11} />
          <Smile y={69.5} width={4} />
        </>
      );
  }
}

interface AvatarProps {
  id: AvatarId;
  size?: number | string;
  className?: string;
  /** Show the soft circular background. */
  withBg?: boolean;
}

export function Avatar({ id, size = 96, className, withBg = true }: AvatarProps) {
  const info = avatarInfo(id);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={info.label}
      style={{ overflow: 'visible' }}
    >
      {withBg && <circle cx={50} cy={50} r={50} fill={info.bg} />}
      <g transform="translate(5 5) scale(0.9)">{artwork(id)}</g>
    </svg>
  );
}
