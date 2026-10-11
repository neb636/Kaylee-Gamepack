import { defineSections } from '../../../../kit/sections'

/** Dumpling House deep links: #/world/china/dumplings/<section>?at=<step>&baskets=<who:colors,...> (kit/sections.ts). */
export default defineSections('china', 'dumplings', {
  params: {
    at: {
      default: 'start',
      values: ['start', 'knead', 'snake', 'chop', 'roll', 'fill', 'pleat', 'quick', 'pleat3', 'order', 'color', 'goose', 'make', 'basket', 'stack', 'lid', 'cook'],
      doc: "where in the kitchen to start (a step that service has: k1 knead…pleat3/basket/lid/cook, k2 color/fill/pleat/goose/basket/stack/cook, k3 make/lid/cook); earlier steps are done for her",
    },
    baskets: {
      default: '',
      doc: "cooked baskets carried to the dining room, e.g. baobao:pink-green-cream-yellow-pink-green (who: grandpa, bunnies, goose, baobao); default: what that kitchen makes. In k3 it seeds Bao Bao's dumplings",
    },
  },
  sections: [
    { id: 'arrive', name: 'Arrive on the Bund (story)' },
    { id: 'walk', name: 'Walk through the old town' },
    { id: 'k1', name: "Kitchen 1: Grandpa Turtle's four dumplings", params: ['at'] },
    { id: 'd1', name: 'Dining 1: nibble, sip, eat', params: ['baskets'] },
    { id: 'break1', name: 'First service done' },
    { id: 'k2', name: 'Kitchen 2: bunny colors and the goose', params: ['at'] },
    { id: 'd2', name: 'Dining 2: two tables and tea', params: ['baskets'] },
    { id: 'break2', name: 'Lunch rush done' },
    { id: 'k3', name: "Kitchen 3: Bao Bao's six (sneaky monkey)", params: ['at', 'baskets'] },
    { id: 'd3', name: 'Dining 3: Bao Bao gobbles them', params: ['baskets'] },
    { id: 'payoff', name: 'Payoff' },
  ],
})
