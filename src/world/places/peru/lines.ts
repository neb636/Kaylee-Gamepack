// Every phrase that can be spoken in Peru. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Plain strings are Sparkle, the guide: she gives the instructions. Friends say their own story and reaction lines in
// their own voices (see cast.json). Straight apostrophes only: curly ones failed the transcription check in PR #63.
// Lines for each activity live next to it, in activities/<id>/lines.ts, so activities built in parallel never edit this file.
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const luna = as('luna')

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
  // Tap the map: Peru's three worlds.
  worlds: {
    coast: 'By the sea, Peru has a sandy desert!',
    mountains: 'The Andes mountains are tall and cold!',
    forest: 'Half of Peru is rainforest!',
  },
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
