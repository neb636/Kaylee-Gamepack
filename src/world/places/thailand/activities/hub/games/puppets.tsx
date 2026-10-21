// The family as flat SVG puppets for the house's mini games (the 3D house draws them in three.js; these are the same
// toy animals, head and shoulders, from characters/looks.ts and the lineup in planning/around-the-world/thailand/).
// Putto the penguin (tic-tac-toe), Aunt Joy the fox (the beauty salon, so she wears a `Look`), Aunt Jum the pink
// elephant (mango sticky rice). They breathe, blink, watch her finger and move their mouths with their own voices.
// Actions: hop, cheer, wiggle, nod, shake, giggle, think.
import { forwardRef, useRef, type ReactNode } from 'react'
import { bell, lerp, setA, setT, smooth, span, spring, usePuppet, wobble, type PuppetFrame, type PuppetHandle } from '../../../../../../sdk'
import { LOOKS } from '../../../characters/looks'

const INK = '#2B2330'
const STROKE = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
export const ACTIONS = { hop: 0.75, cheer: 1.1, wiggle: 0.7, nod: 0.8, shake: 0.9, giggle: 1.0, think: 1.4 }
export type PuppetAction = keyof typeof ACTIONS

type PartRef = (k: Part) => (el: SVGGraphicsElement | HTMLElement | null) => void
type Part = 'root' | 'body' | 'head' | 'earL' | 'earR' | 'armL' | 'armR' | 'eyeL' | 'eyeR' | 'pupilL' | 'pupilR' | 'mouth' | 'happy' | 'open'

interface Geo {
  eyes: [number, number, number]
  mouth: [number, number]
  /** Mouth size (1 = usual). */
  mouthScale?: number
  shoulders: [number, number, number]
}

/** A D-shaped open mouth that grows with `m` (0 = a little happy smile). */
function mouthPath(m: number, cx: number, cy: number, k: number) {
  const w = (15 + 9 * m) * k
  const h = (9 + 30 * m) * k
  return `M${cx - w} ${cy} Q${cx} ${cy + 4 * k} ${cx + w} ${cy} C${cx + w} ${cy + h * 0.8} ${cx + w * 0.45} ${cy + h} ${cx} ${cy + h} C${cx - w * 0.45} ${cy + h} ${cx - w} ${cy + h * 0.8} ${cx - w} ${cy}Z`
}

