// Whale Watch: Kaylee steers Maple's little boat out of Tofino's harbour to find Ollie the sea otter, then the whales
// and the orca family (watch.ts is the world). After the chapter's film in (`filmed`), the boat is hers at once:
// Sparkle says how to steer. From a link or a replay it opens at the dock with Maple's short hello (tap anywhere skips).
// Sparkle speaks again only when something new appears or she's stuck; Maple and the otters react in their own voices
// (Guide.tsx). The address bar follows her from part to part (sections.ts). The orca family's big jump is the payoff:
// then the film out (Ollie joins the team), the stamp and the sea otter sticker (onDone); 🔁 sets off again.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst, stopSpeaking, useAlive, wait, useTimers } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { CanadaActivityProps } from '../props'
import { WhaleGuide, type WhaleGuideHandle } from './Guide'
import WHALE_SECTIONS, { type WhaleSection } from './sections'
import { WHALE_ANCHORS, WhaleWatch as World, type WhaleEvents, type WhaleStart } from './watch'

/** Parts finished when a link starts at this section (of three: the otters, the whales, the orcas). */
const DONE_AT: Record<WhaleSection, number> = { story: 0, harbour: 0, otters: 0, spouts: 1, orcas: 2, listen: 2 }
/** Seconds from the family's big jump to the stamp (the celebration plays first). */
const STAMP_AFTER_S = 5

export function WhaleWatch({ onDone, setProgress, filmed }: CanadaActivityProps) {
  const timers = useTimers()
  const { start, param, enter } = useSections(WHALE_SECTIONS)
  const [run, setRun] = useState<WhaleStart & { n: number }>(() => ({ section: (start ?? (filmed ? 'harbour' : 'story')) as WhaleSection, found: +param('found') || 0, n: 0 }))
  const [section, setSection] = useState<WhaleSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const alive = useAlive()
  const worldRef = useRef<World | null>(null)
  const guide = useRef<WhaleGuideHandle>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const stamped = useRef(false)
  const listened = useRef(false)
  const storyDone = useRef(run.section !== 'story')

  useEffect(() => enter(run.section, run.section === 'spouts' ? { found: String(run.found) } : {}), [run])
  useEffect(() => setProgress(DONE_AT[run.section], 3), [run])

  /** What Sparkle says when a part begins (the first time it's new to her). */
  const intro = (s: WhaleSection) => {
    const w = L.whales
    if (s === 'harbour') return w.steer
    if (s === 'otters') return w.otters
    if (s === 'spouts') return w.spouts
    if (s === 'orcas') return w.orcas
    if (s === 'listen' && !listened.current) {
      listened.current = true
      return w.listen
    }
    return null
  }
  const speak = (s: WhaleSection) => {
    const l = intro(s)
    if (l) void guide.current?.speak(l)
  }

  // ---- The story at the dock: Maple's lines (she acts them out in the boat), then the boat is hers.
  const endStory = () => {
    if (storyDone.current) return
    storyDone.current = true
    worldRef.current?.play()
  }
  useEffect(() => {
    if (run.section !== 'story') {
      // A link that starts later: Sparkle says what this part is about.
      const t = timers.later(() => speak(run.section), 600)
      return () => clearTimeout(t)
    }
    void (async () => {
      await wait(700)
      for (const l of L.whales.story) {
        if (!alive() || storyDone.current) return
        const t0 = performance.now()
        await guide.current?.speak(l)
        // (At least a moment per line, so Maple acts it out even while a clip is missing.)
        await wait(Math.max(250, 2200 - (performance.now() - t0)))
      }
      if (alive()) endStory()
    })()
  }, [run])

  const events = useRef<WhaleEvents>({
    section: (s) => {
      setSection(s)
      enter(s)
      speak(s)
    },
    done: () => {
      setDone(true)
      burst()
      timers.later(() => {
        if (!alive() || stamped.current) return
        stamped.current = true
        onDone()
      }, STAMP_AFTER_S * 1000)
    },
    say: (l, voice = true) => (voice ? void guide.current?.speak(l) : guide.current?.show(l)),
    progress: (n) => setProgress(n, 3),
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const restart = (s: WhaleSection) => {
    setDone(false)
    setSection(s)
    storyDone.current = s !== 'story'
    setRun((r) => ({ section: s, found: s === 'spouts' ? (worldRef.current?.qa().found as number) ?? 0 : 0, n: r.n + 1 }))
  }

  const inStory = section === 'story'
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#CFEAF7', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={run.n}
        name="the sea off Tofino"
        qaKey="__canadaWhalesQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={WHALE_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="whale-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {/* The story: tap anywhere to skip to the boat. */}
      {inStory && (
        <button
          aria-label="Skip"
          onClick={() => {
            stopSpeaking()
            endStory()
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'transparent', border: 'none' }}
        />
      )}
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            restart(section === 'listen' || section === 'story' ? (section === 'story' ? 'harbour' : 'orcas') : section)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(207,234,247,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🐋 Tap to wake the sea
        </button>
      )}
      {done && (
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: STAMP_AFTER_S + 0.5, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={() => restart('harbour')} ariaLabel="Go whale watching again">
              🔁 🚤
            </BigButton>
          </motion.div>
        </div>
      )}
      <WhaleGuide ref={guide} />
    </div>
  )
}

/** The hint's hand: pressing on the water the way to go. */
const HINT_CSS = `
.whale-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.whale-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: whale-press 1.4s ease-in-out infinite; }
@keyframes whale-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82) translateY(6px); }
}
`
