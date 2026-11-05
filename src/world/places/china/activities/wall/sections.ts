import { defineSections } from '../../../../kit/sections'

/** Great Wall deep links: #/world/china/wall/<section>?gap=<1|2|3>&hole=<1|2> (kit/sections.ts). */
export default defineSections('china', 'wall', {
  params: {
    gap: { default: '1', values: ['1', '2', '3'], doc: 'which gap in the wall (1: AB, 2: ABB, 3: ABC with two holes); earlier gaps are fixed for her' },
    hole: { default: '1', values: ['1', '2'], doc: "gap 3's hole she is on (2: the first one is already fixed)" },
  },
  sections: [
    { id: 'story', name: 'Hou Hou knocked bricks off (story)' },
    { id: 'follow', name: 'Slide the wall to follow Hou Hou', params: ['gap'] },
    { id: 'brick', name: 'Drag the missing brick', params: ['gap', 'hole'] },
    { id: 'beacon', name: 'Find the beacon tower' },
    { id: 'fire', name: 'Signal fires along the wall' },
  ],
})
