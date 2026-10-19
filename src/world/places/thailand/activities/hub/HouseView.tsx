// Mounts Agong's house in the shared 3D view (engine/View3D.tsx): the renderer, the frame loop, taps and drags, the
// flat fallback without WebGL2. This file only builds the house and lays its tap targets over it.
import { useRef, type MutableRefObject } from 'react'
import { Anchors } from '../../engine/Anchors'
import { View3D, type RenderMode } from '../../engine/View3D'
import { ANCHORS, House, type HouseEvents, type Start } from './house'

export type { RenderMode }

interface Props {
  start: Start
  events: HouseEvents
  onMode: (mode: RenderMode) => void
  houseRef: MutableRefObject<House | null>
}

export function HouseView({ start, events, onMode, houseRef }: Props) {
  // Callbacks change identity on every Hub render; the house keeps calling the latest ones.
  const ev = useRef(events)
  ev.current = events
  return (
    <View3D
      name="Agong's house"
      qaKey="__thaiHouseQA"
      worldRef={houseRef}
      onMode={onMode}
      make={(renderer) => new House(renderer, start, { onSpot: (s, at) => ev.current.onSpot(s, at), onArrived: () => ev.current.onArrived(), onPoke: (id) => ev.current.onPoke?.(id), onGreet: (id) => ev.current.onGreet?.(id) })}
      anchors={(input, els) => <Anchors list={ANCHORS} els={els} {...input} />}
    />
  )
}
