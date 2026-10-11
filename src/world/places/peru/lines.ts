// Every phrase that can be spoken in Peru. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Plain strings are Sparkle, the guide: she gives the instructions. Friends say their own story and reaction lines in
// their own voices (see cast.json). Straight apostrophes only: curly ones failed the transcription check in PR #63.
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const luna = as('luna')
const paco = as('paco')
const abuela = as('abuela')
const tika = as('tika')

export const L = {
  name: 'Peru',
  trophyWin: `${NAME}, you did it! You won the Peru Explorer trophy!`,
  trophyRoom: `${NAME}, Peru Explorer! From Peru.`,

  // ---- Hub: Luna's map of Peru ----
  intro: [luna(`Hola, ${NAME}! I'm Luna!`), luna("Let's fill my explorer journal!")],
  hub: 'Tap a picture to explore Peru!',
  hubNext: luna(`Another discovery, ${NAME}!`),
  soon: 'This place opens soon!',
  balloonSoon: 'Our balloon trip comes soon!',
  tickle: [luna('Hee hee!'), luna('I love exploring with you!')],
  journal: luna('My explorer journal!'),
  alpacaWindow: luna('My cozy alpaca family!'),
  // Tap the map: Peru's three worlds.
  worlds: {
    coast: 'By the sea, Peru has a sandy desert!',
    mountains: 'The Andes mountains are tall and cold!',
    forest: 'Half of Peru is rainforest!',
  },

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

  // ---- 5. Tika's Mountain Terraces (Machu Picchu: fit the stones, build the terraces) ----
  terraces: {
    story: [tika('Oh no! Our grass steps fell down!')],
    go: `Fit the stones back in, ${NAME}!`,
    clonk: [tika('Clonk!'), tika('It fits!'), tika('Like a puzzle!'), tika('Perfect!')],
    glow: 'Look for the glowing spot!',
    wallDone: [tika('Our terrace is back!'), tika('Yum! Fresh grass!'), tika('Another step!'), tika('We made it to the top!')],
    seeds: 'What should we grow here?',
    grew: { potato: tika('Potatoes!'), corn: tika('Corn!'), flower: tika('Flowers!') },
    next: 'Build the next step!',
    friends: tika('Come on up, friends!'),
    corners: 'This stone has so many corners!',
    clouds: tika("So many clouds! I can't see!"),
    top: 'The last wall! Up in the clouds!',
    reveal: `${NAME}, look! Machu Picchu!`,
    photo: "Tap the camera for Luna's journal!",
    bomb: [tika('Me too!'), tika('Cheese!'), tika('My best side!'), tika('Say llama!'), tika('One more!')],
    journal: tika("A picture for Luna's journal!"),
    dance: tika('Dance, dance, dance!'),
    innocent: tika('Who, me?'),
    hey: tika('Hey! A stage!'),
    tickle: [tika('Hee hee!'), tika('Hola!'), tika('Munch munch.')],
    bear: 'A shy spectacled bear!',
    potatoes: 'Peru has thousands of kinds of potatoes!',
    puzzle: 'The stones fit together like a puzzle!',
    carry: 'Llamas can carry things up the mountain!',
    idle: { stone: 'Drag a stone into a hole!', seed: 'Tap a seed bag to plant it!', photo: 'Tap the camera!' },
  },
  terracesWindow: tika('Me at Machu Picchu!'),
  terracesSticker: 'Llama sticker! Llamas can carry things up mountains!',

  sticker: 'Alpaca sticker! Alpacas have soft, warm fleece!',
  facts: {
    location: 'Peru is in South America!',
    worlds: 'Peru has a coast, mountains, and rainforest!',
    hello: 'Hola means hello in Spanish!',
    languages: 'People in Peru also speak Quechua and Aymara!',
    penguins: 'Peru has penguins on its desert coast!',
    alpacas: 'Alpacas live high in the mountains!',
    machuPicchu: 'The Inca built Machu Picchu long ago!',
    potatoes: 'Peru has thousands of kinds of potatoes!',
    flag: "Peru's flag is red, white, red!",
    bird: "Peru's bird is bright orange!",
  },
  passport: 'This is Peru! Tap a picture to explore.',
}
