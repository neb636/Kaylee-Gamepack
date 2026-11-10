// The world board on screen (world.ts): mounts the 3D board, lays its tap targets over the pins and the sea's toys,
// and tells WorldMap.tsx what she did. Loaded on demand (it brings three.js), so the home screen's own code stays
// small: WorldMap.tsx shows the sky while it arrives.
import { useEffect, useRef, useState } from 'react'
import { onDevice } from '../../sdk/device'
import { Anchors, type AnchorInfo } from '../engine3d/Anchors'
import { View3D, type RenderMode } from '../engine3d/View3D'
import type { ContinentId } from './geo'
import { PINS, POKE_ANCHORS, WorldBoard, type BoardEvents } from './world'

export interface BoardViewProps {
  /** Each place's name (its pin's label), by place id. A pin whose place isn't in the game yet is left out. */
  names: Record<string, string>
  /** Places whose every stamp she has: their pins wear a trophy. */
  done: string[]
  /** Where the balloon waits: the place she last flew to (null: home). */
  balloonAt: string | null
  /** She picked a place (the balloon sets off), and then: it's there. */
  onPick: (place: string) => void
  onArrive: (place: string) => void
  /** She tapped a continent, at this spot of the screen (px). */
  onContinent: (id: ContinentId, x: number, y: number) => void
  /** Any touch on the board. */
  onTouch: () => void
}

export default function BoardView({ names, done, balloonAt, onPick, onArrive, onContinent, onTouch }: BoardViewProps) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [hint, setHint] = useState(false)
  const worldRef = useRef<WorldBoard | null>(null)
  const host = useRef<HTMLDivElement>(null)
  const lastTouch = useRef(performance.now() + 4000)
  const events = useRef<BoardEvents>(null!)
  events.current = {
    pick: onPick,
    arrived: onArrive,
    continent: onContinent,
    touched: () => {
      lastTouch.current = performance.now()
      setHint(false)
      onTouch()
    },
  }
  const doneKey = done.join(',')
  useEffect(() => worldRef.current?.setPlaces(done, hint), [doneKey, hint, engine])

  useEffect(() => {
    // After ~8 s with nothing touched the animals hop in turn. No voice: she just heard the hello.
    const idle = setInterval(() => {
      if (performance.now() - lastTouch.current > 8000) setHint(true)
    }, 1000)
    // The dock floats over the board (beside it when the screen is wide, under it when tall): the board keeps clear.
    const measure = () => {
      const el = host.current
      const dock = el?.parentElement?.querySelector<HTMLElement>('.shelf-dock')
      if (!el || !dock) return worldRef.current?.setInsets(0, 0)
      const r = el.getBoundingClientRect()
      const d = dock.getBoundingClientRect()
      const beside = d.height > d.width
      worldRef.current?.setInsets(beside ? Math.max(0, r.right - d.left + 8) : 0, beside ? 0 : Math.max(0, r.bottom - d.top + 8))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (host.current) ro.observe(host.current)
    const t = setTimeout(measure, 300)
    return () => {
      clearInterval(idle)
      clearTimeout(t)
      ro.disconnect()
    }
  }, [engine])

  const pins: AnchorInfo[] = PINS.filter((p) => names[p.place]).map((p) => ({ id: p.id, label: p.label ?? names[p.place], kind: 'thing' }))
  const pokes: AnchorInfo[] = POKE_ANCHORS.map((p) => ({ ...p, kind: 'thing' }))

  return (
    <div ref={host} style={{ position: 'absolute', inset: 0, overflow: 'clip' }}>
      <View3D
        key={engine}
        name="The world board"
        qaKey="__worldBoardQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => {
          const world = new WorldBoard(renderer, { pick: (id) => events.current.pick(id), arrived: (id) => events.current.arrived(id), continent: (id, x, y) => events.current.continent(id, x, y), touched: () => events.current.touched() }, balloonAt)
          world.setPlaces(done, false)
          return world
        }}
        anchors={(input, els) => <Anchors list={[...pins, ...pokes]} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(227,243,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          {onDevice('Tap to wake the map', 'Click to wake the map')}
        </button>
      )}
    </div>
  )
}
