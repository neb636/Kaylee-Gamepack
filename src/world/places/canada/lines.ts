// Every phrase that can be spoken in Canada. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports only sdk/device.ts, which imports nothing.) Plain strings are Sparkle, the guide;
// the friends talk in their own voices from cast.json.
//
// Canada is one story, "Maple's Team" (planning/around-the-world/canada.md): Maple the beaver wants to win the Maple
// Cup, the hockey game on Ottawa's frozen canal that the geese win every year, and she can't win alone. Her friends
// live all across Canada, and every chapter brings one home to the team. The films' lines are here in play order:
// `story` (the way in, the big game's films), and each chapter's `filmIn` (before its game) and `filmOut` (after it,
// before the stamp). One block per chapter (activities/<id>/), so chapters can be worked on side by side.
// Straight apostrophes only: curly ones failed the transcription check in PR #63.
import { onDevice } from '../../../sdk/device.ts'

type Line = string | { text: string; voice: string }
const by = (voice: string) => (text: string): Line => ({ text, voice })
/** Maple the beaver, the captain. */
const maple = by('maple')
/** Monty the moose, the goalie (slow, deep, kind). */
const monty = by('moose')
/** Roxy the raccoon, the quickest paws in Canada. */
const roxy = by('raccoon')
/** Tuque the snowman she builds in Quebec City. */
const tuque = by('snowman')
/** Ollie the sea otter, the spinner. */
const ollie = by('otter')
/** Misty the spirit bear, the big slap shot. */
const misty = by('bear')
/** Lulu the loon, who sings before the big game. */
const lulu = by('loon')
/** Gus, the captain of the geese. */
const gus = by('gus')

