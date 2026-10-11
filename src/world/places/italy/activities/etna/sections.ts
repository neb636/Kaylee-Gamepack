import { defineSections } from '../../../../kit/sections'

/** Snow on a Volcano deep links: #/world/italy/etna/<section>?fruit=<kinds>&snow=<n>&scarf=<yes|no>&served=<friends> (kit/sections.ts). */
export default defineSections('italy', 'etna', {
  params: {
    fruit: { default: '', doc: 'comma list of fruit already in the cart, e.g. lemon,orange,lemon (picked in the grove)' },
    snow: { default: '0', values: ['0', '1', '2', '3', '4'], doc: 'snow drifts already scooped into the cart (the snow field; 5 is the "full" section)' },
    scarf: { default: 'yes', values: ['yes', 'no'], doc: 'whether Nino wears the scarf from the trail post up in the cold' },
    served: { default: '', doc: 'comma list of friends who already got their granita: lupa, marina, pina' },
  },
  sections: [
    { id: 'arrive', name: 'Arrive at the beach (story)' },
    { id: 'beach', name: 'Lead Nino off the beach' },
    { id: 'grove', name: 'Lemon grove: pick fruit', params: ['fruit'] },
    { id: 'forest', name: 'Chestnut forest and stream', params: ['fruit'] },
    { id: 'cold', name: 'Snow falling: cold, the scarf', params: ['fruit'] },
    { id: 'snow', name: 'Snow field: bump five drifts', params: ['fruit', 'snow', 'scarf'] },
    { id: 'full', name: 'Full cart: zoom back down', params: ['fruit', 'scarf'] },
    { id: 'granita', name: 'Granita stand: three friends', params: ['fruit', 'served'] },
    { id: 'payoff', name: "Payoff: Nino's piano", params: ['fruit'] },
  ],
})
