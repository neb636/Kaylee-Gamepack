// The window seat's and Krabi's recorded sounds (trip/sfx/, ElevenLabs), each with the old synthesized sound
// (../../sfx.ts) as its fallback: the cabin's hum, the seatbelt sign's chime and her buckle, the landing gear, the
// wheels touching down and the rollout, everyone clapping, the cabin's things she pokes (the shade, the tray, the
// reading light, the air vent, the call button); then Krabi's sunny roadside, the songthaew's horn, its diesel pulling
// away and idling at the signpost. Toy sounds stay synthesized: her boing, the teddy's boop, Daddy's snort, the snacks
// landing on her tray, the sparkle when everyone cheers.
import { sounds } from '../../../../../sdk'
import { bed, clip, held } from '../../../../kit/clips'
import { sfx } from '../../sfx'
import { tripClip as c } from '../sfx'

export const planeSfx = {
  buckle: clip(c('land-buckle'), sfx.latch, { vol: 0.8 }),
  chime: clip(c('land-chime'), sfx.callDing, { vol: 0.6, jitter: 0 }),
  gear: clip(c('land-gear'), sfx.whir, { vol: 0.6 }),
  touchdown: clip(c('land-touchdown'), sfx.thump, { vol: 0.9 }),
  /** The second bump: the engines easing down and the wheels rumbling along the runway. */
  rollout: clip(c('land-rollout'), sfx.thump, { vol: 0.7 }),
  /** Everyone claps for a second and a half (the synth: a pop on each clap of their hands). */
  clap: clip(c('land-clap'), () => Array.from({ length: 7 }, (_, i) => setTimeout(() => sounds.pop(), i * 224)), { vol: 0.8 }),
  shade: clip(c('land-shade'), sfx.fwip, { vol: 0.7 }),
  tray: clip(c('land-tray'), sfx.thump, { vol: 0.8 }),
  light: clip(c('land-light'), sfx.pop, { vol: 0.8 }),
  vent: clip(c('land-vent'), sfx.whir, { vol: 0.6 }),
  call: clip(c('land-call'), sfx.callDing, { vol: 0.6, jitter: 0 }),
  horn: clip(c('krabi-horn'), sfx.toot, { vol: 0.7 }),
  pullaway: clip(c('krabi-pullaway'), sfx.putt, { vol: 0.7 }),
  /** The songthaew's diesel, called every frame it's there: a low idle, a little higher while it drives. No synth
   *  fallback (the old songthaew only putted once, as it set off). */
  engine: held(c('krabi-engine'), (_moving: boolean) => {}, (moving: boolean) => ({ rate: moving ? 1.15 : 0.9, vol: moving ? 0.35 : 0.2 })),
}

export const cabinBed = () => bed(c('land-cabin'), 0.25)
export const krabiBed = () => bed(c('krabi-street'), 0.3)
