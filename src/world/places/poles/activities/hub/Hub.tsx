// The Poles' home base: the globe (greybox 1, globe/globe.ts). She spins it to the Arctic and to Antarctica, then the
// sun comes out and she drags it up and down so day and night swap between the poles. Then (greybox 2, globe/extras.ts)
// a penguin or a polar bear cub turns up lost on a little iceberg, and she carries it home to its pole. The address bar
// follows her (sections.ts): which side faces her, where the summer is, and who is lost. Each activity's spot shows on
// its side of the globe (meta.ts ACTIVITY_POLE: the floes and the coats up north, the slide and the huddle down south,
// the icebergs on both), and the finale's once every stamp is in. Sparkle in the corner (kit/Guide) says what to do and
// a fact the first time she pokes something; Pola and Pebble say hello in their own voices when their side comes round.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, say, sounds, type Line } from '../../../../../sdk'
import { Guide, type GuideHandle } from '../../../../kit/Guide'
import { useLandscape } from '../../../../kit/useLandscape'
import { useSections } from '../../../../kit/sections'
import type { PlaceProps } from '../../../../types'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import type { Lost } from '../../globe/extras'
import { L } from '../../lines'
import { ACTIVITY_POLE } from '../../meta'
import { GLOBE_ANCHORS, PolesGlobe, type GlobeEvents, type Side } from '../../globe/globe'
import HUB_SECTIONS, { type HubSection } from './sections'

// Per visit to the app: the welcome, the friends' hellos, and which friend lines come next when she taps them.
let welcomed = false
const taps = { pola: 0, pebble: 0 }
const said = new Set<string>()

export function Hub({ meta, stamps, openActivity }: PlaceProps) {
  const { start, param, enter } = useSections(HUB_SECTIONS)
  const [initial] = useState(() => {
    const section = (start ?? 'globe') as HubSection
    return { section, side: (section === 'lost' ? 'middle' : param('side')) as Side, summer: param('summer') as Side, who: section === 'lost' ? (param('who') as Lost) : null }
  })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [side, setSide] = useState<Side>(initial.side)
  const [sunOut, setSunOut] = useState(initial.section !== 'globe')
  const [summer, setSummer] = useState<Side>(initial.section !== 'globe' ? initial.summer : 'middle')
  const [lost, setLost] = useState<Lost | null>(null)
  const worldRef = useRef<PolesGlobe | null>(null)
  const guide = useRef<GuideHandle>(null)
  const party = meta.activities.length > 0 && meta.activities.every((a) => stamps.includes(a.id))
  const spotsOn = (s: Side) => s !== 'middle' && meta.activities.some((a) => ACTIVITY_POLE[a.id] === s || ACTIVITY_POLE[a.id] === 'both')
  // A friend says it (their mouth moves on the globe), not Sparkle: no bubble in her corner.
  const friend = (l: Line) => void say(l)
  // What the address bar shows (so a copied link reproduces the moment).
  const now = useRef({ section: initial.section, side: initial.side, summer: initial.section !== 'globe' ? initial.summer : 'middle', who: initial.who ?? 'penguin' })
  const show = () => {
    const n = now.current
    enter(n.section, n.section === 'lost' ? { summer: n.summer, who: n.who } : n.section === 'sun' ? { side: n.side, summer: n.summer } : { side: n.side })
  }
  useEffect(show, [])
  useEffect(() => {
    const t = setTimeout(() => {
      if (party) guide.current?.once('party', L.hub.party)
      else if (!welcomed && initial.section === 'globe') guide.current?.speak(L.hub.welcome)
      welcomed = true
    }, 600)
    return () => clearTimeout(t)
  }, [])

  const events = useRef<GlobeEvents>({
    side: (s) => {
      now.current.side = s
      setSide(s)
      show()
      // The first time each friend's side comes round: their hello, then where to tap to play.
      if (s === 'north' && !said.has('polaHi')) {
        said.add('polaHi')
        friend(L.hub.polaHi)
      } else if (s === 'south' && !said.has('pebbleHi')) {
        said.add('pebbleHi')
        friend(L.hub.pebbleHi)
      }
      if (spotsOn(s)) guide.current?.once('spots', L.hub.spots, true)
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
    lost: (kind) => {
      setLost(kind)
      if (!kind) return
      now.current.section = 'lost'
      now.current.who = kind
      show()
      // Said the first time each one turns up; after that she knows what to do.
      guide.current?.once(`lost:${kind}`, L.hub.lost[kind], true)
    },
    saved: (kind, home) => {
      friend(home ? L.hub.home[kind] : L.hub.wrong[kind])
      if (home) burst()
    },
    poke: (id) => {
      if (id === 'pola' || id === 'pebble') {
        const lines = L.hub[id]
        friend(lines[taps[id]++ % lines.length])
      } else if (id in L.hub.pokes) guide.current?.once(`poke:${id}`, L.hub.pokes[id as keyof typeof L.hub.pokes])
    },
  })
  // What she's stuck on, for Sparkle's hint (shown in her bubble, not said: the globe is a toy).
  const hint: Line | null = lost && side === 'middle' ? L.hub.carry : !sunOut ? L.hub.spin : summer === 'middle' ? L.hub.sun : party ? L.hub.party : spotsOn(side) ? L.hub.spots : L.hub.spin

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F6EEFF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="The globe"
        qaKey="__polesGlobeQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new PolesGlobe(renderer, { side: now.current.side, sun: now.current.section !== 'globe', summer: now.current.summer, lost: now.current.section === 'lost' ? now.current.who : null }, events.current)}
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
          🌍 Tap to wake the globe
        </button>
      )}
      <Spots meta={meta} stamps={stamps} side={side} openActivity={openActivity} />
      <Guide ref={guide} hint={hint} voice={false} />
    </div>
  )
}

