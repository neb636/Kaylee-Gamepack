import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { go, ispyLink } from '../router'
import { RunningGame } from '../shell/GameFrame'
import { say, sounds, SparklePuppet, useSaved, useTrophies, type GameMeta, type PuppetHandle } from '../shell/sdk-internal'
import { SHELF_LINES } from './lines'
import { books, findBook } from './registry'
import { foundKey } from './sections'

function BookCard({ meta, won }: { meta: GameMeta; won: boolean }) {
  const [found] = useSaved<string[]>(foundKey(meta.id), [])
  return (
    <motion.button
      aria-label={meta.title}
      whileTap={{ scale: 0.95 }}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onClick={() => {
        sounds.pop()
        void say(meta.title)
        go.ispy(meta.id)
      }}
      style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        width: '100%',
      }}
    >
      <img src={meta.cover} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: 24, objectFit: 'cover' }} />
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--hotpink)' }}>{meta.title}</div>
      {/* Letters she has found in this book, A to Z (pink once found). */}
      <div aria-hidden style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, fontSize: 15, fontWeight: 700 }}>
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => (
          <span key={l} style={{ color: found.includes(l) ? 'var(--hotpink)' : '#d6cde6' }}>
            {l}
          </span>
        ))}
      </div>
      {won && <div style={{ position: 'absolute', top: -14, right: -6, fontSize: 40 }}>🏆</div>}
    </motion.button>
  )
}

function Shelf() {
  const trophies = useTrophies()
  const sparkle = useRef<PuppetHandle>(null)
  useEffect(() => {
    void say(SHELF_LINES.hello)
  }, [])
  return (
    <div className="screen decorated" style={{ gap: 24 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button
          aria-label="Home"
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            sounds.pop()
            go.home()
          }}
          style={{ width: 88, height: 88, flexShrink: 0, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow)', fontSize: 42, display: 'grid', placeItems: 'center' }}
        >
          🏠
        </motion.button>
        <h1 style={{ fontSize: 'clamp(48px, 9vw, 84px)', fontWeight: 700, color: 'var(--hotpink)', flex: 1 }}>I Spy 🔍</h1>
        <button
          aria-label="Sparkle"
          onClick={() => {
            sounds.sparkle()
            void sparkle.current?.play('wiggle')
            void say(SHELF_LINES.tickle)
          }}
          style={{ background: 'none', padding: 0 }}
        >
          <SparklePuppet ref={sparkle} height="clamp(100px, 16vh, 150px)" />
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 24 }}>
        {books.map((b) => (
          <BookCard key={b.meta.id} meta={b.meta} won={trophies.some((t) => t.gameId === b.meta.id)} />
        ))}
        <button
          aria-label="More books coming soon"
          onClick={() => {
            sounds.pop()
            void say(SHELF_LINES.soon)
          }}
          style={{
            borderRadius: 'var(--radius)',
            border: '4px dashed var(--lavender-dark)',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            gap: 8,
            color: 'var(--ink-soft)',
            fontSize: 24,
            fontWeight: 600,
            minHeight: 260,
          }}
        >
          <span style={{ fontSize: 64 }}>📚</span>
          More books coming soon!
        </button>
      </div>
    </div>
  )
}

/** #/ispy is the shelf; #/ispy/<book>[/<section>] opens a book (its 🏠 goes back to the shelf). */
export function ISpy({ book }: { book?: string }) {
  const entry = book ? findBook(book) : undefined
  useEffect(() => {
    if (book && !entry) go.ispy()
  }, [book, entry])
  if (!book) return <Shelf />
  return entry ? <RunningGame key={book} entry={entry} onHome={() => go.ispy()} onRestart={() => history.replaceState(history.state, '', ispyLink(book))} /> : null
}
