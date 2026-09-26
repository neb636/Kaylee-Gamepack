// Pip the joey: a layered SVG puppet. Parts move every frame (see roo.ts for the body mechanics).
import { forwardRef, useState, type CSSProperties } from 'react'
import { setA, setT, show, usePuppet, type PuppetHandle } from '../../../../sdk'
import { art } from '../art'
import { inkPass, line, useInk } from './ink'
import { ROO_ACTIONS, rooMotion } from './roo'

export interface PipProps {
  height?: string
  style?: CSSProperties
  /** Things she is wearing (drawn on her, moving with her). */
  wearing?: { hat?: boolean; glasses?: boolean; water?: boolean }
  flip?: boolean
  onTap?: () => void
  /** Draw inside another puppet's SVG (e.g. Mama's pouch) at this spot and scale instead of as its own <svg>. */
  embed?: { x: number; y: number; scale: number }
}

type Part = 'root' | 'head' | 'earL' | 'earR' | 'tail' | 'armL' | 'foreL' | 'armR' | 'foreR' | 'footL' | 'footR' | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'pupilL' | 'pupilR' | 'browL' | 'browR' | 'mouth' | 'tongue' | 'smile' | 'shadow'

const FUR = '#F2B07A'
const FUR_DARK = '#E39A62'
const CREAM = '#FFF1DE'
const INNER = '#F9A8B4'

