import { defineSections } from '../../../../kit/sections'

/** The balloon finale's deep links: #/world/peru/party/<section>?gifts=<friend:gift,...> (kit/sections.ts). Later
 *  sections give the friends of earlier stops a present each when the link doesn't say. */
export default defineSections('peru', 'party', {
  params: {
    gifts: { default: '', doc: 'who has which present so far: friend:gift pairs (friends pepa, chick, lobo, coco, pluma, tika, sloth, monkey, rosa; gifts party, crown, chullo, bow, shades)' },
  },
  sections: [
    { id: 'story', name: 'Luna: the journal is full (story)' },
    { id: 'coast', name: 'The coast: Pepa, her chick and Lobo', params: ['gifts'] },
    { id: 'mountains', name: 'The mountains: Coco, Pluma and Tika', params: ['gifts'] },
    { id: 'forest', name: 'The rainforest: the sloth, the monkey and Rosa', params: ['gifts'] },
    { id: 'night', name: 'Night: lanterns, the flag and gracias', params: ['gifts'] },
  ],
})