function useFamilyPuppet(ref: React.Ref<PuppetHandle> | undefined, voice: string, g: Geo) {
  const st = useRef({ earL: spring(150, 8), earR: spring(150, 8) }).current
  const [ex, ey, gap] = g.eyes
  const [mx, my] = g.mouth
  const [sx0, sy0, sw] = g.shoulders
  return usePuppet<Part>(ref, {
    voice,
    actions: ACTIONS,
    eyes: [ex, ey],
    frame: (f: PuppetFrame, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action
      const breath = Math.sin(t * 2.2)
      let sx = 1 - breath * 0.006
      let sy = 1 + breath * 0.012
      let rootY = 0
      let rootRot = 0
      let headRot = Math.sin(t * 1.1) * 2.5 + look.x * 4
      let headY = 0
      let armL = -20 + Math.sin(t * 1.7) * 3
      let armR = 20 - Math.sin(t * 1.7) * 3
      let mouth = f.mouth
      let happy = false
      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))
      if (act === 'hop' || act === 'cheer') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.22, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx *= 1 + crouch * 0.1 - air * 0.05 + land * 0.07
        sy *= 1 - crouch * 0.12 + air * 0.08 - land * 0.08
        rootY -= air * (act === 'cheer' ? 70 : 50)
        headY += crouch * 6
        if (act === 'cheer') {
          armL = lerp(armL, -150, env)
          armR = lerp(armR, 150, env)
          mouth = Math.max(mouth, 0.7 * env)
          happy = env > 0.3
        }
      } else if (act === 'wiggle') {
        rootRot = Math.sin(q * Math.PI * 6) * 7 * (1 - q)
        happy = true
      } else if (act === 'nod') {
        headRot += Math.sin(q * Math.PI * 4) * 2
        headY += Math.abs(Math.sin(q * Math.PI * 2)) * 14 * env
        happy = true
      } else if (act === 'shake') {
        headRot += Math.sin(q * Math.PI * 6) * 11 * (1 - q)
      } else if (act === 'giggle') {
        rootY -= Math.abs(Math.sin(q * Math.PI * 8)) * 10 * env
        mouth = Math.max(mouth, 0.35 + 0.25 * Math.abs(Math.sin(q * Math.PI * 8)))
        happy = true
        armL = lerp(armL, -55, env)
        armR = lerp(armR, 55, env)
      } else if (act === 'think') {
        headRot = lerp(headRot, -12, env)
        armR = lerp(armR, 140, env)
      }
      // Ears lag behind the hop (follow-through).
      const eL = st.earL.step(rootY * 0.18 + headRot * 0.3, dt)
      const eR = st.earR.step(-rootY * 0.18 + headRot * 0.3, dt)
      setT(p.root, `translate(0 ${rootY}) rotate(${rootRot} 200 470) translate(200 470) scale(${sx} ${sy}) translate(-200 -470)`)
      setT(p.head, `translate(0 ${headY}) rotate(${headRot} 200 300)`)
      setT(p.earL, `rotate(${eL} ${ex - gap} ${ey - 110})`)
      setT(p.earR, `rotate(${eR} ${ex + gap} ${ey - 110})`)
      setT(p.armL, `rotate(${armL} ${sx0 - sw} ${sy0})`)
      setT(p.armR, `rotate(${armR} ${sx0 + sw} ${sy0})`)
      const lx = look.x * 6
      const ly = look.y * 5
      setT(p.pupilL, `translate(${lx} ${ly})`)
      setT(p.pupilR, `translate(${lx} ${ly})`)
      const b = Math.max(0.08, f.blink)
      setT(p.eyeL, `translate(0 ${ey}) scale(1 ${happy ? 1 : b}) translate(0 ${-ey})`)
      setT(p.eyeR, `translate(0 ${ey}) scale(1 ${happy ? 1 : b}) translate(0 ${-ey})`)
      if (p.eyeL instanceof SVGGraphicsElement) p.eyeL.style.display = happy ? 'none' : ''
      if (p.eyeR instanceof SVGGraphicsElement) p.eyeR.style.display = happy ? 'none' : ''
      if (p.happy instanceof SVGGraphicsElement) p.happy.style.display = happy ? '' : 'none'
      setA(p.mouth, 'd', mouthPath(Math.min(1, mouth * 1.2), mx, my, g.mouthScale ?? 1))
    },
  })
}

/** Big shiny eyes (with lashes for the aunts) and the ^ ^ they turn into when happy. */
function Eyes({ g, part, lashes }: { g: Geo; part: PartRef; lashes?: boolean }) {
  const [ex, ey, gap] = g.eyes
  const eye = (side: -1 | 1) => {
    const x = ex + side * gap
    return (
      <g ref={part(side < 0 ? 'eyeL' : 'eyeR')}>
        <ellipse cx={x} cy={ey} rx={19} ry={24} fill={INK} />
        <g ref={part(side < 0 ? 'pupilL' : 'pupilR')}>
          <circle cx={x - 6} cy={ey - 9} r={7.5} fill="#fff" />
          <circle cx={x + 6} cy={ey + 8} r={3.5} fill="#fff" />
        </g>
        {lashes && <path d={`M${x + side * 15} ${ey - 16} l${side * 13} -9 M${x + side * 19} ${ey - 6} l${side * 14} -3`} {...STROKE} fill="none" />}
      </g>
    )
  }
  return (
    <>
      {eye(-1)}
      {eye(1)}
      <g ref={part('happy')} style={{ display: 'none' }}>
        <path d={`M${ex - gap - 18} ${ey + 4} Q${ex - gap} ${ey - 20} ${ex - gap + 18} ${ey + 4} M${ex + gap - 18} ${ey + 4} Q${ex + gap} ${ey - 20} ${ex + gap + 18} ${ey + 4}`} {...STROKE} strokeWidth={8} fill="none" />
      </g>
    </>
  )
}

