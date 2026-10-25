// The Nan road trip (plan: planning/around-the-world/thailand/nan-trip.md), as deep-linkable sections:
// #/world/thailand/nan-trip/<section>?road=<which road>. Built so far (greyboxes): the mountain road, the Pajero
// steered along any of the four roads (drive?road=city|valley|sky|three, step 1), and Baan Huanam Mushroom Farm
// (mushrooms?round=1|2|3|pizza&basket=<what she picked>, step 2): mist the sawdust bags, pick into the basket (pink
// and gold in round 3), then top the mushroom pizza with her basket; and Kaylee's rice farm under Stop Time Cafe
// (rice?round=plant|grow|harvest|thresh|deck, step 3): lead Kaylee through the paddies to plant them, shoo the birds
// while it grows, cut the golden rice, bang out the grains, then the pink milk and Mommy's photo on the deck; and Bo Kluea's salt wells (salt?round=1|2|3,
// step 4): dip the bucket in the well and pour the brine into the big pan, feed the fire till it boils down, scrape
// the salt into her basket. The rental desk, the Nan map, the 3 from
// above and home come with their own greyboxes, each adding its section here. Loaded at startup: keep three.js out
// of this file.
import { defineSections } from '../../../../kit/sections'
import { ROAD_IDS } from './drive/roads'
import { ROUNDS as FARM_ROUNDS } from './mushrooms/layout'
import { ROUNDS as RICE_ROUNDS } from './rice/layout'

const NAN_SECTIONS = defineSections('thailand', 'nan-trip', {
  params: {
    road: { default: 'valley', values: ROAD_IDS, doc: 'which road the drive plays: city (through Nan town to its market, over the river), valley (the rice fields to the mushroom farm: chickens, a songthaew, a buffalo crossing), sky (up Doi Phu Kha: blind bends with round mirrors, into the cloud and out above it) or three (down the hairpins, counting the bends, then the 3 from the viewpoint)' },
    round: { default: '1', values: [...new Set([...FARM_ROUNDS, ...RICE_ROUNDS])], doc: "the step of the stop on screen. The mushroom farm: 1 mist the sawdust bags until grey oyster mushrooms pop and swell, 2 pick them into the basket (keep spraying one and it grows giant), 3 new bags with pink and golden mushrooms, pizza top the mushroom pizza with her basket, bake it and share it. The rice farm (lead Kaylee with a finger; what she walks through changes behind her): plant the seedlings plip in behind her (paddy A is flooded, the other three are dry until she opens their gates), grow the rice grows from green to gold while she shoos the birds off it, harvest she cuts the golden rice into bundles (the water drained), thresh she swings each bundle from the drying rack and bangs it on the board, the grains spray into the basket, the straw onto the pile, then the steaming kratip of sticky rice, deck the sticky rice, the pink milk, Mommy's photo and the rice video on Stop Time Cafe's deck" },
    basket: { default: '', doc: "the mushrooms in her basket, <color><count> pairs of grey, pink and gold, e.g. grey5,pink2,gold1. Empty: what she'd have by then (nothing in rounds 1 and 2, grey6 in round 3, grey4,pink2 at the pizza)" },
  },
  sections: [
    { id: 'drive', name: 'The mountain road: steer the silver Pajero', params: ['road'] },
    { id: 'mushrooms', name: 'Baan Huanam Mushroom Farm: mist the bags, pick the mushrooms, top the pizza', params: ['round', 'basket'] },
    { id: 'rice', name: "Kaylee's rice farm: plant the paddies, shoo the birds, cut the rice, the café's deck", params: ['round'] },
    { id: 'salt', name: 'Bo Kluea salt wells: dip and pour the brine (round 1), feed the fire (2), scrape the salt into the basket (3)', params: ['round'] },
  ],
})
export default NAN_SECTIONS
export type NanSection = (typeof NAN_SECTIONS)['sections'][number]['id']
