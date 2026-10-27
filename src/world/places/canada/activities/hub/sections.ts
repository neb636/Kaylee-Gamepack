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
  },
  sections: [{ id: 'map', name: 'Push the train across Canada', params: ['at'] }],
})
export default HUB_SECTIONS
