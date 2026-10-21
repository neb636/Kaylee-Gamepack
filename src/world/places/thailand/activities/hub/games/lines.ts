// What the house's mini games say. Greybox: these new lines show as text bubbles (for Dad) and aren't spoken yet;
// at the voice gate they move into ../../../lines.ts and get recorded (node scripts/world-voice-lines.mjs &&
// node scripts/generate-voice.mjs). Until then the games only *speak* lines that already have clips (`VOICED`), so
// nothing plays the iPad's built-in voice or logs a missing clip.
import type { Line } from '../../../../../../sdk'
import { L } from '../../../lines'

const NAME = 'Kaylee'

/** Lines with recorded clips that the games reuse. */
export const VOICED = {
  puttoHi: L.family.putto.hi,
  puttoPlay: L.family.putto.again[0],
  joyHi: L.family.joy.again[1],
  jumHungry: L.family.jum.hi,
  jumPretty: L.home.jum,
  agongThanks: L.home.thanks,
} satisfies Record<string, Line>

/** Not recorded yet: shown, not spoken. */
export const TEXT = {
  ttt: {
    start: 'Tic-tac-toe! You are the hearts!',
    yourTurn: `Your turn, ${NAME}!`,
    hint: 'Tap an empty square!',
    almost: 'Look! One more heart makes a line!',
    win: `Three in a row! You win, ${NAME}!`,
    tie: 'A tie! Again!',
    thinking: 'Hmm...',
  },
  salon: {
    start: `Make me pretty, ${NAME}!`,
    lips: 'Lipstick!',
    cheeks: 'Pink cheeks!',
    eyes: 'Sparkly eyes!',
    earrings: 'Earrings!',
    hair: 'A flower for my hair!',
    necklace: 'A necklace!',
    photo: 'Say cheese!',
    love: 'I love it!',
    garland: 'A jasmine garland! Thai people give them to say thank you!',
  },
  rice: {
    start: "Let's make mango sticky rice!",
    rice: 'Tap the basket for sticky rice!',
    mango: 'Slice the mango! Swipe down!',
    sauce: 'Hold the jug to pour the coconut milk!',
    sprinkle: 'Tap the bowl to sprinkle the crunchy beans!',
    done: 'Mango sticky rice! Yummy!',
    fact: 'In Thailand, sticky rice is cooked in a bamboo basket!',
  },
}
