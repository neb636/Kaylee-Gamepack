// Every phrase that can be spoken in Thailand. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Plain strings are Sparkle, the guide. Thailand's friends will be Kaylee's family as animal characters; until Dad
// describes them, Sparkle says everything. Every string here is spoken, so keep labels out of this file.
// Straight apostrophes only: curly ones failed the transcription check in PR #63.
const NAME = 'Kaylee'

export const L = {
  // The shell's trophy ceremony and the trophy room speak these.
  trophyWin: `${NAME}, you did it! You won the Thailand Explorer trophy!`,
  trophyRoom: `${NAME}, Thailand Explorer! From Thailand.`,

  // ---- Hub: the map of Thailand ----
  intro: [`Sawasdee, ${NAME}!`, 'Thailand is the land of elephants!'],
  hub: 'Tap the elephant cafe!',
  hubNext: `What a yummy trip, ${NAME}!`,
  soon: 'More of Thailand comes soon!',
  partySoon: 'Our Thailand party comes soon!',
  tickle: ['Hee hee!', 'I love Thailand!'],
  map: {
    sea: 'This is the Andaman Sea! It is warm and blue!',
    north: 'Up north, there are tall green mountains!',
    city: 'Bangkok is the big busy city!',
  },
  sticker: 'Elephant sticker! Elephants eat all day long!',
  passport: 'This is Thailand! Tap a picture to explore.',
  facts: {
    hello: 'In Thailand, we say Sawasdee to say hello!',
    elephant: "The elephant is Thailand's special animal!",
    chang: 'In Thai, chang means elephant!',
    flag: "Thailand's flag is red, white and blue!",
  },

  // ---- Baan Chang Cafe: drinks upstairs, elephants downstairs ----
  cafe: {
    story: ['Welcome to Baan Chang!', 'Coffee for Daddy first!'],
    ice: 'Drop in the ice!',
    coffee: 'Tip the coffee in!',
    milk: 'Now pour the milk!',
    straw: 'Pop in a straw!',
    deliver: 'Bring Daddy his coffee!',
    daddy: 'Daddy loves it!',
    cocoa: 'Now chocolate milk for you!',
    syrup: 'Squeeze in the chocolate!',
    stir: 'Stir, stir, stir!',
    pick: 'Pick a straw!',
    cream: 'Whipped cream on top?',
    stairs: "Let's go see the elephants!",
    overflow: 'Whoa! Too full!',
  },
  yard: {
    bananas: 'Hold a banana up to a trunk!',
    hint: 'Hold the food near a trunk!',
    favorites: 'Look! Each elephant wants a snack!',
    bubble: 'Look in the bubble!',
    toss: 'Hee hee! Not that one!',
    watermelon: 'A big watermelon! Give it to a grown-up elephant!',
    tooBig: 'Too big for the baby!',
    slices: 'Now the baby can eat it!',
    sneaky: 'Hey! That is your chocolate milk!',
    full: 'The elephants are full! Thank you!',
    yum: [`Yum! Great job, ${NAME}!`, 'Crunch, crunch!', 'Mmm, yummy!'],
    count: ['One!', 'Two!', 'Three!'],
  },
}
