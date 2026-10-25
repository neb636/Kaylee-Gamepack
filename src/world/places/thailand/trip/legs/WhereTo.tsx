// "Where to?": someone in the family asks, and a row of postcards comes up from the bottom, one per place (a picture
// she can read without words, the name under it for Dad). Tap one and that's where they go. The row scrolls sideways
// when there are more postcards than fit, so a trip can offer as many places as it likes (Krabi's fork: the elephants
// or the boat). The question is spoken by the leg; tapping the bubble says it again. No three.js here.
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { lineText, say, sounds, type Line } from '../../../../../sdk'

/** A place on the card: its id, a name (for Dad and VoiceOver), its frame color and its picture (3:2, shown whole). */
export interface Postcard {
  id: string
  label: string
  color: string
  picture: ReactNode
}

interface Props {
  open: boolean
  /** Who asks, and their chip's color (the card shows their name and the words). */
  who: string
  whoColor: string
  line: Line
  cards: Postcard[]
  onPick(id: string): void
}

const W = 'clamp(112px, min(30vw, 30vh), 230px)'

export function WhereTo({ open, who, whoColor, line, cards, onPick }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="where-to"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 50, pointerEvents: 'none' }}
        >
          <motion.button
            aria-label={`${who}: ${lineText(line)}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => void say(line)}
            style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 'calc(100% - 32px)', background: 'rgba(255,255,255,0.97)', border: 'none', borderRadius: 999, padding: '6px 18px 6px 6px', boxShadow: 'var(--shadow)', color: 'var(--ink)', font: 'inherit' }}
          >
            <span aria-hidden style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 24, background: whoColor, fontSize: 26, border: '3px solid #fff' }}>
              🔊
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
              <small style={{ fontWeight: 700, opacity: 0.6, fontSize: 13 }}>{who}</small>
              <span style={{ fontWeight: 700, fontSize: 'clamp(18px, min(3vw, 3.4vh), 26px)' }}>{lineText(line)}</span>
            </span>
          </motion.button>
          {/* (Centered while they fit; past that the row scrolls, a postcard at a time.) */}
          <div style={{ pointerEvents: 'auto', maxWidth: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'flex', gap: 'clamp(14px, 3vw, 32px)', padding: '14px 16px 8px', width: 'max-content', margin: '0 auto' }}>
              {cards.map((c, i) => (
                <motion.button
                  key={c.id}
                  aria-label={c.label}
                  initial={{ y: 80, rotate: 0 }}
                  animate={{ y: [0, -6, 0], rotate: i % 2 ? 2.5 : -2.5 }}
                  transition={{ y: { repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: i * 0.35 }, rotate: { type: 'spring' } }}
                  whileTap={{ scale: 0.9, rotate: 0 }}
                  onClick={() => {
                    sounds.pop()
                    onPick(c.id)
                  }}
                  style={{ scrollSnapAlign: 'center', flexShrink: 0, width: W, padding: 8, paddingBottom: 4, border: 'none', borderRadius: 18, background: '#fff', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--ink)', font: 'inherit' }}
                >
                  <span aria-hidden style={{ display: 'block', width: '100%', aspectRatio: '3 / 2', borderRadius: 12, overflow: 'hidden', background: c.color }}>
                    {c.picture}
                  </span>
                  <span style={{ alignSelf: 'center', fontWeight: 700, fontSize: 'clamp(15px, min(2.4vw, 2.6vh), 20px)', padding: '2px 0' }}>{c.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
