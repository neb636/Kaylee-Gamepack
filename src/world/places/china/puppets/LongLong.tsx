// Long Long, the friendly paper dragon head of the New Year dragon dance (reference: art/source/world/china/longlong.png).
// A layered SVG puppet: the pink mane, gold whiskers, jade horns and ears hang on springs, so when the head is dragged
// across the plaza they trail behind and flop back (the puppet measures its own on-screen speed). Idle: breathing,
// blinking, eyes that follow her finger. The jaw opens with his voice. Actions: roar (a happy one), nod, wiggle, dance, blink.
//
//   <LongLong ref={ll} height="30vh" />       ll.current?.play('roar')
import { forwardRef, useId, useState, type CSSProperties } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { EYE, INK } from './ink'

export const LONGLONG_ACTIONS: Record<string, number> = { roar: 1.5, nod: 0.7, wiggle: 0.8, dance: 1.6, blink: 0.3 }

type Part =
  | 'root' | 'anchor' | 'mane' | 'crest' | 'earL' | 'earR' | 'hornL' | 'hornR' | 'whiskL' | 'whiskR' | 'face' | 'jaw'
  | 'eyeL' | 'eyeR' | 'irisL' | 'irisR' | 'mouth' | 'clip' | 'tongue' | 'fangs' | 'smile' | 'nose' | 'gem' | 'blushL' | 'blushR'

const RED = '#F2484E'
const PINK = '#FF8FB0'
const PINK_L = '#FFB6CB'
const GOLD = '#FFD04A'
const JADE = '#8EDDB2'
const JADE_D = '#5FC08F'
const CREAM = '#FFF1DC'
const MOUTH_IN = '#7A2E2A'
const TONGUE = '#FF7E93'

