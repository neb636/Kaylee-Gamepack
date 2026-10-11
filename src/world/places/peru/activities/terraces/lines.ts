// Every phrase Tika's Mountain Terraces can speak. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json in this folder.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.) The country's shared speakers live in
// ../../cast.json; speakers only this activity uses go in ./cast.json. Straight apostrophes only (curly ones failed the
// transcription check in PR #63).
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const tika = as('tika')

export const L = {
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
}
