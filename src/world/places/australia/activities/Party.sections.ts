import { defineSections } from '../../../kit/sections'

export default defineSections('australia', 'party', {
  params: {
    danced: { default: 'auto', doc: 'comma list of dancers already done: mama,koko,shelly,kooky,chompy,pat; auto seeds earlier dancers, none starts with no dancers done' },
  },
  sections: [
    { id: 'story', name: 'The sunset party' },
    { id: 'mama', name: 'Mama dances', params: ['danced'] },
    { id: 'koko', name: 'Koko dances', params: ['danced'] },
    { id: 'shelly', name: 'Shelly dances', params: ['danced'] },
    { id: 'kooky', name: 'Kooky dances', params: ['danced'] },
    { id: 'chompy', name: 'Chompy dances', params: ['danced'] },
    { id: 'pat', name: 'Pat dances', params: ['danced'] },
    { id: 'fireworks', name: 'Party fireworks', params: ['danced'] },
  ],
})
