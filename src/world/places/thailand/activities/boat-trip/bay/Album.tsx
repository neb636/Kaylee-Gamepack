// The trip album (the payoff that builds while she plays): a book button in the bottom-right corner that bounces when
// something lands in it. Photos drop in with a thwap (the village with the kids cheering, the hong, her Nail Island
// poses, Mommy's selfies; at Baan Chang, the sign wall and the splash), and an animal sticker flies in for every
// critter she drives up to (and Khanom, the baby elephant, after the splash). Open it and the photos fill one page and
// the ten stickers the other; tap any of them to hear Sparkle's fact. Nothing to read.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { Line } from '../../../../../../sdk'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import { STICKERS, type StickerId } from './critters'
import type { PhotoKind } from './part'
import { Sticker } from './Stickers'

export interface AlbumPhoto {
  n: number
  kind: PhotoKind
  src: string
}

const FACT: Record<PhotoKind, Line | null> = { village: L.bay.facts.football, hong: L.bay.facts.hong, nail: L.bay.facts.nail, selfie: null, race: L.race.trophy, sign: L.facts.chang, chang: L.facts.elephant }
/** A sticker's fact (Khanom's: the trunk). */
const stickerFact = (id: StickerId): Line => L.bay.stickers[id] ?? L.chang.facts.trunk
const BTN = 'min(96px, max(68px, 12vmin))'
/** Where the album button's middle is (a flying sticker aims there). */
const buttonCenter = () => ({ x: window.innerWidth - 18 - 48, y: window.innerHeight - 18 - 48 })

