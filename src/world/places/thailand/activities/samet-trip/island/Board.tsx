// The pictures: how she gets round Koh Samet (samet-story.md). Four round pictures of the beaches, drawn from the
// island itself, each with its firefly (grey until she has found it). Tap one and the green taxi takes her straight
// there (IslandScreen's ride card); the one she's standing on just closes the pictures. With all four found there is
// one picture left: the sunset at the driftwood tree. No words to read: the labels are for the grown-up.
//
// Also here: the firefly's little picture (the board's badges and the top-right button's row of four), and the green
// taxi that drives across the screen while the island moves her.
import { motion } from 'motion/react'
import { FIREFLIES, FIREFLY_IDS, type FireflyId } from '../story/firefly'
import type { SpotId } from './layout'

/** The beach each firefly's stop is on. */
export const STOP_SPOT: Record<FireflyId, SpotId> = { jetski: 'saikaew', sandcastle: 'hinkhok', snorkel: 'wongduan', hideseek: 'prao' }
const LABEL: Record<FireflyId, string> = { jetski: 'The jet ski', sandcastle: 'The sandcastle', snorkel: 'The snorkel boat', hideseek: 'Hide and seek' }
const STICKER: Record<FireflyId, string> = { jetski: '🚤', sandcastle: '🏰', snorkel: '🐠', hideseek: '🙈' }

export type BoardPick = FireflyId | 'sunset'

interface Props {
  /** The pictures of the beaches (from the island, once it has drawn them). */
  pics: Partial<Record<SpotId, string>>
  /** The fireflies she has found. */
  found: readonly FireflyId[]
  /** The beach she's on now. */
  here: SpotId
  onPick(id: BoardPick): void
  onClose(): void
}

