// Tika the llama (Machu Picchu) and her llama friends, drawn by hand in the flat look of the game shelf
// (src/world/shelf/STYLE.md): no dark outlines, form from a base, a shade and a light tone, ink only for the little
// face details. One drawing, several coats: Tika is caramel with a woven pink blanket and pink ear tassels; her
// friends are the same llama in brown, grey and (the baby) peach. Side view facing right, face turned to the viewer.
// She is a bit cheeky.
//
// Actions: hop (crouch, jump, land, used to climb a terrace), munch (neck down to the grass, chew, back up), cheer,
// giggle, nod, smug (a proud head tilt), dance, spit, and photobomb poses for Luna's camera (see `pose`).
import { forwardRef, useId, useRef } from 'react'
import { bell, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK } from './Alpaca'
import { fluff, ring } from './fleece'

export const TIKA_ACTIONS = { hop: 0.9, munch: 1.7, cheer: 1.2, giggle: 1.1, nod: 0.7, smug: 1.6, dance: 1.8, spit: 0.9 }
export type TikaPose = 'grin' | 'tongue' | 'wink' | 'tilt' | 'peek'
export const TIKA_POSES: TikaPose[] = ['grin', 'tongue', 'wink', 'tilt', 'peek']

/** Her picture box: 900 x 1110, feet on y = 1080. */
export const TIKA_VIEW = { x: 0, y: 0, w: 900, h: 1110, feetY: 1080 }

export interface LlamaCoat {
  wool: string
  shade: string
  light: string
  face: string
  muzzle: string
  sock: string
  hoof: string
  earIn: string
  /** Ear tassels (none when left out). */
  tassel?: string
  tasselShade?: string
  /** The woven blanket on her back. */
  blanket?: boolean
  /** A baby: bigger head, no topknot curl. */
  baby?: boolean
}

export const LLAMA_COATS: Record<'tika' | 'brown' | 'grey' | 'cria', LlamaCoat> = {
  tika: { wool: '#E9AC6C', shade: '#D08D4F', light: '#F7CB95', face: '#F5C48C', muzzle: '#FFF5E6', sock: '#FFF5E6', hoof: '#6B432E', earIn: '#FF9DBF', tassel: '#FF4F9A', tasselShade: '#D8367F', blanket: true },
  brown: { wool: '#A8714D', shade: '#8A573A', light: '#C69069', face: '#C38D64', muzzle: '#FFF1DD', sock: '#FFF1DD', hoof: '#4E3226', earIn: '#F7AFC0', tassel: '#FFC83D', tasselShade: '#EBA123' },
  grey: { wool: '#BCB6D6', shade: '#9790BA', light: '#DEDAF0', face: '#D6D1EA', muzzle: '#FFFFFF', sock: '#F7F4FF', hoof: '#5C5670', earIn: '#FFC4DA', tassel: '#3FC1CF', tasselShade: '#1F9CB3' },
  cria: { wool: '#FFC9A8', shade: '#F0A27F', light: '#FFE2D4', face: '#FFDCC6', muzzle: '#FFF8EE', sock: '#FFF8EE', hoof: '#A46E4B', earIn: '#FF9DBF', baby: true },
}

const BODY = fluff(ring(400, 770, 300, 190, 20, 9), 0.9)
const TAIL = fluff(ring(106, 690, 66, 62, 8), 0.8)
const NECK = fluff([[514, 700], [502, 615], [506, 530], [522, 455], [572, 428], [650, 428], [700, 455], [714, 530], [716, 615], [706, 700], [660, 782], [560, 784]], 0.85)
/** Her head, face and ears: Luna's alpaca family wear the same ones (Alpaca.tsx). */
export const HEAD = fluff(ring(610, 300, 176, 160, 16, 11), 0.82)
export const FACE = 'M478 304C478 226 536 204 610 206C684 204 742 226 742 304C742 388 692 446 610 450C528 446 478 388 478 304Z'
const TOPKNOT = fluff([[536, 196], [548, 140], [602, 108], [662, 122], [690, 172], [676, 222], [612, 240], [556, 232]], 0.8)
const BLANKET = 'M176 716Q168 690 196 680Q350 622 500 650Q528 656 530 684L538 868Q540 896 512 900Q352 924 198 896Q172 892 172 866Z'

