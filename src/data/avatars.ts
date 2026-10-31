export type AvatarId =
  | 'bear'
  | 'bunny'
  | 'cat'
  | 'panda'
  | 'frog'
  | 'lion'
  | 'fox'
  | 'chick'
  | 'owl'
  | 'parrot'
  | 'penguin'
  | 'duck';

export interface AvatarInfo {
  id: AvatarId;
  label: string;
  kind: 'animal' | 'bird';
  /** Soft background behind the avatar. */
  bg: string;
}

/** Used both as the child's avatar and as the "friends" that float around the screens. */
export const AVATARS: AvatarInfo[] = [
  { id: 'bear', label: 'Bear', kind: 'animal', bg: '#FCE3C8' },
  { id: 'bunny', label: 'Bunny', kind: 'animal', bg: '#FBDDE6' },
  { id: 'cat', label: 'Kitty', kind: 'animal', bg: '#E6E0FA' },
  { id: 'panda', label: 'Panda', kind: 'animal', bg: '#DDEFE6' },
  { id: 'frog', label: 'Frog', kind: 'animal', bg: '#DFF3D0' },
  { id: 'lion', label: 'Lion', kind: 'animal', bg: '#FFE2B3' },
  { id: 'fox', label: 'Fox', kind: 'animal', bg: '#FFDCCB' },
  { id: 'chick', label: 'Chick', kind: 'bird', bg: '#FFF0B8' },
  { id: 'owl', label: 'Owl', kind: 'bird', bg: '#EFE3D3' },
  { id: 'parrot', label: 'Parrot', kind: 'bird', bg: '#DDF3E4' },
  { id: 'penguin', label: 'Penguin', kind: 'bird', bg: '#DCE9F7' },
  { id: 'duck', label: 'Duck', kind: 'bird', bg: '#D9F0F5' },
];

export const MAX_FRIENDS = 5;

export function avatarInfo(id: AvatarId): AvatarInfo {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
