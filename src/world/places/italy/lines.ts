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

  stickers: {
    pizzeria: 'Brown bear sticker! Bears live in the mountains of Italy!',
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
  },
  passport: 'This is Italy! Tap a picture to learn more.',
}
