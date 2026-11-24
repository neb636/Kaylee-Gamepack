// The Nile, drawn by hand in SVG (no generated pictures): a sky, far dunes with the pyramids, a village in the sand, the
// green bank, the water and the reeds in front, each on its own strip so they slide by at different speeds. Scenery has
// no outlines and soft flat tones; the things she plays with (flowers, the wheel, ducks, fish) get the puppets' ink line.
import { motion, useAnimationControls } from 'motion/react'
import { useId, type CSSProperties, type ReactNode, type Ref } from 'react'
import { INK } from '../../../../kit/ink'

/** `n` river units as a CSS length. */
export const U = (n: number) => `calc(var(--u) * ${n})`

const ink = (w = 3) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const })

/** A strip that repeats: the same drawing twice, side by side, slid by the game loop through `ref`. */
export function Strip({ innerRef, tile, height, bottom, z, children }: { innerRef: Ref<HTMLDivElement>; tile: number; height: number; bottom: string; z: number; children: ReactNode }) {
  return (
    <div ref={innerRef} style={{ position: 'absolute', left: 0, bottom, width: U(tile * 2), height: U(height), display: 'flex', willChange: 'transform', zIndex: z, pointerEvents: 'none' }}>
      {[0, 1].map((i) => (
        <div key={i} style={{ position: 'relative', width: U(tile), height: '100%', flexShrink: 0 }}>
          {children}
        </div>
      ))}
    </div>
  )
}

const fill: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', overflow: 'visible' }

