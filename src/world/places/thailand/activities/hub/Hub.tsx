// Thailand's home base: Agong's house. Kaylee arrives by tuk-tuk, then walks around the street, downstairs and her
// room upstairs (deep-linkable spots, sections.ts). The 3D house is HouseView; without WebGL it's the flat house.
// Sparkle (Guide) says the few things there are to say; the family say hello themselves.
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import type { PlaceProps } from '../../../../types'
import { flag } from '../../engine/flags'
import { L } from '../../lines'
import { Debug } from './Debug'
import { Flat } from './Flat'
import { Guide, type GuideHandle } from './Guide'
import type { House, Spot, Start } from './house'
import { HouseView, type RenderMode } from './HouseView'
import HUB_SECTIONS from './sections'

// Per visit to the app: the tuk-tuk brings her the first time; after that she's back where she left off.
let arrivedThisVisit = false
let lastSpot: Spot = 'street'

export function Hub({ meta, stamps, openActivity }: PlaceProps) {
  const { start, param, enter } = useSections(HUB_SECTIONS)
  const [initial] = useState<Start>(() => ({ section: start ?? (arrivedThisVisit ? lastSpot : 'arrive'), at: param('at') || undefined, who: param('who') || undefined }))
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [arriving, setArriving] = useState(initial.section === 'arrive')
  const photo = initial.section === 'family'
  const [spot, setSpot] = useState<Spot>(initial.section === 'arrive' || initial.section === 'family' ? 'street' : initial.section)
  const houseRef = useRef<House | null>(null)
  const guide = useRef<GuideHandle>(null)
  // Read once: the address bar follows her spots and drops ?debug=1 as soon as she moves.
  const [debug] = useState(() => flag('debug') !== null)

  useEffect(() => {
    enter(initial.section, initial.at ? { at: initial.at } : initial.who ? { who: initial.who } : {})
    if (initial.section !== 'arrive') arrivedThisVisit = true
    if (initial.section !== 'arrive' && initial.section !== 'family') lastSpot = initial.section
  }, [])

  const arrived = () => {
    arrivedThisVisit = true
    setArriving(false)
    guide.current?.speak(L.house.arrive)
    guide.current?.speak(L.house.door, true)
  }
  // The flat house has no tuk-tuk ride: the arrival is a short card.
  useEffect(() => {
    if (mode !== 'flat' || !arriving) return
    const t = setTimeout(arrived, 2500)
    return () => clearTimeout(t)
  }, [mode, arriving])

  const onSpot = (s: Spot, at?: string) => {
    lastSpot = s
    setSpot(s)
    enter(s, at ? { at } : {})
    guide.current?.arrivedAt(s)
  }
  const allStamps = stamps.length >= meta.activities.length

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#A8DCFF', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <Flat spot={spot} onSpot={onSpot} photo={photo} />
      ) : (
        <HouseView key={engine} start={initial} houseRef={houseRef} onMode={setMode} events={{ onSpot, onArrived: arrived, onPoke: (id) => guide.current?.poked(id) }} />
      )}
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(168,220,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🏠 Tap to wake the house
        </button>
      )}
      {arriving && (
        <motion.button
          aria-label="Skip"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            sounds.pop()
            houseRef.current?.skipArrival()
            if (mode === 'flat') arrived()
          }}
          style={{ position: 'absolute', left: '50%', bottom: 'calc(var(--safe-bottom) + 18px)', translate: '-50% 0', minHeight: 64, padding: '0 28px', borderRadius: 999, border: '4px solid #fff', background: 'var(--lavender)', color: 'var(--ink)', fontSize: 22, fontWeight: 700, boxShadow: 'var(--shadow)', zIndex: 20 }}
        >
          Skip ⏩
        </motion.button>
      )}
      {allStamps && (
        <motion.button
          aria-label="Party"
          whileTap={{ scale: 0.88 }}
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          onClick={() => {
            sounds.pop()
            openActivity('party')
          }}
          style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 14px)', bottom: 'calc(var(--safe-bottom) + 14px)', width: 88, height: 88, borderRadius: '50%', border: '4px solid #fff', background: 'var(--butter)', fontSize: 44, boxShadow: 'var(--shadow)', zIndex: 20, opacity: meta.activities.length ? 1 : 0.85 }}
        >
          🎉
        </motion.button>
      )}
      {!photo && <Guide ref={guide} spot={spot} quiet={arriving || mode === 'lost'} />}
      {debug && <Debug houseRef={houseRef} />}
    </div>
  )
}