/** A scalloped blob: n bumps around an ellipse. */
function scallop(cx: number, cy: number, rx: number, ry: number, n: number, bump: number) {
  let d = ''
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const x = cx + Math.cos(a) * rx
    const y = cy + Math.sin(a) * ry
    if (i === 0) {
      d += `M${x.toFixed(1)} ${y.toFixed(1)}`
      continue
    }
    const am = ((i - 0.5) / n) * Math.PI * 2
    const mx = cx + Math.cos(am) * (rx + bump)
    const my = cy + Math.sin(am) * (ry + bump)
    d += ` Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d + 'Z'
}
const MANE = scallop(200, 258, 150, 108, 13, 26)
const MANE_IN = scallop(200, 240, 120, 84, 11, 15)
const CHIN = scallop(200, 328, 46, 22, 7, 9)
const O = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const HORN = 'M-15 6 C-20 -26 -26 -46 -38 -56 C-46 -64 -30 -78 -22 -68 C-16 -62 -8 -50 0 -46 C2 -60 4 -78 16 -84 C26 -88 32 -74 24 -66 C14 -54 15 -28 15 6Z'
const WHISK = 'M0 0 C-36 16 -84 14 -112 -8 C-128 -22 -118 -40 -102 -36 C-90 -32 -92 -18 -102 -16'

/** Long Long the paper dragon head. Actions: roar, nod, wiggle, dance, blink. Voice: longlong. */
export const LongLong = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; onTap?: () => void }>(function LongLong({ height, style, flip, onTap }, ref) {
  const [m] = useState(() => ({
    mane: spring(120, 6), wL: spring(90, 5), wR: spring(90, 5), hL: spring(140, 7), hR: spring(140, 7), eL: spring(160, 8), eR: spring(160, 8),
    prevX: NaN, prevY: NaN, vx: 0, vy: 0,
  }))
  const clipId = useId().replace(/:/g, '')
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'longlong',
    actions: LONGLONG_ACTIONS,
    eyes: [200, 190],
    frame: (f, p) => {
      const { t, p: q, action: a } = f
      const breathe = Math.sin(t * 2.4)
      let sx = 1 - breathe * 0.008
      let sy = 1 + breathe * 0.014
      let rot = Math.sin(t * 0.9) * 1.2 + f.look.x * 2
      let lift = 0
      let open = 0.55
      let eyeS = 1
      let pop = 0
      let squint = false
      let jawExtra = 0

      // Speed on screen (px/s), so the mane and whiskers trail behind when he is dragged along.
      const a0 = p.anchor.getBoundingClientRect()
      if (!Number.isNaN(m.prevX)) {
        const dt = Math.max(f.dt, 1 / 120)
        m.vx += ((a0.left - m.prevX) / dt - m.vx) * 0.35
        m.vy += ((a0.top - m.prevY) / dt - m.vy) * 0.35
      }
      m.prevX = a0.left
      m.prevY = a0.top
      const scaleFix = Math.max(0.3, a0.width || 1) // anchor is 1 unit wide, so its screen width is px per unit
      const ux = m.vx / scaleFix
      const uy = m.vy / scaleFix

      open += f.mouth * 0.75
      rot += Math.sin(t * 12) * f.mouth * 1.6
      lift += f.mouth * 3

      if (a === 'roar') {
        const anti = bell(span(q, 0, 0.26))
        const shout = bell(span(q, 0.26, 0.82))
        const land = wobble(span(q, 0.8, 1), 2)
        sy += -anti * 0.1 + shout * 0.06 + land * -0.05
        sx += anti * 0.07 - shout * 0.03 + land * 0.05
        rot += -anti * 6 + shout * 4
        lift += -anti * 8 + shout * 12
        open = lerp(open, 1, smooth(span(q, 0.22, 0.34)) * (1 - smooth(span(q, 0.8, 0.94)))) - anti * 0.25
        pop = shout
        squint = shout > 0.4
        jawExtra = shout
      } else if (a === 'nod') {
        const n = Math.abs(Math.sin(q * Math.PI * 2)) * bell(q)
        lift += n * 10
        sy -= n * 0.05
        rot += n * 2
        open = 0.6
      } else if (a === 'wiggle') {
        const w = Math.sin(q * Math.PI * 6) * bell(q)
        rot += w * 12
        sx += Math.abs(w) * 0.04
        open = 0.7
        squint = true
      } else if (a === 'dance') {
        const w = Math.sin(q * Math.PI * 6) * bell(q)
        const b = Math.abs(Math.sin(q * Math.PI * 6)) * bell(q)
        rot += w * 11
        lift += b * 26
        sy += b * 0.06
        sx -= b * 0.03
        open = 0.75
        squint = bell(q) > 0.3
        pop = b * 0.6
      } else if (a === 'blink') {
        eyeS = 1 - bell(q) * 0.95
      }

      // Springs: the mane, whiskers, horns and ears lag behind his motion and flop back.
      const dt2 = f.dt
      const push = Math.max(-40, Math.min(40, ux * 0.05))
      const rise = Math.max(-30, Math.min(30, -uy * 0.05))
      const mane = m.mane.step(push * 0.7 + rot * 0.4, dt2)
      const wL = m.wL.step(-push * 1.3 + rise * 0.9 - rot * 0.6, dt2)
      const wR = m.wR.step(push * -1.3 - rise * 0.9 - rot * 0.6, dt2)
      const hL = m.hL.step(-push * 0.8 - rise * 0.5 + rot * 0.5, dt2)
      const hR = m.hR.step(-push * 0.8 - rise * 0.5 + rot * 0.5, dt2)
      const eL = m.eL.step(rise * 0.8 - push * 0.5, dt2)
      const eR = m.eR.step(rise * 0.8 + push * 0.5, dt2)

      setT(p.root, `translate(0 ${-lift}) translate(200 340) rotate(${rot}) scale(${sx} ${sy}) translate(-200 -340)`)
      setT(p.mane, `translate(200 290) rotate(${mane * 0.6}) scale(${1 + pop * 0.06 + breathe * 0.006}) translate(-200 -290)`)
      setT(p.crest, `translate(200 130) rotate(${mane * 0.8 + Math.sin(t * 3) * 1.5}) translate(-200 -130)`)
      setT(p.earL, `translate(100 130) rotate(${-8 - eL})`)
      setT(p.earR, `translate(300 130) scale(-1 1) rotate(${-8 - eR})`)
      setT(p.hornL, `translate(140 104) rotate(${-10 + hL})`)
      setT(p.hornR, `translate(260 104) scale(-1 1) rotate(${-10 + hR})`)
      setT(p.whiskL, `translate(152 226) rotate(${wL + Math.sin(t * 2.1) * 2})`)
      setT(p.whiskR, `translate(248 226) scale(-1 1) rotate(${wR + Math.sin(t * 2.1 + 1) * 2})`)
      setT(p.face, `translate(${f.look.x * 4} ${f.look.y * 3})`)
      setT(p.gem, `translate(200 ${140 + breathe * 0.6})`)

      for (const [eye, iris, x, k] of [[p.eyeL, p.irisL, 138, 1], [p.eyeR, p.irisR, 262, -1]] as const) {
        setT(eye, `translate(${x} 186) scale(${squint ? 1.04 : 1} ${squint ? Math.max(0.52, f.blink * eyeS * 0.6) : Math.max(0.06, f.blink * eyeS)})`)
        setT(iris, `translate(${f.look.x * 6 + k * 1} ${f.look.y * 5})`)
      }
      setT(p.blushL, `translate(108 224) scale(${1 + pop * 0.2})`)
      setT(p.blushR, `translate(292 224) scale(${1 + pop * 0.2})`)

      // Mouth: a wide happy smile that opens into a big "O" of a roar.
      const mo = Math.min(1, Math.max(0.05, open))
      const w = 42 + mo * 8
      const bot = 268 + mo * 42
      setA(p.mouth, 'd', `M${200 - w} 262 Q200 ${274 + mo * 4} ${200 + w} 262 C${200 + w * 0.95} ${bot - 6} ${200 + 16} ${bot + 4} 200 ${bot + 4} C${200 - 16} ${bot + 4} ${200 - w * 0.95} ${bot - 6} ${200 - w} 262Z`)
      setA(p.clip, 'd', `M${200 - w} 262 Q200 ${274 + mo * 4} ${200 + w} 262 C${200 + w * 0.95} ${bot - 6} ${200 + 16} ${bot + 4} 200 ${bot + 4} C${200 - 16} ${bot + 4} ${200 - w * 0.95} ${bot - 6} ${200 - w} 262Z`)
      setA(p.tongue, 'd', `M${200 - w * 0.7} ${bot - 4} Q200 ${bot - 24 * Math.min(1, mo * 1.3)} ${200 + w * 0.7} ${bot - 4} L${200 + w} ${bot + 8} L${200 - w} ${bot + 8}Z`)
      show(p.fangs, mo > 0.1)
      setT(p.fangs, `translate(0 ${mo * 1.5})`)
      setT(p.jaw, `translate(0 ${mo * 18 + jawExtra * 4})`)
    },
  })
  return (
    <svg ref={svg} viewBox="0 0 400 400" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Long Long' : undefined} style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <rect ref={part('anchor')} x="0" y="0" width="1" height="1" fill="none" />
      <ellipse cx="200" cy="392" rx="120" ry="9" fill="#2a1240" opacity="0.28" />
      <g ref={part('root')}>
        <g ref={part('mane')}>
          <path {...O} fill={PINK} d={MANE} />
          <path {...O} fill={PINK_L} d={scallop(200, 262, 128, 84, 12, 18)} opacity="0.55" strokeWidth={0} />
          <path {...O} fill={GOLD} d={MANE_IN} />
        </g>
        <g ref={part('crest')}>
          <path {...O} fill={PINK} d="M200 44 C170 74 160 104 172 132 L228 132 C240 104 230 74 200 44Z" />
          <path {...O} fill={GOLD} d="M172 132 C158 112 160 92 172 80 C176 96 184 108 196 116Z M228 132 C242 112 240 92 228 80 C224 96 216 108 204 116Z" />
        </g>
        {(['L', 'R'] as const).map((s) => (
          <g key={s} ref={part(s === 'L' ? 'hornL' : 'hornR')}>
            <path {...O} fill={JADE} d={HORN} />
            <path d="M-6 -6 C-8 -22 -12 -34 -20 -46" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
          </g>
        ))}
        {(['L', 'R'] as const).map((s) => (
          <g key={s} ref={part(s === 'L' ? 'earL' : 'earR')}>
            <path {...O} fill={RED} d="M0 0 C-26 -6 -58 -4 -78 22 C-96 46 -84 92 -50 96 C-26 98 -6 80 6 56 Z" />
            <path fill={CREAM} d="M-8 18 C-28 14 -50 20 -60 38 C-68 56 -56 76 -40 76 C-24 76 -12 62 -6 46Z" />
            <path fill={PINK} d="M-14 32 C-28 30 -42 36 -46 48 C-48 60 -40 66 -32 64 C-22 60 -16 50 -14 32Z" />
          </g>
        ))}
        <path {...O} fill={RED} d="M200 78 C270 78 312 122 308 184 C304 246 262 290 200 290 C138 290 96 246 92 184 C88 122 130 78 200 78Z" />
        <g ref={part('face')}>
          <path {...O} strokeWidth={3.5} fill={CREAM} d="M200 130 C252 128 300 150 296 204 C292 254 252 288 200 288 C148 288 108 254 104 204 C100 150 148 128 200 130Z" />
          {[[136, 154], [264, 154]].map(([x, y], i) => (
            <path key={i} {...O} fill={GOLD} d={`M${x - 34} ${y + 8} C${x - 40} ${y - 10} ${x - 16} ${y - 20} ${x - 4} ${y - 14} C${x + 4} ${y - 24} ${x + 26} ${y - 22} ${x + 30} ${y - 6} C${x + 40} ${y - 2} ${x + 38} ${y + 14} ${x + 26} ${y + 14} C${x + 10} ${y + 4} ${x - 12} ${y + 4} ${x - 34} ${y + 8}Z`} />
          ))}
          <g ref={part('gem')}>
            <circle {...O} strokeWidth={3.5} r="15" fill={GOLD} />
            <circle {...O} strokeWidth={3} r="9" fill={JADE_D} />
            <circle r="3" cx="-3" cy="-3" fill="#fff" opacity="0.7" />
            <circle {...O} strokeWidth={2.5} r="4.5" cx="-30" cy="6" fill={GOLD} />
            <circle {...O} strokeWidth={2.5} r="4.5" cx="30" cy="6" fill={GOLD} />
          </g>
          <ellipse ref={part('blushL')} fill="#FF9DB4" opacity="0.8" rx="20" ry="12" />
          <ellipse ref={part('blushR')} fill="#FF9DB4" opacity="0.8" rx="20" ry="12" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
              <ellipse {...O} strokeWidth={3.5} fill="#fff" rx="31" ry="33" />
              <g ref={part(s === 'L' ? 'irisL' : 'irisR')}>
                <ellipse fill="#3A1810" rx="24" ry="26" />
                <circle fill="#fff" cx={s === 'L' ? -6 : -6} cy="-9" r="7" />
                <circle fill="#fff" cx="8" cy="9" r="3" />
              </g>
            </g>
          ))}
          <g ref={part('nose')}>
            <path {...O} strokeWidth={3.5} fill={CREAM} d="M158 230 C160 208 240 208 242 230 C244 252 224 262 200 262 C176 262 156 252 158 230Z" />
            <path {...O} strokeWidth={3.5} fill={GOLD} d="M172 206 C186 196 214 196 228 206 C222 214 178 214 172 206Z" />
            <path {...O} strokeWidth={3.5} fill="#F26F73" d="M172 224 C174 210 226 210 228 224 C230 238 216 246 200 246 C184 246 170 238 172 224Z" />
            <ellipse fill={EYE} cx="188" cy="226" rx="6.5" ry="8" />
            <ellipse fill={EYE} cx="212" cy="226" rx="6.5" ry="8" />
            <ellipse fill="#fff" opacity="0.55" cx="184" cy="216" rx="6" ry="3" />
          </g>
          <clipPath id={clipId}>
            <path ref={part('clip')} d="" />
          </clipPath>
          <path ref={part('mouth')} {...O} strokeWidth={4} fill={MOUTH_IN} d="" />
          <g clipPath={`url(#${clipId})`}>
            <path ref={part('tongue')} fill={TONGUE} d="" />
          </g>
          <g ref={part('fangs')}>
            <path {...O} strokeWidth={2.5} fill="#fff" d="M164 266 L176 266 L170 286Z M224 266 L236 266 L230 286Z" />
          </g>
          <path {...O} strokeWidth={3.5} fill="none" d="M156 258 Q178 274 200 260 Q222 274 244 258" />
          <g ref={part('jaw')}>
            <path {...O} strokeWidth={3.5} fill={CREAM} d={CHIN} />
            <path {...O} strokeWidth={3} fill="none" d="M186 318 L184 334 M200 320 L200 338 M214 318 L216 334" />
          </g>
        </g>
        {(['L', 'R'] as const).map((s) => (
          <g key={s} ref={part(s === 'L' ? 'whiskL' : 'whiskR')}>
            <path d={WHISK} fill="none" stroke={INK} strokeWidth="17" strokeLinecap="round" />
            <path d={WHISK} fill="none" stroke={GOLD} strokeWidth="9" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  )
})
