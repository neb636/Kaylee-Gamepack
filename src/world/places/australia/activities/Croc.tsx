// Crocodile River: a Top End billabong. Help Chompy's eggs hatch (3 taps), carry each baby to the river in her mouth like
// real mama crocs do (3 drags), then she swims off with the babies riding on her head and goes snap, snap (3 taps).
// Chompy is a puppet: her eyes follow each egg, her jaw opens wider as a baby comes near, babies peek out between her
// teeth, and she talks in her own voice. The babies chirp; the river has lilies, reeds, a dragonfly and ripples.
import { motion } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Buddy, burst, DragArea, Draggable, DropZone, pick, say, sounds, SparklePuppet, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { sfx } from '../../../kit/sfx'
import { Stage } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'
import { Chompy } from '../puppets/Chompy'

const EGGS = 3
const SNAPS = 3

const landscapeQuery = typeof matchMedia === 'undefined' ? undefined : matchMedia('(orientation: landscape)')
/** True in landscape: the nest sits beside Chompy instead of under her. */
function useLandscape() {
  return useSyncExternalStore(
    (cb) => {
      landscapeQuery?.addEventListener('change', cb)
      return () => landscapeQuery?.removeEventListener('change', cb)
    },
    () => !!landscapeQuery?.matches,
  )
}

type Phase = 'story' | 'hatch' | 'ride' | 'swim' | 'snap'