/** Far away: pale dunes and the three pyramids of Giza. Tiles every 300 units; 44 tall. */
export function FarDunes() {
  return (
    <svg viewBox="0 0 300 44" preserveAspectRatio="none" style={fill}>
      <path d="M0 30 C30 22 60 20 92 26 C120 31 138 30 150 28 L150 44 L0 44Z" fill="#FBEBC8" />
      <path d="M150 28 C176 24 214 18 246 24 C268 28 286 31 300 30 L300 44 L150 44Z" fill="#FBEBC8" />
      {/* the pyramids: a lit face and a shaded face each */}
      <g>
        <path d="M196 6 L226 36 L166 36Z" fill="#F7D79C" />
        <path d="M196 6 L226 36 L204 36Z" fill="#E6B877" />
        <path d="M236 16 L258 38 L214 38Z" fill="#F7D79C" />
        <path d="M236 16 L258 38 L242 38Z" fill="#E6B877" />
        <path d="M158 20 L176 38 L140 38Z" fill="#F9DEAB" />
        <path d="M158 20 L176 38 L163 38Z" fill="#EAC084" />
      </g>
      <path d="M0 36 C40 30 84 34 124 37 C170 40 220 34 262 36 C280 37 292 37 300 36 L300 44 L0 44Z" fill="#F8E2B4" />
      <path d="M40 40 C70 36 96 38 120 41 M196 41 C222 38 246 39 270 41" stroke="#EDCB92" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** The middle distance: rolling sand and a little mud-brick village with its palms. Tiles every 240 units; 22 tall. */
export function MidDunes() {
  const house = (x: number, y: number, w: number, h: number, dome = false) => (
    <g>
      {dome && <path d={`M${x + w * 0.2} ${y} A${w * 0.3} ${w * 0.3} 0 0 1 ${x + w * 0.8} ${y}Z`} fill="#FFF3DC" />}
      <rect x={x} y={y} width={w} height={h} rx="0.6" fill="#FFF3DC" />
      <rect x={x + w * 0.62} y={y} width={w * 0.38} height={h} fill="#EBCFA2" />
      <rect x={x + w * 0.16} y={y + h * 0.45} width={w * 0.22} height={h * 0.55} rx={w * 0.11} fill="#C99266" />
      <rect x={x + w * 0.68} y={y + h * 0.22} width={w * 0.16} height={h * 0.2} rx="0.4" fill="#B98A5E" />
    </g>
  )
  const palm = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-0.5 0 C0 -3 0.6 -5.5 1.4 -8 L2.4 -7.8 C1.6 -5 1.2 -2.6 1 0Z" fill="#B98A5E" />
      <path d="M1.8 -8 C-1 -11 -4.6 -10.4 -6 -8 C-3.6 -8.6 -1 -8.4 1.8 -8Z M1.8 -8 C4.4 -11.4 8 -10.6 9.4 -8 C7 -8.8 4.4 -8.6 1.8 -8Z M1.8 -8 C0.4 -11.6 2 -13.4 3.4 -13.8 C3 -11.6 2.8 -9.8 1.8 -8Z M1.8 -8 C-1.4 -7.6 -3.4 -5.6 -3.8 -4 C-1.4 -5.4 0.4 -6.6 1.8 -8Z M1.8 -8 C5 -7.6 6.8 -5.8 7.2 -4.2 C5 -5.6 3.2 -6.8 1.8 -8Z" fill="#7CC79A" />
    </g>
  )
  return (
    <svg viewBox="0 0 240 22" preserveAspectRatio="none" style={fill}>
      <path d="M0 9 C24 3 52 2 80 7 C104 11 126 12 150 8 C176 4 206 3 240 9 L240 22 L0 22Z" fill="#F5DBA8" />
      <path d="M80 7 C104 11 126 12 150 8 C132 14 108 15 80 7Z" fill="#EAC98C" />
      <path d="M0 15 C36 11 70 14 108 16 C150 18 196 12 240 15 L240 22 L0 22Z" fill="#EFD097" />
      {palm(22, 14, 0.9)}
      {house(30, 8.5, 8, 5.5, true)}
      {house(39, 10, 6, 4)}
      {house(46, 7.5, 7, 6.5)}
      {palm(57, 14.5, 1.1)}
      {palm(168, 15, 1)}
      {house(176, 9.5, 7, 5, true)}
      {house(184, 10.5, 5.5, 4)}
      {palm(196, 15, 0.8)}
    </svg>
  )
}

/** The bank: the green the river makes, between the sand and the water. Tiles every 240 units; 14 tall. */
export function Bank() {
  return (
    <svg viewBox="0 0 240 14" preserveAspectRatio="none" style={fill}>
      <path d="M0 4 C20 1.5 44 1 66 3 C92 5.4 118 5 144 3 C170 1 204 1.4 240 4 L240 14 L0 14Z" fill="#9BDFA3" />
      <path d="M0 8 C30 6 62 7.4 96 8.4 C132 9.4 180 6.6 240 8 L240 14 L0 14Z" fill="#7BD08E" />
      {/* grass tufts along the top */}
      <path
        d="M12 3.4 l1 -2.6 l0.8 2.4 l1.2 -2 l0.4 2.4Z M58 2.8 l0.8 -2.4 l0.9 2.2 l1.2 -1.8 l0.3 2.2Z M104 5.2 l1 -2.6 l0.8 2.4 l1.2 -2 l0.4 2.4Z M158 2.4 l0.8 -2.2 l0.9 2 l1.1 -1.7 l0.4 2.1Z M214 2.6 l1 -2.4 l0.8 2.2 l1.2 -1.9 l0.4 2.3Z"
        fill="#7BD08E"
      />
      {/* little pink flowers */}
      {[
        [26, 7],
        [84, 6.4],
        [132, 7.6],
        [188, 6],
        [226, 7.2],
      ].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="0.9" fill="#FFC4DA" />
          <circle cx={x} cy={y} r="0.35" fill="#FFE189" />
        </g>
      ))}
      {/* the wet edge */}
      <path d="M0 11.6 C40 10.6 80 11.8 120 11.4 C160 11 200 11.8 240 11.6 L240 14 L0 14Z" fill="#C7A27A" />
      <path d="M0 12.8 C40 12 80 13 120 12.6 C160 12.2 200 13 240 12.8 L240 14 L0 14Z" fill="#E9F8FF" opacity="0.9" />
    </svg>
  )
}

