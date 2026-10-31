import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AvatarId } from '../data/avatars';
import type { ContentId } from '../data/characters';
import type { SequenceMode } from '../lib/sequence';
import { loadJSON, removeKey, saveJSON } from '../lib/storage';
import { narrator } from '../lib/narrator';
import { sfx } from '../lib/sfx';

export type Gender = 'girl' | 'boy' | 'other' | 'unspecified';
export type ThemeId = 'sunshine' | 'blossom' | 'ocean';

export interface ChildProfile {
  name: string;
  ageYears: number;
  ageMonths: number;
  gender: Gender;
  avatar: AvatarId;
  /** Colour theme; suggested from gender but always the parent's choice. */
  theme: ThemeId;
  /** Up to MAX_FRIENDS animals/birds that float around the screens. */
  friends: AvatarId[];
}

export function suggestedTheme(gender: Gender): ThemeId {
  if (gender === 'girl') return 'blossom';
  if (gender === 'boy') return 'ocean';
  return 'sunshine';
}

export type MotionSetting = 'system' | 'reduced' | 'full';
export type KeyboardSetting = 'auto' | 'show' | 'hide';

export type VoiceSource = 'recorded' | 'device';

export interface Settings {
  narration: boolean;
  /** Natural recorded voice when available, otherwise the browser's own voice. */
  voiceSource: VoiceSource;
  sfx: boolean;
  voiceURI: string | null;
  speechRate: number;
  motion: MotionSetting;
  onScreenKeyboard: KeyboardSetting;
  lastContent: ContentId;
  lastSequence: SequenceMode;
}

const PROFILE_KEY = 'little-keys.profile.v1';
const SETTINGS_KEY = 'little-keys.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  narration: true,
  voiceSource: 'recorded',
  sfx: true,
  voiceURI: null,
  speechRate: 0.85,
  motion: 'system',
  onScreenKeyboard: 'auto',
  lastContent: 'numbers',
  lastSequence: 'order',
};

function isProfile(value: unknown): value is ChildProfile {
  const p = value as ChildProfile | null;
  return !!p && typeof p.name === 'string' && p.name.trim().length > 0 && typeof p.avatar === 'string';
}

interface AppState {
  profile: ChildProfile | null;
  saveProfile: (profile: ChildProfile) => void;
  deleteProfile: () => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  reducedMotion: boolean;
  coarsePointer: boolean;
}

const AppContext = createContext<AppState | null>(null);

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ChildProfile | null>(() => {
    const stored = loadJSON<ChildProfile>(PROFILE_KEY);
    if (!isProfile(stored)) return null;
    // Profiles saved before themes/friends existed.
    return { ...stored, theme: stored.theme ?? suggestedTheme(stored.gender), friends: stored.friends ?? [] };
  });
  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
    ...(loadJSON<Partial<Settings>>(SETTINGS_KEY) ?? {}),
  }));

  const systemReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const coarsePointer = useMediaQuery('(pointer: coarse)');
  const reducedMotion = settings.motion === 'reduced' || (settings.motion === 'system' && systemReduced);

  const saveProfile = useCallback((p: ChildProfile) => {
    const clean = { ...p, name: p.name.trim() };
    setProfile(clean);
    saveJSON(PROFILE_KEY, clean);
  }, []);

  const deleteProfile = useCallback(() => {
    setProfile(null);
    removeKey(PROFILE_KEY);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveJSON(SETTINGS_KEY, next);
      return next;
    });
  }, []);

  // Keep the audio engines in sync with settings.
  useEffect(() => {
    narrator.enabled = settings.narration;
    narrator.voiceURI = settings.voiceURI;
    narrator.rate = settings.speechRate;
    narrator.useRecorded = settings.voiceSource === 'recorded';
  }, [settings.narration, settings.voiceURI, settings.speechRate, settings.voiceSource]);

  useEffect(() => {
    void narrator.loadRecordedVoice();
  }, []);

  useEffect(() => {
    sfx.enabled = settings.sfx;
  }, [settings.sfx]);

  useEffect(() => {
    document.documentElement.dataset.theme = profile?.theme ?? 'sunshine';
  }, [profile?.theme]);

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full';
  }, [reducedMotion]);

  const value = useMemo(
    () => ({ profile, saveProfile, deleteProfile, settings, updateSettings, reducedMotion, coarsePointer }),
    [profile, saveProfile, deleteProfile, settings, updateSettings, reducedMotion, coarsePointer],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
