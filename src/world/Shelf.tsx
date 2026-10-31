// The world map's list view, a game shelf like Roblox's: a card per place (Thailand's trips split into their games),
// so she can pick a bunch of different things fast instead of flying, landing and walking to each. It fills the screen
// and scrolls as one page (Dad, 2026-10-30: not a small scrolling box). Each card is the place's banner with a white
// sheet over its bottom edge holding the place's name and every game as an icon (the pictures: shelf/STYLE.md).
// Tap an icon: it grows into its own page and Sparkle says its name; ▶ plays it, ❤️ keeps it in her favorites card at
// the top. The 🎁 icon spins through every game and lands on one. Games she hasn't tried yet twinkle; stamped ones
// wear their stamp. Cards and lines: cards.ts and lines.ts `shelf`.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import posthog, { isPostHogEnabled } from '../posthog'
import { gameLogger } from '../posthog-logger'
import { go, worldLink } from '../router'
import { burst, Mascot, say, sounds, useElementSize, useSaved } from '../sdk'
import { useTrophies } from '../sdk/trophies'
import { ALL_GAMES, banner, nameLine, SHELF, SURPRISE_ICON, TEA_PARTY, type ShelfGame } from './cards'
import { Flag } from './kit/Flag'
import { WORLD_LINES } from './lines'
import { usePassport } from './stamps'

const L = WORLD_LINES.shelf
/** Set when a game opens from the shelf, so its top bar's back button comes back here (PlaceFrame). */
export const FROM_SHELF = 'kaylee-gamepack:from-shelf'

const speak = (key: string) => {
  const line = nameLine(key)
  if (line) void say(line)
}

export function Shelf() {
  const passport = usePassport()
  const trophies = useTrophies()
  const [favorites, setFavorites] = useSaved<string[]>('world:favorites', [])
  const [played, setPlayed] = useSaved<string[]>('world:played', [])
  const [open, setOpen] = useState<ShelfGame | null>(null)
  const [spinning, setSpinning] = useState(false)

  const stamped = (g: ShelfGame) => !g.section && !!g.place && !!g.activity && (passport.stamps[g.place] ?? []).includes(g.activity)
  const fav = ALL_GAMES.filter((g) => favorites.includes(g.key)).sort((a, b) => favorites.indexOf(b.key) - favorites.indexOf(a.key))

  const pick = (g: ShelfGame) => {
    sounds.pop()
    speak(g.key)
    setOpen(g)
  }

  const play = (g: ShelfGame) => {
    sounds.whoosh()
    if (!played.includes(g.key)) setPlayed([...played, g.key])
    if (isPostHogEnabled) posthog.capture('world_shelf_play', { game: g.key, favorite: favorites.includes(g.key) })
    if (g.game) {
      const won = trophies.some((t) => t.gameId === g.game)
      if (isPostHogEnabled) posthog.capture('game_session_started', { game_id: g.game, previously_completed: won })
      gameLogger.sessionStarted(g.game, won)
      go.game(g.game)
      return
    }
    try {
      sessionStorage.setItem(FROM_SHELF, g.place!)
    } catch {
      // No session storage: the back button goes to the country map instead.
    }
    location.hash = worldLink(g.place!, g.activity!, g.section)
  }

  const toggleFavorite = (g: ShelfGame) => {
    if (favorites.includes(g.key)) {
      sounds.pop()
      setFavorites(favorites.filter((k) => k !== g.key))
    } else {
      sounds.sparkle()
      burst()
      void say(L.loved)
      setFavorites([g.key, ...favorites])
    }
  }

  const tile = (g: ShelfGame) => <Tile key={g.key} game={g} fresh={!played.includes(g.key)} stamp={stamped(g)} loved={favorites.includes(g.key)} onTap={() => pick(g)} />

  return (
    <>
      <div className="shelf-scroll" data-testid="shelf">
        <div className="shelf-column">
          <motion.button
            className="shelf-head"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.pop()
              void say(L.hello)
            }}
          >
            All the games
          </motion.button>

          <Card index={0} id="favorites" title="My favorites" chip={<span className="shelf-heart">❤️</span>} art={banner('favorites')} onTitle={() => void say(L.favorites)} friend>
            <SurpriseTile onTap={() => setSpinning(true)} />
            {tile(TEA_PARTY)}
            {fav.length ? fav.map(tile) : <EmptyHeart />}
          </Card>

          {SHELF.map((row, i) => (
            <Card key={row.id} index={i + 1} id={row.id} title={row.title} chip={row.flag && <Flag id={row.flag} width="1.55em" style={{ borderWidth: 3, flexShrink: 0 }} />} art={row.banner} onTitle={() => speak(row.id)}>
              {row.games.map(tile)}
            </Card>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {spinning && (
          <Spinner
            key="spin"
            played={played}
            onLand={(g) => {
              setSpinning(false)
              burst()
              pick(g)
            }}
            onCancel={() => setSpinning(false)}
          />
        )}
        {open && <GamePage key={open.key} game={open} loved={favorites.includes(open.key)} onLove={() => toggleFavorite(open)} onPlay={() => play(open)} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </>
  )
}

/** A place's card: its banner, and the white sheet over the banner's bottom edge with the name and the games. */
function Card({ id, title, chip, art, onTitle, index, friend, children }: { id: string; title: string; chip?: ReactNode; art?: string; onTitle: () => void; index: number; friend?: boolean; children: ReactNode }) {
  const tap = () => {
    sounds.pop()
    onTitle()
  }
  return (
    <motion.section className="shelf-card" data-row={id} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 5) * 0.07 }}>
      <div className="shelf-banner">
        {art ? <img src={art} alt="" draggable={false} /> : <span className="shelf-banner-blank" />}
        <button className="shelf-banner-hit" aria-label={title} onClick={tap} />
        {friend && <BannerSparkle />}
      </div>
      <div className="shelf-sheet">
        <motion.button className="shelf-title" whileTap={{ scale: 0.95 }} onClick={tap}>
          {chip}
          <span>{title}</span>
        </motion.button>
        <div className="shelf-grid">{children}</div>
      </div>
    </motion.section>
  )
}

