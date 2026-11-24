!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e._posthogReleaseId=e._posthogReleaseId||"01a20e7e-6bee-0000-8af1-cacc378c075c";var n=(new e.Error).stack;n&&(e._posthogChunkIds=e._posthogChunkIds||{},e._posthogChunkIds[n]="490631ba-3658-566f-be4a-0c357b7365e9")}catch(e){}}();
var e=`// Every phrase that can be spoken in Peru. \`node scripts/world-voice-lines.mjs\` turns this into voice-lines.json.
// (This file is also read by Node, so it imports only sdk/device.ts, which imports nothing.)
// Plain strings are Sparkle, the guide: she gives the instructions. Friends say their own story and reaction lines in
// their own voices (see cast.json). Straight apostrophes only: curly ones failed the transcription check in PR #63.
import { onDevice } from '../../../sdk/device.ts'
const as = (voice: string) => (text: string) => ({ text, voice })
const luna = as('luna')
const paco = as('paco')
const abuela = as('abuela')
const tika = as('tika')
const pepa = as('pepa')
const pingo = as('pingo')
const lobo = as('lobo')
const rosa = as('rosa')
const sloth = as('sloth')
const capy = as('capy')
const monkey = as('monkey')
const otter = as('otter')

export const L = {
  name: 'Peru',
  trophyWin: \`You did it! You won the Peru Explorer trophy!\`,
  trophyRoom: \`Peru Explorer! From Peru.\`,

  // ---- Hub: Luna's map of Peru ----
  intro: [luna(\`Hola! I'm Luna!\`), luna("Let's fill my explorer journal!")],
  hub: onDevice('Tap a picture to explore Peru!', 'Click a picture to explore Peru!'),
  hubNext: luna(\`Another discovery!\`),
  soon: 'This place opens soon!',
  balloonSoon: 'Our balloon trip comes soon!',
  tickle: [luna('Hee hee!'), luna('I love exploring with you!')],
  journal: luna('My explorer journal!'),
  alpacaWindow: luna('My cozy alpaca family!'),
  penguinWindow: pepa('My fluffy chicks!'),
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
    brush: \`Brush Luna's fleece!\`,
    found: {
      burr: luna('Ouch! Prickly!'),
      twig: luna('A twig!'),
      dandelion: luna('Achoo!'),
      bird: luna('A baby bird!'),
      beetle: luna('Bye-bye, beetle!'),
    },
    see: luna(\`I can see you!\`),
    hum: 'Alpacas hum when they are happy!',
    clippers: 'Now the clippers! Snip snip!',
    pond: onDevice('Done? Tap the pond to show Luna!', 'Done? Click the pond to show Luna!'),
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
    yarn: onDevice('The wool is yarn now! Tap the cactus!', 'The wool is yarn now! Click the cactus!'),
    bug: 'A tiny bug makes pink color!',
    dropGo: 'Drag the pink drop to the yarn!',
    pink: 'Pink yarn! Pink hats!',
    hats: 'Put a warm hat on each alpaca!',
    cozy: { luna: luna('Cozy!'), paco: paco('Yay! Warm ears!'), abuela: abuela('Thank you, dear!') },
    photo: luna('Click! A picture for my journal!'),
    colors: 'Alpacas come in lots of colors!',
    idle: {
      brush: onDevice("Rub the brush on Luna's fleece!", "Drag the brush on Luna's fleece!"),
      clip: 'Snip the fluffy puffs!',
      cactus: onDevice('Tap the cactus!', 'Click the cactus!'),
      hats: 'Drag a hat onto an alpaca!',
    },
  },

  // ---- 5. Tika's Mountain Terraces (Machu Picchu: fit the stones, build the terraces) ----
  terraces: {
    story: [tika('Oh no! Our grass steps fell down!')],
    go: \`Fit the stones back in!\`,
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
    reveal: \`Look! Machu Picchu!\`,
    photo: onDevice("Tap the camera for Luna's journal!", "Click the camera for Luna's journal!"),
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
    idle: { stone: 'Drag a stone into a hole!', seed: onDevice('Tap a seed bag to plant it!', 'Click a seed bag to plant it!'), photo: onDevice('Tap the camera!', 'Click the camera!') },
  },
  terracesWindow: tika('Me at Machu Picchu!'),
  terracesSticker: 'Llama sticker! Llamas can carry things up mountains!',
  // ---- 2. Pepa's Penguin Cliff (the desert coast at Paracas) ----
  penguins: {
    story: [pepa('Hola! My chicks are hungry!')],
    pull: onDevice('Pull a penguin back, then let go!', 'Click a penguin, pull it back, then let go!'),
    wheee: [pingo('Wheee!'), pingo('Splash!'), pingo('Yippee!')],
    whoa: pingo('Whoa!'),
    blip: pingo('A teeny splash!'),
    sock: pingo('I found a sock!'),
    lobo: [lobo('Hey! You splashed me!'), lobo('Do it again!'), lobo('Ha ha! Seaweed hat!')],
    loboTap: [lobo('Arf arf!'), lobo('I love splashes!'), lobo('Hola!')],
    fishGo: 'Catch fish for the chicks!',
    aim: 'Land in the gold circle!',
    got: [pingo('Got one!'), pingo('A fish!')],
    orders: [pepa('One fish, please!'), pepa('Two fish, please!'), pepa('Three fish, please!')],
    count: ['One!', 'Two!', 'Three!'],
    feed: pepa(\`Feed my chicks!\`),
    yum: [pepa('Yummy!'), pepa('So round and fluffy!'), pepa('Gracias!')],
    egg: \`Look! The egg is wiggling!\`,
    hatch: pepa('A new baby!'),
    pelican: 'A pelican wants fish too!',
    swimGo: 'The chicks are ready to swim! Pull them back!',
    firstSwim: pepa('Their very first swim!'),
    thanks: pepa(\`Gracias!\`),
    photo: "Click! A picture for Luna's journal!",
    pepaTap: [pepa(\`Hola!\`), pepa('My babies love fish!')],
    tern: 'These birds have white mustaches!',
    facts: ['Peru has penguins!', 'The ocean here is cold and full of fish!', 'Penguins fly underwater with their wings!'],
    idle: {
      launch: onDevice('Pull a penguin back, then let go!', 'Click a penguin, pull it back, then let go!'),
      fish: 'Jump onto the fish to catch one!',
      feed: onDevice('Tap a chick to feed it!', 'Click a chick to feed it!'),
      swim: onDevice('Pull a chick back, then let go!', 'Click a chick, pull it back, then let go!'),
    },
  },
  penguinSticker: 'Penguin sticker! Penguins live in Peru too!',
  // ---- 3. Swim with Rosa (the flooded forest: swim her, leap for the fruit, race the otters) ----
  river: {
    // The story: one line from Rosa, then her hands are busy.
    story: [rosa('The river is in the treetops!')],
    // Sparkle, as the forest appears.
    swim: onDevice('Hold Rosa and swim!', 'Click and hold Rosa to swim!'),
    // Rosa reaches the capybaras; the baby climbs on her back for a ride.
    capy: [rosa('Hola, capybaras!'), capy('Ahh... a swim!')],
    // Under the sleeping sloth. Sparkle, once.
    leap: 'Swim up fast to leap!',
    // The splash wakes the sloth.
    sloth: [sloth('Ooh... a shower...'), rosa('Hola, sloth!')],
    // The monkeys, when Rosa swims under their fruit.
    monkeys: monkey('Fruit! Leap for the fruit!'),
    // A monkey, each time a fruit falls in the water (one of these).
    fruitDown: [monkey('Splash! Splash!'), monkey('Wheee!'), monkey('You got it!')],
    // Sparkle, the first time the fish come to nibble a fruit.
    fruit: 'Some fish eat fruit!',
    // A monkey lets a fruit down a little after two leaps that missed it.
    lower: monkey('Here! Lower!'),
    // The otters pop up past the fruit tree.
    dare: otter('Race you to the rainbow!'),
    go: otter('Ready... go!'),
    // An otter, if she turns back or stops during the race.
    comeOn: otter('Come on, Rosa!'),
    // She bumps a log.
    bonk: rosa('Oopsie! Bonk!'),
    // The finish. She wins most of the time.
    win: [otter('You win! So fast!'), rosa('Wheee! Gracias!')],
    // The otters got there first: one more go, or on to the stamp.
    lose: otter('So close! Again?'),
    // Taps: Rosa (a spout and one of these, then her fact), the sloth, the sleepy capybara.
    spout: [rosa('Hee hee!'), rosa('Pfff! Bubbles!'), rosa('Splashy!')],
    rosaTap: rosa('I live in a river, not the sea!'),
    slothTap: sloth('Hiiiiii...'),
    // Sparkle, the first time she pokes Rosa, a bird or a tree trunk.
    facts: { rosa: 'This dolphin lives in a river!', forest: 'Half of Peru is rainforest!', flood: 'The river grows into the forest!' },
    // Sparkle, when nothing has happened for a while (before the sloth it's her first line again).
    idle: {
      sloth: 'Splash the sleepy sloth!',
      fruit: 'Leap up to the fruit!',
      race: 'Swim to the rainbow!',
    },
    sticker: 'Pink dolphin sticker! These dolphins live in rivers!',
  },

  sticker: 'Alpaca sticker! Alpacas have soft, warm fleece!',
  videos: {
    machuPicchu: 'Want to see Machu Picchu?',
    penguins: 'Want to see real penguins?',
    alpacas: 'Want to see real alpacas?',
    dolphin: 'Want to see river dolphins?',
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
  passport: onDevice('This is Peru! Tap a picture to explore.', 'This is Peru! Click a picture to explore.'),
}
`;export{e as default};
//# chunkId=490631ba-3658-566f-be4a-0c357b7365e9