import { useSections } from '../../../../kit/sections'
import SECTIONS from './sections'
// 🐘 Baan Chang Cafe (Krabi Town, Thailand: a real cafe where elephants live below the terrace). Plan:
// planning/around-the-world/thailand.md. GATE 1, the greybox: only the verbs, with placeholder shapes, no generated art
// and no character voices (Sparkle reads the prompts). Dad plays it on the iPad before any art or puppets.
// Upstairs (Cafe.tsx, the side verb): make Daddy's iced coffee and her own chocolate milk by grabbing and tilting.
// Downstairs (Yard.tsx, the core toy): hold food out and the elephants' trunks snake after it, in three rounds that
// get richer (bananas, favorite foods, the watermelon and the sneaky baby), then a water shower with a rainbow.
// The world is the cafe stacked above the yard; the stairs pan the camera down.
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { say, type Line } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Cafe, type CafeStep } from './Cafe'
import { FEEL } from './feel'
import { pickLayout } from './layout'
import type { StrawColor } from './shapes'
import { Yard, type YardStage } from './Yard'

type Section = (typeof SECTIONS.sections)[number]['id']
const YARD: YardStage[] = ['bananas', 'favorites', 'watermelon', 'shower']
const CAFE_PROMPT: Record<CafeStep, Line> = {
  ice: L.cafe.ice,
  coffee: L.cafe.coffee,
  milk: L.cafe.milk,
  straw: L.cafe.straw,
  deliver: L.cafe.deliver,
  milk2: L.cafe.cocoa,
  syrup: L.cafe.syrup,
  stir: L.cafe.stir,
  pick: L.cafe.pick,
  cream: L.cafe.cream,
  stairs: L.cafe.stairs,
}
const YARD_PROMPT: Record<YardStage, Line> = { bananas: L.yard.bananas, favorites: L.yard.favorites, watermelon: L.yard.watermelon, shower: L.yard.full }
/** When she's stuck, Sparkle says this (the prompt again, or a nudge). */
const YARD_HINT: Record<YardStage, Line> = { bananas: L.yard.hint, favorites: L.yard.bubble, watermelon: L.yard.watermelon, shower: L.yard.full }
const cafeSection = (s: CafeStep): Section => (s === 'stairs' ? 'downstairs' : ['milk2', 'syrup', 'stir', 'pick', 'cream'].includes(s) ? 'cocoa' : 'coffee')
/** Stars: Daddy's coffee, her chocolate milk, downstairs, bananas, favorites, watermelon. */
const TOTAL = 6

export function BaanChang({ onDone, setProgress }: ActivityProps) {
  const { start, param, enter } = useSections(SECTIONS)
  const first: Section = start ?? 'arrive'
  const startsInYard = (YARD as string[]).includes(first)
  const [straw, setStraw] = useState(param('straw') as StrawColor)
  const [cream, setCream] = useState(param('cream') === 'yes')
  const [story, setStory] = useState(first === 'arrive')
  const [view, setView] = useState<'cafe' | 'yard'>(startsInYard ? 'yard' : 'cafe')
  const [panning, setPanning] = useState(false)
  const [cafeStep, setCafeStep] = useState<CafeStep>(first === 'cocoa' ? 'milk2' : first === 'downstairs' ? 'stairs' : 'ice')
  const [yardStage, setYardStage] = useState<YardStage>(startsInYard ? (first as YardStage) : 'bananas')
  const [size, setSize] = useState({ W: 0, H: 0 })
  const frame = useRef<HTMLDivElement>(null)
  const lastTouch = useRef(performance.now())

  // ---- Layout: measure, pick the wide or tall stage, scale it to fit ----
  useEffect(() => {
    const el = frame.current
    if (!el) return
    const measure = () => setSize({ W: el.clientWidth, H: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const S = size.W ? pickLayout(size.W, size.H) : null
  const scale = S ? Math.min(size.W / S.w, size.H / S.h) : 1
  const ox = S ? (size.W - S.w * scale) / 2 : 0
  const oy = S ? (size.H - S.h * scale) / 2 : 0

  const prompt: Line = view === 'yard' ? YARD_PROMPT[yardStage] : CAFE_PROMPT[cafeStep]
  const section: Section = story ? 'arrive' : view === 'yard' ? yardStage : cafeSection(cafeStep)

  // The address bar follows the moment on screen.
  useEffect(() => {
    const later = section === 'downstairs' || (YARD as string[]).includes(section)
    enter(section, later ? { straw, cream: cream ? 'yes' : 'no' } : {})
  }, [section])

  // Stars.
  useEffect(() => {
    const cafeStars = ['milk2', 'syrup', 'stir', 'pick', 'cream'].includes(cafeStep) ? 1 : cafeStep === 'stairs' ? 2 : 0
    setProgress(view === 'yard' ? 3 + YARD.indexOf(yardStage) : cafeStars, TOTAL)
  }, [cafeStep, yardStage, view])

  // Sparkle only speaks again when she's been still for a while.
  useEffect(() => {
    lastTouch.current = performance.now()
    const t = setInterval(() => {
      if (story || panning || yardStage === 'shower') return
      if (performance.now() - lastTouch.current > FEEL.stuck * 1000) {
        lastTouch.current = performance.now()
        void say(view === 'yard' ? YARD_HINT[yardStage] : CAFE_PROMPT[cafeStep])
      }
    }, 1000)
    return () => clearInterval(t)
  }, [story, panning, view, cafeStep, yardStage])

  const goDownstairs = () => {
    setPanning(true)
    setView('yard')
    setTimeout(() => setPanning(false), 1700)
  }

  return (
    <div
      onPointerDownCapture={() => (lastTouch.current = performance.now())}
      style={{ position: 'absolute', inset: 0, overflow: 'clip', background: view === 'yard' ? '#9ED7A0' : '#7CC27A', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div ref={frame} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 'calc(var(--top-clear) + 78px)' }}>
        {S && (
          <div style={{ position: 'absolute', left: ox, top: oy, width: S.w, height: S.h, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
            <motion.div initial={false} animate={{ y: view === 'yard' ? -S.yardY : 0 }} transition={{ duration: panning ? 1.6 : 0, ease: 'easeInOut' }} style={{ position: 'absolute', inset: 0 }}>
              {(view === 'cafe' || panning) && (
                <Cafe
                  key={S.tall ? 'tall' : 'wide'}
                  S={S}
                  active={view === 'cafe' && !story && !panning}
                  first={cafeStep}
                  straw={straw}
                  cream={cream}
                  onStep={setCafeStep}
                  onChoose={(c) => {
                    if (c.straw) setStraw(c.straw)
                    if (c.cream !== undefined) setCream(c.cream)
                  }}
                  onStairs={goDownstairs}
                />
              )}
              {view === 'yard' && (
                <div style={{ position: 'absolute', left: 0, top: S.yardY, width: S.w, height: S.h }}>
                  <Yard key={S.tall ? 'tall' : 'wide'} S={S} active={!panning} first={yardStage} straw={straw} cream={cream} onStage={setYardStage} onDone={onDone} />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
      {!story && (
        <div className="wide-bar" style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 12px', pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto', maxWidth: '100%' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}
      {story && <StoryBeat lines={L.cafe.story} onDone={() => setStory(false)} />}
    </div>
  )
}