export function Croc({ onDone, setProgress }: ActivityProps) {
  const [phase, setPhase] = useState<Phase>('story')
  const [hatched, setHatched] = useState<number[]>([])
  const [carried, setCarried] = useState<number[]>([])
  const [snaps, setSnaps] = useState(0)
  const [hint, setHint] = useState(false)
  const busy = useRef(false)
  const chompy = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const babies = useRef<Record<number, PuppetHandle | null>>({})
  const alive = useAlive()
  const landscape = useLandscape()

  // One star per stage (hatch, carry, snap): nine little stars would crowd the prompt on a phone.
  const stages = Number(hatched.length === EGGS) + Number(carried.length === EGGS) + Number(snaps === SNAPS)
  useEffect(() => setProgress(stages, 3), [stages, setProgress])

  // Idle help: if she hasn't touched anything for a while, the next thing to do glows.
  useEffect(() => {
    setHint(false)
    if (phase === 'story' || phase === 'swim') return
    const id = setTimeout(() => setHint(true), 7000)
    return () => clearTimeout(id)
  }, [phase, hatched.length, carried.length, snaps])

  const hatch = async (i: number) => {
    if (phase !== 'hatch' || hatched.includes(i)) return
    const next = [...hatched, i]
    setHatched(next)
    sfx.crack()
    sounds.note(next.length * 2)
    burst()
    setTimeout(() => {
      sfx.chirp()
      void babies.current[i]?.play('jump')
    }, 250)
    void chompy.current?.play('cheer')
    await say(L.croc.eee)
    if (!alive()) return
    // The first baby teaches the real fact: hatchlings chirp so their mama comes. She can keep tapping meanwhile.
    if (next.length === 1) {
      void sparkle.current?.play('nod')
      void say(L.croc.chirp, { interrupt: false })
    }
    if (next.length < EGGS) return
    sounds.correct()
    void sparkle.current?.play('cheer')
    setPhase('ride')
  }

  const carry = async (i: number) => {
    if (phase !== 'ride' || busy.current || carried.includes(i)) return
    const next = [...carried, i]
    setCarried(next)
    sfx.pop()
    sounds.note(next.length * 2 + 3)
    void chompy.current?.play('gulp')
    await say(L.croc.count[next.length - 1])
    if (!alive()) return
    // Why she does it, told after the first baby is safely in (never before her hands are busy).
    if (next.length === 1) void say(L.croc.carry, { interrupt: false })
    if (next.length < EGGS) return
    busy.current = true
    burst(landscape ? 0.62 : 0.5, 0.4)
    sounds.correct()
    // Into the water she goes, and the babies climb up onto her back for the ride.
    setPhase('swim')
    sfx.splash()
    void chompy.current?.play('swim')
    void sparkle.current?.play('cheer')
    void say(L.croc.gentle)
    await wait(1700)
    if (!alive()) return
    busy.current = false
    setPhase('snap')
  }

  const tapChompy = async () => {
    if (phase === 'story') return
    if (phase !== 'snap' || busy.current) {
      // Every tap gets a reaction, even between stages.
      void chompy.current?.play('wiggle')
      if (!busy.current) void say(pick(L.tickle.chompy))
      return
    }
    const n = snaps + 1
    setSnaps(n)
    sfx.chomp()
    sounds.note(n * 3)
    void chompy.current?.play('snap')
    if (n < SNAPS) return
    busy.current = true
    await wait(700)
    if (!alive()) return
    sounds.sparkle()
    burst(landscape ? 0.62 : 0.5, 0.35)
    void sparkle.current?.play('cheer')
    void chompy.current?.play('dance')
    await say(L.croc.teeth)
    await wait(500)
    if (alive()) onDone()
  }

  if (phase === 'story') return <StoryBeat lines={L.croc.story} friend={<Chompy height="100%" />} bg={art.bgBillabong} onDone={() => setPhase('hatch')} />

  const prompt = phase === 'hatch' ? L.croc.hatch : phase === 'ride' ? L.croc.ride : phase === 'snap' ? L.croc.snap : undefined
  const inWater = phase === 'swim' || phase === 'snap'
  const chompyH = landscape ? 'min(48vh, 30vw, 460px)' : 'min(30vh, 50vw, 420px)'
  const narrow = typeof window !== 'undefined' && window.innerWidth < 600
  const sparklePuppet = <SparklePuppet ref={sparkle} height={landscape ? 'min(150px, 17vh)' : 'calc(min(calc(var(--target) * 1.35), 21vw) * 1.25)'} />

  return (
    <Stage bg={art.bgBillabong} prompt={prompt}>
      <RiverLife />
      <DragArea style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: landscape ? 'row-reverse' : 'column', alignItems: 'center', justifyContent: landscape ? 'space-evenly' : 'flex-end', gap: landscape ? 0 : '6vh', paddingBottom: landscape ? 0 : '4vh' }}>
        {/* Chompy: on the bank, then in the water. */}
        <motion.div
          animate={inWater ? { x: landscape ? '4vw' : '3vw', y: landscape ? '-12vh' : '-15vh', scale: landscape ? 1.05 : narrow ? 1 : 1.15 } : { x: 0, y: 0, scale: 1 }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
          style={{ position: 'relative', height: chompyH, flexShrink: 1, minHeight: 0 }}
        >
          <DropZone id="chompy" style={{ position: 'relative', height: '100%' }}>
            <div role="button" aria-label="Chompy" onClick={() => void tapChompy()} className={hint && phase === 'snap' ? 'world-glow' : undefined} style={{ height: '100%', borderRadius: 40, cursor: 'pointer' }}>
              <Chompy ref={chompy} height="100%" inMouth={inWater ? 0 : carried.length} babies={inWater ? EGGS : 0} />
            </div>
          </DropZone>
          {inWater && <Water />}
        </motion.div>

        {/* The nest: eggs to tap, then babies to carry. The empty shells stay behind when she swims off. In portrait,
            Sparkle stands beside it (not on top of it). */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'min(10px, 2vw)', flexShrink: 0, zIndex: 2, pointerEvents: inWater ? 'none' : undefined }}>
          {!landscape && <div style={{ pointerEvents: 'none' }}>{sparklePuppet}</div>}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'min(18px, 3vw)', padding: '0 min(30px, 4vw) min(26px, 3vh)' }}>
            <Nest />
            {Array.from({ length: EGGS }, (_, i) => {
              const isHatched = hatched.includes(i)
              const isCarried = carried.includes(i)
              const glow = hint && (phase === 'hatch' ? !isHatched : !isCarried)
              return (
                <div key={i} style={{ position: 'relative', width: 'min(calc(var(--target) * 1.35), 21vw)', aspectRatio: '0.9' }}>
                  {!isHatched ? (
                    <motion.button
                      aria-label="egg"
                      onClick={() => void hatch(i)}
                      animate={{ rotate: [0, -7, 7, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.1, repeatDelay: 0.9 + i * 0.45 }}
                      className={glow ? 'world-glow' : undefined}
                      style={{ position: 'absolute', inset: 0, borderRadius: '50%', transformOrigin: '50% 90%' }}
                    >
                      <img src={art.crocEgg} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </motion.button>
                  ) : (
                    <>
                      {/* The top of the shell pops off. */}
                      <motion.img src={art.crocEgg} alt="" initial={{ y: 0, rotate: 0, opacity: 1 }} animate={{ y: -120, x: 30, rotate: 160, opacity: 0 }} transition={{ duration: 0.7 }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', clipPath: 'polygon(0 0, 100% 0, 100% 45%, 80% 38%, 60% 48%, 40% 38%, 20% 48%, 0 40%)', pointerEvents: 'none' }} />
                      {!isCarried && (
                        <motion.div initial={{ scale: 0, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', inset: '-10% -10% 22%', zIndex: 1 }}>
                          <Draggable disabled={phase !== 'ride'} onDrop={(zone) => (zone === 'chompy' ? void carry(i) : false)} onTap={() => void carry(i)} style={{ width: '100%', height: '100%' }}>
                            <div role="button" aria-label="baby crocodile" className={glow ? 'world-glow' : undefined} style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                              <Buddy ref={(h) => void (babies.current[i] = h)} img={art.babyCroc} voice="hatchling" height="100%" />
                            </div>
                          </Draggable>
                        </motion.div>
                      )}
                      {/* The bottom of the shell stays as a little cup. */}
                      <img src={art.crocEgg} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', clipPath: 'polygon(0 40%, 20% 48%, 40% 38%, 60% 48%, 80% 38%, 100% 45%, 100% 100%, 0 100%)', zIndex: 2, pointerEvents: 'none' }} />
                    </>
                  )}
                </div>
              )
            })}
        </div>
        </div>
      </DragArea>
      {/* Sparkle watches from the bank. */}
      {landscape && <div style={{ position: 'absolute', left: 4, bottom: 'min(20px, 3vh)', pointerEvents: 'none', zIndex: 3 }}>{sparklePuppet}</div>}
    </Stage>
  )
}

/** A sandy nest mound behind the eggs. */
function Nest() {
  return (
    <svg viewBox="0 0 400 130" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '58%', overflow: 'visible', pointerEvents: 'none' }}>
      <path d="M4 124 C4 60 60 20 200 20 C340 20 396 60 396 124 Z" fill="#F4CFA0" stroke="#3A2A33" strokeWidth="5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d="M40 60 C90 36 150 30 200 30 C250 30 310 36 360 60" fill="none" stroke="#FFE3BD" strokeWidth="10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M50 96 L96 84 M140 70 L184 80 M232 76 L276 66 M312 88 L352 102 M110 112 L150 104 M250 110 L290 116" stroke="#C99B6A" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

// A rounded pool whose top edge ripples: `lift` moves the wave up and down.
const pool = (lift: number) =>
  `M14 ${34 + lift} Q58 ${20 - lift} 100 ${34 + lift} T200 ${34 + lift} T300 ${34 + lift} T386 ${34 + lift} C398 ${38 + lift} 400 50 398 62 C392 92 300 100 200 100 C100 100 8 92 2 62 C0 50 2 ${38 + lift} 14 ${34 + lift}Z`

/** Water in front of Chompy's legs while she swims, with rings rippling out. */
function Water() {
  return (
    <div aria-hidden style={{ position: 'absolute', left: '-10%', right: '-10%', bottom: '-8%', height: '40%', pointerEvents: 'none' }}>
      <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
        <motion.path d={pool(0)} initial={{ d: pool(0) }} animate={{ d: [pool(0), pool(8), pool(0)] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }} fill="#7ED9C8" opacity="0.94" />
        <path d="M60 58 Q90 52 120 58 M250 70 Q285 64 320 70" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.75" vectorEffect="non-scaling-stroke" />
      </svg>
      {[0, 1.2].map((d) => (
        <motion.div
          key={d}
          initial={{ scale: 0.3, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2.4, delay: d }}
          style={{ position: 'absolute', left: '28%', right: '28%', top: '6%', height: '30%', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.85)' }}
        />
      ))}
    </div>
  )
}

const RIVER_CSS = `
@keyframes croc-sway { 0%, 100% { transform: rotate(-6deg) } 50% { transform: rotate(6deg) } }
@keyframes croc-ring { 0% { transform: scale(0.3); opacity: 0.8 } 100% { transform: scale(1.8); opacity: 0 } }
@keyframes croc-fly { 0% { transform: translate(-10vw, 0) } 25% { transform: translate(30vw, -6vh) } 50% { transform: translate(55vw, 2vh) } 75% { transform: translate(80vw, -4vh) } 100% { transform: translate(115vw, 0) } }
@keyframes croc-wing { 0%, 100% { transform: scaleY(1) } 50% { transform: scaleY(0.2) } }
`
const REEDS = [
  { x: 2, h: 20, d: 0 },
  { x: 94, h: 24, d: 0.9 },
  { x: 99, h: 17, d: 1.7 },
]
// Rings on the water (the right side of the picture).
const RINGS = [
  { x: 72, y: 30, d: 0 },
  { x: 88, y: 44, d: 1.8 },
  { x: 60, y: 38, d: 3.1 },
]

/** Ambient billabong life: swaying reeds, rings on the water, a dragonfly. Never takes taps. */
function RiverLife() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{RIVER_CSS}</style>
      {RINGS.map((r, i) => (
        <div key={i} style={{ position: 'absolute', left: `${r.x}%`, top: `${r.y}%`, width: '10vmin', height: '4vmin', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.8)', animation: `croc-ring 3.6s ease-out ${-r.d}s infinite` }} />
      ))}
      {REEDS.map((r, i) => (
        <svg key={i} viewBox="0 0 60 120" style={{ position: 'absolute', left: `${r.x}%`, bottom: -4, height: `${r.h}vmin`, translate: '-50% 0', transformOrigin: '50% 100%', animation: `croc-sway ${3.2 + i * 0.6}s ease-in-out ${-r.d}s infinite` }}>
          <path d="M30 120 C28 80 34 40 30 6 M18 120 C14 90 12 70 6 40 M42 120 C46 94 50 72 56 50" fill="none" stroke="#6FB67E" strokeWidth="7" strokeLinecap="round" />
          <rect x="24" y="4" width="12" height="30" rx="6" fill="#B07A54" stroke="#3A2A33" strokeWidth="3" />
        </svg>
      ))}
      <div style={{ position: 'absolute', left: 0, top: '22%', animation: 'croc-fly 14s linear 1s infinite' }}>
        <svg viewBox="0 0 80 50" style={{ width: 'min(64px, 9vmin)', display: 'block', overflow: 'visible' }}>
          <g style={{ transformOrigin: '40px 22px', animation: 'croc-wing 0.18s linear infinite' }}>
            <ellipse cx="30" cy="12" rx="16" ry="7" fill="#DDF3FF" stroke="#3A2A33" strokeWidth="2.5" transform="rotate(-20 30 12)" />
            <ellipse cx="50" cy="12" rx="16" ry="7" fill="#DDF3FF" stroke="#3A2A33" strokeWidth="2.5" transform="rotate(20 50 12)" />
          </g>
          <path d="M8 24 L52 24" stroke="#B9A6F5" strokeWidth="7" strokeLinecap="round" />
          <circle cx="58" cy="24" r="7" fill="#FF8FB8" stroke="#3A2A33" strokeWidth="2.5" />
        </svg>
      </div>
    </div>
  )
}
