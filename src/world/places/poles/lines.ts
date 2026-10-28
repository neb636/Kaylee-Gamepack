// Every phrase that can be spoken at the Poles. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.) Plain strings are Sparkle, the guide:
// she says what to do. The friends say their own story and reaction lines in their own voices (cast.json): Pola the
// polar bear cub and Mama Bear up north, Pebble the emperor chick and Papa down south, Terry the Arctic tern who visits
// both. Each activity has its own block below (one per PR, so they don't collide). Keep lines under ~3 seconds, and the
// name for the big moments only. Straight apostrophes only: curly ones failed the transcription check in PR #63.
const NAME = 'Kaylee'

// A friend speaking: pola("Hi!") is { text: "Hi!", voice: "pola" }. (Exported, so a block that has no lines yet compiles.)
const by = (voice: string) => (text: string) => ({ text, voice })
export const pola = by('pola')
export const mama = by('mama')
export const pebble = by('pebble')
export const papa = by('papa')
export const terry = by('terry')

export const L = {
  // The shell's trophy ceremony and the trophy room speak these.
  trophyWin: `${NAME}, you did it! You won the Polar Explorer trophy!`,
  trophyRoom: `${NAME}, Polar Explorer! From The Poles.`,
  passport: 'These are the Poles! The top and the bottom of the world.',
  // The passport's tap-to-hear facts (planning/around-the-world/poles.html, "Passport facts").
  facts: {
    ocean: 'The North Pole is a frozen ocean. The South Pole is a frozen land.',
    neverMeet: 'Polar bears live in the north, and penguins live in the south. They never meet!',
    seasons: "When it's summer at the North Pole, it's winter at the South Pole.",
    nights: 'At the poles, the sun stays up for months, then stays down for months.',
  },
  // One sticker per stamp (the plan's sticker table).
  stickers: {
    bear: 'Polar bears have black skin under their white fur.',
    fox: 'Arctic foxes turn white in winter and brown in summer.',
    adelie: 'Penguins slide on their tummies to go fast.',
    chick: 'Emperor penguin dads keep the egg warm on their feet.',
    narwhal: 'Narwhals have a long tooth that grows out like a unicorn horn!',
  },
  // The Theater's real-world videos (meta.videos), offered after an activity or picked from the shelf.
  videos: {
    bears: 'Want to see real polar bear cubs on the ice?',
    fox: 'Want to see foxes that turn white for winter?',
    penguins: "Let's see penguins zoom out of the sea!",
    huddle: "Let's see the penguin dads huddle!",
    iceberg: 'Want to see a real iceberg break off?',
    narwhal: "Let's see narwhals, the unicorns of the sea!",
  },

  // ---- The globe hub (activities/hub/) ----
  hub: {},

  // ---- Ice Floe Hop (activities/floe/) ----
  floe: {},

  // ---- Snow Coats (activities/coats/) ----
  coats: {},

  // ---- Penguin Slide (activities/slide/) ----
  slide: {
    // The story (a fresh start only; a tap skips it): Pebble is hungry, so Papa goes fishing.
    story: [pebble("Papa, I'm so hungry!"), papa('Krill coming right up!')],
    // Sparkle, when each stretch starts (and again when she's stuck there).
    hints: {
      top: 'Steer Papa left and right!',
      bumps: 'Bumps! Pick a way down the hill!',
      dive: 'Steer Papa to the pink krill!',
    },
    // The first time each new thing comes along: what's true about it (Sparkle).
    bumps: 'Antarctica is one big hill of ice!',
    dive: 'Penguins fly under the water!',
    // Papa, when something happens to him (a few each, not every time).
    air: [papa('Whoa, I can fly!'), papa('Wheee!')],
    bank: [papa('Oops! Snow on my beak!'), papa('Brr, a snowy nose!')],
    bump: [papa('Oh! Sorry, little friend!'), papa('Round and round!')],
    seal: papa('Hello, silly seal!'),
    gulp: [papa('Yum, krill!'), papa('Gulp!'), papa('More for Pebble!')],
    leap: papa("Pebble, I'm home!"),
    // Home: Pebble is fed.
    fed: pebble('Yummy! Thank you, Papa!'),
    pebbleTap: [pebble('Hee hee!'), pebble('Hi, hi!')],
    // Tap-to-hear facts, the first time she pokes each one (Sparkle).
    facts: {
      papa: 'Emperor penguins are the biggest penguins of all!',
      adelie: 'These little ones are Adelie penguins.',
      seal: 'A leopard seal! This one just wants to play.',
      pebble: 'Penguin chicks eat krill, tiny pink sea animals.',
      noBears: 'No polar bears live here, so the penguins are not scared.',
    },
  },

  // ---- Emperor Huddle (activities/huddle/) ----
  huddle: {},

  // ---- Iceberg Maker (activities/iceberg/) ----
  iceberg: {},

  // ---- The finale: Pole to Pole and the Polar Quiz (activities/party/) ----
  party: {},
}
