// 🎭 Opera night at the Arena di Verona (Italy's finale, route `party`). One straight-on camera from the audience: the
// stage across the bottom, the old stone seats behind it.
//   1. Dusk: she taps the seats and little candles light up everywhere (people really do this in Verona).
//   2. The band she built is on stage. Kaylee conducts with a sparkly wand: big swings play forte (loud), tiny swings
//      play piano (soft), fast or slow swings change the speed; tapping a friend gives them a solo.
//   3. Lupa's moment: the wishing star from the Trevi Fountain floats down; she taps it and Lupa's howl becomes a high
//      opera note. "Brava!" Roses fly onto the stage (tap to catch).
//   4. The Frecce Tricolori paint green, white and red across the sky; the flag waves. Gelato for everyone, then the
//      trophy (onDone = the shell's trophy ceremony). Nothing can fail: every step moves on by itself after a while.
import { animate, AnimatePresence, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { bigCelebration, Buddy, burst, say, SparklePuppet, sounds, useAlive, useGameLoop, useSaved, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { Flag } from '../../../../kit/Flag'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { INK } from '../../puppets/ink'
import { Lupa } from '../../puppets/Lupa'
import { PromptRow, useCover } from '../scene'
import { MaskArt, type MaskData } from '../venice/MaskShop'
import { Band, cheer, highNote, type Voice } from './music'

const O = L.opera
const TOTAL = 5
const CANDLE_TAPS = 4

interface Friend {
  id: string
  img: string
  voice: string
  instrument: string
  plays: Voice
  /** Size relative to the others. */
  size: number
}
const FRIENDS: Friend[] = [
  { id: 'bruno', img: art.bruno, voice: 'bruno', instrument: art.mandolin, plays: 'mandolin', size: 1.1 },
  { id: 'spina', img: art.spina, voice: 'spina', instrument: art.tambourine, plays: 'tambourine', size: 0.85 },
  { id: 'cesare', img: art.cesare, voice: 'cesare', instrument: art.romanHorn, plays: 'horn', size: 0.95 },
  { id: 'civetta', img: art.civetta, voice: 'civetta', instrument: '🔔', plays: 'bells', size: 0.85 },
  { id: 'gino', img: art.gino, voice: 'gino', instrument: art.accordion, plays: 'accordion', size: 0.95 },
  { id: 'nino', img: art.nino, voice: 'nino', instrument: art.piano, plays: 'piano', size: 1.05 },
]

type Phase = 'story' | 'candles' | 'big' | 'small' | 'solo' | 'star' | 'roses' | 'jets' | 'picnic'

export function Opera({ onDone, setProgress }: ActivityProps) {
  const { box, W, H, bw, bh, ox, oy, landscape } = useCover(1)
  const alive = useAlive()
  const [phase, setPhase] = useState<Phase>('story')
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const [done, setDone] = useState(0)
  useEffect(() => setProgress(done, TOTAL), [done])
  const step = () => setDone((n) => Math.min(TOTAL, n + 1))
  const [prompt, setPrompt] = useState<{ text: Line; speak: boolean } | null>(null)
  const [mask] = useSaved<MaskData | null>('italy-mask', null)

  const lupa = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const friendRefs = useRef<Record<string, PuppetHandle | null>>({})
  const band = useRef<Band | null>(null)
  useEffect(() => () => band.current?.stop(0.2), [])

  // ---------- 1. Candles ----------
  const [candles, setCandles] = useState<{ x: number; y: number; d: number }[]>([])
  const taps = useRef(0)
  const dark = useMotionValue(0)
  const darkOpacity = useTransform(dark, [0, 1], [0, 0.45])
  const standsBottom = oy + bh * 0.68
  // The seats start under the arches along the arena's rim.
  const standsTop = oy + bh * (landscape ? 0.4 : 0.42)
  const lightCandles = (cx: number, cy: number, n = 9, spread = 90) => {
    const fresh = Array.from({ length: n }, () => ({ x: cx + (Math.random() - 0.5) * spread * 2, y: Math.max(standsTop, Math.min(standsBottom - 10, cy + (Math.random() - 0.5) * spread)), d: Math.random() * 0.4 }))
    setCandles((c) => [...c, ...fresh].slice(-160))
  }
  const tapStands = async (e: RPointerEvent) => {
    if (phaseRef.current !== 'candles' || e.clientY > standsBottom) return
    lightCandles(e.clientX, e.clientY)
    sounds.note(Math.min(10, taps.current * 2))
    setPrompt(null)
    const n = ++taps.current
    if (n === 2) void say(O.candlesMore)
    if (n !== CANDLE_TAPS) return
    // The whole arena lights up by itself.
    step()
    void animate(dark, 1, { duration: 2.5 })
    for (let i = 0; i < 8; i++) {
      lightCandles(Math.random() * W, standsTop + Math.random() * (standsBottom - standsTop), 10, 120)
      await wait(140)
    }
    if (!alive()) return
    sounds.sparkle()
    await say(O.candlesDone)
    if (!alive()) return
    await say(O.arena)
    if (!alive()) return
    void startConducting()
  }

  // ---------- 2. Conducting ----------
  const wand = useRef<HTMLDivElement>(null)
  const trail = useRef<{ x: number; y: number; t: number }[]>([])
  const level = useRef(0.5)
  const [levelShown, setLevelShown] = useState(0.5)
  const held = useRef(0)
  const stuck = useRef(0)
  const hinted = useRef(false)
  const bounce = useMotionValue(0)
  const [conducting, setConducting] = useState(false)

  const startConducting = async () => {
    setConducting(true)
    const b = new Band()
    band.current = b
    b.onBeat = (strong) => {
      void animate(bounce, [0, 1, 0], { duration: 60 / b.bpm, ease: 'easeOut' })
      if (strong) for (const f of FRIENDS) if (Math.random() < level.current * 0.5) void friendRefs.current[f.id]?.play('nod')
    }
    await say(O.wand)
    if (!alive()) return
    b.start()
    setPhase('big')
    setPrompt({ text: O.big, speak: true })
  }

  const moveWand = (e: RPointerEvent) => {
    if (!conducting) return
    const el = wand.current
    if (el) el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    if (e.pointerType !== 'mouse' && e.buttons === 0 && e.type === 'pointermove') return
    trail.current.push({ x: e.clientX, y: e.clientY, t: performance.now() })
  }

  useGameLoop((dt) => {
    if (!conducting || !band.current) return
    const now = performance.now()
    trail.current = trail.current.filter((p) => now - p.t < 900)
    const pts = trail.current
    const dim = Math.max(1, Math.min(W, H))
    let amp = 0
    let rev = 0
    if (pts.length > 2) {
      const xs = pts.map((p) => p.x)
      const ys = pts.map((p) => p.y)
      amp = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / dim
      for (let i = 2; i < pts.length; i++) {
        const a = pts[i - 1].x - pts[i - 2].x
        const b = pts[i].x - pts[i - 1].x
        if (a * b < 0 && Math.abs(b) > 2) rev++
      }
    }
    const moving = amp > 0.04
    // Level follows the size of her swings; it settles to soft when she stops.
    const target = moving ? Math.max(0.05, Math.min(1, (amp - 0.05) / 0.45)) : 0.15
    level.current += (target - level.current) * Math.min(1, dt * 3)
    band.current.setLevel(level.current)
    if (moving) band.current.setTempo(96 + Math.min(6, rev) * 12)
    setLevelShown(Math.round(level.current * 20) / 20)

    const ph = phaseRef.current
    stuck.current += dt
    if (ph === 'big' && level.current > 0.7) held.current += dt
    else if (ph === 'small' && moving && level.current < 0.32) held.current += dt
    else held.current = Math.max(0, held.current - dt * 0.5)
    if (!hinted.current && stuck.current > 7 && (ph === 'big' || ph === 'small')) {
      hinted.current = true
      void say(O.swingHint)
    }
    if ((ph === 'big' || ph === 'small') && (held.current > 1.3 || stuck.current > 16)) {
      held.current = 0
      stuck.current = 0
      hinted.current = false
      void (ph === 'big' ? reachedForte() : reachedPiano())
    }
  })

  const reachedForte = async () => {
    setPhase('small')
    setPrompt(null)
    step()
    burst()
    void lupa.current?.play('cheer')
    await say(O.forte)
    if (!alive()) return
    stuck.current = 0
    setPrompt({ text: O.small, speak: true })
  }
  const reachedPiano = async () => {
    setPhase('solo')
    setPrompt(null)
    step()
    void lupa.current?.play('wag')
    await say(O.piano)
    if (!alive()) return
    setPrompt({ text: O.solo, speak: true })
    // If she doesn't pick one, Bruno takes a solo by himself.
    await wait(9000)
    if (!alive() || phaseRef.current !== 'solo') return
    void giveSolo(FRIENDS[0])
  }
  const giveSolo = async (f: Friend) => {
    if (!band.current) return
    band.current.solo(f.plays, 4)
    void friendRefs.current[f.id]?.play('dance')
    sounds.sparkle()
    if (phaseRef.current !== 'solo') return
    setPhase('star')
    setPrompt(null)
    void say(O.soloYay)
    await wait(4200)
    if (!alive()) return
    void lupaMoment()
  }

  // ---------- 3. Lupa's moment ----------
  const [star, setStar] = useState<'off' | 'down' | 'used'>('off')
  const lupaMoment = async () => {
    band.current?.setLevel(0.05)
    setConducting(false)
    band.current?.stop(1.5)
    band.current = null
    void lupa.current?.play('wiggle')
    await say(O.lupaTurn)
    if (!alive()) return
    setStar('down')
    sounds.sparkle()
    setPrompt({ text: O.star, speak: true })
  }
  const tapStar = async () => {
    if (star !== 'down') return
    setStar('used')
    setPrompt(null)
    step()
    burst()
    void lupa.current?.play('howl')
    highNote()
    await wait(3400)
    if (!alive()) return
    cheer()
    bigCelebration()
    void lupa.current?.play('cheer')
    for (const f of FRIENDS) void friendRefs.current[f.id]?.play('cheer')
    await say(O.sang)
    if (!alive()) return
    for (const line of O.brava) {
      await say(line)
      if (!alive()) return
    }
    void roses()
  }

  // Roses fly onto the stage.
  const [roseList, setRoseList] = useState<{ id: number; x: number; caught: boolean }[]>([])
  const caught = useRef(0)
  const roses = async () => {
    setPhase('roses')
    setPrompt({ text: O.roses, speak: true })
    for (let i = 0; i < 6; i++) {
      setRoseList((r) => [...r, { id: i, x: 0.15 + Math.random() * 0.7, caught: false }])
      await wait(650)
      if (!alive()) return
    }
    await wait(2500)
    if (!alive() || phaseRef.current !== 'roses') return
    void jets()
  }
  const catchRose = (id: number) => {
    setRoseList((r) => r.map((x) => (x.id === id ? { ...x, caught: true } : x)))
    sounds.pop()
    sounds.note(Math.min(10, caught.current * 2))
    const n = ++caught.current
    if (n === 3 && phaseRef.current === 'roses') void jets()
  }

  // ---------- 4. The air show, the flag, gelato ----------
  const [smoke, setSmoke] = useState(false)
  const [flag, setFlag] = useState(false)
  const jets = async () => {
    setPhase('jets')
    setPrompt(null)
    setRoseList([])
    await wait(600)
    if (!alive()) return
    await say(O.jets)
    if (!alive()) return
    setSmoke(true)
    sounds.whoosh()
    await wait(2600)
    if (!alive()) return
    step()
    setFlag(true)
    sounds.fanfare()
    await say(O.flag)
    if (!alive()) return
    setPhase('picnic')
    for (const f of FRIENDS) void friendRefs.current[f.id]?.play('jump')
    await say(O.gelato)
    if (!alive()) return
    void lupa.current?.play('wave')
    await say(O.bye)
    if (!alive()) return
    setPrompt({ text: O.trophy, speak: true })
  }

  // ---------- Layout ----------
  const stageY = oy + bh * (landscape ? 0.86 : 0.83)
  // In landscape the band sits a little right of center, leaving the front-left corner for Sparkle.
  const fh = landscape ? Math.min(bh * 0.18, W / 8.2, 180) : Math.min(bh * 0.11, W / 7.2, 190)
  const lh = fh * 1.45
  const cx = landscape ? W * 0.55 : W / 2
  const slots = FRIENDS.map((_, i) => {
    const k = i < 3 ? i - 3 : i - 2 // -3,-2,-1, 1,2,3 around Lupa
    return cx + k * Math.min(W / (landscape ? 8.7 : 7.4), fh * 1.25) + (k < 0 ? -lh * 0.12 : lh * 0.12)
  })
  const sh = landscape ? Math.min(H * 0.22, W * 0.16, 200) : Math.min(H * 0.24, W * 0.2, 220)

  return (
    <div ref={box} onPointerDown={(e) => (void tapStands(e), moveWand(e))} onPointerMove={moveWand} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#2A2458', touchAction: 'none' }}>
      {W > 0 && <div style={{ position: 'absolute', left: ox, top: oy, width: bw, height: bh, background: `url(${landscape ? art.bgVeronaArena : art.bgVeronaArenaTall}) center / 100% 100%` }} />}
      {/* Night falls as the candles come on. */}
      <motion.div aria-hidden style={{ position: 'absolute', inset: 0, background: '#1B1640', opacity: darkOpacity, pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {candles.map((c, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: [1, 1.25, 0.9, 1.15, 1], opacity: [1, 0.8, 1, 0.85, 1] }} transition={{ scale: { repeat: Infinity, duration: 1.4 + c.d, delay: c.d }, opacity: { repeat: Infinity, duration: 1.1 + c.d } }} style={{ position: 'absolute', left: c.x - 5, top: c.y - 7, width: 10, height: 14, borderRadius: '50% 50% 45% 45% / 65% 65% 35% 35%', background: '#FFD45E', boxShadow: '0 0 10px 4px rgba(255,200,61,.55)' }} />
        ))}
      </div>

      {/* The air show: three jets paint the flag's colors across the sky. */}
      <AnimatePresence>{smoke && <AirShow W={W} H={H} />}</AnimatePresence>
      <AnimatePresence>
        {flag && (
          <motion.div initial={{ scale: 0, y: -40 }} animate={{ scale: 1, y: 0, rotate: [-3, 3, -3] }} transition={{ rotate: { repeat: Infinity, duration: 2 } }} style={{ position: 'absolute', left: '50%', top: landscape ? 'calc(var(--top-clear) + 100px)' : 'calc(var(--top-clear) + 130px)', translate: '-50% 0', zIndex: 3, filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.25))' }}>
            <Flag id="italy" width="min(34vw, 260px)" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lupa's wishing star. */}
      <AnimatePresence>
        {star === 'down' && (
          <motion.button aria-label="Wishing star" className="world-glow" initial={{ y: -H * 0.6, scale: 0.4 }} animate={{ y: 0, scale: 1, rotate: [0, 12, -12, 0] }} exit={{ scale: 2.5, opacity: 0 }} transition={{ y: { duration: 2, ease: 'easeOut' }, rotate: { repeat: Infinity, duration: 1.4 } }} onClick={() => void tapStar()} style={{ position: 'absolute', left: cx - 60, top: stageY - lh - 150, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,226,122,.35)', border: 'none', fontSize: 84, zIndex: 20, padding: 0 }}>
            ⭐
          </motion.button>
        )}
      </AnimatePresence>

      {/* The band on the stage. */}
      {W > 0 &&
        FRIENDS.map((f, i) => {
          const h = fh * f.size
          return (
            <motion.button
              key={f.id}
              aria-label={f.id}
              className={phase === 'solo' ? 'world-glow' : undefined}
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * i, type: 'spring', bounce: 0.4 }}
              onClick={() => (phaseRef.current === 'solo' ? void giveSolo(f) : void friendRefs.current[f.id]?.play('wiggle'))}
              style={{ position: 'absolute', left: slots[i] - h * 0.6, top: stageY - h, width: h * 1.2, height: h, background: 'none', border: 'none', padding: 0, zIndex: 6, borderRadius: '40%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}
            >
              <Buddy ref={(r) => void (friendRefs.current[f.id] = r)} img={f.img} voice={f.voice} height={`${h}px`} flip={i >= 3} />
              <BounceInstrument src={f.instrument} size={h * 0.42} bounce={bounce} left={i >= 3} />
              {phase === 'picnic' && (
                <motion.img src={art.gelato} alt="" initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.15 * i, type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', bottom: '38%', [i >= 3 ? 'left' : 'right']: '-8%', width: h * 0.26, rotate: i >= 3 ? '-12deg' : '12deg' }} />
              )}
            </motion.button>
          )
        })}
      {W > 0 && (
        <div style={{ position: 'absolute', left: cx - lh * 0.6, top: stageY - lh, width: lh * 1.2, height: lh, zIndex: 7, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <Lupa ref={lupa} height={`${lh}px`} onTap={() => void (star === 'down' ? tapStar() : lupa.current?.play('howl'))} />
          {phase === 'picnic' && <motion.img src={art.gelato} alt="" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', right: '6%', top: '38%', width: lh * 0.2, rotate: '12deg' }} />}
        </div>
      )}
      {/* Roses landing on the stage. */}
      {roseList.map((r) =>
        r.caught ? null : (
          <motion.button key={r.id} aria-label="Rose" initial={{ x: r.x * W - 50, y: -120, rotate: -40 }} animate={{ y: stageY - 60 - (r.id % 3) * 40, rotate: 30 }} transition={{ duration: 1.6, ease: 'easeOut' }} onClick={() => catchRose(r.id)} style={{ position: 'absolute', left: 0, top: 0, width: 100, height: 100, background: 'none', border: 'none', padding: 0, zIndex: 15 }}>
            <img src={art.rose} alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
          </motion.button>
        ),
      )}

      {/* Sparkle in the front corner, wearing her Venice mask if she made one. */}
      <div style={{ position: 'absolute', left: landscape ? '2%' : '1%', bottom: 'calc(var(--safe-bottom) + 6px)', zIndex: 9, pointerEvents: 'none' }}>
        <SparklePuppet ref={sparkle} height={`${sh}px`} lookToward={0.6} />
        {mask && (
          <div style={{ position: 'absolute', left: sh * 0.44, top: sh * 0.18, width: sh * 0.42, rotate: '6deg' }}>
            <MaskArt data={mask} id="opera-mask" />
          </div>
        )}
      </div>

      {/* The conductor's wand, following her finger. */}
      {conducting && (
        <div ref={wand} aria-hidden style={{ position: 'fixed', left: 0, top: 0, zIndex: 40, pointerEvents: 'none', transform: `translate(${W * 0.6}px, ${H * 0.55}px)` }}>
          <div style={{ position: 'absolute', left: -6, top: -6, width: 110, height: 12, background: '#FFF7F0', border: `4px solid ${INK}`, borderRadius: 8, rotate: '35deg', transformOrigin: '0 50%' }} />
          <div style={{ position: 'absolute', left: -22, top: -22, fontSize: 40 }}>✨</div>
        </div>
      )}
      {/* Forte / piano meter, so Dad can see what her wand does. */}
      {conducting && (
        <div aria-hidden style={{ position: 'absolute', right: 14, top: 'calc(var(--top-clear) + 90px)', width: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 30, pointerEvents: 'none', color: '#fff', fontWeight: 700, fontSize: 18, textShadow: `0 2px 0 ${INK}` }}>
          <span>forte</span>
          <div style={{ position: 'relative', width: 30, height: 'min(30vh, 220px)', background: 'rgba(255,247,240,.25)', border: `4px solid #FFF7F0`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${levelShown * 100}%`, background: '#FF8FB8', transition: 'height .15s' }} />
          </div>
          <span>piano</span>
        </div>
      )}
      {phase === 'picnic' && prompt && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', left: '50%', top: 'calc(var(--top-clear) + 8px)', translate: '-50% 0', zIndex: 60 }}>
          <button aria-label="Get my trophy" className="world-glow" onClick={onDone} style={{ fontSize: 64, width: 120, height: 120, borderRadius: '50%', background: '#FFC83D', border: `5px solid ${INK}`, padding: 0 }}>
            🏆
          </button>
        </motion.div>
      )}
      <PromptRow prompt={phase === 'picnic' ? null : prompt} H={H} landscape={landscape} />
      {phase === 'story' && (
        <StoryBeat
          lines={O.arrive}
          friend={<Lupa height="100%" />}
          bg={landscape ? art.bgVeronaArena : art.bgVeronaArenaTall}
          onDone={() => {
            setPhase('candles')
            setPrompt({ text: O.candles, speak: true })
          }}
        />
      )}
    </div>
  )
}

/** An instrument by a friend's paws that bops on every beat. */
function BounceInstrument({ src, size, bounce, left }: { src: string; size: number; bounce: MotionValue<number>; left: boolean }) {
  const y = useTransform(bounce, (v) => -v * size * 0.18)
  const emoji = !src.includes('/') && !src.startsWith('data:')
  return (
    <motion.div style={{ position: 'absolute', bottom: '4%', [left ? 'left' : 'right']: '-4%', width: size, height: size, y, display: 'grid', placeItems: 'center', fontSize: size * 0.8, pointerEvents: 'none' }}>
      {emoji ? src : <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
    </motion.div>
  )
}
/** Three jets fly across the sky trailing green, white and red smoke, the way the Frecce Tricolori do. */
function AirShow({ W, H }: { W: number; H: number }) {
  const top = Math.max(120, H * 0.14)
  const colors = ['#5DBB7A', '#FFF7F0', '#E8574F']
  return (
    <motion.div aria-hidden exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {colors.map((c, i) => (
        <div key={c} style={{ position: 'absolute', left: 0, top: top + i * 34, height: 30, width: W }}>
          <motion.div initial={{ width: 0 }} animate={{ width: W + 80 }} transition={{ duration: 2.4, ease: 'linear', delay: i * 0.08 }} style={{ position: 'absolute', left: -40, top: 4, height: 22, borderRadius: 12, background: c, opacity: 0.9, border: `3px solid ${INK}` }} />
          <motion.div initial={{ x: -60 }} animate={{ x: W + 80 }} transition={{ duration: 2.4, ease: 'linear', delay: i * 0.08 }} style={{ position: 'absolute', left: 0, top: -8 }}>
            <svg viewBox="0 0 80 40" width="80" height="40">
              <path d="M4 20 Q10 12 30 14 L50 4 L58 4 L50 16 L72 18 Q78 20 72 22 L50 24 L58 36 L50 36 L30 26 Q10 28 4 20 Z" fill="#A8DCFF" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      ))}
    </motion.div>
  )
}

