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
const nainai = as('nainai')
const hong = as('hong')
const crane = as('crane')
const mouse = as('mouse')
const ox = as('ox')
const rabbit = as('rabbit')
const dragon = as('dragon')
const tiger = as('tiger')
const camel = as('camel')
const yak = as('yak')
const longlong = as('longlong')
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

  // Bamboo Forest (activities/bamboo) and the Great Wall (activities/wall).
  bamboo: {
    arrive: [baobao('My tummy is rumbling!'), baobao('Pandas eat bamboo all day!')],
    // Round 1: grow one shoot three tall.
    grow3: 'Swipe up! Grow it three tall!',
    count: ['One!', 'Two!', 'Three!'],
    threeTall: baobao('Three tall! Wow!'),
    enough: 'Three tall is enough!',
    munch: [baobao('Crunch crunch! Yum!'), baobao('Mmm! More bamboo, please!')],
    // Round 2: make one taller than the other.
    grow2: 'Make this one taller than that one!',
    glowHint: 'Grow the glowing bamboo!',
    same: 'Same height! Grow one more!',
    taller: 'Taller! And that one is shorter!',
    // Round 3: tallest and shortest.
    tallestQ: 'Which one is the tallest? Tap it!',
    tallestHint: 'Look for the tallest one!',
    tallestWrong: 'Too short! Find the tallest!',
    tallestYes: 'The tallest bamboo!',
    shortestQ: 'Which one is the shortest? Tap it!',
    shortestHint: 'Look for the short one!',
    shortestWrong: 'Too tall! Find the shortest!',
    shortestYes: 'The shortest bamboo!',
    // Payoff.
    climb: 'Bao Bao climbs the tallest bamboo!',
    up: baobao('Up, up, up!'),
    whoa: baobao('Whoa! Wheeee!'),
    leaves: baobao('Soft leaves! Hee hee!'),
    yum: baobao('Yum! Best snack ever!'),
    giggle: [baobao('Hee hee hee!'), baobao('Wheee!')],
  },
  wall: {
    oops: houhou('Oops! I knocked bricks off the Great Wall!'),
    long: 'The wall is so long! Slide it to see more!',
    follow: 'Slide the wall, or tap the arrow!',
    follow2: 'Hou Hou ran ahead! Follow him!',
    // The pattern out loud (once per gap); a wrong brick just points at the glowing one.
    pattern: [
      'Red, gold, red, gold... what comes next?',
      'Red, gold, gold, red, gold... what comes next?',
      'Red, gold, jade, red... what comes next?',
    ],
    pattern3b: 'One more! What comes next?',
    hint: 'Try the glowing brick!',
    fixed: [houhou('Yay! Thank you, Kaylee!'), houhou('Hee hee! The wall is getting strong!'), houhou('Hooray! The whole wall is fixed!')],
    beacon: 'Tap the tower to light the signal fire!',
    signal: 'Soldiers sent smoke signals tower to tower!',
    signalEnd: 'The message zoomed along the wall!',
    tap: [houhou('Hee hee!'), houhou('Tickles!')],
  },

  // 🍲 Hotpot Night (activities/hotpot). Owner: the hotpot build.
  hotpot: {
    story: [nainai(`Hotpot time, ${NAME}! Everybody cooks together!`)],
    ask: ['Bao Bao wants noodles!', 'Hong wants something green from the mild side!', 'Nai Nai wants two dumplings!'],
    dropTip: 'Tap a food, then tap the soup!',
    dropTipNoodles: 'Tap the noodles, then tap the soup!',
    green: 'Green! Try the bok choy!',
    mild: 'The mild side is the white soup!',
    dumplings: 'Dumplings! We need two!',
    wait: 'Wait for the sparkle!',
    cooked: 'Sparkly! It is ready!',
    chopTip: 'Tap the chopsticks, then tap the sparkly food!',
    chopFact: 'People in China eat with chopsticks!',
    spinTip: 'Spin the table with your finger!',
    spin: ['Spin the table to Bao Bao!', 'Spin the table to Hong!', 'Spin the table to Nai Nai!'],
    count: COUNT,
    thanks: [baobao('Shyeh shyeh!'), hong('Shyeh shyeh!'), nainai('Shyeh shyeh!')],
    teach: 'Shyeh shyeh means thank you!',
    bigBubbles: hong('Whoa! Big bubbles!'),
    tingle: hong('Tingly lips!'),
    factPot: 'Everyone shares one pot in the middle!',
    factRound: 'A round table means everybody can reach!',
    factPepper: 'Sichuan peppers make your lips tingle!',
    finale: 'Everybody eat together!',
    yum: [baobao('Yum yum!'), nainai('Hao chi! Delicious!'), hong('Hooray!')],
    tap: [baobao('Hee hee!'), hong('Eep!'), nainai('Ho ho ho!')],
  },
  // 🖌️ The Magic Brush (activities/brush). Owner: the brush build.
  brush: {
    story: [crane('This magic brush makes pictures come alive!')],
    // What to paint, in order: person, mountain, sun, tree, big, moon.
    intro: ['Paint a person! Follow the glowing line.', 'Now paint a mountain!', 'Now paint the sun!', 'Now paint a tree!', 'Now paint something big!', 'Last one! Paint the moon!'],
    next: 'Now the next line!',
    hint: 'Start at the glowing dot!',
    retry: 'Try again! Follow the glowing line.',
    // The Mandarin word (spelled the way it sounds), then what it means.
    word: [crane('Ren!'), crane('Shahn!'), crane('Rr!'), crane('Moo!'), crane('Dah!'), crane('Yweh!')],
    means: ['Ren means person!', 'Shan means mountain!', 'Ri means sun!', 'Mu means tree!', 'Da means big!', 'Yue means moon!'],
    fade: 'The water writing fades away, but the picture stays!',
    baoBig: baobao('I can be big too!'),
    night: 'Good night, moon!',
    nameIntro: `Now paint your name, ${NAME}! In Chinese!`,
    nameSay: crane('Ky lee!'),
    stamp: 'Tap the red stamp!',
    stamped: `Your name, stamped with a red seal, ${NAME}!`,
    fact: "Chinese isn't written with letters. Some characters started as pictures!",
    end: crane('What a beautiful painting!'),
    tapCrane: [crane('Oh my!'), crane('Hee hee!')],
  },
  // 🐭 The Great Race (activities/race). Owner: the race build.
  race: {
    story: ['The Jade Emperor is holding a big race across the river!', mouse("I'm small, but I'm clever!")],
    // Mouse and Ox
    mouseHelp: "Mouse can't swim! Put Mouse on Ox's back!",
    mouseHint: "Drag Mouse onto Ox's back!",
    oxHi: ox('Hop on, little one!'),
    paddle: 'Tap Ox to paddle!',
    oxHalf: ox('Almost there!'),
    jumpOff: 'Mouse jumps off first!',
    mouseWin: mouse('Squeak! I won!'),
    oxWell: ox('Well done, little one!'),
    // Tiger
    tigerSwim: 'Tiger swims across all by himself!',
    tigerLine: tiger('Splash, splash! I can swim!'),
    // Rabbit
    stonesHelp: 'Rabbit hops! Put stones in the glowing spots!',
    stonesHint: 'Put a stone on a glowing spot!',
    stonesDone: 'Now Rabbit can hop across!',
    rabbitHop: rabbit('Hop, hop, hop!'),
    // Dragon
    dragonLate: dragon('I stopped to make rain for a thirsty village!'),
    rainHelp: 'Tap the clouds to make it rain!',
    rainHint: 'Tap a glowing cloud!',
    rainDone: 'The flowers are so happy!',
    dragonFly: dragon('Whoosh! Now I can fly!'),
    // The winners' steps: the question, a hint (Sparkle reminds the order), and praise for each place.
    stepsIntro: 'Everybody wins a step! Who came first?',
    ask: [
      'Who came first? Put Mouse on the first step!',
      'Who came second? Put that animal on the second step!',
      'Who came third? Put that animal on the third step!',
      'Now the last two! Who came fourth?',
      'And who came fifth?',
    ],
    hintOrder: [
      'Mouse jumped off Ox first!',
      'Ox carried Mouse. Ox came second!',
      'Tiger swam across third!',
      'Rabbit hopped over the stones. Rabbit came fourth!',
      'Dragon stopped to make rain. Dragon came fifth!',
    ],
    tryGlow: 'Try the glowing one!',
    placed: ['First place!', 'Second place!', 'Third place!', 'Fourth place!', 'Fifth place!'],
    askAfter: 'Who came right after Ox? Tap that animal!',
    afterHint: 'Tiger came right after Ox! Tap the glowing one!',
    afterYes: 'Yes! Tiger came right after Ox!',
    winners: 'Everybody won a place! Hooray!',
    // The zodiac wheel
    wheel: 'There are twelve zodiac animals, one for every year!',
    reveal: {
      ox: 'Kaylee, you were born in the Year of the Ox!',
      mouse: 'Kaylee, you were born in the Year of the Rat!',
    },
    revealOx: ox('Moo-hoo! Hooray, Kaylee!'),
    revealMouse: mouse('Squeak! Hooray, Kaylee!'),
    year: 'This year, 2026, is the Year of the Horse!',
    catAsk: 'Shh! Someone is sleeping. Tap the cat!',
    catFact: 'The cat overslept and missed the race! That is why there is no Year of the Cat!',
    tap: [mouse('Squeak!'), mouse('Hee hee!')],
    oxTap: ox('Moo!'),
  },
  // 🚄 Bullet Train (activities/train). Owner: the train build.
  train: {
    story: baobao("China is so big! Let's ride the super-fast train!"),
    push: 'Push the lever up to zoom!',
    pushAgain: 'Push it up!',
    fast: 'China has some of the fastest trains in the world!',
    big: 'China is so big! Snowy in the north, sunny beach in the south!',
    toot: 'Toot toot!',
    // Arriving at each stop (Sparkle), then what to do.
    arrive: {
      harbin: 'Harbin! It is far up north. Brrr, snow!',
      hainan: 'Hainan! It is far down south. So hot!',
      gobi: 'The Gobi Desert! Sunny days and chilly nights!',
      himalaya: 'The Himalayas! The tallest mountains in the world!',
    },
    ask: {
      harbin: 'Keep Bao Bao warm!',
      scarf: 'The tiger is shivering! Give him the scarf!',
      hainan: 'Get Bao Bao ready for the beach!',
      gobiDay: 'It is a hot, sunny day! What does Bao Bao need?',
      gobiNight: 'Now it is night, and cold! What does Bao Bao need?',
      himalaya: 'Which one fits the tall, snowy mountains?',
    },
    // Wrong picks: Bao Bao giggles (keyed by stop + item); the right ones glow.
    wrong: {
      'harbin:swimring': baobao('A swim ring in the snow? Silly!'),
      'hainan:mittens': baobao('Mittens at the beach? Silly!'),
      'gobiDay:blanket': baobao('A blanket in the hot sun? Silly!'),
      'gobiDay:mittens': baobao('Mittens in the desert sun? Silly!'),
      'gobiNight:sunhat': baobao('A sun hat at night? Silly!'),
      'gobiNight:water': baobao('I am not thirsty. I am cold!'),
      'himalaya:sunhat': baobao('A sun hat on a snowy mountain? Silly!'),
      'himalaya:swimring': baobao('A swim ring on a mountain? Silly!'),
      'himalaya:water': baobao('I need something warm!'),
      scarf: tiger('Brrr! I need the scarf!'),
    },
    hint: 'Try the glowing one!',
    // Right picks.
    yes: {
      mittens: baobao('Mittens! So cozy!'),
      hat: baobao('A warm hat! Yay!'),
      scarf: tiger('Ahh! Warm now. Thank you!'),
      sunhat: baobao('A sun hat! Yay!'),
      swimring: baobao('A swim ring! Wheee!'),
      water: baobao('Glug glug! Yum!'),
      blanket: baobao('A cozy blanket!'),
      coat: baobao('A big warm coat!'),
    },
    shiver: tiger('Brrr! So cold!'),
    hello: { camel: camel('Hello, little panda!'), yak: yak('Hello up here!') },
    tap: [baobao('Hee hee!'), baobao('Tickles!')],
    animalTap: { tiger: tiger('Rrr, hello!'), camel: camel('Two humps, no hurry.'), yak: yak('Hello, friend!') },
    end: baobao('What a trip! Thank you, Kaylee!'),
  },
  // 🐉 The Dragon Parade finale (activities/parade). Owner: the parade build.
  parade: {
    arrive: longlong(`I'm Long Long! Let's dance, ${NAME}!`),
    drive: 'Drag Long Long around the lanterns!',
    hint: 'Follow the glowing lanterns!',
    thanks: {
      bamboo: baobao('Shyeh shyeh for the bamboo!'),
      wall: houhou('Shyeh shyeh for fixing the wall!'),
      hotpot: hong('Shyeh shyeh for the hotpot!'),
      brush: crane('Shyeh shyeh for the magic brush!'),
      race: mouse('Shyeh shyeh for the race!'),
      train: tiger('Shyeh shyeh for the train ride!'),
      dumplings: cheffu('Shyeh shyeh for the dumplings!'),
    },
    lap: longlong(`Wheee! What a dance, ${NAME}!`),
    drum: 'Tap the drum! Make the dragon dance!',
    drumMid: longlong('Boom boom! I love it!'),
    drumDone: `Great drumming, ${NAME}!`,
    sky: 'Tap the sky to make fireworks!',
    skyFact: 'Fireworks were invented in China!',
    flag: 'Tap the flag to raise it!',
    flagFact: "China's flag is red, with one big gold star and four little stars!",
    envelope: "Bao Bao has a red envelope! Tap to open it!",
    hongbao: 'A red envelope is called a hong bao!',
    greet: baobao(`Sheen nyen kwy luh, ${NAME}! Happy New Year!`),
  },
  // Real-world videos (meta.videos); spoken when one is offered or picked.
  videos: {
    pandas: "Let's see real baby pandas!",
    wall: 'Want to see the real Great Wall?',
    redPandas: "Let's see real red pandas!",
    calligraphy: 'Look! Painting with water!',
    race: 'Want to hear the Great Race story?',
    train: 'Zoom! A real bullet train!',
    dumplings: 'See real soup dumplings!',
    shanghai: "Let's see Shanghai at night!",
    dragonDance: 'Look, a real dragon dance!',
    overview: "Let's see where China is!",
    harbin: 'Wow, a city made of ice!',
    counting: "Let's count in Chinese!",
    liRiver: "Let's float down the Li River!",
    newYear: 'What is Chinese New Year?',
  },

  stickers: {
    bamboo: 'Giant panda sticker! Panda babies are born as tiny as a stick of butter!',
    wall: 'Golden monkey sticker! These monkeys have sky-blue faces!',
    dumplings: 'Pekingese sticker! These puppies from China look like tiny lions!',
    hotpot: 'Red panda sticker! Red pandas stand up tall when they are surprised!',
    brush: 'Crane sticker! Red-crowned cranes dance to say hello!',
    race: 'Ox sticker! You were born in the Year of the Ox!',
    train: 'Tiger sticker! Amur tigers live where it is snowy and cold!',
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
    thanks: 'Shyeh shyeh means thank you!',
    counting: 'One, two, three in Chinese: ee, are, san!',
    red: 'In China, red is the color of luck and happiness!',
    dragons: 'Chinese dragons are kind! They bring rain and good luck.',
    chopsticks: 'People in China eat with chopsticks!',
    inventions: 'Paper, kites and fireworks were first made in China!',
    haochi: 'How chir means delicious!',
    flag: "China's flag is red, with one big gold star and four little stars!",
    people: 'More people live in China than almost anywhere in the world!',
  },
  passport: 'This is China! Tap a picture to learn more.',
}
