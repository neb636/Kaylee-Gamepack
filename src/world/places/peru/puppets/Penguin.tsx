// Humboldt penguins for Pepa's Penguin Cliff: Pepa (the mama, a pink flower by her head) and the three divers who
// queue on the launch rock (chubby, tiny, and one with a feather tuft). One rig, drawn in profile facing right so a
// flight or a swim only has to rotate it.
//
// The cliff drives each diver through `live` (no React re-render per frame): its mode (standing, crouching on the
// launch rock while she pulls, flying, swimming), how far it's pulled, and what it carries (a fish, a seaweed "sock").
// Real Humboldt look: dark back and head, a cream stripe curving from the beak over the eye and down to the throat, one
// dark band across the cream chest, and a pink fleshy patch at the base of the beak.
import { forwardRef, useId, useRef, type MutableRefObject } from 'react'
import { bell, clamp, setT, show, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK } from './Alpaca'

export const PENGUIN_DARK = '#3A3346'
const CREAM = '#FFF7F0'
const PINK = '#FF8FB8'
const FEET = '#FFB79A'

export type PenguinKind = 'pepa' | 'chubby' | 'tiny' | 'tuft'
export type PenguinMode = 'stand' | 'crouch' | 'air' | 'swim'

export interface PenguinLive {
  mode: PenguinMode
  /** How far she's pulled it back, 0..1 (above 1 she's pulled too far: it stretches like a rubber band). */
  pull: number
  fish: boolean
  sock: boolean
}
export const penguinLive = (): PenguinLive => ({ mode: 'stand', pull: 0, fish: false, sock: false })

export const PENGUIN_ACTIONS = { waddle: 0.5, flap: 0.8, cheer: 1.1, nod: 0.6, feed: 1.1, wiggle: 0.6, proud: 1.3, giggle: 0.9 }

/** The picture's box (viewBox units): feet on y = FEET_Y, facing right. */
export const PENGUIN_VIEW = { w: 240, h: 290, feetY: 276 }

type Part = 'root' | 'body' | 'flip' | 'head' | 'beakLow' | 'eyeOpen' | 'eyeShut' | 'eyeSqueeze' | 'eyeWide' | 'fish' | 'sock' | 'feet' | 'blush'

const BODY = 'M112 36C152 32 178 60 180 98C182 122 188 152 190 188C192 234 168 268 118 268C68 268 44 238 46 194C48 152 60 120 64 98C66 60 82 38 112 36Z'
const BELLY = 'M152 120C172 142 180 182 176 218C172 250 150 264 120 264C94 264 78 250 76 226C74 192 94 152 120 132C130 124 142 118 152 120Z'
const STRIPE = 'M172 56C154 42 126 46 122 74C120 96 130 114 150 124'
const FLIPPER = 'M92 126C72 150 62 196 70 224C84 216 102 176 110 134Z'

/** An anchovy, the fish penguins catch here (also used by the schools). Centred on 0,0, facing right, ~60 wide. */
export function FishShape({ color = '#8FC9E8', back = '#5A8FB8' }: { color?: string; back?: string }) {
  return (
    <g>
      <path d="M-30 0L-42 -10L-40 0L-42 10Z" fill={back} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M-32 0C-24 -10 4 -12 22 -6C30 -3 32 3 22 6C4 12 -24 10 -32 0Z" fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M-22 -3C-8 -9 10 -9 22 -5" fill="none" stroke={back} strokeWidth="4" strokeLinecap="round" />
      <circle cx="17" cy="-1" r="2.6" fill={INK} />
    </g>
  )
}

export interface PenguinProps {
  kind: PenguinKind
  height: string
  live?: MutableRefObject<PenguinLive>
  label?: string
  /** Pepa only: the mama watches over her chicks with a voice of her own. */
  voice?: string
}

