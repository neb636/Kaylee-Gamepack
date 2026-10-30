// Canada's hub, the 3D pin map, as deep-linkable spots: #/world/canada/hub/map?at=banff.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'

const HUB_SECTIONS = defineSections('canada', HUB, {
  params: {
    at: {
      default: 'quebec',
      values: ['msa', 'quebec', 'ottawa', 'forest', 'prairies', 'banff', 'rockies', 'bc'],
      doc: 'legacy region from older train links; all values now open the full map with every activity pin visible',
    },
    team: { default: '', doc: "her hockey team on Ottawa's canal (a comma list of activity ids: taffy, snowman, bike, campfire, canoe, bridge, whales, salmon); without it, one friend per stamp she has" },
  },
  sections: [
    { id: 'map', name: 'Pick a pin in Canada', params: ['at', 'team'], links: [
      { label: 'Choose any activity on the 3D map' },
      { label: 'With the hockey team in Ottawa', params: { team: 'bike,campfire,canoe,whales' } },
    ] },
    { id: 'book', name: "Maple's animal book", links: [{ label: "Maple's animal book (every animal she's met, grey shapes for the rest)" }] },
  ],
})
export default HUB_SECTIONS
