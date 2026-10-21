// The mall day at ICONSIAM (plan: planning/around-the-world/thailand/mall-trip.md), as deep-linkable sections:
// #/world/thailand/mall-trip/<section>?socks=<color>&games=<stickers so far>. So far: HarborLand's hall
// (hall?from=<the door she comes out of>, and hungry: Mommy asks "Pizza time?"), the mini games: the Vet Clinic
// (vet?patient=puppy|pony|elephant), the Barber Salon (barber?round=1|2|3&hair=<Daddy's hairdo>), Cafe & Cake
// (cafe?round=1|2|3), the Racing Slide (race?round=1|2|3), Little Land's foam blocks
// (blocks?round=1|2|3&card=chedi|elephant), the Big Frame (frame?at=in|pit|l1|l2|top|out: the level she's on), and
// the pizza toy (menu, then
// share?pizza=hawaiian|seafood|cheese&shared=0..8). Mommy's question, the Veloz, the lift and socks, the other mini
// games and home come in later gates (their sections are added then). Loaded at startup: keep three.js out of this
// file.
import { defineSections } from '../../../../kit/sections'
import { AT } from './harborland/layout'
import { PIZZAS } from './pizza/layout'

export const PATIENTS = ['puppy', 'pony', 'elephant'] as const
export type PatientId = (typeof PATIENTS)[number]

const MALL_SECTIONS = defineSections('thailand', 'mall-trip', {
  params: {
    socks: { default: 'pink', values: ['pink', 'lavender', 'mint'], doc: 'the grip socks she picked at the counter' },
    games: { default: '', doc: 'what she has played so far, a comma list of vet, barber, cafe, race, blocks and frame (any big ride in the Big Frame fills its sticker on her sock band)' },
    from: { default: 'in', values: ['in', 'vet', 'cafe', 'barber', 'race', 'frame', 'blocks'], doc: "the hall: the door she comes out of (in: she's just come in, by the bench)" },
    rides: { default: '', doc: 'the old name of games (links from PR #120 still work)' },
    hair: { default: '', doc: "Daddy's hairdo from the barber, which he keeps for the rest of the trip (games/barber/hair.ts): <lengths>.<colors>.<styles>.<bows>.<brows>, e.g. k.r (long and red), k.n.s (long spikes). Empty: his own mane" },
    patient: { default: 'puppy', values: PATIENTS, doc: "who's on the vet's table: the puppy's sore paw, the muddy pony's bath, the sniffly baby elephant" },
    round: { default: '1', values: ['1', '2', '3'], doc: 'the round of a mini game. The cafe: 1 blend anything, 2 orders in picture bubbles, 3 Thai drinks (cha yen, a coconut shake), two at once. The racing slide: 1 the first race, 2 tap at a bump to fly, 3 in spinning rubber rings. The barber: 1 grow and snip, 2 colors, the dryer, bows, 3 kids with picture cards. Little Land: 1 free stacking, 2 the picture cards, 3 taller than Daddy' },
    card: { default: 'chedi', values: ['chedi', 'elephant'], doc: "Little Land's picture card in round 2: the chedi, then the elephant" },
    pizza: { default: 'cheese', values: PIZZAS, doc: 'the pizza she picked at The Pizza Company: Hawaiian, Seafood or Double Cheese (the longest stretch)' },
    at: { default: 'in', values: AT, doc: "where she is in the Big Frame: in (just through the tunnel), pit (in the balls with Daddy), l1, l2, top (the levels) or out (on the mats in front)" },
    shared: { default: '0', values: ['0', '1', '2', '3', '4', '5', '6', '7', '8'], doc: "slices handed out so far, round the table (Mommy, Daddy, Kaylee) then into Agong's box: 6 starts at the last two, for Agong" },
  },
  sections: [
    { id: 'hall', name: 'HarborLand: walk the hall and pick a mini game', params: ['socks', 'games', 'from', 'hair'] },
    { id: 'vet', name: 'The Vet Clinic: heal the puppy, the pony and the baby elephant', params: ['socks', 'games', 'patient'] },
    { id: 'barber', name: "The Barber Salon: Daddy's new look (grow, snip, comb, colors), then kids with picture cards", params: ['socks', 'games', 'round', 'hair'] },
    { id: 'cafe', name: 'Cafe & Cake: blend, pour and serve drinks to Daddy and Mommy', params: ['socks', 'games', 'round'] },
    { id: 'race', name: 'The Racing Slide: climb, 3-2-1, scoot down into the balls', params: ['socks', 'games', 'round'] },
    { id: 'blocks', name: 'Little Land: stack the giant foam bricks, copy the card, build taller than Daddy', params: ['socks', 'games', 'round', 'card'] },
    { id: 'frame', name: 'The Big Frame: climb up, slide down (the mask, the dragons, the roller, the donut, the zip line), the cannon at Daddy', params: ['socks', 'games', 'at', 'hair'] },
    { id: 'hungry', name: "HarborLand: Daddy's tummy rumbles, Mommy asks: pizza time?", params: ['socks', 'games'] },
    { id: 'menu', name: 'The Pizza Company: pick a pizza', params: ['hair'] },
    { id: 'share', name: 'The Pizza Company: pull the cheesy slices and share them fairly', params: ['pizza', 'shared', 'hair'] },
  ],
})
export default MALL_SECTIONS
export type MallSection = (typeof MALL_SECTIONS)['sections'][number]['id']
