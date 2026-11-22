// The Team Cabin's recorded sounds (prompts in sfx/parts/cabin.json, made with the `sfx` skill), each over the synth
// sound it stands in for until the clip is made (kit/clips.ts plays the synth until then, and in test browsers). Gus's
// honk and Lulu's call are the story's own recordings.
import { sounds } from '../../../../../sdk'
import { bed, clip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

const synthWhoosh = () => noise(0.22, 0.09, 'bandpass', 700, 2600, 0, 1.6)
const synthPop = () => {
  sounds.pop()
  tone(880, 1320, 0.08, 0.05, 'triangle', 0.03)
}
const synthStamp = () => {
  noise(0.06, 0.25, 'lowpass', 900, 300)
  tone(180, 120, 0.1, 0.12, 'sine')
}
const synthShutter = () => [0, 0.09].forEach((d) => noise(0.04, 0.3, 'highpass', 3000, 5000, d, 1.2))
const synthCreak = () => tone(180, 260, 0.45, 0.04, 'sawtooth')
const synthLid = () => {
  noise(0.05, 0.12, 'bandpass', 1400, 900)
  tone(520, 780, 0.1, 0.05, 'triangle', 0.04)
}
const synthGiggle = () => [0, 0.08, 0.16, 0.24].forEach((d, i) => tone(820 + i * 80, 1150 + i * 80, 0.065, 0.045, 'triangle', d))
const synthPuff = () => noise(0.4, 0.14, 'lowpass', 700, 200)
const synthJingle = () => [0, 0.07, 0.14].forEach((d, i) => tone(2100 + i * 220, 2000 + i * 220, 0.14, 0.02, 'sine', d))
const synthHonk = () => [0, 0.22].forEach((d) => tone(330, 260, 0.16, 0.08, 'sawtooth', d))
const synthLoon = () => tone(520, 780, 0.9, 0.05, 'sine')

export const cabinSfx = {
  /** A thing flying onto a friend: a soft cloth whoosh. */
  whoosh: clip(url('cabin-whoosh'), synthWhoosh),
  /** It lands on them and it's on: a happy little pop. */
  pop: clip(url('cabin-pop'), synthPop),
  /** A cheek stamp pressed on: a soft rubber stamp thump. */
  stamp: clip(url('cabin-stamp'), synthStamp),
  /** Dropped where it doesn't go (on the floor, a jersey on a head): a rubbery boing. */
  boing: clip(url('cabin-boing'), () => sfx.boing()),
  /** A friend giggling at something silly. */
  giggle: clip(url('cabin-giggle'), synthGiggle),
  /** The mirror takes the team photo: an old camera's click-whirr. */
  shutter: clip(url('cabin-shutter'), synthShutter),
  /** The window swings open (or shut) for Gus: a wooden creak. */
  creak: clip(url('cabin-creak'), synthCreak),
  /** A bin on the shelf opens: a box lid lifting. */
  lid: clip(url('cabin-lid'), synthLid),
  /** The stove poked: a whump of fire and sparks. */
  puff: clip(url('cabin-stove'), synthPuff),
  /** The skates on their pegs knock together: a little jingle. */
  jingle: clip(url('cabin-jingle'), synthJingle),
  /** Gus: honk honk (the story's). */
  honk: clip(url('story-honk'), synthHonk),
  /** Lulu's call (the story's). */
  loon: clip(url('story-loon'), synthLoon),
  /** The hut: a crackling stove and the wind outside, under everything. Until stop(). */
  bed: () => bed(url('cabin-bed'), 0.26),
}
