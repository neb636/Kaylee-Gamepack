// Tika's Mountain Terraces: the drawn pieces of the scene. Everything in this level is drawn by hand in the flat look
// of the game shelf (src/world/shelf/STYLE.md): no dark outlines, form from a base, a shade and a light tone, light
// from the top left. The mountainside, the grass terraces and the Inca walls are drawn in code so the walls she
// builds *are* the art; the view behind (assets/bg-machu-picchu*.svg) and the critters are hand-drawn SVG files.
import { motion } from 'motion/react'
import { memo, useMemo } from 'react'
import type { StageLayout, World } from './layout'
import { inset, lighten, mix, roundedPath, type StoneShape } from './stones'

/** The sky at the top edge of the view behind: the level's own background continues it upward. */
export const SKY = '#8FD0FF'
/** The meadow at the bottom edge of the view behind. */
export const MEADOW = '#84D48F'

const GRASS = '#9BE28F'
const GRASS_LIP = '#62C47F'
const GRASS_LIGHT = '#C9F2B6'
const MUD = '#E6C49D'
const MUD_LIP = '#C29468'
const MUD_LIGHT = '#F4DDBD'
const SLOPE = '#62C47F'
const SLOPE_SHADE = '#4DB172'
const PINE = '#3E9E78'
const LEAF = '#48A96C'
const LEAF_LIGHT = '#73CF86'
const PETALS = ['#FFFFFF', '#FFC4DA', '#FFF6CC', '#FF8FB8']
const SHADOW = 'rgba(60, 40, 90, 0.16)'

/** A tiny seeded random, so the scenery keeps its place across re-renders. */
function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

/** A stone's paths: its rim, its lit face and the base tone that leaves a band of light along the top-left edges.
 *  Relative to its own box when `local`. */
export function stonePaths(st: StoneShape, local: boolean) {
  const dx = local ? st.w / 2 - st.c.x : 0
  const dy = local ? st.h / 2 - st.c.y : 0
  return {
    outline: roundedPath(st.pts, 18, dx, dy),
    light: roundedPath(inset(st.pts, st.c, 0.9, -2, -4), 15, dx, dy),
    face: roundedPath(inset(st.pts, st.c, 0.82, st.w * 0.04 - 2, st.h * 0.04 - 4), 13, dx, dy),
  }
}

/** A stone, drawn at its place in the wall (or in its own box when `local`: a stone lying on the grass). */
export function Stone({ st, local = false }: { st: StoneShape; local?: boolean }) {
  const p = useMemo(() => stonePaths(st, local), [st, local])
  return (
    <g>
      {local && <ellipse cx={st.w / 2} cy={st.h + 6} rx={st.w * 0.47} ry={13} fill={SHADOW} />}
      <path d={p.outline} fill={mix(st.color, '#8279AE', 0.42)} stroke={mix(st.color, '#5D5687', 0.55)} strokeWidth="3" strokeLinejoin="round" />
      <path d={p.light} fill={lighten(st.color, 0.6)} />
      <path d={p.face} fill={st.color} />
      {st.corners && <path d={p.face} fill="none" stroke="#FFC83D" strokeWidth="6" strokeDasharray="3 15" strokeLinecap="round" />}
    </g>
  )
}

/** An empty gap in the wall: warm earth showing through, in shadow along its top-left edges. The gaps of the wall
 *  she's building are darker with a dashed rim, so neighbouring gaps read as separate shapes. */
export function Hole({ st, glow, hover, active }: { st: StoneShape; glow: boolean; hover: boolean; active: boolean }) {
  // data-gap: QA scripts find a stone's own gap by it.
  const p = useMemo(
    () => ({ o: roundedPath(st.pts, 18), i: roundedPath(inset(st.pts, st.c, 0.9, st.w * 0.03, st.h * 0.04 + 3), 14), rim: roundedPath(inset(st.pts, st.c, 0.92, 0, 0), 15) }),
    [st],
  )
  return (
    <g data-gap={active ? st.id : undefined}>
      <path d={p.o} fill={active ? '#6B4640' : '#C29A78'} stroke={active ? '#5A3A36' : '#B48A68'} strokeWidth="3" strokeLinejoin="round" style={{ transition: 'fill 0.6s' }} />
      <path d={p.i} fill={active ? '#8A6253' : '#D8B593'} style={{ transition: 'fill 0.6s' }} />
      {active && <path d={p.rim} fill="none" stroke="#FDEECC" strokeWidth="5" strokeDasharray="14 11" strokeLinecap="round" opacity=".9" />}
      {(glow || hover) && <path className={glow ? 'terr-glow' : undefined} d={p.o} fill={hover ? 'rgba(255,200,61,.34)' : 'none'} stroke="#FFC83D" strokeWidth="12" strokeLinejoin="round" />}
    </g>
  )
}

