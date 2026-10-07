// Every phrase that can be spoken in Italy. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Plain strings are Sparkle, the guide: she gives the instructions. Friends say their own story and reaction lines in
// their own voices (see cast.json). Italian words are written the real way (the voices speak with an Italian accent),
// and a WordCard shows the word and what it means (see WordCard.tsx).
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const lupa = as('lupa')
const bruno = as('bruno')
const bufala = as('bufala')
const gino = as('gino')
const cesare = as('cesare')
const queen = as('queen')
const raffaele = as('raffaele')
const spina = as('spina')
const COUNT = ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!', 'Eight!']

export const L = {
  name: 'Italy',
  trophyWin: `${NAME}, you did it! You won the Italy Explorer trophy!`,
  trophyRoom: `${NAME}, Italy Explorer! From Italy.`,
  intro: [lupa(`Ciao, ${NAME}! I'm Lupa!`), lupa('Help me get ready to sing at the opera?')],
  hubFirst: 'Tap the glowing pizza!',
  hubNext: `Where should we go next, ${NAME}?`,
  soon: 'This spot opens soon!',
  boot: 'Italy is shaped like a boot! Kick!',
  bandSoon: 'Lupa\'s opera night is coming soon!',
  bandNeed: 'Help friends to fill up Lupa\'s band!',
  tickle: {
    lupa: [lupa('Awooo!'), lupa('Hee hee! Ciao!'), lupa('I love to sing!')],
    bruno: [bruno('Ho ho ho!'), bruno('Pizza time!'), bruno('That tickles!')],
    bufala: [bufala('Hello, dear!')],
    gino: [gino('Coo coo! Ciao!')],
    cesare: [cesare('I am the emperor.')],
    spina: [spina('Hee hee! Prickly!'), spina('Ciao ciao!'), spina('Olives! Yum!')],
    queen: [queen('What a lovely kitchen!')],
    raffaele: [raffaele('For the Queen!')],
  },

  pizza: {
    // Arrival in Naples.
    arrive: [lupa('Welcome to Naples! Pizza was born here!'), lupa('Zio Bruno needs a helper chef!')],
    hello: bruno(`Benvenuta, Chef ${NAME}!`),
    storyIntro: bruno('Let me tell you the story of the most famous pizza!'),

    // Service 1: the storybook, 1889.
    story1: 'Long ago, a queen named Margherita came to Naples.',
    story2: raffaele('For the Queen, I will make a special pizza!'),
    queenHello: queen('Hello! I would love a pizza, please.'),
    toss: 'Flick the dough up to spin it!',
    tossMore: 'Again! Flick it up!',
    tossed: bruno('Bellissimo! A big round pizza!'),
    tossedOld: raffaele('Bellissimo! A big round pizza!'),
    sauce: 'Swirl the ladle to spread the sauce!',
    sauced: bruno('Perfetto! Red tomato sauce!'),
    saucedOld: raffaele('Perfetto! Red tomato sauce!'),
    tomatoFact: 'Tomatoes love the hot, sunny weather in Italy!',
    cheese3: 'Put three pieces of white mozzarella on the pizza!',
    basil3: 'Now three green basil leaves!',
    flagColors: raffaele('Red, white and green, like the flag of Italy!'),
    oven: 'Slide the pizza into the oven!',
    ovenFact: 'This oven is super hot! Pizza bakes in ninety seconds!',
    turn: 'Tap the pizza to turn it!',
    turnMore: 'Turn it again!',
    takeOut: 'It is golden! Pull the pizza out!',
    serve: 'Tap the pizza to give it to the Queen!',
    queenYum: queen('Buonissima! Red, white and green!'),
    named: bruno('So we call it pizza Margherita!'),

    // Service 2: the lunch rush.
    rush: bruno('Mamma mia! Customers!'),
    bufalaHello: bufala('Fresh mozzarella, from my family\'s milk!'),
    bufalaFact: 'Mozzarella is made from milk. Some comes from buffalo!',
    bufalaOrder: bufala('Five olives on mine, please!'),
    start: 'Tap the order to start!',
    cheeseRain: bruno('Mozzarella!'),
    olives5: 'Put five olives on the pizza!',
    count: COUNT,
    tooMany: 'Oops, too many! Drag one off the pizza.',
    orderDone: 'That\'s the order!',
    cutHalf: 'Cut it in half! Drag across the pizza.',
    halves: 'Two halves!',
    cutAgain: 'Drag all the way across the pizza!',
    bufalaCut: bufala('One half for me, one for my baby!'),
    serveIt: 'Tap the pizza to serve it!',
    bufalaYum: bufala('Buonissima! Grazie!'),
    ginoHello: gino('Ciao! Half mushrooms, half olives, please!'),
    quickHands: bruno('I made this one for you. Watch!'),
    halfMush: 'Mushrooms go on this half!',
    halfOlive: 'Olives go on that half!',
    halfBoth: 'Put mushrooms on one half and olives on the other!',
    cutQuarter: 'Cut it into four slices! Two cuts!',
    otherWay: 'Now cut the other way!',
    quarters: 'Four slices!',
    ginoCut: gino('Four slices, for me and my friends!'),
    ginoYum: gino('Delizioso! Grazie mille!'),
    prego: 'When someone says grazie, you say prego!',

    // Service 3: her own pizza.
    own: bruno(`Now make a pizza just for YOU, Chef ${NAME}!`),
    pickSauce: 'Red sauce or pink sauce?',
    redSauce: 'Red tomato sauce!',
    pinkSauce: 'Pink beet sauce! Yum!',
    decorate: 'Put on anything you like!',
    cesareSneak: cesare('Mmm... mozzarella...'),
    cesareTap: 'Uh oh! Tap the sneaky cat!',
    cesareSorry: cesare('Oh. Sorry. Here you go.'),
    doneButton: 'Tap the check when you like it!',
    cutOwn: 'Cut it any way you like!',
    lupaYum: lupa(`Buonissima, ${NAME}!`),

    // Toppings say their names when she picks them up.
    toppings: {
      mozzarella: 'Mozzarella!',
      basil: 'Basil!',
      olive: 'Olive!',
      mushroom: 'Mushroom!',
      pepper: 'Peperoni! In Italy, that means peppers!',
      tomato: 'Tomato!',
    },

    serviceDone: `Great job, Chef ${NAME}!`,
    // Payoff.
    clap: bruno('Everybody loves your pizza!'),
    spin: bruno('Now watch me spin!'),
    hat: bruno(`Grazie, Chef ${NAME}! A chef hat for you!`),
    mandolin: bruno('And my mandolin, for Lupa\'s band!'),
    band: lupa('Yay! Our first friend for the band!'),
  },

  // 🫒 The Olive Grove (activities/olives). Every spoken line of the activity goes in here.
  olives: {
    arrive: [spina(`Ciao, ${NAME}! The olives are ready!`), spina('Help me pick them for olive oil!')],

    // Comb the branches.
    comb: 'Drag the rake along the glowing branch!',
    combNext: 'Now comb this branch!',
    combLast: 'One more branch!',
    combHint: 'Slide the rake all the way to the end!',
    bonk: spina('Eek! They stuck on my quills!'),
    bonkAgain: spina('Oops! Again!'),
    tapSpina: 'Tap Spina to shake them off!',
    shook: spina('Hee hee! Into the basket!'),
    branchDone: ['Olives in the net!', `Great combing, ${NAME}!`, 'The net is full!'],
    sun: 'Olive trees love hot, dry summers!',
    toBasket: spina('Into the basket! Grazie!'),

    // Green to black.
    ripenIntro: 'This olive is green. Tap the sun!',
    purple: 'Purple! Tap the sun again!',
    black: 'Black! Now it is ripe!',
    sortIntro: 'Green, then purple, then black!',
    hintGreen: 'Green goes in the one sun bowl!',
    hintPurple: 'Purple goes in the two sun bowl!',
    hintBlack: 'Black goes in the three sun bowl!',
    sortDone: `Green, purple, black! Well done, ${NAME}!`,
    tryOne: spina('Mmm! Let me try one!'),
    bitter: spina('Bleh! Bitter!'),
    bitterWhy: ['Fresh olives are too bitter!', 'They have to soak first.'],

    // The olive mill.
    mill: spina('Welcome to the frantoio, the olive mill!'),
    millDrop: 'Drop ten olives in the big funnel!',
    millHint: 'Drop an olive in the funnel!',
    count: ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!', 'Eight!', 'Nine!', 'Ten!'],
    lots: 'It takes lots of olives to make oil!',
    roll: 'Here comes the big stone wheel!',
    squish: spina('Squish, squish, squish!'),
    oil: 'Look! Golden olive oil!',

    // Pour to the line.
    pourFull: 'Hold the jug to pour! Fill it all the way!',
    full: 'Full! All the way to the top!',
    pourHalf: 'Now fill it halfway!',
    more: 'A little more, to the line!',
    tooMuch: spina('Hee hee! Just a taste!'),
    half: 'Halfway full!',
    everything: 'Olive oil goes on almost everything in Italy!',

    // Payoff.
    bruschetta: spina('Bruschetta for everyone!'),
    yum: spina('Crunch! Buonissima!'),
    tambourine: spina("And my tambourine, for Lupa's band!"),
    tapTambourine: 'Tap the tambourine!',
    pizzica: spina("Let's dance the pizzica!"),
    band: lupa('Yay! A tambourine for the band!'),
  },

  // ⛲ The Trevi Fountain (activities/trevi). Every spoken line of the activity goes in here.
  trevi: {
    // Story: the fountain has no water.
    dry: lupa('Oh no! It\'s dry!'),
    where: lupa('Where did the water go?'),
    // 1. Find the spring on the hill.
    listen: 'Tap the hill and listen!',
    hear: lupa('Shh! I hear water!'),
    louder: lupa('It\'s getting louder!'),
    tapRocks: 'Tap the rocks!',
    found: lupa('Acqua! You found water!'),
    girl1: 'Long ago, a girl helped the Romans find water.',
    girl2: `Today, that girl is YOU, ${NAME}!`,
    // 2. Build the aqueduct (a water bridge) over the valley.
    bridge: 'Build a water bridge to Rome!',
    drag: 'Drag the arch that fits each gap!',
    fits: [lupa('It fits!'), lupa('Perfetto!'), lupa(`Brava, ${NAME}!`)],
    downhill: 'Water only flows downhill!',
    glowing: 'Try the glowing arch!',
    pickArch: 'Now tap an arch!',
    round2: 'Now all the way to Rome! Look closely!',
    aqueduct: 'The Romans called a water bridge an aqueduct!',
    // 3. Water on!
    waterOn: 'Tap the spring to turn on the water!',
    follow: 'Follow the water with your finger!',
    toRome: lupa('The water is going to Rome!'),
    // 4. The fountain fills up.
    full: lupa('Bellissima! The fountain is full!'),
    romans: 'The Romans built this water bridge!',
    longAgo: 'That was 2,000 years ago!',
    still: 'And it still fills the fountain today!',
    // 5. Toss a coin.
    flick: 'Flick the coin up into the fountain!',
    flickHint: 'Swipe up on the coin!',
    one: 'One!',
    oneMore: 'One more coin!',
    two: 'Two!',
    comeBack: `Now you will come back to Rome one day, ${NAME}!`,
    lupaTurn: lupa('My turn!'),
    wish: lupa('I wish I could sing!'),
    star: 'A wishing star!',
    starWaits: 'It waits for Lupa\'s big night.',
    help: 'Coins from the fountain help people who need it.',
  },

  stickers: {
    pizzeria: 'Brown bear sticker! Bears live in the mountains of Italy!',
    olives: 'Porcupine sticker! Crested porcupines live in Italy!',
    trevi: 'Wolf sticker! The story says a kind mama wolf took care of the twins who built Rome!',
  },
  videos: {
    olives: "Let's see how olive oil is made!",
    trevi: "Let's toss a coin in the real Trevi Fountain!",
    aqueduct: 'Look! A real Roman water bridge!',
  },
  facts: {
    hello: 'In Italy, people say ciao! It means hello and goodbye!',
    thanks: 'Grazie means thank you!',
    count: 'One, two, three in Italian: uno, due, tre!',
    boot: 'Italy is shaped like a boot, kicking a ball!',
    weather: 'Italy has hot, sunny summers, and snowy mountains up north!',
    pizza: 'Pizza comes from Naples, in Italy!',
    margherita: 'Pizza Margherita is red, white and green, like Italy\'s flag!',
    romans: 'Long ago, the Romans built roads, arenas and water bridges!',
    volcano: 'Italy has volcanoes! One is right next to Naples!',
    flag: 'Italy\'s flag has three stripes: green, white and red!',
    olives: 'Some olive trees in Italy are more than a thousand years old!',
    wolf: 'The story says a kind mama wolf took care of the twins who built Rome!',
  },
  passport: 'This is Italy! Tap a picture to learn more.',
}
