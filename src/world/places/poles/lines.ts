// Every phrase that can be spoken at the Poles. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports only sdk/device.ts, which imports nothing.) Plain strings are Sparkle, the guide:
// she says what to do. The friends say their own story and reaction lines in their own voices (cast.json): Pola the
// polar bear cub and Mama Bear up north, Pebble the emperor chick and Papa down south, Terry the Arctic tern who visits
// both, and Nari the narwhal. Each activity has its own block below (one per PR, so they don't collide). Keep lines under ~3 seconds, and the
// name for the big moments only. Straight apostrophes only: curly ones failed the transcription check in PR #63.
import { onDevice } from '../../../sdk/device.ts'

// A friend speaking: pola("Hi!") is { text: "Hi!", voice: "pola" }. (Exported, so a block that has no lines yet compiles.)
const by = (voice: string) => (text: string) => ({ text, voice })
export const pola = by('pola')
export const mama = by('mama')
export const pebble = by('pebble')
export const papa = by('papa')
export const terry = by('terry')
export const nari = by('nari')

export const L = {
  // The shell's trophy ceremony and the trophy room speak these.
  trophyWin: `You did it! You won the Polar Explorer trophy!`,
  trophyRoom: `Polar Explorer! From The Poles.`,
  passport: 'These are the Poles! The top and the bottom of the world.',
  // The passport's tap-to-hear facts (planning/around-the-world/poles.md, "Passport facts").
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

  // ---- The globe hub (activities/hub/): the map of the story. In play order. ----
  hub: {
    // Her first look at the globe after the way-in film (no stamps yet), once: Sparkle sends her to the first picture.
    welcome: onDevice("Let's take Pebble home! Tap the first picture.", "Let's take Pebble home! Click the first picture."),
    // Back at the globe with a new stamp (or her first look on another day), once per stop: where the balloon is now.
    // Keyed by the next stop on the trail.
    next: {
      floe: 'Next stop: across the floating ice!',
      narwhal: 'Next stop: a ride on a narwhal!',
      coats: 'Next stop: the snow is coming!',
      slide: 'Next stop: the bottom of the world!',
      huddle: 'Next stop: the long, dark night.',
    },
    // Every stamp is in, once: home is the last picture on the trail.
    home: onDevice('Every stamp! Tap the last picture to fly home!', 'Every stamp! Click the last picture to fly home!'),
    // Left alone a while: shown in Sparkle's bubble only, never said by itself (a hub doesn't nag). She says one if tapped.
    spots: onDevice('Tap a picture to play!', 'Click a picture to play!'),
    spin: 'Spin the globe up or down!',
    sun: 'Drag the sun up or down!',
    // She taps a friend on the globe: their lines in turn, in their own voices. Pola and Pebble stand together up north.
    pola: [pola("I've never seen a penguin before!"), pola("Don't worry, Pebble. We'll get you home!"), pola('Ha ha, that tickles!')],
    pebble: [pebble('I miss my Papa.'), pebble('Are we nearly there?'), pebble('Waddle, waddle!')],
    // Papa waits down south, looking up at the sky. (Also what he says if she picks home before every stamp is in.)
    papa: [papa('Pebble? Where are you?'), papa("I'll keep looking, little one.")],
    // She taps Terry as he flies his loop between the poles.
    terry: [terry('I fly from pole to pole every year!'), terry('Follow me! I know the way!')],
    // The sun pops out beside the globe (once she has seen both poles), then the first time summer lands on each pole.
    sunOut: 'Here comes the sun! Drag it!',
    summer: { north: 'Summer up north, and night down south!', south: 'Summer down south, night up north!' },
    // A fact the first time she pokes each thing (once per visit).
    pokes: {
      marker: 'This is the North Pole, the very top of the world!',
      seal: 'Seals pop up through holes in the ice to breathe.',
      station: 'Scientists stay here to learn about the ice.',
      whale: 'Whales swim in the cold seas at both poles.',
      ship: 'The red ship! Pebble fell asleep on it.',
      balloon: 'My balloon! It will fly Pebble home.',
      lightsNorth: 'The northern lights! They dance in the dark winter sky.',
      lightsSouth: 'The southern lights! They glow in the long winter night.',
    },
  },

  // ---- The story films (story/films.ts): Pebble's Long Way Home. One block per film, in play order. ----
  story: {
    // The way in (the first visit): Pola finds a penguin at the top of the world.
    intro: {
      top: 'This is Pola. She lives at the very top of the world.',
      what: pola('Whoa! What ARE you?'),
      penguin: pebble("I'm Pebble. I'm a penguin!"),
      never: pola("A pen-guin? I've never seen one!"),
      papa: pebble('I want my Papa.'),
      ship: pebble('I saw a big red ship. It smelled like fish!'),
      nap: pebble('I climbed inside, and I fell asleep.'),
      sailed: 'The ship sailed all the way up the world. From the bottom, to the top!',
      woke: pebble('When I woke up, everything was different.'),
      terry: terry('A penguin? Up here?'),
      bottom: terry('Penguins live at the bottom of the world! I fly there every year.'),
      show: pola('Can you show us the way?'),
      long: terry("It's a long, long way. But yes!"),
      ask: "My balloon can carry Pebble home. Let's help him!",
    },
    // Ice Floe Hop: across the floating ice to Mama Bear.
    floeIn: {
      mama: pola("Mama will know what to do! She's across the ice."),
      swim: pebble("I can't swim yet. My feathers are too fluffy!"),
      hop: pola('Then hop on my back!'),
    },
    floeOut: {
      far: mama('A penguin! You are so far from home, little one.'),
      hug: pebble("You're so warm!"),
      go: mama('Pola, go with him. Friends help friends.'),
      yes: pola('I will, Mama!'),
    },
    // The narwhal ride: out to the balloon on the big iceberg.
    narwhalIn: {
      far: terry('The balloon is out past the icebergs.'),
      hop: pola("That's too far to hop!"),
      ride: nari("Need a ride? I'm Nari the narwhal!"),
      unicorn: pebble('A unicorn fish!'),
      sea: nari('The unicorn of the sea. Hold on tight!'),
    },
    narwhalOut: {
      here: nari('Here we are! One balloon.'),
      thanks: pebble('Thank you, Nari!'),
      bye: nari('Say hello to the bottom of the world for me!'),
    },
    // Snow Coats: Terry flies south when the snow comes.
    coatsIn: {
      when: pola('Terry, when do we fly?'),
      snow: terry('When the snow comes, and the fox turns white.'),
      brown: pebble('But the fox is brown!'),
      help: "Then let's help the winter along!",
    },
    coatsOut: {
      white: terry('Snow! White coats everywhere!'),
      time: terry("Winter is here. It's time to fly south!"),
      bye: pola('Bye, fox! Bye, hare!'),
    },
    // Penguin Slide: meanwhile, Papa looks everywhere.
    slideIn: {
      meanwhile: 'Meanwhile, at the bottom of the world...',
      call: papa('Pebble! Pebble, where are you?'),
      seen: papa('Has anyone seen my little Pebble?'),
      look: papa("I'll look down the hill, and in the sea. I'll look everywhere!"),
    },
    slideOut: {
      none: papa('No Pebble in the sea.'),
      supper: papa('But I caught his favorite supper.'),
      soon: papa('Come home soon, little one.'),
    },
    // Emperor Huddle: the long night, and the night Pebble hatched.
    huddleIn: {
      dark: 'Winter at the South Pole. The sun is gone for months.',
      wait: papa("I'll wait right here, Pebble."),
      remember: papa('I remember the night you hatched.'),
    },
    huddleOut: {
      warm: papa('I kept you warm all winter long.'),
      sun: papa('Look. The sun is coming back.'),
      dot: papa('Wait. What is that, up in the sky?'),
    },
    // The finale: the flight home, Papa's song, and a polar bear at the South Pole.
    homeIn: {
      aboard: 'All aboard! Next stop, the bottom of the world!',
      bye: mama('Goodbye, my brave cub! Hurry home!'),
      follow: terry('Follow me! All the way down the world!'),
    },
    homeLand: {
      land: 'We made it! This is Antarctica.',
      ground: pola("There's ground under this ice! Not sea!"),
      what: papa('Goodness! What is THAT?'),
      bear: pola("Hi! I'm a polar bear!"),
      same: pebble('Papa? They all look the same!'),
      song: "Every penguin papa has his own song. Let's find Papa's!",
    },
    homeReunion: {
      pebble: papa('Pebble! My Pebble!'),
      papa: pebble('Papa! I went to the top of the world!'),
      friend: pebble('This is Pola. She carried me home.'),
      thanks: papa('A polar bear at the South Pole! Thank you, Pola.'),
      lights: pola('Look! The sky is dancing!'),
      quiz: terry("Top to bottom! Who's ready for my Polar Explorer quiz?"),
    },
  },

  // ---- Ice Floe Hop (activities/floe/) ----
  floe: {
    // Ice Floe Hop: Pola carries Pebble on her back across the floating ice to Mama Bear (the film before it ends with
    // him hopping on). In play order.
    // Sparkle: what to do at each stretch (the first as the game opens, each as its ice begins, and again when she's stuck).
    hint: {
      steady: onDevice('Pull Pola back, and let go!', 'Click Pola, pull her back, and let go!'),
      drift: 'The ice is drifting. Wait, then fling!',
      melt: 'Summer melts the ice. Push floes together!',
    },
    // Pebble, up on Pola's back as she leaps (in turn, every few flings, not every time).
    fly: [pebble('Wheee!'), pebble('Again! Again!'), pebble("I'm flying!"), pebble('Higher, Pola!')],
    // She pokes Pola and Pebble (in turn).
    pola: [pola('Hee hee!'), pebble('Peep peep!'), pola('That tickles!'), pebble('Hop, Pola, hop!')],
    // She pokes Mama Bear, far across the ice (in turn). Mama hasn't met Pebble yet.
    mama: [mama('Hop home to me, Pola!'), mama('Who is that on your back?'), mama('I am right here, Pola!'), mama('You can do it, little one!'), mama('Keep hopping!')],
    // Tap-to-hear, the first time she pokes the ice or the water.
    floeFact: 'This ice is floating on the sea!',
    waterFact: 'The North Pole is a frozen sea. There is water under the ice!',
    // A miss: a happy belly-flop, and Pola swims with Pebble held up dry (in turn, not every time).
    flop: [pebble("Don't drop me!"), pola('Polar bears are great swimmers!'), pebble('Hold me up high!'), pola('Splash! I love swimming!'), pola('Brr! Paddle paddle!')],
    // They climb out and Pola shakes the water off (in turn, when nobody else is talking).
    dry: [pebble("I'm still dry!"), pebble('Not one drop on me!')],
    // Tap-to-hear: who lives on the sea ice, the first time she pokes each (in the order they come along the way).
    facts: {
      seal: 'A ringed seal! That hole is how she breathes.',
      berg: 'An iceberg! Most of it hides under the water.',
      owl: 'A snowy owl! She is white like the snow.',
      terry: 'There goes Terry! Terns fly from pole to pole.',
      walrus: 'A walrus! His long teeth are called tusks.',
      narwhal: 'A narwhal! That long horn is really a tooth.',
      puffin: 'A puffin! She dives for little fish.',
      beluga: 'Beluga whales! They sing like birds.',
      pup: 'A baby seal! Her white fur keeps her warm.',
    },
    // Pola arriving on a new kind of ice.
    arrive: {
      drift: pola('Whoa! This ice is moving!'),
      melt: pola('The ice is so little now!'),
    },
    // Landing on a tippy edge: down it like a slide.
    slide: [pola('Wheee! A slide!'), pola('Whoops! Too tippy!')],
    // Home on Mama's ice: Pola calls out, then Sparkle's cheer (the film after it is Mama meeting Pebble).
    home: pola('Mama! Look who I found!'),
    homeCheer: `You carried Pebble all the way!`,
  },
  coats: {
    fox: { start: onDevice('Brr, winter is coming! Rub snow on the fox.', 'Brr, winter is coming! Click and wiggle snow on the fox.'), hint: onDevice('Rub the fox with your finger.', 'Hold the click and wiggle on the fox.') },
    hide: {
      start: onDevice('Now rub them all white, so they can hide!', 'Now click and wiggle them all white, so they can hide!'),
      hint: onDevice('Rub snow on the brown ones.', 'Click and wiggle snow on the brown ones.'),
      bear: 'Shh! Here comes the polar bear.',
      ran: 'He saw some brown! Make it white.',
      gone: "He can't find anyone! White hides in the snow.",
      dusk: onDevice('Tap the sun to bring the summer.', 'Click the sun to bring the summer.'),
    },
    summer: {
      start: onDevice('Summer is here! Rub the snow away.', 'Summer is here! Click and wiggle the snow away.'),
      hint: onDevice('Rub them brown again.', 'Click and wiggle them brown again.'),
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
    // Papa's search, in play order (the films either side are story.slideIn and story.slideOut). Sparkle says what to
    // do; Papa says the rest in his own voice.
    // Sparkle, as he flops onto his tummy at the top, then when each stretch starts (and again when she's stuck there).
    hints: {
      top: 'Steer Papa left and right!',
      bumps: 'Bumps! Pick a way down the hill!',
      dive: 'Steer Papa to the pink krill!',
    },
    // Sparkle, the first time something small and grey shows up ahead (and when she pokes one he hasn't looked at).
    look: 'Is that Pebble? Steer Papa over to look!',
    // Papa calls for Pebble as he slides down the hill: in turn, every so often, when nothing else is going on.
    call: [papa('Pebble? Are you down here?'), papa('Not behind this snowbank!'), papa('Pebble! Where are you?'), papa('No little footprints here.')],
    // Papa, to an Adelie who hops out of his way.
    ask: [papa('Have you seen my Pebble?'), papa('A little grey chick? No?')],
    // Papa, when the thing he slid up to turns out not to be Pebble (one each, in the order he comes to them).
    found: {
      snowy: papa('Oh! A snowy Adelie, not Pebble!'),
      seal: papa('Not Pebble. A sleepy seal!'),
      skua: papa('A skua chick! Not my chick.'),
      hat: papa('A woolly hat! It fits!'),
      buoy: papa('Bong! Only a buoy.'),
      fish: papa('Just a ball of little fish!'),
    },
    // Papa, when something happens to him on the hill (a few each, not every time): big air, head first in a
    // snowbank, bumping an Adelie.
    air: [papa('Whoa, I can fly!'), papa('Wheee!')],
    bank: [papa('Ha! Snow on my beak!'), papa('Brr, a snowy nose!')],
    bump: [papa('Oh! Sorry, little friend!'), papa('Round and round!')],
    // Sparkle, when the bumps begin: what's true about this place.
    bumps: 'Antarctica is land, under a big hill of ice!',
    // Sparkle, when he dives off the ice edge into the sea.
    dive: 'Penguins fly under the water!',
    // Papa calls for Pebble under the sea (in turn).
    callSea: [papa('Pebble? Are you in the sea?'), papa('Not under this ice!')],
    // Papa, gulping krill (the first swarm, then now and then).
    gulp: [papa("Krill! For Pebble's supper!"), papa('Gulp!'), papa("More for Pebble's supper!")],
    // Sparkle, after his second swarm.
    krill: 'Krill are tiny pink sea animals. Penguin food!',
    // Papa, when the leopard seal bumps noses with him.
    seal: papa('Seal, have you seen Pebble?'),
    // Papa, rocketing out of the sea onto the ice.
    leap: papa('Up and out!'),
    // The ice edge: the Adelies cheer his tummy full of krill, and he looks up at the sky.
    home: papa('Pebble! Supper is ready!'),
    // Tap-to-hear facts, the first time she pokes each one (Sparkle), in the order she comes to them.
    facts: {
      papa: 'Emperor penguins are the biggest penguins of all!',
      gentoo: 'Gentoo penguins have bright orange beaks.',
      adelie: 'These little ones are Adelie penguins.',
      noBears: 'No polar bears live here, so the penguins are not scared.',
      elephant: 'An elephant seal! The biggest seal of all.',
      weddell: 'Weddell seals sing. It sounds like outer space!',
      skua: 'A skua! A big, bold seabird.',
      chick: 'Skua chicks are grey and fluffy, just like Pebble.',
      hat: 'A woolly hat keeps your head warm.',
      flag: 'Scientists stay here to study the ice.',
      scientist: 'Nobody lives here for good. Scientists come to visit!',
      spout: 'A humpback whale! It eats krill too.',
      seal: 'A leopard seal! This one just wants to play.',
      swimmer: 'Under the water, penguins are super fast!',
      buoy: 'A buoy floats on the sea. It tells the ships the way.',
      fish: 'Silverfish! They shine like little coins.',
    },
  },

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
    done: 'You kept them all warm!',
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

  // ---- Narwhal Ride (activities/narwhal/) ----
  // In play order. Sparkle says what to do as each stretch starts (and again when she's stuck there); Nari, Pola,
  // Pebble and Terry say their own lines when something happens (a few each, in turn, never every time).
  narwhal: {
    // Nari sets off, Pola and Pebble on her back.
    go: nari('Here we go! Hold on tight!'),
    // Sparkle, when each stretch starts (and again when nothing has been steered for a while).
    hints: {
      open: onDevice('Slide your finger to steer Nari!', 'Click and drag to steer Nari!'),
      bergs: 'Icebergs! Steer Nari around them!',
      under: 'Steer Nari under the ice!',
      glacier: 'Steer Nari to the balloon!',
    },
    // Terry, flying ahead, a moment after the start.
    follow: terry('Follow me! The balloon is this way!'),
    // The first schools of fish she scoops up (Nari, then the riders).
    fish: [nari('Yum!'), nari('Yum, a fish!'), pebble('Catch another one!'), pola('Fishy, fishy!')],
    // Up off a ramp of ice (or a wave), and the big splash back down.
    jump: [pola('Wheee!'), pebble("We're flying!"), nari('Tusk first!')],
    land: [pebble('Splash! Again, again!'), pola('What a splash!'), nari('Ha ha! Nice one!')],
    // A boing off a floe or an iceberg.
    bump: [nari('Boing! Silly ice!'), pola('Bumper narwhal!'), pebble('Hee hee! Boing!')],
    // Among the icebergs (Pola, as the first tall ones come up).
    bergs: pola('Look at those icebergs!'),
    // At the low ice bridge: Nari dips under, and blows the riders a bubble to sit in.
    dive: nari("Deep breath! Here's your bubble!"),
    // Under the sea ice: what's true about it (Sparkle), then the riders.
    hidden: 'Look! Most of an iceberg hides under the water.',
    bubble: pebble("I'm in a bubble! I'm still dry!"),
    sea: pola("No ground down here. It's all sea!"),
    // Up through the hole in the ice; Terry was waiting.
    up: nari('Up we go!'),
    there: terry('There you are!'),
    // The glacier: a piece cracks off, lands in the sea, and sends the waves.
    crack: pola('Whoa! The glacier is cracking!'),
    calved: 'A new iceberg! It broke off the glacier.',
    wave: [nari('Big wave! Surf it!'), pola('Surf, Nari, surf!')],
    // The balloon comes into sight, then she pulls up beside it.
    balloon: pebble('I see the balloon!'),
    here: pola('We made it!'),
    // Pokes on the friends (in turn).
    nari: [nari('That tickles my tusk!'), nari('Pfff! A spout!')],
    pola: [pola('Faster, Nari!'), pola('Hee hee!')],
    pebble: [pebble('Giddy-up, unicorn!'), pebble('Peep peep!')],
    terry: [terry('Keep up, slowpokes!'), terry('This way!')],
    // Tap-to-hear facts, each the first time she pokes that thing (Sparkle).
    facts: {
      tusk: "Nari's horn is really a long tooth!",
      arctic: 'Narwhals and belugas live only in the Arctic.',
      walrus: 'A walrus! He has two long teeth.',
      puffins: 'Puffins! They catch fish in their bright beaks.',
      seal: 'A seal is napping on a little iceberg.',
      beluga: 'Belugas! They whistle like little birds.',
      orca: 'An orca! This one is just saying hello.',
      fizz: 'Fizz! Old air bubbles pop out of the ice.',
      blue: 'Old ice is packed so tight, it looks blue!',
      calving: "When ice breaks off, it's called calving!",
      water: 'The North Pole is a frozen sea. No land under here!',
      ice: 'This ice is floating on the sea!',
    },
  },

  // ---- The finale (activities/party/): the flight home, Papa's song, Terry's Polar Explorer quiz. In play order. ----
  party: {
    // -- The flight home: Terry leads the balloon down the world.
    // As the flight starts: Sparkle says how to steer, then Terry calls back to the balloon.
    steer: onDevice('Steer Terry with your finger!', 'Click and drag to steer Terry!'),
    setOff: terry('Follow me, balloon!'),
    // Sparkle, when nothing has been touched for a while.
    steerHint: onDevice('Move your finger to steer Terry!', 'Hold the click and move to steer Terry!'),
    // Terry, every few fish he gulps (in turn).
    fish: [terry('Yum, a fish!'), terry('Fishy!'), terry('Got one!')],
    // Terry, over a country she has been to (the passport's), by its id.
    hello: {
      thailand: terry('Hello, Thailand!'),
      australia: terry('Hello, Australia!'),
      italy: terry('Hello, Italy!'),
      china: terry('Hello, China!'),
      egypt: terry('Hello, Egypt!'),
      peru: terry('Hello, Peru!'),
      canada: terry('Hello, Canada!'),
    } as Record<string, { text: string; voice: string }>,
    // The warm middle of the world: the sea turns turquoise, Pola pants and fans herself. Then Sparkle's fact.
    warm: pola("Phew! I'm melting!"),
    warmFact: 'The middle of the world is the warmest part!',
    // The first whale spouts below.
    whale: terry('Look down! A whale!'),
    // The cold comes back: Pebble bounces in the basket.
    south: pebble('It smells like home!'),
    // The albatross glides in beside them.
    albatross: terry('Hello, albatross! Nearly there!'),
    // A tap on the balloon (in turn).
    balloon: [pola('Wheee!'), pebble('Higher, higher!')],

    // -- Papa's song: find each chick's papa by his tune.
    song: {
      // Round 1. Pebble, then he hums; then Sparkle says what to do.
      ask: pebble('Papa sings like this!'),
      how: onDevice('Tap a papa to hear his song!', 'Click a papa to hear his song!'),
      // Sparkle, when nothing has been touched for a while (the chick's tune plays again on a tap).
      hint: onDevice('Tap the chick to hear the song again.', 'Click the chick to hear the song again.'),
      // A dad who isn't the papa, the second miss of a round (Papa's voice; the first miss is a bow).
      neighbor: papa('Not my chick! Try my neighbor.'),
      // After two misses the right papa sways and glows.
      glow: 'Look! Who is swaying?',
      // Found, round 1: Pebble, then Papa.
      found: pebble("That's Papa's song!"),
      papa: papa('My little Pebble!'),
      // Round 2: another chick peeps for help (Pebble's voice); Sparkle.
      more: pebble('Find my papa too!'),
      moreHow: 'More papas! Listen for the same song.',
      // Found, rounds 2 and 3 (the chick).
      thanks: [pebble('Papa! You found him!'), pebble('Thank you! Thank you!')],
      // Round 3: the wind and the snow come up (Sparkle); one last chick.
      storm: 'Brr, a snowstorm! Just listen.',
      last: pebble("I can't see my papa!"),
      // All three found.
      done: 'Every chick has a papa!',
      // Taps behind the row: Pola (in turn), and Sparkle's facts the first time she pokes the colony or a found pair.
      pola: [pola('I just want to say hi!'), pola('Hi, penguins!')],
      colonyFact: "Penguins have never seen a polar bear. They're a little shy!",
      songFact: 'Emperor penguins find their family by their song.',
    },

    // -- Terry's Polar Explorer quiz: Terry asks, she answers by doing; Sparkle says how.
    quiz: terry('Quiz time!'),
    ask: {
      bear: terry('Take Pola home! Where do polar bears live?'),
      penguin: terry('Where do penguins live?'),
      south: terry('Show me the South Pole!'),
      north: terry('Show me the North Pole!'),
      ocean: terry('Which pole is sea under the ice?'),
      coldest: terry('Which pole is the coldest?'),
      tern: terry('Who flies to both poles?'),
      summer: terry("It's summer up north. What is it down south?"),
    },
    // Sparkle: how to answer each kind of question (the first time it comes up, and when she's stuck).
    how: {
      drag: onDevice('Drag to the top or the bottom!', 'Click and drag to the top or the bottom!'),
      spin: onDevice('Swipe the globe up or down!', 'Drag the globe up or down!'),
      tap: onDevice('Tap the top or the bottom!', 'Click the top or the bottom!'),
      pick: onDevice('Tap your answer!', 'Click your answer!'),
    },
    // A miss: something silly, then the right thing glows and she does it herself. (Pola and the penguin speak for
    // themselves when she puts them at the wrong pole; Terry for the rest.)
    miss: {
      bear: pola("Where's the sea ice? I live up top!"),
      penguin: pebble('Brr! Where is everybody?'),
      south: terry('Wobble, wobble! The other end!'),
      north: terry('Wobble, wobble! The other end!'),
      ocean: terry('That one is rock and land! Try the other.'),
      coldest: terry('Brr! The other one is even colder.'),
      tern: terry('Not them. Who can fly far?'),
      summer: terry("Down south it's dark and snowy!"),
    },
    glow: 'Look for the sparkle!',
    // Right, the first question: Pola waves from the sea ice. Right, the others: Terry cheers (in turn).
    home: pola("I'm home! Bye, Pebble!"),
    right: [terry('Yes!'), terry("That's right!"), terry('You got it!'), terry('Top marks!')],
    // The badge. No name here: the trophy's line says it right after.
    badge: terry('A real Polar Explorer!'),
  },
}