const tuft = (x: number, y: number, k = 1) => `M${x.toFixed(0)} ${y.toFixed(0)}l${(-9 * k).toFixed(0)} ${(-20 * k).toFixed(0)}M${x.toFixed(0)} ${y.toFixed(0)}l${(2 * k).toFixed(0)} ${(-26 * k).toFixed(0)}M${x.toFixed(0)} ${y.toFixed(0)}l${(12 * k).toFixed(0)} ${(-18 * k).toFixed(0)}`

/** A tiny five-petal flower. */
function Flower({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = ((i * 72 - 90) * Math.PI) / 180
        return <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r} r={r * 0.82} fill={color} />
      })}
      <circle cx={x} cy={y} r={r * 0.6} fill="#FFC83D" />
    </g>
  )
}

/** A round clump of cloud-forest bush, lit from the top left. */
function Clump({ x, y, r, front }: { x: number; y: number; r: number; front?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={front ? LEAF : PINE} />
      <ellipse cx={x - r * 0.3} cy={y - r * 0.5} rx={r * 0.42} ry={r * 0.2} fill={front ? LEAF_LIGHT : '#5CBD78'} transform={`rotate(-24 ${x - r * 0.3} ${y - r * 0.5})`} />
    </g>
  )
}

/** The mountainside behind the terraces, the valley floor and the grass terraces (or storm mud, before they're fixed). */
export const Mountain = memo(function Mountain({ S, W, green }: { S: StageLayout; W: World; green: boolean[] }) {
  const n = S.wallW.length
  const pad = S.tall ? 90 : 230
  const hw = (k: number) => S.wallW[k] / 2 + pad
  const scene = useMemo(() => {
    // Left slope from the valley up to the summit, then mirrored.
    const left: [number, number][] = [[-80, W.height]]
    for (let k = 0; k < n; k++) left.push([W.cx - hw(k), W.wallBottom(k) + (k === 0 ? 0 : S.ledgeH * 0.4)])
    left.push([W.cx - S.wallW[n - 1] / 2 - pad * 0.45, W.summit - 40])
    const right = left.map(([x, y]) => [S.w - x, y] as [number, number]).reverse()
    const pts = [...left, [W.cx, W.summit - 80] as [number, number], ...right].map(([x, y]) => ({ x, y }))
    const rand = rng(77)
    // Grass tufts and flowers on the open slopes either side of the walls (wide stages have the room).
    let tufts = ''
    const flowers: { x: number; y: number; r: number; c: string }[] = []
    for (let k = 0; k < n; k++) {
      const room = pad - 90
      if (room < 40) continue
      for (const dir of [-1, 1])
        for (let i = 0; i < 5; i++) {
          const x = W.cx + dir * (S.wallW[k] / 2 + 60 + rand() * room)
          const y = W.wallBottom(k) - 30 - rand() * (S.wallH + S.ledgeH - 80)
          if (i % 2) flowers.push({ x, y, r: 6 + rand() * 3, c: PETALS[Math.floor(rand() * PETALS.length)] })
          else tufts += tuft(x, y)
        }
    }
    return { left, path: roundedPath(pts, 90), tufts, flowers }
  }, [S, W])

  return (
    <g>
      <defs>
        <clipPath id="terr-mountain">
          <path d={scene.path} />
        </clipPath>
      </defs>
      <path d={scene.path} fill={SLOPE} />
      {/* The right side falls into shade. */}
      <rect x={W.cx} y={W.summit - 200} width={S.w} height={W.height} fill={SLOPE_SHADE} clipPath="url(#terr-mountain)" />
      <path d={scene.tufts} fill="none" stroke="#8FD99A" strokeWidth="5" strokeLinecap="round" />
      {scene.flowers.map((f, i) => (
        <Flower key={i} x={f.x} y={f.y} r={f.r} color={f.c} />
      ))}
      {/* Cloud-forest bushes along both slopes. */}
      {scene.left.slice(1, -1).map(([x, y], i) => (
        <g key={i}>
          <Clump x={x + 40} y={y - 60} r={50} />
          <Clump x={x + 98} y={y - 38} r={36} front />
          <Clump x={S.w - x - 40} y={y - 70} r={48} />
          <Clump x={S.w - x - 96} y={y - 40} r={34} front />
        </g>
      ))}
      {/* The valley floor. */}
      <rect x={-80} y={W.G} width={S.w + 160} height={S.ground + 80} fill="#8FD99A" />
      <rect x={-80} y={W.G} width={S.w + 160} height={12} fill="#B6EAA9" />
      {Array.from({ length: n }, (_, k) => (
        <Ledge key={k} x={W.wallLeft(k) - 26} y={W.wallTop(k) - S.ledgeH} w={S.wallW[k] + 52} h={S.ledgeH} green={green[k]} seed={k + 3} />
      ))}
    </g>
  )
})