export function Board({ pics, found, here, onPick, onClose }: Props) {
  const all = found.length === FIREFLY_IDS.length
  return (
    <motion.div
      className="isle-board"
      data-board={all ? 'sunset' : 'beaches'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {all ? (
        <motion.button className="isle-card isle-card-sunset" aria-label="The sunset at the driftwood tree" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} onClick={() => onPick('sunset')}>
          <span className="isle-pic" style={{ borderColor: '#FFB347' }}>
            {pics.prao ? <img alt="" src={pics.prao} /> : null}
            <span className="isle-sun" aria-hidden />
          </span>
          <span className="isle-flies">
            {FIREFLY_IDS.map((id) => (
              <FireflyIcon key={id} id={id} lit size={34} />
            ))}
          </span>
          <span className="isle-label">The sunset</span>
        </motion.button>
      ) : (
        <div className="isle-cards">
          {FIREFLY_IDS.map((id, i) => {
            const got = found.includes(id)
            const spot = STOP_SPOT[id]
            return (
              <motion.button
                key={id}
                className={`isle-card${got ? ' isle-card-got' : ''}`}
                data-pick={id}
                aria-label={`${LABEL[id]}: ${FIREFLIES[id].name} the firefly${got ? ', found' : ''}`}
                initial={{ scale: 0.3, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.06 * i }}
                onClick={() => onPick(id)}
              >
                <span className="isle-pic" style={{ borderColor: FIREFLIES[id].color }}>
                  {pics[spot] ? <img alt="" src={pics[spot]} /> : null}
                </span>
                <span className="isle-sticker" aria-hidden>
                  {STICKER[id]}
                </span>
                <span className={`isle-badge${got ? '' : ' isle-badge-wait'}`}>
                  <FireflyIcon id={id} lit={got} size={46} />
                </span>
                {here === spot && <span className="isle-here" aria-hidden />}
                <span className="isle-label">{LABEL[id]}</span>
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

/** A firefly's little picture: a round face with wings and a glow in its color (grey, no glow, until it's found). */
export function FireflyIcon({ id, lit, size = 40 }: { id: FireflyId; lit: boolean; size?: number }) {
  const c = lit ? FIREFLIES[id].color : '#C9C3D1'
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden style={{ display: 'block', overflow: 'visible' }}>
      {lit && <circle cx="24" cy="27" r="22" fill={c} opacity="0.28" />}
      {lit && <circle cx="24" cy="27" r="16" fill={c} opacity="0.35" />}
      <ellipse cx="14" cy="15" rx="7" ry="10" fill="#FFFFFF" stroke="#2B2330" strokeWidth="1.6" transform="rotate(-28 14 15)" opacity={lit ? 1 : 0.7} />
      <ellipse cx="34" cy="15" rx="7" ry="10" fill="#FFFFFF" stroke="#2B2330" strokeWidth="1.6" transform="rotate(28 34 15)" opacity={lit ? 1 : 0.7} />
      <circle cx="24" cy="28" r="12" fill={c} stroke="#2B2330" strokeWidth="2" />
      <circle cx="24" cy="25" r="8" fill="#FFFFFF" opacity={lit ? 0.55 : 0.3} />
      <circle cx="20" cy="26" r="1.9" fill="#2B2330" />
      <circle cx="28" cy="26" r="1.9" fill="#2B2330" />
      {lit ? <path d="M20.5 30.5 Q24 33.5 27.5 30.5" stroke="#2B2330" strokeWidth="1.6" fill="none" strokeLinecap="round" /> : <text x="24" y="38.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2B2330" opacity="0.55">?</text>}
    </svg>
  )
}

/** The green taxi (a songthaew: a pickup with benches in the back), the sun bear at the wheel, for the ride card and
 *  the top-right button. */
export function TaxiPicture({ size = 220 }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 220 130" width={size} aria-hidden style={{ display: 'block', overflow: 'visible' }}>
      {/* The back: a roof on posts over the benches, open sides. */}
      <rect x="18" y="26" width="118" height="12" rx="6" fill="#3FA56B" stroke="#2B2330" strokeWidth="3" />
      <rect x="26" y="36" width="6" height="40" fill="#F4F0E6" stroke="#2B2330" strokeWidth="2.5" />
      <rect x="76" y="36" width="6" height="40" fill="#F4F0E6" stroke="#2B2330" strokeWidth="2.5" />
      <rect x="124" y="36" width="6" height="40" fill="#F4F0E6" stroke="#2B2330" strokeWidth="2.5" />
      {/* Riders: a lilac unicorn's head and the puppy's. */}
      <circle cx="54" cy="60" r="13" fill="#E3D0FF" stroke="#2B2330" strokeWidth="2.5" />
      <path d="M54 47 L57 33 L60 48 Z" fill="#FFD27A" stroke="#2B2330" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="50" cy="60" r="1.8" fill="#2B2330" />
      <circle cx="59" cy="60" r="1.8" fill="#2B2330" />
      <circle cx="102" cy="64" r="10" fill="#FFF1DC" stroke="#2B2330" strokeWidth="2.5" />
      <ellipse cx="93" cy="62" rx="4" ry="8" fill="#C98A55" stroke="#2B2330" strokeWidth="2" />
      <circle cx="100" cy="63" r="1.6" fill="#2B2330" />
      <circle cx="106" cy="63" r="1.6" fill="#2B2330" />
      {/* The body and the cab. */}
      <path d="M12 74 H140 V50 Q140 40 150 40 H176 Q186 40 190 50 L198 70 Q208 72 208 82 V98 H12 Z" fill="#5FC48A" stroke="#2B2330" strokeWidth="3" strokeLinejoin="round" />
      <path d="M150 48 H174 Q180 48 182 54 L188 70 H150 Z" fill="#DDF3FF" stroke="#2B2330" strokeWidth="2.5" strokeLinejoin="round" />
      {/* The sun bear driver. */}
      <circle cx="166" cy="62" r="9" fill="#5B4A52" stroke="#2B2330" strokeWidth="2" />
      <circle cx="159" cy="54" r="3.4" fill="#5B4A52" stroke="#2B2330" strokeWidth="1.6" />
      <circle cx="173" cy="54" r="3.4" fill="#5B4A52" stroke="#2B2330" strokeWidth="1.6" />
      <ellipse cx="167" cy="65" rx="4.5" ry="3.4" fill="#F2D49A" />
      <rect x="12" y="78" width="196" height="7" fill="#FFFFFF" opacity="0.85" />
      <rect x="198" y="80" width="12" height="8" rx="3" fill="#FFE27A" stroke="#2B2330" strokeWidth="2" />
      {/* Wheels. */}
      {[52, 166].map((x) => (
        <g key={x} className="isle-wheel" style={{ transformOrigin: `${x}px 100px` }}>
          <circle cx={x} cy="100" r="17" fill="#2B2330" />
          <circle cx={x} cy="100" r="8" fill="#F4F0E6" />
          <rect x={x - 1.5} y="92" width="3" height="16" fill="#2B2330" />
          <rect x={x - 8} y="98.5" width="16" height="3" fill="#2B2330" />
        </g>
      ))}
    </svg>
  )
}

export const BOARD_CSS = `
.isle-board { position: absolute; inset: 0; z-index: 32; display: grid; place-items: center; background: radial-gradient(ellipse at 50% 45%, rgba(255,246,252,.72), rgba(255,227,240,.5) 60%, rgba(255,227,240,.28)); padding: calc(var(--safe-top, 0px) + var(--btn) + 22px) 16px calc(var(--safe-bottom, 0px) + min(150px, 20vh)); touch-action: none; }
.isle-cards { display: grid; grid-template-columns: repeat(4, auto); gap: clamp(10px, 2.6vw, 34px); align-items: start; --card: min(21vw, 46vh, 230px); }
@media (orientation: portrait) { .isle-cards { grid-template-columns: repeat(2, auto); gap: clamp(14px, 4vw, 40px); --card: min(40vw, 25vh, 300px); } }
.isle-card { position: relative; width: var(--card); border: none; background: none; padding: 0; display: grid; justify-items: center; gap: 6px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.isle-card:active .isle-pic { transform: scale(.93); }
.isle-pic { position: relative; display: block; width: var(--card); height: var(--card); border-radius: 50%; overflow: hidden; background: #BFE9F5; border: clamp(5px, .9vmin, 9px) solid #fff; box-shadow: 0 0 0 5px #fff, 0 10px 22px rgba(43,35,48,.28); transition: transform .12s; }
.isle-pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.isle-card:not(.isle-card-got) .isle-pic { animation: isle-bob 1.8s ease-in-out infinite; }
.isle-card:nth-child(2) .isle-pic { animation-delay: -.45s; } .isle-card:nth-child(3) .isle-pic { animation-delay: -.9s; } .isle-card:nth-child(4) .isle-pic { animation-delay: -1.35s; }
.isle-card-got .isle-pic { filter: saturate(.8) brightness(1.03); }
.isle-sticker { position: absolute; left: -2%; top: calc(var(--card) * .7); width: calc(var(--card) * .32); height: calc(var(--card) * .32); border-radius: 50%; background: #fff; box-shadow: 0 3px 8px rgba(43,35,48,.25); display: grid; place-items: center; font-size: calc(var(--card) * .19); line-height: 1; }
.isle-badge { position: absolute; right: -4%; top: -5%; width: calc(var(--card) * .36); height: calc(var(--card) * .36); border-radius: 50%; background: #fff; box-shadow: 0 3px 8px rgba(43,35,48,.25); display: grid; place-items: center; }
.isle-badge svg { width: 78%; height: 78%; }
.isle-badge-wait { background: #F4F1F7; }
.isle-here { position: absolute; left: 50%; top: calc(var(--card) * -.11); width: calc(var(--card) * .16); height: calc(var(--card) * .16); margin-left: calc(var(--card) * -.08); background: var(--hotpink); border: 3px solid #fff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 3px 6px rgba(43,35,48,.3); }
.isle-label { font-size: clamp(12px, 1.7vmin, 17px); font-weight: 700; color: var(--ink); background: rgba(255,255,255,.88); border-radius: 999px; padding: 2px 12px; white-space: nowrap; }
.isle-card-sunset { --card: min(52vw, 46vh, 360px); }
.isle-card-sunset .isle-pic { animation: isle-bob 1.8s ease-in-out infinite; box-shadow: 0 0 0 5px #fff, 0 0 44px 10px rgba(255,179,71,.75), 0 10px 22px rgba(43,35,48,.28); }
.isle-card-sunset .isle-pic img { filter: sepia(.35) saturate(1.5) hue-rotate(-12deg); }
.isle-sun { position: absolute; left: 50%; bottom: -30%; width: 62%; aspect-ratio: 1; margin-left: -31%; border-radius: 50%; background: radial-gradient(circle, #FFF3B0 0 38%, #FFC83D 60%, rgba(255,150,60,.0) 72%); mix-blend-mode: screen; }
.isle-flies { display: flex; gap: 8px; justify-content: center; margin-top: 4px; }
@keyframes isle-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
.isle-go { position: absolute; top: calc(var(--safe-top, 0px) + 12px); right: calc(var(--safe-right, 0px) + 16px); height: var(--btn); padding: 0 calc(var(--btn) * .16) 0 calc(var(--btn) * .1); border-radius: 999px; border: none; background: #fff; box-shadow: var(--shadow); display: flex; align-items: center; gap: calc(var(--btn) * .06); z-index: 50; cursor: pointer; transition: transform .12s; -webkit-tap-highlight-color: transparent; }
.isle-go:active { transform: scale(.9); }
.isle-go-nudge { animation: isle-nudge 1.1s ease-in-out infinite; box-shadow: 0 0 0 4px var(--hotpink), var(--shadow); }
@keyframes isle-nudge { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.09); } }
.isle-go-taxi { width: calc(var(--btn) * .78); }
.isle-go-flies { display: grid; grid-template-columns: repeat(2, auto); gap: 1px 2px; }
.isle-ride { position: absolute; inset: 0; z-index: 60; overflow: hidden; background: linear-gradient(#BDEBFF 0 46%, #8EE0D2 46% 62%, #FFF1D6 62% 100%); touch-action: none; }
.isle-ride-road { position: absolute; left: 0; right: 0; bottom: 12%; height: 15%; background: #E9D9B8; border-top: 5px solid #D9C49A; }
.isle-ride-road::after { content: ''; position: absolute; left: 0; right: 0; top: 46%; height: 8%; background: repeating-linear-gradient(90deg, #fff 0 44px, transparent 44px 96px); animation: isle-road .5s linear infinite; }
@keyframes isle-road { to { transform: translateX(-96px); } }
.isle-ride-palm { position: absolute; bottom: 27%; font-size: clamp(60px, 15vmin, 150px); line-height: 1; animation: isle-palm 1.5s linear infinite; }
@keyframes isle-palm { from { transform: translateX(110vw); } to { transform: translateX(-30vw); } }
.isle-ride-taxi { position: absolute; left: 0; bottom: 15%; width: clamp(200px, 38vmin, 420px); animation: isle-taxi 1.75s cubic-bezier(.3,.1,.6,1) both; }
.isle-ride-taxi > div { animation: isle-bump .28s ease-in-out infinite; }
@keyframes isle-taxi { from { transform: translateX(-45vmin); } to { transform: translateX(105vw); } }
@keyframes isle-bump { 0%, 100% { transform: translateY(0) rotate(-.6deg); } 50% { transform: translateY(-5px) rotate(.6deg); } }
.isle-wheel { animation: isle-spin .45s linear infinite; }
@keyframes isle-spin { to { transform: rotate(360deg); } }
`
