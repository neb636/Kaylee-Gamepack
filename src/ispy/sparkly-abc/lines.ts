// Every phrase Sparkle can say in Sparkly I Spy. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
const NAME = 'Kaylee'

/** One thing per letter, the answer on that letter's page (and a picture to find on the other pages). */
export const WORDS = {
  A: 'Apple',
  B: 'Butterfly',
  C: 'Cupcake',
  D: 'Dolphin',
  E: 'Elephant',
  F: 'Flamingo',
  G: 'Gift',
  H: 'Heart',
  I: 'Ice cream',
  J: 'Jellyfish',
  K: 'Kitten',
  L: 'Lollipop',
  M: 'Mermaid',
  N: 'Necklace',
  O: 'Owl',
  P: 'Puppy',
  Q: 'Queen',
  R: 'Rainbow',
  S: 'Strawberry',
  T: 'Teddy bear',
  U: 'Unicorn',
  V: 'Violin',
  W: 'Wand',
  X: 'Xylophone',
  Y: 'Yo-yo',
  Z: 'Zebra',
} as const
export type Letter = keyof typeof WORDS

const each = (line: (letter: string, word: string) => string) => Object.fromEntries(Object.entries(WORDS).map(([l, w]) => [l, line(l, w)])) as Record<Letter, string>

export const L = {
  title: 'Sparkly I Spy',
  open: `Let's play I Spy, ${NAME}!`,
  spy: each((l) => `I spy something beginning with ${l}!`),
  found: each((l, w) => `${l} is for ${w.toLowerCase()}!`),
  other: each((l, w) => `${w} starts with ${l}!`),
  stuck: `Look, ${NAME}! Something is wiggling!`,
  turn: 'Turn the page!',
  end: `You found them all, ${NAME}!`,
  tickle: ['Hee hee! Keep looking!', 'Tee hee! I love I Spy!'],
  trophyWin: `${NAME}, you did it! You won the I Spy Star trophy!`,
  trophyRoom: `${NAME}, I Spy Star! From Sparkly I Spy.`,
}
