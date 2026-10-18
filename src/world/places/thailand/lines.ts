// Every phrase that can be spoken in Thailand. `node scripts/world-voice-lines.mjs` turns this into voice-lines.json.
// (This file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
// Thailand's friends are Kaylee's own family, as animal characters (planning/around-the-world/thailand.md). Sparkle
// guides (plain strings); the family say hello in their own voices (cast.json), with the Thai hello: Sawasdee, ending
// in "ka" from the women and "krub" from the men. Straight apostrophes only: curly ones failed the transcription check
// in PR #63.
const NAME = 'Kaylee'

type Line = string | { text: string; voice: string }
const by = (voice: string) => (text: string) => ({ text, voice })

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
  },

  // Sparkle, at Agong's house: at most two lines before her hands are busy, then only when something is new or she
  // seems stuck.
  house: {
    arrive: `We're at Agong's house in Thailand, ${NAME}!`,
    door: 'Tap the door to go inside!',
    inside: 'Tap your family to say hello!',
    upstairs: 'This is your room! Try the mattress!',
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
}
