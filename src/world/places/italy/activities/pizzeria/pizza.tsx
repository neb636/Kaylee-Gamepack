// The pizza itself, drawn in code (it changes with every step): a dough base, sauce, toppings, crust that browns one
// quarter at a time in the oven, and cut lines. Positions are fractions of the pizza's square box, so it looks the same
// at every size (the toppings station's StickerBoard uses the same fractions).
import type { CSSProperties } from 'react'
import type { Placed, Sticker } from '../../../../../sdk'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'

export type Topping = 'mozzarella' | 'basil' | 'olive' | 'mushroom' | 'pepper' | 'tomato'
export type Sauce = 'red' | 'pink'

export interface PizzaState {
  sauce: Sauce | null
  items: Placed[]
  /** How golden each quarter of the crust is (0..1), in the pizza's own frame (see QUARTER_ANGLE). */
  bake: [number, number, number, number]
  /** Cut lines through the middle, as angles in degrees (0 = left to right). */
  cuts: number[]
}

export const RAW: PizzaState = { sauce: null, items: [], bake: [0, 0, 0, 0], cuts: [] }

/** A customer's order. `want` counts must match exactly; `halves` needs at least `each` of each kind on its own side. */
export interface Order {
  who: 'queen' | 'bufala' | 'gino' | 'kaylee'
  want?: Partial<Record<Topping, number>>
  halves?: { left: Topping; right: Topping; each: number }
  cuts: 0 | 1 | 2
  free?: boolean
}

const IMG: Record<Topping, string> = {
  mozzarella: art.mozzarellaPiece,
  basil: art.basil,
  olive: art.olive,
  mushroom: art.mushroom,
  pepper: art.pepper,
  tomato: art.tomato,
}
const SIZE: Record<Topping, number> = { mozzarella: 0.17, basil: 0.14, olive: 0.1, mushroom: 0.14, pepper: 0.14, tomato: 0.13 }

export const toppingImg = (k: string) => IMG[k as Topping]

/** Tray stickers for the StickerBoard. */
export function stickersFor(kinds: Topping[]): Sticker[] {
  return kinds.map((k) => ({ kind: k, size: SIZE[k], say: L.pizza.toppings[k], content: <img src={IMG[k]} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} /> }))
}

/** Mozzarella that Bruno sprinkles on (services 2 and 3): seven pieces, spread out. */
export function cheeseRain(): Placed[] {
  const spots = [
    [0.5, 0.5],
    [0.3, 0.36],
    [0.68, 0.32],
    [0.26, 0.64],
    [0.72, 0.66],
    [0.5, 0.24],
    [0.48, 0.78],
  ]
  return spots.map(([x, y], i) => ({ id: `cheese-${i}-${Math.random().toString(36).slice(2, 6)}`, kind: 'mozzarella', x, y, rot: (i * 47) % 50 - 25 }))
}

export function counts(items: Placed[]): Record<string, number> {
  const c: Record<string, number> = {}
  for (const it of items) c[it.kind] = (c[it.kind] ?? 0) + 1
  return c
}

/** The quarter of the pizza's own frame whose middle points toward `screenAngle` when the pizza is turned `turns` times. */
export const QUARTER_ANGLE = [180, 90, 0, 270]

const DOUGH = '#F7E7DA'
const GOLD = '#F2B872'
const BROWN = '#D8894A'
const SAUCE: Record<Sauce, string> = { red: '#E8574F', pink: '#F27AA6' }

