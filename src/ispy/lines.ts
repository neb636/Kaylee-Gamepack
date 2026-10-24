// Every phrase Sparkle can say on the I Spy shelf. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
const NAME = 'Kaylee'

export const SHELF_LINES = {
  title: 'I Spy!',
  hello: `Pick a book, ${NAME}!`,
  soon: 'More books are coming soon!',
  tickle: 'Hee hee! I love I Spy!',
}
