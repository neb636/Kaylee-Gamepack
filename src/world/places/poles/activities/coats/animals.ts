// Snow Coats' animals and stage layouts, drawn by hand in the 2D look: a side-on body with its feet on the ground line
// at y = 0, facing right, and (the fox, the hare, the lemming, the owl) the face turned to her, in local units. Each
// animal is a puppet made of four kinds of pieces:
//   - coat parts (hand-drawn paths and ellipses): the fur or feathers. SnowCoats.tsx draws them as an ink silhouette
//     (one outline round the whole animal) and as the summer coat. The same parts give the coat's grid of cells, which
//     says how much of the coat is white, and where a tap lands.
//   - marks: tones painted inside the coat (a cream belly and cheeks, a darker wing or stripe, the legs on the far
//     side). Light marks go white in winter; dark ones stay as a soft shade, so a white coat still has a shape.
//   - fixed marks: what keeps its color all year, inside the coat (pink inner ears, the hare's black ear tips).
//   - details drawn on top whatever the season: big eyes with highlights (they blink and follow her finger), the nose,
//     a mouth that opens to giggle, blush, whiskers, the ptarmigan's red comb and beak.
// Pieces hang on the body, the head or the tail, each on its own pivot, so the head can tilt and look round and the
// tail can swish and flop after a hop. Plain TypeScript (no React, no perfect-freehand).

export type Group = 'body' | 'head' | 'tail'
export const GROUPS: readonly Group[] = ['tail', 'body', 'head']

/** An ellipse (center, radii, turn in degrees) or a closed path (absolute M, L, C, Q and Z only: it is flattened for taps). */
export type Geo = { e: [cx: number, cy: number, rx: number, ry: number, rot?: number] } | { d: string }
/** A coat part: `g` the pivot it hangs on (body by default), `c` its summer color: brown (default), light or dark.
 *  `top`: it's drawn over the marks (a near leg in front of the cream belly). */
export type Part = Geo & { g?: Group; c?: 'l' | 'd'; top?: true }
/** A tone inside the coat: light or dark in summer, or `fix`, a color it keeps all year. */
export type Mark = Geo & { g?: Group } & ({ c: 'l' | 'd' } | { fix: string })

/** What's drawn on top of the coat, whatever the season. */
export type Detail = { g?: Group } & (
  | { k: 'eye'; x: number; y: number; r: number; iris?: string }
  | { k: 'nose'; x: number; y: number; r: number; color?: string; tri?: boolean }
  | { k: 'blush'; x: number; y: number; r: number }
  | { k: 'mouth'; x: number; y: number; w: number; cat?: boolean }
  | { k: 'path'; d: string; color: string }
  | { k: 'line'; d: string; w?: number; color?: string }
)

export type CoatId = 'fox' | 'hare' | 'ptarmigan' | 'lemming'
export const COAT_IDS: readonly CoatId[] = ['fox', 'hare', 'ptarmigan', 'lemming']

export interface Shape {
  parts: Part[]
  marks: Mark[]
  details: Detail[]
  /** Summer coat colors (the bear's and the owl's are white all year). */
  brown: string
  light: string
  dark: string
  /** Where the head and the tail turn. */
  pivots: Partial<Record<Group, [number, number]>>
  /** Bounding box of the parts. */
  box: { x: number; y: number; w: number; h: number }
  /** Each part as a polygon (a path flattened), for taps and the grid; none for an ellipse. */
  polys: (number[] | null)[]
}

export const PINK_EAR = '#FFB8CC'
export const DARK = '#2B2236'
const BEAK = '#3A2F45'
const PINK_NOSE = '#F0779B'

