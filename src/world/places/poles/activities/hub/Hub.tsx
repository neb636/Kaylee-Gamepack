// The Poles' home base: the globe (globe/globe.ts), and the map of the story, "Pebble's Long Way Home". The trail of
// pictures (stops.ts) runs down the world in story order: three chapters up north, one down south, then home (the ending). It shows
// twice, always in step: as big picture buttons joined by a dotted line (down the right edge on a wide screen, so the
// column itself reads top = north, bottom = south; along the bottom on a tall one), and on the globe as a dotted line
// with a flag at each stop and Sparkle's balloon over the next one (globe/trail.ts). The first time through, the story
// goes in order: the trail shows only the stops she has finished and the next one, and each new picture pops in as the
// one before it earns its stamp. Once every chapter's stamp is in, every picture shows and she can pick
// any game at any time. (Starting the story over puts it back in order.) Picking one rolls the globe to its pole, then
// opens it. Once the whole story is told (the ending's stamp, and the trophy that comes with it), home wears its stamp and a movie ticket joins
// the end of the trail: the real animals from the story, in the Theater. (No video plays after a chapter: it broke up
// the story.) Until he is home, Pebble stands beside Pola up north and Papa
// looks for him down south. The globe is still a toy: she spins it, drags the sun so summer and night swap between the
// poles, and pokes what lives on it. The address bar follows her (sections.ts): which side faces her and where the
// summer is. Sparkle in the corner (kit/Guide) speaks only when something is new (her first look, a new stamp, every
// stamp); the friends answer a tap in their own voices.
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { onDevice, say, useElementSize, useLandscape, type Line, useTimers } from '../../../../../sdk'
import { Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import type { PlaceProps } from '../../../../types'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import { GLOBE_ANCHORS, PolesGlobe, type GlobeEvents, type Side } from '../../globe/globe'
import { hubSfx } from '../../globe/sounds'
import HUB_SECTIONS, { type HubSection } from './sections'
import { HOME, MOVIES, trail, type Stop } from './stops'

// Per visit to the app: which friend line comes next when she taps them.
const taps = { pola: 0, pebble: 0, papa: 0, terry: 0 }
type Talker = keyof typeof taps
const isTalker = (id: string): id is Talker => id in taps
/** How long the globe takes to roll to a picked stop's pole before it opens (less when that pole already faces her). */
const GO_MS = { roll: 1150, there: 450 }

export function Hub({ meta, stamps, openActivity }: PlaceProps) {
  const timers = useTimers()
  const { start, param, enter } = useSections(HUB_SECTIONS)
  const [initial] = useState(() => {
    const section = (start ?? 'globe') as HubSection
    // (A link to one of the globe's views holds still; arriving from the map or a chapter, the globe shows the way.)
    return { section, side: param('side') as Side, summer: param('summer') as Side, arrive: !location.hash.includes('/hub') }
  })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [side, setSide] = useState<Side>(initial.side)
  const [sunOut, setSunOut] = useState(initial.section !== 'globe')
  const [summer, setSummer] = useState<Side>(initial.section !== 'globe' ? initial.summer : 'middle')
  const [going, setGoing] = useState<string | null>(null)
  const worldRef = useRef<PolesGlobe | null>(null)
  const guide = useRef<GuideHandle>(null)
  const goTimer = useRef<number>(undefined)
  // The whole story told: home (the ending) has its stamp too, and the trophy came with it.
  const { stops, next, all, told } = trail(meta, stamps)
  // The pictures she can pick: in story order the first time through (what's done, and the next one), all of them once
  // every stamp is in; with the story told, home is done and the movie ticket is next.
  const open = told ? [...stops.map((s) => (s.id === HOME ? { ...s, done: true } : s)), MOVIES] : all ? stops : stops.filter((s, i) => s.done || i === next)
  const openNext = told ? open.length - 1 : open.indexOf(stops[next])
  // A friend says it (their mouth moves on the globe), not Sparkle: no bubble in her corner.
  const friend = (l: Line) => void say(l)
  // What the address bar shows (so a copied link reproduces the moment).
  const now = useRef({ section: initial.section, side: initial.side, summer: initial.section !== 'globe' ? initial.summer : 'middle' })
  const show = () => {
    const n = now.current
    enter(n.section, n.section === 'sun' ? { side: n.side, summer: n.summer } : { side: n.side })
  }
  useEffect(show, [])
  // Sparkle speaks when something is new, once each: her first look, a new stamp (where the balloon is now), every stamp.
  useEffect(() => {
    const t = timers.later(() => {
      const id = stops[next].id
      if (told) guide.current?.once('hub:movies', L.hub.movies)
      else if (all) guide.current?.once('hub:home', L.hub.home)
      else if (stamps.length === 0) guide.current?.once('hub:welcome', L.hub.welcome)
      else if (id in L.hub.next) guide.current?.once(`hub:next:${id}`, L.hub.next[id as keyof typeof L.hub.next])
    }, 600)
    const stopWind = hubSfx.wind()
    return () => {
      clearTimeout(t)
      clearTimeout(goTimer.current)
      stopWind()
    }
  }, [])

  const events = useRef<GlobeEvents>({
    side: (s) => {
      now.current.side = s
      setSide(s)
      show()
    },
    sunOut: () => {
      now.current.section = 'sun'
      setSunOut(true)
      show()
      guide.current?.once('sunOut', L.hub.sunOut)
    },
    summer: (s) => {
      now.current.summer = s
      setSummer(s)
      if (now.current.section !== 'globe') show()
      if (s !== 'middle' && now.current.section === 'sun') guide.current?.once(`summer-${s}`, L.hub.summer[s])
    },
    poke: (id) => {
      if (isTalker(id)) {
        const lines = L.hub[id]
        friend(lines[taps[id]++ % lines.length])
      } else if (id in L.hub.pokes) guide.current?.once(`poke:${id}`, L.hub.pokes[id as keyof typeof L.hub.pokes])
    },
  })

  /** A picture on the trail: the globe rolls to its pole, then it opens. (Home before every stamp is in: the globe
   *  shows Papa still looking, and he says so.) */
  const pick = (s: Stop) => {
    if (going) return
    hubSfx.pick()
    if (s.id === MOVIES.id) {
      setGoing(s.id)
      goTimer.current = timers.later(() => openActivity('theater'), GO_MS.there)
      return
    }
    worldRef.current?.showPole(s.pole)
    if (s.id === HOME && !all) {
      worldRef.current?.cheer('papa')
      friend(L.hub.papa[0])
      return
    }
    setGoing(s.id)
    goTimer.current = timers.later(() => openActivity(s.id), now.current.side === s.pole ? GO_MS.there : GO_MS.roll)
  }

  // What she's stuck on, for Sparkle's hint (shown in her bubble, not said: the globe is a toy).
  const hint: Line = told ? L.hub.movies : all ? L.hub.home : sunOut && summer === 'middle' ? L.hub.sun : stamps.length > 0 && !sunOut && side === 'middle' ? L.hub.spin : L.hub.spots

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F6EEFF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="The globe"
        qaKey="__polesGlobeQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) =>
          new PolesGlobe(
            renderer,
            { side: now.current.side, sun: now.current.section !== 'globe', summer: now.current.summer, stops: stops.map((s) => ({ lat: s.lat, done: s.done, home: s.id === HOME })), next, arrive: initial.arrive && engine === 0 },
            events.current,
          )
        }
        anchors={(input, els) => <Anchors list={GLOBE_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(246,238,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          {onDevice('Tap to wake the globe', 'Click to wake the globe')}
        </button>
      )}
      <Trail stops={open} next={openNext} all={all} going={going} pick={pick} />
      <Guide ref={guide} hint={hint} voice={false} />
    </div>
  )
}

