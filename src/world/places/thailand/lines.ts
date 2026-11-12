// Every phrase that can be spoken in Thailand. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports only sdk/device.ts, which imports nothing.)
// Thailand's friends are Kaylee's own family, as animal characters (planning/around-the-world/thailand.md). Sparkle
// guides (plain strings); the family say hello in their own voices (cast.json), with the Thai hello: Sawasdee, ending
// in "ka" from the women and "krub" from the men. Straight apostrophes only: curly ones failed the transcription check
// in PR #63.
import { onDevice } from '../../../sdk/device.ts'

type Line = string | { text: string; voice: string }
const by = (voice: string) => (text: string) => ({ text, voice })

const nick = by('nick')
const ji = by('ji')
const lung = by('lung')
const kids = by('kids')
// Koh Samet's islanders (activities/samet-trip/cast.ts): the gecko fire dancers Tuk and Kae, the jet ski man (an
// otter), the boat captain (a pelican) and the green taxi's driver (a sun bear).
const tuk = by('tuk')
const kae = by('kae')
const otter = by('otter')
const pelican = by('pelican')
const sunbear = by('sunbear')

/** One line for each thing a look can change, in order: hat, glasses, wings, outfit, shoes, paint. */
const notice = (say: (text: string) => Line, texts: string[]) => Object.fromEntries(['head', 'face', 'back', 'outfit', 'feet', 'paint'].map((k, i) => [k, say(texts[i])]))

/** A cousin at the game table: what they say sitting down, before a roll (in turn), on a nap, a ladder, a slide, a win,
 *  losing, and getting up. */
const cousin = (voice: string, t: { sit: string; roll: string[]; nap: string; ladder: string; slide: string; win: string; lose: string; bye: string }) => {
  const s = by(voice)
  return { sit: s(t.sit), roll: t.roll.map(s), nap: s(t.nap), ladder: s(t.ladder), slide: s(t.slide), win: s(t.win), lose: s(t.lose), bye: s(t.bye) }
}

/** Each person's first hello, then what they say each time after (in turn). */
const hello = (voice: string, hi: string, again: string[]) => ({ hi: by(voice)(hi), again: again.map(by(voice)) })

