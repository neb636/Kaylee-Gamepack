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
const civetta = as('civetta')
const tortoise = as('tortoise')
const nino = as('nino')
const mona = as('mona')
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
  bandLocked: 'Help every friend first, then the opera can start!',
  bandNeed: 'Help friends to fill up Lupa\'s band!',
  tickle: {
    lupa: [lupa('Awooo!'), lupa('Hee hee! Ciao!'), lupa('I love to sing!')],
    bruno: [bruno('Ho ho ho!'), bruno('Pizza time!'), bruno('That tickles!')],
    bufala: [bufala('Hello, dear!')],
    gino: [gino('Coo coo! Ciao!'), gino('Row, row, row!'), gino('I love my gondola!')],
    cesare: [cesare('I am the emperor.'), cesare('Purrr... hello.'), cesare('Ahem. Bow, please.')],
    civetta: [civetta('Hoo hoo!'), civetta('Let\'s find out!'), civetta('I love science!')],
    tortoise: [tortoise('Hellooo...')],
    nino: [nino('Hee-haw!'), nino('Lemons? Yum!'), nino('Hee hee, that tickles!')],
    mona: [mona('Arf arf! Ciao!')],
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

  // 🏛️ The Colosseum (activities/colosseum). Every spoken line of the activity goes in here.
  colosseum: {
    arrive: [cesare('I am Cesare, Emperor of the Colosseum!'), cesare('Tonight: a surprise show!')],
    // 1. The sun-shade.
    hot: cesare('But it is so hot!'),
    hotFact: 'Rome is hot and sunny in summer!',
    pull: 'Pull the rope down to make shade!',
    pullNext: 'Pull the next rope!',
    pullLast: 'One more rope!',
    pullHint: 'Drag the rope handle all the way down!',
    shade: [cesare('Ahh, shade!'), cesare('Ahh, much better!'), cesare('Ahh! Grazie!')],
    sailors: 'Long ago, sailors pulled the shade ropes!',
    // 2. Roman numeral trapdoors.
    under: 'Under the floor are secret tunnels and elevators!',
    lines: 'Romans wrote numbers with lines!',
    call: [cesare('Door one!'), cesare('Door two!'), cesare('Door three!'), cesare('Door four!'), cesare('Door five!')],
    tapDoor: 'Tap the door with the right number!',
    countLines: ['One line. One!', 'One, two lines. Two!', 'One, two, three lines. Three!'],
    four: 'Four is one line, then a V!',
    five: 'Five looks like a V!',
    lever: 'Pull the lever down!',
    leverHint: 'Drag the lever all the way down!',
    up: 'Up goes the elevator!',
    pop: {
      spina: spina('Ta-da! Olive juggling!'),
      gino: gino('Ta-da! The spinning pigeon!'),
      tortoise: tortoise('Ta... daaa...'),
      bruno: bruno('Ta-da! Pizza spin!'),
      lupa: lupa('Ta-da! Awoooo!'),
    },
    slowBow: 'A very, very slow bow!',
    round2: cesare('Now the big doors: four and five!'),
    youAreFive: `V is five! Just like you, ${NAME}!`,
    // 3. Grand finale: every door opens, the crowd does a wave.
    allDoors: cesare('Everybody, up!'),
    wave: 'Swipe across the crowd to make a wave!',
    waveAgain: 'Again! Make a wave!',
    bravo: cesare('Bravissimi! What a show!'),
    old: 'The Colosseum is almost 2,000 years old!',
    // Payoff.
    bow: cesare(`Grazie, ${NAME}. I bow to you.`),
    horn: cesare("My Roman horn, for Lupa's band!"),
    tapHorn: 'Tap the horn!',
    band: lupa('Yay! A horn for the band!'),
  },

  // 🗼 The Leaning Tower of Pisa (activities/pisa). Every spoken line of the activity goes in here.
  pisa: {
    arrive: [civetta('Hoo! I am Professoressa Civetta!'), civetta('My tower leans more and more! Help!')],
    // 1. Balance it.
    soft: 'The tower leans because the ground is soft!',
    weights: 'Drag a heavy weight to the high side!',
    weightNext: 'Another weight!',
    weightLast: 'One more weight!',
    wrongSide: 'Oops! Put it on the other side!',
    creak: civetta('Hoo! It leans more!'),
    better: [civetta('Hoo! It is getting better!'), civetta('Yes! Keep going!'), civetta('It stopped! Hoo-ray!')],
    stillLeans: 'It still leans a little. That is why it is famous!',
    engineers: 'Builders really did this, with heavy weights!',
    // 2. The famous photo.
    photo: 'Let\'s take the famous photo!',
    pushSparkle: 'Drag Sparkle until her hoof holds up the tower!',
    closer: 'Closer to the tower!',
    snap: 'Say cheese! Snap!',
    // 3. Galileo's drop.
    galileo: 'A scientist named Galileo lived here!',
    climb: civetta('Let\'s drop things from the top! Like Galileo!'),
    whichFirst: 'Which one lands first? Tap it!',
    findOut: civetta('Let\'s find out!'),
    drop: 'Tap the drop button!',
    same: 'They land at the same time!',
    sameWhy: 'Heavy and light fall just as fast!',
    feather: 'The feather floats down slowly!',
    air: 'The air pushes the feather!',
    youPick: 'Now you pick! Tap two things to drop!',
    pickOne: 'Pick one more!',
    youWere: ['You were right!', 'Good guess!'],
    // Payoff: the seven bells.
    bells: civetta('The tower is a bell tower! Seven bells!'),
    ringBells: 'Tap the bells, one by one!',
    scale: 'Do, re, mi! Music!',
    giveBells: civetta("Grazie! My bells, for Lupa's band!"),
    band: lupa('Yay! Bells for the band!'),
  },

  // 🛶 Venice (activities/venice). Every spoken line of the activity goes in here.
  venice: {
    arrive: [gino(`Ciao, ${NAME}! Welcome to Venice!`), gino('Here the streets are water! Hop in!')],
    // Row.
    row: 'Drag the oar back to row!',
    rowMore: 'Again! Row, row!',
    rowHint: 'Swipe the oar this way!',
    sing: [gino('La la la, my gondola!'), gino('Row, row, over the water!'), gino('Venice, bella Venezia!')],
    // Forks.
    fork: 'The canal splits in two!',
    left: 'Turn left!',
    right: 'Turn right!',
    leftHand: 'Left is this hand!',
    rightHand: 'Right is this hand!',
    deadEnd: gino('Ha ha! A dead end!'),
    quack: 'Quack!',
    backUp: gino('Back we go!'),
    tryOther: 'Try the other way!',
    goodTurn: [gino('Bravissima!'), gino('Perfetto! This way!')],
    // The low bridge.
    bridge: 'A low bridge! Tap Sparkle to duck!',
    ducked: gino('Phew! Just in time!'),
    rialto: 'Venice has over four hundred bridges!',
    // The boat ambulance.
    ambulance: 'Look! In Venice, even ambulances are boats!',
    noCars: 'There are no cars in Venice!',
    // The mask shop.
    shop: gino('Here we are! The mask shop!'),
    carnival: 'Venice has a big costume party called Carnevale!',
    paint: 'Paint this side of the mask!',
    mirror: 'Look! The other side paints itself!',
    mirrorWhy: 'Both sides match, like a mirror!',
    paintMore: 'Paint a little more!',
    colors: 'Tap a color!',
    stickers: 'Now add three sparkly gems!',
    stickersHint: 'Drag a gem onto the mask!',
    count: ['One!', 'Two!', 'Three!'],
    done: 'Tap the check when you like it!',
    wear: 'Sparkle, try it on!',
    pretty: `So pretty, ${NAME}!`,
    // Payoff: fireworks over the lagoon.
    night: gino('Look! Fireworks over the water!'),
    tapSky: 'Tap the sky for fireworks!',
    reflect: 'The fireworks shine in the water!',
    accordion: gino("My accordion, for Lupa's band!"),
    tapAccordion: 'Tap the accordion!',
    band: lupa('Yay! An accordion for the band!'),
  },

  // 🌋 Snow on a Volcano (activities/etna). Every spoken line of the activity goes in here.
  etna: {
    arrive: [nino(`Ciao, ${NAME}! I'm Nino!`), nino("It's so hot! Let's get snow from the volcano!")],
    // Climb.
    climb: 'Drag Nino up the path!',
    climbHint: 'Drag Nino along the path, up the mountain!',
    hot: nino('Phew! So hot by the beach!'),
    lemons: 'Lemons grow here in the hot sun!',
    cool: nino('Ahh, cooler in the forest!'),
    cold: nino('Brrr! Snow! So cold!'),
    scarf: 'A scarf for Nino!',
    higher: 'The higher you go, the colder it gets!',
    // Pack the snow.
    pack: 'Drag snow into Nino\'s baskets!',
    packHint: 'Drag the snow onto Nino!',
    count: ['One!', 'Two!', 'Three!', 'Four!', 'Five!'],
    puff: 'Etna is a volcano! It puffs smoke!',
    tallest: 'Etna is the tallest volcano in Europe!',
    full: nino('My baskets are full!'),
    // Zoom down.
    zoom: 'Tap Nino to zoom down!',
    wheee: nino('Wheee!'),
    // Granita on the beach.
    melting: lupa("We're melting!"),
    monaHello: mona('So hot! Arf!'),
    long1: 'Long ago, people brought snow down from Etna.',
    long2: 'They made icy treats called granita!',
    scoop: 'Tap the basket to scoop snow!',
    scoopTwo: 'Two scoops for Mona! Tap the basket!',
    scoopMore: 'One more scoop!',
    squeeze: 'Press and hold the lemon to squeeze!',
    squeezeMore: 'Keep holding!',
    sicily: 'Sicily has the best lemons!',
    serve: 'Tap the granita to give it away!',
    yum: [lupa('Brrr! Yummy!'), tortoise('Mmm... so... cold...'), mona('Arf! Two scoops! Yum!')],
    freeze: 'Brain freeze! Hee hee!',
    weather: 'Italy has snowy mountains and hot, sunny beaches!',
    // Payoff.
    piano: nino("I'm strong! I'll carry the piano to Lupa's band!"),
    pianoFact: 'The piano was invented in Italy!',
    tapPiano: 'Tap the piano keys!',
    band: lupa('Yay! A piano for the band!'),
  },

  // 🎭 Opera night (the finale, activities/opera). Every spoken line of it goes in here.
  opera: {
    arrive: [lupa(`${NAME}! The band is ready!`), lupa("It's opera night in Verona!")],
    arena: 'This arena is almost 2,000 years old!',
    candles: 'Tap the seats to light the candles!',
    candlesMore: 'More candles!',
    candlesDone: 'So many little lights!',
    wand: `You are the conductor, ${NAME}! Here is your wand!`,
    big: 'Swing the wand big!',
    forte: 'Big swings play loud! Forte means loud!',
    small: 'Now swing it tiny!',
    piano: 'Tiny swings play soft! Piano means soft!',
    swingHint: 'Move your finger back and forth!',
    solo: 'Tap a friend for a solo!',
    soloYay: 'A solo!',
    lupaTurn: lupa("It's my turn... I'm scared!"),
    star: 'Look! Lupa\'s wishing star! Tap it!',
    sing: lupa('Laaaaaa!'),
    sang: lupa('I sang! My wish came true!'),
    brava: [bruno(`Brava, ${NAME}!`), spina('Brava, Lupa!'), cesare('Bravissime!')],
    roses: 'Catch the roses!',
    jets: 'Look up! The Italian air show!',
    flag: 'Green, white and red! Like a pizza Margherita!',
    gelato: lupa('Gelato for everyone!'),
    bye: lupa(`Grazie, ${NAME}! Ciao for now!`),
    trophy: 'Tap the trophy!',
  },

  stickers: {
    pizzeria: 'Brown bear sticker! Bears live in the mountains of Italy!',
    olives: 'Porcupine sticker! Crested porcupines live in Italy!',
    colosseum: 'Cat sticker! Lots of cats live in the old ruins of Rome!',
    pisa: 'Little owl sticker! Little owls live all over Italy!',
    venice: 'Pigeon sticker! Lots of pigeons live in Venice!',
    etna: 'Donkey sticker! Donkeys carry things up the hills of Sicily!',
    trevi: 'Wolf sticker! The story says a kind mama wolf took care of the twins who built Rome!',
  },
  videos: {
    olives: "Let's see how olive oil is made!",
    trevi: "Let's toss a coin in the real Trevi Fountain!",
    aqueduct: 'Look! A real Roman water bridge!',
    colosseum: "Let's see the real Colosseum in Rome!",
    pisa: "Let's see the real Leaning Tower!",
    venice: "Let's ride a real gondola in Venice!",
    etna: "Look! The real Mount Etna!",
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
    numbers: 'Romans wrote five like this: V!',
    pisa: 'The Leaning Tower of Pisa leans because the ground is soft!',
    morning: 'Buongiorno means good morning!',
    venice: 'In Venice, the streets are water! People ride in boats!',
    music: 'The piano and the violin were first made in Italy!',
    gelato: 'Gelato is Italian ice cream! Yum!',
    pantheon: 'The Pantheon in Rome has a big hole in its roof. When it rains, rain falls inside!',
    etna: 'Etna is the tallest volcano in Europe!',
    wolf: 'The story says a kind mama wolf took care of the twins who built Rome!',
  },
  passport: 'This is Italy! Tap a picture to learn more.',
}
