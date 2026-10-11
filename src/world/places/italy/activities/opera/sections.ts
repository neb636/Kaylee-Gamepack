import { defineSections } from '../../../../kit/sections'

/** Opera finale deep links: #/world/italy/party/<section>?solos=<friends> (kit/sections.ts). */
export default defineSections('italy', 'party', {
  params: {
    solos: { default: '', doc: 'comma list of friends who already had a solo: bruno, spina, cesare, gino, nino (later sections fill up to three)' },
  },
  sections: [
    { id: 'candles', name: 'Light the candles' },
    { id: 'owl', name: 'Baby owl: piano, soft' },
    { id: 'dance', name: 'Crowd dances: forte, loud' },
    { id: 'solo', name: 'Three solos', params: ['solos'] },
    { id: 'star', name: 'The wishing star', params: ['solos'] },
    { id: 'lupa', name: 'Lupa sings', params: ['solos'] },
    { id: 'high', name: "Lupa's high note", params: ['solos'] },
    { id: 'roses', name: 'Catch the roses', params: ['solos'] },
    { id: 'sky', name: 'Frecce Tricolori: paint the flag', params: ['solos'] },
    { id: 'picnic', name: 'Picnic: hug Lupa', params: ['solos'] },
  ],
})