/** The activities on the side of the globe facing her (none from the middle: she spins to a pole to find them), and
 *  the finale once every stamp is in. A column down the right edge on a wide screen, a row above Sparkle on a tall one. */
function Spots({ meta, stamps, side, openActivity }: Pick<PlaceProps, 'meta' | 'stamps' | 'openActivity'> & { side: Side }) {
  const wide = useLandscape()
  const here = side === 'middle' ? [] : meta.activities.filter((a) => ACTIVITY_POLE[a.id] === side || ACTIVITY_POLE[a.id] === 'both')
  const party = meta.activities.length > 0 && meta.activities.every((a) => stamps.includes(a.id))
  const spots = [...here.map((a) => ({ id: a.id, icon: a.icon, name: a.name, done: stamps.includes(a.id) })), ...(party ? [{ id: 'party', icon: '🎉', name: 'The finale: Pole to Pole', done: false }] : [])]
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 20,
        pointerEvents: 'none',
        display: 'flex',
        gap: 'min(16px, 2vmin)',
        ...(wide
          ? { right: 'calc(var(--safe-right, 0px) + 16px)', top: 'var(--top-clear)', bottom: 'calc(var(--safe-bottom) + 16px)', flexDirection: 'column', justifyContent: 'center' }
          : { left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + min(150px, 20vh))', flexDirection: 'row', justifyContent: 'center' }),
      }}
    >
      <AnimatePresence>
        {spots.map((s, i) => (
          <motion.button
            key={`${side}-${s.id}`}
            aria-label={s.name}
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: s.done ? 0 : [0, -8, 0] }}
            exit={{ scale: 0 }}
            transition={{ scale: { delay: 0.25 + i * 0.08, type: 'spring' }, y: { repeat: Infinity, duration: 1.4, delay: i * 0.2 } }}
            whileTap={{ scale: 0.85 }}
            className={s.done ? undefined : 'world-glow'}
            onClick={() => {
              sounds.pop()
              openActivity(s.id)
            }}
            style={{
              pointerEvents: 'auto',
              width: 'clamp(64px, 13vmin, 118px)',
              aspectRatio: '1',
              borderRadius: '50%',
              background: s.done ? 'var(--cream)' : '#fff',
              border: s.done ? '5px dashed var(--hotpink)' : '5px solid var(--gold)',
              boxShadow: 'var(--shadow)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 'clamp(30px, 6.5vmin, 58px)',
              padding: 0,
            }}
          >
            {s.icon}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
