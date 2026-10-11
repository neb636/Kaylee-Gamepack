import { defineSections } from '../../../../kit/sections'

/** Pizzeria deep links: #/world/italy/pizzeria/<section>?at=<step>&sauce=<color>&toppings=<kinds> (kit/sections.ts). */
export default defineSections('italy', 'pizzeria', {
  params: {
    at: {
      default: 'order',
      values: ['order', 'dough', 'pickSauce', 'sauce', 'cheese', 'quick', 'toppings', 'oven', 'cut', 'serve'],
      doc: 'where in the pizza to start (a kitchen step this pizza has, or oven/cut/serve); earlier steps are done for her',
    },
    sauce: { default: 'red', values: ['red', 'pink'], doc: 'the sauce color (her own pizza lets her pick)' },
    toppings: { default: '', doc: 'comma list of toppings already on, e.g. basil,olive,olive (default: what the order asks for)' },
  },
  sections: [
    { id: 'arrive', name: 'Arrive in Naples (story)' },
    { id: 'queen', name: "Queen Margherita's pizza (1889)", params: ['at', 'toppings'] },
    { id: 'break-1', name: 'First service done' },
    { id: 'bufala', name: 'Signora Bufala: 5 olives, halves', params: ['at', 'toppings'] },
    { id: 'gino', name: 'Gino: half and half, quarters', params: ['at', 'toppings'] },
    { id: 'break-2', name: 'Lunch rush done' },
    { id: 'own', name: 'Her own pizza (Cesare sneaks cheese)', params: ['at', 'sauce', 'toppings'] },
    { id: 'payoff', name: 'Payoff: chef hat and mandolin' },
  ],
})