export const L = {
  // The shell's trophy ceremony and the trophy room speak these.
  trophyWin: `You did it! You won the Canada Champion trophy!`,
  trophyRoom: `Canada Champion! From Canada.`,
  passport: 'This is Canada! It goes all the way from one ocean to the other.',
  // The passport's tap-to-hear facts.
  facts: {
    flag: "Canada's flag is red and white, with a red maple leaf in the middle.",
    bonjour: 'People in Canada speak English and French. In Quebec, hello is Bonjour!',
    huge: 'Canada is the second biggest country in the world.',
    winter: 'Canada has long, snowy winters, and red and orange leaves in the fall.',
    beaver: "The beaver is Canada's animal. Its teeth are orange and never stop growing.",
    syrup: "Most of the world's maple syrup comes from Quebec.",
    castle: "In Quebec City there's a hotel that looks like a castle.",
    hockey: "Hockey is Canada's favorite winter sport.",
    bridges: 'In Banff, animals cross the highway on their own bridges.',
  },
  // One sticker per stamp.
  stickers: {
    owl: "The snowy owl is Quebec's bird.",
    moose: 'Moose are the biggest deer in the world.',
    raccoon: 'Raccoons wash their food with their little hands.',
    loon: "The loon's call sounds like laughing.",
    otter: "Sea otters hold hands so they don't float away.",
    spirit: 'The spirit bear is a black bear with white fur.',
  },
  // The Theater's real videos (meta.videos). They wait in the Theater: none interrupts the story after a chapter.
  videos: {
    taffy: 'Real maple taffy on real snow!',
    snowman: 'The real Winter Carnival in Quebec City!',
    bike: 'Real bikes on the real mountain!',
    campfire: 'Animals that can see in the dark!',
    canoe: 'A real red canoe on Moraine Lake!',
    bridge: 'Real animals crossing their bridge!',
    whales: 'Real sea otters holding hands!',
    salmon: 'Real spirit bears catching salmon!',
    hockey: 'Skating on the real frozen canal!',
  },
  book: {
    open: onDevice('Maple\'s animal book! Tap an animal to hear about it.', 'Maple\'s animal book! Click an animal to hear about it.'),
    // Quebec City
    'snowy-owl': "A snowy owl! Quebec's bird.",
    'red-squirrel': 'A red squirrel! It loves sap.',
    chickadee: 'A chickadee! Chick-a-dee-dee!',
    'canada-goose': 'Canada geese! They fly in a V.',
    beluga: 'A beluga! A white whale that sings.',
    'red-fox': 'A red fox! It hops into the snow.',
    // Mont-Sainte-Anne
    moose: 'A moose! The biggest deer.',
    beaver: 'A beaver! It builds with sticks.',
    'black-bear': 'A black bear! It loves berries.',
    chipmunk: 'A chipmunk! Its cheeks are full.',
    porcupine: 'A porcupine! Prickly quills!',
    raccoon: 'A raccoon! It washes its food.',
    deer: 'A deer! Look at its white tail.',
    'barred-owl': 'A barred owl! Hoo hoo!',
    woodpecker: 'A woodpecker! Tap tap tap!',
    bat: 'A bat! It flies at night.',
    firefly: 'A firefly! Its tail lights up.',
    peeper: 'A spring peeper! A tiny frog.',
    hare: 'A snowshoe hare! White in winter.',
    // Banff and the Rockies
    elk: 'An elk! It squeaks like a whistle.',
    grizzly: 'A grizzly bear! It sleeps all winter.',
    bighorn: 'A bighorn sheep! Curly horns!',
    'mountain-goat': 'A mountain goat! It climbs rocks.',
    wolf: 'A wolf! Wolves live in a pack.',
    pika: 'A pika! It says eep!',
    marmot: 'A marmot! It whistles.',
    'ground-squirrel': 'A ground squirrel! It stands up tall.',
    loon: 'A loon! It laughs and dives.',
    'bald-eagle': 'A bald eagle! Its head is white.',
    trout: 'A trout! It likes cold water.',
    // British Columbia
    orca: 'An orca! Orcas swim in families.',
    humpback: 'A humpback whale! It jumps!',
    'grey-whale': 'A grey whale! It swims so far.',
    'sea-otter': 'A sea otter! Otters hold hands.',
    'sea-lion': 'A sea lion! Arf arf!',
    'harbour-seal': 'A harbour seal! It naps on rocks.',
    puffin: 'A puffin! An orange beak.',
    'sea-star': 'A sea star! Five arms.',
    salmon: 'A salmon! It swims up the river.',
    'spirit-bear': 'A spirit bear! A white black bear.',
    'banana-slug': 'A banana slug! Slimy and yellow.',
    raven: 'A raven! A clever bird.',
    // Along the train
    bison: 'A bison! It rolls in the dust.',
    'mountie-horse': "A Mountie horse! Canada's police ride horses.",
    'polar-bear': 'A polar bear! It lives up north.',
  },
  // ---------------------------------------------------------------- the story's own films (story/films/)
  story: {
    // The way in (story/films/intro.ts), on Ottawa's frozen canal. About 50 seconds, hold the button to skip.
    intro: {
      // The canal from high up, Maple skating alone with a puck.
      top: 'This is Canada! In winter, the water turns to ice.',
      // Maple, close: a wave and a twirl.
      hello: maple('Bonjour! I am Maple. I love hockey!'),
      // The golden cup on its stand in the snow.
      cup: maple("That's the Maple Cup. I want to win it so much!"),
      // The geese skate in, in a V, Gus at the front.
      geese: gus('Honk honk! The Cup is ours. Geese win every year!'),
      // The memory (the storybook look): last winter, six geese round one little beaver.
      last: maple('Last winter, I played all by myself.'),
      // Still the memory: pucks pile up in Maple's net, she sits down on her tail.
      six: gus('Six geese, one beaver! Honk honk honk!'),
      // Now again. Maple droops, then stands up straight.
      need: maple("I can't win alone. I need a team!"),
      // She points one way, then the other.
      friends: maple('My friends live all across Canada, from ocean to ocean!'),
      // To the camera.
      ask: maple('Will you help me find them?'),
      // Sparkle's balloon comes down behind her.
      go: "Let's go and find Maple's team!",
    },
    // The big game's way in (story/films/game.ts): the whole team skates out. Played by the finale before the hockey.
    gameIn: {
      // The canal in the evening, lanterns lit, the team in a row in their pink scarves.
      here: 'The big game! The whole team is here.',
      // Gus and his geese across the ice.
      gus: gus("A team? Honk! Beavers can't beat geese!"),
      // Maple, her friends behind her.
      ready: maple('We are ready, Gus. All of us!'),
      // Lulu the loon lifts her head and calls over the ice (her real call, no words).
      song: 'Shh. Lulu is singing.',
    },
    // After the last goal (story/films/game.ts), before the trophy.
    gameWin: {
      // The Cup, held up between them all.
      cup: "Maple's team wins the Maple Cup!",
      // Gus skates over and bows his long neck.
      gus: gus('Good game, little beaver. Honk.'),
      // Maple looks into the Cup.
      syrup: maple('Look! The Cup is full of maple syrup!'),
      // She pours it on the snow: taffy on a stick for every player, both teams.
      share: maple('Maple taffy for everybody. Geese too!'),
      // Everybody crunches.
      together: maple('We did it together!'),
    },
  },
  // ---- One block per chapter (activities/<id>/): its film in, the game (Sparkle's instructions and hints, the
  // friends' reactions), its film out. Keep each line under ~3 seconds; her name is never said. ----
  hub: {
    // Her first look at the map, once (Sparkle).
    first: onDevice('Tap a friend to go and get them!', 'Click a friend to go and get them!'),
    // Back on the map with a new friend on the team (Sparkle counts; said once each).
    count: ['One friend on the team! Five more to find.', 'Two friends! Four more to find.', 'Three friends! Three more to find.', 'Four friends! Two more to find.', 'Five friends! Just one more to find.'],
    // The sixth friend is home: the rink lights up.
    all: maple('Our whole team is here! To the ice!'),
    rink: onDevice('Tap the ice rink for the big game!', 'Click the ice rink for the big game!'),
    // She taps the rink before the team is whole.
    locked: maple('We need our whole team first!'),
    // Tap Maple on the rink.
    maple: [maple('Bonjour!'), maple("Let's find my team!"), maple('Go, team, go!')],
    // Tap the geese skating circles on the canal.
    gus: [gus('Honk! Nobody beats the geese!'), gus('Honk honk! See you on the ice!')],
    // Tap a friend who is already on the team (they stand at the rink in their scarves).
    team: {
      snowman: tuque('Bonjour! I am ready!'),
      bike: monty('Mmm. I am the goalie.'),
      campfire: roxy('Quick paws, ready!'),
      canoe: lulu('I am warming up my song.'),
      whales: ollie('Wheee! Hockey!'),
      salmon: misty('I brought my big swing.'),
    },
  },
  snowman: {
    // The film in (story/films/snowman.ts): the snowy park under the castle hotel, flags and lanterns, nobody about.
    filmIn: {
      hello: maple("Bonjour, Quebec City! It's the Winter Carnival!"),
      // She looks left and right: only snow.
      none: maple('But nobody here plays hockey. Only snow.'),
      // She pats a snowball; her eyes go wide.
      idea: maple("Snow! That's it! Let's make a player!"),
    },
    // The story (Maple, in the park below the castle), then Sparkle's one instruction per part.
    story: [maple("Bonjour! It's the Winter Carnival!"), maple("Let's roll snowmen!")],
    roll: 'Push the snowball! Watch it grow!',
    stack: 'Now roll the little ball into the big one!',
    dress: 'Roll a snowball into a box!',
    ready: onDevice('Tap the drum for the parade, or make more snowmen!', 'Click the drum for the parade, or make more snowmen!'),
    // Stuck for a while: Sparkle helps (the hand shows it too).
    hint: {
      roll: onDevice('Put your finger on the snowball and push!', 'Click the snowball and push it!'),
      stack: 'Push the little ball into the big one!',
      hat: 'Roll a snowball into the hat box!',
      sash: 'Roll a snowball into the sash box!',
      drum: onDevice('Tap the big drum!', 'Click the big drum!'),
    },
    // Tap-to-hear facts, the first time she pokes them.
    castle: 'This castle is really a big hotel!',
    iceMoose: 'A moose made of ice!',
    // Maple acting it out.
    big: maple('Wow, a big one!'),
    made: [maple('A snowman! Ta-da!'), maple('Another snowman!'), maple("He's so wobbly!")],
    climb: maple("Whee! I'm on top!"),
    ride: maple('Look at me!'),
    mapleHat: maple("Hee hee! That's for a snowman!"),
    dodge: maple('Eek! Watch out!'),
    poke: [maple('Hee hee!'), maple('Bonjour!')],
    parade: maple('Here comes the parade!'),
    // The snowmen wake up and talk.
    wake: [by('snowman')('Bonjour!'), by('snowman')('Hello, hello!'), by('snowman')('To the parade!')],
    upside: by('snowman')('Hello! Why is the sky down there?'),
    tickle: by('snowman')('Hee hee, that tickles!'),
    bye: by('snowman')('Merci! Bye bye!'),
    // The payoff (the stamp comes next).
    done: maple(`You made a whole parade!`),
    // The film out: the snowman in the red tuque blinks awake.
    filmOut: {
      wake: tuque('Bonjour! I am Tuque!'),
      ask: maple('Tuque! Can you play hockey?'),
      // A snowball flies in and bounces off his round tummy: boing. Then:
      tummy: tuque('Ho ho! Nothing gets past my tummy!'),
      // Maple ties a pink team scarf round him.
      team: maple("You're on the team!"),
    },
  },
  bike: {
    // The film in (story/films/bike.ts): the top of Mont-Sainte-Anne, the gondola behind, the forest far below.
    filmIn: {
      high: maple('My friend Monty is the biggest moose in Canada!'),
      // The camera looks down the mountain: a tiny moose in a pond by the waterfall.
      bath: maple("He's having his bath at the waterfall, way down there."),
      // She hops on her bike.
      go: maple('The fastest way down is my bike. Hold on!'),
    },
    // The story, in the gondola at the bottom (Maple, then up they go).
    story: [maple('Bonjour! I want to ride all the way down to the waterfall!'), maple('Up we go!')],
    // Sparkle: the one instruction when the bike rolls out of the station, what's new on the way, the stuck hint.
    steer: onDevice('Hold your finger down and steer the bike!', 'Click and hold to steer the bike!'),
    split: 'Two trails! Green or blue?',
    creek: 'The bridge, or splash through the creek?',
    hint: onDevice('Push your finger left or right!', 'Hold the click and move left or right!'),
    // Maple's whoops and her silly moments.
    high: maple('Wow, so high!'),
    rock: maple('Whoa, wobbly!'),
    go: maple('Here we go!'),
    whee: [maple('Wheee!'), maple('Woo-hoo!'), maple('Yahoo!')],
    leaves: [maple('Ha ha! I am all leaves!'), maple('Leaf shower!')],
    bell: [maple('Ding ding!'), maple('Boing!')],
    splash: maple('Splash! My tail is wet!'),
    bridge: maple('Tock, tock, tock!'),
    bonk: maple('Oops, bumpy!'),
    green: maple('The green way!'),
    blue: maple('The blue way! Hold on!'),
    jump: maple('Up, up and away!'),
    falls: maple('We made it! The waterfall!'),
    thanks: maple('Thank you! What a ride!'),
    // The animals, in their own voices.
    moose: [by('moose')('Mmm. Bonjour.'), by('moose')('Munch, munch.')],
    chipmunk: by('chipmunk')('Seeds! Seeds!'),
    bear: by('bear')('Mmm, berries!'),
    // The film out: the pond at the waterfall, Monty chewing, a lily pad on one antler.
    filmOut: {
      found: maple('Monty! Will you be our goalie?'),
      what: monty('Mmm. What does a goalie do?'),
      stand: maple("You stand in front of the net. That's all!"),
      good: monty('Mmm. I am very good at standing.'),
      // A pinecone drops out of a tree and bonks off his antlers. He doesn't notice.
      team: maple('Nothing gets past Monty!'),
    },
  },
  campfire: {
    // The film in (story/films/campfire.ts): the campsite at night, Maple by the fire with her marshmallows.
    filmIn: {
      shh: maple('Shh. Somebody quick and sneaky lives in these woods.'),
      // A little grey paw comes out of the dark and takes a marshmallow. Then another.
      hey: maple("Hey! My marshmallow! Who's out there?"),
    },
    // The story (before the first touch): Maple, then Sparkle's one instruction.
    story: [maple("Shh! Who's out there?"), onDevice('Move your finger to shine the light!', 'Click and hold, then move to shine the light!')],
    // Sparkle: each part's instruction (the prompt bubble plays it again), and her hints when Kaylee is stuck.
    eyes: onDevice('Move your finger to shine the light!', 'Click and hold, then move to shine the light!'),
    eyesHint: 'Look for shiny eyes in the dark!',
    allOut: maple('You found everybody!'),
    sounds: 'Listen! Who made that sound?',
    soundsHint: 'Shine the light where the sound is.',
    allSounds: maple('Wow, you found every sound!'),
    banditGone: maple('Hey! Our marshmallows are gone!'),
    bandit: 'Follow the little paw prints!',
    banditHint: 'Shine the light on the next paw print.',
    caught: by('raccoon')('Hee hee! Marshmallows for my babies!'),
    sorry: by('raccoon')("Oops, sorry! Let's share."),
    roast: maple("Let's roast more!"),
    marshmallow: onDevice('Hold the marshmallow near the fire.', 'Click and hold the marshmallow near the fire.'),
    marshmallowHint: 'Give it to Maple or the raccoons.',
    onFire: onDevice("It's on fire! Tap it to blow it out!", "It's on fire! Click it to blow it out!"),
    golden: maple('Golden! Yummy!'),
    squishy: maple('Squishy! Yum anyway.'),
    tooCrunchy: maple('Too crunchy for me!'),
    burntYum: by('raccoon')('Crunchy! My favorite!'),
    munch: by('raccoon')('Crunch, munch!'),
    stars: 'Now shine the light at the sky!',
    starsHint: 'Shine the light up high!',
    fullSky: maple('Look! The sky is full of stars!'),
    goodnight: maple('Goodnight, little campsite!'),
    // The friends, when she pokes them.
    owl: by('owl')('Who cooks for you? Hoo hoo!'),
    raccoonHi: by('raccoon')('Hee hee! You found me!'),
    porcupine: maple('Ouch! Prickly!'),
    mooseBright: by('moose')('Whoa! Too bright!'),
    mooseShades: by('moose')('Ahh. Sunglasses. Much better.'),
    mooseHi: by('moose')('Mmm. Hello there.'),
    mapleHi: maple('Hee hee! That tickles!'),
    tent: maple('Shh! Someone is sleeping.'),
    // The film out: Roxy and her three kits at the fire, a marshmallow each.
    filmOut: {
      quick: maple('Roxy! You have the quickest paws in Canada!'),
      // Maple holds up a puck. A blink, and Roxy has it.
      got: roxy('Hee hee! Got your puck!'),
      ask: maple('Will you steal the puck from the geese?'),
      babies: roxy('Only if my babies can come and cheer!'),
      // The kits squeak and wave their marshmallow sticks.
      team: maple('Deal! Go, team, go!'),
    },
  },
  canoe: {
    // The film in (story/films/canoe.ts): the dock on the turquoise lake, Maple in the red canoe.
    filmIn: {
      song: maple('Every big game starts with a song.'),
      // A loon calls, far across the water, and the mountains answer.
      lulu: maple("That's Lulu the loon! Nobody sings like Lulu."),
      across: maple("She lives across the lake, by the glacier. Let's paddle!"),
    },
    // The story: Maple at the dock, in the red canoe.
    story: maple('Why is my lake so blue?'),
    // Sparkle: how to paddle (one way or the other), and the hint when she hasn't paddled for a while.
    go: { stroke: 'Pull the paddle back through the water!', pull: onDevice('Hold the water where the canoe should go!', 'Click and hold where the canoe should go!') },
    hint: { stroke: onDevice('Drag your finger back, beside the canoe.', 'Click and drag back, beside the canoe.'), pull: onDevice('Press the water in front of the canoe.', 'Click the water in front of the canoe.') },
    // Where the blue comes from.
    stream: 'Paddle to the milky water by the glacier stream!',
    streamMaple: maple('Ooh! What is that milky water?'),
    streamHint: 'Follow the sparkles to the milky water.',
    found: 'Rock flour from the glacier makes the lake so blue!',
    foundMaple: maple('We found the blue!'),
    // Follow the loon.
    loon: 'Bubbles! Follow them to find the loon.',
    loonHint: 'Paddle to the bubbles!',
    loonFound: [maple('There she is!'), maple('Found you, loon!'), maple('Peekaboo, loon!')],
    chick: maple('Look! A baby loon on her back!'),
    family: maple('A whole loon family! Merci!'),
    // Tap-to-hear facts (the first time she pokes the glacier, the second time the loon).
    glacier: 'A glacier is a river of ice. It moves very slowly.',
    loonie: "The loon is on Canada's dollar coin. It's called a loonie!",
    // Silly moments and pokes.
    dizzy: maple("Whoa! I'm dizzy!"),
    parade: maple('A duck parade!'),
    bonk: maple('Bonk! Hee hee!'),
    pokeMaple: [maple('Paddle, paddle!'), maple('Splish, splash!'), maple('I love my red canoe!')],
    beaver: maple('Allo, cousin beaver!'),
    moose: by('moose')('Mmm. Tasty lake weeds.'),
    // The film out: under the glacier, Lulu with her chick on her back.
    filmOut: {
      ask: maple('Lulu! Will you sing at our big game?'),
      yes: lulu('A big game? I will sing my very best song.'),
      // She calls, long and lovely. Her chick tries too: a tiny squeak.
      chick: maple('Hee hee! The littlest singer!'),
    },
  },
  whales: {
    // The film in (story/films/whales.ts): the dock at Tofino, Maple at the wheel of the little boat.
    filmIn: {
      ollie: maple('Ollie the sea otter spins faster than anybody!'),
      // The camera looks out to sea: kelp, and a spout far off.
      out: maple("She's out in the kelp, where the whales swim."),
    },
    // The story, at the dock (Maple at the wheel of the little boat).
    story: [maple("I've never seen a whale!"), maple("Let's find them!")],
    // Sparkle: how to steer (one line before her hands are busy), then only when something new appears.
    steer: { finger: onDevice('Hold the water where the boat should go!', 'Click and hold where the boat should go!'), wheel: onDevice('Hold and push to steer the boat!', 'Click and hold, then push to steer the boat!') },
    otters: 'A sleepy otter floated away. Go gently!',
    spouts: 'A spout! Steer there to find the whale!',
    orcas: 'The orca family! Go fast and turn!',
    listen: 'Shh! Listen to the whales sing.',
    // Sparkle, when she's stuck (~8 s with no progress): help, never "wrong".
    hint: {
      harbour: 'Steer out past the lighthouse!',
      otters: 'Go slowly to the sleepy otter.',
      tow: 'Take her back to her friends!',
      spouts: 'Look for the spout. Steer there!',
      orcas: 'Go fast and turn. The baby copies you!',
      mic: onDevice('Tap the yellow microphone to listen!', 'Click the yellow microphone to listen!'),
    },
    // The sea otters.
    otterWake: by('otter')('Oh! Hello!'),
    otterTow: by('otter')('Wheee! Take me home!'),
    otterHome: by('otter')('Thank you!'),
    otterHold: maple("They hold hands so they don't float away!"),
    otterGrumpy: by('otter')('Hey! Too fast!'),
    otterHi: by('otter')('Hi hi!'),
    otterClack: by('otter')('Yum, a clam!'),
    // The whales.
    whaleUp: maple('A whale! A real whale!'),
    whaleBlow: maple('It breathes out of its head!'),
    whaleTail: maple('Look at its tail!'),
    humpback: maple('Look at its long flippers!'),
    breach: maple('Wow! It jumped right out!'),
    sneeze: maple('Achoo! I am all wet!'),
    bump: maple('Oops! Excuse us, whale!'),
    // The orcas.
    orcaHello: maple('Orcas! A whole family!'),
    grandma: maple('The grandma leads the family!'),
    babyCopy: maple('The baby copies you!'),
    // The big finish, and Maple's taps on the boat.
    finale: maple(`They all jumped together! Merci!`),
    toot: maple('Toot toot!'),
    song: maple('The humpback is singing!'),
    // The film out: Ollie on her back in the kelp, a clam on her tummy.
    filmOut: {
      ask: maple('Ollie! Come and play hockey with us!'),
      wet: ollie('Hockey? Is it wet?'),
      ice: maple("It's ice! You slide on it!"),
      // She spins on her back like a top.
      spin: ollie('Wheee! I love to slide!'),
      // A whale spouts right behind them: everybody is soaked.
      team: maple("Splash! You're on the team!"),
    },
  },
  salmon: {
    // The film in (story/films/salmon.ts): the rainforest river, giant cedars, soft rain.
    filmIn: {
      white: maple('In this rainforest lives a bear as white as snow.'),
      // Misty swings a paw at a jumping salmon: an enormous splash, and no fish.
      swing: maple('Wow! Look at that swing!'),
      fishing: misty("Shh. I'm fishing. No hockey till I've had my supper."),
      // Maple, behind her paw, to the camera.
      help: maple("Psst! Let's help the salmon jump past her!"),
    },
    // The story (Maple, at the river).
    story: [maple('Help the salmon jump home!')],
    // Sparkle: once when each stretch of the river begins, and again when she's stuck.
    steps: onDevice('Grab a salmon, and flick it up!', 'Grab a salmon, and drag it up fast!'),
    falls: 'The big falls! Try the rock, or the log.',
    bears: onDevice('The bears are fishing! Flick the salmon past them.', 'The bears are fishing! Drag the salmon up past them.'),
    eggs: onDevice('Home! Tap each salmon to lay its eggs.', 'Home! Click each salmon to lay its eggs.'),
    hatch: onDevice('Spring! Tap the eggs.', 'Spring! Click the eggs.'),
    bonk: onDevice('Bonk! Try a bigger flick.', 'Bonk! Try a bigger, faster drag.'),
    rain: "Rain! It's a rainforest.",
    cedar: 'This cedar tree is taller than a house!',
    seasons: 'Fall... winter... and spring!',
    // Maple, cheering on the bank (and catching the ones flicked too hard).
    home: [maple('Bravo!'), maple('Home!'), maple('Youpi!'), maple('Allez, allez!')],
    lap: [maple('Ooh! A salmon in my lap!'), maple('Hee hee! Too high!')],
    poke: [maple('Allez, salmon!'), maple('Jump, jump!')],
    berries: maple('The bears went to eat berries!'),
    sea: maple('Bye, little salmon! Swim to the sea!'),
    win: maple('You brought the salmon home!'),
    // The bears (the same gentle bear voice for both). The white one is Misty: always thinking about supper.
    achoo: by('bear')('Ah... choo!'),
    spirit: misty("I'm a spirit bear. I'm hungry!"),
    black: by('bear')("Shh, I'm fishing."),
    // Misty swats at a salmon flying past, and misses (said once or twice a visit).
    miss: misty('Missed again!'),
    giveUp: { black: by('bear')('Okay, berries instead!'), spirit: misty('Too slippery! Berries, then.') },
    yum: by('bear')('Mmm, berries!'),
    // The film out: the salmon are home, Misty has a paw full of berries.
    filmOut: {
      berries: misty('Mmm. Berries are easier than fish.'),
      stick: maple('Misty! Try this hockey stick!'),
      // One swing: a pinecone sails over the tallest cedar.
      shot: maple('The biggest slap shot in Canada!'),
      team: misty('I like this game. I will come!'),
    },
  },
  // The finale (activities/party/): the big game on the frozen canal, between story.gameIn and story.gameWin.
  party: {
    // The story, on the toy map in Ottawa.
    rink: onDevice("Flick the puck into the geese's net!", "Drag the puck fast into the geese's net!"),
    rinkHint: onDevice('Swipe from the puck to the net!', 'Drag from the puck to the net!'),
    geese: 'The geese are in the way! Bounce it off the snow!',
    last: 'One more goal to win!',
    saved: ['The goose saved it! Again!', 'So close! Try again!'],
    goal: [maple('Goal!'), maple('Beauty, eh!'), maple('Youpi, a goal!')],
    mooseGoal: by('moose')('Mmm. Nice one.'),
    mooseBlock: by('moose')('Bonk. Not today, geese.'),
    win: maple("We won! We're the champions!"),
    winFact: "Hockey is Canada's favorite winter sport!",
    // Pokes on the canal (and her teammates' first pass back).
    poke: {
      maple: maple('Pass me the puck!'),
      moose: by('moose')('Hello. I am the goalie.'),
      owl: by('owl')('Hoo! Pass to me!'),
      raccoon: by('raccoon')('Mine! I mean, yours!'),
      otter: by('otter')('Wheee! Look, I spin!'),
      grizzly: by('bear')('Grr! Go team!'),
      spirit: by('bear')('Watch my big slap shot!'),
      squirrel: by('chipmunk')('Go, go, go!'),
    },
    stand: maple('Mmm, a BeaverTail! Sweet, like my tail!'),
    parliament: "That's Parliament, in Ottawa, Canada's capital!",
    canal: 'In winter, this canal freezes into a giant skating rink!',
  },
  // Maple's hello, anywhere she meets her.
  bonjour: maple('Bonjour!'),
}
