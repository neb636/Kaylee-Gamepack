import { defineSections } from '../../../../kit/sections'

/** Hotpot Night deep links: #/world/china/hotpot/<section> (kit/sections.ts). Each round: drop, scoop, spin, serve. */
export default defineSections('china', 'hotpot', {
  sections: [
    { id: 'story', name: 'Nai Nai’s hotpot (story)' },
    { id: 'noodles-drop', name: 'Bao Bao’s noodles: drop them in' },
    { id: 'noodles-scoop', name: 'Noodles: scoop with chopsticks' },
    { id: 'noodles-spin', name: 'Noodles: spin to Bao Bao' },
    { id: 'noodles-serve', name: 'Noodles: Bao Bao says thank you' },
    { id: 'bokchoy-drop', name: 'Hong’s bok choy: the mild side' },
    { id: 'bokchoy-scoop', name: 'Bok choy: scoop' },
    { id: 'bokchoy-spin', name: 'Bok choy: spin to Hong' },
    { id: 'bokchoy-serve', name: 'Bok choy: Hong says thank you' },
    { id: 'dumplings-drop', name: 'Nai Nai’s two dumplings' },
    { id: 'dumplings-scoop', name: 'Dumplings: scoop two' },
    { id: 'dumplings-spin', name: 'Dumplings: spin to Nai Nai' },
    { id: 'dumplings-serve', name: 'Dumplings: Nai Nai says thank you' },
    { id: 'finale', name: 'Everyone eats together' },
  ],
})
