// Every phrase Luna's Fluffy Day can speak. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json in this folder.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.) The country's shared speakers live in
// ../../cast.json; speakers only this activity uses go in ./cast.json. Straight apostrophes only (curly ones failed the
// transcription check in PR #63).
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const luna = as('luna')
const paco = as('paco')
const abuela = as('abuela')

export const L = {
  alpacaWindow: luna('My cozy alpaca family!'),

  // ---- 1. Luna's Fluffy Day (the alpaca salon) ----
  fluffy: {
    story: [luna("My fleece is so long, I can't see!")],
    brush: `Brush Luna's fleece, ${NAME}!`,
    found: {
      burr: luna('Ouch! Prickly!'),
      twig: luna('A twig!'),
      dandelion: luna('Achoo!'),
      bird: luna('A baby bird!'),
      beetle: luna('Bye-bye, beetle!'),
    },
    see: luna(`I can see you, ${NAME}!`),
    hum: 'Alpacas hum when they are happy!',
    clippers: 'Now the clippers! Snip snip!',
    pond: 'Done? Tap the pond to show Luna!',
    mustache: luna('Hee hee! A mustache!'),
    mirror: { silly: luna('I look so silly!'), pretty: luna('So pretty!'), skinny: luna('Brrr! Hat please!') },
    chilly: luna("Brrr! It's chilly up here!"),
    family: [paco('Me next! Me next!'), abuela('My turn, dear.')],
    familyGo: 'Paco and Abuela want haircuts too!',
    tickle: [paco('Hee hee! That tickles!'), paco('Not my tummy!'), paco('Ha ha ha!')],
    roll: paco('Too tickly!'),
    sleepy: abuela('Oh, I am so sleepy...'),
    snore: abuela('Five more minutes...'),
    doneCold: { paco: paco('Brrr! Chilly!'), abuela: abuela('Oh my! Brrr!') },
    yarn: 'The wool is yarn now! Tap the cactus!',
    bug: 'A tiny bug makes pink color!',
    dropGo: 'Drag the pink drop to the yarn!',
    pink: 'Pink yarn! Pink hats!',
    hats: 'Put a warm hat on each alpaca!',
    cozy: { luna: luna('Cozy!'), paco: paco('Yay! Warm ears!'), abuela: abuela('Thank you, dear!') },
    photo: luna('Click! A picture for my journal!'),
    colors: 'Alpacas come in lots of colors!',
    idle: {
      brush: "Rub the brush on Luna's fleece!",
      clip: 'Snip the fluffy puffs!',
      cactus: 'Tap the cactus!',
      hats: 'Drag a hat onto an alpaca!',
    },
  },

  sticker: 'Alpaca sticker! Alpacas have soft, warm fleece!',
}