/** Light on the water: short streaks that slide by. Tiles every 160 units, as tall as the water. */
export function Ripples({ seed, opacity = 0.6 }: { seed: number; opacity?: number }) {
  const streaks = Array.from({ length: 14 }, (_, i) => {
    const r = (n: number) => {
      const v = Math.sin((i + 1) * 12.9898 * n + seed * 78.233) * 43758.5453
      return v - Math.floor(v)
    }
    return { x: (i / 14) * 160 + r(1) * 6, y: 6 + r(2) * 88, w: 5 + r(3) * 9 }
  })
  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="none" style={fill}>
      {streaks.map((s, i) => (
        <path key={i} d={`M${s.x} ${s.y} q${s.w / 2} -1.1 ${s.w} 0`} stroke="#fff" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity={opacity} vectorEffect="non-scaling-stroke" style={{ strokeWidth: 'calc(var(--u) * 0.7)' }} />
      ))}
    </svg>
  )
}

/** Papyrus and lily pads in front of everything, at the bottom of the screen. Tiles every 200 units; 15 tall. */
export function Foreground() {
  const papyrus = (x: number, h: number, lean: number) => (
    <g transform={`translate(${x} 15)`}>
      <path d={`M0 0 Q${lean * 0.4} ${-h * 0.5} ${lean} ${-h}`} stroke="#3E9E78" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <g transform={`translate(${lean} ${-h})`}>
        {[-70, -42, -18, 0, 18, 42, 70].map((a) => (
          <path key={a} d="M0 0 L0 -3.4" stroke="#69C19A" strokeWidth="0.55" strokeLinecap="round" transform={`rotate(${a})`} />
        ))}
        <circle r="0.8" fill="#3E9E78" />
      </g>
    </g>
  )
  return (
    <svg viewBox="0 0 200 15" preserveAspectRatio="xMidYMax meet" style={fill}>
      <ellipse cx="34" cy="13.4" rx="7" ry="1.5" fill="#5CC6A6" />
      <ellipse cx="46" cy="14.2" rx="5" ry="1.1" fill="#8FE3C8" />
      {papyrus(14, 11, 1.5)}
      {papyrus(19, 8, -1)}
      {papyrus(24, 12.5, 0.6)}
      <ellipse cx="118" cy="14" rx="6" ry="1.3" fill="#5CC6A6" />
      {papyrus(132, 9, -1.4)}
      {papyrus(137, 12, 0.8)}
      {papyrus(143, 7.5, 1.6)}
      <ellipse cx="176" cy="13.6" rx="5" ry="1.1" fill="#8FE3C8" />
    </svg>
  )
}

/** A happy sun. Tap it and its rays spin. */
export function Sun({ onTap }: { onTap: () => void }) {
  const rays = useAnimationControls()
  const glow = useId()
  return (
    <button
      aria-label="Sun"
      onPointerDown={(e) => {
        e.stopPropagation()
        onTap()
        void rays.start({ rotate: [0, 180], scale: [1, 1.25, 1], transition: { duration: 0.9, ease: 'easeOut' } })
      }}
      style={{ position: 'absolute', width: U(20), height: U(20), padding: 0, background: 'none', border: 'none', touchAction: 'none' }}
    >
      <svg viewBox="0 0 100 100" style={fill}>
        <defs>
          <radialGradient id={glow}>
            <stop offset="0.45" stopColor="#FFF6CC" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FFF6CC" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill={`url(#${glow})`} />
        <motion.g animate={rays} style={{ originX: '50px', originY: '50px' }}>
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d="M50 13 L46.5 22 L53.5 22Z" fill="#FFD766" transform={`rotate(${i * 36} 50 50)`} />
          ))}
        </motion.g>
        <circle cx="50" cy="50" r="24" fill="#FFE189" />
        <path d="M33 44 A24 24 0 0 1 58 27.4" stroke="#FFF6CC" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M39 49 q4 -4.5 8 0 M54 49 q4 -4.5 8 0" stroke="#B5762F" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M44 57 q6.5 6 13 0" stroke="#B5762F" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <ellipse cx="36.5" cy="56" rx="4" ry="2.6" fill="#FF9DB0" opacity="0.75" />
        <ellipse cx="64.5" cy="56" rx="4" ry="2.6" fill="#FF9DB0" opacity="0.75" />
      </svg>
    </button>
  )
}

