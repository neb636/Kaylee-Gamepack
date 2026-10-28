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
    coldest: 'Antarctica is the coldest, windiest place on Earth.',
    hidden: 'Most of an iceberg is hidden under the water.',
    fresh: "Antarctica's ice holds most of the world's fresh water.",
    scientists: 'Nobody lives in Antarctica for good, but scientists work there together.',
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
  hub: {
    welcome: 'Welcome to the Poles! Grab the globe and spin it.',
    spin: 'Spin the globe up or down!',
    // Each friend's hello the first time their side comes round, then what they say when she taps them (in turn).
    polaHi: pola("Hi! I'm Pola. I live on the sea ice!"),
    pebbleHi: pebble("Hi! I'm Pebble. I live in Antarctica!"),
    pola: [pola('Ha ha, that tickles!'), pola('The ice floats on the sea!'), pola('Brr! I love the cold!')],
    pebble: [pebble('Hello again!'), pebble('Waddle, waddle!'), pebble('No polar bears down here!')],
    spots: 'Tap a picture to play!',
    party: 'You got every stamp! Tap the party!',
    sunOut: 'Here comes the sun! Drag it!',
    sun: 'Drag the sun up or down!',
    summer: { north: 'Summer up north, and night down south!', south: 'Summer down south, night up north!' },
    lost: { penguin: 'A lost penguin! Carry him home.', bear: 'A lost polar bear cub! Carry her home.' },
    carry: 'Carry it home: the top or the bottom?',
    home: { penguin: pebble('Yay! Welcome home!'), bear: pola('Welcome home, little cub!') },
    // Put down on the wrong pole: whoever lives there is surprised (silly, never an "oops"), then its own pole glows.
    wrong: { penguin: pola('A penguin? Penguins live down south!'), bear: pebble('Eek! Polar bears live up north!') },
    // A fact the first time she pokes each thing (once per visit).
    pokes: {
      marker: 'This is the North Pole, the very top of the world!',
      seal: 'Seals pop up through holes in the ice to breathe.',
      station: 'Scientists stay here to learn about the ice.',
      whale: 'Whales swim in the cold seas at both poles.',
      lightsNorth: 'The northern lights! They dance in the dark winter sky.',
      lightsSouth: 'The southern lights! They glow in the long winter night.',
    },
  },

  // ---- Ice Floe Hop (activities/floe/) ----
  floe: {
    // The opening (the story section): Pola far out on the ice calls to Mama, who waves from the big ice.
    story: [pola('Mama! I am way over here!')],
    // Sparkle: what to do at each stretch (said when it starts, and again when she's stuck).
    hint: {
      steady: 'Pull Pola back, and let go!',
      drift: 'The ice is drifting. Wait, then fling!',
      melt: 'Summer melts the ice. Push floes together!',
    },
    // Pola arriving on a new kind of ice.
    arrive: {
      drift: pola('Whoa! This ice is moving!'),
      melt: pola('The ice is so little now!'),
    },
    // A miss: a happy belly-flop (in turn, not every time).
    flop: [pola('Splash! I love swimming!'), pola('Polar bears are great swimmers!'), pola('Wheee! Splash!'), pola('Brr! Paddle paddle!')],
    // Landing on a tippy edge: down it like a slide.
    slide: [pola('Wheee! A slide!'), pola('Whoops! Too tippy!')],
    // Taps on the friends.
    pola: [pola('Hee hee!'), pola('That tickles!'), pola('Again! Again!')],
    mama: [mama('Hop home to me, Pola!'), mama('I am right here, Pola!'), mama('You can do it, little one!'), mama('Keep hopping!')],
    // Tap-to-hear, the first time she pokes the ice or the water.
    floeFact: 'This ice is floating on the sea!',
    waterFact: 'The North Pole is a frozen sea. There is water under the ice!',
    // Home with Mama.
    home: [mama('My brave little cub! You made it!'), pola('Mama! I hopped all the way home!')],
    homeCheer: `${NAME}, you got Pola home!`,
  },

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
  iceberg: {
    // Sparkle: what to do (each is also the hint when she's stuck there).
    pick: 'Pick a pole: north or south?',
    bits: 'Tap the cracks to break off the ice!',
    giant: 'A giant crack! Tap, tap, tap!',
    under: 'Look! Most of the iceberg hides under the water.',
    push: 'Push the iceberg down with your finger!',
    sail: 'Now push the icebergs out to sea!',
    done: 'Your icebergs are sailing away!',
    // Sparkle's facts, each the first time it comes up.
    facts: {
      calving: "When ice breaks off, it's called calving!",
      north: 'Icebergs up north are tall and pointy.',
      south: 'Icebergs down south are flat, like a table!',
      hidden: 'Nine parts out of ten are under the water!',
      fresh: "Icebergs are made of snow, so they're not salty!",
      fizz: 'Fizz! Old air bubbles pop out of the ice.',
      blue: 'Old ice is packed so tight, it looks blue!',
      seal: 'A seal is napping on a little iceberg.',
      orca: 'Orcas live at both poles!',
    },
    // The friend at each pole: Pola on Greenland's glacier, Papa with the penguins on Antarctica's shelf.
    north: {
      hi: pola('Hi! Break off some ice with me!'),
      bit: [pola('Wheee, splash!'),pola('Ooh, a little one!'), pola('Another one!')],
      groan: pola("Whoa! It's a big one!"),
      soak: pola("Splash! I'm all wet!"),
      under: pola('Wow, it goes way down!'),
      ride: pola("I'm riding the iceberg!"),
      poke: [pola('Hee hee!'), pola('Hi again!')],
      bye: pola('Bye bye, icebergs!'),
    },
    south: {
      hi: papa('Welcome to our ice shelf!'),
      bit: [papa('Splendid!'), papa('Plop, into the sea!'), papa('Another one!')],
      groan: papa('Oh my, a giant!'),
      soak: papa('Brr! A cold shower!'),
      under: papa('So much ice under the water!'),
      ride: papa('All aboard, everyone!'),
      poke: [papa('Hello there!'), papa('Honk honk!')],
      bye: papa('Off they go! Thank you!'),
    },
  },

  // ---- The finale: Pole to Pole and the Polar Quiz (activities/party/) ----
  party: {
    // Pole to Pole: Terry carries Pola's postcard down the world; Sparkle says how to steer.
    setOff: terry("Pola's postcard! Let's fly it to Pebble!"),
    steer: 'Steer Terry with your finger!',
    steerHint: 'Move your finger to steer Terry!',
    warm: terry("Phew! It's warm in the middle of the world!"),
    south: terry("Brr, it's windy! Nearly at the South Pole!"),
    fish: [terry('Yum, a fish!'), terry('Fishy!'), terry('Got one!')],
    // Over a country she has been to (the passport's), by its id.
    hello: {
      thailand: terry('Hello, Thailand!'),
      australia: terry('Hello, Australia!'),
      italy: terry('Hello, Italy!'),
      china: terry('Hello, China!'),
      egypt: terry('Hello, Egypt!'),
      peru: terry('Hello, Peru!'),
      canada: terry('Hello, Canada!'),
    } as Record<string, { text: string; voice: string }>,
    // The postcard.
    delivery: terry('A postcard for you, Pebble!'),
    card: pebble('From Pola! Look, a polar bear!'),
    // The Polar Quiz: Sparkle asks, Kaylee answers by doing.
    quiz: 'Quiz time!',
    ask: {
      bear: 'Put Pola where polar bears live!',
      penguin: 'Put Pebble where penguins live!',
      south: 'Spin the South Pole to the front!',
      north: 'Spin the North Pole to the front!',
      ocean: 'Which pole is ocean under the ice? Tap it!',
      coldest: 'Which pole is the coldest? Tap it!',
      tern: 'Who visits both poles? Tap them!',
      summer: "It's summer up north. What is it down south?",
    },
    // A miss: something silly, then the right thing glows and she does it herself.
    miss: {
      bear: pola("Where's the sea ice? I live up top!"),
      penguin: pebble('Brr! Where is everybody?'),
      south: 'Wobble, wobble! Try the other end.',
      north: 'Wobble, wobble! Try the other end.',
      ocean: "That's rock and land under there! Try the other pole.",
      coldest: 'Brr! The other pole is even colder.',
      tern: 'Hmm, not them. Who can fly far?',
      summer: "Down south it's dark and snowy! Try again.",
    },
    glow: 'Look for the sparkle!',
    right: ['Yes!', "That's right!", 'You got it!', 'Super!'],
    badge: `Wow, ${NAME}, you know your poles!`,
  },
}
