// The Great Sphinx: a lion's body lying in the sand with a friendly face under a striped headdress (and, like the real
// one, no nose). A layered SVG puppet: he sleeps (`asleep`), wakes, blinks, watches her finger, talks in his big booming
// voice, and can sneeze (ah... ah... CHOO), smile, cheer, dance and wiggle.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from '../../../kit/ink'
import type { RevealRegion } from '../../../kit/ScratchReveal'

export interface SphinxProps {
  height?: string
  style?: CSSProperties
  /** Eyes shut, slow sleepy breathing, a little "z". */
  asleep?: boolean
}

const STONE = '#E9C48C'
const STONE_DARK = '#D4A868'
const SKIN = '#F2CE96'
const GOLD = '#FFD76A'
const BLUE = '#7FB8F0'
const INK = '#3F2A26'
const inkPass = () => inkPassIn(undefined, INK)
const line = (width?: number) => lineIn(width, INK)

/** The drawing's size (viewBox units), and where his parts are in % of it (for rubbing the sand off in stages). */
export const SPHINX_BOX: [number, number] = [600, 400]
export const SPHINX_REGIONS: Record<'face' | 'paws' | 'back', RevealRegion> = {
  face: { x: 24, y: 3, w: 36, h: 55 },
  paws: { x: 4, y: 82, w: 68, h: 17 },
  back: { x: 68, y: 44, w: 31, h: 55 },
}
export const SPHINX_ACTIONS = { wake: 1.2, sneeze: 1.3, smile: 1, cheer: 1.1, dance: 1.8, wiggle: 0.6 }

type Part = 'root' | 'head' | 'tail' | 'eyesOpen' | 'eyesSleep' | 'eyesHappy' | 'eyesSqueeze' | 'pupilL' | 'pupilR' | 'mouth' | 'smile' | 'zzz' | 'pawL' | 'blush'

