// Every phrase Rosa's Rainy River can speak. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json in this folder.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.) The country's shared speakers live in
// ../../cast.json; speakers only this activity uses go in ./cast.json. Straight apostrophes only (curly ones failed the
// transcription check in PR #63).
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const rosa = as('rosa')
const sloth = as('sloth')
const capy = as('capy')
const monkey = as('monkey')

export const L = {
  riverWindow: rosa('My rainbow river!'),
  // ---- 4. Rosa's Rainy River (make it rain in the Amazon) ----
  river: {
    story: [rosa('Hola! I want to visit my forest friends!')],
    squeeze: 'Squeeze the cloud to make rain!',
    // Things in the forest answer the rain (the sloth and Sparkle talk; the rest is sounds and motion).
    slothWake: sloth('Hiiiiii...'),
    slothYawn: sloth('Ooh... a shower...'),
    wet: "I'm all wet! Hee hee!",
    river: 'Make it rain on the river!',
    more: rosa('Wheee! More water!'),
    // Each step of the river lets Rosa reach a friend.
    hello: {
      capy: [rosa('Hola, capybaras!'), capy('Ahh... a swim!')],
      sloth: [rosa('Hola, sloth!'), sloth('Hiii, Rosa...')],
      monkey: [rosa('Hola, monkeys!'), monkey('Splash! Splash!')],
    },
    flooded: 'The river grows into the forest!',
    lagoonGo: rosa("Let's swim to the lagoon!"),
    lagoon: 'Rain on the lagoon!',
    buds: 'Rain on the lily buds!',
    pads: 'Lily pads! Help the friends hop on!',
    hop: { frog: 'Hop, frog!', monkey: monkey('Wheee!'), capy: capy('Comfy!'), macaw: 'Flap, flap, macaw!' },
    sun: 'Bye-bye, cloud! Hello, sun!',
    rainbow: rosa(`A rainbow! Gracias, ${NAME}!`),
    photo: 'Click! A picture for Luna!',
    spout: [rosa('Hee hee!'), rosa('Pfff! Bubbles!'), rosa('Splashy!')],
    rosaTap: rosa('I live in a river, not the sea!'),
    facts: ['This dolphin lives in a river!', 'Half of Peru is rainforest!', 'The river grows into the forest!', 'Some fish eat fruit!'],
    fruit: 'Some fish eat fruit!',
    idle: {
      squeeze: 'Hold the cloud to make rain!',
      river: 'Drag the cloud over the river!',
      lagoon: 'Drag the cloud over the lagoon!',
      pads: 'Drag a friend onto a lily pad!',
    },
    sticker: 'Pink dolphin sticker! These dolphins live in rivers!',
  },
}
