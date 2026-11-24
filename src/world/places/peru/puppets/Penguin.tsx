// Humboldt penguins for Pepa's Penguin Cliff: Pepa (the mama, a pink flower by her head) and the three divers who
// queue on the launch rock (chubby, tiny, and one with a feather tuft). One rig, drawn in profile facing right so a
// flight or a swim only has to rotate it.
//
// The cliff drives each diver through `live` (no React re-render per frame): its mode (standing, crouching on the
// launch rock while she pulls, flying, swimming), how far it's pulled, and what it carries (a fish, a seaweed "sock").
// Real Humboldt look: dark back and head, a cream stripe curving from the beak over the eye and down to the throat, one
// dark band across the cream chest, and a pink fleshy patch at the base of the beak.
// Drawn by hand in the flat look of the game shelf (src/world/shelf/STYLE.md): no outlines; the plumage is a base, a
// shade and a light; ink only for the eyes.
import { forwardRef, useId, useRef, type MutableRefObject } from 'react'
import { bell, clamp, setT, show, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK } from './Alpaca'

/** The plumage: base, shade, light (a soft blue-black, never grey or black). */
export const PLUME = ['#4b4568', '#363150', '#716b99'] as const
const CREAM = '#fff7f0'
const CREAM_SHADE = '#e6def2'
const PINK = '#ff8fb8'
const FEET = ['#ffb38a', '#ee9675'] as const

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

const BODY = 'M118 30C158 28 184 56 182 92C181 108 177 119 172 128C186 150 194 180 192 208C190 246 164 270 118 270C72 270 44 244 44 204C44 170 58 142 66 124C56 104 54 84 60 68C68 44 90 31 118 30Z'
const BELLY = 'M150 130C172 148 182 184 178 216C174 250 152 264 120 264C96 264 80 250 78 228C76 196 94 160 120 140C130 132 142 127 150 130Z'
const STRIPE = 'M172 57C154 42 126 46 122 74C120 96 130 114 151 125'
const FLIPPER = 'M96 122C74 146 60 194 68 228C72 234 78 232 82 226C98 204 110 170 112 134C110 124 102 118 96 122Z'

/**
 * An anchovy, the fish penguins catch here (also used by the schools). Centred on 0,0, facing right, ~60 wide.
 * `ghost`: only its shape, in lavender (an empty place in Pepa's order).
 */