export const Penguin = forwardRef<PuppetHandle, PenguinProps>(function Penguin({ kind, height, live, label, voice }, ref) {
  const id = useId().replace(/:/g, '')
  const own = useRef(penguinLive())
  const state = live ?? own
  const sp = useRef({ flip: spring(160, 10), head: spring(120, 11), squash: spring(220, 14), lastMode: 'stand' as PenguinMode }).current
  const wide = kind === 'chubby' ? 1.14 : kind === 'tiny' ? 0.96 : 1

  const { svg, part } = usePuppet<Part>(ref, {
    voice: voice ?? (kind === 'pepa' ? 'pepa' : 'pingo'),
    actions: PENGUIN_ACTIONS,
    eyes: [152, 74],
    frame: (f, p) => {
      const L = state.current
      const q = f.p
      const a = f.action
      const t = f.t
      // Idle: breathing, a little sway, head turning toward her finger.
      const breath = Math.sin(t * 2.4)
      let sx = wide * (1 + breath * 0.008)
      let sy = 1 - breath * 0.012
      let rot = Math.sin(t * 1.3) * 1.5
      let y = 0
      let flip = 8 + Math.sin(t * 1.7) * 4
      let head = f.look.y * 6
      let mouth = f.mouth * 0.9
      let eye: 'open' | 'shut' | 'squeeze' | 'wide' = 'open'

      if (L.mode === 'crouch') {
        // Crouched on the launch rock: squashed down, leaning back, flippers swept back, eyes squeezed tight.
        const k = clamp(L.pull, 0, 1)
        const over = Math.max(0, L.pull - 1)
        sx *= 1 + k * 0.16 - over * 0.25
        sy *= 1 - k * 0.24 + over * 0.9
        rot -= k * 14
        flip = 8 + k * 62
        head -= k * 6
        eye = over > 0.05 ? 'wide' : k > 0.55 ? 'squeeze' : 'open'
        if (over > 0.05) mouth = Math.max(mouth, 0.7)
      } else if (L.mode === 'air') {
        sy *= 1.06
        sx *= 0.96
        flip = -80 + Math.sin(t * 22) * 18
        eye = 'wide'
        mouth = Math.max(mouth, 0.5)
      } else if (L.mode === 'swim') {
        // Penguins "fly" underwater: fast wing beats, sleek body.
        sx *= 1.04
        sy *= 0.97
        flip = -30 + Math.sin(t * 16) * 42
      }

      const e = bell(q)
      if (a === 'waddle') {
        rot += Math.sin(q * Math.PI * 2) * 9
        y -= bell(span(q, 0.1, 0.9)) * 10
      } else if (a === 'flap') {
        flip = -60 + Math.sin(q * Math.PI * 8) * 50 * e
        y -= e * 8
      } else if (a === 'cheer' || a === 'giggle') {
        const crouch = bell(span(q, 0, 0.2))
        const air = bell(span(q, 0.2, 0.7))
        const land = wobble(span(q, 0.7, 1), 2)
        sx *= 1 + crouch * 0.12 - air * 0.06 + land * 0.08
        sy *= 1 - crouch * 0.15 + air * 0.1 - land * 0.1
        y -= air * (a === 'cheer' ? 46 : 22)
        flip = -70 + Math.sin(q * Math.PI * 10) * 30 * e
        eye = a === 'giggle' ? 'shut' : 'open'
        mouth = Math.max(mouth, 0.6 * e)
      } else if (a === 'nod') {
        head += e * 14
        sy *= 1 - e * 0.04
      } else if (a === 'feed') {
        // Leans down and forward to a chick, beak open.
        rot += e * 26
        head += e * 10
        mouth = Math.max(mouth, bell(span(q, 0.3, 0.8)))
      } else if (a === 'wiggle') {
        rot += wobble(q, 3) * 12
        sx *= 1 + wobble(q, 3) * 0.04
      } else if (a === 'proud') {
        // Chest out, chin up (with whatever silly thing it brought back).
        sy *= 1 + e * 0.07
        sx *= 1 + e * 0.05
        head -= e * 12
        flip = 8 + e * 40
        eye = 'shut'
      }
      if (L.mode === 'stand' && a !== 'proud' && a !== 'giggle' && f.blink < 0.5) eye = 'shut'
      if (eye === 'open' && f.blink < 0.5) eye = 'shut'

      const sq = sp.squash.step(sy, f.dt)
      setT(p.root, `translate(0 ${y.toFixed(1)}) translate(118 ${PENGUIN_VIEW.feetY}) rotate(${rot.toFixed(2)}) scale(${sx.toFixed(3)} ${sq.toFixed(3)}) translate(-118 ${-PENGUIN_VIEW.feetY})`)
      setT(p.flip, `rotate(${sp.flip.step(flip, f.dt).toFixed(1)} 98 128)`)
      setT(p.head, `rotate(${sp.head.step(head, f.dt).toFixed(1)} 120 120)`)
      setT(p.beakLow, `rotate(${(mouth * 26).toFixed(1)} 172 92)`)
      show(p.eyeOpen, eye === 'open')
      show(p.eyeShut, eye === 'shut')
      show(p.eyeSqueeze, eye === 'squeeze')
      show(p.eyeWide, eye === 'wide')
      show(p.fish, L.fish)
      show(p.sock, L.sock)
      show(p.feet, L.mode !== 'swim')
    },
  })

  return (
    <svg ref={svg} viewBox={`0 0 ${PENGUIN_VIEW.w} ${PENGUIN_VIEW.h}`} role="img" aria-label={label} style={{ height, overflow: 'visible', display: 'block' }}>
      <defs>
        <clipPath id={`belly${id}`}>
          <path d={BELLY} />
        </clipPath>
      </defs>
      <g ref={part('root')}>
        <g ref={part('feet')} stroke={INK} strokeWidth="5">
          <ellipse cx="96" cy="270" rx="24" ry="9" fill={FEET} />
          <ellipse cx="140" cy="271" rx="24" ry="9" fill={FEET} />
        </g>
        <path d="M54 228L26 252L60 254Z" fill={PENGUIN_DARK} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <g ref={part('body')}>
          <path d={BODY} fill={PENGUIN_DARK} stroke={INK} strokeWidth="5" />
          <path d={BELLY} fill={CREAM} stroke={INK} strokeWidth="4" />
          {/* The one dark band across the chest. */}
          <path clipPath={`url(#belly${id})`} d="M70 214C82 168 116 140 176 146" fill="none" stroke={PENGUIN_DARK} strokeWidth="13" />
          <circle cx="132" cy="226" r="3" fill={PENGUIN_DARK} />
          <circle cx="112" cy="240" r="2.5" fill={PENGUIN_DARK} />
          <circle cx="150" cy="208" r="2.5" fill={PENGUIN_DARK} />
        </g>
        <g ref={part('head')}>
          {/* The cream stripe from the beak, over the eye, down to the throat. */}
          <path d={STRIPE} fill="none" stroke={INK} strokeWidth="21" strokeLinecap="round" />
          <path d={STRIPE} fill="none" stroke={CREAM} strokeWidth="12" strokeLinecap="round" />
          <ellipse ref={part('blush')} cx="156" cy="100" rx="10" ry="6" fill={PINK} opacity="0.85" />
          <g ref={part('beakLow')}>
            <path d="M172 92C188 92 204 92 214 92C202 100 186 101 172 98Z" fill={PENGUIN_DARK} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          </g>
          <path d="M170 78C190 76 210 80 224 89C208 92 188 92 172 93Z" fill={PENGUIN_DARK} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="173" cy="86" rx="10" ry="9" fill={PINK} stroke={INK} strokeWidth="3" />
          {/* Eye white (the reference's big shiny eyes read on the dark head). */}
          <circle cx="152" cy="72" r="14.5" fill={CREAM} stroke={INK} strokeWidth="3.5" />
          <g ref={part('eyeOpen')}>
            <circle cx="153" cy="72" r="10" fill={INK} />
            <circle cx="155" cy="68" r="3.6" fill="#fff" />
          </g>
          <path ref={part('eyeShut')} d="M142 74Q152 64 162 74" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
          <path ref={part('eyeSqueeze')} d="M143 65L158 72L143 79" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <g ref={part('eyeWide')}>
            <circle cx="152" cy="72" r="12" fill={CREAM} stroke={INK} strokeWidth="3.5" />
            <circle cx="155" cy="72" r="6" fill={INK} />
          </g>
          {kind === 'pepa' && (
            <g transform="translate(96 50)" stroke={INK} strokeWidth="3">
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx="0" cy="-11" rx="8" ry="11" fill={PINK} transform={`rotate(${r})`} />
              ))}
              <circle r="6" fill="#FFC83D" />
            </g>
          )}
          {kind === 'tuft' && <path d="M104 40C96 18 104 8 110 26C112 6 124 6 120 30C130 14 138 22 124 40Z" fill={PENGUIN_DARK} stroke={INK} strokeWidth="4" strokeLinejoin="round" />}
          <g ref={part('fish')} transform="translate(214 98) rotate(78)">
            <FishShape />
          </g>
          {/* A floppy seaweed "sock" it proudly brings back when it missed every fish. */}
          <g ref={part('sock')}>
            <path d="M84 42C92 18 122 14 138 26C144 34 140 44 132 44C126 60 120 74 104 76C90 78 84 66 92 60C96 54 88 50 84 42Z" fill="#7CC79A" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
            <path d="M96 40C106 32 120 30 130 34" fill="none" stroke="#4F9A6E" strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>
        <g ref={part('flip')}>
          <path d={FLIPPER} fill={PENGUIN_DARK} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  )
})
