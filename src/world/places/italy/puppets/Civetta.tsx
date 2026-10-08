// Professoressa Civetta, a little owl scientist from Pisa: a layered SVG puppet (reference:
// art/source/world/italy/civetta.png). A chubby round owl (little owls have no ear tufts) with a speckled brown back, a
// cream belly with brown chevrons, huge lemon-yellow eyes behind round pink glasses and a tiny peach beak. Her signature
// move is `swivel`: like a real owl, her head turns all the way round to show the back of her head (little owls have two
// pale "false eye" spots there), then comes back from the other side. `hold` raises both wings out to the sides to hold
// things up (Galileo's drop); `flying` beats the wings and tucks the feet.
import { forwardRef, useId, useRef, useState, type CSSProperties } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { BLUSH, EYE, INK, inkPass, line, useInk } from './ink'

export const CIVETTA_ACTIONS: Record<string, number> = { hop: 0.8, cheer: 1.2, flap: 1.0, swivel: 1.6, think: 1.8, nod: 0.7, wave: 1.4, hoot: 1.2 }

/** Where her wingtips are (viewBox units, 400 x 480) while `hold` is on, for placing held things next to them. */
export const CIVETTA_HOLD = { left: { x: -72, y: 240 }, right: { x: 472, y: 240 } }

type Part =
  | 'root' | 'shadow' | 'body' | 'head' | 'face' | 'back' | 'wingL' | 'wingR' | 'feet'
  | 'openL' | 'openR' | 'happyL' | 'happyR' | 'pupilL' | 'pupilR' | 'lidL' | 'lidR' | 'lidLineL' | 'lidLineR'
  | 'beakOpen' | 'beak' | 'wingF'

const BROWN = '#B88A66'
const BROWN_SHADE = '#A07452'
const SPECK = '#F6E3C8'
const CREAM = '#F6E3C8'
const CREAM_SHADE = '#EBCFA9'
const FACE = '#EFD6B4'
const IRIS = '#FFE04A'
const GLASSES = '#F47FA2'
const BEAK = '#F6A877'
const FEET = '#F6B48A'

// Shapes (viewBox 400 x 480, feet at y 470). The head is a big wide round ball resting on a round body.
const HEAD = 'M200 34 C296 34 352 96 352 176 C352 254 286 300 200 300 C114 300 48 254 48 176 C48 96 104 34 200 34Z'
const BODY = 'M200 196 C308 196 354 288 348 372 C342 440 282 466 200 466 C118 466 58 440 52 372 C46 288 92 196 200 196Z'
const BELLY = 'M200 284 C270 284 298 330 294 382 C290 432 252 454 200 454 C148 454 110 432 106 382 C102 330 130 284 200 284Z'
// The face disc: a soft heart-ish oval around the eyes, lighter than the head.
const FACE_DISC = 'M200 108 C232 92 300 96 322 150 C340 196 312 244 256 252 C232 256 214 248 200 240 C186 248 168 256 144 252 C88 244 60 196 78 150 C100 96 168 92 200 108Z'
// A wing, from the shoulder (0,0) hanging down, with a scalloped feather tip.
const WING = 'M-26 -8 C-6 -22 26 -16 34 8 C44 44 40 96 26 130 C20 142 10 150 0 152 C-6 146 -10 140 -12 132 C-18 138 -24 138 -28 130 C-32 120 -34 110 -34 100 C-40 70 -42 30 -26 -8Z'
const FOOT = 'M-22 0 C-24 -10 -12 -16 0 -16 C12 -16 24 -10 22 0 C26 4 26 10 20 10 C16 14 10 12 8 8 C4 14 -4 14 -8 8 C-10 12 -16 14 -20 10 C-26 10 -26 4 -22 0Z'

/** Cream speckles on the brown head and back (fixed spots so they don't twinkle). */
const HEAD_SPECKS: [number, number, number][] = [
  [150, 60, -20], [180, 52, -8], [210, 50, 6], [240, 56, 18], [268, 68, 28], [122, 76, -32], [292, 86, 36], [160, 80, -14], [196, 74, 0], [230, 78, 14],
  [100, 100, -40], [312, 110, 44], [86, 130, -50], [326, 140, 54], [82, 200, -70], [320, 204, 70], [94, 232, -60], [308, 236, 60], [116, 256, -40], [286, 258, 40],
]
const BACK_SPECKS: [number, number, number][] = [
  [120, 120, 0], [150, 100, 0], [190, 90, 0], [230, 96, 0], [270, 110, 0], [300, 140, 0], [96, 160, 0], [110, 220, 0], [150, 240, 0], [200, 250, 0], [250, 240, 0], [292, 214, 0], [310, 180, 0], [200, 210, 0],
]
const BODY_SPECKS: [number, number][] = [
  [96, 330], [86, 370], [96, 410], [306, 330], [314, 370], [304, 410], [130, 300], [270, 300],
]
const CHEVRONS: [number, number][] = [
  [170, 320], [200, 314], [230, 320], [152, 350], [184, 346], [216, 346], [248, 350], [166, 380], [200, 378], [234, 380], [150, 410], [184, 410], [216, 410], [250, 410], [176, 436], [224, 436],
]

