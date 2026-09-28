// When a friend says a Chinese word, a little card pops up with the real characters and pinyin (for Dad, and so she
// sees what the word looks like). The voices say the words from phonetic spellings in lines.ts.
import { AnimatePresence, motion } from 'motion/react'
import { INK } from './puppets/ink'

export const WORDS = {
  nihao: { zh: '你好', py: 'nǐ hǎo', en: 'hello' },
  nonghao: { zh: '侬好', py: 'nóng hǎo', en: 'hello (Shanghai)' },
  yiersan: { zh: '一 二 三', py: 'yī èr sān', en: 'one two three' },
  haochi: { zh: '好吃', py: 'hǎo chī', en: 'delicious' },
  xiexie: { zh: '谢谢', py: 'xièxie', en: 'thank you' },
  aiyo: { zh: '哎哟', py: 'āiyō', en: 'oh my!' },
  xiaolongbao: { zh: '小笼包', py: 'xiǎolóngbāo', en: 'soup dumplings' },
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
          style={{ position: 'absolute', right: 'max(12px, 3vw)', top: 'calc(var(--top-clear) + 8px)', zIndex: 35, background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 20, padding: '6px 16px 8px', boxShadow: 'var(--shadow)', textAlign: 'center', pointerEvents: 'none' }}
        >
          <div lang="zh-CN" style={{ fontSize: 'clamp(30px, 5vmin, 48px)', fontWeight: 700, color: '#E8504F', fontFamily: '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif', lineHeight: 1.1 }}>
            {w.zh}
          </div>
          <div style={{ fontSize: 'clamp(16px, 2.4vmin, 22px)', fontWeight: 600, color: INK }}>{w.py}</div>
          <div style={{ fontSize: 'clamp(13px, 1.9vmin, 17px)', color: '#8A6A5A' }}>{w.en}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
