// The world map, and the app's home screen: tap continents to hear their names, tap a country pin to fly there,
// tap home for Sparkle's tea party. The two buttons in the top bar swap the map for the game shelf (Shelf.tsx: a card
// per place with every game as an icon, straight in, filling the screen with the dock floating over it); she keeps
// whichever she used last (#/world?view=list or map opens one).
// No title and no trophy room here (Dad, 2026-10-29): the map is the picture, the dock beside it is the way in.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import posthog, { isPostHogEnabled } from '../posthog'
import { gameLogger } from '../posthog-logger'
import { go } from '../router'
import { firstTime as firstTimeHere, lineText, Mascot, say, sounds, useOnline, useSaved } from '../sdk'
import { useTrophies } from '../sdk/trophies'
import balloon from './assets/balloon.webp'
import mapArt from './assets/bg-world-map.webp'
import { DOCK, MapIcon, ShelfIcon } from './HomeIcons'
import { FitBox } from './kit/Chrome'
import { WORLD_LINES } from './lines'
import { places, type PlaceEntry } from './registry'
import { FROM_SHELF, Shelf } from './Shelf'
import { totalStamps, usePassport } from './stamps'
import { Travel } from './Travel'

// Hotspots in % of the map picture (x, y = centre; w, h = size).
const CONTINENTS: { key: keyof typeof WORLD_LINES.continents; x: number; y: number; w: number; h: number }[] = [
  { key: 'northAmerica', x: 17, y: 26, w: 26, h: 30 },
  { key: 'southAmerica', x: 25, y: 64, w: 15, h: 30 },
  { key: 'europe', x: 50, y: 24, w: 16, h: 16 },
  { key: 'africa', x: 49, y: 56, w: 18, h: 32 },
  { key: 'asia', x: 76, y: 27, w: 34, h: 30 },
  { key: 'australia', x: 85, y: 71, w: 16, h: 18 },
  { key: 'antarctica', x: 50, y: 95, w: 80, h: 10 },
]

const COMING_SOON: { id: keyof typeof WORLD_LINES.soon; emoji: string; x: number; y: number }[] = [
  { id: 'egypt', emoji: '🐪', x: 53, y: 42 },
  { id: 'thailand', emoji: '🐘', x: 74, y: 49 },
]
const HOME = { x: 19, y: 33 }
// Sparkle's house on the map is where her tea party is (the one game from before Around the World).
const TEA_PARTY = 'unicorn-tea-party'

function Pin({ x, y, children, label, onTap, glow, dim }: { x: number; y: number; children: ReactNode; label: string; onTap: () => void; glow?: boolean; dim?: boolean }) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.85 }}
      animate={glow ? { y: [0, -8, 0] } : {}}
      transition={{ repeat: Infinity, duration: 1.4 }}
      onClick={(e) => {
        e.stopPropagation()
        onTap()
      }}
      style={{
        // The button is the tap target and keeps its full size; the circle drawn inside it is smaller (82%,
        // 2026-10-27), so the map looks less crowded without making the pins harder to hit.
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        translate: '-50% -50%',
        width: 'clamp(56px, 11cqw, var(--target))',
        aspectRatio: '1',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontSize: 'clamp(23px, 4.5cqw, 40px)',
        zIndex: 3,
      }}
    >
      <span
        className={glow ? 'world-glow' : undefined}
        style={{
          position: 'relative',
          width: '82%',
          aspectRatio: '1',
          borderRadius: '50%',
          background: dim ? 'rgba(255,255,255,0.75)' : '#fff',
          border: `4px solid ${glow ? 'var(--gold)' : '#fff'}`,
          boxShadow: 'var(--shadow)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {children}
      </span>
    </motion.button>
  )
}

type View = 'map' | 'list'

