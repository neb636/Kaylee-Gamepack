// Free coloring: every page from every country. No stamps, no rules, just calm painting.
import { motion } from 'motion/react'
import { go } from '../router'
import { say, sounds, useSayOnMount } from '../sdk'
import { BarPill, TopBar } from './kit/Chrome'
import { ColoringPage } from './kit/ColoringPage'
import { WORLD_LINES } from './lines'
import { places } from './registry'

const pages = places.flatMap(({ meta }) => meta.coloringPages.map((p) => ({ ...p, place: meta })))

export function ColoringBook({ page }: { page?: string }) {
  const open = pages.find((p) => p.id === page)
  return open ? <Painting key={open.id} src={open.img} /> : <Shelf />
}

function Shelf() {
  useSayOnMount(WORLD_LINES.coloringPick)
  return (
    <div className="screen decorated" style={{ paddingTop: 'var(--top-clear)' }}>
      <TopBar icon="🌍" label="World map" onBack={() => go.world()}>
        <BarPill>🖍️ Coloring Book</BarPill>
      </TopBar>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 42vw), 1fr))', gap: 20, width: '100%', maxWidth: 1100, margin: 'auto' }}>
        {pages.map((p, i) => (
          <motion.button
            key={p.id}
            aria-label={`color page ${p.id}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.pop()
              go.world('coloring', p.id)
            }}
            style={{ background: '#fff', borderRadius: 28, padding: 10, boxShadow: 'var(--shadow)', border: '5px solid var(--butter)', position: 'relative' }}
          >
            <img src={p.img} alt="" style={{ width: '100%', aspectRatio: '1.5', objectFit: 'contain', display: 'block' }} />
            <span style={{ position: 'absolute', top: -12, left: -8, fontSize: 40 }}>{p.place.emoji}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function Painting({ src }: { src: string }) {
  useSayOnMount(WORLD_LINES.coloringHow)
  return (
    <div className="screen decorated" style={{ padding: 'var(--top-clear) 12px calc(var(--safe-bottom) + 12px)', overflow: 'hidden' }}>
      <TopBar icon="📚" label="Coloring book" onBack={() => go.world('coloring')}>
        <BarPill>
          <button aria-label="Hear it again" onClick={() => void say(WORLD_LINES.coloringHow)} style={{ fontSize: 'inherit' }}>
            🖍️ 🔊
          </button>
        </BarPill>
      </TopBar>
      <ColoringPage src={src} />
    </div>
  )
}
