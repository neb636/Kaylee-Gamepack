// Furniture and props drawn in code, in China's sticker style (brown outline, flat fills, one shade band). The rooms are
// generated back walls; everything she touches or that has to sit in front of a character is SVG, so it lines up at
// every screen size and can move (lids lift, water bubbles, the steamer stack grows).
import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { DOUGH, Dumpling, type DoughColor } from './puppets/Dumpling'
import { EYE, INK } from './puppets/ink'

const S = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const thin = { ...S, strokeWidth: 3.2, fill: 'none' }

/** The kitchen counter: a maple work top (where everything happens) over pink cabinet doors. Fills its box. */
export function Counter({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ position: 'absolute', inset: 0, ...style }}>
      {/* Work top: seen a little from above, so it's a tall band. */}
      <div style={{ position: 'absolute', left: -8, right: -8, top: 0, height: '62%', background: '#F8DDB0', borderTop: `6px solid ${INK}`, borderBottom: `6px solid ${INK}`, boxShadow: 'inset 0 -14px 0 #F0CC92' }}>
        {[22, 48, 74].map((y) => (
          <div key={y} style={{ position: 'absolute', left: 0, right: 0, top: `${y}%`, height: 3, background: '#EFC98E', borderRadius: 2 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: -8, right: -8, top: '62%', bottom: 0, background: '#F2A7BC' }}>
        <div style={{ position: 'absolute', left: '3%', right: '3%', top: '14%', bottom: '10%', display: 'flex', gap: '2.5%' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ flex: 1, background: '#F8C3D1', border: `5px solid ${INK}`, borderRadius: 16, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '50%', top: '16%', width: 24, height: 10, marginLeft: -12, background: '#FFC83D', border: `4px solid ${INK}`, borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Stove with a wok of water. `on` lights the flame and makes the water bubble. The knob is a real button. */
export function Stove({ on, onKnob, hint, children, style }: { on: boolean; onKnob?: () => void; hint?: boolean; children?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: 'relative', width: 'var(--stove-w)', ...style }}>
      {/* Steamer baskets sit on the wok (children), above it. */}
      <div style={{ position: 'absolute', left: '50%', bottom: '62%', translate: '-50% 0', width: '82%', display: 'flex', flexDirection: 'column-reverse', alignItems: 'center' }}>{children}</div>
      <svg viewBox="0 0 240 150" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
        {on && (
          <g>
            {[-40, 0, 40].map((x, i) => (
              <motion.path key={x} d={`M${120 + x} 96 C${108 + x} 80 ${116 + x} 66 ${120 + x} 58 C${126 + x} 70 ${134 + x} 80 ${120 + x} 96Z`} fill="#FF9A4A" stroke={INK} strokeWidth={3} animate={{ scaleY: [1, 1.25, 0.9, 1] }} transition={{ repeat: Infinity, duration: 0.5 + i * 0.1 }} style={{ transformOrigin: `${120 + x}px 96px` }} />
            ))}
          </g>
        )}
        {/* Wok */}
        <path d="M20 40 Q120 120 220 40 Z" fill="#6E6A7A" {...S} />
        <path d="M34 44 Q120 100 206 44" fill="none" stroke="#8C88A0" strokeWidth={6} strokeLinecap="round" />
        <ellipse cx={120} cy={40} rx={100} ry={14} fill={on ? '#BFE6FF' : '#A8DCFF'} {...S} />
        {on && [70, 110, 150, 185].map((x, i) => <motion.circle key={x} cx={x} cy={40} r={5} fill="#fff" stroke={INK} strokeWidth={2} animate={{ y: [2, -6, 2], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.17 }} />)}
        <path d="M216 40 L238 30" {...S} strokeWidth={8} />
        {/* Stove box */}
        <rect x={10} y={96} width={220} height={52} rx={12} fill="#C9C3D8" {...S} />
      </svg>
      <motion.button
        aria-label="Stove knob"
        onClick={onKnob}
        className={hint ? 'world-glow' : undefined}
        animate={hint ? { scale: [1, 1.15, 1] } : { rotate: on ? 90 : 0 }}
        transition={hint ? { repeat: Infinity, duration: 0.9 } : { type: 'spring' }}
        style={{ position: 'absolute', left: '50%', bottom: '2%', translate: '-50% 0', width: 'max(88px, 34%)', aspectRatio: '1', borderRadius: '50%', background: on ? '#FF7A59' : '#FFC83D', border: `5px solid ${INK}`, boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', fontSize: 30 }}
      >
        🔥
      </motion.button>
    </div>
  )
}

/** A round bamboo steamer basket, open (cabbage leaf and dumplings inside) or closed (lid on). */
export function Steamer({ lid, children, ribbon, style, leaf = true, glow }: { lid?: boolean; children?: ReactNode; ribbon?: string; style?: CSSProperties; leaf?: boolean; glow?: boolean }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '240 / 150', ...style }} className={glow ? 'world-glow' : undefined}>
      <svg viewBox="0 0 240 150" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        {/* back rim + inside */}
        <ellipse cx={120} cy={52} rx={112} ry={36} fill="#E6B472" {...S} />
        <ellipse cx={120} cy={56} rx={96} ry={27} fill="#D9A15E" />
        {leaf && <path d="M40 60 C60 34 180 30 202 58 C186 78 60 84 40 60Z" {...thin} fill="#B8E39A" stroke="#6C9A55" />}
        {leaf && <path d="M52 60 Q120 50 190 58" {...thin} stroke="#8DBE72" />}
      </svg>
      {/* dumplings sit inside, between the back rim and the front band */}
      <div style={{ position: 'absolute', left: '16%', right: '16%', top: '-6%', height: '66%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '2%' }}>{children}</div>
      <svg viewBox="0 0 240 150" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        <path d="M8 52 L12 118 Q120 160 228 118 L232 52 Q120 104 8 52Z" fill="#F4CB8C" {...S} />
        <path d="M10 88 Q120 132 230 88" {...thin} />
        <path d="M12 118 Q120 160 228 118 L229 104 Q120 144 11 104Z" fill="#E6B472" />
        {ribbon && <path d="M150 100 L150 140 L162 130 L174 140 L174 96Z" fill={ribbon} {...S} strokeWidth={4} />}
        {lid && (
          <g>
            <path d="M4 56 Q120 -52 236 56 Q120 100 4 56Z" fill="#F7D8A4" {...S} />
            <path d="M40 40 Q120 -8 200 40" {...thin} />
            <path d="M70 22 Q120 0 170 22" {...thin} />
            <rect x={100} y={-10} width={40} height={20} rx={10} fill="#E6B472" {...S} />
          </g>
        )}
      </svg>
    </div>
  )
}

/** Just the lid (lifted off with a whoosh). */
export function Lid({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 -14 240 120" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <path d="M4 56 Q120 -52 236 56 Q120 100 4 56Z" fill="#F7D8A4" {...S} />
      <path d="M40 40 Q120 -8 200 40" {...thin} />
      <path d="M70 22 Q120 0 170 22" {...thin} />
      <rect x={100} y={-10} width={40} height={20} rx={10} fill="#E6B472" {...S} />
    </svg>
  )
}

/** A bowl of colored dough (a sleepy dough ball peeks out). */
export function DoughBowl({ color, style }: { color: DoughColor; style?: CSSProperties }) {
  const c = DOUGH[color]
  return (
    <svg viewBox="-6 -6 212 156" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <path d="M44 74 Q44 16 100 16 Q156 16 156 74 Z" fill={c.fill} {...S} />
      <path d="M84 50 Q90 56 96 50 M104 50 Q110 56 116 50" fill="none" stroke={EYE} strokeWidth={3.6} strokeLinecap="round" />
      <path d="M10 70 L190 70 Q186 138 100 138 Q14 138 10 70 Z" fill="#8FD3B6" {...S} />
      <path d="M24 104 Q100 118 176 104" {...thin} />
    </svg>
  )
}

/** The filling bowl, with a spoon in it. */
export function FillingBowl({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="-6 -40 212 190" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <path d="M130 70 L176 -26" {...S} strokeWidth={12} />
      <path d="M130 70 L176 -26" stroke="#F0C38A" strokeWidth={4} strokeLinecap="round" />
      <path d="M36 72 Q40 40 100 40 Q160 40 164 72Z" fill="#E29A78" {...S} />
      <circle cx={80} cy={56} r={4} fill="#9CCB7A" />
      <circle cx={120} cy={52} r={4} fill="#9CCB7A" />
      <path d="M10 70 L190 70 Q186 138 100 138 Q14 138 10 70 Z" fill="#FFF7F0" {...S} />
      <path d="M40 94 Q100 106 160 94" stroke="#7CCBA2" strokeWidth={8} fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function RollingPin({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="-8 -8 336 60" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <rect x={4} y={14} width={60} height={20} rx={10} fill="#F0C38A" {...S} />
      <rect x={256} y={14} width={60} height={20} rx={10} fill="#F0C38A" {...S} />
      <rect x={56} y={2} width={208} height={44} rx={22} fill="#F6D6A2" {...S} />
      <path d="M76 14 L120 14" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
    </svg>
  )
}

/** The rolled dough snake, with `cuts` chop marks made so far (of `pieces - 1`). */
export function DoughSnake({ color = 'cream', cuts = 0, pieces = 4, style }: { color?: DoughColor; cuts?: number; pieces?: number; style?: CSSProperties }) {
  const c = DOUGH[color]
  return (
    <svg viewBox="-8 -8 416 96" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <rect x={4} y={10} width={392} height={64} rx={32} fill={c.fill} {...S} />
      <path d="M30 60 Q200 76 370 60" stroke={c.shade} strokeWidth={10} fill="none" strokeLinecap="round" />
      {Array.from({ length: pieces - 1 }, (_, i) => {
        const x = 4 + (392 / pieces) * (i + 1)
        return i < cuts ? <path key={i} d={`M${x} 6 L${x} 78`} stroke={INK} strokeWidth={6} strokeLinecap="round" /> : <path key={i} d={`M${x} 18 L${x} 66`} stroke={INK} strokeWidth={3} strokeDasharray="6 8" opacity={0.35} />
      })}
    </svg>
  )
}

export function Cleaver({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="-8 -8 176 136" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <rect x={112} y={8} width={52} height={22} rx={10} fill="#C98E5C" {...S} />
      <path d="M8 8 L118 8 L118 96 Q60 112 8 96 Z" fill="#D8D4E4" {...S} />
      <circle cx={100} cy={24} r={6} fill="#fff" {...S} strokeWidth={3} />
      <path d="M16 90 Q60 102 110 90" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
    </svg>
  )
}

/** An order ticket: little dumpling pictures she can count (she can't read). `done` of them get a check. */
export function Ticket({ colors, done = 0, ribbon, face, style }: { colors: DoughColor[]; done?: number; ribbon?: string; face?: ReactNode; style?: CSSProperties }) {
  return (
    <motion.div initial={{ y: -40, rotate: -8, opacity: 0 }} animate={{ y: 0, rotate: -3, opacity: 1 }} style={{ background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 18, padding: '10px 12px 8px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: 8, position: 'relative', ...style }}>
      <div style={{ position: 'absolute', left: '50%', top: -16, width: 34, height: 22, marginLeft: -17, borderRadius: 8, background: ribbon ?? '#E8504F', border: `4px solid ${INK}` }} />
      {face}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colors.length > 4 ? 3 : colors.length}, auto)`, gap: 4 }}>
        {colors.map((c, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <Dumpling state="cooked" face="smile" color={c} size="var(--ticket-d)" />
            {i < done && <span style={{ position: 'absolute', right: -4, bottom: -4, fontSize: 'calc(var(--ticket-d) * 0.45)' }}>✅</span>}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/** A round dining table with a lazy Susan (front view, a little from above). Fills its width. */
export function Table({ style, children }: { style?: CSSProperties; children?: ReactNode }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '420 / 320', ...style }}>
      <svg viewBox="-10 -10 420 320" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <rect x={112} y={228} width={26} height={64} rx={8} fill="#C98E5C" {...S} strokeWidth={6} />
        <rect x={262} y={228} width={26} height={64} rx={8} fill="#C98E5C" {...S} strokeWidth={6} />
        <path d="M22 108 L30 236 Q62 256 96 240 Q128 260 162 242 Q196 262 230 242 Q264 260 298 242 Q332 258 362 240 Q378 250 376 236 L378 108 Z" fill="#FBE3DA" {...S} strokeWidth={6} />
        <path d="M27 190 Q200 222 373 190 L376 236 Q378 250 362 240 Q332 258 298 242 Q264 260 230 242 Q196 262 162 242 Q128 260 96 240 Q62 256 30 236 Z" fill="#F4CFC3" />
        <path d="M30 236 Q62 256 96 240 Q128 260 162 242 Q196 262 230 242 Q264 260 298 242 Q332 258 362 240 Q378 250 376 236" fill="none" {...S} strokeWidth={6} />
        <g fill="none" stroke={INK} strokeWidth={3.6} strokeLinecap="round">
          <path d="M96 164 Q100 200 96 238" />
          <path d="M200 168 Q204 206 200 250" />
          <path d="M300 164 Q296 200 300 238" />
        </g>
        <ellipse cx={200} cy={108} rx={178} ry={52} fill="#FFF0EA" {...S} strokeWidth={6} />
        <ellipse cx={200} cy={100} rx={112} ry={30} fill="#E2B283" {...S} strokeWidth={6} />
        <ellipse cx={200} cy={97} rx={84} ry={20} fill="#EFC596" {...S} strokeWidth={3.6} />
      </svg>
      {/* things on the table sit on the lazy Susan */}
      <div style={{ position: 'absolute', left: '22%', right: '22%', bottom: '64%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>{children}</div>
    </div>
  )
}

export function Stool({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="-8 -8 136 136" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <path d="M22 50 L28 116 M98 50 L92 116" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <path d="M22 50 L28 116 M98 50 L92 116" fill="none" stroke="#C98E5C" strokeWidth={5} strokeLinecap="round" />
      <path d="M26 88 L94 88" stroke={INK} strokeWidth={5} />
      <path d="M8 40 Q60 70 112 40 L112 52 Q60 82 8 52 Z" fill="#B99BE8" {...S} />
      <ellipse cx={60} cy={40} rx={52} ry={18} fill="#C9B6F2" {...S} />
    </svg>
  )
}

export function Teapot({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="-8 -8 176 136" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <path d="M130 60 Q170 44 160 20" fill="none" {...S} strokeWidth={9} />
      <path d="M130 60 Q170 44 160 20" fill="none" stroke="#7CCBA2" strokeWidth={3} strokeLinecap="round" />
      <path d="M30 56 Q4 60 10 84 Q16 100 34 96" fill="none" {...S} strokeWidth={9} />
      <path d="M30 56 Q4 60 10 84 Q16 100 34 96" fill="none" stroke="#7CCBA2" strokeWidth={3} strokeLinecap="round" />
      <path d="M28 60 Q28 30 80 30 Q132 30 132 60 Q134 112 80 112 Q26 112 28 60Z" fill="#9EDCC0" {...S} />
      <path d="M40 84 Q80 96 120 84" {...thin} />
      <path d="M52 32 Q80 14 108 32Z" fill="#7CCBA2" {...S} />
      <circle cx={80} cy={14} r={8} fill="#FFC83D" {...S} strokeWidth={4} />
    </svg>
  )
}

export function Cup({ tea, style }: { tea?: boolean; style?: CSSProperties }) {
  return (
    <svg viewBox="-6 -6 92 72" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <path d="M6 10 L74 10 Q72 60 40 60 Q8 60 6 10Z" fill="#FFF7F0" {...S} />
      <ellipse cx={40} cy={10} rx={34} ry={8} fill={tea ? '#E8B45C' : '#F2E3D6'} {...S} />
      <path d="M22 34 Q40 42 58 34" stroke="#7CCBA2" strokeWidth={5} fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** The rolling dim sum cart (two shelves; the dishes on it are passed in as children, top then bottom shelf). */
export function DimSumCart({ top, bottom, style }: { top: ReactNode; bottom: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '300 / 230', ...style }}>
      <svg viewBox="-8 -8 316 246" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <path d="M280 90 L300 30" {...S} strokeWidth={10} />
        <path d="M280 90 L300 30" stroke="#C98E5C" strokeWidth={4} strokeLinecap="round" />
        <rect x={20} y={80} width={260} height={24} rx={8} fill="#E8504F" {...S} />
        <rect x={20} y={170} width={260} height={24} rx={8} fill="#E8504F" {...S} />
        <path d="M34 104 L34 170 M266 104 L266 170" {...S} strokeWidth={8} />
        {[50, 250].map((x) => (
          <g key={x}>
            <circle cx={x} cy={214} r={16} fill="#6E6A7A" {...S} />
            <circle cx={x} cy={214} r={5} fill="#FFC83D" />
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', left: '8%', right: '10%', bottom: '58%', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>{top}</div>
      <div style={{ position: 'absolute', left: '8%', right: '10%', bottom: '20%', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>{bottom}</div>
    </div>
  )
}

/** A red paper lantern (hub map spots, dining room). `lit` glows gold; `dim` is a "coming soon" lantern. */
export function Lantern({ lit, dim, style, children }: { lit?: boolean; dim?: boolean; style?: CSSProperties; children?: ReactNode }) {
  const body = dim ? '#E7B6B0' : lit ? '#FFC83D' : '#E8504F'
  const ribs = dim ? '#D69C95' : lit ? '#F2A91E' : '#C93F44'
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '100 / 130', ...style }}>
      <svg viewBox="-6 -6 112 142" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <path d="M50 -6 L50 12" {...S} strokeWidth={4} />
        <rect x={32} y={10} width={36} height={12} rx={4} fill="#FFC83D" {...S} strokeWidth={4} />
        <path d="M50 20 C94 20 102 52 102 64 C102 76 94 108 50 108 C6 108 -2 76 -2 64 C-2 52 6 20 50 20Z" fill={body} {...S} />
        <path d="M50 22 C30 36 30 92 50 106 M50 22 C70 36 70 92 50 106" fill="none" stroke={ribs} strokeWidth={4} />
        <path d="M14 46 Q8 64 14 82" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.45} />
        <rect x={32} y={106} width={36} height={12} rx={4} fill="#FFC83D" {...S} strokeWidth={4} />
        <path d="M44 118 L42 134 M50 118 L50 136 M56 118 L58 134" stroke={dim ? '#D69C95' : '#E8504F'} strokeWidth={4} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: '15%', right: '15%', top: '20%', bottom: '20%', display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  )
}

export function ChefHat({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="-8 -8 176 146" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <path d="M36 128 L36 84 C8 84 0 48 26 36 C30 10 64 2 80 20 C96 2 130 10 134 36 C160 48 152 84 124 84 L124 128Z" fill="#FFF7F0" {...S} />
      <rect x={32} y={100} width={96} height={30} rx={8} fill="#FFE3EC" {...S} />
      <path d="M60 52 Q80 40 100 52" {...thin} />
    </svg>
  )
}

/** A soft steam puff (tap to pop). */
export function SteamPuff({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="-6 -6 132 102" style={{ width: '100%', display: 'block', overflow: 'visible', ...style }}>
      <path d="M26 80 C6 80 2 56 20 50 C16 28 40 18 54 30 C62 10 92 12 96 34 C116 32 124 56 108 66 C116 82 96 90 84 82 C72 94 40 94 26 80Z" fill="#FFFFFF" {...S} strokeWidth={4.5} opacity={0.95} />
      <path d="M40 56 Q46 50 52 56 M70 56 Q76 50 82 56" fill="none" stroke={EYE} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M56 66 Q61 71 66 66" fill="none" stroke={EYE} strokeWidth={3.5} strokeLinecap="round" />
    </svg>
  )
}

/** A phone screen (Lulu calls from her sick bed). */
export function Phone({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: '#6E6A7A', border: `6px solid ${INK}`, borderRadius: 34, padding: '18px 10px', boxShadow: 'var(--shadow)', ...style }}>
      <div style={{ background: '#D9CCFF', borderRadius: 18, height: '100%', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>{children}</div>
    </div>
  )
}
