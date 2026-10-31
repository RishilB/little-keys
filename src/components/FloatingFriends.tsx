import type { CSSProperties } from 'react';
import { useApp } from '../state/AppContext';
import { Avatar } from './Avatar';

interface Slot {
  x: number;
  y: number;
}

/** Spots around the edges, so friends never sit on top of the main activity. */
const SLOTS: Record<'roam' | 'edges', Slot[]> = {
  roam: [
    { x: 8, y: 22 },
    { x: 91, y: 28 },
    { x: 10, y: 80 },
    { x: 89, y: 78 },
    { x: 50, y: 93 },
  ],
  edges: [
    { x: 7, y: 78 },
    { x: 93, y: 74 },
    { x: 8, y: 30 },
    { x: 92, y: 32 },
    { x: 50, y: 95 },
  ],
};

interface Props {
  variant?: 'roam' | 'edges';
  /** Changes on every correct answer; each change makes the friends hop. */
  cheer?: number;
}

/** The child's chosen animal and bird friends, drifting gently behind the content. */
export function FloatingFriends({ variant = 'roam', cheer = 0 }: Props) {
  const { profile } = useApp();
  const friends = profile?.friends ?? [];
  if (friends.length === 0) return null;
  const slots = SLOTS[variant];

  return (
    <div className={`friends-layer ${variant}`} aria-hidden="true">
      {friends.map((id, i) => {
        const slot = slots[i % slots.length];
        return (
          <div
            key={id}
            className="friend"
            style={
              {
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                '--dur': `${7 + i * 1.3}s`,
                '--delay': `${-i * 1.7}s`,
                '--hop-delay': `${i * 0.08}s`,
              } as CSSProperties
            }
          >
            <div key={cheer} className={cheer ? 'friend-body hop' : 'friend-body'}>
              <Avatar id={id} size="100%" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
