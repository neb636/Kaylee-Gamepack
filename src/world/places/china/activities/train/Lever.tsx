// The throttle: a chunky vertical lever with four notches. Drag the knob up (it clicks into each notch) or tap the lever
// to nudge it up one. `notch` is controlled by the parent (it drops back to 0 when the train brakes on its own).
import { useEffect, useRef } from 'react'
import { usePointerDrag } from '../../../../../sdk'
import { INK } from '../../puppets/ink'
import { click } from './audio'

export const NOTCHES = 4 // 0 (stopped) .. 3 (full speed)
const KNOB = 96

export function Lever({ notch, onNotch, disabled, hint, height }: { notch: number; onNotch: (n: number) => void; disabled?: boolean; hint?: boolean; height: number }) {
  const track = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const cur = useRef(notch)
  const travel = height - KNOB
  const yFor = (n: number) => travel * (1 - n / (NOTCHES - 1))

  useEffect(() => {
    cur.current = notch
    if (knob.current) knob.current.style.transform = `translateY(${yFor(notch)}px)`
  }, [notch, height])

  const set = (n: number) => {
    if (n === cur.current) return
    cur.current = n
    click(n)
    onNotch(n)
  }

  usePointerDrag(track, {
    disabled,
    threshold: 6,
    onMove: (info) => {
      const r = track.current!.getBoundingClientRect()
      const f = 1 - Math.min(1, Math.max(0, (info.y - r.top - KNOB / 2) / travel))
      const n = Math.round(f * (NOTCHES - 1))
      if (knob.current) knob.current.style.transform = `translateY(${yFor(n)}px)`
      set(n)
    },
    onEnd: () => {
      if (knob.current) knob.current.style.transform = `translateY(${yFor(cur.current)}px)`
    },
    onTap: () => set(Math.min(NOTCHES - 1, cur.current + 1)),
  })

  return (
    <div ref={track} role="button" aria-label="Throttle lever" style={{ position: 'relative', width: KNOB + 24, height, touchAction: 'none', cursor: 'pointer', flexShrink: 0 }}>
      {/* the slot */}
      <div style={{ position: 'absolute', left: '50%', top: KNOB / 2 - 4, bottom: KNOB / 2 - 4, width: 30, marginLeft: -15, borderRadius: 15, background: '#7A5A7F', border: `4px solid ${INK}`, boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.35)' }} />
      {Array.from({ length: NOTCHES }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: 4, top: yFor(i) + KNOB / 2 - 3, width: 22, height: 6, borderRadius: 3, background: i === 0 ? '#FF7B8B' : i === NOTCHES - 1 ? '#6DD08C' : '#fff', border: `2px solid ${INK}` }} />
      ))}
      <div ref={knob} style={{ position: 'absolute', left: 12, top: 0, width: KNOB, height: KNOB, willChange: 'transform', transition: 'transform 0.09s ease-out' }}>
        <button
          type="button"
          aria-label="Throttle"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #FFC2D6, #FF6F9F 70%)',
            border: `5px solid ${INK}`,
            boxShadow: hint ? '0 0 0 8px rgba(255,200,61,.9), 0 6px 0 rgba(0,0,0,.2)' : '0 6px 0 rgba(0,0,0,.2)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 40,
            padding: 0,
            cursor: 'pointer',
            animation: hint ? 'lever-hint 1s ease-in-out infinite' : undefined,
          }}
        >
          <span style={{ color: '#fff', fontWeight: 900, textShadow: `0 2px 0 ${INK}`, lineHeight: 1 }}>⬆</span>
        </button>
      </div>
      <style>{`@keyframes lever-hint { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-22px) } }`}</style>
    </div>
  )
}
