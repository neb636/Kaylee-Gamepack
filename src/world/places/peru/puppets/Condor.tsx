// Coco the Andean condor dad and Pluma, his fluffy chick (Coco's Canyon Glide). Drawn from their reference pictures
// (assets/canyon-coco.webp, canyon-pluma.webp) in the same flat 5-unit-outline style, facing right; the game flips the
// wrapper to fly left.
//
// Coco hardly flaps: his wings stay spread in a shallow V and his long wingtip feathers ("fingers", real condors have
// them) each hang on their own spring, so they flutter and lag when he banks or flaps. `lift` (warm air) raises his
// wings a little and spreads the fingers; `tuck` (a dive) folds them back. Pluma flaps hard and wobbles at first, and
// glides more smoothly as `confidence` grows.
import { forwardRef, useRef } from 'react'
import { bell, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK } from './Alpaca'

const PLUM = '#4A3F55'
const PLUM_DARK = '#3A3145'
const SILVER = '#D9CCFF'
const CREAM = '#FFF7F0'
const SKIN = '#FFB4A0'
const COMB = '#E0608A'
const BEAK = '#FFF1C9'
const BLUSH = '#FF8FB8'

/** Coco's picture box (viewBox units) and the middle of his body (the game centres him on it). */
export const CONDOR_VIEW = { w: 600, h: 420, cx: 300, cy: 250 }
export const CHICK_VIEW = { w: 300, h: 300, cx: 150, cy: 170 }

export const CONDOR_ACTIONS = { flap: 1.1, cheer: 1.2, sneeze: 0.9, nod: 0.7, bow: 1.1, wiggle: 0.7, swoop: 1.0 }
export const CHICK_ACTIONS = { flap: 0.9, hop: 0.8, cheer: 1.1, wobble: 1.0, dizzy: 2.0, peek: 1.6, giggle: 1.0 }

/** Write an attribute or style only when it changes. */
const last = new WeakMap<Element, Record<string, string>>()
function put(el: Element | undefined, key: string, value: string) {
  if (!el) return
  let memo = last.get(el)
  if (!memo) last.set(el, (memo = {}))
  if (memo[key] === value) return
  memo[key] = value
  if (key === 'transform' && el instanceof HTMLElement) el.style.transform = value
  else el.setAttribute(key, value)
}

// ---------------------------------------------------------------------------------------------------------------------
// Coco

export interface CondorProps {
  height: string
  /** 0..1: in warm air (wings up a little, fingers wide). */
  lift?: number
  /** 0..1: diving (wings folded back). */
  tuck?: number
  /** Pulling him up in plain air: slow, heavy flaps that barely help. */
  trying?: boolean
  /** Just flew through a cloud: drips. */
  damp?: boolean
  /** A friend condor: a little greyer, no comb. */
  friend?: boolean
  label?: string
  /** Per-frame values from a game loop (lift, tuck...), read every frame without re-rendering. */
  drive?: { current: { lift?: number; tuck?: number; trying?: boolean; damp?: boolean } }
}

type CondorPart = 'root' | 'wingNear' | 'wingFar' | 'f0' | 'f1' | 'f2' | 'f3' | 'f4' | 'g0' | 'g1' | 'g2' | 'g3' | 'g4' | 'tail' | 'head' | 'jaw' | 'eyeOpen' | 'eyeShut' | 'drips'

/** The near wing, raised up and back from the shoulder (330, 228), without its fingers. */
const WING = 'M338 236Q300 140 222 96Q196 84 168 80L146 108Q150 162 196 198Q246 238 294 266Z'
/** Where each finger feather starts on the wing tip, and its resting angle (degrees, 0 = pointing right). */
const FINGERS: { x: number; y: number; a: number; len: number }[] = [
  { x: 176, y: 88, a: -150, len: 108 },
  { x: 166, y: 98, a: -160, len: 116 },
  { x: 160, y: 112, a: -170, len: 112 },
  { x: 160, y: 128, a: -180, len: 100 },
  { x: 166, y: 146, a: 170, len: 86 },
]
/** Silvery secondary feathers along the near wing's trailing edge (like the reference): rounded tips sticking out. */
const SECONDARIES = Array.from({ length: 6 }, (_, i) => {
  const k = 0.1 + i * 0.15
  return { x: 294 + (164 - 294) * k - 0.634 * 20, y: 266 + (126 - 266) * k + 0.773 * 20 }
})
const feather = (len: number) => `M0 -11Q${len * 0.55} -16 ${len} -2Q${len * 0.6} 12 0 11Z`

