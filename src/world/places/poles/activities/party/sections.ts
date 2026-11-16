// The Poles' finale as deep-linkable spots: #/world/poles/party/<section>?stamps=all. The flight home (Terry the
// Arctic tern leads Sparkle's balloon from the top of the world to the bottom), Papa's song (Pebble finds Papa in the
// colony by his own tune), then Terry's Polar Explorer quiz on the big globe and the badge. The three films between
// them are links of their own (#/world/poles/story/home-in, home-land, home-reunion); a section link here opens
// straight at that section, with no film before it. Loaded at startup by the section index (keep three.js out of this
// file).
import { defineSections } from '../../../../kit/sections'

export const QUESTIONS = ['bear', 'penguin', 'south', 'north', 'ocean', 'coldest', 'tern', 'summer'] as const
export type Question = (typeof QUESTIONS)[number]

const PARTY_SECTIONS = defineSections('poles', 'party', {
  title: "The way home, Papa's song and the Polar Explorer quiz",
  note: 'The finale opens once every stamp is in (add ?stamps=all to try it). With no section in the link it starts with the film of the balloon lifting off.',
  params: {
    leg: { default: 'north', values: ['north', 'warm', 'south'], doc: 'where the flight starts: over the Arctic, the warm middle of the world, or the cold southern sea' },
    round: { default: '1', values: ['1', '2', '3'], doc: "Papa's song: 1 Pebble finds Papa (three dads), 2 another chick and five dads, 3 the snowstorm (by listening alone)" },
    q: { default: 'bear', values: QUESTIONS, doc: 'the quiz question to start on (a fresh quiz always starts with taking Pola home)' },
    stars: { default: '0', doc: 'stars already on her Polar Explorer badge (0-3)' },
  },
  sections: [
    { id: 'fly', name: 'The flight home', params: ['leg'], links: [{ label: 'The flight home: over the Arctic', also: [{ label: 'the warm middle', params: { leg: 'warm' } }, { label: 'the cold south', params: { leg: 'south' } }] }] },
    { id: 'song', name: "Papa's song", params: ['round'], links: [{ label: "Papa's song: Pebble finds Papa", also: [{ label: 'another chick, five dads', params: { round: '2' } }, { label: 'the snowstorm', params: { round: '3' } }] }] },
    { id: 'quiz', name: "Terry's Polar Explorer quiz", params: ['q', 'stars'], links: [{ label: 'The quiz: take Pola home', params: { q: 'bear' }, also: [{ label: 'spin to the South Pole', params: { q: 'south' } }, { label: 'the coldest pole', params: { q: 'coldest' } }, { label: 'who visits both', params: { q: 'tern' } }, { label: 'summer up north', params: { q: 'summer' } }, { label: 'the last question', params: { q: 'ocean', stars: '3' } }] }] },
    { id: 'badge', name: 'Polar Explorer badge', links: [{ label: 'The Polar Explorer badge' }] },
  ],
})
export default PARTY_SECTIONS
export type PartySection = (typeof PARTY_SECTIONS)['sections'][number]['id']
