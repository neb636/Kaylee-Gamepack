// What the game table shows over the house: the picker (three big picture cards drawn like the game shelf's icons, the
// three cousins' faces with BB picked, a big ▶; in the Unicorn game ▶ then opens a second step, her unicorn's color:
// pictures of the four real pieces and another ▶), and while they play: the two faces
// at the sides (whoever's turn it is grows and glows), 🎲 back to the games and 👋 to get up, and a big 🔁 when someone
// has won. The faces are pictures of their real 3D selves (faces.ts; an emoji until the picture is taken). No words to
// read: pictures, faces and big targets (var(--target): 96 px on iPad, 72 px on a short iPhone).
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, type CSSProperties, type MutableRefObject } from 'react'
import { sounds, useLandscape } from '../../../../../../sdk'
import { faceCanvas } from './deck'
import { PIECE_BG } from './faces'
import { UNICORN_HEX } from './pieces'
import { COUSINS, GAMES, UNICORNS, type CousinId, type GameId } from './list'
import candyCard from './cards/candy.svg?no-inline'
import chutesCard from './cards/chutes.svg?no-inline'
import unicornCard from './cards/unicorn.svg?no-inline'
import type { TablePlugin, TableView } from './plugin'

/** Each face's ring, name, and the emoji it shows for the moment before its picture is taken. */
export const FACES: Record<CousinId | 'kaylee', { emoji: string; extra: string; ring: string; name: string }> = {
  kaylee: { emoji: '🦄', extra: '', ring: '#C9B3FF', name: 'Me' },
  bb: { emoji: '🐃', extra: '🎀', ring: '#FF8FB8', name: 'BB' },
  gan: { emoji: '🦊', extra: '🧢', ring: '#FFC2A8', name: 'Gan' },
  ken: { emoji: '🦊', extra: '👓', ring: '#8FE3C8', name: 'Ken' },
}
const CARD: Record<GameId, string> = { unicorn: unicornCard, candy: candyCard, chutes: chutesCard }

const round = (size: string, bg: string, ring: string): CSSProperties => ({ width: size, height: size, borderRadius: '50%', background: bg, border: `5px solid ${ring}`, boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', padding: 0, position: 'relative', flex: 'none' })

export function Face({ who, size, photo, active = false, crown = false }: { who: CousinId | 'kaylee'; size: string; photo?: string; active?: boolean; crown?: boolean }) {
  const f = FACES[who]
  return (
    <motion.div animate={{ scale: active ? 1.18 : 1, boxShadow: active ? `0 0 0 8px ${f.ring}88, var(--shadow)` : 'var(--shadow)' }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} style={{ ...round(size, '#fff', f.ring), fontSize: `calc(${size} * .5)`, overflow: 'visible' }}>
      {photo ? <img src={photo} alt="" draggable={false} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }} /> : <span>{f.emoji}</span>}
      {!photo && f.extra && <span style={{ position: 'absolute', right: '-6%', top: '-6%', fontSize: `calc(${size} * .3)` }}>{f.extra}</span>}
      {crown && (
        <motion.span initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ position: 'absolute', top: `calc(${size} * -.42)`, fontSize: `calc(${size} * .42)` }}>
          👑
        </motion.span>
      )}
    </motion.div>
  )
}

export function TableUI({ view, table }: { view: TableView; table: MutableRefObject<TablePlugin | null> }) {
  const t = () => table.current
  const tap = (f: () => void) => () => {
    sounds.pop()
    f()
  }
  const size = 'var(--target)'
  // The faces at the sides: halfway down on a wide screen; on a tall one up in the sky above the floating board, so they
  // never sit over its corners.
  const wide = useLandscape()
  const side: CSSProperties = { position: 'absolute', top: wide ? '50%' : 'calc(var(--safe-top) + 10px + var(--target) * 1.35)', translate: wide ? '0 -50%' : '0 0', zIndex: 30, pointerEvents: 'none' }
  const iconBtn = (bg: string): CSSProperties => ({ ...round(size, bg, '#fff'), fontSize: `calc(${size} * .45)`, cursor: 'pointer' })
  return (
    <>
      {/* Top right: back to the games, and get up from the table. */}
      <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 10px)', right: 'calc(var(--safe-right, 0px) + 14px)', display: 'flex', gap: 12, zIndex: 50 }}>
        {(!view.picking || view.step === 'color') && (
          <motion.button aria-label="Games" whileTap={{ scale: 0.85 }} onClick={tap(() => t()?.games())} style={iconBtn('var(--butter)')}>
            🎲
          </motion.button>
        )}
        <motion.button aria-label="Leave the table" whileTap={{ scale: 0.85 }} onClick={tap(() => t()?.leave())} style={iconBtn('var(--sky)')}>
          👋
        </motion.button>
      </div>

      {view.picking ? (
        view.step === 'color' ? <ColorPicker view={view} table={table} /> : <Picker view={view} table={table} />
      ) : (
        <>
          {/* Whose turn: her face on her side (left), the cousin's on theirs (right). */}
          <div style={{ ...side, left: 'calc(var(--safe-left, 0px) + 18px)' }}>
            <Face who="kaylee" size={size} photo={view.faces.kaylee} active={view.phase !== 'finished' && view.turn === 0} crown={view.winner === 0} />
          </div>
          {view.seated && (
            <div style={{ ...side, right: 'calc(var(--safe-right, 0px) + 18px)' }}>
              <Face who={view.seated} size={size} photo={view.faces[view.seated]} active={view.phase !== 'finished' && view.turn === 1} crown={view.winner === 1} />
            </div>
          )}
          {/* Candy Land: the card just drawn, big over the table, while its piece goes. */}
          <AnimatePresence>{view.card && <BigCard key={view.card + view.turn} token={view.card} />}</AnimatePresence>
          <AnimatePresence>
            {view.phase === 'finished' && (
              <motion.button
                key="again"
                aria-label="Play again"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.08, 1] }}
                exit={{ scale: 0 }}
                transition={{ scale: { repeat: Infinity, duration: 1.4 } }}
                whileTap={{ scale: 0.85 }}
                onClick={tap(() => t()?.again())}
                style={{ ...iconBtn('var(--mint)'), position: 'absolute', left: '50%', bottom: 'calc(var(--safe-bottom) + 18px)', translate: '-50% 0', width: 'calc(var(--target) * 1.25)', height: 'calc(var(--target) * 1.25)', fontSize: 'calc(var(--target) * .6)', zIndex: 40 }}
              >
                🔁
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  )
}

