export type AvatarId = 'bear' | 'bunny' | 'cat' | 'panda' | 'frog' | 'chick' | 'lion' | 'fox';

export interface AvatarInfo {
  id: AvatarId;
  label: string;
  /** Soft background behind the avatar. */
  bg: string;
}

export const AVATARS: AvatarInfo[] = [
  { id: 'bear', label: 'Bear', bg: '#FCE3C8' },
  { id: 'bunny', label: 'Bunny', bg: '#FBDDE6' },
  { id: 'cat', label: 'Kitty', bg: '#E6E0FA' },
  { id: 'panda', label: 'Panda', bg: '#DDEFE6' },
  { id: 'frog', label: 'Frog', bg: '#DFF3D0' },
  { id: 'chick', label: 'Chick', bg: '#FFF0B8' },
  { id: 'lion', label: 'Lion', bg: '#FFE2B3' },
  { id: 'fox', label: 'Fox', bg: '#FFDCCB' },
];

export function avatarInfo(id: AvatarId): AvatarInfo {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
