// Starry Night: tap the five Southern Cross stars, watch them fly onto Australia's flag,
// drag the big seven-point star into place, then pick Australia's flag from three.
import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type Ref } from 'react'
import { Buddy, burst, ChoiceCards, DragArea, Draggable, DropZone, numberWord, say, shuffle, sounds, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { COMMONWEALTH_STAR, Flag, SOUTHERN_CROSS, starPoints, type FlagId } from '../../../kit/Flag'
import { Stage } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'

// Put the real star pattern into the sky (same shape as on the flag).
const SKY = SOUTHERN_CROSS.map((s) => ({ ...s, left: 22 + ((s.x - 6300) / 2380) * 56, top: 8 + ((s.y - 840) / 3360) * 80 }))

export function StarryFlag({ onDone, setProgress }: ActivityProps) {
  const [phase, setPhase] = useState<'story' | 'sky' | 'flag' | 'quiz'>('story')
  useEffect(() => setProgress({ story: 0, sky: 0, flag: 1, quiz: 2 }[phase], 3), [phase, setProgress])
  if (phase === 'story') return <StoryBeat lines={[L.stars.story]} img={art.kookaburra} bg={art.bgNight} onDone={() => setPhase('sky')} />
  if (phase === 'sky') return <Sky onDone={() => setPhase('flag')} />
  if (phase === 'flag') return <BuildFlag onDone={() => setPhase('quiz')} />
  return <Quiz onDone={onDone} />
}

const TWINKLES = Array.from({ length: 26 }, (_, i) => ({ x: (i * 41 + 7) % 100, y: (i * 29 + 11) % 92, s: 3 + (i % 4) * 1.5, d: 1.6 + (i % 5) * 0.5, delay: -(i % 7) * 0.4 }))

/** Tiny background stars that twinkle (decoration only). */
function Twinkles() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{'@keyframes sky-twinkle { 0%, 100% { opacity: 0.25; transform: scale(0.7) } 50% { opacity: 1; transform: scale(1.2) } }'}</style>
      {TWINKLES.map((t, i) => (
        <span key={i} style={{ position: 'absolute', left: `${t.x}%`, top: `${t.y}%`, width: t.s, height: t.s, borderRadius: '50%', background: '#FFF7D6', boxShadow: '0 0 8px #FFE17A', animation: `sky-twinkle ${t.d}s ease-in-out ${t.delay}s infinite` }} />
      ))}
    </div>
  )
}

/** Kooky the kookaburra watches from the corner, nodding along and cheering. */
function Kooky({ puppet }: { puppet: Ref<PuppetHandle> }) {
  return (
    <div style={{ position: 'absolute', right: 0, bottom: 0, pointerEvents: 'none', zIndex: 2 }}>
      <Buddy ref={puppet} img={art.kookaburra} voice="kooky" height="min(150px, 17vh, 24vw)" flip />
    </div>
  )
}

function Sky({ onDone }: { onDone: () => void }) {
  const [lit, setLit] = useState<number[]>([])
  const kooky = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const all = lit.length === SKY.length

  const tap = async (i: number) => {
    if (lit.includes(i)) return
    const next = [...lit, i]
    setLit(next)
    sounds.note(next.length + 2)
    void say(numberWord(next.length))
    void kooky.current?.play('nod')
    if (next.length === SKY.length) {
      await wait(800)
      if (!alive()) return
      void kooky.current?.play('cheer')
      sounds.sparkle()
      burst(0.5, 0.4)
      await say(L.stars.found)
      await wait(400)
      if (alive()) onDone()
    }
  }

  const line = (a: number, b: number) => <motion.line x1={SKY[a].left} y1={SKY[a].top} x2={SKY[b].left} y2={SKY[b].top} stroke="#FFC83D" strokeWidth={0.8} strokeDasharray="2 1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />

  return (
    <Stage bg={art.bgNight} prompt={L.stars.tap}>
      <Twinkles />
      <Kooky puppet={kooky} />
      <div style={{ position: 'relative', height: '100%', aspectRatio: '1', maxWidth: '100%' }}>
        {all && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {line(0, 4)}
            {line(3, 1)}
          </svg>
        )}
        {SKY.map((s, i) => {
          const on = lit.includes(i)
          const size = s.points === 5 ? 'calc(var(--target) * 0.95)' : 'calc(var(--target) * 1.25)'
          return (
            <motion.button
              key={s.name}
              aria-label="star"
              onClick={() => void tap(i)}
              animate={on ? { scale: [1.5, 1.15], rotate: 0 } : { scale: [0.85, 1, 0.85], opacity: [0.6, 1, 0.6] }}
              transition={on ? { duration: 0.4 } : { repeat: Infinity, duration: 1.4 + i * 0.2 }}
              style={{ position: 'absolute', left: `${s.left}%`, top: `${s.top}%`, translate: '-50% -50%', width: size, height: size, filter: on ? 'drop-shadow(0 0 14px #FFE17A)' : 'none' }}
            >
              <img src={art.star} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: on ? 'brightness(1.3) saturate(1.4)' : 'saturate(0.9) brightness(1.2) drop-shadow(0 0 6px rgba(255, 225, 122, 0.8))' }} />
              {on && <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 700, color: 'var(--ink)' }}>{lit.indexOf(i) + 1}</span>}
            </motion.button>
          )
        })}
      </div>
    </Stage>
  )
}