function Frame({ svg, height, children, label }: { svg: (el: SVGGraphicsElement | null) => void; height: string; children: ReactNode; label: string }) {
  return (
    <svg ref={svg} viewBox="0 -60 400 540" preserveAspectRatio="xMidYMax meet" style={{ width: '100%', height, display: 'block', overflow: 'visible' }} role="img" aria-label={label}>
      <ellipse cx={200} cy={476} rx={130} ry={10} fill="rgba(43,35,48,.14)" />
      {children}
    </svg>
  )
}

/** Shoulders and a shirt; arms are the fur color with a sleeve. */
function Body({ part, shirt, fur, chub = 1, g, flipper }: { part: PartRef; shirt: string; fur: string; chub?: number; g: Geo; flipper?: boolean }) {
  const [x0, y0, w] = g.shoulders
  const half = 92 * chub
  const arm = (side: -1 | 1) => (
    <g ref={part(side < 0 ? 'armL' : 'armR')}>
      <ellipse cx={x0 + side * w} cy={y0 + 48} rx={flipper ? 22 : 26} ry={flipper ? 58 : 50} fill={fur} {...STROKE} />
      {!flipper && <path d={`M${x0 + side * w - 28} ${y0 + 18} Q${x0 + side * w} ${y0 - 12} ${x0 + side * w + 28} ${y0 + 18} L${x0 + side * w + 26} ${y0 + 34} Q${x0 + side * w} ${y0 + 44} ${x0 + side * w - 26} ${y0 + 34}Z`} fill={shirt} {...STROKE} />}
    </g>
  )
  return (
    <g ref={part('body')}>
      {arm(-1)}
      {arm(1)}
      <path d={`M${200 - half * 0.82} 316 C${200 - half} 330 ${200 - half * 1.12} 420 ${200 - half * 1.06} 470 L${200 + half * 1.06} 470 C${200 + half * 1.12} 420 ${200 + half} 330 ${200 + half * 0.82} 316 Q200 296 ${200 - half * 0.82} 316Z`} fill={shirt} {...STROKE} />
    </g>
  )
}

// ---------------------------------------------------------------------------------------------------- Putto

const PUTTO = LOOKS.putto
const PG: Geo = { eyes: [200, 196, 46], mouth: [200, 252], mouthScale: 0.9, shoulders: [200, 318, 98] }

/** Putto, Kaylee's penguin cousin (her age), in his mint tee. Voice: putto. */
export const PuttoPuppet = forwardRef<PuppetHandle, { height: string }>(function PuttoPuppet({ height }, ref) {
  const { svg, part } = useFamilyPuppet(ref, 'putto', PG)
  return (
    <Frame svg={svg} height={height} label="Putto">
      <g ref={part('root')}>
        <Body part={part} shirt={PUTTO.outfit!.color} fur={PUTTO.fur} g={PG} flipper />
        <g ref={part('head')}>
          {/* His tuft */}
          <path d="M196 70 C186 40 200 22 214 30 C204 40 206 56 214 66 C220 46 240 44 246 56 C232 58 226 66 224 78Z" fill={PUTTO.fur} {...STROKE} />
          <g ref={part('earL')} />
          <g ref={part('earR')} />
          <ellipse cx={200} cy={190} rx={138} ry={128} fill={PUTTO.fur} {...STROKE} />
          {/* The white heart-shaped face */}
          <path d="M200 140 C160 104 82 126 86 196 C90 262 150 300 200 300 C250 300 310 262 314 196 C318 126 240 104 200 140Z" fill={PUTTO.light} />
          <ellipse cx={128} cy={238} rx={22} ry={12} fill="#FF9DB6" opacity={0.7} />
          <ellipse cx={272} cy={238} rx={22} ry={12} fill="#FF9DB6" opacity={0.7} />
          <Eyes g={PG} part={part} />
          <path ref={part('mouth')} d={mouthPath(0, 200, 252, 0.9)} fill="#E8743A" {...STROKE} />
          <path d="M176 232 Q200 214 224 232 Q214 252 200 254 Q186 252 176 232Z" fill={PUTTO.dark} {...STROKE} />
        </g>
      </g>
    </Frame>
  )
})

