// Mama kangaroo: a layered SVG puppet with a real pouch. Whatever is passed as `pouch` (e.g. an embedded <Pip />)
// is drawn between her belly and the front of the pouch, so it peeks out and moves with her.
import { forwardRef, useId, useState, type CSSProperties, type ReactNode } from 'react'
import { setA, setT, show, usePuppet, type PuppetHandle } from '../../../../sdk'
import { inkPass, line, useInk } from './ink'
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

const FUR = '#D99158'
const FUR_DARK = '#C47C45'
const CREAM = '#F8E4C4'
const INNER = '#F6A0AE'

/** Mama kangaroo. Actions: hop, cheer, wave, dance, wiggle, shake, fan, hug. Voice: mama. */
export const Mama = forwardRef<PuppetHandle, MamaProps>(function Mama({ height, style, pouch, flip, onTap }, ref) {
  const [motion] = useState(() => rooMotion(110))
  const ink = useInk<Part>()
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
      setT(p.armL, `translate(160 302) rotate(${r.armL[0] + 12})`)
      setT(p.foreL, `translate(0 44) rotate(${r.armL[1] + 12})`)
      setT(p.armR, `translate(240 302) scale(-1 1) rotate(${r.armR[0] + 12})`)
      setT(p.foreR, `translate(0 44) rotate(${r.armR[1] + 12})`)
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
      ink.sync(p)
    },
  })

  // Each group is drawn twice: an ink copy (one outline around the whole group), then the fills and details on top.
  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))
  const lower = (pass: boolean) => (
    <>
      <g ref={r('tail', pass)}>
        <path fill={FUR} d="M20 -30 C-30 -10 -80 30 -126 70 C-140 82 -132 96 -116 90 C-70 70 -20 40 24 20 Z" />
        {!pass && <path fill={CREAM} d="M6 4 C-36 26 -80 58 -118 82 C-80 66 -36 42 10 22 Z" />}
      </g>
      <g ref={r('footL', pass)}>
        <path fill={FUR} d="M-66 8 C-70 -16 -34 -28 8 -26 C48 -24 78 -10 76 8 C74 22 -62 24 -66 8 Z" />
        {!pass && <path {...line()} d="M52 -2 L56 10 M36 -4 L38 11" />}
      </g>
      <g ref={r('footR', pass)}>
        <path fill={FUR} d="M-66 8 C-68 -14 -34 -28 8 -26 C48 -26 80 -12 76 8 C72 22 -62 22 -66 8 Z" />
        {!pass && <path {...line()} d="M52 -2 L56 10 M36 -4 L38 11" />}
      </g>
      {/* A pear-shaped body; the thighs sit over the belly with just a crease on their inner edge. */}
      <path fill={FUR} d="M200 238 C244 238 264 290 272 350 C280 420 300 490 294 530 C288 562 244 568 200 568 C156 568 112 562 106 530 C100 490 120 420 128 350 C136 290 156 238 200 238Z" />
      {!pass && <path fill={CREAM} d="M200 262 C230 262 244 330 248 400 C252 470 236 548 200 552 C164 548 148 470 152 400 C156 330 170 262 200 262Z" />}
      <path fill={FUR} d="M146 436 C104 436 88 494 92 530 C96 562 132 572 168 564 C182 540 180 468 146 436Z" />
      <path fill={FUR} d="M254 436 C296 436 312 494 308 530 C304 562 268 572 232 564 C218 540 220 468 254 436Z" />
      {!pass && (
        <>
          <path {...line()} d="M150 440 C174 466 182 530 168 564 M250 440 C226 466 218 530 232 564 M96 544 C110 566 140 572 166 565 M304 544 C290 566 260 572 234 565" />
          {/* Inside of the pouch, the joey, then the pouch front */}
          <path fill="#E9C9A0" d="M146 440 Q200 418 254 440 Q252 462 200 470 Q148 462 146 440Z" />
          <clipPath id={clip}>
            <rect x="60" y="0" width="280" height="452" />
            <rect x="146" y="0" width="108" height="532" />
          </clipPath>
          <g clipPath={`url(#${clip})`}>{pouch}</g>
          <path {...line()} fill={CREAM} d="M142 444 Q200 472 258 444 C262 504 238 540 200 540 C162 540 138 504 142 444Z" />
          <path fill="none" stroke="#E2C49A" strokeWidth={4} strokeLinecap="round" d="M160 470 Q200 488 240 470" />
        </>
      )}
    </>
  )
  // Arms: upper arm → forearm → paw, outlined as one limb.
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      <path fill={FUR} d="M-16 -4 C-16 -18 16 -18 16 -4 L14 46 C14 54 -14 54 -14 46 Z" />
      <g ref={r(s === 'L' ? 'foreL' : 'foreR', pass)}>
        <path fill={FUR} d="M-13 0 C-13 -10 13 -10 13 0 L14 26 C23 30 21 52 0 52 C-21 52 -23 30 -14 26 Z" />
        {!pass && <path {...line(2.4)} d="M-5 44 L-5 50 M5 44 L5 50" />}
      </g>
      {/* Fur over the top of the arm's outline, so the arm grows out of the shoulder instead of ending in a cap. */}
      {!pass && <ellipse fill={FUR} cx="0" cy="-8" rx="14" ry="14" />}
    </g>
  )
  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <g ref={r('earL', pass)}>
        <path fill={FUR} d="M-22 8 C-38 -44 -28 -112 -2 -132 C24 -114 34 -46 20 8 Z" />
        {!pass && <path fill={INNER} d="M-11 -6 C-22 -48 -15 -96 -2 -112 C11 -96 18 -48 9 -6 Z" />}
      </g>
      <g ref={r('earR', pass)}>
        <path fill={FUR} d="M-20 8 C-34 -46 -24 -114 2 -132 C28 -112 38 -44 22 8 Z" />
        {!pass && <path fill={INNER} d="M-9 -6 C-18 -48 -11 -96 2 -112 C15 -96 22 -48 11 -6 Z" />}
      </g>
      <path fill={FUR} d="M200 86 C250 86 276 118 276 156 C276 200 246 234 200 234 C154 234 124 200 124 156 C124 118 150 86 200 86Z" />
      <path fill={FUR} d="M185 94 C182 78 195 74 199 86 C203 70 218 76 215 94 Z" />
      {!pass && (
        <>
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
                <path {...line(2.6)} d={s === 'L' ? 'M-8 -10 L-15 -15 M-10 -4 L-17 -6' : 'M8 -10 L15 -15 M10 -4 L17 -6'} />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(4)} d="M-11 3 Q0 -10 11 3" />
            </g>
          ))}
          <path ref={part('browL')} {...line(3)} d="M164 128 Q173 123 184 126" />
          <path ref={part('browR')} {...line(3)} d="M216 126 Q227 123 236 128" />
          <path ref={part('mouth')} {...line(3)} fill="#B8323F" d="" />
          <path ref={part('tongue')} fill="#FF7F98" d="" />
          <path ref={part('smile')} {...line(3.2)} d="M185 197 Q192 205 200 197 Q208 205 215 197" />
          <path fill="#2E1C1A" d="M188 180 C188 171 212 171 212 180 C212 188 204 192 200 192 C196 192 188 188 188 180Z" />
          <ellipse fill="#fff" opacity="0.55" cx="195" cy="178" rx="3.5" ry="2.2" />
          {/* A pink flower behind her ear */}
          <g transform="translate(240 100)">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} {...line(2.4)} fill="#FF8FB8" rx="9" ry="13" transform={`rotate(${a}) translate(0 -11)`} />
            ))}
            <circle {...line(2.4)} fill="#FFC83D" r="7" />
          </g>
        </>
      )}
    </g>
  )

  return (
    <svg ref={svg} viewBox="0 0 400 600" onClick={onTap} role={onTap ? 'button' : undefined} aria-label="Mama kangaroo" style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="110" ry="12" fill="#6B3A2A" opacity="0.18" />
      <g ref={part('root')}>
        <g {...inkPass()}>{lower(true)}</g>
        {lower(false)}
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{arm(s, true)}</g>
            {arm(s, false)}
          </g>
        ))}
        <g {...inkPass()}>{head(true)}</g>
        {head(false)}
      </g>
    </svg>
  )
})
