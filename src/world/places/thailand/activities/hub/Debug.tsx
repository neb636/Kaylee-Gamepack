// ?debug=1: a tuning panel for Dad's iPad and for me. Live frame time and draw calls, where Kaylee is, sliders for the
// camera, the light bands and the outlines, and a button that copies the tuned numbers (paste them into engine/tune.ts).
import { useEffect, useState, type RefObject } from 'react'
import { TUNE, type Tune } from '../../engine/tune'
import type { House } from './house'

type NumKey = { [K in keyof Tune]: Tune[K] extends number ? K : never }[keyof Tune]
const SLIDERS: [NumKey, number, number, number][] = [
  ['insideYawWide', -10, 60, 1],
  ['insideYawTall', -10, 60, 1],
  ['insidePitch', 20, 80, 1],
  ['insideFitW', 3, 9, 0.1],
  ['insideFitD', 3, 12, 0.1],
  ['streetYaw', -30, 30, 1],
  ['streetPitch', 0, 50, 1],
  ['fov', 15, 60, 1],
  ['ambient', 0, 1, 0.01],
  ['sun', 0, 1, 0.01],
  ['outline', 0, 3, 0.05],
  ['walkSpeed', 0.5, 4, 0.1],
  ['stepsPerSecond', 1, 6, 0.1],
  ['hop', 0, 0.2, 0.01],
]

export function Debug({ houseRef }: { houseRef: RefObject<House | null> }) {
  const [, tick] = useState(0)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 400)
    return () => clearInterval(id)
  }, [])
  const qa = window.__thaiHouseQA?.() as { stats?: Record<string, number>; memory?: Record<string, number> } & Record<string, unknown> | undefined
  const s = qa?.stats
  return (
    <div style={{ position: 'absolute', left: 8, bottom: 8, zIndex: 50, background: 'rgba(43,35,48,.82)', color: '#fff', borderRadius: 12, padding: 10, font: '12px/1.4 ui-monospace, monospace', maxWidth: 'min(360px, 92vw)', maxHeight: '70vh', overflow: 'auto', pointerEvents: 'auto' }}>
      <div onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer' }}>
        {s ? `${s.fps} fps · p95 ${s.p95} ms · ${s.calls} calls · ${Math.round((s.tris ?? 0) / 1000)}k tris · dpr ${s.dpr}` : `mode: ${qa?.mode ?? '?'}`} {open ? '▾' : '▸'}
      </div>
      {open && (
        <>
          <div style={{ opacity: 0.8, margin: '4px 0' }}>{qa ? `${qa.mode} · ${qa.spot} · floor ${qa.floor} · ${qa.pose}${qa.using ? ` (${qa.using})` : ''} · [${(qa.pos as number[] | undefined)?.join(', ')}]` : ''}</div>
          {SLIDERS.map(([key, min, max, step]) => (
            <label key={key} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 44px', gap: 6, alignItems: 'center' }}>
              <span>{key}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={TUNE[key]}
                onChange={(e) => {
                  TUNE[key] = Number(e.target.value)
                  houseRef.current?.retune()
                  tick((n) => n + 1)
                }}
              />
              <span>{TUNE[key]}</span>
            </label>
          ))}
          <label style={{ display: 'grid', gridTemplateColumns: '110px 1fr 44px', gap: 6, alignItems: 'center' }}>
            <span>shadow band</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={TUNE.bands[0][0]}
              onChange={(e) => {
                const v = Number(e.target.value)
                TUNE.bands[0] = TUNE.bands[1] = [v, v * 0.86, Math.min(1, v + 0.36)]
                houseRef.current?.retune()
                tick((n) => n + 1)
              }}
            />
            <span>{TUNE.bands[0][0]}</span>
          </label>
          <button onClick={() => void navigator.clipboard?.writeText(JSON.stringify(TUNE, null, 2)).catch(() => {})} style={{ marginTop: 6, borderRadius: 8, padding: '4px 10px' }}>
            Copy numbers
          </button>
          {qa?.memory && <div style={{ opacity: 0.7, marginTop: 4 }}>{`geometries ${qa.memory.geometries} · textures ${qa.memory.textures}`}</div>}
        </>
      )}
    </div>
  )
}