export const L = {
  // The shell's trophy ceremony and the trophy room speak these.
  trophyWin: `You did it! You won the Thailand Explorer trophy!`,
  trophyRoom: `Thailand Explorer! From Thailand.`,
  passport: onDevice('This is Thailand! Tap a picture to explore.', 'This is Thailand! Click a picture to explore.'),
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
    arrive: `We're at Agong's house in Thailand!`,
    door: onDevice('Tap the door to go inside!', 'Click the door to go inside!'),
    inside: onDevice('Tap your family to say hello!', 'Click your family to say hello!'),
    // The first time she rattles the closed bathroom door.
    bathroom: "That door's closed!",
    stuck: {
      street: onDevice('Tap the door to go inside!', 'Click the door to go inside!'),
      downstairs: onDevice('Tap the stairs to go up to your room!', 'Click the stairs to go up to your room!'),
      upstairs: 'Bounce on the bed!',
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

  // The game table in Kaylee's room (activities/hub/board-games/, plan: thailand/game-table.md). Sparkle says how to
  // play the first time she opens each game in a visit (tap Sparkle to hear it again), and the rule of the 4 the first
  // time a unicorn naps. The cousin across the table talks in their own voice, now cheerful and playing (cast.json's
  // bbplay, ganplay, kenplay: the same voices, off their phones): sitting down, now and then before a roll, on a nap, a
  // ladder or a slide, and when someone wins. Never after every move.
  games: {
    // The picker opens (once a visit).
    pick: 'Pick a game and a cousin!',
    // After ▶ in the Unicorn game: the four unicorn pieces (once a visit).
    color: 'What color do you want your unicorn to be?',
    // A game starts (once a visit each); also Sparkle's hint when she waits on her turn.
    howto: {
      unicorn: onDevice('Tap the die! Race to the castle!', 'Click the die! Race to the castle!'),
      candy: onDevice('Tap the cards! Hop to that color!', 'Click the cards! Hop to that color!'),
      chutes: onDevice('Tap the die! Ladders up, slides down!', 'Click the die! Ladders up, slides down!'),
    },
    // When the first picture card is revealed (once a visit), while its matching space glows.
    picture: 'Match the sweet—even backwards!',
    // The first time a unicorn rolls a 4 and naps (once a visit).
    nap: 'A four! Time for a little nap.',
    // Her first win in a visit; after that the cousin says well done (without a cousin, Sparkle's others in turn).
    won: 'You won!',
    wonAgain: ['Yay! You did it!', 'Winner winner!'],
    // The cousin across the table: sitting down; before a roll now and then (in turn); their own nap, ladder and slide;
    // their win; losing to her; getting up.
    cousins: {
      bb: cousin('bbplay', { sit: "Yay, let's play!", roll: ['My turn!', 'Come on, six!'], nap: 'Nap time!', ladder: 'Up I go!', slide: 'Wheee!', win: 'I won! Again?', lose: 'You won! Good game!', bye: 'Fun game!' }),
      gan: cousin('ganplay', { sit: "Okay, I'm in!", roll: ['Here goes!', 'Big number!'], nap: 'Aw, sleepy!', ladder: 'Ladder! Yes!', slide: 'Nooo! Wheee!', win: 'I won! One more?', lose: 'Nice one, you won!', bye: 'Good game!' }),
      ken: cousin('kenplay', { sit: "Let's play!", roll: ['My go!', 'Lucky roll!'], nap: 'Snooze time!', ladder: 'Up, up, up!', slide: 'Whoa! Wheee!', win: 'Ha! I won!', lose: 'You got me! Good game!', bye: 'See you!' }),
    },
  },

  // The family (their voices in cast.json; their animals in characters/looks.ts).
  // Sparkle on the Thailand map (activities/hub/map/): the welcome (once a visit; after that the pins only glow), and
  // something true the first time she taps each thing on the map.
  map: {
    hello: onDevice('This is Thailand! Tap a picture to explore.', 'This is Thailand! Click a picture to explore.'),
    pokes: {
      elephant: 'Elephants live in the north of Thailand!',
      clouds: "It rains a lot in Nan's mountains!",
      gibbon: 'Gibbons swing through the jungle! Whoop whoop!',
      buffalo: 'Water buffalo help on the rice farms!',
      hornbill: 'A hornbill! Look at its big beak!',
      tuktuk: 'A tuk-tuk! Tuk tuk tuk!',
      dolphins: 'Dolphins swim in the Gulf of Thailand!',
      boat: 'A longtail boat! Its motor has a long tail!',
      palm: 'Coconuts grow on palm trees by the sea!',
    } as Record<string, Line>,
  },

  family: {
    agong: hello('agong', `Sawasdee krub! Welcome home!`, ['Come, sit with Agong.', 'Ho ho! My little unicorn!']),
    ji: hello('ji', 'Hi sweetie! This is our room!', ['Bounce on the mattress!', `I love you!`]),
    nick: hello('nick', "Hi! Welcome to Agong's house!", ['High five!', "Let's go inside!"]),
    jum: hello('jum', `Sawasdee ka! Are you hungry?`, ['The rice is almost ready!', `So big now!`]),
    joy: hello('joy', `Sawasdee ka! Look at Agong's treasures!`, ['The lucky cat says hi!', 'Hee hee! Hi again!']),
    bird: hello('bird', `Sawasdee krub!`, ['Want to sit on my motorbike?', 'Beep beep!']),
    gan: hello('gan', 'Mm-hmm. Hi.', ["One sec, I'm winning!", 'Uh-huh...']),
    ken: hello('ken', 'Oh. Hi.', ['Look, a funny video!', 'Mm-hmm...']),
    bb: hello('bb', 'Hi... one second.', ['So cute.', 'Uh-huh!']),
    ja: hello('ja', `Sawasdee ka!`, ['Big smile for the photo!']),
    sri: hello('sri', `Sawasdee ka!`, ['Say cheese!']),
    putto: hello('putto', `Sawasdee krub!`, ["Let's play!"]),
    putter: hello('putter', 'Hi! Hee hee!', ['Peep peep!']),
  } as Record<string, { hi: Line; again: Line[] }>,

  // Mom's and Dad's normal greetings refer to the room or going inside.
  familyPhoto: { ji: ji(`I love you!`), nick: nick('High five!') },

  // Kaylee's wardrobe in her room (activities/hub/wardrobe/, plan: thailand/wardrobe.md). Sparkle says what to do the
  // first time and the name of each thing the first time she touches it; the family notice her new look in their own
  // voices (activities/hub/notice.ts).
  wardrobe: {
    open: `Your wardrobe! Dress up!`,
    // The first drawer she pulls out (the paint drawer says its own).
    drawer: `Drag it onto you!`,
    paint: 'Hair, dress or fur!',
    // The mirror takes a picture of her look and pins it to the door; a picture dropped on her puts the whole look on.
    photo: `Click! A picture of your look!`,
    look: `Your whole look! Wow!`,
    // Sparkle's wand: a surprise look, a different one each tap (in turn).
    wand: ['Ta da! Magic!', 'Sparkle magic!', 'Ooh, a surprise!', 'Whoosh! A new look!'],
    // Silly, never wrong.
    silly: { shoe: 'A shoe on your head! Hee hee!', glasses: 'Glasses on your tail! Hee hee!', mirror: 'Splat on the mirror! Hee hee!' },
    // The first time she touches each thing (by item id; `pot-` and the color for the paint).
    names: {
      crown: 'A crown!',
      tiara: 'A tiara!',
      orchid: 'An orchid crown!',
      bow: 'A big bow!',
      bunny: 'Bunny ears!',
      kitty: 'Cat ears!',
      cap: 'A baseball cap!',
      cowboy: 'A cowboy hat!',
      bucket: 'A bucket hat!',
      sunhat: 'A sun hat!',
      hearts: 'Heart sunglasses!',
      stars: 'Star sunglasses!',
      round: 'Round glasses!',
      fairy: 'Fairy wings!',
      wings: 'Unicorn wings!',
      cape: 'A princess cape!',
      backpack: 'A bunny backpack!',
      tutu: 'A twirly tutu!',
      gown: 'A princess gown!',
      overalls: 'Overalls!',
      'chut-thai': 'Chut thai, a Thai dress!',
      sneakers: 'Light-up sneakers!',
      party: 'Party shoes!',
      boots: 'Rain boots!',
      sandals: 'Sandals!',
      'pot-pink': 'Pink paint!',
      'pot-lilac': 'Lilac paint!',
      'pot-mint': 'Mint paint!',
      'pot-sky': 'Sky blue paint!',
      'pot-butter': 'Butter yellow paint!',
      'pot-peach': 'Peachy orange paint!',
      'pot-brown': 'Brown paint!',
      'pot-cream': 'Cream paint!',
    } as Record<string, string>,
    // The family notice her look the first time she walks up to them in it (hat, glasses, wings, outfit, shoes, paint),
    // once per change. Mom: a crown has its own line; Dad: so do wings.
    notice: {
      ji: notice(ji, [`Ooh, what a pretty hat!`, `Ooh, fancy glasses!`, `Ooh, so pretty!`, `Ooh, what a pretty outfit!`, `Ooh, nice shoes!`, `Ooh, new colors!`]),
      nick: notice(nick, ['Wow, cool hat!', 'Cool shades!', 'Whoa, cool!', 'Whoa, what an outfit!', 'Cool shoes!', 'Whoa, new colors!']),
      agong: notice(by('agong'), ['Ho ho! So pretty!', 'Ho ho! So fancy!', 'Ho ho! So pretty!', 'Ho ho! So pretty!', 'Ho ho! Nice shoes!', 'Ho ho! New colors!']),
      jum: notice(by('jum'), [`Oh! What a pretty hat!`, 'Oh! So fancy!', 'Oh! So pretty!', 'Oh! What a pretty outfit!', 'Oh! Nice shoes!', 'Oh! I love the colors!']),
      joy: notice(by('joy'), ['Wow! I love your hat!', 'Wow! Fancy glasses!', 'Wow! So cute!', 'Wow! What an outfit!', 'Wow! Cute shoes!', 'Wow! New colors!']),
      bird: notice(by('bird'), ['Nice hat!', 'Nice glasses!', 'Ho ho! Nice!', 'Nice outfit!', 'Nice shoes!', 'Ho ho! New colors!']),
      gan: notice(by('gan'), ['Nice hat... one sec.', 'Cool glasses... uh-huh.', 'Cool... uh-huh.', 'Nice outfit... uh-huh.', 'Nice shoes... one sec.', 'New colors... cool.']),
      ken: notice(by('ken'), ['Oh. Nice hat.', 'Oh. Cool glasses.', 'Oh. Nice.', 'Oh. Nice outfit.', 'Oh. Nice shoes.', 'Oh. New colors.']),
      bb: notice(by('bb'), ['So cute... one sec.', 'Cute glasses... uh-huh.', 'So cute... one sec.', 'Cute outfit... uh-huh.', 'Nice shoes... one sec.', 'Cute colors... uh-huh.']),
      ja: notice(by('ja'), ['So pretty!', 'So fancy!', 'So pretty!', 'What a pretty outfit!', 'What cute shoes!', 'So pretty, new colors!']),
      sri: notice(by('sri'), ['Lovely hat! Say cheese!', 'Lovely glasses! Say cheese!', 'Lovely! Say cheese!', 'Lovely outfit! Say cheese!', 'Lovely shoes! Say cheese!', 'Lovely colors! Say cheese!']),
      putto: notice(by('putto'), ['Cool hat!', 'Cool glasses!', 'Cool!', 'Cool outfit!', 'Cool shoes!', 'Cool colors!']),
      putter: notice(by('putter'), ['Look, a hat!', 'Look, glasses!', 'Look, so cute!', 'Look, new clothes!', 'Look, new shoes!', 'Look, new colors!']),
    } as Record<string, Record<string, Line>>,
    noticeItem: {
      ji: {
        crown: ji(`Ooh, a crown!`),
        fairy: ji(`Ooh, you can fly!`),
        wings: ji(`Ooh, you can fly!`),
        cape: ji(`Ooh, a princess cape!`),
        backpack: ji(`Ooh, a bunny backpack!`),
        overalls: ji(`Ooh, cute overalls!`),
      },
      nick: { fairy: nick('Cool wings!'), wings: nick('Cool wings!') },
    } as Record<string, Record<string, Line>>,
  },

  // The boat trip's way there (trip/legs/): Mom asks, packing, the goodbye, the airport, the window seat. Each line
  // is said once, for something new (or a hint after a while with nothing done). The officer and the flight attendant
  // are background figures with a line or two each. Kaylee never talks: she giggles.
  trip: {
    ask: {
      question: ji('Are you ready to go on a trip?'),
      later: ji('OK! Tell me when!'),
      // The house only offers the mall now (the other trips start on the Thailand map).
      mall: ji('Shall we go to the mall?'),
      // Dad on the street, when she taps him (the hub's quick way to a trip).
      daddy: {
        question: nick(`Ready for a trip?`),
        where: nick(`Where do you want to go?`),
        later: onDevice(nick('OK! Just tap me!'), nick('OK! Just click me!')),
        mall: nick('Want to go to the mall?'),
      },
    },
    pack: {
      start: onDevice(ji('Tap your things to pack them!'), ji('Click your things to pack them!')),
      close: onDevice(ji('All packed? Tap the suitcase!'), ji('All packed? Click the suitcase!')),
      hint: ji("It's hot and sunny at the sea!"),
      hungry: ji('Pack some more!'),
      full: ji("It's too full! Sit on it!"),
      gan: by('gan')('Five more minutes...'),
      pillow: ji('Yawn... so sleepy!'),
      fan: ji('The fan blew it open!'),
      sunscreen: ji('Mom always packs sunscreen!'),
      hat: ji("Here's Mom's spare sun hat!"),
      // Her own shady hat (the cap, the cowboy hat...) is a good sun hat: no spare.
      goodHat: ji('Good hat!'),
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
      plane: onDevice(nick('Our plane! Tap the door!'), nick('Our plane! Click the door!')),
    },
    plane: {
      belt: ji('Seatbelt on!'),
      wheee: ji('Whee! Up we go!'),
      tray: ji('Tray down, then press the button!'),
      snack: by('attendant')('Snacks for you!'),
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
      belt: onDevice('Tap your suitcase!', 'Click your suitcase!'),
      door: onDevice("Tap the plane's door!", "Click the plane's door!"),
      tray: onDevice('Tap the tray!', 'Click the tray!'),
    },
  },

  // The boat trip in Phang Nga Bay (activities/boat-trip/bay/). Dad and Mom react in their own voices, short; the
  // village kids share one kid voice; Sparkle gives the few instructions and the facts (each fact also plays when she
  // taps its photo or sticker in the trip album). Kaylee never talks: she giggles.
  bay: {
    // Dad.
    ribbons: nick('Our longtail boat! Tie on ribbons for good luck!'),
    pai: nick('Pai!'),
    whereTo: nick('Where to, Captain?'),
    horn: nick('My horn!'),
    mango: nick('Hey! My mango!'),
    banana: nick('Hey! My banana!'),
    sunglasses: nick('My sunglasses!'),
    pose: nick('Everybody, pose!'),
    cheese: nick('One, two, three, cheese!'),
    backIn: nick('Back in the boat!'),
    // Mom.
    whoa: ji('Whoa!'),
    hat: ji('My hat!'),
    dizzy: ji('So dizzy!'),
    coconut: ji('A coconut! Got it!'),
    sunset: ji('Look! The sky is turning pink!'),
    // The village kids.
    goal: kids('Goal!'),
    thanks: kids('Khob khun ka!'),
    ball: kids('The ball!'),
    // Sparkle: what to do (only when something is new, or after a while with nothing done).
    hint: {
      ribbon: onDevice('Tap a ribbon to tie it on!', 'Click a ribbon to tie it on!'),
      garland: 'Now the flowers!',
      drive: onDevice('Put your finger on the water to drive!', 'Click and hold on the water to drive!'),
      glow: 'Drive to a golden light!',
      ball: 'Push the ball back with the boat!',
      lie: 'Lie down! The roof is low!',
      pose: onDevice('Tap a pose!', 'Click a pose!'),
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
  // the village kids and a cheeky macaque. Sparkle gives the few instructions and the countdown; Mom and Dad cheer
  // in their own voices; the kids tease and cheer; the macaque only chatters. She always wins, and the trophy says so.
  race: {
    gate: 'A boat race! Drive through the rainbow gate!',
    start: onDevice('Hold your finger on the water to go fast!', 'Click and hold on the water to go fast!'),
    count: ['Three!', 'Two!', 'One!', 'Go!'],
    lap2: 'Lap two!',
    final: 'Last lap!',
    win: `You win! First place!`,
    trophy: `A trophy for you, the boat race champion!`,
    back: onDevice('Tap the boat to go back to the bay!', 'Click the boat to go back to the bay!'),
    // The trophy room speaks this when she taps her race trophy (it's saved there).
    trophyRoom: `Boat Race Champion! From Thailand.`,
    // Dad and Mom, in the boat with her.
    go: nick('Go, go, go!'),
    banana: nick('Whoa! A banana!'),
    almost: nick('Almost there!'),
    won: nick('We won!'),
    wheee: ji('Wheee!'),
    proud: ji('You did it, sweetie!'),
    // The village kids, racing her in their blue longtail.
    raceYou: kids('Race you!'),
    catchUs: kids("You can't catch us!"),
    goodRace: kids('Good race!'),
  },

  // Baan Chang Cafe in Krabi (activities/boat-trip/chang/, plan: thailand/baan-chang.md): the sign, the chocolate milk,
  // the boardwalk and the elephants. The elephants don't talk (rumbles, trumpets, squeals); Dad and Mom react in
  // their own voices, and Sparkle says the names, what's new, and what to do after a while with nothing done. Dad's
  // "Where to, Captain Kaylee?", "Everybody, pose!", "One, two, three, cheese!" and "Pai!" are the bay's.
  chang: {
    // Dad.
    bananas: nick('Bananas for the elephants!'),
    likes: nick('He likes you!'),
    coffee: nick('Ahh! Thank you!'),
    // Mom.
    look: ji('Look! Elephants!'),
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
      cup: onDevice('Tap the cup to make a drink!', 'Click the cup to make a drink!'),
      milk: 'Pour in the milk!',
      choc: onDevice('Squeeze in the chocolate!', 'Click and hold to squeeze in the chocolate!'),
      stir: 'Stir it round and round!',
      straw: 'Pick a straw!',
      go: onDevice('Tap the elephant to go see them!', 'Click the elephant to go see them!'),
      walk: onDevice('Tap the path to walk!', 'Click the path to walk!'),
      hold: 'Grab a banana!',
      want: 'Give them what they want!',
      spray: onDevice('Tap an elephant for a splash!', 'Click an elephant for a splash!'),
      boat: onDevice('Tap the boat to go to the sea!', 'Click the boat to go to the sea!'),
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
    sri: by('sri')("We're home!"),
    agong: by('agong')('Did you bring my photo?'),
    thanks: by('agong')('Beautiful! Thank you!'),
    gan: by('gan')('Whoa! Cool!'),
    ken: by('ken')('Whoa!'),
    bb: by('bb')('So cool!'),
    jum: by('jum')('So pretty!'),
    // The frame on the wall, tapped in the house.
    wall: ji('Our boat trip!'),
    // The stamp screen's sticker.
    sticker: 'Fiddler crabs wave hello!',
    // Sparkle, after a while with nothing done.
    pick: 'Pick a photo for Agong!',
    give: onDevice('Tap Agong to give it to him!', 'Click Agong to give it to him!'),
    // At the pier at sunset, nothing done for a while.
    fly: onDevice('Tap the plane to fly home!', 'Click the plane to fly home!'),
    // The boarding pass on a replay: the whole trip or straight to the boat.
    again: 'Pack again, or go straight to the boat?',
  },

  // The Nan road trip (planning/around-the-world/thailand/nan-trip.md). The stops fill in as each one gets its voices.
  nan: {
    // The rice farm under Stop Time Cafe (activities/nan-trip/rice/, plan: thailand/nan-rice.md). Lung Kham, the farmer
    // (a monkey: "lung" is uncle), needs a helper: he says what each round is for, Sparkle then says what to do and, after
    // a while with nothing done, says it again; Lung and Dad (on the farm) and Mom (on the deck) react in their own
    // voices. Kaylee never talks: she giggles.
    rice: {
      // Lung Kham's story (rice/story.ts): Jip and the hat mix-up. The films, beat by beat, in play order.
      story: {
        // The way in: Lung says hello, hears Jip, and tells what Jip did last year (the memory, in the storybook look).
        hello: lung('Sawasdee krap! Welcome to my farm!'),
        uhoh: lung("Uh-oh. That's Jip!"),
        tell: lung('Let me tell you what Jip did last year.'),
        nap: lung('My rice was all golden. So I had a little nap...'),
        along: lung('Then along came Jip!'),
        took: lung('He took my hat!'),
        gave: lung("And gave me the scarecrow's!"),
        thought: lung('The birds thought I was the scarecrow!'),
        ateAll: lung('They ate ALL my rice!'),
        help: lung('This year, I need a helper. Will you help me?'),
        // Planting: Jip lands on her hat and tugs at it.
        holdHat: lung('Hold on to your hat!'),
        // The rice is golden: Jip flies off with a grain, and Lung finds out why.
        whereTo: lung("Hey! Where's Jip going?"),
        oldHat: lung('My old hat! Jip made a nest!'),
        hungry: lung("Oh... Jip's babies are hungry."),
        share: lung("Let's share our rice with them!"),
        // Threshing done: the last bundles are for the birds.
        some: lung('Now, some for Jip!'),
        oneEach: lung('One for you, one for me!'),
        friends: lung('Friends now!'),
      },
      // Lung, as each round begins, then Sparkle's line (the first two before her first touch). (After the story, Lung
      // has already asked for a helper: the planting starts with Sparkle's line.)
      ask: {
        plant: lung('Sawasdee krap! I need a helper!'),
        grow: lung("Oh no! It's Jip and friends!"),
        thresh: lung('Now we bang the grains out!'),
      },
      plant: 'Walk through the water to plant!',
      dry: 'Rice likes water! Open the gate.',
      grow: 'Shoo them away!',
      harvest: 'Walk through the rice to cut it!',
      thresh: onDevice('Tap to bang the rice!', 'Click to bang the rice!'),
      shareIt: onDevice('Tap the rice to share it!', 'Click the rice to share it!'),
      // The first time she pokes the kratip, the view from the deck, the buffalo and a duck (tap-to-hear facts).
      sticky: 'In Nan, people eat sticky rice with their fingers!',
      steps: 'The steps on the hill keep the water for the rice!',
      buffalo: 'Buffalo helped farmers get the mud ready!',
      duck: 'Ducks eat the bugs in the rice!',
      // Lung on the farm: the first gate opened, all planted, the rice growing tall, ripe, the bundles counted in Thai
      // as she threshes them (one to five), the basket heaped, the kratip popping out of it.
      water: lung('Ahh! Water for my rice!'),
      thanks: lung('All planted! Khob khun krap!'),
      tall: lung('Look how tall it grows!'),
      ripe: lung('Golden! My rice is ready!'),
      count: [lung('Neung!'), lung('Song!'), lung('Sahm!'), lung('See!'), lung('Hah!')],
      helper: lung('Sticky rice, for my helper!'),
      scarecrow: lung('Hey! My scarecrow!'),
      // Tap Lung (in turn).
      lungTap: [lung('Hee hee! Sawasdee krap!'), lung('Mud is good for rice!'), lung('My back says thank you!')],
      // Sparkle, after a while with nothing done.
      hint: {
        plant: 'Walk through the water to plant!',
        gate: onDevice('Tap the gate to let the water in!', 'Click the gate to let the water in!'),
        grow: 'Walk to the birds!',
        harvest: 'Walk through the golden rice!',
        thresh: onDevice('Tap to bang the rice!', 'Click to bang the rice!'),
        share: onDevice('Tap the rice to share it!', 'Click the rice to share it!'),
        eat: onDevice('Tap the sticky rice!', 'Click the sticky rice!'),
        photo: onDevice('Tap Mom for a photo!', 'Click Mom for a photo!'),
      },
      // Dad on the farm.
      planted: nick('Look at those rows!'),
      wet: nick("Hey! I'm all wet!"),
      hat: nick('A straw hat! Thank you!'),
      muddy: nick('A muddy unicorn!'),
      flop: nick('Ha! Into the straw!'),
      rain: nick('Rain! The rice loves it!'),
      fat: nick('That bird ate too much!'),
      where: nick('Where did you go?'),
      lots: nick('Look at all that rice!'),
      coffee: nick('Mmm, coffee.'),
      // Tap Dad on the farm (in turn).
      tap: [nick('Go, farmer!'), nick('Splish, splash!'), nick('Dad is watching!')],
      // Mom on the deck.
      hi: ji('You grew this sticky rice!'),
      aroi: ji('Aroi mak!'),
      smile: ji(`Smile!`),
      // The rice farm's video, after Mom's photo on the deck (rice/video.ts).
      video: 'Want to see real farmers grow rice?',
    },
    // The Nan map (map/): Sparkle's first line, her hint, and Mom after two stops and after all three.
    map: {
      first: `Where shall we go first?`,
      hint: onDevice('Tap a place to drive there!', 'Click a place to drive there!'),
      more: ji('Home, or one more?'),
      home: ji('Time to fly home!'),
      laos: 'Over there is Laos, another country!',
    },
    // The mountain roads (drive/): Mom drives and says the road lines, Dad reacts, Sparkle says what's new.
    drive: {
      steer: onDevice(`Steer the car with your finger!`, `Click and drag to steer the car!`),
      cloud: "We're driving into a cloud!",
      count: "Let's count the bends!",
      one: 'One!',
      two: 'Two!',
      three: 'Three!',
      drew: `Three! You drove the three!`,
      go: ji(`Steer for me!`),
      left: ji('Keep left!'),
      buffalo: ji("A buffalo! Let's wait."),
      bend: ji('Slow round the bend.'),
      to: {
        mushrooms: ji('The mushroom farm!'),
        rice: ji('Stop Time Cafe!'),
        salt: ji('Bo Kluea! The salt village!'),
        market: ji('The market!'),
        view: ji('Look how high we are!'),
      },
      whoa: nick('Whoa!'),
      foggy: nick("I can't see a thing!"),
      sun: nick('Sunshine! Above the clouds!'),
      monkey: nick('A monkey on the rail!'),
      waterfall: nick('Look! A waterfall!'),
      rain: nick('Swish, swish, go the wipers!'),
      // Silly driving (each list in turn): over the edge and tumbling down, dropped back on the road, bumping along the
      // grass, wiggling all over the road.
      over: [ji('Oh no!'), nick('Whoaaa! We can fly!'), ji('Oh no, not again!'), nick('Wheee! Here we go!')],
      back: [nick("We're back!"), ji('Phew!'), nick('Again! Again!'), ji('Back on the road!')],
      grass: [ji('Oh no, the grass!'), nick('Bumpy bumpy bumpy!'), ji('Back on the road!'), nick("Moo! We're a cow!")],
      wiggle: [nick('Wibbly wobbly!'), ji('Silly driving!'), nick('My tummy!')],
      // Tap Dad in the car (in turn).
      tap: [nick('Great driving!'), nick('Wheee! Bumpy!'), nick('Are we there yet?')],
    },
    // Baan Huanam Mushroom Farm (mushrooms/): the farmer aunty (a buffalo) and Dad react, Sparkle says what's new.
    mushrooms: {
      mist: `Spray the bags!`,
      pick: 'Pull the mushrooms off!',
      pizza: 'Put your mushrooms on the pizza!',
      hint: {
        mist: onDevice('Hold your finger on the bags!', 'Click and hold on the bags!'),
        pick: 'Pull a mushroom into the basket!',
        pizza: 'Drag a mushroom to the pizza!',
        oven: onDevice('Tap the oven!', 'Click the oven!'),
        share: onDevice('Tap the pizza to share it!', 'Click the pizza to share it!'),
      },
      sawdust: 'Mushrooms grow from sawdust, not seeds!',
      hi: by('farmer')('My mushrooms are thirsty!'),
      grown: by('farmer')('Look at them grow!'),
      oven: by('farmer')('Into the oven!'),
      tap: [by('farmer')('Ha ha ha!'), by('farmer')('Good spraying!'), by('farmer')('Yummy mushrooms!')],
      hat: nick('A mushroom hat?!'),
      giant: nick('A giant mushroom!'),
      yum: nick('Mmm! Mushroom pizza!'),
      dad: [nick('Spray me again!'), nick('So many mushrooms!')],
      share: ji('A slice for everyone!'),
    },
    // Bo Kluea's salt wells (salt/): the salt aunty (a pony) and Dad react, Sparkle says what's new.
    salt: {
      dip: `Dip the bucket in the well!`,
      fire: 'Put a log on the fire!',
      scrape: 'Scrape up the salt!',
      hint: {
        dip: 'Pull the bucket down into the well!',
        pour: 'Carry it over the big pan!',
        fire: 'Throw a log in the fire!',
        scrape: 'Move the paddle through the salt!',
      },
      boil: 'The water boils away, and the salt stays!',
      hi: by('saltaunty')('This well is very salty!'),
      lit: by('saltaunty')('Now we light the fire!'),
      white: by('saltaunty')('Look! White salt!'),
      bags: by('saltaunty')('Salt for everyone!'),
      tap: [by('saltaunty')('Hee hee! Taste it!'), by('saltaunty')('Strong girl!'), by('saltaunty')('Hot, hot fire!')],
      foot: nick('Ow! A salty foot!'),
      salty: nick('Too salty? Ha ha!'),
      dad: [nick('Look at that steam!'), nick('Salt from a well!')],
      // Pa Kluea's story (salt/story.ts, plan: thailand/nan-salt-story.md): the village dinner is tonight and nobody
      // has any salt. The cooks: Lung Kwai the buffalo (noodle soup), Pa Kai the hen (salty eggs), Yai Nak the otter
      // grandma (grilled fish).
      story: {
        // The way in.
        hello: by('saltaunty')("Sawasdee ka! I'm Pa Kluea. I make the salt!"),
        calling: by('kwai')('Pa Kluea! Pa Kluea!'),
        puddle: by('kwai')('Blehh! My soup tastes like puddle water!'),
        eggs: by('kai')("Bawk! My salty eggs aren't salty!"),
        fish: by('nak')('And my fish is so... plain.'),
        empty: by('saltaunty')('Oh no! My salt jar is empty!'),
        tonight: by('kwai')('And the village dinner is tonight!'),
        // The memory, in the storybook look.
        little: by('saltaunty')('When I was little, my grandma made the salt.'),
        carry: by('saltaunty')('And I carried it to every pot!'),
        ask: by('saltaunty')('Will you be my salt carrier?'),
        // While she makes it: the cooks wait across the road.
        yet: by('kwai')('Is it salt yet?'),
        notYet: by('saltaunty')('Not yet! Keep going!'),
        ooh: by('kai')('Ooh! Salt!'),
        // The dinner, at dusk.
        dusk: by('saltaunty')("It's dinner time! Quick, salt carrier!"),
        sprinkle: 'Sprinkle the salt on the food!',
        salted: [by('kwai')('Aroi mak! Just right!'), by('kai')("Now my eggs will be salty!"), by('nak')('Yummy fish! Thank you!')],
        tooSalty: [by('kwai')('Too salty! Water, please!'), by('kai')('Bawk! So salty!'), by('nak')('Ooh! My whiskers!')],
        waiting: [by('kwai')('My poor soup!'), by('kai')('Cluck cluck! No salt!'), by('nak')("I'm so hungry, dear.")],
        happy: [by('kwai')('Slurp! Yum!'), by('kai')('Bawk bawk!'), by('nak')('So yummy, dear!')],
        // The party.
        thanks: by('saltaunty')('Thank you, salt carrier! The best dinner ever!'),
        yum: nick('Mmm! Just right!'),
        hint: onDevice('Hold your finger over the food!', 'Click and hold over the food!'),
        fact: 'Salt keeps eggs and fish yummy!',
      },
    },
    // The Nan Mountain Cup (activities/nan-trip/cup/, plan: thailand/nan-cup.md): a kart race on three mountain tracks
    // against three Nan locals (cast.json): Grandma Taeng the tortoise, Pao the hornbill postman and Moon the sun bear
    // honey seller. Sparkle says what's new and counts down in Thai; the rivals tease, bump and are good sports in their
    // own voices; Mom and Dad cheer from the grandstand. Kaylee never talks: she giggles.
    cup: {
      // Dad, as the city road pulls in at the race ground.
      arrive: nick('Look! A race!'),
      // Sparkle at the board, the first time this visit (and the stuck hint, glow first).
      board: onDevice('Tap a track to race!', 'Click a track to race!'),
      // Tap a rival on the board or the podium (each in turn).
      taeng: [by('taeng')('Sawasdee ka! I won three Cups!'), by('taeng')('Oh! Is it time?'), by('taeng')('My husband built my kart!')],
      pao: [by('pao')('Sawasdee krap! Ready?'), by('pao')('Special delivery! Ha ha!'), by('pao')('Up the mountain every day!')],
      moon: [by('moon')('Sawasdee ka! Want some honey?'), by('moon')('Shoo, bee! Shoo!'), by('moon')('I love the straight bits!')],
      // The first time she pokes each rival this visit, after their line, Sparkle's fact.
      facts: {
        taeng: 'Tortoises can live to be more than a hundred!',
        pao: 'Hornbills have a big helmet on their beak!',
        moon: 'Sun bears are the smallest bears!',
      },
      // The race: the home rival's tease on the grid, Sparkle's one instruction (her first race), the lights in Thai.
      tease: {
        forest: by('moon')('Vroom! Here I go!'),
        steps: by('taeng')('Race you down the hill!'),
        cloud: by('pao')('Up, up, into the clouds!'),
      },
      start: onDevice('Hold your finger on the road to go!', 'Click and hold on the road to go!'),
      count: ['Sahm!', 'Song!', 'Neung!', 'Go!'],
      // Sparkle, the first time each track's trick happens this visit.
      boing: 'Boing! A bouncy mushroom!',
      mud: 'Splash! Mud makes you fast!',
      cloud: 'Follow the lanterns!',
      // Sparkle, after a while with her finger off the road.
      hint: onDevice('Hold your finger on the road!', 'Click and hold on the road!'),
      // Bump a rival (each in turn).
      bump: { taeng: by('taeng')('Oh my!'), pao: by('pao')('Hey! My letters!'), moon: by('moon')('Hey! My honey!') },
      // The last stretch, and the finish: she wins by a nose, or the home rival does.
      final: 'Nearly there!',
      win: 'First place!',
      close: 'So close! Second place!',
      // The podium. Gold: Mom and Dad cheer, the home rival is a good sport.
      gold: [nick('Gold! Woo hoo!'), ji('You won, sweetie!')],
      good: {
        taeng: by('taeng')('Oh my! So fast, dear!'),
        pao: by('pao')('You beat me up my mountain!'),
        moon: by('moon')('Wow! You beat me!'),
      },
      // Silver: Sparkle asks for a high five, and the winner gives her their gift for her kart.
      five: onDevice('Tap the winner for a high five!', 'Click the winner for a high five!'),
      gift: {
        taeng: by('taeng')('My lucky ribbon, for you!'),
        pao: by('pao')('Well driven! Have a feather!'),
        moon: by('moon')('Great race! A honey sticker for you!'),
      },
      silver: ji('Next race, sweetie!'),
      // The Cup: Sparkle when it flies over to her, then everyone when she lifts it.
      cup: onDevice(`The Nan Mountain Cup! Tap it!`, `The Nan Mountain Cup! Click it!`),
      champion: `You are the Nan Mountain Cup champion!`,
      lift: [nick('Champion!'), ji('Smile, champion!')],
    },
    // The trip around the stops (activities/nan-trip/Loop.tsx, the trip kit): packing for the mountains, landing in Nan,
    // the photo at the 3's viewpoint, and the photo on Agong's wall. The rest of the way there and home is the boat
    // trip's (L.trip, L.home).
    trip: {
      cool: ji("It's cool and rainy in the mountains!"),
      umbrella: ji('Mom always packs an umbrella!'),
      landed: nick("Yay! We're in Nan!"),
      three: ji('Everybody, smile!'),
      // The frame on the wall, tapped in the house.
      wall: ji('Our trip to Nan!'),
      // The stamp screen's sticker.
      sticker: 'Pink mushroom sticker! Mushrooms love the rain.',
      // The stamp screen's tap-to-hear facts (trip/facts.ts NAN_FACTS), in Sparkle's voice.
      facts: {
        nan: 'Nan is in the mountains, next to Laos!',
        pajero: 'This big car was made in Thailand!',
        mushrooms: "Mushrooms aren't plants! They love dark, wet places.",
        rice: 'Rice grows standing in water!',
        salt: 'Bo Kluea makes salt from a well!',
        sea: 'Long ago the sea was here, and it left its salt!',
        // The Nan Mountain Cup's facts.
        flower: 'A pink flower grows on the mountain, only in Nan!',
        mountain: 'Doi Phu Kha is a big mountain in Nan!',
      },
    },
  },

  // The Koh Samet island trip (activities/samet-trip/, plan: thailand/samet-trip.md). Talk short, play long: Sparkle
  // says what's new (the first time she reaches each beach, a new round) and, after a while with nothing done, what to
  // do (spendHint, so at most twice a visit); the family and the islanders react in their own voices (cast.json): the
  // jet ski man (an otter), the captain (a pelican, both boats), the taxi driver (a sun bear) and the fire dancers (two
  // tokay geckos: Tuk and Kae in the story, one shared voice for their cheers in the show). Kaylee never talks: she
  // giggles. The island is a hub: no idle hints spoken.
  //
  // One story holds it together, "The Lost Fireflies" (`story`, plan: thailand/samet-story.md): last night's wind blew
  // the fire show's four fireflies all over the island, and Tofu the beach puppy saw where each one went. Each stop
  // finds one (Zoom, Sandy, Bubbles, Peekaboo); with all four the fire show can start.
  samet: {
    // Getting there and home (PackScreen, speedboat/, the trip frame), the sticker and the stamp screen's facts.
    trip: {
      // The speedboat from Ban Phe (speedboat/, a cutscene): the captain (a pelican) says hello, then only reactions to
      // what happens (the ferry's wake, the flying fish, the pokes).
      boat: {
        hi: by('pelican')('Sawasdee ka! Hold on tight!'),
        fish: 'Flying fish!',
        jump: nick('Whoa! We flew!'),
        // Tap the captain, Dad (his cap blows off), Mom (her sun hat flies up) (each in turn).
        captain: [by('pelican')('Beep beep!'), by('pelican')('Wiggle wiggle! Ha ha!'), by('pelican')('Hold on to your hats!')],
        nick: [nick('My cap!'), nick('So windy!')],
        ji: [ji('My sun hat!'), ji('Whee! So fast!')],
        // Tied up at Na Dan pier.
        here: by('pelican')('Koh Samet! Here we are!'),
      },
      // The photo on Agong's wall, tapped in the house.
      wall: ji('Our trip to Koh Samet!'),
      // The stamp screen's sticker.
      sticker: 'Pink mermaid sticker! A mermaid sits on the rocks!',
      // The stamp screen's tap-to-hear facts (and the passport), in Sparkle's voice.
      facts: {
        island: 'Koh means island in Thai!',
        samet: 'The samet tree gave the island its name!',
        sand: 'Sai Kaew means crystal sand!',
        mermaid: 'The mermaid is from an old Thai poem!',
        park: 'Koh Samet is a national park, a home for animals!',
        jacket: 'Always wear a life jacket on the water!',
        sunset: 'The sun sets in the west, over Ao Prao!',
        fireflies: 'Fireflies glow to say hello to each other!',
      },
    },
    // The story, "The Lost Fireflies" (story/, plan: thailand/samet-story.md), in play order: the way in at Na Dan
    // pier, the island between the stops, each stop's way in and its firefly found, all four, and the fire show.
    story: {
      // The way in (island/story.ts, film `intro`), at the foot of Na Dan pier as she lands: Mom, Dad (Tofu the beach
      // puppy runs up barking), then the two gecko fire dancers with their empty lantern.
      intro: {
        here: ji('What a pretty island!'),
        puppy: nick("Hello, puppy! What's wrong?"),
        ohno: tuk('Oh no, oh no, oh no!'),
        gone: kae('Our fireflies are gone!'),
        // Their memory (the storybook look): last night on Sai Kaew, the show, then the big wind.
        every: tuk('Every night, four fireflies light up our fire show.'),
        wind: kae('But last night, a big wind came. Whoosh!'),
        away: kae('It blew them all over the island!'),
        // Back at the pier: the droop, then Tofu barks and wags.
        noshow: tuk('No fireflies, no show tonight!'),
        tofu: kae('But Tofu saw where they went!'),
        ask: tuk('Will you help us find them?'),
        // Sparkle, as the film ends and the pictures of the four beaches come up.
        go: onDevice('Four fireflies to find! Tap a picture!', 'Four fireflies to find! Click a picture!'),
      },
      // On the island between the stops (island/): the pictures, the ride, the fireflies she has found.
      island: {
        // The taxi driver as she picks a beach (in turn), and at a beach the taxi has no stop at.
        ride: [sunbear('Hop in! Beep beep!'), sunbear('Off we go!'), sunbear('Hold on tight!')],
        hinkhok: sunbear('Ao Hin Khok!'),
        // Sparkle, the first time she comes near a firefly still waiting at its beach.
        near: {
          jetski: 'Look! A pink light on the water!',
          sandcastle: 'Something is glowing in the sand!',
          snorkel: 'A blue light, far out at sea!',
          hideseek: 'A green light in the big tree!',
        },
        // Back from a stop with a firefly (the first, second and third), then the pictures come up again.
        count: ['One firefly! Three more to find!', 'Two fireflies! Two more to find!', 'Three fireflies! Just one more!'],
        // Tap Tofu the first time.
        tofu: 'Tofu the beach puppy! He saw it all!',
      },
      // The jet ski's firefly, Zoom (jetski/): the jet ski man's way in at his hut, the chase, found.
      // @samet-story-jetski
      jetski: {
        looking: otter('Sawasdee krap! Looking for a pink light?'),
        zoom: otter('She zoomed round my buoys all night!'),
        fast: otter('She only stops for someone fast!'),
        // As the film ends: the life jacket (he has already said hello).
        first: otter('Life jacket first!'),
        // Sparkle, the first time Zoom flies ahead of the jet ski.
        chase: 'There she is! After her!',
        // Found (a race finished, won or lost by a nose, or parked after a decent ride): she lands on your unicorn's
        // horn.
        likes: otter('Ha ha! She likes you!'),
        found: 'You found Zoom!',
        dad: nick('Fast like a firefly!'),
      },
      // The sandcastle's firefly, Sandy (sandcastle/): a glow in the sand, a castle to tempt her out, found.
      // @samet-story-sandcastle
      sandcastle: {
        glow: nick("Look! Something's glowing in the sand!"),
        shy: ji('A little gold firefly! She is shy.'),
        castle: nick("Let's build her a castle!"),
        // Sparkle, the first time she peeks out while the castle grows.
        peek: 'She is peeking! Keep building!',
        // Found (the moat full): she flies out and sits on the tallest tower.
        home: ji('She loves her castle!'),
        found: 'You found Sandy!',
        dad: nick('A castle fit for a firefly!'),
      },
      // The snorkel's firefly, Bubbles (snorkel/): the captain's way in on her boat, the glow down on the reef, found.
      // @samet-story-snorkel
      snorkel: {
        fell: pelican('A little blue light fell in the sea!'),
        bubble: pelican("She can't swim! She is in a bubble."),
        down: pelican('Down by the coral. Can you find her?'),
        // Sparkle: the first sight of the glow, and the cuttlefish cuddling the bubble.
        see: 'A blue glow! Swim to it!',
        hug: 'The cuttlefish is hugging her bubble!',
        // Found: the bubble floats up and pops.
        pop: nick('Pop! Out she comes!'),
        saved: pelican('You saved her, ka!'),
        found: 'You found Bubbles!',
      },
      // Hide and seek's firefly, Peekaboo (hideseek/): a green light peeking round the driftwood tree, found.
      // @samet-story-hideseek
      hideseek: {
        saw: nick('Did you see that? A green light!'),
        playing: ji('She is playing hide and seek!'),
        too: nick("Then let's play too!"),
        // Sparkle: Peekaboo twinkling near where Dad hides; hiding beside your unicorn on her turn.
        knows: 'The green light knows where Dad is!',
        shh: 'Shh! She is hiding with you!',
        // Found (she wins her turn to hide): Peekaboo lands on Dad's nose.
        nose: nick('Hey! That tickles my nose!'),
        found: 'You found Peekaboo!',
      },
      // All four found (island/story.ts, film `all`): the fireflies swirl, then Dad calls the sunset (island.sunset).
      all: {
        four: ji('All four fireflies! You did it!'),
        go: onDevice('Tap the sunset picture!', 'Click the sunset picture!'),
      },
      // The fire show (finale/): the way in on Sai Kaew at night, and the thank you at the end.
      // @samet-story-show
      show: {
        dark: tuk("It's so dark. No show tonight."),
        wait: kae('Wait! Look, look!'),
        back: tuk('Our fireflies! You found them!'),
        light: kae('Light us up, fireflies!'),
        yours: kae('And these lights are for you!'),
        start: tuk('Now the show can start!'),
        // The end, after the fireworks: a bow, the fireflies make a heart.
        best: tuk('Best fire show ever!'),
        thanks: kae('Khob khun ka! Come back soon!'),
      },
    },
    // The island between the stops (island/): each beach the first time, the taxi, the pokes, home.
    island: {
      // Sparkle, the first time she reaches each beach this visit.
      beach: {
        saikaew: 'Hat Sai Kaew! The jet ski beach!',
        hinkhok: 'Ao Hin Khok! Build a sandcastle!',
        phai: 'Ao Phai! A quiet little bay!',
        wongduan: 'Ao Wong Duan! The snorkel boat!',
        prao: 'Ao Prao! The big driftwood tree!',
        aonoina: 'Ao Noi Na! Look at the boats!',
      },
      // The jet ski is hers (once a visit, with its flag up); all four flags: Dad calls everyone to the tree.
      hers: 'The jet ski is yours now! Hop on!',
      sunset: nick('Sunset time! To the big tree!'),
      // The first rubbish in the bin.
      clean: ji('Thank you for cleaning the beach!'),
      // The green taxi's driver (a sun bear): poked (in turn), and each beach's name as the taxi pulls in there.
      taxi: {
        hi: by('sunbear')('Sawasdee krap! Hop in!'),
        ride: [by('sunbear')('Beep beep!'), by('sunbear')('Hold on! Bumpy road!'), by('sunbear')('Next stop, the beach!')],
        stop: {
          nadan: by('sunbear')('Na Dan pier!'),
          saikaew: by('sunbear')('Hat Sai Kaew!'),
          prao: by('sunbear')('Ao Prao!'),
          wongduan: by('sunbear')('Ao Wong Duan!'),
        },
      },
      // The first time down the sand slide at the end of the puppy's shortcut.
      slide: nick('Wheee! A sand slide!'),
      // At the end of Na Dan pier by the speedboat, before the whole island is done: the home picture comes up.
      leave: ji('Time to go home?'),
      // Tap Dad (in turn; asleep on the sand he wakes up), tap Mom (in turn).
      nick: [nick('Hi, sweetie!'), nick('I love this beach!'), nick('Race you to the sea!')],
      wake: nick('Huh? I was sleeping!'),
      ji: [ji('So pretty here!'), ji('Sunscreen on, sweetie!'), ji('Mom loves you!')],
      // A coconut on Dad's head, the umbrella kite.
      bonk: nick('Ow! A coconut!'),
      kite: ji('Whoa! Hold on tight!'),
      // On Na Dan pier going home: Mom's photo.
      home: ji('Smile! Bye bye, Koh Samet!'),
    },
    // Tofu the beach puppy (island/puppy.ts). His voice is barks; Sparkle says why he runs back the first time he
    // fetches her, and each beach's name when she gets there.
    puppy: {
      come: 'The puppy wants you to come!',
      name: {
        nadan: 'Na Dan pier!',
        saikaew: 'Hat Sai Kaew!',
        hinkhok: 'Ao Hin Khok!',
        phai: 'Ao Phai!',
        wongduan: 'Ao Wong Duan!',
        prao: 'Ao Prao!',
        aonoina: 'Ao Noi Na!',
      },
    },
    // The island's animals (book/animals.ts): Sparkle says a reef animal's name the first time Mom's camera snaps it
    // on the snorkel.
    book: {
      name: {
        tern: 'A tern!',
        crab: 'A crab!',
        heron: 'A reef heron!',
        urchin: 'A sea urchin!',
        coral: 'Coral!',
        hornbill: 'A hornbill!',
        parrotfish: 'A parrotfish!',
        damselfish: 'Blue damselfish!',
        cuttlefish: 'A cuttlefish!',
        monitor: 'A monitor lizard!',
        mousedeer: 'A mouse-deer!',
        flyingfox: 'A flying fox!',
        squirrel: 'A squirrel!',
        macaque: 'A monkey!',
      },
    },
    // The jet ski at Hat Sai Kaew (jetski/): ride, waves, race the jet ski man.
    jetski: {
      // The jet ski man (an otter) as the bare link waits for her life jacket, then Sparkle's line once it's on.
      jacket: by('otter')('Sawasdee krap! Life jacket first!'),
      ready: by('otter')('Hold on tight! Off you go!'),
      // Sparkle, as each round begins (the jacket's tap and the waves and the race moving on by themselves).
      ride: onDevice('Steer it with your finger!', 'Click and drag to steer it!'),
      waves: 'Big waves! Catch the stars!',
      race: 'Race the jet ski man!',
      // Sparkle's countdown (3, 2, 1, go).
      count: ['Three!', 'Two!', 'One!', 'Go!'],
      // The jet ski man in the race: his tease at the start, the bell (she won, he's a good sport; he won by a nose).
      tease: by('otter')('Catch me if you can!'),
      won: [by('otter')('Wow! You are fast!'), by('otter')('You win again! Ha ha!')],
      lost: by('otter')('Ha! Just a nose!'),
      // Sparkle, when he wins by a nose (straight into the next race), and Dad at her win.
      close: 'So close! Again!',
      champ: nick(`You win!`),
      // Dad on the jet ski (each list in turn): a jump, a spin in the air, the loop (and the heart), dizzy circles,
      // Mom soaked, onto the sand.
      jump: [nick('Wheee!'), nick('We can fly!'), nick('Yee-haw!')],
      spin: nick('A spin! Whoa!'),
      loop: nick('Look! The fish!'),
      heart: nick('A heart! For Mom!'),
      dizzy: nick("Round and round! I'm dizzy!"),
      soaked: ji("Hey! I'm all wet!"),
      beached: [nick('Oops! Sandy jet ski!'), nick('Whoa! Not the beach!'), nick('Ha ha! Again?')],
      // Dad, when it's wedged on the rocks and pops free.
      rocks: [nick('Boing! Silly rocks!'), nick('Bonk! Off we go!')],
      push: [by('otter')('Back in the water!'), by('otter')('Ha ha! Boats go in the sea!')],
      // Getting off: Sparkle once, a little way into the ride (the pink ring by the hut), and the jet ski man as she
      // parks in it.
      off: 'To get off, drive into the pink ring!',
      bye: by('otter')('Park it here! Bye bye!'),
      // Pokes, in turn: Dad (his cap blows off), Mom on the sand, the jet ski man.
      cap: [nick('My cap!'), nick('Not again!')],
      mommy: [ji('Go, go, go!'), ji('Wave to Mom!')],
      man: [by('otter')('Sawasdee krap!'), by('otter')('Zoom zoom!'), by('otter')('Nice driving!')],
      // Sparkle's facts, the first time she pokes them: the buoy rope, the life jacket.
      rope: 'The rope keeps the swimmers safe!',
      // Sparkle, after a while with nothing done (spendHint: shown first, then said at most twice a visit).
      hint: {
        jacket: onDevice('Tap the life jacket!', 'Click the life jacket!'),
        steer: onDevice('Hold your finger on the water!', 'Click and hold on the water!'),
        // In the race: where to go next.
        buoy: 'Go round the big orange buoy!',
        home: 'Back to the flags!',
      },
    },
    // The sandcastle at Ao Hin Khok (sandcastle/): dig, towers, the tide.
    sandcastle: {
      // Dad as it opens, then Sparkle's line for each round (dig at once; the moulds and the tide move on by
      // themselves).
      hi: nick("Let's build a sandcastle!"),
      dig: onDevice('Dig the sand with your finger!', 'Click and drag to dig the sand!'),
      towers: onDevice('Dig sand into a bucket, then tap it!', 'Dig sand into a bucket, then click it!'),
      tide: 'The sea is coming! Dig a river to it!',
      // The moat fills from the sea; the tide fact (Sparkle, after the fill).
      filled: nick('Water in the moat! Hooray!'),
      tideFact: 'The sea comes up the beach and goes back, twice a day!',
      // The big wave takes a tower's front; a crab pops out of a hole; the hermit crab moves in.
      washed: nick('Oh no! Build it again!'),
      crab: 'A ghost crab! It runs sideways!',
      hermit: 'A hermit crab moved in!',
      // Burying Dad (the first time he's all covered), his sneeze, his toes (in turn).
      buried: nick("Help! I'm a sandcastle!"),
      sneeze: nick('Ah... ah... choo!'),
      toes: [nick('Hee hee! That tickles!'), nick('My toes!')],
      // Pokes, in turn: Dad, Mom on the blanket.
      dad: [nick('Bury me in sand!'), nick('Great castle!')],
      mommy: [ji('So pretty!'), ji('A princess castle!')],
      // Sparkle, after a while with nothing done.
      hint: {
        dig: onDevice('Drag your finger in the sand!', 'Click and drag in the sand!'),
        towers: onDevice('Tap a bucket!', 'Click a bucket!'),
        tide: 'Dig a line down to the sea!',
        // A bucket poked before it's full, or nothing done with none full: dig beside one and the sand flies in.
        fill: 'Dig next to a bucket to fill it!',
      },
    },
    // Snorkeling at Ko Kudi (snorkel/): the captain's boat, float, follow the parrotfish, the cuttlefish.
    snorkel: {
      // The captain (the pelican) toots and sends her in; Sparkle says what each round is for (the first two before
      // her first touch), the facts the first time (coral when she first bumps or pokes one, the cuttlefish when it
      // first flashes), and after a while with nothing done what to do. Dad blows bubble rings.
      jump: by('pelican')('Masks on! Jump in!'),
      float: onDevice('Hold your finger in the water to swim!', 'Click and hold in the water to swim!'),
      follow: 'Follow the parrotfish!',
      cuttle: 'Swim close to the cuttlefish!',
      // The cuttlefish jets off to hide again (the first and second time she reaches it).
      again: ['Whoosh! Find it again!', 'Where did it go?'],
      pink: 'It turned pink, just for you!',
      camera: onDevice('Tap the camera for a photo!', 'Click the camera for a photo!'),
      coral: 'Coral is alive! Fish live in it.',
      colors: 'Cuttlefish change color to talk!',
      urchin: by('nick')('Boing! Prickly!'),
      ring: by('nick')('A bubble ring for you!'),
      // Tap Dad (after his first ring), tap the captain (each list in turn).
      dad: [by('nick')('Blub blub!'), by('nick')('Look at all the fish!'), by('nick')('Swim, swim, swim!')],
      captain: [by('pelican')('Toot toot! Ha ha!'), by('pelican')('Good swimming, little one!'), by('pelican')('My boat waits for you, ka!')],
      // Sparkle, after a while with nothing done.
      hint: {
        float: onDevice('Hold your finger in the water to swim!', 'Click and hold in the water to swim!'),
        follow: 'Swim after the parrotfish!',
        cuttle: 'Swim to the cuttlefish!',
      },
    },
    // Lunch on the deck at Ao Prao (hideseek/lunch.ts).
    lunch: {
      // Dad passes the rolls, Mom brings the coconut and the mango sticky rice; Sparkle's one line, and what to do
      // after a while with nothing done.
      hi: by('nick')('Lunch time! Who wants bread?'),
      start: onDevice('Tap the bread basket!', 'Click the bread basket!'),
      // Dad passing a roll (in turn), then the coconut, the rice, the last slurp and the last bite.
      pass: [by('nick')('Here you go!'), by('nick')('Catch!'), by('nick')('Another one? Ha ha!')],
      coconut: ji('A coconut! Sip it!'),
      slurp: by('nick')('What a big slurp!'),
      rice: ji('Mango sticky rice!'),
      aroi: ji('Aroi mak! So yummy!'),
      full: by('nick')('Full tummy! Hide and seek?'),
      // Tap Mom (her photo, in turn); the lizard and the squirrel below, the first time.
      photo: [ji('Smile!'), ji('Cheese!'), ji('So cute!')],
      lizard: by('nick')('A big lizard! Hello!'),
      squirrel: ji('A squirrel! Up it goes!'),
      hint: {
        basket: onDevice('Tap the bread basket!', 'Click the bread basket!'),
        roll: onDevice('Tap the roll to take a bite!', 'Click the roll to take a bite!'),
        coconut: onDevice('Hold your finger on the coconut!', 'Click and hold on the coconut!'),
        rice: onDevice('Tap the mango sticky rice!', 'Click the mango sticky rice!'),
      },
    },
    // Hide and seek by the driftwood tree (hideseek/).
    hideseek: {
      // Dad says what's happening and plays it up in his own voice; Sparkle counts with Kaylee (her eyes shut), says
      // what to do once a round, and after a while with nothing done; Kaylee never talks (she giggles).
      close: by('nick')('Close your eyes and count!'),
      // Sparkle counting with her (round 1 and 2), Dad counting in her turn (up to his count knob's most).
      count: ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!', 'Eight!', 'Nine!', 'Ten!'],
      dadCount: ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!', 'Eight!', 'Nine!', 'Ten!', 'Eleven!', 'Twelve!'].map(by('nick')),
      find: 'Find Dad!',
      tricky: 'Dad hides better now!',
      notHere: ['Not here!', 'Hmm, not there!'],
      // Dad found (in turn), giving himself away (a sneeze, a giggle).
      found: [by('nick')('You found me!'), by('nick')('Ha ha! Found!'), by('nick')('Good finding!')],
      achoo: by('nick')('Ah... ah... choo!'),
      hehe: by('nick')('Hee hee hee!'),
      // Stuck a long time: he jumps out and waves; then he runs over to her (it counts as found).
      here: by('nick')('Here I am!'),
      peekaboo: by('nick')('Peekaboo! You found me!'),
      // Her turn: Dad counts at the tree (tap him: he peeks), searches the wrong places, gives up.
      myTurn: by('nick')('My turn to count! Go hide!'),
      hide: 'Hide in a glowing spot!',
      peek: by('nick')('Oops! No peeking!'),
      ready: by('nick')('Ready or not!'),
      look: [by('nick')('Is she here?'), by('nick')('Not here!'), by('nick')('Hmm, where is she?')],
      mommy: by('nick')('Behind Mom?'),
      // Mom, when she hides somewhere silly (a thin palm, the sea), in turn.
      silly: [ji('Hee hee! I can see your tail!'), ji("Shh! Dad won't look!")],
      wrongWay: by('nick')('Hmm... not here!'),
      giveUp: by('nick')('Where is she? I give up!'),
      win: by('nick')('You win! Super hider!'),
      first: `You win hide and seek!`,
      spotted: [by('nick')('Found you!'), by('nick')('Peekaboo! I see you!')],
      boo: by('nick')('Waah! You scared me!'),
      hint: {
        seek: 'Where is Dad? Listen!',
        hide: 'Walk to a hiding place!',
      },
    },
    // The finale (finale/): the sunset at the driftwood tree, then the fire show on Sai Kaew.
    finale: {
      // The sunset (finale/sunset.ts): Dad as it opens, Sparkle's one instruction, the fact the first time she taps
      // the sun, Mom's photo (when she taps Mom, or by herself as the sun touches the sea), the plop, the night.
      sunset: {
        look: nick('Look! The sun is going to sleep!'),
        pull: 'Pull the sun down into the sea!',
        west: 'The sun always sets in the west!',
        photo: ji('Sunset photo! Smile!'),
        plop: nick('Plop! Into the sea!'),
        night: nick('Fire show time!'),
        // Tap Dad (in turn).
        tap: [nick('So pretty!'), nick('Bye bye, sun!'), nick('Ooh, the stars!')],
        // Sparkle, after a while with nothing done (spendHint).
        hint: { pull: 'Pull the sun down into the sea!', fire: onDevice('Tap the fire for the show!', 'Click the fire for the show!') },
      },
      // The fire show (finale/fireshow.ts): Mom as it opens, then Sparkle; the gecko fire dancers (one voice) cheer and
      // show off; each pink flag's surprise in the finish gets its friend's line; the big finish is a big moment.
      fire: {
        look: ji('Look! Fire dancers!'),
        twirl: onDevice('Swirl your lights with your finger!', 'Click and drag to swirl your lights!'),
        // Once, the first time the dancers answer her with a ring of fire.
        grownups: 'Fire is for grown-ups. Yours are lights!',
        // Big loops of hers (in turn, now and then).
        big: [by('gecko')('Whoa! Big circle!'), by('gecko')('Faster! Faster!'), by('gecko')('Wow! You are good!')],
        // The shapes: they draw one in fire, then it's her turn; each one lifting off (circle, star, heart, in order).
        watch: by('gecko')('Watch us! Now you!'),
        dots: 'Draw over the dots!',
        shapes: [by('gecko')('A circle!'), by('gecko')('A star!'), by('gecko')('A heart!')],
        lantern: 'It floats up like a lantern!',
        // The finish: Sparkle's line, each flag's surprise, the big ring, the ring of fire, the fireworks.
        loops: 'Swirl a loop! Something is coming!',
        gift: {
          jetski: by('otter')('Woo hoo! Lights on!'),
          sandcastle: ji('Your sandcastle is glowing!'),
          snorkel: nick('The fish are glowing!'),
          hideseek: nick('Dad can dance too!'),
        },
        giant: 'Now one giant circle!',
        ring: by('gecko')('Ring of fire!'),
        wow: `What a show!`,
        home: ji('Time to go home!'),
        // Tap a dancer, Mom, Dad (each in turn).
        dancer: [by('gecko')('Sawasdee!'), by('gecko')('Tukkae! Tukkae!'), by('gecko')('Hot, hot fire!')],
        jiTap: [ji('So beautiful!'), ji('My little fire dancer!')],
        nickTap: [nick('Twirl, twirl!'), nick('Wow!'), nick('Do a big one!')],
        // Sparkle, after a while with nothing done (spendHint).
        hint: { twirl: onDevice('Swirl your finger in the sky!', 'Click and drag to swirl in the sky!'), dots: onDevice('Follow the dots with your finger!', 'Click and drag along the dots!'), loops: 'Swirl a loop!', giant: 'Draw one giant circle!', sky: onDevice('Tap the sky for fireworks!', 'Click the sky for fireworks!') },
      },
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
      welcome: onDevice(`Welcome to HarborLand! Tap a place to play!`, `Welcome to HarborLand! Click a place to play!`),
      // The staff (a buffalo and a penguin), the first two times she comes near one, and when she taps them (in turn).
      staff: [by('staff')(`Sawasdee ka!`), by('staff')('Have fun!')],
      // Mom on her bench and Dad following her round, when she taps them (in turn).
      ji: [ji('Hi, sweetie!'), ji(`Have fun!`), ji('Mom is right here!')],
      nick: [nick('Where to next?'), nick('Dad is coming too!'), nick('Ho ho! Go play!')],
      // Dad's tummy rumbles (and again if she taps him while it does), then Mom's card, and her answer to More play.
      tummy: nick('My tummy is rumbling!'),
      pizza: ji('Hungry? Pizza time?'),
      more: ji('OK! A little more!'),
      // Sparkle, when the finger shows after a while with nothing touched; or, with every new game off the screen, when
      // the map button bounces silently. And as the map opens.
      hint: onDevice('Tap a door to play!', 'Click a door to play!'),
      map: `Where shall we play?`,
    },

    // The Vet Clinic (games/vet/). Dad welcomes Doctor Kaylee; Sparkle says who's coming in. The patients only bark,
    // whinny and trumpet; Dad hams it up when the tools land on him (at most one line every 12 s).
    vet: {
      open: nick(`The doctor is here!`),
      // Sparkle, as each patient hops in.
      patient: {
        puppy: 'A puppy with a sore paw! Grab a tool!',
        pony: 'A muddy pony! Bath time!',
        elephant: 'A baby elephant with a sniffly trunk!',
      } as Record<string, string>,
      // The elephant's big sneeze.
      bless: nick('Bless you!'),
      // Dad, as each patient is all better.
      healed: {
        puppy: nick("Look! He's wagging!"),
        pony: nick('So shiny and pretty!'),
        elephant: nick('Bye bye, little elephant!'),
      } as Record<string, Line>,
      // Sparkle, when all three are better.
      allDone: `Everyone is better! Thank you, Doctor!`,
      // Dad, when a tool lands on him.
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
        cream: onDevice('Rub cream on the sore paw!', 'Click and wiggle cream on the sore paw!'),
        bandage: 'Wrap a bandage round the paw!',
        soap: onDevice('Rub on lots of soap!', 'Click and wiggle on lots of soap!'),
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

    // The Barber Salon (games/barber/). Dad wants a new look; Sparkle says what's new each round; the kids in round 3
    // ask for a picture and say "close enough!" whatever she makes; Mom takes the photo at every reveal.
    barber: {
      open: nick(`I want a new look!`),
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
      mirror: onDevice('Tap the mirror!', 'Click the mirror!'),
      // The reveal: Dad poses (in turn), the kids giggle, Mom takes the photo.
      love: [nick('Whoa! I love it!'), nick('So handsome! I love it!')],
      enough: [by('kid')('Close enough!'), by('kid')('Close enough! So pretty!'), by('kid')('Close enough! Yay!')],
      cheese: ji('Say cheese!'),
      allDone: `Great haircuts!`,
      // The silly bits, in Dad's and Mom's voices.
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

    // Cafe & Cake (games/cafe/). Sparkle says what to do when something new comes; Dad and Mom order and drink in
    // their own voices (one line per drink); Dad's brain freeze and the ceiling splat get a laugh.
    cafe: {
      open: 'Drop fruit in the blender!',
      thirsty: nick(`I'm thirsty!`),
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
        nick: [nick(`Yum! Thank you!`), nick('Mmm! Just right!')],
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
      allDone: `Best cafe ever!`,
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

    // The Racing Slide (games/race/). Sparkle says what's new each race and counts down; Dad races her and dives
    // into the balls head first; she always wins.
    race: {
      open: onDevice(`A slide race! Tap the steps to climb!`, `A slide race! Click the steps to climb!`),
      raceYou: nick(`Race you!`),
      count: ['Three!', 'Two!', 'One!', 'Go!'],
      // The first time something new comes: tap to scoot, tap at a bump, the rubber rings.
      scoot: onDevice('Tap, tap, tap to go fast!', 'Click, click, click to go fast!'),
      bumps: onDevice('Now tap at each bump to fly!', 'Now click at each bump to fly!'),
      now: onDevice('Tap now!', 'Click now!'),
      rings: onDevice('Rubber rings! Tap to spin!', 'Rubber rings! Click to spin!'),
      // She wins (in turn); Dad lands head first; a kid cheers.
      win: [`You win!`, `You win again!`, `First place!`],
      dive: [nick('Head first! Whee!'), nick("I'm OK! Ha ha!")],
      goodRace: by('kid')(`Good race!`),
      allDone: `Three ribbons for you!`,
      // Sparkle, when the 👆 shows.
      hint: {
        climb: onDevice('Tap the steps to climb!', 'Click the steps to climb!'),
        race: onDevice('Tap to scoot faster!', 'Click to scoot faster!'),
      },
    },

    // Little Land's foam blocks (games/blocks/).
    blocks: {
      // The opening: Dad's bet, then Sparkle.
      higher: nick(`Can you build higher than me?`),
      grab: 'Grab a brick!',
      // Something new: the stack glows (round 1), the picture cards (round 2), Dad steps up (round 3).
      push: 'Push it over!',
      copy: 'Copy the picture!',
      elephant: 'Now an elephant!',
      taller: 'Taller than Dad!',
      // Dad, now and then: a brick half over the edge, a brick hat, a knock-down, the elephant coming alive.
      whoa: nick('Whoa! Careful!'),
      hat: nick('A brick hat? Ha ha!'),
      crash: [nick('Crash!'), nick('Ha ha! Again!'), nick('Boom!')],
      trunk: nick('Wow! An elephant!'),
      // Round 3: his sneeze at every tall tower, then (the first time) he gives in.
      sneeze: nick('Ah... ah... choo!'),
      beat: nick(`Taller than me!`),
      // Sparkle, when the finger shows after a while with nothing touched.
      hint: {
        box: 'Grab a brick from the box!',
        card: 'Put a brick on the picture!',
        tower: onDevice('Tap the tower to push it!', 'Click the tower to push it!'),
      },
      // The fact: when the chedi gets its spire, or the first time she pokes its card.
      chedi: 'A chedi is a Thai temple tower!',
    },

    // The Golden Mountain (games/mountain/).
    mountain: {
      // The opening (Sparkle).
      climb: `Climb the Golden Mountain! Count the holds!`,
      // The count, one number as each hold pops (up to round 3's seven).
      count: ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!'],
      // Something new: on top the first time, round 2's pink holds, round 3's race.
      top: `You made it!`,
      pink: 'Only the pink ones!',
      race: 'Race Dad to the top!',
      // Dad's race: the start, puffing up behind her, flopping over the rail, his head-first landing.
      win: nick("I'm going to win!"),
      huff: nick('Huff... puff...'),
      beat: nick(`You beat me!`),
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
      hello: by('coach')(`Sawasdee krap! First we say thank you.`),
      bow: onDevice('Tap your gloves to bow!', 'Click your gloves to bow!'),
      // The coach: after the three bows, after rounds 1 and 2, with the gold belt.
      dance: by('coach')('Now dance with me!'),
      again: by('coach')('Yes! Again!'),
      champion: by('coach')(`Champion!`),
      // Sparkle: something new (the drum, round 2's gold ring, Dad's pad, the kick).
      drum: 'Punch to the drum!',
      gold: "Punch when it's gold!",
      pad: "Follow Dad's pad!",
      kick: 'Big kick!',
      // Dad, now and then: a hook or a big POW, the pad going low, into the ropes, up with the pad again.
      strong: nick('Ooh, strong!'),
      oof: nick(`Oof! Good one!`),
      upDown: nick('Up high! Down low!'),
      ropes: nick('Whoa-oa-oa!'),
      hit: nick('Hit the pad!'),
      // Sparkle, when the finger shows after a while with nothing touched.
      hint: {
        gloves: onDevice('Tap your gloves!', 'Click your gloves!'),
        bag: 'Punch the bag!',
        pad: "Punch Dad's pad!",
      },
      // The facts: the first time she pokes the coach, and the star board.
      waiKru: by('coach')('The wai kru dance says thank you to your teacher!'),
      sport: "Muay Thai is Thailand's own sport!",
    },

    // The Sky Pod (games/skypod/).
    skypod: {
      // The opening: Dad, then Sparkle.
      fast: nick(`How fast are you?`),
      slap: 'Slap the lights!',
      // The count as her score climbs (rounds 1 and 3).
      count: ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!', 'Eight!', 'Nine!', 'Ten!'],
      // Round 2: before the wall plays, then her turn (the first time).
      listen: 'Listen!',
      play: 'Now you play it!',
      // Round 3, Dad: the race, she took his light, a miss, a rest, she wins.
      race: nick(`Race you!`),
      mine: nick("Hey! That one's mine!"),
      ow: nick('Ow, ow!'),
      rest: nick('Dad needs a rest!'),
      win: nick(`You win!`),
      // The finale: the score at a hundred.
      hundred: `A hundred! Super star!`,
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
      // Mom and Dad, the first time she rides each big slide.
      ride: {
        nose: ji('Wheee! Down the nose!'),
        dragon: nick('Whoa! Here come the dragons!'),
        roller: ji('Rattle rattle! Wheee!'),
        donut: nick('Round and round!'),
        zip: ji('Zoom! Go!'),
      },
      // Dad in the ball pit and the cannon: the first two bonks (in turn), then his big flop.
      bonk: [nick('Bonk! Hey!'), nick('Hey! Not my horn!')],
      flop: nick('Whoa! Splash!'),
      // Dad tapped in the balls (in turn); Mom tapped says her hall lines.
      nick: [nick('Ho ho! Hi!'), nick('Bonk me with the cannon!')],
      // Sparkle's fact, the first time she pokes the giant mask or a Phi Ta Khon on the roller's posts.
      phiTaKhon: 'Phi Ta Khon is a festival with big funny masks!',
      // Sparkle, when the finger shows after a while with nothing touched.
      hint: onDevice('Tap a slide to ride it!', 'Click a slide to ride it!'),
    },

    // The Pizza Company (pizza/).
    pizza: {
      // Sparkle at the menu; the server sets the pizza down; Sparkle's one instruction.
      menu: `Pick a pizza!`,
      served: by('server')('Pizza time!'),
      start: 'Pull a slice!',
      // Sparkle counting round the table, as each plate gets its first and second slice.
      count: {
        ji: ['One for Mom!', 'Two for Mom!'],
        nick: ['One for Dad!', 'Two for Dad!'],
        kaylee: [`One for you!`, `Two for you!`],
      } as Record<string, string[]>,
      // Dad with more than anyone (in turn), the cheese tug on his nose.
      ham: [nick("Mom's hungry too!"), nick('Ho ho! More for Dad!')],
      nose: nick('My nose!'),
      // Two each: the last two go in Agong's box; the lid closes; then Sparkle's fact once it's all shared.
      agong: ji('Those are for Agong!'),
      closed: nick('Yay! Pizza for Agong!'),
      fair: 'Sharing fairly means everyone gets the same!',
      // The pokes: the server's bow, Dad's chili sneeze, Mom's onion-ring bracelets (three in turn, then she eats one).
      thanks: by('server')('Khob khun ka!'),
      spicy: nick('So spicy!'),
      rings: [ji('Look! A bracelet!'), ji('So fancy!'), ji('Three bracelets!')],
      crunch: ji('Mmm! Crunchy!'),
      // Sparkle, when the finger shows after a while with nothing touched (or the menu waits).
      hint: {
        menu: onDevice('Tap a pizza!', 'Click a pizza!'),
        slice: 'Pull a slice to a plate!',
        box: "Put one in Agong's box!",
      },
    },

    // The trip around it: Mom's question, the goodbye, the Veloz, ICONSIAM, the counter, home.
    trip: {
      // Mom's card in the house, once there are two trips (🚤 or 🛝🍕).
      where: ji(`Where shall we go?`),
      // The goodbye and home, at Agong's house (TripHouse reads them from the TripDef: activities/mall-trip/words.ts).
      wish: by('agong')('Bring Agong something yummy!'),
      ready: nick(`Mom is driving! Hop in!`),
      home: ji("We're home!"),
      agong: by('agong')(`Ho ho! What is that?`),
      thanks: by('agong')(`Pizza! Thank you!`),
      pizza: { gan: by('gan')('Pizza?!'), ken: by('ken')('Pizza?!'), bb: by('bb')('Pizza?!') },
      hair: by('agong')("Ho ho ho! Look at Dad's hair!"),
      give: onDevice('Tap Agong to give him the box!', 'Click Agong to give him the box!'),
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
