// ?debug=1 at Baan Chang: Dad's tuning panel for the feeding greybox. Frame time and draw calls, what each trunk is
// doing, sliders for how the trunks feel (reach, chase, droop, grab distance, ...), and a button that copies the
// numbers (paste them into chang/feel.ts).
import { useEffect, useState, type RefObject } from 'react'
import type { Chang } from './chang'
import { CHANG_FEEL, type ChangFeel } from './feel'

const SLIDERS: [keyof ChangFeel & string, string, number, number, number][] = [
  ['reach', 'reach ×', 0.6, 1.6, 0.05],
  ['notice', 'notice (lengths)', 0.6, 2, 0.05],
  ['chase', 'Mali chase', 1, 14, 0.25],
  ['chaseBaby', 'Khanom chase', 1, 14, 0.25],
  ['droop', 'droop', 0, 0.12, 0.005],
  ['grab', 'grab (m)', 0.1, 0.7, 0.02],
  ['curl', 'curl (s)', 0.2, 1.5, 0.05],
  ['munch', 'munch (s)', 0.3, 2.5, 0.1],
  ['lift', 'lift (px)', 0, 90, 2],
  ['glide', 'tap glide', 1, 12, 0.5],
]

interface QA {
  stats?: Record<string, number>
  fed?: number
  holding?: string | null
  trunks?: { id: string; mode: string; full: number; chasing: boolean }[]
}

export function ChangDebug({ changRef }: { changRef: RefObject<Chang | null> }) {
  const [, tick] = useState(0)
  const [open, setOpen] = useState(true)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 400)
    return () => clearInterval(id)
  }, [])
  const qa = window.__thaiBoatQA?.() as QA | undefined
  const s = qa?.stats
  const row = { display: 'grid', gridTemplateColumns: '110px 1fr 44px', gap: 6, alignItems: 'center' } as const
  return (
    <div style={{ position: 'absolute', right: 8, top: 'calc(var(--top-clear) + 8px)', zIndex: 50, background: 'rgba(43,35,48,.82)', color: '#fff', borderRadius: 12, padding: 10, font: '12px/1.4 ui-monospace, monospace', width: 'min(340px, 92vw)', maxHeight: '60vh', overflow: 'auto', pointerEvents: 'auto' }}>
      <div onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer' }}>
        {s ? `${s.fps} fps · p95 ${s.p95} ms · ${s.calls} calls · ${Math.round((s.tris ?? 0) / 1000)}k tris` : 'starting…'} {open ? '▾' : '▸'}
      </div>
      {open && (
        <>
          <div style={{ opacity: 0.8, margin: '4px 0' }}>
            fed {qa?.fed ?? 0} · holding {qa?.holding ?? '-'} · {qa?.trunks?.map((t) => `${t.id} ${t.mode}${t.chasing ? '→' : ''} (${t.full})`).join(' · ')}
          </div>
          {SLIDERS.map(([key, label, min, max, step]) => (
            <label key={key} style={row}>
              <span>{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={CHANG_FEEL[key]}
                onChange={(e) => {
                  CHANG_FEEL[key] = Number(e.target.value)
                  changRef.current?.retune()
                  tick((n) => n + 1)
                }}
              />
              <span>{CHANG_FEEL[key]}</span>
            </label>
          ))}
          <button onClick={() => void navigator.clipboard?.writeText(JSON.stringify(CHANG_FEEL, null, 2)).catch(() => {})} style={{ marginTop: 6, borderRadius: 8, padding: '4px 10px' }}>
            Copy numbers
          </button>
        </>
      )}
    </div>
  )
}
