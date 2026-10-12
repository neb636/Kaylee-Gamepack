import { defineSections } from '../../../../kit/sections'

export default defineSections('thailand', 'baan-chang', {
  params: {
    straw: { default: 'pink', values: ['pink', 'purple', 'yellow'], doc: "Kaylee's straw color" },
    cream: { default: 'yes', values: ['yes', 'no'], doc: 'Whipped cream on her chocolate milk' },
  },
  sections: [
    { id: 'arrive', name: 'Arrive at Baan Chang' },
    { id: 'coffee', name: "Daddy's iced coffee" },
    { id: 'cocoa', name: "Kaylee's chocolate milk" },
    { id: 'downstairs', name: 'Down to the elephants', params: ['straw', 'cream'] },
    { id: 'bananas', name: 'Banana time', params: ['straw', 'cream'] },
    { id: 'favorites', name: 'Favorite foods', params: ['straw', 'cream'] },
    { id: 'watermelon', name: 'Watermelon and the sneaky baby', params: ['straw', 'cream'] },
    { id: 'shower', name: 'Happy elephant shower', params: ['straw', 'cream'] },
  ],
})