/** The Sphinx. Actions: wake, sneeze, smile, cheer, dance, wiggle. Voice: sphinx. */
export const Sphinx = forwardRef<PuppetHandle, SphinxProps>(function Sphinx({ height, style, asleep = false }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ tail: spring(40, 4), sleep: asleep ? 1 : 0 }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'sphinx',
    actions: SPHINX_ACTIONS,
    eyes: [252, 150],
    frame: (f, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action
      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))
      st.sleep += ((asleep ? 1 : 0) - st.sleep) * Math.min(1, dt * 3)
      const sl = st.sleep

      const breath = Math.sin(t * (1.4 - 0.6 * sl))
      let sy = 1 + breath * (0.008 + 0.01 * sl)
      let sx = 1 - breath * 0.004
      let headRot = Math.sin(t * 0.7) * 1.5 * (1 - sl) + look.x * 3 * (1 - sl) + sl * 4
      let headY = sl * 4
      let lift = 0
      let eyes: 'open' | 'sleep' | 'happy' | 'squeeze' = sl > 0.6 ? 'sleep' : 'open'
      let mouth = f.mouth
      let paw = 0
      let tailWag = Math.sin(t * 1.1) * 8

      if (act === 'wake') {
        const e = bell(span(q, 0, 0.8))
        eyes = q < 0.3 ? 'sleep' : q < 0.6 ? 'squeeze' : 'open'
        mouth = Math.max(mouth, e * 0.8)
        headRot -= e * 6
        sy *= 1 + e * 0.04
      } else if (act === 'sneeze') {
        // Ah... ah... (head tips back, eyes squeeze) CHOO! (snaps forward), then settles.
        const ah = smooth(span(q, 0, 0.55))
        const choo = bell(span(q, 0.55, 0.8))
        const settle = wobble(span(q, 0.75, 1), 2)
        headRot += -ah * 12 * (1 - span(q, 0.55, 0.62)) + choo * 14 + settle * 4
        headY += -ah * 6 * (1 - span(q, 0.55, 0.62)) + choo * 8
        eyes = q < 0.85 ? 'squeeze' : 'open'
        mouth = Math.max(mouth, q < 0.55 ? ah * 0.5 : choo)
        sx *= 1 + choo * 0.03
        sy *= 1 - choo * 0.04
      } else if (act === 'smile') {
        eyes = 'happy'
        headRot += Math.sin(q * Math.PI * 2) * 6 * env
        mouth = Math.max(mouth, 0.2 * env)
      } else if (act === 'cheer') {
        const up = bell(span(q, 0.1, 0.8))
        lift = up * 16
        sy *= 1 + up * 0.04
        eyes = 'happy'
        mouth = Math.max(mouth, 0.6 * env)
        paw = up * 18
        tailWag += up * 30 * Math.sin(q * Math.PI * 6)
      } else if (act === 'dance') {
        const beat = q * Math.PI * 8
        headRot += Math.sin(beat / 2) * 10 * env
        lift = Math.abs(Math.sin(beat)) * 8 * env
        paw = Math.abs(Math.sin(beat)) * 14 * env
        eyes = 'happy'
        mouth = Math.max(mouth, 0.4 * env)
        tailWag = Math.sin(beat) * 30
      } else if (act === 'wiggle') {
        const w = wobble(q, 3)
        sx *= 1 + 0.04 * w
        sy *= 1 - 0.04 * w
        headRot += w * 5
        eyes = 'happy'
      }
      headRot += Math.sin(t * 7) * f.mouth * 2
      if (eyes === 'open' && f.blink < 0.4) eyes = 'sleep' // a blink
      const tail = st.tail.step(tailWag, dt)

      setT(p.root, `translate(0 ${-lift}) translate(300 392) scale(${sx} ${sy}) translate(-300 -392)`)
      setT(p.head, `translate(0 ${headY}) rotate(${headRot} 252 290)`)
      setT(p.tail, `rotate(${tail} 566 370)`)
      setT(p.pawL, `translate(0 ${-paw})`)
      show(p.eyesOpen, eyes === 'open')
      show(p.eyesSleep, eyes === 'sleep')
      show(p.eyesHappy, eyes === 'happy')
      show(p.eyesSqueeze, eyes === 'squeeze')
      setT(p.pupilL, `translate(${look.x * 3} ${look.y * 3})`)
      setT(p.pupilR, `translate(${look.x * 3} ${look.y * 3})`)
      const m = Math.min(1, mouth)
      if (m > 0.06) setA(p.mouth, 'd', `M232 192 Q252 ${188 - m * 2} 272 192 Q268 ${194 + 26 * m} 252 ${196 + 26 * m} Q236 ${194 + 26 * m} 232 192Z`)
      else setA(p.mouth, 'd', '')
      show(p.smile, m <= 0.06)
      show(p.zzz, sl > 0.6)
      if (sl > 0.6) setT(p.zzz, `translate(${350 + Math.sin(t * 1.3) * 5} ${40 - ((t * 16) % 26)})`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const bodyShapes = (pass: boolean) => (
    <>
      <g ref={r('tail', pass)}>
        <path fill="none" stroke={pass ? INK : STONE_DARK} strokeWidth={pass ? 22 : 14} strokeLinecap="round" d="M566 376 C594 362 598 330 580 316" />
        <circle fill={STONE_DARK} cx="578" cy="312" r={pass ? 16 : 12} />
      </g>
      {/* Back and haunch, behind the head */}
      <path fill={STONE} d="M300 392 L300 214 C360 196 440 204 500 232 C552 256 578 300 580 344 C582 372 572 392 556 392 Z" />
      <circle fill={STONE} cx="506" cy="332" r="66" />
      {/* The left front paw comes out from under the chest */}
      <g ref={r('pawL', pass)}>
        <path fill={STONE} d="M250 338 L70 338 C24 338 20 396 66 396 L250 396 Z" />
      </g>
      {/* Chest and neck under the head */}
      <path fill={STONE} d="M186 392 C178 300 196 226 252 200 C308 226 330 300 322 392 Z" />
      {/* The right front paw, in front of the chest */}
      <path fill={STONE} d="M436 334 L296 334 C254 334 250 396 292 396 L440 396 Z" />
    </>
  )
  const toes = (x: number) => <path {...line(3.2)} d={`M${x} 354 C${x + 12} 358 ${x + 12} 380 ${x} 384 M${x + 24} 352 C${x + 36} 356 ${x + 36} 382 ${x + 24} 386 M${x + 48} 352 C${x + 60} 356 ${x + 60} 382 ${x + 48} 386`} />
  const NEMES = 'M160 124 C152 44 206 12 252 12 C298 12 352 44 344 124 L366 300 L306 300 L292 200 L212 200 L198 300 L138 300 Z'

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {/* The nemes headdress: a round top and two wide flaps down to the chest. */}
      <path fill={GOLD} d={NEMES} />
      {!pass && (
        <>
          <g clipPath={`url(#${id}-nemes)`} fill="none" stroke={BLUE} strokeWidth="13">
            {Array.from({ length: 11 }, (_, i) => (
              <path key={i} d={`M120 ${40 + i * 26} Q252 ${30 + i * 26} 384 ${40 + i * 26}`} />
            ))}
          </g>
          <path fill={SKIN} stroke={INK} strokeWidth="5" d="M252 70 C302 70 322 110 322 150 C322 200 294 228 252 228 C210 228 182 200 182 150 C182 110 202 70 252 70 Z" />
          <path fill={GOLD} stroke={INK} strokeWidth="4" d="M186 100 C206 78 298 78 318 100 L316 114 C296 96 208 96 188 114 Z" />
          <path fill="none" stroke={BLUE} strokeWidth="5" d="M194 102 C214 88 290 88 310 102" />
          <ellipse ref={part('blush')} fill="#FF9DB0" opacity="0.8" cx="210" cy="178" rx="16" ry="9" />
          <ellipse fill="#FF9DB0" opacity="0.8" cx="294" cy="178" rx="16" ry="9" />
          {/* Where his nose used to be: just a little flat spot. */}
          <path {...line(2.6)} d="M246 172 Q252 176 258 172" opacity="0.7" />
          <g ref={part('eyesOpen')}>
            {[224, 280].map((x) => (
              <g key={x} transform={`translate(${x} 150)`}>
                <ellipse fill="#2E1C1A" rx="13" ry="16" />
                <g ref={part(x === 224 ? 'pupilL' : 'pupilR')}>
                  <circle fill="#fff" cx="-4" cy="-6" r="5" />
                  <circle fill="#fff" cx="4.5" cy="4.5" r="2" />
                </g>
                <path {...line(2.6)} d={x === 224 ? 'M-11 -11 L-18 -16' : 'M11 -11 L18 -16'} />
              </g>
            ))}
          </g>
          <g ref={part('eyesSleep')} style={{ display: 'none' }}>
            <path {...line(4)} d="M210 150 Q224 162 238 150 M266 150 Q280 162 294 150" />
          </g>
          <g ref={part('eyesHappy')} style={{ display: 'none' }}>
            <path {...line(4.5)} d="M210 154 Q224 140 238 154 M266 154 Q280 140 294 154" />
          </g>
          <g ref={part('eyesSqueeze')} style={{ display: 'none' }}>
            <path {...line(4.5)} d="M212 140 L232 150 L212 160 M292 140 L272 150 L292 160" />
          </g>
          <path {...line(3)} d="M208 126 Q222 120 236 124 M268 124 Q282 120 296 126" />
          <path ref={part('mouth')} fill="#B8323F" stroke={INK} strokeWidth="3" strokeLinejoin="round" d="" />
          <path ref={part('smile')} {...line(3.4)} d="M234 192 Q252 206 270 192" />
        </>
      )}
    </g>
  )

  return (
    <svg ref={svg} viewBox={`0 0 ${SPHINX_BOX[0]} ${SPHINX_BOX[1]}`} aria-label="The Sphinx" style={{ height, aspectRatio: `${SPHINX_BOX[0]} / ${SPHINX_BOX[1]}`, overflow: 'visible', display: 'block', ...style }}>
      <defs>
        <clipPath id={`${id}-nemes`}>
          <path d={NEMES} />
        </clipPath>
      </defs>
      <g ref={part('root')} strokeLinejoin="round">
        <g {...inkPass()}>{bodyShapes(true)}</g>
        {bodyShapes(false)}
        {toes(292)}
        {/* Stone block lines on his back */}
        <path {...line(2.6)} opacity="0.5" d="M400 226 L400 270 M460 244 L460 280 M430 280 L430 324 M340 270 H470 M340 318 H440 M220 300 H300 M230 250 L230 300 M280 300 L280 340" />
        <path {...line(3)} d="M474 300 C486 332 476 372 456 390" />
        <g {...inkPass()}>{head(true)}</g>
        {head(false)}
        {toes(66)}
        <g ref={part('zzz')} style={{ display: 'none' }} fontFamily="Fredoka, sans-serif" fontWeight="700" fill="#7E6FC7">
          <text fontSize="40">z</text>
          <text x="24" y="-26" fontSize="30">z</text>
        </g>
      </g>
    </svg>
  )
})
