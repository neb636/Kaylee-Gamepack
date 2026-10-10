// Tika the llama (Machu Picchu), drawn from her reference picture (assets/tika.webp) in the same flat style: caramel
// wool with a woolly scalloped outline, cream face and socks, banana ears with hot-pink tassels, and a pink woven blanket.
// Side view facing right, face turned to the viewer. She is a bit cheeky.
//
// Actions: hop (crouch, jump, land, used to climb a terrace), munch (neck down to the grass, chew, back up), cheer,
// giggle, nod, smug (a proud head tilt), dance, and photobomb poses for Luna's camera (see `pose`).
import { forwardRef, useRef } from 'react'
import { bell, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK } from './Alpaca'

export const TIKA_ACTIONS = { hop: 0.9, munch: 1.7, cheer: 1.2, giggle: 1.1, nod: 0.7, smug: 1.6, dance: 1.8, spit: 0.9 }
export type TikaPose = 'grin' | 'tongue' | 'wink' | 'tilt' | 'peek'
export const TIKA_POSES: TikaPose[] = ['grin', 'tongue', 'wink', 'tilt', 'peek']

/** Her picture box: about 980 x 1240, feet on y = 1215. */
export const TIKA_VIEW = { x: 180, y: 0, w: 980, h: 1240, feetY: 1215 }

const C = {
  wool: '#E5A867',
  shade: '#CC8A4C',
  line: '#B07034',
  face: '#EDB57A',
  muzzle: '#FFF2DC',
  sock: '#FFF2DC',
  hoof: '#5B4038',
  ear: '#FF9DBF',
  tassel: '#FF3D8E',
  blanket: '#FF4F9A',
  blanketIn: '#FF8FB8',
  blanketLight: '#FFC2D6',
  gold: '#FFC83D',
  lav: '#B9A6F5',
}

/** A woolly outline: arcs that bulge outward between points listed clockwise (on screen). */
function fluff(pts: [number, number][], bulge = 1.05) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i <= pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i % pts.length]
    const r = Math.hypot(x1 - x0, y1 - y0) * bulge
    d += `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x1} ${y1}`
  }
  return d + 'Z'
}

/** Points around an ellipse, clockwise on screen, from angle a0 to a1 (degrees). */
function ring(cx: number, cy: number, rx: number, ry: number, n: number, a0 = 0, a1 = 360): [number, number][] {
  const out: [number, number][] = []
  const closed = a1 - a0 >= 360
  for (let i = 0; i < n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / (closed ? n : n - 1)) * Math.PI) / 180
    out.push([Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry)])
  }
  return out
}

const BODY = fluff(ring(590, 790, 325, 168, 28))
const TAIL = fluff(ring(285, 630, 80, 76, 10), 0.8)
const NECK = fluff([[790, 430], [870, 420], [960, 425], [1000, 470], [1006, 560], [1002, 650], [985, 740], [950, 830], [880, 900], [770, 760], [768, 640], [775, 540]], 1.1)
const HEAD = fluff(ring(905, 300, 140, 138, 20), 0.95)
const TOPKNOT = fluff([[830, 160], [880, 118], [945, 115], [1000, 150], [1010, 205], [975, 250], [930, 262], [880, 250], [840, 220]], 0.9)
const MUZZLE = 'M930 312C985 312 1010 340 1010 372C1010 410 978 430 930 430C882 430 852 410 852 372C852 340 875 312 930 312Z'

const LEGS = {
  farBack: { x: 470, top: 900, w: 74 },
  nearBack: { x: 372, top: 880, w: 88 },
  farFront: { x: 828, top: 900, w: 70 },
  nearFront: { x: 740, top: 885, w: 84 },
}

export interface TikaProps {
  height: string
  /** Face for Luna's camera (photobomb). */
  pose?: TikaPose | null
  /** Facing left instead of right. */
  flip?: boolean
  label?: string
  onTap?: () => void
}

type Part = 'root' | 'neck' | 'head' | 'earL' | 'earR' | 'tasselL' | 'tasselR' | 'tail' | 'fringe' | 'eyesOpen' | 'eyesShut' | 'wink' | 'pupils' | 'mouth' | 'teeth' | 'tongue' | 'chew' | 'grass'

