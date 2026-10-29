// An emperor penguin dad (Papa, and the other dads in the huddle): a layered SVG puppet drawn to match the 3D toy
// (characters/looks.ts `papa`, #/world/characters/papa). A tall round black back and head, a white tummy with a pale
// gold blush up top, the gold patches beside his face, a slim black beak with a peach stripe, short dark feet. Seen
// from the side, a little turned toward her (three-quarter), facing right, so the huddle can turn his back to the wind
// by mirroring him. Breathes, blinks, watches her finger, opens his beak with Papa's voice, and can hop, sing, flap,
// waddle and shake. `cold` makes him bluer, droopy-eyed and shivery; `snow` piles snow on his head and back; an `egg`
// sits on his feet under the tummy flap.
//
// The huddle draws seven of these inside its own SVG (`embed`) and moves each one about; what it knows every frame (how
// cold, how snowy, lifted, the egg) it writes into `live`, which the puppet reads every frame.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, smooth, span, speechLevel, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from '../../../kit/ink'
import { BLUSH, C, Eye, INK, MOUTH, updateEyes, type EyeKind, type EyePart } from './face'

/** What the huddle tells a dad every frame (all 0..1 unless said). */
export interface EmperorLive {
  cold: number
  snow: number
  /** Lifted off the ice by her finger: feet paddle, flippers out. */
  lift: number
  /** Extra flipper swing from the huddle's own moves (degrees, negative = out from the body). */
  flip: number
  /** Beak open (his song, a sneeze). */
  beak: number
  /** The egg on his feet: 0 none, 1 a cream egg, 2 Pebble's (pink). */
  egg: number
  /** How cracked Pebble's egg is (0, 1, 2) and how much it wobbles (degrees). */
  crack: number
  wob: number
  /** He talks in Papa's voice (only Pebble's papa). */
  speaks: boolean
}

export const emperorLive = (): EmperorLive => ({ cold: 0, snow: 0, lift: 0, flip: 0, beak: 0, egg: 0, crack: 0, wob: 0, speaks: false })

export interface EmperorProps {
  height?: string
  style?: CSSProperties
  /** 0 = warm (pink cheeks), 1 = freezing. Overridden by `live`. */
  cold?: number
  snow?: number
  egg?: number
  /** Drawn inside another SVG: feet at (0, 0), about 225 units tall, facing right. */
  embed?: boolean
  live?: EmperorLive
}

const BACK = C.emperorBack
const BACK_COLD = '#5B6E9E'
const BELLY = '#FFFFFF'
const BELLY_COLD = '#CFE0F6'
const GOLD = C.emperorGold
const CHEST = '#FFE7A3'
const BEAK = C.beakBlack
const STRIPE = '#FF9E7A'
const FEET = '#4A4458'
const RIM = '#E8ECF8'
const SNOW = '#F7FAFE'
const EGG = '#FFF3DA'
const EGG_PINK = '#FFE0EC'
const inkPass = () => inkPassIn(undefined, INK)
const line = (width?: number) => lineIn(width, INK)

// The back and head as one dark shape: a tall egg of a body with a round head on top, leaning a little forward.
const BODY = 'M236 128 C330 124 366 220 368 316 C370 410 330 478 250 482 C168 486 122 420 120 330 C118 236 150 132 236 128Z'
const HEAD = 'M286 44 C346 44 382 86 382 136 C382 186 344 214 290 214 C232 214 198 182 198 132 C198 82 232 44 286 44Z'
const TAIL = 'M150 430 C128 448 104 470 96 486 C122 488 150 478 170 462Z'
// The white tummy, toward her (the three-quarter turn), and the gold blush where it meets the neck.
const TUMMY = 'M300 206 C350 226 362 300 358 362 C354 430 318 470 268 474 C222 476 196 430 196 360 C196 290 226 214 300 206Z'
// The pale gold blush where the tummy meets the neck.
const BLUSHCHEST = 'M262 262 C268 226 288 208 304 208 C330 212 350 236 354 262 C326 252 290 252 262 262Z'
// The gold patch behind the eye, curling down the side of the neck.
const PATCH = 'M236 122 C262 118 270 150 262 180 C256 204 240 222 222 234 C218 210 212 186 214 160 C216 138 222 124 236 122Z'
const FLIPPER = 'M-18 -6 C-22 -28 22 -28 20 -6 C24 50 16 112 -4 150 C-18 118 -24 56 -18 -6Z'
const BEAK_TOP = 'M366 118 C392 116 424 124 446 138 C420 140 392 140 368 140Z'
const BEAK_LOW = 'M368 140 C392 140 418 140 444 140 C420 150 392 154 370 152Z'
// The flap of tummy that tucks over the egg (the brood pouch).
const FLAP = 'M240 452 C262 438 304 438 326 452 C318 462 300 466 284 466 C264 466 248 462 240 452Z'

