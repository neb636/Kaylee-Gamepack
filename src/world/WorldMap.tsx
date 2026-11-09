// The world map, and the app's home screen: tap continents to hear their names, tap a country pin to fly there,
// The two buttons in the top bar swap the map for the game shelf (Shelf.tsx: a card
// per place with every game as an icon, straight in, filling the screen with the dock floating over it); she keeps
// whichever she used last (#/world?view=list or map opens one).
// No title and no trophy room here (Dad, 2026-10-29): the map is the picture, the dock beside it is the way in.
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useReducer, useState, type ReactNode } from 'react'
import { go } from '../router'
import { firstTime as firstTimeHere, lineText, Mascot, say, sounds, useOnline, useSaved } from '../sdk'
import balloon from './assets/balloon.webp'
import { DOCK, MapIcon, ShelfIcon } from './HomeIcons'
import { FitBox } from './kit/Chrome'
import { feelLab } from './kit/knobs'
import { WORLD_LINES } from './lines'
import { FEEL } from './map/feel'
import { MAP_RATIO } from './map/project'
import { cameraOn, edgesOf, Land, Outlines, spotOf, Stems, type ContinentKey } from './map/WorldAtlas'
import { places, type PlaceEntry } from './registry'
import { FROM_SHELF, Shelf } from './Shelf'
import { totalStamps, usePassport } from './stamps'
import { useHalloween } from '../shell/season'
import { HalloweenArt } from '../shell/Halloween'
import { Travel } from './Travel'

// Where each continent's name pops up, in % of the map.
const CONTINENT_LABELS: Record<ContinentKey, [number, number]> = {
  northAmerica: [22, 30],
  southAmerica: [31, 66],
  europe: [51, 22],
  africa: [52, 55],
  asia: [76, 26],
  australia: [85, 72],
  antarctica: [50, 92],
}

// The balloon hangs from this high up the map at most (any higher and the top of it is cut off).
const BALLOON_TOP = 26

function Marker({ x, y, delay, entry, hidden, onTap }: { x: number; y: number; delay: number; entry: PlaceEntry; hidden: boolean; onTap: () => void }) {
  const { meta } = entry
  return (
    <motion.button
      aria-label={meta.name}
      whileTap={{ scale: 0.85 }}
      animate={{ opacity: hidden ? 0 : 1 }}
      onClick={(e) => {
        e.stopPropagation()
        onTap()
      }}
      style={{
        // The button is the tap target and keeps its full size; the drawing inside is smaller, so the map stays uncluttered.
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        translate: '-50% -50%',
        width: 'max(64px, min(88px, 14cqw), min(11cqw, var(--target)))', // at least 88 on an iPad, 64 on a phone
        aspectRatio: '1',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        zIndex: 3,
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      <motion.img
        src={meta.map.picture}
        alt=""
        draggable={false}
        animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 2.4, delay, ease: 'easeInOut' }}
        style={{ display: 'block', width: '86%', aspectRatio: '1', objectFit: 'contain', transformOrigin: '50% 100%' }}
      />
    </motion.button>
  )
}

type View = 'map' | 'list'