/** A closed path as a polygon: curves cut into short straight pieces. */
function flatten(d: string): number[] {
  const tok = d.match(/[MLCQZ]|-?\d*\.?\d+/g) ?? []
  const out: number[] = []
  let i = 0
  let x = 0
  let y = 0
  let cmd = ''
  const num = () => +tok[i++]
  while (i < tok.length) {
    if (/[MLCQZ]/.test(tok[i])) cmd = tok[i++]
    if (cmd === 'M' || cmd === 'L') {
      x = num()
      y = num()
      out.push(x, y)
    } else if (cmd === 'C') {
      const [x1, y1, x2, y2, x3, y3] = [num(), num(), num(), num(), num(), num()]
      for (let k = 1; k <= 8; k++) {
        const t = k / 8
        const u = 1 - t
        out.push(u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3)
      }
      x = x3
      y = y3
    } else if (cmd === 'Q') {
      const [x1, y1, x2, y2] = [num(), num(), num(), num()]
      for (let k = 1; k <= 6; k++) {
        const t = k / 6
        const u = 1 - t
        out.push(u * u * x + 2 * u * t * x1 + t * t * x2, u * u * y + 2 * u * t * y1 + t * t * y2)
      }
      x = x2
      y = y2
    } else if (i < tok.length && !/[MLCQZ]/.test(tok[i])) i++
  }
  return out
}

function shape(parts: Part[], marks: Mark[], details: Detail[], colors: [brown: string, light: string, dark: string], pivots: Shape['pivots']): Shape {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  const polys = parts.map((pt) => {
    if ('e' in pt) {
      const [cx, cy, rx, ry] = pt.e
      const r = Math.max(rx, ry)
      x0 = Math.min(x0, cx - r)
      x1 = Math.max(x1, cx + r)
      y0 = Math.min(y0, cy - r)
      y1 = Math.max(y1, cy + r)
      return null
    }
    const p = flatten(pt.d)
    for (let i = 0; i < p.length; i += 2) {
      x0 = Math.min(x0, p[i])
      x1 = Math.max(x1, p[i])
      y0 = Math.min(y0, p[i + 1])
      y1 = Math.max(y1, p[i + 1])
    }
    return p
  })
  const [brown, light, dark] = colors
  return { parts, marks, details, brown, light, dark, pivots, polys, box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } }
}

const H = 'head' as const
const T = 'tail' as const

/** A leg standing at `x`: `w` wide, `h` tall, its paw poking forward by `paw`. */
function leg(x: number, w: number, h: number, paw = w * 0.4) {
  const l = x - w / 2
  const r = x + w / 2
  const f = (v: number) => +v.toFixed(1)
  return `M${l} ${-h} L${l} ${f(-0.45 * w)} C${l} ${f(-0.1 * w)} ${f(l + 0.15 * w)} 0 ${f(l + 0.4 * w)} 0 L${f(r + paw - 0.3 * w)} 0 C${f(r + paw + 0.22 * w)} 0 ${f(r + paw + 0.22 * w)} ${f(-0.62 * w)} ${f(r + paw - 0.3 * w)} ${f(-0.62 * w)} C${f(r + paw * 0.3)} ${f(-0.62 * w)} ${r} ${f(-0.72 * w)} ${r} ${-w} L${r} ${-h} Z`
}
/** The same shape on the other side of the line x = `at` (a face drawn once, its other half mirrored). */
const flipX = (d: string, at: number) => {
  let isX = true
  return d.replace(/[MLCQZ]|-?\d*\.?\d+/g, (t) => {
    if (/[MLCQZ]/.test(t)) {
      isX = true
      return t
    }
    const v = isX ? 2 * at - +t : +t
    isX = !isX
    return `${+v.toFixed(1)}`
  })
}

// The fox's face (it looks at her): the head with its cheek tufts, short round ears, the cream cheeks and snout.
const FOX_EAR = 'M57 -174 C50 -200 55 -222 67 -234 C86 -228 101 -212 107 -193 Z'
const FOX_EAR_IN = 'M67 -190 C64 -204 66 -216 72 -224 C82 -219 90 -210 94 -201 Z'
// The hare's long ears and the lemming's whiskers, drawn once and mirrored.
const HARE_EAR_IN = 'M8 -226 C2 -246 0 -268 5 -288 C12 -270 16 -248 18 -226 Z'
const HARE_TIP = 'M-12 -292 C-10 -278 14 -270 22 -284 C22 -300 14 -312 4 -316 C-6 -312 -12 -304 -12 -292 Z'

