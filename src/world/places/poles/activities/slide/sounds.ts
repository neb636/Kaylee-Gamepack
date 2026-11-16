// Penguin Slide's sounds: recorded clips from the Poles' sfx folder (sfx/parts/slide.json lists them) over synth
// fallbacks (kit/clips.ts plays the fallback until a clip exists or has loaded), a wind bed over the ice and a
// muffled one under the sea.
import { sounds } from '../../../../../sdk'
import { bed, clip, held } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

/** A short squawk at a pitch (an Adélie high, a gentoo lower, Papa deep). */
function squawk(f: number) {
  tone(f, f * 0.75, 0.16, 0.12, 'square')
  tone(f * 1.01, f * 0.7, 0.16, 0.06, 'sawtooth', 0.01)
  noise(0.12, 0.04, 'bandpass', f * 3, f * 2, 0, 2)
}

export const slideSfx = {
  /** Papa's deep honk. */
  papa: clip(url('slide-honk-papa'), () => squawk(260)),
  /** An Adélie's squawk. */
  adelie: clip(url('slide-honk-adelie'), () => squawk(520)),
  /** A gentoo's donkey honk. */
  gentoo: clip(url('slide-honk-gentoo'), () => [0, 0.16].forEach((d) => tone(380, 300, 0.14, 0.1, 'square', d))),
  /** The Adélies cheering together at the ice edge. */
  cheer: clip(url('slide-cheer'), () => [0, 0.1, 0.22, 0.3].forEach((d, i) => tone(480 + i * 40, 380, 0.14, 0.07, 'square', d))),
  /** He flops onto his tummy and goes. */
  go: clip(url('slide-go'), () => sounds.whoosh()),
  /** His tummy on the ice, for as long as he slides on it (faster = higher). No synth stand-in: silence is kinder. */
  scrape: held(url('slide-scrape'), (_v: number) => {}, (v: number) => ({ rate: 0.8 + v * 0.035, vol: Math.min(0.5, 0.12 + v * 0.03) })),
  /** A hop off a bump. */
  hop: clip(url('slide-hop'), () => sfx.boing()),
  /** Landing on the snow. */
  thump: clip(url('slide-thump'), () => sfx.thump()),
  /** Head first into a snowbank. */
  poof: clip(url('slide-poof'), () => {
    sfx.thump()
    sfx.fwip()
  }),
  /** She pokes the snow. */
  snow: clip(url('slide-snow'), () => sfx.fwip()),
  /** Into the sea, and out of it. */
  splash: clip(url('slide-splash'), () => sfx.splash()),
  leap: clip(url('slide-leap'), () => sounds.whoosh()),
  /** A swarm of krill, gulped. */
  gulp: clip(url('slide-gulp'), () => sfx.chomp()),
  /** Bubbles where she pokes the water. */
  bubbles: clip(url('slide-bubbles'), () => tone(500, 900, 0.12, 0.05, 'sine')),
  /** The leopard seal bumps noses and rolls. */
  boop: clip(url('slide-boop'), () => sfx.boing()),
  /** It wasn't Pebble: a pop and a twinkle. */
  reveal: clip(url('slide-reveal'), () => {
    sfx.pop()
    sounds.sparkle()
  }),
  /** Something that might be Pebble, poked before he has looked: a muffled "hm?". */
  maybe: clip(url('slide-maybe'), () => tone(300, 380, 0.18, 0.08, 'triangle')),
  /** The Weddell seal's song: falling whistles, like a toy spaceship. */
  weddell: clip(url('slide-weddell'), () => [0, 0.22, 0.44, 0.66].forEach((d, i) => tone(1800 - i * 250, 500 - i * 60, 0.3, 0.07, 'sine', d))),
  /** A seal snoring (asleep, before he looks). */
  snore: clip(url('slide-snore'), () => tone(140, 90, 0.6, 0.08, 'triangle')),
  /** The elephant seal's great big burp. */
  burp: clip(url('slide-burp'), () => {
    tone(110, 60, 0.5, 0.2, 'sawtooth')
    noise(0.45, 0.08, 'lowpass', 400, 150)
  }),
  /** The skua's call, and its chick's peeps. */
  skua: clip(url('slide-skua'), () => [0, 0.2].forEach((d) => tone(900, 600, 0.16, 0.08, 'sawtooth', d))),
  peep: clip(url('slide-peep'), () => [0, 0.12, 0.24].forEach((d) => tone(2200, 2600, 0.07, 0.06, 'sine', d))),
  /** The woolly hat flips onto his head. */
  hat: clip(url('slide-hat'), () => sfx.fwip()),
  /** The station's flag flapping, and the scientist's hello (a little bell). */
  flag: clip(url('slide-flag'), () => noise(0.5, 0.08, 'bandpass', 600, 1400, 0, 1.2)),
  hello: clip(url('slide-hello'), () => [0, 0.14].forEach((d, i) => tone(1300 + i * 400, 1300 + i * 400, 0.22, 0.07, 'sine', d))),
  /** A whale blows at the top of the sea, and sings under it. */
  spout: clip(url('slide-spout'), () => noise(0.7, 0.1, 'highpass', 1800, 4000)),
  whale: clip(url('slide-whale'), () => tone(220, 520, 0.9, 0.09, 'sine')),
  /** The round buoy rings when he bumps it. */
  buoy: clip(url('slide-buoy'), () => {
    tone(330, 320, 0.8, 0.12, 'sine')
    tone(662, 650, 0.5, 0.05, 'sine')
  }),
  /** A ball of little fish darts apart. */
  fish: clip(url('slide-fish'), () => noise(0.3, 0.07, 'bandpass', 2400, 5000, 0, 1.5)),
}

/** The wind over the ice (or the sea heard from under it) until the returned stop(). */
export const slideBed = (under: boolean) => bed(url(under ? 'slide-under' : 'slide-wind'), under ? 0.3 : 0.22)
