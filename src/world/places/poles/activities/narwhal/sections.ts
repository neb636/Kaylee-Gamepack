// Narwhal Ride: steer Nari the narwhal, Pola and Pebble on her back, across the open water, among the icebergs, under
// the sea ice and past the glacier to Sparkle's balloon.
// #/world/poles/narwhal/<section>?channel=left&fish=9. A section link starts her at the beginning of that stretch.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const NARWHAL_SECTIONS = defineSections('poles', 'narwhal', {
  params: {
    channel: { default: 'middle', values: ['left', 'middle', 'right'], doc: 'which way round the big icebergs she starts toward: the left channel has the old blue iceberg and the belugas, the right one a jump' },
    fish: { default: '0', doc: 'how many fish Nari has scooped up (the counter in the corner)' },
  },
  sections: [
    { id: 'open', name: 'Open water' },
    { id: 'bergs', name: 'Among the icebergs', params: ['channel', 'fish'], links: [{ label: 'Among the icebergs', also: [{ label: 'the left channel', params: { channel: 'left' } }, { label: 'the right channel', params: { channel: 'right' } }] }] },
    { id: 'under', name: 'Under the sea ice', params: ['fish'] },
    { id: 'glacier', name: 'The glacier', params: ['fish'] },
    { id: 'balloon', name: 'At the balloon', params: ['fish'], links: [{ label: 'At the balloon', params: { fish: '14' } }] },
  ],
})
export default NARWHAL_SECTIONS
export type NarwhalSection = (typeof NARWHAL_SECTIONS)['sections'][number]['id']
