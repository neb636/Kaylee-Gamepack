import { defineBookSections } from '../sections'
import { WORDS } from './lines'

export default defineBookSections('sparkly-abc', {
  params: {
    letter: { default: 'B', values: Object.keys(WORDS), doc: 'the letter Sparkle spies (A to Z)' },
    n: { default: '1', values: ['1', '2', '3', '4', '5', '6', '7', '8'], doc: 'page number in this sitting (1-8): later pages have more pictures' },
    found: { default: 'A,B,C,D,E,F,G,H', doc: 'the letters found this sitting, for the last page' },
  },
  sections: [
    { id: 'cover', name: 'The cover' },
    { id: 'page', name: 'Find the thing', params: ['letter', 'n'] },
    { id: 'found', name: '"B is for butterfly"', params: ['letter', 'n'] },
    { id: 'end', name: 'Found them all', params: ['found'] },
  ],
})
