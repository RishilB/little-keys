import { useEffect, useRef, useState } from 'react';
import { phrases } from '../data/phrases';
import { useFullscreen } from '../hooks/useFullscreen';
import { narrator } from '../lib/narrator';
import { sfx } from '../lib/sfx';
import { useApp, type KeyboardSetting, type MotionSetting } from '../state/AppContext';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

interface Props {
  onClose: () => void;
  onEditProfile: () => void;
}

function useVoices() {
  const [voices, setVoices] = useState(() => narrator.englishVoices());
  useEffect(() => narrator.onVoicesChanged(() => setVoices(narrator.englishVoices())), []);
  return voices;
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="setting-row">
      <span>
        <span className="setting-label">{label}</span>
        {hint && <span className="setting-hint">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="setting-row stacked">
      <span className="setting-label" id={`seg-${label}`}>
        {label}
      </span>
      <div className="segmented" role="radiogroup" aria-labelledby={`seg-${label}`}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className={value === o.value ? 'seg active' : 'seg'}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPanel({ onClose, onEditProfile }: Props) {
  const { profile, deleteProfile, settings, updateSettings } = useApp();
  const voices = useVoices();
  const fullscreen = useFullscreen();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const testVoice = () => {
    sfx.unlock();
    narrator.speak(phrases.voiceTest(profile?.name ?? 'friend'));
  };

  const active = narrator.activeVoice();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="settings-title">Grown-up settings</h2>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close settings">
            <Icon name="close" />
          </button>
        </div>

        <section className="settings-section">
          <h3>Sound</h3>
          <Toggle label="Voice narration" hint="Instructions, letter names and praise" checked={settings.narration} onChange={(v) => updateSettings({ narration: v })} />
          <Toggle label="Sound effects" hint="Soft chimes and pops" checked={settings.sfx} onChange={(v) => updateSettings({ sfx: v })} />
          <div className="setting-row stacked">
            <label className="setting-label" htmlFor="voice-select">
              Voice
            </label>
            {narrator.supported ? (
              <div className="voice-row">
                <select
                  id="voice-select"
                  value={settings.voiceURI ?? ''}
                  onChange={(e) => updateSettings({ voiceURI: e.target.value || null })}
                >
                  <option value="">Automatic{active && !settings.voiceURI ? ` (${active.name})` : ''}</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} — {v.lang}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-soft" onClick={testVoice} disabled={!settings.narration}>
                  <Icon name="play" size={18} /> Test
                </button>
              </div>
            ) : (
              <p className="setting-hint">This browser can’t speak. Everything still works with on-screen text.</p>
            )}
          </div>
          <Segmented
            label="Speaking speed"
            value={String(settings.speechRate)}
            options={[
              { value: '0.7', label: 'Slow' },
              { value: '0.85', label: 'Gentle' },
              { value: '1', label: 'Normal' },
            ]}
            onChange={(v) => updateSettings({ speechRate: Number(v) })}
          />
        </section>

        <section className="settings-section">
          <h3>Display</h3>
          <Segmented<MotionSetting>
            label="Animations"
            value={settings.motion}
            options={[
              { value: 'system', label: 'Match device' },
              { value: 'reduced', label: 'Calm' },
              { value: 'full', label: 'Playful' },
            ]}
            onChange={(v) => updateSettings({ motion: v })}
          />
          <Segmented<KeyboardSetting>
            label="On-screen keyboard"
            value={settings.onScreenKeyboard}
            options={[
              { value: 'auto', label: 'Touch devices' },
              { value: 'show', label: 'Always' },
              { value: 'hide', label: 'Never' },
            ]}
            onChange={(v) => updateSettings({ onScreenKeyboard: v })}
          />
          {fullscreen.supported && (
            <div className="setting-row">
              <span className="setting-label">Full screen</span>
              <button type="button" className="btn btn-soft" onClick={fullscreen.toggle}>
                <Icon name={fullscreen.isFullscreen ? 'shrink' : 'expand'} size={18} />
                {fullscreen.isFullscreen ? 'Exit full screen' : 'Enter full screen'}
              </button>
            </div>
          )}
        </section>

        {profile && (
          <section className="settings-section">
            <h3>Child profile</h3>
            <div className="profile-summary">
              <Avatar id={profile.avatar} size={56} />
              <div>
                <strong>{profile.name}</strong>
                <span className="setting-hint">
                  {profile.ageYears} {profile.ageYears === 1 ? 'year' : 'years'}, {profile.ageMonths} {profile.ageMonths === 1 ? 'month' : 'months'}
                </span>
              </div>
            </div>
            {confirmDelete ? (
              <div className="confirm-box" role="alert">
                <p>Delete {profile.name}’s profile from this browser?</p>
                <div className="btn-row">
                  <button type="button" className="btn btn-danger" onClick={() => { deleteProfile(); onClose(); }}>
                    <Icon name="trash" size={18} /> Yes, delete
                  </button>
                  <button type="button" className="btn btn-soft" onClick={() => setConfirmDelete(false)}>
                    Keep it
                  </button>
                </div>
              </div>
            ) : (
              <div className="btn-row">
                <button type="button" className="btn btn-soft" onClick={onEditProfile}>
                  <Icon name="edit" size={18} /> Edit profile
                </button>
                <button type="button" className="btn btn-ghost-danger" onClick={() => setConfirmDelete(true)}>
                  <Icon name="trash" size={18} /> Delete profile
                </button>
              </div>
            )}
          </section>
        )}

        <p className="privacy-note">
          Little Keys saves the profile and settings only in this browser. Nothing is sent anywhere.
        </p>
      </div>
    </div>
  );
}
