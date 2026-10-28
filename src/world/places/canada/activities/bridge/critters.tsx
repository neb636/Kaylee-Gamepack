// Animal Bridge's herd as live 2D puppets: mama elk and her spotted calves, the bighorn rams with their curled horns,
// the ewe and the lamb, mama grizzly with her shoulder hump and her two cubs. Each is layered SVG in the flat style
// (5-unit ink outline, flat fills, blush, big eyes with a highlight), facing right with its feet at (0, 0), and its
// parts are separate groups the world moves every frame (poseCritter): two-part legs that swing and bend at the knee
// with every step, a body that bobs, a head that nods with the walk and lags behind it, ears and a tail on springs
// (they flop and settle), eyes that blink, and a mouth that opens with the mamas' voices and chews in the meadow. The
// little ones bound to catch up (both front legs, then both back legs, a squash on landing). Turning round squeezes
// through a narrow side-on frame instead of flipping in one frame. Plain SVG, no three.js.
import { spring } from '../../../../../sdk'
import { LOOKS, type Kind, type Pt } from './stage'

export const INK = '#4A3B57'
const BLUSH = '#F4A0B4'
const MOUTH = '#7A2745'
const W = 5

const BABY: Record<Kind, boolean> = { elk: false, calf: true, ram: false, ewe: false, lamb: true, grizzly: false, cub: true }

/** Where the head joins the neck, and the head's middle, for a kind (facing right, feet at 0). */
function frame(kind: Kind) {
  const L = LOOKS[kind]
  const cy = -(L.legs + L.ry * 0.7)
  const hipY = cy + L.ry * 0.35
  const hx = L.rx * 0.55
  const pivot: Pt = [L.rx * 0.6, cy - L.ry * 0.3]
  const head: Pt = [L.neck[0], cy + L.neck[1]]
  return { L, cy, hipY, hx, pivot, head }
}

