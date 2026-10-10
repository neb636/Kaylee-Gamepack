// Every phrase that can be spoken in Peru. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Plain strings are Sparkle, the guide: she gives the instructions. Friends say their own story and reaction lines in
// their own voices (see cast.json). Straight apostrophes only: curly ones failed the transcription check in PR #63.
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const luna = as('luna')
const paco = as('paco')
const abuela = as('abuela')
const pepa = as('pepa')
const pingo = as('pingo')
const lobo = as('lobo')

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
  penguinWindow: pepa('My fluffy chicks!'),
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

  // ---- 2. Pepa's Penguin Cliff (the desert coast at Paracas) ----
  penguins: {
    story: [pepa('Hola! My chicks are hungry!')],
    pull: 'Pull a penguin back, then let go!',
    wheee: [pingo('Wheee!'), pingo('Splash!'), pingo('Yippee!')],
    whoa: pingo('Whoa!'),
    blip: pingo('A teeny splash!'),
    sock: pingo('I found a sock!'),
    lobo: [lobo('Hey! You splashed me!'), lobo('Do it again!'), lobo('Ha ha! Seaweed hat!')],
    loboTap: [lobo('Arf arf!'), lobo('I love splashes!'), lobo('Hola, Kaylee!')],
    fishGo: 'Jump near the shiny fish!',
    orders: [pepa('One fish, please!'), pepa('Two fish, please!'), pepa('Three fish, please!')],
    count: ['One!', 'Two!', 'Three!'],
    feed: pepa(`Feed my chicks, ${NAME}!`),
    yum: [pepa('Yummy!'), pepa('So round and fluffy!'), pepa('Gracias!')],
    egg: `${NAME}, look! The egg is wiggling!`,
    hatch: pepa('A new baby!'),
    pelican: 'A pelican wants fish too!',
    swimGo: 'The chicks are ready to swim! Pull them back!',
    firstSwim: pepa('Their very first swim!'),
    thanks: pepa(`Gracias, ${NAME}!`),
    photo: "Click! A picture for Luna's journal!",
    pepaTap: [pepa(`Hola, ${NAME}!`), pepa('My babies love fish!')],
    tern: 'These birds have white mustaches!',
    facts: ['Peru has penguins!', 'The ocean here is cold and full of fish!', 'Penguins fly underwater with their wings!'],
    idle: {
      launch: 'Pull a penguin back, then let go!',
      fish: 'Jump near the shiny fish!',
      feed: 'Tap a chick to feed it!',
      swim: 'Pull a chick back, then let go!',
    },
  },
  penguinSticker: 'Penguin sticker! Penguins live in Peru too!',

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
