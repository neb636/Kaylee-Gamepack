// The world map's list view, a game shelf like Roblox's: a row of picture cards per country (Thailand's trips split
// into their games), so she can pick a bunch of different things fast instead of flying, landing and walking to each.
// Tap a card: it grows into its own page and Sparkle says its name; ▶ plays it, ❤️ keeps it in her favorites row at
// the top. The 🎁 card spins through every game and lands on one. Games she hasn't tried yet twinkle; stamped ones
// wear their stamp. Cards and lines: cards.ts and lines.ts `shelf`.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import posthog, { isPostHogEnabled } from '../posthog'
import { gameLogger } from '../posthog-logger'
import { go, worldLink } from '../router'
import { burst, say, sounds, useLandscape, useSaved } from '../sdk'
import { useTrophies } from '../sdk/trophies'
import surpriseArt from './assets/cover-game-surprise.webp'
import { Flag } from './kit/Flag'
import { WORLD_LINES } from './lines'
import { ALL_GAMES, nameLine, SHELF, TEA_PARTY, type ShelfGame } from './cards'
import { usePassport } from './stamps'

const L = WORLD_LINES.shelf
/** Set when a game opens from the shelf, so its top bar's back button comes back here (PlaceFrame). */
export const FROM_SHELF = 'kaylee-gamepack:from-shelf'

const speak = (key: string) => {
  const line = nameLine(key)
  if (line) void say(line)
}

export function Shelf() {
  const landscape = useLandscape()
  const passport = usePassport()
  const trophies = useTrophies()
  const [favorites, setFavorites] = useSaved<string[]>('world:favorites', [])
  const [played, setPlayed] = useSaved<string[]>('world:played', [])
  const [open, setOpen] = useState<ShelfGame | null>(null)
  const [spinning, setSpinning] = useState(false)
  const card = landscape ? 'clamp(112px, min(17vw, 23vh), 200px)' : 'clamp(112px, min(30vw, 17vh), 220px)'

  const stamped = (g: ShelfGame) => !g.section && !!g.place && !!g.activity && (passport.stamps[g.place] ?? []).includes(g.activity)
  const fav = ALL_GAMES.filter((g) => favorites.includes(g.key)).sort((a, b) => favorites.indexOf(b.key) - favorites.indexOf(a.key))

  const pick = (g: ShelfGame) => {
    sounds.pop()
    speak(g.key)
    setOpen(g)
  }

  const play = (g: ShelfGame) => {
    sounds.whoosh()
    void say(L.go)
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

  const cardProps = (g: ShelfGame) => ({ game: g, size: card, fresh: !played.includes(g.key), stamp: stamped(g), loved: favorites.includes(g.key), onTap: () => pick(g) })

  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 28, background: 'rgba(255,255,255,0.55)', border: '5px solid #fff', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', padding: '10px 0 24px', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        <Row title={<span style={{ color: 'var(--hotpink)' }}>❤️</span>} onTitle={() => void say(L.favorites)} index={0}>
          <SurpriseCard size={card} onTap={() => setSpinning(true)} />
          <Card {...cardProps(TEA_PARTY)} />
          {fav.length ? fav.map((g) => <Card key={g.key} {...cardProps(g)} />) : <EmptyHeart size={card} />}
        </Row>
        {SHELF.map((row, i) => (
          <Row
            key={row.id}
            index={i + 1}
            onTitle={() => speak(row.id)}
            title={
              <>
                {row.flag && <Flag id={row.flag} width="1.5em" style={{ borderRadius: 4, flexShrink: 0 }} />}
                {row.emoji && <span>{row.emoji}</span>}
                <span>{row.title}</span>
              </>
            }
          >
            {row.games.map((g) => (
              <Card key={g.key} {...cardProps(g)} />
            ))}
          </Row>
        ))}
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
    </div>
  )
}

function Row({ title, onTitle, index, children }: { title: ReactNode; onTitle: () => void; index: number; children: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 6) * 0.06 }} style={{ marginBottom: 'clamp(6px, 1.5vh, 14px)' }}>
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          sounds.pop()
          onTitle()
        }}
        style={{ minHeight: 56, padding: '4px 18px', marginLeft: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 'clamp(19px, min(3vw, 3.4vh), 28px)', fontWeight: 700, color: 'var(--ink)', background: 'none' }}
      >
        {title}
      </motion.button>
      <div className="shelf-row" style={{ display: 'flex', gap: 'clamp(10px, 2vmin, 18px)', overflowX: 'auto', overflowY: 'hidden', padding: '6px 18px 12px', scrollSnapType: 'x proximity', scrollPaddingLeft: 18, WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
    </motion.section>
  )
}

const CARD_FRAME: CSSProperties = { position: 'relative', aspectRatio: '1', borderRadius: 26, border: '5px solid #fff', boxShadow: 'var(--shadow)', overflow: 'hidden', background: 'var(--lavender)' }

