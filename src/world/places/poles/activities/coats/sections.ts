// Snow Coats (greybox 5, plan: planning/around-the-world/poles.html): rub snow over the Arctic animals so their coats go
// white, watch the polar bear miss the white ones, then rub the summer back. #/world/poles/coats/<section>?painted=fox
// A section link sets the scene up as if she had played to there. Loaded at startup by the section index (keep
// perfect-freehand out of this file).
import { defineSections } from '../../../../kit/sections'

const COATS_SECTIONS = defineSections('poles', 'coats', {
  params: {
    painted: { default: '', doc: 'the animals already rubbed white (a comma list of fox, hare, ptarmigan, lemming): in hide they start white and hidden' },
  },
  sections: [
    { id: 'fox', name: 'Paint the fox' },
    { id: 'hide', name: 'Hide and seek', params: ['painted'], links: [{ label: 'Hide and seek', params: { painted: 'fox' }, also: [{ label: 'the lemming still brown', params: { painted: 'fox,hare,ptarmigan' } }] }] },
    { id: 'summer', name: 'Rub the summer back' },
  ],
})
export default COATS_SECTIONS
export type CoatsSection = (typeof COATS_SECTIONS)['sections'][number]['id']
