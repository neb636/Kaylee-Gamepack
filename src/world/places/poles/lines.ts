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
  slide: {},

  // ---- Emperor Huddle (activities/huddle/) ----
  // Sparkle says what to do (and a fact the first time something comes up); the dads speak in Papa's voice (the one
  // whose beak moves is the one talking), Pebble in Pebble's. Finite: one line per moment, a few thank-yous in turn.
  huddle: {
    small: 'Carry the cold penguin into the middle!',
    more: 'More penguin dads are coming!',
    blizzard: 'A blizzard! Keep the cold ones moving in.',
    turned: 'The wind turned around!',
    hatch: "Keep Pebble's papa warm in the middle.",
    hatched: 'Tuck Pebble back under Papa!',
    blown: 'Whoosh! Carry Pebble back to Papa.',
    sunrise: 'Look! The sun is coming back!',
    done: 'You kept them all warm, Kaylee!',
    facts: {
      egg: 'Emperor dads keep the egg warm on their feet!',
      coldest: 'Antarctica is the coldest, windiest place on Earth.',
      night: 'In winter here, the sun stays away for months!',
    },
    papa: {
      cold: papa('Brrr! So cold!'),
      thanks: [papa('Ahh, much better!'), papa('Thank you! So cozy.'), papa('Warm at last!')],
      egg: papa('My egg is getting cold!'),
      hatched: papa('Hello, little Pebble!'),
      blown: papa('Oh no! Pebble!'),
      tucked: papa('There you are, Pebble!'),
      sunrise: papa('Look, Pebble. The sun!'),
    },
    pebble: {
      hi: pebble('Hi, Papa! Peep peep!'),
      blown: pebble('Whoa! Papa, help!'),
      tucked: pebble('So cozy!'),
      sunrise: pebble('Ooh, so pretty!'),
    },
  },

  // ---- Iceberg Maker (activities/iceberg/) ----
  iceberg: {},

  // ---- The finale: Pole to Pole and the Polar Quiz (activities/party/) ----
  party: {},
}