/** One terrace on top of its wall: storm mud with pebbles until the wall is mended, then fresh grass with flowers. */
export const Ledge = memo(function Ledge({ x, y, w, h, green, seed }: { x: number; y: number; w: number; h: number; green: boolean; seed: number }) {
  const art = useMemo(() => {
    const rand = rng(seed * 131)
    const lip = 30
    // The grass hangs over the top of the wall in soft scallops.
    const step = 38
    const count = Math.floor((w - 20) / step)
    const s0 = x + (w - count * step) / 2
    let fringe = `M${s0} ${y + h - 2}`
    for (let i = 0; i < count; i++) fringe += `a${step / 2} ${10 + ((i * 7) % 3) * 4} 0 0 0 ${step} 0`
    fringe += 'Z'
    let blades = ''
    const flowers: { x: number; y: number; r: number; c: string }[] = []
    for (let i = 0; i < Math.floor(w / 70); i++) {
      const fx = x + 34 + i * 70 + rand() * 30
      const fy = y + 26 + rand() * (h - lip - 34)
      if (i % 3 === 1) flowers.push({ x: fx, y: fy, r: 5.5 + rand() * 2, c: PETALS[Math.floor(rand() * PETALS.length)] })
      else blades += tuft(fx, fy + 12, 0.8)
    }
    const pebbles = Array.from({ length: Math.floor(w / 150) }, (_, i) => ({ x: x + 60 + i * 150 + rand() * 60, y: y + 30 + rand() * (h - lip - 40), rx: 15 + rand() * 9 }))
    let cracks = ''
    for (let i = 0; i < Math.floor(w / 260); i++) {
      const cx = x + 150 + i * 260 + rand() * 60
      cracks += `M${cx.toFixed(0)} ${(y + 22).toFixed(0)}l10 16l-8 12l9 14`
    }
    return { lip, fringe, blades, flowers, pebbles, cracks }
  }, [x, y, w, h, seed])
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, transition: 'opacity 0.8s' })
  const body = (top: string, lip: string, light: string) => (
    <>
      <rect x={x} y={y} width={w} height={h} rx="22" fill={lip} />
      <path d={`M${x} ${y + h - art.lip}V${y + 22}Q${x} ${y} ${x + 22} ${y}H${x + w - 22}Q${x + w} ${y} ${x + w} ${y + 22}V${y + h - art.lip}Z`} fill={top} />
      <rect x={x + 18} y={y + 8} width={w - 36} height="9" rx="4.5" fill={light} />
    </>
  )
  return (
    <g>
      <g style={fade(!green)}>
        {body(MUD, MUD_LIP, MUD_LIGHT)}
        <path d={art.cracks} fill="none" stroke={MUD_LIP} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {art.pebbles.map((p, i) => (
          <g key={i}>
            <ellipse cx={p.x} cy={p.y + 4} rx={p.rx} ry={p.rx * 0.6} fill={MUD_LIP} />
            <ellipse cx={p.x} cy={p.y} rx={p.rx} ry={p.rx * 0.6} fill="#F1E3CF" />
          </g>
        ))}
      </g>
      <g style={fade(green)}>
        {body(GRASS, GRASS_LIP, GRASS_LIGHT)}
        <path d={art.fringe} fill={GRASS_LIP} />
        <path d={art.blades} fill="none" stroke={GRASS_LIP} strokeWidth="5" strokeLinecap="round" />
        {art.flowers.map((f, i) => (
          <Flower key={i} x={f.x} y={f.y} r={f.r} color={f.c} />
        ))}
      </g>
    </g>
  )
})

