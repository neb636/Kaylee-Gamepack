// The Poles' finale as deep-linkable spots: #/world/poles/party/<section>?stamps=all. Pole to Pole (Terry the Arctic
// tern flies the postcards from the top of the world to the bottom), the delivery at Pebble's colony, then the Polar
// Quiz on the big globe and the badge. Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

export const QUESTIONS = ['bear', 'penguin', 'south', 'north', 'ocean', 'coldest', 'tern', 'summer'] as const
export type Question = (typeof QUESTIONS)[number]

const PARTY_SECTIONS = defineSections('poles', 'party', {
  title: 'Pole to Pole and the Polar Quiz',
  params: {
    leg: { default: 'north', values: ['north', 'warm', 'south'], doc: 'where Terry starts flying: over the Arctic, the warm middle of the world, or the cold southern sea' },
    q: { default: 'bear', values: QUESTIONS, doc: 'the quiz question to start on' },
    stars: { default: '0', doc: 'stars already on her Polar Explorer badge (0-5)' },
  },
  sections: [
    { id: 'fly', name: 'Pole to Pole', params: ['leg'], links: [{ label: 'Pole to Pole: over the Arctic', also: [{ label: 'the warm middle', params: { leg: 'warm' } }, { label: 'the windy south', params: { leg: 'south' } }] }] },
    { id: 'deliver', name: 'The postcard for Pebble' },
    { id: 'quiz', name: 'Polar Quiz', params: ['q', 'stars'], links: [{ label: 'The Polar Quiz', params: { q: 'bear' }, also: [{ label: 'spin to the South Pole', params: { q: 'south' } }, { label: 'the coldest pole', params: { q: 'coldest' } }, { label: 'who visits both', params: { q: 'tern' } }, { label: 'summer up north', params: { q: 'summer' } }, { label: 'the last question', params: { q: 'ocean', stars: '5' } }] }] },
    { id: 'badge', name: 'Polar Explorer badge', links: [{ label: 'The Polar Explorer badge' }] },
  ],
})
export default PARTY_SECTIONS
export type PartySection = (typeof PARTY_SECTIONS)['sections'][number]['id']
