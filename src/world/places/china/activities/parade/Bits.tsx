// Small pieces of the parade: the word card, the gong and the flag pole.
import { AnimatePresence, motion } from 'motion/react'
import { INK } from '../../puppets/ink'
import { WORDS } from '../../WordCard'

export interface Word {
  zh: string
  py: string
  en: string
}
export const PARADE_WORDS = {
  xiexie: WORDS.xiexie as Word,
  hongbao: { zh: '红包', py: 'hóngbāo', en: 'red envelope' } as Word,
  xinnian: { zh: '新年快乐', py: 'xīnnián kuàilè', en: 'Happy New Year' } as Word,
}

/** The little card with the real Chinese characters and pinyin (for Dad; she sees what the word looks like). */
export function ParadeCard({ word, top }: { word: Word | null; top: number }) {
  return (
    <AnimatePresence>
      {word && (
        <motion.div
          key={word.zh}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: -3 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.45 }}
          style={{ position: 'absolute', right: 'max(12px, 3vw)', top, zIndex: 3001, background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 20, padding: '6px 16px 8px', boxShadow: 'var(--shadow)', textAlign: 'center', pointerEvents: 'none' }}
        >
          <div lang="zh-CN" style={{ fontSize: 'clamp(30px, 5vmin, 48px)', fontWeight: 700, color: '#E8504F', fontFamily: '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif', lineHeight: 1.1 }}>
            {word.zh}
          </div>
          <div style={{ fontSize: 'clamp(16px, 2.4vmin, 22px)', fontWeight: 600, color: INK }}>{word.py}</div>
          <div style={{ fontSize: 'clamp(13px, 1.9vmin, 17px)', color: '#8A6A5A' }}>{word.en}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** A round golden gong on a little red frame. */
export function GongArt({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block', overflow: 'visible' }} aria-hidden>
      <g stroke={INK} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
        <path d="M30 196 L44 40 L156 40 L170 196" fill="none" stroke={INK} strokeWidth="22" />
        <path d="M30 196 L44 40 L156 40 L170 196" fill="none" stroke="#E8504F" strokeWidth="11" />
        <circle cx="100" cy="104" r="66" fill="#FFD04A" />
        <circle cx="100" cy="104" r="46" fill="#FFE27A" />
        <circle cx="100" cy="104" r="22" fill="#FFC21F" />
        <path d="M60 78 Q72 62 90 58" fill="none" stroke="#fff" strokeWidth="6" opacity="0.7" />
      </g>
    </svg>
  )
}
