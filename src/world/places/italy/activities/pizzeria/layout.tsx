// Shared pizzeria layouts: an overhead prep board with a separate chef window and order ticket,
// station tabs, the 1889 storybook frame, and a CoverBox that anchors things to background art.
import { motion } from 'motion/react'
import { useRef, type CSSProperties, type ReactNode } from 'react'
import { Buddy, PlayArea, useElementSize, useLandscape, type Line } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { art } from '../../art'
import { INK } from '../../puppets/ink'
import { WordCard, type WordId } from '../../WordCard'

export type StationId = 'order' | 'dough' | 'sauce' | 'toppings' | 'oven' | 'cut'
const STATIONS: { id: StationId; icon: string }[] = [
  { id: 'order', icon: '🧾' },
  { id: 'dough', icon: '🫓' },
  { id: 'sauce', icon: '🍅' },
  { id: 'toppings', icon: '🫒' },
  { id: 'oven', icon: '🔥' },
  { id: 'cut', icon: '🔪' },
]

/** The row of station tabs at the bottom; the current one is lit. Just a picture of where the pizza is (not buttons). */
export function StationBar({ at }: { at: StationId }) {
  const i = STATIONS.findIndex((s) => s.id === at)
  return (
    <div aria-hidden style={{ position: 'absolute', left: '50%', bottom: 'calc(var(--safe-bottom) + 26px)', translate: '-50% 0', display: 'flex', gap: 'min(1.4vw, 10px)', padding: '6px 10px', background: 'rgba(255,247,240,.9)', border: `4px solid ${INK}`, borderRadius: 999, boxShadow: 'var(--shadow)', zIndex: 15, pointerEvents: 'none' }}>
      {STATIONS.map((s, j) => (
        <motion.div
          key={s.id}
          animate={j === i ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={j === i ? { repeat: Infinity, duration: 1.2 } : undefined}
          style={{ width: 'clamp(34px, min(5vw, 5vh), 50px)', aspectRatio: '1', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 'clamp(18px, min(2.8vw, 2.8vh), 28px)', background: j === i ? '#FFE27A' : j < i ? '#CDEFD8' : '#fff', border: `3px solid ${j === i ? INK : 'rgba(110,59,36,.35)'}`, opacity: j > i ? 0.55 : 1 }}
        >
          {j < i ? '✓' : s.icon}
        </motion.div>
      ))}
    </div>
  )
}

/** A box with the picture's aspect ratio that covers its parent exactly like `background-size: cover` (centered), so
 *  children placed in % land on the same spot of the picture at every screen size. */
export function CoverBox({ img, ratio, children, style }: { img: string; ratio: number; children?: ReactNode; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const { width: w, height: h } = useElementSize(ref)
  const bw = Math.max(w, h * ratio)
  const bh = bw / ratio
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      {w > 0 && (
        <div style={{ position: 'absolute', left: (w - bw) / 2, top: (h - bh) / 2, width: bw, height: bh, background: `url(${img}) center / 100% 100%` }}>
          {children}
        </div>
      )}
    </div>
  )
}

/** Sepia old-storybook look for the 1889 story (the picture fills with color at the end). */
export const OLD = 'sepia(0.75) saturate(0.8) brightness(1.03)'

/** Cream page border with ink corners, drawn over a storybook scene. */
export function StoryFrame() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 18, border: 'min(18px, 2.4vmin) solid #F3E3C8', boxShadow: `inset 0 0 0 5px ${INK}, inset 0 0 40px rgba(110,59,36,.35)` }}>
      {[
        { left: 6, top: 6 },
        { right: 6, top: 6 },
        { left: 6, bottom: 6 },
        { right: 6, bottom: 6 },
      ].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...pos, width: 34, height: 34, borderRadius: '50%', background: '#E9CFA4', border: `4px solid ${INK}` }} />
      ))}
    </div>
  )
}

export interface KitchenProps {
  chef: ReactNode
  at: StationId
  prompt?: Line
  ticket?: ReactNode
  word?: WordId | null
  old?: boolean
  children?: ReactNode
}

/** Prep is seen from overhead. The chef has a separate little kitchen window, so the round pizza and its
 * tools share one camera angle on the marble worktop rather than floating in front of a kitchen wall. */
export function Kitchen({ chef, at, prompt, ticket, word, old, children }: KitchenProps) {
  const landscape = useLandscape()
  return (
    <PlayArea style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#F3E8DE', ['--ticket' as string]: landscape ? 'min(24vh, 17vw, 200px)' : 'min(15vh, 24vw, 170px)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(128deg, transparent 0 170px, #DED3C833 172px 175px, transparent 177px 330px), linear-gradient(35deg, #FFF9F2, #EEE2D6)', border: `24px solid ${old ? '#D9B386' : '#CB956D'}`, boxShadow: `inset 0 0 0 4px ${INK}, inset 0 0 35px #9B73582B`, filter: old ? OLD : undefined }} />
      {/* A front-facing portrait belongs in its own window, away from the overhead workspace. */}
      <div style={{ position: 'absolute', left: '3%', top: 'calc(var(--top-clear) + 96px)', width: 'var(--ticket)', height: 'calc(var(--ticket) * 1.1)', border: `4px solid ${INK}`, borderRadius: 24, overflow: 'hidden', background: `url(${art.bgPizzeriaKitchen}) center / cover`, zIndex: 2, filter: old ? OLD : undefined }}>
        <div style={{ position: 'absolute', inset: '6% 0 -24%', display: 'flex', justifyContent: 'center' }}>{chef}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '14%', background: '#F4ECE4', borderTop: `4px solid ${INK}` }} />
      </div>
      <div
        data-pizza-worktop
        style={{
          position: 'absolute',
          left: landscape ? 'calc(var(--ticket) + 5%)' : '4%',
          right: landscape ? 'calc(var(--ticket) + 5%)' : '4%',
          top: landscape ? 'calc(var(--top-clear) + 100px)' : 'calc(var(--top-clear) + 116px + var(--ticket) * 1.1)',
          bottom: 'calc(var(--safe-bottom) + 104px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 6, containerType: 'size',
        }}
      >
        {/* An overhead wooden board grounds all the prep tools on a tangible surface. */}
        <div aria-hidden style={{ position: 'absolute', inset: -8, borderRadius: 36, background: 'repeating-linear-gradient(0deg, #E9C59D 0 60px, #DFB68B 61px 63px, #E9C59D 64px 125px)', border: `4px solid ${INK}`, boxShadow: '0 8px 0 #6E3B2426', pointerEvents: 'none', filter: old ? OLD : undefined }} />
        <div style={{ position: 'absolute', inset: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', containerType: 'size' }}>{children}</div>
      </div>
      {ticket && <div style={{ position: 'absolute', right: '3%', top: 'calc(var(--top-clear) + 96px)', zIndex: 7, pointerEvents: 'none', width: 'var(--ticket)', display: 'flex', justifyContent: 'center' }}>{ticket}</div>}
      {prompt && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 28px', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}><PromptBubble text={prompt} /></div>
        </div>
      )}
      <StationBar at={at} />
      {old && <StoryFrame />}
      <WordCard word={word ?? null} />
    </PlayArea>
  )
}

/** Raffaele Esposito, the 1889 pizza maker, as a storybook Buddy. */
export function Raffaele({ height = '100%' }: { height?: string }) {
  return <Buddy img={art.raffaele} voice="raffaele" height={height} />
}