export function FishShape({ color = '#f4f8ff', back = '#6ea6e8', ghost = false }: { color?: string; back?: string; ghost?: boolean }) {
  const body = 'M-32 0C-22 -12 6 -13 22 -7C31 -3.5 31 3.5 22 7C6 13 -22 12 -32 0Z'
  const tail = 'M-27 0L-44 -11Q-38 0 -44 11Z'
  if (ghost) return <path d={`${tail}${body}`} fill="#937ee0" />
  return (
    <g>
      <path d={tail} fill={back} />
      <path d={body} fill={color} />
      <path d="M-31 -1C-22 -12 6 -13 22 -7C26 -5.5 28.5 -3.5 29.5 -1.5C14 -5.5 -10 -5 -31 -1Z" fill={back} />
      <path d="M-22 6C-8 10.5 10 10.5 21 6" fill="none" stroke="#d3daf5" strokeWidth="3" strokeLinecap="round" />
      <circle cx="9" cy="3" r="2.4" fill={PINK} opacity="0.7" />
      <circle cx="18" cy="-1" r="3" fill={INK} />
      <circle cx="19" cy="-2" r="1" fill="#fff" />
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
        <clipPath id={`body${id}`}>
          <path d={BODY} />
        </clipPath>
        <clipPath id={`belly${id}`}>
          <path d={BELLY} />
        </clipPath>
      </defs>
      <g ref={part('root')}>
        <g ref={part('feet')}>
          <path d="M82 262C100 256 124 260 128 269C126 278 98 281 82 277C72 273 73 265 82 262Z" fill={FEET[1]} />
          <path d="M118 262C138 256 166 260 170 269C168 279 136 282 118 278C108 274 109 265 118 262Z" fill={FEET[0]} />
          <path d="M140 268h20M144 274h12" stroke={FEET[1]} strokeWidth="3" strokeLinecap="round" />
        </g>
        <path d="M58 224C40 234 28 246 23 258C40 263 60 258 70 248Z" fill={PLUME[1]} />
        <g ref={part('body')}>
          <path d={BODY} fill={PLUME[1]} />
          <g clipPath={`url(#body${id})`}>
            <path d={BODY} fill={PLUME[0]} transform="translate(-5 -12)" />
            <path d="M72 66C80 48 96 38 114 36" fill="none" stroke={PLUME[2]} strokeWidth="8" strokeLinecap="round" opacity="0.8" />
            <path d="M54 190C54 172 60 154 68 140" fill="none" stroke={PLUME[2]} strokeWidth="7" strokeLinecap="round" opacity="0.6" />
          </g>
          <path d={BELLY} fill={CREAM_SHADE} />
          <g clipPath={`url(#belly${id})`}>
            <path d={BELLY} fill={CREAM} transform="translate(-9 -6)" />
            {/* The one dark band across the chest. */}
            <path d="M68 216C82 168 116 140 178 146" fill="none" stroke={PLUME[0]} strokeWidth="13" />
          </g>
          <circle cx="132" cy="226" r="3.2" fill={PLUME[0]} />
          <circle cx="112" cy="240" r="2.6" fill={PLUME[0]} />
          <circle cx="150" cy="208" r="2.6" fill={PLUME[0]} />
        </g>
        <g ref={part('head')}>
          {/* The cream stripe from the beak, over the eye, down to the throat. */}
          <path d={STRIPE} fill="none" stroke={CREAM} strokeWidth="13" strokeLinecap="round" />
          <ellipse ref={part('blush')} cx="147" cy="103" rx="11" ry="6.5" fill={PINK} opacity="0.8" />
          <g ref={part('beakLow')}>
            <path d="M170 91C186 91 202 91 213 91C202 100 186 101 171 98Z" fill={PLUME[1]} />
          </g>
          <path d="M168 77C190 74 212 79 225 90C208 93 188 93 170 94Z" fill="#5d5680" />
          <path d="M168 77C190 74 212 79 225 90C206 85 188 83 169 84Z" fill="#8982b0" />
          <path d="M199 80L205 92" stroke={CREAM} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
          <path d="M166 79C174 76 181 79 181 86C181 92 175 95 168 94C163 90 162 83 166 79Z" fill={PINK} />
          {/* The eye: big and shiny on a cream patch, so it reads on the dark head. */}
          <g ref={part('eyeOpen')}>
            <circle cx="152" cy="72" r="14.5" fill={CREAM} />
            <ellipse cx="153" cy="72" rx="9.6" ry="10.6" fill={INK} />
            <circle cx="156.5" cy="67.5" r="3.8" fill="#fff" />
            <circle cx="149.5" cy="76.5" r="1.7" fill="#fff" />
          </g>
          <path ref={part('eyeShut')} d="M141 75Q152 63 163 75" fill="none" stroke={CREAM} strokeWidth="5.5" strokeLinecap="round" />
          <path ref={part('eyeSqueeze')} d="M143 64L159 72L143 80" fill="none" stroke={CREAM} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <g ref={part('eyeWide')}>
            <circle cx="152" cy="72" r="15.5" fill={CREAM} />
            <circle cx="155" cy="72" r="6.4" fill={INK} />
            <circle cx="157" cy="70" r="2" fill="#fff" />
          </g>
          {kind === 'pepa' && (
            <>
              <path d="M141 61L134 55M147 57L143 49" stroke={PLUME[1]} strokeWidth="3.6" strokeLinecap="round" />
              <g transform="translate(96 50)">
                {[0, 72, 144, 216, 288].map((r) => (
                  <g key={r} transform={`rotate(${r})`}>
                    <ellipse cx="0" cy="-12" rx="9" ry="12" fill={PINK} />
                    <ellipse cx="0" cy="-14" rx="4" ry="6" fill="#ffc4da" />
                  </g>
                ))}
                <circle r="7" fill="#ffc83d" />
                <circle cx="-2" cy="-2" r="2.6" fill="#ffe189" />
              </g>
            </>
          )}
          {kind === 'tuft' && (
            <>
              <path d="M102 40C92 16 102 6 110 26C112 4 126 4 121 29C132 12 141 21 126 41Z" fill={PLUME[0]} />
              <path d="M106 30C104 22 104 16 106 14M117 28C118 20 120 14 122 12" fill="none" stroke={PLUME[2]} strokeWidth="4" strokeLinecap="round" />
            </>
          )}
          <g ref={part('fish')} transform="translate(214 98) rotate(78)">
            <FishShape />
          </g>
          {/* A floppy seaweed "sock" it proudly brings back when it missed every fish. */}
          <g ref={part('sock')}>
            <path d="M84 42C92 18 122 14 138 26C144 34 140 44 132 44C126 60 120 74 104 76C90 78 84 66 92 60C96 54 88 50 84 42Z" fill="#73cf86" />
            <path d="M112 44C110 58 104 68 96 70" fill="none" stroke="#48a96c" strokeWidth="6" strokeLinecap="round" />
            <path d="M96 38C106 30 120 28 130 32" fill="none" stroke="#aee8b7" strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>
        <g ref={part('flip')}>
          <path d={FLIPPER} fill={PLUME[1]} />
          <path d="M94 132C80 152 70 186 72 214" fill="none" stroke={PLUME[2]} strokeWidth="6" strokeLinecap="round" opacity="0.75" />
        </g>
      </g>
    </svg>
  )
})
