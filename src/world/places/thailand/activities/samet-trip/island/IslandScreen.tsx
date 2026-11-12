// The island to roam, on screen (island.ts is the world): the 3D island with its tap targets, the beach puppy's
// thought bubble (a picture of the beach he's taking her to, #357 way-finding), the puppy button in the top-right corner
// that calls him (the top-left is the shell's map button again, like the rest of Thailand), the home picture at the end
// of Na Dan pier (the speedboat home, for the finale's photo), and Mommy's phone and the animal book (../book/). Sparkle sits in the corner (trip/legs/Guide.tsx): she says
// what's new (lines.ts L.samet.island, L.samet.puppy, L.samet.book), the family and the taxi driver react in their own
// voices. A hub: no idle hints spoken (the puppy comes to fetch her).
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { firstTime, type Line } from '../../../../../../sdk'
import { L } from '../../../lines'
import { sametSfx as sfx } from '../sfx/common'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { ANIMAL_IDS, type AnimalId } from '../book/animals'
import { DOCK_CORNER, PhoneAndBook, type BookPhoto, type Flyer } from '../book/Book'
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
  /** The home picture tapped at the end of Na Dan pier: off home on the speedboat (the trip is kept for next time). */
  onLeave?(): void
}

export function IslandScreen({ start, bookOpen = false, onAt, onOpen, onBook, photos: kept, onPhotos, onPhone, onHome, onLeave }: Props) {
  const [n, setN] = useState(0)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const worldRef = useRef<World | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [leave, setLeave] = useState(false)
  const guideRef = useRef<TripGuideHandle>(null)
  const speak = (l: Line) => guideRef.current?.speak(l)
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
            // Sparkle says its name (once: it's new), and when the book is full, that too.
            setTimeout(() => speak(L.samet.book.name[a]), 500)
            if (next.length === ANIMAL_IDS.length) setTimeout(() => speak(L.samet.book.full), 1700)
          }
        }
      },
      near: setGlow,
      cleaned: (c) => {
        setCleaned(c)
        if (c > 0 && firstTime('samet-clean')) speak(L.samet.island.clean)
      },
      say: speak,
      home: onHome ? (src) => cb.current.onHome?.(src) : undefined,
      leaveAsk: onLeave ? setLeave : undefined,
    })
    w.setBubbleElement(bubbleRef.current)
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
            <div ref={bubbleRef} className="pup-bubble" style={{ display: 'none' }}>
              <span className="pup-dot pup-dot-1" />
              <span className="pup-dot pup-dot-2" />
              <div className="pup-pic">
                <img alt="" />
              </div>
            </div>
          </>
        )}
      />
      <PhoneAndBook
        phone={phone}
        onPhone={(on) => {
          setPhone(on)
          worldRef.current?.setPhone(on)
          if (on && firstTime('samet-phone')) speak(L.samet.island.phone)
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
      <button
        className="isle-pup"
        aria-label="Call the puppy"
        onClick={() => {
          sfx.pop()
          worldRef.current?.callPuppy()
        }}
      >
        <PuppyFace />
      </button>
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={open} corner={DOCK_CORNER} />}
      {leave && (
        <button
          className="isle-home"
          aria-label="Go home"
          onClick={() => {
            sfx.pop()
            setLeave(false)
            onLeave?.()
          }}
        >
          <HomePicture />
        </button>
      )}
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); setN((v) => v + 1) }} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(213,238,250,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}>
          🏝️ Tap to wake the island
        </button>
      )}
    </div>
  )
}

/** The puppy button's picture (top-right): the beach puppy's face (cream, brown floppy ears, his tongue out). */
function PuppyFace() {
  return (
    <svg viewBox="0 0 64 64" style={{ width: '78%', height: '78%' }} aria-hidden>
      <ellipse cx="14" cy="30" rx="9" ry="16" fill="#C98A55" transform="rotate(14 14 30)" />
      <ellipse cx="50" cy="30" rx="9" ry="16" fill="#C98A55" transform="rotate(-14 50 30)" />
      <circle cx="32" cy="32" r="20" fill="#FFF1DC" stroke="#2B2330" strokeWidth="2.5" />
      <ellipse cx="32" cy="40" rx="10" ry="7" fill="#FFFFFF" />
      <circle cx="24" cy="29" r="3" fill="#2B2330" />
      <circle cx="40" cy="29" r="3" fill="#2B2330" />
      <ellipse cx="32" cy="36" rx="4" ry="3" fill="#3B2A26" />
      <path d="M28 41 Q32 45 36 41" stroke="#2B2330" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M30 43 Q32 50 34 43 Z" fill="#FF7FB0" />
      <path d="M20 50 L32 46 L44 50 L32 56 Z" fill="#FF8FB8" />
    </svg>
  )
}

/** The home picture at the end of the pier: the speedboat, and home (a house with a heart). */
function HomePicture() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '82%', height: '82%' }} aria-hidden>
      <path d="M20 48 L50 22 L80 48 Z" fill="#FF5FA8" stroke="#2B2330" strokeWidth="3" strokeLinejoin="round" />
      <rect x="27" y="46" width="46" height="34" rx="3" fill="#FFF6EC" stroke="#2B2330" strokeWidth="3" />
      <rect x="44" y="60" width="13" height="20" rx="2" fill="#C99A66" stroke="#2B2330" strokeWidth="2.5" />
      <path d="M36 52 c0 -4 6 -4 6 0 c0 -4 6 -4 6 0 c0 4 -6 7 -6 9 c0 -2 -6 -5 -6 -9 Z" fill="#FF5FA8" transform="translate(-4 0)" />
      <path d="M10 88 Q30 82 50 88 T90 88" stroke="#7FC8F0" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

const CSS = `
.pup-bubble { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 6; --size: 104px; }
.pup-pic { position: absolute; left: calc(var(--size) / -2); top: calc(var(--size) / -2); width: var(--size); height: var(--size); border-radius: 50%; overflow: hidden; background: #fff; border: 5px solid #fff; box-shadow: 0 0 0 3px var(--hotpink), 0 6px 14px rgba(43,35,48,.25); }
.pup-pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pup-dot { position: absolute; border-radius: 50%; background: #fff; box-shadow: 0 0 0 2px var(--hotpink); }
.pup-dot-1 { width: 16px; height: 16px; left: calc(var(--tx) * 0.62 - 8px); top: calc(var(--ty) * 0.62 - 8px); }
.pup-dot-2 { width: 10px; height: 10px; left: calc(var(--tx) * 0.82 - 5px); top: calc(var(--ty) * 0.82 - 5px); }
.isle-pup { position: absolute; top: calc(var(--safe-top, 0px) + 12px); right: calc(var(--safe-right, 0px) + 16px); width: var(--btn); height: var(--btn); border-radius: 50%; border: none; background: #fff; box-shadow: var(--shadow); display: grid; place-items: center; z-index: 50; cursor: pointer; transition: transform .12s; }
.isle-pup:active { transform: scale(.85); }
.isle-home { position: absolute; left: 50%; bottom: calc(var(--safe-bottom, 0px) + 22%); width: 132px; height: 132px; margin-left: -66px; border-radius: 50%; border: 6px solid #fff; background: #FFE3F0; box-shadow: 0 0 0 4px var(--hotpink), 0 8px 18px rgba(43,35,48,.3); display: grid; place-items: center; z-index: 40; animation: isle-home-in .5s cubic-bezier(.3,1.6,.5,1) both, isle-home-bob 1.4s ease-in-out .5s infinite; }
@keyframes isle-home-in { from { transform: scale(0); } to { transform: scale(1); } }
@keyframes isle-home-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
`