export const Condor = forwardRef<PuppetHandle, CondorProps>(function Condor(props, ref) {
  const { height, friend = false, label } = props
  const live = useRef(props)
  live.current = props
  const springs = useRef({
    near: spring(70, 9),
    far: spring(70, 9),
    tail: spring(90, 8),
    head: spring(110, 11),
    fingers: [0, 1, 2, 3, 4].map(() => spring(120, 6)),
    farFingers: [0, 1, 2, 3, 4].map(() => spring(120, 6)),
  }).current
  const flapPhase = useRef(0)

  const { svg, part } = usePuppet<CondorPart>(ref, {
    voice: friend ? undefined : 'coco',
    actions: CONDOR_ACTIONS,
    eyes: [468, 190],
    frame: (f, p) => {
      const { lift = 0, tuck = 0, trying = false, damp = false } = { ...live.current, ...live.current.drive?.current }
      const q = f.p
      const a = f.action
      const e = bell(q)
      // Wing angle: positive folds the wing down / back from the shoulder; negative raises it.
      let wing = Math.sin(f.t * 1.4) * 3 - lift * 9 + tuck * 46
      let spread = lift * 9 - tuck * 14
      // Big slow flaps when she pulls him up in plain air (they barely help: condors soar, they hardly flap).
      if (trying && !a) {
        flapPhase.current += f.dt * 3.2
        wing += Math.max(0, Math.sin(flapPhase.current)) ** 2 * 38 - 6
      } else flapPhase.current = 0
      if (a === 'flap') wing += Math.sin(q * Math.PI * 4) * 36 * e + 6 * e
      if (a === 'cheer') wing += -Math.abs(Math.sin(q * Math.PI * 3)) * 22 * e
      if (a === 'bow') wing += e * 12
      if (a === 'swoop') wing += bell(span(q, 0, 0.5)) * 40 - bell(span(q, 0.5, 1)) * 14
      const near = springs.near.step(wing, f.dt)
      const far = springs.far.step(wing * 0.85 - 12, f.dt)
      // Resting: a tall V (the near wing almost upright, the far one lower). Folding sweeps them back and down.
      put(p.wingNear, 'transform', `rotate(${(26 - near).toFixed(2)} 330 228)`)
      put(p.wingFar, 'transform', `translate(-30 -12) rotate(${(-8 - far).toFixed(2)} 330 228)`)
      // Fingers lag behind the wing and flutter in the wind.
      FINGERS.forEach((fg, i) => {
        const target = (i - 2) * spread * 0.5 + (wing - near) * 0.9 + Math.sin(f.t * 9 + i * 1.3) * (1.5 + tuck * 2)
        put(p[`f${i}` as CondorPart], 'transform', `translate(${fg.x} ${fg.y}) rotate(${(fg.a + springs.fingers[i].step(target, f.dt)).toFixed(2)})`)
        put(p[`g${i}` as CondorPart], 'transform', `translate(${fg.x} ${fg.y}) rotate(${(fg.a + springs.farFingers[i].step(target * 0.8 - 4, f.dt)).toFixed(2)})`)
      })
      put(p.tail, 'transform', `rotate(${springs.tail.step(Math.sin(f.t * 1.8) * 3 + lift * 4 - tuck * 6, f.dt).toFixed(2)} 190 252)`)

      // Body: a slow breath, a bob on each flap.
      const bob = a === 'flap' ? Math.sin(q * Math.PI * 4) * 4 * e : 0
      const breathe = Math.sin(f.t * 2) * 0.008
      put(p.root, 'transform', `translate(0%, ${(-bob * 0.4).toFixed(2)}%) scale(${(1 + breathe).toFixed(4)}, ${(1 - breathe).toFixed(4)})`)

      // Head: looks toward her finger, nods, sneezes, bows.
      let head = f.look.y * 6 + Math.sin(f.t * 0.9) * 2
      if (a === 'nod') head += Math.sin(q * Math.PI * 2) * 10
      if (a === 'bow') head += e * 26
      if (a === 'sneeze') head += -bell(span(q, 0, 0.55)) * 14 + bell(span(q, 0.55, 0.8)) * 22
      if (a === 'cheer') head -= e * 10
      if (a === 'wiggle') head += Math.sin(q * Math.PI * 6) * 8
      put(p.head, 'transform', `rotate(${springs.head.step(head, f.dt).toFixed(2)} 420 222)`)
      const shut = a === 'sneeze' && q > 0.4 && q < 0.85
      put(p.eyeOpen, 'display', shut ? 'none' : 'inline')
      put(p.eyeShut, 'display', shut ? 'inline' : 'none')
      put(p.eyeOpen, 'transform', `translate(0 ${(190 * (1 - f.blink)).toFixed(1)}) scale(1 ${f.blink.toFixed(3)})`)
      const open = Math.max(f.mouth, a === 'cheer' ? e * 0.8 : 0, a === 'sneeze' ? bell(span(q, 0.5, 0.9)) : 0)
      put(p.jaw, 'transform', `rotate(${(open * 22).toFixed(1)} 488 210)`)
      put(p.drips, 'display', damp ? 'inline' : 'none')
    },
  })

  const body = friend ? '#554A60' : PLUM
  const fingerFill = friend ? '#463C50' : PLUM_DARK
  return (
    <div role="img" aria-label={label ?? 'Coco'} style={{ position: 'relative', height, aspectRatio: `${CONDOR_VIEW.w} / ${CONDOR_VIEW.h}` }}>
      <div ref={part('root')} style={{ position: 'absolute', inset: 0, transformOrigin: '50% 60%', willChange: 'transform' }}>
        <svg ref={svg} viewBox={`0 0 ${CONDOR_VIEW.w} ${CONDOR_VIEW.h}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <g stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
            {/* Far wing, behind the body. */}
            <g ref={part('wingFar')}>
              {FINGERS.map((fg, i) => (
                <path key={i} ref={part(`g${i}` as CondorPart)} d={feather(fg.len)} fill="#2F2838" />
              ))}
              {SECONDARIES.map((q, i) => (
                <ellipse key={i} cx={q.x} cy={q.y} rx="38" ry="17" transform={`rotate(129 ${q.x} ${q.y})`} fill="#B9A6F5" />
              ))}
              <path d={WING} fill={PLUM_DARK} />
            </g>
            {/* Tail fan. */}
            <g ref={part('tail')}>
              <path d="M196 236L96 214Q80 248 96 284L196 268Z" fill={fingerFill} />
              <path d="M150 230L104 238M150 262L104 266" fill="none" stroke="#2F2838" strokeWidth="4" />
            </g>
            {/* Body, and his feet tucked under it. */}
            <path d="M252 290Q258 310 276 306M286 292Q292 312 310 306" fill="none" stroke={INK} strokeWidth="7" />
            <path d="M252 290Q258 310 276 306M286 292Q292 312 310 306" fill="none" stroke={SKIN} strokeWidth="3" />
            <ellipse cx="300" cy="250" rx="128" ry="50" fill={body} />
            <path d="M210 262Q300 296 392 262" fill="none" stroke={PLUM_DARK} strokeWidth="4" />
            {/* Near wing with its silver feathers and fingers. */}
            <g ref={part('wingNear')}>
              {FINGERS.map((fg, i) => (
                <path key={i} ref={part(`f${i}` as CondorPart)} d={feather(fg.len)} fill={fingerFill} />
              ))}
              {SECONDARIES.map((q, i) => (
                <ellipse key={i} cx={q.x} cy={q.y} rx="38" ry="17" transform={`rotate(129 ${q.x} ${q.y})`} fill={SILVER} />
              ))}
              <path d={WING} fill={body} />
              {/* The silvery band over the secondaries, and a few covert lines. */}
              <path d="M298 262Q248 232 200 194Q168 164 152 114L182 98Q198 146 230 172Q270 206 328 234Z" fill={SILVER} stroke="none" />
              <path d="M300 246Q252 214 214 176Q194 154 182 122" fill="none" stroke="#B9A6F5" strokeWidth="4" />
              <path d={WING} fill="none" />
            </g>
            {/* Head on its neck, in the fluffy collar. */}
            <g ref={part('head')}>
              <path d="M410 214Q432 180 452 176L470 214Q446 236 418 238Z" fill={SKIN} />
              <ellipse cx="458" cy="196" rx="36" ry="33" fill={SKIN} />
              {!friend && <path d="M438 170Q440 148 456 154Q466 140 480 156Q484 166 476 172Z" fill={COMB} />}
              <path ref={part('jaw')} d="M488 208Q506 214 516 210Q510 224 492 222Z" fill={BEAK} strokeWidth="4" />
              <path d="M486 188Q518 180 530 204Q528 218 516 214Q510 206 500 206Q492 208 486 212Z" fill={BEAK} strokeWidth="4.5" />
              <ellipse cx="447" cy="214" rx="11" ry="6.5" fill={BLUSH} stroke="none" opacity=".9" />
              <g ref={part('eyeOpen')}>
                <ellipse cx="468" cy="190" rx="10" ry="12.5" fill={INK} stroke="none" />
                <circle cx="465" cy="185" r="4" fill="#fff" stroke="none" />
                <circle cx="471" cy="195" r="2" fill="#fff" stroke="none" />
              </g>
              <path ref={part('eyeShut')} d="M458 191Q468 199 478 191" fill="none" strokeWidth="4.5" display="none" />
            </g>
            {/* Fluffy cream collar (over the neck's base). */}
            <g>
              {[[396, 206], [388, 230], [396, 256], [414, 268], [426, 248], [420, 222], [408, 196]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="19" fill={CREAM} />
              ))}
              {[[396, 206], [388, 230], [396, 256], [414, 268], [426, 248], [420, 222], [408, 196]].map(([x, y], i) => (
                <circle key={`c${i}`} cx={x} cy={y} r="14.5" fill={CREAM} stroke="none" />
              ))}
            </g>
          </g>
          {/* Cloud drips after flying through a cloud. */}
          <g ref={part('drips')} display="none" className="peru-drips" fill="#A8DCFF" stroke={INK} strokeWidth="3">
            <path d="M300 300q8 14 0 22q-8 -8 0 -22Z" />
            <path d="M360 296q8 14 0 22q-8 -8 0 -22Z" />
            <path d="M240 290q8 14 0 22q-8 -8 0 -22Z" />
          </g>
        </svg>
      </div>
    </div>
  )
})

// ---------------------------------------------------------------------------------------------------------------------
// Pluma

export interface ChickProps {
  height: string
  /** In the air (wings flapping, feet dangling) or sitting in the nest. */
  flying?: boolean
  /** 0 = scared, frantic flapping and wobbling; 1 = a smooth glide with wings spread. */
  confidence?: number
  /** Shivering at the edge of the nest. */
  scared?: boolean
  label?: string
  /** Per-frame values from a game loop, read every frame without re-rendering. */
  drive?: { current: { flying?: boolean; confidence?: number; scared?: boolean } }
}

type ChickPart = 'root' | 'wingNear' | 'wingFar' | 'head' | 'eyes' | 'eyesShut' | 'pupils' | 'beak' | 'feet' | 'stars' | 'tuft'

/** The fluffy outline: puffs around a circle. */
const FLUFF = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2
  return [150 + Math.cos(a) * 74, 172 + Math.sin(a) * 70] as const
})

export const Chick = forwardRef<PuppetHandle, ChickProps>(function Chick(props, ref) {
  const { height, label } = props
  const live = useRef(props)
  live.current = props
  const springs = useRef({ near: spring(160, 8), far: spring(160, 8), head: spring(130, 9), feet: spring(60, 4), tuft: spring(90, 5) }).current

  const { svg, part } = usePuppet<ChickPart>(ref, {
    voice: 'pluma',
    actions: CHICK_ACTIONS,
    eyes: [212, 146],
    frame: (f, p) => {
      const { flying = false, confidence = 0, scared = false } = { ...live.current, ...live.current.drive?.current }
      const q = f.p
      const a = f.action
      const e = bell(q)
      const c = Math.min(1, Math.max(0, confidence))
      let x = 0
      let y = 0
      let rot = 0
      let sx = 1
      let sy = 1
      const breathe = Math.sin(f.t * 2.6)
      sx += breathe * 0.012
      sy -= breathe * 0.016
      // Wings: frantic flapping when she's new to flying, a smooth glide with spread wings when she's confident.
      let wing = 0
      let wingLen = 1
      if (flying) {
        const rate = 15 - c * 9
        const amp = (1 - c) * 46 + 10
        const glide = c > 0.85
        wing = glide ? -14 + Math.sin(f.t * 2) * 5 : Math.sin(f.t * rate) * amp - 10
        wingLen = 1 + c * 0.6
        rot += Math.sin(f.t * 3.1) * (14 - c * 11) + Math.sin(f.t * 7.3) * (4 - c * 3)
        y += Math.sin(f.t * rate) * (1 - c) * 2
      }
      if (scared && !a) {
        x += Math.sin(f.t * 40) * 0.8
        wing += Math.sin(f.t * 40) * 3
      }
      if (a === 'flap') wing += Math.sin(q * Math.PI * 10) * 40 * e
      if (a === 'hop' || a === 'cheer') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.22, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx += crouch * 0.1 - air * 0.06 + land * 0.08
        sy += -crouch * 0.12 + air * 0.1 - land * 0.1
        y -= air * (a === 'cheer' ? 16 : 10)
        wing -= air * 30
      }
      if (a === 'wobble') rot += Math.sin(q * Math.PI * 6) * 14 * e
      if (a === 'giggle') rot += Math.sin(q * Math.PI * 10) * 4 * e
      if (a === 'dizzy') rot += Math.sin(q * Math.PI * 4) * 12 * e
      put(p.root, 'transform', `translate(${x.toFixed(2)}%, ${y.toFixed(2)}%) rotate(${rot.toFixed(2)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`)
      put(p.wingNear, 'transform', `rotate(${springs.near.step(wing, f.dt).toFixed(2)} 138 170) translate(138 170) scale(${wingLen.toFixed(3)} 1) translate(-138 -170)`)
      put(p.wingFar, 'transform', `rotate(${springs.far.step(-wing * 0.8 - 20, f.dt).toFixed(2)} 150 150) translate(150 150) scale(${(wingLen * 0.85).toFixed(3)} 1) translate(-150 -150)`)
      // Head: peeks over the edge, looks at her finger, spins when dizzy.
      let head = f.look.x * 5 + Math.sin(f.t * 1.3) * 2
      if (a === 'peek') head += bell(span(q, 0, 0.8)) * 22
      if (a === 'dizzy') head += Math.sin(q * Math.PI * 8) * 12
      if (a === 'giggle') head += Math.sin(q * Math.PI * 8) * 6 * e
      put(p.head, 'transform', `rotate(${springs.head.step(head, f.dt).toFixed(2)} 190 180)`)
      put(p.tuft, 'transform', `rotate(${springs.tuft.step(-rot * 1.5 + Math.sin(f.t * 5) * (flying ? 8 : 2), f.dt).toFixed(2)} 160 100)`)
      // Feet: dangle and swing while flying, tucked once she's gliding.
      const feet = flying ? springs.feet.step(Math.sin(f.t * 4) * 16 * (1 - c) + rot * 0.8, f.dt) : springs.feet.step(0, f.dt)
      put(p.feet, 'transform', `rotate(${feet.toFixed(2)} 150 236) translate(0 ${flying ? (c * -10).toFixed(1) : 0})`)
      const shut = a === 'giggle' || (a === 'cheer' && q > 0.2 && q < 0.8)
      put(p.eyes, 'display', shut ? 'none' : 'inline')
      put(p.eyesShut, 'display', shut ? 'inline' : 'none')
      // Scared eyes are a little bigger.
      const big = scared || (flying && c < 0.3) ? 1.12 : 1
      put(p.eyes, 'transform', `translate(216 148) scale(${big} ${(f.blink * big).toFixed(3)}) translate(-216 -148)`)
      const look = a === 'dizzy' ? { x: Math.cos(f.t * 12), y: Math.sin(f.t * 12) } : f.look
      put(p.pupils, 'transform', `translate(${(look.x * 3.5).toFixed(1)} ${(look.y * 3).toFixed(1)})`)
      const open = Math.max(f.mouth, a === 'cheer' ? e * 0.8 : 0, a === 'giggle' ? 0.5 : 0)
      put(p.beak, 'transform', `rotate(${(open * 26).toFixed(1)} 238 166)`)
      put(p.stars, 'display', a === 'dizzy' ? 'inline' : 'none')
      put(p.stars, 'transform', `rotate(${((f.t * 240) % 360).toFixed(0)} 190 74)`)
    },
  })

  return (
    <div role="img" aria-label={label ?? 'Pluma'} style={{ position: 'relative', height, aspectRatio: '1 / 1' }}>
      <div ref={part('root')} style={{ position: 'absolute', inset: 0, transformOrigin: '50% 85%', willChange: 'transform' }}>
        <svg ref={svg} viewBox={`0 0 ${CHICK_VIEW.w} ${CHICK_VIEW.h}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <g stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
            <g ref={part('wingFar')}>
              <ellipse cx="108" cy="150" rx="46" ry="22" fill="#8F7870" />
            </g>
            <g ref={part('feet')}>
              <path d="M136 236V270M164 236V270" fill="none" strokeWidth="11" />
              <path d="M136 236V270M164 236V270" fill="none" stroke="#9A93A6" strokeWidth="5" />
              <path d="M120 274Q136 264 150 276M148 274Q164 264 180 276" fill="none" strokeWidth="7" />
            </g>
            {/* Fluffy body: an outline pass, then the down. */}
            <circle cx="150" cy="172" r="74" fill={INK} />
            {FLUFF.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="21" fill={INK} stroke="none" />
            ))}
            <circle cx="150" cy="172" r="70" fill="#B79E94" stroke="none" />
            {FLUFF.map(([x, y], i) => (
              <circle key={`f${i}`} cx={x} cy={y} r="16" fill="#B79E94" stroke="none" />
            ))}
            <path d="M104 196q10 8 20 0q10 8 20 0M130 222q10 8 20 0q10 8 20 0" fill="none" stroke="#9C8278" strokeWidth="4" />
            {/* Fluffy tuft on top. */}
            <g ref={part('tuft')}>
              <path d="M150 104Q138 72 152 66Q156 84 162 96Q170 70 184 78Q176 92 170 108Z" fill="#B79E94" />
            </g>
            <g ref={part('head')}>
              <ellipse cx="214" cy="152" rx="40" ry="36" fill={SKIN} />
              <path ref={part('beak')} d="M236 162Q252 162 256 172Q248 176 238 172Z" fill={BEAK} strokeWidth="4" />
              <path d="M234 150Q258 148 262 166Q258 172 252 168Q246 162 236 164Z" fill={BEAK} strokeWidth="4.5" />
              <ellipse cx="196" cy="172" rx="10" ry="6" fill={BLUSH} stroke="none" />
              <ellipse cx="240" cy="180" rx="7" ry="4.5" fill={BLUSH} stroke="none" />
              <g ref={part('eyes')}>
                <ellipse cx="204" cy="146" rx="11" ry="14" fill={INK} stroke="none" />
                <ellipse cx="230" cy="148" rx="9" ry="12.5" fill={INK} stroke="none" />
                <g ref={part('pupils')} fill="#fff" stroke="none">
                  <circle cx="200" cy="140" r="4.5" />
                  <circle cx="227" cy="142" r="4" />
                  <circle cx="207" cy="152" r="2" />
                </g>
              </g>
              <g ref={part('eyesShut')} display="none" fill="none" strokeWidth="4">
                <path d="M194 148Q204 156 214 148M222 150Q230 157 238 150" />
              </g>
            </g>
            <g ref={part('wingNear')}>
              <path d="M142 158Q104 144 76 160Q58 176 72 190Q86 202 100 194Q112 204 124 196Q138 196 144 184Z" fill="#A08880" />
              <path d="M94 176q8 -6 16 0M114 178q8 -6 16 0" fill="none" stroke="#8F7870" strokeWidth="3.5" />
            </g>
          </g>
          <g ref={part('stars')} display="none" fill="#FFC83D" stroke={INK} strokeWidth="3">
            {[0, 120, 240].map((r) => (
              <path key={r} transform={`rotate(${r} 190 74) translate(190 40)`} d="M0 -12L4 -4L12 -3L6 3L8 12L0 7L-8 12L-6 3L-12 -3L-4 -4Z" />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
})
