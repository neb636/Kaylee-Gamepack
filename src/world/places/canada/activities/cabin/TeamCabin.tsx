// The Team Cabin (planning/around-the-world/canada-round-2.md, part 4): the skate hut beside the canal, where she
// dresses the team (cabin.ts is the world). A toy on the map with no stamp and no end: the map's 🗺 button takes her
// back. Sparkle, in the corner, says the one instruction the first time she comes in (and again if she's stuck); tap
// her to hear it again. The mirror's team photo pops up over the room for a moment, then it's pinned on the wall.
// `?fit=hat.crown` shows the fitting sheet instead (QA: every friend wearing one thing, fitting.ts).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { lineText, say, spendHint, SparklePuppet, type PuppetHandle, useTimers } from '../../../../../sdk'
import { savedKey } from '../../../../../sdk/hooks'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type QAKey, type RenderMode, type World3D } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { TeamId } from '../../looks'
import { CHAPTERS, isChapter, TEAM, teamOf } from '../../story/chapters'
import type { CanadaActivityProps } from '../props'
import { CABIN_ANCHORS, TeamCabinWorld } from './cabin'
import { FittingWorld } from './fitting'
import CABIN_SECTIONS from './sections'

const QA_KEY = '__canadaCabinQA' as QAKey
const SEEN = savedKey('canada-cabin-seen')
const linkParam = (k: string) => new URLSearchParams(location.hash.split('?')[1] ?? '').get(k)

/** Who sits on the bench besides Maple: the link's `team`, else one friend per stamp. */
function teamFrom(param: string, stamps: string[]): TeamId[] {
  const chapters = param === 'all' ? [...CHAPTERS] : param === 'none' ? [] : param ? param.split(',').filter(isChapter) : teamOf(stamps)
  return chapters.map((c) => TEAM[c].who)
}

export function TeamCabin({ stamps = [] }: Partial<CanadaActivityProps>) {
  const [fit] = useState(() => linkParam('fit'))
  if (fit) return <Fitting fit={fit} />
  return <Cabin stamps={stamps} />
}

function Fitting({ fit }: { fit: string }) {
  const worldRef = useRef<World3D | null>(null)
  const [, setMode] = useState<RenderMode>('webgl')
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#EFE7FB' }}>
      <View3D name="the fitting sheet" qaKey={QA_KEY} worldRef={worldRef} onMode={setMode} make={(r: WebGLRenderer): World3D => new FittingWorld(r, fit, linkParam('zoom'))} anchors={() => null} />
    </div>
  )
}

function Cabin({ stamps }: { stamps: string[] }) {
  const timers = useTimers()
  const { param, enter } = useSections(CABIN_SECTIONS)
  const [team] = useState(() => teamFrom(param('team'), stamps))
  const [n, setN] = useState(0)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [bubble, setBubble] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [flash, setFlash] = useState(0)
  const worldRef = useRef<TeamCabinWorld | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const lastHint = useRef(-Infinity)
  const line = L.cabin.first

  useEffect(() => {
    enter('dress', { team: param('team') })
    // The first time she comes in, Sparkle says what to do; after that her hands are busy at once.
    let seen = false
    try {
      seen = localStorage.getItem(SEEN) === '1'
      localStorage.setItem(SEEN, '1')
    } catch {
      /* a private window: she hears it every time */
    }
    if (!seen) guide()
  }, [])

  /** Sparkle says the one instruction, and the bubble shows it for a few seconds. */
  const guide = (voice = true) => {
    sparkle.current?.play('wave')
    setBubble(true)
    timers.later(() => setBubble(false), 5000)
    if (voice) void say(line, { interrupt: false })
  }

  const events = useRef({
    hint: () => {
      const now = performance.now() / 1000
      if (now - lastHint.current < 16) return
      lastHint.current = now
      guide(spendHint(line))
    },
    photo: (url: string) => {
      setPhoto(url)
      timers.later(() => setPhoto(null), 2600)
    },
    flash: () => setFlash((k) => k + 1),
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new TeamCabinWorld(renderer, { team }, events.current)
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F6E3CF', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={n}
        name="the team cabin"
        qaKey={QA_KEY}
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={CABIN_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="cabin-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setN((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(246,227,207,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🧣 Tap to wake the cabin
        </button>
      )}
      {/* The camera's flash, and the team photo popping up before it goes on the wall. */}
      <AnimatePresence>
        {flash > 0 && <motion.div key={`f${flash}`} initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#FFFFFF', pointerEvents: 'none', zIndex: 24 }} />}
      </AnimatePresence>
      <AnimatePresence>
        {photo && (
          <motion.div
            key={photo.length}
            initial={{ scale: 0.3, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: -3, opacity: 1 }}
            exit={{ scale: 0.2, x: '30vw', y: '-25vh', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            style={{ position: 'absolute', left: '50%', top: '42%', marginLeft: 'min(-28vw, -150px)', marginTop: 'min(-21vw, -125px)', width: 'max(56vw, 300px)', maxWidth: 520, background: '#FFFFFF', padding: '12px 12px 34px', borderRadius: 10, boxShadow: 'var(--shadow)', zIndex: 25, pointerEvents: 'none' }}
          >
            <img src={photo} alt="The team photo" style={{ width: '100%', display: 'block', borderRadius: 4 }} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sparkle in the corner: tap her to hear it again. */}
      <div style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 8px)', bottom: 'calc(var(--safe-bottom) + 4px)', display: 'flex', alignItems: 'flex-end', gap: 6, zIndex: 22, pointerEvents: 'none' }}>
        <button
          aria-label="Sparkle: hear it again"
          onClick={() => {
            sparkle.current?.play('nod')
            setBubble(true)
            timers.later(() => setBubble(false), 4000)
            void say(line)
          }}
          style={{ pointerEvents: 'auto', background: 'none', border: 'none', padding: 0, width: 'min(120px, 16vh, 24vw)', height: 'min(140px, 19vh, 28vw)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <SparklePuppet ref={sparkle} height="100%" lookToward={0.5} />
        </button>
      </div>
      <AnimatePresence>
        {bubble && (
          <motion.button
            key="bubble"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => void say(line)}
            aria-label="Hear it again"
            style={{ position: 'absolute', left: '50%', x: '-50%', top: 'calc(var(--safe-top, 0px) + 18px)', maxWidth: 'min(62vw, 520px)', background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius)', border: 'none', padding: '10px 16px', boxShadow: 'var(--shadow)', fontSize: 'clamp(17px, min(3vw, 3.4vh), 26px)', fontWeight: 600, lineHeight: 1.15, color: 'var(--ink)', fontFamily: 'inherit', textAlign: 'left', zIndex: 23, transformOrigin: 'top center' }}
          >
            🧣 {lineText(line)}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

/** The hint's hand: from a thing on the shelf up to the friend in focus (--dx, --dy). */
const HINT_CSS = `
.cabin-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 6; --dx: 0px; --dy: -160px; }
.cabin-hint span { position: absolute; left: -22px; top: -8px; font-size: 48px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: cabin-drag 1.8s ease-in-out infinite; }
@keyframes cabin-drag {
  0% { transform: translate(0, 0) scale(1.15); opacity: 0; }
  15% { transform: translate(0, 0) scale(1); opacity: 1; }
  75% { transform: translate(var(--dx), var(--dy)); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}
`
