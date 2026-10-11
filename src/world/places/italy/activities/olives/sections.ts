import { defineSections } from '../../../../kit/sections'

/** Olive Grove deep links: #/world/italy/olives/<section> (kit/sections.ts). */
export default defineSections('italy', 'olives', {
  sections: [
    { id: 'story', name: 'Meet Spina (story)' },
    { id: 'grove', name: 'Comb the branches' },
    { id: 'ripen', name: 'Green to black, sort, taste' },
    { id: 'mill', name: 'The olive mill' },
    { id: 'pour', name: 'Pour to the line (full, half)' },
    { id: 'payoff', name: 'Payoff: bruschetta and tambourine' },
  ],
})
