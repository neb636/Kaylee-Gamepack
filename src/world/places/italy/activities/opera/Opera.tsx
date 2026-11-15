// 🎭 Opera Night at the Arena, Italy's finale (plan: planning/around-the-world/italy.md (retired; in git history), "Finale").
// The look is drawn in code (art.tsx), the band are Italy's puppets with their instruments, and every prompt is spoken
// (lines.ts L.opera). Lupa says she's too shy (the story), then Kaylee grabs the conductor's
// wand and every swing is one beat of a synthesized tarantella (band.ts), so her hand is the tempo; big swings play
// forte, little swings piano, and the band freezes when she stops. The loop: candles light up the arena as she plays,
// the baby owl wants piano, the crowd wants forte, three solos of her choice, then the Trevi star lets Lupa sing (soft,
// then louder) and the wand lifts Lupa's big high note. Roses, the Frecce Tricolori painting the flag where she sweeps
// the wand, and the picnic, where hugging Lupa calls onDone (the trophy ceremony). Nothing can fail: each step helps
// her along if she's stuck. Stroke detection and its feel numbers are in conduct.ts (FEEL).
// Where it stands (2026-11-14, PR #449): shipped. The user skipped the playtest (Kaylee already played the greybox
// and enjoyed it), so her play diary is the playtest now: watch whether she finishes the opera or leaves it, and where.
// Open questions it can answer: do big and small swings read as different (only the band's bounce and the owl show
// "forte"/"piano"), and does the hold-still solo fight the swing (a tap gives a solo too). Small things: Sparkle's
// lines run 4-7 s (the owl's is the longest); the picnic pizza is a Margherita, not her own (the Pizzeria doesn't save it).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from 'react'
import { burst, say, SparklePuppet, sounds, useElementSize, useGameLoop, type Line, type PuppetHandle } from '../../../../../sdk'
import { Flag } from '../../../../kit/Flag'
import { useSections } from '../../../../kit/sections'
import { PromptBubble } from '../../../../kit/Stage'
import { sfx } from '../../../../kit/sfx'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Bruno } from '../../puppets/Bruno'
import { Cesare } from '../../puppets/Cesare'
import { Gino } from '../../puppets/Gino'
import { INK } from '../../puppets/ink'
import { Lupa } from '../../puppets/Lupa'
import { Nino } from '../../puppets/Nino'
import { Spina } from '../../puppets/Spina'
import { Arena, BabyOwl, Candle, CrowdHead, Curtain, Gelato, Jet, Moon, Piano, Pigeon, Pizza, Podium, Rose, Stars, StarFace } from './art'
import { endHighNote, playBeat, pluck, setHighNote, setLupa, setSolo, startBand, startHighNote, stopBand, type Part } from './band'
import { createConductor, FEEL, type Beat } from './conduct'
import SECTIONS from './sections'

const O = L.opera

/** The steps in play order; each one is a section (sections.ts), so #/world/italy/party/<step> starts there. */
type Stage = (typeof SECTIONS.sections)[number]['id']
const STAGES = SECTIONS.sections.map((x) => x.id)
const after = (a: Stage, b: Stage) => STAGES.indexOf(a) > STAGES.indexOf(b)
/** Stars she has when each step starts. */
const DONE_AT: Record<Stage, number> = { story: 0, candles: 0, owl: 1, dance: 2, solo: 3, star: 4, lupa: 4, high: 4, roses: 5, sky: 5, picnic: 5 }

/** Stars in the top bar: candles, owl, dance, solos, Lupa's note. */
const TOTAL = 5
const CANDLES = 42
const CANDLES_PER_BEAT = 2
const OWL_SOFT = 6
const DANCE_LOUD = 6
const SOLOS = 3
const LUPA_BEATS = 12
const HIGH_HOLD = 1 // seconds with the wand up high
const ROSES = 5
/** Seconds stuck before a step helps her along (never a fail). */
const HINT_AFTER = 8
const ASSIST_AFTER = 22

type BandId = keyof typeof O.solos
/** The band on the stage's back row, and Lupa in front: Italy's puppets, each with the instrument they brought. */
const BAND: { id: BandId; name: string; part: Part; instrument: string }[] = [
  { id: 'bruno', name: 'Zio Bruno', part: 'mandolin', instrument: 'mandolin' },
  { id: 'spina', name: 'Spina', part: 'tambourine', instrument: 'tambourine' },
  { id: 'cesare', name: 'Cesare', part: 'horn', instrument: 'horn' },
  { id: 'gino', name: 'Gino', part: 'accordion', instrument: 'accordion' },
  { id: 'nino', name: 'Nino', part: 'piano', instrument: 'piano' },
]
const LUPA = BAND.length

const PROMPTS: Record<Stage, Line> = {
  story: O.candles,
  candles: O.candles,
  owl: O.owl,
  dance: O.dance,
  solo: O.solo,
  star: O.star,
  lupa: O.lupa,
  high: O.high,
  roses: O.roses,
  sky: O.sky,
  picnic: O.picnic,
}
const HINTS: Partial<Record<Stage, Line>> = O.hints

/** A puppet for each band member, holding their instrument (held pictures for the mandolin, tambourine and horn;
 *  Gino's accordion is his own; Nino stands at his little piano). `h` is the member's slot height. */
