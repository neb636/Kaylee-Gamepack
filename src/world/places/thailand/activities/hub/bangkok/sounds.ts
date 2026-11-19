// The Bangkok map's sounds (the voices are lines.ts L.bangkok): the Nan map's toy-board sounds (the zoom, the dive,
// the stamp, the rain), and the city's own recordings (sfx/, ElevenLabs) for what she pokes: the skytrain, the river
// boats, Asiatique's wheel, Chinatown's drum, the lizard's plop, the port's crane, the flower market, ICONSIAM's
// fountain, Bang Krachao's birds, the night market, the floating market, the orchard, all over the city humming by
// its river. Every recorded clip keeps its synthesized
// fallback; the towers' note runs stay synthesized.
import { bed, clip } from '../../../../../kit/clips'
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'
import { mapSfx as nanMap } from '../../nan-trip/map/sounds'
import { nanClip } from '../../nan-trip/sfx'
import { bangkokClip as c } from './sfx'

const notes = (base: number, steps: number[], gap = 0.07) => steps.forEach((s, i) => tone(base * Math.pow(2, s / 12), base * Math.pow(2, s / 12), 0.18, 0.045, 'triangle', i * gap))

export const mapSfx = {
  ...nanMap,
  /** The skytrain zooming off, and its doors' ding-dong. */
  train: clip(c('skytrain'), sfx.whoosh, { vol: 0.6 }),
  doors: clip(c('skytrain-chime'), () => notes(660, [4, 0], 0.22), { vol: 0.5, jitter: 0 }),
  /** A river boat's toot toot. */
  horn: clip(c('boat-horn'), sfx.toot, { vol: 0.55 }),
  /** Asiatique's wheel: a little fairground tune. */
  wheel: clip(c('wheel'), () => notes(523, [0, 4, 7, 12, 7, 12], 0.11), { vol: 0.5, jitter: 0 }),
  /** Chinatown: a lion dance drum. */
  drum: clip(c('lion-drum'), () => [0, 0.14, 0.28, 0.5].forEach((d) => noise(0.08, 0.09, 'lowpass', 300, 180, d, 2)), { vol: 0.55 }),
  /** The monitor lizard slides into the lake. */
  lizard: clip(c('lizard'), nanMap.plip, { vol: 0.7 }),
  /** The port's crane lowers a box. */
  crane: clip(c('crane'), sfx.whir, { vol: 0.5 }),
  /** The flower market throws its petals. */
  petals: clip(c('petals'), sfx.puff, { vol: 0.6 }),
  /** ICONSIAM's fountain dances. */
  fountain: clip(c('fountain'), () => noise(1.4, 0.05, 'highpass', 2500, 4000, 0, 0.8), { vol: 0.5 }),
  /** Bang Krachao's birds fly up. */
  birds: clip(c('birds'), nanMap.flutter, { vol: 0.6 }),
  /** The night market: a happy little tune as its tents hop. */
  market: clip(c('night-market'), () => notes(587, [0, 4, 7, 4, 9, 7, 12], 0.1), { vol: 0.5, jitter: 0 }),
  /** The floating market: paddles knock and the boats slap the water. */
  paddle: clip(c('floating-market'), () => [0, 0.16, 0.32, 0.48].forEach((d) => noise(0.07, 0.05, 'lowpass', 700, 300, d, 1.2)), { vol: 0.6 }),
  /** The orchard: oranges pop off the trees. */
  pop: clip(c('oranges'), () => [0, 0.07, 0.15, 0.24].forEach((d, i) => tone(500 + i * 90, 760 + i * 90, 0.07, 0.05, 'sine', d)), { vol: 0.6 }),
  /** The tuk-tuk putters off; a bridge's cars beep hello. */
  tuktuk: clip(nanClip('drive-tuktuk'), sfx.putt, { vol: 0.5 }),
  honk: clip(nanClip('drive-honk-tune'), sfx.beep, { vol: 0.35 }),
  /** A tower's windows twinkle: a little run of notes, higher for a taller tower (0..1). */
  twinkle: (tall: number) => notes(660 + tall * 500, [0, 4, 7, 12]),
  /** The balloon's burner roars. */
  burner: () => noise(0.9, 0.07, 'lowpass', 900, 400, 0, 0.6),
}

/** The city by its river, until stop(). */
export const mapBed = () => bed(c('city-bed'), 0.4)
