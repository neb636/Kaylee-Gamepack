// Every phrase Sparkle can say on the world map, passport and coloring book.
// `node scripts/world-voice-lines.mjs` copies every string here into voice-lines.json.
// (Plain strings only: this file is also read by Node, so it imports nothing. NAME matches KID_NAME.)
const NAME = 'Kaylee'

export const WORLD_LINES = {
  title: 'Around the World!',
  firstHello: `Let's fly around the world, ${NAME}! Tap the sparkly pin.`,
  hello: `Where should we fly, ${NAME}?`,
  takeoff: 'Up, up and away!',
  continents: {
    northAmerica: "That's North America!",
    southAmerica: "That's South America!",
    europe: "That's Europe!",
    africa: "That's Africa!",
    asia: "That's Asia! It's the biggest continent.",
    australia: "That's Australia! It's a country and a continent.",
    antarctica: "That's Antarctica! Brrr, it's icy!",
  },
  home: 'This is home!',
  soon: {
    egypt: "We'll fly to Egypt soon! It has pyramids!",
    china: "We'll fly to China soon! It has pandas!",
    thailand: "We'll fly to Thailand soon! It has elephants!",
  },
  passport: `This is your passport, ${NAME}! Every stamp is a place you helped.`,
  passportMore: 'Fly to more places to fill your passport!',
  coloringPick: 'Pick a page to color!',
  coloringHow: 'Pick a color, then tap to paint!',
  theaterName: "Sparkle's Theater!",
  theaterPick: 'Pick a video to watch!',
  videoEnd: `The end! Great watching, ${NAME}!`,
  videoOffline: "Oh no, the video can't play right now.",
  numbers: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
  praise: [`Great job, ${NAME}!`, 'Yay!', 'You did it!', `Amazing, ${NAME}!`, 'Super!', 'Hooray!'],
  tryAgain: "Hmm, let's try again!",
}