function Member({ id, h, refs }: { id: BandId; h: number; refs: RefObject<PuppetHandle | null> }): ReactNode {
  const held = (src: string, w: number, x: number, y: number, rot: number) => (
    <img src={src} alt="" draggable={false} style={{ position: 'absolute', width: h * w, left: `${x}%`, top: `${y}%`, rotate: `${rot}deg`, pointerEvents: 'none' }} />
  )
  if (id === 'bruno') return <><Bruno ref={refs} height={`${h}px`} />{held(art.mandolin, 0.5, 20, 48, -28)}</>
  if (id === 'spina') return <><Spina ref={refs} height={`${h}px`} />{held(art.tambourine, 0.38, 54, 40, 14)}</>
  if (id === 'cesare') return <><Cesare ref={refs} height={`${h}px`} />{held(art.romanHorn, 0.5, 46, 36, -12)}</>
  if (id === 'gino') return <Gino ref={refs} height={`${h}px`} accordion singing />
  return (
    <>
      <div style={{ position: 'absolute', left: '-18%', bottom: 0, pointerEvents: 'none' }}>
        <Piano w={h * 0.62} />
      </div>
      <Nino ref={refs} height={`${h * 0.86}px`} style={{ position: 'relative', left: '16%' }} />
    </>
  )
}

interface Geo {
  W: number
  H: number
  top: number
  /** Where the stands start, the stage's back edge, the stage's front edge. */
  standsTop: number
  stageBack: number
  stageFront: number
  memberW: number
  members: { x: number; y: number }[]
  lupa: { x: number; y: number; w: number }
  podium: { x: number; y: number }
  owl: { x: number; y: number; r: number }
  moon: { x: number; y: number; r: number }
  candles: { x: number; y: number }[]
  crowd: { x: number; y: number; r: number }[]
}

function makeGeo(W: number, H: number): Geo {
  const short = W > H && H < 560
  const top = short ? 64 : 112
  const avail = H - top
  const standsTop = top + avail * 0.22
  const stageBack = top + avail * 0.5
  const stageFront = top + avail * 0.8
  // A tall screen (an iPad held upright) puts the band in two rows so they're bigger: Bruno, Spina and Cesare at the
  // back, Gino and Nino in front either side of Lupa. A wide one has one row: three on the left, two on the right, and
  // a gap in the middle for Lupa (so she never hides Cesare).
  const tall = H > W * 1.1
  const memberW = tall ? Math.max(64, Math.min(W * 0.22, avail * 0.15, 190)) : Math.max(64, Math.min(W * 0.14, avail * 0.17, 170))
  const members = tall
    ? [
        { x: W * 0.2, y: stageBack - memberW * 1.05 },
        { x: W * 0.5, y: stageBack - memberW * 1.05 },
        { x: W * 0.8, y: stageBack - memberW * 1.05 },
        { x: W * 0.17, y: stageFront - memberW * 1.25 },
        { x: W * 0.83, y: stageFront - memberW * 1.25 },
      ]
    : [0.1, 0.24, 0.37, 0.65, 0.87].map((f) => ({ x: W * f, y: stageBack + avail * 0.06 }))
  const lupaW = memberW * 1.15
  const candles: { x: number; y: number }[] = []
  const rows = 3
  const perRow = CANDLES / rows
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < perRow; c++) candles.push({ x: W * (0.04 + (0.92 * (c + (r % 2) * 0.5)) / perRow), y: standsTop + ((stageBack - standsTop) * (r + 0.6)) / (rows + 0.4) })
  const crowdN = Math.max(7, Math.round(W / 110))
  const crowdR = Math.min(W / crowdN / 2.1, avail * 0.07)
  const crowd = Array.from({ length: crowdN }, (_, i) => ({ x: (W * (i + 0.5)) / crowdN, y: H - crowdR * 0.7, r: crowdR }))
  return {
    W,
    H,
    top,
    standsTop,
    stageBack,
    stageFront,
    memberW,
    members,
    lupa: { x: W / 2, y: stageFront - avail * 0.03, w: lupaW },
    podium: { x: W * 0.5, y: H - crowdR * 1.6 },
    owl: { x: W * 0.09, y: standsTop - avail * 0.02, r: Math.max(44, memberW * 0.36) },
    moon: { x: W * 0.84, y: top + (standsTop - top) * 0.45, r: Math.max(34, Math.min(W, avail) * 0.06) },
    candles,
    crowd,
  }
}

