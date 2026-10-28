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
  // Sparkle says what to do as each part starts (and again when nothing's been touched for a while); the facts come the
  // first time she pokes an animal (Guide.once), never as required listening.
  coats: {
    fox: { start: 'Brr, winter is coming! Rub snow on the fox.', hint: 'Rub the fox with your finger.' },
    hide: {
      start: 'Now rub them all white, so they can hide!',
      hint: 'Rub snow on the brown ones.',
      bear: 'Shh! Here comes the polar bear.',
      ran: 'He saw some brown! Make it white.',
      gone: "He can't find anyone! White hides in the snow.",
      dusk: 'Tap the sun to bring the summer.',
    },
    summer: {
      start: 'Summer is here! Rub the snow away.',
      hint: 'Rub them brown again.',
      owl: 'Snowy owls and polar bears stay white all year!',
      end: 'Brown coats for the summer!',
    },
    facts: {
      fox: 'Arctic foxes turn white in winter and brown in summer.',
      hare: 'Arctic hares have black tips on their ears.',
      ptarmigan: 'This bird is a ptarmigan. Even its feet go white!',
      lemming: 'Lemmings live in tunnels under the snow.',
      bear: 'Polar bears are white all year.',
      camo: "White fur hides in white snow. That's camouflage!",
      land: 'Lots of animals live on the land around the frozen sea.',
    },
  },

  // ---- Penguin Slide (activities/slide/) ----
  slide: {},

  // ---- Emperor Huddle (activities/huddle/) ----
  huddle: {},

  // ---- Iceberg Maker (activities/iceberg/) ----
  iceberg: {},

  // ---- The finale: Pole to Pole and the Polar Quiz (activities/party/) ----
  party: {},
}
