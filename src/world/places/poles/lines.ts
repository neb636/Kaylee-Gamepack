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

  // ---- The globe hub (activities/hub/) ----
  hub: {
    welcome: 'Welcome to the Poles! Grab the globe and spin it.',
    spin: 'Spin the globe up or down!',
    // Each friend's hello the first time their side comes round, then what they say when she taps them (in turn).
    polaHi: pola("Hi! I'm Pola. I live on the sea ice!"),
    pebbleHi: pebble("Hi! I'm Pebble. I live in Antarctica!"),
    pola: [pola('Ha ha, that tickles!'), pola('The ice floats on the sea!'), pola('Brr! I love the cold!')],
    pebble: [pebble('Hello again!'), pebble('Waddle, waddle!'), pebble('No polar bears down here!')],
    spots: onDevice('Tap a picture to play!', 'Click a picture to play!'),
    party: onDevice('You got every stamp! Tap the party!', 'You got every stamp! Click the party!'),
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
    // The opening (the story section): Pola far out on the ice calls to Mama, who waves from the big ice.
    story: [pola('Mama! I am way over here!')],
    // Sparkle: what to do at each stretch (said when it starts, and again when she's stuck).
    hint: {
      steady: onDevice('Pull Pola back, and let go!', 'Click Pola, pull her back, and let go!'),
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
    homeCheer: `You got Pola home!`,
  },

  // ---- Snow Coats (activities/coats/) ----
  // Sparkle says what to do as each part starts (and again when nothing's been touched for a while); the facts come the
  // first time she pokes an animal (Guide.once), never as required listening.
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

  // ---- Iceberg Maker (activities/iceberg/) ----
  iceberg: {
    // Sparkle: what to do (each is also the hint when she's stuck there).
    pick: 'Pick a pole: north or south?',
    bits: onDevice('Tap the cracks to break off the ice!', 'Click the cracks to break off the ice!'),
    giant: onDevice('A giant crack! Tap, tap, tap!', 'A giant crack! Click, click, click!'),
    under: 'Look! Most of the iceberg hides under the water.',
    push: onDevice('Push the iceberg down with your finger!', 'Click and drag to push the iceberg down!'),
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
