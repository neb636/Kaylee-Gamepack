// Every phrase that can be spoken in Thailand. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Thailand's friends are Kaylee's own family, as animal characters (planning/around-the-world/thailand.md). Agong's
// house is a greybox for now (gate 1) and says nothing yet: the family get their voices in gate 3. Until then only the
// passport, the facts and the trophy speak (Sparkle). Straight apostrophes only: curly ones failed the transcription
// check in PR #63.
const NAME = 'Kaylee'

export const L = {
  // The shell's trophy ceremony and the trophy room speak these.
  trophyWin: `${NAME}, you did it! You won the Thailand Explorer trophy!`,
  trophyRoom: `${NAME}, Thailand Explorer! From Thailand.`,
  passport: 'This is Thailand! Tap a picture to explore.',
  facts: {
    hello: 'In Thailand, we say Sawasdee to say hello!',
    elephant: "The elephant is Thailand's special animal!",
    chang: 'In Thai, chang means elephant!',
    flag: "Thailand's flag is red, white and blue!",
  },
}
