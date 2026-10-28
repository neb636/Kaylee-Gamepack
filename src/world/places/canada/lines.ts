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
  },
  taffy: {
    // The story beat (Maple, then her little cousin).
    story: [maple('Bonjour! My cousins are coming for a treat!'), by('cousin')('Maple taffy, please!')],
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
  },
  bike: {
  },
  campfire: {
    // The story (before the first touch): Maple, then Sparkle's one instruction.
    story: [maple('Shh! Something is out there in the dark.'), 'Move your finger to shine the light!'],
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
    story: maple('Bonjour! Why is my lake so blue?'),
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
  },
  party: {
  },
  // Maple's hello, anywhere she meets Kaylee.
  bonjour: maple('Bonjour!'),
}
