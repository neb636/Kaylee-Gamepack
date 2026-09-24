import { motion } from 'motion/react'
import { createContext, useContext, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

type Registry = Map<string, HTMLElement>
const DragContext = createContext<Registry | null>(null)

/** Wrap draggable items and their drop zones in one DragArea. */
export function DragArea({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const zones = useRef<Registry>(new Map())
  return (
    <DragContext.Provider value={zones.current}>
      <div style={{ position: 'relative', ...style }}>{children}</div>
    </DragContext.Provider>
  )
}

/** A place things can be dropped (a basket, a teapot, a unicorn's mouth...). */
export function DropZone({ id, children, style }: { id: string; children?: ReactNode; style?: CSSProperties }) {
  const zones = useContext(DragContext)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!zones || !ref.current) return
    zones.set(id, ref.current)
    return () => {
      zones.delete(id)
    }
  }, [zones, id])
  return (
    <div ref={ref} data-dropzone={id} style={style}>
      {children}
    </div>
  )
}

export interface DraggableProps {
  children: ReactNode
  /**
   * Called when she lets go. `zoneId` is the DropZone under her finger (or null).
   * Return true to accept (then remove/move the item yourself); otherwise it springs back.
   */
  onDrop: (zoneId: string | null) => boolean | void
  /** Called on a simple tap (no drag). Handy as an easier alternative to dragging. */
  onTap?: () => void
  style?: CSSProperties
  disabled?: boolean
}

/** Something Kaylee can pick up with her finger and drag. */
export function Draggable({ children, onDrop, onTap, style, disabled }: DraggableProps) {
  const zones = useContext(DragContext)
  return (
    <motion.div
      drag={!disabled}
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={1}
      whileDrag={{ scale: 1.2, zIndex: 50 }}
      whileTap={{ scale: 1.1 }}
      onTap={() => onTap?.()}
      onDragEnd={(_, info) => {
        const x = info.point.x - window.scrollX
        const y = info.point.y - window.scrollY
        let hit: string | null = null
        zones?.forEach((el, id) => {
          const r = el.getBoundingClientRect()
          if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) hit = id
        })
        onDrop(hit)
      }}
      style={{ touchAction: 'none', cursor: disabled ? 'default' : 'grab', position: 'relative', zIndex: 1, ...style }}
    >
      {children}
    </motion.div>
  )
}
