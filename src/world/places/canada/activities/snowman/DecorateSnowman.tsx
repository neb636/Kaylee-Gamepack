// Decorate a Snowman: Kaylee decorates snowmen for the Winter Carnival in the snowy park below Quebec City's castle
// hotel, with whatever she grabs off Maple's red toboggan (decorate.ts is the world). The bare link opens with Maple's
// hello (a touch skips it). Sparkle, in the corner, shows the one instruction for each part, the friend's picture card
// floats over Maple's head, Maple's camera flashes when a snowman wakes up. The address bar follows her from part to
// part (sections.ts). After the parade the stamp (onDone); "again" starts fresh.
//
// Greybox: the new instructions below are shown, not spoken yet (the voice gate moves them into lines.ts and records
// them). The lines Maple and the snowmen say come from lines.ts (L.snowman) and are recorded already.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst, SparklePuppet, type PuppetHandle } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import type { CanadaActivityProps } from '../props'
import { CardPicture } from './Card'
import { DecorateSnowman as World, STUDIO_ANCHORS, type HintKind, type StudioEvents } from './decorate'
import SNOWMAN_SECTIONS, { type SnowmanSection } from './sections'
import type { Card } from './studio'

/** What Sparkle shows as each part begins (not recorded yet: greybox). */
const SHOW: Record<SnowmanSection, string> = {
  story: 'Maple needs snowmen for the carnival parade!',
  face: 'Give him a face! Drag the coal and the carrot onto him.',
  dress: 'Now dress him for the carnival!',
  friends: "Make the snowman in Maple's picture!",
  parade: 'Here comes the parade!',
}
const READY = 'Tap the drum to wake him up!'
const HINTS: Record<HintKind, string> = { tool: 'Grab something and put it on him!', drum: 'Tap the big drum!' }
const ICON: Record<SnowmanSection, string> = { story: '🎪', face: '⛄', dress: '🎩', friends: '🖼️', parade: '🎺' }
const PARTS: SnowmanSection[] = ['face', 'dress', 'friends', 'parade']

export function DecorateSnowman({ onDone, setProgress }: Partial<CanadaActivityProps> = {}) {
  const { start, param, enter } = useSections(SNOWMAN_SECTIONS)
  const [run, setRun] = useState(() => ({ section: (start ?? 'story') as SnowmanSection, made: Number(param('made')) || 0, n: 0 }))
  const [section, setSection] = useState<SnowmanSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const [line, setLine] = useState(SHOW[run.section])
  const [card, setCard] = useState<Card | null>(null)
  const [flash, setFlash] = useState(0)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const finished = useRef(false)
  const cb = useRef({ onDone, setProgress })
  cb.current = { onDone, setProgress }

  const state = (s: SnowmanSection, made: number) => (s === 'friends' || s === 'parade' ? { made: String(Math.max(1, made)) } : {})
  const progress = (s: SnowmanSection) => cb.current.setProgress?.(Math.max(0, PARTS.indexOf(s)), PARTS.length)
  useEffect(() => {
    enter(run.section, state(run.section, run.made))
    progress(run.section)
  }, [run])

  const show = (text: string) => {
    setLine(text)
    sparkle.current?.play('wave')
  }

  const events = useRef<StudioEvents>({
    section: (s, made) => {
      setSection(s)
      enter(s, state(s, made))
      progress(s)
      show(SHOW[s])
    },
    card: setCard,
    ready: () => show(READY),
    flash: () => setFlash((f) => f + 1),
    hint: (kind) => show(HINTS[kind]),
    done: () => {
      setDone(true)
      burst()
      cb.current.setProgress?.(PARTS.length, PARTS.length)
      // The stamp, once (a replay after it doesn't earn another).
      if (!finished.current) {
        finished.current = true
        setTimeout(() => cb.current.onDone?.(), 1200)
      }
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { section: run.section, made: run.made }, events.current)
    w.setHintElement(hintRef.current)
    w.setCardElement(cardRef.current)
    return w
  }
  const restart = (s: SnowmanSection) => {
    setDone(false)
    setCard(null)
    setSection(s)
    setLine(SHOW[s])
    setRun((r) => ({ section: s, made: 0, n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#DCE6F6', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="the carnival park"
        qaKey="__canadaSnowmanQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={STUDIO_ANCHORS} els={els} {...input} />
            {/* The friend's picture card, over Maple's head. */}
            <div ref={cardRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 15000 }}>
              <AnimatePresence mode="popLayout">
                {card && (
                  <motion.div
                    key={card}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: [-4, 4, -4] }}
                    exit={{ scale: 0 }}
                    transition={{ rotate: { repeat: Infinity, duration: 2.2 }, scale: { type: 'spring', stiffness: 400, damping: 14 } }}
                    style={{ translate: '-50% -100%', padding: 6, borderRadius: 18, background: '#fff', border: '4px solid #E8443F', boxShadow: '0 4px 10px rgba(43,35,48,.18)', width: 'clamp(76px, 13vmin, 116px)', height: 'clamp(76px, 13vmin, 116px)', display: 'grid', placeItems: 'center' }}
                  >
                    <CardPicture card={card} size="100%" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* After a while with nothing touched: a finger on a tool she hasn't tried, or on the drum. */}
            <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
              <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
                👆
              </motion.div>
            </div>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            restart(section)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(220,230,246,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          ⛄ Tap to wake the park
        </button>
      )}
      {/* Maple's camera flash. */}
      <AnimatePresence>{flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 55 }} />}</AnimatePresence>
      {/* Sparkle in the corner: she gives the instructions. */}
      {section !== 'story' && (
        <div aria-hidden style={{ position: 'absolute', left: 'max(8px, env(safe-area-inset-left))', bottom: 'calc(var(--safe-bottom) + 4px)', width: 'var(--target, 88px)', height: 'calc(var(--target, 88px) * 1.25)', zIndex: 21, pointerEvents: 'none' }}>
          <SparklePuppet ref={sparkle} height="100%" lookToward={0.6} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 'calc(var(--target, 88px) + 16px)', right: 'calc(var(--target, 88px) + 16px)', top: 'calc(var(--top-clear, 104px) + 6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        <AnimatePresence mode="popLayout">
          <motion.div key={line} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
            {ICON[section]} {line}
          </motion.div>
        </AnimatePresence>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={() => restart('face')} ariaLabel="Decorate more snowmen">
              🔁 ⛄
            </BigButton>
          </motion.div>
        )}
      </div>
    </div>
  )
}

const PILL = {
  background: 'rgba(255,255,255,.92)',
  color: 'var(--ink)',
  borderRadius: 999,
  padding: '8px 20px',
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
}
