// Every phrase that can be spoken in Thailand. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Thailand's friends are Kaylee's own family, as animal characters (planning/around-the-world/thailand.md). Sparkle
// guides (plain strings); the family say hello in their own voices (cast.json), with the Thai hello: Sawasdee, ending
// in "ka" from the women and "krub" from the men. Straight apostrophes only: curly ones failed the transcription check
// in PR #63.
const NAME = 'Kaylee'

type Line = string | { text: string; voice: string }
const by = (voice: string) => (text: string) => ({ text, voice })

const nick = by('nick')
const ji = by('ji')
const kids = by('kids')

/** Each person's first hello, then what they say each time after (in turn). */
const hello = (voice: string, hi: string, again: string[]) => ({ hi: by(voice)(hi), again: again.map(by(voice)) })

export const L = {
  // The shell's trophy ceremony and the trophy room speak these.
  trophyWin: `${NAME}, you did it! You won the Thailand Explorer trophy!`,
  trophyRoom: `${NAME}, Thailand Explorer! From Thailand.`,
  passport: 'This is Thailand! Tap a picture to explore.',
  facts: {
    hello: 'In Thailand, we say Sawasdee to say hello!',
    elephant: "The elephant is Thailand's special animal!",
    chang: 'In Thai, chang means elephant!',
    flag: "Thailand's flag is red, white and blue!",
    // The boat trip's facts that aren't said anywhere in it (Aunty Sri's van has its steering wheel on the right).
    left: 'Thai cars drive on the left!',
  },

  // Sparkle, at Agong's house: at most two lines before her hands are busy, then only when something is new or she
  // seems stuck.
  house: {
    arrive: `We're at Agong's house in Thailand, ${NAME}!`,
    door: 'Tap the door to go inside!',
    inside: 'Tap your family to say hello!',
    upstairs: 'This is your room! Try the mattress!',
    // Every time she taps the bathroom door upstairs (it's locked).
    bathroom: "I don't need to go to the bathroom!",
    stuck: {
      street: 'Tap the door to go inside!',
      downstairs: 'Tap the stairs to go up to your room!',
      upstairs: `Bounce on the mattress, ${NAME}!`,
    },
    // The first time she pokes these: something true about Thailand.
    pokes: {
      'spirit-house': 'A spirit house! Thai families give it flowers and a drink.',
      altar: 'Put your hands together and bow. In Thailand, that is a wai!',
      'tuk-tuk': 'A tuk-tuk! It goes tuk tuk tuk!',
      'rice-cooker': 'Thai families eat rice every day!',
      'lucky-cat': 'The lucky cat waves for good luck!',
      gecko: 'A gecko! It sings took-geh, took-geh!',
      motorbike: 'Lots of people in Thailand ride motorbikes!',
    } as Record<string, Line>,
  },

  // The family (their voices in cast.json; their animals in characters/looks.ts).
  family: {
    agong: hello('agong', `Sawasdee krub, ${NAME}! Welcome home!`, ['Come, sit with Agong.', 'Ho ho! My little unicorn!']),
    ji: hello('ji', 'Hi sweetie! This is our room!', ['Bounce on the mattress!', `I love you, ${NAME}!`]),
    nick: hello('nick', "Hi Kaylee! Welcome to Agong's house!", ['High five!', "Let's go inside!"]),
    jum: hello('jum', `Sawasdee ka, ${NAME}! Are you hungry?`, ['The rice is almost ready!', `So big now, ${NAME}!`]),
    joy: hello('joy', `Sawasdee ka, ${NAME}! Look at Agong's treasures!`, ['The lucky cat says hi!', 'Hee hee! Hi again!']),
    bird: hello('bird', `Sawasdee krub, ${NAME}!`, ['Want to sit on my motorbike?', 'Beep beep!']),
    gan: hello('gan', 'Mm-hmm. Hi Kaylee.', ["One sec, I'm winning!", 'Uh-huh...']),
    ken: hello('ken', 'Oh. Hi, Kaylee.', ['Look, a funny video!', 'Mm-hmm...']),
    bb: hello('bb', 'Hi Kaylee... one second.', ['So cute, Kaylee.', 'Uh-huh!']),
    ja: hello('ja', `Sawasdee ka, ${NAME}!`, ['Big smile for the photo!']),
    sri: hello('sri', `Sawasdee ka, ${NAME}!`, ['Say cheese!']),
    putto: hello('putto', `${NAME}! Sawasdee krub!`, ["Let's play!"]),
    putter: hello('putter', 'Hi Kaylee! Hee hee!', ['Peep peep!']),
  } as Record<string, { hi: Line; again: Line[] }>,

  // The boat trip's way there (trip/legs/): Mommy asks, packing, the goodbye, the airport, the window seat. Each line
  // is said once, for something new (or a hint after a while with nothing done). The officer and the flight attendant
  // are background figures with a line or two each. Kaylee never talks: she giggles.
  trip: {
    ask: {
      question: ji('Kaylee, are you ready to go on a trip?'),
      later: ji('OK! Tell me when!'),
      // Daddy on the street, when she taps him (the hub's quick way to a trip).
      daddy: {
        question: nick(`Ready for a trip, ${NAME}?`),
        where: nick(`Where do you want to go, ${NAME}?`),
        later: nick('OK! Just tap me!'),
      },
    },
    pack: {
      start: ji('Tap your things to pack them, Kaylee!'),
      close: ji('All packed? Tap the suitcase!'),
      hint: ji("It's hot and sunny at the sea!"),
      hungry: ji('Pack some more!'),
      full: ji("It's too full! Sit on it!"),
      gan: by('gan')('Five more minutes...'),
      pillow: ji('Yawn... so sleepy!'),
      fan: ji('The fan blew it open!'),
      sunscreen: ji('Mommy always packs sunscreen!'),
      hat: ji("Here's Mommy's spare sun hat!"),
    },
    goodbye: {
      agong: by('agong')('Bring Agong a photo of the Nail Island!'),
      jum: by('jum')('Snacks for the trip!'),
      // The big cousins, without looking up from their phones.
      gan: by('gan')('Bye...'),
      ken: by('ken')('Bye...'),
      bb: by('bb')('Bye...'),
      van: nick('Aunty Sri is here! Hop in!'),
      horn: by('sri')('Beep beep! To the airport!'),
    },
    airport: {
      start: nick('Put your suitcase on the belt!'),
      laugh: by('officer')('Ha ha! What a suitcase!'),
      gan: by('officer')('A sleeping fox?!'),
      fan: by('officer')('A fan? Ha ha!'),
      plane: nick('Our plane! Tap the door!'),
    },
    plane: {
      belt: ji('Seatbelt on, Kaylee!'),
      wheee: ji('Whee! Up we go!'),
      tray: ji('Tray down, then press the button!'),
      snack: by('attendant')('Snacks for Kaylee!'),
      more: by('attendant')('More snacks?!'),
      share: ji('Want some of mine?'),
      snore: ji('Night night!'),
      dad: nick('Huh? Are we there yet?'),
      land: ji('Seatbelts on! We are landing!'),
      krabi: nick("Yay! We're in Krabi!"),
    },
    // Sparkle: the one fact she sees for herself, and a hint after a while with nothing done.
    elephant: "Thailand looks like an elephant's head!",
    hint: {
      belt: 'Tap your suitcase!',
      door: "Tap the plane's door!",
      tray: 'Tap the tray!',
    },
  },

  // The boat trip in Phang Nga Bay (activities/boat-trip/bay/). Daddy and Mommy react in their own voices, short; the
  // village kids share one kid voice; Sparkle gives the few instructions and the facts (each fact also plays when she
  // taps its photo or sticker in the trip album). Kaylee never talks: she giggles.
  bay: {
    // Daddy.
    ribbons: nick('Our longtail boat! Tie on ribbons for good luck!'),
    pai: nick('Pai!'),
    whereTo: nick('Where to, Captain Kaylee?'),
    horn: nick('My horn!'),
    mango: nick('Hey! My mango!'),
    banana: nick('Hey! My banana!'),
    sunglasses: nick('My sunglasses!'),
    pose: nick('Everybody, pose!'),
    cheese: nick('One, two, three, cheese!'),
    backIn: nick('Back in the boat, Kaylee!'),
    // Mommy.
    whoa: ji('Whoa!'),
    hat: ji('My hat!'),
    dizzy: ji('So dizzy!'),
    coconut: ji('A coconut! Got it!'),
    sunset: ji('Look! The sky is turning pink!'),
    // The village kids.
    goal: kids('Goal!'),
    thanks: kids('Khob khun ka, Kaylee!'),
    ball: kids('The ball, Kaylee!'),
    // Sparkle: what to do (only when something is new, or after a while with nothing done).
    hint: {
      ribbon: 'Tap a ribbon to tie it on!',
      garland: 'Now the flowers!',
      drive: 'Put your finger on the water to drive!',
      glow: 'Drive to a golden light!',
      ball: 'Push the ball back with the boat!',
      lie: 'Lie down! The roof is low!',
      pose: 'Tap a pose!',
      pier: 'Drive back to the pier!',
      out: 'Paddle back out to the boat!',
    },
    // Sparkle's facts: the first time a stop comes into view, and again from the album.
    facts: {
      ribbons: 'Thai boats wear ribbons for good luck!',
      longtail: 'A longtail has a car engine on a stick!',
      pai: "Pai means let's go!",
      notch: 'The sea nibbled a notch in the rock!',
      village: 'Houses on stilts, over the sea!',
      football: 'The kids here built a football field that floats!',
      khobkhun: 'Khob khun means thank you!',
      hong: 'Hong means room, a secret room!',
      mangrove: 'Mangrove trees stand on their roots!',
      nail: 'Ko Tapu means Nail Island!',
      buoys: 'Boats stay back so the Nail Island keeps standing!',
    },
    // The album's nine animal stickers, a fact each.
    stickers: {
      needlefish: 'A needlefish! It skips over the water!',
      eagle: 'A sea eagle! It fishes with its feet!',
      macaque: 'A macaque! A cheeky monkey!',
      cat: 'The village cat lives on a boat!',
      crab: 'This crab waves its big claw!',
      mudskipper: 'A mudskipper walks on mud!',
      lizard: 'A monitor lizard swims like a croc!',
      kingfisher: 'A kingfisher! A flash of blue!',
      porpoise: 'This porpoise has no fin on its back!',
    } as Record<string, string>,
  },

  // The boat race (activities/boat-trip/race/): through the rainbow gate in the bay, three laps round a lagoon against
  // the village kids and a cheeky macaque. Sparkle gives the few instructions and the countdown; Mommy and Daddy cheer
  // in their own voices; the kids tease and cheer; the macaque only chatters. She always wins, and the trophy says so.
  race: {
    gate: 'A boat race! Drive through the rainbow gate!',
    start: 'Hold your finger on the water to go fast!',
    count: ['Three!', 'Two!', 'One!', 'Go!'],
    ramp: 'A ramp! Tap in the air for a trick!',
    lap2: 'Lap two!',
    final: 'Last lap!',
    win: `${NAME} wins! First place!`,
    trophy: `A trophy for ${NAME}, the boat race champion!`,
    back: 'Tap the boat to go back to the bay!',
    // The trophy room speaks this when she taps her race trophy (it's saved there).
    trophyRoom: `${NAME}, Boat Race Champion! From Thailand.`,
    // Daddy and Mommy, in the boat with her.
    go: nick('Go, Kaylee, go!'),
    banana: nick('Whoa! A banana!'),
    almost: nick('Almost there!'),
    won: nick('We won!'),
    wheee: ji('Wheee!'),
    proud: ji('You did it, sweetie!'),
    // The village kids, racing her in their blue longtail.
    raceYou: kids('Race you, Kaylee!'),
    catchUs: kids("You can't catch us!"),
    goodRace: kids('Good race, Kaylee!'),
  },

  // Baan Chang Cafe in Krabi (activities/boat-trip/chang/, plan: thailand/baan-chang.html): the sign, the chocolate milk,
  // the boardwalk and the elephants. The elephants don't talk (rumbles, trumpets, squeals); Daddy and Mommy react in
  // their own voices, and Sparkle says the names, what's new, and what to do after a while with nothing done. Daddy's
  // "Where to, Captain Kaylee?", "Everybody, pose!", "One, two, three, cheese!" and "Pai!" are the bay's.
  chang: {
    // Daddy.
    bananas: nick('Bananas for the elephants, Kaylee!'),
    likes: nick('He likes you!'),
    coffee: nick('Ahh! Thank you, Kaylee!'),
    // Mommy.
    look: ji('Look, Kaylee! Elephants!'),
    hiLamyai: ji('Hi, Lamyai!'),
    milk: ji("Hey! That's your chocolate milk!"),
    full: ji('Whoa! Too full!'),
    wet: ji("We're all wet!"),
    // Sparkle: something new.
    arrive: 'Baan Chang means elephant house!',
    drink: "Let's make a chocolate milk!",
    mali: 'Mali means jasmine!',
    khanom: 'Khanom means snack!',
    lamyai: 'Lamyai means a sweet fruit!',
    wants: 'Look! They each want a snack!',
    splash: "They're full! Splash!",
    // At the pier at sunset, Baan Chang still to do.
    waiting: 'The elephants are waiting!',
    // Sparkle, after a while with nothing done.
    hint: {
      fork: 'Elephants or the boat? You pick!',
      cup: 'Tap the cup to make a drink!',
      milk: 'Pour in the milk!',
      choc: 'Squeeze in the chocolate!',
      stir: 'Stir it round and round!',
      straw: 'Pick a straw!',
      go: 'Tap the elephant to go see them!',
      walk: 'Tap the path to walk!',
      hold: 'Grab a banana!',
      want: 'Give them what they want!',
      spray: 'Tap an elephant for a splash!',
      boat: 'Tap the boat to go to the sea!',
    },
    // The tap-to-hear facts: the album's sticker, the stamp screen and the passport.
    facts: {
      trunk: "An elephant's trunk is its nose and its hand!",
      eat: 'Elephants eat almost all day long!',
      nickname: 'In Thailand, everyone has a fun nickname!',
    },
  },

  // The way home (the boat trip's `home`): Aunty Sri's van brings them back to Agong's house, she picks the photo for
  // Agong's wall, and even the big cousins look up from their phones. Then, in the house, the photo on the wall.
  home: {
    sri: by('sri')("We're home, Kaylee!"),
    agong: by('agong')('Did you bring my photo?'),
    thanks: by('agong')('Beautiful! Thank you, Kaylee!'),
    gan: by('gan')('Whoa! Cool!'),
    ken: by('ken')('Whoa!'),
    bb: by('bb')('So cool, Kaylee!'),
    jum: by('jum')('So pretty!'),
    // The frame on the wall, tapped in the house.
    wall: ji('Our boat trip!'),
    // The stamp screen's sticker.
    sticker: 'Fiddler crabs wave hello!',
    // Sparkle, after a while with nothing done.
    pick: 'Pick a photo for Agong!',
    give: 'Tap Agong to give it to him!',
    // At the pier at sunset, nothing done for a while.
    fly: 'Tap the plane to fly home!',
    // The boarding pass on a replay: the whole trip or straight to the boat.
    again: 'Pack again, or go straight to the boat?',
  },

  // The Nan road trip (planning/around-the-world/thailand/nan-trip.html). The stops fill in as each one gets its voices.
  nan: {
    // Kaylee's rice farm under Stop Time Cafe (activities/nan-trip/rice/, plan: thailand/nan-rice.md). Sparkle says what's
    // new at each round and, after a while with nothing done, what to do; Daddy (on the farm) and Mommy (on the deck)
    // react in their own voices. Kaylee never talks: she giggles.
    rice: {
      // Sparkle: each round as it begins (the first one before her first touch).
      plant: `Let's plant rice, ${NAME}! Walk in the water.`,
      dry: 'Rice likes water! Open the gate.',
      grow: 'The birds want the rice! Shoo, shoo!',
      harvest: "It's golden! Time to cut the rice.",
      thresh: 'Bang the rice! The grains fall out.',
      // The first time she pokes the kratip, and the view from the deck (tap-to-hear facts).
      sticky: 'In Nan, people eat sticky rice with their fingers!',
      steps: 'The steps on the hill keep the water for the rice!',
      // Sparkle, after a while with nothing done.
      hint: {
        plant: 'Walk through the water to plant!',
        gate: 'Tap the gate to let the water in!',
        grow: 'Walk to the birds!',
        harvest: 'Walk through the golden rice!',
        thresh: 'Tap to bang the rice!',
        eat: 'Tap the sticky rice!',
        photo: 'Tap Mommy for a photo!',
      },
      // Daddy on the farm.
      planted: nick('Look at those rows, Kaylee!'),
      farm: nick('Our very own rice farm!'),
      wet: nick("Hey! I'm all wet!"),
      hat: nick('A straw hat! Thank you!'),
      muddy: nick('A muddy unicorn!'),
      flop: nick('Ha! Into the straw!'),
      rain: nick('Rain! The rice loves it!'),
      fat: nick('That bird ate too much!'),
      where: nick('Kaylee? Where did you go?'),
      lots: nick('Look at all that rice!'),
      bang: nick('Whack! Good one!'),
      coffee: nick('Mmm, coffee.'),
      // Tap Daddy on the farm (in turn).
      tap: [nick('Go, farmer Kaylee!'), nick('Splish, splash!'), nick('Daddy is watching!')],
      // Mommy on the deck.
      hi: ji('Sticky rice from your farm!'),
      smile: ji(`Smile, ${NAME}!`),
      // The rice farm's video, after Mommy's photo on the deck (rice/video.ts).
      video: `Want to see real rice grow, ${NAME}?`,
    },
  },

  // The mall day at ICONSIAM (activities/mall-trip/, plan: thailand/mall-trip.md). Talk short, play long: Sparkle's one
  // line when a mini game opens (and when something new starts, or after a while with nothing touched), the family's
  // and the friends' short reactions in their own voices (the monkey coach, the HarborLand staff, the pizza server, the
  // kids). Kaylee never talks: she giggles. One block per part, so each can be filled on its own.
  mall: {
    // HarborLand's hall (hall/).
    hall: {
      // Sparkle, the first time she comes in (not coming back out of a mini game).
      welcome: `Welcome to HarborLand, ${NAME}! Tap a place to play!`,
      // The staff (a buffalo and a penguin), the first two times she comes near one, and when she taps them (in turn).
      staff: [by('staff')(`Sawasdee ka, ${NAME}!`), by('staff')('Have fun!')],
      // Mommy on her bench and Daddy following her round, when she taps them (in turn).
      ji: [ji('Hi, sweetie!'), ji(`Have fun, ${NAME}!`), ji('Mommy is right here!')],
      nick: [nick('Where to next, Kaylee?'), nick('Daddy is coming too!'), nick('Ho ho! Go play!')],
      // Daddy's tummy rumbles (and again if she taps him while it does), then Mommy's card, and her answer to More play.
      tummy: nick('My tummy is rumbling!'),
      pizza: ji('Hungry, Kaylee? Pizza time?'),
      more: ji('OK! A little more!'),
      // Sparkle, when the finger shows after a while with nothing touched.
      hint: 'Tap a door to play!',
    },

    // The Vet Clinic (games/vet/). Daddy welcomes Doctor Kaylee; Sparkle says who's coming in. The patients only bark,
    // whinny and trumpet; Daddy hams it up when the tools land on him (at most one line every 12 s).
    vet: {
      open: nick(`Doctor ${NAME} is here!`),
      // Sparkle, as each patient hops in.
      patient: {
        puppy: 'A puppy with a sore paw! Grab a tool!',
        pony: 'A muddy pony! Bath time!',
        elephant: 'A baby elephant with a sniffly trunk!',
      } as Record<string, string>,
      // The elephant's big sneeze.
      bless: nick('Bless you!'),
      // Daddy, as each patient is all better.
      healed: {
        puppy: nick("Look! He's wagging!"),
        pony: nick('So shiny and pretty!'),
        elephant: nick('Bye bye, little elephant!'),
      } as Record<string, Line>,
      // Sparkle, when all three are better.
      allDone: `Everyone is better! Thank you, Doctor ${NAME}!`,
      // Daddy, when a tool lands on him.
      daddy: {
        heart: [nick('Ba-boom! Ba-boom!'), nick('My heart is so big!')],
        hot: nick('Am I hot? Ha ha!'),
        tickles: nick('Hey! That tickles!'),
        bow: nick('Do I look pretty?'),
        yucky: nick('Bleh! Yucky!'),
        honk: nick('Honk! Ha ha!'),
      },
      // Sparkle, when the 👆 shows (nothing touched for a while): the next thing the patient needs.
      hint: {
        heart: 'Listen to its heart!',
        temp: 'The thermometer goes in its mouth!',
        thorn: 'Pull out the thorn with the tweezers!',
        cream: 'Rub cream on the sore paw!',
        bandage: 'Wrap a bandage round the paw!',
        soap: 'Rub on lots of soap!',
        rinse: 'Shower it with water!',
        dry: 'Dry it with the towel!',
        brush: 'Brush the mane!',
        bow: 'Put a bow on top!',
        medicine: 'Give it the medicine spoon!',
        tissue: 'A tissue for its trunk!',
      } as Record<string, string>,
      // Sparkle's facts, the first time she pokes the thing.
      facts: {
        elephant: "The elephant is Thailand's animal!",
        xray: 'An x-ray shows the bones inside!',
      },
    },

    // The Barber Salon (games/barber/). Daddy wants a new look; Sparkle says what's new each round; the kids in round 3
    // ask for a picture and say "close enough!" whatever she makes; Mommy takes the photo at every reveal.
    barber: {
      open: nick(`I want a new look, ${NAME}!`),
      start: 'Grab a tool and do his hair!',
      // Round 2's new tools, round 3's kids.
      colors: 'Now colors and the hair dryer!',
      copy: 'Copy the picture!',
      // Each kid, as they sit down with their picture card.
      ask: {
        spiky: by('kid')('Spiky, please!'),
        pigtails: by('kid')('Pigtails, please!'),
        curly: by('kid')('Curly, please!'),
      } as Record<string, Line>,
      // The mirror glows: time for the reveal.
      mirror: 'Tap the mirror!',
      // The reveal: Daddy poses (in turn), the kids giggle, Mommy takes the photo.
      love: [nick('Whoa! I love it!'), nick('So handsome! I love it!')],
      enough: [by('kid')('Close enough!'), by('kid')('Close enough! So pretty!'), by('kid')('Close enough! Yay!')],
      cheese: ji('Say cheese!'),
      allDone: `Great haircuts, ${NAME}!`,
      // The silly bits, in Daddy's and Mommy's voices.
      horn: nick('Hey! My horn!'),
      brows: nick('My eyebrows!'),
      windy: ji('Whoa! My hair!'),
      // Sparkle, when the 👆 shows: a tool she hasn't tried yet.
      hint: {
        tonic: 'Squirt the grow tonic on his hair!',
        scissors: 'Snip, snip with the scissors!',
        comb: 'Comb it up for spikes!',
        spray: 'Spray on some colors!',
        dryer: 'Try the hair dryer!',
        bow: 'Put in a bow!',
        clip: 'Put in a clip!',
      } as Record<string, string>,
      // Sparkle's fact, the first time she pokes the pole.
      pole: 'A spinning pole means haircuts here!',
    },

    // Cafe & Cake (games/cafe/). Sparkle says what to do when something new comes; Daddy and Mommy order and drink in
    // their own voices (one line per drink); Daddy's brain freeze and the ceiling splat get a laugh.
    cafe: {
      open: 'Drop fruit in the blender!',
      thirsty: nick(`I'm thirsty, ${NAME}!`),
      // The first time in a round: the button, then the pour.
      button: 'Press the pink button!',
      pour: 'Lift the jar and pour it in the cup!',
      // Round 2's picture orders; round 3's Thai drinks.
      orders: 'Make the drink in the bubble!',
      pink: nick('Pink, please!'),
      yellow: ji('Yellow, please!'),
      thai: 'Thai drinks! Two cups at once!',
      chaYen: nick('Cha yen, please!'),
      // They drink it: a yum for a match (or for anything in round 1), a happy surprise for anything else.
      yum: {
        nick: [nick(`Yum! Thank you, ${NAME}!`), nick('Mmm! Just right!')],
        ji: [ji('Delicious, sweetie!'), ji('Mmm! Yummy!')],
      } as Record<string, Line[]>,
      funny: {
        nick: nick('A funny color! But yum!'),
        ji: ji('Surprise! Yummy!'),
      } as Record<string, Line>,
      freeze: nick('Brrr! Brain freeze!'),
      // The lid was off.
      splat: nick('Splat! Ha ha!'),
      // The pokeables, now and then.
      coffee: nick('My coffee! Thank you!'),
      teaCup: ji('Khob khun ka, sweetie!'),
      allDone: `Best cafe ever, ${NAME}!`,
      // Sparkle, when the 👆 shows: the next thing to do.
      hint: {
        straw: 'Put a straw in the cup!',
        milk: 'Pour the milk on top!',
        jar: 'Lift the jar and pour!',
        button: 'Press the pink button!',
        fruit: 'Drop some fruit in!',
        want: 'Drop in the fruit from the bubble!',
        tea: 'Put in the Thai tea!',
      },
      // Sparkle's fact, the first time she pokes the Thai tea.
      chaYenFact: "Cha yen is Thai iced tea! It's orange!",
    },

    // The Racing Slide (games/race/). Sparkle says what's new each race and counts down; Daddy races her and dives
    // into the balls head first; she always wins.
    race: {
      open: `A slide race, ${NAME}! Tap the steps to climb!`,
      raceYou: nick(`Race you, ${NAME}!`),
      count: ['Three!', 'Two!', 'One!', 'Go!'],
      // The first time something new comes: tap to scoot, tap at a bump, the rubber rings.
      scoot: 'Tap, tap, tap to go fast!',
      bumps: 'Now tap at each bump to fly!',
      now: 'Tap now!',
      rings: 'Rubber rings! Tap to spin!',
      // She wins (in turn); Daddy lands head first; a kid cheers.
      win: [`${NAME} wins!`, `${NAME} wins again!`, `First place, ${NAME}!`],
      dive: [nick('Head first! Whee!'), nick("I'm OK! Ha ha!")],
      goodRace: by('kid')(`Good race, ${NAME}!`),
      allDone: `Three ribbons for ${NAME}!`,
      // Sparkle, when the 👆 shows.
      hint: {
        climb: 'Tap the steps to climb!',
        race: 'Tap to scoot faster!',
      },
    },

    // Little Land's foam blocks (games/blocks/).
    blocks: {
      // The opening: Daddy's bet, then Sparkle.
      higher: nick(`Can you build higher than me, ${NAME}?`),
      grab: 'Grab a brick!',
      // Something new: the stack glows (round 1), the picture cards (round 2), Daddy steps up (round 3).
      push: 'Push it over!',
      copy: 'Copy the picture!',
      elephant: 'Now an elephant!',
      taller: 'Taller than Daddy!',
      // Daddy, now and then: a brick half over the edge, a brick hat, a knock-down, the elephant coming alive.
      whoa: nick('Whoa! Careful!'),
      hat: nick('A brick hat? Ha ha!'),
      crash: [nick('Crash!'), nick('Ha ha! Again!'), nick('Boom!')],
      trunk: nick('Wow! An elephant!'),
      // Round 3: his sneeze at every tall tower, then (the first time) he gives in.
      sneeze: nick('Ah... ah... choo!'),
      beat: nick(`Taller than me, ${NAME}!`),
      // Sparkle, when the finger shows after a while with nothing touched.
      hint: {
        box: 'Grab a brick from the box!',
        card: 'Put a brick on the picture!',
        tower: 'Tap the tower to push it!',
      },
      // The fact: when the chedi gets its spire, or the first time she pokes its card.
      chedi: 'A chedi is a Thai temple tower!',
    },

    // The Golden Mountain (games/mountain/).
    mountain: {
      // The opening (Sparkle).
      climb: `Climb the Golden Mountain, ${NAME}! Count the holds!`,
      // The count, one number as each hold pops (up to round 3's seven).
      count: ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!'],
      // Something new: on top the first time, round 2's pink holds, round 3's race.
      top: `You made it, ${NAME}!`,
      pink: 'Only the pink ones!',
      race: 'Race Daddy to the top!',
      // Daddy's race: the start, puffing up behind her, flopping over the rail, his head-first landing.
      win: nick("I'm going to win!"),
      huff: nick('Huff... puff...'),
      beat: nick(`You beat me, ${NAME}!`),
      whoa: nick('Whoa-oa-oa!'),
      // Sparkle, when the finger shows after a while with nothing touched.
      hint: {
        hold: 'Grab a glowing hold!',
        pink: 'Grab a pink one!',
        bell: 'Ring the bell!',
        slide: 'Down the slide!',
      },
      // The facts: the first bell, the first monkey she pokes.
      mount: 'In Bangkok, the Golden Mount has over 300 steps!',
      monkeys: 'In Lopburi, monkeys live all over town!',
    },

    // Muay Thai (games/boxing/).
    boxing: {
      // The opening, the wai kru: the coach, then Sparkle.
      hello: by('coach')(`Sawasdee krap, ${NAME}! First we say thank you.`),
      bow: 'Tap your gloves to bow!',
      // The coach: after the three bows, after rounds 1 and 2, with the gold belt.
      dance: by('coach')('Now dance with me!'),
      again: by('coach')('Yes! Again!'),
      champion: by('coach')(`Champion ${NAME}!`),
      // Sparkle: something new (the drum, round 2's gold ring, Daddy's pad, the kick).
      drum: 'Punch to the drum!',
      gold: "Punch when it's gold!",
      pad: "Follow Daddy's pad!",
      kick: 'Big kick!',
      // Daddy, now and then: a hook or a big POW, the pad going low, into the ropes, up with the pad again.
      strong: nick('Ooh, strong!'),
      oof: nick(`Oof! Good one, ${NAME}!`),
      upDown: nick('Up high! Down low!'),
      ropes: nick('Whoa-oa-oa!'),
      hit: nick('Hit the pad!'),
      // Sparkle, when the finger shows after a while with nothing touched.
      hint: {
        gloves: 'Tap your gloves!',
        bag: 'Punch the bag!',
        pad: "Punch Daddy's pad!",
      },
      // The facts: the first time she pokes the coach, and the star board.
      waiKru: by('coach')('The wai kru dance says thank you to your teacher!'),
      sport: "Muay Thai is Thailand's own sport!",
    },

    // The Sky Pod (games/skypod/).
    skypod: {
      // The opening: Daddy, then Sparkle.
      fast: nick(`How fast are you, ${NAME}?`),
      slap: 'Slap the lights!',
      // The count as her score climbs (rounds 1 and 3).
      count: ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!', 'Eight!', 'Nine!', 'Ten!'],
      // Round 2: before the wall plays, then her turn (the first time).
      listen: 'Listen!',
      play: 'Now you play it!',
      // Round 3, Daddy: the race, she took his light, a miss, a rest, she wins.
      race: nick(`Race you, ${NAME}!`),
      mine: nick("Hey! That one's mine!"),
      ow: nick('Ow, ow!'),
      rest: nick('Daddy needs a rest!'),
      win: nick(`You win, ${NAME}!`),
      // The finale: the score at a hundred.
      hundred: `A hundred! Super star, ${NAME}!`,
      // Sparkle, when the finger shows after a while with nothing touched.
      hint: {
        lit: 'Slap the glowing one!',
        next: 'This one next!',
      },
      // The fact: the first time she pokes the scoreboard.
      thai: 'In Thai, one, two, three is nueng, song, saam!',
    },

    // The Big Frame (harborland/).
    frame: {
      // Sparkle, as she comes in.
      start: 'Climb up high, then slide down!',
      // Mommy and Daddy, the first time she rides each big slide.
      ride: {
        nose: ji('Wheee! Down the nose!'),
        dragon: nick('Whoa! Here come the dragons!'),
        roller: ji('Rattle rattle! Wheee!'),
        donut: nick('Round and round!'),
        zip: ji('Zoom! Go, Kaylee!'),
      },
      // Daddy in the ball pit and the cannon: the first two bonks (in turn), then his big flop.
      bonk: [nick('Bonk! Hey!'), nick('Hey! Not my horn!')],
      flop: nick('Whoa! Splash!'),
      // Daddy tapped in the balls (in turn); Mommy tapped says her hall lines.
      nick: [nick('Ho ho! Hi, Kaylee!'), nick('Bonk me with the cannon!')],
      // Sparkle's fact, the first time she pokes the giant mask or a Phi Ta Khon on the roller's posts.
      phiTaKhon: 'Phi Ta Khon is a festival with big funny masks!',
      // Sparkle, when the finger shows after a while with nothing touched.
      hint: 'Tap a slide to ride it!',
    },

    // The Pizza Company (pizza/).
    pizza: {
      // Sparkle at the menu; the server sets the pizza down; Sparkle's one instruction.
      menu: `Pick a pizza, ${NAME}!`,
      served: by('server')('Pizza time!'),
      start: 'Pull a slice!',
      // Sparkle counting round the table, as each plate gets its first and second slice.
      count: {
        ji: ['One for Mommy!', 'Two for Mommy!'],
        nick: ['One for Daddy!', 'Two for Daddy!'],
        kaylee: [`One for ${NAME}!`, `Two for ${NAME}!`],
      } as Record<string, string[]>,
      // Daddy with more than anyone (in turn), the cheese tug on his nose.
      ham: [nick("Kaylee, Mommy's hungry too!"), nick('Ho ho! More for Daddy!')],
      nose: nick('My nose!'),
      // Two each: the last two go in Agong's box; the lid closes; then Sparkle's fact once it's all shared.
      agong: ji('Those are for Agong!'),
      closed: nick('Yay! Pizza for Agong!'),
      fair: 'Sharing fairly means everyone gets the same!',
      // The pokes: the server's bow, Daddy's chili sneeze, Mommy's onion-ring bracelets (three in turn, then she eats one).
      thanks: by('server')('Khob khun ka!'),
      spicy: nick('So spicy!'),
      rings: [ji('Look! A bracelet!'), ji('So fancy!'), ji('Three bracelets!')],
      crunch: ji('Mmm! Crunchy!'),
      // Sparkle, when the finger shows after a while with nothing touched (or the menu waits).
      hint: {
        menu: 'Tap a pizza!',
        slice: 'Pull a slice to a plate!',
        box: "Put one in Agong's box!",
      },
    },

    // The trip around it: Mommy's question, the goodbye, the Veloz, ICONSIAM, the counter, home.
    trip: {
      // Mommy's card in the house, once there are two trips (🚤 or 🛝🍕).
      where: ji(`${NAME}, where shall we go?`),
      // The goodbye and home, at Agong's house (TripHouse reads them from the TripDef: activities/mall-trip/words.ts).
      wish: by('agong')('Bring Agong something yummy!'),
      ready: nick(`Mommy is driving! Hop in, ${NAME}!`),
      home: ji("We're home!"),
      agong: by('agong')(`Ho ho! What is that, ${NAME}?`),
      thanks: by('agong')(`Pizza! Thank you, ${NAME}!`),
      pizza: { gan: by('gan')('Pizza?!'), ken: by('ken')('Pizza?!'), bb: by('bb')('Pizza?!') },
      hair: by('agong')("Ho ho ho! Look at Daddy's hair!"),
      give: 'Tap Agong to give him the box!',
      wall: ji('Our mall day!'),
      // ICONSIAM: the glimpse, the lift and the HarborLand counter (arrive.ts).
      arrive: {
        here: ji('ICONSIAM! By the river!'),
        lift: 'Press the big button!',
        six: nick('Floor six! HarborLand!'),
        counter: by('staff')('Welcome to HarborLand! Socks on, please!'),
        shoes: nick('My shoes are too big!'),
        socks: by('staff')('Pick your socks!'),
        stretch: nick('My socks are too small!'),
        tall: by('staff')('Wow, so tall!'),
        horn: by('staff')('Ha ha! Off the top!'),
        gate: 'In you go!',
      },
      // The stamp screen's sticker, and the tap-to-hear facts there and on the passport (trip/facts.ts MALL_FACTS).
      sticker: 'Pizza slice sticker! Stretchy cheese!',
      facts: {
        iconsiam: 'ICONSIAM is by the Chao Phraya river!',
        socks: 'At HarborLand, everyone wears grip socks!',
        phiTaKhon: 'Phi Ta Khon is a festival with big funny masks!',
        lopburi: 'Lopburi is a town full of monkeys!',
        goldenMount: 'The Golden Mount is a temple on a hill in Bangkok!',
        sharing: 'Sharing fairly means everyone gets the same!',
        waiKru: 'Muay Thai boxers dance the wai kru to thank their teacher!',
        chaYen: "Cha yen is Thai iced tea. It's orange!",
        elephant: "The elephant is Thailand's animal!",
      },
    },
  },
}