/** The grassy ledge in front, where the stones lie and the friends wait: `w` x `h` in stage units, any size. */
export const Foreground = memo(function Foreground({ w, h }: { w: number; h: number }) {
  const art = useMemo(() => {
    const rand = rng(Math.round(w) * 3 + 11)
    const q = (f: number) => (w * f).toFixed(0)
    const hill = (y: number, d: number) => `M-20 ${y + d}Q${q(0.12)} ${y - d} ${q(0.26)} ${y}T${q(0.52)} ${y - d * 0.4}T${q(0.78)} ${y + d * 0.3}T${w + 20} ${y}V${h + 20}H-20Z`
    let tufts = ''
    const flowers: { x: number; y: number; r: number; c: string }[] = []
    const pebbles: { x: number; y: number; rx: number }[] = []
    const count = Math.round((w * h) / 26000)
    for (let i = 0; i < count; i++) {
      const x = 20 + rand() * (w - 40)
      const y = 64 + rand() * (h - 84)
      const kind = i % 5
      if (kind === 0 || kind === 3) flowers.push({ x, y, r: 5.5 + rand() * 2.5, c: PETALS[Math.floor(rand() * PETALS.length)] })
      else if (kind === 4 && y > 260) pebbles.push({ x, y, rx: 12 + rand() * 10 })
      else tufts += tuft(x, y, 0.9)
    }
    return { back: hill(34, 22), lit: hill(40, 22), front: hill(96, 16), tufts, flowers, pebbles }
  }, [w, h])
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <path d={art.back} fill="#C9F2B6" />
      <path d={art.lit} fill="#7FD487" />
      <path d={art.front} fill="#70C97D" />
      <path d={art.tufts} fill="none" stroke="#56B673" strokeWidth="5" strokeLinecap="round" />
      {art.pebbles.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.x} cy={p.y + 4} rx={p.rx} ry={p.rx * 0.62} fill="#56B673" />
          <ellipse cx={p.x} cy={p.y} rx={p.rx} ry={p.rx * 0.62} fill="#E6E2F4" />
        </g>
      ))}
      {art.flowers.map((f, i) => (
        <Flower key={i} x={f.x} y={f.y} r={f.r} color={f.c} />
      ))}
    </svg>
  )
})

export const CLOUD = 'M30 88C6 88 4 58 28 54C26 26 62 18 78 36C88 8 138 10 142 42C170 34 194 56 180 78C178 88 170 88 160 88Z'

/** A puffy flat cloud, shaded underneath. */
export function CloudShape({ w, fill = '#FFFFFF' }: { w: number; fill?: string }) {
  return (
    <svg viewBox="0 0 200 100" style={{ width: w, height: w / 2, overflow: 'visible', display: 'block' }}>
      <path d={CLOUD} fill="#C3D3F4" transform="translate(0 8)" />
      <path d={CLOUD} fill={fill} />
      <path d="M52 44Q64 30 80 38M104 30Q118 22 130 34" fill="none" stroke="#EAF2FF" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

/** The seed bags she picks from: each shows what grows. */
export function SeedBag({ img, color }: { img: string; color: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 120 130" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d="M30 30Q20 70 22 104Q24 124 60 124Q96 124 98 104Q100 70 90 30Z" fill={color} />
        <path d="M74 34Q84 70 80 122Q96 118 98 104Q100 70 90 30Z" fill={mix(color, '#8279AE', 0.28)} />
        <path d="M30 30Q60 40 90 30L96 14Q60 24 24 14Z" fill={lighten(color, 0.45)} />
        <path d="M32 30Q60 38 88 30" fill="none" stroke="#FF4F9A" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <img src={img} alt="" draggable={false} style={{ position: 'absolute', left: '18%', top: '32%', width: '64%', height: '58%', objectFit: 'contain', pointerEvents: 'none' }} />
    </div>
  )
}

/** A drawn camera, for the button that takes the picture. */
export function CameraIcon() {
  return (
    <svg viewBox="0 0 100 80" style={{ width: '1.5em', height: '1.2em', display: 'block' }} aria-hidden>
      <path d="M30 16L36 4H64L70 16Z" fill="#FFE2EE" />
      <rect x="6" y="14" width="88" height="60" rx="16" fill="#fff" />
      <rect x="6" y="52" width="88" height="22" rx="11" fill="#FFE2EE" />
      <circle cx="50" cy="44" r="21" fill="#B9A6F5" />
      <circle cx="50" cy="44" r="13" fill="#6A57C7" />
      <circle cx="44" cy="38" r="5" fill="#fff" />
      <circle cx="80" cy="27" r="4.5" fill="#FFC83D" />
    </svg>
  )
}

/** Puffs of dust where a stone lands. */
export function Dust({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <>
      {[-1, -0.4, 0.4, 1].map((d, i) => (
        <motion.div
          key={i}
          initial={{ x: x + d * w * 0.3 - 24, y: y - 24, scale: 0.4, opacity: 0.95 }}
          animate={{ x: x + d * w * 0.55 - 24, y: y - 24 - 30 - (i % 2) * 20, scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ position: 'absolute', left: 0, top: 0, width: 48, height: 48, borderRadius: '50%', background: i % 2 ? '#FFFFFF' : '#F6ECDC', pointerEvents: 'none', zIndex: 30 }}
        />
      ))}
    </>
  )
}
