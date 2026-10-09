// Gino the gondolier pigeon, Venice's pinkest water taxi driver: a layered SVG puppet (reference:
// art/source/world/italy/gino.png). A chubby gray-lavender pigeon with a green and purple shimmer on his neck, a navy
// and cream striped shirt, a straw boater hat with a red ribbon, and orange feet. In the boat he holds a long oar in
// both wings (`oar`).
// GATE 2 (static): the drawing and its moving parts (wings, oar, hat on its own group so it can pop off, beak that
// opens to sing, dizzy spiral eyes), shown in poses for Dad's approval. Only blinking and looking move for now;
// the actions (row, sing, hat pop, dizzy spin...) come after he approves the look.
import { forwardRef, useId, type CSSProperties } from 'react'
import { setT, show, usePuppet, type PuppetHandle } from '../../../../sdk'
import { BLUSH, EYE, INK, inkPass, line, useInk } from './ink'

export const GINO_ACTIONS: Record<string, number> = {}

type Part = 'root' | 'shadow' | 'head' | 'hat' | 'wingL' | 'wingR' | 'oar' | 'eyesOpen' | 'eyesDizzy' | 'pupilL' | 'pupilR' | 'beakOpen' | 'beak' | 'tail'

const BODY_C = '#ABA8C8'
const BODY_SHADE = '#9793B8'
const WING_C = '#A3A0C2'
const GREEN = '#7FB29E'
const PURPLE = '#A784BE'
const NAVY = '#33476E'
const STRIPE = '#FFF4E4'
const BEAK_C = '#8D8AA0'
const CERE = '#E9E4EE'
const STRAW = '#F4C57F'
const STRAW_SHADE = '#E2AA62'
const RIBBON = '#E2483B'
const FEET_C = '#F28A5A'
const WOOD = '#B9814F'
const WOOD_SHADE = '#9C6A3F'

// Shapes (viewBox 400 x 480, feet at y 470). A round head sitting on a big pear-shaped body, like the reference.
const HEAD = 'M200 66 C258 66 292 108 292 160 C292 212 254 246 200 246 C146 246 108 212 108 160 C108 108 142 66 200 66Z'
const BODY = 'M200 210 C282 210 330 280 330 354 C330 424 278 454 200 454 C122 454 70 424 70 354 C70 280 118 210 200 210Z'
// The striped shirt: the middle band of the body (clipped to the body shape).
const SHIRT = 'M40 300 L360 300 L360 404 C320 414 260 418 200 418 C140 418 80 414 40 404Z'
const TAIL = 'M300 380 C330 370 372 372 392 392 C398 404 388 412 376 410 C390 420 386 434 370 432 C380 444 372 456 354 450 C330 446 306 430 296 414Z'
// A wing hangs from the shoulder (0,0), scalloped feather tips at the bottom.
const WING = 'M-24 -14 C2 -26 30 -14 34 14 C40 52 36 92 22 120 C18 128 10 132 4 128 C2 136 -6 140 -12 134 C-16 140 -26 140 -28 130 C-36 126 -38 116 -36 106 C-42 70 -44 20 -24 -14Z'
const FOOT = 'M-6 -22 L6 -22 L6 -6 C16 -4 30 0 34 6 C30 10 22 8 14 6 C16 12 14 16 8 14 L4 8 C0 14 -4 16 -8 12 L-6 6 C-14 8 -22 10 -30 6 C-28 0 -16 -4 -6 -6Z'

export interface GinoProps {
  height?: string
  style?: CSSProperties
  flip?: boolean
  onTap?: () => void
  /** Holding the long gondola oar in both wings (his pose in the boat). */
  oar?: boolean
  /** His hat has popped off (after a bridge bonk). */
  hatOff?: boolean
  /** Spiral eyes, after driving in circles. */
  dizzy?: boolean
  /** Beak open (singing). */
  singing?: boolean
}

