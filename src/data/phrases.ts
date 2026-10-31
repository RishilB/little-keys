import { CONTENT_SETS, type ContentSet, type LearningItem } from './characters';

/**
 * All narration lives here so wording stays short, gentle and consistent.
 *
 * Each spoken sentence is a `Line` with a stable `id`. The recorded voice plays
 * the clip `<id>.mp3`; the device voice reads `text`. `clip` is the wording that
 * gets recorded when it differs from `text` (recordings can't say the child's
 * name). In `clip`, [[X]] marks a character to be spelled out by the recorder.
 */
export interface Line {
  id: string;
  text: string;
  clip?: string;
}

/** Labels shown on screen with the matching spoken praise. */
export const PRAISE = ['Good job!', 'Yay!', 'Well done!'];
const TRY_AGAIN = ["Let's try again.", 'Try again.'];
const PROMPTS = [
  (noun: string, said: string) => `Can you find the ${noun} ${said}?`,
  (noun: string, said: string) => `Press the ${noun} ${said}.`,
  (noun: string, said: string) => `Where is the ${noun} ${said}?`,
];

export const labels = { tryAgain: 'Try again!' };

function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

/** How the recording should say a character: letters spelled, numbers as words. */
function clipName(set: ContentSet, item: LearningItem): string {
  return set.id === 'letters' ? `[[${item.char}]]` : item.spoken;
}

function setFor(item: LearningItem): ContentSet {
  return /\d/.test(item.char) ? CONTENT_SETS.numbers : CONTENT_SETS.letters;
}

function promptLine(set: ContentSet, item: LearningItem, variant: number): Line {
  const make = PROMPTS[variant];
  return {
    id: `prompt-${item.char}-${variant + 1}`,
    text: make(set.noun, item.spoken),
    clip: make(set.noun, clipName(set, item)),
  };
}

function findLine(set: ContentSet, item: LearningItem): Line {
  return {
    id: `find-${item.char}`,
    text: `Find the ${set.noun} ${item.spoken}.`,
    clip: `Find the ${set.noun} ${clipName(set, item)}.`,
  };
}

function thatsLine(item: LearningItem): Line {
  const set = setFor(item);
  return { id: `thats-${item.char}`, text: `That's ${item.spoken}!`, clip: `That's ${clipName(set, item)}!` };
}

function keyLine(item: LearningItem): Line {
  const set = setFor(item);
  return { id: `key-${item.char}`, text: item.spoken, clip: `${clipName(set, item)}.` };
}

const praiseLine = (k: number): Line => ({ id: `praise-${k + 1}`, text: PRAISE[k] });
const tryAgainLine = (k: number): Line => ({ id: `tryagain-${k + 1}`, text: TRY_AGAIN[k] });

export const phrases = {
  greeting: (name: string): Line[] => [{ id: 'greeting', text: `Hi ${name}! Let's play!`, clip: "Hi there! Let's play!" }],
  findIntro: (): Line[] => [{ id: 'find-intro', text: "Let's find the keys!" }],
  prompt: (set: ContentSet, item: LearningItem): Line[] => [promptLine(set, item, randomIndex(PROMPTS.length))],
  repeatPrompt: (set: ContentSet, item: LearningItem): Line[] => [findLine(set, item)],
  /** `k` picks the praise so the on-screen label matches what is said. */
  praise: (item: LearningItem, k: number): Line[] => [praiseLine(k), thatsLine(item)],
  tryAgain: (set: ContentSet, item: LearningItem): Line[] => [tryAgainLine(randomIndex(TRY_AGAIN.length)), findLine(set, item)],
  finished: (name: string): Line[] => [{ id: 'finished', text: `You did it, ${name}! Great job!`, clip: 'You did it! Great job!' }],
  playgroundIntro: (): Line[] => [{ id: 'playground-intro', text: 'Press any letter or number!' }],
  playgroundKey: (item: LearningItem): Line[] => [keyLine(item)],
  voiceTest: (name: string): Line[] => [
    { id: 'voice-test', text: `Hello ${name}! Let's find the letter ay.`, clip: "Hello! Let's find the letter [[A]]." },
  ],
};

/** Every line the app can say, for generating a recorded voice. */
export function allLines(): Line[] {
  const lines: Line[] = [
    ...phrases.greeting(''),
    ...phrases.findIntro(),
    ...phrases.finished(''),
    ...phrases.playgroundIntro(),
    ...phrases.voiceTest(''),
    ...PRAISE.map((_, k) => praiseLine(k)),
    ...TRY_AGAIN.map((_, k) => tryAgainLine(k)),
  ];
  for (const set of Object.values(CONTENT_SETS)) {
    for (const item of set.items) {
      PROMPTS.forEach((_, v) => lines.push(promptLine(set, item, v)));
      lines.push(findLine(set, item), thatsLine(item), keyLine(item));
    }
  }
  return lines;
}
