import { defineSections } from '../../../../kit/sections'

export default defineSections('egypt', 'nile', {
  sections: [
    { id: 'story', name: 'Miu’s story' },
    { id: 'sail-1', name: 'Lotus flowers', links: [{ label: 'Lotus flowers', also: [{ label: 'tune the feel', flags: { feel: '1' } }] }] },
    { id: 'farm-1', name: 'The first water wheel' },
    { id: 'sail-2', name: 'The hippo’s flowers' },
    { id: 'farm-2', name: 'The second water wheel' },
    { id: 'end', name: 'The lotus crown' },
  ],
})
