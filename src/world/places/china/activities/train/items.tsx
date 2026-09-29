// The things Kaylee hands to Bao Bao and the tiger, drawn in SVG with the China ink so they can sit ON the puppet and
// move with it: `ItemIcon` is the picture in the tray (100x100 box), `wearFor` builds the clothes Bao Bao is wearing
// (in her 400x480 viewBox: head, body and arm parts, see BaoBaoWear), and `Scarf` goes around the tiger's neck.
import type { BaoBaoWear } from '../../puppets/BaoBao'
import { INK } from '../../puppets/ink'

export type ItemId = 'mittens' | 'hat' | 'scarf' | 'sunhat' | 'swimring' | 'water' | 'blanket' | 'coat'

const PINK = '#FF8FB1'
const PINK_D = '#F0658F'
const LAV = '#B7A4F0'
const RED = '#F0596B'
const SUN = '#FBE3A0'
const SUN_D = '#F2CC72'
const BLUE = '#7CC7F2'
const S = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const T = { ...S, strokeWidth: 3 }

/** One mitten, cuff at the top (y -34), fingers down; the thumb sticks out to the right. */
const Mitten = () => (
  <g>
    <path {...S} fill={PINK} d="M-17 -30 L-17 20 C-17 42 17 42 17 20 L17 -30Z" />
    <path {...S} fill={PINK} d="M17 -6 C36 -8 42 10 30 18 L17 14Z" />
    <rect {...S} fill="#fff" x="-21" y="-46" width="42" height="24" rx="10" />
    <path {...T} d="M-9 -44 L-9 -24 M3 -44 L3 -24 M13 -44 L13 -24" />
    <circle cx="0" cy="8" r="5" fill="#fff" opacity="0.8" />
  </g>
)

const Beanie = () => (
  <g>
    <path {...S} fill={PINK} d="M-72 30 C-72 -56 72 -56 72 30Z" />
    <path {...T} d="M-36 -18 L-42 28 M0 -30 L0 28 M36 -18 L42 28" opacity="0.5" />
    <rect {...S} fill="#fff" x="-78" y="18" width="156" height="36" rx="18" />
    <path {...T} d="M-50 22 L-50 50 M-25 22 L-25 50 M0 22 L0 50 M25 22 L25 50 M50 22 L50 50" />
    <circle {...S} fill="#fff" cx="0" cy="-52" r="21" />
  </g>
)

const SunHat = () => (
  <g>
    <ellipse {...S} fill={SUN} cx="0" cy="12" rx="112" ry="28" />
    <path {...S} fill={SUN} d="M-52 10 C-56 -52 56 -52 52 10 C30 24 -30 24 -52 10Z" />
    <path {...S} fill={PINK} d="M-53 2 C-25 16 25 16 53 2 L52 -12 C25 4 -25 4 -52 -12Z" />
    <path {...S} fill={PINK_D} d="M38 0 L66 -14 L62 12Z M38 0 L58 26 L50 4Z" />
    <path {...T} stroke={SUN_D} d="M-80 14 Q-60 24 -40 26 M60 26 Q80 22 96 14" />
  </g>
)

const Ring = ({ w = 34 }: { w?: number }) => (
  <g fill="none">
    <ellipse {...S} strokeWidth={w + 10} cx="0" cy="0" rx="96" ry="46" />
    <ellipse stroke={PINK} strokeWidth={w} cx="0" cy="0" rx="96" ry="46" />
    <ellipse stroke="#fff" strokeWidth={w} cx="0" cy="0" rx="96" ry="46" strokeDasharray="38 38" />
    <path stroke="#fff" opacity="0.55" strokeWidth="6" strokeLinecap="round" d="M-70 -26 Q-40 -44 -10 -40" />
  </g>
)

const Bottle = () => (
  <g>
    <rect {...S} fill="#fff" x="-9" y="-46" width="18" height="12" rx="4" />
    <path {...S} fill={BLUE} d="M-13 -34 L13 -34 L20 -20 L20 38 C20 46 -20 46 -20 38 L-20 -20Z" />
    <path {...T} d="M-20 -6 L20 -6 M-20 20 L20 20" />
    <path d="M-10 -20 L-10 30" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
  </g>
)

const BLANKET = 'M86 330 C130 300 270 300 314 330 L338 452 C300 478 100 478 62 452Z'
const Blanket = () => (
  <g>
    <path {...S} fill={LAV} d={BLANKET} />
    <path {...T} stroke="#fff" strokeWidth="9" d="M104 350 Q200 370 296 350 M96 396 Q200 418 304 396" />
    {[[130, 372], [200, 386], [270, 372], [116, 424], [200, 440], [284, 424]].map(([x, y]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r="7" fill="#fff" opacity="0.9" />
    ))}
  </g>
)