function BuildFlag({ onDone }: { onDone: () => void }) {
  const [stars, setStars] = useState(0)
  const [ready, setReady] = useState(false)
  const [placed, setPlaced] = useState(false)
  const kooky = useRef<PuppetHandle>(null)
  const alive = useAlive()

  useEffect(() => {
    void (async () => {
      for (let i = 1; i <= 5; i++) {
        await wait(350)
        if (!alive()) return
        setStars(i)
        sounds.note(i + 2)
      }
      await say(L.stars.onFlag)
      if (alive()) setReady(true)
    })()
  }, [alive])

  const place = async () => {
    if (placed || !ready) return false
    setPlaced(true)
    void kooky.current?.play('cheer')
    sounds.correct()
    burst(0.35, 0.5)
    await say(L.stars.seven)
    await wait(400)
    if (alive()) onDone()
    return true
  }

  const c = COMMONWEALTH_STAR
  const flagW = 'min(86vw, calc((100vh - 300px) * 2), 760px)'
  return (
    <Stage bg={art.bgNight} prompt={ready ? L.stars.drag : undefined}>
      <Twinkles />
      <Kooky puppet={kooky} />
      <DragArea style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(24px, 3vh)', width: '100%', height: '100%' }}>
        <div style={{ position: 'relative', width: `min(${flagW}, 100%)`, aspectRatio: '2' }}>
          <Flag id="australia" width="100%" parts={{ crossStars: stars, bigStar: placed, bigStarSlot: ready }} />
          <DropZone id="slot" style={{ position: 'absolute', left: `${((c.x - c.r * 1.4) / 10080) * 100}%`, top: `${((c.y - c.r * 1.4) / 5040) * 100}%`, width: `${((c.r * 2.8) / 10080) * 100}%`, height: `${((c.r * 2.8) / 5040) * 100}%` }} />
        </div>
        {ready && !placed && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Draggable onDrop={(zone) => (zone === 'slot' ? void place() : false)} onTap={() => void place()}>
              <svg viewBox="-110 -110 220 220" className="world-glow" style={{ width: 'calc(var(--target) * 1.5)', height: 'calc(var(--target) * 1.5)', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'block' }}>
                <polygon points={starPoints(0, 0, 95, 7)} fill="#fff" stroke="#FFC83D" strokeWidth="8" strokeLinejoin="round" />
              </svg>
            </Draggable>
          </motion.div>
        )}
      </DragArea>
    </Stage>
  )
}

function Quiz({ onDone }: { onDone: () => void }) {
  const choices = useMemo(() => shuffle<FlagId>(['australia', 'china', 'thailand']).map((id) => ({ key: id, correct: id === 'australia', ariaLabel: `${id} flag`, content: <Flag id={id} width="86%" /> })), [])
  const size = Math.min(240, window.innerWidth * 0.29, (window.innerHeight - 220) * 0.7)
  return (
    <Stage bg={art.bgNight} prompt={L.stars.which}>
      <ChoiceCards choices={choices} hint={L.stars.hint} size={size} color="rgba(255,255,255,0.9)" onCorrect={onDone} />
    </Stage>
  )
}
