// Rowing through Venice, one straight-on side-view camera: the canal water across the bottom, the houses behind it, and
// Gino's gondola floating on the water line. Each oar stroke (a swipe across the water) pushes the gondola along and the
// houses slide past (the picture repeats, every other copy mirrored so the seams match).
//   Leg 1: row to the first fork. Leg 2: a low bridge comes; the gondola waits until she taps Sparkle to duck.
//   Leg 3: a boat ambulance zooms past. Then the mask shop.
// The forks are their own scene (Fork.tsx). Nothing can fail: a tap instead of a swipe still gives a little push.
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Buddy, pick, say, SparklePuppet, sounds, useAlive, useGameLoop, usePointerDrag, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { PromptRow, useCover } from '../scene'
import { fx } from '../synth'

const V = L.venice
/** How far each leg goes, in picture widths, and how hard a stroke pushes. */
const LEG = 1.25
const PUSH = 0.5
const DRAG = 1.2
/** Width / height of the gondola and bridge pictures. */
const GONDOLA_RATIO = 512 / 254
const BRIDGE_RATIO = 512 / 239

export function Canal({ leg, onStep, onArrive }: { leg: 0 | 1 | 2; onStep: () => void; onArrive: () => void }) {
  const c = useCover(1)
  const { box, W, H, bw, bh, ox, oy, landscape } = c
  const alive = useAlive()
  const sparkle = useRef<PuppetHandle>(null)
  const gino = useRef<PuppetHandle>(null)

  const scroll = useMotionValue(0)
  const stripX = useTransform(scroll, (s) => -s)
  const vel = useRef(0)
  const oar = useMotionValue(0)
  const strokes = useRef(0)
  const [prompt, setPrompt] = useState<{ text: Line; speak: boolean } | null>(null)
  const [state, setState] = useState<'row' | 'bridge' | 'under' | 'arrived'>('row')
  const stateRef = useRef(state)
  stateRef.current = state
  const [ducked, setDucked] = useState(false)
  const [siren, setSiren] = useState(false)
  const sirenDone = useRef(false)

  // Geometry (picture px). The gondola picture is about twice as wide as tall; its water line is ~82% down.
  const G = landscape ? Math.min(bw * 0.5, bh * 0.9) : Math.min(bw * 0.76, bh * 0.4)
  const gH = G / GONDOLA_RATIO
  const waterY = bh * (landscape ? 0.84 : 0.8)
  const gTop = waterY - gH * 0.82
  const gx = -ox + W * (landscape ? 0.42 : 0.38)
  const legLen = LEG * bw
  const bridgeW = G * (landscape ? 1.45 : 1)
  const bridgeH = bridgeW / BRIDGE_RATIO
  const bridgeStop = legLen * 0.42
  // The gondola stops with the bridge's near steps over its front, just ahead of Sparkle, so the whole arch is in view.
  const bridgeX = bridgeStop + gx + G * 0.15 + bridgeW * 0.5

  useEffect(() => {
    void (async () => {
      await wait(300)
      if (!alive()) return
      setPrompt({ text: leg === 0 ? V.row : V.rowMore, speak: true })
    })()
  }, [])

  const stroke = (strength: number) => {
    if (stateRef.current !== 'row') return
    vel.current = Math.min(vel.current + PUSH * bw * DRAG * strength, PUSH * bw * DRAG * 1.6)
    fx.splash()
    strokes.current += 1
    setPrompt(null)
    void gino.current?.play('nod')
    void animate(oar, [oar.get(), -28, 0], { duration: 0.9, ease: 'easeInOut' })
    if (strokes.current % 3 === 2) void say(pick(V.sing), { interrupt: false })
  }

  useGameLoop((dt) => {
    if (!bw) return
    const st = stateRef.current
    if (st !== 'row') return
    let s = scroll.get() + vel.current * dt
    vel.current *= Math.exp(-DRAG * dt)
    if (leg === 1 && s >= bridgeStop && !ducked) {
      s = bridgeStop
      vel.current = 0
      setState('bridge')
      setPrompt({ text: V.bridge, speak: true })
    }
    if (leg === 2 && !sirenDone.current && s > legLen * 0.25) {
      sirenDone.current = true
      setSiren(true)
      fx.siren()
      void (async () => {
        await say(V.ambulance)
        if (!alive()) return
        await say(V.noCars)
      })()
    }
    if (s >= legLen) {
      s = legLen
      vel.current = 0
      setState('arrived')
      void arrive()
    }
    scroll.set(s)
  })

  const arrive = async () => {
    setPrompt(null)
    onStep()
    sounds.correct()
    await wait(leg === 2 ? 2600 : 600)
    if (!alive()) return
    onArrive()
  }

  const duck = async () => {
    if (stateRef.current !== 'bridge') return
    setState('under')
    setPrompt(null)
    setDucked(true)
    sounds.whoosh()
    onStep()
    await wait(250)
    await animate(scroll, bridgeStop + bridgeW + G * 0.9, { duration: 2.2, ease: 'easeInOut' })
    if (!alive()) return
    setDucked(false)
    void sparkle.current?.play('cheer')
    void gino.current?.play('cheer')
    await say(V.ducked)
    if (!alive()) return
    void say(V.rialto)
    vel.current = 0
    setState('row')
    if (scroll.get() >= legLen) {
      setState('arrived')
      void arrive()
    } else setPrompt({ text: V.rowMore, speak: false })
  }

  // The water: swipe across it to row (anywhere below the houses, away from the screen's left edge).
  const water = useRef<HTMLButtonElement>(null)
  const last = useRef(0)
  usePointerDrag(water, {
    threshold: 6,
    onStart: (i) => {
      last.current = i.dx
    },
    onMove: (i) => {
      if (stateRef.current !== 'row') return
      oar.set(Math.max(-35, Math.min(20, i.dx / 8)))
      last.current = i.dx
    },
    onEnd: (i) => {
      stroke(Math.min(1.3, Math.max(0.75, Math.abs(i.dx) / 220)))
    },
    onTap: () => {
      if (stateRef.current === 'bridge') return void duck()
      stroke(0.75)
      if (strokes.current === 1) void say(V.rowHint)
    },
    onCancel: () => void animate(oar, 0, { duration: 0.3 }),
  })

  const tiles = [0, 1, 2, 3]
  const bg = landscape ? art.bgVeniceCanal : art.bgVeniceCanalTall
  const sh = G * 0.3
  const gh = G * 0.36
  const oarH = G * 0.42

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#6EC3E6' }}>
      {W > 0 && (
        <div style={{ position: 'absolute', left: ox, top: oy, width: bw, height: bh }}>
          {/* The canal, repeating (every other copy mirrored so the edges match). */}
          <motion.div style={{ position: 'absolute', left: 0, top: 0, height: bh, width: bw * tiles.length, x: stripX, zIndex: 0 }}>
            {tiles.map((i) => (
              <div key={i} style={{ position: 'absolute', left: i * bw - i, top: 0, width: bw + 1, height: bh, background: `url(${bg}) center / 100% 100%`, transform: i % 2 ? 'scaleX(-1)' : undefined }} />
            ))}
          </motion.div>

          {/* The boat ambulance zooming past on the far side of the canal. */}
          {siren && (
            <motion.div initial={{ x: W - ox + 40 }} animate={{ x: -ox - G }} transition={{ duration: 3.2, ease: 'linear' }} style={{ position: 'absolute', left: 0, top: waterY - gH * 1.05, zIndex: 2, display: 'flex', alignItems: 'flex-end' }}>
              <AmbulanceBoat size={gH * 0.75} />
            </motion.div>
          )}

          {/* The gondola: Gino on the back with his oar, Sparkle sitting on the cushion. It bobs on the water. */}
          <motion.div animate={{ y: [0, -5, 0, 3, 0], rotate: [0, -0.8, 0, 0.6, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', left: gx - G / 2, top: gTop, width: G, height: gH, zIndex: 5, transformOrigin: '50% 82%' }}>
            <motion.div animate={{ scaleY: ducked ? 0.62 : 1 }} transition={{ type: 'spring', bounce: 0.4 }} style={{ position: 'absolute', left: G * 0.15 - gh * 0.5, top: gH * 0.62 - gh, width: gh, height: gh, transformOrigin: '50% 100%', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
              <Buddy ref={gino} img={art.gino} voice="gino" height={`${gh}px`} />
            </motion.div>
            <motion.div style={{ position: 'absolute', left: G * 0.17, top: gH * 0.86 - oarH * 0.96, width: oarH * (500 / 512), height: oarH, rotate: oar, transformOrigin: '12% 8%', zIndex: 2 }}>
              <img src={art.oar} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
            </motion.div>
            <motion.div
              animate={{ scaleY: ducked ? 0.55 : 1 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              onClick={() => void (stateRef.current === 'bridge' ? duck() : sparkle.current?.play('wiggle'))}
              className={state === 'bridge' ? 'world-glow' : undefined}
              role="button"
              aria-label="Sparkle"
              style={{ position: 'absolute', left: G * 0.48 - sh * 0.5, top: gH * 0.62 - sh, width: sh, height: sh, borderRadius: '45%', transformOrigin: '50% 100%', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', cursor: 'pointer' }}
            >
              <SparklePuppet ref={sparkle} height={`${sh}px`} lookToward={0.5} />
            </motion.div>
            <img src={art.gondola} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 3 }} />
          </motion.div>

          {/* The low bridge (leg 2), in front of the gondola so it passes underneath. */}
          {leg === 1 && (
            <motion.div style={{ position: 'absolute', left: 0, top: 0, x: stripX, zIndex: 8, pointerEvents: 'none' }}>
              <img src={art.bridgeLow} alt="" draggable={false} style={{ position: 'absolute', left: bridgeX - bridgeW / 2, top: waterY + gH * 0.08 - bridgeH, width: bridgeW, height: bridgeH }} />
            </motion.div>
          )}
        </div>
      )}

      {/* Swipe area: the water. */}
      <button ref={water} aria-label="Row" style={{ position: 'absolute', left: 40, right: 0, bottom: 0, top: '45%', zIndex: 20, touchAction: 'none', background: 'none', border: 'none', padding: 0 }} />
      <AnimatePresence>
        {state === 'row' && strokes.current < 2 && W > 0 && (
          <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', left: '50%', bottom: '7%', translate: '-50% 0', zIndex: 21, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 'clamp(44px, 8vmin, 80px)', filter: `drop-shadow(0 3px 0 ${INK})` }}>
            <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.4 }}>
              ⬅️
            </motion.span>
            <motion.span animate={{ x: [60, -60, 60] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}>
              👆
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* While waiting at the bridge, the whole Sparkle area is easy to hit. */}
      {state === 'bridge' && <button aria-label="Duck" onClick={() => void duck()} style={{ position: 'absolute', inset: 0, zIndex: 19, background: 'none', border: 'none' }} />}
      <PromptRow prompt={prompt} H={H} landscape={landscape} />
    </div>
  )
}

/** A little white boat with a red cross and a blinking blue light, drawn in code. */
function AmbulanceBoat({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 200 110" width={size * 1.8} height={size} style={{ overflow: 'visible' }}>
      <motion.circle cx="120" cy="18" r="10" fill="#6EC3E6" stroke={INK} strokeWidth="5" animate={{ fill: ['#6EC3E6', '#2E7BE6', '#6EC3E6'] }} transition={{ repeat: Infinity, duration: 0.5 }} />
      <rect x="80" y="26" width="80" height="40" rx="10" fill="#FFF7F0" stroke={INK} strokeWidth="5" />
      <rect x="92" y="34" width="22" height="18" rx="4" fill="#A8DCFF" stroke={INK} strokeWidth="4" />
      <path d="M134 36 h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8 v-8 h8z" fill="#E8574F" stroke={INK} strokeWidth="2" />
      <path d="M10 64 Q20 98 60 98 L170 98 Q194 98 198 64 Z" fill="#FFF7F0" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M22 78 L188 78" stroke="#E8574F" strokeWidth="8" />
      <path d="M190 96 q10 -6 22 0 q10 6 22 0" fill="none" stroke="#FFF7F0" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
