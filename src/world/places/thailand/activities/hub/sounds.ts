// Agong's house's sounds: the busy street (a bed of traffic, motorbikes zipping by, the old diesel truck now and then,
// no beeping), the tuk-tuk, the gate, the doors, the gecko, the cat, the birds, the clock, the rice cooker, the
// mattress, and a quiet indoor hum. Recorded clips (sfx/, ElevenLabs) with the synthesized ones as fallbacks.
import { bed, clip, playClip } from '../../../../kit/clips'
import { sfx as synth } from '../../sfx'
import { houseClip } from './sfx'

const bikes = ['bike-1', 'bike-2', 'bike-3'].map(houseClip)
const truck = houseClip('truck-diesel')
const mattress = houseClip('mattress-boing')

export const sounds = {
  /** A motorbike zipping past (`vol` softer for the ones we only hear). */
  bike: (vol = 1) => {
    if (!playClip(bikes[Math.floor(Math.random() * bikes.length)], { vol, rate: 0.95 + Math.random() * 0.1 })) synth.putt()
  },
  /** The old diesel truck rumbling by. */
  truck: (vol = 0.8) => {
    if (!playClip(truck, { vol })) synth.putt()
  },
  taxi: clip(houseClip('taxi-pass'), synth.putt, { vol: 0.8 }),
  tukArrive: clip(houseClip('tuktuk-arrive'), synth.putt, { vol: 0.9, jitter: 0 }),
  tukAway: clip(houseClip('tuktuk-away'), synth.putt, { vol: 0.9, jitter: 0 }),
  gate: clip(houseClip('gate-rattle'), synth.rattle, { vol: 0.8, jitter: 0.02 }),
  jiggle: clip(houseClip('door-jiggle'), synth.jiggle, { vol: 0.8 }),
  open: clip(houseClip('door-open'), synth.fwip, { vol: 0.7 }),
  gecko: clip(houseClip('gecko'), synth.tukkae, { vol: 0.6, jitter: 0.02 }),
  meow: clip(houseClip('cat-meow'), synth.meow, { vol: 0.7 }),
  birds: clip(houseClip('birds-chirp'), synth.chirp, { vol: 0.6 }),
  tick: clip(houseClip('clock-tick'), synth.tick, { vol: 0.7, jitter: 0.02 }),
  steam: clip(houseClip('rice-cooker'), synth.puff, { vol: 0.7 }),
  /** The mattress boing, higher with each bounce. */
  boingAt: (level: number) => {
    if (!playClip(mattress, { vol: 0.8, rate: 0.9 + level * 0.07 })) synth.boingAt(level)
  },
  streetBed: () => bed(houseClip('street-bed'), 0.4),
  indoorBed: () => bed(houseClip('indoor-bed'), 0.3),
}
