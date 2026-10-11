import { defineSections } from '../../../../kit/sections'

export default defineSections('peru', 'alpaca', {
  params: {
    yarn: { default: 'pink', doc: 'cream or pink yarn' },
    hats: { default: 'none', doc: 'Luna, Paco, Abuela hat colors; none for an empty tray selection' },
  },
  sections: [
    { id: 'story', name: 'Meet Luna' },
    { id: 'brush', name: 'Brush Luna' },
    { id: 'clip', name: 'Clip Luna' },
    { id: 'family', name: 'Clip the family' },
    { id: 'yarn', name: 'Dye the yarn' },
    { id: 'hats', name: 'Dress in hats', params: ['yarn', 'hats'] },
    { id: 'photo', name: 'Family photo', params: ['yarn', 'hats'] },
  ],
})
