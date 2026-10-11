// Every phrase Pepa's Penguin Cliff can speak. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json in this folder.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.) The country's shared speakers live in
// ../../cast.json; speakers only this activity uses go in ./cast.json. Straight apostrophes only (curly ones failed the
// transcription check in PR #63).
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const pepa = as('pepa')
const pingo = as('pingo')
const lobo = as('lobo')

export const L = {
  penguinWindow: pepa('My fluffy chicks!'),
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
}
