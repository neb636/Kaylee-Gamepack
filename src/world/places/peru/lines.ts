// Import-free: scripts/world-voice-lines.mjs reads this as the exact speech manifest.
const luna = (text: string) => ({ text, voice: 'peru-luna' })
export const L = {
  name: 'Peru', title: 'Cozy Andes',
  intro: [luna('Hola, Kaylee! I’m Luna!'), luna('Let’s fill my explorer journal!')],
  hub: 'Tap the warm hat to help Luna!', hubNext: 'Where shall we explore?',
  next: luna('Another discovery, Kaylee!'), soon: 'This discovery opens soon!',
  expeditionSoon: 'Our expedition opens soon!', back: 'Tap the map to explore!',
  tickle: [luna('Hee hee! My fluffy ears!'), luna('I love exploring with you!')],
  cozy: {
    story: luna('Brrr! It’s chilly up here!'),
    prompts: ['Give Luna the warm hat!', 'Wrap Luna in the scarf!', 'Put on Luna’s warm jacket!', 'Pull the zipper up!'],
    reactions: [luna('Cozy ears!'), luna('Soft and snuggly!')],
    wrong: 'Find the warm, woolly one!', miss: 'Try the glowing spot!',
    zipHint: 'Pull up to the glowing star!', ready: luna('Ready to explore, Kaylee!'),
    names: ['Warm hat!', 'Scarf!', 'Warm jacket!'], praise: 'Great exploring, Kaylee!',
  },
  sticker: 'Alpaca sticker! Alpacas have soft fleece!',
  facts: {
    location: 'Peru is in South America!', hello: 'Hola means hello in Spanish!',
    languages: 'People also speak Quechua and Aymara!', weather: 'Peru has coast, mountains, and rainforest!',
    alpaca: 'Alpacas have soft fleece!', flag: 'Red, white, red! Peru’s flag!',
  },
  passport: 'This is Peru! Tap a picture to explore.',
  trophyWin: 'Kaylee, you did it! You won the Peru Explorer trophy!',
  trophyRoom: 'Kaylee, Peru Explorer! From Peru.',
}
