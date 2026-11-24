import { defineSections } from '../../../../kit/sections'

export default defineSections('peru', 'river', {
  params: {
    met: { default: 'auto', doc: 'Friends already greeted: none, capy, sloth or capy,sloth; auto uses the section' },
    fruit: { default: 'auto', doc: 'How many fruits are already down: 0 to 3; auto uses the section' },
    rival: { default: 'normal', values: ['slow', 'normal', 'fast'], doc: "The otters' pace (fast: they win, to see a loss)" },
    result: { default: 'win', values: ['win', 'lose'], doc: 'How the race ended' },
  },
  sections: [
    { id: 'story', name: 'Meet Rosa' },
    { id: 'treetops', name: 'Swim the treetops', params: ['met'], links: [{ label: 'Swim the treetops', also: [{ label: 'tune the feel', flags: { feel: '1' } }] }] },
    { id: 'fruit', name: 'Leap for the fruit', params: ['met', 'fruit'] },
    { id: 'race', name: 'Race the otters', params: ['rival'], links: [{ label: 'Race the otters', also: [{ label: 'otters too fast', params: { rival: 'fast' } }] }] },
    { id: 'rainbow', name: 'The rainbow', params: ['result'], links: [{ label: 'She wins' }, { label: 'So close', params: { result: 'lose' } }] },
  ],
})
