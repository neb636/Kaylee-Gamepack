// The island to roam, on screen (island.ts is the world): the 3D island with its tap targets, the pink flag arrow that
// points at the nearest stop without a flag after a while with nothing touched (on the stop itself when it's on
// screen, at the screen's edge pointing that way when it isn't), and Mommy's phone and the animal book (../book/).
// Greybox: no voices yet.
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { sfx } from '../../../sfx'
import type { AnimalId } from '../book/animals'
import { PhoneAndBook, type BookPhoto, type Flyer } from '../book/Book'
import { ISLAND_ANCHORS, SametIsland as World, type IslandStart } from './island'
import type { SpotId, StopId } from './layout'

interface Props {
  start: IslandStart
  /** The book open from the start (the `book` section). */
  bookOpen?: boolean
  /** She reached another beach (the address bar follows). */
  onAt(at: SpotId): void
  /** She opened a stop. */
  onOpen(stop: StopId | 'lunch' | 'sunset'): void
  /** The animals in her book changed (the address bar follows), or the book opened or closed. */
  onBook?(found: AnimalId[], open: boolean): void
  /** Her photos so far this visit (kept by the trip, so a trip to the jet ski doesn't lose them). */
  photos?: Partial<Record<AnimalId, BookPhoto>>
  onPhotos?(p: Partial<Record<AnimalId, BookPhoto>>): void
  /** Mommy's phone out or away (the address bar follows). */
  onPhone?(on: boolean): void
  /** All four flags up and the speedboat home tapped: Mommy's photo of the island (for Agong's wall). */
  onHome?(photo: string): void
}

export function IslandScreen({ start, bookOpen = false, onAt, onOpen, onBook, photos: kept, onPhotos, onPhone, onHome }: Props) {
  const [n, setN] = useState(0)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const [phone, setPhone] = useState(!!start.phone)
  const [open, setOpen] = useState(bookOpen)
  const [found, setFound] = useState<AnimalId[]>(start.book ?? [])
  const [photos, setPhotos] = useState<Partial<Record<AnimalId, BookPhoto>>>(kept ?? {})
  const [portraits, setPortraits] = useState<Partial<Record<AnimalId, string>> | null>(null)
  const [flash, setFlash] = useState(0)
  const [flyer, setFlyer] = useState<Flyer | null>(null)
  const [glow, setGlow] = useState(false)
  const [cleaned, setCleaned] = useState(0)
  const foundRef = useRef(found)
  foundRef.current = found
  const openRef = useRef(open)
  openRef.current = open
  const cb = useRef({ onAt, onOpen, onBook, onPhotos, onHome })
  cb.current = { onAt, onOpen, onBook, onPhotos, onHome }
  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, start, {
      at: (a) => cb.current.onAt(a),
      open: (s) => cb.current.onOpen(s),
      shutter: () => {
        sfx.shutter()
        setFlash((f) => f + 1)
      },
      snap: (s) => {
        const isNew = !!s.animal && !foundRef.current.includes(s.animal)
        setFlyer((f) => ({ n: (f?.n ?? 0) + 1, src: s.src, animal: s.animal, gold: s.gold, isNew }))
        if (s.animal) {
          const a = s.animal
          // A gold photo always stays; otherwise the newest one.
          setPhotos((ph) => {
            const next = ph[a]?.gold && !s.gold ? ph : { ...ph, [a]: { src: s.src, gold: s.gold } }
            cb.current.onPhotos?.(next)
            return next
          })
          if (isNew) {
            const next = [...foundRef.current, a]
            setFound(next)
            cb.current.onBook?.(next, openRef.current)
            setTimeout(() => sfx.giggle(), 300)
          }
        }
      },
      near: setGlow,
      cleaned: setCleaned,
      home: onHome ? (src) => cb.current.onHome?.(src) : undefined,
    })
    w.setHintElement(hintRef.current)
    w.requestPortraits(setPortraits)
    return w
  }
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#D5EEFA', overflow: 'clip' }}>
      <style>{CSS}</style>
      <View3D
        key={n}
        name="Koh Samet"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={ISLAND_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="isle-hint" style={{ display: 'none' }}>
              <span className="isle-flag" />
            </div>
          </>
        )}
      />
      <PhoneAndBook
        phone={phone}
        onPhone={(on) => {
          setPhone(on)
          worldRef.current?.setPhone(on)
          onPhone?.(on)
        }}
        glow={glow}
        open={open}
        onOpen={() => {
          setOpen(true)
          cb.current.onBook?.(foundRef.current, true)
        }}
        onClose={() => {
          setOpen(false)
          cb.current.onBook?.(foundRef.current, false)
        }}
        found={found}
        photos={photos}
        portraits={portraits}
        flags={start.flags}
        flash={flash}
        flyer={flyer}
        cleaned={cleaned}
      />
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); setN((v) => v + 1) }} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(213,238,250,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}>
          🏝️ Tap to wake the island
        </button>
      )}
    </div>
  )
}

const CSS = `
.isle-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 5; }
.isle-flag { position: absolute; left: -30px; top: -30px; width: 60px; height: 60px; border-radius: 50%; background: var(--hotpink); box-shadow: 0 4px 12px rgba(43,35,48,.25); animation: isle-bob 1.3s ease-in-out infinite; }
.isle-flag::before { content: ''; position: absolute; left: 22px; top: 14px; width: 4px; height: 32px; border-radius: 2px; background: #fff; }
.isle-flag::after { content: ''; position: absolute; left: 26px; top: 14px; border-left: 18px solid #fff; border-top: 8px solid transparent; border-bottom: 8px solid transparent; }
.isle-hint[data-dir="edge"] .isle-flag { animation: isle-nudge 1.1s ease-in-out infinite; }
.isle-hint[data-dir="edge"]::after { content: ''; position: absolute; left: 0; top: 0; width: 0; height: 0; transform: rotate(var(--rot, 0deg)) translateX(40px); border-left: 18px solid var(--hotpink); border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-top: -12px; }
@keyframes isle-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes isle-nudge { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
`