/** Gino the gondolier pigeon. Voice: gino. */
export const Gino = forwardRef<PuppetHandle, GinoProps>(function Gino({ height, style, flip, onTap, oar = false, hatOff = false, dizzy = false, singing = false }, ref) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'gino',
    actions: GINO_ACTIONS,
    eyes: [200, 150],
    reach: [200, 190],
    frame: (f, p) => {
      // Holding the oar: both wings reach forward and up to grip it; otherwise they hang at his sides.
      setT(p.wingL, oar ? 'translate(104 292) rotate(-66) scale(1.08 1.12)' : 'translate(96 290) rotate(12) scale(0.86)')
      setT(p.wingR, oar ? 'translate(296 292) scale(-1 1) rotate(178) scale(0.86)' : 'translate(304 290) scale(-1 1) rotate(12) scale(0.86)')
      show(p.oar, oar)
      show(p.hat, !hatOff)
      show(p.eyesOpen, !dizzy)
      show(p.eyesDizzy, dizzy)
      setT(p.eyesOpen, `translate(0 150) scale(1 ${f.blink}) translate(0 -150)`)
      setT(p.pupilL, `translate(${f.look.x * 7} ${f.look.y * 6})`)
      setT(p.pupilR, `translate(${f.look.x * 7} ${f.look.y * 6})`)
      const mo = Math.max(singing ? 0.8 : 0, f.mouth)
      show(p.beakOpen, mo > 0.05)
      setT(p.beakOpen, `translate(200 206) scale(1 ${0.3 + mo * 0.9}) translate(-200 -206)`)
      ink.sync(p)
    },
  })
  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const wing = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'wingL' : 'wingR', pass)}>
      <path fill={WING_C} d={WING} />
      {!pass && (
        <>
          <path fill={BODY_SHADE} d="M-36 100 C-34 118 -24 132 -12 134 C-6 140 2 136 4 128 C10 132 18 128 22 120 C26 112 30 100 32 90 C14 104 -16 106 -36 100Z" />
          <path {...line(3)} d="M-14 128 C-12 114 -10 104 -10 94 M6 124 C10 112 12 100 12 90" />
        </>
      )}
    </g>
  )
  const oarG = (pass: boolean) => (
    <g ref={r('oar', pass)} style={{ display: 'none' }}>
      {/* A long pole from above his shoulder down past his feet into the water, the blade at the bottom. */}
      {/* It runs beside his head (never across his face) and down across his chest. */}
      <g transform="translate(342 112) rotate(23)">
        <rect x="-8" y="0" width="16" height="540" rx="8" fill={WOOD} />
        {!pass && <rect x="0" y="0" width="8" height="540" rx="4" fill={WOOD_SHADE} opacity="0.5" />}
        <path fill={WOOD} d="M-14 520 C-14 510 14 510 14 520 L22 640 C22 660 -22 660 -22 640Z" />
      </g>
    </g>
  )
  const body = (pass: boolean) => (
    <>
      <path ref={r('tail', pass)} fill={WING_C} d={TAIL} />
      <path fill={BODY_C} d={BODY} />
      {!pass && (
        <>
          <clipPath id={`${uid}body`}>
            <path d={BODY} />
          </clipPath>
          <g clipPath={`url(#${uid}body)`}>
            {/* Neck shimmer: a purple band with green scallops, then the striped shirt. */}
            <path fill={PURPLE} d="M40 200 L360 200 L360 310 L40 310Z" />
            <path fill={GREEN} d="M40 200 L360 200 L360 262 Q344 280 328 264 Q312 282 294 266 Q278 284 260 268 Q244 286 226 270 Q210 288 192 270 Q176 286 158 268 Q142 284 124 266 Q108 282 90 264 Q74 280 58 262 L40 262Z" />
            <path fill={STRIPE} d={SHIRT} />
            {[314, 350, 386].map((y) => (
              <rect key={y} x="40" y={y} width="320" height="20" fill={NAVY} />
            ))}
            <path {...line(4)} d="M44 300 C120 312 280 312 356 300" />
            <path {...line(4)} d="M60 404 C130 416 270 416 340 404" />
            <path fill={BODY_SHADE} opacity="0.55" d="M70 410 C100 440 150 452 200 452 C250 452 300 440 330 410 C300 432 250 442 200 442 C150 442 100 432 70 410Z" />
          </g>
        </>
      )}
    </>
  )
  const feet = () => (
    <g>
      <path fill={FEET_C} d={FOOT} transform="translate(160 466) scale(1.2)" />
      <path fill={FEET_C} d={FOOT} transform="translate(240 466) scale(-1.2 1.2)" />
    </g>
  )
  const eye = (x: number, pupil: Part) => (
    <g transform={`translate(${x} 148)`}>
      <ellipse rx="24" ry="28" fill="#fff" stroke={EYE} strokeWidth="4.5" />
      <g ref={part(pupil)}>
        <circle cx="2" cy="4" r="18" fill="#5A3020" />
        <circle cx="2" cy="4" r="10" fill={EYE} />
        <circle cx="-6" cy="-6" r="7" fill="#fff" />
        <circle cx="9" cy="12" r="3" fill="#fff" />
      </g>
    </g>
  )
  const spiral = (x: number) => <path {...line(5, EYE)} transform={`translate(${x} 150)`} d="M0 0 C4 -6 12 -2 10 6 C8 16 -6 16 -12 6 C-18 -6 -6 -20 8 -18 C22 -16 28 0 22 14" />
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <path fill={BODY_C} d={HEAD} />
      {!pass && (
        <>
          <ellipse fill={BLUSH} cx="136" cy="192" rx="18" ry="11" />
          <ellipse fill={BLUSH} cx="264" cy="192" rx="20" ry="12" />
          <path {...line(3.5)} d="M148 108 Q160 100 172 106 M228 106 Q240 100 252 108" />
          <g ref={part('eyesOpen')}>
            {eye(164, 'pupilL')}
            {eye(236, 'pupilR')}
          </g>
          <g ref={part('eyesDizzy')} style={{ display: 'none' }}>
            <ellipse cx="164" cy="148" rx="24" ry="28" fill="#fff" stroke={EYE} strokeWidth="4.5" />
            <ellipse cx="236" cy="148" rx="24" ry="28" fill="#fff" stroke={EYE} strokeWidth="4.5" />
            {spiral(164)}
            {spiral(236)}
          </g>
          {/* Beak: a pale cere bump on top, a gray hooked beak, and an open mouth for singing. */}
          <g ref={part('beakOpen')} style={{ display: 'none' }}>
            <ellipse cx="200" cy="212" rx="18" ry="14" fill="#8E3432" stroke={EYE} strokeWidth="4" />
            <ellipse cx="200" cy="218" rx="9" ry="5" fill="#F28C8C" />
          </g>
          <g ref={part('beak')}>
            <path fill={BEAK_C} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" d="M170 196 C176 180 224 180 232 194 C236 204 226 214 212 214 C204 214 198 210 194 206 C186 210 172 208 170 196Z" />
            <path fill={CERE} stroke={INK} strokeWidth="4" d="M186 186 C188 176 212 176 214 186 C206 190 194 190 186 186Z" />
            <path {...line(3)} d="M194 206 C204 202 216 202 226 200" />
          </g>
        </>
      )}
    </g>
  )
  const hatG = (pass: boolean) => (
    <g ref={r('hat', pass)} transform="translate(30 36) scale(0.86) rotate(-8 214 76)">
      {/* Ribbon tails flutter out behind (to his left, our right). */}
      <path fill={RIBBON} d="M282 84 C304 96 318 118 324 142 L308 136 L304 152 C296 130 286 112 270 98Z" />
      <path fill={RIBBON} d="M276 90 C288 112 292 136 288 160 L276 150 L266 162 C270 138 270 118 262 100Z" />
      <path fill={STRAW} d="M100 84 C100 72 330 72 330 84 C330 98 100 98 100 84Z" />
      <path fill={STRAW} d="M146 82 L150 34 C150 22 280 22 282 34 L286 82Z" />
      {!pass && (
        <>
          <path fill={STRAW_SHADE} d="M106 88 C140 96 290 96 324 88 C320 94 300 96 215 96 C130 96 110 94 106 88Z" />
          <path fill={RIBBON} d="M148 58 L284 58 L286 80 L146 80Z" />
          <path fill={RIBBON} stroke={INK} strokeWidth="4" strokeLinejoin="round" d="M270 60 C286 50 300 56 296 70 C300 82 286 88 270 78Z" />
          <path {...line(2.5, STRAW_SHADE)} d="M160 40 L270 40 M156 50 L276 50" />
        </>
      )}
    </g>
  )
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Gino' : undefined} style={{ height, overflow: 'visible', display: 'block', cursor: onTap ? 'pointer' : undefined, transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} cx="200" cy="470" rx="120" ry="11" fill={INK} opacity="0.16" />
      <g ref={part('root')}>
        <g {...inkPass()}>{feet()}</g>
        {feet()}
        {/* One outline around head and body together, so he reads as one chubby pigeon. */}
        <g {...inkPass()}>
          {body(true)}
          {headG(true)}
        </g>
        {body(false)}
        {headG(false)}
        <g {...inkPass()}>{hatG(true)}</g>
        {hatG(false)}
        {/* The oar crosses in front of him; his wings grip it on top. */}
        <g {...inkPass()}>{oarG(true)}</g>
        {oarG(false)}
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{wing(s, true)}</g>
            {wing(s, false)}
          </g>
        ))}
      </g>
    </svg>
  )
})
