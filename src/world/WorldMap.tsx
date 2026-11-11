// The world map, and the app's home screen: a toy board of the whole world in 3D (board/): her countries stand up out
// of it in their real shapes with an animal riding a pin over each; tap one and Sparkle's balloon flies there. Tap a
// continent to hear its name. The two buttons in the top bar swap the map for the game shelf (Shelf.tsx: a card
// per place with every game as an icon, straight in, filling the screen with the dock floating over it); she keeps
// whichever she used last (#/world?view=list or map opens one).
// No title and no trophy room here (Dad, 2026-10-29): the map is the picture, the dock beside it is the way in.
import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { go } from '../router'
import { firstTime as firstTimeHere, lineText, Mascot, say, sounds, useOnline, useSaved } from '../sdk'
import type { ContinentId } from './board/geo'
import { DOCK, MapIcon, ShelfIcon } from './HomeIcons'
import { WORLD_LINES } from './lines'
import { needsCode } from './lock'
import { places } from './registry'
import { FROM_SHELF, Shelf } from './Shelf'
import { totalStamps, usePassport } from './stamps'
import { useHalloween } from '../shell/season'
import { HalloweenArt } from '../shell/Halloween'

// The board brings three.js, so it loads after the home screen is up (the sky shows meanwhile).
const BoardView = lazy(() => import('./board/BoardView'))

/** Where Sparkle's balloon waits: over the place she last flew to (this session). */
const BALLOON = 'world:balloon'
const balloonAt = () => {
  try {
    return sessionStorage.getItem(BALLOON)
  } catch {
    return null
  }
}

type View = 'map' | 'list'

export function WorldMap({ view: linked }: { view?: string }) {
  const halloween = useHalloween()
  const passport = usePassport()
  const online = useOnline() // the Theater needs the internet
  // The pill that names what she tapped (a continent, at her finger; a country, along the bottom), for Dad.
  const [label, setLabel] = useState<{ text: string; x?: number; y?: number } | null>(null)
  const labelTimer = useRef(0)
  const [startAt] = useState(balloonAt)
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

  const show = (text: string, x?: number, y?: number) => {
    setLabel({ text, x, y })
    clearTimeout(labelTimer.current)
    if (x !== undefined) labelTimer.current = window.setTimeout(() => setLabel(null), 2600)
  }
  useEffect(() => () => clearTimeout(labelTimer.current), [])

  /** She picked a country: Sparkle names it while the balloon flies there, and its code starts downloading. */
  const fly = (id: string) => {
    const entry = places.find((p) => p.meta.id === id)
    if (!entry) return
    sounds.sparkle()
    setTimeout(() => sounds.whoosh(), 250)
    void say(WORLD_LINES.fly[id as keyof typeof WORLD_LINES.fly] ?? WORLD_LINES.takeoff)
    show(`${entry.meta.name}!`)
    if (!needsCode(id)) void entry.load() // (a locked one can't yet)
    try {
      sessionStorage.setItem(BALLOON, id)
    } catch {
      // No session storage: the balloon starts from home next time.
    }
  }
  const tapContinent = (id: ContinentId, x: number, y: number) => {
    sounds.pop()
    const text = WORLD_LINES.continents[id]
    void say(text)
    show(`${text.split('!')[0]}!`, x, y)
  }
  const names = Object.fromEntries(places.map((p) => [p.meta.id, p.meta.name]))
  const finished = places.filter(({ meta }) => meta.activities.length > 0 && meta.activities.every((a) => passport.stamps[meta.id]?.includes(a.id))).map((p) => p.meta.id)

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
      <div className={`screen decorated world-list${halloween ? ' halloween' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
        <Shelf />
        <div className="shelf-topfade" />
        {toggle}
        <div className="shelf-dock">{dock}</div>
      </div>
    )
  }

  return (
    <div className={`screen world-map${halloween ? ' halloween' : ''}`} style={{ padding: 0, overflow: 'hidden', background: 'linear-gradient(#BFE6FF, #E4DCFF 55%, #FFD9EC)' }}>
      <Suspense fallback={null}>
        <BoardView names={names} done={finished} balloonAt={startAt} onPick={fly} onArrive={(id) => go.world(id)} onContinent={tapContinent} onTouch={() => label?.x !== undefined && setLabel(null)} />
      </Suspense>
      {toggle}

      <AnimatePresence>
        {label && (
          <motion.div
            key={label.text}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              position: 'absolute',
              ...(label.x === undefined
                ? { left: '50%', bottom: 'calc(var(--safe-bottom) + var(--dock-h) + 5vh)', translate: '-50% 0', fontSize: 'clamp(26px, 5vw, 48px)', padding: '10px 30px' }
                : { left: `clamp(110px, ${label.x}px, calc(100% - 110px))`, top: Math.max(70, (label.y ?? 0) - 64), translate: '-50% -50%', fontSize: 'clamp(16px, 2.6vw, 28px)', padding: '8px 20px' }),
              background: '#fff',
              borderRadius: 999,
              fontWeight: 700,
              color: 'var(--hotpink)',
              boxShadow: 'var(--shadow)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 45,
            }}
          >
            {label.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle waves from the corner (the board's own Sparkle is up in her balloon). */}
      <div className={`world-board-mascot${halloween ? ' halloween-map-friends' : ''}`}>
        {halloween && <span aria-hidden="true"><HalloweenArt kind="pumpkin" /></span>}
        <Mascot pose="wave" size={Math.min(150, window.innerHeight * 0.13)} />
        {halloween && <span aria-hidden="true"><HalloweenArt kind="ghost" /></span>}
      </div>

      {/* The same floating dock as the game list. */}
      <div className="shelf-dock">{dock}</div>
    </div>
  )
}

function ViewButton({ icon, label, on, onClick }: { icon: (color: string) => ReactNode; label: string; on: boolean; onClick: () => void }) {
  // Match the dock tiles in both views and every orientation; only the inactive icon shrinks.
  const size = 'var(--dock-tile)'
  return (
    <motion.button
      aria-label={label}
      aria-pressed={on}
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      style={{ width: size, height: size, borderRadius: '50%', background: on ? 'var(--hotpink)' : 'transparent', padding: 'calc(var(--dock-tile) * 0.24)', display: 'grid', placeItems: 'center', transition: 'background 0.2s' }}
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