// ---------------------------------------------------------------------------------------------------- Joy

const JOY = LOOKS.joy
const JG: Geo = { eyes: [200, 198, 50], mouth: [200, 262], shoulders: [200, 318, 98] }

/** What Aunt Joy is wearing in the salon (each '' = none). */
export interface Look {
  lips: string
  cheeks: string
  eyes: string
  earrings: string
  hair: string
  necklace: string
}
export const NO_LOOK: Look = { lips: '', cheeks: '', eyes: '', earrings: '', hair: '', necklace: '' }

/** Aunt Joy the fox in her lavender blouse, wearing whatever Kaylee picked in the salon. Voice: joy. */
export const JoyPuppet = forwardRef<PuppetHandle, { height: string; look?: Look; mirror?: boolean }>(function JoyPuppet({ height, look = NO_LOOK, mirror }, ref) {
  const { svg, part } = useFamilyPuppet(ref, 'joy', JG)
  const ear = (side: -1 | 1) => {
    const m = (x: number) => 200 + side * (x - 200)
    return (
      <g ref={part(side < 0 ? 'earL' : 'earR')}>
        <path d={`M${m(92)} 140 L${m(96)} 30 L${m(186)} 96Z`} fill={JOY.fur} {...STROKE} />
        <path d={`M${m(110)} 120 L${m(112)} 58 L${m(162)} 98Z`} fill={JOY.ear} />
      </g>
    )
  }
  return (
    <Frame svg={svg} height={height} label="Aunt Joy">
      {/* The salon mirror behind her */}
      {mirror && (
        <g>
          <path d="M28 400 L28 120 Q28 -40 200 -40 Q372 -40 372 120 L372 400Z" fill="#F5C542" {...STROKE} />
          <path d="M48 392 L48 124 Q48 -20 200 -20 Q352 -20 352 124 L352 392Z" fill="#E5F5FF" />
          <path d="M90 60 L150 0 M84 110 L190 4" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.8} />
        </g>
      )}
      <g ref={part('root')}>
        <Body part={part} shirt={JOY.outfit!.color} fur={JOY.fur} g={JG} />
        <Necklace kind={look.necklace} />
        <g ref={part('head')}>
          {ear(-1)}
          {ear(1)}
          {/* Head with cheek tufts */}
          <path d="M200 70 C290 70 344 128 342 200 L362 232 L334 240 C318 286 268 312 200 312 C132 312 82 286 66 240 L38 232 L58 200 C56 128 110 70 200 70Z" fill={JOY.fur} {...STROKE} />
          <path d="M200 206 C176 196 120 196 92 232 C110 278 152 302 200 302 C248 302 290 278 308 232 C280 196 224 196 200 206Z" fill={JOY.light} />
          <Earrings kind={look.earrings} />
          {look.eyes && (
            <g opacity={0.85}>
              <path d={`M${150 - 30} 190 Q150 150 ${150 + 30} 190 Q150 174 ${150 - 30} 190Z`} fill={look.eyes} />
              <path d={`M${250 - 30} 190 Q250 150 ${250 + 30} 190 Q250 174 ${250 - 30} 190Z`} fill={look.eyes} />
            </g>
          )}
          <ellipse cx={124} cy={250} rx={look.cheeks ? 26 : 20} ry={look.cheeks ? 15 : 11} fill={look.cheeks || '#FF9DB6'} opacity={look.cheeks ? 0.8 : 0.55} />
          <ellipse cx={276} cy={250} rx={look.cheeks ? 26 : 20} ry={look.cheeks ? 15 : 11} fill={look.cheeks || '#FF9DB6'} opacity={look.cheeks ? 0.8 : 0.55} />
          <Eyes g={JG} part={part} lashes />
          <ellipse cx={200} cy={236} rx={14} ry={10} fill={INK} />
          <path ref={part('mouth')} d={mouthPath(0, 200, 262, 1)} fill="#C4466A" stroke={look.lips || INK} strokeWidth={look.lips ? 9 : 5} strokeLinejoin="round" />
          <HairThing kind={look.hair} />
        </g>
      </g>
    </Frame>
  )
})

