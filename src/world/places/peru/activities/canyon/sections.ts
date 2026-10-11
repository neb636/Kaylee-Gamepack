import { defineSections } from '../../../../kit/sections'

export default defineSections('peru', 'condor', {
  params: {
    places: { default: 'auto', doc: 'Visited places: falls,condors,lookout,ridge; auto uses the section' },
    confidence: { default: 'auto', doc: 'Pluma confidence from 0 to 1; auto uses the section' },
  },
  sections: [
    { id: 'story', name: 'Meet Coco' },
    { id: 'start', name: 'Grab Coco', params: ['places', 'confidence'] },
    { id: 'morning', name: 'Warm swirls', params: ['places', 'confidence'] },
    { id: 'follow', name: 'Lead Pluma', params: ['places', 'confidence'] },
    { id: 'ridge', name: 'High ridge', params: ['places', 'confidence'] },
    { id: 'solo', name: 'Pluma flies', params: ['places', 'confidence'] },
    { id: 'finale', name: 'Condor photo', params: ['places', 'confidence'] },
  ],
})
