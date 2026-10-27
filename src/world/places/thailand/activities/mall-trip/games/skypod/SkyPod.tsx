// The Sky Pod's screen: the 3D wall of pods (wall.ts), its tap targets, the scoreboard's big numbers (HTML laid over
// the board's dark screen, never in a picture), a "+1" floating up from each light she gets and the 👆 after a while
// with nothing touched. After the finale a big 🛝 takes her back to the hall
// (the wall stays open to play).
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../../engine3d/View3D'
import type { Phase } from './game'
import { ScoreBoard } from './board'
import { BLUE, PINK, type Round } from './layout'
import { SKYPOD_ANCHORS, SkyPodWall } from './wall'
import { mallVoice } from '../../voice'

interface Props {
  round: Round
  socks: string
  onRound: (n: Round) => void
  /** Round 1 done: the 💡 sticker. */
  onSticker: () => void
  onPlay: () => void
}

interface Plus {
  id: number
  x: number
  y: number
  who: 'kaylee' | 'daddy'
}

export function SkyPod({ round, socks, onRound, onSticker, onPlay }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [allDone, setAllDone] = useState(false)
  const [board, setBoard] = useState({ score: 0, daddy: 0, stars: round - 1, round, phase: 'play' as Phase })
  const [pluses, setPluses] = useState<Plus[]>([])
  const plusId = useRef(0)
  const worldRef = useRef<SkyPodWall | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context) starts at the round she's on now, not the link's.
  const now = useRef(round)
  const cb = useRef({ onRound, onSticker })
  cb.current = { onRound, onSticker }

  const make = (renderer: WebGLRenderer) => {
    const w = new SkyPodWall(
      renderer,
      {
        say: (l) => mallVoice.say(l),
        section: () => {},
        done: () => {},
        round: (n) => {
          now.current = n
          setBoard((b) => ({ ...b, round: n }))
          cb.current.onRound(n)
        },
        score: (score, daddy) => setBoard((b) => ({ ...b, score, daddy })),
        stars: (stars) => setBoard((b) => ({ ...b, stars })),
        phase: (phase) => setBoard((b) => ({ ...b, phase })),
        sticker: () => cb.current.onSticker(),
        plus: (x, y, who) => {
          const id = ++plusId.current
          setPluses((p) => [...p.slice(-6), { id, x, y, who }])
          setTimeout(() => setPluses((p) => p.filter((q) => q.id !== id)), 900)
        },
        allDone: () => setAllDone(true),
      },
      { round: now.current, socks },
    )
    w.setHintElement(hintRef.current)
    w.setBoard(boardRef.current)
    return w
  }

  const race = board.round === 3 && (board.phase === 'play' || board.phase === 'cheer')
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#2E2748', overflow: 'clip' }}>
      <View3D
        key={key}
        name="The Sky Pod"
        qaKey="__thaiMallQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            {/* The scoreboard's numbers (wall.ts moves and sizes this over the board every frame). */}
            <div ref={boardRef} aria-label={`Score: ${board.score}`} style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 1, alignItems: 'center', justifyContent: 'center', gap: '0.12em', fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              <ScoreBoard {...board} race={race} />
            </div>
            <Anchors list={SKYPOD_ANCHORS} els={els} {...input} />
            {/* After a while with nothing touched: a finger on one of her lights (or the pattern's next pod). */}
            <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
              <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
                👆
              </motion.div>
            </div>
          </>
        )}
      />
      {/* "+1" floating up from each light she (or Daddy) gets. */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
        <AnimatePresence>
          {pluses.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: [0, 1, 1, 0], y: -80, scale: [0.5, 1.3, 1.1, 1] }} transition={{ duration: 0.85, ease: 'easeOut' }} style={{ position: 'absolute', left: p.x, top: p.y, translate: '-50% -100%', fontSize: 'clamp(26px, 4.5vmin, 42px)', fontWeight: 700, color: p.who === 'daddy' ? BLUE : PINK, textShadow: '0 3px 0 #fff, 0 0 10px rgba(255,255,255,.8)' }}>
              +1
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(46,39,72,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff', zIndex: 70 }}
        >
          💡 Tap to wake the Sky Pod
        </button>
      )}
      <AnimatePresence>
        {allDone && (
          <motion.button
            aria-label="Back to the hall"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 0.6, rotate: { repeat: Infinity, repeatDelay: 1.6, duration: 0.6 } }}
            whileTap={{ scale: 0.88 }}
            onClick={onPlay}
            style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 16px)', top: 'calc(var(--top-clear, 104px) + 10px)', width: 'clamp(96px, 16vmin, 132px)', height: 'clamp(96px, 16vmin, 132px)', borderRadius: '50%', border: '6px solid #fff', background: 'var(--hotpink)', fontSize: 'clamp(48px, 8vmin, 66px)', boxShadow: 'var(--shadow)', zIndex: 60, padding: 0 }}
          >
            🛝
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
