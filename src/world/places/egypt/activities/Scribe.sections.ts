import { defineSections } from '../../../kit/sections'

export default defineSections('egypt', 'scribe', {
  params: { letters: { default: 'basket,vulture,reeds,lion,reed,reed', doc: 'Written glyphs, in name order (comma separated)' } },
  sections: [
    { id: 'story', name: 'Scribe story' },
    { id: 'k', name: 'Letter K', params: ['letters'] },
    { id: 'a', name: 'Letter A', params: ['letters'] },
    { id: 'y', name: 'Letter Y', params: ['letters'] },
    { id: 'l', name: 'Letter L', params: ['letters'] },
    { id: 'e-1', name: 'First E', params: ['letters'] },
    { id: 'e-2', name: 'Second E', params: ['letters'] },
    { id: 'framed', name: 'Golden cartouche', params: ['letters'] },
  ],
})
