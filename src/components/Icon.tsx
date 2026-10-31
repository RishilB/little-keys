export type IconName =
  | 'home'
  | 'speaker'
  | 'speaker-off'
  | 'music'
  | 'music-off'
  | 'expand'
  | 'shrink'
  | 'settings'
  | 'replay'
  | 'keyboard'
  | 'close'
  | 'trash'
  | 'edit'
  | 'play'
  | 'eraser';

const PATHS: Record<IconName, string> = {
  home: 'M4 11 12 4l8 7v9h-5.5v-6h-5v6H4z',
  speaker: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4z M15.5 9.5a3.5 3.5 0 0 1 0 5 M18 7a7 7 0 0 1 0 10',
  'speaker-off': 'M4 9.5h3.5L12 5.5v13l-4.5-4H4z M16 9.5l5 5 M21 9.5l-5 5',
  music: 'M9 18V6l11-2v12 M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z M20 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
  'music-off': 'M9 18V9 M9 6l11-2v9 M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z M3 3l18 18',
  expand: 'M4 9V4h5 M15 4h5v5 M20 15v5h-5 M9 20H4v-5',
  shrink: 'M9 4v5H4 M20 9h-5V4 M15 20v-5h5 M4 15h5v5',
  settings:
    'M4 7h9 M17 7h3 M4 17h3 M11 17h9 M15 5v4 M9 15v4 M4 12h5 M13 12h7',
  replay: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3 M4 4v4.5h4.5',
  keyboard: 'M3 6.5h18v11H3z M7 10h.01 M11 10h.01 M15 10h.01 M19 10h.01 M7 14h10',
  close: 'M6 6l12 12 M18 6 6 18',
  trash: 'M4 7h16 M9 7V4.5h6V7 M6.5 7l1 13h9l1-13 M10 11v5 M14 11v5',
  edit: 'M4 20h4L19 9l-4-4L4 16z M13.5 6.5l4 4',
  play: 'M7 5v14l12-7z',
  eraser: 'M8 20h12 M5.5 15.5l9-9a2 2 0 0 1 2.8 0l1.7 1.7a2 2 0 0 1 0 2.8L12 18H8z M10 11l5 5',
};

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
