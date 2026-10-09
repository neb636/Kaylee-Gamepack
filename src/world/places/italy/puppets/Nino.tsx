// Nino, a little Sicilian donkey who carries snow down from Mount Etna: a layered SVG puppet (reference:
// art/source/world/italy/nino.png). Side view, facing right. Drawn in the reference picture's own pixel space
// (viewBox ~1180 x 1200, hooves on y 1188), so its outline is ~15 units (5 on a 400-unit character).
// Four legs trot in diagonal pairs as he walks (`moodRef.walk` / `moodRef.phase` from the game loop), his long ears and
// tail ride on springs (they lag and flop), and the weather shows on him: in the heat his ears droop, he pants with his
// tongue out and a sweat drop runs down; in the cold he shivers when he stands still and his breath puffs out in clouds.
// `scarf` wraps a striped pink scarf round his neck whose end flaps as he trots.
import { forwardRef, useId, useRef, useState, type CSSProperties } from 'react'
import { bell, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { BLUSH, EYE, INK, inkPass, line, TONGUE, useInk } from './ink'

export const NINO_ACTIONS: Record<string, number> = { bray: 1.3, hop: 0.8, cheer: 1.1, kick: 0.9, shake: 0.9, sneeze: 1.1, nod: 0.7, munch: 1.4, giggle: 0.9 }

/** What the game loop tells him every frame: how fast he walks (0..1), where his legs are in the step (radians), and
 *  how hot (0..1) and cold (0..1) it is. */
export interface NinoMood {
  walk: number
  phase: number
  hot: number
  cold: number
}

type Part =
  | 'root' | 'shadow' | 'body' | 'head' | 'earFar' | 'earNear' | 'tail' | 'legBF' | 'legBN' | 'legFF' | 'legFN'
  | 'eyeOpen' | 'pupil' | 'eyeHappy' | 'eyeShut' | 'lid' | 'mouthOpen' | 'tongue' | 'smile' | 'sweat' | 'breath' | 'scarf' | 'scarfEnd'

const COAT = '#B8A99C'
const COAT_SHADE = '#A3948A'
const FAR = '#A69688'
const CREAM = '#F7E7DA'
const MANE = '#5E3B2A'
const HOOF = '#5A3A2A'
const EAR_IN = '#F4A7A3'
const RED = '#E8574F'
const GOLD = '#FFC83D'
const SCARF = '#FF8FB8'
const SCARF_STRIPE = '#FFF7F0'

const W = 15 // outline width in this viewBox
// Shapes (reference pixel space).
const BODY = 'M300 700 C360 640 520 652 640 662 C760 672 862 706 892 792 C912 872 880 958 800 984 C700 1010 540 1010 430 992 C330 976 270 922 268 832 C266 772 276 730 300 700Z'
const NECK = 'M640 668 C690 600 760 520 820 470 L960 560 C936 660 908 760 884 826 C820 806 700 748 640 708Z'
const SKULL = 'M776 560 C770 470 840 412 922 420 C1010 428 1072 492 1082 580 C1090 650 1050 732 980 756 C900 780 820 748 790 690 C780 660 776 610 776 560Z'
const MUZZLE = 'M990 640 C1010 590 1070 580 1120 600 C1170 620 1186 676 1168 716 C1150 760 1090 776 1040 764 C996 754 976 690 990 640Z'
const MANE_D = 'M880 436 L846 384 L832 432 L788 396 L790 450 L738 422 L750 478 L694 462 L716 520 L660 512 L690 566 L632 566 L670 612 L618 624 L660 650 L640 680 C720 610 800 530 890 486Z'
// Ears (origin at the base, pointing up).
const EAR_FAR = 'M-56 6 C-100 -110 -168 -290 -150 -380 C-136 -436 -66 -416 -30 -336 C0 -266 30 -120 46 6Z'
const EAR_FAR_IN = 'M-34 -20 C-70 -120 -124 -280 -122 -350 C-114 -386 -80 -370 -60 -318 C-36 -256 -6 -130 14 -20Z'
const EAR_NEAR = 'M-56 6 C-56 -126 -24 -300 46 -366 C84 -398 120 -370 112 -312 C102 -220 70 -100 48 6Z'
const EAR_NEAR_IN = 'M-30 -20 C-28 -130 0 -272 52 -330 C76 -352 90 -336 86 -300 C78 -220 52 -110 28 -20Z'
// A leg hangs from its hip (0, 0) down to the hoof bottom at y 282.
const LEG = 'M-46 -30 L46 -30 C50 80 46 170 42 238 L-42 238 C-46 170 -50 80 -46 -30Z'
const HOOF_D = 'M-48 228 L46 228 C54 254 52 274 46 284 L-50 284 C-54 270 -54 248 -48 228Z'
const TAIL_ROPE = 'M0 0 C-24 50 -44 108 -58 158'
const TAIL_TUFT = 'M-48 136 C-92 146 -136 176 -150 210 C-122 206 -112 216 -132 242 C-96 232 -80 242 -86 264 C-56 238 -38 214 -36 176Z'

/** Hips and shoulders (leg pivots): back far, back near, front far, front near. */
const HIPS = { legBF: [356, 900], legBN: [440, 910], legFF: [706, 900], legFN: [792, 906] } as const
const NECK_PIVOT = [760, 730] as const
const EAR_FAR_BASE = [868, 456] as const
const EAR_NEAR_BASE = [962, 438] as const
const TAIL_BASE = [286, 738] as const

export interface NinoProps {
  height?: string
  style?: CSSProperties
  onTap?: () => void
  /** A cozy pink scarf (once she puts it on him in the cold). */
  scarf?: boolean
  /** Read every frame (so walking doesn't re-render him). */
  moodRef?: { current: NinoMood }
  /** Static weather when there's no moodRef (story screens, the puppet lab). */
  hot?: number
  cold?: number
}

/** Nino the Sicilian donkey. Voice: nino. */
export const Nino = forwardRef<PuppetHandle, NinoProps>(function Nino({ height, style, onTap, scarf = false, moodRef, hot = 0, cold = 0 }, ref) {
  const props = useRef({ scarf, moodRef, hot, cold })
  props.current = { scarf, moodRef, hot, cold }
  const [m] = useState(() => ({ earF: spring(80, 6), earN: spring(80, 6), tail: spring(60, 5), scarfEnd: spring(70, 5), flick: 0, nextFlick: 2, swish: 0, nextSwish: 3, prevBob: 0 }))
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const twin = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'nino',
    actions: NINO_ACTIONS,
    eyes: [962, 590],
    reach: [1100, 700],
    frame: (f, p) => {
      const { t, dt, p: q, action: a } = f
      const P = props.current
      const mood = P.moodRef?.current ?? { walk: 0, phase: 0, hot: P.hot, cold: P.cold }
      const w = Math.max(0, Math.min(1, mood.walk))
      const ph = mood.phase
      const breathe = Math.sin(t * 2.1)
      let sx = 1 + breathe * 0.008
      let sy = 1 - breathe * 0.008
      let lift = 0
      let lean = 0
      let shiverX = 0
      let headRot = Math.sin(t * 0.8) * 2 + f.look.y * 4 + mood.hot * 7
      let earBack = 0
      let open = 0
      let happy = false
      let shut = false
      const legs = { legBF: 0, legBN: 0, legFF: 0, legFN: 0 }
      const legLift = { legBF: 0, legBN: 0, legFF: 0, legFN: 0 }

      // Trot: diagonal pairs swing together; the body bobs twice per step.
      const A = Math.sin(ph)
      const B = Math.sin(ph + Math.PI)
      legs.legBF = A * 24 * w
      legs.legFN = A * 24 * w
      legs.legBN = B * 24 * w
      legs.legFF = B * 24 * w
      legLift.legBF = legLift.legFN = Math.max(0, Math.cos(ph)) * 16 * w
      legLift.legBN = legLift.legFF = Math.max(0, -Math.cos(ph)) * 16 * w
      const bob = Math.abs(Math.sin(ph)) * 14 * w
      lift += bob
      headRot += Math.sin(ph * 2) * 3 * w

      // Heat: drooping ears, panting with his tongue out while he stands. Cold: shivering, breath clouds.
      earBack += mood.hot * 26
      const panting = mood.hot > 0.5 && w < 0.4
      if (panting) open = Math.max(open, 0.25 + Math.abs(Math.sin(t * 7)) * 0.2)
      if (mood.cold > 0.45 && w < 0.25 && !a) shiverX = Math.sin(t * 46) * 5 * mood.cold
      // Talking: little head bobs with his voice.
      headRot += Math.sin(t * 11) * f.mouth * 3

      // Idle life: an ear flick and a tail swish every few seconds.
      if (t > m.nextFlick) {
        m.earN.v += (Math.random() < 0.5 ? -1 : 1) * 260
        m.nextFlick = t + 2 + Math.random() * 3
      }
      if (t > m.nextSwish) {
        m.tail.v += 320
        m.nextSwish = t + 2.5 + Math.random() * 3
      }

      if (a === 'hop' || a === 'cheer') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.22, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx += crouch * 0.08 - air * 0.04 + land * 0.06
        sy += -crouch * 0.1 + air * 0.08 - land * 0.07
        lift += air * (a === 'cheer' ? 90 : 110)
        legs.legFF -= air * 22
        legs.legFN -= air * 22
        legs.legBF += air * 22
        legs.legBN += air * 22
        if (a === 'cheer') {
          happy = true
          open = Math.max(open, 0.6)
          headRot -= air * 14
        }
      } else if (a === 'bray') {
        // Head thrown back, mouth wide: "Hee-haw!"
        const up = bell(span(q, 0, 0.9))
        headRot -= up * 30
        earBack -= up * 20
        open = Math.max(open, up * (0.6 + Math.abs(Math.sin(q * Math.PI * 4)) * 0.4))
        shut = up > 0.5
      } else if (a === 'kick') {
        // A silly donkey kick: weight on the front legs, back legs fly up behind.
        const k = bell(span(q, 0.1, 0.8))
        lean = k * 9
        legs.legBF -= k * 60
        legs.legBN -= k * 70
        headRot += k * 10
        happy = true
        open = Math.max(open, k * 0.5)
        m.tail.v += k * 40
      } else if (a === 'shake') {
        const s = Math.sin(q * Math.PI * 9) * (1 - q)
        lean = s * 4
        shiverX += s * 10
        headRot += s * 14
        m.earF.v += s * 400
        m.earN.v -= s * 400
        shut = true
      } else if (a === 'sneeze') {
        const back = smooth(span(q, 0, 0.45))
        const snap = bell(span(q, 0.45, 0.75))
        headRot += -back * 16 * (1 - span(q, 0.45, 0.55)) + snap * 22
        shut = q > 0.3 && q < 0.85
        open = Math.max(open, q < 0.45 ? back * 0.4 : snap)
        sy -= snap * 0.06
        if (q > 0.45 && q < 0.5) ((m.earF.v -= 140), (m.earN.v += 140))
      } else if (a === 'nod') {
        headRot += Math.abs(Math.sin(q * Math.PI * 2)) * bell(q) * 14
      } else if (a === 'munch') {
        const down = bell(span(q, 0, 1))
        headRot += down * 34
        open = Math.max(open, down * Math.abs(Math.sin(q * Math.PI * 8)) * 0.4)
      } else if (a === 'giggle') {
        happy = true
        open = Math.max(open, 0.3 + Math.abs(Math.sin(q * Math.PI * 6)) * 0.3)
        headRot += Math.sin(q * Math.PI * 8) * 5
        sx += Math.sin(q * Math.PI * 10) * 0.02
      }

      // Springs: ears and tail lag behind the bob and flop.
      const bobV = (lift - m.prevBob) / Math.max(dt, 1 / 120)
      m.prevBob = lift
      const earF = m.earF.step(-earBack + Math.max(-30, Math.min(30, bobV * 0.05)), dt)
      const earN = m.earN.step(earBack * 0.9 - Math.max(-30, Math.min(30, bobV * 0.05)), dt)
      const tail = m.tail.step(Math.sin(ph * 2) * 12 * w + Math.sin(t * 1.4) * 4 + (a === 'kick' ? -40 : 0), dt)
      const scarfEnd = m.scarfEnd.step(-w * 28 + Math.sin(ph * 2) * 10 * w, dt)

      setT(p.root, `translate(${shiverX} ${-lift}) translate(600 1188) rotate(${lean}) scale(${sx} ${sy}) translate(-600 -1188)`)
      setT(p.shadow, `translate(600 1192) scale(${1 - Math.min(0.5, lift / 300)}) translate(-600 -1192)`)
      for (const leg of ['legBF', 'legBN', 'legFF', 'legFN'] as const) {
        const [hx, hy] = HIPS[leg]
        setT(p[leg], `translate(${hx} ${hy - legLift[leg]}) rotate(${legs[leg]})`)
      }
      const headT = `rotate(${headRot} ${NECK_PIVOT[0]} ${NECK_PIVOT[1]})`
      setT(p.head, headT)
      setT(p.earFar, `translate(${EAR_FAR_BASE[0]} ${EAR_FAR_BASE[1]}) rotate(${earF})`)
      setT(p.earNear, `translate(${EAR_NEAR_BASE[0]} ${EAR_NEAR_BASE[1]}) rotate(${earN})`)
      setT(p.tail, `translate(${TAIL_BASE[0]} ${TAIL_BASE[1]}) rotate(${tail})`)
      show(p.scarf, P.scarf)
      setT(p.scarfEnd, `rotate(${scarfEnd} 836 700)`)

      // Face.
      show(p.eyeOpen, !happy && !shut)
      show(p.eyeHappy, happy && !shut)
      show(p.eyeShut, shut)
      setT(p.eyeOpen, `translate(0 590) scale(1 ${f.blink}) translate(0 -590)`)
      setT(p.pupil, `translate(${f.look.x * 6} ${f.look.y * 6})`)
      // Sleepy lid in the heat.
      const lid = Math.max(0, mood.hot - 0.4) * 1.4
      show(p.lid, lid > 0.05 && !happy && !shut)
      setT(p.lid, `translate(0 ${-34 + lid * 24})`)
      const mo = Math.min(1, Math.max(open, f.mouth * 1.1))
      show(p.mouthOpen, mo > 0.05)
      show(p.smile, mo <= 0.05)
      setT(p.mouthOpen, `translate(1074 724) scale(1 ${0.3 + mo * 0.9}) translate(-1074 -724)`)
      show(p.tongue, panting)
      // A sweat drop slides down his cheek in the heat.
      const sweatK = (t * 0.6) % 1
      show(p.sweat, mood.hot > 0.55)
      setT(p.sweat, `translate(0 ${sweatK * 60})`)
      ;(p.sweat as SVGElement | undefined)?.setAttribute('opacity', String(Math.min(1, (1 - sweatK) * 2)))
      // Breath clouds in the cold: one every ~2 s, puffing out in front of his nose.
      const bk = (t / 2.1) % 1
      show(p.breath, mood.cold > 0.4)
      setT(p.breath, `translate(${1190 + bk * 90} ${700 - bk * 40}) scale(${0.3 + bk * 1.1})`)
      ;(p.breath as SVGElement | undefined)?.setAttribute('opacity', String(Math.max(0, 0.9 - bk) * Math.min(1, (mood.cold - 0.4) * 4)))
      twin.sync(p)
    },
  })
  const r = (name: Part, pass: boolean) => (pass ? twin.twin(name) : part(name))

  const leg = (name: 'legBF' | 'legBN' | 'legFF' | 'legFN', pass: boolean) => {
    const far = name === 'legBF' || name === 'legFF'
    return (
      <g ref={r(name, pass)}>
        <path fill={far ? FAR : COAT} d={LEG} />
        <path fill={HOOF} d={HOOF_D} />
        {!pass && <path {...line(10)} d="M-44 230 L42 230" />}
      </g>
    )
  }
  const tailG = (pass: boolean) => (
    <g ref={r('tail', pass)}>
      <path d={TAIL_ROPE} fill="none" stroke={pass ? INK : COAT} strokeWidth={pass ? 26 + W * 2 : 26} strokeLinecap="round" />
      <path fill={MANE} d={TAIL_TUFT} />
    </g>
  )
  const body = (pass: boolean) => (
    <g ref={r('body', pass)}>
      <path fill={COAT} d={BODY} />
      {!pass && (
        <>
          <clipPath id={`${uid}b`}>
            <path d={BODY} />
          </clipPath>
          <g clipPath={`url(#${uid}b)`}>
            <path fill={CREAM} d="M420 906 C520 936 700 932 860 880 L880 1020 L400 1020Z" />
            <path {...line(10)} d="M420 906 C520 936 700 932 860 880" />
            <path fill={COAT_SHADE} opacity="0.5" d="M268 820 C280 900 330 960 420 985 C340 990 280 950 262 880Z" />
          </g>
          <path {...line(10)} d="M470 900 C480 860 470 830 450 812" />
        </>
      )}
    </g>
  )
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <path fill={MANE} d={MANE_D} />
      <g ref={r('earFar', pass)}>
        <path fill={COAT} d={EAR_FAR} />
        {!pass && <path fill={EAR_IN} d={EAR_FAR_IN} />}
      </g>
      <path fill={COAT} d={NECK} />
      <path fill={COAT} d={SKULL} />
      <path fill={CREAM} d={MUZZLE} />
      {!pass && (
        <>
          {/* The cream chest under his chin, then the red harness with gold tassels. */}
          <path d="M780 652 C800 736 846 800 910 830" fill="none" stroke={INK} strokeWidth={28 + 12} strokeLinecap="round" />
          <path d="M780 652 C800 736 846 800 910 830" fill="none" stroke={RED} strokeWidth={28} strokeLinecap="round" />
          {[
            [812, 752],
            [862, 810],
            [912, 836],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="12" fill={GOLD} stroke={INK} strokeWidth="7" />
              <path fill={GOLD} stroke={INK} strokeWidth="7" strokeLinejoin="round" d="M-14 10 L14 10 L22 56 L-22 56Z" />
              <path {...line(5)} d="M-6 30 L-8 54 M6 30 L8 54" />
            </g>
          ))}
          {/* Forelock tufts between the ears. */}
          <path fill={MANE} stroke={INK} strokeWidth="9" strokeLinejoin="round" d="M846 470 L862 410 L884 452 L906 400 L922 452 L948 414 L950 470 C920 486 870 488 846 470Z" />
          {/* Face: brow, eye, blush, nostril, smile / open mouth. */}
          <path {...line(9, EYE)} d="M924 540 Q946 522 970 528" />
          <g ref={part('eyeOpen')}>
            <g ref={part('pupil')}>
              <circle cx="962" cy="590" r="36" fill={EYE} />
              <circle cx="972" cy="577" r="10" fill="#fff" />
              <circle cx="950" cy="604" r="4" fill="#fff" />
            </g>
          </g>
          <g ref={part('lid')} style={{ display: 'none' }}>
            <clipPath id={`${uid}e`}>
              <circle cx="962" cy="590" r="34" />
            </clipPath>
            <g clipPath={`url(#${uid}e)`}>
              <rect x="924" y="556" width="80" height="34" fill={COAT} />
              <path {...line(8, EYE)} d="M926 590 L1000 590" />
            </g>
          </g>
          <path ref={part('eyeHappy')} style={{ display: 'none' }} {...line(11, EYE)} d="M934 600 Q962 566 990 600" />
          <path ref={part('eyeShut')} style={{ display: 'none' }} {...line(11, EYE)} d="M932 588 Q962 610 992 588" />
          <ellipse cx="912" cy="660" rx="40" ry="27" fill={BLUSH} />
          <ellipse cx="1112" cy="652" rx="10" ry="15" fill={EYE} transform="rotate(-20 1112 652)" />
          <path ref={part('smile')} {...line(9, EYE)} d="M1040 712 Q1066 734 1094 712" />
          <g ref={part('mouthOpen')} style={{ display: 'none' }}>
            <ellipse cx="1074" cy="724" rx="34" ry="24" fill="#8E3432" stroke={EYE} strokeWidth="8" />
            <ellipse cx="1074" cy="734" rx="18" ry="9" fill={TONGUE} />
          </g>
          {/* Panting in the heat: tongue out. */}
          <path ref={part('tongue')} style={{ display: 'none' }} fill={TONGUE} stroke={INK} strokeWidth="7" d="M1060 730 C1058 770 1070 790 1086 788 C1100 786 1104 768 1096 730Z" />
          {/* A sweat drop by his eye. */}
          <path ref={part('sweat')} style={{ display: 'none' }} fill="#8FD3F4" stroke={INK} strokeWidth="6" d="M870 520 C860 540 852 556 852 566 C852 580 862 588 872 588 C884 588 892 580 892 566 C892 556 882 540 870 520Z" />
          {/* The scarf: a striped pink band round his neck, and an end that flaps. */}
          <g ref={part('scarf')} style={{ display: 'none' }}>
            <g ref={part('scarfEnd')}>
              <path fill={SCARF} stroke={INK} strokeWidth="12" strokeLinejoin="round" d="M818 690 C790 760 776 820 770 880 L826 892 C830 830 846 770 864 716Z" />
              <path fill={SCARF_STRIPE} d="M784 800 L842 812 L838 832 L780 820Z M776 852 L832 864 L830 880 L774 870Z" />
              <path {...line(8)} d="M770 880 L766 904 M786 884 L784 908 M802 888 L800 912 M818 890 L818 914" />
            </g>
            <path d="M776 618 C800 690 850 740 930 752" fill="none" stroke={INK} strokeWidth={70 + 24} strokeLinecap="round" />
            <path d="M776 618 C800 690 850 740 930 752" fill="none" stroke={SCARF} strokeWidth={70} strokeLinecap="round" />
            <path d="M790 648 C812 700 850 732 900 744" fill="none" stroke={SCARF_STRIPE} strokeWidth={14} strokeLinecap="round" strokeDasharray="30 34" />
          </g>
        </>
      )}
      <g ref={r('earNear', pass)}>
        <path fill={COAT} d={EAR_NEAR} />
        {!pass && <path fill={EAR_IN} d={EAR_NEAR_IN} />}
      </g>
    </g>
  )
  return (
    <svg ref={svg} viewBox="60 20 1200 1190" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Nino' : undefined} style={{ height, overflow: 'visible', display: 'block', cursor: onTap ? 'pointer' : undefined, ...style }}>
      <ellipse ref={part('shadow')} cx="600" cy="1192" rx="330" ry="26" fill={INK} opacity="0.16" />
      <g ref={part('root')}>
        {(['legBF', 'legFF'] as const).map((l) => (
          <g key={l}>
            <g {...inkPass(W)}>{leg(l, true)}</g>
            {leg(l, false)}
          </g>
        ))}
        <g {...inkPass(W)}>{tailG(true)}</g>
        {tailG(false)}
        {(['legBN', 'legFN'] as const).map((l) => (
          <g key={l}>
            <g {...inkPass(W)}>{leg(l, true)}</g>
            {leg(l, false)}
          </g>
        ))}
        {/* One outline round body, neck and head together, so he reads as one chubby donkey. */}
        <g {...inkPass(W)}>
          {body(true)}
          {headG(true)}
        </g>
        {body(false)}
        {headG(false)}
        {/* Breath cloud in the cold. */}
        <g ref={part('breath')} style={{ display: 'none' }}>
          <path fill="#F4F8FF" stroke={INK} strokeWidth="6" d="M-40 10 C-50 -14 -24 -30 -4 -20 C4 -40 34 -40 42 -18 C62 -24 74 0 60 14 C56 30 30 34 18 24 C6 36 -22 34 -26 20 C-42 24 -50 18 -40 10Z" />
        </g>
      </g>
    </svg>
  )
})