const mixColor = (a: string, b: string, p: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * p)).join(',')})`
}
const crustColor = (b: number) => (b < 0.7 ? mixColor(DOUGH, GOLD, b / 0.7) : mixColor(GOLD, BROWN, (b - 0.7) / 0.6))

/** An arc wedge (for a quarter of the crust), angles in degrees, SVG coords centered on 0,0. */
function ring(a0: number, a1: number, r0: number, r1: number) {
  const p = (a: number, r: number) => `${(Math.cos((a * Math.PI) / 180) * r).toFixed(2)} ${(Math.sin((a * Math.PI) / 180) * r).toFixed(2)}`
  return `M${p(a0, r1)} A${r1} ${r1} 0 0 1 ${p(a1, r1)} L${p(a1, r0)} A${r0} ${r0} 0 0 0 ${p(a0, r0)} Z`
}

/** The pizza base (dough, crust, sauce, bake), filling its box. `sauceMask` hides the sauce (while it's painted on). */
export function PizzaBase({ pizza, hideSauce, style }: { pizza: PizzaState; hideSauce?: boolean; style?: CSSProperties }) {
  const cooked = Math.min(...pizza.bake)
  return (
    <svg viewBox="-110 -110 220 220" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', ...style }}>
      <circle r="100" fill={INK} opacity="0.12" cy="6" />
      <circle r="100" fill={DOUGH} stroke={INK} strokeWidth="5" />
      {/* Crust quarters brown one at a time in the oven. */}
      {QUARTER_ANGLE.map((a, i) => (
        <path key={i} d={ring(a - 45, a + 45, 82, 97.5)} fill={crustColor(pizza.bake[i])} />
      ))}
      <circle r="82" fill={mixColor(DOUGH, '#F6D9B8', cooked)} />
      {pizza.sauce && !hideSauce && <circle r="80" fill={SAUCE[pizza.sauce]} />}
      <circle r="82" fill="none" stroke={INK} strokeWidth="2.6" opacity="0.5" />
      {/* Toasty bubbles on the crust once baked. */}
      {QUARTER_ANGLE.map((a, i) =>
        pizza.bake[i] > 0.6
          ? [a - 22, a + 8, a + 30].map((b, j) => (
              <circle key={`${i}-${j}`} cx={Math.cos((b * Math.PI) / 180) * 90} cy={Math.sin((b * Math.PI) / 180) * 90} r={3 + (j % 2) * 1.6} fill={BROWN} opacity={0.8 * pizza.bake[i]} />
            ))
          : null,
      )}
    </svg>
  )
}

/** Toppings on the pizza (same fractions as the StickerBoard), with a toasty tint once baked. */
export function PizzaToppings({ items, baked }: { items: Placed[]; baked?: number }) {
  return (
    <>
      {items.map((it) => {
        const s = SIZE[it.kind as Topping] ?? 0.14
        return (
          <img
            key={it.id}
            src={toppingImg(it.kind)}
            alt=""
            draggable={false}
            style={{ position: 'absolute', left: `${(it.x - s / 2) * 100}%`, top: `${(it.y - s / 2) * 100}%`, width: `${s * 100}%`, height: `${s * 100}%`, objectFit: 'contain', rotate: `${it.rot}deg`, filter: baked ? `sepia(${baked * 0.25}) saturate(${1 + baked * 0.15})` : undefined, pointerEvents: 'none' }}
          />
        )
      })}
    </>
  )
}

/** Cut grooves across the pizza. */
export function PizzaCuts({ cuts }: { cuts: number[] }) {
  return (
    <svg viewBox="-110 -110 220 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
      {cuts.map((a, i) => {
        const x = Math.cos((a * Math.PI) / 180) * 99
        const y = Math.sin((a * Math.PI) / 180) * 99
        return (
          <g key={i}>
            <line x1={-x} y1={-y} x2={x} y2={y} stroke={INK} strokeWidth="6" strokeLinecap="round" />
            <line x1={-x} y1={-y} x2={x} y2={y} stroke="#FFF1DE" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </g>
        )
      })}
    </svg>
  )
}

/** The whole pizza in a square box of `size` (a CSS length). */
export function PizzaView({ pizza, size, style }: { pizza: PizzaState; size: string; style?: CSSProperties }) {
  const baked = Math.min(...pizza.bake)
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none', ...style }}>
      <PizzaBase pizza={pizza} />
      <PizzaToppings items={pizza.items} baked={baked} />
      <PizzaCuts cuts={pizza.cuts} />
    </div>
  )
}

/** A little order ticket: a mini pizza showing what's wanted, and the cut. */
export function Ticket({ order, face, done }: { order: Order; face?: string; done?: boolean }) {
  const demo: PizzaState = { sauce: order.who === 'kaylee' ? null : 'red', items: demoItems(order), bake: [0.8, 0.8, 0.8, 0.8], cuts: order.cuts === 2 ? [0, 90] : order.cuts === 1 ? [90] : [] }
  return (
    <div style={{ position: 'relative', background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 20, padding: 'min(1.4vh, 10px)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, rotate: '3deg' }}>
      {/* the clip */}
      <div style={{ position: 'absolute', top: -14, left: '50%', translate: '-50% 0', width: 34, height: 20, background: '#C9C3D8', border: `4px solid ${INK}`, borderRadius: 6 }} />
      {face && <img src={face} alt="" style={{ height: 'calc(var(--ticket) * 0.42)', objectFit: 'contain' }} />}
      <div style={{ position: 'relative' }}>
        <PizzaView pizza={demo} size="calc(var(--ticket) * 0.62)" />
        {order.halves && (
          <svg viewBox="-110 -110 220 220" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <line x1="0" y1="-96" x2="0" y2="96" stroke={INK} strokeWidth="4" strokeDasharray="10 8" />
          </svg>
        )}
        {done && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 'calc(var(--ticket) * 0.34)' }}>✅</div>}
      </div>
      {order.want && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 700, fontSize: 'calc(var(--ticket) * 0.14)', color: INK }}>
          {Object.entries(order.want).map(([k, n]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              {n}
              <img src={toppingImg(k)} alt={k} style={{ height: 'calc(var(--ticket) * 0.16)' }} />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** The pictures on a ticket, laid out neatly. */
function demoItems(order: Order): Placed[] {
  const out: Placed[] = []
  const ringAt = (n: number, kind: string, cx: number, cy: number, r: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2
      out.push({ id: `${kind}-${i}`, kind, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, rot: 0 })
    }
  }
  if (order.halves) {
    const { left, right, each } = order.halves
    for (let i = 0; i < each; i++) {
      out.push({ id: `l${i}`, kind: left, x: 0.32, y: 0.3 + i * 0.2, rot: 0 })
      out.push({ id: `r${i}`, kind: right, x: 0.68, y: 0.3 + i * 0.2, rot: 0 })
    }
  }
  for (const [k, n] of Object.entries(order.want ?? {})) {
    if (!n) continue
    if (k === 'mozzarella') ringAt(n, k, 0.5, 0.5, 0.26)
    else if (k === 'basil') ringAt(n, k, 0.5, 0.5, 0.12)
    else ringAt(n, k, 0.5, 0.5, n > 1 ? 0.24 : 0)
  }
  return out
}