export function Album(props: { photos: AlbumPhoto[]; found: StickerId[]; open: boolean; bump: number; onOpen: () => void; onClose: () => void; onFact: (line: Line) => void }) {
  const { photos, found, open, bump, onOpen, onClose, onFact } = props
  const [big, setBig] = useState<AlbumPhoto | null>(null)
  const [wiggle, setWiggle] = useState<string | null>(null)
  useEffect(() => {
    if (!open) setBig(null)
  }, [open])
  const last = photos[photos.length - 1]
  return (
    <>
      <motion.button
        key={`album-${bump}`}
        aria-label="Trip album"
        initial={bump ? { scale: 1.35, rotate: -10 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 9 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => {
          sfx.pop()
          onOpen()
        }}
        style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 18px)', bottom: 'calc(var(--safe-bottom) + 18px)', width: BTN, height: BTN, borderRadius: 24, border: '5px solid #fff', background: 'var(--lavender)', boxShadow: 'var(--shadow)', zIndex: 32, padding: 0, display: 'grid', placeItems: 'center', fontSize: 'min(48px, 7vmin)', overflow: 'visible' }}
      >
        <span aria-hidden>📔</span>
        {last && <img src={last.src} alt="" style={{ position: 'absolute', right: -10, top: -14, width: '58%', borderRadius: 4, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(43,35,48,.3)', transform: 'rotate(8deg)' }} />}
        {found.length > 0 && (
          <span aria-hidden style={{ position: 'absolute', left: -12, top: -12, width: 44, height: 44, display: 'grid', placeItems: 'center', background: '#fff', borderRadius: '50%', boxShadow: '0 2px 6px rgba(43,35,48,.25)' }}>
            <Sticker id={found[found.length - 1]} found size={34} />
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="book"
            role="dialog"
            aria-label="The trip album"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(43,35,48,.35)', zIndex: 60, display: 'grid', placeItems: 'center', padding: 'calc(var(--top-clear, 104px) - 20px) 12px calc(var(--safe-bottom) + 12px)' }}
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -4 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'relative', width: 'min(1000px, 100%)', maxHeight: '100%', overflow: 'auto', background: '#FFF7F0', borderRadius: 28, border: '6px solid var(--hotpink)', boxShadow: 'var(--shadow)', padding: 'clamp(12px, 2.5vmin, 24px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'clamp(12px, 2.5vmin, 28px)' }}
            >
              {/* The photos page. */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, alignContent: 'start', minHeight: 120 }}>
                {photos.length === 0 && <div aria-hidden style={{ gridColumn: '1 / -1', fontSize: 64, textAlign: 'center', opacity: 0.35, padding: 20 }}>📷</div>}
                {[...photos].reverse().map((p, i) => (
                  <motion.button
                    key={p.n}
                    aria-label={`Photo: ${p.kind}`}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      sfx.pop()
                      setBig(p)
                      const f = FACT[p.kind]
                      if (f) onFact(f)
                      else sfx.giggle()
                    }}
                    style={{ padding: '8px 8px 22px', background: '#fff', border: 'none', borderRadius: 6, boxShadow: '0 3px 8px rgba(43,35,48,.22)', transform: `rotate(${i % 2 ? 2.5 : -2}deg)`, minHeight: 88 }}
                  >
                    <img src={p.src} alt="" style={{ width: '100%', display: 'block', borderRadius: 3 }} />
                  </motion.button>
                ))}
              </div>
              {/* The stickers page. */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, alignContent: 'start', background: 'rgba(217,204,255,.35)', borderRadius: 20, padding: 12 }}>
                {STICKERS.map((id) => {
                  const has = found.includes(id)
                  return (
                    <motion.button
                      key={id}
                      aria-label={has ? `${id} sticker` : 'A sticker still to find'}
                      animate={wiggle === id ? { rotate: [0, -12, 10, -6, 0] } : { rotate: 0 }}
                      transition={{ duration: 0.5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (has) {
                          sfx.pop()
                          onFact(stickerFact(id))
                        } else sfx.boop()
                        setWiggle(id)
                        setTimeout(() => setWiggle(null), 520)
                      }}
                      style={{ minHeight: 88, background: 'none', border: 'none', padding: 4, display: 'grid', placeItems: 'center' }}
                    >
                      <Sticker id={id} found={has} size={84} />
                    </motion.button>
                  )
                })}
              </div>
              <button
                aria-label="Close album"
                onClick={() => {
                  sfx.pop()
                  onClose()
                }}
                style={{ position: 'sticky', bottom: 0, gridColumn: '1 / -1', justifySelf: 'center', width: 88, height: 88, borderRadius: '50%', border: '5px solid #fff', background: 'var(--hotpink)', color: '#fff', fontSize: 40, fontWeight: 700, boxShadow: 'var(--shadow)' }}
              >
                ✓
              </button>
            </motion.div>
            <AnimatePresence>
              {big && (
                <motion.button
                  key={big.n}
                  aria-label="Close photo"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setBig(null)
                  }}
                  style={{ position: 'absolute', inset: 0, margin: 'auto', width: 'min(92vw, 120vh)', height: 'fit-content', padding: '14px 14px 44px', background: '#fff', border: 'none', borderRadius: 8, boxShadow: 'var(--shadow)', zIndex: 2 }}
                >
                  <img src={big.src} alt="" style={{ width: '100%', display: 'block', borderRadius: 4 }} />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** A sticker flying from where she found the animal into the album. */
export function StickerFlight({ id, x, y, onDone }: { id: StickerId; x: number; y: number; onDone: () => void }) {
  const to = buttonCenter()
  return (
    <motion.div
      aria-hidden
      initial={{ x: x - 50, y: y - 50, scale: 0.3, rotate: -20 }}
      animate={{ x: [x - 50, x - 50, to.x - 50], y: [y - 50, y - 110, to.y - 50], scale: [0.3, 1.25, 0.4], rotate: [-20, 0, 15] }}
      transition={{ duration: 1.5, times: [0, 0.35, 1], ease: 'easeInOut' }}
      onAnimationComplete={onDone}
      style={{ position: 'absolute', left: 0, top: 0, zIndex: 50, pointerEvents: 'none' }}
    >
      <Sticker id={id} found size={100} />
    </motion.div>
  )
}

/** A new photo: it prints out big in the middle for a moment, then drops into the album (thwap). */
export function PhotoDrop({ src, onDone }: { src: string; onDone: () => void }) {
  const to = buttonCenter()
  const w = Math.min(window.innerWidth * 0.62, 440)
  const cx = window.innerWidth / 2 - w / 2
  const cy = window.innerHeight * 0.42 - (w * 0.75) / 2
  return (
    <motion.div
      aria-hidden
      initial={{ x: cx, y: cy + 60, scale: 0.6, opacity: 0, rotate: -6 }}
      animate={{ x: [cx, cx, to.x - w / 2], y: [cy + 60, cy, to.y - (w * 0.75) / 2], scale: [0.6, 1, 0.12], opacity: [0, 1, 1], rotate: [-6, 3, 12] }}
      transition={{ duration: 2.2, times: [0, 0.3, 1], ease: 'easeInOut' }}
      onAnimationComplete={() => {
        sfx.thump()
        onDone()
      }}
      style={{ position: 'absolute', left: 0, top: 0, width: w, padding: '10px 10px 30px', background: '#fff', borderRadius: 6, boxShadow: '0 10px 30px rgba(43,35,48,.35)', zIndex: 50, pointerEvents: 'none' }}
    >
      <img src={src} alt="" style={{ width: '100%', display: 'block', borderRadius: 3 }} />
    </motion.div>
  )
}
