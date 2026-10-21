// The mall day at ICONSIAM (plan: planning/around-the-world/thailand/mall-trip.md), as deep-linkable sections:
// #/world/thailand/mall-trip/<section>?socks=<color>&games=<stickers so far>. So far: HarborLand's first climbing toy
// (play, mountain, dragon: greybox 1), the first mini game, the Vet Clinic (vet?patient=puppy|pony|elephant), and the
// pizza toy (menu, then share?pizza=hawaiian|seafood|cheese&shared=0..8). Mommy's question, the Veloz, the lift and
// socks, the hall, the other mini games and home come in later gates (their sections are added then). Loaded at
// startup: keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'
import { PIZZAS } from './pizza/layout'

export const PATIENTS = ['puppy', 'pony', 'elephant'] as const
export type PatientId = (typeof PATIENTS)[number]

const MALL_SECTIONS = defineSections('thailand', 'mall-trip', {
  params: {
    socks: { default: 'pink', values: ['pink', 'lavender', 'mint'], doc: 'the grip socks she picked at the counter' },
    games: { default: '', doc: 'stickers on her sock band so far, a comma list of vet, pool, mountain, donut, zip, roller, dragon' },
    rides: { default: '', doc: 'the old name of games (links from PR #120 still work)' },
    patient: { default: 'puppy', values: PATIENTS, doc: "who's on the vet's table: the puppy's sore paw, the muddy pony's bath, the sniffly baby elephant" },
    pizza: { default: 'cheese', values: PIZZAS, doc: 'the pizza she picked at The Pizza Company: Hawaiian, Seafood or Double Cheese (the longest stretch)' },
    shared: { default: '0', values: ['0', '1', '2', '3', '4', '5', '6', '7', '8'], doc: "slices handed out so far, round the table (Mommy, Daddy, Kaylee) then into Agong's box: 6 starts at the last two, for Agong" },
  },
  sections: [
    { id: 'play', name: 'HarborLand: the ground floor, the ball pool and the cannon', params: ['socks', 'games'] },
    { id: 'mountain', name: 'HarborLand: the Golden Mountain, the donut and the zip line', params: ['socks', 'games'] },
    { id: 'dragon', name: 'HarborLand: the top, the roller slide and the dragon', params: ['socks', 'games'] },
    { id: 'vet', name: 'The Vet Clinic: heal the puppy, the pony and the baby elephant', params: ['socks', 'games', 'patient'] },
    { id: 'menu', name: 'The Pizza Company: pick a pizza' },
    { id: 'share', name: 'The Pizza Company: pull the cheesy slices and share them fairly', params: ['pizza', 'shared'] },
  ],
})
export default MALL_SECTIONS
export type MallSection = (typeof MALL_SECTIONS)['sections'][number]['id']