const COAT = 'M90 324 C130 306 270 306 310 324 L326 436 C292 458 108 458 74 436Z'
const Coat = () => (
  <g>
    <path {...S} fill={RED} d={COAT} />
    <path {...T} d="M200 330 L200 452" />
    {[366, 398, 430].map((y) => (
      <circle key={y} {...T} fill="#fff" cx="186" cy={y} r="8" />
    ))}
    <ellipse {...S} fill="#fff" cx="200" cy="326" rx="72" ry="20" />
  </g>
)

/** The picture in the tray (fits a 100x100 box). */
export function ItemIcon({ id }: { id: ItemId }) {
  const g = (t: string, kids: React.ReactNode) => <g transform={t}>{kids}</g>
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block', pointerEvents: 'none' }}>
      {id === 'mittens' && (
        <>
          {g('translate(32 56) rotate(-12) scale(0.85)', <Mitten />)}
          {g('translate(68 54) scale(-0.85 0.85) rotate(-10)', <Mitten />)}
        </>
      )}
      {id === 'hat' && g('translate(50 56) scale(0.55)', <Beanie />)}
      {id === 'sunhat' && g('translate(50 50) scale(0.42)', <SunHat />)}
      {id === 'swimring' && g('translate(50 50) scale(0.44 0.78)', <Ring w={38} />)}
      {id === 'water' && g('translate(50 52) scale(1.05)', <Bottle />)}
      {id === 'scarf' && <ScarfShape />}
      {id === 'blanket' && (
        <g>
          <rect {...S} fill={LAV} x="14" y="24" width="72" height="54" rx="10" />
          <path {...T} stroke="#fff" strokeWidth="6" d="M20 40 L80 40 M20 56 L80 56" />
          <path {...S} fill="#D8CCFA" d="M14 24 L86 24 L86 34 C60 44 40 44 14 34Z" />
          <path {...T} d="M22 78 L22 88 M34 78 L34 88 M46 78 L46 88 M58 78 L58 88 M70 78 L70 88 M80 78 L80 88" />
        </g>
      )}
      {id === 'coat' && g('translate(50 50) scale(0.42) translate(-200 -390)', <Coat />)}
    </svg>
  )
}

function ScarfShape() {
  return (
    <g>
      <path {...S} fill={RED} d="M14 30 C40 20 60 20 86 30 L86 46 C60 38 40 38 14 46Z" />
      <path {...S} fill={RED} d="M62 40 L82 40 L86 86 L64 90Z" />
      <path {...T} stroke="#fff" strokeWidth="6" d="M28 26 L28 44 M46 24 L46 42 M64 26 L64 44 M70 62 L82 60 M71 74 L84 72" />
      <path {...T} d="M64 90 L62 98 M72 90 L72 98 M80 88 L82 96" />
    </g>
  )
}

/** A scarf for the tiger (a box that is positioned over his neck). */
export function Scarf() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}>
      <ScarfShape />
    </svg>
  )
}

/** What Bao Bao is wearing right now (`worn`), plus the water bottle while she drinks. */
export function wearFor(worn: ItemId[], drinking: boolean): BaoBaoWear {
  const has = (i: ItemId) => worn.includes(i)
  return {
    head: has('hat') ? (
      <g transform="translate(200 84) scale(0.96)">
        <Beanie />
      </g>
    ) : has('sunhat') ? (
      <g transform="translate(200 84) scale(0.98)">
        <SunHat />
      </g>
    ) : undefined,
    body: (
      <>
        {has('blanket') && <Blanket />}
        {has('coat') && <Coat />}
        {has('swimring') && (
          <g transform="translate(200 392)">
            <Ring />
          </g>
        )}
        {drinking && (
          <g transform="translate(232 306) rotate(-38) scale(1.5)">
            <Bottle />
          </g>
        )}
      </>
    ),
    arm: has('mittens') ? (
      <g transform="translate(0 62)">
        <Mitten />
      </g>
    ) : has('coat') ? (
      <g>
        <rect {...S} fill={RED} x="-27" y="-4" width="54" height="66" rx="20" />
        <rect {...S} fill="#fff" x="-29" y="52" width="58" height="18" rx="9" />
      </g>
    ) : undefined,
  }
}
