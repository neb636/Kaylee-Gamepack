// The mall day at ICONSIAM (plan: planning/around-the-world/thailand/mall-trip.md), as deep-linkable sections:
// #/world/thailand/mall-trip/<section>?socks=<color>&games=<stickers so far>. The trip loop: Mommy asks where to
// (invite: 🚤 or 🛝🍕), the goodbye at Agong's house and Mommy's grey Veloz (goodbye), ICONSIAM, the lift and the
// HarborLand counter (arrive), and home (home?photos=<the photos from the day>: the pizza box for Agong, the photo on
// his wall, the stamp); replay=1 plays it as a trip she has done before. In between: HarborLand's hall
// (hall?from=<the door she comes out of>&map=1 for the 🗺️ map of every mini game, and hungry: Mommy asks "Pizza time?"), the mini games: the Vet Clinic
// (vet?patient=puppy|pony|elephant), the Barber Salon (barber?round=1|2|3&hair=<Daddy's hairdo>), Cafe & Cake
// (cafe?round=1|2|3), the Racing Slide (race?round=1|2|3), Little Land's foam blocks
// (blocks?round=1|2|3&card=chedi|elephant), the Golden Mountain (mountain?round=1|2|3), Muay Thai (boxing?round=1|2|3:
// the wai kru and free punching, on the beat, Daddy's pad), the Sky Pod's lights (skypod?round=1|2|3), the Big Frame
// (frame?at=in|pit|l1|l2|top|out: the level she's on), and the pizza toy (menu, then
// share?pizza=hawaiian|seafood|cheese&shared=0..8). Loaded at startup: keep three.js out of this
// file.
import { defineSections } from '../../../../kit/sections'
import { AT } from './harborland/layout'
import { PIZZAS } from './pizza/layout'

export const PATIENTS = ['puppy', 'pony', 'elephant'] as const
export type PatientId = (typeof PATIENTS)[number]

