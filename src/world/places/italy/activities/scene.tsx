// Shared bits for Venice, Etna and the opera: a background picture that covers the screen (with its own coordinates, so
// things can stand on spots in the art), the prompt row under the top bar, and the big "get my stamp" button.
import { AnimatePresence, motion } from 'motion/react'
import { useRef, type ReactNode, type RefObject } from 'react'
import { BigButton, useElementSize, useLandscape, type Line } from '../../../../sdk'
import { PromptBubble } from '../../../kit/Stage'

export interface Cover {
  box: RefObject<HTMLDivElement | null>
  W: number
  H: number
  /** The picture's size and where its top-left corner sits on screen (px). */
  bw: number
  bh: number
  ox: number
  oy: number
  landscape: boolean
}

/** The wide picture is 3:2, the tall one 2:3. `anchor` is how far down the picture is pinned when it's cropped
 *  (1 = keep the bottom on screen, where the water and the ground are). */
export function useCover(anchor = 1, zoom = 1): Cover {
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const landscape = useLandscape()
  const ratio = landscape ? 1.5 : 2 / 3
  const bw = Math.max(W, H * ratio) * zoom
  const bh = bw / ratio
  return { box, W, H, bw, bh, ox: (W - bw) / 2, oy: (H - bh) * anchor, landscape }
}

/** The instruction bubble, under the top bar (on the right on short phones, so it misses the stars). */
export function PromptRow({ prompt, H, landscape }: { prompt: { text: Line; speak: boolean } | null; H: number; landscape: boolean }) {
  if (!prompt) return null
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: H < 560 ? 'flex-end' : landscape ? 'flex-start' : 'center', padding: landscape ? '0 24px 0 max(24px, 3vw)' : '0 24px', zIndex: 50, pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>
        <PromptBubble text={prompt.text} speak={prompt.speak} />
      </div>
    </div>
  )
}

/** The big button at the end of an activity. */
export function FinishButton({ show, onDone, children }: { show: boolean; onDone: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: '50%', top: 'calc(var(--top-clear) + 8px)', translate: '-50% 0', zIndex: 60 }}>
          <BigButton ariaLabel="Get my stamp" size="xl" onClick={onDone}>
            {children}
          </BigButton>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