/** A puffy cloud. Tap it and it squishes. */
export function Cloud({ size, onTap }: { size: number; onTap: () => void }) {
  const squish = useAnimationControls()
  return (
    <motion.button
      aria-label="Cloud"
      animate={squish}
      onPointerDown={(e) => {
        e.stopPropagation()
        onTap()
        void squish.start({ scaleX: [1, 1.25, 0.92, 1], scaleY: [1, 0.72, 1.1, 1], transition: { duration: 0.6 } })
      }}
      style={{ width: U(size), height: U(size * 0.5), padding: 0, background: 'none', border: 'none', touchAction: 'none', pointerEvents: 'auto' }}
    >
      <svg viewBox="0 0 120 60" style={fill}>
        <path d="M18 52 C4 52 2 36 16 33 C14 20 32 12 42 22 C48 6 76 6 80 24 C92 16 108 26 102 38 C116 40 114 52 102 52Z" fill="#fff" opacity="0.95" />
        <path d="M18 52 C8 52 4 44 9 38 C22 46 84 48 110 42 C112 47 109 52 102 52Z" fill="#E4DDF6" opacity="0.8" />
      </svg>
    </motion.button>
  )
}

/** A date palm on the bank. Tap it: it sways and drops a date in the river. */
export function Palm({ height, onTap }: { height: number; onTap: () => void }) {
  const sway = useAnimationControls()
  const date = useAnimationControls()
  const frond = (a: number, len: number, color: string) => <path d={`M0 0 C${len * 0.3} ${-len * 0.34} ${len * 0.76} ${-len * 0.3} ${len} ${len * 0.1} C${len * 0.7} ${-len * 0.08} ${len * 0.34} ${-len * 0.06} 0 0Z`} fill={color} transform={`rotate(${a})`} />
  return (
    <button
      aria-label="Palm tree"
      onPointerDown={(e) => {
        e.stopPropagation()
        onTap()
        void sway.start({ rotate: [0, 9, -6, 3, 0], transition: { duration: 1 } })
        void date.start({ y: [0, 0, 70], opacity: [1, 1, 0], transition: { duration: 0.75, times: [0, 0.2, 1], ease: 'easeIn' } }).then(() => date.set({ y: 0, opacity: 1 }))
      }}
      style={{ position: 'absolute', bottom: 0, width: U(height * 0.72), height: U(height), translate: '-50% 0', padding: 0, background: 'none', border: 'none', touchAction: 'none', pointerEvents: 'auto' }}
    >
      <svg viewBox="0 0 108 150" style={fill}>
        <motion.g animate={sway} style={{ originX: '50px', originY: '150px' }}>
          <path d="M43 150 C44 118 48 88 57 58 L66 60 C59 90 56 120 57 150Z" fill="#C99266" />
          <path d="M51.5 150 C52 120 55 90 61.5 59 L66 60 C59 90 56 120 57 150Z" fill="#A46E4B" />
          <path d="M45 128 L56.5 131 M46.5 106 L57.5 109 M49.5 86 L60 89 M53.5 70 L63 73" stroke="#A46E4B" strokeWidth="2.4" strokeLinecap="round" />
          <g transform="translate(61 58)">
            {frond(-158, 46, '#48A96C')}
            {frond(-22, 46, '#48A96C')}
            {frond(-126, 40, '#5FBE7B')}
            {frond(-54, 40, '#5FBE7B')}
            {frond(172, 42, '#73CF86')}
            {frond(-8, 42, '#73CF86')}
            {frond(-92, 34, '#8FDDA0')}
            <motion.g animate={date}>
              <ellipse cx="-9" cy="12" rx="4" ry="5.5" fill="#E57A35" />
            </motion.g>
            <g fill="#E57A35">
              <ellipse cx="-11" cy="6" rx="4" ry="5.5" />
              <ellipse cx="-4" cy="9" rx="4" ry="5.5" />
              <ellipse cx="8" cy="6" rx="4" ry="5.5" />
              <ellipse cx="13" cy="11" rx="4" ry="5.5" />
            </g>
            <g fill="#FF9C57">
              <ellipse cx="-7.5" cy="4" rx="3.2" ry="4.5" />
              <ellipse cx="11" cy="5" rx="3.2" ry="4.5" />
            </g>
            <circle r="6" fill="#A46E4B" />
          </g>
        </motion.g>
      </svg>
    </button>
  )
}

