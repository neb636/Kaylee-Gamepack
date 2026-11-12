// The trip legs' recorded sounds (trip/sfx/, ElevenLabs) over their old synthesized ones (../../sfx.ts), which stay
// the fallbacks (tests, slow downloads). Each leg imports its own `xSfx as sfx`: the Thailand synth set with the
// recorded ones swapped in under the same names, plus a few new names where one synth sound meant two things.
//
// - The house (house-plugin.ts): things landing in the suitcase, its latches, footsteps on the stairs, the fan, the
//   cousins' phones, the van (its horn, its sliding door, driving off) and Mom's car's doors. The boings as things
//   fly, the pops and the giggles stay synthesized (toy sounds).
// - The airport (airport.ts): the terminal's hall, the suitcase on the x-ray belt, the belt rolling, the stamp.
import { bed, clip } from '../../../../kit/clips'
import { sfx } from '../../sfx'
import { tripClip as c } from '../sfx'

export const houseSfx = {
  ...sfx,
  thump: clip(c('house-thump'), sfx.thump, { vol: 0.7 }),
  /** The suitcase snaps shut. */
  latch: clip(c('house-latch'), sfx.latch, { vol: 0.8 }),
  step: clip(c('house-step'), sfx.thump, { vol: 0.45, jitter: 0.1 }),
  fan: clip(c('house-fan'), sfx.whir, { vol: 0.6 }),
  phone: clip(c('house-phone'), sfx.phone, { vol: 0.6 }),
  beep: clip(c('house-horn'), sfx.beep, { vol: 0.7 }),
  vanOpen: clip(c('house-van-open'), () => sfx.whoosh(0.5), { vol: 0.7 }),
  vanShut: clip(c('house-van-shut'), sfx.latch, { vol: 0.7 }),
  carOpen: clip(c('house-car-open'), sfx.creak, { vol: 0.7 }),
  carShut: clip(c('house-car-shut'), sfx.thump, { vol: 0.7 }),
  /** The van or the car driving off (or humming up to the door). */
  drive: clip(c('house-drive'), sfx.whir, { vol: 0.6 }),
}

export const airportSfx = {
  ...sfx,
  thump: clip(c('airport-plonk'), sfx.thump, { vol: 0.8 }),
  whir: clip(c('airport-belt'), sfx.whir, { vol: 0.6 }),
  stamp: clip(c('airport-stamp'), sfx.stamp, { vol: 0.9 }),
}

export const airportBed = () => bed(c('airport-hall'), 0.25)