export function Opera({ onDone, setProgress }: ActivityProps) {
  const root = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(root)
  const geo = W > 0 && H > 0 ? makeGeo(W, H) : null
  const geoRef = useRef<Geo | null>(null)
  geoRef.current = geo

  const { start, param, enter } = useSections(SECTIONS)
  // A deep link starts at its step, as if she had played up to there (the solos param says who had theirs).
  const [seed] = useState(() => {
    const at: Stage = start ?? 'story'
    const picked = [...new Set(param('solos').split(',').map((id) => BAND.findIndex((m) => m.id === id)).filter((i) => i >= 0))]
    // Still choosing solos: fewer than three. Past them: three (the ones in the link first).
    const solos = at === 'solo' ? picked.slice(0, SOLOS - 1) : after(at, 'solo') ? [...picked, ...BAND.map((_, i) => i).filter((i) => !picked.includes(i))].slice(0, SOLOS) : []
    return { at, solos }
  })
  const seedPast = (s: Stage) => after(seed.at, s)
  const [stage, setStageState] = useState<Stage>(seed.at)
  const [prompt, setPrompt] = useState<Line>(PROMPTS[seed.at])
  /** The puppets' handles: the band in BAND order, then Lupa. */
  const [pups] = useState(() => Array.from({ length: BAND.length + 1 }, () => ({ current: null as PuppetHandle | null })))
  const act = (i: number, action: string) => void pups[i]?.current?.play(action)
  const sparkle = useRef<PuppetHandle>(null)
  const picnicLupa = useRef<PuppetHandle>(null)
  const [lit, setLit] = useState(seedPast('candles') ? CANDLES : 0)
  const [owl, setOwl] = useState<'awake' | 'dozing' | 'startled' | 'asleep'>(seedPast('owl') ? 'asleep' : 'awake')
  const [owlSleep, setOwlSleep] = useState(seedPast('owl') ? 1 : 0)
  const [crowdUp, setCrowdUp] = useState(seedPast('dance') ? 1 : 0)
  const [wave, setWave] = useState(0)
  const [solo, setSoloState] = useState<number | null>(null)
  const [solos, setSolos] = useState<number[]>(seed.solos)
  const [roses, setRoses] = useState<number[]>(seed.at === 'roses' ? Array.from({ length: ROSES }, (_, i) => i) : [])
  const [flag, setFlag] = useState(seed.at === 'picnic')
  const [moonWink, setMoonWink] = useState(0)
  const [sway, setSway] = useState(0)
  const [starTapped, setStarTapped] = useState(false)
  const [pigeon, setPigeon] = useState(0)
  const [cheer, setCheer] = useState<{ i: number; n: number } | null>(null)
  const [flare, setFlare] = useState(-1)
  const [frozen, setFrozen] = useState(false)
  const [nudge, setNudge] = useState(false)
  useEffect(() => setProgress(DONE_AT[seed.at], TOTAL), [])

  const conductor = useRef(createConductor()).current
  const g = useRef({
    stage: seed.at,
    stageAt: 0,
    t: 0,
    lit: seedPast('candles') ? CANDLES : 0,
    saidForte: false,
    saidPiano: false,
    softRun: seedPast('owl') ? OWL_SOFT : 0,
    loud: seedPast('dance') ? DANCE_LOUD : 0,
    solos: new Set<number>(seed.solos),
    hover: -1,
    hoverT: 0,
    lupaBeats: 0,
    brave: 0,
    holdTop: 0,
    skyMin: Infinity,
    skyMax: -Infinity,
    skyPath: [] as [number, number][],
    drag: null as null | { id: number; x0: number; y0: number; t0: number },
    tip: { x: 0, y: 0, vx: 0, home: true },
    trail: [] as { x: number; y: number; age: number }[],
    lastBeat: -99,
    playing: false,
    kick: BAND.map(() => ({ y: 0, v: 0, tilt: 0, tiltTo: 0 })).concat([{ y: 0, v: 0, tilt: 0, tiltTo: 0 }]),
    hinted: false,
    flagged: seed.at === 'picnic',
    done: false,
  })
  const timers = useRef<number[]>([])
  const later = (ms: number, fn: () => void) => void timers.current.push(window.setTimeout(fn, ms))
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      stopBand()
    },
    [],
  )

  // ---- DOM handles the loop writes to ----
  const memberEls = useRef<(HTMLDivElement | null)[]>([])
  const wandEl = useRef<HTMLDivElement>(null)
  const trailEl = useRef<SVGPolylineElement>(null)
  const skyEls = useRef<(SVGPolylineElement | null)[]>([])
  const jetEls = useRef<(HTMLDivElement | null)[]>([])

  /** Every step is a section: the address bar always says where she is (and who had a solo). */
  const enterStage = (s: Stage) => enter(s, { solos: after(s, 'dance') ? [...g.current.solos].map((i) => BAND[i].id).join(',') : undefined })
  useEffect(() => {
    enterStage(seed.at)
    if (seed.at === 'lupa') setLupa(true, 1)
    if (seed.at === 'roses') later(9000, () => g.current.stage === 'roses' && setStage('sky'))
  }, [])
  // A picnic link: the jets' flag smoke is already across the sky (it needs the screen's size).
  useEffect(() => {
    if (seed.at !== 'picnic' || !geo || g.current.skyPath.length) return
    const gap = Math.max(10, geo.memberW * 0.16)
    g.current.skyPath = Array.from({ length: 40 }, (_, i) => [geo.W * (0.05 + i * 0.023), geo.top + 60 + Math.sin(i / 5) * 30])
    skyEls.current.forEach((el, k) => el?.setAttribute('points', g.current.skyPath.map(([x, y]) => `${x},${y + (k - 1) * gap}`).join(' ')))
  }, [!!geo])

  const setStage = (s: Stage) => {
    const st = g.current
    enterStage(s)
    st.stage = s
    st.stageAt = st.t
    st.hinted = false
    setStageState(s)
    setPrompt(PROMPTS[s])
    setNudge(false)
  }
  const advance = (s: Stage, done: number, ms = 900) => {
    setProgress(done, TOTAL)
    burst()
    sounds.correct()
    void sparkle.current?.play('cheer')
    later(ms, () => setStage(s))
  }

  // ---- Beats: every stroke plays the next beat and moves the story along ----
  const onBeat = (beat: Beat) => {
    const st = g.current
    if (st.stage === 'high' || st.stage === 'roses' || st.stage === 'picnic') return
    playBeat(st.stage === 'lupa' ? Math.max(beat.amp, 0.3) : beat.amp, beat.length)
    st.lastBeat = st.t
    st.playing = true
    st.hinted = false
    setFrozen(false)
    setNudge(false)
    // The band bounces: big swings jump high, little swings just sway.
    const side = Math.random() < 0.5 ? -1 : 1
    st.kick.forEach((k, i) => {
      const loud = solo === null || solo === i ? 1 : 0.45
      k.v -= (90 + 520 * beat.amp) * loud
      k.tiltTo = side * (i % 2 ? -1 : 1) * (3 + 11 * beat.amp)
    })
    const piano = beat.amp < FEEL.piano
    const forte = beat.amp > FEEL.forte
    const sinceStart = st.t - st.stageAt

    switch (st.stage) {
      case 'candles': {
        st.lit = Math.min(CANDLES, st.lit + CANDLES_PER_BEAT)
        setLit(st.lit)
        if (forte && !st.saidForte) {
          st.saidForte = true
          setPrompt(O.forte)
        } else if (piano && !st.saidPiano && st.lit > 8) {
          st.saidPiano = true
          setPrompt(O.piano)
        }
        if (st.lit >= CANDLES) {
          st.stage = 'owl'
          advance('owl', 1, 1200)
        }
        break
      }
      case 'owl': {
        if (forte && sinceStart < ASSIST_AFTER) {
          st.softRun = Math.max(0, st.softRun - 2)
          setOwl('startled')
          sfx.boing()
          later(900, () => g.current.stage === 'owl' && setOwl('awake'))
        } else st.softRun++
        setOwlSleep(st.softRun / OWL_SOFT)
        if (st.softRun > 1 && owl !== 'startled') setOwl('dozing')
        if (st.softRun >= OWL_SOFT) {
          st.stage = 'dance'
          setOwl('asleep')
          advance('dance', 2, 1400)
        }
        break
      }
      case 'dance': {
        if (forte || sinceStart > ASSIST_AFTER) st.loud++
        setCrowdUp(st.loud / DANCE_LOUD)
        if (st.loud >= DANCE_LOUD) {
          st.stage = 'solo'
          setWave((w) => w + 1)
          advance('solo', 3, 2200)
        }
        break
      }
      case 'lupa': {
        st.lupaBeats++
        if (st.lupaBeats % 3 === 1) act(LUPA, 'howl')
        st.brave = Math.min(1, st.brave + 0.03 + beat.amp * 0.12)
        setLupa(true, 1 - st.brave)
        if (st.lupaBeats >= LUPA_BEATS) {
          st.stage = 'high'
          later(1300, () => {
            setLupa(false)
            setStage('high')
          })
        }
        break
      }
      case 'sky':
        break
    }
  }

  const giveSolo = (i: number) => {
    const st = g.current
    setSoloState(i)
    setSolo(BAND[i].part)
    pluck(BAND[i].part)
    sounds.sparkle()
    if (st.stage !== 'solo' || st.solos.has(i)) return
    st.solos.add(i)
    act(i, 'cheer')
    void say(O.solos[BAND[i].id])
    setSolos([...st.solos])
    if (st.solos.size < SOLOS) enterStage('solo')
    if (st.solos.size >= SOLOS) {
      st.stage = 'star'
      later(2600, () => {
        setSoloState(null)
        setSolo(null)
      })
      advance('star', 4, 2600)
    }
  }

  const bravo = () => {
    const st = g.current
    if (st.stage !== 'high') return
    st.stage = 'roses'
    later(1400, endHighNote)
    setProgress(5, TOTAL)
    sounds.fanfare()
    setCrowdUp(1)
    setWave((w) => w + 1)
    act(LUPA, 'cheer')
    void sparkle.current?.play('dance')
    BAND.forEach((_, i) => later(200 + i * 120, () => act(i, 'cheer')))
    later(600, () => {
      setStage('roses')
      setRoses(Array.from({ length: ROSES }, (_, i) => i))
    })
    later(9000, () => g.current.stage === 'roses' && setStage('sky'))
  }

  // ---- Pokeables: taps that aren't swings ----
  const poke = (kind: string, i: number) => {
    const st = g.current
    if (kind === 'member') {
      // Lupa sings her own part later (she isn't in BAND), so tapping her during the solos is just a poke.
      if ((st.stage === 'solo' || st.stage === 'star') && i !== LUPA) return giveSolo(i)
      pluck(i === LUPA ? 'lupa' : BAND[i].part)
      act(i, i === LUPA ? 'howl' : 'wave')
      st.kick[i].v -= 380
    } else if (kind === 'owl') {
      sounds.pop()
      setOwl('startled')
      later(900, () => setOwl(g.current.stage === 'owl' || g.current.stage === 'candles' ? 'awake' : 'asleep'))
    } else if (kind === 'sparkle') {
      sounds.sparkle()
      void sparkle.current?.play('wave')
    } else if (kind === 'curtain') {
      sfx.fwip()
      setSway((n) => n + 1)
    } else if (kind === 'moon') {
      sounds.sparkle()
      setMoonWink((n) => n + 1)
    } else if (kind === 'pigeon') {
      sfx.fwip()
      setPigeon((n) => n + 1)
    } else if (kind === 'crowd') {
      sounds.pop()
      setCheer({ i, n: Date.now() })
    } else if (kind === 'candle') {
      sounds.note(i % 8)
      setFlare(i)
      if (i >= st.lit) {
        st.lit = Math.max(st.lit, Math.min(CANDLES, st.lit + 1))
        setLit(st.lit)
      }
    }
  }

  // ---- Pointer: anywhere picks up the wand; swings are beats; a quick tap on something pokes it ----
  const local = (e: PointerEvent) => {
    const r = root.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() / 1000 }
  }
  const onPointerDown = (e: PointerEvent) => {
    const st = g.current
    if (st.drag || (e.target as HTMLElement).closest('[data-tap]') || st.stage === 'picnic' || st.stage === 'story') return
    if (e.clientX < 22) return // keep clear of Safari's back-swipe edge
    startBand()
    const p = local(e)
    root.current!.setPointerCapture(e.pointerId)
    st.drag = { id: e.pointerId, x0: p.x, y0: p.y, t0: p.t }
    if (st.tip.home) sfx.fwip()
    st.tip = { x: p.x, y: p.y, vx: 0, home: false }
    conductor.setScale(Math.min(W, H))
    conductor.start(p.x, p.y, p.t)
    if (st.stage === 'high') startHighNote()
  }
  const onPointerMove = (e: PointerEvent) => {
    const st = g.current
    if (!st.drag || st.drag.id !== e.pointerId) return
    const p = local(e)
    st.tip.vx = st.tip.vx * 0.7 + (p.x - st.tip.x) * 0.3
    st.tip.x = p.x
    st.tip.y = p.y
    const beat = conductor.move(p.x, p.y, p.t)
    if (beat) onBeat(beat)
    // Sky: every move adds to the jets' smoke (per move, not per frame, so a fast sweep still paints the whole way).
    const G = geoRef.current
    if (st.stage === 'sky' && G && p.y < G.stageBack) {
      const last = st.skyPath[st.skyPath.length - 1]
      if (!last || Math.hypot(p.x - last[0], p.y - last[1]) > 8) st.skyPath.push([p.x, p.y])
      if (st.skyPath.length > 160) st.skyPath.shift()
      st.skyMin = Math.min(st.skyMin, p.x)
      st.skyMax = Math.max(st.skyMax, p.x)
    }
  }
  const onPointerUp = (e: PointerEvent) => {
    const st = g.current
    if (!st.drag || st.drag.id !== e.pointerId) return
    const p = local(e)
    const tap = p.t - st.drag.t0 < 0.3 && Math.hypot(p.x - st.drag.x0, p.y - st.drag.y0) < 14
    st.drag = null
    st.hover = -1
    st.hoverT = 0
    if (st.stage === 'high') endHighNote()
    if (tap) {
      const hit = document
        .elementsFromPoint(e.clientX, e.clientY)
        .map((el) => (el as HTMLElement).closest?.('[data-poke]') as HTMLElement | null)
        .find(Boolean)
      if (hit) {
        conductor.end(p.t + 1) // not a beat
        return poke(hit.dataset.poke!, Number(hit.dataset.i ?? 0))
      }
    }
    const beat = conductor.end(p.t)
    if (beat) onBeat(beat)
  }

  // QA hook: play beats without a finger, and read where she is (qa-motion, qa-pacing). Deep links replace jumps.
  useEffect(() => {
    const w = window as unknown as { __operaQA?: { beat: (amp: number) => void; state: () => unknown } }
    w.__operaQA = {
      state: () => ({ stage: g.current.stage, drag: !!g.current.drag, sky: g.current.skyPath.length }),
      beat: (amp) => {
        startBand()
        onBeat({ amp, length: 0.42 })
      },
    }
    return () => void delete w.__operaQA
  })

  // ---- The frame loop: wand, trail, bounces, freeze, hovers, hints and assists ----
  useGameLoop((dt) => {
    if (dt <= 0) return
    const st = g.current
    const G = geoRef.current
    if (!G) return
    st.t += dt
    const sinceStage = st.t - st.stageAt
    const sinceBeat = st.t - st.lastBeat

    // The band freezes when she stops (and carries on when she swings again).
    if (st.playing && sinceBeat > Math.max(0.9, conductor.length * 2.2)) {
      st.playing = false
      if (['candles', 'owl', 'dance', 'solo', 'lupa', 'sky'].includes(st.stage)) setFrozen(true)
    }
    // Stuck? A text hint after a while, then help.
    const waiting = !st.drag && sinceBeat > HINT_AFTER && sinceStage > HINT_AFTER
    if (waiting && !st.hinted && HINTS[st.stage]) {
      st.hinted = true
      setPrompt(HINTS[st.stage]!)
      setNudge(true)
    }
    if (sinceStage > ASSIST_AFTER * 1.5) {
      if (st.stage === 'solo' && !st.drag) {
        const next = BAND.findIndex((_, i) => !st.solos.has(i))
        st.stageAt = st.t - ASSIST_AFTER // one solo every few seconds
        if (next >= 0) giveSolo(next)
      } else if (st.stage === 'high') bravo()
      else if (st.stage === 'sky' && !st.flagged) {
        st.skyMin = 0
        st.skyMax = G.W
        st.skyPath = Array.from({ length: 40 }, (_, i) => [G.W * (0.05 + i * 0.023), G.top + 60 + Math.sin(i / 5) * 30])
      }
    }

    // Wand: at the podium when nobody holds it, under her finger when she does.
    const tip = st.tip
    if (!st.drag) {
      const restX = G.podium.x
      const restY = G.podium.y - G.memberW * 0.55
      if (!tip.home && sinceBeat > 1.2) {
        tip.x += (restX - tip.x) * Math.min(1, dt * 6)
        tip.y += (restY - tip.y) * Math.min(1, dt * 6)
        if (Math.hypot(restX - tip.x, restY - tip.y) < 2) tip.home = true
      }
      if (tip.home) {
        tip.x = restX
        tip.y = restY
      }
      tip.vx *= 0.9
    }
    if (wandEl.current) wandEl.current.style.transform = `translate(${tip.x}px, ${tip.y}px) rotate(${Math.max(-40, Math.min(40, -tip.vx * 1.6)) - 25}deg)`
    // Sparkle trail.
    if (st.drag) st.trail.push({ x: tip.x, y: tip.y, age: 0 })
    st.trail = st.trail.filter((p) => (p.age += dt) < 0.35)
    trailEl.current?.setAttribute('points', st.trail.map((p) => `${p.x},${p.y}`).join(' '))

    // Band bounces: a spring back to standing; tilt eases toward the beat's lean (and holds it when frozen).
    st.kick.forEach((k, i) => {
      k.v += (-180 * k.y - 14 * k.v) * dt
      k.y += k.v * dt
      if (st.playing) k.tilt += (k.tiltTo - k.tilt) * Math.min(1, dt * 10)
      const el = memberEls.current[i]
      if (el) {
        const sq = Math.max(-0.12, Math.min(0.12, -k.v / 3000))
        el.style.transform = `translateY(${Math.min(0, k.y * 0.18)}px) rotate(${k.tilt}deg) scale(${1 - sq}, ${1 + sq})`
      }
    })

    // Solos: hold the wand on a friend.
    if (st.stage === 'solo' && st.drag) {
      let over = -1
      memberEls.current.slice(0, BAND.length).forEach((el, i) => {
        const r = el?.getBoundingClientRect()
        const o = root.current!.getBoundingClientRect()
        if (r && tip.x > r.left - o.left - 10 && tip.x < r.right - o.left + 10 && tip.y > r.top - o.top - 20 && tip.y < r.bottom - o.top + 10) over = i
      })
      if (over !== st.hover) (st.hover = over), (st.hoverT = 0)
      else if (over >= 0 && (st.hoverT += dt) > 0.5 && solo !== over) giveSolo(over)
    }

    // Lupa's high note follows the wand's height.
    if (st.stage === 'high' && st.drag) {
      const h01 = 1 - (tip.y - G.top) / (G.stageFront - G.top)
      setHighNote(h01)
      const lupaEl = memberEls.current[LUPA]
      if (lupaEl) lupaEl.style.transform = `translateY(${-Math.max(0, h01) * 24}px) scale(${1 + Math.max(0, h01) * 0.25})`
      if (h01 > 0.72 && (st.holdTop += dt) > HIGH_HOLD) bravo()
    }

    // Sky: the jets follow the wand and paint the flag's colors.
    if (st.stage === 'sky') {
      const gap = Math.max(10, G.memberW * 0.16)
      skyEls.current.forEach((el, k) => el?.setAttribute('points', st.skyPath.map(([x, y]) => `${x},${y + (k - 1) * gap}`).join(' ')))
      const head = st.skyPath[st.skyPath.length - 1]
      jetEls.current.forEach((el, k) => {
        if (el && head) el.style.transform = `translate(${head[0]}px, ${head[1] + (k - 1) * gap}px)`
      })
      if (!st.flagged && st.skyMax - st.skyMin > G.W * 0.6) {
        st.flagged = true
        setFlag(true)
        sounds.fanfare()
        burst()
        later(2600, () => setStage('picnic'))
      }
    }
  })

  const catchRose = (i: number) => {
    sounds.pop()
    burst()
    setRoses((r) => {
      const left = r.filter((x) => x !== i)
      if (left.length === 0) later(700, () => g.current.stage === 'roses' && setStage('sky'))
      return left
    })
  }

  const hug = () => {
    const st = g.current
    if (st.done) return
    st.done = true
    sounds.fanfare()
    burst()
    void picnicLupa.current?.play('cheer')
    setPrompt(O.bye)
    later(2600, onDone)
  }

  const night = Math.min(1, lit / CANDLES)
  const sky = `linear-gradient(${night > 0.5 ? '#2A2363' : '#7A62A8'}, ${night > 0.5 ? '#5B4A8F' : '#F4A6B8'})`
  const conducting = ['candles', 'owl', 'dance', 'solo', 'lupa', 'sky'].includes(stage)
  const owlOpen = owl === 'asleep' ? 0 : owl === 'awake' && stage !== 'owl' ? 1 : 1 - owlSleep

  return (
    <div
      ref={root}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', background: sky, transition: 'background 2.5s' }}
    >
      {geo && (
        <>
          <Stars W={geo.W} H={geo.stageBack} night={night} />
          {/* Moon (winks). */}
          <motion.div
            data-poke="moon"
            key={`moon${moonWink}`}
            animate={moonWink ? { rotate: [0, -10, 8, 0] } : {}}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', left: geo.moon.x - geo.moon.r, top: geo.moon.y - geo.moon.r, opacity: 0.55 + night * 0.45 }}
          >
            <Moon r={geo.moon.r} wink={moonWink % 2 === 1} />
          </motion.div>
          {/* The arena: the Ala's arches, the candlelit terraces, the stage. */}
          <Arena W={geo.W} top={geo.top} standsTop={geo.standsTop} stageBack={geo.stageBack} stageFront={geo.stageFront} />
          <div aria-hidden style={{ position: 'absolute', left: geo.W * 0.6 + Math.min(geo.W * 0.3, 400) * 0.05, top: geo.standsTop - geo.memberW * 0.36 }}>
            <motion.div data-poke="pigeon" key={`p${pigeon}`} animate={pigeon ? { x: [0, -60, -140, -60, 0], y: [0, -80, -50, -80, 0], scaleX: [1, 1, -1, -1, 1] } : {}} transition={{ duration: 2.2 }}>
              <Pigeon size={Math.max(44, geo.memberW * 0.42)} />
            </motion.div>
          </div>
          {geo.candles.map((c, i) => {
            const size = Math.max(20, geo.memberW * 0.17)
            return (
              <motion.div key={i} data-poke="candle" data-i={i} animate={flare === i ? { scale: [1, 1.8, 1] } : {}} style={{ position: 'absolute', left: c.x - size / 2, top: c.y - size * 0.95 }}>
                <Candle lit={i < lit} size={size} />
              </motion.div>
            )
          })}
          {/* Baby owl in the stands: wants piano. */}
          {(stage === 'owl' || owl === 'asleep' || owl === 'startled') && (
            <motion.div data-poke="owl" initial={{ scale: 0 }} animate={{ scale: owl === 'startled' ? [1, 1.25, 1] : 1, rotate: owl === 'asleep' ? 8 : 0 }} style={{ position: 'absolute', left: geo.owl.x - geo.owl.r, top: geo.owl.y - geo.owl.r }}>
              <BabyOwl open={owlOpen} startled={owl === 'startled'} size={geo.owl.r * 2} />
              {owl === 'asleep' && (
                <motion.span animate={{ y: [0, -14], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ position: 'absolute', right: -18, top: -16, fontWeight: 700, color: '#fff', fontSize: 22 }}>
                  z
                </motion.span>
              )}
            </motion.div>
          )}
          {/* The curtains at the sides of the stage (they sway when poked). */}
          {[-1, 1].map((side) => {
            const h = (geo.stageFront - geo.stageBack) * 1.9
            const w = geo.W * 0.06
            return (
              <motion.div
                key={`${side}${sway}`}
                data-poke="curtain"
                animate={sway ? { skewX: [0, side * 6, -side * 3, 0] } : {}}
                transition={{ duration: 0.8 }}
                style={{ position: 'absolute', top: geo.stageFront - h, [side < 0 ? 'left' : 'right']: 0, transform: side > 0 ? 'scaleX(-1)' : undefined, transformOrigin: '50% 0' }}
              >
                <Curtain w={w} h={h} />
              </motion.div>
            )
          })}
          {/* Spotlight on the soloist. */}
          {solo !== null && (
            <div style={{ position: 'absolute', left: geo.members[solo].x - geo.memberW * 0.9, top: geo.top, width: geo.memberW * 1.8, height: geo.members[solo].y - geo.top + geo.memberW * 1.3, background: 'linear-gradient(rgba(255,250,200,.05), rgba(255,250,200,.45))', clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0 100%)', pointerEvents: 'none' }} />
          )}
          {/* The band: real buttons so they're tappable and countable. */}
          {BAND.map((m, i) => (
            <button
              key={m.id}
              data-poke="member"
              data-i={i}
              aria-label={`${m.name}, ${m.instrument}`}
              onClick={(e) => e.detail === 0 && poke('member', i)}
              style={{ position: 'absolute', left: geo.members[i].x - geo.memberW / 2, top: geo.members[i].y - geo.memberW * 0.1, width: geo.memberW, height: geo.memberW * 1.3, padding: 0, border: 'none', background: 'none' }}
            >
              <div
                ref={(el) => void (memberEls.current[i] = el)}
                style={{ position: 'relative', width: '100%', height: '100%', transformOrigin: '50% 100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', filter: solo === i ? 'drop-shadow(0 0 12px #FFF2A8)' : undefined }}
              >
                <Member id={m.id} h={geo.memberW * 1.25} refs={pups[i]} />
                {solos.includes(i) && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', right: -6, top: -6, pointerEvents: 'none' }}>
                    <StarFace size={Math.max(30, geo.memberW * 0.3)} />
                  </motion.div>
                )}
              </div>
            </button>
          ))}
          {/* Lupa, front and center (at the picnic she's on the blanket instead). */}
          <button
            hidden={stage === 'picnic'}
            data-poke="member"
            data-i={LUPA}
            aria-label="Lupa"
            onClick={(e) => e.detail === 0 && poke('member', LUPA)}
            style={{ position: 'absolute', left: geo.lupa.x - geo.lupa.w / 2, top: geo.lupa.y - geo.lupa.w * 1.25, width: geo.lupa.w, height: geo.lupa.w * 1.25, padding: 0, border: 'none', background: 'none', zIndex: 2 }}
          >
            <div ref={(el) => void (memberEls.current[LUPA] = el)} style={{ width: '100%', height: '100%', transformOrigin: '50% 100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', filter: stage === 'lupa' || stage === 'high' ? 'drop-shadow(0 0 14px #FFF2A8)' : undefined }}>
              <Lupa ref={pups[LUPA]} height={`${geo.lupa.w * 1.25}px`} />
            </div>
          </button>
          {/* The wishing star from Trevi floats down to Lupa. */}
          <AnimatePresence>
            {stage === 'star' && !starTapped && (
              <motion.button
                data-tap
                aria-label="Wishing star"
                className="world-glow"
                initial={{ y: -geo.H * 0.6, opacity: 0 }}
                animate={{ y: 0, opacity: 1, rotate: [0, 12, -12, 0] }}
                exit={{ scale: 3, opacity: 0 }}
                transition={{ y: { duration: 2.2, ease: 'easeOut' }, rotate: { repeat: Infinity, duration: 1.6 } }}
                onClick={() => {
                  if (starTapped) return
                  sounds.sparkle()
                  burst()
                  setStarTapped(true)
                  act(LUPA, 'cheer')
                  setPrompt(O.brave)
                  later(2300, () => {
                    g.current.brave = 0
                    setLupa(true, 1)
                    setStage('lupa')
                  })
                }}
                style={{ position: 'absolute', left: geo.lupa.x - 52, top: geo.lupa.y - geo.lupa.w * 1.25 - 116, width: 104, height: 104, borderRadius: '50%', border: 'none', background: 'none', padding: 0, display: 'grid', placeItems: 'center', zIndex: 4 }}
              >
                <StarFace size={100} glow />
              </motion.button>
            )}
          </AnimatePresence>
          {/* The audience: the backs of heads in the front row. They stand up for forte and do the wave. */}
          {geo.crowd.map((c, i) => (
            <motion.div
              key={`${i}-${wave}`}
              data-poke="crowd"
              data-i={i}
              animate={wave ? { y: [0, 0, -c.r * 1.3, 0] } : { y: -crowdUp * c.r * 0.6 }}
              transition={wave ? { duration: 0.9, delay: i * 0.08, times: [0, 0.01, 0.5, 1] } : { type: 'spring' }}
              style={{ position: 'absolute', left: c.x - c.r, top: c.y - c.r, zIndex: 3 }}
            >
              <CrowdHead i={i} size={c.r * 2} />
              {cheer?.i === i && (
                <motion.span key={cheer.n} initial={{ y: 0, opacity: 1 }} animate={{ y: -50, opacity: 0 }} transition={{ duration: 1.2 }} style={{ position: 'absolute', left: '50%', top: -10, translate: '-50% 0', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textShadow: `0 2px 0 ${INK}` }}>
                  Bravo!
                </motion.span>
              )}
            </motion.div>
          ))}
          {/* Sparkle in the front row, in her Venice mask spirit: she cheers when poked. */}
          <div data-poke="sparkle" style={{ position: 'absolute', right: geo.W * 0.02, bottom: 0, zIndex: 4 }}>
            <SparklePuppet ref={sparkle} height={`${Math.max(100, geo.memberW * 1.2)}px`} lookToward={-0.6} />
          </div>
          {/* Podium. */}
          <div style={{ position: 'absolute', left: geo.podium.x - geo.memberW * 0.45, top: geo.podium.y - geo.memberW * 0.3, zIndex: 3 }}>
            <Podium w={geo.memberW * 0.9} h={geo.H - geo.podium.y + geo.memberW * 0.3} />
          </div>
          {/* Roses fly onto the stage: tap to catch. */}
          {roses.map((i) => (
            <motion.button
              key={i}
              data-tap
              aria-label="Rose"
              initial={{ x: geo.W / 2, y: geo.H }}
              animate={{ x: geo.W * (0.18 + i * 0.16), y: geo.stageBack + 20 + (i % 2) * 40, rotate: [0, 360] }}
              transition={{ duration: 1.1, delay: i * 0.18, ease: 'easeOut' }}
              onClick={() => catchRose(i)}
              style={{ position: 'absolute', left: -44, top: -44, width: 88, height: 88, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.25)', padding: 0, display: 'grid', placeItems: 'center', zIndex: 5 }}
            >
              <Rose size={62} />
            </motion.button>
          ))}
          {/* The Frecce Tricolori's smoke: green, white and red where she sweeps the wand. */}
          <svg width={geo.W} height={geo.H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6 }}>
            {['#2E9E5B', '#FFFFFF', '#D8343C'].map((c, k) => (
              <polyline key={c} ref={(el) => void (skyEls.current[k] = el)} fill="none" stroke={c} strokeWidth={Math.max(10, geo.memberW * 0.15)} strokeLinecap="round" strokeLinejoin="round" opacity={stage === 'sky' || stage === 'picnic' ? 0.9 : 0} />
            ))}
            <polyline ref={trailEl} fill="none" stroke="#FFF2A8" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
          </svg>
          {stage === 'sky' &&
            [0, 1, 2].map((k) => (
              <div key={k} ref={(el) => void (jetEls.current[k] = el)} style={{ position: 'absolute', left: -36, top: -14, zIndex: 7, pointerEvents: 'none' }}>
                <Jet size={72} />
              </div>
            ))}
          <AnimatePresence>
            {flag && stage === 'sky' && (
              <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: [0, 3, -3, 0] }} transition={{ rotate: { repeat: Infinity, duration: 2 } }} style={{ position: 'absolute', left: geo.W / 2, top: geo.standsTop, translate: '-50% -50%', zIndex: 8, pointerEvents: 'none' }}>
                <Flag id="italy" width={Math.min(geo.W * 0.32, 320)} />
              </motion.div>
            )}
          </AnimatePresence>
          {/* The wand (pointer-events none: the stage under it gets the touches). */}
          <div ref={wandEl} aria-hidden style={{ position: 'absolute', left: 0, top: 0, zIndex: 9, pointerEvents: 'none', transformOrigin: '0 0' }}>
            <div style={{ position: 'absolute', left: -5, top: 6, width: 10, height: Math.max(70, geo.memberW * 0.75), background: '#FFF7F0', border: `3px solid ${INK}`, borderRadius: 6 }} />
            <div style={{ position: 'absolute', left: -7, top: Math.max(70, geo.memberW * 0.75) - 12, width: 14, height: 22, background: '#FF8FB8', border: `3px solid ${INK}`, borderRadius: 7 }} />
            <motion.div animate={nudge || stage === 'candles' ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ repeat: nudge || stage === 'candles' ? Infinity : 0, duration: 1 }} style={{ position: 'absolute', left: -24, top: -24 }}>
              <StarFace size={48} glow />
            </motion.div>
          </div>
          {/* Up arrow for the high note. */}
          {stage === 'high' && (
            <motion.div animate={{ y: [0, -24, 0] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', left: geo.W * 0.82, top: geo.standsTop, fontSize: 64, color: '#FFE27A', fontWeight: 700, pointerEvents: 'none', zIndex: 8, textShadow: `0 3px 0 ${INK}` }}>
              ↑
            </motion.div>
          )}
          {/* Picnic: a pizza Margherita, gelato for everyone, and a hug for Lupa. */}
          {stage === 'picnic' && (
            <motion.div
              initial={{ y: geo.H * 0.4 }}
              animate={{ y: 0 }}
              style={{ position: 'absolute', left: geo.W * 0.08, right: geo.W * 0.08, top: geo.stageFront - geo.memberW * 0.2, bottom: geo.H * 0.03, background: 'repeating-conic-gradient(#E8574F 0 25%, #FFF7F0 0 50%) 0 0 / 60px 60px', border: `5px solid ${INK}`, borderRadius: 24, zIndex: 10, display: 'flex', justifyContent: 'space-evenly', alignItems: 'flex-end', paddingBottom: '2%' }}
            >
              <Pizza size={Math.max(88, geo.memberW * 0.95)} />
              <motion.button data-tap aria-label="Hug Lupa" className="world-glow" whileTap={{ scale: 0.9 }} onClick={hug} style={{ border: 'none', background: 'none', padding: 0, borderRadius: 24, minWidth: 96 }}>
                <Lupa ref={picnicLupa} height={`${Math.max(130, geo.memberW * 1.45)}px`} />
              </motion.button>
              <Gelato size={Math.max(88, geo.memberW * 0.9)} />
            </motion.div>
          )}
        </>
      )}
      {stage !== 'story' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 16px', pointerEvents: 'none', zIndex: 11 }}>
          <div style={{ pointerEvents: 'auto' }} data-tap>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}
      {frozen && conducting && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', right: 16, bottom: 16, background: '#fff', border: `4px solid ${INK}`, borderRadius: 999, padding: '4px 16px', fontWeight: 700, zIndex: 11, pointerEvents: 'none' }}>
          ❄️ freeze!
        </motion.div>
      )}
      {stage === 'story' && <StoryBeat lines={O.story} friend={<Lupa height="100%" />} onDone={() => setStage('candles')} />}
    </div>
  )
}
