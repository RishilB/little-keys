import type { ContentSet, LearningItem } from './characters';

/** All narration lives here so wording stays short, gentle and consistent. */

function pick<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

export const phrases = {
  greeting: (name: string) => `Hi ${name}! Let's play!`,
  findIntro: () => `Let's find the keys!`,
  prompt: (set: ContentSet, item: LearningItem) =>
    pick([
      `Can you find the ${set.noun} ${item.spoken}?`,
      `Press the ${set.noun} ${item.spoken}.`,
      `Where is the ${set.noun} ${item.spoken}?`,
    ]),
  repeatPrompt: (set: ContentSet, item: LearningItem) => `Find the ${set.noun} ${item.spoken}.`,
  praise: (item: LearningItem) =>
    pick([`Good job! That's ${item.spoken}!`, `Yay! You found ${item.spoken}!`, `Well done! ${item.spoken}!`]),
  tryAgain: (item: LearningItem) => pick([`Let's try again. Find ${item.spoken}.`, `Try again. Find ${item.spoken}.`]),
  finished: (name: string) => `You did it, ${name}! Great job!`,
  playgroundIntro: () => `Press any letter or number!`,
  playgroundKey: (item: LearningItem) => item.spoken,
  voiceTest: (name: string) => `Hello ${name}! Let's find the letter ay.`,
};

/** Short on-screen labels that pair with the spoken feedback. */
export const labels = {
  praise: ['Good job!', 'Yay!', 'Well done!'],
  tryAgain: 'Try again!',
};
