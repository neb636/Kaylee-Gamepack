// Mounts Agong's house in the shared 3D view (engine3d/View3D.tsx): the renderer, the frame loop, taps and drags. This file only builds the house and lays its tap targets over it.
import { useRef, type MutableRefObject } from 'react'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { ANCHORS, House, type HouseEvents, type HousePlugin, type Start } from './house'

export type { RenderMode }

interface Props {
  start: Start
  events: HouseEvents
  onMode: (mode: RenderMode) => void
  houseRef: MutableRefObject<House | null>
  /** Something the house hangs or adds (Kaylee's trip photos on the wall), with its own tap targets. */
  plugin?: () => HousePlugin
  extraAnchors?: AnchorInfo[]
}

export function HouseView({ start, events, onMode, houseRef, plugin, extraAnchors = [] }: Props) {
  // Callbacks change identity on every Hub render; the house keeps calling the latest ones.
  const ev = useRef(events)
  ev.current = events
  return (
    <View3D
      name="Agong's house"
      qaKey="__thaiHouseQA"
      worldRef={houseRef}
      onMode={onMode}
      make={(renderer) => new House(renderer, start, { onSpot: (s, at) => ev.current.onSpot(s, at), onArrived: () => ev.current.onArrived(), onPoke: (id) => ev.current.onPoke?.(id), onGreet: (id) => ev.current.onGreet?.(id) ?? false }, plugin?.() ?? null)}
      anchors={(input, els) => <Anchors list={extraAnchors.length ? [...ANCHORS, ...extraAnchors] : ANCHORS} els={els} {...input} />}
    />
  )
}