/** A clump of papyrus standing in the river: the boat rustles through it. */
export function Reeds() {
  const stalk = (x: number, h: number, lean: number, c: string) => (
    <g transform={`translate(${x} 128)`}>
      <path d={`M0 0 Q${lean * 0.3} ${-h * 0.5} ${lean} ${-h}`} stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" />
      <g transform={`translate(${lean} ${-h})`}>
        {[-72, -48, -24, 0, 24, 48, 72].map((a) => (
          <path key={a} d="M0 0 L0 -30" stroke={INK} strokeWidth="8" strokeLinecap="round" transform={`rotate(${a})`} />
        ))}
        {[-72, -48, -24, 0, 24, 48, 72].map((a) => (
          <path key={a} d="M0 0 L0 -30" stroke="#8FDDA0" strokeWidth="3.6" strokeLinecap="round" transform={`rotate(${a})`} />
        ))}
        <circle r="6" fill="#48A96C" {...ink(2.6)} />
      </g>
      <path d={`M0 0 Q${lean * 0.3} ${-h * 0.5} ${lean} ${-h}`} stroke={c} strokeWidth="4.4" fill="none" strokeLinecap="round" />
    </g>
  )
  return (
    <svg viewBox="0 0 140 140" style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}>
      <ellipse cx="70" cy="128" rx="60" ry="9" fill="#fff" opacity="0.55" />
      {stalk(34, 70, -12, '#5FBE7B')}
      {stalk(104, 78, 12, '#5FBE7B')}
      {stalk(54, 98, -5, '#73CF86')}
      {stalk(86, 88, 6, '#73CF86')}
      {stalk(70, 62, 1, '#8FDDA0')}
      <path d="M22 128 C40 121 100 121 118 128 C100 135 40 135 22 128Z" fill="#8FE3C8" {...ink(2.6)} />
    </svg>
  )
}

/** A little white duck, swimming to the left. */
export function Duck() {
  return (
    <svg viewBox="0 0 100 80" style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}>
      <ellipse cx="50" cy="68" rx="40" ry="6" fill="#fff" opacity="0.5" />
      <path d="M22 44 C22 60 36 68 56 68 C76 68 90 60 92 42 C82 48 70 46 62 40 C52 34 36 32 22 44Z" fill="#fff" {...ink(3)} />
      <path d="M52 48 C60 44 72 46 78 52 C70 58 58 58 52 48Z" fill="#E4DDF6" />
      <circle cx="28" cy="30" r="15" fill="#fff" {...ink(3)} />
      <path d="M15 30 L2 33 C2 38 8 40 16 37Z" fill="#FF9C57" {...ink(3)} />
      <circle cx="24" cy="26" r="2.8" fill={INK} />
      <ellipse cx="30" cy="35" rx="4" ry="2.6" fill="#FF9DB0" opacity="0.8" />
    </svg>
  )
}

/** A fish, drawn mid-leap (nose up). */
export function Fish() {
  return (
    <svg viewBox="0 0 80 50" style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}>
      <path d="M62 25 L78 10 C76 20 76 30 78 40Z" fill="#FF9C57" {...ink(3)} />
      <path d="M6 25 C16 8 44 6 64 25 C44 44 16 42 6 25Z" fill="#FFC83D" {...ink(3)} />
      <path d="M30 12 C36 4 46 4 50 12Z" fill="#FF9C57" {...ink(3)} />
      <path d="M40 19 C46 24 46 28 40 32" stroke="#EBA123" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="19" cy="22" r="3.2" fill={INK} />
      <circle cx="20" cy="21" r="1" fill="#fff" />
    </svg>
  )
}