/** Professoressa Civetta the little owl. Actions: hop, cheer, flap, swivel, think, nod, wave, hoot. Voice: civetta. */
export const Civetta = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; onTap?: () => void; hold?: boolean; flying?: boolean }>(function Civetta(
  { height, style, flip, onTap, hold = false, flying = false },
  ref,
) {
  const [m] = useState(() => ({ wingL: spring(150, 10), wingR: spring(150, 10), hold: 0, fly: 0, prevLift: 0, ruffle: 0 }))
  const holdRef = useRef(hold)
  holdRef.current = hold
  const flyRef = useRef(flying)
  flyRef.current = flying
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'civetta',
    actions: CIVETTA_ACTIONS,
    eyes: [200, 168],
    reach: [200, 210],
    frame: (f, p) => {
      const { t, dt, p: q, action: a } = f
      m.hold += ((holdRef.current ? 1 : 0) - m.hold) * Math.min(1, dt * 6)
      m.fly += ((flyRef.current ? 1 : 0) - m.fly) * Math.min(1, dt * 6)
      const HOLD = m.hold
      const FLY = m.fly

      const breathe = Math.sin(t * 2.2)
      let sx = 1 + breathe * 0.01
      let sy = 1 - breathe * 0.006
      let lift = 0
      let lean = 0
      let tilt = Math.sin(t * 0.8) * 3 + f.look.x * 5
      let headY = breathe * 1.5
      let wingL = 8 + breathe * 2
      let wingR = 8 + breathe * 2
      let feetUp = 0
      let happy = false
      let open = 0
      let lookUp = 0
      let front = false
      let turn = 0 // head turn in degrees (0 = facing us, 180 = back of the head)

      // Talking: little head bobs with the voice.
      tilt += Math.sin(t * 10) * f.mouth * 3
      headY -= f.mouth * 3

      // A little feather ruffle now and then: a quick shiver.
      m.ruffle -= dt
      if (m.ruffle < -4 - Math.random() * 4) m.ruffle = 0.35
      if (m.ruffle > 0) sx += Math.sin(m.ruffle * 60) * 0.015

      // Holding things up: both wings out at shoulder height, a proud straight posture.
      if (HOLD > 0.01) {
        wingL = lerp(wingL, 100 + Math.sin(t * 2) * 3, HOLD)
        wingR = lerp(wingR, 100 + Math.sin(t * 2 + 1) * 3, HOLD)
        sy += 0.02 * HOLD
      }
      // Flying: fast wingbeats, feet tucked, the body bobbing with each beat.
      if (FLY > 0.01) {
        const beat = Math.sin(t * 24)
        wingL = lerp(wingL, 70 + beat * 60, FLY)
        wingR = lerp(wingR, 70 + beat * 60, FLY)
        feetUp = FLY
        lift += FLY * (14 + Math.sin(t * 24 - 1) * 7)
        sy += FLY * beat * 0.02
      }

      if (a === 'hop' || a === 'cheer') {
        const cheer = a === 'cheer'
        const k = cheer ? (q < 0.5 ? q / 0.5 : (q - 0.5) / 0.5) : q
        const crouch = bell(span(k, 0, 0.24))
        const air = bell(span(k, 0.24, 0.74))
        const land = wobble(span(k, 0.74, 1), 2)
        sx += crouch * 0.12 - air * 0.07 + land * 0.1
        sy += -crouch * 0.15 + air * 0.11 - land * 0.11
        lift += air * (cheer ? 44 : 60)
        headY += crouch * 10 - air * 4
        const up = cheer ? smooth(span(q, 0, 0.1)) * (1 - smooth(span(q, 0.9, 1))) : air * 0.6
        wingL = lerp(wingL, 140 + Math.sin(t * 26) * 20, up)
        wingR = lerp(wingR, 140 + Math.sin(t * 26 + 0.5) * 20, up)
        feetUp = Math.max(feetUp, air * 0.6)
        if (cheer) ((happy = true), (open = 0.5))
      } else if (a === 'flap') {
        const env = bell(q)
        const beat = Math.sin(q * Math.PI * 10)
        wingL = lerp(wingL, 80 + beat * 60, env)
        wingR = lerp(wingR, 80 + beat * 60, env)
        lift += env * 22
        feetUp = Math.max(feetUp, env * 0.7)
        sy += beat * 0.02 * env
      } else if (a === 'swivel') {
        // Right round to the back, a peek of the back of her head, then back from the other side.
        const go = smooth(span(q, 0.05, 0.42))
        const back = smooth(span(q, 0.58, 0.95))
        turn = q < 0.5 ? 200 * go : -200 * (1 - back)
        sy += bell(span(q, 0.4, 0.62)) * 0.02
      } else if (a === 'think') {
        const env = smooth(span(q, 0, 0.18)) * (1 - smooth(span(q, 0.84, 1)))
        wingR = lerp(wingR, -100, env)
        front = env > 0.25
        tilt += 12 * env
        lookUp = env
        headY += 2 * env
      } else if (a === 'nod') {
        const n = Math.abs(Math.sin(q * Math.PI * 2)) * bell(q)
        headY += n * 16
        sy -= n * 0.03
      } else if (a === 'wave') {
        const up = smooth(span(q, 0, 0.16)) * (1 - smooth(span(q, 0.84, 1)))
        wingR = lerp(wingR, 150 + Math.sin(q * Math.PI * 8) * 22, up)
        tilt -= 6 * up
        happy = up > 0.5
        open = up * 0.25
      } else if (a === 'hoot') {
        // "Hoo hoo!": the body puffs up, the beak opens round, the head bobs twice.
        const env = bell(q)
        const bob = Math.abs(Math.sin(q * Math.PI * 2))
        sx += env * 0.07
        sy += env * 0.03
        headY += bob * 10 * env
        open = Math.max(open, bob * 0.9 * env)
        wingL += env * 14
        wingR += env * 14
      }

      const dtc = Math.max(dt, 1 / 120)
      const v = (lift - m.prevLift) / dtc
      m.prevLift = lift
      // The wings lag a little behind the body (follow-through) unless they're flapping on purpose.
      const drive = Math.max(-20, Math.min(20, v * 0.05))
      const wL = m.wingL.step(wingL + drive, dt)
      const wR = m.wingR.step(wingR + drive, dt)

      setT(p.root, `translate(0 ${-lift}) translate(200 468) rotate(${lean}) scale(${sx} ${sy}) translate(-200 -468)`)
      setT(p.shadow, `translate(200 470) scale(${1 - Math.min(0.55, lift / 180)})`)
      setT(p.head, `translate(0 ${headY}) rotate(${tilt} 200 290)`)
      setT(p.wingL, `translate(74 266) rotate(${wL})`)
      setT(p.wingR, `translate(326 266) scale(-1 1) rotate(${wR})`)
      // While thinking, the right wing comes up in front of her face (a front copy of it, drawn over the head).
      setT(p.wingF, `translate(326 266) scale(-1 1) rotate(${wR})`)
      show(p.wingF, front)
      show(p.wingR, !front)
      setT(p.feet, `translate(0 ${-feetUp * 16}) translate(200 462) scale(1 ${1 - feetUp * 0.45}) translate(-200 -462)`)

      // The head turn: the face slides round and squashes, then the back of the head (with its false-eye spots) shows.
      const th = (turn * Math.PI) / 180
      const faceOn = Math.cos(th) > 0
      show(p.face, faceOn)
      show(p.back, !faceOn)
      if (faceOn) setT(p.face, `translate(${Math.sin(th) * 120} 0) translate(200 176) scale(${Math.max(0.02, Math.cos(th))} 1) translate(-200 -176)`)
      else setT(p.back, `translate(${Math.sin(th + Math.PI) * 120} 0) translate(200 176) scale(${Math.max(0.02, -Math.cos(th))} 1) translate(-200 -176)`)

      // Eyes: owl blinks close from the top; happy arcs when cheering.
      const c = Math.max(0, Math.min(1, 1 - f.blink))
      const lidY = -42 + 84 * c
      const ly = Math.min(lidY, 30)
      const w = 40 * Math.sqrt(Math.max(0, 1 - (ly / 40) ** 2))
      for (const [openG, arc, pupil, lidP, lineP] of [
        [p.openL, p.happyL, p.pupilL, p.lidL, p.lidLineL],
        [p.openR, p.happyR, p.pupilR, p.lidR, p.lidLineR],
      ] as const) {
        show(openG, !happy)
        show(arc, happy)
        setT(pupil, `translate(${f.look.x * 9} ${f.look.y * 6 - lookUp * 9})`)
        setA(lidP, 'd', c > 0.02 ? `M-44 -44 L44 -44 L44 ${lidY} Q0 ${lidY + 8} -44 ${lidY} Z` : '')
        setA(lineP, 'd', c > 0.05 ? `M${-w - 2} ${ly + 2} Q0 ${ly + 8} ${w + 2} ${ly + 2}` : '')
      }

      // Beak: her voice (or a hoot) opens it into a little round "oo".
      const mo = Math.min(1, Math.max(open, f.mouth * 1.1))
      show(p.beakOpen, mo > 0.05)
      setT(p.beakOpen, `translate(200 214) scale(${0.6 + mo * 0.5} ${0.3 + mo * 0.9}) translate(-200 -214)`)
      setT(p.beak, `translate(0 ${-mo * 4})`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const wing = (s: 'L' | 'R' | 'F', pass: boolean) => (
    <g ref={r(s === 'L' ? 'wingL' : s === 'R' ? 'wingR' : 'wingF', pass)} style={s === 'F' ? { display: 'none' } : undefined}>
      <path fill={BROWN} d={WING} />
      {!pass && (
        <>
          <path fill={BROWN_SHADE} d="M-30 96 C-24 120 -10 140 0 152 C10 150 20 142 26 130 C30 118 32 104 32 96 C16 106 -14 106 -30 96Z" />
          {[[-12, 16], [10, 22], [-18, 46], [6, 52], [22, 64], [-16, 78], [8, 84]].map(([x, y], i) => (
            <ellipse key={i} fill={SPECK} cx={x} cy={y} rx="6" ry="8" transform={`rotate(-10 ${x} ${y})`} />
          ))}
          <path {...line(3)} d="M-12 132 C-8 120 -6 108 -6 98 M10 140 C14 126 16 112 16 100" />
        </>
      )}
    </g>
  )
  const feet = (pass: boolean) => (
    <g ref={r('feet', pass)}>
      <path fill={FEET} d={FOOT} transform="translate(158 462) scale(1.2)" />
      <path fill={FEET} d={FOOT} transform="translate(242 462) scale(1.2)" />
    </g>
  )
  const body = (pass: boolean) => (
    <>
      <path fill={BROWN} d={BODY} />
      {!pass && (
        <>
          <path fill={BROWN_SHADE} opacity="0.6" d="M80 410 C100 446 150 462 200 462 C250 462 300 446 320 410 C290 440 250 452 200 452 C150 452 110 440 80 410Z" />
          {BODY_SPECKS.map(([x, y], i) => (
            <ellipse key={i} fill={SPECK} cx={x} cy={y} rx="7" ry="9" />
          ))}
          <path fill={CREAM} d={BELLY} />
          <path fill={CREAM_SHADE} opacity="0.7" d="M128 420 C150 446 250 446 272 420 C250 440 150 440 128 420Z" />
          {CHEVRONS.map(([x, y], i) => (
            <path key={i} {...line(4.5, BROWN_SHADE)} d={`M${x - 9} ${y - 5} L${x} ${y + 4} L${x + 9} ${y - 5}`} />
          ))}
        </>
      )}
    </>
  )
  const eye = (s: 'L' | 'R') => (
    <g key={s} transform={`translate(${s === 'L' ? 142 : 258} 170)`}>
      <clipPath id={`${uid}eye${s}`}>
        <circle r="40" />
      </clipPath>
      <g ref={part(s === 'L' ? 'openL' : 'openR')}>
        <circle r="40" fill={IRIS} stroke={EYE} strokeWidth="5" />
        <g clipPath={`url(#${uid}eye${s})`}>
          <g ref={part(s === 'L' ? 'pupilL' : 'pupilR')}>
            <circle r="24" fill={EYE} />
            <circle cx="-8" cy="-9" r="8" fill="#fff" />
            <circle cx="9" cy="9" r="3.5" fill="#fff" />
          </g>
          <path ref={part(s === 'L' ? 'lidL' : 'lidR')} fill={BROWN} d="" />
        </g>
        <circle r="40" fill="none" stroke={EYE} strokeWidth="5" />
        <path ref={part(s === 'L' ? 'lidLineL' : 'lidLineR')} {...line(5, EYE)} d="" />
      </g>
      <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(7, EYE)} d="M-26 8 Q0 -22 26 8" style={{ display: 'none' }} />
    </g>
  )
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <path fill={BROWN} d={HEAD} />
      {!pass && (
        <>
          <path fill={BROWN_SHADE} opacity="0.5" d="M58 214 C82 270 140 298 200 298 C260 298 318 270 342 214 C320 256 262 286 200 286 C138 286 80 256 58 214Z" />
          <clipPath id={`${uid}head`}>
            <path d={HEAD} />
          </clipPath>
          {/* The ruff of feathers under her chin, where the head meets the body. */}
          <path {...line(3.5, BROWN_SHADE)} d="M96 262 Q112 276 128 268 Q144 284 162 276 Q180 290 200 282 Q220 290 238 276 Q256 284 272 268 Q288 276 304 262" />
          <g clipPath={`url(#${uid}head)`}>
          {/* The back of her head: speckles and the two pale "false eye" spots real little owls have. */}
          <g ref={part('back')} style={{ display: 'none' }}>
            <path fill={BROWN} d="M60 176 C60 100 120 46 200 46 C280 46 340 100 340 176 C340 250 280 290 200 290 C120 290 60 250 60 176Z" />
            {BACK_SPECKS.map(([x, y], i) => (
              <ellipse key={i} fill={SPECK} cx={x} cy={y} rx="7" ry="9" />
            ))}
            <path fill={CREAM} d="M138 176 C150 160 178 162 182 182 C176 196 150 198 138 176Z M262 176 C250 160 222 162 218 182 C224 196 250 198 262 176Z" />
            <path {...line(3.5, BROWN_SHADE)} d="M200 120 L200 232" />
          </g>
          {/* The face: disc, eyes, glasses, beak, blush. It slides and squashes when her head turns. */}
          <g ref={part('face')}>
            {HEAD_SPECKS.map(([x, y, rot], i) => (
              <ellipse key={i} fill={SPECK} cx={x} cy={y} rx="6" ry="9" transform={`rotate(${rot} ${x} ${y})`} />
            ))}
            <path fill={FACE} d={FACE_DISC} />
            <path {...line(3.2, BROWN_SHADE)} d="M200 112 C196 140 196 160 200 180 M120 118 C108 132 100 150 98 168 M280 118 C292 132 300 150 302 168" opacity="0.6" />
            <ellipse fill={BLUSH} cx="112" cy="226" rx="22" ry="13" />
            <ellipse fill={BLUSH} cx="288" cy="226" rx="22" ry="13" />
            {eye('L')}
            {eye('R')}
            {/* Round pink glasses: an ink ring with a pink ring on top, a bridge and little side arms. */}
            <g fill="none" strokeLinecap="round">
              <circle cx="142" cy="170" r="54" stroke={INK} strokeWidth="15" />
              <circle cx="258" cy="170" r="54" stroke={INK} strokeWidth="15" />
              <path d="M188 160 Q200 150 212 160 M88 166 L66 162 M312 166 L334 162" stroke={INK} strokeWidth="15" />
              <circle cx="142" cy="170" r="54" stroke={GLASSES} strokeWidth="7" />
              <circle cx="258" cy="170" r="54" stroke={GLASSES} strokeWidth="7" />
              <path d="M188 160 Q200 150 212 160 M88 166 L66 162 M312 166 L334 162" stroke={GLASSES} strokeWidth="7" />
            </g>
            <g ref={part('beakOpen')} style={{ display: 'none' }}>
              <ellipse cx="200" cy="222" rx="16" ry="16" fill="#8E3432" stroke={EYE} strokeWidth="4" />
              <ellipse cx="200" cy="228" rx="8" ry="6" fill="#F28C8C" />
            </g>
            <path ref={part('beak')} fill={BEAK} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" d="M184 196 Q200 186 216 196 Q212 214 200 230 Q188 214 184 196Z" />
          </g>
          </g>
        </>
      )}
    </g>
  )
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Civetta' : undefined} style={{ height, overflow: 'visible', display: 'block', cursor: onTap ? 'pointer' : undefined, transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="130" ry="12" fill={INK} opacity="0.16" />
      <g ref={part('root')}>
        <g {...inkPass()}>{feet(true)}</g>
        {feet(false)}
        {/* One outline around head and body together, so she reads as one chubby round owl. */}
        <g {...inkPass()}>{body(true)}</g>
        <g {...inkPass()}>{headG(true)}</g>
        <g ref={part('body')}>{body(false)}</g>
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{wing(s, true)}</g>
            {wing(s, false)}
          </g>
        ))}
        {headG(false)}
        <g {...inkPass()}>{wing('F', true)}</g>
        {wing('F', false)}
      </g>
    </svg>
  )
})
