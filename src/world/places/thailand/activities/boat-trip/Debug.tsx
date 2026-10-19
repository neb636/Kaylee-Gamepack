// ?debug=1 on the boat trip: Dad's tuning panel for the greybox. Frame time and draw calls, where the boat is, the
// "finger on the water" / "grab the boat" switch, sliders for how the longtail drives and for the chase camera, and a
// button that copies the numbers (paste them into trip/vehicles/longtail.ts and bay/tune.ts).
import { useEffect, useState, type RefObject } from 'react'
import { LONGTAIL_FEEL } from '../../trip/vehicles/longtail'
import type { Bay } from './bay/bay'
import { BAY_TUNE, type Control } from './bay/tune'

type Feel = typeof LONGTAIL_FEEL
const FEEL: [keyof Feel & string, string, number, number, number][] = [
  ['top', 'top speed', 3, 20, 0.5],
  ['boost', 'VROOM ×', 1, 3, 0.05],
  ['accel', 'speed up', 1, 15, 0.5],
  ['coast', 'coast drag', 0.05, 2, 0.05],
  ['turn', 'turn', 0.3, 3, 0.05],
  ['grip', 'grip (drift)', 0.3, 8, 0.1],
  ['far', 'finger far', 8, 50, 1],
  ['dead', 'straight zone', 0, 0.6, 0.02],
  ['lean', 'lean', 0, 0.5, 0.01],
]
const CAM: [keyof typeof BAY_TUNE & string, string, number, number, number][] = [
  ['fov', 'lens (fov)', 25, 75, 1],
  ['camPitch', 'cam pitch', 5, 70, 1],
  ['camSide', 'cam side', -40, 40, 1],
  ['camLag', 'cam lag', 0.1, 2.5, 0.05],
  ['camAhead', 'cam ahead', 0, 20, 0.5],
  ['camWide', 'cam wide', 3, 20, 0.5],
  ['camDeep', 'cam deep', 3, 20, 0.5],
]

export function Debug({ bayRef }: { bayRef: RefObject<Bay | null> }) {
  const [, tick] = useState(0)
  const [open, setOpen] = useState(true)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 400)
    return () => clearInterval(id)
  }, [])
  const qa = window.__thaiBoatQA?.() as { stats?: Record<string, number>; section?: string; vehicle?: string; where?: string; speed?: number; pos?: number[] } | undefined
  const s = qa?.stats
  const row = { display: 'grid', gridTemplateColumns: '92px 1fr 40px', gap: 6, alignItems: 'center' } as const
  const control = (c: Control) => (
    <button key={c} onClick={() => ((BAY_TUNE.control = c), tick((n) => n + 1))} style={{ borderRadius: 8, padding: '6px 10px', fontWeight: 700, background: BAY_TUNE.control === c ? '#FF4F9A' : '#fff', color: BAY_TUNE.control === c ? '#fff' : '#2B2330' }}>
      {c === 'water' ? '👆 finger on water' : '✊ grab the boat'}
    </button>
  )
  return (
    <div style={{ position: 'absolute', right: 8, bottom: 8, zIndex: 50, background: 'rgba(43,35,48,.82)', color: '#fff', borderRadius: 12, padding: 10, font: '12px/1.4 ui-monospace, monospace', width: 'min(330px, 92vw)', maxHeight: '62vh', overflow: 'auto', pointerEvents: 'auto' }}>
      <div onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer' }}>
        {s ? `${s.fps} fps · p95 ${s.p95} ms · ${s.calls} calls · ${Math.round((s.tris ?? 0) / 1000)}k tris` : 'starting…'} {open ? '▾' : '▸'}
      </div>
      {open && (
        <>
          <div style={{ opacity: 0.8, margin: '4px 0' }}>{qa ? `${qa.section} · ${qa.vehicle} · ${qa.where} · ${qa.speed} m/s · [${qa.pos?.join(', ')}]` : ''}</div>
          <div style={{ display: 'flex', gap: 6, margin: '6px 0' }}>{(['water', 'grab'] as const).map(control)}</div>
          {FEEL.map(([key, label, min, max, step]) => (
            <label key={key} style={row}>
              <span>{label}</span>
              <input type="range" min={min} max={max} step={step} value={LONGTAIL_FEEL[key] as number} onChange={(e) => ((LONGTAIL_FEEL[key] as number) = Number(e.target.value), tick((n) => n + 1))} />
              <span>{LONGTAIL_FEEL[key] as number}</span>
            </label>
          ))}
          {CAM.map(([key, label, min, max, step]) => (
            <label key={key} style={row}>
              <span>{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={BAY_TUNE[key] as number}
                onChange={(e) => {
                  ;(BAY_TUNE[key] as number) = Number(e.target.value)
                  bayRef.current?.retune()
                  tick((n) => n + 1)
                }}
              />
              <span>{BAY_TUNE[key] as number}</span>
            </label>
          ))}
          <button onClick={() => void navigator.clipboard?.writeText(JSON.stringify({ feel: LONGTAIL_FEEL, camera: BAY_TUNE }, null, 2)).catch(() => {})} style={{ marginTop: 6, borderRadius: 8, padding: '4px 10px' }}>
            Copy numbers
          </button>
        </>
      )}
    </div>
  )
}
