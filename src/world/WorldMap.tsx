// The app's home screen, in two views she swaps with the two buttons in the top bar. The globe (globe/GlobeHome.tsx):
// a toy Earth she spins, with a pin for every country and Sparkle's balloon to fly there. The game shelf (Shelf.tsx):
// a card per place with every game as an icon, straight in. She keeps whichever she used last (#/world?view=list or
// map opens one). Both float the same dock: passport, coloring, puzzles, movies.
// No title and no trophy room here (Dad, 2026-10-29): the globe is the picture, the dock beside it is the way in.
import { motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { go } from '../router'
import { firstTime as firstTimeHere, lineText, say, sounds, useOnline, useSaved } from '../sdk'
import { GlobeHome } from './globe/GlobeHome'
import { DOCK, GlobeIcon, ShelfIcon } from './HomeIcons'
import { WORLD_LINES } from './lines'
import { FROM_SHELF, Shelf } from './Shelf'
import { totalStamps, usePassport } from './stamps'
import { useHalloween } from '../shell/seasonal/season'

type View = 'map' | 'list'

export function WorldMap({ view: linked }: { view?: string }) {
  const halloween = useHalloween()
  const passport = usePassport()
  const online = useOnline() // the Theater needs the internet
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
    setFromLink(undefined)
    setView(next)
    void say(next === 'list' ? WORLD_LINES.shelf.showList : WORLD_LINES.shelf.showMap)
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
      <ViewButton label="Map" on={view === 'map'} onClick={() => switchTo('map')} icon={(c) => <GlobeIcon color={c} shade={c === '#fff' ? 'var(--hotpink)' : '#fff'} />} />
      <ViewButton label="All the games" on={view === 'list'} onClick={() => switchTo('list')} icon={(c) => <ShelfIcon color={c} />} />
    </div>
  )

  if (view === 'list') {
    // The shelf is the whole screen and scrolls as one page; the toggle and the dock float over it (Sparkle waves
    // from the favorites card). The globe floats the same dock.
    return (
      <div className={`screen decorated world-list${halloween ? ' halloween' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
        <Shelf />
        <div className="shelf-topfade" />
        {toggle}
        <div className="shelf-dock">{dock}</div>
      </div>
    )
  }

  return <GlobeHome toggle={toggle} dock={dock} halloween={halloween} />
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