const MALL_SECTIONS = defineSections('thailand', 'mall-trip', {
  params: {
    socks: { default: 'pink', values: ['pink', 'lavender', 'mint'], doc: 'the grip socks she picked at the counter' },
    games: { default: '', doc: 'what she has played so far, a comma list of vet, barber, cafe, race, blocks, mountain, boxing, skypod and frame (any big ride in the Big Frame fills its sticker on her sock band)' },
    from: { default: 'in', values: ['in', 'vet', 'cafe', 'barber', 'race', 'frame', 'blocks', 'mountain', 'boxing', 'skypod'], doc: "the hall: the door she comes out of (in: she's just come in, by the bench)" },
    map: { default: '', values: ['', '1'], doc: "the hall: 1 = HarborLand's map is open (every mini game as a big picture, in the hall's order: tap one and she goes there and in)" },
    rides: { default: '', doc: 'the old name of games (links from PR #120 still work)' },
    hair: { default: '', doc: "Daddy's hairdo from the barber, which he keeps for the rest of the trip (games/barber/hair.ts): <lengths>.<colors>.<styles>.<bows>.<brows>, e.g. k.r (long and red), k.n.s (long spikes). Empty: his own mane" },
    patient: { default: 'puppy', values: PATIENTS, doc: "who's on the vet's table: the puppy's sore paw, the muddy pony's bath, the sniffly baby elephant" },
    round: { default: '1', values: ['1', '2', '3'], doc: 'the round of a mini game. The cafe: 1 blend anything, 2 orders in picture bubbles, 3 Thai drinks (cha yen, a coconut shake), two at once. The racing slide: 1 the first race, 2 tap at a bump to fly, 3 in spinning rubber rings. The barber: 1 grow and snip, 2 colors, the dryer, bows, 3 kids with picture cards. Little Land: 1 free stacking, 2 the picture cards, 3 taller than Daddy. The Golden Mountain: 1 holds in a line, 2 only the pink ones, 3 race Daddy up the other side. Muay Thai: 1 the wai kru then free punching, 2 on the beat, 3 Daddy\'s pad and the big kick. The Sky Pod: 1 pop the lights, 2 copy the tune, 3 race Daddy to ten' },
    card: { default: 'chedi', values: ['chedi', 'elephant'], doc: "Little Land's picture card in round 2: the chedi, then the elephant" },
    pizza: { default: 'cheese', values: PIZZAS, doc: 'the pizza she picked at The Pizza Company: Hawaiian, Seafood or Double Cheese (the longest stretch)' },
    at: { default: 'in', values: AT, doc: "where she is in the Big Frame: in (just through the tunnel), pit (in the balls with Daddy), l1, l2, top (the levels) or out (on the mats in front)" },
    shared: { default: '0', values: ['0', '1', '2', '3', '4', '5', '6', '7', '8'], doc: "slices handed out so far, round the table (Mommy, Daddy, Kaylee) then into Agong's box: 6 starts at the last two, for Agong" },
    photos: { default: 'dragon', doc: "the photos from the day, a comma list of dragon (on the dragon slide) and cheese (Daddy's cheese nose at the pizza table): the first one goes on Agong's wall" },
    replay: { default: '', doc: '1 = she has done the whole mall day before: picking 🛝🍕 offers 🚗 the whole day, 🛝 straight to HarborLand (her socks from last time) or 🍕 straight to the table' },
  },
  sections: [
    { id: 'invite', name: 'Mommy asks: where shall we go? (🚤 or 🛝🍕)', params: ['replay'], group: 'Getting there' },
    { id: 'goodbye', name: "Goodbye at Agong's house (hugs), into Mommy's grey Veloz", params: ['replay'], group: 'Getting there' },
    { id: 'arrive', name: 'ICONSIAM: pull up by the river, the lift to 6, shoes off, socks on, the height chart', params: ['socks', 'replay'], group: 'Getting there' },
    { id: 'hall', name: 'HarborLand: walk the hall and pick a mini game (or tap 🗺️ for the map)', params: ['socks', 'games', 'from', 'hair', 'map'], group: 'HarborLand mini games', links: [{ label: 'HarborLand: walk the hall and pick a mini game', also: [{ label: 'the 🗺️ map', params: { map: '1', games: 'vet,cafe,race' } }] }] },
    { id: 'vet', name: 'The Vet Clinic: heal the puppy, the pony and the baby elephant', params: ['socks', 'games', 'patient'], group: 'HarborLand mini games' },
    { id: 'barber', name: "The Barber Salon: Daddy's new look (grow, snip, comb, colors), then kids with picture cards", params: ['socks', 'games', 'round', 'hair'], group: 'HarborLand mini games', links: [{ label: "The Barber Salon: Daddy's new look, grow and snip" }, { label: 'The Barber Salon: colors, the dryer and bows', params: { round: '2' } }, { label: 'The Barber Salon: kids come in with picture cards', params: { round: '3' } }] },
    { id: 'cafe', name: 'Cafe & Cake: blend, pour and serve drinks to Daddy and Mommy', params: ['socks', 'games', 'round'], group: 'HarborLand mini games' },
    { id: 'race', name: 'The Racing Slide: climb, 3-2-1, scoot down into the balls', params: ['socks', 'games', 'round'], group: 'HarborLand mini games' },
    { id: 'blocks', name: 'Little Land: stack the giant foam bricks, copy the card, build taller than Daddy', params: ['socks', 'games', 'round', 'card'], group: 'HarborLand mini games' },
    { id: 'mountain', name: 'The Golden Mountain: climb hold by hold, counting, ring the bell, zoom down the steel slide, then race Daddy', params: ['socks', 'games', 'round', 'hair'], group: 'HarborLand mini games' },
    { id: 'boxing', name: "Muay Thai: the wai kru, then punch the bag to the drum's beat, then Daddy's pad and the big kick", params: ['socks', 'games', 'round'], group: 'HarborLand mini games', links: [{ label: 'Muay Thai: the wai kru, then free punching' }, { label: 'Muay Thai: punch along on the beat', params: { round: '2' } }, { label: "Muay Thai: Daddy's pad and the big kick", params: { round: '3' } }] },
    { id: 'skypod', name: 'The Sky Pod: slap the lights, copy the tune, race Daddy to ten', params: ['socks', 'games', 'round'], group: 'HarborLand mini games' },
    { id: 'frame', name: 'The Big Frame: climb up, slide down (the mask, the dragons, the roller, the donut, the zip line), the cannon at Daddy', params: ['socks', 'games', 'at', 'hair'], group: 'HarborLand mini games' },
    { id: 'hungry', name: "HarborLand: Daddy's tummy rumbles, Mommy asks: pizza time?", params: ['socks', 'games'], group: 'HarborLand mini games' },
    { id: 'menu', name: 'The Pizza Company: pick a pizza', params: ['hair'], group: 'The Pizza Company' },
    { id: 'share', name: 'The Pizza Company: pull the cheesy slices and share them fairly', params: ['pizza', 'shared', 'hair'], group: 'The Pizza Company' },
    { id: 'home', name: "Home: the pizza box for Agong, the cousins' phones down, the photo on his wall, the stamp", params: ['socks', 'pizza', 'photos', 'hair'], group: 'Home' },
  ],
})
export default MALL_SECTIONS
export type MallSection = (typeof MALL_SECTIONS)['sections'][number]['id']
