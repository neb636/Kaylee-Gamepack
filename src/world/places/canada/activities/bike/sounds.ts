// Mont-Sainte-Anne's recorded sounds (prompts: sfx/parts/bike.json; the `sfx` skill makes them): the game's and the
// chapter's films'. Each plays its synth fallback until its clip is made (kit/clips.ts).
import { sounds } from '../../../../../sdk'
import { bed, clip, held } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

/** The bike's bell: two dings. */
function ding() {
  for (const d of [0, 0.16]) {
    tone(2400, 2380, 0.35, 0.07, 'sine', d)
    tone(3550, 3500, 0.25, 0.03, 'sine', d)
  }
}
/** Monty's low, slow snort. */
function moo() {
  tone(118, 96, 0.8, 0.14, 'sawtooth')
  tone(236, 190, 0.8, 0.03, 'triangle')
}

export const bikeSfx = {
  /** The forest round the trail: a breeze in the leaves, little birds. Until stop(). */
  forest: (vol = 0.22) => bed(url('bike-forest'), vol),
  /** The wheels on the dirt, while she rolls (call it every frame; `v` m/s). */
  roll: held(
    url('bike-roll'),
    // (No synth for the wheels: the trail was quiet before the clip.)
    (_v: number) => {},
    (v: number) => ({ rate: 0.75 + Math.min(1, v / 12) * 0.5, vol: Math.min(1, v / 6) * 0.6 }),
  ),
  /** The tires' hiss through the leaves and dirt while she carves (call it every frame; `hard` 0..1+). */
  carve: held(
    url('bike-carve'),
    (_hard: number) => {},
    (hard: number) => ({ rate: 0.85 + Math.min(1, hard) * 0.3, vol: Math.min(1, Math.max(0, hard - 0.12) * 1.3) * 0.55 }),
  ),
  bell: clip(url('bike-bell'), ding),
  leaves: clip(url('bike-leaves'), () => (sfx.fwip(), noise(0.4, 0.12, 'bandpass', 2400, 900, 0, 0.8))),
  /** Boing! Up off a stump. */
  hop: clip(url('bike-hop'), () => sfx.boing()),
  /** Back down on the dirt after a hop. */
  land: clip(url('bike-land'), () => sfx.thump()),
  splash: clip(url('bike-splash'), () => sfx.splash()),
  /** Tock tock tock over the bridge's planks. */
  bridge: clip(url('bike-bridge'), () => [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 0.98].forEach((d) => noise(0.03, 0.05, 'bandpass', 520, 420, d, 2))),
  /** A gondola cabin rocking on its cable. */
  creak: clip(url('bike-creak'), () => tone(520, 430, 0.35, 0.035, 'triangle')),
  chipmunk: clip(url('bike-chipmunk'), () => sfx.chirp()),
  /** Monty: a slow snort; munching his pond weed. */
  snort: clip(url('bike-snort'), moo),
  munch: clip(url('bike-munch'), () => sfx.munch()),
  /** The waterfall, a swell of rushing water. */
  falls: clip(url('bike-falls'), () => noise(1.6, 0.08, 'lowpass', 1400, 900, 0, 0.7)),
  /** A pinecone drops through the branches. */
  pinecone: clip(url('bike-pinecone'), () => (noise(0.3, 0.05, 'bandpass', 3000, 1600, 0, 0.8), sounds.whoosh())),
}
