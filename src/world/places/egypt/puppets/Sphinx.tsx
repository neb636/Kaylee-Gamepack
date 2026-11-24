// The Great Sphinx: a lion's body lying in the sand with a friendly face under a striped headdress (and, like the real
// one, no nose). A layered SVG puppet, drawn by hand in the Nile's look (the hippo's bold ink line, round shapes, a
// stone base, a shade and a cream tone, plain dark eyes with two highlights). He sleeps (`asleep`), wakes, blinks,
// watches her finger, talks in his big booming voice, and can sneeze (ah... ah... CHOO), smile, cheer, dance and wiggle.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK, inkStyle, useInk } from '../../../kit/ink'
import type { RevealRegion } from '../../../kit/ScratchReveal'

export interface SphinxProps {
  height?: string
  style?: CSSProperties
  /** Eyes shut, slow sleepy breathing, a little "z". */
  asleep?: boolean
}

const STONE = '#F2C282'
const SHADE = '#DFA263'
const CREAM = '#FCE6BC'
const SKIN = '#F8D29C'
const GOLD = '#FFD766'
const BLUE = '#79B8F2'
const BLUSH = '#FF9DB0'
// The hippo's line: 6 units of ink around every part.
const { inkPass, line } = inkStyle(INK, 6, 0.75)
const TAIL = 'M552 374 C598 372 610 320 586 298'

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
    eyes: [252, 152],
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
      setT(p.tail, `rotate(${tail * 0.6} 556 372)`)
      setT(p.pawL, `translate(0 ${-paw})`)
      show(p.eyesOpen, eyes === 'open')
      show(p.eyesSleep, eyes === 'sleep')
      show(p.eyesHappy, eyes === 'happy')
      show(p.eyesSqueeze, eyes === 'squeeze')
      setT(p.pupilL, `translate(${look.x * 3} ${look.y * 3})`)
      setT(p.pupilR, `translate(${look.x * 3} ${look.y * 3})`)
      const m = Math.min(1, mouth)
      if (m > 0.06) setA(p.mouth, 'd', `M230 196 Q252 ${192 - m * 2} 274 196 Q270 ${198 + 26 * m} 252 ${200 + 26 * m} Q234 ${198 + 26 * m} 230 196Z`)
      else setA(p.mouth, 'd', '')
      show(p.smile, m <= 0.06)
      show(p.zzz, sl > 0.6)
      if (sl > 0.6) setT(p.zzz, `translate(${350 + Math.sin(t * 1.3) * 5} ${40 - ((t * 16) % 26)})`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const toes = (x: number) => <path {...line()} d={`M${x} 372 v15 M${x + 20} 376 v15 M${x + 40} 372 v15`} />

  const bodyShapes = (pass: boolean) => (
    <>
      <g ref={r('tail', pass)}>
        <path fill="none" stroke={pass ? INK : STONE} strokeWidth={pass ? 28 : 16} strokeLinecap="round" d={TAIL} />
        <ellipse fill={SHADE} cx="584" cy="292" rx="15" ry="18" transform="rotate(-24 584 292)" />
      </g>
      {/* Back and haunch, behind the head */}
      <path fill={STONE} d="M300 396 L300 222 C356 202 436 206 494 230 C546 252 578 298 578 344 C578 378 568 396 548 396 Z" />
      {!pass && (
        <>
          {/* the shade under his belly, a few old stone blocks, and the crease of his haunch */}
          <path fill={SHADE} d="M300 368 C380 384 486 384 576 358 C576 382 566 396 548 396 L300 396Z" />
          <path fill="none" stroke={SHADE} strokeWidth="8" strokeLinecap="round" d="M388 250 h46 M452 268 h30 M398 292 h30" />
          <path {...line()} d="M462 292 C446 322 448 360 466 388" />
        </>
      )}
      {/* His back paw peeks out from under the haunch */}
      <path fill={STONE} d="M474 350 L530 350 C560 350 560 396 530 396 L474 396 C444 396 444 350 474 350Z" />
      {!pass && toes(466)}
      {/* The left front paw comes out from under the chest */}
      <g ref={r('pawL', pass)}>
        <path fill={STONE} d="M250 336 L68 336 C28 336 28 396 68 396 L250 396 Z" />
        {!pass && toes(52)}
      </g>
      {/* Chest and neck under the head */}
      <path fill={STONE} d="M186 396 C178 300 196 226 252 200 C308 226 330 300 322 396 Z" />
      {!pass && <path fill={CREAM} d="M210 396 C204 332 218 268 252 246 C286 268 300 332 294 396 Z" />}
      {/* The right front paw, in front of the chest */}
      <path fill={STONE} d="M424 336 L292 336 C252 336 252 396 292 396 L424 396 Z" />
      {!pass && (
        <>
          <path {...line()} d="M292 336 C252 336 252 396 292 396 M292 336 H420" />
          {toes(276)}
        </>
      )}
    </>
  )
  const NEMES = 'M152 128 C142 42 202 6 252 6 C302 6 362 42 352 128 L370 290 C372 302 364 310 354 310 L314 310 C306 310 300 304 299 296 L290 208 L214 208 L205 296 C204 304 198 310 190 310 L150 310 C140 310 132 302 134 290 Z'
  const FACE = 'M252 74 C304 74 330 112 330 152 C330 200 298 230 252 230 C206 230 174 200 174 152 C174 112 200 74 252 74 Z'

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {/* The nemes headdress: a round top and two wide flaps down to the chest. */}
      <path fill={GOLD} d={NEMES} />
      {!pass && (
        <>
          <g clipPath={`url(#${id}-nemes)`} fill="none" stroke={BLUE} strokeWidth="14">
            {Array.from({ length: 11 }, (_, i) => (
              <path key={i} d={`M120 ${42 + i * 28} Q252 ${30 + i * 28} 384 ${42 + i * 28}`} />
            ))}
          </g>
          {/* his ears poke out of the headdress */}
          <ellipse {...line(6)} fill={SKIN} cx="172" cy="156" rx="15" ry="21" />
          <ellipse {...line(6)} fill={SKIN} cx="332" cy="156" rx="15" ry="21" />
          <path {...line(6)} fill={SKIN} d={FACE} />
          <path fill={CREAM} d="M252 168 C282 168 304 180 304 198 C304 214 282 222 252 222 C222 222 200 214 200 198 C200 180 222 168 252 168Z" opacity="0.7" />
          {/* the gold band across his forehead, with a pink jewel */}
          <path {...line()} fill={GOLD} d="M178 112 C202 80 302 80 326 112 L324 130 C300 102 204 102 180 130 Z" />
          <circle {...line(3.5)} fill={BLUSH} cx="252" cy="98" r="9" />
          <ellipse ref={part('blush')} fill={BLUSH} opacity="0.8" cx="202" cy="186" rx="17" ry="10" />
          <ellipse fill={BLUSH} opacity="0.8" cx="302" cy="186" rx="17" ry="10" />
          {/* Where his nose used to be: just a little flat spot. */}
          <path {...line(3.5)} d="M245 178 Q252 183 259 178" opacity="0.6" />
          <g ref={part('eyesOpen')}>
            {[222, 282].map((x) => (
              <g key={x} transform={`translate(${x} 152)`}>
                <ellipse fill="#2E1C1A" rx="15" ry="19" />
                <g ref={part(x === 222 ? 'pupilL' : 'pupilR')}>
                  <circle fill="#fff" cx="-4.5" cy="-7" r="5.5" />
                  <circle fill="#fff" cx="5" cy="6" r="2.6" />
                </g>
              </g>
            ))}
          </g>
          <g ref={part('eyesSleep')} style={{ display: 'none' }}>
            <path {...line(5)} d="M207 152 Q222 165 237 152 M267 152 Q282 165 297 152" />
          </g>
          <g ref={part('eyesHappy')} style={{ display: 'none' }}>
            <path {...line(5.5)} d="M207 157 Q222 140 237 157 M267 157 Q282 140 297 157" />
          </g>
          <g ref={part('eyesSqueeze')} style={{ display: 'none' }}>
            <path {...line(5.5)} d="M210 141 L232 152 L210 163 M294 141 L272 152 L294 163" />
          </g>
          <path ref={part('mouth')} fill="#B8323F" stroke={INK} strokeWidth="4" strokeLinejoin="round" d="" />
          <path ref={part('smile')} {...line()} d="M232 196 Q252 212 272 196" />
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
        <g {...inkPass()}>{head(true)}</g>
        {head(false)}
        <g ref={part('zzz')} style={{ display: 'none' }} fontFamily="Fredoka, sans-serif" fontWeight="700" fill="#7E6FC7">
          <text fontSize="40">z</text>
          <text x="24" y="-26" fontSize="30">z</text>
        </g>
      </g>
    </svg>
  )
})
