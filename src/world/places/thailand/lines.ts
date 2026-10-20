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
}
