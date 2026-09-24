import { motion } from 'motion/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { shuffle } from '../helpers'
import { sounds } from '../sounds'
import { say } from '../speech'

export interface Pair {
  id: string
  /** The two halves can be the same (memory game) or different (picture + letter, number + dots...). */
  a: ReactNode
  b: ReactNode
  /** Spoken when she finds the pair. */
  say?: string
}

/** Flip cards to find matching pairs. */
export function MatchPairs({ pairs, onDone, cardSize = 140 }: { pairs: Pair[]; onDone: () => void; cardSize?: number }) {
  const cards = useMemo(() => shuffle(pairs.flatMap((p) => [{ key: `${p.id}-a`, pair: p, face: p.a }, { key: `${p.id}-b`, pair: p, face: p.b }])), [pairs])
  const [open, setOpen] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])

  useEffect(() => {
    if (pairs.length > 0 && matched.length === pairs.length) {
      const t = setTimeout(onDone, 900)
      return () => clearTimeout(t)
    }
  }, [matched.length, pairs.length, onDone])

  const flip = (key: string) => {
    if (open.length === 2 || open.includes(key)) return
    const card = cards.find((c) => c.key === key)!
    if (matched.includes(card.pair.id)) return
    sounds.pop()
    const next = [...open, key]
    setOpen(next)
    if (next.length === 2) {
      const [x, y] = next.map((k) => cards.find((c) => c.key === k)!)
      if (x.pair.id === y.pair.id) {
        setTimeout(() => {
          sounds.sparkle()
          if (x.pair.say) void say(x.pair.say)
          setMatched((m) => [...m, x.pair.id])
          setOpen([])
        }, 500)
      } else {
        setTimeout(() => setOpen([]), 1100)
      }
    }
  }

  const cols = cards.length <= 6 ? 3 : 4
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cardSize}px)`, gap: 16, justifyContent: 'center' }}>
      {cards.map((c) => {
        const faceUp = open.includes(c.key) || matched.includes(c.pair.id)
        return (
          <motion.button
            key={c.key}
            aria-label={faceUp ? 'card' : 'hidden card'}
            onClick={() => flip(c.key)}
            animate={{ rotateY: faceUp ? 0 : 180, scale: matched.includes(c.pair.id) ? 0.95 : 1 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            style={{
              width: cardSize,
              height: cardSize,
              borderRadius: 24,
              boxShadow: 'var(--shadow)',
              background: faceUp ? (matched.includes(c.pair.id) ? 'var(--mint)' : '#fff') : 'var(--pink)',
              fontSize: cardSize * 0.45,
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
            }}
          >
            {faceUp ? <div style={{ transform: 'scaleX(1)' }}>{c.face}</div> : <span style={{ transform: 'scaleX(-1)' }}>✨</span>}
          </motion.button>
        )
      })}
    </div>
  )
}
