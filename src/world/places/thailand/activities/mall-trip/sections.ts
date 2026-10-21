// The mall day at ICONSIAM (plan: planning/around-the-world/thailand/mall-trip.md), as deep-linkable sections:
// #/world/thailand/mall-trip/<section>?socks=<color>&rides=<stickers so far>. Greybox 1 is only the HarborLand toy (the
// playground's three levels); Mommy's question, the Veloz, the lift and socks, the pizza and home come in later gates
// (their sections are added then). Loaded at startup: keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'

const MALL_SECTIONS = defineSections('thailand', 'mall-trip', {
  params: {
    socks: { default: 'pink', values: ['pink', 'lavender', 'mint'], doc: 'the grip socks she picked at the counter' },
    rides: { default: '', doc: 'stickers on her sock band so far, a comma list of pool, mountain, donut, zip, roller, dragon' },
  },
  sections: [
    { id: 'play', name: 'HarborLand: the ground floor, the ball pool and the cannon', params: ['socks', 'rides'] },
    { id: 'mountain', name: 'HarborLand: the Golden Mountain, the donut and the zip line', params: ['socks', 'rides'] },
    { id: 'dragon', name: 'HarborLand: the top, the roller slide and the dragon', params: ['socks', 'rides'] },
  ],
})
export default MALL_SECTIONS
export type MallSection = (typeof MALL_SECTIONS)['sections'][number]['id']