export const SHAPES: Record<CoatId | 'bear' | 'owl', Shape> = {
  // The Arctic fox in its late-summer coat (the 3D fox's colors, characters/looks.ts): brown back, cream belly, cheeks
  // and snout, short round ears (they keep the heat in), a big bushy tail with a pale tip.
  fox: shape(
    [
      { d: 'M-72 -126 C-100 -164 -158 -190 -212 -180 C-244 -174 -254 -144 -238 -122 C-210 -86 -140 -66 -80 -78 C-62 -92 -62 -110 -72 -126 Z', g: T },
      { d: leg(-42, 26, 64), c: 'd' },
      { d: leg(68, 26, 68), c: 'd' },
      { d: 'M-92 -88 C-92 -122 -52 -132 -10 -130 C32 -128 72 -124 80 -94 C86 -64 62 -44 22 -44 L-38 -44 C-76 -44 -92 -60 -92 -88 Z' },
      { e: [-62, -74, 34, 36], top: true },
      { d: leg(-70, 28, 62), top: true },
      { d: leg(42, 28, 72), top: true },
      { d: FOX_EAR, g: H },
      { d: flipX(FOX_EAR, 112), g: H },
      { d: 'M112 -204 C140 -204 162 -190 168 -168 L190 -154 C184 -148 180 -142 178 -136 L188 -126 C172 -104 142 -92 112 -92 C82 -92 52 -104 36 -126 L46 -136 C44 -142 40 -148 34 -154 L56 -168 C62 -190 84 -204 112 -204 Z', g: H },
    ],
    [
      { d: 'M-170 -200 L-160 -172 L-178 -152 L-162 -130 L-182 -110 L-174 -80 L-270 -80 L-270 -200 Z', c: 'l', g: T },
      { e: [4, -46, 78, 20], c: 'l' },
      { e: [74, -78, 26, 38], c: 'l' },
      { d: 'M30 -152 C66 -152 96 -142 112 -126 C128 -142 158 -152 194 -152 L194 -86 L30 -86 Z', c: 'l', g: H },
      { d: FOX_EAR_IN, fix: PINK_EAR, g: H },
      { d: flipX(FOX_EAR_IN, 112), fix: PINK_EAR, g: H },
    ],
    [
      { k: 'line', d: 'M-44 -108 C-22 -98 -20 -68 -34 -52', w: 4 },
      { k: 'line', d: 'M28 -72 L28 -52', w: 4 },
      { k: 'blush', x: 66, y: -128, r: 9, g: H },
      { k: 'blush', x: 158, y: -128, r: 9, g: H },
      { k: 'eye', x: 86, y: -152, r: 9.5, g: H },
      { k: 'eye', x: 138, y: -152, r: 9.5, g: H },
      { k: 'nose', x: 112, y: -124, r: 9, tri: true, g: H },
      { k: 'mouth', x: 112, y: -112, w: 9, cat: true, g: H },
    ],
    ['#A9764E', '#F3DDC4', '#8A5B3D'],
    { head: [108, -100], tail: [-80, -102] },
  ),
  // The Arctic hare sitting up: grey-brown in summer, long ears with black tips (they stay black in winter too).
  hare: shape(
    [
      { e: [-62, -34, 21, 19], c: 'l', g: T },
      { d: 'M-56 -64 C-62 -112 -40 -152 0 -158 C36 -162 56 -132 54 -92 C52 -52 46 -22 30 -8 L-30 -8 C-50 -12 -54 -36 -56 -64 Z' },
      { e: [-22, -44, 44, 40], top: true },
      { d: 'M-38 -16 C-38 -4 -26 0 -10 0 L48 0 C62 0 62 -20 48 -20 L-20 -24 Z', top: true },
      { d: 'M28 -114 C48 -114 62 -100 60 -76 C59 -60 42 -60 41 -76 C40 -88 34 -94 24 -96 Z', top: true },
      { e: [10, -262, 15, 52, -7], g: H },
      { e: [52, -262, 15, 52, 7], g: H },
      { e: [31, -180, 54, 46], g: H },
    ],
    [
      { e: [40, -66, 22, 60], c: 'l' },
      { e: [31, -162, 30, 22], c: 'l', g: H },
      { d: HARE_EAR_IN, fix: PINK_EAR, g: H },
      { d: flipX(HARE_EAR_IN, 31), fix: PINK_EAR, g: H },
      { d: HARE_TIP, fix: BEAK, g: H },
      { d: flipX(HARE_TIP, 31), fix: BEAK, g: H },
    ],
    [
      { k: 'line', d: 'M-50 -72 C-20 -92 14 -70 8 -30', w: 4 },
      { k: 'blush', x: -6, y: -166, r: 9, g: H },
      { k: 'blush', x: 68, y: -166, r: 9, g: H },
      { k: 'eye', x: 9, y: -188, r: 9.5, g: H },
      { k: 'eye', x: 53, y: -188, r: 9.5, g: H },
      { k: 'nose', x: 31, y: -170, r: 6.5, tri: true, color: PINK_NOSE, g: H },
      { k: 'mouth', x: 31, y: -161, w: 7, cat: true, g: H },
    ],
    ['#A58B6C', '#EFE2CE', '#7C654D'],
    { head: [31, -140], tail: [-50, -40] },
  ),
  // The rock ptarmigan: a plump round ground bird, mottled brown in summer, all white in winter (even its feathery
  // feet), with a little red comb over its eye.
  ptarmigan: shape(
    [
      { d: 'M-44 -94 L-88 -124 C-104 -114 -110 -94 -102 -76 L-50 -60 Z', g: T },
      { e: [-14, -9, 17, 11] },
      { e: [22, -9, 17, 11] },
      { d: 'M-66 -64 C-66 -100 -30 -116 8 -114 C42 -112 68 -92 68 -62 C68 -32 42 -14 4 -14 C-36 -14 -66 -34 -66 -64 Z' },
      { e: [50, -110, 34, 32], g: H },
    ],
    [
      { d: 'M-72 -114 L-92 -128 L-114 -96 L-102 -70 L-84 -72 C-90 -86 -86 -102 -72 -114 Z', c: 'd', g: T },
      { e: [18, -34, 46, 20], c: 'l' },
      { d: 'M-48 -86 C-28 -106 18 -102 38 -74 C22 -48 -24 -40 -54 -60 C-56 -70 -54 -80 -48 -86 Z', c: 'd' },
      { e: [-20, -82, 6.5, 4.5], c: 'l' },
      { e: [6, -70, 6.5, 4.5], c: 'l' },
      { e: [-28, -62, 5.5, 4], c: 'l' },
      { e: [-4, -54, 5.5, 4], c: 'l' },
      { e: [46, -62, 5, 3.5], c: 'd' },
      { e: [36, -44, 5, 3.5], c: 'd' },
      { e: [54, -46, 4.5, 3.2], c: 'd' },
    ],
    [
      { k: 'line', d: 'M-54 -60 C-24 -40 22 -48 38 -74', w: 4 },
      { k: 'path', d: 'M44 -130 C46 -145 55 -143 57 -137 C61 -145 71 -141 69 -128 Z', color: '#FF5C6C', g: H },
      { k: 'path', d: 'M80 -120 C90 -118 98 -114 102 -110 C96 -104 88 -100 80 -100 Z', color: BEAK, g: H },
      { k: 'blush', x: 50, y: -97, r: 7.5, g: H },
      { k: 'eye', x: 58, y: -115, r: 9.5, g: H },
    ],
    ['#A87E5C', '#EAD6B8', '#7C5A40'],
    { head: [38, -96], tail: [-48, -76] },
  ),
  // The collared lemming: a round little potato, brown with a dark stripe down its back in summer, white in winter.
  lemming: shape(
    [
      { e: [-78, -24, 12, 7], g: T },
      { e: [-38, -6, 17, 8] },
      { d: 'M-80 -40 C-80 -72 -44 -86 -4 -86 C32 -86 62 -70 64 -40 C64 -14 40 -2 0 -2 C-46 -2 -80 -12 -80 -40 Z' },
      { e: [36, -6, 17, 8] },
      { e: [20, -90, 13, 12], g: H },
      { e: [72, -90, 13, 12], g: H },
      { e: [46, -50, 48, 44], g: H },
    ],
    [
      { e: [-20, -84, 56, 12], c: 'd' },
      { e: [-8, -8, 64, 16], c: 'l' },
      { e: [46, -30, 32, 22], c: 'l', g: H },
      { e: [20, -90, 6.5, 6], fix: PINK_EAR, g: H },
      { e: [72, -90, 6.5, 6], fix: PINK_EAR, g: H },
    ],
    [
      { k: 'line', d: 'M12 -40 L-8 -46 M12 -34 L-8 -32 M80 -40 L100 -46 M80 -34 L100 -32', w: 2.6, g: H },
      { k: 'blush', x: 18, y: -40, r: 7.5, g: H },
      { k: 'blush', x: 74, y: -40, r: 7.5, g: H },
      { k: 'eye', x: 29, y: -58, r: 8.5, g: H },
      { k: 'eye', x: 63, y: -58, r: 8.5, g: H },
      { k: 'nose', x: 46, y: -43, r: 5.5, tri: true, color: PINK_NOSE, g: H },
      { k: 'mouth', x: 46, y: -35, w: 6, cat: true, g: H },
    ],
    ['#98755A', '#EBD7BC', '#6B4F3C'],
    { head: [40, -20], tail: [-68, -26] },
  ),
  // The polar bear (Mama Bear's look, characters/looks.ts): white all year, never painted. He walks right, his head
  // on its own pivot so he can sniff down and look round.
  bear: shape(
    [
      { e: [-156, -168, 18, 16], g: T },
      { d: leg(-58, 56, 100, 16), c: 'd' },
      { d: leg(114, 54, 104, 16), c: 'd' },
      { d: 'M-160 -150 C-162 -208 -96 -230 -20 -224 C44 -220 112 -218 144 -190 C168 -168 158 -112 124 -86 C84 -62 -60 -60 -114 -76 C-146 -90 -158 -120 -160 -150 Z' },
      { d: leg(-108, 62, 112, 18), top: true },
      { d: leg(68, 60, 114, 18), top: true },
      { e: [192, -220, 15, 14], c: 'd', g: H },
      { e: [150, -216, 18, 17], g: H },
      { d: 'M126 -196 C138 -222 178 -230 206 -216 C228 -206 242 -192 262 -182 C280 -174 284 -150 270 -140 C252 -128 222 -122 196 -122 C160 -122 130 -136 124 -160 C120 -172 122 -186 126 -196 Z', g: H },
    ],
    [
      { e: [-4, -76, 140, 24], c: 'd' },
      { e: [254, -150, 40, 27], c: 'l', g: H },
      { e: [150, -215, 9, 8.5], fix: PINK_EAR, g: H },
    ],
    [
      { k: 'line', d: 'M38 -112 C36 -96 38 -84 44 -76', w: 4 },
      { k: 'line', d: 'M-76 -112 C-74 -96 -76 -84 -82 -76', w: 4 },
      { k: 'blush', x: 208, y: -152, r: 12, g: H },
      { k: 'eye', x: 204, y: -182, r: 10, g: H },
      { k: 'nose', x: 270, y: -164, r: 11.5, g: H },
      { k: 'mouth', x: 246, y: -138, w: 10, g: H },
    ],
    ['#FFFFFF', '#FFF1DE', '#E4E0F4'],
    { head: [130, -160], tail: [-150, -162] },
  ),
  // The snowy owl, front on, on its rock: white all year, a few dark flecks, big yellow eyes.
  owl: shape(
    [
      { e: [-15, -5, 15, 9] },
      { e: [15, -5, 15, 9] },
      { d: 'M0 -160 C42 -160 58 -106 56 -62 C54 -26 30 -6 0 -6 C-30 -6 -54 -26 -56 -62 C-58 -106 -42 -160 0 -160 Z' },
      { e: [0, -150, 54, 46], g: H },
    ],
    [
      { d: 'M-60 -112 C-66 -80 -62 -40 -42 -20 C-34 -50 -36 -92 -46 -120 Z', c: 'd' },
      { d: 'M60 -112 C66 -80 62 -40 42 -20 C34 -50 36 -92 46 -120 Z', c: 'd' },
      { e: [0, -112, 60, 14], c: 'd' },
    ],
    [
      ...[-20, 0, 20].map((x): Detail => ({ k: 'line', d: `M${x - 7} -76 l 7 7 l 7 -7`, w: 3.5, color: '#A9A2BD' })),
      ...[-10, 10].map((x): Detail => ({ k: 'line', d: `M${x - 7} -56 l 7 7 l 7 -7`, w: 3.5, color: '#A9A2BD' })),
      { k: 'line', d: 'M-7 -36 l 7 7 l 7 -7', w: 3.5, color: '#A9A2BD' },
      { k: 'eye', x: -20, y: -156, r: 12.5, iris: '#FFD84D', g: H },
      { k: 'eye', x: 20, y: -156, r: 12.5, iris: '#FFD84D', g: H },
      { k: 'path', d: 'M-7 -144 C-3 -147 3 -147 7 -144 C5 -136 2 -131 0 -128 C-2 -131 -5 -136 -7 -144 Z', color: BEAK, g: H },
      { k: 'blush', x: -34, y: -136, r: 8, g: H },
      { k: 'blush', x: 34, y: -136, r: 8, g: H },
    ],
    ['#FFFFFF', '#FFFFFF', '#E4E0F4'],
    { head: [0, -118] },
  ),
}