/** One animal. `live` marks the parts the world moves (legs, knees, head, ears, tail, eyes, mouth, seeds). */
export function Critter({ kind, seeds, live, tint }: { kind: Kind; seeds?: boolean; live?: boolean; tint?: string }) {
  const { L, cy, hipY, hx, pivot, head } = frame(kind)
  const fill = tint ?? L.fill
  const dark = tint ? '#D8D2E2' : L.dark
  const bear = L.ears === 'round'
  const k = (name: string) => (live ? name : undefined)
  const H = L.head
  const [hcx, hcy] = head

  // A leg: the upper part swings at the hip, the lower part bends at the knee. Hooves for the deer and sheep, a big
  // round paw with claws for the bears.
  const leg = (x: number, far: boolean, n: number) => {
    const len = -hipY
    const knee = hipY + len * 0.5
    const w = L.legW
    const c = far ? dark : fill
    // Each part is a round-capped stroke over a wider ink one, the thigh drawn last so the knee is one smooth joint.
    const foot = bear ? -w * 0.3 : -w * 0.6
    return (
      <g key={n} data-leg={live ? n : undefined} data-px={x} data-py={hipY}>
        <path d={`M${x} ${hipY} L ${x} ${knee}`} stroke={INK} strokeWidth={w * 1.15 + W * 2 - 2} strokeLinecap="round" />
        <g data-knee={live ? '' : undefined} data-px={x} data-py={knee}>
          <path d={`M${x} ${knee} L ${x} ${foot}`} stroke={INK} strokeWidth={w * 0.85 + W * 2 - 2} strokeLinecap="round" />
          <path d={`M${x} ${knee} L ${x} ${foot}`} stroke={c} strokeWidth={w * 0.85} strokeLinecap="round" />
          {bear ? (
            <>
              <ellipse cx={x + w * 0.2} cy={-w * 0.32} rx={w * 0.72} ry={w * 0.42} fill={c} stroke={INK} strokeWidth={W - 1} />
              {[-0.1, 0.25, 0.6].map((d, i) => (
                <path key={i} d={`M${x + w * (0.3 + d)} ${-w * 0.12} l ${w * 0.18} ${w * 0.12}`} stroke="#FFF7F0" strokeWidth={2.5} strokeLinecap="round" />
              ))}
            </>
          ) : (
            <path d={`M${x - w * 0.5} ${-w * 0.7} L ${x + w * 0.5} ${-w * 0.7} L ${x + w * 0.62} 1 L ${x - w * 0.5} 1 Z`} fill={INK} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          )}
        </g>
        <path d={`M${x} ${hipY} L ${x} ${knee}`} stroke={c} strokeWidth={w * 1.15} strokeLinecap="round" />
      </g>
    )
  }

  // The tail, on a spring at the rump.
  const tailAt: Pt = [-L.rx * 0.92, cy - L.ry * 0.25]
  const tail = (
    <g data-k={k('tail')} data-px={tailAt[0]} data-py={tailAt[1]}>
      {bear ? (
        <circle cx={tailAt[0] - 4} cy={tailAt[1]} r={L.ry * 0.18} fill={fill} stroke={INK} strokeWidth={W - 1} />
      ) : (
        <ellipse cx={tailAt[0] - L.rx * 0.06} cy={tailAt[1] + L.ry * 0.18} rx={L.rx * 0.08} ry={L.ry * 0.32} fill={L.dark} stroke={INK} strokeWidth={W - 1} transform={`rotate(18 ${tailAt[0]} ${tailAt[1]})`} />
      )}
    </g>
  )

  // The body: a soft bean, a bit deeper at the chest than at the rump.
  const bx = L.rx
  const by = L.ry
  const body = `M${-bx} ${cy} C ${-bx} ${cy - by * 1.05}, ${bx * 0.55} ${cy - by * 1.15}, ${bx} ${cy - by * 0.25} C ${bx * 1.08} ${cy + by * 0.5}, ${bx * 0.55} ${cy + by * 1.05}, 0 ${cy + by} C ${-bx * 0.6} ${cy + by * 1.02}, ${-bx} ${cy + by * 0.7}, ${-bx} ${cy} Z`

  // An ear on its spring.
  const ear = (x: number, y: number, far: boolean, n: number) => {
    const c = far ? dark : fill
    if (bear)
      return (
        <g key={n} data-ear={live ? n : undefined} data-px={x} data-py={y}>
          <circle cx={x} cy={y - H * 0.12} r={H * 0.32} fill={c} stroke={INK} strokeWidth={W - 1} />
          {!far && <circle cx={x} cy={y - H * 0.1} r={H * 0.15} fill={L.light} />}
        </g>
      )
    if (L.ears === 'tall')
      return (
        <g key={n} data-ear={live ? n : undefined} data-px={x} data-py={y}>
          <g transform={`rotate(-38 ${x} ${y}) translate(${x * 0.25} ${y * 0.25}) scale(0.75)`}>
          <path d={`M${x - H * 0.22} ${y + H * 0.1} C ${x - H * 0.6} ${y - H * 0.6}, ${x - H * 0.55} ${y - H * 1.25}, ${x - H * 0.35} ${y - H * 1.35} C ${x - H * 0.05} ${y - H * 1.1}, ${x + H * 0.25} ${y - H * 0.5}, ${x + H * 0.22} ${y + H * 0.05} Z`} fill={c} stroke={INK} strokeWidth={W - 1} strokeLinejoin="round" />
          {!far && <path d={`M${x - H * 0.12} ${y - H * 0.05} C ${x - H * 0.38} ${y - H * 0.55}, ${x - H * 0.36} ${y - H * 0.95}, ${x - H * 0.3} ${y - H * 1.05} C ${x - H * 0.1} ${y - H * 0.8}, ${x + H * 0.06} ${y - H * 0.4}, ${x + H * 0.08} ${y - H * 0.02} Z`} fill="#F6C4C8" />}
          </g>
        </g>
      )
    // The sheep's ears stick out sideways.
    return (
      <g key={n} data-ear={live ? n : undefined} data-px={x} data-py={y}>
        <ellipse cx={x - H * 0.42} cy={y + H * 0.02} rx={H * 0.42} ry={H * 0.19} fill={c} stroke={INK} strokeWidth={W - 1} transform={`rotate(-14 ${x} ${y})`} />
      </g>
    )
  }

  const eyeR = Math.max(4, H * (BABY[kind] ? 0.24 : 0.19))
  const ex = hcx + H * 0.26
  const ey = hcy - H * 0.2
  const muzzle: Pt = bear ? [hcx + H * 0.82, hcy + H * 0.22] : [hcx + H * 0.86, hcy + H * 0.34]

  return (
    <g>
      {leg(-hx + 9, true, 0)}
      {leg(hx + 9, true, 1)}
      {tail}
      <path d={body} fill={fill} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
      {L.hump && <path d={`M${bx * 0.05} ${cy - by * 0.9} C ${bx * 0.2} ${cy - by * 1.45}, ${bx * 0.62} ${cy - by * 1.35}, ${bx * 0.78} ${cy - by * 0.7}`} fill={fill} stroke={INK} strokeWidth={W} strokeLinecap="round" />}
      {L.hump && <path d={`M${bx * 0.1} ${cy - by * 0.85} C ${bx * 0.24} ${cy - by * 1.3}, ${bx * 0.6} ${cy - by * 1.2}, ${bx * 0.72} ${cy - by * 0.68} Z`} fill={fill} />}
      {bear && <path d={`M${-bx * 0.5} ${cy - by * 0.55} q ${bx * 0.3} -${by * 0.25} ${bx * 0.55} -${by * 0.1}`} stroke={L.light} strokeWidth={5} fill="none" strokeLinecap="round" />}
      {L.rump && <path d={`M${-bx * 0.98} ${cy - by * 0.2} C ${-bx * 0.95} ${cy - by * 0.75}, ${-bx * 0.55} ${cy - by * 0.7}, ${-bx * 0.5} ${cy - by * 0.1} C ${-bx * 0.5} ${cy + by * 0.5}, ${-bx * 0.9} ${cy + by * 0.55}, ${-bx * 0.98} ${cy + by * 0.1} Z`} fill={L.light} />}
      {L.spots && [[-0.45, -0.35], [-0.12, -0.55], [0.22, -0.45], [-0.3, 0.0], [0.05, -0.12], [0.4, -0.1]].map(([sx, sy], i) => <ellipse key={i} cx={sx * bx} cy={cy + sy * by} rx={by * 0.15} ry={by * 0.11} fill={L.light} />)}
      {/* The belly, a lighter band underneath. */}
      {!bear && <path d={`M${-bx * 0.45} ${cy + by * 0.82} Q 0 ${cy + by * 1.12} ${bx * 0.5} ${cy + by * 0.78}`} stroke={L.light} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />}
      {seeds && (
        <g data-k={k('seeds')} visibility="hidden">
          <path d={`M${-bx * 0.1} ${cy - by * 0.92} q 10 -24 26 -18 q -8 16 -26 18 Z`} fill="#6CC05A" stroke={INK} strokeWidth={2.5} />
          <path d={`M${-bx * 0.32} ${cy - by * 0.9} q -14 -18 -26 -12 q 8 12 26 12 Z`} fill="#8AD06A" stroke={INK} strokeWidth={2.5} />
          {[-0.35, -0.05, 0.25].map((s, i) => (
            <circle key={i} cx={s * bx} cy={cy - by * 0.88 + (i % 2) * 4} r={5.5} fill="#E0B44A" stroke={INK} strokeWidth={2} />
          ))}
        </g>
      )}
      {leg(-hx - 4, false, 2)}
      {leg(hx - 4, false, 3)}
      <g data-k={k('head')} data-px={pivot[0]} data-py={pivot[1]}>
        {/* The neck (the elk's has a dark shaggy mane), drawn as a thick round stroke over an ink one. */}
        {!bear && (
          <>
            <path d={`M${pivot[0] - L.rx * 0.12} ${pivot[1] + L.ry * 0.25} L ${hcx - H * 0.25} ${hcy}`} stroke={INK} strokeWidth={H * 1.15 + W * 2} strokeLinecap="round" />
            <path d={`M${pivot[0] - L.rx * 0.12} ${pivot[1] + L.ry * 0.25} L ${hcx - H * 0.25} ${hcy}`} stroke={kind === 'elk' ? L.dark : fill} strokeWidth={H * 1.15} strokeLinecap="round" />
            {kind === 'elk' && <path d={`M${pivot[0]} ${pivot[1] + L.ry * 0.45} l -6 12 l 9 -4 l 1 12 l 7 -10 l 5 10 l 2 -14`} fill={L.dark} stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
          </>
        )}
        {ear(hcx - H * 0.38, hcy - H * 0.62, true, 0)}
        {L.horns && <path d={`M${hcx - H * 0.05} ${hcy - H * 0.8} C ${hcx - H * 0.95} ${hcy - H * 1.7}, ${hcx - H * 2.0} ${hcy - H * 0.35}, ${hcx - H * 1.1} ${hcy + H * 0.55} C ${hcx - H * 0.55} ${hcy + H * 0.95}, ${hcx - H * 0.12} ${hcy + H * 0.35}, ${hcx - H * 0.55} ${hcy + H * 0.1}`} fill="none" stroke={INK} strokeWidth={H * 0.5 + W * 2} strokeLinecap="round" />}
        {L.horns && <path d={`M${hcx - H * 0.05} ${hcy - H * 0.8} C ${hcx - H * 0.95} ${hcy - H * 1.7}, ${hcx - H * 2.0} ${hcy - H * 0.35}, ${hcx - H * 1.1} ${hcy + H * 0.55} C ${hcx - H * 0.55} ${hcy + H * 0.95}, ${hcx - H * 0.12} ${hcy + H * 0.35}, ${hcx - H * 0.55} ${hcy + H * 0.1}`} fill="none" stroke="#D9C29A" strokeWidth={H * 0.5} strokeLinecap="round" />}
        {L.horns && [0.25, 0.5, 0.72].map((t, i) => <circle key={i} cx={hcx - H * (0.3 + t * 1.2)} cy={hcy - H * (1.0 - t * 1.2)} r={2.4} fill="#B89C70" />)}
        {/* The head. */}
        {L.ears === 'tall' ? (
          <path d={`M${hcx - H * 0.9} ${hcy - H * 0.2} C ${hcx - H * 0.9} ${hcy - H * 0.95}, ${hcx + H * 0.2} ${hcy - H * 0.9}, ${hcx + H * 0.7} ${hcy - H * 0.1} C ${hcx + H * 1.25} ${hcy + H * 0.2}, ${hcx + H * 1.3} ${hcy + H * 0.75}, ${hcx + H * 0.75} ${hcy + H * 0.78} C ${hcx + H * 0.2} ${hcy + H * 0.82}, ${hcx - H * 0.9} ${hcy + H * 0.6}, ${hcx - H * 0.9} ${hcy - H * 0.2} Z`} fill={fill} stroke={INK} strokeWidth={W - 1} strokeLinejoin="round" />
        ) : bear ? (
          <circle cx={hcx} cy={hcy} r={H} fill={fill} stroke={INK} strokeWidth={W - 1} />
        ) : (
          <path d={`M${hcx - H * 0.85} ${hcy - H * 0.1} C ${hcx - H * 0.85} ${hcy - H * 0.95}, ${hcx + H * 0.5} ${hcy - H * 0.95}, ${hcx + H * 0.95} ${hcy - H * 0.05} C ${hcx + H * 1.25} ${hcy + H * 0.55}, ${hcx + H * 0.85} ${hcy + H * 0.9}, ${hcx + H * 0.3} ${hcy + H * 0.85} C ${hcx - H * 0.4} ${hcy + H * 0.8}, ${hcx - H * 0.85} ${hcy + H * 0.6}, ${hcx - H * 0.85} ${hcy - H * 0.1} Z`} fill={L.dark} stroke={INK} strokeWidth={W - 1} strokeLinejoin="round" />
        )}
        {L.ears === 'side' && <path d={`M${hcx - H * 0.05} ${hcy - H * 0.82} L ${hcx - H * 0.3} ${hcy - H * (L.horns ? 0.82 : 1.25)} L ${hcx + H * 0.22} ${hcy - H * 0.8} Z`} fill="#D9C29A" stroke={INK} strokeWidth={3} strokeLinejoin="round" visibility={kind === 'ewe' ? 'visible' : 'hidden'} />}
        {/* The muzzle (white for the sheep), the nose and the mouth. */}
        <ellipse cx={muzzle[0]} cy={muzzle[1]} rx={H * (bear ? 0.55 : 0.48)} ry={H * (bear ? 0.42 : 0.4)} fill={L.ears === 'side' ? '#FFF7F0' : L.light} stroke={INK} strokeWidth={W - 1.5} />
        <ellipse data-k={k('mouth')} cx={muzzle[0] - H * 0.08} cy={muzzle[1] + H * 0.26} rx={H * 0.22} ry={1.5} fill={MOUTH} stroke={INK} strokeWidth={2} />
        <ellipse cx={muzzle[0] + H * (bear ? 0.38 : 0.3)} cy={muzzle[1] - H * (bear ? 0.2 : 0.12)} rx={H * 0.19} ry={H * 0.14} fill={INK} />
        {ear(hcx - H * 0.12, hcy - H * 0.7, false, 1)}
        <circle cx={hcx + H * 0.25} cy={hcy + H * 0.32} r={H * 0.2} fill={BLUSH} opacity={0.7} />
        <g data-k={k('eye')} data-px={ex} data-py={ey}>
          <ellipse cx={ex} cy={ey} rx={eyeR * 0.9} ry={eyeR} fill={INK} />
          <circle cx={ex + eyeR * 0.3} cy={ey - eyeR * 0.38} r={Math.max(1.5, eyeR * 0.36)} fill="#FFFFFF" />
        </g>
      </g>
    </g>
  )
}

// ---------------------------------------------------------------- moving the parts

interface Joint {
  el: SVGGElement
  px: number
  py: number
}
export interface CritterEls {
  root: SVGGElement
  pose: SVGGElement
  head: Joint | null
  legs: (Joint & { knee: Joint | null })[]
  ears: Joint[]
  tail: Joint | null
  eye: Joint | null
  mouth: SVGEllipseElement | null
  seeds: SVGGElement | null
}
const joint = (el: SVGGElement | null): Joint | null => (el ? { el, px: +(el.dataset.px ?? 0), py: +(el.dataset.py ?? 0) } : null)

export function collect(root: SVGGElement): CritterEls {
  return {
    root,
    pose: root.querySelector<SVGGElement>('[data-k="pose"]')!,
    head: joint(root.querySelector<SVGGElement>('[data-k="head"]')),
    legs: [...root.querySelectorAll<SVGGElement>('[data-leg]')].map((el) => ({ ...joint(el)!, knee: joint(el.querySelector<SVGGElement>('[data-knee]')) })),
    ears: [...root.querySelectorAll<SVGGElement>('[data-ear]')].map((el) => joint(el)!),
    tail: joint(root.querySelector<SVGGElement>('[data-k="tail"]')),
    eye: joint(root.querySelector<SVGGElement>('[data-k="eye"]')),
    mouth: root.querySelector<SVGEllipseElement>('[data-k="mouth"]'),
    seeds: root.querySelector<SVGGElement>('[data-k="seeds"]'),
  }
}

/** Each animal's springs and timers (ears and tail flop behind the body, the head lags the walk, blinks). */
export class CritterLife {
  face = 1
  ear = spring(120, 7)
  tail = spring(90, 6)
  head = spring(80, 9)
  lastBob = 0
  blinkAt: number
  constructor(seed: number) {
    this.blinkAt = 1 + (seed % 7) * 0.6
  }
}

export interface PoseIn {
  kind: Kind
  x: number
  y: number
  scale: number
  dir: 1 | -1
  walk: number
  speed: number
  rocky: number
  sheep: boolean
  now: number
  dt: number
  /** An action: its kind and progress 0..1. */
  act: 'hop' | 'shake' | 'sniff' | 'munch' | 'sit' | 'bonk' | 'cheer' | null
  p: number
  /** Extra x for the bonk's charge, and the bonk's head angle. */
  dx: number
  bonkHead: number | null
  /** 0..1: how loud the voice is (the mamas talk), or 0. */
  mouth: number
  /** Seeds on its back. */
  seeds: boolean
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const bell = (p: number) => (p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI))
/** Writes an SVG attribute only when it changes. */
const written = new WeakMap<Element, Record<string, string>>()
export function put(el: Element | null | undefined, name: string, value: string) {
  if (!el) return
  let w = written.get(el)
  if (!w) written.set(el, (w = {}))
  if (w[name] === value) return
  w[name] = value
  el.setAttribute(name, value)
}
const rot = (a: number, j: Joint) => `rotate(${a.toFixed(1)} ${j.px} ${j.py})`

export function poseCritter(e: CritterEls, life: CritterLife, s: PoseIn) {
  const L = LOOKS[s.kind]
  const { act, p, dt, now } = s
  const baby = BABY[s.kind]
  // Turning round: squeeze through side-on instead of flipping in one frame.
  life.face += (s.dir - life.face) * Math.min(1, dt * 11)
  const face = Math.abs(life.face) < 0.18 ? Math.sign(life.face || s.dir) * 0.18 : life.face

  const go = clamp(s.speed / 60, 0, 1)
  // The little ones bound when they're running to catch up.
  const bound = baby ? clamp((s.speed - 230) / 160, 0, 1) : 0
  const stride = L.rx * 0.55
  const ph = s.walk / stride
  let bob = -Math.abs(Math.sin(ph)) * 3.5 * go * (1 - bound)
  const bph = s.walk / (L.rx * 1.1)
  const air = Math.abs(Math.sin(bph))
  bob -= air * L.legs * 0.45 * bound
  bob -= Math.abs(Math.sin(s.walk / 38)) * (s.sheep ? 22 : 7) * s.rocky * go
  let sx = 1
  let sy = 1
  // Landing from a bound: a squash.
  if (bound > 0 && air < 0.25) {
    sx += 0.08 * bound * (1 - air * 4)
    sy -= 0.1 * bound * (1 - air * 4)
  }
  // Breathing when standing.
  const breath = Math.sin(now * 2.2 + s.x * 0.01) * (1 - go)
  sy += breath * 0.012
  let headA = Math.sin(ph * 2) * 4 * go * (1 - bound)
  let tilt = 0
  let lower = 0
  let sitting = 0
  if (act === 'hop' || act === 'cheer') {
    // Crouch, up, land with a squash.
    const crouch = bell(clamp(p / 0.22, 0, 1))
    const up = bell(clamp((p - 0.18) / 0.6, 0, 1))
    const land = bell(clamp((p - 0.78) / 0.22, 0, 1))
    bob -= up * (act === 'cheer' ? 30 : 40)
    sx *= 1 + crouch * 0.12 - up * 0.06 + land * 0.1
    sy *= 1 - crouch * 0.14 + up * 0.08 - land * 0.12
    headA -= up * 12
  } else if (act === 'sit') {
    sitting = Math.min(1, p * 5, (1 - p) * 5)
    lower = L.legs * 0.35 * sitting
    tilt = -10 * sitting
  } else if (act === 'shake') headA = Math.sin(p * Math.PI * 6) * 20 * (1 - p)
  else if (act === 'sniff') headA = -18 + Math.sin(p * Math.PI * 10) * 6
  else if (act === 'munch') headA = 38 * Math.min(1, p * 6, (1 - p) * 6) + Math.sin(now * 12) * 3 * (p > 0.15 && p < 0.85 ? 1 : 0)
  if (s.bonkHead !== null) headA = s.bonkHead
  // The head lags the bob a little (follow-through), then settles.
  const bobV = (bob - life.lastBob) / Math.max(dt, 1e-3)
  life.lastBob = bob
  const lag = life.head.step(clamp(-bobV * 0.02, -8, 8), dt)
  headA += lag
  // Ears and tail flop with the bob, and the tail flicks now and then.
  const ear = life.ear.step(clamp(bobV * 0.06, -30, 30) + (act === 'shake' ? Math.sin(p * 30) * 20 : 0), dt)
  const flick = Math.sin(now * 1.3 + s.x) > 0.96 ? 25 : 0
  const tail = life.tail.step(clamp(bobV * 0.08, -35, 35) + flick + go * 8, dt)

  put(e.root, 'transform', `translate(${(s.x + s.dx).toFixed(1)} ${s.y.toFixed(1)}) scale(${(face * s.scale).toFixed(3)} ${s.scale.toFixed(3)})`)
  put(e.pose, 'transform', `translate(0 ${(bob + lower).toFixed(1)}) rotate(${tilt.toFixed(1)} ${-L.rx * 0.6} 0) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`)
  if (e.head) put(e.head.el, 'transform', rot(headA, e.head))
  // Legs: a trot when walking (diagonal pairs), a bound when the little ones run (front pair, then back pair). The
  // knee bends as the foot swings forward. Sitting folds the back legs under.
  e.legs.forEach((l, i) => {
    const front = i === 1 || i === 3
    const walkA = Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)) * 28 * go
    const walkK = Math.max(0, -Math.cos(ph + (i === 0 || i === 3 ? 0 : Math.PI))) * 40 * go
    const boundA = Math.sin(bph * 2 + (front ? 0 : Math.PI)) * 38
    const boundK = Math.max(0, -Math.cos(bph * 2 + (front ? 0 : Math.PI))) * 50
    let a = walkA * (1 - bound) + boundA * bound
    let kn = walkK * (1 - bound) + boundK * bound
    if (sitting) {
      a = a * (1 - sitting) + (front ? -8 : -70) * sitting
      kn = kn * (1 - sitting) + (front ? 0 : 110) * sitting
    }
    put(l.el, 'transform', rot(a, l))
    if (l.knee) put(l.knee.el, 'transform', rot(kn, l.knee))
  })
  e.ears.forEach((j, i) => put(j.el, 'transform', rot(ear * (i ? 1 : 0.8), j)))
  if (e.tail) put(e.tail.el, 'transform', rot(tail, e.tail))
  // Blinks.
  if (now > life.blinkAt + 0.13) life.blinkAt = now + 2 + ((s.x * 13.7 + now * 7.1) % 3)
  const blink = now >= life.blinkAt && now < life.blinkAt + 0.13
  if (e.eye) put(e.eye.el, 'transform', blink ? `translate(0 ${e.eye.py * 0.9}) scale(1 0.1)` : '')
  // The mouth: talking (the mamas), chewing (munching), a little open when hopping.
  const chew = act === 'munch' && p > 0.15 && p < 0.85 ? (Math.sin(now * 12) * 0.5 + 0.5) * 0.6 : 0
  const open = Math.max(s.mouth, chew, act === 'hop' || act === 'cheer' ? bell(p) * 0.5 : 0)
  if (e.mouth) put(e.mouth, 'ry', (1.5 + open * L.head * 0.28).toFixed(1))
  if (e.seeds) put(e.seeds, 'visibility', s.seeds ? 'visible' : 'hidden')
}