function Card({ game, size, fresh, stamp, loved, onTap }: { game: ShelfGame; size: string; fresh: boolean; stamp: boolean; loved: boolean; onTap: () => void }) {
  return (
    <motion.button aria-label={game.name} whileTap={{ scale: 0.9 }} onClick={onTap} style={{ flex: `0 0 ${size}`, width: size, scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch', background: 'none', padding: 0 }}>
      <span style={{ ...CARD_FRAME, display: 'block', width: '100%' }}>
        <img src={game.cover} alt="" loading="lazy" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {fresh && (
          <motion.span aria-hidden animate={{ scale: [0.8, 1.15, 0.8], rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ ...BADGE, left: 6, background: 'var(--butter)' }}>
            ✨
          </motion.span>
        )}
        {stamp && <span aria-hidden style={{ ...BADGE, right: 6, background: 'var(--gold)' }}>⭐</span>}
        {loved && <span aria-hidden style={{ ...BADGE, right: 6, bottom: 6, top: 'auto', background: '#fff' }}>❤️</span>}
      </span>
      <span style={{ fontSize: 'clamp(13px, min(2vw, 2.2vh), 18px)', fontWeight: 600, color: 'var(--ink)', opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{game.name}</span>
    </motion.button>
  )
}

const BADGE: CSSProperties = { position: 'absolute', top: 6, width: 'clamp(30px, 18%, 42px)', aspectRatio: '1', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 'clamp(16px, 2.4vmin, 22px)', border: '3px solid #fff', boxShadow: 'var(--shadow)' }

function SurpriseCard({ size, onTap }: { size: string; onTap: () => void }) {
  return (
    <motion.button
      aria-label="Surprise"
      whileTap={{ scale: 0.9 }}
      animate={{ rotate: [0, -3, 3, 0] }}
      transition={{ repeat: Infinity, duration: 2.2, repeatDelay: 1.2 }}
      onClick={() => {
        sounds.sparkle()
        void say(L.surprise)
        onTap()
      }}
      style={{ flex: `0 0 ${size}`, width: size, scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', gap: 6, background: 'none', padding: 0 }}
    >
      <span style={{ ...CARD_FRAME, display: 'block', width: '100%', borderColor: 'var(--gold)' }}>
        <img src={surpriseArt} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </span>
      <span style={{ fontSize: 'clamp(13px, min(2vw, 2.2vh), 18px)', fontWeight: 700, color: 'var(--hotpink)', textAlign: 'center' }}>Surprise!</span>
    </motion.button>
  )
}

/** Before she has any favorites: a dashed card with a beating heart, which says what the ❤️ is for. */
function EmptyHeart({ size }: { size: string }) {
  return (
    <motion.button
      aria-label="Favorites"
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        sounds.pop()
        void say(L.favorites)
      }}
      style={{ flex: `0 0 ${size}`, width: size, aspectRatio: '1', borderRadius: 26, border: '5px dashed var(--pink)', background: 'rgba(255,255,255,0.6)', display: 'grid', placeItems: 'center', padding: 0 }}
    >
      <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ fontSize: `calc(${size} * 0.36)` }}>
        🤍
      </motion.span>
    </motion.button>
  )
}

/** A game's own page: the big picture, its name (Sparkle says it), ❤️ and a big ▶. */
function GamePage({ game, loved, onLove, onPlay, onClose }: { game: ShelfGame; loved: boolean; onLove: () => void; onPlay: () => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(185,166,245,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 16px)' }}>
      <motion.div
        initial={{ scale: 0.4, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="shelf-page"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(14px, 3vmin, 32px)', background: 'var(--cream)', borderRadius: 40, border: '6px solid #fff', boxShadow: 'var(--shadow)', padding: 'clamp(14px, 3vmin, 28px)', maxWidth: '100%', maxHeight: '100%' }}
      >
        <motion.img
          src={game.cover}
          alt=""
          draggable={false}
          onClick={() => speak(game.key)}
          animate={{ rotate: [0, -1.5, 1.5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{ width: 'min(70vw, 52vh, 500px)', aspectRatio: '1', objectFit: 'cover', borderRadius: 30, border: '5px solid #fff', boxShadow: 'var(--shadow)' }}
        />
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

/** The surprise: the cards flick past in a window, fast then slower, each with a rising note, and land on one (a game
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
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(185,166,245,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center' }}
    >
      <motion.div animate={{ rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 0.3 }} style={{ ...CARD_FRAME, width: 'min(66vw, 50vh, 440px)', borderColor: 'var(--gold)', borderWidth: 8 }}>
        <img src={shown.cover} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </motion.div>
      <motion.button aria-label="Close" whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); clearTimeout(timer.current); onCancel() }} style={CLOSE}>
        ✖️
      </motion.button>
    </motion.div>
  )
}

const CLOSE: CSSProperties = { position: 'absolute', top: 'calc(var(--safe-top) + 12px)', right: 16, width: 'var(--btn)', height: 'var(--btn)', borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow)', fontSize: 'calc(var(--btn) * 0.45)', display: 'grid', placeItems: 'center' }