/** The fade between her room and the floating board: a soft pink-to-lilac glow with twinkles popping and the die
 *  spinning in the middle. It covers the screen (and takes taps) while the view changes under it. */
export function Curtain({ on, fade }: { on: boolean; fade: number }) {
  const stars = useMemo(() => Array.from({ length: 11 }, (_, i) => ({ x: 8 + ((i * 37) % 84), y: 10 + ((i * 53) % 78), s: 0.6 + ((i * 7) % 5) / 6, d: (i % 5) * 0.06 })), [])
  return (
    <AnimatePresence>
      {on && (
        <motion.div
          key="curtain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fade, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0, zIndex: 80, overflow: 'hidden', background: 'radial-gradient(circle at 50% 46%, #FFFFFF 0%, #FFE3F0 30%, #FBC7E0 62%, #D9CCFF 100%)' }}
        >
          {stars.map((st, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: st.s, rotate: 0 }}
              transition={{ delay: st.d, type: 'spring', stiffness: 260, damping: 12 }}
              style={{ position: 'absolute', left: `${st.x}%`, top: `${st.y}%`, color: i % 3 ? '#FFFFFF' : '#FFD86B', fontSize: 'calc(var(--target) * .55)', textShadow: '0 0 18px rgba(255,255,255,.9)', lineHeight: 1 }}
            >
              ✦
            </motion.span>
          ))}
          <motion.div
            initial={{ scale: 0.3, rotate: -200, y: 30 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 13 }}
            style={{ position: 'absolute', left: '50%', top: '46%', translate: '-50% -50%', fontSize: 'calc(var(--target) * 1.1)', filter: 'drop-shadow(0 10px 18px rgba(185,166,245,.6))' }}
          >
            🎲
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Picker({ view, table }: { view: TableView; table: MutableRefObject<TablePlugin | null> }) {
  const t = () => table.current
  // Wide screens: the picker sits bottom right and the camera keeps the table on the left; tall: along the bottom,
  // the table above it.
  const wide = useLandscape()
  const card = wide ? 'calc(var(--target) * 1.1)' : 'calc(var(--target) * 1.3)'
  const face = wide ? 'calc(var(--target) * .78)' : 'calc(var(--target) * .9)'
  const place: CSSProperties = wide ? { right: 'calc(var(--safe-right, 0px) + 12px)', bottom: 'calc(var(--safe-bottom) + 12px)' } : { left: '50%', bottom: 'calc(var(--safe-bottom) + 12px)', translate: '-50% 0' }
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{ position: 'absolute', ...place, zIndex: 30, background: 'rgba(255,247,240,.92)', borderRadius: 28, boxShadow: 'var(--shadow)', padding: 'clamp(10px, 2vmin, 18px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(8px, 1.6vmin, 14px)', maxWidth: 'calc(100vw - 24px)', boxSizing: 'border-box' }}
    >
      {/* The games: big picture cards. A game that isn't built yet shows, dimmed, on Dad's links only. */}
      <div style={{ display: 'flex', gap: 'clamp(8px, 1.8vmin, 16px)' }}>
        {GAMES.filter((g) => view.preview || view.offered.includes(g.id)).map((g) => {
          const on = view.offered.includes(g.id)
          const picked = view.game === g.id
          return (
            <motion.button
              key={g.id}
              aria-label={g.name}
              aria-pressed={picked}
              disabled={!on}
              whileTap={on ? { scale: 0.9 } : undefined}
              animate={{ scale: picked ? 1.06 : 1 }}
              onClick={() => {
                sounds.pop()
                t()?.chooseGame(g.id)
              }}
              style={{ width: card, height: card, borderRadius: 22, border: `6px solid ${picked ? 'var(--hotpink)' : '#fff'}`, background: '#fff', boxShadow: 'var(--shadow)', opacity: on ? 1 : 0.4, position: 'relative', padding: 0, overflow: 'hidden' }}
            >
              <img src={CARD[g.id]} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
              {!on && <span style={{ position: 'absolute', right: 4, bottom: 2, fontSize: `calc(${card} * .25)` }}>🚧</span>}
            </motion.button>
          )
        })}
      </div>
      {/* The cousins (BB first). */}
      <div style={{ display: 'flex', gap: 'clamp(10px, 2vmin, 18px)', alignItems: 'center' }}>
        {COUSINS.map((c) => (
          <button key={c} aria-label={FACES[c].name} aria-pressed={view.vs === c} onClick={() => (sounds.pop(), t()?.chooseCousin(c))} style={{ border: 'none', background: 'none', padding: 4, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 2, minWidth: 'var(--target)', minHeight: 'var(--target)' }}>
            <Face who={c} size={face} photo={view.faces[c]} active={view.vs === c} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{FACES[c].name}</span>
          </button>
        ))}
      </div>
      <PlayButton on={view.offered.includes(view.game)} table={table} />
    </motion.div>
  )
}