/** Pip the joey. Actions: hop, cheer, wave, dance, wiggle, shake (no-no), fan (too hot), hug. Voice: pip. */
export const Pip = forwardRef<PuppetHandle, PipProps>(function Pip({ height, style, wearing = {}, flip, onTap, embed }, ref) {
  const [motion] = useState(() => rooMotion(150))
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'pip',
    actions: ROO_ACTIONS,
    eyes: [200, 160],
    frame: (f, p) => {
      const r = motion(f)
      setT(p.root, `translate(0 ${-r.lift}) translate(200 470) rotate(${r.lean}) scale(${r.sx} ${r.sy}) translate(-200 -470)`)
      setT(p.shadow, `translate(200 472) scale(${1 - Math.min(0.5, r.lift / 300)})`)
      setT(p.head, `translate(0 ${r.crouch * 12 + r.headY}) rotate(${r.head} 200 238)`)
      setT(p.earL, `translate(162 112) rotate(${-18 - r.ears * 0.9})`)
      setT(p.earR, `translate(238 112) rotate(${18 + r.ears})`)
      setT(p.tail, `translate(150 392) rotate(${r.tail})`)
      setT(p.armL, `translate(163 282) rotate(${r.armL[0] + 6})`)
      setT(p.foreL, `translate(0 36) rotate(${r.armL[1] - 16})`)
      setT(p.armR, `translate(237 282) scale(-1 1) rotate(${r.armR[0] + 6})`)
      setT(p.foreR, `translate(0 36) rotate(${r.armR[1] - 16})`)
      setT(p.footL, `translate(150 458) rotate(${r.feet} 44 0)`)
      setT(p.footR, `translate(250 458) rotate(${r.feet} 44 0)`)

      // Eyes: blink, happy arcs, pupils look toward her finger.
      const happy = r.happy
      for (const [eye, open, arc, pupil, x] of [
        [p.eyeL, p.openL, p.happyL, p.pupilL, 168],
        [p.eyeR, p.openR, p.happyR, p.pupilR, 232],
      ] as const) {
        setT(eye, `translate(${x} 160) scale(1 ${happy ? 1 : f.blink})`)
        show(open, !happy)
        show(arc, happy)
        setT(pupil, `translate(${f.look.x * 3.5} ${f.look.y * 3.5})`)
      }
      setT(p.browL, `translate(0 ${-r.brow * 7}) rotate(${r.brow < 0 ? -r.brow * 14 : 0} 168 132)`)
      setT(p.browR, `translate(0 ${-r.brow * 7}) rotate(${r.brow < 0 ? r.brow * 14 : 0} 232 132)`)

      // Mouth: the voice opens it; expressions add to it.
      const m = Math.min(1, Math.max(r.open, f.mouth * 1.1))
      if (m > 0.05) {
        const w = 17 + m * 3
        setA(p.mouth, 'd', `M${200 - w} 206 Q200 ${203 - m * 3} ${200 + w} 206 Q${200 + w * 0.8} ${206 + 26 * m} 200 ${208 + 26 * m} Q${200 - w * 0.8} ${206 + 26 * m} ${200 - w} 206Z`)
        setA(p.tongue, 'd', r.tongue ? `M190 ${210 + 18 * m} Q200 ${204 + 10 * m} 210 ${210 + 18 * m} Q212 ${234 + 20 * m} 200 ${236 + 20 * m} Q188 ${234 + 20 * m} 190 ${210 + 18 * m}Z` : m > 0.3 ? `M188 ${204 + 24 * m} Q200 ${196 + 14 * m} 212 ${204 + 24 * m} Q206 ${207 + 26 * m} 200 ${207 + 26 * m} Q194 ${207 + 26 * m} 188 ${204 + 24 * m}Z` : '')
      } else {
        setA(p.mouth, 'd', '')
        setA(p.tongue, 'd', '')
      }
      show(p.smile, m <= 0.05)
      ink.sync(p)
    },
  })

  // Each group is drawn twice: an ink copy (one outline around the whole group), then the fills and details on top.
  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))
  const lower = (pass: boolean) => (
    <>
      <g ref={r('tail', pass)}>
        <path fill={FUR} d="M18 -34 C-30 -30 -86 -14 -118 -54 C-132 -72 -122 -96 -104 -88 C-98 -66 -66 -46 -20 -40 C-2 -38 14 -10 20 16 Z" />
        {!pass && <path fill={CREAM} d="M-6 -14 C-48 -16 -88 -26 -110 -60 C-92 -38 -56 -30 -8 -26 Z" />}
      </g>
      <g ref={r('footL', pass)}>
        <path fill={FUR} d="M-52 6 C-56 -14 -26 -24 6 -22 C38 -20 62 -8 60 6 C58 18 -48 20 -52 6 Z" />
        {!pass && <path {...line()} d="M40 -2 L43 8 M26 -4 L27 9" />}
      </g>
      <g ref={r('footR', pass)}>
        <path fill={FUR} d="M-52 6 C-54 -12 -26 -24 6 -22 C38 -22 64 -10 60 6 C56 18 -48 18 -52 6 Z" />
        {!pass && <path {...line()} d="M40 -2 L43 8 M26 -4 L27 9" />}
      </g>
      {/* A pear-shaped body; the thighs sit over the belly with just a crease on their inner edge. */}
      <path fill={FUR} d="M200 228 C240 228 258 270 266 320 C272 360 284 396 280 424 C274 450 236 454 200 454 C164 454 126 450 120 424 C116 396 128 360 134 320 C142 270 160 228 200 228Z" />
      {!pass && <path fill={CREAM} d="M200 252 C226 252 238 300 242 346 C246 392 234 438 200 442 C166 438 154 392 158 346 C162 300 174 252 200 252Z" />}
      <path fill={FUR} d="M150 342 C112 342 98 386 102 416 C106 444 138 454 168 446 C180 426 178 368 150 342Z" />
      <path fill={FUR} d="M250 342 C288 342 302 386 298 416 C294 444 262 454 232 446 C220 426 222 368 250 342Z" />
      {!pass && <path {...line()} d="M154 346 C174 368 180 420 168 446 M246 346 C226 368 220 420 232 446 M106 428 C118 448 144 452 166 447 M294 428 C282 448 256 452 234 447" />}
    </>
  )
  // Arms: upper arm → forearm → paw, outlined as one limb.
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      <path fill={FUR} d="M-15 -4 C-15 -16 15 -16 15 -4 L13 38 C13 46 -13 46 -13 38 Z" />
      <g ref={r(s === 'L' ? 'foreL' : 'foreR', pass)}>
        <path fill={FUR} d="M-12 0 C-12 -10 12 -10 12 0 L13 22 C22 26 20 46 0 46 C-20 46 -22 26 -13 22 Z" />
        {!pass && <path {...line(2.4)} d="M-5 38 L-5 44 M5 38 L5 44" />}
      </g>
      {/* Fur over the top of the arm's outline, so the arm grows out of the shoulder instead of ending in a cap. */}
      {!pass && <ellipse fill={FUR} cx="0" cy="-8" rx="13" ry="13" />}
    </g>
  )
  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <g ref={r('earL', pass)}>
        <path fill={FUR} d="M-24 8 C-40 -40 -30 -104 -2 -122 C24 -106 36 -44 22 8 Z" />
        {!pass && <path fill={INNER} d="M-12 -6 C-24 -44 -16 -90 -2 -104 C12 -90 20 -44 10 -6 Z" />}
      </g>
      <g ref={r('earR', pass)}>
        <path fill={FUR} d="M-22 8 C-36 -44 -24 -106 2 -122 C30 -104 40 -40 24 8 Z" />
        {!pass && <path fill={INNER} d="M-10 -6 C-20 -44 -12 -90 2 -104 C16 -90 24 -44 12 -6 Z" />}
      </g>
      <path fill={FUR} d="M200 92 C256 92 288 126 290 168 C292 210 262 242 200 242 C138 242 108 210 110 168 C112 126 144 92 200 92Z" />
      <path fill={FUR} d="M180 100 C176 82 190 76 196 90 C200 72 218 78 216 100 Z" />
      {!pass && (
        <>
          <path fill={FUR_DARK} opacity="0.35" d="M120 186 C124 214 150 234 184 238 C150 238 118 218 114 184Z" />
          <ellipse fill="#FF9DB0" opacity="0.8" cx="146" cy="200" rx="17" ry="10" />
          <ellipse fill="#FF9DB0" opacity="0.8" cx="254" cy="200" rx="17" ry="10" />
          <ellipse fill={CREAM} cx="200" cy="200" rx="46" ry="33" />
          {/* Eyes */}
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
              <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                <ellipse fill="#2E1C1A" rx="12.5" ry="15.5" />
                <g ref={part(s === 'L' ? 'pupilL' : 'pupilR')}>
                  <circle fill="#fff" cx="-3.5" cy="-6" r="5" />
                  <circle fill="#fff" cx="4.5" cy="4.5" r="2.2" />
                </g>
                <path {...line(2.6)} d={s === 'L' ? 'M-10 -11 L-17 -16 M-12 -5 L-19 -7' : 'M10 -11 L17 -16 M12 -5 L19 -7'} />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(4.5)} d="M-13 4 Q0 -12 13 4" />
            </g>
          ))}
          <path ref={part('browL')} {...line(3)} d="M156 134 Q166 128 178 132" />
          <path ref={part('browR')} {...line(3)} d="M222 132 Q234 128 244 134" />
          {/* Mouth, nose */}
          <path ref={part('mouth')} {...line(3)} fill="#B8323F" d="" />
          <path ref={part('tongue')} fill="#FF7F98" d="" />
          <path ref={part('smile')} {...line(3.2)} d="M182 205 Q191 214 200 205 Q209 214 218 205" />
          <path fill="#2E1C1A" d="M186 188 C186 178 214 178 214 188 C214 197 205 202 200 202 C195 202 186 197 186 188Z" />
          <ellipse fill="#fff" opacity="0.55" cx="194" cy="185" rx="4" ry="2.6" />
          {/* Bow */}
          <g transform="translate(150 112) rotate(-12)">
            <path {...line(2.8)} fill="#FF5C9A" d="M0 0 L-32 -20 C-42 -4 -38 14 -28 22 Z M0 0 L30 -24 C42 -8 38 12 28 20 Z" />
            <circle {...line(2.8)} fill="#FF5C9A" r="10" />
          </g>
          {wearing.glasses && (
            <g>
              <path d="M186 158 Q200 150 214 158" stroke="#FF4F9A" strokeWidth={6} fill="none" strokeLinecap="round" />
              {[168, 232].map((x) => (
                <g key={x}>
                  <rect x={x - 25} y={140} width={50} height={40} rx={18} fill="#4B3A6B" opacity={0.55} stroke="#FF4F9A" strokeWidth={6} />
                  <path d={`M${x - 14} 150 L${x - 4} 150`} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
                </g>
              ))}
            </g>
          )}
          {wearing.hat && <image href={art.sunHat} x="104" y="30" width="200" height="118" />}
        </>
      )}
    </g>
  )

  const body = (
    <>
      <ellipse ref={part('shadow')} rx="92" ry="11" fill="#6B3A2A" opacity="0.18" />
      <g ref={part('root')}>
        <g {...inkPass()}>{lower(true)}</g>
        {lower(false)}
        {wearing.water && (
          <g>
            <path d="M246 244 C210 300 170 350 138 378" stroke="#FF4F9A" strokeWidth={9} fill="none" strokeLinecap="round" />
            <image href={art.water} x="92" y="332" width="64" height="128" />
          </g>
        )}
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{arm(s, true)}</g>
            {arm(s, false)}
          </g>
        ))}
        <g {...inkPass()}>{head(true)}</g>
        {head(false)}
      </g>
    </>
  )
  if (embed) return <g ref={svg} transform={`translate(${embed.x} ${embed.y}) scale(${embed.scale})`}>{body}</g>
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label="Pip" style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      {body}
    </svg>
  )
})
