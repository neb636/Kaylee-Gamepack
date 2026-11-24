// Who else lives on the bay, each drawn by hand in the flat look (no outlines; a base, a shade and a light; ink only
// for eyes and little smiles): the tour boat, the Inca tern with her curly white mustache, the kelp, the jellyfish,
// the red Sally Lightfoot crab and the pelican (flying and afloat). Scene.tsx gives them their taps and their motion.
import { motion } from 'motion/react'

const INK = '#2b2330'
const BLUSH = '#ff8fb8'
const fill = { width: '100%', height: '100%', display: 'block', overflow: 'visible' } as const

function Eye({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={r * 0.88} ry={r} fill={INK} />
      <circle cx={x + r * 0.3} cy={y - r * 0.36} r={r * 0.36} fill="#fff" />
    </>
  )
}

/** The tour boat (box 200 x 112, waterline at y = 92): white hull, pink stripe, lavender canopy, Peru's flag. */
export function BoatArt({ wave }: { wave: number }) {
  return (
    <svg viewBox="0 0 200 112" style={fill}>
      {/* Peru's flag on the stern. */}
      <path d="M26 72V22" stroke="#efdccd" strokeWidth="4" strokeLinecap="round" />
      <motion.g animate={{ skewY: [0, 5, 0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }} style={{ originX: 0, originY: 0.5 }}>
        <rect x="28" y="22" width="30" height="20" rx="2" fill="#fff" />
        <path d="M28 24a2 2 0 0 1 2-2h8v20h-8a2 2 0 0 1-2-2Z" fill="#ff6b6b" />
        <path d="M48 22h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-8Z" fill="#ff6b6b" />
      </motion.g>
      {/* Canopy posts, and the friends on board (they bounce when the horn toots). */}
      <path d="M66 70V40M116 70V40M166 70V40" stroke="#fff7f0" strokeWidth="5" strokeLinecap="round" />
      <motion.g key={wave} animate={wave ? { y: [0, -9, 0, -5, 0] } : {}} transition={{ duration: 0.7 }}>
        <path d="M82 50l-3 -9l7 5ZM96 50l3 -9l-7 5Z" fill="#fff7f0" />
        <circle cx="89" cy="58" r="11" fill="#fff7f0" />
        <Eye x={85.5} y={57} r={2.1} />
        <Eye x={92.5} y={57} r={2.1} />
        <ellipse cx="89" cy="62.5" rx="2.4" ry="1.5" fill={BLUSH} />
        <circle cx="133" cy="50" r="4.6" fill="#a46e4b" />
        <circle cx="149" cy="50" r="4.6" fill="#a46e4b" />
        <circle cx="141" cy="58" r="11" fill="#c99266" />
        <ellipse cx="141" cy="62" rx="5" ry="3.6" fill="#f5dba8" />
        <Eye x={137.5} y={57} r={2.1} />
        <Eye x={144.5} y={57} r={2.1} />
      </motion.g>
      {/* The hull. */}
      <path d="M8 66H192Q190 86 172 94H34Q14 90 8 66Z" fill="#fff7f0" />
      <path d="M12 78Q100 86 189 76Q184 90 172 94H34Q18 90 12 78Z" fill="#e4ddf6" />
      <path d="M8 66H192L190 75H10Z" fill="#ff8fb8" />
      <circle cx="60" cy="84" r="4" fill="#8ccfff" />
      <circle cx="100" cy="85" r="4" fill="#8ccfff" />
      <circle cx="140" cy="84" r="4" fill="#8ccfff" />
      {/* The canopy, scalloped. */}
      <path d="M52 28Q116 12 180 28V40q-8 9 -16 0q-8 9 -16 0q-8 9 -16 0q-8 9 -16 0q-8 9 -16 0q-8 9 -16 0q-8 9 -16 0q-8 9 -16 0Z" fill="#b9a6f5" />
      <path d="M52 28Q116 12 180 28V31Q116 17 52 31Z" fill="#ddd2ff" />
      {/* Where she sits in the water. */}
      <path d="M0 95q10 -7 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

/** A music note, for the boat's horn. */
export function Note() {
  return (
    <svg viewBox="0 0 30 40" style={fill}>
      <path d="M12 30V6l14 -4v22" fill="none" stroke="#ff4f9a" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="7.5" cy="31" rx="6.5" ry="5" fill="#ff4f9a" />
      <ellipse cx="21.5" cy="25" rx="6.5" ry="5" fill="#ff4f9a" />
    </svg>
  )
}

/** The Inca tern (box 145 x 120, feet on y = 118, facing right): slate grey, red beak and feet, a curly white mustache. */
export function TernArt({ twirl }: { twirl: number }) {
  return (
    <svg viewBox="0 0 145 120" style={fill}>
      <path d="M62 98V113M78 99V113" stroke="#ff6b6b" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M54 116h14M71 116h14" stroke="#ff6b6b" strokeWidth="5" strokeLinecap="round" />
      <path d="M44 74L4 58L12 72L0 80L40 92Z" fill="#55506f" />
      <ellipse cx="68" cy="78" rx="38" ry="24" fill="#77719a" transform="rotate(-10 68 78)" />
      <path d="M40 92C58 106 92 102 104 84C88 96 62 98 40 92Z" fill="#9a94b8" />
      <path d="M34 70C50 54 86 58 96 80C76 92 48 90 34 70Z" fill="#55506f" />
      <path d="M46 70C58 62 76 64 84 74" fill="none" stroke="#77719a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="50" r="21" fill="#77719a" />
      <path d="M79.5 46A21 21 0 0 1 120.5 46Q100 36 79.5 46Z" fill="#55506f" />
      <path d="M116 44L144 54L116 62Z" fill="#ff6b6b" />
      <path d="M116 54H144L116 62Z" fill="#d9485e" />
      <circle cx="115" cy="60" r="5" fill="#ffc83d" />
      <motion.path key={twirl} d="M112 60C96 60 86 68 85 80C84.5 89 95 90 94 82" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" animate={twirl ? { rotate: [0, 24, -18, 10, 0] } : {}} transition={{ duration: 0.7 }} style={{ originX: 1, originY: 0 }} />
      <circle cx="104" cy="47" r="5.6" fill="#fff7f0" />
      <Eye x={104.5} y={47} r={4} />
    </svg>
  )
}

const STIPES = [
  { x: 36, top: 70, amp: 12, ph: 0.4, c: ['#2b7a5f', '#3e9e78', '#69c19a'], d: 0 },
  { x: 62, top: 14, amp: 15, ph: 2.2, c: ['#3e9e78', '#5cc6a6', '#aee8b7'], d: 0.7 },
  { x: 88, top: 104, amp: 10, ph: 4, c: ['#2b7a5f', '#48a96c', '#73cf86'], d: 1.3 },
]
/** Giant kelp (box 120 x 287, rooted at the bottom middle): three stems of broad blades and float bulbs, each swaying. */
export function KelpArt() {
  return (
    <svg viewBox="0 0 120 287" style={fill}>
      {STIPES.map((s, i) => {
        const len = 287 - s.top
        const at = (t: number) => ({ x: s.x + Math.sin(t * Math.PI * 2.2 + s.ph) * s.amp * t, y: 287 - len * t })
        let d = ''
        for (let k = 0; k <= 20; k++) {
          const p = at(k / 20)
          d += `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`
        }
        const n = Math.round(len / 34)
        const blades = Array.from({ length: n }, (_, k) => ({ ...at((k + 0.9) / (n + 0.3)), side: (k + i) % 2 ? 1 : -1 }))
        const tip = at(1)
        return (
          <motion.g key={i} animate={{ rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3.6 + i * 0.5, delay: s.d, ease: 'easeInOut' }} style={{ originX: 0.5, originY: 1 }}>
            {blades.map((b, k) => (
              <g key={k} transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${b.side * -38})`}>
                <path d={`M0 0C${b.side * 12} -17 ${b.side * 34} -15 ${b.side * 46} -2C${b.side * 34} 9 ${b.side * 12} 12 0 0Z`} fill={s.c[1]} />
                <path d={`M${b.side * 8} -2Q${b.side * 24} -8 ${b.side * 38} -3`} fill="none" stroke={s.c[2]} strokeWidth="3" strokeLinecap="round" />
              </g>
            ))}
            <path d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}c-9 -14 -4 -26 2 -30c7 6 9 18 -2 30Z`} fill={s.c[1]} />
            <path d={d} fill="none" stroke={s.c[0]} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            {blades.map((b, k) => (
              <circle key={k} cx={b.x.toFixed(1)} cy={b.y.toFixed(1)} r="6" fill={s.c[2]} />
            ))}
          </motion.g>
        )
      })}
    </svg>
  )
}

/** The jellyfish (box 100 x 119): a lavender bell with a face, pink tentacles that wave. */
export function JellyArt() {
  return (
    <svg viewBox="0 0 100 119" style={fill}>
      {[24, 41, 59, 76].map((x, i) => (
        <motion.path key={x} d={`M${x} 52q-9 14 0 28t0 ${i % 2 ? 26 : 32}`} fill="none" stroke={i % 2 ? '#ffc4da' : '#ff8fb8'} strokeWidth="6.5" strokeLinecap="round" animate={{ skewX: [-7, 7, -7] }} transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.25, ease: 'easeInOut' }} style={{ originX: 0.5, originY: 0 }} />
      ))}
      <path d="M10 52C8 24 28 6 50 6C72 6 92 24 90 52Q80 62 70 54Q60 63 50 54Q40 63 30 54Q20 62 10 52Z" fill="#b9a6f5" />
      <path d="M62 8C84 16 93 36 90 52Q84 58 78 57C84 40 78 20 62 8Z" fill="#937ee0" />
      <path d="M22 34C24 22 34 14 46 13" fill="none" stroke="#ddd2ff" strokeWidth="6" strokeLinecap="round" />
      <circle cx="70" cy="22" r="3.6" fill="#ddd2ff" />
      <circle cx="78" cy="34" r="2.6" fill="#ddd2ff" />
      <Eye x={38} y={38} r={4.6} />
      <Eye x={60} y={38} r={4.6} />
      <ellipse cx="29" cy="46" rx="5.5" ry="3.4" fill={BLUSH} opacity="0.75" />
      <ellipse cx="69" cy="46" rx="5.5" ry="3.4" fill={BLUSH} opacity="0.75" />
      <path d="M44 44.500Q49 49.5 54 44.5" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

/** The Sally Lightfoot crab (box 125 x 100, feet on y = 98): red, sunny spots, claws up, eyes on stalks. */
export function CrabArt() {
  const legs = [
    'M36 66L16 62L8 78',
    'M34 74L14 78L10 94',
    'M40 80L26 90L26 98',
  ]
  return (
    <svg viewBox="0 0 125 100" style={fill}>
      {[1, -1].map((s) => (
        <g key={s} transform={s < 0 ? 'translate(125 0) scale(-1 1)' : undefined}>
          {legs.map((d) => (
            <path key={d} d={d} fill="none" stroke="#d9485e" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {/* The claw: an arm up, a round fist with a pinch in it. */}
          <path d="M34 58L20 44" stroke="#d9485e" strokeWidth="9" strokeLinecap="round" />
          <path d="M20 46A15 15 0 1 1 31 21L20 30L33 31A15 15 0 0 1 20 46Z" fill="#ff6b6b" transform="rotate(-18 20 32)" />
          <circle cx="14" cy="28" r="3.6" fill="#ffa3a3" />
          <path d={`M${50} 46L${46} 30`} stroke="#ff6b6b" strokeWidth="5" strokeLinecap="round" />
        </g>
      ))}
      <ellipse cx="62.5" cy="66" rx="34" ry="24" fill="#ff6b6b" />
      <path d="M92 54C102 70 90 88 62.5 90C82 86 94 72 92 54Z" fill="#d9485e" />
      <path d="M38 58C42 50 52 45 62 44.5" fill="none" stroke="#ffa3a3" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="80" cy="58" r="3" fill="#ffe189" />
      <circle cx="86" cy="68" r="2.3" fill="#ffe189" />
      <circle cx="41" cy="72" r="2.6" fill="#ffe189" />
      {[46, 79].map((x) => (
        <g key={x}>
          <circle cx={x} cy="27" r="8" fill="#fff7f0" />
          <Eye x={x + 0.5} y={27.5} r={4.6} />
        </g>
      ))}
      <ellipse cx="46" cy="72" rx="6" ry="3.6" fill={BLUSH} opacity="0.7" />
      <ellipse cx="79" cy="72" rx="6" ry="3.6" fill={BLUSH} opacity="0.7" />
      <path d="M56 70Q62.5 77 69 70" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

const PEL = ['#8d86a8', '#6f6889', '#aaa3c2'] as const
/** The pelican on the wing (box 240 x 151, facing right; the point 120,96 is what the game moves). */
export function PelicanFlyArt() {
  return (
    <svg viewBox="0 0 240 151" style={fill}>
      {/* The far wing, the tail, the trailing feet. */}
      <path d="M124 82C132 50 156 26 190 16C184 30 188 40 180 48C186 54 176 64 170 66C160 80 140 90 124 82Z" fill={PEL[1]} />
      <path d="M84 92L50 80L56 94L46 104L82 104Z" fill={PEL[1]} />
      <path d="M62 104l-16 8M70 106l-14 12" stroke="#ff9c57" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="120" cy="96" rx="50" ry="26" fill={PEL[0]} />
      <path d="M78 104C100 124 150 124 168 102C150 114 104 116 78 104Z" fill={PEL[1]} />
      {/* Neck and head, tucked back the way pelicans fly. */}
      <path d="M150 84C168 74 172 60 180 54L196 70C186 80 180 96 162 104Z" fill="#fbea9a" />
      <circle cx="188" cy="56" r="19" fill="#fbea9a" />
      <path d="M176 42C170 34 174 26 182 30C182 22 192 22 192 32Z" fill="#fff6cc" />
      <path d="M200 52L239 68L200 66Z" fill="#ffc595" />
      <path d="M198 62L239 68C232 92 204 96 194 76Z" fill="#ff8fb8" />
      <path d="M204 70Q220 76 234 70" fill="none" stroke="#e7699c" strokeWidth="3" strokeLinecap="round" />
      <Eye x={192} y={52} r={4.6} />
      <ellipse cx="184" cy="64" rx="6" ry="3.6" fill={BLUSH} opacity="0.7" />
      {/* The near wing, beating. */}
      <motion.g animate={{ rotate: [-10, 16, -10] }} transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }} style={{ originX: 0.9, originY: 0.95 }}>
        <path d="M134 92C120 54 84 22 36 6C40 22 34 30 42 40C32 46 44 58 50 60C46 70 60 76 68 76C72 88 100 100 134 92Z" fill={PEL[0]} />
        <path d="M36 6C40 22 34 30 42 40C32 46 44 58 50 60C46 70 60 76 68 76C60 60 50 34 36 6Z" fill={PEL[1]} />
        <path d="M70 40C92 52 108 68 120 86" fill="none" stroke={PEL[2]} strokeWidth="6" strokeLinecap="round" />
      </motion.g>
    </svg>
  )
}

/** The pelican afloat (box 200 x 157, facing left, the waterline at y = 140): his big pouch resting on his chest. */
export function PelicanFloatArt() {
  return (
    <svg viewBox="0 0 200 157" style={fill}>
      <path d="M166 100L198 74L192 100L200 112L170 122Z" fill={PEL[1]} />
      <path d="M64 142C52 110 76 84 122 84C166 84 190 108 180 142Z" fill={PEL[0]} />
      <path d="M94 104C116 88 160 92 176 122C150 136 112 130 94 104Z" fill={PEL[1]} />
      <path d="M108 106C124 98 148 100 160 114M116 118C130 114 146 116 156 124" fill="none" stroke={PEL[2]} strokeWidth="5" strokeLinecap="round" />
      {/* Neck, head and the tuft at the back of it. */}
      <path d="M70 136C56 112 84 92 80 66L104 60C114 88 96 110 104 132Z" fill="#fbea9a" />
      <path d="M96 62C108 88 92 110 104 132L92 134C84 112 98 90 86 64Z" fill="#ecc95c" opacity="0.6" />
      <circle cx="86" cy="50" r="24" fill="#fbea9a" />
      <path d="M102 34C112 28 112 18 104 20C108 10 96 10 94 22Z" fill="#fff6cc" />
      {/* The bill and its pouch. */}
      <path d="M66 42L4 88L70 62Z" fill="#ffc595" />
      <path d="M72 58L4 88C10 122 58 126 78 96Z" fill="#ff8fb8" />
      <path d="M16 92Q40 104 66 86" fill="none" stroke="#e7699c" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M22 98C30 110 50 112 62 104" fill="none" stroke="#ffc4da" strokeWidth="4" strokeLinecap="round" />
      <Eye x={80} y={44} r={5.4} />
      <ellipse cx="92" cy="58" rx="7" ry="4.2" fill={BLUSH} opacity="0.7" />
      {/* Ripples where he sits. */}
      <path d="M40 142q10 -7 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}
