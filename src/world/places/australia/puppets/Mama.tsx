// Mama kangaroo: a layered SVG puppet with a real pouch. Whatever is passed as `pouch` (e.g. an embedded <Pip />)
// is drawn between her belly and the front of the pouch, so it peeks out and moves with her.
import { forwardRef, useId, useState, type CSSProperties, type ReactNode } from 'react'
import { setA, setT, show, usePuppet, type PuppetHandle } from '../../../../sdk'
import { ROO_ACTIONS, rooMotion } from './roo'

export interface MamaProps {
  height: string
  style?: CSSProperties
  /** Drawn peeking out of the pouch, in Mama's viewBox units (400 x 600): e.g. <Pip embed={MAMA_POUCH} />. */
  pouch?: ReactNode
  flip?: boolean
  onTap?: () => void
}

/** Where a joey sits in the pouch: pass to <Pip embed={MAMA_POUCH} />. */
export const MAMA_POUCH = { x: 116, y: 340, scale: 0.42 }

type Part = 'root' | 'head' | 'earL' | 'earR' | 'tail' | 'armL' | 'foreL' | 'armR' | 'foreR' | 'footL' | 'footR' | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'pupilL' | 'pupilR' | 'browL' | 'browR' | 'mouth' | 'tongue' | 'smile' | 'shadow'

