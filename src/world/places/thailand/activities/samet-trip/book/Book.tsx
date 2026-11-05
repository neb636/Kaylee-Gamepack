// Mommy's phone and Kaylee's animal book, on screen (greybox 3 of samet-trip.html). Two big buttons in the bottom-right
// corner: the pink phone (tap: the screen becomes the phone's camera, a pink frame round it; tap again to put it away)
// and the book. A photo flashes, then flies into the book (or, with no animal in it, into the phone); a new animal's
// name pops up over it ("A hornbill!") and a good photo (the animal big in the middle) gets a gold frame. The book has a
// page per beach: a lavender silhouette for each animal still to find (tap it: where to look), her photo once she has
// it (tap it: its fact), the stop's sticker in the corner once its pink flag is up, and a gold star on the book when
// it's full. Greybox: the names, hints and facts are text for now (the full loop speaks them).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../../../../../sdk'
import { sfx } from '../../../sfx'
import { ANIMALS, ANIMAL_IDS, PAGES, type AnimalId } from './animals'

export interface BookPhoto {
  src: string
  gold: boolean
}
export interface Flyer {
  n: number
  src: string
  animal: AnimalId | null
  gold: boolean
  isNew: boolean
}

const STOP_STICKER: Record<string, string> = { jetski: '🛥️', sandcastle: '🏰', snorkel: '🐠', hideseek: '🙈' }
const BTN = 'min(104px, max(76px, 12.5vmin))'
const GAP = 14

interface Props {
  phone: boolean
  onPhone(on: boolean): void
  /** An animal she hasn't snapped is near: the phone glows. */
  glow: boolean
  open: boolean
  onOpen(): void
  onClose(): void
  found: AnimalId[]
  photos: Partial<Record<AnimalId, BookPhoto>>
  portraits: Partial<Record<AnimalId, string>> | null
  flags: string[]
  flash: number
  flyer: Flyer | null
  cleaned: number
}

export function PhoneAndBook(p: Props) {
  const full = p.found.length === ANIMAL_IDS.length
  const [bump, setBump] = useState(0)
  const firstFull = useRef(full)
  useEffect(() => {
    if (p.flyer?.animal) {
      const id = setTimeout(() => setBump((b) => b + 1), 1450)
      return () => clearTimeout(id)
    }
  }, [p.flyer])
  useEffect(() => {
    if (full && !firstFull.current) {
      firstFull.current = true
      const id = setTimeout(() => sounds.fanfare(), 1600)
      return () => clearTimeout(id)
    }
  }, [full])
  return (
    <>
      <style>{CSS}</style>
      {/* The phone's camera: a pink frame round the screen and focus corners in the middle. */}
      <AnimatePresence>
        {p.phone && (
          <motion.div key="frame" className="sb-frame" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.25 }} aria-hidden>
            <div className="sb-corner tl" />
            <div className="sb-corner tr" />
            <div className="sb-corner bl" />
            <div className="sb-corner br" />
            <div className="sb-lens" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* The flash. */}
      <AnimatePresence>
        {p.flash > 0 && <motion.div key={`flash-${p.flash}`} className="sb-flash" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.45 }} aria-hidden />}
      </AnimatePresence>
      {/* The photo she just took, flying into the book (or the phone). */}
      <AnimatePresence>{p.flyer && <FlyingPhoto key={p.flyer.n} f={p.flyer} />}</AnimatePresence>
      <div className="sb-dock">
        <motion.button
          key={`book-${bump}`}
          aria-label={`Animal book, ${p.found.length} of ${ANIMAL_IDS.length}`}
          data-anchor="book"
          className="sb-btn sb-book"
          initial={bump ? { scale: 1.3, rotate: -10 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 9 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            sfx.pop()
            p.onOpen()
          }}
        >
          <BookIcon full={full} />
          <span className="sb-count">{p.found.length}</span>
          {full && <span className="sb-star">{'⭐'}</span>}
        </motion.button>
        <motion.button
          aria-label={p.phone ? "Put Mommy's phone away" : "Mommy's phone"}
          aria-pressed={p.phone}
          data-anchor="phone"
          className={`sb-btn sb-phone${p.phone ? ' on' : ''}${p.glow && !p.phone ? ' glow' : ''}`}
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            sfx.phone()
            p.onPhone(!p.phone)
          }}
        >
          <PhoneIcon on={p.phone} />
        </motion.button>
      </div>
      <AnimatePresence>{p.open && <BookPages {...p} />}</AnimatePresence>
    </>
  )
}

