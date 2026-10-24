// Home from the trip: her photos fan out at the bottom of the screen like a hand of cards, and she picks the one for
// Agong's wall. The picked one lifts up and flies off into her hands (the house shows it there, in a pink frame); the
// others slide away. Up to six: the places first (the village, the hong, the race, the Nail Island, Baan Chang's splash
// and its sign), then her newest pose photos, Mommy's selfies last. Nothing to read.
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { sfx } from '../../sfx'
import type { AlbumPhoto } from './bay/Album'

const MAX = 6
const ORDER = { village: 0, hong: 1, race: 2, nail: 3, chang: 4, sign: 5, selfie: 6 }

/** Which photos to fan out: one of each place first, then the newest others. */
export function fanOf(photos: AlbumPhoto[]): AlbumPhoto[] {
  const firsts = new Map<string, AlbumPhoto>()
  for (const p of photos) if (p.kind !== 'selfie' && !firsts.has(p.kind)) firsts.set(p.kind, p)
  const rest = [...photos].reverse().filter((p) => ![...firsts.values()].includes(p)).sort((a, b) => (a.kind === 'selfie' ? 1 : 0) - (b.kind === 'selfie' ? 1 : 0))
  return [...[...firsts.values()].sort((a, b) => ORDER[a.kind] - ORDER[b.kind]), ...rest].slice(0, MAX)
}

export function PhotoFan({ photos, open, onPick }: { photos: AlbumPhoto[]; open: boolean; onPick: (p: AlbumPhoto) => void }) {
  const fan = useMemo(() => fanOf(photos), [photos])
  const [picked, setPicked] = useState<number | null>(null)
  const n = fan.length
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="fan"
          role="group"
          aria-label="Pick a photo for Agong"
          exit={{ opacity: 0, transition: { delay: 0.5 } }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 'min(46vh, 62vw)', zIndex: 34, pointerEvents: 'none' }}
        >
          {fan.map((p, i) => {
            // Spread like a hand of cards: a gentle arc, the middle ones higher, a little right of centre to clear Sparkle.
            const mid = (n - 1) / 2
            const off = n > 1 ? (i - mid) / Math.max(mid, 1) : 0
            const chosen = picked === p.n
            const gone = picked !== null && !chosen
            return (
              <motion.button
                key={p.n}
                aria-label={`Photo: ${p.kind}`}
                initial={{ y: '70%', x: '-50%', rotate: 0, opacity: 0 }}
                animate={
                  chosen
                    ? { y: '-120%', x: '-50%', rotate: 0, scale: 1.25, opacity: [1, 1, 0], transition: { duration: 0.9, times: [0, 0.6, 1] } }
                    : gone
                      ? { y: '120%', x: '-50%', rotate: off * 30, opacity: 0, transition: { duration: 0.4 } }
                      : { y: `${Math.abs(off) * 8}%`, x: '-50%', rotate: off * 11, opacity: 1, transition: { delay: 0.12 * i, type: 'spring', stiffness: 220, damping: 18 } }
                }
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  if (picked !== null) return
                  sfx.pop()
                  setPicked(p.n)
                  setTimeout(() => onPick(p), 450)
                }}
                style={{
                  position: 'absolute',
                  left: `${56 + off * Math.min(26, 7 * n)}%`,
                  // (On a narrow phone they sit above Sparkle and her bubble instead.)
                  bottom: window.innerWidth < 600 ? 'calc(var(--safe-bottom) + min(210px, 26vh, 48vw))' : 'calc(var(--safe-bottom) + min(8vh, 60px))',
                  width: `min(${n > 4 ? 26 : 30}vw, 22vh, 240px)`,
                  minWidth: 110,
                  padding: '7px 7px 20px',
                  background: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  boxShadow: '0 8px 22px rgba(43,35,48,.35)',
                  transformOrigin: '50% 100%',
                  zIndex: chosen ? 10 : i,
                  pointerEvents: picked === null ? 'auto' : 'none',
                }}
              >
                <img src={p.src} alt="" style={{ display: 'block', width: '100%', borderRadius: 3 }} />
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