const PIVOT = { neck: [608, 780], head: [610, 446], earL: [500, 204], earR: [720, 204], tasselL: [446, 96], tasselR: [774, 96], tail: [150, 712], fringe: [352, 705] } as const
const FEET = TIKA_VIEW.feetY
export const EYE_Y = 312

const LEGS = {
  farBack: { x: 318, w: 86 },
  farFront: { x: 628, w: 86 },
  nearBack: { x: 228, w: 100 },
  nearFront: { x: 540, w: 100 },
}

export interface LlamaProps {
  height: string
  coat?: LlamaCoat
  /** Cast speaker id, so the mouth moves with this llama's voice. */
  voice?: string
  /** Face for Luna's camera (photobomb). */
  pose?: TikaPose | null
  /** Facing left instead of right. */
  flip?: boolean
  label?: string
  onTap?: () => void
}
export type TikaProps = Omit<LlamaProps, 'coat' | 'voice'>

type Part = 'root' | 'neck' | 'head' | 'earL' | 'earR' | 'tasselL' | 'tasselR' | 'tail' | 'fringe' | 'eyesOpen' | 'eyesShut' | 'wink' | 'pupils' | 'mouth' | 'teeth' | 'tongue' | 'chew' | 'grass'

export const Llama = forwardRef<PuppetHandle, LlamaProps>(function Llama(props, ref) {
  const { height, flip, label = 'llama', onTap, voice } = props
  const C = props.coat ?? LLAMA_COATS.tika
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const live = useRef(props)
  live.current = props
  const springs = useRef({ earL: spring(140, 8), earR: spring(140, 8), tasL: spring(90, 5), tasR: spring(90, 5), tail: spring(110, 7), neck: spring(70, 11), fringe: spring(80, 6) }).current
  const rot = (deg: number, [x, y]: readonly [number, number]) => `rotate(${deg.toFixed(2)} ${x} ${y})`

  const { svg, part } = usePuppet<Part>(ref, {
    voice,
    actions: TIKA_ACTIONS,
    eyes: [610, EYE_Y],
    reach: [610, 400],
    frame: (f, p) => {
      const pose = live.current.pose ?? null
      const q = f.p
      const a = f.action
      const e = bell(q)
      let y = 0
      let sx = 1
      let sy = 1
      let tilt = 0
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
        tilt += Math.sin(q * Math.PI * 10) * 2.5 * e
        sy += Math.abs(Math.sin(q * Math.PI * 10)) * 0.03 * e
      } else if (a === 'dance') {
        tilt += Math.sin(q * Math.PI * 6) * 6 * e
        y -= Math.abs(Math.sin(q * Math.PI * 6)) * 5 * e
        sy += Math.abs(Math.cos(q * Math.PI * 6)) * 0.04 * e
      } else if (a === 'munch') {
        tilt += bell(span(q, 0, 1)) ** 0.5 * 4
      } else if (a === 'spit') {
        // A cheeky little lean back, then forward: "ptoo!"
        tilt += bell(span(q, 0, 0.5)) * -3 + bell(span(q, 0.5, 1)) * 4
      }
      if (p.root instanceof HTMLElement) p.root.style.transform = `translateY(${y.toFixed(2)}%) rotate(${tilt.toFixed(2)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`

      // The neck swings down to the grass to munch, back on hops (follow-through), forward on a spit.
      let neck = Math.sin(f.t * 0.9) * 1.5
      const graze = a === 'munch' ? bell(span(q, 0, 1)) ** 0.5 : 0
      neck += 98 * graze
      if (a === 'hop' || a === 'cheer') neck -= air * 8
      if (a === 'spit') neck += bell(span(q, 0.45, 0.9)) * 10 - bell(span(q, 0, 0.45)) * 6
      if (pose === 'peek') neck += 14
      const nk = springs.neck.step(neck, f.dt)
      p.neck?.setAttribute('transform', rot(nk, PIVOT.neck))

      // Head: idle sway, looks toward her finger, nods, tilts.
      let head = Math.sin(f.t * 1.2) * 2 + f.look.x * 5
      if (a === 'nod') head += Math.sin(q * Math.PI * 2) * 8
      if (a === 'giggle') head += Math.sin(q * Math.PI * 8) * 6 * e
      if (a === 'smug') head -= 14 * e
      if (a === 'dance') head += Math.sin(q * Math.PI * 6) * 10 * e
      // Grazing: the face stays turned up toward her while the neck dips to the grass.
      head -= graze * 74
      if (pose === 'tilt') head -= 16
      if (pose === 'wink') head += 8
      if (pose === 'peek') head -= 20
      p.head?.setAttribute('transform', rot(head, PIVOT.head))

      // Ears and tassels lag behind and flop.
      const flop = a === 'hop' || a === 'cheer' ? bell(span(q, 0.2, 0.75)) * 16 : 0
      const swing = -head * 1.2 - nk * 0.6
      p.earL?.setAttribute('transform', rot(springs.earL.step(swing * 0.5 - flop, f.dt), PIVOT.earL))
      p.earR?.setAttribute('transform', rot(springs.earR.step(swing * 0.5 + flop, f.dt), PIVOT.earR))
      p.tasselL?.setAttribute('transform', rot(springs.tasL.step(-swing * 1.2 - air * 30, f.dt), PIVOT.tasselL))
      p.tasselR?.setAttribute('transform', rot(springs.tasR.step(-swing * 1.2 + air * 30, f.dt), PIVOT.tasselR))
      p.tail?.setAttribute('transform', rot(springs.tail.step(a ? Math.sin(f.t * 9) * 16 * e : Math.sin(f.t * 1.3) * 3, f.dt), PIVOT.tail))
      p.fringe?.setAttribute('transform', rot(springs.fringe.step(-tilt * 0.6 + air * 3 + Math.sin(f.t * 1.7) * 0.6, f.dt), PIVOT.fringe))

      // Eyes: blink, follow her finger; shut when giggling or smug; one eye for a wink.
      const shut = a === 'giggle' || a === 'smug' || (a === 'munch' && q > 0.3 && q < 0.85)
      const wink = pose === 'wink' || pose === 'tongue'
      p.eyesOpen?.setAttribute('display', shut ? 'none' : 'inline')
      p.eyesShut?.setAttribute('display', shut ? 'inline' : 'none')
      p.wink?.setAttribute('display', wink && !shut ? 'inline' : 'none')
      p.eyesOpen?.setAttribute('transform', `translate(0 ${(EYE_Y * (1 - f.blink)).toFixed(1)}) scale(1 ${f.blink.toFixed(3)})`)
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

  /** A stubby leg: wool, a cream sock, a rounded hoof. */
  const leg = ({ x, w }: { x: number; w: number }, far: boolean) => {
    const h = w / 2
    const r = (w / 6).toFixed(1)
    const top = FEET - 230
    const cuff = FEET - 104
    return (
      <g key={x}>
        <path d={`M${x - h} ${cuff}H${x + h}V${FEET - 22}Q${x + h} ${FEET} ${x + h - 24} ${FEET}H${x - h + 24}Q${x - h} ${FEET} ${x - h} ${FEET - 22}Z`} fill={C.hoof} />
        <rect x={x - h} y={cuff - 4} width={w} height={64} fill={C.sock} />
        {far && <rect x={x - h} y={cuff - 4} width={w} height={64} fill={C.shade} opacity=".35" />}
        {/* The wool comes down over the sock in three soft scallops. */}
        <path d={`M${x - h} ${top}H${x + h}V${cuff}A${r} ${r} 0 0 1 ${x + h / 3} ${cuff}A${r} ${r} 0 0 1 ${x - h / 3} ${cuff}A${r} ${r} 0 0 1 ${x - h} ${cuff}Z`} fill={far ? C.shade : C.wool} />
        <path d={`M${x} ${FEET - 26}V${FEET - 4}`} stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".28" />
      </g>
    )
  }

  /** An ear tassel: a little pom on a cord with a yarn skirt. */
  const tassel = (cx: number, cy: number) =>
    C.tassel && (
      <g>
        <path d={`M${cx - 20} ${cy + 26}Q${cx - 28} ${cy + 76} ${cx - 16} ${cy + 96}Q${cx} ${cy + 104} ${cx + 16} ${cy + 96}Q${cx + 28} ${cy + 76} ${cx + 20} ${cy + 26}Z`} fill={C.tassel} />
        <path d={`M${cx - 7} ${cy + 52}V${cy + 94}M${cx + 8} ${cy + 52}V${cy + 94}`} fill="none" strokeWidth="5" strokeLinecap="round" stroke={C.tasselShade} />
        <circle cx={cx} cy={cy + 18} r="22" fill={C.tassel} />
        <circle cx={cx - 7} cy={cy + 11} r="7" fill="#fff" opacity=".45" />
      </g>
    )

  const head = C.baby ? `translate(${PIVOT.head[0]} ${PIVOT.head[1]}) scale(1.14) translate(${-PIVOT.head[0]} ${-PIVOT.head[1]})` : undefined

  return (
    <div role="img" aria-label={label} onClick={onTap} style={{ position: 'relative', height, aspectRatio: `${TIKA_VIEW.w} / ${TIKA_VIEW.h}`, cursor: onTap ? 'pointer' : undefined, transform: flip ? 'scaleX(-1)' : undefined }}>
      {/* A soft shadow on the ground under her. */}
      <div aria-hidden style={{ position: 'absolute', left: '10%', right: '14%', bottom: '0.4%', height: '4.4%', borderRadius: '50%', background: 'rgba(60, 40, 90, 0.16)' }} />
      <div ref={part('root')} style={{ position: 'absolute', inset: 0, transformOrigin: '45% 98%', willChange: 'transform' }}>
        <svg ref={svg} viewBox={`${TIKA_VIEW.x} ${TIKA_VIEW.y} ${TIKA_VIEW.w} ${TIKA_VIEW.h}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <clipPath id={`${id}-body`}>
              <path d={BODY} />
            </clipPath>
            <clipPath id={`${id}-neck`}>
              <path d={NECK} />
            </clipPath>
            <clipPath id={`${id}-head`}>
              <path d={HEAD} />
            </clipPath>
            <clipPath id={`${id}-blanket`}>
              <path d={BLANKET} />
            </clipPath>
          </defs>

          {leg(LEGS.farBack, true)}
          {leg(LEGS.farFront, true)}
          <g ref={part('tail')}>
            <path d={TAIL} fill={C.wool} />
            <path d="M72 682q16 -18 36 -8M92 724q14 -12 30 -4" fill="none" stroke={C.shade} strokeWidth="7" strokeLinecap="round" opacity=".7" />
          </g>
          {leg(LEGS.nearBack, false)}
          {leg(LEGS.nearFront, false)}

          {/* Body: a woolly cloud, shaded underneath, lit on the back. */}
          <path d={BODY} fill={C.wool} />
          <g clipPath={`url(#${id}-body)`}>
            <path d="M60 836Q400 950 760 812V1010H60Z" fill={C.shade} />
            <ellipse cx="300" cy="636" rx="190" ry="50" fill={C.light} opacity=".8" />
          </g>
          <path d="M140 806q16 -18 34 -2M258 884q16 -18 34 -2M612 850q16 -16 32 -2M440 904q14 -14 30 -2" fill="none" stroke={C.shade} strokeWidth="7" strokeLinecap="round" opacity=".8" />
          <path d="M130 716q14 -14 30 -2" fill="none" stroke={C.light} strokeWidth="7" strokeLinecap="round" />

          {/* Her woven blanket (sways a little on hops) with a pom-pom fringe. */}
          {C.blanket && (
            <g ref={part('fringe')}>
              <g transform="translate(18.6 -16.5) scale(0.95 0.93)">
              {[196, 262, 328, 394, 460, 520].map((x, i) => (
                <g key={x}>
                  <path d={`M${x} ${886 + [6, 14, 18, 18, 12, 4][i]}v26`} stroke="#D8367F" strokeWidth="6" strokeLinecap="round" />
                  <circle cx={x} cy={922 + [6, 14, 18, 18, 12, 4][i]} r="19" fill={['#FFC83D', '#B9A6F5', '#3FC1CF', '#FFC83D', '#B9A6F5', '#3FC1CF'][i]} />
                  <circle cx={x - 6} cy={916 + [6, 14, 18, 18, 12, 4][i]} r="6" fill="#fff" opacity=".4" />
                </g>
              ))}
              <path d={BLANKET} fill="#FF4F9A" />
              <g clipPath={`url(#${id}-blanket)`}>
                <path d="M150 700Q350 640 560 668V742Q350 716 150 772Z" fill="#FF8FC0" />
                <path d="M150 772Q350 716 560 742V776Q350 750 150 806Z" fill="#FFC83D" />
                <path d="M186 770l30 -34 30 26 30 -32 30 26 30 -30 30 26 30 -28 30 28 30 -24 30 30 30 -22" fill="none" stroke="#FFF5E6" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
                {[210, 276, 342, 408, 474].map((x, i) => (
                  <path key={x} d={`M${x} ${836 + [0, 6, 8, 6, 0][i]}l24 -26 24 26 -24 26Z`} fill={i % 2 ? '#B9A6F5' : '#3FC1CF'} />
                ))}
                <path d="M150 884Q350 916 560 880V930H150Z" fill="#D8367F" />
              </g>
              </g>
            </g>
          )}

          {/* Neck and head swing together (munching); the head turns on the neck. */}
          <g ref={part('neck')}>
            <path d={NECK} fill={C.wool} />
            <g clipPath={`url(#${id}-neck)`}>
              <ellipse cx="612" cy="480" rx="140" ry="50" fill={C.shade} opacity=".8" />
              <path d="M690 420Q740 620 680 820H780V420Z" fill={C.shade} opacity=".45" />
            </g>
            <path d="M540 578q14 -16 32 -2M606 650q14 -16 32 -2M548 716q14 -14 30 -2" fill="none" stroke={C.shade} strokeWidth="7" strokeLinecap="round" opacity=".8" />
            <g ref={part('head')}>
              <g transform={head}>
                <g ref={part('earL')}>
                  <path d="M470 222Q414 124 448 22Q522 66 536 196Z" fill={C.wool} />
                  <path d="M478 190Q446 124 460 66Q504 100 512 184Z" fill={C.earIn} />
                  <g ref={part('tasselL')}>{tassel(PIVOT.tasselL[0], PIVOT.tasselL[1])}</g>
                </g>
                <g ref={part('earR')}>
                  <path d="M750 222Q806 124 772 22Q698 66 684 196Z" fill={C.wool} />
                  <path d="M742 190Q774 124 760 66Q716 100 708 184Z" fill={C.earIn} />
                  <g ref={part('tasselR')}>{tassel(PIVOT.tasselR[0], PIVOT.tasselR[1])}</g>
                </g>
                <path d={HEAD} fill={C.wool} />
                <g clipPath={`url(#${id}-head)`}>
                  <path d="M700 120Q830 300 690 480H820V120Z" fill={C.shade} opacity=".5" />
                </g>
                <path d={FACE} fill={C.face} />
                <ellipse cx="610" cy="392" rx="84" ry="60" fill={C.muzzle} />
                <ellipse cx="500" cy="378" rx="27" ry="17" fill="#FF8FB8" opacity=".7" />
                <ellipse cx="720" cy="378" rx="27" ry="17" fill="#FF8FB8" opacity=".7" />
                <g ref={part('eyesOpen')}>
                  <path d="M514 292L498 280M522 282L510 266M706 292L722 280M698 282L710 266" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
                  <ellipse cx="540" cy={EYE_Y} rx="27" ry="33" fill={INK} />
                  <ellipse cx="680" cy={EYE_Y} rx="27" ry="33" fill={INK} />
                  <g ref={part('pupils')} fill="#fff">
                    <circle cx="531" cy="299" r="11" />
                    <circle cx="671" cy="299" r="11" />
                    <circle cx="550" cy="326" r="5" />
                    <circle cx="690" cy="326" r="5" />
                  </g>
                </g>
                <g ref={part('eyesShut')} display="none" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round">
                  <path d="M514 320Q540 292 566 320" />
                  <path d="M654 320Q680 292 706 320" />
                </g>
                {/* A wink: the right eye closes in a happy arc (drawn over the open eye). */}
                <g ref={part('wink')} display="none">
                  <ellipse cx="680" cy={EYE_Y} rx="36" ry="42" fill={C.face} />
                  <path d="M654 320Q680 292 706 320" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
                </g>
                {/* Nose, and the little split lip every llama has. */}
                <path d="M590 362Q610 352 630 362Q630 376 610 386Q590 376 590 362Z" fill={C.hoof} />
                <g ref={part('chew')}>
                  <path ref={part('mouth')} d={mouthPath(0, 0)} fill="#7A2745" />
                  <path d="M610 386V398M610 398Q594 414 576 402M610 398Q626 414 644 402" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path ref={part('teeth')} display="none" d="M584 405H636V420Q610 427 584 420Z" fill="#fff" />
                  <path ref={part('tongue')} display="none" d="M594 418Q592 462 610 466Q628 462 626 418Z" fill="#FF6F9F" />
                  <g ref={part('grass')} display="none">
                    <path d="M626 410L676 386L660 408L690 406L632 422Z" fill="#48A96C" />
                    <path d="M628 414L668 420L640 428Z" fill="#73CF86" />
                  </g>
                </g>
                {/* The fluffy topknot. */}
                <path d={TOPKNOT} fill={C.light} />
                {!C.baby && <path d="M566 214Q574 176 612 170" fill="none" stroke={C.wool} strokeWidth="8" strokeLinecap="round" />}
                <path d="M628 206Q646 190 664 196" fill="none" stroke={C.wool} strokeWidth="8" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
})

/** Tika herself: the caramel llama with the pink blanket, in her own voice. */
export const Tika = forwardRef<PuppetHandle, TikaProps>(function Tika(props, ref) {
  return <Llama ref={ref} label="Tika" {...props} coat={LLAMA_COATS.tika} voice="tika" />
})

/** Her mouth, under the split lip; opens downward (0 closed .. 1 wide). `dx` shifts it for chewing. */
export function mouthPath(open: number, dx: number) {
  const x = (v: number) => (v + dx).toFixed(1)
  const o = Math.max(0, open - 0.04)
  const w = 22 + o * 16
  return `M${x(610 - w)} 404Q${x(610)} ${(408 + o * 4).toFixed(1)} ${x(610 + w)} 404Q${x(610 + w)} ${(408 + o * 52).toFixed(1)} ${x(610)} ${(410 + o * 60).toFixed(1)}Q${x(610 - w)} ${(408 + o * 52).toFixed(1)} ${x(610 - w)} 404Z`
}
