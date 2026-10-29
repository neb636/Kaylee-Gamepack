// The Roblox pad over a 3D world (roam.ts): a pink thumbstick bottom left and a jump button bottom right. View3D
// mounts it hidden and shows each half when the world says so (style writes from the frame loop, no re-renders).
// While it shows, it sets --roam-left and --roam-right on the page so the corner guide (Sparkle) and corner buttons
// move out of its way.
import { forwardRef, useEffect, useImperativeHandle, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { ROAM, type RoamState } from './roam'

export interface RoamPadHandle {
  /** What shows now (null: nothing). Cheap to call every frame. */
  show(state: RoamState | null): void
}

interface Props {
  onStick: (x: number, y: number) => void
  onJump: () => void
}

const STICK = 'clamp(112px, 22vmin, 184px)'
const JUMP = 'clamp(88px, 15vmin, 128px)'
const EDGE = 20
/** Above every tap target in the world (the house and the trip legs give them depth z-indexes up to ~30000), so a
 *  thing behind a corner never takes her stick or jump. */
const PAD_Z = 50000
/** Clears the corner offsets (on unmount too: React has dropped the ref by the time View3D's cleanup runs). */
const clearOffsets = () => {
  document.documentElement.style.removeProperty('--roam-left')
  document.documentElement.style.removeProperty('--roam-right')
}

export const RoamPad = forwardRef<RoamPadHandle, Props>(function RoamPad({ onStick, onJump }, ref) {
  const stickEl = useRef<HTMLDivElement>(null)
  const knobEl = useRef<HTMLDivElement>(null)
  const jumpEl = useRef<HTMLButtonElement>(null)
  const held = useRef<{ pointer: number; cx: number; cy: number; r: number } | null>(null)
  const shown = useRef({ walk: false, jump: false })
  useEffect(() => clearOffsets, [])

  const release = () => {
    held.current = null
    if (knobEl.current) knobEl.current.style.transform = 'translate(-50%, -50%)'
    stickEl.current?.style.setProperty('--lit', '0')
    onStick(0, 0)
  }

  useImperativeHandle(ref, () => ({
    show(state) {
      const walk = !!state?.walk
      const jump = !!state?.jump
      const s = shown.current
      if (walk === s.walk && jump === s.jump) return
      if (!walk && s.walk && held.current) release()
      s.walk = walk
      s.jump = jump
      if (stickEl.current) stickEl.current.style.display = walk ? '' : 'none'
      if (jumpEl.current) jumpEl.current.style.display = jump ? '' : 'none'
      const root = document.documentElement.style
      if (walk) root.setProperty('--roam-left', `calc(${STICK} + ${EDGE}px)`)
      else root.removeProperty('--roam-left')
      if (jump) root.setProperty('--roam-right', `calc(${JUMP} + ${EDGE}px)`)
      else root.removeProperty('--roam-right')
    },
  }))

  const move = (e: ReactPointerEvent) => {
    const h = held.current
    if (!h || h.pointer !== e.pointerId) return
    let dx = e.clientX - h.cx
    let dy = e.clientY - h.cy
    const d = Math.hypot(dx, dy)
    if (d > h.r) {
      dx *= h.r / d
      dy *= h.r / d
    }
    if (knobEl.current) knobEl.current.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px))`
    onStick(dx / h.r, -dy / h.r)
  }

  return (
    <>
      <div
        ref={stickEl}
        aria-label="Walk"
        data-roam="stick"
        onPointerDown={(e) => {
          e.stopPropagation()
          const r = stickEl.current!.getBoundingClientRect()
          stickEl.current!.setPointerCapture(e.pointerId)
          held.current = { pointer: e.pointerId, cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width * ROAM.stickReach }
          stickEl.current!.style.setProperty('--lit', '1')
          move(e)
        }}
        onPointerMove={move}
        onPointerUp={(e) => held.current?.pointer === e.pointerId && release()}
        onPointerCancel={(e) => held.current?.pointer === e.pointerId && release()}
        onLostPointerCapture={(e) => held.current?.pointer === e.pointerId && release()}
        style={{
          display: 'none',
          position: 'absolute',
          left: `calc(var(--safe-left, 0px) + ${EDGE}px)`,
          bottom: `calc(var(--safe-bottom, 0px) + ${EDGE}px)`,
          width: STICK,
          height: STICK,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,.55) 0 30%, rgba(255,182,214,.5) 31% 100%)',
          border: '5px solid rgba(255,255,255,.9)',
          boxShadow: '0 4px 14px rgba(43,35,48,.22), inset 0 0 0 calc(var(--lit, 0) * 6px) rgba(255,79,154,.45)',
          zIndex: PAD_Z,
          touchAction: 'none',
        }}
      >
        {/* Four little arrows, so she sees it's for walking. */}
        <svg viewBox="-50 -50 100 100" width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.85 }}>
          {[0, 90, 180, 270].map((a) => (
            <path key={a} d="M0,-44 L-8,-33 L8,-33 Z" fill="#fff" transform={`rotate(${a})`} />
          ))}
        </svg>
        <div
          ref={knobEl}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '46%',
            height: '46%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 34%, #ff9ccb, var(--hotpink, #ff4f9a) 70%)',
            border: '5px solid #fff',
            boxShadow: '0 4px 10px rgba(43,35,48,.3)',
            pointerEvents: 'none',
          }}
        />
      </div>
      <button
        ref={jumpEl}
        aria-label="Jump"
        data-roam="jump"
        onPointerDown={(e) => {
          e.stopPropagation()
          onJump()
          const el = jumpEl.current
          if (el) {
            el.style.scale = '0.86'
            setTimeout(() => (el.style.scale = ''), 140)
          }
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onJump()
          }
        }}
        style={{
          display: 'none',
          position: 'absolute',
          right: `calc(var(--safe-right, 0px) + ${EDGE}px)`,
          bottom: `calc(var(--safe-bottom, 0px) + ${EDGE + 10}px)`,
          width: JUMP,
          height: JUMP,
          padding: 0,
          borderRadius: '50%',
          border: '5px solid #fff',
          background: 'radial-gradient(circle at 38% 32%, #fff3b8, var(--butter, #ffe27a) 70%)',
          boxShadow: '0 5px 14px rgba(43,35,48,.28)',
          zIndex: PAD_Z,
          touchAction: 'none',
          transition: 'scale .12s',
        }}
      >
        {/* A big up arrow over a little bump: jump! */}
        <svg viewBox="0 0 100 100" width="70%" height="70%" style={{ display: 'block', margin: 'auto' }}>
          <path d="M50,14 L80,48 L62,48 L62,70 L38,70 L38,48 L20,48 Z" fill="var(--hotpink, #ff4f9a)" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
          <path d="M26,86 Q50,74 74,86" fill="none" stroke="var(--hotpink, #ff4f9a)" strokeWidth="7" strokeLinecap="round" />
        </svg>
      </button>
    </>
  )
})
