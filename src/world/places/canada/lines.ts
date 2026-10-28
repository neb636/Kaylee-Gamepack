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
  },
  snowman: {
  },
  bike: {
  },
  campfire: {
  },
  canoe: {
  },
  bridge: {
  },
  whales: {
  },
  salmon: {
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
