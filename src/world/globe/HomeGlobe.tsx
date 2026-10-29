// The home globe on screen (world.ts): the 3D world behind everything, its tap targets (a button over every place,
// continent, the balloon and the whale, for VoiceOver and the tests), the pill that names what she tapped, and the soft
// fade as the balloon lands. The screen (WorldMap.tsx) says what's on it and does the talking. Loaded on demand, so the
// home screen's first paint doesn't wait for three.js.
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Anchors, type AnchorInfo } from '../engine3d/Anchors'
import { View3D, type RenderMode } from '../engine3d/View3D'
import { places as registry } from '../registry'
import { CONTINENT_SPOTS, NORTH_POLE, SPOTS, spotFromMap, type ContinentKey } from './continents'
import { HomeGlobe as World, type GlobeEvents, type GlobePlace } from './world'

export interface HomeGlobeProps {
  /** Countries she has been to (the others sparkle more). */
  visited: string[]
  /** She has had Sparkle's tea party already. */
  teaParty: boolean
  /** The place she just came back from: the globe comes round to it. */
  face?: string
  /** The full arrival spin. */
  long: boolean
  /** The part of the screen to put the globe in (between the top bar and the side buttons). */
  slot: RefObject<HTMLElement | null>
  events: GlobeEvents
}

const CONTINENT_KEYS = Object.keys(CONTINENT_SPOTS) as ContinentKey[]

/** Everything on the globe she can fly to: every country (where SPOTS puts it, else its flat map pin), the Arctic end
 *  of the Poles, and Sparkle's house for the tea party. */
function globePlaces(visited: string[], teaParty: boolean): GlobePlace[] {
  const out: GlobePlace[] = registry.map(({ meta }) => ({
    anchor: `place:${meta.id}`,
    goes: meta.id,
    look: meta.id,
    ...(SPOTS[meta.id] ?? spotFromMap(meta.mapPos.x, meta.mapPos.y)),
    label: `${meta.emoji} ${meta.name}`,
    flag: meta.flag,
    fresh: !visited.includes(meta.id),
  }))
  const poles = out.find((p) => p.goes === 'poles')
  if (poles) out.push({ ...poles, anchor: 'place:poles-north', look: 'poles-north', ...NORTH_POLE, flag: undefined })
  out.push({ anchor: 'place:home', goes: 'home', look: 'home', ...SPOTS.home, label: '🫖 Tea party', fresh: !teaParty })
  return out
}

export default function HomeGlobe({ visited, teaParty, face, long, slot, events }: HomeGlobeProps) {
  // Built once: what's on the globe doesn't change while she's looking at it.
  const [places] = useState(() => globePlaces(visited, teaParty))
  const worldRef = useRef<World | null>(null)
  const host = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const fade = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [wake, setWake] = useState(0)
  // The world calls whatever the screen's handlers are now.
  const ev = useRef(events)
  ev.current = events

  const anchors = useMemo<AnchorInfo[]>(
    () => [
      ...places.map((p) => ({ id: p.anchor, label: p.anchor === 'place:home' ? 'Tea party' : p.anchor === 'place:poles-north' ? 'The North Pole' : p.label.replace(/^\S+\s/, ''), kind: 'thing' as const })),
      ...CONTINENT_KEYS.map((k) => ({ id: `cont:${k}`, label: k, kind: 'thing' as const })),
      { id: 'balloon', label: "Sparkle's balloon", kind: 'thing' },
      { id: 'whale', label: 'The whale', kind: 'thing' },
    ],
    [places],
  )

  // Where the globe goes: the slot's box, measured against the 3D view.
  useEffect(() => {
    const measure = () => {
      const s = slot.current?.getBoundingClientRect()
      const h = host.current?.getBoundingClientRect()
      if (s && h && s.width > 0) worldRef.current?.setSlot(s.left - h.left, s.top - h.top, s.width, s.height)
    }
    const ro = new ResizeObserver(measure)
    if (slot.current) ro.observe(slot.current)
    if (host.current) ro.observe(host.current)
    window.addEventListener('resize', measure)
    // The world is built on the view's first effect; measure once it's there.
    const t = setTimeout(measure, 0)
    const raf = requestAnimationFrame(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      clearTimeout(t)
      cancelAnimationFrame(raf)
    }
  }, [slot, wake])

  return (
    <div ref={host} style={{ position: 'absolute', inset: 0 }}>
      {mode === 'webgl' ? (
        <View3D
          key={wake}
          name="The home globe"
          qaKey="__worldGlobeQA"
          worldRef={worldRef}
          onMode={setMode}
          make={(renderer) => {
            const w = new World(renderer, { places, face, long: long && wake === 0 }, {
              pick: (id) => ev.current.pick(id),
              arrive: (id) => ev.current.arrive(id),
              continent: (k) => ev.current.continent(k),
              poke: (what) => ev.current.poke(what),
              hint: () => ev.current.hint(),
            })
            w.setOverlay(label.current, fade.current)
            requestAnimationFrame(() => {
              const s = slot.current?.getBoundingClientRect()
              const h = host.current?.getBoundingClientRect()
              if (s && h && s.width > 0) w.setSlot(s.left - h.left, s.top - h.top, s.width, s.height)
            })
            return w
          }}
          anchors={(input, els) => <Anchors list={anchors} els={els} {...input} />}
        />
      ) : (
        <button
          aria-label="Wake the globe"
          onClick={() => {
            setMode('webgl')
            setWake((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 'clamp(60px, 14vmin, 140px)', background: 'transparent' }}
        >
          🌍
        </button>
      )}
      <div
        ref={label}
        aria-hidden
        style={{ position: 'absolute', left: 0, top: 0, opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none', zIndex: 20, background: '#fff', borderRadius: 999, padding: '8px 22px', fontSize: 'clamp(18px, 3.2vmin, 30px)', fontWeight: 700, color: 'var(--hotpink)', boxShadow: 'var(--shadow)', whiteSpace: 'nowrap' }}
      />
      <div ref={fade} style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none', zIndex: 30, background: 'linear-gradient(#FFE3EF, #EDE4FF)' }} />
    </div>
  )
}
