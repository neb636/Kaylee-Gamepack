// Every phrase that can be spoken in Peru. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Plain strings are Sparkle, the guide: she gives the instructions. Friends say their own story and reaction lines in
// their own voices (see cast.json). Straight apostrophes only: curly ones failed the transcription check in PR #63.
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const luna = as('luna')
const paco = as('paco')
const abuela = as('abuela')
const coco = as('coco')
const pluma = as('pluma')
const rosa = as('rosa')
const sloth = as('sloth')
const capy = as('capy')
const monkey = as('monkey')

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
  riverWindow: rosa('My rainbow river!'),
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
