// The sounds every Samet stage shares, recorded (sfx.json, ElevenLabs) over the synthesized kit and Thailand sounds,
// which stay as their fallbacks: the sea's splash, a cartoon boing, a soft thud on the sand, a pop, a cloth fwip,
// Mom's phone shutter, munching, a whoosh, and the beach's waves. A stage imports `sametSfx as sfx` in place of the
// kit's or Thailand's `sfx`, so every call it already makes gets the recorded sound. Tuned chimes, the countdown and
// Kaylee's giggle stay synthesized (in tune, and she has no voice clip).
import { bed, clip } from '../../../../../kit/clips'
import { sfx as kit } from '../../../../../kit/sfx'
import { sfx as thai } from '../../../sfx'
import { sametClip as c } from '.'

export const sametSfx = {
  ...kit,
  ...thai,
  splash: clip(c('samet-splash'), thai.splash, { vol: 0.75, jitter: 0.08 }),
  boing: clip(c('samet-boing'), kit.boing, { vol: 0.6, jitter: 0.06 }),
  thump: clip(c('samet-thump'), kit.thump, { vol: 0.8 }),
  pop: clip(c('samet-pop'), thai.pop, { vol: 0.6, jitter: 0.08 }),
  fwip: clip(c('samet-fwip'), kit.fwip, { vol: 0.5, jitter: 0.08 }),
  shutter: clip(c('samet-shutter'), thai.shutter, { vol: 0.7 }),
  munch: clip(c('samet-munch'), thai.munch, { vol: 0.7 }),
  whoosh: clip(c('samet-whoosh'), thai.whoosh, { vol: 0.5 }),
}

/** Waves on a sandy beach, gulls far off, a breeze, until stop() (put it in the stage's bag: `{ dispose: beachBed() }`). */
export const beachBed = (vol = 0.28) => bed(c('samet-beach'), vol)