export function WorldMap({ view: linked }: { view?: string }) {
  const passport = usePassport()
  const trophies = useTrophies()
  const online = useOnline() // the Theater needs the internet
  const [label, setLabel] = useState<{ text: string; x: number; y: number } | null>(null)
  const [travelTo, setTravelTo] = useState<PlaceEntry | null>(null)
  const [saved, setView] = useSaved<View>('world:view', 'map')
  // A link's ?view= wins until she taps the other button.
  const [fromLink, setFromLink] = useState<View | undefined>(linked === 'list' || linked === 'map' ? linked : undefined)
  useEffect(() => {
    if (linked === 'list' || linked === 'map') setFromLink(linked)
  }, [linked])
  const view = fromLink ?? saved
  const firstTime = passport.visited.length === 0

  useEffect(() => {
    // Back on the world map: a game opened from here again goes back to the country's map.
    try {
      sessionStorage.removeItem(FROM_SHELF)
    } catch {
      // No session storage.
    }
    // Only on arrival, and once per visit to the app (she comes back here after every country).
    const hello = view === 'list' ? WORLD_LINES.shelf.hello : firstTime ? WORLD_LINES.firstHello : WORLD_LINES.hello
    if (firstTimeHere(`world:${lineText(hello)}`)) void say(hello, { interrupt: false })
  }, [firstTime])

  const switchTo = (next: View) => {
    if (next === view) return
    sounds.pop()
    setLabel(null)
    setFromLink(undefined)
    setView(next)
    void say(next === 'list' ? WORLD_LINES.shelf.showList : WORLD_LINES.shelf.showMap)
  }

  const show = (text: string, x: number, y: number) => {
    sounds.pop()
    setLabel({ text, x, y })
    void say(text)
  }

  const dock = (
    <>
      <DockButton label="My passport" word="Passport" {...DOCK.passport} badge={totalStamps(passport)} onClick={() => go.world('passport')} />
      <DockButton label="Coloring book" word="Coloring" {...DOCK.coloring} onClick={() => go.world('coloring')} />
      <DockButton label="Puzzle book" word="Puzzles" {...DOCK.puzzles} onClick={() => go.world('puzzles')} />
      {online && <DockButton label="Theater" word="Movies" {...DOCK.theater} onClick={() => go.world('theater')} />}
    </>
  )
  const toggle = (
    <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 12px)', right: 16, display: 'flex', borderRadius: 999, padding: 4, gap: 4, background: 'rgba(255,255,255,0.92)', boxShadow: 'var(--shadow)', zIndex: 50 }}>
      <ViewButton label="Map" on={view === 'map'} onClick={() => switchTo('map')} icon={(c) => <MapIcon color={c} />} />
      <ViewButton label="All the games" on={view === 'list'} onClick={() => switchTo('list')} icon={(c) => <ShelfIcon color={c} />} />
    </div>
  )

  if (view === 'list') {
    // The shelf is the whole screen and scrolls as one page; the toggle and the dock float over it (Sparkle waves
    // from the favorites card instead of under the map). The map view floats the same dock.
    return (
      <div className="screen decorated world-list" style={{ padding: 0, overflow: 'hidden' }}>
        <Shelf />
        <div className="shelf-topfade" />
        {toggle}
        <div className="shelf-dock">{dock}</div>
      </div>
    )
  }

  return (
    <div className="screen decorated world-map" style={{ overflow: 'hidden' }}>
      {toggle}

      <div className="world-split" style={{ flex: 1, minHeight: 0, gap: 'min(16px, 2vh)', alignItems: 'center' }}>
        <FitBox ratio={1.5}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow)', border: '5px solid #fff', background: `url(${mapArt}) center / cover` }} onClick={() => setLabel(null)}>
            {CONTINENTS.map((c) => (
              <button
                key={c.key}
                aria-label={c.key}
                onClick={(e) => {
                  e.stopPropagation()
                  show(WORLD_LINES.continents[c.key], c.x, c.y)
                }}
                style={{ position: 'absolute', left: `${c.x - c.w / 2}%`, top: `${c.y - c.h / 2}%`, width: `${c.w}%`, height: `${c.h}%`, borderRadius: '50%' }}
              />
            ))}
          </div>

          {/* Home (Sparkle's tea party) + Sparkle's balloon */}
          <Pin
            x={HOME.x}
            y={HOME.y}
            label="Tea party"
            onTap={() => {
              const won = trophies.some((t) => t.gameId === TEA_PARTY)
              if (isPostHogEnabled) posthog.capture('game_session_started', { game_id: TEA_PARTY, previously_completed: won })
              gameLogger.sessionStarted(TEA_PARTY, won)
              sounds.sparkle()
              void say(WORLD_LINES.teaParty)
              go.game(TEA_PARTY)
            }}
          >
            🏡
            <span style={{ position: 'absolute', right: '-22%', bottom: '-18%', width: '58%', aspectRatio: '1', borderRadius: '50%', background: 'var(--pink)', border: '3px solid #fff', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', fontSize: '75%' }}>🫖</span>
          </Pin>
          <motion.img
            src={balloon}
            alt=""
            animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{ position: 'absolute', left: `${HOME.x + 5}%`, top: `${HOME.y - 26}%`, width: '9%', zIndex: 2 }}
          />

          {places.map(({ meta }) => (
            <Pin
              key={meta.id}
              x={meta.mapPos.x}
              y={meta.mapPos.y}
              label={meta.name}
              glow
              onTap={() => {
                sounds.sparkle()
                setTravelTo(places.find((p) => p.meta.id === meta.id) ?? null)
              }}
            >
              {meta.emoji}
            </Pin>
          ))}
          {COMING_SOON.filter((c) => !places.some((p) => p.meta.id === c.id)).map((c) => (
            <Pin key={c.id} x={c.x} y={c.y} label={`${c.id} coming soon`} dim onTap={() => show(WORLD_LINES.soon[c.id], c.x, c.y)}>
              <span style={{ opacity: 0.55 }}>{c.emoji}</span>
              <span style={{ position: 'absolute', right: '-14%', bottom: '-14%', fontSize: '55%' }}>☁️</span>
            </Pin>
          ))}

          <AnimatePresence>
            {label && (
              <motion.div
                key={label.text}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{
                  position: 'absolute',
                  left: `${Math.min(80, Math.max(20, label.x))}%`,
                  top: `${label.y > 50 ? label.y - 14 : label.y + 12}%`,
                  translate: '-50% -50%',
                  background: '#fff',
                  borderRadius: 999,
                  padding: '8px 20px',
                  fontSize: 'clamp(16px, 3cqw, 30px)',
                  fontWeight: 700,
                  color: 'var(--hotpink)',
                  boxShadow: 'var(--shadow)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              >
                {label.text.split('!')[0]}!
              </motion.div>
            )}
          </AnimatePresence>
        </FitBox>

        <div className="world-side" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'min(20px, 3vw)', flexShrink: 0 }}>
          <div className="world-side-mascot">
            <Mascot pose="wave" size={Math.min(170, window.innerHeight * 0.12)} />
          </div>
        </div>
      </div>

      {/* The same floating dock as the game list. */}
      <div className="shelf-dock">{dock}</div>

      {travelTo && <Travel entry={travelTo} onDone={() => go.world(travelTo.meta.id)} />}
    </div>
  )
}

