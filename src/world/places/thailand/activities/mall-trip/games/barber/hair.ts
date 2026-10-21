// A hairdo as data (plan: planning/around-the-world/thailand/mall-trip.md, "★ 2. The Barber Salon"): the scalp is
// TUFTS tufts of strands (mane.ts grows them), each with a length, a color and a style, plus his two eyebrows (the
// grow tonic's silly side) and the bows and clips she put in. Daddy keeps his for the rest of the trip, so it travels
// in the `hair` param. Pure data (no three.js).
//
// The `hair` param, compact, segments separated by dots (trailing ones left out when they're the default):
//   <lengths>.<colors>.<styles>.<bows>.<brows>
//   - lengths: one char for every tuft, or one per tuft (0-9a-z, 4 is his own; 0 a buzz cut, z down past his chin)
//   - colors:  n his own mane, or r o y g b v p w (one char for all, or one per tuft)
//   - styles:  n as it falls, s spiky, f combed flat, c poofed curly (one char for all, or one per tuft)
//   - bows:    pairs: the tuft (0-9a-z) and the bow (p v y a bow in that color, P V Y a clip)
//   - brows:   two chars, his eyebrows' lengths (0: none)
// '' is his own mane (no strands at all: the toy's own locks), e.g. `hair=k.r` long and red, `hair=k.n.s` long spikes,
// `hair=8.roygbvproygbvproygbvproygb` rainbow stripes.

export const TUFTS = 26
export const LEN_STEPS = 35
/** His own length (the mane he came in with). */
export const NATURAL = 4

export const HAIR_COLORS = { r: '#FF6B6B', o: '#FFA94D', y: '#FFE066', g: '#8CE99A', b: '#74C0FC', v: '#B197FC', p: '#FF8FB8', w: '#FFFFFF' } as const
export type ColorId = 'n' | keyof typeof HAIR_COLORS
/** The color spray goes round these as she sprays. */
export const RAINBOW: ColorId[] = ['r', 'o', 'y', 'g', 'b', 'v', 'p']
export type Style = 'n' | 's' | 'f' | 'c'
export type BowId = 'p' | 'v' | 'y' | 'P' | 'V' | 'Y'
export const BOW_COLORS: Record<string, string> = { p: '#FF4F9A', v: '#B9A6F5', y: '#FFC83D' }

export interface Tuft {
  /** 0..LEN_STEPS. */
  len: number
  color: ColorId
  style: Style
}
export interface Hairdo {
  tufts: Tuft[]
  bows: { tuft: number; bow: BowId }[]
  brows: [number, number]
}

const B36 = '0123456789abcdefghijklmnopqrstuvwxyz'
const ch = (n: number) => B36[Math.max(0, Math.min(35, Math.round(n)))]
const num = (c: string) => Math.max(0, B36.indexOf(c.toLowerCase()))

export function natural(): Hairdo {
  return { tufts: Array.from({ length: TUFTS }, () => ({ len: NATURAL, color: 'n' as ColorId, style: 'n' as Style })), bows: [], brows: [0, 0] }
}

/** One char if every tuft has the same, else one per tuft. */
function squeeze(chars: string[]) {
  return chars.every((c) => c === chars[0]) ? chars[0] : chars.join('')
}

export function encodeHair(h: Hairdo): string {
  const seg = [
    squeeze(h.tufts.map((t) => ch(t.len))),
    squeeze(h.tufts.map((t) => t.color)),
    squeeze(h.tufts.map((t) => t.style)),
    h.bows.map((b) => ch(b.tuft) + b.bow).join(''),
    h.brows.some((b) => b > 0) ? h.brows.map(ch).join('') : '',
  ]
  const def = [ch(NATURAL), 'n', 'n', '', '']
  while (seg.length && seg[seg.length - 1] === def[seg.length - 1]) seg.pop()
  return seg.join('.')
}

/** Anything it can't read falls back to his own (a link always works). */
export function decodeHair(code: string): Hairdo {
  const h = natural()
  if (!code) return h
  const [lens = '', colors = '', styles = '', bows = '', brows = ''] = code.split('.')
  const per = (s: string, i: number) => (s.length === 1 ? s : s[i]) ?? ''
  h.tufts.forEach((t, i) => {
    const l = per(lens, i)
    if (l && B36.includes(l.toLowerCase())) t.len = num(l)
    const c = per(colors, i)
    if (c === 'n' || c in HAIR_COLORS) t.color = c as ColorId
    const s = per(styles, i)
    if ('nsfc'.includes(s) && s) t.style = s as Style
  })
  for (let i = 0; i + 1 < bows.length; i += 2) {
    const tuft = num(bows[i])
    const bow = bows[i + 1] as BowId
    if (tuft < TUFTS && 'pvyPVY'.includes(bow)) h.bows.push({ tuft, bow })
  }
  if (brows.length === 2) h.brows = [num(brows[0]), num(brows[1])]
  return h
}