export function WorldMap({ view: linked }: { view?: string }) {
  const halloween = useHalloween()
  const passport = usePassport()
  const online = useOnline() // the Theater needs the internet
  const [label, setLabel] = useState<{ text: string; x: number; y: number } | null>(null)
  const [travelTo, setTravelTo] = useState<PlaceEntry | null>(null)
  const [arrived, setArrived] = useState(false)
  const [lastPlace, setLastPlace] = useSaved('world:balloon', 'canada')
  // The feel lab's sliders change the knobs: draw again.
  const [, redraw] = useReducer((n: number) => n + 1, 0)
  useEffect(() => feelLab.subscribe(redraw), [])
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

  const tapContinent = useCallback((key: ContinentKey) => {
    const [x, y] = CONTINENT_LABELS[key]
    const text = WORLD_LINES.continents[key]
    sounds.pop()
    setLabel({ text, x, y })
    void say(text)
  }, [])

  const fly = (entry: PlaceEntry) => {
    if (travelTo) return
    sounds.sparkle()
    setLabel(null)
    setTravelTo(entry)
  }
  const spots = places.map((entry) => {
    const plant = spotOf(entry.meta.map.iso)
    const [dx, dy] = entry.meta.map.marker ?? [0, -8]
    return { entry, plant, head: [plant[0] + dx, plant[1] + dy] as [number, number] }
  })
  const outlines = spots.map((s) => ({ code: s.entry.meta.map.iso, onTap: () => fly(s.entry) }))
  const from = places.find((p) => p.meta.id === lastPlace) ?? places[0]
  const camera = arrived && travelTo ? cameraOn(travelTo.meta.map.iso) : undefined
  // The balloon floats just off the country's edge, on the other side from its animal, and stays inside the map.
  const balloonAt = (entry: PlaceEntry) => {
    const { iso, marker } = entry.meta.map
    const [, y] = spotOf(iso)
    const [west, east] = edgesOf(iso)
    const x = (marker?.[0] ?? 0) > 0 ? west - 5 : east + 5
    return [Math.max(6, Math.min(94, x)), Math.max(BALLOON_TOP, y - 2)]
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
      <div className={`screen decorated world-list${halloween ? ' halloween' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
        <Shelf />
        <div className="shelf-topfade" />
        {toggle}
        <div className="shelf-dock">{dock}</div>
      </div>
    )
  }

  return (
    <div className={`screen decorated world-map${halloween ? ' halloween' : ''}`} style={{ overflow: 'hidden' }}>
      {toggle}

      <div className="world-split" style={{ flex: 1, minHeight: 0, gap: 'min(16px, 2vh)', alignItems: 'center' }}>
        <FitBox ratio={MAP_RATIO}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow)', border: '5px solid #fff', background: 'var(--world-sea)' }} onClick={() => setLabel(null)}>
            {/* Everything that zooms in on a country. */}
            <motion.div
              animate={camera ?? { scale: 1, x: '0%', y: '0%' }}
              transition={{ duration: arrived ? FEEL.zoom : 0, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 0, transformOrigin: '0 0' }}
            >
              <Land onContinent={tapContinent} />
              <Outlines countries={outlines} lit={travelTo?.meta.map.iso} zoom={camera?.scale} />
              {!travelTo && <Stems stems={spots.map((s) => ({ key: s.entry.meta.id, from: s.plant, to: s.head }))} />}
              {spots.map((s, i) => (
                <Marker key={s.entry.meta.id} x={s.head[0]} y={s.head[1]} delay={i * 0.3} entry={s.entry} hidden={!!travelTo} onTap={() => fly(s.entry)} />
              ))}
            </motion.div>

            {/* Sparkle's balloon: waits over the last place she went, flies across the map, and lands when the map closes in. */}
            <motion.img
              src={balloon}
              alt=""
              initial={false}
              animate={
                travelTo
                  ? {
                      left: [`${balloonAt(from)[0]}%`, `${(balloonAt(from)[0] + balloonAt(travelTo)[0]) / 2}%`, `${balloonAt(travelTo)[0]}%`],
                      top: [`${balloonAt(from)[1]}%`, `${Math.max(BALLOON_TOP, Math.min(balloonAt(from)[1], balloonAt(travelTo)[1]) - 8)}%`, `${balloonAt(travelTo)[1]}%`],
                      opacity: arrived ? 0 : 1,
                    }
                  : { left: `${balloonAt(from)[0]}%`, top: `${balloonAt(from)[1]}%`, opacity: 1 }
              }
              transition={{ left: { duration: FEEL.flight, ease: 'easeInOut' }, top: { duration: FEEL.flight, ease: 'easeInOut' }, opacity: { duration: FEEL.zoom / 2 } }}
              style={{ position: 'absolute', width: '9%', translate: '-50% -92%', zIndex: 4, pointerEvents: 'none' }}
            />
          </div>

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
          <div className={`world-side-mascot${halloween ? ' halloween-map-friends' : ''}`}>
            {halloween && <span aria-hidden="true"><HalloweenArt kind="pumpkin" /></span>}
            <Mascot pose="wave" size={Math.min(170, window.innerHeight * 0.12)} />
            {halloween && <span aria-hidden="true"><HalloweenArt kind="ghost" /></span>}
          </div>
        </div>
      </div>

      {/* The same floating dock as the game list. */}
      <div className="shelf-dock">{dock}</div>

      {travelTo && (
        <Travel
          entry={travelTo}
          onArrive={() => {
            setArrived(true)
            setLabel({ text: lineText(travelTo.meta.map.name), x: 50, y: -3 }) // along the top, clear of the country
          }}
          onDone={() => {
            setLastPlace(travelTo.meta.id)
            go.world(travelTo.meta.id)
          }}
        />
      )}
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
