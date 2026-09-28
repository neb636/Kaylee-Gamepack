// Every phrase that can be spoken in China. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Plain strings are Sparkle, the guide: she gives the instructions. Friends say their own story and reaction lines in
// their own voices (see cast.json). Mandarin and Shanghainese words are spelled the way they sound, so the voices say
// them right ("Nong how" = 侬好 nóng hǎo); the screen shows the real words on a WordCard (see words.ts).
const NAME = 'Kaylee'
const as = (voice: string) => (text: string) => ({ text, voice })
const doudou = as('doudou')
const cheffu = as('cheffu')
const grandpa = as('grandpa')
const bunnies = as('bunnies')
const goose = as('goose')
const lulu = as('lulu')
const baobao = as('baobao')
const houhou = as('houhou')
const COUNT = ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!']

export const L = {
  name: 'China',
  intro: [`Nee how, ${NAME}!`, 'Nee how means hello in China!'],
  hubFirst: 'Tap the glowing lantern!',
  hubNext: `Where should we go next, ${NAME}?`,
  hubParty: 'Tap the dragon parade!',
  soon: 'This lantern opens soon!',
  partyLocked: 'Light up the lanterns to start the parade!',
  paradeSoon: 'The dragon parade is coming soon!',
  trophyWin: `${NAME}, you did it! You won the China Explorer trophy!`,
  trophyRoom: `${NAME}, China Explorer! From China.`,

  dumplings: {
    // Arrival on the Bund, then a walk through the old town.
    arrive: [doudou(`Nong how, ${NAME}!`), doudou('Chef Fu needs our help!')],
    bridge: 'Tap the zig-zag bridge!',
    zigzag: 'Zig-zag bridges keep bad luck away!',
    door: 'Tap the dumpling house door!',
    aiyo: cheffu('Aiyo! So many hungry customers, and no helper!'),

    // Service 1: Grandpa Turtle's four dumplings. Each step is one finger move.
    order4: grandpa('Just four dumplings, please.'),
    knead: 'Push the dough three times!',
    kneadCount: [cheffu('Ee!'), cheffu('Are!'), cheffu('San!')],
    kneadDone: cheffu('Smooth and shiny! Ee, are, san means one, two, three!'),
    snake: 'Swipe the dough to make a long snake!',
    chop: 'Tap to cut the snake into four pieces!',
    count: COUNT,
    roll: 'Roll the rolling pin back and forth!',
    rolled: cheffu('A perfect round wrapper!'),
    fill: 'Tap the bowl for one spoonful!',
    blorp: cheffu('Ho ho ho! Just one spoonful!'),
    pleat: 'Draw a circle around the dumpling to fold it!',
    pleated: cheffu('Beautiful! Real chefs make eighteen folds!'),
    quickHands: cheffu('Watch my quick hands!'),
    pleatMore: 'Fold these dumplings too!',
    counted4: 'One, two, three, four dumplings!',
    steamer: 'Put each dumpling in the basket, on the cabbage leaf!',
    leaf: 'The cabbage leaf keeps them from sticking!',
    lid: 'Tap the lid to close the basket!',
    fire: 'Tap the knob to heat the water!',
    steamFact: 'Hot water makes steam. Steam cooks dumplings!',
    popSteam: 'Pop the steam puffs!',
    lift: 'Tap the lid to peek!',
    tada: cheffu('Ta-da! Soup dumplings!'),
    serve: "Carry the basket to Grandpa Turtle's table!",
    eatHow: grandpa('Hot soup inside! Nibble, sip, eat.'),
    nibble: 'Tap the dumpling to take a little nibble!',
    sip: 'Tap again to sip the soup!',
    eat: 'Now eat it all up!',
    haochi: grandpa('How chir! Delicious!'),

    // Service 2: the lunch rush.
    rush: cheffu('Aiyo! The lunch rush!'),
    orderBunnies: bunnies('Two pink and two green, please!'),
    orderGoose: goose("I'll have two yellow, please, dear."),
    pickColor: {
      pink: 'Tap the pink dough!',
      green: 'Tap the green dough!',
    },
    notThat: {
      pink: 'That one is not pink. Find the pink dough!',
      green: 'That one is not green. Find the green dough!',
    },
    colorName: { cream: 'Cream!', pink: 'Pink!', green: 'Green!', yellow: 'Yellow!' },
    fillFold: 'Now fill it and fold it!',
    gooseMine: cheffu("I'll make Mrs. Goose's dumplings!"),
    stack: 'Stack the baskets on the wok!',
    stackFact: 'Dumpling chefs stack their baskets up high!',
    serveBunnies: 'Take the pink ribbon basket to the Bunny Twins!',
    serveGoose: 'Take the yellow ribbon basket to Mrs. Goose!',
    notMine: [grandpa('Not mine, dear!'), goose('Not mine, dear!'), bunnies('Not ours!')],
    bunniesYum: bunnies('Yay! Pink and green! Thank you!'),
    gooseYum: goose('Splendid! Thank you, dear.'),
    tea: 'Tap the table two times to say thank you for the tea!',
    teaFact: 'In China, a tap tap on the table means thank you!',
    teaPour: doudou('More tea?'),

    // Service 3: Bao Bao's big surprise order.
    jingle: 'Ding ding! Someone is here!',
    baobao: [baobao('Five dumplings, please!'), baobao('No, six!')],
    make6: 'Tap the colors to make six dumplings!',
    sneak: 'Uh oh! Tap the sneaky monkey!',
    sorry: houhou('Hee hee! Sorry!'),
    six: 'Six dumplings! Now steam them!',
    serveBao: "Take the basket to Bao Bao's table!",
    baoYum: baobao('Mmm! How chir! I love dumplings!'),

    // Between services, and the payoff.
    serviceDone: 'Great cooking! Ready for the next customers?',
    clap: 'Everyone is clapping for you!',
    hat: cheffu(`Shyeh shyeh, Chef ${NAME}! A chef hat for you!`),
    lulu: lulu(`Achoo! Thank you, ${NAME}!`),
    doudouBye: doudou('Take some dumplings to the New Year parade!'),

    // Things she can tap for fun in the dining room.
    dimsum: {
      harGow: 'Har gow! Shrimp dumplings!',
      charSiuBao: 'Char siu bao! A fluffy bun!',
      eggTart: 'An egg tart! Sweet and yummy!',
      sesameBall: 'A sesame ball! Crunchy and chewy!',
      springRoll: 'Spring rolls! Crispy!',
    },
    dimsumCart: 'Dim sum means lots of little dishes to share!',
    tickle: {
      doudou: [doudou('Hee hee! Woof!'), doudou('Shanghai is the biggest city in China!')],
      cheffu: [cheffu('Ho ho ho!'), cheffu('Dumplings make everyone happy!')],
      grandpa: [grandpa('Slow and steady, like me.'), grandpa('Hello, little chef.')],
      bunnies: [bunnies('Hee hee hee!'), bunnies("We're twins!")],
      goose: [goose('Oh, how lovely.'), goose('Honk! Pardon me.')],
      baobao: [baobao('More dumplings, please!'), baobao('Hee hee! I love you!')],
      dumpling: ['Squishy!', 'Hello, little dumpling!'],
    },
  },

  stickers: {
    dumplings: 'Pekingese sticker! These puppies from China look like tiny lions!',
  },
  facts: {
    hello: 'In China, people say nee how! It means hello!',
    shanghai: 'Shanghai is the biggest city in China! It has a tower with pink balls!',
    dumplings: 'Soup dumplings come from Shanghai. There is soup inside!',
    dimsum: 'Dim sum is lots of little dishes, shared with tea.',
    newYear: 'Chinese New Year has lanterns, dragons and red envelopes!',
    pandas: 'Giant pandas live in the bamboo mountains of China.',
    wall: 'The Great Wall of China is super long!',
    big: 'China is a huge country with snowy places and sunny beaches!',
  },
  passport: 'This is China! Tap a picture to learn more.',
}
