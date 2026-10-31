# Little Keys

A gentle keyboard learning game for children aged about 1½–3. A grown-up sets it up; the child presses keys.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # logic tests (key handling, sequences, playground layout)
npm run build    # typecheck + production build in dist/
```

## Activities

- **Find the Key** – one large character; the child presses the matching key. Numbers (0–9) or
  Alphabets (A–Z), In Order (ends with a celebration) or Random (never the same twice in a row,
  runs until a grown-up leaves).
- **Keyboard Playground** – every letter or number pops onto the canvas and is spoken. At most 9
  are visible; the oldest fade out.

## Project layout

| Path | What lives there |
| --- | --- |
| `src/data/characters.ts` | Character sets, pronunciations, colors, on-screen keyboard rows |
| `src/data/phrases.ts` | Every narration phrase and feedback label |
| `src/data/avatars.ts`, `src/components/Avatar.tsx` | Avatar list and their SVG artwork |
| `src/lib/keys.ts` | Keyboard event → accepted character (number row, numpad, letters) |
| `src/lib/sequence.ts` | In-order / random sequencing |
| `src/lib/playground.ts` | Non-overlapping placement and fade-out for the playground |
| `src/lib/narrator.ts` | Single-voice speech: each new line cancels the last, no queue; female English voice preferred |
| `src/lib/sfx.ts` | Soft Web Audio chimes (no failure sounds) |
| `src/hooks/useCharInput.ts` | Window-level key listener; ignores held-key repeats |
| `src/state/AppContext.tsx` | Profile + settings, saved in `localStorage` |
| `src/screens/*` | Profile form, Welcome, Home, Find setup, Find the Key, Playground |

To add a new content set later (e.g. animals), add an entry to `CONTENT_SETS` and phrases for it;
the Find the Key flow reads everything from the set.

## Privacy

No backend, analytics or external requests. The font is bundled locally. The profile and settings
are stored only in the browser and can be deleted from Settings.
