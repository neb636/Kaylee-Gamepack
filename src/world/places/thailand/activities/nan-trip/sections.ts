// The Nan road trip (plan: planning/around-the-world/thailand/nan-trip.md), as deep-linkable sections:
// #/world/thailand/nan-trip/<section>?road=<which road>. Built so far (greyboxes): the mountain road, the Pajero
// steered along any of the four roads (drive?road=city|valley|sky|three, step 1), and Baan Huanam Mushroom Farm
// (mushrooms?round=1|2|3|pizza&basket=<what she picked>, step 2): mist the sawdust bags, pick into the basket (pink
// and gold in round 3), then top the mushroom pizza with her basket. The rental desk, the Nan map, the other three
// stops, the 3 from above and home come with their own greyboxes, each adding its section here. Loaded at startup:
// keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'
import { ROAD_IDS } from './drive/roads'
import { ROUNDS } from './mushrooms/layout'

const NAN_SECTIONS = defineSections('thailand', 'nan-trip', {
  params: {
    road: { default: 'valley', values: ROAD_IDS, doc: 'which road the drive plays: city (Nan town to Wat Phumin, over the river), valley (the rice fields to the mushroom farm: chickens, a songthaew, a buffalo crossing), sky (up Doi Phu Kha: blind bends with round mirrors, into the cloud and out above it) or three (down the hairpins, counting the bends, then the 3 from the viewpoint)' },
    round: { default: '1', values: ROUNDS, doc: 'the step of the stop on screen. The mushroom farm: 1 mist the sawdust bags until grey oyster mushrooms pop and swell, 2 pick them into the basket (keep spraying one and it grows giant), 3 new bags with pink and golden mushrooms, pizza top the mushroom pizza with her basket, bake it and share it' },
    basket: { default: '', doc: "the mushrooms in her basket, <color><count> pairs of grey, pink and gold, e.g. grey5,pink2,gold1. Empty: what she'd have by then (nothing in rounds 1 and 2, grey6 in round 3, grey4,pink2 at the pizza)" },
  },
  sections: [
    { id: 'drive', name: 'The mountain road: steer the silver Pajero', params: ['road'] },
    { id: 'mushrooms', name: 'Baan Huanam Mushroom Farm: mist the bags, pick the mushrooms, top the pizza', params: ['round', 'basket'] },
  ],
})
export default NAN_SECTIONS
export type NanSection = (typeof NAN_SECTIONS)['sections'][number]['id']