// Snow in soft lumps along his back and on his head, like snow that has piled up (x, y, r around the pile's middle).
const SNOW_CAP: [number, number, number][] = [[-38, 6, 20], [-10, -6, 25], [20, -4, 22], [44, 8, 15]]
const SNOW_BACK: [number, number, number][] = [[38, -80, 22], [12, -52, 26], [-8, -16, 26], [-20, 22, 24], [-24, 60, 19]]
/** One outline round the lumps: the ink copy underneath, the snow on top. */
const lumps = (list: [number, number, number][]) => (
  <>
    {list.map(([x, y, r], i) => (
      <circle key={`i${i}`} cx={x} cy={y} r={r + 3} fill={INK} />
    ))}
    {list.map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill={SNOW} />
    ))}
    {list.map(([x, y, r], i) => (
      <circle key={`s${i}`} cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.22} fill="#fff" />
    ))}
  </>
)

type Part =
  | 'root' | 'head' | 'flip' | 'feetL' | 'feetR' | 'beakLow' | 'mouth' | 'blush' | 'back' | 'headFill' | 'tummy'
  | 'snowCap' | 'snowBack' | 'egg' | 'eggWob' | 'shell' | 'crack1' | 'crack2' | 'tail' | EyePart

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
function mix(a: string, b: string, t: number) {
  const x = hex(a)
  const y = hex(b)
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`
}

/** An emperor penguin dad. Actions: hop, sing, flap, waddle, shake. Voice: papa. */
export const Emperor = forwardRef<PuppetHandle, EmperorProps>(function Emperor({ height = '100%', style, cold = 0, snow = 0, egg = 0, embed = false, live }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ cold: 0, snow: 0, headRot: 0, flip: spring(150, 8), head: spring(120, 9), mouth: 0, coldKey: -1 }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: embed ? undefined : 'papa',
    actions: { hop: 0.8, sing: 1.2, flap: 1.1, waddle: 1.6, shake: 0.8 },
    eyes: [304, 120],
    reach: [400, 140],
    frame: (f, p) => {
      const { t, dt, look } = f
      const L = live
      st.cold += ((L ? L.cold : cold) - st.cold) * Math.min(1, dt * 3)
      st.snow += ((L ? L.snow : snow) - st.snow) * Math.min(1, dt * 6)
      const k = st.cold
      const q = f.p
      const act = f.action
      const lift = L ? L.lift : 0

      const breath = Math.sin(t * 2.4)
      let sx = 1 - breath * 0.008
      let sy = 1 + breath * 0.014
      let rootY = 0
      let rootX = 0
      let rootRot = 0
      let headRot = Math.sin(t * 1.1) * 2.5 + look.y * 4
      let flip = lerp(-6, 2, k) + (L ? L.flip : 0) - lift * 34
      const eye: EyeKind = 'open'
      // His own voice (Papa), or the huddle's song.
      const level = L ? (L.speaks ? speechLevel('papa') : 0) : f.mouth
      st.mouth += (level - st.mouth) * Math.min(1, dt * (level > st.mouth ? 30 : 14))
      let mouth = Math.max(st.mouth < 0.04 ? 0 : st.mouth, L ? L.beak : 0)
      let feet = 0

      // Standing alone in the cold (the puppet lab): a shiver. In the huddle the huddle shakes him itself.
      if (!L && k > 0.02) {
        rootX += Math.sin(t * 50) * 2.4 * k
        rootRot += Math.sin(t * 43) * 1.2 * k
      }
      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))
      if (act === 'hop') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.2, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx *= 1 + crouch * 0.1 - air * 0.05 + land * 0.08
        sy *= 1 - crouch * 0.12 + air * 0.08 - land * 0.1
        rootY -= air * 60
        flip -= air * 50
      } else if (act === 'sing') {
        // Head up, beak to the sky, his own call.
        headRot -= 22 * env
        mouth = Math.max(mouth, (0.55 + 0.35 * Math.sin(q * Math.PI * 8)) * env)
        sy *= 1 + 0.05 * env
        flip -= 20 * env
      } else if (act === 'flap') {
        flip -= (50 + Math.sin(q * Math.PI * 12) * 30) * env
        rootY -= Math.abs(Math.sin(q * Math.PI * 6)) * 8 * env
      } else if (act === 'waddle') {
        const w = Math.sin(q * Math.PI * 6)
        rootRot += w * 7 * env
        rootX += w * 8 * env
        flip -= (24 + w * 10) * env
        feet = w * env
      } else if (act === 'shake') {
        rootRot += Math.sin(q * Math.PI * 14) * 9 * (1 - q)
        headRot += Math.sin(q * Math.PI * 14 + 1) * 10 * (1 - q)
      }
      if (lift > 0.05) feet = Math.sin(t * 18) * lift

      // The flipper and the head lag behind the moves and flop when he lands.
      const fl = st.flip.step(flip, dt)
      const vel = (headRot - st.headRot) / Math.max(dt, 0.001)
      st.headRot = headRot
      const hr = headRot + st.head.step(clamp(-vel * 0.02, -6, 6) + rootY * 0.04, dt)

      setT(p.root, `translate(${rootX} ${rootY}) rotate(${rootRot} 250 482) translate(250 482) scale(${sx} ${sy}) translate(-250 -482)`)
      setT(p.head, `rotate(${hr} 270 210)`)
      setT(p.flip, `translate(176 236) rotate(${fl})`)
      setT(p.feetL, `translate(0 ${-Math.max(0, feet) * 18})`)
      setT(p.feetR, `translate(0 ${-Math.max(0, -feet) * 18})`)
      // Cold: the back goes bluer and the tummy icy (only rewritten when it changes enough to see).
      const ck = Math.round(k * 40)
      if (ck !== st.coldKey) {
        st.coldKey = ck
        const back = mix(BACK, BACK_COLD, k)
        for (const el of [p.back, p.headFill, p.tail, p.flip]) (el as SVGElement | undefined)?.setAttribute('fill', back)
        ;(p.tummy as SVGElement | undefined)?.setAttribute('fill', mix(BELLY, BELLY_COLD, k))
      }
      const warm = clamp((0.25 - k) / 0.25)
      setT(p.blush, `translate(318 160) scale(${0.3 + 0.7 * warm})`)
      ;(p.blush as SVGElement).style.opacity = String(warm * 0.9)
      // Droopy eyes when he's frozen, a blink now and then.
      updateEyes(p, eye, Math.max(1 - f.blink, 0.45 * clamp((k - 0.4) / 0.6)), look, 18, 22)
      const m = clamp(mouth)
      setT(p.beakLow, `rotate(${m * 18} 368 140)`)
      setA(p.mouth, 'ry', 1 + m * 9)
      // Snow piling up on his head and back (he turns his back to the wind).
      const s = st.snow
      setT(p.snowCap, `translate(284 46) scale(${(clamp(s * 1.4 - 0.2) * 1.05).toFixed(3)})`)
      setT(p.snowBack, `translate(150 230) scale(${(s * 1.1).toFixed(3)})`)
      // The egg on his feet.
      const eggN = L ? L.egg : egg
      ;(p.egg as SVGElement).style.display = eggN ? '' : 'none'
      ;(p.shell as SVGElement | undefined)?.setAttribute('fill', eggN === 2 ? EGG_PINK : EGG)
      setT(p.eggWob, `rotate(${L ? L.wob : 0} 290 486)`)
      ;(p.crack1 as SVGElement).style.display = L && L.crack >= 1 ? '' : 'none'
      ;(p.crack2 as SVGElement).style.display = L && L.crack >= 2 ? '' : 'none'
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const flipper = (pass: boolean) => (
    <g ref={r('flip', pass)} transform="translate(176 236) rotate(-6)" fill={pass ? undefined : BACK}>
      <path d={FLIPPER} />
    </g>
  )

  const feet = (pass: boolean) => (
    <>
      <ellipse ref={r('feetL', pass)} cx="236" cy="482" rx="34" ry="11" fill={FEET} />
      <ellipse ref={r('feetR', pass)} cx="308" cy="484" rx="36" ry="12" fill={FEET} />
    </>
  )

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <path ref={pass ? undefined : part('headFill')} d={HEAD} fill={BACK} />
      <path d={BEAK_TOP} fill={BEAK} />
      <g ref={r('beakLow', pass)}>
        <path d={BEAK_LOW} fill={BEAK} />
      </g>
      {!pass && (
        <>
          <path d={PATCH} fill={GOLD} />
          <ellipse ref={part('mouth')} cx="380" cy="142" rx="16" ry="1" fill={MOUTH} />
          <path d="M376 146 C396 146 418 144 436 141" {...line(2)} stroke={STRIPE} strokeWidth="4" />
          {/* White rims, so the shiny eyes show on the black head. */}
          <ellipse cx="304" cy="120" rx="21" ry="25" fill={RIM} />
          <ellipse cx="352" cy="116" rx="14" ry="20" fill={RIM} />
          <Eye id={id} side="L" x={304} y={120} skin={BACK} part={part} rx={18} ry={22} />
          <Eye id={id} side="R" x={352} y={116} skin={BACK} part={part} rx={11} ry={17} />
          <ellipse ref={part('blush')} rx="16" ry="9" fill={BLUSH} transform="translate(318 160)" />
          <ellipse cx="384" cy="124" rx="7" ry="3" fill="#fff" opacity="0.3" />
        </>
      )}
    </g>
  )

  const body = (
    <g ref={part('root')} strokeLinejoin="round">
      <g {...inkPass()}>
        <path d={TAIL} />
        {feet(true)}
        <path d={BODY} />
        {flipper(true)}
        {head(true)}
      </g>
      <path ref={part('tail')} d={TAIL} fill={BACK} />
      {feet(false)}
      <path ref={part('back')} d={BODY} fill={BACK} />
      <path ref={part('tummy')} d={TUMMY} fill={BELLY} />
      <path d={BLUSHCHEST} fill={CHEST} />
      {/* The egg on his feet, the tummy flap tucked over its top. */}
      <g ref={part('egg')} style={{ display: 'none' }}>
        <g ref={part('eggWob')}>
          <ellipse ref={part('shell')} cx="290" cy="458" rx="32" ry="30" fill={EGG} stroke={INK} strokeWidth="6" />
          <path ref={part('crack1')} d="M268 456 l10 7 l9 -10 l11 9 l12 -6" {...line(4)} style={{ display: 'none' }} />
          <path ref={part('crack2')} d="M272 470 l12 -5 l7 8 l14 -7" {...line(4)} style={{ display: 'none' }} />
        </g>
        <path d={FLAP} fill={BELLY} stroke={INK} strokeWidth="5" />
      </g>
      <path d="M232 300 Q238 312 248 304 M226 360 Q232 372 242 364" {...line(2.6)} opacity="0.35" />
      {flipper(false)}
      {head(false)}
      {/* Snow on his head and back. */}
      <g ref={part('snowCap')} transform="translate(284 46) scale(0)">
        {lumps(SNOW_CAP)}
      </g>
      <g ref={part('snowBack')} transform="translate(150 230) scale(0)">
        {lumps(SNOW_BACK)}
      </g>
    </g>
  )

  if (embed) return <g ref={svg}>{<g transform="scale(0.47) translate(-250 -488)">{body}</g>}</g>
  return (
    <svg ref={svg} viewBox="0 0 500 500" aria-label="An emperor penguin dad" style={{ height, aspectRatio: '1 / 1', overflow: 'visible', display: 'block', ...style }}>
      {body}
    </svg>
  )
})
