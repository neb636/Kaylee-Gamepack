// Sparkle in the corner of the 3D map: she waves as she says the few things there are to say (tap a
// bubble, a landmark's name the first time she pokes it), with the words in a bubble beside her for Dad. Tap her to
// hear the last line again. The hub (Hub.tsx) decides what she says and when.
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { lineText, SparklePuppet, type Line, type PuppetHandle } from '../../../../../sdk'

export interface GuideHandle {
  wave(): void
}

export const Guide = forwardRef<GuideHandle, { line: Line | null; onTap: () => void }>(function Guide({ line, onTap }, ref) {
  const sparkle = useRef<PuppetHandle>(null)
  useImperativeHandle(ref, () => ({ wave: () => void sparkle.current?.play('wave') }))
  return (
    <div style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 8px)', bottom: 'calc(var(--safe-bottom) + 6px)', display: 'flex', alignItems: 'flex-end', gap: 6, zIndex: 22, pointerEvents: 'none', maxWidth: 'calc(100% - 140px)' }}>
      <button
        aria-label="Sparkle"
        onClick={() => {
          void sparkle.current?.play('hop')
          onTap()
        }}
        style={{ pointerEvents: 'auto', background: 'none', border: 'none', padding: 0, width: 'min(120px, 16vh, 24vw)', height: 'min(140px, 19vh, 28vw)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      >
        <SparklePuppet ref={sparkle} height="100%" lookToward={0.4} />
      </button>
      <AnimatePresence>
        {line && (
          <motion.div
            key={lineText(line)}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ marginBottom: 'min(70px, 9vh)', background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius)', padding: '10px 16px', boxShadow: 'var(--shadow)', fontSize: 'clamp(17px, min(3vw, 3.4vh), 26px)', fontWeight: 600, lineHeight: 1.15, transformOrigin: 'bottom left' }}
          >
            {lineText(line)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