/** Snow Coats' sounds per animal: what a tap or a giggle sounds like (a frequency for the kit's tone). */
export const VOICE: Record<CoatId, { f: number; to: number; type: OscillatorType }> = {
  fox: { f: 900, to: 1400, type: 'triangle' },
  hare: { f: 1300, to: 1900, type: 'sine' },
  ptarmigan: { f: 520, to: 380, type: 'square' },
  lemming: { f: 2200, to: 2900, type: 'sine' },
}

function inEllipse(x: number, y: number, [cx, cy, rx, ry, rot = 0]: [number, number, number, number, number?]) {
  const a = (-rot * Math.PI) / 180
  const dx = x - cx
  const dy = y - cy
  const u = dx * Math.cos(a) - dy * Math.sin(a)
  const v = dx * Math.sin(a) + dy * Math.cos(a)
  return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1
}

function inPoly(x: number, y: number, p: number[]) {
  let inside = false
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const xi = p[i]
    const yi = p[i + 1]
    const xj = p[j]
    const yj = p[j + 1]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

const inPart = (s: Shape, i: number, x: number, y: number) => {
  const pt = s.parts[i]
  return 'e' in pt ? inEllipse(x, y, pt.e) : inPoly(x, y, s.polys[i]!)
}
export const inShape = (s: Shape, x: number, y: number) => s.parts.some((_, i) => inPart(s, i, x, y))
/** Which pivot the topmost part at (x, y) hangs on. */
const groupAt = (s: Shape, x: number, y: number): Group => {
  for (let i = s.parts.length - 1; i >= 0; i--) if (inPart(s, i, x, y)) return s.parts[i].g ?? 'body'
  return 'body'
}

/** The coat as a grid of cells (1 = white). */
export interface CoatGrid {
  /** Cell size, local units. */
  cell: number
  x0: number
  y0: number
  cols: number
  rows: number
  /** Index of each cell inside the shape, or -1. */
  index: Int32Array
  /** Centers of the inside cells. */
  xs: Float32Array
  ys: Float32Array
  /** The edge cells' indexes (where the fluff grows), and the pivot each hangs on. */
  edge: number[]
  edgeGroup: Group[]
}

export function coatGrid(s: Shape, cell = 8): CoatGrid {
  const { x, y, w, h } = s.box
  const cols = Math.ceil(w / cell) + 1
  const rows = Math.ceil(h / cell) + 1
  const index = new Int32Array(cols * rows).fill(-1)
  const xs: number[] = []
  const ys: number[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x + (c + 0.5) * cell
      const cy = y + (r + 0.5) * cell
      if (!inShape(s, cx, cy)) continue
      index[r * cols + c] = xs.length
      xs.push(cx)
      ys.push(cy)
    }
  }
  // Edge cells (an outside neighbour), thinned out to one every ~3 cells along the edge.
  const edge: number[] = []
  const at = (c: number, r: number) => (c < 0 || r < 0 || c >= cols || r >= rows ? -1 : index[r * cols + c])
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = at(c, r)
      if (i < 0) continue
      if (at(c - 1, r) >= 0 && at(c + 1, r) >= 0 && at(c, r - 1) >= 0 && at(c, r + 1) >= 0) continue
      // Not on the feet (fluff on the ground line looks like a snowbank).
      if (ys[i] > -10) continue
      if (edge.some((e) => Math.hypot(xs[e] - xs[i], ys[e] - ys[i]) < cell * 3)) continue
      edge.push(i)
    }
  }
  return { cell, x0: x, y0: y, cols, rows, index, xs: Float32Array.from(xs), ys: Float32Array.from(ys), edge, edgeGroup: edge.map((i) => groupAt(s, xs[i], ys[i])) }
}

