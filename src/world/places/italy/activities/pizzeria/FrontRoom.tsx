// The front of the pizzeria: the customer stands at the counter with their order ticket, and the finished pizza is
// served on the counter (tap it: it slides over, they eat, hearts pop). In 1889 it's the street outside the old pizzeria.
import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { PlayArea, sounds, useLandscape, type Line } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { art } from '../../art'
import { INK } from '../../puppets/ink'
import { WordCard, type WordId } from '../../WordCard'
import { OLD, StationBar, StoryFrame, type StationId } from './layout'
import { PizzaView, type PizzaState } from './pizza'

export interface FrontRoomProps {
  customer: ReactNode
  old?: boolean
  /** The picture fills with color (end of the 1889 story). */
  colorIn?: boolean
  prompt?: Line
  ticket?: ReactNode
  /** The pizza on the counter, and what happens when she taps it. */
  pizza?: PizzaState
  onServe?: () => void
  /** Someone is eating: the pizza is gone and hearts float up. */
  eaten?: boolean
  at?: StationId
  word?: WordId | null
  children?: ReactNode
}

export function FrontRoom({ customer, old, colorIn, prompt, ticket, pizza, onServe, eaten, at, word, children }: FrontRoomProps) {
  const landscape = useLandscape()
  const [served, setServed] = useState(false)
  const bg = old ? art.bgNaples1889 : landscape ? art.bgPizzeriaFront : art.bgPizzeriaFrontTall
  const custH = landscape ? 'min(56vh, 36vw)' : 'min(40vh, 62vw)'
  const counterH = landscape ? '27%' : '24%'
  const filter = old && !colorIn ? OLD : 'none'
  return (
    <PlayArea style={{ position: 'absolute', inset: 0, overflow: 'hidden', ['--ticket' as string]: landscape ? 'min(28vh, 20vw, 230px)' : 'min(20vh, 32vw, 210px)' }}>
      <motion.div animate={{ filter }} transition={{ duration: 1.6 }} style={{ position: 'absolute', inset: 0, background: `url(${bg}) center / cover` }} />
      {/* The customer stands behind the counter. */}
      <motion.div animate={{ filter }} transition={{ duration: 1.6 }} style={{ position: 'absolute', left: landscape ? '14%' : '6%', bottom: `calc(${counterH} - ${custH} * 0.18)`, height: custH, zIndex: 2, display: 'flex', alignItems: 'flex-end' }}>
        {customer}
      </motion.div>
      {/* Hearts when she eats */}
      <AnimatePresence>
        {eaten &&
          [0, 1, 2].map((i) => (
            <motion.div key={i} initial={{ y: 0, opacity: 0, scale: 0.4 }} animate={{ y: -160 - i * 30, opacity: [0, 1, 1, 0], scale: 1.2 }} transition={{ duration: 2.2, delay: i * 0.25 }} style={{ position: 'absolute', left: `calc(${landscape ? '14%' : '6%'} + ${custH} * ${0.3 + i * 0.15})`, bottom: `calc(${counterH} + ${custH} * 0.6)`, fontSize: 'min(9vh, 64px)', zIndex: 9, pointerEvents: 'none' }}>
              💖
            </motion.div>
          ))}
      </AnimatePresence>
      {/* The counter: a wooden front with a marble top (or a little wooden table on the old street). */}
      <motion.div animate={{ filter }} transition={{ duration: 1.6 }} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: counterH, zIndex: 3 }}>
        <div style={{ position: 'absolute', inset: 0, background: old ? '#C98B5B' : '#E48A62', borderTop: `6px solid ${INK}` }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '26%', background: old ? '#E0B07E' : '#F7F1EA', borderBottom: `5px solid ${INK}` }} />
          {!old && (
            <div style={{ position: 'absolute', left: '3%', right: '3%', top: '38%', bottom: '12%', display: 'flex', gap: '2%' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ flex: 1, background: i % 2 ? '#F2A07A' : '#FFE27A', border: `4px solid ${INK}`, borderRadius: 14 }} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
      {/* The ticket, like a speech bubble next to the customer. */}
      {ticket && (
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }} style={{ position: 'absolute', left: landscape ? `calc(14% + ${custH} * 0.95)` : 'auto', right: landscape ? 'auto' : '5%', top: landscape ? 'calc(var(--top-clear) + 96px)' : 'calc(var(--top-clear) + 90px)', zIndex: 8, width: 'var(--ticket)' }}>
          {ticket}
        </motion.div>
      )}
      {/* The pizza on the counter: tap it to serve. */}
      <AnimatePresence>
        {pizza && !eaten && (
          <motion.button
            key="pizza"
            aria-label="Serve the pizza"
            className={onServe && !served ? 'world-glow' : undefined}
            initial={{ y: 80, opacity: 0 }}
            animate={served ? { x: landscape ? '-90%' : '-60%', y: '-40%', scale: 0.4, opacity: 0 } : { y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={served ? { duration: 0.7, ease: 'easeIn' } : { type: 'spring', bounce: 0.4 }}
            onClick={() => {
              if (!onServe || served) return
              setServed(true)
              sounds.whoosh()
              onServe()
            }}
            style={{ position: 'absolute', left: landscape ? '52%' : '42%', bottom: `calc(${counterH} * 0.55)`, zIndex: 6, background: 'none', border: 'none', padding: 0, borderRadius: '50%' }}
          >
            <div style={{ transform: 'scaleY(0.62)', transformOrigin: '50% 100%' }}>
              <PizzaView pizza={pizza} size={landscape ? 'min(40vh, 30vw)' : 'min(46vw, 30vh)'} />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
      {children}
      {prompt && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}
      {at && <StationBar at={at} />}
      {old && !colorIn && <StoryFrame />}
      <WordCard word={word ?? null} />
    </PlayArea>
  )
}
