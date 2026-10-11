import { defineSections } from '../../../../kit/sections'

export default defineSections('peru', 'machu-picchu', {
  params: {
    crops: { default: 'potato,corn,flower', doc: 'Comma list of crops on terraces, or none' },
  },
  sections: [
    { id: 'story', name: 'Meet Tika' },
    { id: 'wall-1', name: 'First wall', params: ['crops'] },
    { id: 'seeds-1', name: 'First crops', params: ['crops'] },
    { id: 'wall-2', name: 'Second wall', params: ['crops'] },
    { id: 'seeds-2', name: 'Second crops', params: ['crops'] },
    { id: 'wall-3', name: 'Third wall', params: ['crops'] },
    { id: 'seeds-3', name: 'Third crops', params: ['crops'] },
    { id: 'wall-4', name: 'Cloud wall', params: ['crops'] },
    { id: 'photo', name: 'Summit photo', params: ['crops'] },
  ],
})