function Earrings({ kind }: { kind: string }) {
  if (!kind) return null
  const one = (x: number) => {
    const y = 266
    switch (kind) {
      case 'pearl':
        return <g><circle cx={x} cy={y + 14} r={13} fill="#FFFDF8" {...STROKE} /><circle cx={x - 4} cy={y + 10} r={4} fill="#fff" /></g>
      case 'hoop':
        return <circle cx={x} cy={y + 24} r={20} fill="none" stroke="#F5B82E" strokeWidth={8} />
      case 'heart':
        return <g><path d={`M${x} ${y} L${x} ${y + 10}`} {...STROKE} /><path d={`M${x} ${y + 40} C${x - 26} ${y + 24} ${x - 18} ${y + 4} ${x} ${y + 16} C${x + 18} ${y + 4} ${x + 26} ${y + 24} ${x} ${y + 40}Z`} fill="#FF5FA2" {...STROKE} /></g>
      case 'star':
        return <g><path d={`M${x} ${y} L${x} ${y + 10}`} {...STROKE} /><path d={star(x, y + 28, 19, 8)} fill="#FFD84A" {...STROKE} /></g>
      case 'flower':
        return <g><path d={`M${x} ${y} L${x} ${y + 12}`} {...STROKE} /><Plumeria x={x} y={y + 30} r={18} /></g>
      default:
        return null
    }
  }
  return (
    <>
      {one(72)}
      {one(328)}
    </>
  )
}

function HairThing({ kind }: { kind: string }) {
  switch (kind) {
    case 'plumeria':
      return <Plumeria x={262} y={96} r={30} />
    case 'orchid':
      return <Orchid x={262} y={96} />
    case 'bow':
      return (
        <g>
          <path d="M262 96 L222 70 Q212 98 222 124Z M262 96 L302 70 Q312 98 302 124Z" fill="#FF7FB5" {...STROKE} />
          <circle cx={262} cy={96} r={13} fill="#FF5FA2" {...STROKE} />
        </g>
      )
    case 'tiara':
      return <path d="M138 92 L150 46 L176 76 L200 30 L224 76 L250 46 L262 92 Q200 80 138 92Z" fill="#FFD84A" {...STROKE} />
    default:
      return null
  }
}

function Necklace({ kind }: { kind: string }) {
  switch (kind) {
    case 'pearls':
      return <g>{[...Array(9)].map((_, i) => { const a = Math.PI * (0.15 + (0.7 * i) / 8); return <circle key={i} cx={200 - Math.cos(a) * 82} cy={306 + Math.sin(a) * 48} r={10} fill="#FFFDF8" {...STROKE} strokeWidth={3.5} /> })}</g>
    case 'gold':
      return (
        <g>
          <path d="M126 316 Q200 380 274 316" fill="none" stroke="#F5B82E" strokeWidth={6} />
          <path d="M200 386 C178 370 184 350 200 362 C216 350 222 370 200 386Z" fill="#F5B82E" {...STROKE} strokeWidth={4} />
        </g>
      )
    case 'garland':
      // A phuang malai: the jasmine garland Thai people give to say thank you and welcome.
      return (
        <g>
          {[...Array(11)].map((_, i) => { const a = Math.PI * (0.1 + (0.8 * i) / 10); return <circle key={i} cx={200 - Math.cos(a) * 88} cy={304 + Math.sin(a) * 62} r={12} fill={i % 2 ? '#FFFDF8' : '#FFE07A'} {...STROKE} strokeWidth={3.5} /> })}
          <circle cx={200} cy={372} r={15} fill="#FF5F7E" {...STROKE} strokeWidth={4} />
        </g>
      )
    default:
      return null
  }
}