function PlayButton({ on, table }: { on: boolean; table: MutableRefObject<TablePlugin | null> }) {
  return (
    <motion.button
      aria-label="Play"
      disabled={!on}
      animate={{ scale: [1, 1.07, 1] }}
      transition={{ repeat: Infinity, duration: 1.3 }}
      whileTap={{ scale: 0.85 }}
      onClick={() => (sounds.pop(), table.current?.play())}
      style={{ ...round('var(--target)', 'var(--mint)', '#fff'), fontSize: 'calc(var(--target) * .5)' }}
    >
      ▶
    </motion.button>
  )
}

/** The Unicorn game's second step: which unicorn is hers. Pictures of the four real pieces (a colored 🦄 until each is
 *  taken), the picked one big with a pink ring, and ▶ to sit down and play. The cousin takes another color. */
function ColorPicker({ view, table }: { view: TableView; table: MutableRefObject<TablePlugin | null> }) {
  const wide = useLandscape()
  // Tall: a row of four, as big as fits the screen's width (the panel's 12px margins, its padding and the three gaps at
  // their largest: 96px), so a portrait iPhone (390 wide) still gets ~73px buttons, never clipped at the edges.
  const pic = wide ? 'calc(var(--target) * 1.05)' : 'min(calc(var(--target) * 1.2), calc((100vw - 96px) / 4))'
  const place: CSSProperties = wide ? { right: 'calc(var(--safe-right, 0px) + 12px)', bottom: 'calc(var(--safe-bottom) + 12px)' } : { left: '50%', bottom: 'calc(var(--safe-bottom) + 12px)', translate: '-50% 0' }
  return (
    <motion.div
      key="colors"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{ position: 'absolute', ...place, zIndex: 30, background: 'rgba(255,247,240,.92)', borderRadius: 28, boxShadow: 'var(--shadow)', padding: 'clamp(10px, 2vmin, 18px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(10px, 2vmin, 16px)', maxWidth: 'calc(100vw - 24px)', boxSizing: 'border-box' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(2, auto)' : 'repeat(4, auto)', gap: 'clamp(8px, 1.8vmin, 16px)' }}>
        {UNICORNS.map((c) => {
          const picked = view.piece === c
          const photo = view.pieceFaces[c]
          return (
            <motion.button
              key={c}
              aria-label={`${c} unicorn`}
              aria-pressed={picked}
              animate={{ scale: picked ? 1.1 : 1 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => (sounds.pop(), table.current?.choosePiece(c))}
              style={{ ...round(pic, photo ? PIECE_BG[c] : UNICORN_HEX[c].body, picked ? 'var(--hotpink)' : '#fff'), borderWidth: 6, overflow: 'hidden', fontSize: `calc(${pic} * .5)`, cursor: 'pointer' }}
            >
              {photo ? <img src={photo} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <span>🦄</span>}
            </motion.button>
          )
        })}
      </div>
      <PlayButton on table={table} />
    </motion.div>
  )
}

function BigCard({ token }: { token: string }) {
  const src = useMemo(() => faceCanvas(token).toDataURL(), [token])
  return (
    <motion.img
      src={src}
      alt={`${token.replace('2', ' double')} card`}
      initial={{ scale: 0.3, rotateY: 180, opacity: 0 }}
      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
      exit={{ scale: 0.4, opacity: 0, y: 40 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{ position: 'absolute', left: '50%', top: 'var(--bar-clear)', translate: '-50% 0', width: 'min(36vw, 36vh, 240px)', borderRadius: 18, border: '6px solid #fff', boxShadow: 'var(--shadow)', zIndex: 35, pointerEvents: 'none' }}
    />
  )
}
