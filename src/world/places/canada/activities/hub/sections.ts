// Canada's hub, the train map, as deep-linkable spots: #/world/canada/hub/map?at=banff.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'

const HUB_SECTIONS = defineSections('canada', HUB, {
  params: {
    at: {
      default: 'quebec',
      values: ['msa', 'quebec', 'ottawa', 'forest', 'prairies', 'banff', 'rockies', 'bc'],
      doc: 'where the train is: a stop (msa = Mont-Sainte-Anne, quebec, ottawa, banff, bc = Vancouver) or on the way (forest = north of Lake Superior, prairies, rockies = just past the Spiral Tunnel)',
    },
    team: { default: '', doc: "her hockey team on Ottawa's canal (a comma list of activity ids: taffy, snowman, bike, campfire, canoe, bridge, whales, salmon); without it, one friend per stamp she has" },
  },
  sections: [{ id: 'map', name: 'Push the train across Canada', params: ['at', 'team'], links: [{ label: 'The whole country, then the train in Quebec City', bare: true }, { label: 'Push the train', also: [{ label: 'Mont-Sainte-Anne', params: { at: 'msa' } }, { label: 'Ottawa', params: { at: 'ottawa' } }, { label: 'Ottawa with a hockey team', params: { at: 'ottawa', team: 'bike,campfire,canoe,whales' } }, { label: 'the forests', params: { at: 'forest' } }, { label: 'the prairies', params: { at: 'prairies' } }, { label: 'Banff', params: { at: 'banff' } }, { label: 'out of the Spiral Tunnel', params: { at: 'rockies' } }, { label: 'Vancouver', params: { at: 'bc' } }] }] }, { id: 'book', name: "Maple's animal book", links: [{ label: "Maple's animal book (every animal she's met, grey shapes for the rest)" }] }],
})
export default HUB_SECTIONS
