// The loading cover over a toy map (sky.ts, Entrance): the same screen (kit/LoadingSky) as the place's loading screen (PlaceFrame), so
// the cut from it is invisible. It stays while the camera already moves behind it (the first frames hitch while the
// board's textures go up), then fades into the moving map. Taps go through it.
import { AnimatePresence, motion } from 'motion/react'
import { Mascot } from '../../../../sdk'
import { LoadingSky } from '../../../kit/LoadingSky'

export function MapCover({ show, fade }: { show: boolean; fade: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="cover"
          aria-hidden
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: fade, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, zIndex: 34, pointerEvents: 'none' }}
        >
          <LoadingSky>
            <Mascot pose="think" appear={false} />
          </LoadingSky>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
