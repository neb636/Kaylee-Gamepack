// What people say on a trip, as text bubbles only until the voices gate (greybox 2 has no new voice clips). When
// these get voices they move to lines.ts with their speakers' cast ids. Kaylee never talks (she giggles).
export type Who = 'sparkle' | 'ji' | 'nick' | 'agong' | 'jum' | 'gan' | 'ken' | 'bb' | 'sri' | 'officer'
export interface Said {
  who: Who
  text: string
}
const by = (who: Who) => (text: string): Said => ({ who, text })
const ji = by('ji')
const nick = by('nick')
const sri = by('sri')
const sparkle = by('sparkle')

export const TALK = {
  ask: {
    question: ji('Kaylee, are you ready to go on a trip?'),
    later: ji('OK! Tell me when!'),
  },
  pack: {
    start: ji('Tap your things to pack them, Kaylee!'),
    close: ji('All packed? Tap the suitcase to close it!'),
    hint: ji("It's hot and sunny at the sea!"),
    hungry: ji('Pack some more!'),
    full: ji("It's too full! Sit on it!"),
    gan: by('gan')('Five more minutes...'),
    pillow: ji('Yaaawn... sleepy!'),
    fan: ji('The fan blew it open!'),
    sunscreen: ji('Mommy always packs sunscreen!'),
    hat: ji("Here's Mommy's spare sun hat!"),
  },
  goodbye: {
    agong: by('agong')('Bring Agong a photo of the Nail Island!'),
    jum: by('jum')('Snacks for the trip!'),
    cousins: by('ken')('Bye...'),
    van: nick("Aunty Sri's van is here! Hop in!"),
    horn: sri('Beep beep! To the airport!'),
  },
  airport: {
    start: nick('Put your suitcase on the belt!'),
    laugh: by('officer')('Ha ha! What a suitcase!'),
    gan: by('officer')('A sleeping fox?!'),
    plane: nick('Our plane! Tap the door!'),
  },
  plane: {
    belt: ji('Seatbelt on, Kaylee!'),
    wheee: ji('Wheee!'),
    tray: ji('Tray down, then press the button!'),
    snore: ji('Night night!'),
    elephant: sparkle('Thailand looks like an elephant\'s head!'),
    trunk: sparkle("We're flying down the elephant's trunk!"),
    land: ji('Seatbelts on! We are landing!'),
    krabi: nick('Krabi! Yay!'),
    dad: nick('Snort! Huh? Are we there yet?'),
  },
}
