// Every phrase Coco's Canyon Glide can speak. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json in this folder.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.) The country's shared speakers live in
// ../../cast.json; speakers only this activity uses go in ./cast.json. Straight apostrophes only (curly ones failed the
// transcription check in PR #63).
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const coco = as('coco')
const pluma = as('pluma')

export const L = {
  // ---- 3. Coco's Canyon Glide (Colca Canyon: condors soar on warm air) ----
  canyon: {
    story: [coco('My chick Pluma is scared to fly.')],
    grab: 'Grab Coco and show her how!',
    warm: 'Fly into the warm air!',
    upWeGo: coco('Ahh, warm air! Up we go!'),
    needWarm: coco('I need warm air to go up!'),
    whoosh: coco('Whoooosh!'),
    sneeze: coco('Achoo!'),
    scared: pluma("It's so high!"),
    callPluma: coco('Come on, Pluma! Fly with me!'),
    pTry: pluma("I'll try! Here I come!"),
    lead: 'Lead Pluma to the shiny circles!',
    wait: pluma('Wait for me!'),
    wheee: pluma('Wheee!'),
    dizzy: pluma("I'm dizzy!"),
    falls: pluma('Ooh, a waterfall!'),
    condors: coco('Hello, friends!'),
    lookout: pluma('People are waving!'),
    smile: coco('Smile for the photo!'),
    sunMoved: 'The sun moved! Find the new warm air!',
    top: 'Fly to the very top!',
    alone: pluma('I can fly by myself!'),
    solo: `Now you fly Pluma, ${NAME}!`,
    bigSwirl: 'Fly Pluma into the big swirl!',
    lookMe: pluma(`Look at me, ${NAME}!`),
    proud: coco(`My Pluma can fly! Gracias, ${NAME}!`),
    photo: "Click! A picture for Luna's journal!",
    nestTap: pluma('Hi, Dad!'),
    idle: {
      grab: 'Grab Coco and fly!',
      places: 'Fly to a shiny circle!',
    },
    facts: ['Condors hardly flap their wings!', 'Condor wings are wider than a grown-up is tall!', 'This canyon is super deep!', 'The sun warms the air, and warm air rises!'],
  },
  condorWindow: pluma('I can fly!'),
  condorSticker: 'Condor sticker! Condors soar on warm air!',
}
