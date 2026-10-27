// Animal Bridge (greybox 6, plan: planning/around-the-world/canada.html): the green wildlife bridge over the highway in
// Banff. #/world/canada/bridge/<section>?crossed=elk,sheep&green=0.5
// A section is the family she leads next; a link sets the scene up as if she had played to there (the families in
// `crossed` already graze in the meadow across the highway). Loaded at startup by the section index.
import { defineSections } from '../../../../kit/sections'

const BRIDGE_SECTIONS = defineSections('canada', 'bridge', {
  params: {
    crossed: { default: '', doc: 'the families already across the highway, a comma list of elk, sheep, bears (empty = what that section starts with: none, elk, elk and sheep, everyone)' },
    green: { default: '', doc: 'how planted the bridge is, 0 to 1 (empty = bare; the bears cross once it is about 0.6)' },
  },
  sections: [
    { id: 'elk', name: 'The elk family', params: ['crossed'] },
    { id: 'sheep', name: 'The bighorn sheep', params: ['crossed'] },
    { id: 'bears', name: 'The shy grizzlies', params: ['crossed', 'green'] },
    { id: 'album', name: 'The camera’s photos', params: ['crossed'] },
  ],
})
export default BRIDGE_SECTIONS
export type BridgeSection = (typeof BRIDGE_SECTIONS)['sections'][number]['id']