/** Sparkle waving from the favorites banner's cloud (the live puppet, sized to the banner). */
function BannerSparkle() {
  const box = useRef<HTMLDivElement>(null)
  const { height } = useElementSize(box)
  return (
    <div ref={box} className="shelf-sparkle" aria-hidden>
      {height > 0 && <Mascot pose="wave" size={Math.round(height)} />}
    </div>
  )
}

/** A game's picture: its icon, or its emoji on a pastel tile until it has one. */
function Art({ game, className = 'shelf-art' }: { game: Pick<ShelfGame, 'icon' | 'emoji'>; className?: string }) {
  return <span className={className}>{game.icon ? <img src={game.icon} alt="" loading="lazy" draggable={false} /> : <span className="shelf-emoji">{game.emoji}</span>}</span>
}

function Tile({ game, fresh, stamp, loved, onTap }: { game: ShelfGame; fresh: boolean; stamp: boolean; loved: boolean; onTap: () => void }) {
  return (
    <motion.button className="shelf-tile" aria-label={game.name} whileTap={{ scale: 0.9 }} onClick={onTap}>
      <span className="shelf-frame">
        <Art game={game} />
        {fresh && (
          // A CSS twinkle (shelf-twinkle in world.css): every new game on the page has one, so it stays off the JS thread.
          <span aria-hidden className="shelf-badge shelf-twinkle" style={{ left: '-7%', top: '-7%', background: 'var(--butter)' }}>
            ✨
          </span>
        )}
        {stamp && <span aria-hidden className="shelf-badge" style={{ right: '-7%', top: '-7%', background: 'var(--gold)' }}>⭐</span>}
        {loved && <span aria-hidden className="shelf-badge" style={{ right: '-7%', bottom: '-7%', background: '#fff' }}>❤️</span>}
      </span>
      <span className="shelf-name">{game.name}</span>
    </motion.button>
  )
}

function SurpriseTile({ onTap }: { onTap: () => void }) {
  return (
    <motion.button
      className="shelf-tile"
      aria-label="Surprise"
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        sounds.sparkle()
        void say(L.surprise)
        onTap()
      }}
    >
      <motion.span className="shelf-frame shelf-surprise" animate={{ rotate: [0, -4, 4, 0] }} transition={{ repeat: Infinity, duration: 2.2, repeatDelay: 1.2 }}>
        <Art game={{ icon: SURPRISE_ICON, emoji: '🎁' }} />
      </motion.span>
      <span className="shelf-name" style={{ color: 'var(--hotpink)', opacity: 1, fontWeight: 700 }}>
        Surprise!
      </span>
    </motion.button>
  )
}

/** Before she has any favorites: a dashed tile with a beating heart, which says what the ❤️ is for. */
function EmptyHeart() {
  return (
    <motion.button
      className="shelf-tile"
      aria-label="Favorites"
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        sounds.pop()
        void say(L.favorites)
      }}
    >
      <span className="shelf-frame">
        <span className="shelf-art shelf-empty">
          <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
            🤍
          </motion.span>
        </span>
      </span>
      <span className="shelf-name" aria-hidden>
        &nbsp;
      </span>
    </motion.button>
  )
}

