// What shows while she steers the Pajero: a small see-through circle where her finger went down (Dad, 2026-11-11: the
// steering wheel looked lame; "just a circle indicator where you clicked/tapped, 50% transparent"). The steering is
// the same sled style as before (push left or right of the circle). mountain.ts places it (transform) and sizes it
// (--r, a full push) every frame, as it did the wheel; it ignores --turn.
import { forwardRef } from 'react'

export const TapCircle = forwardRef<HTMLDivElement>(function TapCircle(_, ref) {
  return (
    <div ref={ref} aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, display: 'none', pointerEvents: 'none', zIndex: 19000 }}>
      <div
        style={{
          position: 'absolute',
          left: 'calc(var(--r, 72px) * -0.4)',
          top: 'calc(var(--r, 72px) * -0.4)',
          width: 'calc(var(--r, 72px) * 0.8)',
          height: 'calc(var(--r, 72px) * 0.8)',
          boxSizing: 'border-box',
          borderRadius: '50%',
          // (White edged so it reads on the road, the grass and the wet.)
          border: '6px solid #FF4F9A',
          outline: '3px solid #FFFFFF',
          background: 'rgba(255,255,255,.35)',
          opacity: 0.5,
        }}
      />
    </div>
  )
})
