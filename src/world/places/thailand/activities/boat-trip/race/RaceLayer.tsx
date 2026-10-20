// What the boat race shows over the 3D lagoon (race.ts sends its state as RaceHud), all pictures and big numbers so
// nothing needs reading:
// - The countdown: three lights and a giant 3, 2, 1, GO!
// - Her place (a medal with 1st / 2nd / 3rd) and everyone's faces in order, the lap (🏁 2/3) and her coins, and a
//   minimap of the course with the three boats on it (race.ts moves the dots).
// - The item slot, a big button bottom right: it spins when she drives through a box, then shows 🚀, 🍌 or 🌈 until she
//   taps it (a finger points at it if she forgets).
// - Banners sweeping across: lap 2, the last lap, 1st!
// - The podium: the trophy with KAYLEE on it (the SDK's own, as in her Trophy Room), then 🔁 race again or 🚤 back to the
//   bay.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { bigCelebration, Trophy } from '../../../../../../sdk'
import { sfx } from '../../../sfx'
import { ITEM_ICONS, type ItemKind } from './items'
import type { RaceHud, RacerId } from './race'
import { MAP, MAP_PATH } from './track'

export const RACE_TROPHY = 'Boat Race Champion'

const FACES: Record<RacerId, { icon: string; color: string; label: string }> = {
  kaylee: { icon: '🦄', color: 'var(--hotpink)', label: 'Kaylee' },
  kids: { icon: '🐃', color: '#7FB2E8', label: 'The village kids' },
  monkey: { icon: '🐒', color: '#F2C24C', label: 'The macaque' },
}
const MEDALS = ['#FFC83D', '#D9DDEA', '#E8A87C']
const SUFFIX = ['st', 'nd', 'rd']
const ROLL: ItemKind[] = ['turbo', 'banana', 'rainbow']

interface Props {
  hud: RaceHud
  onItem: () => void
  onAgain: () => void
  onBay: () => void
  /** The minimap's dots, by racer id (race.ts moves them). */
  mapEls: Map<string, SVGElement>
}

const pill = { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.92)', borderRadius: 999, padding: '4px 14px', boxShadow: 'var(--shadow)', fontWeight: 700, color: 'var(--ink)', fontSize: 'clamp(22px, 4vmin, 34px)' } as const

export function RaceLayer({ hud, onItem, onAgain, onBay, mapEls }: Props) {
  const racing = hud.phase === 'race' || hud.phase === 'count' || hud.phase === 'finish'
  // Confetti on the screen too, as she wins.
  const celebrated = useRef(false)
  useEffect(() => {
    if (hud.phase !== 'finish' || celebrated.current) return
    celebrated.current = true
    bigCelebration()
  }, [hud.phase])
  return (
    <>
      {racing && <Standings hud={hud} />}
      {racing && <LapAndMap hud={hud} mapEls={mapEls} />}
      {(hud.phase === 'race' || hud.phase === 'count') && <ItemSlot item={hud.item} rolling={hud.rolling} onItem={onItem} />}
      <Countdown count={hud.count} />
      <Banner banner={hud.banner} />
      {hud.phase === 'podium' && <Podium trophy={hud.trophy} onAgain={onAgain} onBay={onBay} />}
    </>
  )
}

