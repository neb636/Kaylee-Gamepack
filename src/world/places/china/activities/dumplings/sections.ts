// The Dumpling House in 3D (plan: planning/around-the-world/china/dumpling-house.html): Chef Fu's dumpling counter in
// Shanghai. #/world/china/dumplings/<section>?at=<step>&made=<dumplings>. A section link sets the counter up as if she
// had played to there. Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

export const STEPS = ['dough', 'fill', 'fold', 'steam', 'serve'] as const
export type Step = (typeof STEPS)[number]

const DUMPLING_SECTIONS = defineSections('china', 'dumplings', {
  params: {
    at: {
      default: 'dough',
      values: [...STEPS],
      doc: 'where in the round to start: dough (a fresh ball), fill (a flat wrapper), fold (filled, ready to fold or pleat), steam (the baskets full, lid next), serve (steamed, slide them across); earlier dumplings are made for her',
    },
    made: {
      default: '',
      doc: 'the dumplings she has made, e.g. pink,green,swirl-yellow,giant-pink (a color, swirl-<color>, and a giant- or tiny- size): the payoff puts them in the shop window',
    },
  },
  sections: [
    { id: 'open', name: 'Opening: Dou Dou and Chef Fu at the counter' },
    { id: 'play', name: 'The dough toy (free play, no orders)' },
    { id: 'grandpa', name: "Round 1: Grandpa Turtle's three", params: ['at'], links: [{ label: "Round 1: Grandpa Turtle's three", also: [{ label: 'fold', params: { at: 'fold' } }, { label: 'steam', params: { at: 'steam' } }, { label: 'serve', params: { at: 'serve' } }] }] },
    { id: 'colors', name: 'Round 2: the Bunny Twins and Mrs Goose', params: ['at'], links: [{ label: 'Round 2: the Bunny Twins and Mrs Goose', also: [{ label: 'pleat', params: { at: 'fold' } }, { label: 'serve two baskets', params: { at: 'serve' } }] }] },
    { id: 'giant', name: "Round 3: Bao Bao's biggest one", params: ['at'], links: [{ label: "Round 3: Bao Bao's biggest one", also: [{ label: 'pleat', params: { at: 'fold' } }, { label: 'serve', params: { at: 'serve' } }] }] },
    { id: 'payoff', name: 'Payoff: the claps and the shop window', params: ['made'], links: [{ label: 'Payoff: the claps and the shop window', also: [{ label: 'a giant one in the window', params: { made: 'cream,pink,green,swirl-yellow,giant-pink,tiny-green' } }] }] },
  ],
})
export default DUMPLING_SECTIONS
export type DumplingSection = (typeof DUMPLING_SECTIONS)['sections'][number]['id']