/** A game's own page: the big picture, its name (Sparkle says it), ❤️ and a big ▶. */
function GamePage({ game, loved, onLove, onPlay, onClose }: { game: ShelfGame; loved: boolean; onLove: () => void; onPlay: () => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={OVERLAY}>
      <motion.div
        initial={{ scale: 0.4, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="shelf-page"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(14px, 3vmin, 32px)', background: 'var(--cream)', borderRadius: 40, border: '6px solid #fff', boxShadow: 'var(--shadow)', padding: 'clamp(14px, 3vmin, 28px)', maxWidth: '100%', maxHeight: '100%' }}
      >
        <motion.button aria-label={game.name} onClick={() => speak(game.key)} animate={{ rotate: [0, -1.5, 1.5, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ width: 'min(70vw, 52vh, 460px)', padding: 0 }}>
          <span className="shelf-frame">
            <Art game={game} />
          </span>
        </motion.button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(10px, 2.4vmin, 22px)' }}>
          <div style={{ fontSize: 'clamp(22px, min(4vw, 4.4vh), 38px)', fontWeight: 700, color: 'var(--ink)', textAlign: 'center', maxWidth: 'min(70vw, 360px)' }}>{game.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 3vmin, 26px)' }}>
            <motion.button aria-label={loved ? 'Not a favorite' : 'Favorite'} whileTap={{ scale: 0.8 }} animate={loved ? { scale: [1, 1.25, 1] } : { scale: 1 }} onClick={onLove} style={{ width: 'clamp(76px, 12vmin, 104px)', aspectRatio: '1', borderRadius: '50%', background: loved ? 'var(--pink)' : '#fff', border: '5px solid #fff', boxShadow: 'var(--shadow)', fontSize: 'clamp(36px, 6vmin, 52px)', display: 'grid', placeItems: 'center' }}>
              {loved ? '❤️' : '🤍'}
            </motion.button>
            <motion.button aria-label="Play" whileTap={{ scale: 0.88 }} animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.3 }} onClick={onPlay} style={{ width: 'clamp(120px, 20vmin, 180px)', height: 'clamp(88px, 13vmin, 120px)', borderRadius: 999, background: 'var(--hotpink)', border: '5px solid #fff', boxShadow: 'var(--shadow)', color: '#fff', fontSize: 'clamp(44px, 7vmin, 64px)', display: 'grid', placeItems: 'center', paddingLeft: 8 }}>
              ▶
            </motion.button>
          </div>
        </div>
      </motion.div>
      <motion.button aria-label="Close" whileTap={{ scale: 0.85 }} onClick={onClose} style={CLOSE}>
        ✖️
      </motion.button>
    </motion.div>
  )
}

/** The surprise: the icons flick past in a window, fast then slower, each with a rising note, and land on one (a game
 *  she hasn't tried yet, most of the time). A tap lands it at once. */
function Spinner({ played, onLand, onCancel }: { played: string[]; onLand: (g: ShelfGame) => void; onCancel: () => void }) {
  const random = () => ALL_GAMES[Math.floor(Math.random() * ALL_GAMES.length)]
  const [shown, setShown] = useState(random)
  const [target] = useState(() => {
    const untried = ALL_GAMES.filter((g) => !played.includes(g.key))
    const pool = untried.length && Math.random() < 0.7 ? untried : ALL_GAMES
    return pool[Math.floor(Math.random() * pool.length)]
  })
  const STEPS = 16
  const step = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const tick = () => {
    step.current++
    if (step.current >= STEPS) {
      setShown(target)
      sounds.fanfare()
      timer.current = setTimeout(() => onLand(target), 650)
      return
    }
    setShown(random())
    sounds.note(Math.min(10, Math.floor((step.current / STEPS) * 11)))
    timer.current = setTimeout(tick, 70 + step.current * step.current * 1.6)
  }
  useEffect(() => {
    timer.current = setTimeout(tick, 80)
    return () => clearTimeout(timer.current)
  }, [])
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        // A tap lands it at once.
        if (step.current >= STEPS) return
        clearTimeout(timer.current)
        step.current = STEPS - 1
        tick()
      }}
      style={OVERLAY}
    >
      <motion.div animate={{ rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 0.3 }} style={{ width: 'min(66vw, 50vh, 440px)' }}>
        <span className="shelf-frame shelf-surprise">
          <Art game={shown} />
        </span>
      </motion.div>
      <motion.button
        aria-label="Close"
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.stopPropagation()
          clearTimeout(timer.current)
          onCancel()
        }}
        style={CLOSE}
      >
        ✖️
      </motion.button>
    </motion.div>
  )
}

const OVERLAY: CSSProperties = { position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(185,166,245,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 16px)' }
const CLOSE: CSSProperties = { position: 'absolute', top: 'calc(var(--safe-top) + 12px)', right: 16, width: 'calc(var(--btn) + 12px)', height: 'calc(var(--btn) + 12px)', borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow)', fontSize: 'calc(var(--btn) * 0.45)', display: 'grid', placeItems: 'center' }
