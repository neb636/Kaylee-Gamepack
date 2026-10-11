import { defineSections } from '../../../../kit/sections'

/** Colosseum deep links: #/world/italy/colosseum/<section> (kit/sections.ts). */
export default defineSections('italy', 'colosseum', {
  sections: [
    { id: 'story', name: 'Meet Cesare (story)' },
    { id: 'shade', name: 'Pull the ropes: sun-shade' },
    { id: 'doors-1', name: 'Trapdoors I, II, III' },
    { id: 'doors-2', name: 'Trapdoors IV and V' },
    { id: 'finale', name: 'Every door opens, stadium wave' },
    { id: 'payoff', name: "Payoff: Cesare's bow and Roman horn" },
  ],
})
