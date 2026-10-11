import { defineSections } from '../../../kit/sections'

export default defineSections('egypt', 'party', {
  params: { lights: { default: 'left:0,big:1,right:2,sphinx:3,left:4,big:5', doc: 'Earlier lights: monument and color index, comma separated' } },
  sections: [
    { id: 'story', name: 'Light show story' },
    { id: 'wake-1', name: 'Wake friend 1', params: ['lights'] },
    { id: 'wake-2', name: 'Wake friend 2', params: ['lights'] },
    { id: 'wake-3', name: 'Wake friend 3', params: ['lights'] },
    { id: 'wake-4', name: 'Wake friend 4', params: ['lights'] },
    { id: 'wake-5', name: 'Wake friend 5', params: ['lights'] },
    { id: 'wake-6', name: 'Wake friend 6', params: ['lights'] },
    { id: 'flag', name: 'Raise the flag', params: ['lights'] },
    { id: 'fireworks', name: 'Fireworks', params: ['lights'] },
  ],
})
