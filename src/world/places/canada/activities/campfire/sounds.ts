// Campfire Night's sounds (prompts: sfx/parts/campfire.json), for the game (Flashlight Statues) and its two films,
// each a recorded clip over the little synth sound it stands in for until the clip is made. No React, no three.js.
import { sounds } from '../../../../../sdk'
import { bed, clip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

const FIRE = url('campfire-fire')

// ---- The synth stand-ins.
const hoot = (vol = 0.2) => {
  tone(390, 350, 0.42, vol, 'sine')
  tone(410, 360, 0.26, vol * 0.9, 'sine', 0.6)
  tone(400, 340, 0.5, vol, 'sine', 0.9)
}
const peep = (vol = 0.09) => {
  tone(2300, 2900, 0.13, vol, 'sine')
  tone(2300, 2900, 0.13, vol, 'sine', 0.32)
}
const rustle = (vol = 0.12) => {
  for (let i = 0; i < 5; i++) noise(0.09, vol * (0.6 + Math.random() * 0.5), 'bandpass', 2600 + Math.random() * 1500, 1800, i * 0.07 + Math.random() * 0.03, 2)
}
const squeak = (d = 0) => {
  tone(3200, 2600, 0.06, 0.06, 'sine', d)
  tone(3400, 2800, 0.05, 0.05, 'sine', d + 0.09)
}
const giggle = () => [0, 0.11, 0.2, 0.32].forEach((d, i) => tone(1500 + i * 120, 1900 + i * 80, 0.07, 0.05, 'triangle', d))

export const camp = {
  /** The owl's "hoo, hoo-hoo". */
  hoot: clip(url('campfire-owl'), (_pan: number = 0, vol: number = 0.2) => hoot(vol)),
  /** A spring peeper's two peeps. */
  peep: clip(url('campfire-frog'), () => peep()),
  /** Leaves rustling in a bush. */
  rustle: clip(url('campfire-rustle'), (_pan: number = 0) => rustle()),
  /** A little paw snatching a marshmallow. */
  snatch: clip(url('campfire-snatch'), () => sounds.whoosh()),
  /** Roxy's chitter, a giggle. */
  chitter: clip(url('campfire-chitter'), (_pan: number = 0) => squeak()),
  /** Her three kits squeaking. */
  kits: clip(url('campfire-kits'), (_pan: number = 0) => [0, 0.12, 0.26].forEach((d) => squeak(d))),
  /** Little giggles from somewhere in the dark (a kit hiding). */
  giggle: clip(url('campfire-giggle'), giggle),
  /** A marshmallow sizzling over the flames (the game calls it often while it's hot: the clip a little less often). */
  sizzle: clip(url('campfire-sizzle'), (vol: number = 0.03) => noise(0.08, vol, 'highpass', 5000, 4000), { vol: 0.6 }),
  /** The tent zipper. */
  zip: clip(url('campfire-zip'), (_pan: number = 0) => noise(0.45, 0.12, 'bandpass', 1800, 4200, 0, 3)),
  /** Sparks whoosh up from the fire (and a marshmallow catching fire). */
  sparks: clip(url('campfire-sparks'), (vol: number = 0.14) => noise(0.6, vol, 'bandpass', 400, 1400, 0, 0.8)),
  /** A marshmallow comes out of Maple's paper bag. */
  bag: clip(url('campfire-bag'), () => sounds.pop()),
  /** It squishes onto the roasting stick. */
  skewer: clip(url('campfire-skewer'), () => sounds.place()),
  /** Monty crunches up the branch his giant one was toasted on. */
  branch: clip(url('campfire-branch'), () => [0, 0.2, 0.4].forEach((d) => noise(0.09, 0.2, 'bandpass', 900, 500, d, 1.5))),
  /** Blowing a burning marshmallow out. */
  blow: clip(url('campfire-blow'), () => noise(0.35, 0.18, 'lowpass', 1600, 300)),
  /** Somebody munching. */
  munch: clip(url('campfire-munch'), (_pan: number = 0) => [0, 0.16, 0.32].forEach((d) => noise(0.07, 0.16, 'bandpass', 1400, 900, d, 1.5))),
  /** The flashlight's switch: click (on or off). */
  click: clip(url('campfire-click'), () => {
    noise(0.03, 0.2, 'bandpass', 2400, 1800, 0, 2)
    tone(900, 600, 0.04, 0.05, 'square')
  }),
  /** Caught in the beam: a bright little "freeze!" sting. */
  freeze: clip(url('campfire-freeze'), () => {
    tone(1568, 1568, 0.12, 0.06, 'triangle')
    tone(2093, 2093, 0.22, 0.05, 'triangle', 0.07)
    noise(0.12, 0.05, 'highpass', 6000, 9000)
  }),
  /** The statue wobbling on its feet (a springy wobble). */
  wobble: clip(url('campfire-wobble'), () => [0, 0.14, 0.28].forEach((d, i) => tone(300 - i * 20, 420 - i * 30, 0.12, 0.05, 'triangle', d))),
  /** Falling over in the leaves (a soft flump). */
  tumble: clip(url('campfire-tumble'), () => {
    tone(140, 60, 0.18, 0.18, 'sine')
    noise(0.3, 0.1, 'lowpass', 900, 300)
  }),
  /** A paw whisks a marshmallow out of the bag: yoink! */
  yoink: clip(url('campfire-yoink'), () => {
    tone(500, 1600, 0.16, 0.06, 'triangle')
    noise(0.18, 0.06, 'bandpass', 1200, 3500, 0.02, 1.5)
  }),
  /** A porcupine puffing up his quills (a dry rattle). */
  quills: clip(url('campfire-quills'), () => {
    for (let i = 0; i < 7; i++) noise(0.04, 0.1, 'bandpass', 3200 + Math.random() * 1500, 2600, i * 0.035, 3)
  }),
  /** A deer startled mid-chew: a crunch of leaves stopping dead. */
  leaves: clip(url('campfire-leaves'), () => rustle(0.08)),
  /** A bat's squeak (and its yawn). */
  squeak: clip(url('campfire-squeak'), () => squeak()),
  /** Monty's sunglasses going on: a cool little click-slide. */
  shades: clip(url('campfire-shades'), () => {
    noise(0.12, 0.08, 'bandpass', 3000, 5000, 0, 2)
    tone(1200, 1800, 0.08, 0.04, 'sine', 0.1)
  }),
  /** The stars coming out (a twinkle each). */
  twinkle: () => tone(1400 + Math.random() * 900, 1800, 0.18, 0.03, 'sine'),
  /** The northern lights: a soft, airy, glassy shimmer swelling up. */
  shimmer: clip(url('campfire-shimmer'), () => [0, 0.25, 0.5, 0.8, 1.1].forEach((d, i) => tone(880 * Math.pow(2, [0, 4, 7, 11, 14][i] / 12), 900 * Math.pow(2, [0, 4, 7, 11, 14][i] / 12), 0.9, 0.025, 'sine', d))),
  /** The roast: a wish bubble pops up over somebody's head (what they want). */
  wish: clip(url('campfire-wish'), () => {
    tone(700, 1100, 0.1, 0.05, 'sine')
    tone(1100, 1400, 0.12, 0.04, 'sine', 0.08)
  }),
  /** The marshmallow she holds is just what somebody wants: a bright little "now!" chime. */
  ready: clip(url('campfire-ready'), () => [0, 0.08, 0.16].forEach((d, i) => tone([1319, 1568, 2093][i], [1319, 1568, 2093][i], 0.16, 0.04, 'triangle', d))),
  /** Given right: their bubble turns into a gold star (a sparkly ta-da). */
  star: clip(url('campfire-star'), () => {
    sounds.sparkle()
    tone(1047, 2093, 0.3, 0.05, 'triangle', 0.05)
  }),
  /** A splash, a pop (a new marshmallow), a boing. */
  splash: () => sfx.splash(),
  pop: () => sounds.pop(),
  /** The campfire crackling under the crickets, until the returned stop(). */
  fireBed: (vol = 0.3) => bed(FIRE, vol),
  /** No recorded fire yet: the game crackles with the synth instead. */
  synthCrackle: !FIRE,
  /** A crackle from the fire (the synth's, when there's no recorded bed). */
  crackle: (vol = 0.05) => noise(0.03 + Math.random() * 0.04, vol, 'highpass', 1800 + Math.random() * 2000, 1500),
}