/** The water wheel: clay pots on a wooden wheel scoop up the river and tip it into the field's channel. The loop turns
 *  the wheel through `wheelRef`. */
export function WaterWheel({ wheelRef, glow }: { wheelRef: Ref<SVGGElement>; glow: boolean }) {
  const POTS = 8
  return (
    <svg data-nile="wheel" viewBox="0 0 200 200" style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}>
      {glow && (
        <motion.circle cx="100" cy="96" r="84" fill="none" stroke="#FFD766" strokeWidth="9" animate={{ opacity: [0.9, 0.15, 0.9], scale: [0.96, 1.08, 0.96] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ originX: '100px', originY: '96px' }} />
      )}
      {/* the mud-brick stand and the chute that carries the water to the field */}
      <path d="M100 96 L72 196 L128 196Z" fill="#E5B78F" {...ink(5)} />
      <path d="M2 74 L74 84 L74 100 L2 90Z" fill="#C99266" {...ink(5)} />
      <path d="M6 79 L70 88" stroke="#8CCFFF" strokeWidth="6" strokeLinecap="round" />
      <g ref={wheelRef} style={{ transformOrigin: '100px 96px', transformBox: 'view-box' }}>
        <circle cx="100" cy="96" r="66" fill="none" stroke={INK} strokeWidth="19" />
        <circle cx="100" cy="96" r="66" fill="none" stroke="#D9A574" strokeWidth="10" />
        {Array.from({ length: 4 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 45} 100 96)`}>
            <rect x="34" y="90" width="132" height="12" rx="6" fill="#C99266" {...ink(4)} />
          </g>
        ))}
        {Array.from({ length: POTS }, (_, i) => (
          <g key={i} transform={`rotate(${i * (360 / POTS) + 22.5} 100 96) translate(100 30)`}>
            <path d="M-12 -12 H12 L9 10 C4 15 -4 15 -9 10Z" fill="#E9785A" {...ink(4)} />
            <path d="M-12 -12 H12" stroke="#F6A283" strokeWidth="4" strokeLinecap="round" />
          </g>
        ))}
        <circle cx="100" cy="96" r="13" fill="#FF8FB8" {...ink(4)} />
      </g>
    </svg>
  )
}

const CROPS = ['wheat', 'sprout', 'flower', 'wheat', 'sprout', 'wheat', 'flower', 'sprout', 'wheat'] as const

/** One plant in the field: it springs up when the water reaches it. */
function Crop({ kind, up }: { kind: (typeof CROPS)[number]; up: boolean }) {
  return (
    <motion.svg viewBox="0 0 40 70" initial={false} animate={{ scale: up ? 1 : 0, rotate: up ? [0, -6, 5, 0] : 0 }} transition={{ scale: { type: 'spring', bounce: 0.55, duration: 0.6 }, rotate: { duration: 0.7 } }} style={{ width: U(5.2), height: U(9.1), overflow: 'visible', transformOrigin: '50% 100%', flexShrink: 0 }}>
      {kind === 'wheat' && (
        <g>
          <path d="M20 70 V24" stroke="#48A96C" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 54 C10 50 8 42 8 38 C16 40 20 46 20 54Z M20 46 C30 42 32 34 32 30 C24 32 20 38 20 46Z" fill="#73CF86" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <ellipse cx="14.5" cy={22 - i * 8} rx="5" ry="6.5" fill="#FFC83D" transform={`rotate(-24 14.5 ${22 - i * 8})`} />
              <ellipse cx="25.5" cy={22 - i * 8} rx="5" ry="6.5" fill="#EBA123" transform={`rotate(24 25.5 ${22 - i * 8})`} />
            </g>
          ))}
          <ellipse cx="20" cy="2" rx="4.5" ry="6" fill="#FFC83D" />
        </g>
      )}
      {kind === 'sprout' && (
        <g>
          <path d="M20 70 V36" stroke="#48A96C" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 44 C4 42 0 28 2 20 C14 22 20 32 20 44Z" fill="#73CF86" />
          <path d="M20 40 C36 38 40 22 38 14 C26 16 20 28 20 40Z" fill="#8FDDA0" />
          <path d="M20 58 C10 58 6 50 6 46 C14 46 20 50 20 58Z" fill="#5FBE7B" />
        </g>
      )}
      {kind === 'flower' && (
        <g>
          <path d="M20 70 V30" stroke="#48A96C" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 56 C10 54 6 46 6 42 C14 42 20 48 20 56Z M20 50 C30 48 34 40 34 36 C26 36 20 42 20 50Z" fill="#73CF86" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="20" cy="9" rx="6.5" ry="9" fill={a % 144 === 0 ? '#FF8FB8' : '#FFC4DA'} transform={`rotate(${a} 20 20)`} />
          ))}
          <circle cx="20" cy="20" r="5.5" fill="#FFD766" />
        </g>
      )}
    </motion.svg>
  )
}

/** A thirsty little plant, drooping in the dry field until the water comes. */
function Wilted({ gone }: { gone: boolean }) {
  return (
    <motion.svg viewBox="0 0 40 40" initial={false} animate={{ scale: gone ? 0 : 1 }} style={{ position: 'absolute', left: '50%', bottom: 0, width: U(5), height: U(5), marginLeft: U(-2.5), overflow: 'visible', transformOrigin: '50% 100%' }}>
      <path d="M20 40 C20 28 21 20 27 15 C31 12 35 15 35 20" stroke="#B89460" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M35 20 C32 24 28 25 26 23 C28 19 31 18 35 20Z M22 28 C17 28 13 25 12 21 C17 20 21 23 22 28Z" fill="#CDAE78" />
    </motion.svg>
  )
}

/** A farm field on the bank: dry and pale, its plants drooping, until the wheel's water runs down its furrows (from
 *  the right, where the wheel is). Then it turns green, with a plant springing up for every bit of water. `water` is 0..1. */
export function Field({ water }: { water: number }) {
  const n = CROPS.length
  const up = Math.round(water * n)
  const clip = useId()
  const SOIL = 'M14 16 H466 Q478 16 478 28 V86 Q478 98 466 98 H14 Q2 98 2 86 V28 Q2 16 14 16Z'
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 480 100" preserveAspectRatio="none" style={fill}>
        <defs>
          <clipPath id={clip}>
            <path d={SOIL} />
          </clipPath>
        </defs>
        <path d={SOIL} fill="#DDB483" />
        <g clipPath={`url(#${clip})`}>
          <rect x="0" y="86" width="480" height="14" fill="#C99B66" />
          {/* the green spreads from the wheel's side */}
          <rect x={480 - 480 * water} y="0" width="480" height="100" fill="#8FDDA0" />
          <rect x={480 - 480 * water} y="86" width="480" height="14" fill="#73CF86" />
          {[36, 55, 74].map((y, i) => (
            <g key={y}>
              <path d={`M26 ${y} C140 ${y - 4} 340 ${y - 4} 454 ${y}`} stroke="#C4955F" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d={`M26 ${y} C140 ${y - 4} 340 ${y - 4} 454 ${y}`} stroke="#8CCFFF" strokeWidth="6" strokeLinecap="round" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={-(1 - Math.min(1, water * (1.15 + i * 0.1)))} style={{ transition: 'stroke-dashoffset 0.4s' }} />
            </g>
          ))}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: '5%', right: '5%', bottom: '58%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {CROPS.map((kind, i) => (
          // the water comes from the right: the plants nearest the wheel sprout first
          <div key={i} style={{ position: 'relative', display: 'flex' }}>
            <Wilted gone={n - i <= up} />
            <Crop kind={kind} up={n - i <= up} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** The number of plants in a field (a note plays for each one that sprouts). */
export const CROP_COUNT = CROPS.length

