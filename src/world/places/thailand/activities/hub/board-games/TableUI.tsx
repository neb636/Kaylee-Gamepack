// What the game table shows over the house (greybox): the picker (three big game cards, the three cousins' faces with
// BB picked, the Unicorn game's four unicorns, a big ▶), and while they play: the two faces at the sides (whoever's
// turn it is grows and glows), 🎲 back to the games and 👋 to get up, and a big 🔁 when someone has won. No words to
// read: pictures, faces and big targets (var(--target): 96 px on iPad, 72 px on a short iPhone).
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, type CSSProperties, type MutableRefObject } from 'react'
import { sounds, useLandscape } from '../../../../../../sdk'
import { faceCanvas } from './deck'
import { UNICORN_HEX } from './pieces'
import { COUSINS, GAMES, UNICORNS, type CousinId } from './list'
import type { TablePlugin, TableView } from './plugin'

/** Placeholder faces for the greybox (the look gate takes pictures of their real 3D selves). */
export const FACES: Record<CousinId | 'kaylee', { emoji: string; extra: string; ring: string; name: string }> = {
  kaylee: { emoji: '🦄', extra: '', ring: '#C9B3FF', name: 'You' },
  bb: { emoji: '🐃', extra: '🎀', ring: '#FF8FB8', name: 'BB' },
  gan: { emoji: '🦊', extra: '🧢', ring: '#FFC2A8', name: 'Gan' },
  ken: { emoji: '🦊', extra: '👓', ring: '#8FE3C8', name: 'Ken' },
}
const GAME_BG: Record<string, string> = { unicorn: 'linear-gradient(160deg, #FFD6EA, #D9CCFF)', candy: 'linear-gradient(160deg, #FFE3C2, #FFC4DE)', chutes: 'linear-gradient(160deg, #CFF3E3, #BFE3FF)' }

const round = (size: string, bg: string, ring: string): CSSProperties => ({ width: size, height: size, borderRadius: '50%', background: bg, border: `5px solid ${ring}`, boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', padding: 0, position: 'relative', flex: 'none' })

export function Face({ who, size, active = false, crown = false }: { who: CousinId | 'kaylee'; size: string; active?: boolean; crown?: boolean }) {
  const f = FACES[who]
  return (
    <motion.div animate={{ scale: active ? 1.18 : 1, boxShadow: active ? `0 0 0 8px ${f.ring}88, var(--shadow)` : 'var(--shadow)' }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} style={{ ...round(size, '#fff', f.ring), fontSize: `calc(${size} * .5)` }}>
      <span>{f.emoji}</span>
      {f.extra && <span style={{ position: 'absolute', right: '-6%', top: '-6%', fontSize: `calc(${size} * .3)` }}>{f.extra}</span>}
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
  const side: CSSProperties = { position: 'absolute', top: '50%', translate: '0 -50%', zIndex: 30, pointerEvents: 'none' }
  const iconBtn = (bg: string): CSSProperties => ({ ...round(size, bg, '#fff'), fontSize: `calc(${size} * .45)`, cursor: 'pointer' })
  return (
    <>
      {/* Top right: back to the games, and get up from the table. */}
      <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 10px)', right: 'calc(var(--safe-right, 0px) + 14px)', display: 'flex', gap: 12, zIndex: 50 }}>
        {!view.picking && (
          <motion.button aria-label="Games" whileTap={{ scale: 0.85 }} onClick={tap(() => t()?.games())} style={iconBtn('var(--butter)')}>
            🎲
          </motion.button>
        )}
        <motion.button aria-label="Leave the table" whileTap={{ scale: 0.85 }} onClick={tap(() => t()?.leave())} style={iconBtn('var(--sky)')}>
          👋
        </motion.button>
      </div>

      {view.picking ? (
        <Picker view={view} table={table} />
      ) : (
        <>
          {/* Whose turn: her face on her side (left), the cousin's on theirs (right). */}
          <div style={{ ...side, left: 'calc(var(--safe-left, 0px) + 18px)' }}>
            <Face who="kaylee" size={size} active={view.phase !== 'finished' && view.turn === 0} crown={view.winner === 0} />
          </div>
          {view.seated && (
            <div style={{ ...side, right: 'calc(var(--safe-right, 0px) + 18px)' }}>
              <Face who={view.seated} size={size} active={view.phase !== 'finished' && view.turn === 1} crown={view.winner === 1} />
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

function Picker({ view, table }: { view: TableView; table: MutableRefObject<TablePlugin | null> }) {
  const t = () => table.current
  // Wide screens: the picker sits bottom right and the camera keeps the table on the left; tall: along the bottom,
  // the table above it.
  const wide = useLandscape()
  const card = wide ? 'calc(var(--target) * 1.1)' : 'calc(var(--target) * 1.3)'
  const face = wide ? 'calc(var(--target) * .78)' : 'calc(var(--target) * .9)'
  const sw = 'calc(var(--target) * .66)'
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
              style={{ width: card, height: card, borderRadius: 22, border: `6px solid ${picked ? 'var(--hotpink)' : '#fff'}`, background: GAME_BG[g.id], fontSize: `calc(${card} * .5)`, boxShadow: 'var(--shadow)', opacity: on ? 1 : 0.4, position: 'relative', padding: 0 }}
            >
              {g.icon}
              {!on && <span style={{ position: 'absolute', right: 4, bottom: 2, fontSize: `calc(${card} * .25)` }}>🚧</span>}
            </motion.button>
          )
        })}
      </div>
      {/* The cousins (BB first). */}
      <div style={{ display: 'flex', gap: 'clamp(10px, 2vmin, 18px)', alignItems: 'center' }}>
        {COUSINS.map((c) => (
          <button key={c} aria-label={FACES[c].name} aria-pressed={view.vs === c} onClick={() => (sounds.pop(), t()?.chooseCousin(c))} style={{ border: 'none', background: 'none', padding: 4, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 2, minWidth: 'var(--target)', minHeight: 'var(--target)' }}>
            <Face who={c} size={face} active={view.vs === c} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{FACES[c].name}</span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(2px, 1vmin, 8px)', alignItems: 'center' }}>
        {/* Her unicorn (the Unicorn game): the cousin takes another. A full-size tap target round each smaller circle. */}
        {view.game === 'unicorn' &&
          UNICORNS.map((c) => (
            <motion.button
              key={c}
              aria-label={`${c} unicorn`}
              aria-pressed={view.piece === c}
              animate={{ scale: view.piece === c ? 1.15 : 1 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => (sounds.pop(), t()?.choosePiece(c))}
              style={{ width: 'var(--target)', height: 'var(--target)', border: 'none', background: 'none', padding: 0, display: 'grid', placeItems: 'center', flex: 'none' }}
            >
              <span style={{ ...round(sw, UNICORN_HEX[c].body, view.piece === c ? 'var(--hotpink)' : '#fff'), fontSize: `calc(${sw} * .5)` }}>🦄</span>
            </motion.button>
          ))}
        <motion.button
          aria-label="Play"
          disabled={!view.offered.includes(view.game)}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ repeat: Infinity, duration: 1.3 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => (sounds.pop(), t()?.play())}
          style={{ ...round('var(--target)', 'var(--mint)', '#fff'), fontSize: 'calc(var(--target) * .5)', marginLeft: 6 }}
        >
          ▶
        </motion.button>
      </div>
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