export function star(cx: number, cy: number, r: number, r2: number) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r2 : r
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
}

/** Frangipani (lan thom): white petals, yellow middle. Thai ladies tuck one behind the ear. */
export function Plumeria({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={x} cy={y - r * 0.55} rx={r * 0.42} ry={r * 0.6} fill="#FFFDF8" stroke={INK} strokeWidth={3.5} transform={`rotate(${a} ${x} ${y})`} />
      ))}
      <circle cx={x} cy={y} r={r * 0.32} fill="#FFD84A" />
    </g>
  )
}

function Orchid({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[-60, 0, 60, 150, 210].map((a) => (
        <ellipse key={a} cx={x} cy={y - 20} rx={13} ry={20} fill="#C77DFF" stroke={INK} strokeWidth={3.5} transform={`rotate(${a} ${x} ${y})`} />
      ))}
      <ellipse cx={x} cy={y + 6} rx={12} ry={10} fill="#8E44C9" stroke={INK} strokeWidth={3.5} />
      <circle cx={x} cy={y - 2} r={5} fill="#FFD84A" />
    </g>
  )
}

// ---------------------------------------------------------------------------------------------------- Jum

const JUM = LOOKS.jum
const UG: Geo = { eyes: [200, 186, 46], mouth: [252, 256], mouthScale: 0.8, shoulders: [200, 322, 112] }

/** Aunt Jum, the chubby pink elephant who loves to cook, in her mint blouse. Voice: jum. */
export const JumPuppet = forwardRef<PuppetHandle, { height: string }>(function JumPuppet({ height }, ref) {
  const { svg, part } = useFamilyPuppet(ref, 'jum', UG)
  return (
    <Frame svg={svg} height={height} label="Aunt Jum">
      <g ref={part('root')}>
        <Body part={part} shirt={JUM.outfit!.color} fur={JUM.fur} chub={JUM.chub} g={UG} />
        <g ref={part('head')}>
          <g ref={part('earL')}>
            <ellipse cx={74} cy={186} rx={78} ry={92} fill={JUM.fur} {...STROKE} />
            <ellipse cx={82} cy={190} rx={56} ry={68} fill={JUM.ear} />
          </g>
          <g ref={part('earR')}>
            <ellipse cx={326} cy={186} rx={78} ry={92} fill={JUM.fur} {...STROKE} />
            <ellipse cx={318} cy={190} rx={56} ry={68} fill={JUM.ear} />
          </g>
          <ellipse cx={200} cy={190} rx={124} ry={116} fill={JUM.fur} {...STROKE} />
          <ellipse cx={122} cy={236} rx={20} ry={11} fill={JUM.dark} opacity={0.6} />
          <ellipse cx={278} cy={236} rx={20} ry={11} fill={JUM.dark} opacity={0.6} />
          <Eyes g={UG} part={part} lashes />
          <path ref={part('mouth')} d={mouthPath(0, 252, 256, 0.8)} fill="#C4466A" {...STROKE} />
          {/* Her trunk, curling up at the tip */}
          <path d="M178 214 C176 262 172 300 188 318 C200 332 226 326 230 306 C222 312 210 310 208 298 C204 276 222 250 222 214 Q200 200 178 214Z" fill={JUM.fur} {...STROKE} />
          <path d="M186 250 Q200 246 214 250 M184 274 Q198 270 212 274" stroke={JUM.dark} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </Frame>
  )
})