function FlyingPhoto({ f }: { f: Flyer }) {
  // From the middle of the screen into the book (an animal) or the phone (anything else).
  const dx = typeof window === 'undefined' ? 0 : window.innerWidth / 2 - 18 - 52 - (f.animal ? 104 + GAP : 0)
  const dy = typeof window === 'undefined' ? 0 : window.innerHeight / 2 - 18 - 52
  return (
    <motion.div
      className="sb-fly"
      initial={{ opacity: 0, scale: 0.5, x: 0, y: 0, rotate: -6 }}
      animate={{ opacity: [0, 1, 1, 0.8], scale: [0.5, 1, 1, 0.16], x: [0, 0, 0, dx], y: [0, 0, 0, dy], rotate: [-6, 3, 3, 12] }}
      exit={{ opacity: 0 }}
      transition={{ duration: f.animal ? 1.6 : 1.1, times: [0, 0.18, f.animal ? 0.72 : 0.55, 1], ease: 'easeInOut' }}
      aria-hidden
    >
      <div className={`sb-polaroid${f.gold ? ' gold' : ''}`}>
        <img src={f.src} alt="" />
      </div>
      {f.animal && (
        <motion.div className={`sb-name${f.isNew ? ' new' : ''}`} initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 12 }}>
          {f.isNew && <span className="sb-new">{'✨'}</span>}
          {ANIMALS[f.animal].name}
          {f.gold && <span className="sb-new">{'🏅'}</span>}
        </motion.div>
      )}
    </motion.div>
  )
}

