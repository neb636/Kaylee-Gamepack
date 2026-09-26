// Free coloring: every page from every country. No stamps, no rules, just calm painting.
import { motion } from 'motion/react'
import { go } from '../router'
import { say, sounds, useSayOnMount } from '../sdk'
import { BarPill, TopBar } from './kit/Chrome'
import { ColoringPage } from './kit/ColoringPage'
import { Flag } from './kit/Flag'
import { WORLD_LINES } from './lines'
import { places } from './registry'

const pages = places.flatMap(({ meta }) => meta.coloringPages.map((p) => ({ ...p, place: meta })))

export function ColoringBook({ page }: { page?: string }) {
  const open = pages.find((p) => p.id === page)
  return open ? <Painting key={open.id} src={open.img} /> : <Shelf />
}

function Shelf() {
  useSayOnMount(WORLD_LINES.coloringPick)
  let i = 0 // running index across countries, for the staggered entrance
  return (
    <div className="screen decorated" style={{ padding: 0, overflow: 'hidden' }}>
      <TopBar icon="🌍" label="World map" onBack={() => go.world()}>
        <BarPill>🖍️ Coloring Book</BarPill>
      </TopBar>
      {/* Only the pages scroll, so the back button always stays put. */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', padding: 'var(--bar-clear) max(16px, 3vw) calc(var(--safe-bottom) + 24px)' }}>
        <div style={{ width: '100%', maxWidth: 1100, margin: 'auto', display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 4vh, 36px)' }}>
          {places
            .filter(({ meta }) => meta.coloringPages.length)
            .map(({ meta }) => (
              <section key={meta.id} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <BarPill style={{ alignSelf: 'flex-start', fontSize: 'clamp(18px, min(3vw, 4.5vh), 28px)' }}>
                  <Flag id={meta.flag} width="1.8em" style={{ borderRadius: 4 }} />
                  {meta.name}
                </BarPill>
                {/* Cards: never wider than ~55% of the screen height (iPhone landscape), one column on narrow phones. */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 80vw, 55vh), 1fr))', gap: 'clamp(12px, 2.4vw, 24px)' }}>
                  {meta.coloringPages.map((p) => (
                    <motion.button
                      key={p.id}
                      aria-label={`color page ${p.id}`}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i++ * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        sounds.pop()
                        go.world('coloring', p.id)
                      }}
                      style={{ background: '#fff', borderRadius: 28, padding: 10, boxShadow: 'var(--shadow)', border: '5px solid var(--butter)' }}
                    >
                      <img src={p.img} alt="" style={{ width: '100%', aspectRatio: '1.5', objectFit: 'contain', display: 'block' }} />
                    </motion.button>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>
    </div>
  )
}

function Painting({ src }: { src: string }) {
  useSayOnMount(WORLD_LINES.coloringHow)
  return (
    <div className="screen decorated" style={{ padding: 'var(--bar-clear) max(12px, 2vw) calc(var(--safe-bottom) + 12px)', overflow: 'hidden' }}>
      <TopBar icon="📚" label="Coloring book" onBack={() => go.world('coloring')}>
        <BarPill>
          <button aria-label="Hear it again" onClick={() => void say(WORLD_LINES.coloringHow)} style={{ fontSize: 'inherit' }}>
            🖍️ 🔊
          </button>
        </BarPill>
      </TopBar>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ColoringPage src={src} />
      </div>
    </div>
  )
}
