import { useState, type FormEvent } from 'react';
import { Avatar } from '../components/Avatar';
import { AVATARS, type AvatarId } from '../data/avatars';
import { useApp, type ChildProfile, type Gender } from '../state/AppContext';

interface Props {
  mode: 'create' | 'edit';
  onDone: () => void;
  onCancel?: () => void;
}

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'girl', label: 'Girl' },
  { value: 'boy', label: 'Boy' },
  { value: 'other', label: 'Other' },
  { value: 'unspecified', label: 'Prefer not to say' },
];

export function ProfileForm({ mode, onDone, onCancel }: Props) {
  const { profile, saveProfile } = useApp();
  const initial: ChildProfile = (mode === 'edit' && profile) || {
    name: '',
    ageYears: 2,
    ageMonths: 0,
    gender: 'unspecified',
    avatar: 'bear',
  };
  const [draft, setDraft] = useState<ChildProfile>(initial);
  const [error, setError] = useState('');

  const set = <K extends keyof ChildProfile>(key: K, value: ChildProfile[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      setError('Please enter a first name or nickname.');
      return;
    }
    saveProfile(draft);
    onDone();
  };

  return (
    <main className="page form-page">
      <form className="card profile-form" onSubmit={submit} noValidate>
        <div className="form-hero">
          <Avatar id={draft.avatar} size={88} className="hero-avatar" />
          <div>
            <p className="eyebrow">For grown-ups</p>
            <h1>{mode === 'create' ? 'Welcome to Little Keys' : 'Edit profile'}</h1>
            <p className="muted">
              {mode === 'create'
                ? 'Tell us a little about your child. This stays on this device.'
                : 'Changes are saved on this device only.'}
            </p>
          </div>
        </div>

        <div className="field">
          <label htmlFor="child-name">Name or nickname</label>
          <input
            id="child-name"
            type="text"
            autoComplete="off"
            maxLength={20}
            value={draft.name}
            placeholder="e.g. Aarav"
            onChange={(e) => {
              set('name', e.target.value);
              if (error) setError('');
            }}
            aria-invalid={!!error}
            aria-describedby={error ? 'name-error' : undefined}
            autoFocus={mode === 'create'}
          />
          {error && (
            <p id="name-error" className="field-error">
              {error}
            </p>
          )}
        </div>

        <fieldset className="field">
          <legend>Age</legend>
          <div className="age-row">
            <label>
              <select value={draft.ageYears} onChange={(e) => set('ageYears', Number(e.target.value))}>
                {Array.from({ length: 7 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <span>years</span>
            </label>
            <label>
              <select value={draft.ageMonths} onChange={(e) => set('ageMonths', Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <span>months</span>
            </label>
          </div>
          <p className="setting-hint">Little Keys is designed for children about 1½ to 3 years old.</p>
        </fieldset>

        <fieldset className="field">
          <legend>
            Gender <span className="optional">(optional)</span>
          </legend>
          <div className="chip-row">
            {GENDERS.map((g) => (
              <label key={g.value} className={draft.gender === g.value ? 'chip active' : 'chip'}>
                <input type="radio" name="gender" value={g.value} checked={draft.gender === g.value} onChange={() => set('gender', g.value)} />
                {g.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Choose a friend</legend>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <label key={a.id} className={draft.avatar === a.id ? 'avatar-option active' : 'avatar-option'}>
                <input type="radio" name="avatar" value={a.id} checked={draft.avatar === a.id} onChange={() => set('avatar', a.id as AvatarId)} />
                <Avatar id={a.id} size={64} />
                <span>{a.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="btn-row end">
          {onCancel && (
            <button type="button" className="btn btn-soft" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {mode === 'create' ? 'Save and continue' : 'Save changes'}
          </button>
        </div>
      </form>
    </main>
  );
}