function BookPages(p: Props) {
  const firstPage = Math.max(0, PAGES.findIndex((pg) => pg.animals.some((a) => !p.found.includes(a))))
  const [page, setPage] = useState(firstPage)
  const [big, setBig] = useState<AnimalId | null>(null)
  const [hint, setHint] = useState<AnimalId | null>(null)
  const pg = PAGES[page]
  return (
    <motion.div key="book" role="dialog" aria-label="Kaylee's animal book" className="sb-veil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={p.onClose}>
      <motion.div className="sb-bookcard" initial={{ scale: 0.6, rotate: -4 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.7 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} onClick={(e) => e.stopPropagation()}>
        <div className="sb-tabs" role="tablist">
          {PAGES.map((q, i) => {
            const n = q.animals.filter((a) => p.found.includes(a)).length
            return (
              <button
                key={q.id}
                role="tab"
                aria-selected={i === page}
                aria-label={q.title}
                className={`sb-tab${i === page ? ' on' : ''}`}
                style={{ background: q.paper }}
                onClick={() => {
                  sfx.pop()
                  setPage(i)
                  setBig(null)
                  setHint(null)
                }}
              >
                <span aria-hidden>{q.icon}</span>
                <span className="sb-dots" aria-hidden>
                  {q.animals.map((a, k) => (
                    <i key={a} className={k < n ? 'on' : ''} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={pg.id} className="sb-page" style={{ background: pg.paper }} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <div className="sb-title">{pg.title}</div>
            {pg.stop && p.flags.includes(pg.stop) && (
              <motion.div className="sb-sticker" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 12 }} aria-label="This beach's sticker">
                {STOP_STICKER[pg.stop]}
              </motion.div>
            )}
            <div className="sb-slots">
              {pg.animals.map((a) => {
                const has = p.found.includes(a)
                const ph = p.photos[a]
                const por = p.portraits?.[a]
                const rare = ANIMALS[a].rare
                return (
                  <motion.button
                    key={a}
                    className={`sb-slot${has ? ' has' : ''}${ph?.gold ? ' gold' : ''}${rare ? ' rare' : ''}`}
                    aria-label={has ? ANIMALS[a].name : 'An animal still to find'}
                    animate={hint === a ? { rotate: [0, -8, 7, -4, 0] } : { rotate: 0 }}
                    transition={{ duration: 0.45 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      if (has) {
                        sfx.pop()
                        setBig(a)
                      } else {
                        sfx.boop()
                        setHint(a)
                      }
                    }}
                  >
                    {has ? (
                      <>
                        <img className="sb-photo" src={ph?.src ?? por ?? ''} alt="" />
                        {por && ph && <img className="sb-mini" src={por} alt="" />}
                      </>
                    ) : por ? (
                      <div className="sb-shadow" style={{ WebkitMaskImage: `url(${por})`, maskImage: `url(${por})` }} />
                    ) : (
                      <div className="sb-q">?</div>
                    )}
                    {rare && !has && <span className="sb-sparkle">{'✨'}</span>}
                    {hint === a && !has && <span className="sb-hint">{ANIMALS[a].where}</span>}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
        <button
          className="sb-close"
          aria-label="Close the book"
          onClick={() => {
            sfx.pop()
            p.onClose()
          }}
        >
          {'✓'}
        </button>
      </motion.div>
      <AnimatePresence>
        {big && (
          <motion.button
            key={big}
            className="sb-big"
            aria-label="Close photo"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              setBig(null)
            }}
          >
            <div className={`sb-polaroid${p.photos[big]?.gold ? ' gold' : ''}`}>
              <img src={p.photos[big]?.src ?? p.portraits?.[big] ?? ''} alt="" />
            </div>
            <div className="sb-fact">
              <b>{ANIMALS[big].name}</b> {ANIMALS[big].fact}
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PhoneIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width="70%" height="70%" aria-hidden>
      <rect x="27" y="10" width="46" height="80" rx="11" fill={on ? '#fff' : '#FF5FA8'} stroke="#2B2330" strokeWidth="5" />
      <rect x="34" y="20" width="32" height="54" rx="5" fill={on ? '#FFD0E5' : '#BDE8FF'} stroke="#2B2330" strokeWidth="3" />
      <circle cx="50" cy="47" r="10" fill="#fff" stroke="#2B2330" strokeWidth="3" />
      <circle cx="50" cy="47" r="4.5" fill="#2B2330" />
      <circle cx="50" cy="82" r="3.5" fill="#2B2330" />
      {on && <path d="M78 22 L88 12 M80 34 L93 30 M78 12 L82 4" stroke="#FFD93D" strokeWidth="5" strokeLinecap="round" />}
    </svg>
  )
}

function BookIcon({ full }: { full: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width="72%" height="72%" aria-hidden>
      <path d="M14 22 Q32 14 50 24 Q68 14 86 22 L86 80 Q68 72 50 82 Q32 72 14 80 Z" fill={full ? '#FFD93D' : '#fff'} stroke="#2B2330" strokeWidth="5" strokeLinejoin="round" />
      <path d="M50 24 L50 82" stroke="#2B2330" strokeWidth="4" />
      <path d="M26 42 q6 -8 12 0 q-6 8 -12 0 Z" fill="#7ED6A7" stroke="#2B2330" strokeWidth="3" />
      <circle cx="68" cy="44" r="7" fill="#FF9DB8" stroke="#2B2330" strokeWidth="3" />
      <path d="M22 60 h18 M60 60 h18" stroke="#D9CCFF" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

const CSS = `
.sb-dock { position: absolute; right: calc(var(--safe-right, 0px) + 18px); bottom: calc(var(--safe-bottom, 0px) + 18px); display: flex; gap: ${GAP}px; z-index: 32; }
.sb-btn { position: relative; width: ${BTN}; height: ${BTN}; border-radius: 28px; border: 5px solid #fff; box-shadow: var(--shadow); padding: 0; display: grid; place-items: center; overflow: visible; }
.sb-book { background: var(--lavender); }
.sb-phone { background: #FFE3F0; }
.sb-phone.on { background: var(--hotpink); }
.sb-phone.glow { animation: sb-glow 1.2s ease-in-out infinite; }
@keyframes sb-glow { 0%, 100% { box-shadow: var(--shadow), 0 0 0 0 rgba(255, 95, 168, 0.6); transform: scale(1); } 50% { box-shadow: var(--shadow), 0 0 0 14px rgba(255, 95, 168, 0); transform: scale(1.07); } }
.sb-count { position: absolute; left: -10px; top: -10px; min-width: 40px; height: 40px; padding: 0 6px; border-radius: 20px; background: #fff; color: var(--ink); font-weight: 700; font-size: 22px; display: grid; place-items: center; box-shadow: 0 2px 6px rgba(43,35,48,.25); }
.sb-star { position: absolute; right: -12px; top: -14px; font-size: 36px; filter: drop-shadow(0 2px 3px rgba(43,35,48,.3)); }
.sb-frame { position: absolute; inset: 0; pointer-events: none; z-index: 20; border: 14px solid var(--hotpink); border-radius: 34px; box-shadow: inset 0 0 0 4px rgba(255,255,255,.85), inset 0 0 60px rgba(255, 95, 168, .25); }
.sb-corner { position: absolute; width: 56px; height: 56px; border: 6px solid rgba(255,255,255,.95); filter: drop-shadow(0 1px 2px rgba(43,35,48,.35)); }
.sb-corner.tl { left: 24%; top: 26%; border-right: none; border-bottom: none; border-radius: 14px 0 0 0; }
.sb-corner.tr { right: 24%; top: 26%; border-left: none; border-bottom: none; border-radius: 0 14px 0 0; }
.sb-corner.bl { left: 24%; bottom: 26%; border-right: none; border-top: none; border-radius: 0 0 0 14px; }
.sb-corner.br { right: 24%; bottom: 26%; border-left: none; border-top: none; border-radius: 0 0 14px 0; }
.sb-lens { position: absolute; left: 50%; top: 6px; width: 90px; height: 22px; margin-left: -45px; border-radius: 11px; background: #2B2330; opacity: .85; }
.sb-flash { position: absolute; inset: 0; background: #fff; pointer-events: none; z-index: 40; }
.sb-fly { position: absolute; left: 50%; top: 46%; width: min(56vw, 420px); margin-left: calc(min(56vw, 420px) / -2); transform-origin: center; pointer-events: none; z-index: 41; display: grid; justify-items: center; gap: 10px; translate: 0 -50%; }
.sb-polaroid { background: #fff; padding: 10px 10px 30px; border-radius: 8px; box-shadow: 0 8px 24px rgba(43,35,48,.3); width: 100%; box-sizing: border-box; }
.sb-polaroid img { display: block; width: 100%; border-radius: 4px; }
.sb-polaroid.gold { background: linear-gradient(135deg, #FFE27A, #FFC83D 45%, #FFF1B0 60%, #F2B21F); }
.sb-name { background: #fff; color: var(--ink); font-weight: 700; font-size: clamp(22px, 4vmin, 34px); padding: 8px 20px; border-radius: 999px; box-shadow: 0 4px 12px rgba(43,35,48,.25); white-space: nowrap; }
.sb-name.new { background: var(--hotpink); color: #fff; }
.sb-new { margin: 0 6px; }
.sb-veil { position: absolute; inset: 0; background: rgba(43,35,48,.35); z-index: 60; display: grid; place-items: center; padding: calc(var(--top-clear, 104px) - 20px) 12px calc(var(--safe-bottom, 0px) + 12px); }
.sb-bookcard { position: relative; width: min(980px, 100%); max-height: 100%; overflow: auto; background: #FFF7F0; border-radius: 28px; border: 6px solid var(--hotpink); box-shadow: var(--shadow); padding: clamp(10px, 2vmin, 20px); display: grid; gap: 12px; box-sizing: border-box; }
.sb-tabs { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.sb-tab { min-width: 88px; min-height: 76px; border-radius: 18px; border: 4px solid #fff; box-shadow: 0 2px 6px rgba(43,35,48,.18); font-size: 34px; display: grid; place-items: center; padding: 4px 8px; opacity: .75; }
.sb-tab.on { opacity: 1; border-color: var(--hotpink); transform: translateY(-3px); }
.sb-dots { display: flex; gap: 3px; }
.sb-dots i { width: 10px; height: 10px; border-radius: 50%; background: rgba(43,35,48,.18); }
.sb-dots i.on { background: var(--hotpink); }
.sb-page { position: relative; border-radius: 22px; padding: 14px 14px 18px; min-height: 240px; }
.sb-title { font-size: 18px; font-weight: 600; color: rgba(43,35,48,.55); text-align: center; margin-bottom: 10px; }
.sb-sticker { position: absolute; right: 10px; top: 6px; width: 64px; height: 64px; border-radius: 50%; background: #fff; display: grid; place-items: center; font-size: 36px; box-shadow: 0 3px 8px rgba(43,35,48,.22); border: 4px dashed var(--hotpink); }
.sb-slots { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(46%, 180px), 1fr)); gap: 14px; }
.sb-slot { position: relative; aspect-ratio: 4 / 3; min-height: 110px; border-radius: 18px; border: 5px dashed rgba(155, 130, 220, .55); background: rgba(255,255,255,.65); display: grid; place-items: center; padding: 6px; overflow: visible; }
.sb-slot.rare { border-color: #F2B21F; background: radial-gradient(circle at 30% 20%, #FFF7D6, rgba(255,255,255,.7)); }
.sb-slot.has { border: 6px solid #fff; background: #fff; box-shadow: 0 4px 10px rgba(43,35,48,.2); padding: 0; }
.sb-slot.has.gold { border-color: #FFC83D; box-shadow: 0 0 0 3px #F2B21F, 0 4px 12px rgba(242,178,31,.5); }
.sb-photo { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; display: block; }
.sb-mini { position: absolute; left: -14px; bottom: -14px; width: 42%; filter: drop-shadow(0 2px 3px rgba(43,35,48,.35)); }
.sb-shadow { width: 82%; height: 82%; background: #C3B4EE; -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; }
.sb-q { font-size: 56px; color: #C3B4EE; font-weight: 700; }
.sb-sparkle { position: absolute; right: 8px; top: 6px; font-size: 28px; animation: sb-tw 1.4s ease-in-out infinite; }
@keyframes sb-tw { 0%, 100% { transform: scale(.8) rotate(0); opacity: .7; } 50% { transform: scale(1.15) rotate(20deg); opacity: 1; } }
.sb-hint { position: absolute; left: 6px; right: 6px; bottom: 6px; background: rgba(255,255,255,.95); border-radius: 12px; padding: 6px 8px; font-size: 15px; font-weight: 600; color: var(--ink); box-shadow: 0 2px 6px rgba(43,35,48,.2); }
.sb-close { justify-self: center; width: 88px; height: 88px; border-radius: 50%; border: 5px solid #fff; background: var(--hotpink); color: #fff; font-size: 40px; font-weight: 700; box-shadow: var(--shadow); }
.sb-big { position: absolute; inset: 0; margin: auto; width: min(90vw, 640px); height: fit-content; background: none; border: none; padding: 0; display: grid; gap: 12px; z-index: 2; }
.sb-fact { background: #fff; border-radius: 18px; padding: 12px 16px; font-size: clamp(17px, 2.6vmin, 22px); color: var(--ink); text-align: left; box-shadow: var(--shadow); }
`