/** The stage: one for wide screens, one for tall, in stage units. Nothing that matters leaves it. */
export interface StageDef {
  w: number
  h: number
  /** The ground line (the horizon of the snowy tundra). */
  ground: number
  /** The fox in the first section. */
  fox: Spot
  /** Where each animal stands for hide and seek and the summer. */
  spots: Record<CoatId, Spot>
  owl: Spot
  /** The bear walks along here. */
  bear: { y: number; s: number }
  sun: [number, number]
}
export interface Spot {
  x: number
  y: number
  s: number
}

export const WIDE: StageDef = {
  w: 1600,
  h: 1000,
  ground: 600,
  fox: { x: 820, y: 810, s: 2 },
  spots: {
    fox: { x: 400, y: 740, s: 1.1 },
    hare: { x: 1180, y: 730, s: 1.05 },
    ptarmigan: { x: 780, y: 850, s: 1.1 },
    lemming: { x: 1360, y: 860, s: 1.1 },
  },
  owl: { x: 1470, y: 650, s: 0.95 },
  bear: { y: 650, s: 0.95 },
  sun: [1320, 210],
}

export const TALL: StageDef = {
  w: 1000,
  h: 1500,
  ground: 900,
  fox: { x: 520, y: 1150, s: 1.85 },
  spots: {
    fox: { x: 300, y: 1080, s: 0.95 },
    hare: { x: 760, y: 1070, s: 0.95 },
    ptarmigan: { x: 280, y: 1250, s: 1.05 },
    lemming: { x: 720, y: 1265, s: 1.05 },
  },
  owl: { x: 870, y: 960, s: 0.8 },
  bear: { y: 960, s: 0.8 },
  sun: [760, 380],
}
