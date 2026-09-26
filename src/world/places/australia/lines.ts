// Every phrase that can be spoken in Australia. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Plain strings are Sparkle, the guide: she gives the instructions. Friends say their own story and reaction lines in
// their own voices (see cast.json), and their puppets move their mouths while they talk.
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const pip = as('pip')
const mama = as('mama')
const koko = as('koko')
const COUNT = ['one', 'two', 'three', 'four', 'five']

export const L = {
  name: 'Australia',
  intro: [pip(`G'day, ${NAME}! I'm Pip the kangaroo!`), pip("G'day means hello! Help with my party?")],
  hubFirst: pip('Tap a spot on the map!'),
  hubNext: pip(`Where should we go next, ${NAME}?`),
  hubParty: pip('Everyone is here! Tap the party!'),
  partyLocked: pip('Get all five stamps to start the party!'),
  trophyWin: `${NAME}, you did it! You won the Australia Explorer trophy!`,
  trophyRoom: `${NAME}, Australia Explorer! From Australia.`,
  tickle: {
    pip: [pip('Hee hee! That tickles!'), pip("Boing! I love hopping!")],
    koko: [koko('Hehe! Cuddles!'), koko('Mmm, I love gum leaves.')],
    mama: [mama("That's my Pip!")],
  },

  outback: {
    story: pip("Welcome to the outback! It's hot and dry here."),
    pack: 'Give Pip the things she needs for the hot sun!',
    hat: pip('A sun hat for shade!'),
    glasses: pip('Sunglasses for the bright sun!'),
    water: pip('Water to drink in the heat!'),
    brrr: pip("Brrr? No way! It's hot in the outback!"),
    ready: pip("I'm ready! Let's hop!"),
    hop3: 'Tap to make Pip hop! Hop three times to the water hole.',
    count: COUNT.map(pip),
    splash: pip('Splash! A water hole!'),
    hop5: 'Now hop five times to Uluru, the big red rock!',
    mama: mama('There you are, Pip! Hop into my pouch!'),
    pouch: pip("Baby kangaroos ride in their mama's pouch!"),
  },
  forest: {
    story: koko("I'm Koko the koala! I'm sooo hungry!"),
    feed2: 'Feed Koko two gum leaves!',
    feed4: 'Now feed her four leaves!',
    count: COUNT.slice(0, 4).map(koko),
    only: koko('Yuck! Koalas only eat gum leaves!'),
    more: koko('Mmm! More, please!'),
    yawn: koko('Yawn! Koalas sleep almost all day.'),
    lullaby: 'Tap the notes to sing Koko a lullaby!',
    asleep: 'Shh! Koko is fast asleep.',
  },
  reef: {
    story: ["Let's dive into the Great Barrier Reef!"],
    find: {
      turtle: 'Find the sea turtle!',
      clownfish: 'Find the clownfish!',
      starfish: 'Find the starfish!',
      octopus: 'Find the octopus! It likes to hide.',
    },
    found: {
      turtle: 'You found Shelly the sea turtle!',
      clownfish: 'You found the clownfish!',
      starfish: 'You found the starfish!',
      octopus: 'You found the octopus! It has eight arms!',
    },
    thats: {
      turtle: "That's the sea turtle!",
      clownfish: "That's a clownfish!",
      starfish: "That's a starfish!",
      octopus: "That's the octopus!",
      crab: "That's a crab!",
      puffer: "That's a puffer fish!",
      shell: "That's a seashell!",
    },
  },
  stars: {
    story: 'At night in Australia, you can see the Southern Cross stars!',
    tap: 'Tap the five twinkly stars!',
    found: 'You found the Southern Cross!',
    onFlag: "The stars are on Australia's flag!",
    drag: 'Drag the big star onto the flag!',
    seven: 'The big star has seven points!',
    which: "Which one is Australia's flag?",
    hint: 'Look for the stars you found!',
  },
  postcard: {
    story: "Let's color a postcard from the beach to send home!",
    how: 'Pick a color, then tap to paint!',
    send: 'Tap send when you are done!',
    gday: pip("G'day, mate! In Australia, mate means friend."),
  },
  party: {
    story: pip('Party time at the Sydney Opera House!'),
    tap: 'Tap each friend to make them dance!',
    mama: mama(`G'day, ${NAME}! Thanks for helping Pip!`),
    koko: koko('Yum! Thanks for the gum leaves!'),
    shelly: as('shelly')('Hello from the reef!'),
    kooky: as('kooky')('Ha ha ha! Kookaburras love to laugh!'),
    pat: as('pat')("I'm Pat the platypus! Hooray!"),
    fireworks: 'Sydney has some of the biggest fireworks in the world!',
    thanks: pip(`Thank you, ${NAME}! You're a true Aussie mate!`),
  },
  stickers: {
    kangaroo: 'Kangaroo sticker! Kangaroos can only hop forward, never backward!',
    koala: 'Koala sticker! A baby koala is called a joey, just like a kangaroo!',
    turtle: 'Sea turtle sticker! Sea turtles lived when the dinosaurs did!',
    kookaburra: 'Kookaburra sticker! Kookaburras sound like they are laughing!',
    platypus: 'Platypus sticker! A platypus has a bill like a duck!',
  },
  facts: {
    weather: 'Much of Australia is hot and sunny, with big dry deserts.',
    hello: "In Australia, people say G'day! It means hello!",
    christmas: 'In Australia, Christmas comes in summer! Beach day!',
    animals: 'Kangaroos, koalas and platypuses all live in Australia!',
    opera: 'The Sydney Opera House looks like big white sails!',
    continent: 'Australia is a country and a whole continent!',
    reef: "The Great Barrier Reef is so big, you can see it from space!",
  },
  passport: 'This is Australia! Tap a picture to learn more.',
}
