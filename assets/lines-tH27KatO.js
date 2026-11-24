!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e._posthogReleaseId=e._posthogReleaseId||"01a20cd9-f7bc-0000-e6d3-0a45d5f6b88a";var n=(new e.Error).stack;n&&(e._posthogChunkIds=e._posthogChunkIds||{},e._posthogChunkIds[n]="58feb9f4-5ddf-5310-abfe-2314f203eaf5")}catch(e){}}();
var e=`// Every phrase that can be spoken at the Poles. \`node scripts/world-voice-lines.mjs\` turns this into voice-lines.json.
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
  trophyWin: \`You did it! You won the Polar Explorer trophy!\`,
  trophyRoom: \`Polar Explorer! From The Poles.\`,
  passport: 'These are the Poles! The top and the bottom of the world.',
  // The passport's tap-to-hear facts.
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
  // The Theater's real-world videos (meta.videos), picked from its shelf (the movie ticket at the end of the story).
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
    },
    // The whole story told (every stamp and the trophy), once: the movie ticket at the end of the trail opens the real
    // animals' videos (the Theater).
    movies: "Movie time! Let's see the real animals from our story!",
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
      ship: pebble('I saw a big red ship. I climbed in, and fell asleep!'),
      sailed: 'The ship sailed up the whole world. From the bottom, to the top!',
      terry: terry('A penguin? Up here?'),
      bottom: terry('Penguins live at the bottom of the world! I fly there every year.'),
      show: pola('Can you show us the way?'),
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
      soon: papa("I just know he's on his way home."),
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
    homeCheer: \`You carried Pebble all the way!\`,
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
  // Sparkle says what to do (and a fact the first time something comes up). Papa is the only dad who talks (the others
  // honk their own songs), Pebble in Pebble's voice. Finite: one line per moment, a few thank-yous in turn. In the
  // last section Papa sings Pebble his song (synthesized: activities/party/sounds.ts TUNES[0], the one the finale's
  // chick hums) and Pebble peeps it back.
  huddle: {
    small: 'Carry the cold penguin into the middle!',
    more: 'More penguin dads are coming!',
    blizzard: 'A blizzard! Keep the cold ones moving in.',
    turned: 'The wind turned around!',
    hatch: "Keep Pebble's papa warm in the middle.",
    hatched: 'Tuck Pebble back under Papa!',
    blown: 'Whoosh! Carry Pebble back to Papa.',
    song: 'Shh. Papa is singing to Pebble.',
    done: 'You kept them all warm!',
    facts: {
      egg: 'Emperor dads keep the egg warm on their feet!',
      coldest: 'Antarctica is the coldest, windiest place on Earth.',
      night: 'In winter here, the sun stays away for months!',
      fast: "Emperor dads don't eat all winter. They just keep the egg warm!",
    },
    papa: {
      cold: papa('Brrr! So cold!'),
      thanks: [papa('Ahh, much better!'), papa('Thank you! So cozy.'), papa('Warm at last!')],
      egg: papa('My egg is getting cold!'),
      hatched: papa('Hello, little Pebble!'),
      blown: papa('Oh no! Pebble!'),
      tucked: papa('There you are, Pebble!'),
      song: papa('Listen, Pebble. This is my song.'),
      always: papa("That's it! Now you'll always find me."),
    },
    pebble: {
      hi: pebble('Hi, Papa! Peep peep!'),
      blown: pebble('Whoa! Papa, help!'),
      tucked: pebble('So cozy!'),
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
    // (The old finale's flight, Papa's song and Terry's quiz were retired by the ending, The Longest Night: its
    // goodbye answers the quiz's first question by flying. What the ending and Emperor Huddle still say from here.)
    // Terry, over a country she has been to (the passport's), by its id (the ending's Act 1).
    hello: {
      thailand: terry('Hello, Thailand!'),
      australia: terry('Hello, Australia!'),
      italy: terry('Hello, Italy!'),
      china: terry('Hello, China!'),
      egypt: terry('Hello, Egypt!'),
      peru: terry('Hello, Peru!'),
      canada: terry('Hello, Canada!'),
    } as Record<string, { text: string; voice: string }>,
    // A tap on the balloon (the goodbye flight).
    balloon: [pola('Wheee!'), pebble('Higher, higher!')],
    song: {
      // Emperor Huddle's fact the first time Papa sings.
      songFact: 'Emperor penguins find their family by their song.',
    },
  },

  // ---- The new ending, The Longest Night (poles-ending.md in git history; activities/night/). ----
  // One chapter in three acts and five films, and the whole of it is here in play order, so its table read is the
  // ending as she hears it. It replaces Emperor Huddle and the finale (the blocks above) once it's built; until then
  // those still play. Lines marked ♻️ are already recorded under another key (the same words in the same voice share
  // one clip, so nothing is recorded twice); 🔁 came with the 3D huddle. Everything else is new. Papa's song itself
  // (activities/party/sounds.ts TUNES[0]) is never words: it's sung.
  night: {
    // 🎬 Film 1, night-in: Time to fly. The autumn tundra under fresh snow; the Arctic fox, all white now, pounces.
    in: {
      // Terry, landing on the balloon's rope.
      fox: terry('Snow! The fox is white. Time to fly south!'),
      // Mama Bear hugs Pola at the balloon. (♻️ story.homeIn.bye)
      bye: mama('Goodbye, my brave cub! Hurry home!'),
      promise: pola("I'll come back, Mama. I promise."),
      // At the ice edge, Nari bursts up and spins as the balloon goes over.
      nari: nari('Narwhals stay up north. Say hi for me!'),
      // Sparkle, as the balloon lifts. (♻️ story.homeIn.aboard)
      aboard: 'All aboard! Next stop, the bottom of the world!',
      // The camera follows the balloon down the little globe into darkness. (♻️ story.slideIn.meanwhile)
      meanwhile: 'Meanwhile, at the bottom of the world...',
      // Papa at the windy edge of the huddle, looking up; then he hums his song into the wind, alone. (♻️ story.huddleIn.wait)
      wait: papa("I'll wait right here, Pebble."),
    },

    // 🎈 Act 1, fly: Hold to Fly. She flies the balloon down the world: hold to heat the air and rise, let go to sink.
    fly: {
      // Sparkle, as the game opens (and when nothing is held for a while: \`stuck\`).
      start: onDevice('Hold your finger down to fly up!', 'Click and hold to fly up!'),
      // Terry, flying ahead, as the first pink ribbon of wind shows.
      follow: terry('Follow me! The pink wind goes south!'),
      // Sparkle, the first time the balloon reaches the pink ribbon.
      pink: 'Ride the pink wind south!',
      stuck: onDevice('Hold your finger down to go up!', 'Click and hold to go up!'),
      // Sparkle, the first time the burner lifts the balloon (once).
      hot: 'Hot air goes up, up, up!',
      // She pokes Pebble in the basket: this the first time, then he just hums the song.
      hum: pebble("This is Papa's song. Hmm hm hmm!"),
      // Silly, never "oops": held too long, the balloon pokes into a cloud; let go too long, the basket dips in the sea.
      cloud: pola("I can't see! It's all fluffy!"),
      wet: pebble("Don't get me wet! I'm too fluffy!"),
      // The warm middle of the world: Pola fans herself, then Sparkle's fact. (♻️ party.warm, party.warmFact)
      warm: pola("Phew! I'm melting!"),
      warmFact: 'The middle of the world is the warmest part!',
      // Through the thundercloud instead of over it.
      shower: pola('Ahh! A cool shower!'),
      // The red ship sails by below.
      ship: pebble("The red ship! That's how I got lost!"),
      crates: pola('No more fish crates for you!'),
      // A whale spouts below. (♻️ party.whale) Over a country in her passport, Terry says hello (♻️ party.hello).
      whale: terry('Look down! A whale!'),
      // The cold comes back, then the albatross. (♻️ party.south, party.albatross)
      south: pebble('It smells like home!'),
      albatross: terry('Hello, albatross! Nearly there!'),
      // The blizzard starts: gusts push the balloon down. Terry, then Sparkle.
      storm: terry('Hold on! A big storm!'),
      holdOn: onDevice('Hold your finger down! Keep the balloon up!', 'Click and hold! Keep the balloon up!'),
      // Sparkle, the first time she pokes each thing (the lights and the ship are ♻️ hub.pokes).
      pokes: {
        balloon: 'Hot air is light, so it floats up!',
        ribbons: 'Balloons steer by finding the right wind.',
        berg: 'Southern icebergs are flat, like tables!',
        lights: 'The southern lights! They glow in the long winter night.',
        ship: 'The red ship! Pebble fell asleep on it.',
      },
      // A tap on the friends in the basket, in turn (♻️ party.balloon); a tap on Terry says ♻️ hub.terry.
      friends: [pola('Wheee!'), pebble('Higher, higher!')],
    },

    // 🎬 Film 2, night-lost: The storm. The flame gutters out and the balloon sinks into deep snow. White everywhere.
    lost: {
      terry: terry("I can't see the way!"),
      // Pebble, very small in the snow.
      how: pebble('How will I ever find Papa?'),
      // Pola wraps him in a hug.
      friends: pola('Friends help friends. Mama said so.'),
      // The memory, in the storybook look: the night he hatched (the 3D huddle's hatch scene). (🔁 huddle.papa.song,
      // huddle.papa.always) Papa sings, and baby Pebble peeps it back between the two.
      song: papa('Listen, Pebble. This is my song.'),
      always: papa("That's it! Now you'll always find me."),
      // Back in the storm.
      sing: pebble("Papa's song! I'll sing it!"),
      // He peeps it, tiny, and the wind tears the notes away.
      windy: pebble("It's too windy. He can't hear me."),
      // Pola stands up tall, Terry on her head.
      all: pola("Then we'll ALL sing it!"),
    },

    // 🎶 Act 2, chorus: Sing in the Dark (activities/night/chorus.ts). She holds Pebble, on Pola's back, to sing: the
    // longer she holds, the bigger the ring of song that rolls out across the dark snow when she lets go. It lights up
    // what it passes, and every friend it finds joins the song.
    chorus: {
      // Sparkle, as the game opens (and her hint when nothing has been sung for a while).
      start: onDevice('Hold Pebble to sing!', 'Click and hold Pebble to sing!'),
      // Sparkle, as the first ring rolls out (once).
      lights: 'Look! The song lights up the dark!',
      // Sparkle, when a ring lights up Pola, white in the white (once).
      camo: 'Pola is white like the snow. Camouflage!',
      // A ring finds the woolly hat half buried in the snow; Pebble puts it on. (Papa's line from the slide.)
      hat: pebble('A hat! It fits!'),
      // A ring finds Terry, upside down in a drift: he pops out, shakes, and joins in.
      terry: terry("Kee-arr! I'll sing too!"),
      // The ice edge. The Weddell seal pops up in her breathing hole and trills (Sparkle, ♻️ slide.facts.weddell).
      weddell: 'Weddell seals sing. It sounds like outer space!',
      // The slide's Adelies hop up out of their drift, honking along.
      adelies: pebble('The penguins are singing too!'),
      // A humpback rises in the dark sea and sings (Sparkle).
      whale: 'Humpback whales sing long, long songs!',
      // Silly: she pokes Pola, and Pola sings it back, the growly bear way.
      grr: pola('Grr-la-la!'),
      // Everyone's found: the hilltop, the colony's glow far off. Pola, then Sparkle.
      together: pola('All together now!'),
      long: onDevice('Hold Pebble for a long, long time!', 'Click and hold Pebble for a long, long time!'),
      // The rainbow ring rolls over the hills to the colony. Silence. A gold ring comes back: Papa's song.
      papa: pebble("That's Papa! He heard us!"),
      // She pokes Terry once he's singing with them.
      terryPoke: terry("Keep singing! I'm right here!"),
      // She pokes Pola once the Adelies are there (♻️ party.song.pola, in turn).
      pola: [pola('I just want to say hi!'), pola('Hi, penguins!')],
    },

    // 🎬 Film 3, night-colony: So many papas. Over the hill, a huddle of a thousand dads, steaming in the dark.
    colony: {
      whoa: pola('Whoa! So many penguins!'),
      // (♻️ story.homeLand.same)
      same: pebble('Papa? They all look the same!'),
      // Gold notes rise from deep inside the huddle; the dads near Pola squeeze together and shuffle away. Sparkle
      // (♻️ party.song.colonyFact).
      shy: "Penguins have never seen a polar bear. They're a little shy!",
      // Pola kneels and lifts Pebble down from her back.
      go: pola('Go on, Pebble. You can do it.'),
    },

    // 🐧 Act 3, huddle: Through the Huddle. She leads Pebble through the churning huddle to Papa (the 3D huddle's world).
    huddle: {
      // Sparkle, as the game opens: how to lead him, then the side verb.
      start: onDevice('Pull Pebble along with your finger!', 'Click and drag Pebble along!'),
      sing: onDevice('Tap Pebble to sing!', 'Click Pebble to sing!'),
      // Sparkle, when she's stuck.
      stuck: "Follow Papa's gold notes!",
      // A dad lifts his belly: an egg (Sparkle, once, ♻️ huddle.facts.egg).
      egg: 'Emperor dads keep the egg warm on their feet!',
      // The huddle shuffles Papa away just as Pebble gets close.
      wait: pebble('Papa, wait!'),
      // A gust rolls Pebble out: Sparkle, then Pebble (♻️ huddle.blown, huddle.pebble.blown).
      blown: 'Whoosh! Carry Pebble back to Papa.',
      pebbleBlown: pebble('Whoa! Papa, help!'),
      // The dads on the edge swap into the middle (Sparkle, once).
      turns: 'The dads take turns in the cold!',
      // She pokes a thin, sleepy dad (Sparkle, once, 🔁 huddle.facts.fast).
      fast: "Emperor dads don't eat all winter. They just keep the egg warm!",
      // Silly: a flick sends him tummy-sliding. (Walked into a dad's tummy: a bounce and a grumpy honk, no line.)
      slide: pebble('Wheee! Tummy slide!'),
      // The middle, packed tight (Sparkle).
      loud: 'Sing, Pebble! As loud as you can!',
      // The big song; the friends outside join in; the dads turn and step aside, one by one. Papa, far off, then close.
      you: papa('Pebble? Is that you?'),
      // The aisle is open (Sparkle).
      take: 'Take Pebble to Papa!',
      // She pokes the dark sky (♻️ huddle.facts.night). Pola waving over the huddle says chorus.pola.
      night: 'In winter here, the sun stays away for months!',
    },

    // 🎬 Film 4, night-sunrise: Sunrise. Pebble on Papa's feet; the first sun in months comes up as they meet.
    sunrise: {
      // (♻️ story.homeReunion.pebble, .papa)
      pebble: papa('Pebble! My Pebble!'),
      papa: pebble('Papa! I went to the top of the world!'),
      heard: papa("I heard your song. I knew you'd come."),
      // A thin line of gold on the horizon; light runs across the snow and every penguin lifts its head (Sparkle).
      sun: "The sun! It's back after months of night!",
      // Over the hill: Pola, Terry on her head. A thousand dads gasp. (♻️ story.homeLand.what, .bear,
      // story.homeReunion.friend, .thanks)
      what: papa('Goodness! What is THAT?'),
      bear: pola("Hi! I'm a polar bear!"),
      friend: pebble('This is Pola. She carried me home.'),
      thanks: papa('A polar bear at the South Pole! Thank you, Pola.'),
      friends: pola('Friends help friends!'),
      // Then everyone sings Papa's song, the whole colony too, and the music swells (no words).
    },

    // 🪨 Goodbye: Pebble gives Pola a pebble, then she flies Pola home up the toy globe (hold to rise, Act 1's move).
    goodbye: {
      // Morning. Pola looks north.
      go: pola('I have to go home now. Mama is waiting.'),
      wait: pebble('Wait! I have something for you.'),
      // He waddles off and comes back with a smooth round pebble in his beak.
      pebble: pebble('For you! Penguins give pebbles to best friends.'),
      keep: pola("I'll keep it forever."),
      // The globe: Terry asks (♻️ party.ask.bear); Sparkle says fly.start; over the warm middle, Pola's fly.warm again.
      ask: terry('Take Pola home! Where do polar bears live?'),
      // At the top, Mama on the ice; then Pola (♻️ party.home).
      back: mama('My brave cub! You came back!'),
      home: pola("I'm home! Bye, Pebble!"),
      // She pokes the pebble in Pola's paws (Sparkle, once).
      pebbleFact: 'A penguin pebble means I love you!',
    },

    // 🎬 Film 5, the-end: Top and bottom. The screen splits: Pola with her pebble under the northern lights at the top,
    // Pebble on Papa's feet in the sun at the bottom, both humming the song. Sparkle tells it.
    end: {
      top: 'Polar bears live at the top of the world.',
      bottom: 'Penguins live at the bottom.',
      never: 'They never meet...',
      // Pola and Pebble together, from the two ends of the world (one clip each, played at once).
      except: [pola('Except best friends!'), pebble('Except best friends!')],
      // Terry flies up the screen between them. Then the shell's trophy ceremony (♻️ trophyWin).
      year: terry('See you next year!'),
    },
  },
}
`;export{e as default};
//# chunkId=58feb9f4-5ddf-5310-abfe-2314f203eaf5