// Pip the joey: a layered SVG puppet. Parts move every frame (see roo.ts for the body mechanics).
import { forwardRef, useState, type CSSProperties } from 'react'
import { setA, setT, show, usePuppet, type PuppetHandle } from '../../../../sdk'
import { art } from '../art'
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

const O = { stroke: '#3F2A26', strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const FUR = '#F2B07A'
const FUR_DARK = '#E39A62'
const CREAM = '#FFF1DE'
const INNER = '#F9A8B4'

/** Pip the joey. Actions: hop, cheer, wave, dance, wiggle, shake (no-no), fan (too hot), hug. Voice: pip. */
export const Pip = forwardRef<PuppetHandle, PipProps>(function Pip({ height, style, wearing = {}, flip, onTap, embed }, ref) {
  const [motion] = useState(() => rooMotion(150))
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
      setT(p.armL, `translate(170 278) rotate(${r.armL[0]})`)
      setT(p.foreL, `translate(0 42) rotate(${r.armL[1]})`)
      setT(p.armR, `translate(230 278) scale(-1 1) rotate(${r.armR[0]})`)
      setT(p.foreR, `translate(0 42) rotate(${r.armR[1]})`)
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
    },
  })

  const body = (
    <>
      <ellipse ref={part('shadow')} rx="92" ry="11" fill="#6B3A2A" opacity="0.18" />
      <g ref={part('root')}>
        <g ref={part('tail')}>
          <path {...O} fill={FUR} d="M18 -34 C-30 -30 -86 -14 -118 -54 C-132 -72 -122 -96 -104 -88 C-98 -66 -66 -46 -20 -40 C-2 -38 14 -10 20 16 Z" />
          <path fill={CREAM} d="M-6 -14 C-48 -16 -88 -26 -110 -60 C-92 -38 -56 -30 -8 -26 Z" />
        </g>
        <g ref={part('footL')}>
          <path {...O} fill={FUR} d="M-52 6 C-56 -14 -26 -24 6 -22 C38 -20 62 -8 60 6 C58 18 -48 20 -52 6 Z" />
          <path {...O} fill="none" strokeWidth={3.5} d="M40 -4 L44 9 M26 -6 L28 10" />
        </g>
        <g ref={part('footR')}>
          <path {...O} fill={FUR} d="M-52 6 C-54 -12 -26 -24 6 -22 C38 -22 64 -10 60 6 C56 18 -48 18 -52 6 Z" />
          <path {...O} fill="none" strokeWidth={3.5} d="M40 -4 L44 9 M26 -6 L28 10" />
        </g>
        {/* Body and haunches */}
        <path {...O} fill={FUR} d="M200 226 C252 226 274 290 278 348 C282 410 250 442 200 442 C150 442 118 410 122 348 C126 290 148 226 200 226Z" />
        <path {...O} fill={FUR} d="M150 346 C112 350 100 392 110 420 C118 444 150 452 176 440 C190 420 186 360 150 346Z" />
        <path {...O} fill={FUR} d="M250 346 C288 350 300 392 290 420 C282 444 250 452 224 440 C210 420 214 360 250 346Z" />
        <path fill={CREAM} d="M200 250 C232 250 246 306 248 352 C250 404 228 426 200 426 C172 426 150 404 152 352 C154 306 168 250 200 250Z" />
        <path {...O} fill="none" strokeWidth={4} d="M128 404 C140 424 160 432 178 432 M272 404 C260 424 240 432 222 432" />
        {wearing.water && (
          <g>
            <path d="M246 244 C210 300 170 350 138 378" stroke="#FF4F9A" strokeWidth={9} fill="none" strokeLinecap="round" />
            <image href={art.water} x="92" y="332" width="64" height="128" />
          </g>
        )}
        {/* Arms: upper arm → forearm → paw */}
        {(['L', 'R'] as const).map((s) => (
          <g key={s} ref={part(s === 'L' ? 'armL' : 'armR')}>
            <rect {...O} fill={FUR} x="-14" y="-8" width="28" height="56" rx="14" />
            <g ref={part(s === 'L' ? 'foreL' : 'foreR')}>
              <rect {...O} fill={FUR} x="-13" y="-8" width="26" height="46" rx="13" />
              <ellipse {...O} fill={FUR} cx="0" cy="40" rx="16" ry="14" />
              <path {...O} fill="none" strokeWidth={3} d="M-5 46 L-5 52 M5 46 L5 52" />
            </g>
          </g>
        ))}
        {/* Head */}
        <g ref={part('head')}>
          <g ref={part('earL')}>
            <path {...O} fill={FUR} d="M-24 8 C-40 -40 -30 -104 -2 -122 C24 -106 36 -44 22 8 Z" />
            <path fill={INNER} d="M-12 -6 C-24 -44 -16 -90 -2 -104 C12 -90 20 -44 10 -6 Z" />
          </g>
          <g ref={part('earR')}>
            <path {...O} fill={FUR} d="M-22 8 C-36 -44 -24 -106 2 -122 C30 -104 40 -40 24 8 Z" />
            <path fill={INNER} d="M-10 -6 C-20 -44 -12 -90 2 -104 C16 -90 24 -44 12 -6 Z" />
          </g>
          <path {...O} fill={FUR} d="M200 92 C256 92 288 126 290 168 C292 210 262 242 200 242 C138 242 108 210 110 168 C112 126 144 92 200 92Z" />
          <path {...O} fill={FUR} d="M184 98 C178 80 192 76 197 90 C200 74 216 76 214 96" />
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
                <path {...O} fill="none" strokeWidth={3} d={s === 'L' ? 'M-10 -11 L-17 -16 M-12 -5 L-19 -7' : 'M10 -11 L17 -16 M12 -5 L19 -7'} />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...O} fill="none" strokeWidth={5} d="M-13 4 Q0 -12 13 4" />
            </g>
          ))}
          <path ref={part('browL')} {...O} fill="none" strokeWidth={4} d="M156 134 Q166 128 178 132" />
          <path ref={part('browR')} {...O} fill="none" strokeWidth={4} d="M222 132 Q234 128 244 134" />
          {/* Mouth, nose */}
          <path ref={part('mouth')} {...O} strokeWidth={4} fill="#B8323F" d="" />
          <path ref={part('tongue')} fill="#FF7F98" d="" />
          <path ref={part('smile')} {...O} fill="none" strokeWidth={4} d="M182 205 Q191 214 200 205 Q209 214 218 205" />
          <path fill="#2E1C1A" d="M186 188 C186 178 214 178 214 188 C214 197 205 202 200 202 C195 202 186 197 186 188Z" />
          <ellipse fill="#fff" opacity="0.55" cx="194" cy="185" rx="4" ry="2.6" />
          {/* Bow */}
          <g transform="translate(150 112) rotate(-12)">
            <path {...O} fill="#FF5C9A" d="M0 0 L-32 -20 C-42 -4 -38 14 -28 22 Z M0 0 L30 -24 C42 -8 38 12 28 20 Z" />
            <circle {...O} fill="#FF5C9A" r="10" />
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
        </g>
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
