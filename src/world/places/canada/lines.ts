// Every phrase that can be spoken in Canada. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.) Plain strings are Sparkle, the guide;
// the friends (Maple the beaver, the moose, the raccoon...) talk in their own voices from cast.json. Each activity has
// its own block below (one per folder in activities/), so activities can be worked on side by side.
// Straight apostrophes only: curly ones failed the transcription check in PR #63.
const NAME = 'Kaylee'

type Line = string | { text: string; voice: string }
const by = (voice: string) => (text: string): Line => ({ text, voice })
const maple = by('maple')

export const L = {
  // The shell's trophy ceremony and the trophy room speak these.
  trophyWin: `${NAME}, you did it! You won the Canada Champion trophy!`,
  trophyRoom: `${NAME}, Canada Champion! From Canada.`,
  passport: 'This is Canada! It goes all the way from one ocean to the other.',
  // The passport's tap-to-hear facts (planning/around-the-world/canada.html, "Passport facts").
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
  // One sticker per stamp (the plan's sticker table).
  stickers: {
    squirrel: 'Squirrels lick maple sap from the trees too!',
    owl: "The snowy owl is Quebec's bird.",
    moose: 'Moose are the biggest deer in the world.',
    raccoon: 'Raccoons wash their food with their little hands.',
    loon: "The loon's call sounds like laughing.",
    grizzly: 'Grizzly bears sleep all winter in a den.',
    otter: "Sea otters hold hands so they don't float away.",
    spirit: 'The spirit bear is a black bear with white fur.',
  },
  // The Theater's real videos (meta.videos), offered after each activity.
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
  // Maple's animal book (book/animals.ts): Sparkle names each animal the first time Kaylee pokes it, with one short fact.
  // The same line plays again when she taps it in the book.
  book: {
    open: 'Maple\'s animal book! Tap an animal to hear about it.',
    // Quebec City
    'snowy-owl': "A snowy owl! It's Quebec's bird.",
    'red-squirrel': 'A red squirrel! It loves maple sap.',
    chickadee: 'A chickadee! It sings its own name: chick-a-dee-dee-dee!',
    'canada-goose': 'Canada geese! They fly in a big V.',
    beluga: 'A beluga whale! It is white, and it sings.',
    'red-fox': 'A red fox! It hops into the snow to catch mice.',
    // Mont-Sainte-Anne
    moose: 'A moose! The biggest deer in the world.',
    beaver: 'A beaver! It builds its house with sticks.',
    'black-bear': 'A black bear! It loves berries.',
    chipmunk: 'A chipmunk! It stuffs its cheeks with seeds.',
    porcupine: 'A porcupine! It has prickly quills.',
    raccoon: 'A raccoon! It washes its food with its hands.',
    deer: 'A deer! It lifts its white tail to say: run!',
    'barred-owl': 'A barred owl! It hoots: who cooks for you?',
    woodpecker: 'A woodpecker! It drums on trees. Tap tap tap!',
    bat: 'A bat! It flies at night and eats bugs.',
    firefly: 'A firefly! Its tail lights up.',
    peeper: 'A spring peeper! A tiny frog with a big peep.',
    hare: 'A snowshoe hare! Its fur turns white in winter.',
    // Banff and the Rockies
    elk: 'An elk! Its call sounds like a squeaky whistle.',
    grizzly: 'A grizzly bear! It sleeps all winter.',
    bighorn: 'A bighorn sheep! Its horns curl round and round.',
    'mountain-goat': 'A mountain goat! It climbs the steepest rocks.',
    wolf: 'A wolf! Wolves live in a family called a pack.',
    pika: 'A pika! A tiny rock rabbit that says eep!',
    marmot: 'A marmot! It whistles from the rocks.',
    'ground-squirrel': 'A ground squirrel! It stands up to look around.',
    loon: 'A loon! It dives deep, and its call sounds like laughing.',
    'bald-eagle': 'A bald eagle! Its head is white, not bald.',
    trout: 'A trout! It lives in cold mountain water.',
    // British Columbia
    orca: 'An orca! Orcas swim together in families.',
    humpback: 'A humpback whale! It jumps right out of the water.',
    'grey-whale': 'A grey whale! It swims all the way from Mexico.',
    'sea-otter': "A sea otter! Otters hold hands so they don't float away.",
    'sea-lion': 'A sea lion! It barks, arf arf!',
    'harbour-seal': 'A harbour seal! It naps on the rocks.',
    puffin: 'A puffin! It has a bright orange beak.',
    'sea-star': 'A sea star! It has five arms.',
    salmon: 'A salmon! It swims up the river to lay its eggs.',
    'spirit-bear': 'A spirit bear! A black bear with white fur.',
    'banana-slug': 'A banana slug! Slimy, yellow, and slow.',
    raven: 'A raven! A very clever bird.',
    // Along the train
    bison: 'A bison! It rolls in the dust to stay clean.',
    'mountie-horse': 'A Mountie horse! Mounties are Canada\'s police on horses.',
    'polar-bear': 'A polar bear! It lives far up north, by the ice.',
  },
  // ---- One block per activity (activities/<id>/). Story lines, Sparkle's instructions and hints, the friends'
  // reactions. Keep each line under ~3 seconds; say Kaylee's name only at the big moments. ----
  hub: {
    // The first visit: Maple on Quebec City's platform tells the story, then Sparkle says what to do.
    story: [maple("Bonjour! Let's ride all across Canada!"), maple("And find a hockey team!")],
    push: 'Push the train with your finger!',
    bubbles: 'Tap a bubble to play!',
    soon: 'That one is coming soon!',
    // Maple, when the train pulls in.
    arrive: {
      msa: maple('Bonjour, Mont-Sainte-Anne!'),
      quebec: maple('Bonjour, Quebec!'),
      ottawa: maple('Hello, Ottawa! Our hockey rink!'),
      banff: maple('Hello, Banff! Look at the mountains!'),
      bc: maple('Hello, Vancouver! The Pacific Ocean!'),
    },
    teamHere: maple('Look! Our hockey team!'),
    teamAll: maple("Our whole team is here! Let's play!"),
    locked: maple('We need our whole team first!'),
    newFriend: maple('A new friend for our team!'),
    // Maple, riding through (once each).
    ride: {
      forest: maple('So many trees and lakes!'),
      prairies: maple('The prairies! So flat!'),
      rockies: maple('The Rocky Mountains!'),
      tunnel: maple('Round and round, inside the mountain!'),
    },
    // Somebody on the track.
    blocked: {
      moose: maple('Oh! A moose on the track!'),
      bison: maple('Oh! A bison on the track!'),
      geese: maple('Oh! Geese on the track!'),
    },
    tapIt: 'Tap it, so it can move!',
    sorry: by('moose')('Oops! Sorry!'),
    // Tap Maple.
    maple: [maple('Choo choo!'), maple("Let's go!"), maple('Bonjour!')],
    // Sparkle, the first time she pokes a landmark.
    pokes: {
      cn: 'The CN Tower, in Toronto. It is very tall!',
      niagara: 'Niagara Falls! Look, a rainbow!',
      montmorency: 'Montmorency Falls. Even taller than Niagara Falls!',
      ferry: 'A ferry. It takes people across the river.',
    },
    // Her hockey team, when she taps them (the loon just calls).
    team: {
      taffy: by('chipmunk')('Go, team, go!'),
      snowman: by('owl')('Hoo! Go team!'),
      bike: by('moose')("I'm the goalie!"),
      campfire: by('raccoon')("I'll get the puck!"),
      bridge: by('bear')('Go team!'),
      whales: by('otter')('Hockey! Yay!'),
      salmon: by('bear')('I love to skate!'),
    },
  },
  taffy: {
    // The story beat (Maple, then her little cousin).
    story: [maple('Bonjour! My cousins want maple taffy!')],
    // Sparkle: one line when something new starts, and the hints when she's stuck (~8 s).
    pour: 'Tip the pot and pour syrup on the snow!',
    set: "It's set! Roll it up on a stick.",
    hot: 'Still hot! Let it set.',
    rest: 'Roll up the rest!',
    empty: 'The pot is empty! Tap the maple tree.',
    tree: 'Sap from the maple tree makes the syrup!',
    shapes: "Pour the shape on Maple's card!",
    orders: 'Make each friend the size they want!',
    give: 'Who gets this one?',
    // Maple's cards (shapes), and her crunches.
    card: {
      heart: maple('A heart, please!'),
      leaf: maple('A maple leaf!'),
      loop: maple('A big loop!'),
      k: maple('The letter K!'),
    },
    pretty: maple('Ooh, so pretty!'),
    crunch: [maple('Mmm, crunchy!'), maple('Miam miam!'), maple('So sweet!')],
    tooBig: maple('Too big for me!'),
    mapleHi: maple('Hee hee! That tickles!'),
    // The friends at the table (orders), in their own voices.
    cousinYum: by('cousin')('Yummy yummy!'),
    cousinFull: by('cousin')('Merci! My tummy is full!'),
    cousinHi: by('cousin')('Hi hi!'),
    chipYum: by('chipmunk')('Ooh! More, please!'),
    chipFull: by('chipmunk')('Tiny and perfect!'),
    chipBig: by('chipmunk')('Whoa! Too big!'),
    chipHi: by('chipmunk')('Hello hello!'),
    owlYum: by('owl')('Hoo! I like swirls.'),
    owlFull: by('owl')('Hoo hoo! A swirl!'),
    owlHi: by('owl')('Whooo is that?'),
    mooseYum: by('moose')('Mmm. Bigger, please.'),
    mooseFull: by('moose')('Mmm. Giant. Thank you.'),
    mooseGulp: by('moose')('Gulp! Yum.'),
    mooseHi: by('moose')('Hello, little one.'),
    // Everyone crunches (the stamp moment: her name once).
    share: maple('Everybody, crunch!'),
    thanks: maple(`Merci, ${NAME}! Best taffy ever!`),
  },
  snowman: {
    // The story (Maple, in the park below the castle), then Sparkle's one instruction per part.
    story: [maple("Bonjour! It's the Winter Carnival!"), maple("Let's roll snowmen!")],
    roll: 'Push the snowball! Watch it grow!',
    stack: 'Now roll the little ball into the big one!',
    dress: 'Roll a snowball into a box!',
    ready: 'Tap the drum for the parade, or make more snowmen!',
    // Stuck for a while: Sparkle helps (the hand shows it too).
    hint: {
      roll: 'Put your finger on the snowball and push!',
      stack: 'Push the little ball into the big one!',
      hat: 'Roll a snowball into the hat box!',
      sash: 'Roll a snowball into the sash box!',
      drum: 'Tap the big drum!',
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
    done: maple(`${NAME}, you made a whole parade!`),
  },
  bike: {
    // The story, in the gondola at the bottom (Maple, then up they go).
    story: [maple('Bonjour! I want to ride all the way down to the waterfall!'), maple('Up we go!')],
    // Sparkle: the one instruction when the bike rolls out of the station, what's new on the way, the stuck hint.
    steer: 'Hold your finger down and steer the bike!',
    split: 'Two trails! Green or blue?',
    creek: 'The bridge, or splash through the creek?',
    hint: 'Push your finger left or right!',
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
    thanks: maple('Thank you, Kaylee! What a ride!'),
    // The animals, in their own voices.
    moose: [by('moose')('Mmm. Bonjour.'), by('moose')('Munch, munch.')],
    chipmunk: by('chipmunk')('Seeds! Seeds!'),
    bear: by('bear')('Mmm, berries!'),
  },
  campfire: {
    // The story (before the first touch): Maple, then Sparkle's one instruction.
    story: [maple("Shh! Who's out there?"), 'Move your finger to shine the light!'],
    // Sparkle: each part's instruction (the prompt bubble plays it again), and her hints when Kaylee is stuck.
    eyes: 'Move your finger to shine the light!',
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
    marshmallow: 'Hold the marshmallow near the fire.',
    marshmallowHint: 'Give it to Maple or the raccoons.',
    onFire: "It's on fire! Tap it to blow it out!",
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
  },
  canoe: {
    // The story: Maple at the dock, in the red canoe.
    story: maple('Why is my lake so blue?'),
    // Sparkle: how to paddle (one way or the other), and the hint when she hasn't paddled for a while.
    go: { stroke: 'Pull the paddle back through the water!', pull: 'Hold the water where the canoe should go!' },
    hint: { stroke: 'Drag your finger back, beside the canoe.', pull: 'Press the water in front of the canoe.' },
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
  },
  bridge: {
    // The story (Maple, then Sparkle's one instruction).
    story: [maple('The animals need to cross!'), 'Lead them over the animal bridge!'],
    // Sparkle: whose turn it is (a link that starts there, the next family, and the hint when she's stuck).
    lead: {
      elk: 'Drag mama elk over the bridge.',
      sheep: 'The sheep love the rocky way!',
      bears: 'Lead the grizzlies over the bridge.',
    },
    fence: 'Not on the road! Over the bridge.',
    fenceTap: 'The fence keeps the animals off the road.',
    camera: 'Click! The camera takes a photo of every animal.',
    bonk: 'Bonk! The rams bump heads.',
    lost: 'Oh! A baby stopped to smell a flower.',
    fetch: 'Go get the little one!',
    seeds: 'Walk the others over. They carry seeds!',
    // Mama elk.
    elkGo: by('elk')('Come along, babies!'),
    elkHome: by('elk')('Mmm, yummy meadow!'),
    elkFound: by('elk')('There you are, little one!'),
    // Mama grizzly.
    bareNo: by('bear')('Hmm. Too bare for me.'),
    bearYes: by('bear')('Ooh! It looks like the forest!'),
    bearHome: by('bear')('Thank you! Berries!'),
    // Maple, watching from the meadow.
    cheer: {
      elk: maple('Bravo! The elk made it!'),
      sheep: maple('Yay, the bighorn sheep!'),
      bears: maple('The bears too! Bravo!'),
    },
    giggle: maple('Hee hee! That tickles!'),
    album: maple('Look! Photos of everyone!'),
    done: 'You helped them all cross, Kaylee!',
  },
  whales: {
    // The story, at the dock (Maple at the wheel of the little boat).
    story: [maple("I've never seen a whale!"), maple("Let's find them!")],
    // Sparkle: how to steer (one line before her hands are busy), then only when something new appears.
    steer: { finger: 'Hold the water where the boat should go!', wheel: 'Hold and push to steer the boat!' },
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
      mic: 'Tap the yellow microphone to listen!',
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
    finale: maple(`They all jumped together! Merci, ${NAME}!`),
    toot: maple('Toot toot!'),
    song: maple('The humpback is singing!'),
  },
  salmon: {
    // The story (Maple, at the river).
    story: [maple('Help the salmon jump home!')],
    // Sparkle: once when each stretch of the river begins, and again when she's stuck.
    steps: 'Grab a salmon, and flick it up!',
    falls: 'The big falls! Try the rock, or the log.',
    bears: 'The bears are fishing! Flick the salmon past them.',
    eggs: 'Home! Tap each salmon to lay its eggs.',
    hatch: 'Spring! Tap the eggs.',
    bonk: 'Bonk! Try a bigger flick.',
    rain: "Rain! It's a rainforest.",
    cedar: 'This cedar tree is taller than a house!',
    seasons: 'Fall... winter... and spring!',
    // Maple, cheering on the bank (and catching the ones flicked too hard).
    home: [maple('Bravo!'), maple('Home!'), maple('Youpi!'), maple('Allez, allez!')],
    lap: [maple('Ooh! A salmon in my lap!'), maple('Hee hee! Too high!')],
    poke: [maple('Allez, salmon!'), maple('Jump, jump!')],
    berries: maple('The bears went to eat berries!'),
    sea: maple('Bye, little salmon! Swim to the sea!'),
    win: maple('Kaylee, you brought the salmon home!'),
    // The bears (the same gentle bear voice for both).
    achoo: by('bear')('Ah... choo!'),
    spirit: by('bear')("I'm a spirit bear!"),
    black: by('bear')("Shh, I'm fishing."),
    giveUp: [by('bear')('Okay, berries instead!'), by('bear')('Berries are easier!')],
    yum: by('bear')('Mmm, berries!'),
  },
  party: {
    // The story, on the toy map in Ottawa.
    story: maple("Bonjour, Ottawa! First, let's help the animals get home!"),
    // Animal Homes: Sparkle asks, one animal at a time (each answer is a drag onto the map).
    ask: {
      'polar-bear': 'Where does the polar bear live? Way up north, on the ice!',
      orca: 'Where does the orca live? In the Pacific Ocean!',
      bison: 'Where does the bison live? On the yellow prairies!',
      moose: 'Where does the moose live? In the big green forest!',
      beaver: 'Where does the beaver live? By the river!',
      loon: 'Where does the loon live? On a forest lake!',
      grizzly: 'Where does the grizzly bear live? In the Rocky Mountains!',
      'spirit-bear': 'Where does the spirit bear live? In the rainforest by the sea!',
      puffin: 'Where does the puffin live? By the Atlantic Ocean!',
    },
    // She got it: one fact about its home.
    home: {
      'polar-bear': 'Yes! Polar bears hunt on the sea ice.',
      orca: 'Yes! Orcas swim in big families.',
      bison: 'Yes! Bison munch the prairie grass.',
      moose: 'Yes! Moose love forest ponds.',
      beaver: 'Yes! Beavers build their lodge in the river.',
      loon: 'Yes! Loons dive deep in the lake.',
      grizzly: 'Yes! Grizzlies dig for roots in the mountains.',
      'spirit-bear': 'Yes! Spirit bears catch salmon in the rainforest.',
      puffin: 'Yes! Puffins dive for fish in the Atlantic.',
    },
    cheer: [maple('Oui! Home sweet home!'), maple('Bravo!'), maple('Youpi!')],
    // A wrong home: a silly reaction, then the right home glows.
    oops: {
      flop: 'Flop, flop! It needs the water!',
      splash: 'Splash! It lives on land!',
      hot: 'Phew! Too hot for a polar bear!',
      cold: 'Brrr! Too cold up there!',
      nope: 'Hmm, not there! Look for the glow.',
    },
    glow: 'Look for the glow!',
    ottawa: "Ottawa is Canada's capital city!",
    allHome: maple("Everybody's home! Now, hockey!"),
    // Pond Hockey on the frozen Rideau Canal.
    rink: "Flick the puck into the geese's net!",
    rinkHint: 'Swipe from the puck to the net!',
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
  // Maple's hello, anywhere she meets Kaylee.
  bonjour: maple('Bonjour!'),
}
