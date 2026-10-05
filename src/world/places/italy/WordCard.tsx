// When a friend says an Italian word, a little card pops up with the word and what it means (for Dad, and so she sees
// what the word looks like). A tiny green-white-red stripe along the top makes it feel Italian.
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { INK } from './puppets/ink'

export const WORDS = {
  ciao: { it: 'Ciao!', en: 'hello / bye' },
  benvenuta: { it: 'Benvenuta!', en: 'welcome' },
  bellissimo: { it: 'Bellissimo!', en: 'so beautiful' },
  perfetto: { it: 'Perfetto!', en: 'perfect' },
  buonissima: { it: 'Buonissima!', en: 'so yummy' },
  grazie: { it: 'Grazie!', en: 'thank you' },
  grazieMille: { it: 'Grazie mille!', en: 'thanks a lot' },
  prego: { it: 'Prego!', en: "you're welcome" },
  delizioso: { it: 'Delizioso!', en: 'delicious' },
  mammaMia: { it: 'Mamma mia!', en: 'oh my!' },
  zio: { it: 'Zio', en: 'uncle' },
} as const
export type WordId = keyof typeof WORDS

export function WordCard({ word }: { word: WordId | null }) {
  const w = word ? WORDS[word] : null
  return (
    <AnimatePresence>
      {w && (
        <motion.div
          key={word}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: -3 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.45 }}
          style={{ position: 'absolute', right: 'max(12px, 3vw)', top: 'calc(var(--safe-top) + 10px)', zIndex: 35, background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 20, padding: '0 0 8px', boxShadow: 'var(--shadow)', textAlign: 'center', pointerEvents: 'none', overflow: 'hidden', minWidth: 150 }}
        >
          <div style={{ display: 'flex', height: 10, marginBottom: 4 }}>
            <div style={{ flex: 1, background: '#3FA56A' }} />
            <div style={{ flex: 1, background: '#fff' }} />
            <div style={{ flex: 1, background: '#E8574F' }} />
          </div>
          <div lang="it" style={{ fontSize: 'clamp(26px, 4.4vmin, 42px)', fontWeight: 700, color: '#E8574F', lineHeight: 1.1, padding: '0 16px' }}>
            {w.it}
          </div>
          <div style={{ fontSize: 'clamp(14px, 2vmin, 18px)', color: '#8A6A5A', padding: '0 16px' }}>{w.en}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Shows a WordCard for a few seconds: `const [word, showWord] = useWord()`. */
export function useWord(): [WordId | null, (w: WordId) => void] {
  const [word, setWord] = useState<WordId | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const show = useCallback((w: WordId) => {
    setWord(w)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setWord(null), 3800)
  }, [])
  return [word, show]
}
