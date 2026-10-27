// The sled-style steering wheel on screen (the Nan drive's, now shared by any 3D country's steering): it appears centred
// where her finger went down and turns as she pushes left or right (her finger is on its rim). The world shows it,
// places it (transform), sizes it (--r) and turns it (--turn) every frame (wheel.ts `FingerWheel.draw`). <SteerHint>
// is the 👆 sliding side to side when she hasn't steered for a while.
import { motion } from 'motion/react'
import { forwardRef } from 'react'

export const SteerWheel = forwardRef<HTMLDivElement>(function SteerWheel(_, ref) {
  return (
    <div ref={ref} aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, display: 'none', pointerEvents: 'none', zIndex: 19000 }}>
      <svg
        viewBox="-50 -50 100 100"
        style={{
          position: 'absolute',
          left: 'calc(var(--r, 72px) * -1)',
          top: 'calc(var(--r, 72px) * -1)',
          width: 'calc(var(--r, 72px) * 2)',
          height: 'calc(var(--r, 72px) * 2)',
          overflow: 'visible',
          rotate: 'var(--turn, 0deg)',
          opacity: 0.92,
          filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.3))',
        }}
      >
        {/* The rim (white edged so it reads on the road, the grass and the snow), three spokes, the pink middle with a heart. */}
        <circle r={44} fill="none" stroke="#FFFFFF" strokeWidth={15} />
        <circle r={44} fill="none" stroke="#6E5C8A" strokeWidth={10} />
        <circle r={44} fill="none" stroke="#8A78A6" strokeWidth={3} strokeDasharray="5 8" />
        {[90, 210, 330].map((a) => (
          <rect key={a} x={-5} y={10} width={10} height={32} rx={4} fill="#6E5C8A" stroke="#FFFFFF" strokeWidth={2} transform={`rotate(${a})`} />
        ))}
        <circle r={17} fill="#FF4F9A" stroke="#FFFFFF" strokeWidth={4} />
        <path d="M0 8 C -11 0, -9 -9, -3.5 -8 C -1.5 -7.6, -0.5 -6, 0 -4.5 C 0.5 -6, 1.5 -7.6, 3.5 -8 C 9 -9, 11 0, 0 8 Z" fill="#FFFFFF" />
        {/* Where her hands hold it, on top: it swings round as the wheel turns. */}
        <circle cy={-44} r={8} fill="#FFC83D" stroke="#FFFFFF" strokeWidth={3} />
      </svg>
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