function Standings({ hud }: { hud: RaceHud }) {
  const i = hud.place - 1
  return (
    // (Under the back button, even on a short phone screen.)
    <div style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 12px)', top: 'var(--bar-clear)', display: 'flex', alignItems: 'flex-start', gap: 10, zIndex: 31, pointerEvents: 'none' }}>
      <motion.div
        key={hud.place}
        aria-label={`Place ${hud.place}`}
        initial={{ scale: 1.5, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 12 }}
        style={{ width: 'clamp(76px, 13vmin, 112px)', height: 'clamp(76px, 13vmin, 112px)', borderRadius: '50%', background: MEDALS[i], border: '5px solid #fff', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', color: 'var(--ink)', fontWeight: 700, lineHeight: 1 }}
      >
        <span style={{ fontSize: 'clamp(40px, 7.5vmin, 64px)' }}>
          {hud.place}
          <span style={{ fontSize: '0.45em', verticalAlign: 'top' }}>{SUFFIX[i]}</span>
        </span>
      </motion.div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {hud.order.map((id) => (
          <motion.div
            layout
            key={id}
            aria-label={FACES[id].label}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{ width: id === 'kaylee' ? 'clamp(40px, 6.5vmin, 54px)' : 'clamp(34px, 5.5vmin, 46px)', height: id === 'kaylee' ? 'clamp(40px, 6.5vmin, 54px)' : 'clamp(34px, 5.5vmin, 46px)', borderRadius: '50%', background: FACES[id].color, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(43,35,48,.25)', display: 'grid', placeItems: 'center', fontSize: id === 'kaylee' ? 'clamp(22px, 4vmin, 32px)' : 'clamp(18px, 3.4vmin, 26px)' }}
          >
            {FACES[id].icon}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function LapAndMap({ hud, mapEls }: { hud: RaceHud; mapEls: Map<string, SVGElement> }) {
  return (
    <div style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 12px)', top: 'var(--top-clear)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, zIndex: 31, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div aria-label={`Coins ${hud.coins}`} style={pill}>
          🪙 {hud.coins}
        </div>
        <motion.div key={hud.lap} aria-label={`Lap ${hud.lap} of 3`} initial={{ scale: 1.4 }} animate={{ scale: 1 }} style={pill}>
          🏁 {hud.lap}
          <span style={{ opacity: 0.55, fontSize: '0.75em' }}>/3</span>
        </motion.div>
      </div>
      <svg
        aria-hidden
        viewBox={`-4 -4 ${MAP.w + 8} ${MAP.h + 8}`}
        className="race-map"
        style={{ width: 'clamp(110px, 18vmin, 180px)', background: 'rgba(255,255,255,.75)', borderRadius: 18, boxShadow: 'var(--shadow)', padding: 4 }}
      >
        <path d={MAP_PATH} fill="none" stroke="#8FE3C8" strokeWidth={9} strokeLinejoin="round" />
        <path d={MAP_PATH} fill="none" stroke="#FFFFFF" strokeWidth={2} strokeDasharray="3 3" />
        {(['monkey', 'kids', 'kaylee'] as RacerId[]).map((id) => (
          <circle
            key={id}
            ref={(el) => {
              if (el) mapEls.set(id, el)
              else mapEls.delete(id)
            }}
            r={id === 'kaylee' ? 5.5 : 4.2}
            fill={FACES[id].color}
            stroke="#fff"
            strokeWidth={1.6}
          />
        ))}
      </svg>
      {/* Short screens (an iPhone on its side) have no room for the map. */}
      <style>{'@media (max-height: 520px) { .race-map { display: none } }'}</style>
    </div>
  )
}

function ItemSlot({ item, rolling, onItem }: { item: ItemKind | null; rolling: boolean; onItem: () => void }) {
  const [spin, setSpin] = useState(0)
  useEffect(() => {
    if (!rolling) return
    const id = setInterval(() => setSpin((n) => n + 1), 80)
    return () => clearInterval(id)
  }, [rolling])
  // Holding an item a while without using it: a finger shows her the button.
  const [nudge, setNudge] = useState(false)
  useEffect(() => {
    setNudge(false)
    if (!item) return
    const t = setTimeout(() => setNudge(true), 5000)
    return () => clearTimeout(t)
  }, [item])
  const icon = rolling ? ITEM_ICONS[ROLL[spin % ROLL.length]] : item ? ITEM_ICONS[item] : null
  // An empty slot tapped: a boop and a wiggle (it fills from the rainbow boxes).
  const [poked, setPoked] = useState(0)
  const size = 'clamp(104px, 17vmin, 140px)'
  return (
    <div style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 18px)', bottom: 'calc(var(--safe-bottom) + 18px)', zIndex: 34 }}>
      <motion.button
        aria-label={item ? `Use the ${item}` : 'Item'}
        key={item ? 'full' : `empty-${poked}`}
        whileTap={{ scale: 0.85 }}
        animate={item ? { scale: [1, 1.1, 1], rotate: [0, -6, 6, 0] } : poked ? { rotate: [0, -10, 10, -6, 0] } : { scale: 1 }}
        transition={item ? { repeat: Infinity, duration: 0.9 } : { duration: 0.45 }}
        onPointerDown={(e) => {
          // At once, on the finger going down (she's racing: no waiting for it to lift).
          e.stopPropagation()
          if (!item) {
            sfx.boop()
            setPoked((n) => n + 1)
            return
          }
          sfx.pop()
          onItem()
        }}
        style={{
          width: size,
          height: size,
          borderRadius: 28,
          border: '6px solid #fff',
          background: item ? 'conic-gradient(from 0deg, #FF4F9A, #FFB07A, #FBEA9A, #8FE3C8, #A8DCFF, #B9A6F5, #FF4F9A)' : 'rgba(255,255,255,.55)',
          boxShadow: item ? '0 0 0 6px rgba(255,200,61,.6), 0 0 26px 8px rgba(255,79,154,.45)' : 'var(--shadow)',
          fontSize: 'clamp(54px, 9vmin, 76px)',
          display: 'grid',
          placeItems: 'center',
          padding: 0,
          touchAction: 'none',
        }}
      >
        {icon ?? <span style={{ opacity: 0.35, fontWeight: 700, color: 'var(--ink)' }}>?</span>}
      </motion.button>
      {nudge && (
        <motion.div aria-hidden animate={{ x: [0, -12, 0], y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.9 }} style={{ position: 'absolute', left: -62, top: '20%', fontSize: 54, pointerEvents: 'none', rotate: '90deg' }}>
          👆
        </motion.div>
      )}
    </div>
  )
}

function Countdown({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count >= 0 && (
        <motion.div key="lights" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.35 } }} style={{ position: 'absolute', left: 0, right: 0, top: '18%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 35, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', gap: 10, background: 'var(--ink)', borderRadius: 999, padding: '8px 14px', boxShadow: 'var(--shadow)' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 'clamp(30px, 5vmin, 44px)', height: 'clamp(30px, 5vmin, 44px)', borderRadius: '50%', background: count === 0 ? '#5BE37A' : i < 4 - count ? '#FF4F5E' : '#4A3F4F', boxShadow: count === 0 ? '0 0 16px #5BE37A' : 'none' }} />
            ))}
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div key={count} initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 14 }} style={{ fontSize: count === 0 ? 'clamp(90px, 20vmin, 180px)' : 'clamp(110px, 24vmin, 210px)', fontWeight: 700, color: count === 0 ? '#5BE37A' : '#fff', WebkitTextStroke: '6px var(--ink)', paintOrder: 'stroke', lineHeight: 1, textShadow: '0 8px 0 rgba(43,35,48,.25)' }}>
              {count === 0 ? 'GO!' : count}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Banner({ banner }: { banner: RaceHud['banner'] }) {
  const [shown, setShown] = useState<RaceHud['banner']>(null)
  useEffect(() => {
    if (!banner) return
    setShown(banner)
    const t = setTimeout(() => setShown(null), banner.kind === 'win' ? 3200 : 2000)
    return () => clearTimeout(t)
  }, [banner?.n])
  const text = shown?.kind === 'win' ? '🏆 1st!' : shown?.kind === 'final' ? '🏁 Last lap!' : '🏁 Lap 2'
  return (
    <AnimatePresence>
      {shown && (
        <motion.div key={shown.n} initial={{ x: '-110vw', rotate: -4 }} animate={{ x: 0, rotate: -2 }} exit={{ x: '110vw', rotate: 2 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }} style={{ position: 'absolute', left: 0, right: 0, top: '30%', display: 'grid', placeItems: 'center', zIndex: 36, pointerEvents: 'none' }}>
          <div style={{ background: shown.kind === 'win' ? 'var(--gold)' : 'var(--hotpink)', color: '#fff', border: '6px solid #fff', borderRadius: 30, padding: '8px 36px', fontSize: shown.kind === 'win' ? 'clamp(64px, 14vmin, 130px)' : 'clamp(44px, 9vmin, 84px)', fontWeight: 700, boxShadow: 'var(--shadow)', WebkitTextStroke: shown.kind === 'win' ? '3px var(--ink)' : undefined, paintOrder: 'stroke' }}>
            {text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Podium({ trophy, onAgain, onBay }: { trophy: boolean; onAgain: () => void; onBay: () => void }) {
  // The trophy card comes up big for a moment, then tucks into the corner so the podium shows.
  // The buttons come up almost at once (something to touch while the trophy floats down).
  const [big, setBig] = useState(true)
  const [buttons, setButtons] = useState(false)
  useEffect(() => {
    const b = setTimeout(() => setButtons(true), 900)
    return () => clearTimeout(b)
  }, [])
  useEffect(() => {
    if (!trophy) return
    const a = setTimeout(() => setBig(false), 2800)
    return () => clearTimeout(a)
  }, [trophy])
  return (
    <>
      <AnimatePresence>
        {trophy && (
          <motion.div
            key="trophy"
            layout
            aria-label={`Trophy: ${RACE_TROPHY}`}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: big ? 0 : -6 }}
            transition={{ type: 'spring', bounce: 0.45 }}
            style={{ position: 'absolute', zIndex: 40, pointerEvents: 'none', ...(big ? { left: '50%', top: 'var(--bar-clear)', translate: '-50% 0' } : { left: 'calc(var(--safe-left, 0px) + 12px)', top: 'var(--top-clear)' }) }}
          >
            <Trophy title={RACE_TROPHY} size={big ? Math.round(Math.min(220, window.innerHeight * 0.24, window.innerWidth * 0.36)) : 110} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {buttons && (
          <motion.div key="buttons" initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 18px)', display: 'flex', justifyContent: 'center', gap: 'clamp(14px, 3vw, 28px)', zIndex: 38 }}>
            <motion.button aria-label="Race again" whileTap={{ scale: 0.88 }} onClick={onAgain} style={{ width: 'clamp(92px, 14vmin, 116px)', height: 'clamp(92px, 14vmin, 116px)', borderRadius: '50%', border: '5px solid #fff', background: 'var(--lavender)', fontSize: 'clamp(40px, 7vmin, 54px)', boxShadow: 'var(--shadow)', padding: 0 }}>
              🔁
            </motion.button>
            <motion.button
              aria-label="Back to the bay"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              whileTap={{ scale: 0.88 }}
              onClick={onBay}
              style={{ minWidth: 'clamp(140px, 24vmin, 200px)', height: 'clamp(92px, 14vmin, 116px)', borderRadius: 999, border: '5px solid #fff', background: 'var(--mint)', fontSize: 'clamp(40px, 7vmin, 54px)', boxShadow: '0 0 0 6px rgba(255,79,154,.45), var(--shadow)', padding: '0 22px' }}
            >
              🚤▶
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** Between the bay and the race lagoon: a checkered flag waves across the screen (it hides the next world being
 *  built, like the trip's boarding pass). */
export function RaceFlag() {
  useEffect(() => {
    sfx.whoosh(0.7)
  }, [])
  return (
    <motion.div
      key="flag"
      aria-label="Race flag"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      style={{ position: 'absolute', inset: 0, zIndex: 60, overflow: 'hidden', background: 'repeating-conic-gradient(#2B2330 0% 25%, #FFFFFF 0% 50%) 0 0 / clamp(80px, 14vmin, 140px) clamp(80px, 14vmin, 140px)', display: 'grid', placeItems: 'center' }}
    >
      <motion.div
        aria-hidden
        initial={{ scale: 0.3, rotate: -30 }}
        animate={{ scale: [0.3, 1.15, 1], rotate: [-30, 8, -4] }}
        transition={{ duration: 0.6 }}
        style={{ width: 'clamp(160px, 34vmin, 260px)', height: 'clamp(160px, 34vmin, 260px)', borderRadius: '50%', background: 'var(--hotpink)', border: '8px solid #fff', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', fontSize: 'clamp(80px, 17vmin, 130px)' }}
      >
        🏁
      </motion.div>
    </motion.div>
  )
}
