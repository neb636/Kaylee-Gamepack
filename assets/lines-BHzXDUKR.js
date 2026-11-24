!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e._posthogReleaseId=e._posthogReleaseId||"01a20ef6-0795-0000-525f-cfac5a31a7e0";var n=(new e.Error).stack;n&&(e._posthogChunkIds=e._posthogChunkIds||{},e._posthogChunkIds[n]="522cd777-4c3f-5bd6-8a80-8c0e5be1ff51")}catch(e){}}();
var e=`// Every phrase that can be spoken in Canada. \`node scripts/world-voice-lines.mjs\` turns this into voice-lines.json.
// (This file is also read by Node, so it imports only sdk/device.ts, which imports nothing.) Plain strings are Sparkle, the guide;
// the friends talk in their own voices from cast.json.
//
// Canada is one story, "Maple's Team": Maple the beaver wants to win the Maple
// Cup, the hockey game on Ottawa's frozen canal that the geese win every year, and she can't win alone. Her friends
// live all across Canada, and every chapter brings one home to the team. The films' lines are here in play order:
// \`story\` (the way in, the big game's films), and each chapter's \`filmIn\` (before its game) and \`filmOut\` (after it,
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
  trophyWin: \`You did it! You won the Canada Champion trophy!\`,
  trophyRoom: \`Canada Champion! From Canada.\`,
  passport: 'This is Canada! It goes all the way from one ocean to the other.',
  // The passport's tap-to-hear facts.
  facts: {
    flag: "Canada's flag is red and white, with a red maple leaf in the middle.",
    bonjour: 'People in Canada speak English and French. In Quebec, hello is Bonjour!',
    huge: 'Canada is the second biggest country in the world.',
    winter: 'Canada has long, snowy winters, and red and orange leaves in the fall.',
    beaver: "There are lots of beavers in Canada. Their teeth are orange and never stop growing.",
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
    bike: 'Bikes on the mountain!',
    campfire: 'Animals that can see in the dark!',
    canoe: 'A real red canoe on Moraine Lake!',
    bridge: 'Real animals crossing their bridge!',
    whales: 'Real sea otters holding hands!',
    salmon: 'Real spirit bears catching salmon!',
    hockey: 'Skating on the real frozen canal!',
  },
  book: {
    open: onDevice('Maple\\'s animal book! Tap an animal to hear about it.', 'Maple\\'s animal book! Click an animal to hear about it.'),
    // Quebec City
    'snowy-owl': "A snowy owl! Quebec's bird.",
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
    'mountain-goat': 'A mountain goat! It climbs rocks.',
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
    // On the map
    bison: 'A bison! It rolls in the dust.',
  },
  // ---------------------------------------------------------------- the story's own films (story/films/)
  story: {
    // The way in (story/films/intro.ts), on Ottawa's frozen canal. About 40 seconds, hold the button to skip.
    intro: {
      // The canal from high up, Maple skating alone with a puck.
      top: 'This is Canada! In winter, the water turns to ice.',
      // Maple, close: a wave and a twirl.
      hello: maple('Bonjour! I am Maple. I love hockey!'),
      // The golden cup on its stand in the snow.
      cup: maple("That's the Maple Cup. I want to win it so much!"),
      // The geese skate in, in a V, Gus at the front.
      geese: gus('Honk honk! Geese win the Cup every year!'),
      // The memory (the storybook look): last winter, six geese round one little beaver.
      last: maple('Last winter, I played all by myself.'),
      // Still the memory: pucks pile up in Maple's net, she sits down on her tail.
      six: gus('Six geese, one beaver! Honk honk honk!'),
      // Now again. Maple droops, then stands up straight.
      need: maple("I can't win alone. I need a team!"),
      // She points one way, then the other, then to the camera.
      ask: maple('My friends live all across Canada. Will you help me find them?'),
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
    // Gus, at the rink, as she lands back with a new friend (after Sparkle's count and the friend's move): by how
    // many are on the team now, 1..6. He brags a little less each time.
    gusCount: [gus('One friend? Honk! Easy!'), gus('Two? Ha! We are six geese!'), gus('Three... honk. Still easy.'), gus('Four? Geese! More practice!'), gus('Five?! Uh oh.'), gus('A whole team? Honk... gulp.')],
    // Tap a friend who is already on the team (they stand at the rink in their scarves).
    team: {
      snowman: tuque('Bonjour! I am ready!'),
      bike: monty('Mmm. I am the goalie.'),
      campfire: roxy('Quick paws, ready!'),
      canoe: lulu('I am warming up my song.'),
      whales: ollie('Wheee! Hockey!'),
      bath: misty('I brought my big swing.'),
    },
    // Sparkle, the first time she pokes these on the map (once a visit). The animals' names come from Maple's book.
    pokes: {
      balloon: 'My balloon! It flies us everywhere.',
      rockies: 'The Rocky Mountains! Big and snowy.',
      north: 'Way up north, it is snowy all year.',
      hudson: 'Hudson Bay! Its water gets icy.',
      prairie: 'The prairie! Fields of wheat for bread.',
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
    // The game's own hello (Maple, in the park below the castle), only from a link or a replay: after the film in, the
    // game starts with Sparkle's instruction. Then Sparkle's one instruction per part.
    story: [maple('Bonjour! Look at all this snow!'), maple("Let's build a snowman for my team!")],
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
    // The first snowman she stacks and dresses is Tuque: he wakes up and says his name.
    tuque: tuque('Bonjour! I am Tuque!'),
    // The other snowmen wake up and talk.
    wake: [by('snowman')('Bonjour!'), by('snowman')('Hello, hello!'), by('snowman')('To the parade!')],
    upside: by('snowman')('Hello! Why is the sky down there?'),
    tickle: by('snowman')('Hee hee, that tickles!'),
    bye: by('snowman')('Merci! Bye bye!'),
    // The payoff (the stamp comes next).
    done: maple(\`You made a whole parade!\`),
    // The film out: Tuque, the snowman she made, has dozed off after the parade. Maple boops his carrot; he blinks awake.
    filmOut: {
      wake: tuque('Oh! Bonjour, Maple!'),
      ask: maple('Tuque! Can you play hockey?'),
      // A snowball flies in and bounces off his round tummy: boing. Then:
      tummy: tuque('Ho ho! Everything bounces off my tummy!'),
      // Maple ties a pink team scarf round him.
      team: maple("You're on the team!"),
    },
  },
  bike: {
    // The film in (story/films/bike.ts): the top of Mont-Sainte-Anne, the gondola behind, the forest far below.
    filmIn: {
      high: maple('My friend Monty is the biggest moose in Canada!'),
      // The camera looks down the mountain: a tiny moose in a pond by the waterfall.
      bath: maple("He's having his bath, way down there."),
      // She hops on her bike.
      go: maple('The fastest way down is my bike. Hold on!'),
    },
    // From a link or a replay (no film in): a short hello in her gondola cabin at the bottom, then up they go.
    story: [maple('Up we go! Then we ride down to Monty!')],
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
    // At the bottom: she spots Monty in the pool (he says hello, \`moose[0]\`), and the film out picks up there.
    falls: maple('There he is, in the water!'),
    // The animals, in their own voices.
    moose: [by('moose')('Mmm. Bonjour.'), by('moose')('Munch, munch.')],
    chipmunk: by('chipmunk')('Seeds! Seeds!'),
    bear: by('bear')('Mmm, berries!'),
    // The film out: the pond at the waterfall, Monty chewing, a lily pad on one antler.
    filmOut: {
      found: maple('Monty! Will you be our goalie?'),
      what: monty('Mmm. What does a goalie do?'),
      stand: maple('You stand in front of the net. Easy!'),
      good: monty('Mmm. I am very good at standing.'),
      // A pinecone drops out of a tree and bonks off his antlers. He doesn't notice.
      team: maple('Nothing gets past Monty!'),
    },
  },
  campfire: {
    // The film in (story/films/campfire.ts): the campsite at night, Maple by the fire with her marshmallows.
    filmIn: {
      shh: maple('Shh. Somebody sneaky lives in these woods.'),
      // A little grey paw comes out of the dark and takes a marshmallow. Then another.
      hey: maple("Hey! My marshmallow! Who's out there?"),
    },
    // ---- The game, Flashlight Statues (canada-round-2.md in git history, part 2): her finger is the
    // flashlight. From a link or a replay Maple says hello first; after the film it starts at Sparkle's instruction.
    story: maple('Shh! Somebody is watching us from the dark.'),
    // Sparkle: the game opens (the line at the bottom plays it again), and her hint when nothing new has been lit for 8 s.
    eyes: onDevice('Move your finger to shine the light!', 'Click and hold, then move to shine the light!'),
    eyesHint: 'Look for shiny eyes in the dark!',
    // Who's out there: the light lands on them (each says it the first time).
    owl: by('owl')('Who cooks for you? Hoo hoo!'),
    // Monty squints in the light; then on go his sunglasses.
    mooseBright: monty('Whoa! Too bright!'),
    mooseShades: monty('Ahh. Sunglasses. Much better.'),
    // The porcupine puffs into a prickly ball.
    porcupine: maple('Ouch! Prickly!'),
    // Light on Maple: she makes shadow bunnies with her paws.
    mapleHi: maple('Hee hee! That tickles!'),
    // The light held on the fire: nothing happens.
    fireBright: maple("It's already bright!"),
    // Giggling starts in the dark (Sparkle): peek-a-boo with Roxy's kits. A kit's tail sticks out after ~8 s.
    giggle: 'Somebody is giggling! Catch them in the light!',
    kitHint: 'Shine the light on the wiggly tail!',
    // Three kits at the fire.
    kits: maple('Three little raccoons! Where is your mama?'),
    // Statues: Roxy sneaks toward the marshmallow bag whenever the light is off her (Sparkle; and her hint).
    sneak: 'Roxy is sneaking! Shine the light and she stops!',
    // Her statues (one each time she's caught in the beam): the tree, the whistle, the stretch.
    statues: [roxy("I'm a tree."), roxy('Nobody here!'), roxy('Just stretching!')],
    // She reaches the bag.
    yoink: roxy('Yoink!'),
    // She has fallen over laughing three times: she gives up.
    sorry: roxy("Oops, sorry! Let's share."),
    // The roast: the flashlight is put away, the camera comes close to the fire, and everyone shows which marshmallow
    // they want in a wish bubble (a picture: squishy, golden, burnt, Monty's giant one). A stick is propped over the
    // fire; a marshmallow from the bag toasts on it by itself. Maple, then Sparkle; on fire (Sparkle); her hint when
    // it looks like somebody's picture and is still on the stick.
    roast: maple("Let's roast more!"),
    marshmallow: 'Put a marshmallow on the stick! Toast it like the picture.',
    onFire: "It's on fire!",
    marshmallowHint: 'Who wants that one?',
    // Who gets it: Maple wants golden, a kit squishy (white, straight out of the bag), Roxy and a kit burnt, Monty the giant one (he eats the stick).
    golden: maple('Golden! Yummy!'),
    kitSquishy: roxy('Squishy! Yay!'),
    burntYum: roxy('Crunchy! My favorite!'),
    montyStick: monty('Mmm. Crunchy stick.'),
    // The wrong kind: they eat it anyway, and still want theirs (Maple: too white, or burnt; Roxy: not burnt yet).
    squishy: maple('Squishy! Yum anyway.'),
    tooCrunchy: maple('Too crunchy for me!'),
    moreCrunchy: roxy('Yum! Crunchier next time!'),
    // Somebody with no order out gets one anyway.
    munch: roxy('Crunch, munch!'),
    // Every order given right.
    best: maple('Best campfire ever!'),
    // The end (Sparkle): the flashlight goes off; the stars come out (Maple), then the northern lights (Sparkle).
    off: onDevice('Now tap the flashlight to turn it off!', 'Now click the flashlight to turn it off!'),
    fullSky: maple('Look! The sky is full of stars!'),
    lights: 'The northern lights! They dance over Canada.',
    // Only when no film follows (a replay).
    goodnight: maple('Goodnight, little campsite!'),
    // The film out: Roxy and her three kits at the fire, a marshmallow each. Maple holds up a puck: a blink, and Roxy
    // has it (the quickest paws in Canada: the picture says it).
    filmOut: {
      got: roxy('Hee hee! Got your puck!'),
      ask: maple('Roxy! Will you steal the puck from the geese?'),
      babies: roxy('Only if my babies can come and cheer!'),
      // The kits squeak and wave their marshmallow sticks.
      team: maple('Deal! Go, team, go!'),
    },
  },
  canoe: {
    // The film in (story/films/canoe.ts): the dock on the turquoise lake, Maple in the red canoe.
    filmIn: {
      song: maple('Every big game starts with a song.'),
      // A loon calls, far across the water, and the mountains answer (a beat with no line). Then Lulu herself by the
      // glacier, looking all round: her chick has paddled off.
      call: lulu('Baby? Where are you?'),
      // Maple's ears go up.
      lulu: maple("That's Lulu! Her baby swam away."),
      across: maple("No baby, no song! Let's go find it!"),
    },
    // The game's hello, from a link or a replay (after the film it starts on the water with Sparkle's line).
    story: maple("Bonjour! Hop in, we go to find Lulu's baby!"),
    // Sparkle: how to paddle, and the hint when she hasn't paddled for a while (the hand shows it too).
    go: onDevice('Hold the water, and Maple paddles there!', 'Click and hold the water, and Maple paddles there!'),
    hint: onDevice('Touch the water in front of the canoe!', 'Click the water in front of the canoe!'),
    // Find the chick: a tiny peep from the milky water by the glacier stream (louder as she nears).
    stream: 'Listen! A little peep, by the milky water!',
    streamMaple: maple('Peep peep! Is that the baby?'),
    streamHint: 'Follow the sparkles to the milky water.',
    chickFound: maple('There you are! Hop on, little one!'),
    // Tap-to-hear: the first time she pokes the milky water.
    found: 'Rock flour from the glacier makes the lake so blue!',
    // Take the chick to Lulu: she dives to look for her baby and pops up nearer the glacier each time.
    loon: 'Bubbles! Take the baby to Lulu.',
    loonHint: 'Paddle to the bubbles!',
    loonFound: [maple('Lulu! Over here!'), maple('Lulu! We have your baby!')],
    // The third time she sees her chick: it hops onto her back.
    home: lulu('My baby! Thank you!'),
    chick: maple('A big hug! Hee hee!'),
    // The try-out: tap Lulu and she sings; the glacier sings it back.
    sing: onDevice('Tap Lulu, and she sings!', 'Click Lulu, and she sings!'),
    echo: maple('Listen! The glacier sings back!'),
    family: maple('What a song! Bravo, Lulu!'),
    // Tap-to-hear facts (the first time she pokes the glacier, the second time Lulu).
    glacier: 'A glacier is a river of ice. It moves very slowly.',
    loonie: "The loon is on Canada's dollar coin. It's called a loonie!",
    // Silly moments and pokes.
    dizzy: maple("Whoa! I'm dizzy!"),
    parade: maple('A duck parade!'),
    bonk: maple('Bonk! Hee hee!'),
    pokeMaple: [maple('Paddle, paddle!'), maple('Splish, splash!'), maple('I love my red canoe!')],
    beaver: maple('Allo, cousin beaver!'),
    moose: by('moose')('Mmm. Tasty lake weeds.'),
    // The film out: under the glacier, Lulu with her chick on her back. (She sang in the game: the film is the ask.)
    filmOut: {
      ask: maple('Lulu! Will you sing at our big game?'),
      yes: lulu('A big game? I will sing my best song!'),
      // Her chick tries too: a tiny squeak (a beat with no line).
      chick: maple('Hee hee! The littlest singer!'),
      // The pink scarf goes round Lulu's neck.
      team: maple("You're on the team!"),
    },
  },
  whales: {
    // Whale Peek-a-Boo (activities/whales/; canada-round-2.md in git history, section 3): a whale's spout
    // blew Ollie's lucky rock out to sea; bubbles come up by the boat, she touches them and a whale peeks out.
    // The film in (story/films/whales.ts): the kelp off Tofino, Ollie juggling her lucky rock on her tummy.
    filmIn: {
      ollie: maple('Ollie the sea otter spins faster than anybody!'),
      lucky: ollie('Look! My lucky rock!'),
      // Higher, higher... a whale comes up under it. The spout shoots the rock into the sky and away. (Also Ollie's
      // one line when the game opens from a link or a replay.)
      took: ollie('My rock! The whale took it!'),
      hop: maple("Hop on! We'll get it back!"),
    },
    // The game opens (Sparkle): bubbles by the boat. Stuck about 8 s with the bubbles up: the hint.
    bubbles: onDevice('Bubbles! Tap them!', 'Bubbles! Click them!'),
    bubblesHint: 'Look for the bubbles!',
    // The grey whale peeks out (Maple), then Sparkle, once (and again as the hint when she's stuck).
    whaleUp: maple('A whale! A real whale!'),
    tapWhale: onDevice('Tap the whale and see what it does!', 'Click the whale and see what it does!'),
    // The blowhole: the spout comes down on the boat (the second time, Maple's soaked face in close-up).
    whaleBlow: maple('It breathes out of its head!'),
    sneeze: maple('Hey, you splashed me!'),
    // The tail (a slap, or held: a push for the boat); after a while Ollie asks, and the tail shows a sea star.
    seenRock: ollie('Have you seen my rock?'),
    whaleTail: maple('Look at its tail!'),
    seaStar: ollie("That's a sea star, silly!"),
    // The humpback is up (Sparkle; and the hint).
    hold: onDevice('Hold the whale down, then let go!', 'Click and hold the whale, then let go!'),
    // Its first jump, its second.
    breach: maple('Wow! It jumped right out!'),
    humpback: maple('Look at its long flippers!'),
    // The biggest jump lands the boat on its back.
    ride: maple("We're riding a whale!"),
    // The yellow microphone: the humpback sings into it.
    song: maple('The humpback is singing!'),
    // The orcas come; the baby pops up with the rock on its nose; Sparkle (and the hint on the last pop).
    orcaHello: maple('Orcas! A whole family!'),
    babyHas: ollie('My rock! The baby has it!'),
    peek: onDevice('Peek-a-boo! Tap the baby orca!', 'Peek-a-boo! Click the baby orca!'),
    // Grandma comes up; the baby flicks the rock to Ollie; everybody jumps.
    grandma: maple('The grandma leads the family!'),
    gotIt: ollie('Got it! Thank you, whales!'),
    finale: maple(\`They all jumped together! Merci!\`),
    // Pokes: Maple's boat (its horn), Ollie in the bow.
    toot: maple('Toot toot!'),
    otterHi: by('otter')('Hi hi!'),
    // The film out: Ollie on her back in the kelp, juggling her rock while they talk.
    filmOut: {
      ask: maple('Ollie! Come and play hockey with us!'),
      wet: ollie("What's hockey?"),
      ice: maple("It's like soccer, but on ice!"),
      // She spins on her back like a top.
      spin: ollie('Wheee! I love to slide!'),
      // A whale spouts right behind them: everybody is soaked.
      team: maple("Splash! You're on the team!"),
    },
  },
  // Misty's Bubble Bath (activities/bath/; canada-round-2.md in git history): she rubs a muddy spirit bear
  // clean, fluffs her up and paints her with berries, and Misty goes to the big game looking like that.
  bath: {
    // The film in (story/films/bath.ts): the rainforest river, giant cedars, soft rain.
    filmIn: {
      white: maple('In this rainforest lives a bear as white as snow.'),
      // A brown, mossy lump on the bank swings a paw at a jumping salmon: an enormous splash, no fish, and she slides
      // down the bank into the mud. Two eyes blink.
      miss: misty('Missed again!'),
      brown: maple("A white bear? You're all brown!"),
      mud: misty("It's only mud. Oh dear. I need a bath."),
      // Maple, to the camera.
      bathTime: maple('Bath time!'),
    },
    // The hello from a link or a replay (after the film in, the game starts at Sparkle's one instruction).
    story: [maple('Bath time!')],
    // Sparkle: one line as each tool arrives, and a hint when she's stuck for ~8 s.
    rub: onDevice('Rub the bear to make bubbles!', 'Click and wiggle on the bear to make bubbles!'),
    rubHint: onDevice('Rub the muddy spots!', 'Click and wiggle on the muddy spots!'),
    rain: onDevice('Now the rain! Rub the bubbles away.', 'Now the rain! Click and wiggle the bubbles away.'),
    // White shows through (once): Sparkle, then Misty. (Not the sticker's fact: the stamp screen says that one, and the
    // same line twice in a row sounded like a repeat.)
    spirit: 'Look! White fur under all that mud!',
    whiteAgain: misty("I'm white again!"),
    towel: onDevice('Now the towel! Rub her fluffy.', 'Now the towel! Click and wiggle her fluffy.'),
    // Rubbed into a giant puffball.
    cloud: misty("I'm a cloud!"),
    berries: onDevice('Berries! Rub on a color.', 'Berries! Click and wiggle on a color.'),
    // Her first go with each color.
    color: { pink: misty('Ooh, pink!'), blue: misty('Blue, like a blueberry!'), purple: misty('Purple! Fancy!') },
    // The still pool glows like a mirror.
    pool: onDevice('Tap the pool to show her!', 'Click the pool to show her!'),
    mirror: misty('Is that me? I look like a champion!'),
    // Maple holds up the white team sweater with the red maple leaf.
    sweater: onDevice('A team sweater! Tap it!', 'A team sweater! Click it!'),
    paw: misty('My paw! On a team sweater!'),
    // Silly: her nose, her tummy, suds on Maple, the soap batted over the cedars, the wet-dog shake, the back scratch.
    achoo: misty('Ah... choo!'),
    tickle: misty('Hee hee! That tickles!'),
    beard: maple('I have a beard!'),
    shot: maple('What a shot!'),
    brrr: maple('Brrr! You got me!'),
    scratch: misty('Ahh. Scratchy tree.'),
    // Pokes (Sparkle, the first time; Misty swings at the salmon and misses).
    salmon: 'Salmon jump up the river to go home.',
    miss: misty('Missed again!'),
    cedar: 'This cedar tree is taller than a house!',
    rainPoke: "Rain! It's a rainforest.",
    // Maple, cheering on the bank.
    cheer: [maple('Bravo!'), maple('Youpi!'), maple('Allez, allez!')],
    // The film out: Misty in the look she was given.
    filmOut: {
      stick: maple('Misty! Try this hockey stick!'),
      // One swing: a pinecone sails over the tallest cedar.
      shot: maple('The biggest slap shot in Canada!'),
      team: misty('I like this game. I will come!'),
    },
  },
  // The Team Cabin (activities/cabin/): the skate hut beside the canal, where she dresses the team. No stamp, no end.
  cabin: {
    first: onDevice('Dress the team! Drag something on.', 'Dress the team! Click something to put it on.'),
    // A hat a friend loves.
    love: {
      monty: monty('Mmm. Fancy.'),
      tuque: tuque('Ho ho! Two hats!'),
      roxy: roxy('Ooh, sneaky!'),
      misty: misty('So soft.'),
      ollie: ollie('Wheee!'),
      maple: maple('Magnifique!'),
    },
    // Gus pokes his head in at the window: he can have a hat too.
    gus: gus('Honk! ...I look good.'),
    // The mirror takes a team photo.
    photo: maple('Team photo! Say maple syrup!'),
  },
  // The finale (activities/party/): the big game on the frozen canal, between story.gameIn and story.gameWin.
  party: {
    // Sparkle, as each round starts (the first goal, the geese in the way, the last goal).
    rink: onDevice("Flick the puck into the geese's net!", "Drag the puck fast into the geese's net!"),
    rinkHint: onDevice('Swipe from the puck to the net!', 'Drag from the puck to the net!'),
    geese: 'The geese are in the way! Bounce it off the snow!',
    last: 'One more goal to win!',
    // The goose in goal saves one of her shots.
    saved: ['The goose saved it! Again!', 'So close! Try again!'],
    goal: [maple('Goal!'), maple('Beauty, eh!'), maple('Youpi, a goal!')],
    // She steals the puck off a goose herself (once).
    steal: maple('Got it!'),
    // Each friend's big moment, the first time it happens: Roxy steals it off a goose and passes, a goose's shot
    // boings off Tuque's tummy, another bonks off Monty's antlers, Ollie spins on her back to a loose puck.
    roxy: roxy('Mine! I mean, yours!'),
    tuque: tuque('Boing! Not past my tummy!'),
    monty: monty('Bonk. Not today, geese.'),
    ollie: ollie('Wheee! I got it!'),
    // The last goal: the geese make a wall, Misty's slap shot knocks it flat, the net is open.
    wall: gus('Honk! The goose wall!'),
    misty: misty('Watch my big slap shot!'),
    open: 'The net is open! Shoot!',
    // A goose goal (at most two, never two in a row): short and funny, then the puck is hers again.
    against: [monty('Oops. It went under me.'), gus('Honk! A goose goal!')],
    win: maple("We won! We're the champions!"),
    // Pokes on the canal.
    poke: {
      maple: maple('Pass me the puck!'),
      monty: monty('Hello. I am the goalie.'),
      roxy: roxy('My kits are cheering!'),
      tuque: tuque('Brr! I love hockey!'),
      ollie: ollie('Wheee! Look, I spin!'),
      misty: misty('After the game, supper?'),
      lulu: lulu('I sing for every goal!'),
      gus: gus("Honk! You can't catch me!"),
    },
    stand: maple('Mmm, a BeaverTail! Sweet, like my tail!'),
    parliament: "That's Parliament, in Ottawa, Canada's capital!",
    canal: 'In winter, this canal freezes into a giant skating rink!',
  },
  // Maple's hello, anywhere she meets her.
  bonjour: maple('Bonjour!'),
}
`;export{e as default};
//# chunkId=522cd777-4c3f-5bd6-8a80-8c0e5be1ff51