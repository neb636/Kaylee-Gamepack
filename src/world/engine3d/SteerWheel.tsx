// What shows while she steers, sled style (the Nan drive, the Poles slide, Canada's bike and whales): a small
// half-see-through circle where her finger went down, and a smaller dot that follows her finger (Dad, 2026-11-11: the
// old steering wheel looked lame; on the Mac the dot shows the push the finger hides on the iPad). She pushes left or
// right of the circle to steer. The world shows it, places it (transform), sizes it (--r, a full push) and moves the
// dot (--dx, --dy: her finger from the circle, px) every frame (wheel.ts `FingerWheel.draw`). <SteerHint> is the 👆
// sliding side to side when she hasn't steered for a while.
import { motion } from 'motion/react'
import { forwardRef } from 'react'

const round = (d: string) =>
  ({
    position: 'absolute',
    left: `calc(var(--r, 72px) * -${d})`,
    top: `calc(var(--r, 72px) * -${d})`,
    width: `calc(var(--r, 72px) * ${d} * 2)`,
    height: `calc(var(--r, 72px) * ${d} * 2)`,
    boxSizing: 'border-box',
    borderRadius: '50%',
    // (White edged so it reads on the road, the grass, the water and the snow.)
    outline: '3px solid #FFFFFF',
  }) as const

export const SteerWheel = forwardRef<HTMLDivElement>(function SteerWheel(_, ref) {
  return (
    <div ref={ref} aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, display: 'none', pointerEvents: 'none', zIndex: 19000, opacity: 0.5 }}>
      {/* Where her finger went down. */}
      <div style={{ ...round('0.4'), border: '6px solid #FF4F9A', background: 'rgba(255,255,255,.35)' }} />
      {/* Where her finger is now. */}
      <div style={{ position: 'absolute', transform: 'translate3d(var(--dx, 0px), var(--dy, 0px), 0)' }}>
        <div style={{ ...round('0.15'), background: '#FF4F9A' }} />
      </div>
    </div>
  )
})

export const SteerHint = forwardRef<HTMLDivElement>(function SteerHint(_, ref) {
  return (
    <div ref={ref} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
      <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
        👆
      </motion.div>
    </div>
  )
})
