// What every race shows over its 3D world (the boat race, the Nan Mountain Cup), all pictures and big numbers so
// nothing needs reading. The race sends its state (RaceHud) when it changes; the minimap's dots are moved by the race
// itself every frame (by racer id).
// - Standings: her place (a medal with 1st / 2nd / 3rd / 4th) and everyone's faces in order.
// - Coins, the lap (🏁 2/3, only a race in laps) and a minimap of the course with every racer on it.
// - The countdown: three lights and a giant 3, 2, 1, GO!
// - Banners sweeping across: lap 2, the last lap, 1st!, 2nd!
// - RaceFlag: a checkered flag over the whole screen, hiding the race's world being built.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { sfx } from '../../sfx'
import type { CourseMap } from './course'

export type RacePhase = 'intro' | 'count' | 'race' | 'finish' | 'podium'
export type BannerKind = 'lap2' | 'final' | 'win' | 'second'

/** What the screen shows: sent when it changes. */
export interface RaceHud<Id extends string = string> {
  phase: RacePhase
  /** The countdown: 3, 2, 1, then 0 for GO! (-1: none showing). */
  count: number
  /** Her lap (1 in a race with no laps). */
  lap: number
  /** Her place, from 1, and everyone in order. */
  place: number
  order: Id[]
  coins: number
  /** A big word sweeping across (`n` changes each time). */
  banner: { kind: BannerKind; n: number } | null
  /** On the podium, the trophy is in her hands. */
  trophy: boolean
}

/** A racer's face on the standings and its dot on the minimap. */
export interface Face {
  icon: string
  color: string
  label: string
}

const MEDALS = ['#FFC83D', '#D9DDEA', '#E8A87C', '#C9C3D8']
const SUFFIX = ['st', 'nd', 'rd', 'th']

export const pill = { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', borderRadius: 999, padding: '3px 14px', border: '3px solid var(--ink)', boxShadow: 'var(--talk-drop)', fontWeight: 700, color: 'var(--ink)', fontSize: 'clamp(22px, 4vmin, 34px)' } as const

export function Standings<Id extends string>({ hud, faces, me }: { hud: RaceHud<Id>; faces: Record<Id, Face>; me: Id }) {
  const i = Math.min(hud.place, MEDALS.length) - 1
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
            aria-label={faces[id].label}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{ width: id === me ? 'clamp(40px, 6.5vmin, 54px)' : 'clamp(34px, 5.5vmin, 46px)', height: id === me ? 'clamp(40px, 6.5vmin, 54px)' : 'clamp(34px, 5.5vmin, 46px)', borderRadius: '50%', background: faces[id].color, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(43,35,48,.25)', display: 'grid', placeItems: 'center', fontSize: id === me ? 'clamp(22px, 4vmin, 32px)' : 'clamp(18px, 3.4vmin, 26px)' }}
          >
            {faces[id].icon}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/** Coins, the lap (with `laps`) and the minimap: `dots` in drawing order (her own last, on top), each registered in
 *  `mapEls` for the race to move. */
export function CoinsAndMap<Id extends string>({ hud, laps, map, dots, faces, me, mapEls, road = '#8FE3C8' }: { hud: RaceHud<Id>; laps?: number; map: CourseMap; dots: Id[]; faces: Record<Id, Face>; me: Id; mapEls: Map<string, SVGElement>; road?: string }) {
  return (
    <div style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 12px)', top: 'var(--top-clear)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, zIndex: 31, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div aria-label={`Coins ${hud.coins}`} style={pill}>
          🪙 {hud.coins}
        </div>
        {laps && (
          <motion.div key={hud.lap} aria-label={`Lap ${hud.lap} of ${laps}`} initial={{ scale: 1.4 }} animate={{ scale: 1 }} style={pill}>
            🏁 {hud.lap}
            <span style={{ opacity: 0.55, fontSize: '0.75em' }}>/{laps}</span>
          </motion.div>
        )}
      </div>
      <svg aria-hidden viewBox={`-4 -4 ${map.w + 8} ${map.h + 8}`} className="race-map" style={{ width: 'clamp(110px, 18vmin, 180px)', background: 'rgba(255,255,255,.75)', borderRadius: 18, boxShadow: 'var(--shadow)', padding: 4 }}>
        <path d={map.path} fill="none" stroke={road} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
        <path d={map.path} fill="none" stroke="#FFFFFF" strokeWidth={2} strokeDasharray="3 3" />
        {dots.map((id) => (
          <circle
            key={id}
            ref={(el) => {
              if (el) mapEls.set(id, el)
              else mapEls.delete(id)
            }}
            r={id === me ? 5.5 : 4.2}
            fill={faces[id].color}
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

export function Countdown({ count }: { count: number }) {
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

const BANNERS: Record<BannerKind, string> = { win: '🏆 1st!', second: '🥈 2nd!', final: '🏁 Last lap!', lap2: '🏁 Lap 2' }

export function Banner({ banner, texts }: { banner: RaceHud['banner']; texts?: Partial<Record<BannerKind, string>> }) {
  const [shown, setShown] = useState<RaceHud['banner']>(null)
  useEffect(() => {
    if (!banner) return
    setShown(banner)
    const t = setTimeout(() => setShown(null), banner.kind === 'win' || banner.kind === 'second' ? 3200 : 2000)
    return () => clearTimeout(t)
  }, [banner?.n])
  const big = shown?.kind === 'win' || shown?.kind === 'second'
  return (
    <AnimatePresence>
      {shown && (
        <motion.div key={shown.n} initial={{ x: '-110vw', rotate: -4 }} animate={{ x: 0, rotate: -2 }} exit={{ x: '110vw', rotate: 2 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }} style={{ position: 'absolute', left: 0, right: 0, top: '30%', display: 'grid', placeItems: 'center', zIndex: 36, pointerEvents: 'none' }}>
          <div style={{ background: shown.kind === 'win' ? 'var(--gold)' : shown.kind === 'second' ? '#C9CFE0' : 'var(--hotpink)', color: '#fff', border: '6px solid #fff', borderRadius: 30, padding: '8px 36px', fontSize: big ? 'clamp(64px, 14vmin, 130px)' : 'clamp(44px, 9vmin, 84px)', fontWeight: 700, boxShadow: 'var(--shadow)', WebkitTextStroke: big ? '3px var(--ink)' : undefined, paintOrder: 'stroke' }}>
            {texts?.[shown.kind] ?? BANNERS[shown.kind]}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Between a world and a race: a checkered flag waves across the screen (it hides the next world being built, like
 *  the trip's boarding pass). */
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