/** Where each picture sits along the trail's strip, `length` px long: in a straight line when they fit, zigzagging
 *  like a winding path when they don't (an iPhone: six pictures of 64 px won't fit its height in one column). */
function layout(n: number, length: number, vmin: number) {
  const size = Math.round(Math.min(100, Math.max(vmin < 500 ? 64 : 88, vmin * 0.125)))
  // (The next stop is drawn bigger: room for it at either end.)
  const big = size * 1.2
  const step = n > 1 ? Math.min(size + 26, (length - big) / (n - 1)) : 0
  const zig = step >= size + 8 ? 0 : Math.min(size * 0.8, Math.sqrt(Math.max(0, (size + 8) ** 2 - step ** 2)))
  const first = (length - step * (n - 1)) / 2
  return { size, big, zig, along: (i: number) => first + i * step }
}

/** The trail of pictures: every stop of the story at once, in order, joined by a dotted line. A finished stop wears a
 *  stamp mark; the next one is bigger, bounces, glows and has the little balloon on it. */
function Trail({ stops, next, all, going, pick }: { stops: Stop[]; next: number; all: boolean; going: string | null; pick: (s: Stop) => void }) {
  const wide = useLandscape()
  const strip = useRef<HTMLDivElement>(null)
  const box = useElementSize(strip)
  const length = wide ? box.height : box.width
  const { size, big, zig, along } = layout(stops.length, length, Math.min(window.innerWidth, window.innerHeight))
  const thick = big + zig
  // Each picture's middle, in the strip's own box. The zigzag's far side is toward the globe.
  const at = (i: number) => {
    const a = along(i)
    const c = big / 2 + (i % 2 ? zig : 0)
    return wide ? { x: thick - c, y: a } : { x: a, y: thick - c }
  }
  return (
    <div
      ref={strip}
      style={{
        position: 'absolute',
        zIndex: 20,
        pointerEvents: 'none',
        ...(wide
          ? { right: 'calc(var(--safe-right, 0px) + 10px)', top: 'var(--top-clear)', bottom: 'calc(var(--safe-bottom) + 10px)', width: thick }
          : { left: 'calc(var(--safe-left, 0px) + 10px)', right: 'calc(var(--safe-right, 0px) + 10px)', bottom: 'calc(var(--safe-bottom) + min(150px, 20vh))', height: thick }),
      }}
    >
      {length > 0 && (
        <>
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
            {[
              ['#fff', 11],
              ['#FF4F9A', 6],
            ].map(([color, w]) => (
              <polyline key={color} points={stops.map((_, i) => `${at(i).x},${at(i).y}`).join(' ')} fill="none" stroke={color as string} strokeWidth={w} strokeLinecap="round" strokeDasharray="0.1 15" />
            ))}
          </svg>
          {stops.map((s, i) => {
            const isNext = i === next
            const p = at(i)
            const home = s.id === HOME
            return (
              <motion.button
                key={s.id}
                aria-label={s.name}
                data-activity={s.id}
                data-finale={home || undefined}
                data-next={isNext || undefined}
                data-done={s.done || undefined}
                initial={{ scale: 0 }}
                animate={{ scale: going === s.id ? [1.2, 1.4, 1.2] : isNext ? 1.2 : 1, y: isNext && !going ? [0, -7, 0] : 0 }}
                transition={{ scale: going === s.id ? { repeat: Infinity, duration: 0.5 } : { delay: going ? 0 : 0.2 + i * 0.07, type: 'spring' }, y: { repeat: Infinity, duration: 1.3 } }}
                whileTap={{ scale: 0.88 }}
                className={isNext ? 'world-glow' : undefined}
                // On her finger going down, not on click: the next picture bounces and every picture shrinks under
                // her finger, so by the time she lifted it the click often landed beside the picture and she had to
                // tap again. (Enter/Space still work through click.)
                onPointerDown={(e) => {
                  if (!e.isPrimary || e.button > 0) return
                  e.preventDefault()
                  pick(s)
                }}
                onClick={(e) => e.detail === 0 && pick(s)}
                style={{
                  position: 'absolute',
                  left: p.x - size / 2,
                  top: p.y - size / 2,
                  width: size,
                  height: size,
                  zIndex: isNext ? 2 : 1,
                  pointerEvents: 'auto',
                  borderRadius: '50%',
                  // (The north's pictures on the Arctic's pale blue, the south's on Antarctica's lilac, like the globe's skies.)
                  background: s.pole === 'north' ? '#EAF7FF' : '#F1ECFF',
                  border: isNext ? '5px solid var(--gold)' : s.done ? '4px solid var(--hotpink)' : '4px solid #fff',
                  boxShadow: 'var(--shadow)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: 0,
                  touchAction: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                {s.id === MOVIES.id ? <Ticket /> : home ? <PapaWaits found={all} /> : <img src={s.img} alt="" draggable={false} style={{ width: '100%', height: '100%', borderRadius: '50%', pointerEvents: 'none' }} />}
                {s.done && <StampMark />}
                {isNext && (
                  <motion.span animate={{ y: [0, -4, 0], rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }} style={{ position: 'absolute', left: '-22%', top: '-34%', width: '52%' }}>
                    <LittleBalloon />
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </>
      )}
    </div>
  )
}

/** A finished stop's mark: a round pink stamp with a white tick, pressed on a little askew. */
function StampMark() {
  return (
    <svg viewBox="0 0 40 40" style={{ position: 'absolute', right: '-10%', bottom: '-8%', width: '44%', transform: 'rotate(-12deg)', pointerEvents: 'none' }} aria-hidden>
      <circle cx="20" cy="20" r="17" fill="#FF4F9A" stroke="#fff" strokeWidth="4" />
      <circle cx="20" cy="20" r="12.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="2 2.6" />
      <path d="M12.5 20.5l5 5.2 10-11" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Sparkle's balloon, small: it sits on the next stop's picture (the big one floats over that stop on the globe). */
function LittleBalloon() {
  return (
    <svg viewBox="0 0 40 54" style={{ display: 'block', width: '100%', filter: 'drop-shadow(0 2px 2px rgba(43,35,48,.25))' }} aria-hidden>
      <path d="M13 37l3 8M27 37l-3 8" stroke="#8A6A4A" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="20" cy="20" rx="17" ry="19" fill="#FF8FB8" stroke="#2B2330" strokeWidth="2" />
      <path d="M20 1.5c-7 4-9.500 12-9.500 18.500s2.500 14.500 9.500 18.500c7-4 9.500-12 9.500-18.500s-2.500-14.500-9.500-18.500z" fill="#D9CCFF" />
      <path d="M20 1.5c-2.600 4-3.600 12-3.600 18.500s1 14.500 3.600 18.500c2.600-4 3.600-12 3.600-18.500s-1-14.500-3.600-18.500z" fill="#FF8FB8" />
      <ellipse cx="20" cy="20" rx="17" ry="19" fill="none" stroke="#2B2330" strokeWidth="2" />
      <rect x="13.500" y="36" width="13" height="3.600" rx="1.800" fill="#FFC83D" stroke="#2B2330" strokeWidth="1.4" />
      <rect x="14" y="44" width="12" height="8.500" rx="2.400" fill="#E0A868" stroke="#2B2330" strokeWidth="1.8" />
    </svg>
  )
}

/** Home's picture: Papa, the emperor penguin, on the snow at the bottom of the world, looking up for Pebble (a heart
 *  over him once every stamp is in and the way home is open). */
function PapaWaits({ found }: { found: boolean }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '88%', height: '88%', pointerEvents: 'none' }} aria-hidden>
      <ellipse cx="50" cy="90" rx="44" ry="12" fill="#fff" stroke="#CFE3F7" strokeWidth="2" />
      <ellipse cx="38" cy="88" rx="9" ry="4.500" fill="#FFB45C" stroke="#2B2330" strokeWidth="2" />
      <ellipse cx="62" cy="88" rx="9" ry="4.500" fill="#FFB45C" stroke="#2B2330" strokeWidth="2" />
      <ellipse cx="24" cy="60" rx="7" ry="18" transform="rotate(16 24 60)" fill="#2F3146" stroke="#2B2330" strokeWidth="2.400" />
      <ellipse cx="76" cy="60" rx="7" ry="18" transform="rotate(-16 76 60)" fill="#2F3146" stroke="#2B2330" strokeWidth="2.400" />
      <ellipse cx="50" cy="56" rx="27" ry="34" fill="#2F3146" stroke="#2B2330" strokeWidth="2.600" />
      <ellipse cx="50" cy="64" rx="18.500" ry="24" fill="#fff" />
      <ellipse cx="50" cy="45" rx="13" ry="6" fill="#FFE39A" opacity=".9" />
      <ellipse cx="31.500" cy="38" rx="4.500" ry="8" fill="#FFC34D" />
      <ellipse cx="68.500" cy="38" rx="4.500" ry="8" fill="#FFC34D" />
      <circle cx="41" cy="30" r="3.400" fill="#fff" />
      <circle cx="59" cy="30" r="3.400" fill="#fff" />
      <circle cx="41.500" cy="29" r="1.900" fill="#2B2330" />
      <circle cx="59.500" cy="29" r="1.900" fill="#2B2330" />
      <path d="M45 35.500q5-4.500 10 0q-5 6-10 0z" fill="#3A3A4A" stroke="#2B2330" strokeWidth="1.200" strokeLinejoin="round" />
      <path d="M50 15.500c-3.600-6.500-12.500-2.500-9 3.800c2 3.600 6 5.600 9 8.200c3-2.600 7-4.600 9-8.200c3.500-6.300-5.400-10.300-9-3.800z" fill={found ? '#FF4F9A' : '#fff'} stroke={found ? '#fff' : '#FF8FB8'} strokeWidth="2" transform="translate(0 -11) scale(1 .9)" />
    </svg>
  )
}

/** The movie ticket at the end of the told story: a pink ticket with a play button (the Theater's real animals). */
function Ticket() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '82%', height: '82%', pointerEvents: 'none' }} aria-hidden>
      <g transform="rotate(-10 50 50)">
        <path d="M14 28h72a4 4 0 0 1 4 4v10a8 8 0 0 0 0 16v10a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V58a8 8 0 0 0 0-16V32a4 4 0 0 1 4-4z" fill="#FF8FB8" stroke="#2B2330" strokeWidth="3" strokeLinejoin="round" />
        <path d="M70 31v38" stroke="#fff" strokeWidth="2.5" strokeDasharray="4 4" />
        <circle cx="42" cy="50" r="15" fill="#fff" stroke="#2B2330" strokeWidth="2.5" />
        <path d="M37 42.5l13 7.5-13 7.5z" fill="#FF4F9A" stroke="#2B2330" strokeWidth="2" strokeLinejoin="round" />
        <path d="M80 44l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#FFC83D" stroke="#2B2330" strokeWidth="1.2" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
