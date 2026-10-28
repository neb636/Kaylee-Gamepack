// Maple's animal book, opened from the 📒 button on the train map (and the hub's `book` section): one page per stop,
// every animal she's met in color, the ones still to find as grey shapes. Tap an animal to hear its fact again (a grey
// one gets a wiggle and a hint of where it lives). Nothing here is required: it's the collection she fills by poking.
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { say, sounds } from '../../../../sdk'
import { L } from '../lines'
import { ANIMALS, picOf, STOP_PAGES, type Animal, type Stop } from './animals'
import { useMet } from './met'

export function Book({ onClose, page: first = 'quebec' }: { onClose: () => void; page?: Stop }) {
  const met = useMet()
  const [page, setPage] = useState<Stop>(first)
  const list = ANIMALS.filter((a) => a.stop === page)
  useEffect(() => {
    sounds.whoosh()
    void say(L.book.open)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(46,34,51,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--top-clear) 12px calc(var(--safe-bottom) + 12px)' }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.7, rotate: -4, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: 'min(100%, 980px)', maxHeight: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 'clamp(12px, 2.5vmin, 24px)', borderRadius: 32, background: '#FFF6E6', border: '8px solid #C98A55', boxShadow: 'var(--shadow)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 'clamp(20px, 3.4vmin, 30px)', fontWeight: 700, flex: '1 1 auto' }}>
            📒 Maple's animals <span style={{ color: 'var(--lavender-dark)', fontSize: '0.75em' }}>{met.length} / {ANIMALS.length}</span>
          </div>
          <button aria-label="Close the book" onClick={onClose} style={{ ...ROUND, background: 'var(--pink)' }}>
            ✖️
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {STOP_PAGES.map((p) => {
            const n = ANIMALS.filter((a) => a.stop === p.id && met.includes(a.id)).length
            return (
              <button
                key={p.id}
                aria-label={p.name}
                onClick={() => {
                  sounds.pop()
                  setPage(p.id)
                }}
                style={{ ...TAB, background: page === p.id ? 'var(--hotpink)' : '#fff', color: page === p.id ? '#fff' : 'var(--ink)' }}
              >
                <span style={{ fontSize: 30 }}>{p.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {n}/{ANIMALS.filter((a) => a.stop === p.id).length}
                </span>
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: 'clamp(16px, 2.4vmin, 22px)', fontWeight: 600, color: 'var(--lavender-dark)' }}>{STOP_PAGES.find((p) => p.id === page)!.name}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(96px, 15vmin, 140px), 1fr))', gap: 12, overflowY: 'auto', minHeight: 0 }}>
          {list.map((a) => (
            <Slot key={a.id} a={a} met={met.includes(a.id)} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function Slot({ a, met }: { a: Animal; met: boolean }) {
  const [wiggle, setWiggle] = useState(0)
  const pic = picOf(a.id)
  return (
    <motion.button
      aria-label={met ? a.name : 'Still to find'}
      animate={{ rotate: wiggle ? [0, -8, 8, -4, 0] : 0, scale: wiggle ? [1, 1.08, 1] : 1 }}
      transition={{ duration: 0.45 }}
      onClick={() => {
        setWiggle((w) => w + 1)
        if (met) {
          sounds.pop()
          void say(L.book[a.id])
        } else sounds.note(2)
      }}
      style={{ aspectRatio: '1', minHeight: 88, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: 6, border: `4px solid ${met ? 'var(--gold)' : '#E6D8C4'}`, borderRadius: 22, background: met ? '#fff' : '#F3E9DA', fontFamily: 'inherit', color: 'var(--ink)' }}
    >
      <span style={{ flex: 1, minHeight: 0, width: '100%', display: 'grid', placeItems: 'center', fontSize: 'clamp(40px, 7vmin, 64px)', filter: met ? undefined : 'brightness(0) opacity(.18)' }}>
        {pic ? <img src={pic} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : a.icon}
      </span>
      <span style={{ fontSize: 'clamp(12px, 1.8vmin, 16px)', fontWeight: 600, textAlign: 'center', lineHeight: 1.1, visibility: met ? 'visible' : 'hidden' }}>{a.name}</span>
    </motion.button>
  )
}

const ROUND = { width: 64, height: 64, borderRadius: '50%', border: 'none', fontSize: 28, boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center' } as const
const TAB = { minWidth: 72, minHeight: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 20, border: 'none', boxShadow: 'var(--shadow)', fontFamily: 'inherit', padding: '4px 10px' } as const
