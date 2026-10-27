// Canada's home base: the toy-table map and the Maple Leaf Train (greybox 1, map/map.ts). She pushes the train across
// the country; at a stop, that stop's two activities pop up over the station as big round bubbles. The address bar
// follows the train (sections.ts: where it stopped). No voices yet (the full-loop gate): a short line at the bottom says
// where the train is, for Dad.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useSections } from '../../../../kit/sections'
import type { PlaceProps } from '../../../../types'
import { Anchors } from '../../../../engine3d/Anchors'
import type { AnchorInput } from '../../../../engine3d/View3D'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import type { Region } from '../../map/canada'
import { STOPS } from '../../map/canada'
import { CanadaMap, MAP_ANCHORS, type MapEvents } from '../../map/map'
import HUB_SECTIONS from './sections'

const WHERE: Record<Region, string> = {
  msa: '⛰️ Mont-Sainte-Anne',
  quebec: '🏰 Quebec City',
  ottawa: '🏒 Ottawa',
  forest: '🌲 The forests and lakes',
  prairies: '🌾 The prairies',
  rockies: '🏔️ The Rocky Mountains',
  banff: '🛶 Banff',
  bc: '🐋 Vancouver, by the Pacific Ocean',
}

export function Hub({ meta, openActivity }: PlaceProps) {
  const { start, param, enter } = useSections(HUB_SECTIONS)
  const [initial] = useState(() => ({ at: param('at') as Region, intro: !start }))
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [where, setWhere] = useState<Region>(initial.at)
  const worldRef = useRef<CanadaMap | null>(null)
  const at = useRef(initial.at)
  useEffect(() => enter('map', { at: at.current }), [])

  const events = useRef<MapEvents>({
    where: setWhere,
    stopped: (r) => {
      at.current = r
      enter('map', { at: r })
    },
    open: (id) => openActivity(id),
  })
  const ready = useRef(new Set(meta.activities.map((a) => a.id)))
  const icons = Object.fromEntries([...meta.activities, ...(meta.inTheWorks ?? [])].map((a) => [a.id, { icon: a.icon, name: a.name }]))
  icons.party = { icon: '🏒', name: 'Animal Homes + Pond Hockey' }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E3F3FF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="The train map"
        qaKey="__canadaMapQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new CanadaMap(renderer, { at: at.current, intro: initial.intro }, events.current, ready.current)}
        anchors={(input, els) => (
          <>
            <Anchors list={MAP_ANCHORS} els={els} {...input} />
            <Bubbles input={input} els={els} icons={icons} />
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(227,243,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🚂 Tap to wake the train
        </button>
      )}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
        <AnimatePresence mode="popLayout">
          <motion.div key={where} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
            {WHERE[where]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Each stop's activities, as big round bubbles over the station (the world places them while that stop is lit). */
function Bubbles({ input, els, icons }: { input: AnchorInput; els: Map<string, HTMLElement>; icons: Record<string, { icon: string; name: string }> }) {
  return (
    <>
      {STOPS.flatMap((s) => s.acts).map((id) => (
        <button
          key={id}
          ref={(el) => {
            if (el) els.set(`go:${id}`, el)
            else els.delete(`go:${id}`)
          }}
          aria-label={icons[id]?.name ?? id}
          data-anchor={`go:${id}`}
          onPointerDown={(e) => {
            e.preventDefault()
            input.onDown(e, `go:${id}`)
          }}
          onClick={(e) => e.detail === 0 && input.onKey(`go:${id}`)}
          style={{ position: 'absolute', left: 0, top: 0, display: 'none', padding: 0, border: '5px solid var(--hotpink)', borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow)', fontSize: 'clamp(34px, 5vmin, 48px)', lineHeight: 1, touchAction: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        >
          {icons[id]?.icon ?? '❓'}
        </button>
      ))}
    </>
  )
}

const PILL = {
  background: 'rgba(255,255,255,.92)',
  color: 'var(--ink)',
  borderRadius: 999,
  padding: '8px 20px',
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
}
