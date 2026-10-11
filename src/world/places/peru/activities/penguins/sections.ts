import { defineSections } from '../../../../kit/sections'

export default defineSections('peru', 'penguins', {
  params: {
    chicks: { default: 'auto', doc: 'Chick count: 2 or 3; auto uses the section' },
    fed: { default: 'auto', doc: 'Fish fed per chick, comma list; auto uses the section' },
    order: { default: 'auto', doc: 'Zero-based fish order; auto uses the section' },
    filled: { default: 'auto', doc: 'Fish already caught for this order; auto uses the section' },
  },
  sections: [
    { id: 'story', name: 'Meet Pepa' },
    { id: 'splash', name: 'Splash and dive', params: ['chicks', 'fed', 'order', 'filled'] },
    { id: 'fish', name: 'Catch fish', params: ['chicks', 'fed', 'order', 'filled'] },
    { id: 'feed', name: 'Feed the chicks', params: ['chicks', 'fed', 'order', 'filled'] },
    { id: 'twist', name: 'New chick', params: ['chicks', 'fed', 'order', 'filled'] },
    { id: 'swim', name: 'First swim', params: ['chicks', 'fed', 'order', 'filled'] },
    { id: 'parade', name: 'Penguin parade', params: ['chicks', 'fed', 'order', 'filled'] },
  ],
})
