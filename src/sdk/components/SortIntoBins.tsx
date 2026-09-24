import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { sounds } from '../sounds'
import { say } from '../speech'
import { DragArea, Draggable, DropZone } from './Drag'

export interface SortItem {
  id: string
  content: ReactNode
  /** id of the bin it belongs in. */
  bin: string
  /** Spoken when she taps it, e.g. "a snowflake". */
  say?: string
}

export interface SortBin {
  id: string
  content: ReactNode
  /** Spoken when she drops something right, e.g. "Winter!" */
  say?: string
  color?: string
}

export interface SortIntoBinsProps {
  items: SortItem[]
  bins: SortBin[]
  onDone: () => void
  /** Spoken after a wrong drop. */
  wrongHint?: string
  itemSize?: number
}

/** Drag each item into the right basket (seasons, letters, big/small, colors...). */
export function SortIntoBins({ items, bins, onDone, wrongHint = "Hmm, does it go there? Let's try another one!", itemSize = 110 }: SortIntoBinsProps) {
  const [sorted, setSorted] = useState<Record<string, string[]>>({})
  const done = Object.values(sorted).flat()
  const left = items.filter((i) => !done.includes(i.id))

  useEffect(() => {
    if (items.length > 0 && left.length === 0) {
      const t = setTimeout(onDone, 800)
      return () => clearTimeout(t)
    }
  }, [left.length, items.length, onDone])

  const drop = (item: SortItem, zone: string | null) => {
    if (!zone) return false
    if (zone === item.bin) {
      sounds.correct()
      const bin = bins.find((b) => b.id === zone)
      if (bin?.say) void say(bin.say)
      setSorted((s) => ({ ...s, [zone]: [...(s[zone] ?? []), item.id] }))
      return true
    }
    sounds.oops()
    void say(wrongHint)
    return false
  }

  return (
    <DragArea style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', minHeight: itemSize }}>
        <AnimatePresence>
          {left.map((item) => (
            <motion.div key={item.id} exit={{ scale: 0, opacity: 0 }} initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Draggable onDrop={(z) => drop(item, z)} onTap={() => item.say && void say(item.say)}>
                <div style={{ width: itemSize, height: itemSize, display: 'grid', placeItems: 'center', fontSize: itemSize * 0.6 }}>{item.content}</div>
              </Draggable>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
        {bins.map((bin) => (
          <DropZone
            key={bin.id}
            id={bin.id}
            style={{
              width: 220,
              minHeight: 220,
              borderRadius: 'var(--radius)',
              background: bin.color ?? 'var(--lavender)',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              gap: 8,
            }}
          >
            <div style={{ fontSize: 72 }}>{bin.content}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {(sorted[bin.id] ?? []).map((id) => (
                <motion.div key={id} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 44, height: 44, fontSize: 30, display: 'grid', placeItems: 'center' }}>
                  {items.find((i) => i.id === id)?.content}
                </motion.div>
              ))}
            </div>
          </DropZone>
        ))}
      </div>
    </DragArea>
  )
}