export const Tika = forwardRef<PuppetHandle, TikaProps>(function Tika(props, ref) {
  const { height, flip, label = 'Tika', onTap } = props
  const live = useRef(props)
  live.current = props
  const springs = useRef({ earL: spring(140, 8), earR: spring(140, 8), tasL: spring(90, 5), tasR: spring(90, 5), tail: spring(110, 7), neck: spring(70, 11), fringe: spring(80, 6) }).current

  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'tika',
    actions: TIKA_ACTIONS,
    eyes: [922, 320],
    reach: [930, 390],
    frame: (f, p) => {
      const pose = live.current.pose ?? null
      const q = f.p
      const a = f.action
      const e = bell(q)
      let y = 0
      let sx = 1
      let sy = 1
      let rot = 0
      const breathe = Math.sin(f.t * 2.1)
      sx += breathe * 0.005
      sy -= breathe * 0.008
      let air = 0
      if (a === 'hop' || a === 'cheer') {
        // Anticipation, stretch on take-off, float, squash on landing, settle.
        const crouch = bell(span(q, 0, 0.24))
        air = bell(span(q, 0.24, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx += crouch * 0.09 - air * 0.05 + land * 0.08
        sy += -crouch * 0.12 + air * 0.09 - land * 0.1
        y -= air * (a === 'cheer' ? 12 : 4)
      } else if (a === 'giggle') {
        rot += Math.sin(q * Math.PI * 10) * 2.5 * e
        sy += Math.abs(Math.sin(q * Math.PI * 10)) * 0.03 * e
      } else if (a === 'dance') {
        rot += Math.sin(q * Math.PI * 6) * 6 * e
        y -= Math.abs(Math.sin(q * Math.PI * 6)) * 5 * e
        sy += Math.abs(Math.cos(q * Math.PI * 6)) * 0.04 * e
      } else if (a === 'munch') {
        rot += bell(span(q, 0, 1)) ** 0.5 * 3
      } else if (a === 'spit') {
        // A cheeky little lean back, then forward: "ptoo!"
        rot += (bell(span(q, 0, 0.5)) * -3 + bell(span(q, 0.5, 1)) * 4) * 1
      }
      if (p.root instanceof HTMLElement) p.root.style.transform = `translateY(${y.toFixed(2)}%) rotate(${rot.toFixed(2)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`

      // The neck swings down to the grass to munch, back on hops (follow-through), forward on a spit.
      let neck = Math.sin(f.t * 0.9) * 1.5
      const graze = a === 'munch' ? bell(span(q, 0, 1)) ** 0.5 : 0
      neck += 78 * graze
      if (a === 'hop' || a === 'cheer') neck -= air * 8
      if (a === 'spit') neck += bell(span(q, 0.45, 0.9)) * 10 - bell(span(q, 0, 0.45)) * 6
      if (pose === 'peek') neck += 14
      const nk = springs.neck.step(neck, f.dt)
      p.neck?.setAttribute('transform', `rotate(${nk.toFixed(2)} 860 760)`)

      // Head: idle sway, looks toward her finger, nods, tilts.
      let head = Math.sin(f.t * 1.2) * 2 + f.look.x * 5
      if (a === 'nod') head += Math.sin(q * Math.PI * 2) * 8
      if (a === 'giggle') head += Math.sin(q * Math.PI * 8) * 6 * e
      if (a === 'smug') head -= 14 * e
      if (a === 'dance') head += Math.sin(q * Math.PI * 6) * 10 * e
      // Grazing: the face stays turned up toward her while the neck dips to the grass.
      head -= graze * 46
      if (pose === 'tilt') head -= 16
      if (pose === 'wink') head += 8
      if (pose === 'peek') head -= 20
      p.head?.setAttribute('transform', `rotate(${head.toFixed(2)} 900 420)`)

      // Ears and tassels lag behind and flop.
      const flop = a === 'hop' || a === 'cheer' ? bell(span(q, 0.2, 0.75)) * 16 : 0
      const swing = -head * 1.2 - nk * 0.6
      p.earL?.setAttribute('transform', `rotate(${springs.earL.step(swing - flop, f.dt).toFixed(2)} 805 190)`)
      p.earR?.setAttribute('transform', `rotate(${springs.earR.step(swing + flop, f.dt).toFixed(2)} 1015 190)`)
      p.tasselL?.setAttribute('transform', `rotate(${springs.tasL.step(-swing * 1.5 - (air || 0) * 30, f.dt).toFixed(2)} 735 110)`)
      p.tasselR?.setAttribute('transform', `rotate(${springs.tasR.step(-swing * 1.5 + (air || 0) * 30, f.dt).toFixed(2)} 1080 135)`)
      p.tail?.setAttribute('transform', `rotate(${springs.tail.step(a ? Math.sin(f.t * 9) * 16 * e : Math.sin(f.t * 1.3) * 3, f.dt).toFixed(1)} 340 660)`)
      p.fringe?.setAttribute('transform', `rotate(${springs.fringe.step(-rot * 2 + air * 6 + Math.sin(f.t * 1.7) * 1.5, f.dt).toFixed(2)} 590 800)`)

      // Eyes: blink, follow her finger; shut when giggling or smug; one eye for a wink.
      const shut = a === 'giggle' || a === 'smug' || (a === 'munch' && q > 0.3 && q < 0.85)
      const wink = pose === 'wink' || pose === 'tongue'
      p.eyesOpen?.setAttribute('display', shut ? 'none' : 'inline')
      p.eyesShut?.setAttribute('display', shut ? 'inline' : 'none')
      p.wink?.setAttribute('display', wink && !shut ? 'inline' : 'none')
      p.eyesOpen?.setAttribute('transform', `translate(0 ${(320 * (1 - f.blink)).toFixed(1)}) scale(1 ${f.blink.toFixed(3)})`)
      p.pupils?.setAttribute('transform', `translate(${(f.look.x * 5).toFixed(1)} ${(f.look.y * 4).toFixed(1)})`)

      // Mouth: her voice opens it; cheers, giggles and the grin open it wide; munching chews side to side.
      const chewing = a === 'munch' && q > 0.25 && q < 0.9
      const grin = pose === 'grin' || pose === 'tilt'
      const open = Math.max(f.mouth, a === 'giggle' ? 0.5 : 0, a === 'cheer' ? e * 0.7 : 0, grin ? 0.75 : 0, pose === 'tongue' ? 0.45 : 0, chewing ? Math.abs(Math.sin(f.t * 14)) * 0.35 : 0, a === 'spit' ? bell(span(q, 0.45, 0.75)) * 0.5 : 0)
      p.mouth?.setAttribute('d', mouthPath(open, chewing ? Math.sin(f.t * 7) * 6 : 0))
      p.teeth?.setAttribute('display', grin ? 'inline' : 'none')
      p.tongue?.setAttribute('display', pose === 'tongue' ? 'inline' : 'none')
      p.grass?.setAttribute('display', chewing ? 'inline' : 'none')
      p.chew?.setAttribute('transform', chewing ? `translate(${(Math.sin(f.t * 7) * 4).toFixed(1)} 0)` : '')
    },
  })

  const leg = (l: { x: number; top: number; w: number }, far: boolean) => {
    const { x, top, w } = l
    const h = w / 2
    return (
      <g key={x} stroke={INK} strokeWidth="9" strokeLinejoin="round">
        {/* Upper leg in wool, lower leg in cream socks, a split hoof. */}
        <path d={`M${x - h} ${top}L${x - h + 6} 1165Q${x} 1178 ${x + h - 6} 1165L${x + h} ${top}Z`} fill={far ? C.shade : C.wool} />
        <path d={`M${x - h + 3} 1040Q${x - h / 2} 1056 ${x} 1040Q${x + h / 2} 1056 ${x + h - 3} 1040L${x + h - 6} 1165Q${x} 1178 ${x - h + 6} 1165Z`} fill={far ? '#EBD9BF' : C.sock} />
        <path d={`M${x - 2} 1165Q${x - 2} 1158 ${x - h + 2} 1160Q${x - h - 10} 1170 ${x - h - 10} 1196Q${x - h - 8} 1215 ${x - h + 8} 1215H${x - 2}Z`} fill={C.hoof} />
        <path d={`M${x + 2} 1165Q${x + 2} 1158 ${x + h - 2} 1160Q${x + h + 10} 1170 ${x + h + 10} 1196Q${x + h + 8} 1215 ${x + h - 8} 1215H${x + 2}Z`} fill={C.hoof} />
      </g>
    )
  }

  const tassel = (cx: number, cy: number) => (
    <g stroke={INK} strokeWidth="6" strokeLinejoin="round">
      <path d={`M${cx - 22} ${cy + 18}Q${cx - 28} ${cy + 70} ${cx - 18} ${cy + 92}Q${cx} ${cy + 100} ${cx + 18} ${cy + 92}Q${cx + 28} ${cy + 70} ${cx + 22} ${cy + 18}Z`} fill={C.tassel} />
      <path d={`M${cx - 9} ${cy + 40}V${cy + 88}M${cx + 9} ${cy + 40}V${cy + 88}`} fill="none" strokeWidth="4" stroke="#C81E65" />
      <circle cx={cx} cy={cy + 10} r="20" fill={C.tassel} />
    </g>
  )

  return (
    <div role="img" aria-label={label} onClick={onTap} style={{ position: 'relative', height, aspectRatio: `${TIKA_VIEW.w} / ${TIKA_VIEW.h}`, cursor: onTap ? 'pointer' : undefined, transform: flip ? 'scaleX(-1)' : undefined }}>
      <div ref={part('root')} style={{ position: 'absolute', inset: 0, transformOrigin: '55% 98%', willChange: 'transform' }}>
        <svg ref={svg} viewBox={`${TIKA_VIEW.x} ${TIKA_VIEW.y} ${TIKA_VIEW.w} ${TIKA_VIEW.h}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {leg(LEGS.farBack, true)}
          {leg(LEGS.farFront, true)}
          <g ref={part('tail')}>
            <path d={TAIL} fill={C.wool} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
            <path d="M300 560Q318 540 344 548" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
          </g>
          {leg(LEGS.nearBack, false)}
          {leg(LEGS.nearFront, false)}
          {/* Body and the woolly lines on it. */}
          <path d={BODY} fill={C.wool} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
          <path d="M330 880q14 -14 28 0M470 920q14 -14 28 0M640 930q14 -14 28 0M820 880q12 -12 24 0M300 760q12 -12 24 0" fill="none" stroke={C.line} strokeWidth="6" strokeLinecap="round" opacity=".6" />

          {/* Neck and head swing together (munching); the head turns on the neck. */}
          <g ref={part('neck')}>
            <path d={NECK} fill={C.wool} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
            <path d="M840 560q14 -12 28 0M900 660q14 -12 28 0M860 760q12 -12 24 0" fill="none" stroke={C.line} strokeWidth="6" strokeLinecap="round" opacity=".6" />
            <g ref={part('head')}>
              <g ref={part('earL')}>
                <path d="M812 205Q760 120 784 18Q842 46 858 186Z" fill={C.wool} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
                <path d="M815 168Q790 110 800 58Q832 80 840 162Z" fill={C.ear} />
                <g ref={part('tasselL')}>{tassel(735, 100)}</g>
              </g>
              <g ref={part('earR')}>
                <path d="M995 200Q1050 120 1050 20Q992 40 962 186Z" fill={C.wool} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
                <path d="M995 165Q1030 110 1032 60Q1000 78 984 158Z" fill={C.ear} />
                <g ref={part('tasselR')}>{tassel(1080, 130)}</g>
              </g>
              <path d={HEAD} fill={C.wool} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
              <path d="M790 260C790 200 840 200 900 205C965 200 1012 210 1010 270C1012 340 1000 430 930 440C860 438 792 340 790 260Z" fill={C.face} />
              <path d={MUZZLE} fill={C.muzzle} stroke={INK} strokeWidth="6" />
              <ellipse cx="822" cy="378" rx="26" ry="17" fill="#FF8FB8" opacity=".85" />
              <ellipse cx="1024" cy="376" rx="22" ry="16" fill="#FF8FB8" opacity=".85" />
              <g ref={part('eyesOpen')}>
                <path d="M806 300L790 290M812 290L800 276M1036 296L1052 286M1030 286L1042 272" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
                <ellipse cx="846" cy="320" rx="30" ry="35" fill="#3A2630" />
                <ellipse cx="998" cy="318" rx="28" ry="34" fill="#3A2630" />
                <ellipse cx="846" cy="334" rx="18" ry="13" fill="#6B4650" />
                <ellipse cx="998" cy="332" rx="17" ry="13" fill="#6B4650" />
                <g ref={part('pupils')} fill="#fff">
                  <circle cx="836" cy="305" r="11" />
                  <circle cx="988" cy="303" r="10" />
                  <circle cx="857" cy="334" r="5" />
                  <circle cx="1008" cy="332" r="5" />
                </g>
              </g>
              <g ref={part('eyesShut')} display="none" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round">
                <path d="M818 322Q846 344 874 322" />
                <path d="M972 320Q998 342 1024 320" />
              </g>
              {/* A wink: the right eye closes in a happy arc (drawn over the open eye). */}
              <g ref={part('wink')} display="none">
                <ellipse cx="998" cy="318" rx="36" ry="40" fill={C.face} />
                <path d="M970 324Q998 304 1026 324" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
              </g>
              <path d="M915 344Q930 336 945 344Q945 356 930 364Q915 356 915 344Z" fill="#4A3038" />
              <path d="M930 364V376" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
              <g ref={part('chew')}>
                <path ref={part('mouth')} d={mouthPath(0, 0)} fill="#FF6F9F" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
                <path ref={part('teeth')} display="none" d="M912 381H948V392Q930 396 912 392Z" fill="#FFF7F0" stroke={INK} strokeWidth="4" />
                <path ref={part('tongue')} display="none" d="M918 392Q916 430 932 434Q948 430 944 392Z" fill="#FF4F9A" stroke={INK} strokeWidth="5" />
                <g ref={part('grass')} display="none" stroke={INK} strokeWidth="4" strokeLinejoin="round">
                  <path d="M944 388L992 366L976 386L1004 384L950 398Z" fill="#6CC56E" />
                </g>
              </g>
              {/* The fluffy topknot with a curl over her forehead. */}
              <path d={TOPKNOT} fill={C.wool} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
              <path d="M880 250Q890 214 930 220Q912 236 916 262" fill={C.wool} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
            </g>
          </g>

          {/* Her woven blanket (sways a little on hops) with a tassel fringe. */}
          <g ref={part('fringe')}>
            <path d="M398 604Q590 590 782 600L792 814Q590 852 382 800Z" fill={C.blanket} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
            <path d="M430 612Q590 600 752 610Q745 760 590 772Q440 765 430 612Z" fill={C.blanketIn} />
            <path d="M488 614Q590 606 694 614Q690 704 590 712Q492 704 488 614Z" fill={C.blanketLight} />
            <path d="M444 640Q590 790 740 640" fill="none" stroke={C.gold} strokeWidth="11" />
            {[470, 515, 562, 610, 658, 705].map((x, i) => (
              <circle key={x} cx={x} cy={[680, 706, 720, 720, 706, 680][i]} r="10" fill={C.gold} />
            ))}
            <path d="M430 740L452 712L474 740M500 756L522 728L544 756M572 762L594 734L616 762M644 756L666 728L688 756M714 740L736 712L758 740" fill={C.lav} />
            {[[388, 800], [478, 836], [580, 852], [670, 846], [760, 818]].map(([x, yy]) => (
              <g key={x}>{tassel(x, yy - 6)}</g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
})

/** Her little smile; opens downward (0 closed .. 1 wide). `dx` shifts it for chewing. */
function mouthPath(open: number, dx: number) {
  const x = (v: number) => (v + dx).toFixed(1)
  return `M${x(908)} 380Q${x(930)} ${(388 + open * 4).toFixed(1)} ${x(952)} 380Q${x(950)} ${(386 + open * 34).toFixed(1)} ${x(930)} ${(388 + open * 38).toFixed(1)}Q${x(910)} ${(386 + open * 34).toFixed(1)} ${x(908)} 380Z`
}
