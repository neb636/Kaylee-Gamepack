import { defineSections } from '../../../../kit/sections'

/** Dragon Parade (China's finale) deep links: #/world/china/party/<section>?stamps=all (kit/sections.ts). */
export default defineSections('china', 'party', {
  sections: [
    { id: 'arrive', name: 'Friends join the dragon' },
    { id: 'drive', name: 'Lead the dragon around the plaza' },
    { id: 'drum', name: 'Drum and gong: dance wave' },
    { id: 'sky', name: 'Tap the sky: fireworks' },
    { id: 'flag', name: 'Raise the flag' },
    { id: 'envelope', name: 'Open the red envelope' },
  ],
})