const O = { stroke: '#3F2A26', strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const FUR = '#D99158'
const FUR_DARK = '#C47C45'
const CREAM = '#F8E4C4'
const INNER = '#F6A0AE'

/** Mama kangaroo. Actions: hop, cheer, wave, dance, wiggle, shake, fan, hug. Voice: mama. */
export const Mama = forwardRef<PuppetHandle, MamaProps>(function Mama({ height, style, pouch, flip, onTap }, ref) {
  const [motion] = useState(() => rooMotion(110))
  const clip = `pouch-${useId().replace(/:/g, '')}`
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'mama',
    actions: ROO_ACTIONS,
    eyes: [200, 150],
    frame: (f, p) => {
      const r = motion(f)
      setT(p.root, `translate(0 ${-r.lift}) translate(200 590) rotate(${r.lean}) scale(${r.sx} ${r.sy}) translate(-200 -590)`)
      setT(p.shadow, `translate(200 592) scale(${1 - Math.min(0.5, r.lift / 300)})`)
      setT(p.head, `translate(0 ${r.crouch * 14 + r.headY}) rotate(${r.head} 200 236)`)
      setT(p.earL, `translate(170 104) rotate(${-14 - r.ears * 0.9})`)
      setT(p.earR, `translate(230 104) rotate(${14 + r.ears})`)
      setT(p.tail, `translate(150 500) rotate(${r.tail * 0.8})`)
      setT(p.armL, `translate(166 296) rotate(${r.armL[0] + 12})`)
      setT(p.foreL, `translate(0 54) rotate(${r.armL[1] + 14})`)
      setT(p.armR, `translate(234 296) scale(-1 1) rotate(${r.armR[0] + 12})`)
      setT(p.foreR, `translate(0 54) rotate(${r.armR[1] + 14})`)
      setT(p.footL, `translate(146 574) rotate(${r.feet} 56 0)`)
      setT(p.footR, `translate(254 574) rotate(${r.feet} 56 0)`)
      for (const [eye, open, arc, pupil, x] of [
        [p.eyeL, p.openL, p.happyL, p.pupilL, 174],
        [p.eyeR, p.openR, p.happyR, p.pupilR, 226],
      ] as const) {
        setT(eye, `translate(${x} 150) scale(1 ${r.happy ? 1 : f.blink})`)
        show(open, !r.happy)
        show(arc, r.happy)
        setT(pupil, `translate(${f.look.x * 3} ${f.look.y * 3})`)
      }
      setT(p.browL, `translate(0 ${-r.brow * 6}) rotate(${r.brow < 0 ? -r.brow * 12 : 0} 174 126)`)
      setT(p.browR, `translate(0 ${-r.brow * 6}) rotate(${r.brow < 0 ? r.brow * 12 : 0} 226 126)`)
      const m = Math.min(1, Math.max(r.open, f.mouth * 1.1))
      if (m > 0.05) {
        const w = 14 + m * 3
        setA(p.mouth, 'd', `M${200 - w} 198 Q200 ${196 - m * 2} ${200 + w} 198 Q${200 + w * 0.8} ${198 + 22 * m} 200 ${200 + 22 * m} Q${200 - w * 0.8} ${198 + 22 * m} ${200 - w} 198Z`)
        setA(p.tongue, 'd', m > 0.3 ? `M190 ${196 + 20 * m} Q200 ${190 + 12 * m} 210 ${196 + 20 * m} Q205 ${199 + 22 * m} 200 ${199 + 22 * m} Q195 ${199 + 22 * m} 190 ${196 + 20 * m}Z` : '')
      } else {
        setA(p.mouth, 'd', '')
        setA(p.tongue, 'd', '')
      }
      show(p.smile, m <= 0.05)
    },
  })

  return (
    <svg ref={svg} viewBox="0 0 400 600" onClick={onTap} role={onTap ? 'button' : undefined} aria-label="Mama kangaroo" style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="110" ry="12" fill="#6B3A2A" opacity="0.18" />
      <g ref={part('root')}>
        <g ref={part('tail')}>
          <path {...O} fill={FUR} d="M20 -30 C-30 -10 -80 30 -126 70 C-140 82 -132 96 -116 90 C-70 70 -20 40 24 20 Z" />
          <path fill={CREAM} d="M6 4 C-36 26 -80 58 -118 82 C-80 66 -36 42 10 22 Z" />
        </g>
        <g ref={part('footL')}>
          <path {...O} fill={FUR} d="M-66 8 C-70 -16 -34 -28 8 -26 C48 -24 78 -10 76 8 C74 22 -62 24 -66 8 Z" />
          <path {...O} fill="none" strokeWidth={3.5} d="M52 -4 L57 11 M36 -6 L39 12" />
        </g>
        <g ref={part('footR')}>
          <path {...O} fill={FUR} d="M-66 8 C-68 -14 -34 -28 8 -26 C48 -26 80 -12 76 8 C72 22 -62 22 -66 8 Z" />
          <path {...O} fill="none" strokeWidth={3.5} d="M52 -4 L57 11 M36 -6 L39 12" />
        </g>
        <path {...O} fill={FUR} d="M200 236 C262 236 292 330 296 420 C300 520 258 562 200 562 C142 562 100 520 104 420 C108 330 138 236 200 236Z" />
        <path {...O} fill={FUR} d="M142 430 C96 436 84 492 96 530 C106 562 146 572 180 556 C196 530 190 452 142 430Z" />
        <path {...O} fill={FUR} d="M258 430 C304 436 316 492 304 530 C294 562 254 572 220 556 C204 530 210 452 258 430Z" />
        <path fill={CREAM} d="M200 262 C238 262 256 338 258 420 C260 506 234 544 200 544 C166 544 140 506 142 420 C144 338 162 262 200 262Z" />
        {/* Inside of the pouch, the joey, then the pouch front */}
        <path fill="#E9C9A0" d="M146 440 Q200 418 254 440 Q252 462 200 470 Q148 462 146 440Z" />
        <clipPath id={clip}>
          <rect x="60" y="0" width="280" height="452" />
          <rect x="146" y="0" width="108" height="532" />
        </clipPath>
        <g clipPath={`url(#${clip})`}>{pouch}</g>
        <path {...O} fill={CREAM} d="M142 444 Q200 472 258 444 C262 504 238 540 200 540 C162 540 138 504 142 444Z" />
        <path fill="none" stroke="#E2C49A" strokeWidth={4} strokeLinecap="round" d="M160 470 Q200 488 240 470" />
        {(['L', 'R'] as const).map((s) => (
          <g key={s} ref={part(s === 'L' ? 'armL' : 'armR')}>
            <rect {...O} fill={FUR} x="-15" y="-8" width="30" height="68" rx="15" />
            <g ref={part(s === 'L' ? 'foreL' : 'foreR')}>
              <rect {...O} fill={FUR} x="-13" y="-8" width="26" height="56" rx="13" />
              <ellipse {...O} fill={FUR} cx="0" cy="50" rx="16" ry="14" />
              <path {...O} fill="none" strokeWidth={3} d="M-5 56 L-5 62 M5 56 L5 62" />
            </g>
          </g>
        ))}
        <g ref={part('head')}>
          <g ref={part('earL')}>
            <path {...O} fill={FUR} d="M-22 8 C-38 -44 -28 -112 -2 -132 C24 -114 34 -46 20 8 Z" />
            <path fill={INNER} d="M-11 -6 C-22 -48 -15 -96 -2 -112 C11 -96 18 -48 9 -6 Z" />
          </g>
          <g ref={part('earR')}>
            <path {...O} fill={FUR} d="M-20 8 C-34 -46 -24 -114 2 -132 C28 -112 38 -44 22 8 Z" />
            <path fill={INNER} d="M-9 -6 C-18 -48 -11 -96 2 -112 C15 -96 22 -48 11 -6 Z" />
          </g>
          <path {...O} fill={FUR} d="M200 86 C250 86 276 118 276 156 C276 200 246 234 200 234 C154 234 124 200 124 156 C124 118 150 86 200 86Z" />
          <path {...O} fill={FUR} d="M188 92 C184 78 196 74 199 86 C203 72 216 76 212 92" />
          <path fill={FUR_DARK} opacity="0.35" d="M132 176 C138 204 160 224 190 230 C156 230 130 212 126 176Z" />
          <ellipse fill="#FF9DB0" opacity="0.7" cx="152" cy="184" rx="14" ry="8" />
          <ellipse fill="#FF9DB0" opacity="0.7" cx="248" cy="184" rx="14" ry="8" />
          <ellipse fill={CREAM} cx="200" cy="192" rx="40" ry="30" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
              <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                <ellipse fill="#2E1C1A" rx="10.5" ry="13" />
                <g ref={part(s === 'L' ? 'pupilL' : 'pupilR')}>
                  <circle fill="#fff" cx="-3" cy="-5" r="4.2" />
                  <circle fill="#fff" cx="3.5" cy="4" r="1.8" />
                </g>
                <path {...O} fill="none" strokeWidth={3} d={s === 'L' ? 'M-8 -10 L-15 -15 M-10 -4 L-17 -6' : 'M8 -10 L15 -15 M10 -4 L17 -6'} />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...O} fill="none" strokeWidth={4.5} d="M-11 3 Q0 -10 11 3" />
            </g>
          ))}
          <path ref={part('browL')} {...O} fill="none" strokeWidth={4} d="M164 128 Q173 123 184 126" />
          <path ref={part('browR')} {...O} fill="none" strokeWidth={4} d="M216 126 Q227 123 236 128" />
          <path ref={part('mouth')} {...O} strokeWidth={4} fill="#B8323F" d="" />
          <path ref={part('tongue')} fill="#FF7F98" d="" />
          <path ref={part('smile')} {...O} fill="none" strokeWidth={4} d="M185 197 Q192 205 200 197 Q208 205 215 197" />
          <path fill="#2E1C1A" d="M188 180 C188 171 212 171 212 180 C212 188 204 192 200 192 C196 192 188 188 188 180Z" />
          <ellipse fill="#fff" opacity="0.55" cx="195" cy="178" rx="3.5" ry="2.2" />
          {/* A pink flower behind her ear */}
          <g transform="translate(240 100)">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} {...O} strokeWidth={3} fill="#FF8FB8" rx="9" ry="13" transform={`rotate(${a}) translate(0 -11)`} />
            ))}
            <circle {...O} strokeWidth={3} fill="#FFC83D" r="7" />
          </g>
        </g>
      </g>
    </svg>
  )
})
