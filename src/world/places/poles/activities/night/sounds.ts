// The Longest Night's sounds: recorded clips from the Poles' sfx folder over synth fallbacks (kit/clips.ts), and the
// song. Papa's song (party/sounds.ts TUNES[0]) is the ending's theme, and in Sing in the Dark every friend the ring
// finds sings it with Pebble in their own voice: Pebble's peep, Terry's whistle, the Weddell seal's spacey trill, the
// Adelies' honk, the humpback's low moan, Pola's growl. They're synthesized note by note (`voice`), so they all land
// on the same beat and the chorus builds one voice at a time. Papa's gold answer is the finale's buzzy reed (`sing`).
import { sounds } from '../../../../../sdk'
import { bed, clip } from '../../../../kit/clips'
import { audio, noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

/** Who sings a line of the chorus. */
export type Singer = 'pebble' | 'terry' | 'seal' | 'adelie' | 'whale' | 'pola'

export const nightSfx = {
  /** The night wind over the snow (until stopped). */
  night: () => bed(url('story-wind-night'), 0.3),
  /** The whiteout's blizzard (until stopped). */
  blizzard: () => bed(url('party-blizzard'), 0.22),
  /** A ring of song rolls out: a soft shimmer, bigger for a bigger ring. */
  ring: (k: number) => {
    const a = audio()
    if (!a) return
    // A rising sparkle of little bells, more of them the bigger the ring.
    const n = 3 + Math.round(k * 5)
    for (let i = 0; i < n; i++) tone(880 * 2 ** ((i * 4) / 12), 880 * 2 ** ((i * 4 + 2) / 12), 0.35, 0.025 * (0.6 + k * 0.6), 'sine', i * 0.05)
  },
  /** The ring lights something up. */
  glint: clip(url('narwhal-glint'), () => tone(1320, 1760, 0.18, 0.04, 'triangle'), { vol: 0.6 }),
  /** Something pops out of the snow. */
  reveal: clip(url('slide-reveal'), () => sounds.sparkle()),
  poof: clip(url('slide-poof'), () => noise(0.4, 0.1, 'highpass', 1200, 3000)),
  /** The woolly hat flips onto Pebble's head. */
  hat: clip(url('slide-hat'), () => sfx.boing()),
  /** A puff of snow (a poke). */
  snow: clip(url('hub-snow'), () => noise(0.25, 0.07, 'highpass', 1800, 3200)),
  /** Terry's call. */
  tern: clip(url('floe-tern'), () => [0, 0.14].forEach((d) => tone(1900, 1500, 0.12, 0.04, 'square', d))),
  /** The Weddell seal's trill. */
  weddell: clip(url('slide-weddell'), () => tone(900, 300, 1.2, 0.05, 'sine')),
  /** The Adelies honk. */
  honk: clip(url('slide-honk-adelie'), () => [0, 0.18].forEach((d) => tone(420, 380, 0.14, 0.05, 'square', d))),
  /** The humpback sings. */
  whale: clip(url('slide-whale'), () => tone(140, 260, 1.6, 0.06, 'sine')),
  /** Someone asleep in the snow. */
  snore: clip(url('slide-snore'), () => tone(120, 90, 0.8, 0.04, 'sawtooth')),
  /** The balloon's burner puffs. */
  burner: clip(url('story-burner'), () => noise(0.7, 0.12, 'lowpass', 500, 900)),
  /** The southern lights flare. */
  lights: clip(url('hub-lights'), () => sounds.sparkle()),
  /** Walking on: a few soft steps in the snow. */
  step: clip(url('party-step'), () => sfx.thump()),
  /** Everyone cheers. */
  cheer: clip(url('slide-cheer'), () => sounds.fanfare()),
  /** The far ring goes over the hills and everything goes quiet: a soft swell. */
  far: clip(url('story-chime'), () => tone(523, 784, 1.2, 0.04, 'sine')),
  /** A hiccup (tap-tap-tap). */
  hic: () => (tone(700, 1200, 0.08, 0.06, 'triangle'), tone(1200, 900, 0.06, 0.04, 'triangle', 0.08)),
}

/** Hold to Fly (Act 1) and the goodbye flight: recorded clips from the Poles' folder (no new ones were made: the
 *  cloud session had no ElevenLabs key). */
export const flySfx = {
  /** The wind over the sea (until stopped). */
  wind: () => bed(url('story-wind'), 0.28),
  /** The blizzard at the end (until stopped). */
  blizzard: () => bed(url('party-blizzard'), 0.3),
  /** The burner roars (again every second or so while she holds). */
  burner: clip(url('party-burner'), () => noise(0.7, 0.12, 'lowpass', 500, 900), { vol: 0.7 }),
  /** A gust in the storm. */
  gust: clip(url('party-gust'), () => noise(0.9, 0.1, 'bandpass', 400, 1600)),
  /** The balloon boings off a berg. */
  boing: clip(url('narwhal-bump'), () => sfx.boing()),
  /** The basket dips in the sea. */
  splash: clip(url('story-splash'), () => noise(0.4, 0.1, 'highpass', 900, 2600)),
  /** The red ship's horn. */
  horn: clip(url('story-horn'), () => [0, 0.35].forEach((d) => tone(220, 220, 0.25, 0.06, 'square', d))),
  /** A whale spouts. */
  spout: clip(url('party-whale'), () => noise(0.8, 0.08, 'highpass', 600, 2400)),
  /** The albatross calls. */
  albatross: clip(url('party-albatross'), () => tone(800, 600, 0.3, 0.04, 'square')),
  /** Terry's call. */
  tern: clip(url('hub-tern'), () => [0, 0.14].forEach((d) => tone(1900, 1500, 0.12, 0.04, 'square', d))),
  /** Through the thundercloud: a fluffy poof and the rain. */
  rain: clip(url('party-cloud'), () => noise(1, 0.08, 'highpass', 2000, 5000)),
  /** A tap on the wind's streaks. */
  whoosh: clip(url('party-leg'), () => sounds.sparkle()),
  /** The southern lights flare. */
  lights: clip(url('hub-lights'), () => sounds.sparkle()),
  /** Home at the top of the world (the goodbye flight). */
  hug: clip(url('party-hug'), () => sounds.fanfare()),
}

/** Through the Huddle (Act 3): the colony's sounds (recorded clips from the Poles' folder). */
export const huddleSfx3 = {
  /** The colony all round: soft honks, the wind (until stopped). */
  colony: () => bed(url('party-colony'), 0.32),
  wind: () => bed(url('story-wind-night'), 0.22),
  /** Pebble's little feet. */
  step: clip(url('party-step'), () => sfx.thump(), { vol: 0.5 }),
  /** A dad squished aside honks. */
  honk: clip(url('slide-honk-papa'), () => tone(300, 260, 0.2, 0.05, 'square'), { vol: 0.6 }),
  /** Pebble bounces off a tummy. */
  boing: clip(url('narwhal-bump'), () => sfx.boing()),
  /** A tummy slide. */
  slide: clip(url('slide-scrape'), () => noise(0.8, 0.06, 'highpass', 1200, 3000), { vol: 0.6 }),
  /** The gust. */
  gust: clip(url('party-gust'), () => noise(0.9, 0.1, 'bandpass', 400, 1600)),
  /** The dads shuffle round. */
  shuffle: clip(url('party-shuffle'), () => sfx.thump()),
  /** A dad shivers. */
  brrr: clip(url('huddle-brrr'), () => tone(300, 280, 0.4, 0.03, 'sawtooth')),
  /** Papa's gold notes rise. */
  gold: clip(url('story-chime'), () => tone(660, 990, 0.5, 0.04, 'sine'), { vol: 0.6 }),
  /** The dads step aside, one by one. */
  aside: clip(url('party-bow'), () => sounds.pop()),
  /** Tucked onto Papa's feet. */
  hug: clip(url('party-hug'), () => sounds.fanfare()),
  /** Everyone cheers. */
  cheer: clip(url('party-cheer'), () => sounds.fanfare()),
  /** Pola, far off, growls along. */
  far: clip(url('story-call'), () => tone(260, 330, 0.6, 0.03, 'sine'), { vol: 0.5 }),
}

const hz = (semi: number, base: number) => base * 2 ** (semi / 12)

/** One note of Papa's song in a singer's own voice: `semi` above their low note, `dur` seconds, `vol` 0..1, `pan`
 *  -1..1 (where they are on screen). */
export function voice(who: Singer, semi: number, dur: number, vol = 1, pan = 0) {
  const a = audio()
  if (!a || vol <= 0.001) return
  const t = a.currentTime + 0.02
  const panner = a.createStereoPanner ? a.createStereoPanner() : null
  if (panner) {
    panner.pan.value = Math.max(-1, Math.min(1, pan))
    panner.connect(a.destination)
  }
  const dest = panner ?? a.destination
  const end = t + dur
  const note = (type: OscillatorType, f: number, level: number, opts: { scoop?: number; wobble?: [rate: number, depth: number]; attack?: number; filter?: number } = {}) => {
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = type
    o.frequency.setValueAtTime(f * (opts.scoop ?? 1), t)
    o.frequency.exponentialRampToValueAtTime(f, t + 0.06)
    const att = opts.attack ?? 0.02
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(level * vol, t + att)
    g.gain.setValueAtTime(level * vol, Math.max(t + att, end - dur * 0.25))
    g.gain.exponentialRampToValueAtTime(0.0001, end)
    let last: AudioNode = g
    if (opts.filter) {
      const f2 = a.createBiquadFilter()
      f2.type = 'lowpass'
      f2.frequency.value = opts.filter
      g.connect(f2)
      last = f2
    }
    if (opts.wobble) {
      const lfo = a.createOscillator()
      const depth = a.createGain()
      lfo.frequency.value = opts.wobble[0]
      depth.gain.value = f * opts.wobble[1]
      lfo.connect(depth).connect(o.frequency)
      lfo.start(t)
      lfo.stop(end)
    }
    o.connect(g)
    last.connect(dest)
    o.start(t)
    o.stop(end + 0.02)
  }
  switch (who) {
    case 'pebble': // A chick's peep, an octave up (party/sounds.ts `sing`'s chick).
      note('triangle', hz(semi, 524), 0.09, { scoop: 0.86 })
      note('sine', hz(semi, 1048), 0.02, { scoop: 0.86 })
      break
    case 'terry': // A tern's whistle, high and bright.
      note('sine', hz(semi, 1046), 0.05, { scoop: 1.08, wobble: [7, 0.012] })
      break
    case 'seal': // The Weddell seal: a spacey trill that slides down into each note.
      note('sine', hz(semi, 392), 0.06, { scoop: 1.5, wobble: [22, 0.04], attack: 0.05 })
      break
    case 'adelie': // The Adelies: a short nasal honk.
      note('square', hz(semi, 262), 0.03, { scoop: 0.9, filter: 1400 })
      break
    case 'whale': // The humpback: a low moan, two octaves down, slow to swell.
      note('sine', hz(semi, 65.4), 0.12, { scoop: 0.8, attack: 0.12, wobble: [3, 0.01] })
      note('triangle', hz(semi, 130.8), 0.03, { scoop: 0.8, attack: 0.12 })
      break
    case 'pola': // A polar bear cub's growly version.
      note('sawtooth', hz(semi, 131), 0.04, { scoop: 0.8, filter: 700, wobble: [30, 0.03] })
      break
  }
  // timers-ok: disconnects an audio node after its sound has played out; nothing in the game is touched.
  if (panner) setTimeout(() => panner.disconnect(), (dur + 0.6) * 1000)
}