function ViewButton({ icon, label, on, onClick }: { icon: (color: string) => ReactNode; label: string; on: boolean; onClick: () => void }) {
  // The button keeps the full touch size (88 px on iPad, 72 on phones); only the picture shrinks when it's off.
  const size = 'calc(var(--btn) + 12px)'
  return (
    <motion.button
      aria-label={label}
      aria-pressed={on}
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      style={{ width: size, height: size, borderRadius: '50%', background: on ? 'var(--hotpink)' : 'transparent', padding: 'calc(var(--btn) * 0.28)', display: 'grid', placeItems: 'center', transition: 'background 0.2s' }}
    >
      <motion.div animate={{ scale: on ? 1 : 0.86 }} style={{ width: '100%', height: '100%' }}>
        {icon(on ? '#fff' : 'var(--lavender-dark)')}
      </motion.div>
    </motion.button>
  )
}

/** One of the home dock's buttons: a matte colored tile with a white picture and its word under it (the word is for Dad). */
function DockButton({ Icon, label, word, color, shade, onClick, badge }: { Icon: (p: { shade: string }) => ReactNode; label: string; word: string; color: string; shade: string; onClick: () => void; badge?: number }) {
  return (
    <motion.button
      aria-label={label}
      className="world-dock-tile"
      whileTap={{ scale: 0.92, y: 4 }}
      onClick={() => {
        sounds.pop()
        onClick()
      }}
      style={{
        // An explicit width and height: WebKit ignores aspect-ratio on a flex button and stretches it. The size (--tile)
        // comes from world.css: smaller in the shelf's floating dock.
        position: 'relative',
        flex: '0 0 auto',
        width: 'var(--tile)',
        height: 'var(--tile)',
        borderRadius: 'clamp(22px, 3.4vmin, 34px)',
        background: color,
        boxShadow: `0 6px 0 ${shade}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'calc(var(--tile) * 0.04)',
        padding: 0,
        color: '#fff',
      }}
    >
      <span style={{ display: 'block', width: 'calc(var(--tile) * 0.56)', height: 'calc(var(--tile) * 0.56)' }}>
        <Icon shade={shade} />
      </span>
      <span className="world-dock-word" style={{ fontWeight: 700, fontSize: 'clamp(13px, 2.1vmin, 20px)', lineHeight: 1, letterSpacing: 0.3 }}>
        {word}
      </span>
      {badge !== undefined && badge > 0 && (
        <span style={{ position: 'absolute', top: -8, right: -8, background: '#fff', color: shade, borderRadius: 999, minWidth: 38, height: 38, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 21, boxShadow: `0 3px 0 ${shade}55`, padding: '0 8px' }}>{badge}</span>
      )}
    </motion.button>
  )
}
